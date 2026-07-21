import test from 'node:test';
import assert from 'node:assert/strict';

const SCENE_URL = new URL('./autolab-mog-a3-scene-v1.js', import.meta.url);
const GLOBAL_KEYS = [
  'window',
  'document',
  'performance',
  'IntersectionObserver',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'matchMedia',
  'addEventListener',
  'innerWidth',
  'innerHeight',
  'devicePixelRatio',
  'scrollY',
];
let sceneImport = 0;

function fakeElement() {
  return {
    classList: {
      add() {},
      remove() {},
      toggle() {},
    },
    dataset: {},
    style: {
      setProperty() {},
    },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    setAttribute() {},
  };
}

function installSceneEnvironment({
  reducedMotion = false,
  firstFrameId = 1,
} = {}) {
  const originals = new Map(
    GLOBAL_KEYS.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
  );
  const viewportWidth = 1200;
  const viewportHeight = 800;
  const runHeight = 4400;
  let runTop = 1800;
  let now = 1000;
  let nextFrameId = firstFrameId;
  let intersectionCallback;
  let intersectionOptions;
  let observerCount = 0;
  let drawCount = 0;
  const frames = new Map();
  const cancelledFrames = [];
  const listeners = new Map();

  const context = {
    arc() {},
    beginPath() {},
    clearRect() {
      drawCount += 1;
    },
    closePath() {},
    createRadialGradient() {
      return { addColorStop() {} };
    },
    ellipse() {},
    fill() {},
    fillText() {},
    lineTo() {},
    moveTo() {},
    quadraticCurveTo() {},
    restore() {},
    rotate() {},
    save() {},
    setLineDash() {},
    setTransform() {},
    stroke() {},
    translate() {},
  };
  const elements = Object.fromEntries([
    'sticky',
    'topbar',
    'brandCaret',
    'flight',
    'flightHead',
    'flightLabel',
    'darkField',
    'darkGrid',
    'lightReturn',
    'returnGrid',
    'eventHorizon',
    'impactLabel',
    'reticle',
    'pointer',
    'progress',
    'index',
    'scrollMeter',
    'metricA',
    'metricB',
    'metricBest',
    'metricALabel',
    'metricBLabel',
    'navStatus',
    'navStatusCopy',
    'resultCard',
    'slingshotTear',
    'rebirthSeed',
    'loopPath',
    'loopPathLine',
    'loopScan',
    'metricsPanel',
  ].map(name => [name, fakeElement()]));
  const storySteps = Array.from({ length: 6 }, fakeElement);
  const canvas = {
    ...fakeElement(),
    width: 300,
    height: 150,
    getContext() {
      return context;
    },
  };
  const run = {
    ...fakeElement(),
    offsetHeight: runHeight,
    getBoundingClientRect() {
      return {
        top: runTop,
        bottom: runTop + runHeight,
        width: viewportWidth,
        height: runHeight,
      };
    },
    querySelector(selector) {
      return new Map([
        ['.research-sticky', elements.sticky],
        ['.dark-field', elements.darkField],
        ['.dark-grid', elements.darkGrid],
        ['.light-return', elements.lightReturn],
        ['.return-grid', elements.returnGrid],
        ['.impact-label', elements.impactLabel],
        ['.compression-reticle', elements.reticle],
        ['.gravity-pointer', elements.pointer],
        ['.research-progress i', elements.progress],
        ['.rebirth-seed', elements.rebirthSeed],
        ['.loop-path', elements.loopPath],
        ['.loop-scan', elements.loopScan],
        ['.research-metrics', elements.metricsPanel],
      ]).get(selector) ?? null;
    },
    querySelectorAll(selector) {
      return selector === '.research-step' ? storySteps : [];
    },
  };
  elements.brandCaret.getBoundingClientRect = () => ({
    left: 24,
    top: 18,
    width: 11,
    height: 22,
  });
  elements.flight.querySelector = selector =>
    selector === '.flight-head' ? elements.flightHead : null;
  elements.topbar.querySelector = selector =>
    selector === '.nav-status' ? elements.navStatus : null;
  elements.navStatus.querySelector = selector =>
    selector === '.nav-status-copy' ? elements.navStatusCopy : null;
  elements.loopPath.querySelector = selector =>
    selector === 'path' ? elements.loopPathLine : null;

  const documentSelectors = new Map([
    ['#research-run', run],
    ['#research-canvas', canvas],
    ['#topbar', elements.topbar],
    ['#brand-caret', elements.brandCaret],
    ['#flight-object', elements.flight],
    ['.flight-label', elements.flightLabel],
    ['#event-horizon', elements.eventHorizon],
    ['#research-index', elements.index],
    ['.scroll-meter', elements.scrollMeter],
    ['#metric-a', elements.metricA],
    ['#metric-b', elements.metricB],
    ['#metric-best', elements.metricBest],
    ['#metric-a-label', elements.metricALabel],
    ['#metric-b-label', elements.metricBLabel],
    ['#result-card', elements.resultCard],
    ['#slingshot-tear', elements.slingshotTear],
  ]);
  const sceneWindow = {};

  class FakeIntersectionObserver {
    constructor(callback, options) {
      observerCount += 1;
      intersectionCallback = callback;
      intersectionOptions = options;
    }

    observe(target) {
      assert.equal(target, run);
    }
  }

  const globals = {
    window: sceneWindow,
    document: {
      body: { dataset: { ending: 'rebirth' } },
      documentElement: { scrollHeight: 6400 },
      querySelector(selector) {
        return documentSelectors.get(selector) ?? null;
      },
    },
    performance: { now: () => now },
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
    devicePixelRatio: 1,
    scrollY: 0,
  };

  for (const [key, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value,
    });
  }

  return {
    cancelledFrames,
    frames,
    get drawCount() {
      return drawCount;
    },
    get intersectionOptions() {
      return intersectionOptions;
    },
    get observerCount() {
      return observerCount;
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
    runFrame(timestamp) {
      assert.equal(frames.size, 1);
      const [frameId, callback] = frames.entries().next().value;
      frames.delete(frameId);
      now = timestamp;
      callback(timestamp);
      return frameId;
    },
    setRunTop(value) {
      runTop = value;
    },
    state() {
      return sceneWindow.__AUTOLAB_A3__.getState();
    },
    restore() {
      for (const [key, descriptor] of originals) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
      }
    },
  };
}

