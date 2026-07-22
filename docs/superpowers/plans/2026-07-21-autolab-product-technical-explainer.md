# Autolab Product Technical Explainer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Replace the standalone Product page's abstract feature blocks with one coherent illustrated technical explainer while leaving the selected Rebirth homepage unchanged.

**Architecture:** Keep the Product page as dependency-free semantic HTML, Product-specific CSS, SVG illustrations, and the existing watchdog canvas. Add one small Product-only IntersectionObserver controller for one-shot chapter reveals. Reuse the existing onboarding-tabs module without modifying it.

**Tech Stack:** HTML5, CSS, inline SVG, ES modules, Canvas 2D for the existing watchdog, and Node's built-in test runner.

## Global Constraints

- Change only the standalone Product page, Product-specific assets, and Product-page tests.
- Do not modify the selected Rebirth homepage HTML, CSS, JavaScript, animation choreography, copy, or tests.
- Do not modify index.html, manifesto.html, careers.html, autoresearch.html, robots.txt, sitemap.xml, llms.txt, favicon.ico, apple-touch-icon.png, logo.png, or og.png.
- Preserve Paper #F7F5F0, Ink #141414, Mint #2FCE96, Deep mint #0C8A5F, Graphite #0C1210, intervention Amber #D8A447, IBM Plex Serif, IBM Plex Sans, IBM Plex Mono, and the floating island navigation.
- Amber means watchdog intervention. Mint means active or selected work. Faint graphite lines mean retained history.
- Diagram grammar is fixed: ▸ experiment, □ GPU, ○ evaluation, ● selected result, solid path running, faint path retained history, dashed path proposed next step.
- No em dash character may appear in visible or generated Product-page copy.
- Do not invent benchmark results, savings percentages, utilization claims, throughput multipliers, customer claims, or experiment-scale claims.
- All new illustrations use HTML, CSS, and SVG. The existing watchdog remains the only canvas scene.
- Do not add a framework, animation library, or runtime dependency.
- Copy and calls to action remain visible if animation initialization fails.
- Reduced motion renders every diagram in its resolved state.
- No viewport produces horizontal scrolling.
- The production early-access HTTPS endpoint remains intentionally unconfigured and must never simulate success.
- Starting implementation baseline is commit 1749fea.

## File map

- Modify .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.html for the Product narrative, semantic chapters, inline SVG illustrations, onboarding, FAQ, and script wiring.
- Modify .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.css for Product layout, living circuit, technical plates, responsive rules, reduced motion, and focus states.
- Create .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-explainer-v2.js for one-shot viewport reveals only.
- Create .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-explainer-v2.test.mjs for real-module reveal lifecycle tests.
- Modify autolab-mog-product-motion-v1.js and its test for qualitative GPU release, queue convergence, and GPU activation state.
- Modify autolab-mog-product-scene-v1.js and its test for multiple queued experiment paths and a selected GPU handoff.
- Modify autolab-mog-product-static-v1.test.mjs for content, semantics, no-claim, onboarding, FAQ, and resource contracts.
- Reuse autolab-mog-a3-onboarding-v1.js unchanged for accessible CLI, Claude Code, and Codex tabs.

---

### Task 1: Establish the living circuit and technical chapter contract

**Files:**

- Modify: .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-static-v1.test.mjs
- Modify: .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.html

**Interfaces:**

- Produces data-product-circuit, six data-explainer-chapter sections, topology-plate, experiment-anatomy, watchdog-feature, lineage-plate, research-packet, and deployment-plate.
- Preserves #watchdog-canvas, #early-access, all navigation URLs, early-access module wiring, and watchdog module wiring.

- [ ] **Step 1: Write the failing circuit and chapter tests**

Add these exact helpers and assertions:

~~~js
const PRODUCT_URL = new URL('./autolab-mog-product-v1.html', import.meta.url);

const visibleText = html => html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

