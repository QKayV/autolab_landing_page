# Autolab Rebirth Navigation, Onboarding, and Orbit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the A3 Rebirth prototype with a geometrically centered bar-to-island navigation, later topology-heading alignment, and production-derived CLI/Claude Code/Codex onboarding.

**Architecture:** Keep the existing A3 shared-page architecture. Pure motion timing stays in `autolab-mog-a3-motion-v1.js`; the scene controller maps that state to the canvas and navigation; a new small onboarding module owns only tab selection and keyboard navigation; shared HTML and CSS provide the same shell across all three A3 endings while Rebirth remains the canonical preview.

**Tech Stack:** Semantic HTML, CSS, Canvas 2D, browser-native ES modules, Node.js `node:test`, existing companion preview server.

## Global Constraints

- Work only on `codex/autolab-landing-refresh`; do not move or rewrite `backup/rebirth-v1-before-orbit-telemetry`.
- Preserve particle positions, orbit radius, spin, pointer behavior, phase boundaries, compression, and ending trajectories.
- Preserve A1, A2, Slingshot, Loop, the original singularity, and the comparison chooser.
- Keep `index.html`, `manifesto.html`, `careers.html`, `autoresearch.html`, `robots.txt`, `sitemap.xml`, `llms.txt`, `favicon.ico`, `apple-touch-icon.png`, `logo.png`, and `og.png` identical to `origin/main`.
- Add no framework, dependency, build step, image asset, copy-to-clipboard control, analytics, or backend behavior.
- Desktop and mobile must avoid horizontal overflow; reduced motion and visible keyboard focus remain supported.

---

### Task 1: Restore Tangential Orbit Readability

**Files:**
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-motion-v1.test.mjs`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-motion-v1.js`

**Interfaces:**
- Consumes: existing `TIMELINE`, `ease(progress)`, and `surfaceAlignmentFor(progress)`.
- Produces: `surfaceAlignmentFor(progress): number`, equal to zero through progress `0.45`, easing toward one from `0.46` to `TIMELINE.gradient`, then releasing during compression.

- [ ] **Step 1: Tighten the motion regression test**

Replace the existing surface-alignment test with:

```js
test('surface headings stay tangential until experiments are mostly landed', () => {
  assert.equal(typeof motion.surfaceAlignmentFor, 'function');
  assert.equal(motion.surfaceAlignmentFor(0.2), 0);
  assert.equal(motion.surfaceAlignmentFor(TIMELINE.orbit), 0);
  assert.equal(motion.surfaceAlignmentFor(0.45), 0);
  assert.ok(motion.surfaceAlignmentFor(0.48) > 0);
  assert.ok(motion.surfaceAlignmentFor(TIMELINE.gradient) > 0.99);
  assert.ok(motion.surfaceAlignmentFor(TIMELINE.pressure) > 0.99);
  assert.equal(motion.surfaceAlignmentFor(TIMELINE.compression), 0);
});
```

- [ ] **Step 2: Run the motion test and verify RED**

Run:

```bash
node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-motion-v1.test.mjs
```

Expected: one failure because the current alignment has already started by progress `0.45`.

- [ ] **Step 3: Delay only the orientation blend**

Replace `surfaceAlignmentFor` with:

```js
export function surfaceAlignmentFor(progress) {
  const settled = ease(
    (progress - 0.46) / (TIMELINE.gradient - 0.46),
  );
  const released = ease(
    (progress - TIMELINE.pressure) /
      (TIMELINE.compression - TIMELINE.pressure),
  );
  return settled * (1 - released);
}
```

Do not change `orbitPose`, `poseForExperiment`, `frontierAmount`, or `drawParticle`.

- [ ] **Step 4: Run the complete test suite and verify GREEN**

Run:

```bash
node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-motion-v1.test.mjs .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs
```

Expected: 18 tests pass, 0 fail.

- [ ] **Step 5: Commit the motion correction**

```bash
git add .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-motion-v1.js .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-motion-v1.test.mjs
git commit -m "fix: preserve tangential headings through orbit"
```

### Task 2: Add Semantic Onboarding and CTA Routing

**Files:**
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-slingshot-v1.html`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-rebirth-v1.html`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-loop-v1.html`
- Create: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-onboarding-v1.js`
- Create: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-onboarding-v1.test.mjs`

**Interfaces:**
- Produces: `tabIndexForKey(currentIndex, tabCount, key): number` and browser initialization for `[data-onboarding-tabs]`.
- Each A3 page produces `#get-started`, `[role="tablist"]`, three `[role="tab"]` buttons, three `[role="tabpanel"]` panels, and a `.nav-center` containing the existing links and status.

- [ ] **Step 1: Write failing keyboard and static-contract tests**

