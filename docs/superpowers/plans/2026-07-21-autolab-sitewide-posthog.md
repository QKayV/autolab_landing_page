# Autolab Site-Wide PostHog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add privacy-minimal, anonymous PostHog analytics to every production-facing Autolab page with useful funnel events and no privileged credential in browser code.

**Architecture:** Use one dependency-free ES module that installs PostHog's asynchronous queue stub, initializes the verified US project, and delegates a small set of static-site funnel events. Keep byte-identical module copies in the repository root and selected redesign content root because those pages are served as independent static roots.

**Tech Stack:** Static HTML, ES modules, PostHog JavaScript snippet API, and Node's built-in test runner.

## Global Constraints

- The privileged personal API key must never appear in a source file, test fixture, command output, or commit.
- The browser-safe project token is `phc_BC7YoHpnnxftN9iiEJtPyDJYJAUibyU4f8BXYbomer5D`.
- The API host is `https://us.i.posthog.com` and UI host is `https://us.posthog.com`.
- Use PostHog defaults snapshot `2026-05-30`.
- Instrument only `index.html`, `autoresearch.html`, `manifesto.html`, `careers.html`, the selected Rebirth homepage, and the selected Product page.
- Skip `localhost`, `127.0.0.1`, `[::1]`, and `file:` previews.
- Collect no email value, email property, identity, session replay, survey, or feature flag.
- Configure `person_profiles: 'identified_only'`, `disable_session_recording: true`, and `respect_dnt: true`.
- Limit autocapture to link and button clicks and ignore early-access forms and descendants.
- PostHog failure must never affect rendering, forms, navigation, tabs, FAQ behavior, or existing animations.
- Do not add a package, framework, cookie banner, analytics UI, or unrelated cleanup.

## File Map

- Create `autolab-posthog-v1.js` as the root static-site analytics module.
- Create `.superpowers/brainstorm/39694-1784238160/content/autolab-posthog-v1.js` as the byte-identical selected-redesign static-root copy.
- Create `autolab-posthog-v1.test.mjs` for real-module initialization, privacy, event, wiring, and credential-boundary tests.
- Modify `index.html`, `autoresearch.html`, `manifesto.html`, and `careers.html` only to add the module script.
- Modify `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-rebirth-v1.html` only to add the module script and early-access no-capture attribute.
- Modify `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.html` only to add the module script and early-access no-capture attribute.

---

### Task 1: Build the fail-safe analytics module

**Files:**

- Create: `autolab-posthog-v1.test.mjs`
- Create: `autolab-posthog-v1.js`
- Create: `.superpowers/brainstorm/39694-1784238160/content/autolab-posthog-v1.js`

**Interfaces:**

- Produces `POSTHOG_PROJECT_TOKEN`, `POSTHOG_CONFIG`, `shouldLoadPostHog(location)`, `analyticsEventForClick(target)`, `analyticsEventForToggle(details)`, `analyticsEventForSubmit(target)`, and `initAutolabPostHog(options)`.
- `initAutolabPostHog` consumes `{ windowObject, documentObject }` for real browser use and deterministic tests.
- Later page wiring consumes the module only through its automatic browser initialization side effect.

- [ ] **Step 1: Write the failing real-module tests**

Create tests that import the root module with no browser globals and assert the exported contract. Build a minimal fake document that records inserted scripts and registered listeners.

Add these behavioral cases:

