export const GPU_TIMELINE = Object.freeze({
  intake: 0.28,
  packing: 0.54,
  pruning: 0.72,
});

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