test('Product page opens one complete illustrated research circuit', async () => {
  const html = await readFile(PRODUCT_URL, 'utf8');
  const text = visibleText(html);
  const concepts = [
    'REPOSITORY', 'EVALUATION', 'CONSTRAINTS', 'GPU POOL',
    'EXPERIMENT AGENTS', 'SCHEDULER', 'WATCHDOG',
    'RESEARCH MEMORY', 'NEXT EXPERIMENTS', 'RESEARCH PACKET',
  ];

  assert.match(html, /data-product-circuit/);
  for (const concept of concepts) assert.match(text, new RegExp(concept));
  for (const key of ['▸ experiment', '□ GPU', '○ evaluation', '● selected result']) {
    assert.match(text, new RegExp(key));
  }
});

test('Product chapters progressively open the same system', async () => {
  const html = await readFile(PRODUCT_URL, 'utf8');
  const text = visibleText(html);
  const headlines = [
    'Connect what you already have.',
    'See what every run is doing.',
    'Stop waste. Keep GPUs moving.',
    'Turn every result into the next experiment.',
    'Review the full research record.',
    'Deploy where your research already runs.',
  ];

  let previous = -1;
  for (const headline of headlines) {
    const index = text.indexOf(headline);
    assert.ok(index > previous, 'missing or unordered headline: ' + headline);
    previous = index;
  }
  assert.equal((html.match(/data-explainer-chapter/g) || []).length, 6);
});
~~~

- [ ] **Step 2: Run the static test and verify RED**

Run:

~~~bash
node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-static-v1.test.mjs
~~~

Expected: FAIL because the circuit hook, ten concepts, six headlines, and six chapter hooks do not exist.

- [ ] **Step 3: Replace the Product hero with the living research circuit**

Use this exact copy:

~~~html
<span class="mono-label eyebrow-mint">Autolab / system anatomy</span>
<h1>The research loop, running on <em>your GPUs.</em></h1>
<p>Connect a repository, an evaluation, and the compute you already have. Autolab proposes changes, runs and watches experiments, stops wasted work, and returns a reviewable research record.</p>
~~~

The figure must be data-product-circuit and contain three labeled zones:

~~~html
<div class="circuit-zone circuit-inputs">
  <span>YOUR SYSTEM</span>
  <b>REPOSITORY</b><b>EVALUATION</b><b>CONSTRAINTS</b><b>GPU POOL</b>
</div>
<div class="circuit-zone circuit-autolab">
  <span>AUTOLAB</span>
  <b>EXPERIMENT AGENTS</b><b>SCHEDULER</b><b>WATCHDOG</b>
  <b>RESEARCH MEMORY</b><b>NEXT EXPERIMENTS</b>
</div>
<div class="circuit-zone circuit-output">
  <span>YOUR TEAM</span><b>RESEARCH PACKET</b>
  <small>code · evidence · history · approval</small>
</div>
<div class="diagram-key">
  <span>▸ experiment</span><span>□ GPU</span>
  <span>○ evaluation</span><span>● selected result</span>
</div>
~~~

Add one scalable SVG route with route-history, route-active, and route-loop paths. Give the figure a role=img summary that names all three zones.

- [ ] **Step 4: Replace the five old feature blocks with six chapter shells**

Use these exact heading and paragraph pairs in order:

1. Connect what you already have. Point Autolab at your repository, evaluation, constraints, and available compute. Machines across a workstation, cloud account, or cluster participate in one experiment queue.
2. See what every run is doing. Autolab reads the proposed code change, assigned GPU, training trace, logs, checkpoints, and evaluation state while each experiment runs.
3. Stop waste. Keep GPUs moving. Watchdog models stop runs that have plateaued or are clearly trending toward failure. The evidence remains, and the freed GPU immediately becomes available to the next queued experiment.
4. Turn every result into the next experiment. Completed, stopped, and failed runs all add evidence. Autolab uses that history to propose concrete changes, avoid repeated dead ends, and choose the next experiments worth running.
5. Review the full research record. The winning change arrives with its configuration, evaluation state, logs, checkpoint reference, and experiment lineage. Your team decides what ships.
6. Deploy where your research already runs. Run Autolab in your cloud account, on your cluster, on-prem, or with managed compute. Code, data, and model weights can remain inside your network.

