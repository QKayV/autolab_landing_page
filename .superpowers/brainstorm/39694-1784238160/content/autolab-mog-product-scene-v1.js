import {
  WATCHDOG_CYCLE_MS,
  watchdogCurveAt,
  watchdogStateFor,
} from './autolab-mog-product-motion-v1.js';

const MINT = '#2fce96';
const AMBER = '#d8a447';
const PAPER = '#f7f5f0';
const MUTED = '#7e8b85';
const GRID = 'rgba(47,206,150,.12)';

function initWatchdogScene() {
  const feature = document.querySelector('.watchdog-feature');
  const canvas = document.querySelector('#watchdog-canvas');
  if (!feature || !canvas) return;

  const context = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 1;
  let height = 1;
  let progress = reducedMotion ? 1 : 0;
  let state = watchdogStateFor(progress);
  let visible = false;
  let resizeCount = 0;
  let lastFrame = 0;
  let frameId = 0;
  let cycleStarted = performance.now();

  function resize() {
    width = Math.max(1, Math.round(canvas.offsetWidth));
    height = Math.max(1, Math.round(canvas.offsetHeight));
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(width * ratio);
    const pixelHeight = Math.round(height * ratio);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      resizeCount += 1;
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw(performance.now());
  }

  function label(text, x, y, color = MUTED, align = 'left') {
    context.fillStyle = color;
    context.font = '500 9px "IBM Plex Mono", monospace';
    context.textAlign = align;
    context.fillText(text, x, y);
  }

  function line(x1, y1, x2, y2, color, lineWidth = 1) {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.stroke();
  }

  function drawGrid(graph) {
    context.save();
    context.setLineDash([2, 7]);
    for (let index = 0; index <= 4; index += 1) {
      const x = graph.x + graph.width * index / 4;
      const y = graph.y + graph.height * index / 4;
      line(x, graph.y, x, graph.y + graph.height, GRID);
      line(graph.x, y, graph.x + graph.width, y, GRID);
    }
    context.restore();
  }

  function curvePoint(graph, x, value) {
    return {
      x: graph.x + graph.width * x,
      y: graph.y + graph.height * (.88 - value * .68),
    };
  }

  function drawOldCurve(graph) {
    if (!state.oldJobVisible) return;
    const end = Math.max(.02, state.curve);
    context.beginPath();
    for (let index = 0; index <= 80; index += 1) {
      const x = end * index / 80;
      const point = curvePoint(graph, x, watchdogCurveAt(x, progress));
      if (index === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    }
    context.strokeStyle = state.phase === 'stopped' ? 'rgba(247,245,240,.34)' : PAPER;
    context.lineWidth = 2;
    context.stroke();

    if (state.phase === 'plateau' || state.phase === 'stopped') {
      const marker = curvePoint(graph, .84, watchdogCurveAt(.84, progress));
      const pulse = state.phase === 'plateau' ? 7 + Math.sin(lastFrame / 180) * 2 : 7;
      context.beginPath();
      context.arc(marker.x, marker.y, pulse, 0, Math.PI * 2);
      context.strokeStyle = AMBER;
      context.lineWidth = 1;
      context.stroke();
      context.beginPath();
      context.arc(marker.x, marker.y, 2.5, 0, Math.PI * 2);
      context.fillStyle = AMBER;
      context.fill();
    }

    if (state.phase === 'stopped') {
      const marker = curvePoint(graph, .9, watchdogCurveAt(.9, progress));
      line(marker.x - 7, marker.y - 7, marker.x + 7, marker.y + 7, AMBER, 1.5);
      line(marker.x + 7, marker.y - 7, marker.x - 7, marker.y + 7, AMBER, 1.5);
    }
  }

  function drawNextCurve(graph) {
    if (!state.nextJobVisible || state.restart <= 0) return;
    context.beginPath();
    for (let index = 0; index <= 80; index += 1) {
      const x = state.restart * index / 80;
      const value = Math.min(1, Math.pow(x, .58) * .86);
      const point = curvePoint(graph, x, value);
      if (index === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    }
    context.strokeStyle = MINT;
    context.lineWidth = 2.4;
    context.stroke();
  }

  function drawHandoff(graph, gpu) {
    if (state.phase !== 'reassigned' && state.phase !== 'running-next') return;
    const amount = state.phase === 'running-next' ? 1 : state.reassign;
    const startX = graph.x + graph.width * .22;
    const startY = graph.y - 23;
    const endX = gpu.x - 12;
    const endY = gpu.y + gpu.height / 2;
    const x = startX + (endX - startX) * amount;
    const y = startY + (endY - startY) * amount;
    line(startX, startY, x, y, 'rgba(47,206,150,.5)', 1);
    context.save();
    context.translate(x, y);
    context.rotate(Math.atan2(endY - startY, endX - startX));
    context.beginPath();
    context.moveTo(8, 0);
    context.lineTo(-5, -4);
    context.lineTo(-5, 4);
    context.closePath();
    context.fillStyle = MINT;
    context.shadowColor = MINT;
    context.shadowBlur = 14;
    context.fill();
    context.restore();
  }

  function draw(now) {
    lastFrame = now;
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#0c1210';
    context.fillRect(0, 0, width, height);

    const compact = width < 560;
    const padding = compact ? 22 : 36;
    const gpu = { x: width - padding - (compact ? 94 : 124), y: padding, width: compact ? 94 : 124, height: 52 };
    const graph = { x: padding, y: compact ? 106 : 118, width: width - padding * 2, height: height - (compact ? 148 : 166) };
    const statuses = {
      observing: 'WATCHING EXP-014',
      plateau: 'PLATEAU DETECTED',
      stopped: 'EXP-014 STOPPED',
      reassigned: 'GPU REASSIGNED',
      'running-next': 'EXP-015 / RUNNING',
    };

    label('AUTOLAB / WATCHDOG', padding, padding + 8, PAPER);
    label(statuses[state.phase], padding, padding + 34, state.phase === 'plateau' || state.phase === 'stopped' ? AMBER : MINT);
    context.strokeStyle = state.phase === 'stopped' ? AMBER : MINT;
    context.strokeRect(gpu.x, gpu.y, gpu.width, gpu.height);
    label('GPU 04', gpu.x + 12, gpu.y + 21, PAPER);
    label(state.phase === 'stopped' ? 'AVAILABLE' : state.phase === 'reassigned' ? 'ASSIGNING' : 'ACTIVE', gpu.x + 12, gpu.y + 38, state.phase === 'stopped' ? AMBER : MINT);

    drawGrid(graph);
    label('SCORE', graph.x, graph.y - 12);
    label('GPU TIME', graph.x + graph.width, graph.y + graph.height + 22, MUTED, 'right');
    drawOldCurve(graph);
    drawHandoff(graph, gpu);
    drawNextCurve(graph);
  }

  function frame(now) {
    frameId = 0;
    if (!visible || reducedMotion) return;
    progress = ((now - cycleStarted) % WATCHDOG_CYCLE_MS) / WATCHDOG_CYCLE_MS;
    state = watchdogStateFor(progress);
    draw(now);
    frameId = requestAnimationFrame(frame);
  }

  function start() {
    if (reducedMotion) {
      progress = 1;
      state = watchdogStateFor(progress);
      draw(performance.now());
      return;
    }
    if (frameId) return;
    cycleStarted = performance.now() - progress * WATCHDOG_CYCLE_MS;
    frameId = requestAnimationFrame(frame);
  }

  function stop() {
    if (!frameId) return;
    cancelAnimationFrame(frameId);
    frameId = 0;
  }

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries => {
    visible = entries[0]?.isIntersecting ?? false;
    if (visible) start();
    else stop();
  }, { rootMargin: '0px', threshold: .05 }).observe(feature);

  window.__AUTOLAB_WATCHDOG__ = Object.freeze({
    getState() {
      return {
        progress,
        phase: state.phase,
        visible,
        reducedMotion,
        resizeCount,
        lastFrame,
      };
    },
  });

  resize();
}

initWatchdogScene();
