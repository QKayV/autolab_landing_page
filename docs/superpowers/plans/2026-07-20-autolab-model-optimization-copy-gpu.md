# Autolab Model Optimization Copy and GPU Efficiency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reframe the selected Rebirth preview around automated AI-model improvement, restore its rotating hero headline, and add a high-impact GPU-efficiency sequence where experiment vectors become continuously scheduled jobs.

**Architecture:** Keep the existing Rebirth singularity scene intact and update only its surrounding semantic copy. Add one small, independently testable hero-cycle module and a separate GPU timeline/render pair so the new motion does not increase the existing 1,000-line research scene's responsibility. Apply the work only to the Rebirth HTML; its comparison variants and production SEO files remain unchanged.

**Tech Stack:** Semantic HTML, CSS, Canvas 2D, browser-native ES modules, IntersectionObserver, ResizeObserver, Web Animations API, Node.js built-in test runner

## Global Constraints

- Work only on branch `codex/autolab-landing-refresh`.
- Keep the selected Rebirth direction as the primary preview.
- Preserve the floating island navigation, orbital choreography, topology transition, collapse, and Rebirth ending.
- Preserve Slingshot, Loop, A2, the original singularity, and `backup/rebirth-v1-before-orbit-telemetry`.
- Apply new visible copy and GPU motion to Rebirth only.
- Keep `index.html`, `manifesto.html`, `careers.html`, `autoresearch.html`, `robots.txt`, `sitemap.xml`, `llms.txt`, `favicon.ico`, `apple-touch-icon.png`, `logo.png`, and `og.png` unchanged from `origin/main`.
- Do not display unsupported experiment counts, utilization percentages, speedups, or customer claims.
- Reduced motion must retain the full semantic story in a stable state.
- Work block by block; the hero is the first user-review checkpoint.

## Visual Calibration

- Subject: automated model optimization for an individual researcher or enterprise ML team.
- Page job: make the input, experiment loop, compute efficiency, and reviewable output immediately legible, then route either user to onboarding or an enterprise demo.
- Palette: `Paper #F7F5F0`, `Paper High #FCFBF7`, `Ink #141414`, `Mint #2FCE96`, `Mint Deep #0C8A5F`, `Instrument #080C0A`.
- Type: IBM Plex Serif for the thesis and section claims, IBM Plex Sans for explanatory prose, IBM Plex Mono for experiment identities, state, and controls.
- Signature: the same arrow identities move from orbit to evaluated topology to a packed GPU fabric. Motion encodes product causality rather than ambient decoration.

```text
HERO                                  RESEARCH LOOP
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│ AI MODEL OPTIMIZATION, AUTOMATED│   │ goal → explore → measure       │
│ Supercharge your                │   │      → prune → verify → ship   │
│ research.             01 / 03   │   │      [existing singularity]    │
│ [Start researching] [Book demo] │   └─────────────────────────────────┘
└─────────────────────────────────┘

GPU EFFICIENCY
┌─────────────────────────────────────────────────────────────────────┐
│ More insights. Same GPUs.             queued → running → verified   │
│   ▸  ▸   ▸ ───────────────→  [GPU][GPU][GPU][GPU]                  │
│      ▸    ▸ ──────────────→  [GPU][GPU][GPU][GPU]                  │
│       pruned ×                  ╰──── winner / scaled ────╯         │
└─────────────────────────────────────────────────────────────────────┘
```

Self-critique: the palette and typography deliberately retain the current Autolab brand rather than introducing a new sci-fi skin. The distinctive choice is not neon chrome or decorative glass; it is the causal handoff from named experiments to finite GPU slots, followed by continuous repacking and a winner that earns more compute.

---

### Task 1: Restore and Looksmaxx the Hero Spinner

