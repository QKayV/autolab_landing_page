import {
  TIMELINE,
  clamp,
  ease,
  phaseFor,
  createExperimentBlueprints,
  surfaceHeight,
  surfaceGradient,
  surfaceAlignmentFor,
  poseForExperiment,
  endingPose,
  navigationTelemetryFor,
} from './autolab-mog-a3-motion-v1.js';

const ending = document.body.dataset.ending;
if (!['slingshot', 'rebirth', 'loop'].includes(ending)) {
  throw new TypeError(`Unknown A3 ending: ${ending}`);
}

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const run = document.querySelector('#research-run');
const sticky = run.querySelector('.research-sticky');
const canvas = document.querySelector('#research-canvas');
const context = canvas.getContext('2d');
const topbar = document.querySelector('#topbar');
const brandCaret = document.querySelector('#brand-caret');
const flight = document.querySelector('#flight-object');
const flightHead = flight.querySelector('.flight-head');
const flightLabel = document.querySelector('.flight-label');
const darkField = run.querySelector('.dark-field');
const darkGrid = run.querySelector('.dark-grid');
const lightReturn = run.querySelector('.light-return');
const returnGrid = run.querySelector('.return-grid');
const eventHorizon = document.querySelector('#event-horizon');
const impactLabel = run.querySelector('.impact-label');
const reticle = run.querySelector('.compression-reticle');
const pointerEl = run.querySelector('.gravity-pointer');
const storySteps = [...run.querySelectorAll('.research-step')];
const progressEl = run.querySelector('.research-progress i');
const indexEl = document.querySelector('#research-index');
const scrollMeter = document.querySelector('.scroll-meter');
const metricA = document.querySelector('#metric-a');
const metricB = document.querySelector('#metric-b');
const metricBest = document.querySelector('#metric-best');
const metricALabel = document.querySelector('#metric-a-label');
const metricBLabel = document.querySelector('#metric-b-label');
const navStatus = topbar.querySelector('.nav-status');
const navStatusCopy = navStatus.querySelector('.nav-status-copy');
const resultCard = document.querySelector('#result-card');
const slingshotTear = document.querySelector('#slingshot-tear');
const rebirthSeed = run.querySelector('.rebirth-seed');
const loopPath = run.querySelector('.loop-path');
const loopScan = run.querySelector('.loop-scan');
const metricsPanel = run.querySelector('.research-metrics');

let width = innerWidth;
let height = innerHeight;
let pixelRatio = 1;
let progress = 0;
let phase = 'release';
let stage = 0;
let dark = false;
let caretDetached = false;
let pointerMode = 'none';
let endingProgress = 0;
let variantState = {};
let launch = { x: 0, y: 0 };
let origin = { x: width * 0.7, y: height * 0.58 };
let result = { x: width * 0.62, y: height * 0.54 };
const pointer = {
  x: width * 0.72,
  y: height * 0.55,
  nx: 0,
  ny: 0,
  strength: 0,
  inside: false,
  moved: false,
};

const experimentCount = innerWidth < 760 ? 112 : 240;
const blueprints = createExperimentBlueprints(experimentCount, 0xA3701AB);
const populationKey = blueprints.map(experiment => experiment.id).join('|');
const particles = blueprints.map(blueprint => ({
  blueprint,
  x: origin.x,
  y: origin.y,
  vx: 0,
  vy: 0,
  angle: 0,
  trail: [],
}));

const mix = (from, to, amount) => from + (to - from) * amount;

