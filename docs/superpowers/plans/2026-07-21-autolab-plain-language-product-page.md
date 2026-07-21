# Autolab Plain-Language Homepage and Product Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve the approved Rebirth homepage motion while making Autolab immediately understandable, adding a real early-access form interface, and building a separate plain-language Product page.

**Architecture:** The selected Rebirth prototype remains the animated conversion page. A new static Product page reuses the shared design system and adds one isolated watchdog canvas scene. A shared early-access module owns validation, network transport, and form states on both pages; the production form endpoint remains an explicit deployment dependency and the UI never simulates success.

**Tech Stack:** Static HTML, CSS, native ES modules, Canvas 2D, Node's built-in test runner, Chrome DevTools browser verification.

## Global Constraints

- Work only on `codex/autolab-landing-refresh`.
- Apply the first pass only to the Rebirth prototype and the new Product prototype.
- Do not modify root production SEO files during this pass.
- Preserve the floating island, hero terminal, experiment swarm, singularity, gradient, collapse, Rebirth, GPU fabric, and CLI tabs.
- No em dash character may appear in Rebirth or Product-page visible copy or generated UI text.
- The rotating `research`, `training`, and `inference` word plus period must stay together on the second hero line at every supported width.
- Do not invent utilization, savings, throughput, benchmark, or customer claims.
- Do not show a successful signup unless a configured HTTPS endpoint returns success.
- Preserve keyboard focus, live-region announcements, reduced-motion fallbacks, and zero horizontal overflow.

---

### Task 1: Apply the Plain-Language Homepage Copy Contract

**Files:**
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-rebirth-v1.html:6-158`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-core-v1.css:184-250`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-scene-v1.js:299`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-scene-v1.js:24-31`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-v1.css:69-96`

**Interfaces:**
- Consumes: the existing `[data-hero-cycle]`, `[data-hero-cycle-index]`, `#research-run`, `#gpu-efficiency`, `#get-started`, and GPU scene contracts.
- Produces: `#early-access`, `#onboarding-console`, the Product-page navigation target, exact approved homepage copy, and a `.hero-cycle-word` no-wrap wrapper.

- [ ] **Step 1: Write the failing homepage copy and punctuation contracts**

Replace the Rebirth-specific expectations in `autolab-mog-a3-static-v1.test.mjs` and add source-level punctuation checks:

```js
test('rebirth explains the autonomous experiment loop in plain language', async () => {
  const [html, scene, gpuScene] = await Promise.all([
    readFile(new URL('./autolab-mog-a3-rebirth-v1.html', import.meta.url), 'utf8'),
    readFile(new URL('./autolab-mog-a3-scene-v1.js', import.meta.url), 'utf8'),
    readFile(new URL('./autolab-mog-gpu-scene-v1.js', import.meta.url), 'utf8'),
  ]);
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  assert.match(text, /Set a goal and connect your GPUs\. Autolab's agents run experiments, stop jobs once they stop improving or are clearly failing, and use every result to decide what to try next\./);
  assert.match(text, /Tell Autolab what to improve\./);
  assert.match(text, /Choose the metric that matters, such as accuracy, cost, or latency\./);
  assert.match(text, /Turn ideas into experiments\./);
  assert.match(text, /Agents read your code and create concrete changes they can test\./);
  assert.match(text, /Run them across your GPUs\./);
  assert.match(text, /Autolab sends each experiment to the next available machine\./);
  assert.match(text, /Stop wasted work early\./);
  assert.match(text, /Runs stop when they have plateaued or are clearly going to fail\./);
  assert.match(text, /Choose what to try next\./);
  assert.match(text, /Every result helps Autolab propose a better next experiment\./);
  assert.match(text, /Return the best change\./);
  assert.match(text, /You get the winning code, its results, and the history behind it\./);
  assert.match(text, /Autolab watches every job\. When a run stops improving or is clearly failing, it ends the job and gives that GPU to the next experiment\./);
  assert.match(text, /More useful experiments finish without adding more compute\./);
  assert.doesNotMatch(`${html}\n${scene}\n${gpuScene}`, /—/);
});

test('rebirth exposes the Product page and exact conversion targets', async () => {
  const html = await readFile(
    new URL('./autolab-mog-a3-rebirth-v1.html', import.meta.url),
    'utf8',
  );

  assert.match(html, /href="autolab-mog-product-v1\.html"[^>]*>Product</);
  assert.match(html, /href="#research-run"[^>]*>How it works</);
  assert.match(html, /href="https:\/\/docs\.autolab\.ai"[^>]*>Docs</);
  assert.match(html, /href="#early-access"[^>]*>Get early access/);
  assert.match(html, /href="#onboarding-console"[^>]*>\$ curl -fsSL/);
});

test('hero cycle reserves one unbroken word and period', async () => {
  const [html, css] = await Promise.all([
    readFile(new URL('./autolab-mog-a3-rebirth-v1.html', import.meta.url), 'utf8'),
    readFile(new URL('./autolab-mog-core-v1.css', import.meta.url), 'utf8'),
  ]);

  assert.match(
    html,
    /class="hero-cycle-word"><em data-hero-cycle>research<\/em><span class="hero-period">\.<\/span><\/span>/,
  );
  assert.match(css, /\.hero-cycle-word\s*\{[^}]*white-space:\s*nowrap/s);
  assert.match(css, /\.hero-cycle-word\s*\{[^}]*min-width:/s);
});
```

Update the shared-variant contract so `Start researching` remains required only for Slingshot and Loop; Rebirth now requires `Get early access`.

- [ ] **Step 2: Run the focused static test and verify RED**

Run:

```bash
node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs
```

Expected: failures for the old hero paragraph, old six-stage headlines, missing Product link, missing anchors, missing `.hero-cycle-word`, and remaining em dash characters.

- [ ] **Step 3: Apply the exact homepage copy and navigation**

Use this navigation in Rebirth:

```html
<nav class="nav-links" aria-label="Main navigation"><a href="autolab-mog-product-v1.html">Product</a><a href="#research-run">How it works</a><a href="https://docs.autolab.ai">Docs</a></nav>
```

Use this hero content:

```html
<div class="hero-pill">AI model optimization, automated.</div>
<h1 aria-label="Supercharge your research, training, and inference.">
  <span>Supercharge your</span>
  <span class="hero-cycle-line" aria-hidden="true"><span class="hero-cycle-word"><em data-hero-cycle>research</em><span class="hero-period">.</span></span><small data-hero-cycle-index>01 / 03</small></span>
</h1>
<p class="hero-sub">Set a goal and connect your GPUs. Autolab's agents run experiments, stop jobs once they stop improving or are clearly failing, and use every result to decide what to try next.</p>
<div class="hero-actions"><a class="button primary" href="#early-access">Get early access <span>↗</span></a><a class="button" href="https://calendar.superhuman.com/book/11Wx5q95SPgTTclPo4/KrRGA" target="_blank" rel="noopener">Book a demo <span>→</span></a></div>
<a class="hero-install" href="#onboarding-console">$ curl -fsSL app.autolab.ai/install.sh | sh <span>↓</span></a>
```

Use these six research articles:

```html
<article class="research-step active" data-step="0"><span class="step">Goal / 01</span><h3>Tell Autolab what to <em>improve.</em></h3><p>Choose the metric that matters, such as accuracy, cost, or latency.</p><span class="research-key">metric + constraints + evaluation</span></article>
<article class="research-step" data-step="1"><span class="step">Explore / 02</span><h3>Turn ideas into <em>experiments.</em></h3><p>Agents read your code and create concrete changes they can test.</p><span class="research-key">▸ one vector = one experiment</span></article>
<article class="research-step" data-step="2"><span class="step">Run / 03</span><h3>Run them across <em>your GPUs.</em></h3><p>Autolab sends each experiment to the next available machine.</p><span class="research-key">every available GPU joins the queue</span></article>
<article class="research-step" data-step="3"><span class="step">Stop / 04</span><h3>Stop wasted work <em>early.</em></h3><p>Runs stop when they have plateaued or are clearly going to fail.</p><span class="research-key">dead ends stop · evidence remains</span></article>
<article class="research-step" data-step="4"><span class="step">Learn / 05</span><h3>Choose what to try <em>next.</em></h3><p>Every result helps Autolab propose a better next experiment.</p><span class="research-key">result → next experiment</span></article>
<article class="research-step" data-step="5"><span class="step">Return / 06</span><h3>Return the best <em>change.</em></h3><p>You get the winning code, its results, and the history behind it.</p><span class="research-key">winning change → human review</span></article>
```

Change the research head and semantic legend separators to avoid the em dash character. Use `01 / 06` for the index and `line = experiment history` for the legend. Change the title to `Autolab | AI model optimization`.

Use this GPU copy:

```html
<div class="gpu-copy">
  <span class="mono-label">Compute / continuously scheduled</span>
  <h2>More insights. <em>Same GPUs.</em></h2>
  <p>Autolab watches every job. When a run stops improving or is clearly failing, it ends the job and gives that GPU to the next experiment.</p>
  <strong class="gpu-payoff">More useful experiments finish without adding more compute.</strong>
</div>
```

Use these generated GPU phase labels:

```js
const phaseCopy = Object.freeze({
  intake: 'watching every run',
  packing: 'next experiment running',
  pruning: 'GPU reassigned',
  verified: 'best result verified',
});
```

In `autolab-mog-a3-scene-v1.js`, set the research index with:

```js
indexEl.textContent = `0${stage + 1} / 06`;
```

- [ ] **Step 4: Lock the hero word to one second line and style the GPU payoff**

Add the following focused CSS:

```css
.hero-cycle-word {
  min-width: 4.7em;
  display: inline-flex;
  align-items: baseline;
  white-space: nowrap;
}

.hero-cycle-line small {
  flex: 0 0 auto;
}

.gpu-payoff {
  display: block;
  margin-top: 12px;
  color: var(--mint);
  font: 500 9px/1.5 "IBM Plex Mono",monospace;
  letter-spacing: .1em;
  text-transform: uppercase;
}

@media (max-width: 540px) {
  .hero-cycle-word { min-width: 4.55em; }
  .hero-cycle-line small { margin-left: 9px; }
}
```

Keep the current word animation target on the nested `[data-hero-cycle]` element.

- [ ] **Step 5: Run the focused tests and syntax checks**

Run:

```bash
node --test \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-hero-cycle-v1.test.mjs \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-motion-v1.test.mjs
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-scene-v1.js
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-scene-v1.js
git diff --check
```

Expected: all focused tests pass, syntax checks exit zero, and the diff has no whitespace errors.

- [ ] **Step 6: Browser-check the first visual checkpoint**

At 1440×913, 768×900, and 390×844, verify:

- The green rotating word and period remain together on line two for all three words.
- The counter does not shift or clip.
- The new hero paragraph does not collide with actions.
- All six research headlines fit their authored moments.
- The GPU payoff remains above the instrument at desktop and mobile sizes.
- The research and GPU animations remain unchanged except for their labels.

- [ ] **Step 7: Commit the homepage pass**

```bash
git add \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-rebirth-v1.html \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-core-v1.css \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-scene-v1.js \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-scene-v1.js \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-v1.css
git commit -m "copy: explain the autonomous experiment loop"
```

---

### Task 2: Build the Shared Early-Access Form

**Files:**
- Create: `.superpowers/brainstorm/39694-1784238160/content/autolab-early-access-v1.js`
- Create: `.superpowers/brainstorm/39694-1784238160/content/autolab-early-access-v1.test.mjs`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-rebirth-v1.html:126-160`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-core-v1.css:257-340`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs`

**Interfaces:**
- Consumes: `<form data-early-access data-endpoint data-source>`, `[data-early-access-email]`, `[data-early-access-submit]`, and `[data-early-access-status]`.
- Produces: `isValidEmail(value: string): boolean`, `sendEarlyAccess({ endpoint, email, source, timestamp?, fetchImpl? }): Promise<{ ok: boolean, reason: string }>`, `initEarlyAccessForms(root?): void`, and browser initialization for every `[data-early-access]` form.

- [ ] **Step 1: Write the failing transport tests**

Create `autolab-early-access-v1.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidEmail,
  sendEarlyAccess,
} from './autolab-early-access-v1.js';

test('email validation accepts useful addresses and rejects incomplete input', () => {
  assert.equal(isValidEmail('researcher@example.com'), true);
  assert.equal(isValidEmail('  researcher@example.com  '), true);
  assert.equal(isValidEmail('researcher@'), false);
  assert.equal(isValidEmail(''), false);
});

test('missing endpoint fails without pretending to submit', async () => {
  let calls = 0;
  const result = await sendEarlyAccess({
    endpoint: '',
    email: 'researcher@example.com',
    source: 'homepage',
    fetchImpl: async () => { calls += 1; },
  });
  assert.deepEqual(result, { ok: false, reason: 'missing-endpoint' });
  assert.equal(calls, 0);
});

test('non-HTTPS endpoint fails before a request is made', async () => {
  let calls = 0;
  const result = await sendEarlyAccess({
    endpoint: 'http://forms.example.test/early-access',
    email: 'researcher@example.com',
    source: 'homepage',
    fetchImpl: async () => { calls += 1; },
  });
  assert.deepEqual(result, { ok: false, reason: 'invalid-endpoint' });
  assert.equal(calls, 0);
});

test('successful submission sends the normalized payload once', async () => {
  const calls = [];
  const result = await sendEarlyAccess({
    endpoint: 'https://forms.example.test/early-access',
    email: '  researcher@example.com  ',
    source: 'product',
    timestamp: '2026-07-21T12:00:00.000Z',
    fetchImpl: async (...args) => {
      calls.push(args);
      return { ok: true };
    },
  });

  assert.deepEqual(result, { ok: true, reason: 'success' });
  assert.equal(calls.length, 1);
  assert.deepEqual(JSON.parse(calls[0][1].body), {
    email: 'researcher@example.com',
    source: 'product',
    submittedAt: '2026-07-21T12:00:00.000Z',
  });
});