Each section receives its approved figure class and a concise role=img summary. Preserve the watchdog canvas inside watchdog-instrument.

- [ ] **Step 5: Run the static test and verify the new contract**

Expected: the new circuit and chapter tests pass. Record any obsolete existing no-tab assertion for removal in Task 5 rather than weakening the new tests.

- [ ] **Step 6: Commit**

~~~bash
git add .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.html .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-static-v1.test.mjs
git commit -m "feat: explain the complete Autolab product circuit"
~~~

---

### Task 2: Draw the circuit, topology, and experiment anatomy

**Files:**

- Modify: autolab-mog-product-v1.html
- Modify: autolab-mog-product-v1.css
- Modify: autolab-mog-product-static-v1.test.mjs

**Interfaces:**

- Consumes Task 1's system-cutaway, topology-plate, and experiment-anatomy figures.
- Produces meaningful static SVG and HTML illustrations that are complete without JavaScript.

- [ ] **Step 1: Add failing structural tests**

Assert all of these hooks exist:

~~~js
for (const hook of [
  'data-topology-source="repository"',
  'data-topology-source="evaluation"',
  'data-topology-source="constraints"',
  'data-compute-pool="local"',
  'data-compute-pool="cloud"',
  'data-compute-pool="cluster"',
  'data-anatomy-part="change"',
  'data-anatomy-part="gpu"',
  'data-anatomy-part="trace"',
  'data-anatomy-part="logs"',
  'data-anatomy-part="checkpoint"',
  'data-anatomy-part="evaluation"',
]) assert.match(html, new RegExp(hook));
~~~

Run the static test. Expected: FAIL because both figures are empty shells.

- [ ] **Step 2: Fill the topology plate**

Use three labeled source nodes, one scheduler, and three compute pools:

~~~html
<div class="topology-sources">
  <b data-topology-source="repository">REPOSITORY<small>code + branches</small></b>
  <b data-topology-source="evaluation">EVALUATION<small>the metric to improve</small></b>
  <b data-topology-source="constraints">CONSTRAINTS<small>cost + latency + quality</small></b>
</div>
<div class="topology-scheduler">
  <span>▸ ▸ ▸</span><strong>AUTOLAB SCHEDULER</strong>
  <small>assign the next useful experiment</small>
</div>
<div class="compute-pools">
  <div data-compute-pool="local"><span>LOCAL</span><b>□ GPU</b></div>
  <div data-compute-pool="cloud"><span>CLOUD</span><b>□ □ GPU</b></div>
  <div data-compute-pool="cluster"><span>CLUSTER</span><b>□ □ □ GPU</b></div>
</div>
~~~

Wrap the first three pools and input signals in a labeled CUSTOMER ENVIRONMENT boundary. Add the labels solid = running, dashed = proposed, and faint = history.

- [ ] **Step 3: Fill the experiment anatomy plate**

Use one central ▸ EXPERIMENT node and these six exact parts:

~~~html
<div data-anatomy-part="change"><span>01 / CODE CHANGE</span><b>branch prepared</b><small>reviewable commit</small></div>
<div data-anatomy-part="gpu"><span>02 / ASSIGNMENT</span><b>□ GPU ACTIVE</b><small>scheduler owned</small></div>
<div data-anatomy-part="trace"><span>03 / TRAINING TRACE</span><b>running</b><small>signals observed</small></div>
<div data-anatomy-part="logs"><span>04 / LIVE LOGS</span><b>signals streaming</b><small>failures retained</small></div>
<div data-anatomy-part="checkpoint"><span>05 / CHECKPOINT</span><b>saved</b><small>artifact referenced</small></div>
<div data-anatomy-part="evaluation"><span>06 / EVALUATION</span><b>○ PENDING</b><small>your metric decides</small></div>
~~~