function resize() {
  width = innerWidth;
  height = innerHeight;
  pixelRatio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function cubicBezier(amount, p0, p1, p2, p3) {
  const inverse = 1 - amount;
  return {
    x:
      inverse ** 3 * p0.x +
      3 * inverse ** 2 * amount * p1.x +
      3 * inverse * amount ** 2 * p2.x +
      amount ** 3 * p3.x,
    y:
      inverse ** 3 * p0.y +
      3 * inverse ** 2 * amount * p1.y +
      3 * inverse * amount ** 2 * p2.y +
      amount ** 3 * p3.y,
  };
}

function launchPath(amount) {
  const mobile = width < 760;
  return cubicBezier(
    amount,
    launch,
    { x: launch.x + (mobile ? 22 : 66), y: launch.y + height * 0.2 },
    { x: origin.x - (mobile ? 72 : 240), y: origin.y - height * 0.16 },
    origin,
  );
}

function frontierAmount() {
  return ease(
    (progress - TIMELINE.orbit) / (TIMELINE.gradient - TIMELINE.orbit),
  );
}

function frontierCamera() {
  const amount = frontierAmount();
  const pressure = ease(
    (progress - TIMELINE.gradient) / (TIMELINE.pressure - TIMELINE.gradient),
  );
  return {
    zoom: 0.78 + amount * 0.34 - pressure * 0.08,
    yaw: -0.2 + amount * 0.28 + (pointer.inside ? pointer.nx * 0.07 : 0),
  };
}

function projectFrontier(u, v, z) {
  const camera = frontierCamera();
  const scale = Math.min(width, height) * (width < 760 ? 0.34 : 0.36) * camera.zoom;
  const cosine = Math.cos(camera.yaw);
  const sine = Math.sin(camera.yaw);
  const rotatedU = u * cosine - v * sine;
  const rotatedV = u * sine + v * cosine;
  return {
    x: origin.x + (rotatedU - rotatedV) * scale * 0.65,
    y: origin.y + (rotatedU + rotatedV) * scale * 0.25 - z * scale * 0.64,
  };
}

function projectedSurfaceAngle(blueprint) {
  const surfacePointer = {
    x: pointer.nx,
    y: pointer.ny,
    strength: pointer.strength,
  };
  const gradient = surfaceGradient(
    blueprint.u,
    blueprint.v,
    surfacePointer,
  );
  const height = surfaceHeight(
    blueprint.u,
    blueprint.v,
    surfacePointer,
  ) + blueprint.score * 0.08;
  const step = 0.08;
  const aheadU = blueprint.u + gradient.u * step;
  const aheadV = blueprint.v + gradient.v * step;
  const aheadHeight = surfaceHeight(aheadU, aheadV, surfacePointer) +
    blueprint.score * 0.08;
  const point = projectFrontier(blueprint.u, blueprint.v, height);
  const ahead = projectFrontier(aheadU, aheadV, aheadHeight);
  return Math.atan2(ahead.y - point.y, ahead.x - point.x);
}

function slingshotPath(amount) {
  return cubicBezier(
    amount,
    origin,
    { x: width * 1.06, y: height * 0.1 },
    { x: width * 0.93, y: height * 0.72 },
    result,
  );
}

function currentVariantState() {
  const winner = blueprints.find(experiment => experiment.winner);
  return endingPose(ending, winner, endingProgress, { origin, launch, result });
}

function resolveResult(amount, rotation = -4) {
  const resolved = amount > 0.985 ? 1 : amount;
  const inset = mix(49, 0, resolved);
  const horizontalShift = width < 760 ? '0' : '-50%';
  resultCard.style.opacity = String(resolved);
  resultCard.style.transform = `translate(${horizontalShift},-50%) scale(${mix(0.06, 1, resolved)}) rotate(${mix(rotation, 0, resolved)}deg)`;
  resultCard.style.clipPath = `inset(${inset}% ${inset}% ${inset}% ${inset}%)`;
  resultCard.classList.toggle('ready', resolved === 1);
  metricsPanel.style.opacity = String(1 - resolved);
}

function setCaretDetached(detached) {
  caretDetached = detached;
  topbar.classList.toggle('detached', detached);
}

function updateEndingLayers() {
  variantState = currentVariantState();
  slingshotTear.style.opacity = '0';
  slingshotTear.style.clipPath = 'polygon(100% 45%,100% 45%,0 92%,0 92%)';
  rebirthSeed.style.opacity = '0';
  loopPath.style.opacity = '0';
  loopScan.style.opacity = '0';
  lightReturn.style.clipPath = `circle(0 at ${result.x}px ${result.y}px)`;
  returnGrid.style.opacity = '0';
  topbar.classList.remove('reattached');
  run.classList.remove('ending-light-story');
  resolveResult(0);

  if (phase !== 'ending') return;

  pointer.inside = false;
  pointer.strength = 0;
  pointerEl.classList.remove('visible');
  const horizonFade = ease((endingProgress - 0.04) / 0.38);
  eventHorizon.style.opacity = String(1 - horizonFade);

  if (ending === 'slingshot') {
    const tear = variantState.tear;
    slingshotTear.style.opacity = String(tear > 0 ? 1 : 0);
    slingshotTear.style.clipPath = `polygon(100% ${mix(45, 0, tear)}%,100% ${mix(45, 100, tear)}%,0 ${mix(92, 100, tear)}%,0 ${mix(92, 0, tear)}%)`;
    run.classList.toggle('ending-light-story', tear > 0.42);
    returnGrid.style.opacity = String(variantState.light * 0.7);
    dark = variantState.light < 0.72;
    run.classList.toggle('is-dark', dark);
    resolveResult(variantState.unfold);
    if (variantState.unfold > 0.98) setCaretDetached(false);
    return;
  }

  if (ending === 'rebirth') {
    const position = variantState.position;
    const pulseWave = Math.sin(clamp((endingProgress - 0.27) / 0.52) * Math.PI);
    rebirthSeed.style.left = `${position.x}px`;
    rebirthSeed.style.top = `${position.y}px`;
    rebirthSeed.style.opacity = String(variantState.seed * (1 - variantState.unfold * 0.82));
    rebirthSeed.style.transform = `translate(-50%,-50%) scale(${mix(0.18, 1.2, variantState.seed) * mix(1, 0.72, variantState.unfold)})`;
    rebirthSeed.style.setProperty('--pulse-a', String(1 + pulseWave * 8));
    rebirthSeed.style.setProperty('--pulse-b', String(1 + pulseWave * 14));
    rebirthSeed.style.setProperty('--pulse-opacity', String(pulseWave * 0.72));
    lightReturn.style.clipPath = `circle(${variantState.light * 160}vmax at ${position.x}px ${position.y}px)`;
    returnGrid.style.opacity = String(variantState.light * 0.68);
    dark = variantState.light < 0.42;
    run.classList.toggle('is-dark', dark);
    resolveResult(variantState.unfold, 0);
    if (variantState.unfold > 0.98) setCaretDetached(false);
    return;
  }

  updateLoopPathGeometry();
  loopPath.style.opacity = String(Math.sin(clamp(endingProgress / 0.72) * Math.PI) * 0.82);
  loopPath.querySelector('path').style.strokeDashoffset = String((1 - variantState.flight) * 86);
  loopScan.style.top = `${variantState.scan * 100}%`;
  loopScan.style.opacity = String(Math.sin(variantState.scan * Math.PI) * 0.88);
  lightReturn.style.clipPath = `inset(0 0 ${(1 - variantState.scan) * 100}% 0)`;
  returnGrid.style.opacity = String(variantState.scan * 0.66);
  dark = variantState.scan < 0.44;
  run.classList.toggle('is-dark', dark);
  resolveResult(variantState.unfold, -1.5);
  if (variantState.reattach > 0.52) {
    setCaretDetached(false);
    topbar.classList.add('reattached');
  }
}

function stageFor(currentPhase) {
  return ['release', 'orbit', 'gradient', 'pressure', 'compression', 'ending']
    .indexOf(currentPhase);
}

function updateStory(nextStage) {
  if (stage === nextStage) return;
  stage = nextStage;
  run.dataset.stage = String(stage);
  storySteps.forEach((step, index) => {
    step.classList.toggle('active', index === stage);
  });
  indexEl.textContent = `0${stage + 1} / 06`;
}

function syncLaunchPoint() {
  const caretRect = brandCaret.getBoundingClientRect();
  launch = {
    x: caretRect.left + caretRect.width / 2,
    y: caretRect.top + caretRect.height / 2,
  };
  return caretRect;
}

function updateLoopPathGeometry() {
  const mobile = width < 760;
  const firstControl = {
    x: launch.x + (mobile ? 22 : 66),
    y: launch.y + height * 0.2,
  };
  const secondControl = {
    x: origin.x - (mobile ? 72 : 240),
    y: origin.y - height * 0.16,
  };
  loopPath.setAttribute('viewBox', `0 0 ${width} ${height}`);
  loopPath.querySelector('path').setAttribute(
    'd',
    `M ${origin.x} ${origin.y} C ${secondControl.x} ${secondControl.y} ${firstControl.x} ${firstControl.y} ${launch.x} ${launch.y}`,
  );
}

function updateFlight(inRun) {
  const caretRect = syncLaunchPoint();
  const local = clamp(progress / TIMELINE.release);
  const eased = ease(local);
  const point = launchPath(eased);
  const ahead = launchPath(ease(clamp(local + 0.012)));
  const pathAngle = Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180 / Math.PI;
  const morph = clamp((local - 0.08) / 0.48);
  const active = inRun && progress > 0.001 && progress < TIMELINE.release + 0.006;

  caretDetached = inRun && progress > 0.001 && progress < 0.985;
  topbar.classList.toggle('detached', caretDetached);
  flight.style.left = `${point.x}px`;
  flight.style.top = `${point.y}px`;
  flight.style.width = `${mix(caretRect.width || 11, 42, morph)}px`;
  flight.style.height = `${mix(caretRect.height || 22, 3, morph)}px`;
  flight.style.transform = `translate(-50%,-50%) rotate(${mix(0, pathAngle, morph)}deg)`;
  flight.style.opacity = active && !reducedMotion ? String(clamp((1 - local) / 0.045)) : '0';
  flightHead.style.opacity = String(morph);
  flightLabel.style.left = `${point.x + 18}px`;
  flightLabel.style.top = `${point.y + 16}px`;
  flightLabel.style.opacity = active
    ? String(Math.sin(clamp((local - 0.1) / 0.82) * Math.PI) * 0.82)
    : '0';
}

function updateField() {
  const darkIn = ease((progress - 0.105) / 0.14);
  const radius = mix(0, 150, darkIn);
  const surfaceAmount = ease(
    (progress - TIMELINE.orbit) / (TIMELINE.gradient - TIMELINE.orbit),
  );
  const compression = ease(
    (progress - TIMELINE.pressure) / (TIMELINE.compression - TIMELINE.pressure),
  );
  dark = darkIn > 0.28;
  run.classList.toggle('is-dark', dark);
  sticky.style.setProperty('--origin-x', `${origin.x}px`);
  sticky.style.setProperty('--origin-y', `${origin.y}px`);
  sticky.style.setProperty('--result-x', `${result.x}px`);
  sticky.style.setProperty('--result-y', `${result.y}px`);
  darkField.style.clipPath = `circle(${radius}vmax at ${origin.x}px ${origin.y}px)`;
  darkGrid.style.opacity = String(darkIn * 0.82);
  lightReturn.style.clipPath = `circle(0 at ${result.x}px ${result.y}px)`;
  returnGrid.style.opacity = '0';

  const horizonIn = ease((progress - 0.105) / 0.1);
  const horizonBreath = 1 + Math.sin(performance.now() * 0.002) * 0.045;
  const horizonScale = (1 - surfaceAmount * 0.34 + compression * 0.92) * horizonBreath;
  eventHorizon.style.left = `${origin.x}px`;
  eventHorizon.style.top = `${origin.y}px`;
  eventHorizon.style.opacity = String(horizonIn);
  eventHorizon.style.transform = `translate(-50%,-50%) scale(${horizonIn * horizonScale})`;
  impactLabel.style.left = `${origin.x + (width < 760 ? 0 : 92)}px`;
  impactLabel.style.top = `${origin.y + (width < 760 ? 92 : 62)}px`;
  impactLabel.style.opacity = String(
    Math.sin(clamp((progress - 0.11) / 0.18) * Math.PI) * darkIn,
  );
}

function updateMetrics() {
  const orbitLocal = ease((progress - 0.1) / 0.24);
  const surfaceLocal = ease(
    (progress - TIMELINE.orbit) / (TIMELINE.gradient - TIMELINE.orbit),
  );
  const pressureLocal = ease(
    (progress - TIMELINE.gradient) / (TIMELINE.pressure - TIMELINE.gradient),
  );
  const compressionLocal = ease(
    (progress - TIMELINE.pressure) / (TIMELINE.compression - TIMELINE.pressure),
  );

  if (progress < TIMELINE.orbit) {
    metricALabel.textContent = 'ORBITING';
    metricBLabel.textContent = 'PRUNED';
    metricA.textContent = String(Math.round(mix(1, 1000, orbitLocal))).padStart(3, '0');
    metricB.textContent = '000';
  } else if (progress < TIMELINE.gradient) {
    metricALabel.textContent = 'EXPERIMENTS';
    metricBLabel.textContent = 'FRONTIER';
    metricA.textContent = '1,000';
    metricB.textContent = String(Math.round(mix(1, 17, surfaceLocal))).padStart(2, '0');
  } else if (progress < TIMELINE.pressure) {
    const pruned = Math.round(742 * pressureLocal);
    metricALabel.textContent = 'ACTIVE';
    metricBLabel.textContent = 'PRUNED';
    metricA.textContent = String(1000 - pruned);
    metricB.textContent = String(pruned).padStart(3, '0');
  } else {
    metricALabel.textContent = 'SURVIVORS';
    metricBLabel.textContent = 'COLLAPSED';
    metricA.textContent = String(Math.max(1, Math.round(mix(258, 1, compressionLocal))));
    metricB.textContent = String(Math.min(999, Math.round(mix(742, 999, compressionLocal))));
  }

  metricBest.textContent = `+${mix(0, 2.3, ease((progress - 0.38) / 0.38)).toFixed(1)}%`;
}

function updateNavigationTelemetry() {
  const telemetry = navigationTelemetryFor(progress);
  topbar.classList.toggle('has-telemetry', telemetry.visible);
  navStatus.classList.toggle('is-live', telemetry.visible);
  navStatus.setAttribute('aria-hidden', String(!telemetry.visible));
  navStatusCopy.textContent = telemetry.text;
}

function updatePointer() {
  const rect = run.getBoundingClientRect();
  const inRun = rect.top <= 0 && rect.bottom >= innerHeight;
  pointerMode = phase === 'orbit'
    ? 'gravity'
    : ['gradient', 'pressure'].includes(phase) ? 'surface' : 'none';
  pointer.inside = pointer.moved && inRun && pointerMode !== 'none' &&
    pointer.x > (width < 760 ? 0 : width * 0.36);
  pointer.strength = pointer.inside && !reducedMotion ? 1 : 0;
  pointer.nx = pointer.x / width * 2 - 1;
  pointer.ny = pointer.y / height * 2 - 1;
  pointerEl.classList.toggle('visible', pointer.inside);
  pointerEl.dataset.mode = pointerMode === 'gravity' ? 'secondary gravity' : 'gradient pull';
}

function updateScroll() {
  const documentMax = document.documentElement.scrollHeight - innerHeight;
  scrollMeter.style.width = `${documentMax ? scrollY / documentMax * 100 : 0}%`;
  topbar.classList.toggle('island', scrollY > 80);

  const rect = run.getBoundingClientRect();
  const inRun = rect.top <= 0 && rect.bottom >= innerHeight;
  progress = clamp(-rect.top / Math.max(1, run.offsetHeight - innerHeight));
  phase = phaseFor(progress);
  endingProgress = clamp((progress - TIMELINE.compression) / (1 - TIMELINE.compression));
  origin = { x: width * (width < 760 ? 0.55 : 0.7), y: height * (width < 760 ? 0.62 : 0.58) };
  result = { x: width * (width < 760 ? 0.5 : 0.62), y: height * (width < 760 ? 0.64 : 0.54) };

  topbar.classList.toggle('armed', rect.top < height * 0.42 && rect.top > -height * 0.08);
  updateFlight(inRun);
  updateField();
  updateStory(stageFor(phase));
  updateMetrics();
  updateNavigationTelemetry();
  progressEl.style.width = `${progress * 100}%`;

  updatePointer();
  const compression = ease(
    (progress - TIMELINE.pressure) / (TIMELINE.compression - TIMELINE.pressure),
  );
  reticle.style.left = `${origin.x}px`;
  reticle.style.top = `${origin.y}px`;
  reticle.style.opacity = String(Math.sin(compression * Math.PI) * 0.9);
  reticle.style.transform = `translate(-50%,-50%) scale(${mix(2.2, 0.22, compression)}) rotate(${compression * 190}deg)`;
  updateEndingLayers();
}

function drawArrow(particle, alpha, color, scale = 1) {
  const length = (particle.blueprint.winner ? 10 : 5.5) * scale;
  context.save();
  context.translate(particle.x, particle.y);
  context.rotate(particle.angle);
  context.globalAlpha = alpha;
  context.strokeStyle = color;
  context.lineWidth = particle.blueprint.winner ? 1.8 : 0.9;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.beginPath();
  context.moveTo(-length * 1.9, 0);
  context.lineTo(0, 0);
  context.stroke();
  context.beginPath();
  context.moveTo(-length * 0.68, -length * 0.46);
  context.lineTo(0, 0);
  context.lineTo(-length * 0.68, length * 0.46);
  context.stroke();
  context.restore();
}

function drawLaunchTrail() {
  if (progress <= 0.001 || progress > 0.19) return;
  const local = ease(clamp(progress / TIMELINE.release));
  context.save();
  context.beginPath();
  for (let index = 0; index <= 32; index += 1) {
    const point = launchPath(local * index / 32);
    if (index) context.lineTo(point.x, point.y);
    else context.moveTo(point.x, point.y);
  }
  context.strokeStyle = '#2fce96';
  context.lineWidth = 1.1;
  context.globalAlpha = clamp(1 - progress / 0.19) * 0.44;
  context.setLineDash([2, 7]);
  context.stroke();
  context.restore();
}

function drawIgnitionBurst() {
  const local = clamp((progress - 0.105) / 0.19);
  if (local <= 0 || local >= 1) return;
  const amount = ease(local);
  context.save();
  context.translate(origin.x, origin.y);
  context.globalAlpha = Math.sin(local * Math.PI) * 0.82;
  for (let index = 0; index < 38; index += 1) {
    const angle = index / 38 * Math.PI * 2 + (index % 4) * 0.07;
    const radius = amount * (42 + index % 9 * 18);
    const length = 5 + index % 6 * 2.4;
    context.strokeStyle = index % 5 === 0 ? '#f7f5f0' : '#2fce96';
    context.lineWidth = index % 7 === 0 ? 1.5 : 0.75;
    context.beginPath();
    context.moveTo(Math.cos(angle) * (radius - length), Math.sin(angle) * (radius - length));
    context.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    context.stroke();
  }
  context.restore();
}

function drawOrbitGuides() {
  if (progress < 0.12 || progress > 0.54) return;
  const alpha = ease((progress - 0.12) / 0.12) * (1 - ease((progress - 0.42) / 0.12));
  context.save();
  context.translate(origin.x, origin.y);
  context.globalAlpha = alpha * 0.34;
  for (let index = 0; index < 8; index += 1) {
    const radius = 48 + index * Math.min(width, height) * 0.048;
    context.beginPath();
    context.ellipse(0, 0, radius, radius * (0.24 + index % 3 * 0.11), index * 0.19 - 0.54, 0, Math.PI * 2);
    context.strokeStyle = index % 3 === 0 ? '#2fce96' : '#7d9389';
    context.lineWidth = index % 3 === 0 ? 1 : 0.65;
    context.setLineDash(index % 2 ? [3, 8] : [1, 6]);
    context.stroke();
  }
  context.restore();
}

function drawFrontierAxes(alpha) {
  const originPoint = projectFrontier(-0.96, -0.9, 0);
  const experimentAxis = projectFrontier(1.02, -0.9, 0);
  const evalAxis = projectFrontier(-0.96, 0.96, 0);
  const performanceAxis = projectFrontier(-0.96, -0.9, 1.36);
  context.save();
  context.globalAlpha = alpha;
  context.strokeStyle = '#81968d';
  context.fillStyle = '#8ca198';
  context.lineWidth = 0.8;
  context.setLineDash([3, 7]);
  [[originPoint, experimentAxis], [originPoint, evalAxis], [originPoint, performanceAxis]]
    .forEach(([start, end]) => {
      context.beginPath();
      context.moveTo(start.x, start.y);
      context.lineTo(end.x, end.y);
      context.stroke();
    });
  context.setLineDash([]);
  context.font = '500 7px "IBM Plex Mono", monospace';
  context.letterSpacing = '0.1em';
  context.fillText('EXPERIMENT SPACE', experimentAxis.x - 66, experimentAxis.y + 18);
  context.fillText('EVAL MIX', evalAxis.x - 8, evalAxis.y + 18);
  context.fillText('PERFORMANCE', performanceAxis.x - 24, performanceAxis.y - 12);
  context.restore();
}

function drawFrontierSurface(alpha) {
  const pointerState = {
    x: pointer.nx,
    y: pointer.ny,
    strength: pointer.strength,
  };
  const rows = width < 760 ? 9 : 13;
  const columns = width < 760 ? 11 : 16;
  context.save();
  context.globalAlpha = alpha;
  context.globalCompositeOperation = 'screen';

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const u0 = -1 + column / columns * 2;
      const u1 = -1 + (column + 1) / columns * 2;
      const v0 = -1 + row / rows * 2;
      const v1 = -1 + (row + 1) / rows * 2;
      const z = surfaceHeight((u0 + u1) / 2, (v0 + v1) / 2, pointerState);
      const points = [
        projectFrontier(u0, v0, surfaceHeight(u0, v0, pointerState)),
        projectFrontier(u1, v0, surfaceHeight(u1, v0, pointerState)),
        projectFrontier(u1, v1, surfaceHeight(u1, v1, pointerState)),
        projectFrontier(u0, v1, surfaceHeight(u0, v1, pointerState)),
      ];
      context.beginPath();
      context.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach(point => context.lineTo(point.x, point.y));
      context.closePath();
      context.fillStyle = `rgba(47,206,150,${0.014 + clamp(z) * 0.042})`;
      context.fill();
    }
  }

  context.lineWidth = 0.68;
  for (let row = 0; row <= rows; row += 1) {
    context.beginPath();
    for (let column = 0; column <= columns; column += 1) {
      const u = -1 + column / columns * 2;
      const v = -1 + row / rows * 2;
      const point = projectFrontier(u, v, surfaceHeight(u, v, pointerState));
      if (column) context.lineTo(point.x, point.y);
      else context.moveTo(point.x, point.y);
    }
    context.strokeStyle = row % 3 === 0 ? 'rgba(47,206,150,.48)' : 'rgba(208,229,220,.17)';
    context.stroke();
  }
  for (let column = 0; column <= columns; column += 1) {
    context.beginPath();
    for (let row = 0; row <= rows; row += 1) {
      const u = -1 + column / columns * 2;
      const v = -1 + row / rows * 2;
      const point = projectFrontier(u, v, surfaceHeight(u, v, pointerState));
      if (row) context.lineTo(point.x, point.y);
      else context.moveTo(point.x, point.y);
    }
    context.strokeStyle = column % 4 === 0 ? 'rgba(47,206,150,.4)' : 'rgba(208,229,220,.14)';
    context.stroke();
  }

  context.lineWidth = 2.2;
  context.strokeStyle = '#2fce96';
  context.shadowColor = 'rgba(47,206,150,.68)';
  context.shadowBlur = 15;
  context.beginPath();
  for (let index = 0; index <= 34; index += 1) {
    const u = -0.92 + index / 34 * 1.84;
    const v = -0.12 + 0.16 * Math.sin(index * 0.38);
    const point = projectFrontier(
      u,
      v,
      surfaceHeight(u, v, pointerState) + 0.018,
    );
    if (index) context.lineTo(point.x, point.y);
    else context.moveTo(point.x, point.y);
  }
  context.stroke();
  context.restore();
}