test('failed requests return failure instead of success', async () => {
  const result = await sendEarlyAccess({
    endpoint: 'https://forms.example.test/early-access',
    email: 'researcher@example.com',
    source: 'homepage',
    fetchImpl: async () => ({ ok: false }),
  });
  assert.deepEqual(result, { ok: false, reason: 'request-failed' });
});
```

- [ ] **Step 2: Run the transport test and verify RED**

Run:

```bash
node --test .superpowers/brainstorm/39694-1784238160/content/autolab-early-access-v1.test.mjs
```

Expected: FAIL because `autolab-early-access-v1.js` does not exist.

- [ ] **Step 3: Implement the pure form transport**

Create `autolab-early-access-v1.js` with these exports:

```js
export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function sendEarlyAccess({
  endpoint,
  email,
  source,
  timestamp = new Date().toISOString(),
  fetchImpl = globalThis.fetch,
}) {
  const normalizedEmail = email.trim();
  if (!isValidEmail(normalizedEmail)) {
    return { ok: false, reason: 'invalid-email' };
  }
  if (!endpoint) {
    return { ok: false, reason: 'missing-endpoint' };
  }
  try {
    if (new URL(endpoint).protocol !== 'https:') {
      return { ok: false, reason: 'invalid-endpoint' };
    }
  } catch {
    return { ok: false, reason: 'invalid-endpoint' };
  }

  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: normalizedEmail,
        source,
        submittedAt: timestamp,
      }),
    });
    return response.ok
      ? { ok: true, reason: 'success' }
      : { ok: false, reason: 'request-failed' };
  } catch {
    return { ok: false, reason: 'request-failed' };
  }
}
```

- [ ] **Step 4: Run the transport tests and verify GREEN**

Run:

```bash
node --test .superpowers/brainstorm/39694-1784238160/content/autolab-early-access-v1.test.mjs
```

Expected: five passing tests.

- [ ] **Step 5: Write the failing form-state interaction tests**

Add `initEarlyAccessForms` to the existing import:

```js
import {
  initEarlyAccessForms,
  isValidEmail,
  sendEarlyAccess,
} from './autolab-early-access-v1.js';
```

Append this dependency-free DOM harness and the three interaction tests to `autolab-early-access-v1.test.mjs`:

```js
function createFormHarness({ email = '', endpoint = '', fetchImpl = async () => ({ ok: true }) } = {}) {
  const listeners = {};
  const input = { value: email, disabled: false, focused: false, focus() { this.focused = true; } };
  const button = { disabled: false };
  const status = { textContent: '' };
  const form = {
    dataset: { endpoint, source: 'homepage' },
    addEventListener(type, listener) { listeners[type] = listener; },
    querySelector(selector) {
      return {
        '[data-early-access-email]': input,
        '[data-early-access-submit]': button,
        '[data-early-access-status]': status,
      }[selector];
    },
  };
  const root = {
    defaultView: { fetch: fetchImpl },
    querySelectorAll() { return [form]; },
  };
  initEarlyAccessForms(root);
  return {
    form,
    input,
    button,
    status,
    submit: () => listeners.submit({ preventDefault() {} }),
  };
}

test('invalid form input focuses the email field and announces the problem', async () => {
  const harness = createFormHarness({ email: 'researcher@' });
  await harness.submit();
  assert.equal(harness.form.dataset.state, 'invalid');
  assert.equal(harness.status.textContent, 'Enter a valid email address.');
  assert.equal(harness.input.focused, true);
  assert.equal(harness.button.disabled, false);
});

test('form stays pending until one successful request completes', async () => {
  let resolveRequest;
  let calls = 0;
  const harness = createFormHarness({
    email: 'researcher@example.com',
    endpoint: 'https://forms.example.test/early-access',
    fetchImpl: async () => {
      calls += 1;
      return new Promise(resolve => { resolveRequest = resolve; });
    },
  });

  const submission = harness.submit();
  assert.equal(harness.form.dataset.state, 'pending');
  assert.equal(harness.status.textContent, 'Requesting access...');
  assert.equal(harness.button.disabled, true);
  await harness.submit();
  assert.equal(calls, 1);

  resolveRequest({ ok: true });
  await submission;
  assert.equal(harness.form.dataset.state, 'success');
  assert.equal(harness.status.textContent, "You're on the list. We'll be in touch.");
  assert.equal(harness.input.disabled, true);
});

test('missing endpoint and server failure remain editable and never show success', async () => {
  for (const endpoint of ['', 'https://forms.example.test/early-access']) {
    const harness = createFormHarness({
      email: 'researcher@example.com',
      endpoint,
      fetchImpl: async () => ({ ok: false }),
    });
    await harness.submit();
    assert.equal(harness.form.dataset.state, 'failure');
    assert.equal(harness.status.textContent, 'Could not submit. Try again or email team@autolab.ai.');
    assert.equal(harness.button.disabled, false);
    assert.equal(harness.input.disabled, false);
  }
});
```

- [ ] **Step 6: Run the interaction tests and verify RED**

Run:

```bash
node --test .superpowers/brainstorm/39694-1784238160/content/autolab-early-access-v1.test.mjs
```

Expected: FAIL because `initEarlyAccessForms` is not exported yet.

- [ ] **Step 7: Add the DOM controller and exact user states**

Append this focused browser initializer to `autolab-early-access-v1.js`:

```js
const messages = Object.freeze({
  invalid: 'Enter a valid email address.',
  pending: 'Requesting access...',
  success: "You're on the list. We'll be in touch.",
  failure: 'Could not submit. Try again or email team@autolab.ai.',
});

export function initEarlyAccessForms(root = document) {
  const view = root.defaultView || window;
  for (const form of root.querySelectorAll('[data-early-access]')) {
    const input = form.querySelector('[data-early-access-email]');
    const button = form.querySelector('[data-early-access-submit]');
    const status = form.querySelector('[data-early-access-status]');
    if (!input || !button || !status) continue;

    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (button.disabled) return;
      if (!isValidEmail(input.value)) {
        status.textContent = messages.invalid;
        form.dataset.state = 'invalid';
        input.focus();
        return;
      }

      button.disabled = true;
      status.textContent = messages.pending;
      form.dataset.state = 'pending';
      const result = await sendEarlyAccess({
        endpoint: form.dataset.endpoint || '',
        email: input.value,
        source: form.dataset.source || 'unknown',
        fetchImpl: (...args) => view.fetch(...args),
      });

      if (result.ok) {
        status.textContent = messages.success;
        form.dataset.state = 'success';
        input.disabled = true;
        return;
      }

      status.textContent = messages.failure;
      form.dataset.state = 'failure';
      button.disabled = false;
    });
  }
}

if (typeof document !== 'undefined') initEarlyAccessForms();
```

- [ ] **Step 8: Run the interaction tests and verify GREEN**

Run:

```bash
node --test .superpowers/brainstorm/39694-1784238160/content/autolab-early-access-v1.test.mjs
```

Expected: eight passing tests, including pending-state duplicate prevention and both configured and unconfigured failure paths.

- [ ] **Step 9: Replace the homepage onboarding copy with the form plus preserved console**

Keep `<section class="get-started" id="get-started">`. Use this left column:

```html
<div class="get-started-copy">
  <span class="mono-label eyebrow-mint">Start with Autolab</span>
  <h2>Get early <em>access.</em></h2>
  <p>Leave your email and we will send you access details.</p>
  <form class="early-access-form" id="early-access" data-early-access data-endpoint="" data-source="homepage" novalidate>
    <label for="early-access-email-home">Email address</label>
    <div class="early-access-control">
      <input id="early-access-email-home" data-early-access-email type="email" name="email" autocomplete="email" inputmode="email" required placeholder="you@example.com">
      <button class="button primary" data-early-access-submit type="submit">Request access <span>↗</span></button>
    </div>
    <p class="early-access-status" data-early-access-status role="status" aria-live="polite"></p>
  </form>
  <a class="early-access-demo" href="https://calendar.superhuman.com/book/11Wx5q95SPgTTclPo4/KrRGA" target="_blank" rel="noopener">Prefer to talk? Book a demo →</a>
