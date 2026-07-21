import test from 'node:test';
import assert from 'node:assert/strict';

async function loadMotion() {
  try {
    return await import('./autolab-mog-gpu-motion-v1.js');
  } catch {
    return {};
  }
}

test('GPU jobs are deterministic and preserve one verified winner', async () => {
  const motion = await loadMotion();
  assert.equal(typeof motion.createGpuJobs, 'function');

  const first = motion.createGpuJobs(48, 0xA710AB);
  const second = motion.createGpuJobs(48, 0xA710AB);
  assert.deepEqual(first, second);
  assert.equal(first.length, 48);
  assert.equal(first.filter(job => job.winner).length, 1);
  assert.equal(new Set(first.map(job => job.id)).size, 48);
});

test('GPU scene progresses from intake through packing to a scaled winner', async () => {
  const motion = await loadMotion();
  assert.equal(typeof motion.gpuStateFor, 'function');

  assert.deepEqual(motion.gpuStateFor(0), {
    intake: 0,
    packed: 0,
    pruned: 0,
    scaled: 0,
    phase: 'intake',
  });
  assert.equal(motion.gpuStateFor(0.4).phase, 'packing');
  assert.equal(motion.gpuStateFor(0.62).phase, 'pruning');
  assert.equal(motion.gpuStateFor(1).phase, 'verified');
  assert.equal(motion.gpuStateFor(1).scaled, 1);
});

test('GPU slots map into a stable row-major fabric', async () => {
  const motion = await loadMotion();
  assert.equal(typeof motion.gpuSlotFor, 'function');
  assert.deepEqual(motion.gpuSlotFor(0, 8), { column: 0, row: 0 });
  assert.deepEqual(motion.gpuSlotFor(9, 8), { column: 1, row: 1 });
  assert.deepEqual(motion.gpuSlotFor(47, 8), { column: 7, row: 5 });
});

test('48 experiments route evenly into 12 individual GPUs', async () => {
  const motion = await loadMotion();
  assert.equal(motion.GPU_NODE_COUNT, 12);
  assert.equal(motion.EXPERIMENTS_PER_GPU, 4);
  assert.equal(typeof motion.gpuNodeFor, 'function');

  const assignments = Array.from({ length: 48 }, (_, index) =>
    motion.gpuNodeFor(index));
  for (let node = 0; node < motion.GPU_NODE_COUNT; node += 1) {
    assert.equal(assignments.filter(value => value === node).length, 4);
  }
});

test('each GPU brightens cumulatively as four experiments arrive', async () => {
  const motion = await loadMotion();
  assert.equal(typeof motion.gpuLoadFor, 'function');

  const empty = motion.gpuLoadFor(0, 5);
  const filling = motion.gpuLoadFor(0.3, 5);
  const full = motion.gpuLoadFor(1, 5);

  assert.deepEqual(empty, {
    arrivals: [0, 0, 0, 0],
    arrived: 0,
    energy: 0,
  });
  assert.ok(filling.arrived > 0 && filling.arrived < 4);
  assert.ok(filling.energy > 0 && filling.energy < 1);
  assert.deepEqual(full, {
    arrivals: [1, 1, 1, 1],
    arrived: 4,
    energy: 1,
  });
});

test('scroll smoothing is frame-rate independent and never overshoots', async () => {
  const motion = await loadMotion();
  assert.equal(typeof motion.smoothScrollProgress, 'function');

  const oneFrame = motion.smoothScrollProgress(0, 1, 64);
  let fourFrames = 0;
  for (let index = 0; index < 4; index += 1) {
    fourFrames = motion.smoothScrollProgress(fourFrames, 1, 16);
  }

  assert.ok(oneFrame > 0 && oneFrame < 1);
  assert.ok(Math.abs(oneFrame - fourFrames) < 1e-12);
  assert.equal(motion.smoothScrollProgress(0.8, 0.2, 1000), 0.2);
});