Create `autolab-mog-a3-onboarding-v1.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { tabIndexForKey } from './autolab-mog-a3-onboarding-v1.js';

test('tab arrow keys wrap and Home or End reach the boundaries', () => {
  assert.equal(tabIndexForKey(0, 3, 'ArrowRight'), 1);
  assert.equal(tabIndexForKey(2, 3, 'ArrowRight'), 0);
  assert.equal(tabIndexForKey(0, 3, 'ArrowLeft'), 2);
  assert.equal(tabIndexForKey(1, 3, 'Home'), 0);
  assert.equal(tabIndexForKey(1, 3, 'End'), 2);
  assert.equal(tabIndexForKey(1, 3, 'Enter'), 1);
});
```

Extend each variant's static contract test with:

```js
assert.match(html, /class="nav-center"/);
assert.match(html, /id="get-started"/);
assert.match(html, /role="tablist"/);
assert.equal((html.match(/role="tab"/g) || []).length, 3);
assert.equal((html.match(/role="tabpanel"/g) || []).length, 3);
assert.match(html, /href="#get-started"[^>]*>Start researching/);
assert.match(html, /curl -fsSL app\.autolab\.ai\/install\.sh \| sh/);
assert.match(html, /autolab install claude-code/);
assert.match(html, /autolab install codex/);
assert.match(html, /autolab-mog-a3-onboarding-v1\.js/);
```

- [ ] **Step 2: Run the new tests and verify RED**

Run:

```bash
node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-onboarding-v1.test.mjs .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs
```

Expected: module-not-found for the onboarding controller and static failures for the missing markup.

- [ ] **Step 3: Implement the isolated tab controller**

Create `autolab-mog-a3-onboarding-v1.js`:

```js
export function tabIndexForKey(currentIndex, tabCount, key) {
  if (key === 'ArrowRight') return (currentIndex + 1) % tabCount;
  if (key === 'ArrowLeft') return (currentIndex - 1 + tabCount) % tabCount;
  if (key === 'Home') return 0;
  if (key === 'End') return tabCount - 1;
  return currentIndex;
}

function initializeTabs(root) {
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = [...root.querySelectorAll('[role="tabpanel"]')];

  function select(tab, focus = false) {
    for (const item of tabs) {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    }
    for (const panel of panels) panel.hidden = panel.id !== tab.getAttribute('aria-controls');
    if (focus) tab.focus();
  }

  for (const tab of tabs) {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      const index = tabs.indexOf(tab);
      const next = tabIndexForKey(index, tabs.length, event.key);
      if (next === index && !['Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      select(tabs[next], true);
    });
  }
}

if (typeof document !== 'undefined') {
  for (const root of document.querySelectorAll('[data-onboarding-tabs]')) initializeTabs(root);
}
```

- [ ] **Step 4: Update the shared page markup**

In each A3 page, replace the header center with:

```html
<div class="nav-center">
  <nav class="nav-links" aria-label="Main navigation"><a href="#research-run">How it works</a><a href="#outro">Research</a><a href="#get-started">Docs</a></nav>
  <span class="nav-status" aria-hidden="true"><i></i><span class="nav-status-copy"></span></span>
</div>
```

Use the production calendar target for every `.nav-cta` and hero `Book a demo` link:

```html
href="https://calendar.superhuman.com/book/11Wx5q95SPgTTclPo4/KrRGA" target="_blank" rel="noopener"
```

Route both hero self-serve actions to `#get-started`:

```html
<a class="button primary" href="#get-started">Start researching <span>↗</span></a>
<a class="hero-install" href="#get-started">$ curl -fsSL app.autolab.ai/install.sh | sh <span>↓</span></a>
```

Insert this section after `#research-run` and before `#outro` in each page:

```html
<section class="get-started" id="get-started">
  <div class="get-started-copy">
    <span class="mono-label eyebrow-mint">From goal to first run</span>
    <h2>Start this <em>afternoon.</em></h2>
    <p>Install, point it at your eval, go. Or meet Autolab inside the coding agent you already use.</p>
    <span class="infra-note">Your infra or ours. Code, data, and weights stay in your network.</span>
  </div>
  <div class="onboarding-console" data-onboarding-tabs>
    <div class="onboarding-head"><span>autolab / initialize</span><i></i></div>
    <div class="onboarding-tabs" role="tablist" aria-label="Install Autolab">
      <button id="tab-cli" role="tab" aria-selected="true" aria-controls="panel-cli" tabindex="0">CLI</button>
      <button id="tab-claude" role="tab" aria-selected="false" aria-controls="panel-claude" tabindex="-1">Claude Code</button>
      <button id="tab-codex" role="tab" aria-selected="false" aria-controls="panel-codex" tabindex="-1">Codex</button>
    </div>
    <div class="onboarding-panel" id="panel-cli" role="tabpanel" aria-labelledby="tab-cli"><pre><span>$</span> curl -fsSL app.autolab.ai/install.sh | sh\n<span>$</span> autolab init   <i># point it at the eval script that prints your metric</i>\n<span>$</span> autolab start  <i># the agents begin. watch or walk away.</i></pre></div>
    <div class="onboarding-panel" id="panel-claude" role="tabpanel" aria-labelledby="tab-claude" hidden><pre><span>$</span> autolab install claude-code\n<i>then, inside Claude Code:</i>\n<span>&gt;</span> use /autolab to run experiments on this repo</pre></div>
    <div class="onboarding-panel" id="panel-codex" role="tabpanel" aria-labelledby="tab-codex" hidden><pre><span>$</span> autolab install codex\n<i>then, inside Codex:</i>\n<span>&gt;</span> queue autolab experiments against eval.py</pre></div>
  </div>
</section>
```