function drawCompressionVortex(now) {
  const raw = clamp(
    (progress - TIMELINE.pressure) / (TIMELINE.compression - TIMELINE.pressure),
  );
  if (raw <= 0 || raw >= 1) return;
  const amount = ease(raw);
  const energy = Math.sin(raw * Math.PI);
  const outerRadius = mix(Math.min(width, height) * 0.52, 38, raw);
  const rotation = (reducedMotion ? raw * 2.4 : now * 0.00042) + amount * 2.8;
  context.save();
  context.translate(origin.x, origin.y);
  context.globalCompositeOperation = 'screen';

  const glow = context.createRadialGradient(0, 0, 2, 0, 0, outerRadius * 0.88);
  glow.addColorStop(0, `rgba(47,206,150,${energy * 0.24})`);
  glow.addColorStop(0.28, `rgba(47,206,150,${energy * 0.08})`);
  glow.addColorStop(1, 'rgba(47,206,150,0)');
  context.fillStyle = glow;
  context.beginPath();
  context.arc(0, 0, outerRadius, 0, Math.PI * 2);
  context.fill();

  for (let index = 0; index < 46; index += 1) {
    const angle = index * 2.399963 + rotation + (index % 4) * 0.04;
    const radius = outerRadius * (0.44 + index / 46 * 0.62);
    const inward = radius * (0.14 + amount * 0.07);
    context.beginPath();
    context.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.64);
    context.quadraticCurveTo(
      Math.cos(angle + 0.55) * radius * 0.58,
      Math.sin(angle + 0.55) * radius * 0.34,
      Math.cos(angle + 1.08) * inward,
      Math.sin(angle + 1.08) * inward * 0.5,
    );
    context.globalAlpha = energy * (index % 5 === 0 ? 0.62 : 0.25);
    context.strokeStyle = index % 6 === 0 ? '#f7f5f0' : '#2fce96';
    context.lineWidth = index % 7 === 0 ? 1.25 : 0.62;
    context.stroke();
  }

  for (let index = 0; index < 5; index += 1) {
    const radius = outerRadius * (0.24 + index * 0.17);
    context.beginPath();
    context.ellipse(0, 0, radius, radius * (0.18 + index * 0.028), rotation * (index % 2 ? -1 : 1) + index * 0.45, 0, Math.PI * 2);
    context.globalAlpha = energy * (0.34 - index * 0.045);
    context.strokeStyle = index % 2 ? '#80968c' : '#2fce96';
    context.lineWidth = index === 0 ? 1.4 : 0.7;
    context.setLineDash(index % 2 ? [2, 7] : []);
    context.stroke();
  }
  context.restore();
}

