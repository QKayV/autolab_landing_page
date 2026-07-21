export const WATCHDOG_CYCLE_MS = 7200;

export const WATCHDOG_TIMELINE = Object.freeze({
  plateau: 0.42,
  stop: 0.61,
  reassign: 0.76,
  restart: 0.88,
});

const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => 1 - Math.pow(1 - clamp(value), 3);

export function watchdogCurveAt(x, progress) {
  const revealedX = Math.min(clamp(x), ease(progress / WATCHDOG_TIMELINE.stop));
  return 1 - Math.exp(-revealedX * 5.2);
}

export function watchdogStateFor(progress) {
  const value = clamp(progress);
  const phase = value < WATCHDOG_TIMELINE.plateau
    ? 'observing'
    : value < WATCHDOG_TIMELINE.stop
      ? 'plateau'
      : value < WATCHDOG_TIMELINE.reassign
        ? 'stopped'
        : value < WATCHDOG_TIMELINE.restart
          ? 'reassigned'
          : 'running-next';
  return {
    progress: value,
    phase,
    curve: ease(value / WATCHDOG_TIMELINE.stop),
    stop: ease((value - WATCHDOG_TIMELINE.stop) / 0.1),
    reassign: ease((value - WATCHDOG_TIMELINE.reassign) / 0.1),
    restart: ease((value - WATCHDOG_TIMELINE.restart) / 0.12),
    oldJobVisible: value < WATCHDOG_TIMELINE.reassign,
    nextJobVisible: value >= WATCHDOG_TIMELINE.reassign,
  };
}