**Files:**
- Create: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-hero-cycle-v1.js`
- Create: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-hero-cycle-v1.test.mjs`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-rebirth-v1.html:27-36`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-core-v1.css:172-236`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs`

**Interfaces:**
- Produces: `HERO_WORDS: readonly string[]`, `heroWordFor(index: number): string`, and `initHeroCycle(root?: Document): void`.
- Produces markup hooks: `[data-hero-cycle]` and `[data-hero-cycle-index]`.
- Consumes: existing hero type tokens and the browser's `prefers-reduced-motion` preference.

- [ ] **Step 1: Write failing hero contracts**

Add a Rebirth-only static test:

```js
test('rebirth hero leads with model optimization and restores the three-part spinner', async () => {
  const html = await readFile(
    new URL('./autolab-mog-a3-rebirth-v1.html', import.meta.url),
    'utf8',
  );
  assert.match(html, /AI MODEL OPTIMIZATION, AUTOMATED\./);
  assert.match(html, /aria-label="Supercharge your research, training, and inference\."/);
  assert.match(html, /data-hero-cycle>research<\/em>/);
  assert.match(html, /Set a goal and an eval\./);
  assert.match(html, /autolab-mog-hero-cycle-v1\.js/);
  assert.doesNotMatch(html, />The autoresearch platform</i);
});
```

Create the module test with a caught initial import so a missing module is an assertion failure:

```js
import test from 'node:test';
import assert from 'node:assert/strict';

test('hero words rotate through research, training, and inference', async () => {
  let cycle = {};
  try {
    cycle = await import('./autolab-mog-hero-cycle-v1.js');
  } catch {}
  assert.deepEqual(cycle.HERO_WORDS, ['research', 'training', 'inference']);
  assert.equal(cycle.heroWordFor(0), 'research');
  assert.equal(cycle.heroWordFor(1), 'training');
  assert.equal(cycle.heroWordFor(2), 'inference');
  assert.equal(cycle.heroWordFor(3), 'research');
});
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
node --test \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-hero-cycle-v1.test.mjs \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs
```

Expected: the hero-cycle test fails because the exports do not exist, and the static test fails because the Rebirth hero still says `The autoresearch platform`.

- [ ] **Step 3: Implement the deterministic hero cycle**

Create the module:

```js
export const HERO_WORDS = Object.freeze(['research', 'training', 'inference']);

export function heroWordFor(index) {
  const normalized = ((index % HERO_WORDS.length) + HERO_WORDS.length) % HERO_WORDS.length;
  return HERO_WORDS[normalized];
}

export function initHeroCycle(root = document) {
  const word = root.querySelector('[data-hero-cycle]');
  const count = root.querySelector('[data-hero-cycle-index]');
  if (!word || !count) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0;
  word.textContent = heroWordFor(index);
  count.textContent = '01 / 03';
  if (reduced) return;

  const advance = async () => {
    await word.animate(
      [
        { opacity: 1, transform: 'translateY(0) rotateX(0deg)', filter: 'blur(0)' },
        { opacity: 0, transform: 'translateY(-42%) rotateX(26deg)', filter: 'blur(5px)' },
      ],
      { duration: 260, easing: 'cubic-bezier(.55,0,1,.45)', fill: 'forwards' },
    ).finished;
    index += 1;
    word.textContent = heroWordFor(index);
    count.textContent = `${String(index % HERO_WORDS.length + 1).padStart(2, '0')} / 03`;
    await word.animate(
      [
        { opacity: 0, transform: 'translateY(48%) rotateX(-24deg)', filter: 'blur(5px)' },
        { opacity: 1, transform: 'translateY(0) rotateX(0deg)', filter: 'blur(0)' },
      ],
      { duration: 430, easing: 'cubic-bezier(.16,.85,.16,1)', fill: 'forwards' },
    ).finished;
    setTimeout(advance, 2500);
  };

  setTimeout(advance, 2800);
}