function drawGhostVector(point, angle, alpha, length) {
  context.save();
  context.translate(point.x, point.y);
  context.rotate(angle);
  context.globalAlpha = alpha;
  context.strokeStyle = '#2fce96';
  context.lineWidth = 1.25;
  context.shadowColor = '#2fce96';
  context.shadowBlur = 14;
  context.beginPath();
  context.moveTo(-length, 0);
  context.lineTo(0, 0);
  context.moveTo(-length * 0.34, -length * 0.22);
  context.lineTo(0, 0);
  context.lineTo(-length * 0.34, length * 0.22);
  context.stroke();
  context.restore();
}

function drawEndingEffects(now) {
  if (phase !== 'ending') return;
  context.save();
  context.globalCompositeOperation = 'screen';

  if (ending === 'slingshot') {
    context.beginPath();
    for (let index = 0; index <= 42; index += 1) {
      const point = slingshotPath(variantState.flight * index / 42);
      if (index) context.lineTo(point.x, point.y);
      else context.moveTo(point.x, point.y);
    }
    context.globalAlpha = variantState.afterimage * 0.42;
    context.strokeStyle = '#2fce96';
    context.lineWidth = 1.25;
    context.setLineDash([2, 8]);
    context.stroke();
    context.setLineDash([]);

    [0.045, 0.09, 0.145].forEach((offset, index) => {
      const amount = clamp(variantState.flight - offset);
      const point = slingshotPath(amount);
      const ahead = slingshotPath(clamp(amount + 0.008));
      drawGhostVector(
        point,
        Math.atan2(ahead.y - point.y, ahead.x - point.x),
        variantState.afterimage * (0.48 - index * 0.11),
        38 - index * 7,
      );
    });

    const shock = Math.sin(clamp((endingProgress - 0.2) / 0.56) * Math.PI);
    const impact = slingshotPath(clamp(variantState.flight));
    context.globalAlpha = shock * 0.66;
    context.strokeStyle = '#f7f5f0';
    context.lineWidth = 1;
    context.beginPath();
    context.ellipse(impact.x, impact.y, 16 + shock * 82, 5 + shock * 25, -0.65, 0, Math.PI * 2);
    context.stroke();
  } else if (ending === 'rebirth') {
    const pulse = Math.sin(clamp((endingProgress - 0.27) / 0.52) * Math.PI);
    const position = variantState.position;
    for (let index = 0; index < 5; index += 1) {
      const radius = 18 + pulse * (58 + index * 27);
      context.beginPath();
      context.arc(position.x, position.y, radius, 0, Math.PI * 2);
      context.globalAlpha = pulse * (0.44 - index * 0.065);
      context.strokeStyle = index % 2 ? '#dff5ec' : '#2fce96';
      context.lineWidth = index === 0 ? 1.4 : 0.7;
      context.setLineDash(index % 2 ? [2, 8] : []);
      context.stroke();
    }
    context.setLineDash([]);
    for (let index = 0; index < 18; index += 1) {
      const angle = index / 18 * Math.PI * 2 + (reducedMotion ? 0 : now * 0.00022);
      const inner = 10 + pulse * 18;
      const outer = inner + 5 + index % 4 * 4;
      context.globalAlpha = pulse * (index % 3 ? 0.34 : 0.68);
      context.strokeStyle = '#2fce96';
      context.beginPath();
      context.moveTo(position.x + Math.cos(angle) * inner, position.y + Math.sin(angle) * inner);
      context.lineTo(position.x + Math.cos(angle) * outer, position.y + Math.sin(angle) * outer);
      context.stroke();
    }
  } else {
    context.beginPath();
    for (let index = 0; index <= 42; index += 1) {
      const point = launchPath(1 - variantState.flight * index / 42);
      if (index) context.lineTo(point.x, point.y);
      else context.moveTo(point.x, point.y);
    }
    context.globalAlpha = Math.sin(clamp(endingProgress / 0.74) * Math.PI) * 0.58;
    context.strokeStyle = '#2fce96';
    context.lineWidth = 1;
    context.setLineDash([3, 7]);
    context.stroke();
    context.setLineDash([]);
  }
  context.restore();
}

