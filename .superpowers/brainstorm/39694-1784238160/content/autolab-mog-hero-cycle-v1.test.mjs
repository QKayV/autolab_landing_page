import test from 'node:test';
import assert from 'node:assert/strict';

test('hero words rotate through research, training, and inference', async () => {
  let cycle = {};
  try {
    cycle = await import('./autolab-mog-hero-cycle-v1.js');
  } catch {}

  assert.deepEqual(cycle.HERO_WORDS, ['research', 'training', 'inference']);
  assert.equal(cycle.heroWordFor(0), 'research');
  assert.equal(cycle.heroWordFor(1), 'training');
  assert.equal(cycle.heroWordFor(2), 'inference');
  assert.equal(cycle.heroWordFor(3), 'research');
});
