import test from 'node:test';
import assert from 'node:assert/strict';

const SCENE_URL = new URL('./autolab-mog-gpu-scene-v1.js', import.meta.url);
const GLOBAL_KEYS = [
  'window',
  'document',
  'performance',
  'ResizeObserver',
  'IntersectionObserver',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'matchMedia',
  'addEventListener',
  'innerWidth',
  'innerHeight',
  'devicePixelRatio',
];
let sceneImport = 0;

function installSceneEnvironment({
  reducedMotion = false,
  width = 640,
  height = 400,
  ratio = 1,
  firstFrameId = 1,
} = {}) {
  const originals = new Map(
    GLOBAL_KEYS.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
  );
  const viewportWidth = 1200;
  const viewportHeight = 800;
  const sectionHeight = 2400;
  let sectionTop = -800;
  let now = 1000;
  let cssWidth = width;
  let cssHeight = height;
  let pixelRatio = ratio;
  let backingWidth = 300;
  let backingHeight = 150;
  let nextFrameId = firstFrameId;
  let resizeCallback;
  let intersectionCallback;
  let intersectionOptions;
  let drawCount = 0;
  const frames = new Map();
  const cancelledFrames = [];
  const widthWrites = [];
  const heightWrites = [];
  const transforms = [];
  const listeners = new Map();

  const context = {
    arc() {},
    beginPath() {},
    clearRect() {
      drawCount += 1;
    },
    closePath() {},
    createLinearGradient() {
      return { addColorStop() {} };
    },
    fill() {},
    fillRect() {},
    fillText() {},
    lineTo() {},
    moveTo() {},
    quadraticCurveTo() {},
    restore() {},
    rotate() {},
    save() {},
    setLineDash() {},
    setTransform(...values) {
      transforms.push(values);
    },
    stroke() {},
    translate() {},
  };
  const canvas = {
    get offsetWidth() {
      return cssWidth;
    },
    get offsetHeight() {
      return cssHeight;
    },
    get width() {
      return backingWidth;
    },
    set width(value) {
      backingWidth = value;
      widthWrites.push(value);
    },
    get height() {
      return backingHeight;
    },
    set height(value) {
      backingHeight = value;
      heightWrites.push(value);
    },
    getContext() {
      return context;
    },
  };
  const stage = {
    style: {
      setProperty() {},
    },
  };
  const phaseLabel = { textContent: '' };
  const counter = { textContent: '' };
  const section = {
    offsetHeight: sectionHeight,
    getBoundingClientRect() {
      return {
        top: sectionTop,
        bottom: sectionTop + sectionHeight,
        width: viewportWidth,
        height: sectionHeight,
      };
    },
    querySelector(selector) {
      return new Map([
        ['.gpu-stage', stage],
        ['#gpu-canvas', canvas],
        ['[data-gpu-phase]', phaseLabel],
        ['[data-gpu-counter]', counter],
      ]).get(selector) ?? null;
    },
  };
  const sceneWindow = {};

  class FakeResizeObserver {
    constructor(callback) {
      resizeCallback = callback;
    }

    observe(target) {
      assert.equal(target, canvas);
    }
  }

  class FakeIntersectionObserver {
    constructor(callback, options) {
      intersectionCallback = callback;
      intersectionOptions = options;
    }

    observe(target) {
      assert.equal(target, section);
    }
  }

  const globals = {
    window: sceneWindow,
    document: {
      querySelector(selector) {
        return selector === '[data-gpu-section]' ? section : null;
      },
    },
    performance: { now: () => now },
    ResizeObserver: FakeResizeObserver,
    IntersectionObserver: FakeIntersectionObserver,
    requestAnimationFrame(callback) {
      const frameId = nextFrameId;
      nextFrameId += 1;
      frames.set(frameId, callback);
      return frameId;
    },
    cancelAnimationFrame(frameId) {
      cancelledFrames.push(frameId);
      frames.delete(frameId);
    },
    matchMedia(query) {
      assert.equal(query, '(prefers-reduced-motion: reduce)');
      return { matches: reducedMotion };
    },
    addEventListener(type, callback) {
      const callbacks = listeners.get(type) ?? [];
      callbacks.push(callback);
      listeners.set(type, callbacks);
    },
    innerWidth: viewportWidth,
    innerHeight: viewportHeight,
    devicePixelRatio: pixelRatio,
  };

  for (const [key, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value,
    });
  }

  return {
    canvas,
    cancelledFrames,
    counter,
    frames,
    heightWrites,
    phaseLabel,
    transforms,
    widthWrites,
    get drawCount() {
      return drawCount;
    },
    get intersectionOptions() {
      return intersectionOptions;
    },
    async load() {
      const url = new URL(SCENE_URL);
      url.searchParams.set('test', String(sceneImport));
      sceneImport += 1;
      await import(url.href);
    },
    dispatch(type) {
      for (const callback of listeners.get(type) ?? []) callback({ type });
    },
    intersect(isIntersecting) {
      intersectionCallback([{ isIntersecting }]);
    },
    resize() {
      resizeCallback();
    },
    runFrame(timestamp) {
      assert.equal(frames.size, 1);
      const [frameId, callback] = frames.entries().next().value;
      frames.delete(frameId);
      now = timestamp;
      callback(timestamp);
      return frameId;
    },
    setDimensions(next) {
      cssWidth = next.width;
      cssHeight = next.height;
      pixelRatio = next.ratio;
      globalThis.devicePixelRatio = pixelRatio;
    },
    setSectionTop(value) {
      sectionTop = value;
    },
    state() {
      return sceneWindow.__AUTOLAB_GPU__.getState();
    },
    restore() {
      for (const [key, descriptor] of originals) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
      }
    },
  };
}