function targetForParticle(particle, now) {
  const scene = {
    progress,
    time: now,
    pointer: { x: pointer.nx, y: pointer.ny, strength: pointer.strength },
    reducedMotion,
  };
  const pose = poseForExperiment(particle.blueprint, scene);
  const radius = Math.min(width, height) * (width < 760 ? 0.41 : 0.48);
  const born = ease((progress - 0.105) / 0.17);
  const surfaceMix = frontierAmount();
  const orbitPoint = {
    x: origin.x + pose.x * radius,
    y: origin.y + pose.y * radius * 0.72 - pose.z * radius * 0.35,
  };
  const frontierPoint = projectFrontier(pose.x, pose.y, pose.z);
  let x = mix(orbitPoint.x, frontierPoint.x, surfaceMix);
  let y = mix(orbitPoint.y, frontierPoint.y, surfaceMix);

  if (pointerMode === 'gravity' && pointer.strength) {
    const distance = Math.max(55, Math.hypot(pointer.x - x, pointer.y - y));
    const pull = clamp(150 / distance) * 0.18;
    x = mix(x, pointer.x, pull);
    y = mix(y, pointer.y, pull);
  }

  let alpha = born * (0.28 + particle.blueprint.score * 0.72) * pose.alpha;
  let endingScale = pose.scale;
  if (phase === 'ending') {
    if (!particle.blueprint.winner) {
      const disappear = ease(endingProgress / 0.2);
      x = mix(x, origin.x, disappear);
      y = mix(y, origin.y, disappear);
      alpha *= 1 - disappear;
    } else if (ending === 'slingshot') {
      const point = slingshotPath(variantState.flight);
      x = point.x;
      y = point.y;
      endingScale = mix(1.6, 2.25, variantState.afterimage);
    } else if (ending === 'rebirth') {
      x = variantState.position.x;
      y = variantState.position.y;
      alpha *= 1 - variantState.seed;
      endingScale = 1.7;
    } else {
      const point = launchPath(1 - variantState.flight);
      x = point.x;
      y = point.y;
      alpha *= 1 - variantState.reattach;
      endingScale = 1.8;
    }
  }

  const surfaceAlignment = surfaceAlignmentFor(progress);

  return {
    x: mix(origin.x, x, born),
    y: mix(origin.y, y, born),
    alpha,
    surfaceAlignment,
    surfaceAngle: surfaceAlignment > 0
      ? projectedSurfaceAngle(particle.blueprint)
      : particle.angle,
    pose: { ...pose, trail: phase === 'ending' ? 0 : pose.trail, scale: endingScale },
  };
}

