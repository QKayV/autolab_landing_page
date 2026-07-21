import test from 'node:test';
import assert from 'node:assert/strict';

const SCENE_URL = new URL('./autolab-mog-product-scene-v1.js', import.meta.url);
const GLOBAL_KEYS = [
  'window',
  'document',
  'performance',
  'ResizeObserver',
  'IntersectionObserver',
  'requestAnimationFrame',
  'cancelAnimationFrame',
];
let sceneImport = 0;

function installSceneEnvironment({
  reducedMotion = false,
  width = 640,
  height = 400,
  ratio = 1,
} = {}) {
  const originals = new Map(
    GLOBAL_KEYS.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
  );
  let now = 1000;
  let cssWidth = width;
  let cssHeight = height;
  let devicePixelRatio = ratio;
  let backingWidth = 300;
  let backingHeight = 150;
  let resizeCallback;
  let intersectionCallback;
  let intersectionOptions;
  let nextFrameId = 1;
  const frames = new Map();
  const cancelledFrames = [];
  const widthWrites = [];
  const heightWrites = [];
  const transforms = [];
  const labels = [];
  let drawCount = 0;

  const context = {
    setTransform(...values) {
      transforms.push(values);
    },
    clearRect() {
      drawCount += 1;
    },
    fillRect() {},
    fillText(text) {
      labels.push(text);
    },
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    save() {},
    setLineDash() {},
    restore() {},
    arc() {},
    fill() {},
    strokeRect() {},
    translate() {},
    rotate() {},
    closePath() {},
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
  const feature = {};
  const sceneWindow = {
    get devicePixelRatio() {
      return devicePixelRatio;
    },
    matchMedia() {
      return { matches: reducedMotion };
    },
  };

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
      assert.equal(target, feature);
    }
  }

  const globals = {
    window: sceneWindow,
    document: {
      querySelector(selector) {
        if (selector === '.watchdog-feature') return feature;
        if (selector === '#watchdog-canvas') return canvas;
        return null;
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
    frames,
    heightWrites,
    labels,
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
      devicePixelRatio = next.ratio;
    },
    setNow(value) {
      now = value;
    },
    state() {
      return sceneWindow.__AUTOLAB_WATCHDOG__.getState();
    },
    restore() {
      for (const [key, descriptor] of originals) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
      }
    },
  };
}

test('watchdog runs only in view and resumes one continuous cycle', async () => {
  const animated = installSceneEnvironment();
  let observerOptions;
  try {
    await animated.load();
    observerOptions = animated.intersectionOptions;
    assert.equal(animated.frames.size, 0);

    const widthWrites = animated.widthWrites.length;
    const heightWrites = animated.heightWrites.length;
    animated.intersect(true);
    assert.equal(animated.frames.size, 1);
    animated.intersect(true);
    assert.equal(animated.frames.size, 1);

    animated.runFrame(4600);
    assert.equal(animated.state().progress, 0.5);
    assert.equal(animated.frames.size, 1);
    assert.equal(animated.widthWrites.length, widthWrites);
    assert.equal(animated.heightWrites.length, heightWrites);

    animated.intersect(true);
    assert.equal(animated.frames.size, 1);
    const pendingFrame = animated.frames.keys().next().value;
    animated.intersect(false);
    assert.equal(animated.frames.size, 0);
    assert.deepEqual(animated.cancelledFrames, [pendingFrame]);

    const pausedProgress = animated.state().progress;
    animated.setNow(9000);
    animated.intersect(true);
    animated.intersect(true);
    assert.equal(animated.frames.size, 1);
    animated.runFrame(9000);
    assert.equal(animated.state().progress, pausedProgress);
    assert.equal(animated.frames.size, 1);
    assert.equal(animated.widthWrites.length, widthWrites);
    assert.equal(animated.heightWrites.length, heightWrites);
    animated.intersect(false);
  } finally {
    animated.restore();
  }

  const reduced = installSceneEnvironment({ reducedMotion: true });
  try {
    await reduced.load();
    assert.equal(reduced.frames.size, 0);
    reduced.intersect(true);
    assert.equal(reduced.frames.size, 0);
    assert.equal(reduced.state().progress, 1);
    assert.equal(reduced.state().phase, 'running-next');
    assert.ok(reduced.labels.includes('EXP-015 / RUNNING'));
    assert.ok(reduced.drawCount > 0);
  } finally {
    reduced.restore();
  }

  assert.deepEqual(observerOptions, { rootMargin: '0px', threshold: 0.05 });
});

test('watchdog resize clamps zero dimensions and reapplies its transform', async () => {
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