The trace contains an unlabeled qualitative SVG polyline with no axes or numbers.

- [ ] **Step 4: Replace the old Product CSS with the plate system**

Implement the following structural rules exactly, then add child grid positioning that uses the same tokens:

~~~css
.product-page { background: var(--paper); color: var(--ink); }
.product-page main { overflow: clip; }
.product-hero,.product-chapter,.product-onboarding,.product-faq,.product-access { width: min(1440px,90vw); margin-inline: auto; }
.product-hero { min-height: 100svh; padding: 170px 0 104px; display: grid; grid-template-columns: minmax(0,.72fr) minmax(620px,1.28fr); gap: clamp(52px,7vw,116px); align-items: center; }
.product-hero h1 { max-width: 720px; margin: 0; font: 400 clamp(62px,6.6vw,108px)/.92 "IBM Plex Serif",serif; letter-spacing: -.058em; }
.product-hero h1 em { color: var(--mint-deep); font-weight: 400; }
.system-cutaway,.technical-plate { position: relative; margin: 0; border: 1px solid var(--line); border-radius: 8px; background-color: rgba(255,255,255,.28); background-image: linear-gradient(rgba(20,20,20,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(20,20,20,.035) 1px,transparent 1px); background-size: 32px 32px; box-shadow: 0 30px 78px rgba(20,20,20,.08); overflow: hidden; }
.system-cutaway { min-height: 620px; padding: 58px 34px 74px; display: grid; grid-template-columns: .72fr 1.3fr .72fr; gap: 18px; align-items: center; }
.product-chapter { position: relative; min-height: 760px; padding: 116px 0; border-top: 1px solid var(--line); display: grid; grid-template-columns: minmax(0,.66fr) minmax(560px,1.34fr); gap: clamp(54px,8vw,128px); align-items: center; }
.product-chapter.reverse { grid-template-columns: minmax(560px,1.34fr) minmax(0,.66fr); }
.product-chapter.reverse .product-copy { grid-column: 2; }
.product-chapter.reverse > figure { grid-row: 1; grid-column: 1; }
.technical-plate { min-height: 560px; padding: 68px 30px 48px; }
~~~

The active circuit route is one mint dash moving once along a scalable SVG path. The base route and all labels are visible before motion. Topology primary content uses CSS Grid, not absolute positioning. Experiment anatomy may use absolute connector accents on desktop but returns to normal grid flow on mobile.

- [ ] **Step 5: Verify and commit**

~~~bash
node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-static-v1.test.mjs
git diff --check
git add .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.html .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.css .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-static-v1.test.mjs
git commit -m "feat: illustrate the product system inputs"
~~~

---

### Task 3: Make watchdog intervention and GPU reassignment explicit

**Files:**

- Modify: autolab-mog-product-motion-v1.js and its test
- Modify: autolab-mog-product-scene-v1.js and its test
- Modify: autolab-mog-product-v1.css

**Interfaces:**

- watchdogStateFor continues to return every existing field and adds gpuRelease, queueConverge, and gpuActivation, each clamped to [0,1].
- Scene lifecycle remains exact-viewport, null-sentinel, hidden-draw-free, per-dimension resize safe, and reduced-motion resolved.

- [ ] **Step 1: Add a failing motion test**

~~~js
test('watchdog releases the GPU before converging queued experiments', () => {
  const observing = watchdogStateFor(0.2);
  const stopped = watchdogStateFor(0.68);
  const assigning = watchdogStateFor(0.82);
  const running = watchdogStateFor(1);

  assert.equal(observing.gpuRelease, 0);
  assert.ok(stopped.gpuRelease > 0);
  assert.equal(stopped.queueConverge, 0);
  assert.ok(assigning.queueConverge > 0);
  assert.equal(observing.gpuActivation, 0);
  assert.equal(running.gpuActivation, 1);
});
~~~

Run the motion test. Expected: FAIL because all three fields are undefined.

- [ ] **Step 2: Add minimal qualitative handoff state**

Inside watchdogStateFor calculate and return:

~~~js
const gpuRelease = ease((value - WATCHDOG_TIMELINE.stop) / 0.1)
  * (1 - ease((value - WATCHDOG_TIMELINE.reassign) / 0.08));
const queueConverge = ease((value - WATCHDOG_TIMELINE.reassign) / 0.1);
const gpuActivation = ease((value - WATCHDOG_TIMELINE.restart) / 0.12);
~~~

Keep all timing constants and existing return fields unchanged. Run the motion test and expect PASS.

- [ ] **Step 3: Add failing real-scene assertions**

In the reduced-motion viewport-entry test assert:

~~~js
assert.ok(reduced.labels.includes('QUEUED EXPERIMENTS'));
assert.ok(reduced.labels.includes('NEXT EXPERIMENT'));
assert.ok(reduced.labels.includes('GPU 04'));
assert.ok(reduced.labels.includes('ACTIVE'));
~~~

Run the scene test. Expected: FAIL on the first two labels.

- [ ] **Step 4: Replace the single handoff with multiple queued paths**

Add drawQueuedExperiments(graph, gpu). It renders three ▸ sources after release, three faint paths converging on the same GPU, one selected mint path, QUEUED EXPERIMENTS, and NEXT EXPERIMENT. GPU shadow intensity uses gpuActivation. Fold or remove the old drawHandoff so there is one reassignment renderer. Do not add numbers or benchmark outcomes.

- [ ] **Step 5: Verify lifecycle and commit**

~~~bash
node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-motion-v1.test.mjs .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-scene-v1.test.mjs
git add .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-motion-v1.js .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-motion-v1.test.mjs .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-scene-v1.js .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-scene-v1.test.mjs .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.css
git commit -m "feat: clarify watchdog GPU reassignment"
~~~

---

### Task 4: Illustrate research memory and the research packet

**Files:**

- Modify: autolab-mog-product-v1.html
- Modify: autolab-mog-product-v1.css
- Modify: autolab-mog-product-static-v1.test.mjs

**Interfaces:**

- Produces data-lineage-result, data-next-experiment, and data-packet-part hooks.

- [ ] **Step 1: Add failing completeness tests**

~~~js
test('Research memory preserves every outcome and proposes a next batch', async () => {
  const html = await readFile(PRODUCT_URL, 'utf8');
  for (const outcome of ['completed', 'stopped', 'failed']) {
    assert.match(html, new RegExp('data-lineage-result="' + outcome + '"'));
  }
  assert.equal((html.match(/data-next-experiment/g) || []).length, 3);
  assert.match(visibleText(html), /dead ends remain useful evidence/i);
  assert.match(visibleText(html), /useful results shape the next batch/i);
});

test('Research packet makes the human review boundary concrete', async () => {
  const html = await readFile(PRODUCT_URL, 'utf8');
  for (const part of ['diff', 'config', 'evaluation', 'logs', 'checkpoint', 'lineage', 'approval']) {
    assert.match(html, new RegExp('data-packet-part="' + part + '"'));
  }
  assert.match(visibleText(html), /HUMAN APPROVAL REQUIRED/);
});
~~~

Run the static test. Expected: FAIL because both figures are empty.

- [ ] **Step 2: Fill the lineage plate**

Create three outcome nodes labeled ● COMPLETED, ○ STOPPED, and × FAILED, a central RESEARCH MEMORY node, three SVG history routes, three dashed proposal routes, and three ▸ PROPOSED CHANGE nodes. Include the visible notes dead ends remain useful evidence and useful results shape the next batch.

- [ ] **Step 3: Fill the research packet**

Create exactly seven labeled packet parts:

- CODE DIFF with one qualitative removed line and one qualitative added line
- RUN CONFIG with environment attached
- EVALUATION with ○ IMPROVED
- LOGS with run record attached
- CHECKPOINT with artifact referenced
- LINEAGE with history attached
- HUMAN APPROVAL REQUIRED with YOUR TEAM DECIDES WHAT SHIPS

- [ ] **Step 4: Style and verify**

Use muted solid history paths, mint dashed proposal paths, one mint selected result, and offset packet sheets. Resolve packet sheets into one document column on mobile. Keep all labels visible without motion.

~~~bash
node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-static-v1.test.mjs
git add .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.html .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.css .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-static-v1.test.mjs
git commit -m "feat: illustrate research memory and review"
~~~

---

### Task 5: Restore deployment detail, onboarding, FAQ, and conversion

**Files:**

- Modify: autolab-mog-product-v1.html
- Modify: autolab-mog-product-v1.css
- Modify: autolab-mog-product-static-v1.test.mjs
- Reuse unchanged: autolab-mog-a3-onboarding-v1.js

**Interfaces:**

- Produces accessible data-onboarding-tabs with three tabpanels, five native FAQ details, and the existing #early-access form.

- [ ] **Step 1: Replace the obsolete no-tab assertion with failing contracts**

~~~js
test('Product page restores all three onboarding paths', async () => {
  const html = await readFile(PRODUCT_URL, 'utf8');
  assert.match(html, /data-onboarding-tabs/);
  assert.match(html, /role="tablist"/);
  assert.equal((html.match(/role="tab"/g) || []).length, 3);
  assert.equal((html.match(/role="tabpanel"/g) || []).length, 3);
  assert.match(html, /curl -fsSL app\.autolab\.ai\/install\.sh \| sh/);
  assert.match(html, /autolab-mog-a3-onboarding-v1\.js/);
});

test('Product FAQ answers five technical buying questions', async () => {
  const html = await readFile(PRODUCT_URL, 'utf8');
  const text = visibleText(html);
  assert.equal((html.match(/<details/g) || []).length, 5);
  for (const question of [
    'What does Autolab connect to?',
    'How is this different from fixed-space tuning?',
    'Where do experiments run?',
    'What can Autolab optimize?',
    'What does a human approve?',
  ]) assert.ok(text.includes(question));
});
~~~

Run the static test. Expected: FAIL because Product has no onboarding tabs or FAQ.

- [ ] **Step 2: Complete the deployment plate**

Show CUSTOMER CLOUD, CLUSTER, and ON-PREM inside a dashed YOUR NETWORK boundary. Show MANAGED COMPUTE outside it. Connect each to AUTOLAB CONTROL PLANE. Keep code, data, and weights labels inside the customer boundary.

- [ ] **Step 3: Restore onboarding**

Copy the established accessible onboarding structure with Product-specific IDs. Include CLI, Claude Code, and Codex tabs. CLI commands are:

~~~text
$ curl -fsSL app.autolab.ai/install.sh | sh
$ autolab init   # connect the evaluation that prints your metric
$ autolab start  # begin proposing and running experiments
~~~

Load autolab-mog-a3-onboarding-v1.js without editing it.

- [ ] **Step 4: Add five native FAQ details**

Use the exact questions from Step 1. Answers must explain connected inputs, real repository changes versus a fixed search space, customer or managed infrastructure, team-defined evaluation goals, and human approval of the proposed change and evidence. Use native details and summary elements.

- [ ] **Step 5: Style and verify**

Keep the CLI console at least 620px wide on desktop, one column below 900px, native summary focus visible, and the existing dark early-access focus and status colors.

~~~bash
node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-static-v1.test.mjs .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-onboarding-v1.test.mjs .superpowers/brainstorm/39694-1784238160/content/autolab-early-access-v1.test.mjs
git add .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.html .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.css .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-static-v1.test.mjs
git commit -m "feat: add product deployment and onboarding detail"
~~~

---

### Task 6: Add restrained one-shot reveals and responsive behavior

**Files:**

- Create: autolab-mog-product-explainer-v2.js
- Create: autolab-mog-product-explainer-v2.test.mjs
- Modify: autolab-mog-product-v1.html
- Modify: autolab-mog-product-v1.css
- Modify: autolab-mog-product-static-v1.test.mjs

**Interfaces:**

- Normal motion sets data-reveal=pending, then data-reveal=resolved once on viewport entry.
- Reduced motion resolves all chapters synchronously and creates no observer.
- No RAF, timer, scroll listener, or ongoing work is allowed.

- [ ] **Step 1: Write real-module lifecycle tests**

Test normal motion creates one IntersectionObserver with rootMargin 0px and threshold 0.15, marks chapters pending, resolves only the intersecting chapter, and unobserves it. Test reduced motion creates no observer and resolves every chapter immediately.

- [ ] **Step 2: Run and verify RED**

~~~bash
node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-explainer-v2.test.mjs
~~~

Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement the minimal controller**

~~~js
const chapters = [...document.querySelectorAll('[data-explainer-chapter]')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reducedMotion) {
  for (const chapter of chapters) chapter.dataset.reveal = 'resolved';
} else if (chapters.length) {
  for (const chapter of chapters) chapter.dataset.reveal = 'pending';
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.dataset.reveal = 'resolved';
      observer.unobserve(entry.target);
    }
  }, { rootMargin: '0px', threshold: 0.15 });
  for (const chapter of chapters) observer.observe(chapter);
}
~~~

