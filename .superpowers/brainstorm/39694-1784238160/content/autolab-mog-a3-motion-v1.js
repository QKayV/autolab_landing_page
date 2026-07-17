export const TIMELINE = Object.freeze({
  release: 0.12,
  orbit: 0.34,
  gradient: 0.60,
  pressure: 0.76,
  compression: 0.86,
});

export const clamp = (value, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

export const ease = value => 1 - Math.pow(1 - clamp(value), 3);

const TAU = Math.PI * 2;
const mix = (from, to, amount) => from + (to - from) * amount;

function mulberry32(seed) {
  return () => {
    let value = seed += 0x6D2B79F5;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

export function phaseFor(progress) {
  if (progress < TIMELINE.release) return 'release';
  if (progress < TIMELINE.orbit) return 'orbit';
  if (progress < TIMELINE.gradient) return 'gradient';
  if (progress < TIMELINE.pressure) return 'pressure';
  if (progress < TIMELINE.compression) return 'compression';
  return 'ending';
}

export function createExperimentBlueprints(count, seed = 0xA3701AB) {
  const random = mulberry32(seed);
  const winnerIndex = Math.min(137, count - 1);

  return Array.from({ length: count }, (_, index) => ({
    id: `EXP-${String(index + 1).padStart(4, '0')}`,
    index,
    winner: index === winnerIndex,
    score: index === winnerIndex ? 1 : random(),
    orbit: random(),
    eccentricity: 0.35 + random() * 0.55,
    spin: 0.55 + random() * 1.2,
    u: random() * 2 - 1,
    v: random() * 2 - 1,
    lineage: index % 17,
  }));
}

function orbitPose(blueprint, scene) {
  const local = clamp(
    (scene.progress - TIMELINE.release) /
      (TIMELINE.orbit - TIMELINE.release),
  );
  const clock = scene.reducedMotion ? local * 1.8 : scene.time * 0.00018;
  const angle =
    blueprint.orbit * TAU +
    clock * blueprint.spin +
    local * TAU * 0.65;
  const radius = 0.16 + blueprint.orbit * 0.84;

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius * blueprint.eccentricity,
    z: Math.sin(angle * 2 + blueprint.lineage) * 0.08,
  };
}

export function poseForExperiment(blueprint, scene) {
  let pose = orbitPose(blueprint, scene);
  const compression = ease(
    (scene.progress - TIMELINE.pressure) /
      (TIMELINE.compression - TIMELINE.pressure),
  );
  const helix = blueprint.lineage * 0.12 + compression * TAU * 1.5;
  const radius = Math.hypot(pose.x, pose.y) * (1 - compression * 0.95);
  pose = {
    x: Math.cos(helix) * radius,
    y: Math.sin(helix) * radius,
    z: pose.z * (1 - compression * 0.94),
  };

  return {
    id: blueprint.id,
    ...pose,
    alpha: 1,
    angle: helix,
    trail: 1 - compression,
    scale: blueprint.winner ? 1.4 : 1,
  };
}

export function endingPose(ending, blueprint, local, context) {
  const amount = ease(local);

  if (ending === 'slingshot') {
    return {
      position: {
        x: mix(context.origin.x, 1.35, amount),
        y: mix(context.origin.y, -0.25, amount),
      },
      tear: ease((local - 0.15) / 0.85),
    };
  }

  if (ending === 'rebirth') {
    return {
      position: context.result,
      seed: amount,
      pulse: ease((local - 0.35) / 0.65),
    };
  }

  if (ending === 'loop') {
    return {
      position: {
        x: mix(context.origin.x, context.launch.x, amount),
        y: mix(context.origin.y, context.launch.y, amount),
      },
      reattach: ease((local - 0.55) / 0.45),
      scan: ease((local - 0.72) / 0.28),
    };
  }

  throw new TypeError(`Unknown ending: ${ending}`);
}