test('GPU frames are deduplicated, cancellable, and limited to actual visibility', async () => {
  const scene = installSceneEnvironment({ firstFrameId: 0 });
  try {
    await scene.load();
    assert.equal(scene.frames.size, 0);
    assert.deepEqual(scene.intersectionOptions, { rootMargin: '0px' });
    assert.equal(scene.state().visible, false);

    const widthWrites = scene.widthWrites.length;
    const heightWrites = scene.heightWrites.length;
    scene.intersect(true);
    assert.equal(scene.state().visible, true);
    assert.deepEqual([...scene.frames.keys()], [0]);

    scene.intersect(true);
    scene.dispatch('scroll');
    scene.dispatch('resize');
    assert.deepEqual([...scene.frames.keys()], [0]);

    scene.intersect(false);
    assert.equal(scene.state().visible, false);
    assert.deepEqual(scene.cancelledFrames, [0]);
    assert.equal(scene.frames.size, 0);

    scene.setSectionTop(-960);
    scene.dispatch('scroll');
    scene.dispatch('resize');
    assert.equal(scene.frames.size, 0);
    assert.equal(scene.state().targetProgress, 0.6);

    scene.intersect(true);
    scene.runFrame(1600);
    assert.ok(scene.state().progress > 0);
    assert.equal(scene.frames.size, 1);
    assert.equal(scene.widthWrites.length, widthWrites);
    assert.equal(scene.heightWrites.length, heightWrites);

    scene.intersect(false);
    const pausedProgress = scene.state().progress;
    scene.setSectionTop(-1200);
    scene.dispatch('scroll');
    assert.equal(scene.frames.size, 0);
    assert.equal(scene.state().progress, pausedProgress);
    assert.equal(scene.state().targetProgress, 0.75);

    scene.intersect(true);
    assert.equal(scene.state().progress, pausedProgress);
    assert.equal(scene.frames.size, 1);
    scene.runFrame(2400);
    assert.ok(scene.state().progress > pausedProgress);
    assert.equal(scene.frames.size, 1);
    scene.intersect(false);
  } finally {
    scene.restore();
  }
});

test('GPU reduced motion draws one verified frame on entry without looping', async () => {
  const scene = installSceneEnvironment({ reducedMotion: true });
  try {
    await scene.load();
    assert.equal(scene.frames.size, 0);
    assert.equal(scene.drawCount, 0);

    scene.intersect(true);
    assert.equal(scene.frames.size, 0);
    assert.equal(scene.state().progress, 1);
    assert.equal(scene.state().phase, 'verified');
    assert.equal(scene.state().visible, true);
    assert.equal(scene.phaseLabel.textContent, 'best result verified');
    assert.equal(scene.counter.textContent, '048 / 048 experiments resolved');
    assert.ok(scene.drawCount > 0);

    const drawCount = scene.drawCount;
    scene.intersect(true);
    assert.equal(scene.drawCount, drawCount);
    assert.equal(scene.frames.size, 0);
  } finally {
    scene.restore();
  }
});

test('GPU resize clamps dimensions and always reapplies its transform', async () => {
  const zeroSize = installSceneEnvironment({ width: 0, height: 0 });
  try {
    await zeroSize.load();
    assert.equal(zeroSize.canvas.width, 1);
    assert.equal(zeroSize.canvas.height, 1);
    assert.deepEqual(zeroSize.transforms, [[1, 0, 0, 1, 0, 0]]);
  } finally {
    zeroSize.restore();
  }

  const stableBacking = installSceneEnvironment({
    width: 320,
    height: 200,
    ratio: 2,
  });
  try {
    await stableBacking.load();
    assert.equal(stableBacking.canvas.width, 640);
    assert.equal(stableBacking.canvas.height, 400);
    assert.equal(stableBacking.widthWrites.length, 1);
    assert.equal(stableBacking.heightWrites.length, 1);
    assert.deepEqual(stableBacking.transforms, [[2, 0, 0, 2, 0, 0]]);

    stableBacking.setDimensions({ width: 640, height: 400, ratio: 1 });
    stableBacking.resize();
    assert.equal(stableBacking.canvas.width, 640);
    assert.equal(stableBacking.canvas.height, 400);
    assert.equal(stableBacking.widthWrites.length, 1);
    assert.equal(stableBacking.heightWrites.length, 1);
    assert.deepEqual(stableBacking.transforms, [
      [2, 0, 0, 2, 0, 0],
      [1, 0, 0, 1, 0, 0],
    ]);
  } finally {
    stableBacking.restore();
  }
});