- [ ] **Step 4: Add restrained resolved-state CSS**

Animate only topology route accents, anatomy connector accents, lineage proposal paths, and packet-sheet offsets. Use opacity and transform, duration at or below 700ms. Do not hide chapter copy, headings, labels, CTA, or base diagrams. Disable all transitions and the hero route animation under prefers-reduced-motion.

- [ ] **Step 5: Add 900px and 540px responsive rules**

Below 900px hero and chapters become one column, circuit becomes vertical, reverse sections restore source order, and all diagram primary content returns to grid flow. Below 540px every page-width section is calc(100vw - 36px), labels use overflow-wrap:anywhere, onboarding tabs scroll only inside their own container, and no plate can exceed viewport width.

- [ ] **Step 6: Add final qualitative-copy contract**

Read HTML, explainer, and watchdog scene. Reject em dashes, numeric percentages, numeric x multipliers, numeric savings statements, requestAnimationFrame or scroll listeners in the explainer, and missing explainer script wiring.

- [ ] **Step 7: Verify and commit**

~~~bash
node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-static-v1.test.mjs .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-motion-v1.test.mjs .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-scene-v1.test.mjs .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-explainer-v2.test.mjs .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-onboarding-v1.test.mjs .superpowers/brainstorm/39694-1784238160/content/autolab-early-access-v1.test.mjs
git add .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-explainer-v2.js .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-explainer-v2.test.mjs .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.html .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.css .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-static-v1.test.mjs
git commit -m "feat: add restrained product explainer reveals"
~~~

