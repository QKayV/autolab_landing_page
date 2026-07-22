# Autolab Homepage Instrument Clarity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove prototype UI, clarify the Rebirth research instrument, increase its small type, and turn the GPU intake into a dense experiment flow that visibly converges through the scheduler.

**Architecture:** Keep the selected Rebirth HTML as the only changed page contract. Feature-detect its new status strip in the shared A3 scene so Slingshot and Loop remain valid backups. Keep GPU routing math pure in the existing GPU motion module, then consume it from the canvas renderer.

**Tech Stack:** Static HTML, CSS, browser canvas, ES modules, Node's built-in test runner.

## Global Constraints

- Apply visible changes to the selected Rebirth homepage only.
- Preserve the hero, rotating headline, island navigation, section order, interest form, onboarding console, PostHog integration, SEO, and all CTA destinations.
- Preserve all backup concept pages and shared comparison styles.
- Do not add dependencies or a new animation framework.
- Do not add fabricated performance or utilization claims.
- Do not add em dashes to visible website copy.
- Keep post-gate GPU route spines extremely faint.

---

### Task 1: Replace Prototype and Research Instrument UI

**Files:**
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-scene-v1.test.mjs`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-rebirth-v1.html`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-scene-v1.js`

**Interfaces:**
- Consumes: `stageFor(phase)` in `autolab-mog-a3-scene-v1.js`.
- Produces: `[data-research-status]` with `id="research-status"`, and a six-entry `RESEARCH_STATUS` mapping indexed by stage `0..5`.
- Preserves: `.research-metrics` and the old metric IDs as an optional fallback for backup A3 pages.

- [ ] **Step 1: Write the failing static contract test and remove contradictory Rebirth link expectations**

Add a selected-page contract that reads the Rebirth HTML and shared scene, then asserts:

```js
test('rebirth removes prototype UI and uses plain-language research cues', async () => {
  const [html, scene] = await Promise.all([
    readFile(new URL('./autolab-mog-a3-rebirth-v1.html', import.meta.url), 'utf8'),
    readFile(new URL('./autolab-mog-a3-scene-v1.js', import.meta.url), 'utf8'),
  ]);

  assert.doesNotMatch(html, /class="comparison-links"/);
  assert.doesNotMatch(html, /class="concept-label variant-label"/);
  assert.doesNotMatch(html, /experiment · lineage · ● winner/);
  assert.doesNotMatch(html, /dead ends stop · evidence remains/);
  assert.doesNotMatch(html, /id="metric-(?:a|b|best|a-label|b-label)"/);
  assert.match(html, /▸ EACH ARROW IS AN EXPERIMENT/i);
  assert.match(html, /● GREEN MARKS THE BEST RESULT/i);
  assert.match(html, /weak runs stop · every result improves the next/i);
  assert.match(html, /id="research-status"[^>]*data-research-status/);

  for (const status of [
    'SETTING THE GOAL',
    'PROPOSING EXPERIMENTS',
    'RUNNING ACROSS YOUR GPUS',
    'STOPPING WEAK RUNS EARLY',
    "USING RESULTS TO CHOOSE WHAT'S NEXT",
    'BEST CHANGE READY FOR REVIEW',
  ]) {
    assert.match(scene, new RegExp(status.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});
```

In the existing shared-scene loop, keep cross-variant link assertions for Slingshot and Loop, but assert their absence for Rebirth:

```js
if (variant === 'rebirth') {
  assert.doesNotMatch(html, /class="comparison-links"/);
} else {
  for (const linkedVariant of variants) {
    assert.match(
      html,
      new RegExp(`autolab-mog-a3-${linkedVariant}-v1\\.html#ending-preview`),
    );
  }
}
```

- [ ] **Step 2: Write the failing scene status test**

Replace the fake metric elements with `researchStatus` and expose `status()` from the harness. Assert the six status phrases at progress values that resolve to each A3 stage:

```js
test('research status follows all six plain-language stages', async () => {
  const scene = installSceneEnvironment();
  try {
    await scene.load();
    for (const [progress, expected] of [
      [0, 'SETTING THE GOAL'],
      [0.2, 'PROPOSING EXPERIMENTS'],
      [0.4, 'RUNNING ACROSS YOUR GPUS'],
      [0.6, 'STOPPING WEAK RUNS EARLY'],
      [0.8, "USING RESULTS TO CHOOSE WHAT'S NEXT"],
      [0.9, 'BEST CHANGE READY FOR REVIEW'],
    ]) {
      scene.setProgress(progress);
      scene.dispatch('scroll');
      assert.equal(scene.status(), expected);
    }
  } finally {
    scene.restore();
  }
});
```

- [ ] **Step 3: Run the focused tests and verify failure**

Run:

```bash
node --test \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-scene-v1.test.mjs
```

Expected: FAIL because the prototype chooser, cryptic legends, old metric markup, and old metric updater still exist.

- [ ] **Step 4: Replace the selected Rebirth markup**

Use this research header, legend, and status contract:

```html
<div class="research-head"><h2>Autolab / model improvement loop</h2><div class="research-progress"><i></i></div><b id="research-index">01 / 06</b></div>

<div class="semantic-legend" aria-hidden="true"><span>▸ EACH ARROW IS AN EXPERIMENT</span><span>● GREEN MARKS THE BEST RESULT</span></div>

<aside class="research-status" aria-label="Current research step"><span><i></i>NOW</span><strong id="research-status" data-research-status>SETTING THE GOAL</strong></aside>
```

Replace the Stop key with:

```html
<span class="research-key">weak runs stop · every result improves the next</span>
```

Delete the selected page's bottom `comparison-links` nav and `concept-label variant-label` div. Keep the ending-preview anchor, flight object, and flight label.

- [ ] **Step 5: Feature-detect and update the new status strip**

Add the exact mapping and optional elements near the existing scene queries:

```js
const RESEARCH_STATUS = Object.freeze([
  'SETTING THE GOAL',
  'PROPOSING EXPERIMENTS',
  'RUNNING ACROSS YOUR GPUS',
  'STOPPING WEAK RUNS EARLY',
  "USING RESULTS TO CHOOSE WHAT'S NEXT",
  'BEST CHANGE READY FOR REVIEW',
]);
const researchStatus = run.querySelector('[data-research-status]');
const metricsPanel = run.querySelector('.research-status') ??
  run.querySelector('.research-metrics');
```

Keep the old metric queries optional for backup pages. Change `updateMetrics()` so Rebirth takes the new branch and backups retain the existing branch:

```js
function updateMetrics() {
  if (researchStatus) {
    researchStatus.textContent = RESEARCH_STATUS[stageFor(phase)];
    return;
  }

  if (progress < TIMELINE.orbit) {
    metricALabel.textContent = 'QUEUE';
    metricBLabel.textContent = 'REPO';
    metricA.textContent = 'QUEUED';
    metricB.textContent = 'MAPPED';
    metricBest.textContent = 'SEARCHING';
  } else if (progress < TIMELINE.gradient) {
    metricALabel.textContent = 'GPUS';
    metricBLabel.textContent = 'EXPERIMENTS';
    metricA.textContent = 'RUNNING';
    metricB.textContent = 'QUEUED';
    metricBest.textContent = 'SEARCHING';
  } else if (progress < TIMELINE.pressure) {
    metricALabel.textContent = 'EVAL';
    metricBLabel.textContent = 'REST';
    metricA.textContent = 'RUNNING';
    metricB.textContent = 'STOPPED';
    metricBest.textContent = 'CANDIDATE';
  } else {
    metricALabel.textContent = 'BEST';
    metricBLabel.textContent = 'CHECKS';
    metricA.textContent = 'IMPROVED';
    metricB.textContent = 'VERIFIED';
    metricBest.textContent = 'REVIEW';
  }
}
```

- [ ] **Step 6: Run focused tests and commit**

Run the command from Step 3. Expected: PASS.

```bash
git add \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-scene-v1.test.mjs \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-rebirth-v1.html \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-scene-v1.js
git commit -m "feat: clarify homepage research instrument"
```

---

### Task 2: Increase Research Instrument Legibility

**Files:**
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-core-v1.css`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-scene-v1.js`

**Interfaces:**
- Consumes: `.research-status`, `[data-research-status]`, and the simplified Rebirth header from Task 1.
- Produces: Rebirth-scoped type overrides and a three-column research header.
- Preserves: base A3 typography and four-column header behavior for backup pages.

- [ ] **Step 1: Write failing CSS and canvas-label assertions**

Add a test that reads the A3 CSS and scene and checks the scoped target sizes:

```js
test('rebirth research instrument keeps operational copy legible', async () => {
  const [css, scene] = await Promise.all([
    readFile(new URL('./autolab-mog-a3-core-v1.css', import.meta.url), 'utf8'),
    readFile(new URL('./autolab-mog-a3-scene-v1.js', import.meta.url), 'utf8'),
  ]);

  assert.match(css, /body\[data-ending="rebirth"\] \.research-head\s*\{[^}]*grid-template-columns:\s*1fr min\(250px,27vw\) 46px/s);
  assert.match(css, /body\[data-ending="rebirth"\] \.research-step p\s*\{[^}]*font-size:\s*15px/s);
  assert.match(css, /body\[data-ending="rebirth"\] \.research-key\s*\{[^}]*font-size:\s*10px/s);
  assert.match(css, /body\[data-ending="rebirth"\] \.semantic-legend\s*\{[^}]*font-size:\s*10px/s);
  assert.match(css, /body\[data-ending="rebirth"\] \.diff-metrics span\s*\{[^}]*font-size:\s*10px/s);
  assert.match(css, /\.research-status strong\s*\{[^}]*font:[^;]*1[12]px/s);
  assert.match(scene, /ending === 'rebirth' \? 10 : 7/);
});
```

- [ ] **Step 2: Run the static test and verify failure**

Run:

```bash
node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs
```

Expected: FAIL because the scoped type and status styles do not exist.

- [ ] **Step 3: Add Rebirth-scoped typography and status styles**

Add scoped overrides in `autolab-mog-a3-core-v1.css`:

```css
body[data-ending="rebirth"] .research-head {
  grid-template-columns: 1fr min(250px,27vw) 46px;
  font-size: 10px;
}
body[data-ending="rebirth"] .research-step .step { font-size: 10px; }
body[data-ending="rebirth"] .research-step p { font-size: 15px; }
body[data-ending="rebirth"] .research-key { font-size: 10px; line-height: 1.25; }
body[data-ending="rebirth"] .semantic-legend { font-size: 10px; }
body[data-ending="rebirth"] .diff-head,
body[data-ending="rebirth"] .diff-foot { font-size: 9px; }
body[data-ending="rebirth"] .diff-metrics span { font-size: 10px; }

.research-status {
  position: absolute;
  z-index: 14;
  right: clamp(24px,4.2vw,64px);
  bottom: 34px;
  width: min(520px,40vw);
  min-height: 48px;
  display: grid;
  grid-template-columns: auto minmax(0,1fr);
  align-items: center;
  gap: 18px;
  padding: 12px 15px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: rgba(252,251,247,.84);
  backdrop-filter: blur(12px);
  transition: opacity .3s;
}
.research-status > span {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--faint);
  font: 500 10px/1 "IBM Plex Mono",monospace;
  letter-spacing: .11em;
}
.research-status > span i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--mint);
  box-shadow: 0 0 12px rgba(47,206,150,.62);
}
.research-status strong {
  color: var(--mint-deep);
  font: 500 12px/1.25 "IBM Plex Mono",monospace;
  letter-spacing: .06em;
  text-align: right;
}
.research-run.is-dark .research-status {
  border-color: rgba(247,245,240,.15);
  background: rgba(7,10,8,.72);
}
.research-run.is-dark .research-status > span { color: #78827d; }
.research-run.is-dark .research-status strong { color: var(--mint); }
```

Inside the existing `max-width: 760px` media query, add:

```css
body[data-ending="rebirth"] .research-head {
  grid-template-columns: 1fr 100px 38px;
}
body[data-ending="rebirth"] .research-step p { font-size: 14px; }
body[data-ending="rebirth"] .research-status {
  right: 12px;
  bottom: 43px;
  width: calc(100% - 24px);
}
```

- [ ] **Step 4: Increase Rebirth frontier-axis labels without changing backups**

In `drawFrontierAxes()`, calculate and use a selected-page label size:

```js
const axisLabelSize = ending === 'rebirth' ? 10 : 7;
context.font = `500 ${axisLabelSize}px "IBM Plex Mono", monospace`;
const axisOffset = ending === 'rebirth' ? 22 : 18;
context.fillText('EXPERIMENT SPACE', experimentAxis.x - 90, experimentAxis.y + axisOffset);
context.fillText('EVAL MIX', evalAxis.x - 8, evalAxis.y + axisOffset);
context.fillText('PERFORMANCE', performanceAxis.x - 32, performanceAxis.y - 14);
```

- [ ] **Step 5: Run focused tests and commit**

Run the static and scene tests from Task 1. Expected: PASS.

```bash
git add \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-core-v1.css \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-scene-v1.js
git commit -m "style: improve research instrument legibility"
```

---

### Task 3: Build Dense GPU Intake Convergence

**Files:**
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-motion-v1.test.mjs`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-motion-v1.js`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-scene-v1.js`

**Interfaces:**
- Produces: `gpuIntakeConfigFor(mobile: boolean) -> { laneCount: number, arrowCount: number }`.
- Produces: `gpuIntakePointFor(amount, lane, laneCount, bounds) -> { x: number, y: number }`, where `bounds` contains `startX`, `gateX`, `gateY`, and `height`.
- Consumes: existing seeded `jobs`, `state.intake`, `state.scaled`, `drawArrow()`, and scheduler layout.

- [ ] **Step 1: Write failing density and convergence tests**

Add to `autolab-mog-gpu-motion-v1.test.mjs`:

```js
test('GPU intake uses a dense desktop field and a quieter mobile field', async () => {
  const motion = await loadMotion();
  assert.deepEqual(motion.gpuIntakeConfigFor(false), {
    laneCount: 8,
    arrowCount: 36,
  });
  assert.deepEqual(motion.gpuIntakeConfigFor(true), {
    laneCount: 6,
    arrowCount: 18,
  });
});

test('every GPU intake lane converges exactly on the scheduler gate', async () => {
  const motion = await loadMotion();
  const bounds = { startX: 14, gateX: 310, gateY: 180, height: 360 };
  const starts = Array.from({ length: 8 }, (_, lane) =>
    motion.gpuIntakePointFor(0, lane, 8, bounds));
  const ends = Array.from({ length: 8 }, (_, lane) =>
    motion.gpuIntakePointFor(1, lane, 8, bounds));

  assert.equal(new Set(starts.map(point => point.y)).size, 8);
  for (const point of ends) {
    assert.deepEqual(point, { x: 310, y: 180 });
  }
});
```

- [ ] **Step 2: Run the GPU motion tests and verify failure**

Run:

```bash
node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-motion-v1.test.mjs
```

Expected: FAIL because `gpuIntakeConfigFor` and `gpuIntakePointFor` are not exported.

- [ ] **Step 3: Implement the pure GPU intake helpers**

Add to `autolab-mog-gpu-motion-v1.js`:

```js
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
```

- [ ] **Step 4: Replace horizontal queue motion with dense converging paths**

Import both helpers into `autolab-mog-gpu-scene-v1.js`. Add a small path tracer:

```js
function traceIntake(layout, lane, laneCount, from = 0, to = 1) {
  const bounds = {
    startX: 14,
    gateX: layout.gateX,
    gateY: layout.gateY,
    height,
  };
  const steps = 20;
  const first = gpuIntakePointFor(from, lane, laneCount, bounds);
  context.beginPath();
  context.moveTo(first.x, first.y);
  for (let index = 1; index <= steps; index += 1) {
    const point = gpuIntakePointFor(
      mix(from, to, index / steps),
      lane,
      laneCount,
      bounds,
    );
    context.lineTo(point.x, point.y);
  }
}
```

Replace `drawQueue()` with the complete dense intake renderer:

```js
function drawQueue(now, layout) {
  const queueAlpha = mix(0.68, 0.16, state.scaled);
  const { laneCount, arrowCount } = gpuIntakeConfigFor(layout.mobile);
  const bounds = {
    startX: 14,
    gateX: layout.gateX,
    gateY: layout.gateY,
    height,
  };

  context.save();
  context.globalAlpha = queueAlpha * 0.08;
  context.strokeStyle = '#718078';
  context.lineWidth = 0.55;
  context.setLineDash([1, 9]);
  for (let lane = 0; lane < laneCount; lane += 1) {
    traceIntake(layout, lane, laneCount);
    context.stroke();
  }
  context.restore();

  for (let index = 0; index < arrowCount; index += 1) {
    const job = jobs[index % jobs.length];
    const lane = index % laneCount;
    const flow = reducedMotion
      ? clamp(0.18 + job.offset * 0.72)
      : (now * 0.000055 + job.offset + index / arrowCount * 0.72) % 1;
    const point = gpuIntakePointFor(flow, lane, laneCount, bounds);
    const ahead = gpuIntakePointFor(
      Math.min(1, flow + 0.012),
      lane,
      laneCount,
      bounds,
    );
    const trailStart = Math.max(0, flow - 0.09);
    const focus = 0.42 + Math.sin(flow * Math.PI) * 0.58;
    const color = job.winner ? '#2fce96' : '#81928a';

    context.save();
    context.globalAlpha = queueAlpha * focus * (0.08 + job.score * 0.08);
    context.strokeStyle = color;
    context.lineWidth = job.winner ? 1 : 0.65;
    traceIntake(layout, lane, laneCount, trailStart, flow);
    context.stroke();
    context.restore();

    drawArrow(
      point,
      Math.atan2(ahead.y - point.y, ahead.x - point.x),
      queueAlpha * focus * (0.32 + job.score * 0.38),
      color,
      job.winner ? 1.12 : 0.82,
    );
  }

  context.save();
  context.fillStyle = '#617168';
  context.font = '500 7px "IBM Plex Mono",monospace';
  context.fillText('EXPERIMENT QUEUE', 13, 18);
  context.restore();
}
```

In `drawScheduler()`, change the glow assignment to the exact bounded response below:

```js
context.shadowBlur = 16 + pulse * 12 + state.intake * 8;
```

- [ ] **Step 5: Run GPU tests and syntax checks**

Run:

```bash
node --test \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-motion-v1.test.mjs \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-scene-v1.test.mjs
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-motion-v1.js
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-scene-v1.js
```

Expected: all tests PASS and both syntax checks exit `0`.

- [ ] **Step 6: Commit**

```bash
git add \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-motion-v1.test.mjs \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-motion-v1.js \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-scene-v1.js
git commit -m "feat: converge dense experiment flow into GPUs"
```

---

### Task 4: Full Regression and Visual Verification

**Files:**
- Verify only. Modify earlier task files only if verification exposes a defect directly caused by this work.

**Interfaces:**
- Consumes: completed contracts from Tasks 1 through 3.
- Produces: a verified Rebirth homepage with no unrelated changes.

- [ ] **Step 1: Run the complete test suite**

Run:

```bash
node --test .superpowers/brainstorm/39694-1784238160/content/*.test.mjs
```

Expected: all tests PASS with zero failures.

- [ ] **Step 2: Run syntax and copy checks**

Run:

```bash
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-scene-v1.js
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-motion-v1.js
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-scene-v1.js
rg -n '—' \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-rebirth-v1.html \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-scene-v1.js
```

Expected: syntax checks exit `0`; the em-dash search returns no matches.

- [ ] **Step 3: Inspect the live page at desktop and mobile widths**

At `1440x900` and `390x844`, verify:

- no `A2 / S / R / L` chooser or A3-R concept label;
- header contains only title, progress, and step counter;
- legend contains only the two approved phrases;
- body text, keys, axes, status, and result metrics are readable without collision;
- all six status phrases fit and change at the correct scroll steps;
- roughly 36 desktop arrows enter across eight lanes and converge on the scheduler;
- post-gate arrows route to individual GPUs and GPU cells brighten cumulatively;
- guide paths stay faint and scrolling remains smooth;
- no horizontal overflow, console errors, or broken resources.

- [ ] **Step 4: Inspect reduced motion and unrelated-page boundaries**

Verify the resolved GPU scene remains understandable with reduced motion. Confirm `git diff` contains no product-page, interest-page, PostHog, SEO, or deployment files.

- [ ] **Step 5: Commit only if verification required a direct fix**

If no fix was required, do not create an empty commit. If a direct defect was fixed, stage only the affected homepage files and commit:

```bash
git commit -m "fix: polish homepage instrument clarity"
```