</div>
```

Add `id="onboarding-console"` to the existing console and add `Already have access?` as its visible eyebrow without changing the tablist or commands. Load `autolab-early-access-v1.js` as a module after the onboarding module.

Use this closing copy and target:

```html
<section class="a3-outro" id="outro"><div><span class="mono-label eyebrow-mint">From GPU time to better models</span><h2>Every experiment improves <em>the next one.</em></h2><p>Autolab keeps the code, metrics, and history behind every run. You review the winning change and decide what ships.</p><a class="button primary" href="#early-access">Get early access <span>↗</span></a></div></section>
```

- [ ] **Step 10: Style the form without shrinking the CLI console**

Add shared form styles to `autolab-mog-core-v1.css`:

```css
.early-access-form { max-width: 540px; margin-top: 30px; }
.early-access-form label { display: block; margin-bottom: 9px; color: var(--muted); font: 500 9px/1 "IBM Plex Mono",monospace; letter-spacing: .12em; text-transform: uppercase; }
.early-access-control { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 8px; }
.early-access-control input { min-width: 0; height: 52px; padding: 0 16px; border: 1px solid #aaa69a; border-radius: 4px; background: rgba(255,255,255,.46); color: var(--ink); font: 400 14px/1 "IBM Plex Sans",sans-serif; outline: none; }
.early-access-control input:focus { border-color: var(--mint-deep); box-shadow: 0 0 0 3px rgba(12,138,95,.1); }
.early-access-control .button { min-width: 170px; }
.early-access-status { min-height: 20px; margin-top: 10px; color: var(--muted); font: 400 10px/1.5 "IBM Plex Mono",monospace; }
.early-access-form[data-state="success"] .early-access-status { color: var(--mint-deep); }
.early-access-form[data-state="invalid"] .early-access-status,
.early-access-form[data-state="failure"] .early-access-status { color: #9e4937; }
.early-access-demo { display: inline-block; margin-top: 15px; color: var(--muted); font: 500 10px/1.4 "IBM Plex Mono",monospace; }
.onboarding-access-label { display: block; margin-bottom: 12px; color: var(--mint-deep); font: 500 9px/1 "IBM Plex Mono",monospace; letter-spacing: .12em; text-transform: uppercase; }

@media (max-width: 540px) {
  .early-access-control { grid-template-columns: 1fr; }
  .early-access-control .button { width: 100%; }
}
```

- [ ] **Step 11: Extend static tests for form semantics and anchors**

Append this contract to `autolab-mog-a3-static-v1.test.mjs`:

```js
test('rebirth exposes an accessible early-access form and preserves onboarding', async () => {
  const html = await readFile(
    new URL('./autolab-mog-a3-rebirth-v1.html', import.meta.url),
    'utf8',
  );

  assert.match(html, /<form[^>]*id="early-access"[^>]*data-early-access[^>]*data-endpoint=""[^>]*data-source="homepage"/);
  assert.match(html, /<label for="early-access-email-home">Email address<\/label>/);
  assert.match(html, /id="early-access-email-home"[^>]*data-early-access-email[^>]*type="email"/);
  assert.match(html, /data-early-access-status[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(html, /id="onboarding-console"[^>]*data-onboarding-tabs/);
  assert.equal((html.match(/role="tab"/g) || []).length, 3);
  assert.equal((html.match(/role="tabpanel"/g) || []).length, 3);
  assert.match(html, /<script type="module" src="autolab-early-access-v1\.js"><\/script>/);
  assert.match(html, /<section class="a3-outro"[\s\S]*href="#early-access"/);
});
```

- [ ] **Step 12: Run the full focused form suite**

Run:

```bash
node --test \
  .superpowers/brainstorm/39694-1784238160/content/autolab-early-access-v1.test.mjs \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-onboarding-v1.test.mjs \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-early-access-v1.js
git diff --check
```

Expected: all tests pass, JavaScript parses, and no whitespace errors appear.

- [ ] **Step 13: Commit the shared form**

```bash
git add \
  .superpowers/brainstorm/39694-1784238160/content/autolab-early-access-v1.js \
  .superpowers/brainstorm/39694-1784238160/content/autolab-early-access-v1.test.mjs \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-rebirth-v1.html \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-core-v1.css
git commit -m "feat: add early access conversion path"
```

---

### Task 3: Build the Separate Plain-Language Product Page

**Files:**
- Create: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.html`
- Create: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.css`
- Create: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-static-v1.test.mjs`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-rebirth-v1.html`

**Interfaces:**
- Consumes: `autolab-mog-core-v1.css`, shared island navigation classes, shared `.button` and early-access form classes, `autolab-early-access-v1.js`, and the existing calendar and docs URLs.
- Produces: `autolab-mog-product-v1.html`, five ordered `[data-product-feature]` sections, `#watchdog-canvas`, and a Product-page `#early-access` form.

- [ ] **Step 1: Write the failing Product-page static contract**

Create `autolab-mog-product-static-v1.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Product page explains the complete useful-GPU loop in order', async () => {
  const html = await readFile(
    new URL('./autolab-mog-product-v1.html', import.meta.url),
    'utf8',
  );
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const headlines = [
    'Connect the GPUs you already have.',
    'Watch every experiment as it runs.',
    'Stop runs when they stop being useful.',
    'Use every result to choose what comes next.',
    'Review what worked.',
  ];

  let previous = -1;
  for (const headline of headlines) {
    const index = text.indexOf(headline);
    assert.ok(index > previous, `missing or unordered headline: ${headline}`);
    previous = index;
  }
  assert.equal((html.match(/data-product-feature/g) || []).length, 5);
  assert.match(text, /Your GPUs, running the next useful experiment\./);
  assert.match(text, /Autolab connects your compute, watches every training run, stops wasted work, and uses each result to decide what to try next\./);
  assert.match(text, /Autolab connects machines across your cluster or cloud account and treats them as one experiment pool\. A spare GPU and a multi-node cluster participate in the same queue\./);
  assert.match(text, /Autolab reads training metrics, logs, failures, checkpoints, and evaluation results while each job is running\./);
  assert.match(text, /Autolab's watchdog models detect experiments that have plateaued or are clearly likely to fail\. Those jobs stop before they consume more GPU time\./);
  assert.match(text, /Completed, failed, and stopped experiments all produce information\. Autolab uses that evidence to propose the next changes worth testing\./);
  assert.match(text, /Winning experiments arrive with the code change, metrics, logs, and experiment history behind them\. Your team decides what ships\./);
  assert.match(text, /Your infrastructure or ours\./);
  assert.match(text, /Run Autolab on your cluster or in your cloud account\. Code, data, and model weights can stay inside your network\./);
  assert.doesNotMatch(html, /—/);
});

test('Product page shares navigation and early-access contracts', async () => {
  const html = await readFile(
    new URL('./autolab-mog-product-v1.html', import.meta.url),
    'utf8',
  );

  assert.match(html, /href="autolab-mog-a3-rebirth-v1\.html" class="wordmark"/);
  assert.match(html, /href="autolab-mog-a3-rebirth-v1\.html#research-run"[^>]*>How it works/);
  assert.match(html, /href="https:\/\/docs\.autolab\.ai"[^>]*>Docs/);
  assert.match(html, /id="watchdog-canvas"/);
  assert.match(html, /id="early-access"[^>]*data-early-access/);
  assert.match(html, /autolab-early-access-v1\.js/);
  assert.doesNotMatch(html, /role="tablist"/);
});
```

- [ ] **Step 2: Run the Product-page static test and verify RED**

Run:

```bash
node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-static-v1.test.mjs
```

Expected: FAIL because the Product page does not exist.

- [ ] **Step 3: Create the Product-page document and exact content**

Create one semantic document with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Product | Autolab</title>
  <meta name="description" content="Autolab connects your GPUs, watches every training run, stops wasted work, and uses each result to choose the next experiment.">
  <link rel="icon" href="data:,">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Serif:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="autolab-mog-core-v1.css">
  <link rel="stylesheet" href="autolab-mog-product-v1.css">
</head>
<body class="product-page">
  <div class="grain" aria-hidden="true"></div>
  <header class="topbar island" id="topbar">
    <div class="nav-shell">
      <a href="autolab-mog-a3-rebirth-v1.html" class="wordmark">autolab<span class="brand-caret"></span></a>
      <div class="nav-center"><nav class="nav-links" aria-label="Main navigation"><a aria-current="page" href="autolab-mog-product-v1.html">Product</a><a href="autolab-mog-a3-rebirth-v1.html#research-run">How it works</a><a href="https://docs.autolab.ai">Docs</a></nav></div>
      <a class="nav-cta" href="https://calendar.superhuman.com/book/11Wx5q95SPgTTclPo4/KrRGA" target="_blank" rel="noopener">Book a demo <span>↗</span></a>
    </div>
  </header>
  <main>
    <section class="product-hero">
      <div><span class="mono-label eyebrow-mint">The Autolab platform</span><h1>Your GPUs, running the next <em>useful experiment.</em></h1><p>Autolab connects your compute, watches every training run, stops wasted work, and uses each result to decide what to try next.</p><div class="hero-actions"><a class="button primary" href="#early-access">Get early access <span>↗</span></a><a class="button" href="https://calendar.superhuman.com/book/11Wx5q95SPgTTclPo4/KrRGA" target="_blank" rel="noopener">Book a demo <span>→</span></a></div></div>
      <div class="product-loop" aria-hidden="true"><span><small>01</small>CONNECT</span><span><small>02</small>WATCH</span><span><small>03</small>STOP</span><span><small>04</small>NEXT</span></div>
    </section>
    <section class="product-feature" data-product-feature><div class="product-copy"><span class="mono-label">Compute / 01</span><h2>Connect the GPUs you already have.</h2><p>Autolab connects machines across your cluster or cloud account and treats them as one experiment pool. A spare GPU and a multi-node cluster participate in the same queue.</p></div><div class="compute-map" aria-hidden="true"><div class="compute-nodes"><i><b>GPU 01</b><small>A100</small></i><i><b>GPU 02</b><small>A100</small></i><i><b>GPU 03</b><small>H100</small></i><i><b>GPU 04</b><small>4090</small></i><i><b>GPU 05</b><small>A100</small></i><i><b>GPU 06</b><small>H100</small></i><i><b>GPU 07</b><small>4090</small></i><i><b>GPU 08</b><small>A100</small></i></div><span class="compute-route"></span><strong>AUTOLAB SCHEDULER</strong></div></section>
    <section class="product-feature reverse" data-product-feature><div class="product-copy"><span class="mono-label">Observe / 02</span><h2>Watch every experiment as it runs.</h2><p>Autolab reads training metrics, logs, failures, checkpoints, and evaluation results while each job is running.</p></div><div class="jobs-instrument" aria-hidden="true"><div class="product-instrument-head"><span>LIVE JOBS</span><b>WATCHING 04</b></div><div class="job-row"><span>EXP-011</span><svg viewBox="0 0 96 24"><polyline points="0,22 18,18 36,15 54,10 72,8 96,4"></polyline></svg><i>RUNNING</i><b>loss 1.42</b></div><div class="job-row"><span>EXP-012</span><svg viewBox="0 0 96 24"><polyline points="0,21 18,17 36,12 54,11 72,7 96,5"></polyline></svg><i>CHECKPOINT</i><b>loss 1.18</b></div><div class="job-row warning"><span>EXP-013</span><svg viewBox="0 0 96 24"><polyline points="0,20 18,13 36,9 54,8 72,8 96,8"></polyline></svg><i>PLATEAU</i><b>loss 1.67</b></div><div class="job-row"><span>EXP-014</span><svg viewBox="0 0 96 24"><polyline points="0,21 18,19 36,13 54,9 72,6 96,3"></polyline></svg><i>EVALUATING</i><b>score .84</b></div></div></section>
    <section class="product-feature watchdog-feature" data-product-feature><div class="product-copy"><span class="mono-label">Watchdog / 03</span><h2>Stop runs when they stop being useful.</h2><p>Autolab's watchdog models detect experiments that have plateaued or are clearly likely to fail. Those jobs stop before they consume more GPU time.</p></div><div class="watchdog-instrument" aria-hidden="true"><canvas id="watchdog-canvas" aria-hidden="true"></canvas></div></section>
    <section class="product-feature reverse" data-product-feature><div class="product-copy"><span class="mono-label">Decide / 04</span><h2>Use every result to choose what comes next.</h2><p>Completed, failed, and stopped experiments all produce information. Autolab uses that evidence to propose the next changes worth testing.</p></div><div class="experiment-queue" aria-hidden="true"><div class="queue-results"><span>COMPLETED</span><span>STOPPED</span><span>FAILED</span><span>IMPROVED</span></div><b>RESULTS</b><i>→</i><strong>NEXT EXPERIMENT</strong></div></section>
    <section class="product-feature" data-product-feature><div class="product-copy"><span class="mono-label">Review / 05</span><h2>Review what worked.</h2><p>Winning experiments arrive with the code change, metrics, logs, and experiment history behind them. Your team decides what ships.</p></div><div class="product-diff" aria-hidden="true"><div class="product-diff-head"><span>EXP-018 / WINNER</span><b>READY TO REVIEW</b></div><pre><i>  optimizer:</i> adamw&#10;<span>- learning_rate: 3e-4</span>&#10;<b>+ learning_rate: 1.8e-4</b>&#10;<span>- warmup_steps: 100</span>&#10;<b>+ warmup_steps: 240</b></pre><div class="product-diff-foot"><span>METRIC IMPROVED</span><strong>VIEW CHANGE ↗</strong></div></div></section>
    <aside class="product-infra"><span class="mono-label">Deployment</span><h2>Your infrastructure or ours.</h2><p>Run Autolab on your cluster or in your cloud account. Code, data, and model weights can stay inside your network.</p></aside>
    <section class="product-access"><div><span class="mono-label eyebrow-mint">Start with Autolab</span><h2>Get early <em>access.</em></h2><p>Leave your email and we will send you access details.</p></div><form class="early-access-form" id="early-access" data-early-access data-endpoint="" data-source="product" novalidate><label for="early-access-email-product">Email address</label><div class="early-access-control"><input id="early-access-email-product" data-early-access-email type="email" name="email" autocomplete="email" inputmode="email" required placeholder="you@example.com"><button class="button primary" data-early-access-submit type="submit">Request access <span>↗</span></button></div><p class="early-access-status" data-early-access-status role="status" aria-live="polite"></p><a class="early-access-demo" href="https://calendar.superhuman.com/book/11Wx5q95SPgTTclPo4/KrRGA" target="_blank" rel="noopener">Prefer to talk? Book a demo →</a></form></section>
  </main>
  <script type="module" src="autolab-early-access-v1.js"></script>
</body>
</html>
```

- [ ] **Step 4: Create the Product-page layout and visual system**

Create `autolab-mog-product-v1.css` with this complete page-specific layout. It uses only tokens and typefaces already defined by `autolab-mog-core-v1.css`:

```css
.product-page { background: var(--paper); color: var(--ink); }
.product-page main { overflow: clip; }
.product-page .mono-label { display: block; margin-bottom: 18px; color: var(--muted); font: 500 9px/1 "IBM Plex Mono",monospace; letter-spacing: .14em; text-transform: uppercase; }
.product-page .eyebrow-mint { color: var(--mint-deep); }

.product-hero,
.product-feature,
.product-infra,
.product-access { width: min(1440px,90vw); margin-inline: auto; }

.product-hero { min-height: 760px; padding: 184px 0 120px; display: grid; grid-template-columns: minmax(0,1.08fr) minmax(420px,.92fr); gap: clamp(56px,8vw,132px); align-items: center; }
.product-hero h1 { max-width: 760px; margin: 0; font: 400 clamp(64px,7.2vw,116px)/.91 "IBM Plex Serif",serif; letter-spacing: -.062em; }
.product-hero h1 em { color: var(--mint-deep); font-weight: 400; }
.product-hero p { max-width: 58ch; margin: 30px 0 0; color: var(--muted); font: 400 17px/1.72 "IBM Plex Sans",sans-serif; }
.product-hero .hero-actions { margin-top: 34px; }
.product-loop { min-height: 470px; padding: 30px; border: 1px solid var(--line); border-radius: 7px; background: rgba(255,255,255,.24); display: grid; grid-template-columns: 1fr 1fr; gap: 1px; box-shadow: 0 36px 90px rgba(26,31,28,.08); transform: rotate(2deg); }
.product-loop span { position: relative; display: grid; place-items: center; border: 1px solid var(--line); color: var(--ink); font: 500 12px/1 "IBM Plex Mono",monospace; letter-spacing: .14em; }
.product-loop span::after { content: ""; position: absolute; right: -12px; bottom: -12px; width: 23px; height: 23px; border: 1px solid var(--mint-deep); border-radius: 50%; background: var(--paper); z-index: 2; }
.product-loop span:last-child::after { background: var(--mint); box-shadow: 0 0 32px rgba(40,210,153,.45); }
.product-loop small { position: absolute; top: 16px; left: 17px; color: var(--muted); font-size: 8px; }

.product-feature { min-height: 720px; padding: 112px 0; border-top: 1px solid var(--line); display: grid; grid-template-columns: minmax(0,.78fr) minmax(480px,1.22fr); gap: clamp(50px,8vw,128px); align-items: center; }
.product-feature.reverse { grid-template-columns: minmax(480px,1.22fr) minmax(0,.78fr); }
.product-feature.reverse .product-copy { grid-column: 2; }
.product-feature.reverse > :last-child { grid-row: 1; grid-column: 1; }
.product-copy h2 { max-width: 650px; margin: 0; font: 400 clamp(48px,5vw,78px)/.98 "IBM Plex Serif",serif; letter-spacing: -.048em; }
.product-copy p { max-width: 48ch; margin: 25px 0 0; color: var(--muted); font: 400 16px/1.72 "IBM Plex Sans",sans-serif; }

.compute-map,
.jobs-instrument,
.experiment-queue,
.product-diff { min-height: 440px; border: 1px solid var(--line); border-radius: 6px; background: rgba(255,255,255,.26); box-shadow: 0 28px 68px rgba(26,31,28,.06); }
.compute-map { padding: 34px; display: grid; grid-template-columns: 1fr 86px 144px; gap: 20px; align-items: center; }
.compute-nodes { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 10px; }
.compute-nodes i { min-height: 62px; padding: 12px; border: 1px solid var(--line); border-radius: 3px; display: flex; flex-direction: column; justify-content: space-between; font-style: normal; }
.compute-nodes b,
.compute-nodes small { font: 500 9px/1 "IBM Plex Mono",monospace; letter-spacing: .08em; }
.compute-nodes small { color: var(--muted); }
.compute-route { height: 1px; background: linear-gradient(90deg,var(--line),var(--mint-deep)); position: relative; }
.compute-route::before,
.compute-route::after { content: ""; position: absolute; width: 6px; height: 6px; border-radius: 50%; background: var(--mint); top: -3px; }
.compute-route::before { left: 12%; }
.compute-route::after { right: 12%; box-shadow: 0 0 16px var(--mint); }
.compute-map > strong { min-height: 144px; border: 1px solid var(--mint-deep); display: grid; place-items: center; text-align: center; color: var(--mint-deep); font: 500 10px/1.5 "IBM Plex Mono",monospace; letter-spacing: .11em; }

.jobs-instrument { padding: 30px; display: flex; flex-direction: column; justify-content: center; }
.product-instrument-head,
.product-diff-head,
.product-diff-foot { display: flex; justify-content: space-between; gap: 20px; color: var(--muted); font: 500 9px/1 "IBM Plex Mono",monospace; letter-spacing: .1em; }
.product-instrument-head { padding-bottom: 18px; border-bottom: 1px solid var(--line); }
.product-instrument-head b,
.product-diff-head b { color: var(--mint-deep); }
.job-row { min-height: 70px; border-bottom: 1px solid var(--line); display: grid; grid-template-columns: .75fr 1fr 1fr auto; gap: 20px; align-items: center; font: 500 10px/1 "IBM Plex Mono",monospace; }
.job-row svg { width: 100%; height: 24px; overflow: visible; }
.job-row polyline { fill: none; stroke: var(--mint-deep); stroke-width: 1.4; vector-effect: non-scaling-stroke; }
.job-row i { color: var(--mint-deep); font-style: normal; }
.job-row i::before { content: ""; display: inline-block; width: 6px; height: 6px; margin-right: 8px; border-radius: 50%; background: var(--mint); }
.job-row.warning i { color: #9d6b19; }
.job-row.warning i::before { background: #d8a447; }
.job-row b { color: var(--muted); font-weight: 400; }

.watchdog-instrument { min-height: 440px; aspect-ratio: 16/10; border: 1px solid #31433b; border-radius: 6px; background: #0c1210; overflow: hidden; box-shadow: 0 30px 80px rgba(6,14,11,.18); }
.watchdog-instrument canvas { display: block; width: 100%; height: 100%; }

.experiment-queue { padding: 34px; display: grid; grid-template-columns: minmax(0,1fr) auto auto minmax(150px,.68fr); gap: 24px; align-items: center; }
.queue-results { display: grid; gap: 9px; }
.queue-results span { min-height: 48px; padding: 0 14px; border: 1px solid var(--line); display: flex; align-items: center; font: 500 9px/1 "IBM Plex Mono",monospace; letter-spacing: .08em; }
.experiment-queue > b,
.experiment-queue > strong { color: var(--mint-deep); font: 500 10px/1.5 "IBM Plex Mono",monospace; letter-spacing: .1em; text-align: center; }
.experiment-queue > i { color: var(--mint-deep); font: 400 26px/1 "IBM Plex Serif",serif; }
.experiment-queue > strong { min-height: 150px; padding: 18px; border: 1px solid var(--mint-deep); display: grid; place-items: center; }

.product-diff { padding: 30px; display: grid; grid-template-rows: auto 1fr auto; }
.product-diff-head { padding-bottom: 18px; border-bottom: 1px solid var(--line); }
.product-diff pre { margin: 0; padding: 42px 6px; overflow: hidden; color: var(--ink); font: 400 12px/2 "IBM Plex Mono",monospace; }
.product-diff pre i { color: var(--muted); font-style: normal; }
.product-diff pre span { display: block; color: #9e4937; }
.product-diff pre b { display: block; color: var(--mint-deep); font-weight: 500; }
.product-diff-foot { padding-top: 18px; border-top: 1px solid var(--line); }
.product-diff-foot strong { color: var(--mint-deep); }

.product-infra { margin-top: 20px; margin-bottom: 112px; padding: 50px; border: 1px solid var(--line); border-left: 4px solid var(--mint-deep); display: grid; grid-template-columns: .65fr 1fr 1fr; gap: 40px; align-items: start; }
.product-infra h2 { margin: 0; font: 400 clamp(36px,4vw,58px)/1 "IBM Plex Serif",serif; letter-spacing: -.04em; }
.product-infra p { margin: 0; color: var(--muted); font: 400 16px/1.7 "IBM Plex Sans",sans-serif; }
.product-access { margin-bottom: 80px; padding: 92px 6vw; border-radius: 7px; background: var(--ink); color: var(--paper); display: grid; grid-template-columns: .8fr 1.2fr; gap: clamp(48px,8vw,112px); align-items: center; }
.product-access h2 { margin: 0; font: 400 clamp(52px,5.2vw,82px)/.95 "IBM Plex Serif",serif; letter-spacing: -.05em; }
.product-access h2 em { color: var(--mint); font-weight: 400; }
.product-access > div p { max-width: 38ch; color: #a9b0ac; font: 400 15px/1.7 "IBM Plex Sans",sans-serif; }
.product-access .early-access-control input { border-color: #46514c; background: rgba(255,255,255,.04); color: var(--paper); }
.product-access .early-access-demo { color: #a9b0ac; }

@media (max-width: 900px) {
  .product-hero,
  .product-feature,
  .product-feature.reverse,
  .product-access { grid-template-columns: 1fr; }
  .product-hero { min-height: auto; padding: 150px 0 82px; }
  .product-loop { min-height: 360px; transform: none; }
  .product-feature { min-height: 0; padding: 86px 0; }
  .product-feature.reverse .product-copy,
  .product-feature.reverse > :last-child { grid-column: 1; }
  .product-feature.reverse .product-copy { grid-row: 1; }
  .product-feature.reverse > :last-child { grid-row: 2; }
  .product-infra { grid-template-columns: 1fr; }
}

@media (max-width: 540px) {
  .product-hero,
  .product-feature,
  .product-infra,
  .product-access { width: calc(100vw - 36px); }
  .product-hero h1 { font-size: clamp(56px,18vw,76px); }
  .product-copy h2 { font-size: 48px; }
  .product-loop { min-height: 310px; padding: 14px; }
  .product-feature { padding: 72px 0; gap: 38px; }
  .compute-map { min-height: 520px; grid-template-columns: 1fr; }
  .compute-route { width: 1px; height: 48px; justify-self: center; background: linear-gradient(var(--line),var(--mint-deep)); }
  .compute-map > strong { min-height: 86px; }
  .jobs-instrument,
  .product-diff { min-height: 380px; padding: 20px; }
  .job-row { grid-template-columns: 1fr auto; gap: 10px; }
  .job-row svg { display: none; }
  .job-row b { grid-column: 1/-1; }
  .watchdog-instrument { min-height: 340px; aspect-ratio: auto; }
  .experiment-queue { min-height: 520px; grid-template-columns: 1fr; }
  .experiment-queue > i { transform: rotate(90deg); justify-self: center; }
  .experiment-queue > strong { min-height: 90px; }
  .product-infra { margin-bottom: 72px; padding: 32px 24px; }
  .product-access { margin-bottom: 18px; padding: 72px 24px; }
}
```

- [ ] **Step 5: Run the Product static contract**

Run:

```bash
node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-static-v1.test.mjs
git diff --check
```

Expected: all Product-page tests pass and the diff contains no whitespace errors.

- [ ] **Step 6: Commit the Product page structure**

```bash
git add \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.html \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.css \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-static-v1.test.mjs \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-rebirth-v1.html
git commit -m "feat: add plain-language Product page"
```

---

### Task 4: Build the Watchdog Handoff Animation

**Files:**
- Create: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-motion-v1.js`
- Create: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-motion-v1.test.mjs`
- Create: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-scene-v1.js`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.html`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-static-v1.test.mjs`

**Interfaces:**
- Consumes: `#watchdog-canvas` inside `.watchdog-instrument`.
- Produces: `WATCHDOG_TIMELINE`, `watchdogStateFor(progress)`, `watchdogCurveAt(x, progress)`, `window.__AUTOLAB_WATCHDOG__.getState()`, and one visibility-aware Canvas renderer.

- [ ] **Step 1: Write the failing watchdog motion tests**

Create `autolab-mog-product-motion-v1.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WATCHDOG_TIMELINE,
  watchdogCurveAt,
  watchdogStateFor,
} from './autolab-mog-product-motion-v1.js';

test('watchdog moves through observe, plateau, stop, reassign, and restart', () => {
  assert.equal(watchdogStateFor(0).phase, 'observing');
  assert.equal(watchdogStateFor(WATCHDOG_TIMELINE.plateau).phase, 'plateau');
  assert.equal(watchdogStateFor(WATCHDOG_TIMELINE.stop).phase, 'stopped');
  assert.equal(watchdogStateFor(WATCHDOG_TIMELINE.reassign).phase, 'reassigned');
  assert.equal(watchdogStateFor(1).phase, 'running-next');
});

test('the first run visibly flattens before it stops', () => {
  const earlyGain = watchdogCurveAt(0.35, 0.35) - watchdogCurveAt(0.15, 0.35);
  const lateGain = watchdogCurveAt(0.9, 0.55) - watchdogCurveAt(0.7, 0.55);
  assert.ok(earlyGain > lateGain * 3);
});

test('reassignment releases the old job before the next one starts', () => {
  const stopped = watchdogStateFor(0.68);
  const reassigned = watchdogStateFor(0.82);
  assert.equal(stopped.oldJobVisible, true);
  assert.equal(stopped.nextJobVisible, false);
  assert.equal(reassigned.oldJobVisible, false);
  assert.equal(reassigned.nextJobVisible, true);
});
```

- [ ] **Step 2: Run the watchdog motion test and verify RED**

Run:

```bash
node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-motion-v1.test.mjs
```

Expected: FAIL because the motion module does not exist.

- [ ] **Step 3: Implement the pure watchdog timeline**

Create `autolab-mog-product-motion-v1.js`:

```js
export const WATCHDOG_TIMELINE = Object.freeze({
  plateau: 0.42,
  stop: 0.61,
  reassign: 0.76,
  restart: 0.88,
});

const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => 1 - Math.pow(1 - clamp(value), 3);

export function watchdogCurveAt(x, progress) {
  const revealedX = Math.min(clamp(x), ease(progress / WATCHDOG_TIMELINE.stop));
  return 1 - Math.exp(-revealedX * 5.2);
}

export function watchdogStateFor(progress) {
  const value = clamp(progress);
  const phase = value < WATCHDOG_TIMELINE.plateau
    ? 'observing'
    : value < WATCHDOG_TIMELINE.stop
      ? 'plateau'
      : value < WATCHDOG_TIMELINE.reassign
        ? 'stopped'
        : value < WATCHDOG_TIMELINE.restart
          ? 'reassigned'
          : 'running-next';
  return {
    progress: value,
    phase,
    curve: ease(value / WATCHDOG_TIMELINE.stop),
    stop: ease((value - WATCHDOG_TIMELINE.stop) / 0.1),
    reassign: ease((value - WATCHDOG_TIMELINE.reassign) / 0.1),
    restart: ease((value - WATCHDOG_TIMELINE.restart) / 0.12),
    oldJobVisible: value < WATCHDOG_TIMELINE.reassign,
    nextJobVisible: value >= WATCHDOG_TIMELINE.reassign,
  };
}
```

- [ ] **Step 4: Run the pure tests and verify GREEN**

Run:

```bash
node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-motion-v1.test.mjs
```

Expected: three passing tests. A failure here means the implementation differs from the authored constants and must be corrected before continuing.

- [ ] **Step 5: Implement the contained Canvas renderer**

Create `autolab-mog-product-scene-v1.js` with this renderer. It runs a 7200ms cycle only while visible, renders one stable final state for reduced motion, and sizes from `offsetWidth` and `offsetHeight` only inside the resize callback:

```js
import {
  watchdogCurveAt,
  watchdogStateFor,
} from './autolab-mog-product-motion-v1.js';

const CYCLE_MS = 7200;
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
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      resizeCount += 1;
    }
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
    progress = ((now - cycleStarted) % CYCLE_MS) / CYCLE_MS;
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
    cycleStarted = performance.now() - progress * CYCLE_MS;
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
```

Draw all explanatory meaning in adjacent HTML copy. Keep the canvas `aria-hidden="true"`.

- [ ] **Step 6: Load the watchdog scene**

Load the new scene after the early-access module:

```html
<script type="module" src="autolab-early-access-v1.js"></script>
<script type="module" src="autolab-mog-product-scene-v1.js"></script>
```

The exact `.watchdog-instrument` and canvas sizing rules are already created in Task 3. Do not add animation to the surrounding page section.

- [ ] **Step 7: Extend Product static tests for the scene contract**

Append this contract to `autolab-mog-product-static-v1.test.mjs`:

```js
test('Product watchdog renderer is connected without synthetic claims', async () => {
  const [html, scene] = await Promise.all([
    readFile(new URL('./autolab-mog-product-v1.html', import.meta.url), 'utf8'),
    readFile(new URL('./autolab-mog-product-scene-v1.js', import.meta.url), 'utf8'),
  ]);
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  assert.match(html, /<canvas id="watchdog-canvas" aria-hidden="true"><\/canvas>/);
  assert.match(html, /<script type="module" src="autolab-mog-product-scene-v1\.js"><\/script>/);
  assert.match(scene, /from '\.\/autolab-mog-product-motion-v1\.js'/);
  assert.match(scene, /new IntersectionObserver/);
  assert.match(scene, /new ResizeObserver/);
  assert.doesNotMatch(scene, /—/);
  assert.doesNotMatch(text, /\b\d+(?:\.\d+)?(?:%|x)\b/i);
});
```

- [ ] **Step 8: Run watchdog, Product, and syntax verification**

Run:

```bash
node --test \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-motion-v1.test.mjs \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-static-v1.test.mjs
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-motion-v1.js
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-scene-v1.js
git diff --check
```

Expected: all tests pass and syntax checks exit zero.

- [ ] **Step 9: Commit the watchdog scene**

```bash
git add \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-motion-v1.js \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-motion-v1.test.mjs \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-scene-v1.js \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.html \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-static-v1.test.mjs
git commit -m "feat: visualize watchdog GPU reassignment"
```

---

### Task 5: Final Cross-Page Verification and Handoff

**Files:**
- Modify only files already in scope if a direct regression is found.

**Interfaces:**
- Consumes: `window.__AUTOLAB_A3__.getState()`, `window.__AUTOLAB_GPU__.getState()`, `window.__AUTOLAB_WATCHDOG__.getState()`, both early-access forms, and all cross-page links.
- Produces: verified preview URLs, final test evidence, and a clean tracked worktree.

- [ ] **Step 1: Run the complete automated suite**

```bash
node --test .superpowers/brainstorm/39694-1784238160/content/*.test.mjs
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-motion-v1.js
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-scene-v1.js
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-onboarding-v1.js
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-hero-cycle-v1.js
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-motion-v1.js
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-gpu-scene-v1.js
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-early-access-v1.js
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-motion-v1.js
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-scene-v1.js
git diff --check
```

Expected: zero failures and zero syntax or whitespace errors.

- [ ] **Step 2: Verify the Rebirth homepage in Chrome**

At 1440×913, 768×900, and 390×844:

- Inspect the initial hero and all three rotating words.
- Scroll every research-loop phase, Rebirth resolution, GPU phase, early-access form, CLI tabs, and close.
- Confirm no clipping, horizontal overflow, layout jump, console error, warning, or failed local request.
- Confirm the research and GPU scenes still pause offscreen.
- Confirm `Get early access` lands on the email field and the CLI command lands on the console.

- [ ] **Step 3: Verify the Product page in Chrome**

At the same widths:

- Inspect all five features and their order.
- Confirm the watchdog scene visibly plateaus, stops, reassigns, and restarts without resizing during animation.
- Confirm the other feature diagrams remain quieter than the watchdog scene.
- Confirm navigation returns to the homepage and its research anchor.
- Confirm Product-page CTAs land on the Product form or open the existing demo destination.

- [ ] **Step 4: Verify form failure and success behavior**

With the intentionally empty preview endpoint:

- Submit an invalid email and confirm the validation message and focused field.
- Submit a valid email and confirm the missing endpoint produces the failure message, leaves the email editable, and never displays success.

Then use Chrome page evaluation to assign a temporary test endpoint and mock `window.fetch` to return `{ ok: true }`. Submit once and confirm the success message, disabled input, and exactly one request. Reload afterward so the preview returns to the unconfigured production-safe state.

- [ ] **Step 5: Verify reduced motion**

Emulate `prefers-reduced-motion: reduce` and confirm:

- The hero stays on `research`.
- The existing research and GPU scenes retain meaningful stable states.
- The watchdog shows the replacement experiment running without looping.
- All text and forms remain usable without motion.

- [ ] **Step 6: Prove SEO preservation**

```bash
git diff origin/main -- \
  index.html manifesto.html careers.html autoresearch.html \
  robots.txt sitemap.xml llms.txt favicon.ico apple-touch-icon.png \
  logo.png og.png
```

Expected: no output.

- [ ] **Step 7: Record final state and preview URLs**

```bash
git status --short
git log -5 --oneline
```

Expected: no tracked changes, unrelated pre-existing untracked scratch files preserved, and separate reviewable commits for homepage copy, early access, Product page, and watchdog motion.

Provide cache-busted URLs for:

- `autolab-mog-a3-rebirth-v1.html`
- `autolab-mog-product-v1.html`

State explicitly that the production email endpoint remains required before deploying live signup capture.