test('research canvas frames run only while the scene is visible', async () => {
  const animated = installSceneEnvironment();
  try {
    await animated.load();
    assert.equal(animated.frames.size, 0);
    assert.equal(animated.observerCount, 1);
    assert.deepEqual(animated.intersectionOptions, { rootMargin: '0px' });
    assert.equal(animated.state().visible, false);
    assert.equal(animated.state().lastFrame, 0);

    animated.setRunTop(-1800);
    animated.dispatch('scroll');
    animated.dispatch('resize');
    assert.equal(animated.frames.size, 0);
    const entryProgress = animated.state().progress;

    animated.intersect(true);
    assert.equal(animated.state().visible, true);
    assert.equal(animated.frames.size, 1);
    animated.dispatch('scroll');
    animated.dispatch('resize');
    assert.equal(animated.frames.size, 1);
    animated.intersect(true);
    assert.equal(animated.frames.size, 1);

    animated.runFrame(1600);
    assert.equal(animated.state().lastFrame, 1600);
    assert.equal(animated.state().progress, entryProgress);
    assert.equal(animated.frames.size, 1);

    const pendingFrame = animated.frames.keys().next().value;
    animated.intersect(false);
    assert.equal(animated.state().visible, false);
    assert.equal(animated.frames.size, 0);
    assert.deepEqual(animated.cancelledFrames, [pendingFrame]);
    assert.equal(animated.state().lastFrame, 1600);

    animated.setRunTop(-2520);
    animated.dispatch('scroll');
    animated.dispatch('resize');
    assert.equal(animated.frames.size, 0);
    const hiddenProgress = animated.state().progress;
    assert.notEqual(hiddenProgress, entryProgress);

    animated.intersect(true);
    assert.equal(animated.frames.size, 1);
    assert.equal(animated.state().progress, hiddenProgress);
    animated.intersect(true);
    assert.equal(animated.frames.size, 1);
    animated.runFrame(2400);
    assert.equal(animated.state().progress, hiddenProgress);
    assert.equal(animated.state().lastFrame, 2400);
    assert.equal(animated.frames.size, 1);
    animated.intersect(false);
  } finally {
    animated.restore();
  }
});

test('RAF handle zero stays deduplicated across visible updates', async () => {
  const zeroFrame = installSceneEnvironment({ firstFrameId: 0 });
  try {
    await zeroFrame.load();
    zeroFrame.intersect(true);
    assert.deepEqual([...zeroFrame.frames.keys()], [0]);

    zeroFrame.intersect(true);
    assert.deepEqual([...zeroFrame.frames.keys()], [0]);
    zeroFrame.dispatch('scroll');
    assert.deepEqual([...zeroFrame.frames.keys()], [0]);
    zeroFrame.dispatch('resize');
    assert.deepEqual([...zeroFrame.frames.keys()], [0]);
  } finally {
    zeroFrame.restore();
  }
});

test('RAF handle zero is cancelled on exit', async () => {
  const zeroFrame = installSceneEnvironment({ firstFrameId: 0 });
  try {
    await zeroFrame.load();
    zeroFrame.intersect(true);
    assert.deepEqual([...zeroFrame.frames.keys()], [0]);

    zeroFrame.intersect(false);
    assert.deepEqual(zeroFrame.cancelledFrames, [0]);
    assert.equal(zeroFrame.frames.size, 0);
  } finally {
    zeroFrame.restore();
  }
});

test('reduced motion draws one stable frame on entry without recurring', async () => {
  const reduced = installSceneEnvironment({ reducedMotion: true });
  try {
    await reduced.load();
    assert.equal(reduced.frames.size, 0);
    assert.equal(reduced.drawCount, 0);

    reduced.intersect(true);
    assert.equal(reduced.drawCount, 1);
    assert.equal(reduced.frames.size, 0);
    assert.equal(reduced.state().visible, true);
    assert.equal(reduced.state().reducedMotion, true);
    assert.equal(reduced.state().lastFrame, 1000);

    reduced.intersect(true);
    assert.equal(reduced.drawCount, 1);
    assert.equal(reduced.frames.size, 0);
    reduced.intersect(false);
    assert.equal(reduced.state().visible, false);
  } finally {
    reduced.restore();
  }
});