---

### Task 7: Verify visual handoff and the homepage freeze

**Files:**

- Modify only if a Product defect is found: files in the file map.
- Do not modify any Rebirth homepage or root production SEO file.

- [ ] **Step 1: Run the entire content test suite**

~~~bash
node --test .superpowers/brainstorm/39694-1784238160/content/*.test.mjs
~~~

Expected: zero failures and zero cancellations.

- [ ] **Step 2: Run syntax checks**

~~~bash
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-explainer-v2.js
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-motion-v1.js
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-scene-v1.js
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-early-access-v1.js
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-onboarding-v1.js
git diff --check
~~~

Expected: every command exits zero without output.

- [ ] **Step 3: Verify local resources and hash targets**

Run this exact recursive Product resource check:

~~~bash
node --input-type=module <<'NODE'
import fs from 'node:fs';
import path from 'node:path';

const start = '.superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.html';
const skipped = /^(?:https?:|data:|mailto:|tel:|javascript:)/i;
const visited = new Set();
const failures = [];

function idsIn(file) {
  const source = fs.readFileSync(file, 'utf8');
  return new Set([...source.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]));
}

function check(owner, kind, reference) {
  if (!reference || skipped.test(reference) || reference.startsWith('//')) return;
  if (kind === 'url' && /^(?:#|%23)/i.test(reference)) return;
  const hashIndex = reference.indexOf('#');
  const resource = (hashIndex >= 0 ? reference.slice(0, hashIndex) : reference).split('?')[0];
  const fragment = hashIndex >= 0 ? decodeURIComponent(reference.slice(hashIndex + 1)) : '';
  const target = resource ? path.resolve(path.dirname(owner), resource) : owner;
  if (!fs.existsSync(target)) failures.push(`${path.basename(owner)} missing ${reference}`);
  else if (fragment && path.extname(target) === '.html' && !idsIn(target).has(fragment)) {
    failures.push(`${path.basename(owner)} missing #${fragment}`);
  }
  if (fs.existsSync(target) && ['.html', '.css', '.js'].includes(path.extname(target))) scan(target);
}

function scan(file) {
  const absolute = path.resolve(file);
  if (visited.has(absolute)) return;
  visited.add(absolute);
  const source = fs.readFileSync(absolute, 'utf8');
  const extension = path.extname(absolute);
  const pattern = extension === '.html'
    ? /\b(href|src)=["']([^"']+)["']/g
    : extension === '.css'
      ? /url\(\s*["']?([^"')]+)["']?\s*\)/g
      : /(?:import\s+(?:[^"']+?\s+from\s+)?|export\s+[^"']+?\s+from\s+)["']([^"']+)["']/g;
  for (const match of source.matchAll(pattern)) {
    check(absolute, extension === '.html' ? match[1] : extension === '.css' ? 'url' : 'module', extension === '.html' ? match[2] : match[1]);
  }
}

scan(start);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS ${visited.size} local Product files traversed`);
}
NODE
~~~

Expected: exit zero with one `PASS` summary and no missing local resource or fragment output.

- [ ] **Step 4: Prove the homepage and production SEO boundary did not move**

~~~bash
git diff --exit-code 1749fea -- index.html manifesto.html careers.html autoresearch.html robots.txt sitemap.xml llms.txt favicon.ico apple-touch-icon.png logo.png og.png .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-rebirth-v1.html .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-core-v1.css .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-scene-v1.js .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-scene-v1.test.mjs
~~~

Expected: exit zero with no output.

- [ ] **Step 5: Check the live Product preview**

Confirm HTTP 200 with:

~~~bash
curl -sS -o /dev/null -w '%{http_code}\n' "http://127.0.0.1:4173/autolab-mog-product-v1.html?v=$(git rev-parse --short HEAD)"
~~~

Expected: `200`.

When a supported browser backend is available, inspect 1440x913, 768x900, and 390x844. Verify no horizontal overflow, circuit reading order, attached annotations, clear watchdog reassignment, keyboard tabs, native FAQ, hash targets, reduced motion, and console health. If browser control remains unavailable, report that limitation and do not claim visual inspection.

- [ ] **Step 6: Review the final Product-only diff**

Every changed production line must trace to the approved Product spec. Do not include unrelated cleanup. If no Product fix is needed, do not create an empty commit.

## Plan self-review

- Spec coverage: living circuit, six chapters, topology, anatomy, watchdog reassignment, research memory, research packet, deployment, onboarding, FAQ, restrained motion, responsive behavior, accessibility, performance, conversion, no-claim rules, and homepage freeze each map to a task.
- Placeholder scan: no deferred implementation, undefined helper, or unspecified test remains.
- Interface consistency: all HTML hooks are created before they are consumed; watchdog state names match across motion and scene tasks; the reveal controller uses only data-explainer-chapter created in Task 1.
