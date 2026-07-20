import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TIMELINE,
  phaseFor,
  createExperimentBlueprints,
  poseForExperiment,
  endingPose,
} from './autolab-mog-a3-motion-v1.js';
import * as motion from './autolab-mog-a3-motion-v1.js';

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

test('navigation telemetry stays hidden until the orbit begins', () => {
  assert.equal(typeof motion.navigationTelemetryFor, 'function');

  const opening = motion.navigationTelemetryFor(0);
  const release = motion.navigationTelemetryFor(TIMELINE.release - 0.0001);
  const orbit = motion.navigationTelemetryFor(TIMELINE.release);
  const ending = motion.navigationTelemetryFor(TIMELINE.compression);

  assert.deepEqual(opening, { visible: false, text: '' });
  assert.deepEqual(release, { visible: false, text: '' });
  assert.equal(orbit.visible, true);
  assert.equal(orbit.text, '001 experiments active');
  assert.deepEqual(ending, { visible: false, text: '' });
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

test('orbit resolves continuously into each experiment’s frontier coordinate', () => {
  const experiment = createExperimentBlueprints(240, 0xA3701AB)[40];
  const before = poseForExperiment(experiment, quietScene(TIMELINE.orbit - 0.0001));
  const after = poseForExperiment(experiment, quietScene(TIMELINE.orbit + 0.0001));
  const surface = poseForExperiment(experiment, quietScene(TIMELINE.gradient));

  assert.ok(Math.hypot(after.x - before.x, after.y - before.y, after.z - before.z) < 0.02);
  assert.ok(Math.abs(surface.x - experiment.u) < 0.001);
  assert.ok(Math.abs(surface.y - experiment.v) < 0.001);
});

test('frontier surface responds to pointer pressure without changing identity', () => {
  const experiment = createExperimentBlueprints(240, 0xA3701AB)[80];
  const quiet = poseForExperiment(experiment, quietScene(0.52));
  const bent = poseForExperiment(experiment, {
    ...quietScene(0.52),
    pointer: { x: experiment.u, y: experiment.v, strength: 1 },
  });

  assert.equal(bent.id, quiet.id);
  assert.ok(bent.z > quiet.z + 0.08);
});

test('surface gradient points every settled experiment uphill', () => {
  assert.equal(typeof motion.surfaceGradient, 'function');

  const u = -0.18;
  const v = 0.31;
  const gradient = motion.surfaceGradient(u, v);
  const height = motion.surfaceHeight(u, v);
  const uphill = motion.surfaceHeight(
    u + gradient.u * 0.02,
    v + gradient.v * 0.02,
  );

  assert.ok(Math.abs(Math.hypot(gradient.u, gradient.v) - 1) < 0.0001);
  assert.ok(uphill > height);
});

test('surface headings stay tangential until experiments are mostly landed', () => {
  assert.equal(typeof motion.surfaceAlignmentFor, 'function');
  assert.equal(motion.surfaceAlignmentFor(0.2), 0);
  assert.equal(motion.surfaceAlignmentFor(TIMELINE.orbit), 0);
  assert.equal(motion.surfaceAlignmentFor(0.45), 0);
  assert.ok(motion.surfaceAlignmentFor(0.48) > 0);
  assert.ok(motion.surfaceAlignmentFor(TIMELINE.gradient) > 0.99);
  assert.ok(motion.surfaceAlignmentFor(TIMELINE.pressure) > 0.99);
  assert.equal(motion.surfaceAlignmentFor(TIMELINE.compression), 0);
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

test('ending choreography exposes the authored transition beats', () => {
  const context = {
    origin: { x: 0, y: 0 },
    launch: { x: -0.8, y: -0.9 },
    result: { x: 0.2, y: 0.1 },
  };
  const winner = { id: 'EXP-0138', winner: true, score: 1 };
  const slingshot = endingPose('slingshot', winner, 0.45, context);
  const rebirthHold = endingPose('rebirth', winner, 0.08, context);
  const rebirthFinal = endingPose('rebirth', winner, 1, context);
  const loopFinal = endingPose('loop', winner, 1, context);

  assert.ok(slingshot.afterimage > 0.5);
  assert.equal(rebirthHold.seed, 0);
  assert.ok(rebirthFinal.unfold > 0.99);
  assert.ok(loopFinal.reattach > 0.99 && loopFinal.scan > 0.99);
});
