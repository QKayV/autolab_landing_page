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
const MONO_GLYPH_WIDTH_EM = 0.6;

function estimatedMonoBounds(draw) {
  const fontSize = Number(draw.font.match(/([\d.]+)px/)?.[1] ?? 9);
  const width = draw.text.length * fontSize * MONO_GLYPH_WIDTH_EM;
  const left = draw.textAlign === 'center'
    ? draw.x - width / 2
    : draw.textAlign === 'right'
      ? draw.x - width
      : draw.x;
  return {
    left,
    right: left + width,
    top: draw.y - fontSize,
    bottom: draw.y + fontSize * 0.2,
  };
}

function boundsOverlap(first, second) {
  return first.left < second.right
    && first.right > second.left
    && first.top < second.bottom
    && first.bottom > second.top;
}

function segmentIntersectsBounds(segment, bounds) {
  let entry = 0;
  let exit = 1;
  for (const [axis, minimum, maximum] of [
    ['x', bounds.left, bounds.right],
    ['y', bounds.top, bounds.bottom],
  ]) {
    const origin = segment.from[axis];
    const direction = segment.to[axis] - origin;
    if (direction === 0) {
      if (origin < minimum || origin > maximum) return false;
      continue;
    }
    const intersections = [
      (minimum - origin) / direction,
      (maximum - origin) / direction,
    ].sort((a, b) => a - b);
    entry = Math.max(entry, intersections[0]);
    exit = Math.min(exit, intersections[1]);
    if (entry > exit) return false;
  }
  return true;
}

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
  let now = 1000;
  let cssWidth = width;
  let cssHeight = height;
  let devicePixelRatio = ratio;
  let backingWidth = 300;
  let backingHeight = 150;
  let resizeCallback;
  let intersectionCallback;
  let intersectionOptions;
  let nextFrameId = firstFrameId;
  const frames = new Map();
  const cancelledFrames = [];
  const widthWrites = [];
  const heightWrites = [];
  const transforms = [];
  const labels = [];
  const textDraws = [];
  const strokes = [];
  const strokeRects = [];
  const stateStack = [];
  let currentPoint = null;
  let currentSegments = [];
  let drawCount = 0;

  const context = {
    fillStyle: '',
    font: '',
    globalAlpha: 1,
    lineWidth: 1,
    shadowBlur: 0,
    shadowColor: '',
    strokeStyle: '',
    textAlign: 'left',
    setTransform(...values) {
      transforms.push(values);
    },
    clearRect() {
      drawCount += 1;
    },
    fillRect() {},
    fillText(text, x, y) {
      labels.push(text);
      textDraws.push({
        text,
        x,
        y,
        fillStyle: this.fillStyle,
        font: this.font,
        globalAlpha: this.globalAlpha,
        textAlign: this.textAlign,
      });
    },
    beginPath() {
      currentPoint = null;
      currentSegments = [];
    },
    moveTo(x, y) {
      currentPoint = { x, y };
    },
    lineTo(x, y) {
      const nextPoint = { x, y };
      if (currentPoint) currentSegments.push({ from: currentPoint, to: nextPoint });
      currentPoint = nextPoint;
    },
    stroke() {
      strokes.push({
        segments: currentSegments.map(segment => ({
          from: { ...segment.from },
          to: { ...segment.to },
        })),
        strokeStyle: this.strokeStyle,
        lineWidth: this.lineWidth,
        shadowBlur: this.shadowBlur,
        globalAlpha: this.globalAlpha,
      });
    },
    save() {
      stateStack.push({
        fillStyle: this.fillStyle,
        font: this.font,
        globalAlpha: this.globalAlpha,
        lineWidth: this.lineWidth,
        shadowBlur: this.shadowBlur,
        shadowColor: this.shadowColor,
        strokeStyle: this.strokeStyle,
        textAlign: this.textAlign,
      });
    },
    setLineDash() {},
    restore() {
      Object.assign(this, stateStack.pop());
    },
    arc() {},
    fill() {},
    strokeRect(x, y, width, height) {
      strokeRects.push({
        x,
        y,
        width,
        height,
        strokeStyle: this.strokeStyle,
        lineWidth: this.lineWidth,
        shadowBlur: this.shadowBlur,
      });
    },
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
    strokeRects,
    strokes,
    textDraws,
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
  try {
    await animated.load();
    assert.equal(animated.frames.size, 0);
    assert.equal(animated.drawCount, 0);
    assert.deepEqual(animated.intersectionOptions, { rootMargin: '0px', threshold: 0.05 });

    animated.resize();
    assert.equal(animated.drawCount, 0);

    const widthWrites = animated.widthWrites.length;
    const heightWrites = animated.heightWrites.length;
    animated.intersect(true);
    assert.equal(animated.frames.size, 1);
    assert.equal(animated.drawCount, 0);
    animated.intersect(true);
    assert.equal(animated.frames.size, 1);

    animated.runFrame(4600);
    assert.equal(animated.drawCount, 1);
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
});