```js
test('local and file previews never initialize PostHog', () => {
  for (const location of [
    { hostname: 'localhost', protocol: 'http:' },
    { hostname: '127.0.0.1', protocol: 'http:' },
    { hostname: '[::1]', protocol: 'http:' },
    { hostname: '', protocol: 'file:' },
  ]) assert.equal(shouldLoadPostHog(location), false);
});

test('production initializes one asynchronous US PostHog instance', () => {
  const harness = createBrowserHarness('https://www.autolab.ai/product');
  assert.equal(initAutolabPostHog(harness), true);
  assert.equal(initAutolabPostHog(harness), true);
  assert.equal(harness.insertedScripts.length, 1);
  assert.equal(harness.insertedScripts[0].src, 'https://us-assets.i.posthog.com/static/array.js');
  assert.equal(harness.windowObject.posthog._i.length, 1);
  const [token, config] = harness.windowObject.posthog._i[0];
  assert.equal(token, POSTHOG_PROJECT_TOKEN);
  assert.deepEqual(config, POSTHOG_CONFIG);
});

test('analytics config is anonymous and excludes replay and form fields', () => {
  assert.equal(POSTHOG_CONFIG.api_host, 'https://us.i.posthog.com');
  assert.equal(POSTHOG_CONFIG.ui_host, 'https://us.posthog.com');
  assert.equal(POSTHOG_CONFIG.defaults, '2026-05-30');
  assert.equal(POSTHOG_CONFIG.person_profiles, 'identified_only');
  assert.equal(POSTHOG_CONFIG.disable_session_recording, true);
  assert.equal(POSTHOG_CONFIG.respect_dnt, true);
  assert.deepEqual(POSTHOG_CONFIG.autocapture.dom_event_allowlist, ['click']);
  assert.deepEqual(POSTHOG_CONFIG.autocapture.element_allowlist, ['a', 'button']);
  assert.ok(POSTHOG_CONFIG.autocapture.css_selector_ignorelist.includes('[data-ph-no-capture] *'));
});
```

Test all nine custom mappings, invalid submit suppression, absence of email data in valid submit properties, idempotent listener registration, and swallowed capture exceptions.

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
node --test autolab-posthog-v1.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` because `autolab-posthog-v1.js` does not exist.

- [ ] **Step 3: Implement the minimal module**

Use these exact exported constants:

```js
export const POSTHOG_PROJECT_TOKEN = 'phc_BC7YoHpnnxftN9iiEJtPyDJYJAUibyU4f8BXYbomer5D';

export const POSTHOG_CONFIG = Object.freeze({
  api_host: 'https://us.i.posthog.com',
  ui_host: 'https://us.posthog.com',
  defaults: '2026-05-30',
  person_profiles: 'identified_only',
  capture_pageview: true,
  capture_pageleave: true,
  disable_session_recording: true,
  respect_dnt: true,
  autocapture: {
    dom_event_allowlist: ['click'],
    element_allowlist: ['a', 'button'],
    css_selector_ignorelist: [
      '.ph-no-capture',
      '[data-ph-no-capture]',
      '[data-ph-no-capture] *',
    ],
  },
});
```

`shouldLoadPostHog` must use only `location.protocol` and `location.hostname`. The queue stub must derive `https://us-assets.i.posthog.com/static/array.js` from `api_host`, set `async` and `crossOrigin`, expose a queued `capture` method before the remote SDK arrives, and queue exactly one `init` call.

Use one delegated capture boundary:

```js
function capture(posthog, detail, pathname) {
  if (!detail) return;
  try {
    posthog.capture(detail.name, { ...detail.properties, page_path: pathname });
  } catch {}
}
```

`analyticsEventForClick` must classify tabs before links and return only the approved event names. `analyticsEventForToggle` must accept only open Product FAQ details or `.faqitem` details. `analyticsEventForSubmit` must require a `[data-early-access]` form whose `checkValidity()` returns true and may read only `form.dataset.source`.

`initAutolabPostHog` must set one window-level idempotency flag, install listeners for `click`, `submit`, and capture-phase `toggle`, and wrap initialization in a failure boundary. At module bottom, automatically initialize only when both `window` and `document` exist.

Create the selected-redesign module with byte-identical content.

- [ ] **Step 4: Run the module test and verify GREEN**

Run:

```bash
node --test autolab-posthog-v1.test.mjs
node --check autolab-posthog-v1.js
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-posthog-v1.js
cmp -s autolab-posthog-v1.js .superpowers/brainstorm/39694-1784238160/content/autolab-posthog-v1.js
```

Expected: every command exits zero and the module tests report no failures.

- [ ] **Step 5: Commit**

```bash
git add autolab-posthog-v1.js autolab-posthog-v1.test.mjs .superpowers/brainstorm/39694-1784238160/content/autolab-posthog-v1.js
git commit -m "feat: add fail-safe PostHog analytics"
```

---

### Task 2: Wire every production-facing page

**Files:**

- Modify: `autolab-posthog-v1.test.mjs`
- Modify: `index.html`
- Modify: `autoresearch.html`
- Modify: `manifesto.html`
- Modify: `careers.html`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-rebirth-v1.html`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.html`

