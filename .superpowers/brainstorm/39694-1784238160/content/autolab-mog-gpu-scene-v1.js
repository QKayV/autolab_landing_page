import {
  createGpuJobs,
  gpuSlotFor,
  gpuStateFor,
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
const jobs = createGpuJobs(48, 0xA710AB);
const winner = jobs.find(job => job.winner);
const phaseCopy = Object.freeze({
  intake: 'experiments arriving',
  packing: 'capacity continuously repacked',
  pruning: 'dead ends released',
  verified: 'winner scaling',
});

let width = 1;
let height = 1;
let progress = reducedMotion ? 1 : 0;
let state = gpuStateFor(progress);
let columns = 8;
let visible = false;
let animationFrame = 0;
let lastTime = 0;

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

function routePoint(from, to, amount, gateX) {
  return cubicPoint(
    from,
    { x: gateX - 46, y: from.y },
    { x: gateX + 34, y: to.y },
    to,
    amount,
  );
}

function layoutForCanvas() {
  const mobile = width < 620;
  columns = mobile ? 4 : 8;
  const rows = mobile ? 4 : 3;
  const margin = mobile ? 15 : 34;
  const gridX = mobile ? width * 0.4 : width * 0.43;
  const gridY = mobile ? 43 : 42;
  const gridWidth = width - gridX - margin;
  const gridHeight = height - gridY - (mobile ? 30 : 25);
  const gap = mobile ? 6 : 8;
  const cellWidth = (gridWidth - gap * (columns - 1)) / columns;
  const cellHeight = (gridHeight - gap * (rows - 1)) / rows;

  return {
    mobile,
    columns,
    rows,
    slotCount: columns * rows,
    margin,
    gridX,
    gridY,
    gridWidth,
    gridHeight,
    gap,
    cellWidth,
    cellHeight,
    gateX: gridX - (mobile ? 24 : 54),
  };
}

function rectForSlot(index, layout) {
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
  context.shadowBlur = color === '#2fce96' ? 11 : 0;
  context.beginPath();
  context.moveTo(-length, 0);
  context.lineTo(length * 0.72, 0);
  context.moveTo(length * 0.08, -length * 0.46);
  context.lineTo(length * 0.72, 0);
  context.lineTo(length * 0.08, length * 0.46);
  context.stroke();
  context.restore();
}

function drawRoute(job, target, amount, alpha, layout, label = true) {
  const laneCount = layout.mobile ? 5 : 6;
  const lane = job.lane % laneCount;
  const from = {
    x: layout.mobile ? 14 : 30,
    y: 48 + lane * ((height - 92) / Math.max(1, laneCount - 1)),
  };
  const current = routePoint(from, target, amount, layout.gateX);
  const ahead = routePoint(
    from,
    target,
    Math.min(1, amount + 0.012),
    layout.gateX,
  );
  const trailStart = routePoint(
    from,
    target,
    Math.max(0, amount - 0.16),
    layout.gateX,
  );
  const color = job.winner ? '#2fce96' : job.score > 0.7 ? '#70dcb3' : '#91a29a';

  context.save();
  context.globalAlpha = alpha * 0.34;
  context.strokeStyle = color;
  context.lineWidth = 0.75;
  context.setLineDash([2, 6]);
  context.beginPath();
  context.moveTo(trailStart.x, trailStart.y);
  const trailSteps = 8;
  for (let index = 1; index <= trailSteps; index += 1) {
    const sample = mix(Math.max(0, amount - 0.16), amount, index / trailSteps);
    const point = routePoint(from, target, sample, layout.gateX);
    context.lineTo(point.x, point.y);
  }
  context.stroke();
  context.restore();

  drawArrow(
    current,
    Math.atan2(ahead.y - current.y, ahead.x - current.x),
    alpha,
    color,
    job.winner ? 1.2 : 1,
  );

  if (label && !layout.mobile && amount > 0.18 && amount < 0.82) {
    context.save();
    context.globalAlpha = alpha * 0.76;
    context.fillStyle = color;
    context.font = '500 7px "IBM Plex Mono",monospace';
    context.fillText(job.id, current.x + 10, current.y - 8);
    context.restore();
  }
}

function arrivalFor(slotIndex, slotCount, wave) {
  const normalized = slotIndex / Math.max(1, slotCount - 1);
  const start = wave === 0
    ? 0.015 + normalized * 0.13
    : 0.255 + normalized * 0.13;
  const duration = wave === 0 ? 0.12 : 0.17;
  return ease((progress - start) / duration);
}

function drawQueue(now, layout) {
  const queueAlpha = mix(0.62, 0.18, state.scaled);
  const arrowCount = layout.mobile ? 7 : 11;

  context.save();
  context.globalAlpha = queueAlpha * 0.36;
  context.strokeStyle = '#56655e';
  context.lineWidth = 0.6;
  context.setLineDash([1, 7]);
  for (let lane = 0; lane < (layout.mobile ? 5 : 6); lane += 1) {
    const y = 48 + lane * ((height - 92) / (layout.mobile ? 4 : 5));
    context.beginPath();
    context.moveTo(12, y);
    context.lineTo(layout.gateX - 16, y);
    context.stroke();
  }
  context.restore();

  for (let index = 0; index < arrowCount; index += 1) {
    const job = jobs[index];
    const laneCount = layout.mobile ? 5 : 6;
    const y = 48 + (job.lane % laneCount) *
      ((height - 92) / Math.max(1, laneCount - 1));
    const drift = reducedMotion ? job.offset * 18 :
      (now * 0.018 + job.offset * 72) % Math.max(24, layout.gateX - 58);
    drawArrow(
      { x: 18 + drift, y: y + Math.sin(index * 2.1 + now * 0.001) * 2.5 },
      0,
      queueAlpha * (0.3 + job.score * 0.35),
      job.winner ? '#2fce96' : '#81928a',
      job.winner ? 1.15 : 0.82,
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

  const gateY = height * 0.52;
  context.globalAlpha = 0.64 + pulse * 0.28;
  context.fillStyle = '#2fce96';
  context.shadowColor = '#2fce96';
  context.shadowBlur = 16 + pulse * 12;
  context.fillRect(layout.gateX - 1, gateY - 17, 2, 34);
  context.shadowBlur = 0;
  context.fillStyle = '#74847c';
  context.font = '500 7px "IBM Plex Mono",monospace';
  context.translate(layout.gateX - 8, gateY + 48);
  context.rotate(-Math.PI / 2);
  context.fillText('NEXT-BEST SCHEDULER', 0, 0);
  context.restore();
}

function drawFabricHeading(layout) {
  context.save();
  context.fillStyle = '#7e8e86';
  context.font = '500 7px "IBM Plex Mono",monospace';
  const count = String(layout.slotCount).padStart(2, '0');
  context.fillText(`FIXED GPU FABRIC / ${count} SLOTS`, layout.gridX, 18);
  context.textAlign = 'right';
  context.fillStyle = '#2fce96';
  context.fillText('CAPACITY REUSED', layout.gridX + layout.gridWidth, 18);
  context.restore();
}

function drawCell(index, layout, now) {
  const rect = rectForSlot(index, layout);
  const first = jobs[index];
  const replacement = jobs[index + layout.slotCount];
  const firstArrival = arrivalFor(index, layout.slotCount, 0);
  const replacementArrival = first.winner || !replacement
    ? 0
    : arrivalFor(index, layout.slotCount, 1);
  const activeJob = replacementArrival > 0.92 ? replacement : first;
  const occupancy = Math.max(firstArrival, replacementArrival);
  const lowValue = !activeJob.winner && activeJob.score < 0.56;
  const pruneAmount = lowValue ? state.pruned : 0;
  const released = ease((pruneAmount - 0.42) / 0.58);
  const pulse = reducedMotion ? 0.55 :
    0.5 + Math.sin(now * 0.003 + index * 1.71) * 0.5;
  const normalAlpha = mix(1, 0.3, state.scaled);

  context.save();
  context.globalAlpha = normalAlpha;
  roundedRect(rect.x, rect.y, rect.width, rect.height, 5);
  context.fillStyle = occupancy > 0.02
    ? `rgba(47,206,150,${0.035 + occupancy * 0.08})`
    : 'rgba(247,245,240,.018)';
  context.fill();
  context.strokeStyle = occupancy > 0.02
    ? `rgba(47,206,150,${0.18 + occupancy * 0.24})`
    : 'rgba(247,245,240,.14)';
  context.lineWidth = activeJob.winner ? 1.3 : 0.7;
  context.stroke();

  if (occupancy > 0.02) {
    const barWidth = (rect.width - 10) *
      clamp(0.18 + activeJob.score * 0.62 + pulse * 0.12);
    context.globalAlpha = normalAlpha * occupancy * (1 - pruneAmount * 0.7);
    context.fillStyle = activeJob.winner ? '#2fce96' : '#6b8c7e';
    context.fillRect(rect.x + 5, rect.y + rect.height - 6, barWidth, 1);

    context.fillStyle = activeJob.winner ? '#63dfb2' : '#8e9c95';
    context.font = `500 ${layout.mobile ? 6 : 7}px "IBM Plex Mono",monospace`;
    context.fillText(
      activeJob.id.replace('EXP-', 'E'),
      rect.x + 6,
      rect.y + 12,
    );
    if (!layout.mobile || rect.width > 52) {
      context.fillStyle = '#596760';
      context.fillText(activeJob.hardware, rect.x + 6, rect.y + 23);
    }
  }

  if (pruneAmount > 0.04) {
    context.globalAlpha = normalAlpha * pruneAmount * (1 - released * 0.78);
    context.strokeStyle = '#7b8580';
    context.lineWidth = 0.8;
    context.beginPath();
    context.moveTo(rect.x + 6, rect.y + 6);
    context.lineTo(rect.x + rect.width - 6, rect.y + rect.height - 6);
    context.moveTo(rect.x + rect.width - 6, rect.y + 6);
    context.lineTo(rect.x + 6, rect.y + rect.height - 6);
    context.stroke();
  }

  if (released > 0.02) {
    context.globalAlpha = normalAlpha * released;
    roundedRect(rect.x + 2, rect.y + 2, rect.width - 4, rect.height - 4, 4);
    context.fillStyle = 'rgba(47,206,150,.075)';
    context.fill();
    context.strokeStyle = 'rgba(47,206,150,.52)';
    context.setLineDash([2, 4]);
    context.stroke();
    context.setLineDash([]);
    context.fillStyle = '#2fce96';
    context.font = `500 ${layout.mobile ? 6 : 7}px "IBM Plex Mono",monospace`;
    context.fillText('NEXT', rect.x + 6, rect.y + 13);
  }
  context.restore();

  const target = centerOf(rect);
  if (firstArrival > 0 && firstArrival < 0.985) {
    drawRoute(first, target, firstArrival, 0.86, layout);
  }
  if (replacementArrival > 0 && replacementArrival < 0.985) {
    drawRoute(replacement, target, replacementArrival, 0.74, layout);
  }
}

function drawContinuousRepacking(now, layout) {
  const activity = state.packed * (1 - state.scaled) *
    (0.35 + state.pruned * 0.35);
  if (activity < 0.02 || reducedMotion) return;

  for (let index = 0; index < (layout.mobile ? 3 : 5); index += 1) {
    const amount = (now * 0.00012 + index * 0.21) % 1;
    const slotIndex = (index * 7 + Math.floor(now / 5200)) % layout.slotCount;
    const job = jobs[layout.slotCount + slotIndex] || jobs[slotIndex];
    const target = centerOf(rectForSlot(slotIndex, layout));
    drawRoute(job, target, amount, activity * Math.sin(amount * Math.PI), layout, false);
  }
}

function drawWinnerBlock(now, layout) {
  if (state.scaled <= 0.002) return;
  const winnerSlot = winner.index % layout.slotCount;
  const origin = rectForSlot(winnerSlot, layout);
  const startColumn = Math.max(0, Math.floor(layout.columns / 2) - 1);
  const startRow = Math.max(0, Math.floor(layout.rows / 2) - 1);
  const topLeft = rectForSlot(
    startRow * layout.columns + startColumn,
    layout,
  );
  const bottomRight = rectForSlot(
    Math.min(layout.slotCount - 1, (startRow + 1) * layout.columns + startColumn + 1),
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
  context.globalAlpha = amount * 0.28;
  context.strokeStyle = '#2fce96';
  context.lineWidth = 0.8;
  for (let index = 0; index < 4; index += 1) {
    const candidate = rectForSlot((index * 5 + 3) % layout.slotCount, layout);
    context.beginPath();
    context.moveTo(candidate.x + candidate.width / 2, candidate.y + candidate.height / 2);
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
    context.fillText('EXP-0018', rect.x + 12, rect.y + 22);
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

function draw(now) {
  lastTime = now;
  context.clearRect(0, 0, width, height);
  const layout = layoutForCanvas();

  drawQueue(now, layout);
  drawScheduler(now, layout);
  drawFabricHeading(layout);
  for (let index = 0; index < layout.slotCount; index += 1) {
    drawCell(index, layout, now);
  }
  drawContinuousRepacking(now, layout);
  drawWinnerBlock(now, layout);
}

function scheduleFrame() {
  if (!animationFrame) animationFrame = requestAnimationFrame(frame);
}

function frame(now) {
  animationFrame = 0;
  draw(now);
  if (visible && !reducedMotion) scheduleFrame();
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(devicePixelRatio || 1, 2);
  width = Math.max(1, rect.width);
  height = Math.max(1, rect.height);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  scheduleFrame();
}

function updateScroll() {
  const rect = section.getBoundingClientRect();
  const distance = Math.max(1, section.offsetHeight - innerHeight);
  const rawProgress = clamp(-rect.top / distance);
  progress = reducedMotion ? 1 : rawProgress;
  state = gpuStateFor(progress);

  const opening = ease(progress / 0.13);
  const closing = ease((progress - 0.89) / 0.11);
  const baseInset = innerWidth < 900 ? 10 : 38;
  const baseRadius = innerWidth < 900 ? 19 : 26;
  const openInset = mix(baseInset, 0, opening);
  const openRadius = mix(baseRadius, 0, opening);
  const inset = mix(openInset, baseInset, closing);
  const radius = mix(openRadius, baseRadius, closing);
  stage.style.setProperty('--gpu-inset', `${inset.toFixed(2)}px`);
  stage.style.setProperty('--gpu-radius', `${radius.toFixed(2)}px`);
  stage.style.setProperty('--gpu-scan', String(state.packed * (1 - state.scaled)));

  phaseLabel.textContent = phaseCopy[state.phase];
  const insights = Math.min(
    jobs.length,
    Math.round(24 * state.intake + 24 * state.packed),
  );
  counter.textContent = `${String(insights).padStart(3, '0')} / 048 experiments resolved`;
  scheduleFrame();
}

new IntersectionObserver(entries => {
  visible = entries[0]?.isIntersecting || false;
  if (visible) scheduleFrame();
}, { rootMargin: '35% 0px' }).observe(section);

new ResizeObserver(resize).observe(canvas);
addEventListener('resize', () => {
  resize();
  updateScroll();
});
addEventListener('scroll', updateScroll, { passive: true });

window.__AUTOLAB_GPU__ = Object.freeze({
  getState() {
    return {
      progress,
      phase: state.phase,
      insights: Math.min(
        jobs.length,
        Math.round(24 * state.intake + 24 * state.packed),
      ),
      winnerId: winner.id,
      columns,
      reducedMotion,
      lastFrame: lastTime,
    };
  },
});

resize();
updateScroll();
