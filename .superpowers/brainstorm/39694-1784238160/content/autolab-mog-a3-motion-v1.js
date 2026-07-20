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

export function navigationTelemetryFor(progress) {
  const phase = phaseFor(progress);
  if (phase === 'release' || phase === 'ending') {
    return { visible: false, text: '' };
  }

  let count = 1000;
  if (phase === 'orbit') {
    const orbit = ease(
      (progress - TIMELINE.release) / (TIMELINE.orbit - TIMELINE.release),
    );
    count = Math.round(mix(1, 1000, orbit));
  } else if (phase === 'pressure') {
    const pressure = ease(
      (progress - TIMELINE.gradient) /
        (TIMELINE.pressure - TIMELINE.gradient),
    );
    count = 1000 - Math.round(742 * pressure);
  } else if (phase === 'compression') {
    const compression = ease(
      (progress - TIMELINE.pressure) /
        (TIMELINE.compression - TIMELINE.pressure),
    );
    count = Math.max(1, Math.round(mix(258, 1, compression)));
  }

  const formatted = count === 1000
    ? '1,000'
    : String(count).padStart(3, '0');
  return { visible: true, text: `${formatted} experiments active` };
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

export function surfaceHeight(u, v, pointer = { x: 0, y: 0, strength: 0 }) {
  const peak = Math.exp(-((u - 0.28) ** 2 * 2.55 + (v + 0.12) ** 2 * 1.85));
  const shoulder = 0.25 * Math.exp(-((u + 0.5) ** 2 * 5 + (v - 0.42) ** 2 * 4));
  const ridge = 0.19 * Math.sin((u + v) * 2.4) + 0.2 * u - 0.1 * v;
  const distanceX = u - (pointer.x || 0);
  const distanceY = v - (pointer.y || 0);
  const bend = (pointer.strength || 0) *
    Math.exp(-(distanceX ** 2 + distanceY ** 2) * 4.5) * 0.45;
  return 0.14 + peak * 0.82 + shoulder + ridge + bend;
}

export function surfaceGradient(
  u,
  v,
  pointer = { x: 0, y: 0, strength: 0 },
) {
  const delta = 0.015;
  const slopeU = surfaceHeight(u + delta, v, pointer) -
    surfaceHeight(u - delta, v, pointer);
  const slopeV = surfaceHeight(u, v + delta, pointer) -
    surfaceHeight(u, v - delta, pointer);
  const magnitude = Math.hypot(slopeU, slopeV);
  if (magnitude < 0.000001) return { u: 1, v: 0 };
  return { u: slopeU / magnitude, v: slopeV / magnitude };
}

export function surfaceAlignmentFor(progress) {
  const settled = ease(
    (progress - (TIMELINE.orbit + 0.03)) /
      (TIMELINE.gradient - TIMELINE.orbit - 0.03),
  );
  const released = ease(
    (progress - TIMELINE.pressure) /
      (TIMELINE.compression - TIMELINE.pressure),
  );
  return settled * (1 - released);
}

function frontierPose(blueprint, scene) {
  return {
    x: blueprint.u,
    y: blueprint.v,
    z: surfaceHeight(blueprint.u, blueprint.v, scene.pointer) + blueprint.score * 0.08,
  };
}

export function poseForExperiment(blueprint, scene) {
  const orbit = orbitPose(blueprint, scene);
  const frontier = frontierPose(blueprint, scene);
  const frontierAmount = ease(
    (scene.progress - TIMELINE.orbit) /
      (TIMELINE.gradient - TIMELINE.orbit),
  );
  let pose = {
    x: mix(orbit.x, frontier.x, frontierAmount),
    y: mix(orbit.y, frontier.y, frontierAmount),
    z: mix(orbit.z, frontier.z, frontierAmount),
  };
  const pressure = ease(
    (scene.progress - TIMELINE.gradient) /
      (TIMELINE.pressure - TIMELINE.gradient),
  );
  pose.z -= pressure * (1 - blueprint.score) * 0.3;

  const compression = ease(
    (scene.progress - TIMELINE.pressure) /
      (TIMELINE.compression - TIMELINE.pressure),
  );
  const initialAngle = Math.atan2(pose.y, pose.x);
  const helix = initialAngle + compression * TAU * (1.2 + blueprint.lineage % 5 * 0.08);
  const radius = Math.hypot(pose.x, pose.y) * (1 - compression * 0.965);
  pose = {
    x: Math.cos(helix) * radius,
    y: Math.sin(helix) * radius,
    z: pose.z * (1 - compression * 0.97) +
      Math.sin(helix * 2) * compression * (1 - compression) * 0.04,
  };

  const dominated = 1 - blueprint.score;
  const alpha = blueprint.winner ? 1 : 1 - pressure * (0.2 + dominated * 0.68);

  return {
    id: blueprint.id,
    ...pose,
    alpha,
    angle: helix,
    trail: (1 - pressure * 0.64) * (1 - compression),
    scale: blueprint.winner ? 1.4 + pressure * 0.18 : 1,
  };
}

export function endingPose(ending, blueprint, local, context) {
  if (ending === 'slingshot') {
    const flight = ease((local - 0.04) / 0.64);
    const afterimage = Math.sin(clamp((local - 0.02) / 0.72) * Math.PI);
    return {
      position: {
        x: mix(context.origin.x, 1.42, flight),
        y: mix(context.origin.y, -0.18, flight) + Math.sin(flight * Math.PI) * 0.22,
      },
      flight,
      afterimage,
      tear: ease((local - 0.24) / 0.76),
      light: ease((local - 0.4) / 0.6),
      unfold: ease((local - 0.54) / 0.46),
    };
  }

  if (ending === 'rebirth') {
    const seed = ease((local - 0.12) / 0.3);
    const unfold = ease((local - 0.5) / 0.5);
    return {
      position: {
        x: mix(context.origin.x, context.result.x, unfold),
        y: mix(context.origin.y, context.result.y, unfold),
      },
      seed,
      pulse: ease((local - 0.3) / 0.32),
      light: ease((local - 0.38) / 0.62),
      unfold,
    };
  }

  if (ending === 'loop') {
    const flight = ease((local - 0.04) / 0.62);
    return {
      position: {
        x: mix(context.origin.x, context.launch.x, flight),
        y: mix(context.origin.y, context.launch.y, flight),
      },
      flight,
      reattach: ease((local - 0.56) / 0.2),
      scan: ease((local - 0.7) / 0.3),
      unfold: ease((local - 0.77) / 0.23),
    };
  }

  throw new TypeError(`Unknown ending: ${ending}`);
}