Load the controller after the existing scene script:

```html
<script type="module" src="autolab-mog-a3-onboarding-v1.js"></script>
```

- [ ] **Step 5: Run the onboarding and static tests and verify GREEN**

Run:

```bash
node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-onboarding-v1.test.mjs .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs
```

Expected: all onboarding and static tests pass.

- [ ] **Step 6: Commit the semantic onboarding**

```bash
git add .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-{slingshot,rebirth,loop}-v1.html .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-onboarding-v1.js .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-onboarding-v1.test.mjs .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs
git commit -m "feat: add direct Autolab onboarding paths"
```

### Task 3: Rebuild the Header Island and Onboarding Surface

**Files:**
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-core-v1.css`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-scene-v1.js`

**Interfaces:**
- Consumes: `.nav-center`, `.nav-links`, `.nav-status`, `navigationTelemetryFor(progress)`, and onboarding markup from Task 2.
- Produces: `.topbar.has-telemetry` state, a three-column grid shell, center-stage crossfade, responsive onboarding grid, focus states, and reduced-motion fallbacks.

- [ ] **Step 1: Write failing CSS and scene contracts**

Extend the static test with:

```js
test('navigation uses one centered stage and onboarding has responsive styling', async () => {
  const [css, scene] = await Promise.all([
    readFile(new URL('./autolab-mog-core-v1.css', import.meta.url), 'utf8'),
    readFile(new URL('./autolab-mog-a3-scene-v1.js', import.meta.url), 'utf8'),
  ]);
  assert.match(css, /\.nav-shell\s*\{[^}]*display:\s*grid/s);
  assert.match(css, /\.nav-center\s*\{[^}]*grid-area:/s);
  assert.match(css, /\.topbar\.has-telemetry\s+\.nav-links/s);
  assert.match(css, /\.get-started\s*\{[^}]*display:\s*grid/s);
  assert.match(css, /\.onboarding-tabs\s*\{/s);
  assert.match(css, /:focus-visible/s);
  assert.match(scene, /classList\.toggle\('has-telemetry', telemetry\.visible\)/);
});
```

- [ ] **Step 2: Run the static test and verify RED**

Run:

```bash
node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs
```

Expected: the new navigation/onboarding visual contract fails.

- [ ] **Step 3: Apply the telemetry state in the scene**

Add this line to `updateNavigationTelemetry()` before updating the status element:

```js
topbar.classList.toggle('has-telemetry', telemetry.visible);
```

- [ ] **Step 4: Implement the three-zone shell and center crossfade**

Replace the flex-specific navigation rules with a grid shell using:

```css
.nav-shell {
  display: grid;
  grid-template-areas: "brand center action";
  grid-template-columns: minmax(150px,1fr) minmax(310px,auto) minmax(150px,1fr);
  align-items: center;
}
.wordmark { grid-area: brand; justify-self: start; }
.nav-center { grid-area: center; display: grid; place-items: center; min-width: 310px; }
.nav-links,.nav-status { grid-area: 1 / 1; }
.nav-links { opacity: 1; transform: none; transition: opacity .28s ease,transform .36s cubic-bezier(.2,.75,.2,1); }
.topbar.has-telemetry .nav-links { opacity: 0; visibility: hidden; transform: translateY(-4px) scale(.97); }
.nav-status.is-live { opacity: 1; visibility: visible; transform: none; }
.nav-cta { grid-area: action; justify-self: end; }
```

Keep the existing full-bar and island geometry, transition timing, paper colors, mint semantics, and mobile collapse. Increase the island width only as needed to prevent overlap; do not change its visual language.

- [ ] **Step 5: Implement the onboarding surface and interaction states**

Add these focused rules, deriving every value from the existing paper/ink/mint and IBM Plex visual system:

