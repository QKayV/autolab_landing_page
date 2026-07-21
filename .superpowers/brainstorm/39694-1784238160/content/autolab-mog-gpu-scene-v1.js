import {
  EXPERIMENTS_PER_GPU,
  GPU_NODE_COUNT,
  createGpuJobs,
  gpuArrivalFor,
  gpuLoadFor,
  gpuNodeFor,
  gpuSlotFor,
  gpuStateFor,
  smoothScrollProgress,
} from './autolab-mog-gpu-motion-v1.js';

const section = document.querySelector('[data-gpu-section]');
const stage = section?.querySelector('.gpu-stage');
const canvas = section?.querySelector('#gpu-canvas');
const phaseLabel = section?.querySelector('[data-gpu-phase]');
const counter = section?.querySelector('[data-gpu-counter]');

if (!section || !stage || !canvas || !phaseLabel || !counter) {
  throw new Error('GPU efficiency scene markup is incomplete');
}

const context = canvas.getContext('2d');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const jobs = createGpuJobs(GPU_NODE_COUNT * EXPERIMENTS_PER_GPU, 0xA710AB);
const jobsByNode = Array.from({ length: GPU_NODE_COUNT }, (_, node) =>
  jobs.filter(job => gpuNodeFor(job.index) === node));
const winner = jobs.find(job => job.winner);
const phaseCopy = Object.freeze({
  intake: 'watching every run',
  packing: 'next experiment running',
  pruning: 'GPU reassigned',
  verified: 'best result verified',
});

let width = 1;
let height = 1;
let targetProgress = reducedMotion ? 1 : 0;
let progress = targetProgress;
let state = gpuStateFor(progress);
let columns = 6;
let visible = false;
let animationFrame = null;
let previousFrameTime = 0;
let lastDrawTime = 0;
let lastStyledProgress = -1;
let lastPhase = '';
let lastCounter = '';
let resizeCount = 0;

const clamp = (value, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));
const ease = value => 1 - Math.pow(1 - clamp(value), 3);
const mix = (from, to, amount) => from + (to - from) * amount;

