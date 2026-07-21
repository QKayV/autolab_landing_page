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
