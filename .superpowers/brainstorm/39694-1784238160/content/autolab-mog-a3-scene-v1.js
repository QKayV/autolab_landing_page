import {
  TIMELINE,
  clamp,
  ease,
  phaseFor,
  createExperimentBlueprints,
  poseForExperiment,
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
const resultCard = document.querySelector('#result-card');

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
  indexEl.textContent = `0${stage + 1}—06`;
}

function updateFlight(inRun) {
  const caretRect = brandCaret.getBoundingClientRect();
  launch = {
    x: caretRect.left + caretRect.width / 2,
    y: caretRect.top + caretRect.height / 2,
  };
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
  eventHorizon.style.left = `${origin.x}px`;
  eventHorizon.style.top = `${origin.y}px`;
  eventHorizon.style.opacity = String(horizonIn);
  eventHorizon.style.transform = `translate(-50%,-50%) scale(${horizonIn * horizonBreath})`;
  impactLabel.style.left = `${origin.x + (width < 760 ? 0 : 92)}px`;
  impactLabel.style.top = `${origin.y + (width < 760 ? 92 : 62)}px`;
  impactLabel.style.opacity = String(
    Math.sin(clamp((progress - 0.11) / 0.18) * Math.PI) * darkIn,
  );
}

function updateMetrics() {
  const orbitLocal = ease((progress - 0.1) / 0.24);
  metricALabel.textContent = 'ORBITING';
  metricBLabel.textContent = 'PRUNED';
  metricA.textContent = String(Math.round(mix(1, 1000, orbitLocal))).padStart(3, '0');
  metricB.textContent = '000';
  metricBest.textContent = '+0.0%';
}

function updateScroll() {
  const documentMax = document.documentElement.scrollHeight - innerHeight;
  scrollMeter.style.width = `${documentMax ? scrollY / documentMax * 100 : 0}%`;
  topbar.classList.toggle('island', scrollY > 80);

  const rect = run.getBoundingClientRect();
  const inRun = rect.top <= 0 && rect.bottom >= innerHeight;
  progress = clamp(-rect.top / Math.max(1, run.offsetHeight - innerHeight));
  phase = phaseFor(progress);
  endingProgress = ease((progress - TIMELINE.compression) / (1 - TIMELINE.compression));
  origin = { x: width * (width < 760 ? 0.55 : 0.7), y: height * (width < 760 ? 0.62 : 0.58) };
  result = { x: width * (width < 760 ? 0.5 : 0.62), y: height * (width < 760 ? 0.64 : 0.54) };

  topbar.classList.toggle('armed', rect.top < height * 0.42 && rect.top > -height * 0.08);
  updateFlight(inRun);
  updateField();
  updateStory(stageFor(phase));
  updateMetrics();
  progressEl.style.width = `${progress * 100}%`;

  pointerMode = phase === 'orbit'
    ? 'gravity'
    : ['gradient', 'pressure'].includes(phase) ? 'surface' : 'none';
  pointer.inside = inRun && pointerMode !== 'none' && pointer.x > (width < 760 ? 0 : width * 0.36);
  pointer.strength = pointer.inside && !reducedMotion ? 1 : 0;
  pointer.nx = pointer.x / width * 2 - 1;
  pointer.ny = pointer.y / height * 2 - 1;
  pointerEl.classList.toggle('visible', pointer.inside);
  pointerEl.dataset.mode = pointerMode === 'gravity' ? 'secondary gravity' : 'gradient pull';
  resultCard.style.opacity = '0';
  reticle.style.opacity = '0';
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
  let x = origin.x + pose.x * radius;
  let y = origin.y + pose.y * radius * 0.72 - pose.z * radius * 0.35;

  if (pointerMode === 'gravity' && pointer.strength) {
    const distance = Math.max(55, Math.hypot(pointer.x - x, pointer.y - y));
    const pull = clamp(150 / distance) * 0.18;
    x = mix(x, pointer.x, pull);
    y = mix(y, pointer.y, pull);
  }

  return {
    x: mix(origin.x, x, born),
    y: mix(origin.y, y, born),
    alpha: born * (0.28 + particle.blueprint.score * 0.72),
    pose,
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

  if (Math.hypot(particle.vx, particle.vy) > 0.035) {
    const desired = Math.atan2(particle.vy, particle.vx);
    const delta = ((desired - particle.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    particle.angle += delta * 0.18;
  }

  if (!reducedMotion && particle.blueprint.index % 3 === 0 && target.alpha > 0.04) {
    particle.trail.push([particle.x, particle.y]);
    if (particle.trail.length > 12) particle.trail.shift();
    context.beginPath();
    particle.trail.forEach((point, index) => {
      if (index) context.lineTo(point[0], point[1]);
      else context.moveTo(point[0], point[1]);
    });
    context.globalAlpha = target.alpha * 0.2;
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
  context.clearRect(0, 0, width, height);
  drawLaunchTrail();
  drawOrbitGuides();
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
    endingProgress,
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
  pointerEl.style.left = `${pointer.x}px`;
  pointerEl.style.top = `${pointer.y}px`;
}, { passive: true });

resize();
updateScroll();
requestAnimationFrame(frame);