function roundedRect(x, y, rectWidth, rectHeight, radius) {
  const r = Math.min(radius, rectWidth / 2, rectHeight / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + rectWidth - r, y);
  context.quadraticCurveTo(x + rectWidth, y, x + rectWidth, y + r);
  context.lineTo(x + rectWidth, y + rectHeight - r);
  context.quadraticCurveTo(
    x + rectWidth,
    y + rectHeight,
    x + rectWidth - r,
    y + rectHeight,
  );
  context.lineTo(x + r, y + rectHeight);
  context.quadraticCurveTo(x, y + rectHeight, x, y + rectHeight - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

function cubicPoint(from, controlA, controlB, to, amount) {
  const inverse = 1 - amount;
  return {
    x: inverse ** 3 * from.x +
      3 * inverse ** 2 * amount * controlA.x +
      3 * inverse * amount ** 2 * controlB.x +
      amount ** 3 * to.x,
    y: inverse ** 3 * from.y +
      3 * inverse ** 2 * amount * controlA.y +
      3 * inverse * amount ** 2 * controlB.y +
      amount ** 3 * to.y,
  };
}

function layoutForCanvas() {
  const mobile = width < 620;
  columns = mobile ? 3 : 6;
  const rows = mobile ? 4 : 2;
  const margin = mobile ? 12 : 30;
  const gridX = mobile ? width * 0.39 : width * 0.42;
  const gridY = mobile ? 38 : 40;
  const gridWidth = width - gridX - margin;
  const gridHeight = height - gridY - (mobile ? 26 : 24);
  const gap = mobile ? 7 : 10;
  const cellWidth = (gridWidth - gap * (columns - 1)) / columns;
  const cellHeight = (gridHeight - gap * (rows - 1)) / rows;

  return {
    mobile,
    columns,
    rows,
    slotCount: GPU_NODE_COUNT,
    gridX,
    gridY,
    gridWidth,
    gridHeight,
    gap,
    cellWidth,
    cellHeight,
    gateX: gridX - (mobile ? 23 : 52),
    gateY: height * 0.52,
  };
}

function rectForNode(index, layout) {
  const slot = gpuSlotFor(index, layout.columns);
  return {
    x: layout.gridX + slot.column * (layout.cellWidth + layout.gap),
    y: layout.gridY + slot.row * (layout.cellHeight + layout.gap),
    width: layout.cellWidth,
    height: layout.cellHeight,
  };
}

function centerOf(rect) {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

function flowPoint(target, amount, layout, laneOffset = 0) {
  const from = { x: layout.gateX + 2, y: layout.gateY + laneOffset };
  return cubicPoint(
    from,
    { x: layout.gateX + layout.gridWidth * 0.12, y: from.y },
    {
      x: target.x - layout.gridWidth * 0.18,
      y: target.y + laneOffset * 0.22,
    },
    target,
    amount,
  );
}

function traceFlow(target, layout, laneOffset = 0, from = 0, to = 1) {
  const steps = 24;
  const first = flowPoint(target, from, layout, laneOffset);
  context.beginPath();
  context.moveTo(first.x, first.y);
  for (let index = 1; index <= steps; index += 1) {
    const amount = mix(from, to, index / steps);
    const point = flowPoint(target, amount, layout, laneOffset);
    context.lineTo(point.x, point.y);
  }
}

function drawArrow(point, angle, alpha, color = '#9baba3', scale = 1) {
  if (alpha <= 0.002) return;
  const length = 8 * scale;
  context.save();
  context.translate(point.x, point.y);
  context.rotate(angle);
  context.globalAlpha = alpha;
  context.strokeStyle = color;
  context.lineWidth = Math.max(0.65, 1.05 * scale);
  context.shadowColor = color;
  context.shadowBlur = color === '#2fce96' ? 12 : 0;
  context.beginPath();
  context.moveTo(-length, 0);
  context.lineTo(length * 0.72, 0);
  context.moveTo(length * 0.08, -length * 0.46);
  context.lineTo(length * 0.72, 0);
  context.lineTo(length * 0.08, length * 0.46);
  context.stroke();
  context.restore();
}

function drawQueue(now, layout) {
  const queueAlpha = mix(0.68, 0.16, state.scaled);
  const laneCount = layout.mobile ? 5 : 6;
  const arrowCount = layout.mobile ? 6 : 10;

  context.save();
  context.globalAlpha = queueAlpha * 0.34;
  context.strokeStyle = '#56655e';
  context.lineWidth = 0.6;
  context.setLineDash([1, 7]);
  for (let lane = 0; lane < laneCount; lane += 1) {
    const y = 48 + lane * ((height - 92) / Math.max(1, laneCount - 1));
    context.beginPath();
    context.moveTo(12, y);
    context.lineTo(layout.gateX - 15, y);
    context.stroke();
  }
  context.restore();

  for (let index = 0; index < arrowCount; index += 1) {
    const job = jobs[index];
    const y = 48 + (job.lane % laneCount) *
      ((height - 92) / Math.max(1, laneCount - 1));
    const runway = Math.max(22, layout.gateX - 54);
    const drift = reducedMotion
      ? job.offset * runway
      : (now * 0.018 + job.offset * 72) % runway;
    drawArrow(
      { x: 18 + drift, y: y + Math.sin(index * 2.1 + now * 0.001) * 2.2 },
      0,
      queueAlpha * (0.32 + job.score * 0.34),
      job.winner ? '#2fce96' : '#81928a',
      job.winner ? 1.12 : 0.82,
    );
  }

  context.save();
  context.fillStyle = '#617168';
  context.font = '500 7px "IBM Plex Mono",monospace';
  context.fillText('EXPERIMENT QUEUE', 13, 18);
  context.restore();
}

function drawScheduler(now, layout) {
  const pulse = reducedMotion ? 0.6 : 0.5 + Math.sin(now * 0.0034) * 0.5;
  context.save();
  context.globalAlpha = 0.72;
  context.strokeStyle = 'rgba(47,206,150,.42)';
  context.lineWidth = 1;
  context.setLineDash([2, 7]);
  context.beginPath();
  context.moveTo(layout.gateX, 28);
  context.lineTo(layout.gateX, height - 18);
  context.stroke();
  context.setLineDash([]);

  context.globalAlpha = 0.64 + pulse * 0.28;
  context.fillStyle = '#2fce96';
  context.shadowColor = '#2fce96';
  context.shadowBlur = 16 + pulse * 12;
  context.fillRect(layout.gateX - 1, layout.gateY - 18, 2, 36);
  context.shadowBlur = 0;
  context.fillStyle = '#74847c';
  context.font = '500 7px "IBM Plex Mono",monospace';
  context.translate(layout.gateX - 8, layout.gateY + 49);
  context.rotate(-Math.PI / 2);
  context.fillText('NEXT-BEST SCHEDULER', 0, 0);
  context.restore();
}

function drawFabricHeading(layout) {
  context.save();
  context.fillStyle = '#7e8e86';
  context.font = '500 7px "IBM Plex Mono",monospace';
  context.fillText('FIXED GPU FABRIC / 12 GPUS', layout.gridX, 18);
  context.textAlign = 'right';
  context.fillStyle = '#2fce96';
  context.fillText('CAPACITY REUSED', layout.gridX + layout.gridWidth, 18);
  context.restore();
}

function drawRouteSpines(layout) {
  for (let node = 0; node < GPU_NODE_COUNT; node += 1) {
    const target = centerOf(rectForNode(node, layout));
    const load = gpuLoadFor(progress, node);
    context.save();
    context.globalAlpha = mix(0.015, 0.085, load.energy) *
      (1 - state.scaled * 0.78);
    context.strokeStyle = load.energy > 0.02 ? '#2fce96' : '#607068';
    context.lineWidth = 0.45 + load.energy * 0.3;
    context.setLineDash([2, 7]);
    traceFlow(target, layout);
    context.stroke();
    context.restore();
  }
}

function drawNode(node, layout, now) {
  const rect = rectForNode(node, layout);
  const load = gpuLoadFor(progress, node);
  const nodeJobs = jobsByNode[node];
  const winnerNode = nodeJobs.some(job => job.winner);
  const normalAlpha = mix(1, winnerNode ? 0.5 : 0.24, state.scaled);
  const arrivalFlash = Math.max(...load.arrivals.map(value =>
    value > 0.74 && value < 1
      ? Math.sin(((value - 0.74) / 0.26) * Math.PI)
      : 0));
  const pulse = reducedMotion ? 0.5 : 0.5 + Math.sin(now * 0.0027 + node) * 0.5;
  const glow = load.energy * (14 + pulse * 6) + arrivalFlash * 24;

  context.save();
  context.globalAlpha = normalAlpha;
  context.shadowColor = '#2fce96';
  context.shadowBlur = glow;
  roundedRect(rect.x, rect.y, rect.width, rect.height, 6);
  context.fillStyle = `rgba(47,206,150,${0.018 + load.energy * 0.14})`;
  context.fill();
  context.strokeStyle = load.energy > 0.01
    ? `rgba(47,206,150,${0.2 + load.energy * 0.52})`
    : 'rgba(247,245,240,.14)';
  context.lineWidth = 0.75 + load.energy * 0.9;
  context.stroke();
  context.shadowBlur = 0;

  if (load.energy > 0.002) {
    const heatHeight = (rect.height - 4) * load.energy;
    const heat = context.createLinearGradient(0, rect.y + rect.height, 0, rect.y);
    heat.addColorStop(0, `rgba(47,206,150,${0.09 + load.energy * 0.13})`);
    heat.addColorStop(1, 'rgba(47,206,150,0)');
    context.fillStyle = heat;
    context.fillRect(rect.x + 2, rect.y + rect.height - 2 - heatHeight, rect.width - 4, heatHeight);
  }

  const small = layout.mobile || rect.width < 82;
  const labelSize = small ? 6 : 7;
  context.font = `500 ${labelSize}px "IBM Plex Mono",monospace`;
  context.fillStyle = load.energy > 0.2 ? '#b7d4c8' : '#6f7f77';
  context.fillText(`GPU ${String(node + 1).padStart(2, '0')}`, rect.x + 7, rect.y + 13);
  context.textAlign = 'right';
  context.fillStyle = '#66766e';
  context.fillText(nodeJobs[0].hardware, rect.x + rect.width - 7, rect.y + 13);
  context.textAlign = 'left';

  const markerY = rect.y + rect.height * 0.54;
  const markerGap = Math.min(16, (rect.width - 18) / 4);
  const markerStart = rect.x + rect.width / 2 - markerGap * 1.5;
  for (let wave = 0; wave < EXPERIMENTS_PER_GPU; wave += 1) {
    const arrival = load.arrivals[wave] || 0;
    const job = nodeJobs[wave];
    const pruned = job.score < 0.46 && state.pruned > 0.42;
    const color = job.winner
      ? '#2fce96'
      : pruned
        ? '#56645d'
        : '#8fbaa8';
    drawArrow(
      { x: markerStart + markerGap * wave, y: markerY },
      0,
      normalAlpha * (0.12 + arrival * (pruned ? 0.3 : 0.82)),
      color,
      small ? 0.42 : 0.5,
    );
    if (pruned && arrival > 0.98) {
      context.save();
      context.globalAlpha = normalAlpha * state.pruned * 0.7;
      context.strokeStyle = '#718078';
      context.lineWidth = 0.7;
      const x = markerStart + markerGap * wave;
      context.beginPath();
      context.moveTo(x - 3, markerY - 4);
      context.lineTo(x + 3, markerY + 4);
      context.moveTo(x + 3, markerY - 4);
      context.lineTo(x - 3, markerY + 4);
      context.stroke();
      context.restore();
    }
  }

  context.globalAlpha = normalAlpha * (0.38 + load.energy * 0.62);
  context.fillStyle = load.arrived === EXPERIMENTS_PER_GPU ? '#2fce96' : '#788a81';
  context.font = `500 ${labelSize}px "IBM Plex Mono",monospace`;
  context.fillText(
    `FLOW ${load.arrived}/${EXPERIMENTS_PER_GPU}`,
    rect.x + 7,
    rect.y + rect.height - 8,
  );
  context.restore();
}

function drawActiveFlows(layout) {
  for (const job of jobs) {
    const arrival = gpuArrivalFor(progress, job.index);
    if (arrival <= 0.002 || arrival >= 0.996) continue;
    const node = gpuNodeFor(job.index);
    const wave = Math.floor(job.index / GPU_NODE_COUNT);
    const target = centerOf(rectForNode(node, layout));
    const laneOffset = (wave - (EXPERIMENTS_PER_GPU - 1) / 2) *
      (layout.mobile ? 2.5 : 4);
    const point = flowPoint(target, arrival, layout, laneOffset);
    const ahead = flowPoint(target, Math.min(1, arrival + 0.012), layout, laneOffset);
    const trailStart = Math.max(0, arrival - 0.2);
    const color = job.winner ? '#2fce96' : job.score > 0.7 ? '#70dcb3' : '#91a29a';
    const activeAlpha = Math.sin(arrival * Math.PI) * 0.5 + 0.42;

    context.save();
    context.globalAlpha = activeAlpha * 0.52;
    context.strokeStyle = color;
    context.lineWidth = job.winner ? 1.25 : 0.85;
    context.shadowColor = color;
    context.shadowBlur = job.winner ? 12 : 4;
    traceFlow(target, layout, laneOffset, trailStart, arrival);
    context.stroke();
    context.restore();

    drawArrow(
      point,
      Math.atan2(ahead.y - point.y, ahead.x - point.x),
      activeAlpha,
      color,
      job.winner ? 1.2 : 0.9,
    );

  }
}

function drawWinnerBlock(now, layout) {
  if (state.scaled <= 0.002) return;
  const winnerNode = gpuNodeFor(winner.index);
  const origin = rectForNode(winnerNode, layout);
  const startColumn = Math.max(0, Math.floor(layout.columns / 2) - 1);
  const startRow = Math.max(0, Math.floor(layout.rows / 2) - 1);
  const topLeft = rectForNode(startRow * layout.columns + startColumn, layout);
  const bottomRight = rectForNode(
    Math.min(
      GPU_NODE_COUNT - 1,
      (startRow + 1) * layout.columns + startColumn + 1,
    ),
    layout,
  );
  const target = {
    x: topLeft.x,
    y: topLeft.y,
    width: bottomRight.x + bottomRight.width - topLeft.x,
    height: bottomRight.y + bottomRight.height - topLeft.y,
  };
  const amount = state.scaled;
  const rect = {
    x: mix(origin.x, target.x, amount),
    y: mix(origin.y, target.y, amount),
    width: mix(origin.width, target.width, amount),
    height: mix(origin.height, target.height, amount),
  };
  const pulse = reducedMotion ? 0.5 : 0.5 + Math.sin(now * 0.004) * 0.5;

  context.save();
  context.globalCompositeOperation = 'screen';
  context.globalAlpha = amount * 0.25;
  context.strokeStyle = '#2fce96';
  context.lineWidth = 0.8;
  for (let index = 0; index < 4; index += 1) {
    const candidate = rectForNode((index * 3 + 1) % GPU_NODE_COUNT, layout);
    context.beginPath();
    context.moveTo(
      candidate.x + candidate.width / 2,
      candidate.y + candidate.height / 2,
    );
    context.lineTo(rect.x + rect.width / 2, rect.y + rect.height / 2);
    context.stroke();
  }

  context.globalAlpha = amount;
  context.shadowColor = '#2fce96';
  context.shadowBlur = 26 + pulse * 20;
  roundedRect(rect.x, rect.y, rect.width, rect.height, 8);
  context.fillStyle = `rgba(47,206,150,${0.11 + amount * 0.08})`;
  context.fill();
  context.strokeStyle = '#2fce96';
  context.lineWidth = mix(1.2, 2.2, amount);
  context.stroke();
  context.shadowBlur = 0;

  if (amount > 0.34) {
    const copyAlpha = ease((amount - 0.34) / 0.66);
    context.globalAlpha = copyAlpha;
    context.fillStyle = '#dff5ec';
    context.font = `500 ${layout.mobile ? 9 : 11}px "IBM Plex Mono",monospace`;
    context.fillText(winner.id, rect.x + 12, rect.y + 22);
    context.fillStyle = '#2fce96';
    context.font = `500 ${layout.mobile ? 7 : 8}px "IBM Plex Mono",monospace`;
    context.fillText('VERIFIED', rect.x + 12, rect.y + 39);
    if (rect.height > 60) {
      context.fillStyle = '#8aa399';
      context.fillText('SCALE / 4×H100', rect.x + 12, rect.y + 55);
    }
  }
  context.restore();
}

function resolvedExperimentCount() {
  return Math.min(
    jobs.length,
    Math.round(jobs.reduce(
      (sum, job) => sum + gpuArrivalFor(progress, job.index),
      0,
    )),
  );
}

function updateStageState() {
  if (Math.abs(progress - lastStyledProgress) < 0.00001) return;
  lastStyledProgress = progress;

  const opening = ease(progress / 0.13);
  const closing = ease((progress - 0.89) / 0.11);
  const baseInset = innerWidth < 900 ? 10 : 38;
  const baseRadius = innerWidth < 900 ? 19 : 26;
  const baseScaleX = clamp((innerWidth - baseInset * 2) / innerWidth, 0.82, 1);
  const baseScaleY = clamp((innerHeight - baseInset * 2) / innerHeight, 0.82, 1);
  const openScaleX = mix(baseScaleX, 1, opening);
  const openScaleY = mix(baseScaleY, 1, opening);
  const scaleX = mix(openScaleX, baseScaleX, closing);
  const scaleY = mix(openScaleY, baseScaleY, closing);
  const openRadius = mix(baseRadius, 0, opening);
  const radius = mix(openRadius, baseRadius, closing);

  stage.style.setProperty('--gpu-scale-x', scaleX.toFixed(5));
  stage.style.setProperty('--gpu-scale-y', scaleY.toFixed(5));
  stage.style.setProperty('--gpu-radius', `${radius.toFixed(2)}px`);
  stage.style.setProperty('--gpu-scan', String(state.packed * (1 - state.scaled)));

  if (lastPhase !== state.phase) {
    phaseLabel.textContent = phaseCopy[state.phase];
    lastPhase = state.phase;
  }
  const counterCopy = `${String(resolvedExperimentCount()).padStart(3, '0')} / 048 experiments resolved`;
  if (lastCounter !== counterCopy) {
    counter.textContent = counterCopy;
    lastCounter = counterCopy;
  }
}

function draw(now) {
  lastDrawTime = now;
  context.clearRect(0, 0, width, height);
  const layout = layoutForCanvas();

  drawQueue(now, layout);
  drawScheduler(now, layout);
  drawFabricHeading(layout);
  drawRouteSpines(layout);
  for (let node = 0; node < GPU_NODE_COUNT; node += 1) {
    drawNode(node, layout, now);
  }
  drawActiveFlows(layout);
  drawWinnerBlock(now, layout);
}

function scheduleFrame() {
  if (!visible || animationFrame !== null) return;
  if (reducedMotion) {
    frame(performance.now());
    return;
  }
  animationFrame = requestAnimationFrame(frame);
}

function stopFrame() {
  if (animationFrame === null) return;
  cancelAnimationFrame(animationFrame);
  animationFrame = null;
}

function frame(now) {
  animationFrame = null;
  if (!visible) return;
  const delta = previousFrameTime
    ? Math.min(80, Math.max(0, now - previousFrameTime))
    : 16;
  previousFrameTime = now;
  progress = reducedMotion
    ? 1
    : smoothScrollProgress(progress, targetProgress, delta);
  state = gpuStateFor(progress);
  updateStageState();
  draw(now);
  if (visible && !reducedMotion) scheduleFrame();
}

function resize() {
  const nextWidth = Math.max(1, canvas.offsetWidth);
  const nextHeight = Math.max(1, canvas.offsetHeight);
  const ratio = Math.min(devicePixelRatio || 1, 2);
  const pixelWidth = Math.round(nextWidth * ratio);
  const pixelHeight = Math.round(nextHeight * ratio);
  width = nextWidth;
  height = nextHeight;
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
    resizeCount += 1;
  }
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  scheduleFrame();
}

function updateScroll() {
  const rect = section.getBoundingClientRect();
  const distance = Math.max(1, section.offsetHeight - innerHeight);
  targetProgress = reducedMotion ? 1 : clamp(-rect.top / distance);
  scheduleFrame();
}

new IntersectionObserver(entries => {
  const nextVisible = entries[0]?.isIntersecting ?? false;
  if (nextVisible === visible) return;
  visible = nextVisible;
  previousFrameTime = 0;
  if (visible) scheduleFrame();
  else stopFrame();
}, { rootMargin: '0px' }).observe(section);

new ResizeObserver(resize).observe(canvas);
addEventListener('resize', () => {
  lastStyledProgress = -1;
  resize();
  updateScroll();
});
addEventListener('scroll', updateScroll, { passive: true });

window.__AUTOLAB_GPU__ = Object.freeze({
  getState() {
    return {
      progress,
      targetProgress,
      phase: state.phase,
      insights: resolvedExperimentCount(),
      winnerId: winner.id,
      gpuCount: GPU_NODE_COUNT,
      experimentsPerGpu: EXPERIMENTS_PER_GPU,
      columns,
      reducedMotion,
      visible,
      resizeCount,
      lastFrame: lastDrawTime,
    };
  },
});

resize();
updateScroll();
