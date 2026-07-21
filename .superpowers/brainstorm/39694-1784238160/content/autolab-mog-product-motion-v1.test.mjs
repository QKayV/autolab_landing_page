import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WATCHDOG_CYCLE_MS,
  WATCHDOG_TIMELINE,
  watchdogCurveAt,
  watchdogStateFor,
} from './autolab-mog-product-motion-v1.js';

test('watchdog timing matches the authored handoff cycle', () => {
  assert.deepEqual(WATCHDOG_TIMELINE, {
    plateau: 0.42,
    stop: 0.61,
    reassign: 0.76,
    restart: 0.88,
  });
  assert.equal(WATCHDOG_CYCLE_MS, 7200);
});

test('watchdog moves through observe, plateau, stop, reassign, and restart', () => {
  assert.equal(watchdogStateFor(0).phase, 'observing');
  assert.equal(watchdogStateFor(WATCHDOG_TIMELINE.plateau).phase, 'plateau');
  assert.equal(watchdogStateFor(WATCHDOG_TIMELINE.stop).phase, 'stopped');
  assert.equal(watchdogStateFor(WATCHDOG_TIMELINE.reassign).phase, 'reassigned');
  assert.equal(watchdogStateFor(1).phase, 'running-next');
});

test('the first run visibly flattens before it stops', () => {
  const earlyGain = watchdogCurveAt(0.35, 0.35) - watchdogCurveAt(0.15, 0.35);
  const lateGain = watchdogCurveAt(0.9, 0.55) - watchdogCurveAt(0.7, 0.55);
  assert.ok(earlyGain > lateGain * 3);
});

test('reassignment releases the old job before the next one starts', () => {
  const stopped = watchdogStateFor(0.68);
  const reassigned = watchdogStateFor(0.82);
  assert.equal(stopped.oldJobVisible, true);
  assert.equal(stopped.nextJobVisible, false);
  assert.equal(reassigned.oldJobVisible, false);
  assert.equal(reassigned.nextJobVisible, true);
});