test('watchdog reduced motion resolves one legible GPU reassignment after entry', async () => {
  const reduced = installSceneEnvironment({ reducedMotion: true });
  let resolvedGeometry;
  try {
    await reduced.load();
    assert.equal(reduced.frames.size, 0);
    assert.equal(reduced.drawCount, 0);

    reduced.resize();
    assert.equal(reduced.drawCount, 0);
    reduced.intersect(true);
    assert.equal(reduced.frames.size, 0);
    assert.equal(reduced.drawCount, 1);
    assert.equal(reduced.state().progress, 1);
    assert.equal(reduced.state().phase, 'running-next');
    assert.ok(reduced.labels.includes('EXP-015 / RUNNING'));
    assert.ok(reduced.labels.includes('QUEUED EXPERIMENTS'));
    assert.ok(reduced.labels.includes('NEXT EXPERIMENT'));
    assert.ok(reduced.labels.includes('GPU 04'));
    assert.ok(reduced.labels.includes('ACTIVE'));

    const gpu = reduced.strokeRects.at(-1);
    assert.ok(gpu);
    const gpuEdge = { x: gpu.x, y: gpu.y + gpu.height / 2 };
    const sourceDraws = reduced.textDraws.filter(draw => draw.text === '▸');
    const faintPaths = reduced.strokes.filter(
      stroke => stroke.strokeStyle === 'rgba(126,139,133,.28)',
    );
    const selectedPaths = reduced.strokes.filter(
      stroke => stroke.strokeStyle === '#2fce96' && stroke.lineWidth === 1.6,
    );
    const faintEndpoints = faintPaths.map(path => path.segments.at(-1)?.to);
    const selectedEndpoint = selectedPaths[0]?.segments.at(-1)?.to;
    resolvedGeometry = {
      sourceCount: sourceDraws.length,
      faintPathCount: faintPaths.length,
      faintPathsConverge: faintEndpoints.every(
        endpoint => endpoint?.x === faintEndpoints[0]?.x && endpoint?.y === faintEndpoints[0]?.y,
      ),
      faintPathsReachGpuEdge: faintEndpoints.every(
        endpoint => endpoint?.x === gpuEdge.x && endpoint?.y === gpuEdge.y,
      ),
      selectedPathCount: selectedPaths.length,
      selectedPathReachesGpuEdge: selectedEndpoint?.x === gpuEdge.x
        && selectedEndpoint?.y === gpuEdge.y,
      gpuGlowActive: gpu.shadowBlur > 0,
      gpuBorderWidth: gpu.lineWidth,
    };
  } finally {
    reduced.restore();
  }

  const compact = installSceneEnvironment({
    reducedMotion: true,
    width: 354,
    height: 430,
  });
  let compactGeometry;
  try {
    await compact.load();
    compact.intersect(true);
    const status = compact.textDraws.find(draw => draw.text === 'EXP-015 / RUNNING');
    const queue = compact.textDraws.find(draw => draw.text === 'QUEUED EXPERIMENTS');
    assert.ok(status);
    assert.ok(queue);
    const queueBounds = estimatedMonoBounds(queue);
    const queuePaths = compact.strokes.filter(
      stroke => stroke.strokeStyle === 'rgba(126,139,133,.28)'
        || (stroke.strokeStyle === '#2fce96' && stroke.lineWidth === 1.6),
    );
    compactGeometry = {
      compactLabelsOverlap: boundsOverlap(
        estimatedMonoBounds(status),
        queueBounds,
      ),
      compactPathCrossesHeading: queuePaths.some(path => path.segments.some(
        segment => segmentIntersectsBounds(segment, queueBounds),
      )),
    };
  } finally {
    compact.restore();
  }

  assert.deepEqual({
    ...resolvedGeometry,
    ...compactGeometry,
  }, {
    sourceCount: 3,
    faintPathCount: 3,
    faintPathsConverge: true,
    faintPathsReachGpuEdge: true,
    selectedPathCount: 1,
    selectedPathReachesGpuEdge: true,
    gpuGlowActive: true,
    gpuBorderWidth: 1,
    compactLabelsOverlap: false,
    compactPathCrossesHeading: false,
  });
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

test('watchdog resize writes only the backing dimension that changed', async () => {
  const scene = installSceneEnvironment({ width: 320, height: 200, ratio: 2 });
  try {
    await scene.load();
    scene.setDimensions({ width: 321, height: 200, ratio: 2 });
    scene.resize();

    assert.deepEqual(scene.widthWrites, [640, 642]);
    assert.deepEqual(scene.heightWrites, [400]);
    assert.deepEqual(scene.transforms, [
      [2, 0, 0, 2, 0, 0],
      [2, 0, 0, 2, 0, 0],
    ]);
  } finally {
    scene.restore();
  }
});

test('watchdog RAF handle zero stays deduplicated across entry', async () => {
  const zeroFrame = installSceneEnvironment({ firstFrameId: 0 });
  try {
    await zeroFrame.load();
    zeroFrame.intersect(true);
    assert.deepEqual([...zeroFrame.frames.keys()], [0]);

    zeroFrame.intersect(true);
    assert.deepEqual([...zeroFrame.frames.keys()], [0]);
  } finally {
    zeroFrame.restore();
  }
});

test('watchdog RAF handle zero is cancelled on exit', async () => {
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