function drawParticle(particle, target) {
  if (reducedMotion) {
    particle.x = target.x;
    particle.y = target.y;
    particle.vx = 0;
    particle.vy = 0;
  } else {
    particle.vx += (target.x - particle.x) * 0.033;
    particle.vy += (target.y - particle.y) * 0.033;
    particle.vx *= 0.79;
    particle.vy *= 0.79;
    particle.x += particle.vx;
    particle.y += particle.vy;
  }

  const speed = Math.hypot(particle.vx, particle.vy);
  let desired = speed > 0.035
    ? Math.atan2(particle.vy, particle.vx)
    : particle.angle;
  if (target.surfaceAlignment > 0) {
    const topologyDelta = (
      (target.surfaceAngle - desired + Math.PI * 3) % (Math.PI * 2)
    ) - Math.PI;
    desired += topologyDelta * target.surfaceAlignment;
  }
  const angleDelta = (
    (desired - particle.angle + Math.PI * 3) % (Math.PI * 2)
  ) - Math.PI;
  particle.angle += angleDelta * (0.18 + target.surfaceAlignment * 0.12);

  if (!reducedMotion && particle.blueprint.index % 3 === 0 && target.alpha > 0.04 && target.pose.trail > 0.02) {
    particle.trail.push([particle.x, particle.y]);
    if (particle.trail.length > 12) particle.trail.shift();
    context.beginPath();
    particle.trail.forEach((point, index) => {
      if (index) context.lineTo(point[0], point[1]);
      else context.moveTo(point[0], point[1]);
    });
    context.globalAlpha = target.alpha * target.pose.trail * 0.24;
    context.strokeStyle = particle.blueprint.score > 0.72 ? '#2fce96' : '#72877e';
    context.lineWidth = 0.7;
    context.stroke();
  }

  if (particle.blueprint.winner && progress > 0.28) {
    context.save();
    context.globalAlpha = target.alpha * 0.28;
    context.fillStyle = '#2fce96';
    context.shadowColor = '#2fce96';
    context.shadowBlur = 24;
    context.beginPath();
    context.arc(particle.x, particle.y, 8, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  const color = particle.blueprint.winner
    ? '#2fce96'
    : particle.blueprint.score > 0.72 ? '#66dfb3' : '#9aaba3';
  drawArrow(particle, target.alpha, color, target.pose.scale);
}

function frame(now) {
  if (ending === 'loop' && phase === 'ending') {
    syncLaunchPoint();
    updateLoopPathGeometry();
    variantState = currentVariantState();
  }
  context.clearRect(0, 0, width, height);
  drawLaunchTrail();
  drawIgnitionBurst();
  drawOrbitGuides();
  const surfaceIn = frontierAmount();
  const surfaceOut = 1 - ease(
    (progress - (TIMELINE.pressure - 0.025)) /
      (TIMELINE.compression - TIMELINE.pressure + 0.025),
  );
  if (surfaceIn > 0 && surfaceOut > 0) {
    drawFrontierAxes(surfaceIn * surfaceOut * 0.7);
    drawFrontierSurface(surfaceIn * surfaceOut);
  }
  drawCompressionVortex(now);
  drawEndingEffects(now);
  if (progress > 0.095) {
    for (const particle of particles) {
      drawParticle(particle, targetForParticle(particle, now));
    }
  }
  requestAnimationFrame(frame);
}

function getState() {
  return {
    ending,
    progress,
    phase,
    particleCount: blueprints.length,
    populationKey,
    dark,
    caretDetached,
    pointerMode,
    pointerStrength: pointer.strength,
    endingProgress,
    endingState: variantState,
    tear: variantState.tear || 0,
    seed: variantState.seed || 0,
    reattach: variantState.reattach || 0,
    scan: variantState.scan || 0,
    frontierAmount: frontierAmount(),
    prunedCount: progress < TIMELINE.gradient
      ? 0
      : Math.round(742 * ease(
        (progress - TIMELINE.gradient) / (TIMELINE.pressure - TIMELINE.gradient),
      )),
    reducedMotion,
  };
}

window.__AUTOLAB_A3__ = Object.freeze({ getState });

addEventListener('resize', () => {
  resize();
  updateScroll();
});
addEventListener('scroll', updateScroll, { passive: true });
addEventListener('pointermove', event => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.moved = true;
  pointerEl.style.left = `${pointer.x}px`;
  pointerEl.style.top = `${pointer.y}px`;
  updatePointer();
}, { passive: true });

resize();
updateScroll();
requestAnimationFrame(frame);