**Interfaces:**

- Consumes the automatic initialization side effect from Task 1.
- Produces exactly six instrumented pages and two protected early-access forms.

- [ ] **Step 1: Add failing page-wiring and credential-boundary tests**

Assert each root page contains exactly one:

```html
<script type="module" src="autolab-posthog-v1.js"></script>
```

Assert each selected redesign page contains exactly one identical relative script tag. Assert the two redesign early-access forms contain `data-ph-no-capture` and still retain every existing `data-early-access`, `data-endpoint`, and `data-source` attribute.

Use `git ls-files -z` plus `readFile` to scan tracked text files and fail on a personal PostHog key pattern. Explicitly allow the one browser project token in the two byte-identical analytics modules and the approved docs.

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
node --test autolab-posthog-v1.test.mjs
```

Expected: FAIL because none of the six pages is wired and neither early-access form has the no-capture attribute.

- [ ] **Step 3: Apply the minimal page changes**

Add one relative module script immediately before `</body>` in each page. On the selected Rebirth and Product forms, add only `data-ph-no-capture` to the existing `<form>` start tag. Do not change page copy, styles, navigation, animation wiring, form endpoints, or SEO metadata.

- [ ] **Step 4: Run focused and regression tests**

Run:

```bash
node --test autolab-posthog-v1.test.mjs
node --test .superpowers/brainstorm/39694-1784238160/content/*.test.mjs
git diff --check
```

Expected: all analytics tests pass, all 97 existing content tests pass, and `git diff --check` exits zero.

- [ ] **Step 5: Commit**

```bash
git add autolab-posthog-v1.test.mjs index.html autoresearch.html manifesto.html careers.html .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-rebirth-v1.html .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.html
git commit -m "feat: instrument Autolab pages with PostHog"
```

---

### Task 3: Verify the live boundary and final integration

**Files:**

- Modify only if a concrete analytics defect is found: files from Tasks 1 and 2.

**Interfaces:**

- Verifies the complete site-wide integration without adding behavior.

- [ ] **Step 1: Run every local verification**

```bash
node --test autolab-posthog-v1.test.mjs .superpowers/brainstorm/39694-1784238160/content/*.test.mjs
node --check autolab-posthog-v1.js
node --check .superpowers/brainstorm/39694-1784238160/content/autolab-posthog-v1.js
cmp -s autolab-posthog-v1.js .superpowers/brainstorm/39694-1784238160/content/autolab-posthog-v1.js
git diff --check
```

Expected: zero failures, zero cancellations, clean syntax, identical modules, and no whitespace errors.

- [ ] **Step 2: Verify the external PostHog endpoints without creating an analytics event**

Check the SDK asset:

```bash
curl -sS -o /dev/null -w '%{http_code}\n' https://us-assets.i.posthog.com/static/array.js
```

Expected: `200`.

POST the browser project token and a disposable anonymous distinct ID to the PostHog `/flags/?v=2&config=true` endpoint. Print only the HTTP status and response shape, not the token. Expected: HTTP 200 and valid JSON. This validates region and project routing without capturing a product analytics event.

- [ ] **Step 3: Verify production pages and local analytics suppression**

Serve the repository root locally, request all four root pages, and request the two redesign pages from the existing content preview. Expected: all return HTTP 200. Import the real module against a local fake window and assert no remote script insertion or PostHog queue.

- [ ] **Step 4: Review the final diff**

Confirm every changed line traces to either the approved Product redesign or this PostHog spec. Confirm the privileged personal key is absent, the browser token appears only where expected, unrelated untracked files are untouched, and no Product or homepage design line changed beyond analytics script/form attributes.

If no defect is found, create no empty commit.

## Plan Self-Review

- Spec coverage: credential separation, two static roots, six pages, local suppression, anonymous config, funnel events, PII exclusion, failure isolation, external routing, and full regression checks each map to an explicit task.
- Placeholder scan: no TBD, TODO, deferred implementation, or unspecified error-handling step remains.
- Interface consistency: every Task 2 and Task 3 consumer uses the exact Task 1 exported names and module path.
- Scope: one analytics subsystem with three reviewable checkpoints, no unrelated deployment or consent-management work.
