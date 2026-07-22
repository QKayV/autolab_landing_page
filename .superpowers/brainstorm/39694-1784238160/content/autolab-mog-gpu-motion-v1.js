export const GPU_TIMELINE = Object.freeze({
  intake: 0.28,
  packing: 0.54,
  pruning: 0.72,
});

export const GPU_NODE_COUNT = 12;
export const EXPERIMENTS_PER_GPU = 4;

const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => 1 - Math.pow(1 - clamp(value), 3);

function mulberry32(seed) {
  return () => {
    let value = seed += 0x6D2B79F5;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

export function createGpuJobs(count = 48, seed = 0xA710AB) {
  const random = mulberry32(seed);
  const winnerIndex = Math.min(17, count - 1);

  return Array.from({ length: count }, (_, index) => ({
    id: `EXP-${String(index + 1).padStart(4, '0')}`,
    index,
    score: index === winnerIndex ? 1 : random(),
    lane: index % 6,
    offset: random(),
    hardware: ['3090', 'A100', 'H100'][index % 3],
    winner: index === winnerIndex,
  }));
}

export function gpuSlotFor(index, columns = 8) {
  return {
    column: index % columns,
    row: Math.floor(index / columns),
  };
}

export function gpuNodeFor(index, nodeCount = GPU_NODE_COUNT) {
  return index % nodeCount;
}

export function gpuArrivalFor(
  progress,
  index,
  nodeCount = GPU_NODE_COUNT,
) {
  const node = gpuNodeFor(index, nodeCount);
  const wave = Math.floor(index / nodeCount);
  const normalizedNode = node / Math.max(1, nodeCount - 1);
  const start = 0.018 + normalizedNode * 0.09 + wave * 0.135;
  return ease((progress - start) / 0.12);
}

export function gpuLoadFor(
  progress,
  nodeIndex,
  jobCount = GPU_NODE_COUNT * EXPERIMENTS_PER_GPU,
  nodeCount = GPU_NODE_COUNT,
) {
  const arrivals = [];
  for (let index = nodeIndex; index < jobCount; index += nodeCount) {
    arrivals.push(gpuArrivalFor(progress, index, nodeCount));
  }
  const arrived = arrivals.filter(value => value >= 0.985).length;
  const energy = arrivals.length === 0
    ? 0
    : arrivals.reduce((sum, value) => sum + value, 0) / arrivals.length;

  return {
    arrivals,
    arrived,
    energy: clamp(energy),
  };
}

export function smoothScrollProgress(
  current,
  target,
  deltaMs,
  timeConstantMs = 78,
) {
  if (current === target) return target;
  if (deltaMs <= 0) return current;
  if (deltaMs >= timeConstantMs * 8) return target;
  const amount = 1 - Math.exp(-deltaMs / timeConstantMs);
  const next = current + (target - current) * amount;
  if (Math.abs(target - next) < 0.0001) return target;
  return target > current
    ? Math.min(next, target)
    : Math.max(next, target);
}

export function gpuIntakeConfigFor(mobile) {
  return mobile
    ? { laneCount: 6, arrowCount: 18 }
    : { laneCount: 8, arrowCount: 36 };
}

export function gpuIntakePointFor(
  amount,
  lane,
  laneCount,
  { startX, gateX, gateY, height },
) {
  const value = clamp(amount);
  const safeLaneCount = Math.max(1, laneCount);
  const laneY = safeLaneCount === 1
    ? height / 2
    : 48 + lane * ((height - 92) / (safeLaneCount - 1));
  const span = gateX - startX;
  const from = { x: startX, y: laneY };
  const controlA = { x: startX + span * 0.42, y: laneY };
  const controlB = {
    x: gateX - span * 0.16,
    y: gateY + (laneY - gateY) * 0.08,
  };
  const inverse = 1 - value;

  return {
    x: inverse ** 3 * from.x +
      3 * inverse ** 2 * value * controlA.x +
      3 * inverse * value ** 2 * controlB.x +
      value ** 3 * gateX,
    y: inverse ** 3 * from.y +
      3 * inverse ** 2 * value * controlA.y +
      3 * inverse * value ** 2 * controlB.y +
      value ** 3 * gateY,
  };
}

export function gpuStateFor(progress) {
  const value = clamp(progress);
  const intake = ease(value / GPU_TIMELINE.intake);
  const packed = ease(
    (value - 0.14) / (GPU_TIMELINE.packing - 0.14),
  );
  const pruned = ease(
    (value - 0.46) / (GPU_TIMELINE.pruning - 0.46),
  );
  const scaled = ease((value - 0.68) / 0.32);
  const phase = value < GPU_TIMELINE.intake
    ? 'intake'
    : value < GPU_TIMELINE.packing
      ? 'packing'
      : value < GPU_TIMELINE.pruning
        ? 'pruning'
        : 'verified';

  return { intake, packed, pruned, scaled, phase };
}