```css
.hero-install {
  width: max-content;
  max-width: 100%;
  margin-top: 18px;
  display: inline-flex;
  gap: 14px;
  color: var(--muted);
  font: 400 10px/1.7 "IBM Plex Mono",monospace;
}
.hero-install span { color: var(--mint-deep); transition: transform .2s; }
.hero-install:hover span { transform: translateY(3px); }

.get-started {
  position: relative;
  z-index: 3;
  min-height: 100svh;
  padding: clamp(110px,14vh,170px) clamp(24px,5vw,78px);
  display: grid;
  grid-template-columns: minmax(0,.82fr) minmax(520px,1fr);
  align-items: center;
  gap: clamp(60px,9vw,150px);
  border-top: 1px solid var(--line);
  background: var(--paper);
}
.get-started-copy h2 {
  max-width: 660px;
  margin-top: 22px;
  font: 500 clamp(54px,6.4vw,96px)/.92 "IBM Plex Serif",serif;
  letter-spacing: -.052em;
}
.get-started-copy h2 em { color: var(--mint-deep); font-weight: 400; }
.get-started-copy p {
  max-width: 520px;
  margin-top: 28px;
  color: var(--muted);
  font: 400 16px/1.65 "IBM Plex Sans",sans-serif;
}
.infra-note {
  max-width: 520px;
  margin-top: 34px;
  padding-top: 18px;
  display: block;
  border-top: 1px solid var(--line);
  color: var(--mint-deep);
  font: 500 9px/1.6 "IBM Plex Mono",monospace;
  letter-spacing: .06em;
  text-transform: uppercase;
}
.onboarding-console {
  overflow: hidden;
  border: 1px solid rgba(47,206,150,.42);
  border-radius: 15px;
  background: #080c0a;
  color: var(--paper);
  box-shadow: 0 32px 90px rgba(20,20,20,.16),18px 18px 0 rgba(47,206,150,.07);
}
.onboarding-head {
  height: 46px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(247,245,240,.12);
  color: #82928b;
  font: 500 8px/1 "IBM Plex Mono",monospace;
  letter-spacing: .12em;
  text-transform: uppercase;
}
.onboarding-head i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--mint);
  box-shadow: 0 0 0 5px rgba(47,206,150,.1),0 0 20px rgba(47,206,150,.45);
}
.onboarding-tabs {
  padding: 14px 14px 0;
  display: flex;
  gap: 4px;
  border-bottom: 1px solid rgba(247,245,240,.12);
}
.onboarding-tabs button {
  padding: 11px 14px 13px;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #718078;
  cursor: pointer;
  font: 500 9px/1 "IBM Plex Mono",monospace;
}
.onboarding-tabs button[aria-selected="true"] { border-color: var(--mint); color: var(--paper); }
.onboarding-panel { min-height: 250px; padding: 34px 28px; }
.onboarding-panel[hidden] { display: none; }
.onboarding-panel pre {
  overflow-x: auto;
  color: #b8c1bc;
  font: 400 11px/2.1 "IBM Plex Mono",monospace;
  white-space: pre;
}
.onboarding-panel pre span { color: var(--mint); }
.onboarding-panel pre i { color: #66746d; font-style: normal; }
a:focus-visible,button:focus-visible { outline: 2px solid var(--mint-deep); outline-offset: 4px; }

@media (max-width: 900px) {
  .get-started { min-height: auto; padding: 110px 18px 130px; grid-template-columns: 1fr; gap: 54px; }
  .get-started-copy h2 { font-size: clamp(52px,14vw,72px); }
  .onboarding-panel { min-height: 230px; padding: 26px 20px; }
  .onboarding-panel pre { font-size: 9px; }
}

@media (prefers-reduced-motion: reduce) {
  .hero-install span { transition: none; }
}
```

Keep the paper section and single near-black command surface; add no decorative animation beyond the existing transitions.

- [ ] **Step 6: Run all automated checks and verify GREEN**

Run:

```bash
node --test .superpowers/brainstorm/39694-1784238160/content/*.test.mjs
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-motion-v1.js
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-scene-v1.js
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-onboarding-v1.js
git diff --check
git diff --exit-code origin/main -- index.html manifesto.html careers.html autoresearch.html robots.txt sitemap.xml llms.txt favicon.ico apple-touch-icon.png logo.png og.png
```

Expected: every Node test passes, all modules parse, diff check is empty, and the production-file comparison exits 0.

- [ ] **Step 7: Visually verify and mirror the served prototype**

At desktop 1440×913 and mobile 390×844, inspect the initial header, island state after 80 pixels, orbit/early-gradient headings, settled topology, Rebirth resolution, onboarding tab pointer/keyboard behavior, and page-level overflow. Copy only the tracked changed preview artifacts into the active mirror directory `.superpowers/brainstorm/98454-1784562248/content/`, preserving its server token files.

- [ ] **Step 8: Commit the completed visual pass**

```bash
git add .superpowers/brainstorm/39694-1784238160/content/autolab-mog-core-v1.css .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-scene-v1.js .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs
git commit -m "feat: refine the Autolab Rebirth product shell"
```
