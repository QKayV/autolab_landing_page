import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TIMELINE,
  phaseFor,
  createExperimentBlueprints,
  poseForExperiment,
  endingPose,
} from './autolab-mog-a3-motion-v1.mjs';

const quietScene = progress => ({
  progress,
  time: 0,
  pointer: { x: 0, y: 0, strength: 0 },
  reducedMotion: false,
});

test('phase boundaries match the approved shared timeline', () => {
  assert.equal(phaseFor(0.06), 'release');
  assert.equal(phaseFor(0.20), 'orbit');
  assert.equal(phaseFor(0.47), 'gradient');
  assert.equal(phaseFor(0.68), 'pressure');
  assert.equal(phaseFor(0.81), 'compression');
  assert.equal(phaseFor(0.93), 'ending');
  assert.deepEqual(TIMELINE, {
    release: 0.12,
    orbit: 0.34,
    gradient: 0.60,
    pressure: 0.76,
    compression: 0.86,
  });
});

test('experiment identities are deterministic and unique', () => {
  const first = createExperimentBlueprints(240, 0xA3701AB);
  const second = createExperimentBlueprints(240, 0xA3701AB);
  assert.deepEqual(first, second);
  assert.equal(new Set(first.map(item => item.id)).size, 240);
  assert.equal(first.filter(item => item.winner).length, 1);
});

test('experiment identity survives every shared phase', () => {
  const experiment = createExperimentBlueprints(240, 0xA3701AB)[137];
  for (const progress of [0.20, 0.47, 0.68, 0.81]) {
    assert.equal(poseForExperiment(experiment, quietScene(progress)).id, experiment.id);
  }
});

test('compression moves experiments toward the origin', () => {
  const experiment = createExperimentBlueprints(240, 0xA3701AB)[40];
  const early = poseForExperiment(experiment, quietScene(0.77));
  const late = poseForExperiment(experiment, quietScene(0.855));
  assert.ok(
    Math.hypot(late.x, late.y, late.z) < Math.hypot(early.x, early.y, early.z),
  );
});

test('the three endings produce distinct winning trajectories', () => {
  const context = {
    origin: { x: 0, y: 0 },
    launch: { x: -0.8, y: -0.9 },
    result: { x: 0.2, y: 0.1 },
  };
  const winner = { id: 'EXP-0138', winner: true, score: 1 };
  assert.ok(endingPose('slingshot', winner, 1, context).position.x > 1);
  assert.equal(endingPose('rebirth', winner, 1, context).seed, 1);
  assert.deepEqual(endingPose('loop', winner, 1, context).position, context.launch);
  assert.throws(() => endingPose('unknown', winner, 1, context), TypeError);
});