if (typeof document !== 'undefined') initHeroCycle();
```

Update the Rebirth hero to the exact approved copy and load the module:

```html
<div class="hero-pill">AI model optimization, automated.</div>
<h1 aria-label="Supercharge your research, training, and inference.">
  <span>Supercharge your</span>
  <span class="hero-cycle-line" aria-hidden="true">
    <em data-hero-cycle>research</em><span class="hero-period">.</span>
    <small data-hero-cycle-index>01 / 03</small>
  </span>
</h1>
<p class="hero-sub">Set a goal and an eval. Autolab's agents write, run, and score thousands of experiments on your compute—then turn the winners into reviewable PRs.</p>
```

Add restrained reel styling under the current `h1` rules:

```css
.hero h1 > span:first-child { display: block; }
.hero-cycle-line {
  position: relative;
  width: max-content;
  max-width: 100%;
  min-height: 1.03em;
  display: flex;
  align-items: baseline;
  overflow: hidden;
  perspective: 600px;
}
.hero-cycle-line::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: .02em;
  height: 1px;
  background: linear-gradient(90deg,var(--mint-deep),rgba(12,138,95,0));
  transform-origin: left;
  animation: hero-cycle-progress 3.2s linear infinite;
}
.hero-cycle-line em { display: inline-block; transform-origin: 50% 100%; will-change: transform,opacity,filter; }
.hero-cycle-line small {
  align-self: flex-end;
  margin: 0 0 .58em 16px;
  color: var(--faint);
  font: 500 8px/1 "IBM Plex Mono",monospace;
  letter-spacing: .12em;
}
@keyframes hero-cycle-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
```

In reduced motion, stop the progress animation so the stable word remains `research`.

- [ ] **Step 4: Verify GREEN and render the first checkpoint**

Run:

```bash
node --test .superpowers/brainstorm/39694-1784238160/content/*.test.mjs
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-hero-cycle-v1.js
git diff --check
```

Expected: all tests pass, syntax validation exits 0, and `git diff --check` exits 0.

Inspect the hero at 1440×913 and 390×844. Confirm the reel cycles in the approved order without shifting the CTA or terminal, the page has no horizontal overflow, the accessible heading is stable, and reduced motion leaves `research` visible.

- [ ] **Step 5: Commit and request the hero checkpoint review**

```bash
git add \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-hero-cycle-v1.js \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-hero-cycle-v1.test.mjs \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-rebirth-v1.html \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-core-v1.css \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs
git commit -m "feat: restore the model optimization hero reel"
```

Stop and show the preview URL before continuing to Task 2.

---

### Task 2: Replace Singularity Copy with the Model-Improvement Loop

**Files:**
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-rebirth-v1.html:56-81`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs`

**Interfaces:**
- Preserves: six `.research-step[data-step]` articles consumed by `autolab-mog-a3-scene-v1.js`.
- Produces: the exact handoff, instrument title, ordered step labels, headlines, and explanatory bodies from the approved spec.

- [ ] **Step 1: Write a failing Rebirth narrative contract**

```js
test('rebirth names each vector and the complete model improvement loop', async () => {
  const html = await readFile(new URL('./autolab-mog-a3-rebirth-v1.html', import.meta.url), 'utf8');
  assert.match(html, /One goal\. A thousand experiments\./);
  assert.match(html, /Every vector is a real experiment\./);
  assert.match(html, /Autolab \/ model improvement loop/);
  for (const headline of [
    'Set the goal.',
    'Run a thousand experiments.',
    'Find what moves the metric.',
    "Prune what doesn't work.",
    'Verify what does.',
    'Ship the improvement.',
  ]) assert.match(html, new RegExp(headline.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.equal((html.match(/class="research-step/g) || []).length, 6);
  assert.doesNotMatch(html, /research singularity/i);
});
```

- [ ] **Step 2: Run and verify RED**

Run the static test and confirm it fails on `One goal. A thousand experiments.` while the six-step structural count remains intact.

- [ ] **Step 3: Replace only the Rebirth handoff and research copy**

Use the exact approved copy from `docs/superpowers/specs/2026-07-20-autolab-model-optimization-copy-gpu-design.md`, retaining `data-step="0"` through `data-step="5"`. Replace the instrument label with `Autolab / model improvement loop`; do not change canvas, scene timeline, metrics markup, result card, or variant files.

- [ ] **Step 4: Verify, inspect, and commit**

Run the full Node suite and `git diff --check`. In the browser, scroll through all six stages and confirm each text block activates against the visually corresponding stage without clipping at desktop or mobile widths.

```bash
git add \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-rebirth-v1.html \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs
git commit -m "copy: explain the model improvement loop"
```

---

### Task 3: Build the Experiment-to-GPU Compute Fabric

**Files:**
- Create: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-motion-v1.js`
- Create: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-motion-v1.test.mjs`
- Create: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-scene-v1.js`
- Create: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-v1.css`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-rebirth-v1.html`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs`

**Interfaces:**
- Produces: `GPU_TIMELINE`, `createGpuJobs(count, seed)`, `gpuStateFor(progress)`, and `gpuSlotFor(index, columns)` as pure exports.
- Produces markup hooks: `#gpu-efficiency`, `#gpu-canvas`, `[data-gpu-phase]`, and `[data-gpu-counter]`.
- Consumes: section-relative scroll progress in `[0,1]`, current viewport size, and `prefers-reduced-motion`.

- [ ] **Step 1: Write failing GPU timeline and static contracts**

Test deterministic identities, monotonic stages, and the stable resolved state:

```js
import test from 'node:test';
import assert from 'node:assert/strict';

test('GPU jobs are deterministic and preserve one verified winner', async () => {
  let motion = {};
  try { motion = await import('./autolab-mog-gpu-motion-v1.js'); } catch {}
  const first = motion.createGpuJobs?.(48, 0xA710AB);
  const second = motion.createGpuJobs?.(48, 0xA710AB);
  assert.deepEqual(first, second);
  assert.equal(first?.length, 48);
  assert.equal(first?.filter(job => job.winner).length, 1);
  assert.equal(new Set(first?.map(job => job.id)).size, 48);
});

test('GPU scene progresses from intake through packing to a scaled winner', async () => {
  const motion = await import('./autolab-mog-gpu-motion-v1.js');
  assert.deepEqual(motion.gpuStateFor(0), {
    intake: 0, packed: 0, pruned: 0, scaled: 0, phase: 'intake',
  });
  assert.equal(motion.gpuStateFor(0.4).phase, 'packing');
  assert.equal(motion.gpuStateFor(0.62).phase, 'pruning');
  assert.equal(motion.gpuStateFor(1).phase, 'verified');
  assert.equal(motion.gpuStateFor(1).scaled, 1);
});
```

Add a Rebirth-only static assertion for exact copy, section order, decorative canvas semantics, CSS, and script references. Assert that `gpu-efficiency` occurs after `research-run` and before `get-started`, and that the HTML contains no `% utilization` or `× throughput` claim.

- [ ] **Step 2: Run and verify RED**

Run the GPU and static tests. Confirm the failures come from the absent module and section, not from syntax or fixture errors.

- [ ] **Step 3: Implement the pure GPU timeline**

```js
export const GPU_TIMELINE = Object.freeze({ intake: 0.28, packing: 0.54, pruning: 0.72 });
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
  return { column: index % columns, row: Math.floor(index / columns) };
}

export function gpuStateFor(progress) {
  const value = clamp(progress);
  const intake = ease(value / GPU_TIMELINE.intake);
  const packed = ease((value - 0.14) / (GPU_TIMELINE.packing - 0.14));
  const pruned = ease((value - 0.46) / (GPU_TIMELINE.pruning - 0.46));
  const scaled = ease((value - 0.68) / 0.32);
  const phase = value < GPU_TIMELINE.intake ? 'intake'
    : value < GPU_TIMELINE.packing ? 'packing'
      : value < GPU_TIMELINE.pruning ? 'pruning'
        : 'verified';
  return { intake, packed, pruned, scaled, phase };
}
```

- [ ] **Step 4: Add the semantic section and isolated visual shell**

Insert after `#research-run`:

```html
<section class="gpu-efficiency" id="gpu-efficiency" data-gpu-section>
  <div class="gpu-sticky">
    <div class="gpu-copy">
      <span class="mono-label">Compute / continuously scheduled</span>
      <h2>More insights. <em>Same GPUs.</em></h2>
      <p>Autolab queues the next-most-valuable experiment the moment capacity opens. Dead ends stop consuming compute. Promising runs scale.</p>
    </div>
    <div class="gpu-instrument" aria-hidden="true">
      <div class="gpu-instrument-head"><span>autolab / compute fabric</span><span data-gpu-phase>intake</span></div>
      <canvas id="gpu-canvas"></canvas>
      <div class="gpu-instrument-foot"><span>▸ experiment</span><span>□ available GPU</span><span>■ scheduled</span><span>● verified</span><b data-gpu-counter>000 / 048 insights</b></div>
    </div>
  </div>
</section>
```

Link `autolab-mog-gpu-v1.css` in the Rebirth head and load `autolab-mog-gpu-scene-v1.js` as a module at the end of the body. Style a `300vh` section with a `100svh` sticky dark field, a quiet serif claim in the upper-left, and an instrument occupying the remaining canvas. At mobile widths, reduce to `250vh`, stack copy above the instrument, and hide secondary legend items. Keep the canvas clipped inside the viewport at every width.

- [ ] **Step 5: Implement the scroll-driven Canvas renderer**

In `autolab-mog-gpu-scene-v1.js`:

- Import `createGpuJobs`, `gpuSlotFor`, and `gpuStateFor`.
- Build 48 deterministic job identities once.
- Derive section progress from `(scrollY - section.offsetTop) / (section.offsetHeight - innerHeight)`.
- Resize the canvas at `min(devicePixelRatio, 2)` and recalculate an eight-column desktop or four-column mobile fabric.
- Draw faint, labeled GPU cells first.
- During intake, draw the jobs as the same arrow glyph used in the research canvas, fanning from the upper-left result origin toward their assigned slots.
- During packing, settle jobs into cells, flash a one-pixel mint occupancy edge, and immediately launch replacement arrows from the queue when a cycle completes.
- During pruning, cross out low-score jobs and release those cells while stronger jobs repack into them.
- During verification, join a centered `2×2` block around the winner, draw its lineage in mint, and label it `EXP-0018 / VERIFIED / SCALE 4×H100`.
- Update only the phase and insight-count text in the DOM; keep the canvas `aria-hidden`.
- Pause animation frames when IntersectionObserver reports the section offscreen.
- For reduced motion, force progress to `1` and render one stable verified frame.

The animation loop must expose `window.__AUTOLAB_GPU__.getState()` with `{ progress, phase, insights, winnerId, columns, reducedMotion }` for browser verification.

- [ ] **Step 6: Verify, inspect, and commit**

Run GPU-focused tests, the full Node suite, syntax checks for both new modules, and `git diff --check`. Browser-inspect at 1440×913 and 390×844 while sampling each phase. Confirm arrows land inside their target cells, no job changes identity, the winner block is readable, the insight count changes without fabricated utilization claims, and offscreen animation pauses.

```bash
git add \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-motion-v1.js \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-motion-v1.test.mjs \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-scene-v1.js \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-v1.css \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-rebirth-v1.html \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs
git commit -m "feat: turn experiments into a live GPU fabric"
```

---

### Task 3A: Apply GPU Routing Feedback

**Files:**
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-rebirth-v1.html`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-motion-v1.js`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-scene-v1.js`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-v1.css`
- Modify: the corresponding motion and static contract tests.

- [x] Remove the full `One goal. A thousand experiments.` interstitial from Rebirth.
- [x] Replace the dense slot grid with twelve legible GPUs receiving four experiments each.
- [x] Draw faint route guides, brighter active trails, per-GPU `FLOW n/4` states, and cumulative mint luminance.
- [x] Ease rendered progress toward scroll position and replace layout-changing stage insets with transform-only opening and closing.
- [x] Verify that scroll causes zero canvas resizes and inspect desktop and mobile phases in Chrome.

---

### Task 4: Tighten Onboarding and Closing Copy

**Files:**
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-rebirth-v1.html:104-131`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs`

**Interfaces:**
- Preserves: `#get-started`, the existing tablist/panels and commands, demo destination, and `Run Autolab` → `#get-started`.
- Produces: exact approved onboarding and close copy.

- [ ] **Step 1: Write a failing conversion-copy contract**

Assert exact eyebrow, headline, support, and close phrases, plus both CTA fragment destinations. Assert the CLI, Claude Code, and Codex commands remain byte-for-byte present.

- [ ] **Step 2: Run and verify RED**

Run the static test and confirm it fails on the new copy while all existing onboarding semantics still pass.

- [ ] **Step 3: Apply only the approved copy**

Use:

```html
<span class="mono-label eyebrow-mint">From install to first run</span>
<h2>Start this <em>afternoon.</em></h2>
<p>Install Autolab, point it at the eval that matters, and start your first run. Use the CLI, Claude Code, or Codex.</p>
```

and:

```html
<span class="mono-label eyebrow-mint">Research at machine scale</span>
<h2>One researcher. <em>A lab's worth of progress.</em></h2>
<p>Every experiment stays reproducible. Every winning change stays reviewable. You decide what merges.</p>
```

Do not change the console structure, commands, or targets.

- [ ] **Step 4: Verify, inspect, and commit**

Run the full suite, click every tab, click hero and footer onboarding links, and confirm each arrives with `#get-started` aligned at the viewport top. Commit only the Rebirth HTML and static test.

---

### Task 5: Final Cross-Viewport and Preservation Audit

**Files:**
- Modify only files already in scope if verification reveals a direct regression.

**Interfaces:**
- Consumes: `window.__AUTOLAB_A3__.getState()` and `window.__AUTOLAB_GPU__.getState()`.
- Produces: verified preview URL and a clean, reviewable branch state.

- [ ] **Step 1: Run complete automated verification**

```bash
node --test .superpowers/brainstorm/39694-1784238160/content/*.test.mjs
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-motion-v1.js
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-scene-v1.js
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-hero-cycle-v1.js
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-motion-v1.js
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-scene-v1.js
git diff --check
```

Expected: zero test failures, every syntax check exits 0, and no whitespace errors.

- [ ] **Step 2: Audit the complete browser journey**

At 1440×913 and 390×844, inspect the initial header, hero reel, handoff, all six research stages, Rebirth resolution, GPU intake/packing/pruning/verified stages, onboarding tabs, and close. Confirm no horizontal overflow, console error, console warning, missing resource, clipped copy, unreadable contrast, or layout jump.

- [ ] **Step 3: Audit reduced motion**

Emulate `prefers-reduced-motion: reduce`. Confirm the hero remains on `research`, the existing research scene is semantically usable, and the GPU section renders its stable resolved state without requiring motion.

- [ ] **Step 4: Prove SEO preservation**

```bash
git diff origin/main -- \
  index.html manifesto.html careers.html autoresearch.html \
  robots.txt sitemap.xml llms.txt favicon.ico apple-touch-icon.png \
  logo.png og.png
```

Expected: no output.

- [ ] **Step 5: Record the final preview**

Serve the brainstorm content directory, open `autolab-mog-a3-rebirth-v1.html`, and provide the cache-busted preview URL together with the test count and relevant commit IDs.
