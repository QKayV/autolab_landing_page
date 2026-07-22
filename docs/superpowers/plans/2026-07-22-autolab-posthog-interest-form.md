# Autolab PostHog Interest Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a simple `/interest.html` page and reliably store successful email submissions as `interest_submitted` events in Autolab's existing PostHog project.

**Architecture:** A dependency-free Vercel Function under `/api` validates same-origin form submissions and forwards accepted records to PostHog's public US ingestion endpoint. The existing early-access controller owns browser validation and states; the new page and existing inline forms all call the same function. No private key, new vendor, database, or frontend framework is introduced.

**Tech Stack:** Static HTML/CSS, browser ES modules, Node.js built-in test runner, Web `Request`/`Response`, Vercel Node.js Functions, PostHog public event ingestion.

## Global Constraints

- Store only `email`, `source`, and a server-generated submission timestamp in the `interest_submitted` event.
- Never add a personal `phx_` key, PostHog organization ID, cookie, client IP, or browser header to the payload.
- Keep session replay disabled and every email form marked `data-ph-no-capture`.
- Use the existing public `POSTHOG_PROJECT_TOKEN` and US host.
- Preserve unrelated copy, animation, SEO, navigation, docs, careers, and demo behavior.
- Visible copy must contain no em dashes.
- No new runtime dependency or Vercel environment variable.

---

### Task 1: PostHog-backed Vercel capture function

**Files:**
- Create: `api/interest.js`
- Create: `api/interest.test.mjs`

**Interfaces:**
- Consumes: `POSTHOG_PROJECT_TOKEN` from `../autolab-posthog-v1.js` and an injected `fetchImpl(url, options)`.
- Produces: `normalizeInterestEmail(value)`, `createInterestHandler({ fetchImpl, now })`, and the Vercel Web Handler default export `{ fetch(request) }`.

- [ ] **Step 1: Write the failing handler tests**

Cover method rejection, malformed JSON, invalid and oversized email, normalized email, source allowlisting, a filled honeypot that creates no upstream request, successful payload shape, and upstream failure. The successful assertion must match:

```js
assert.deepEqual(JSON.parse(upstream.options.body), {
  api_key: POSTHOG_PROJECT_TOKEN,
  event: 'interest_submitted',
  timestamp: '2026-07-22T12:00:00.000Z',
  properties: {
    distinct_id: 'researcher@example.com',
    email: 'researcher@example.com',
    source: 'interest_page',
    submitted_at: '2026-07-22T12:00:00.000Z',
    $set: { email: 'researcher@example.com', interest_source: 'interest_page' },
  },
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test api/interest.test.mjs`

Expected: FAIL because `api/interest.js` does not exist.

- [ ] **Step 3: Implement the minimal Web Handler**

Use `export default { fetch: handler }`, require `POST`, parse `request.json()`, normalize the address to lowercase, accept only `interest_page`, `homepage`, and `product` sources, and treat a non-empty `website` honeypot as a neutral `201` without capture. Send the exact payload above to `https://us.i.posthog.com/i/v0/e/`. Return `201` only for accepted or honeypot submissions, `400` for invalid input, `405` with `Allow: POST` for other methods, and `502` for PostHog failure.

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run: `node --test api/interest.test.mjs`

Expected: all handler tests pass without creating a live PostHog event.

- [ ] **Step 5: Commit Task 1**

```bash
git add api/interest.js api/interest.test.mjs
git commit -m "feat: capture early interest in PostHog"
```

---

### Task 2: Same-origin form submission controller

**Files:**
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-early-access-v1.js`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-early-access-v1.test.mjs`
- Create: `autolab-early-access-v1.js`

**Interfaces:**
- Consumes: form `data-endpoint`, `data-source`, and optional `[data-early-access-website]`.
- Produces: `sendEarlyAccess({ endpoint, email, source, website, baseUrl, timestamp, fetchImpl })` and byte-identical root/content controller copies.

- [ ] **Step 1: Add failing controller tests**

Add cases proving `/api/interest` resolves against `https://autolab.ai`, a cross-origin endpoint is rejected, the honeypot is included as `website`, and the page origin is supplied by `root.defaultView.location.origin`.

```js
assert.equal(calls[0][0], 'https://autolab.ai/api/interest');
assert.deepEqual(JSON.parse(calls[0][1].body), {
  email: 'researcher@example.com',
  source: 'interest_page',
  website: '',
  submittedAt: '2026-07-22T12:00:00.000Z',
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test .superpowers/brainstorm/39694-1784238160/content/autolab-early-access-v1.test.mjs`

Expected: new same-origin and honeypot assertions fail against the current absolute-only controller.

- [ ] **Step 3: Implement minimal relative-endpoint support**

Resolve `endpoint` with `new URL(endpoint, baseUrl)`, require the resolved origin to equal `new URL(baseUrl).origin`, keep HTTPS mandatory outside `localhost`, and include the optional honeypot string in the JSON payload. Read the honeypot from the form without making it required.

- [ ] **Step 4: Copy and verify package identity**

Create the root controller as a byte-identical copy and verify:

```bash
cmp -s autolab-early-access-v1.js .superpowers/brainstorm/39694-1784238160/content/autolab-early-access-v1.js
```

- [ ] **Step 5: Run focused tests and commit Task 2**

```bash
node --test .superpowers/brainstorm/39694-1784238160/content/autolab-early-access-v1.test.mjs
git add autolab-early-access-v1.js .superpowers/brainstorm/39694-1784238160/content/autolab-early-access-v1.js .superpowers/brainstorm/39694-1784238160/content/autolab-early-access-v1.test.mjs
git commit -m "feat: submit interest through the site origin"
```

---

### Task 3: Branded interest page

**Files:**
- Create: `interest.html`
- Create: `.superpowers/brainstorm/39694-1784238160/content/interest.html`
- Create: `interest-page-v1.test.mjs`

**Interfaces:**
- Consumes: `/autolab-early-access-v1.js`, `/autolab-posthog-v1.js`, and `/api/interest`.
- Produces: one byte-identical static interest page at `/interest.html` in both preview roots.

- [ ] **Step 1: Write the failing static-page tests**

Assert both pages are byte-identical and expose exactly one email input, one honeypot, `data-endpoint="/api/interest"`, `data-source="interest_page"`, `data-ph-no-capture`, an `aria-live` status, consent text, visible focus CSS, a reduced-motion rule, both required modules, no em dash, and no `phx_` credential.

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test interest-page-v1.test.mjs`

Expected: FAIL because the page files do not exist.

- [ ] **Step 3: Build the minimal branded page**

Use one self-contained HTML file with inline CSS. Reuse Autolab's paper, ink, mint, mono-label, and floating-island navigation language. Keep the layout to a wordmark, short headline, one-sentence explanation, email field, `Request access` button, consent text, success/error status, and `Book a demo` fallback. Include only a restrained vector-field accent and no continuous animation under reduced motion.

- [ ] **Step 4: Run focused tests and local HTTP checks**

```bash
node --test interest-page-v1.test.mjs
cmp -s interest.html .superpowers/brainstorm/39694-1784238160/content/interest.html
```

Expected: all page tests and identity checks pass.

- [ ] **Step 5: Commit Task 3**

```bash
git add interest.html interest-page-v1.test.mjs .superpowers/brainstorm/39694-1784238160/content/interest.html
git commit -m "feat: add Autolab interest page"
```

---

### Task 4: Route every interest entry point

**Files:**
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-rebirth-v1.html`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.html`
- Modify: `autolab-posthog-v1.js`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-posthog-v1.js`
- Modify: `autolab-posthog-v1.test.mjs`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-static-v1.test.mjs`

**Interfaces:**
- Consumes: `/interest.html` and `/api/interest` from Tasks 1 through 3.
- Produces: working CTA routes, working embedded forms, and `early_access_opened` analytics for `/interest.html` links.

- [ ] **Step 1: Add failing route and analytics tests**

Require each visible early-access CTA to use `/interest.html`, each embedded form to use `/api/interest`, and `analyticsEventForClick()` to map `/interest.html` to:

```js
{
  name: 'early_access_opened',
  properties: { target: 'interest_page' },
}
```

- [ ] **Step 2: Run focused tests and verify RED**

```bash
node --test autolab-posthog-v1.test.mjs \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-static-v1.test.mjs
```

Expected: new route, endpoint, and analytics assertions fail.

- [ ] **Step 3: Apply only the approved wiring changes**

Replace visible `href="#early-access"` targets with `href="/interest.html"`, set both inline form endpoints to `/api/interest`, and extend the existing analytics mapping for `/interest.html`. Keep both analytics modules byte-identical.

- [ ] **Step 4: Run the complete regression suite**

```bash
node --test api/interest.test.mjs interest-page-v1.test.mjs autolab-posthog-v1.test.mjs \
  .superpowers/brainstorm/39694-1784238160/content/*.test.mjs
node --check api/interest.js
node --check autolab-early-access-v1.js
node --check autolab-posthog-v1.js
cmp -s autolab-posthog-v1.js .superpowers/brainstorm/39694-1784238160/content/autolab-posthog-v1.js
cmp -s autolab-early-access-v1.js .superpowers/brainstorm/39694-1784238160/content/autolab-early-access-v1.js
git diff --check
```

Expected: every test and static check passes with no credential leak or unrelated tracked change.

- [ ] **Step 5: Verify static resources and commit Task 4**

Serve the repository root and confirm HTTP 200 for `/interest.html`, both browser modules, and the selected Rebirth and Product pages. Do not send a real interest record during verification.

```bash
git add autolab-posthog-v1.js autolab-posthog-v1.test.mjs \
  .superpowers/brainstorm/39694-1784238160/content/autolab-posthog-v1.js \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-rebirth-v1.html \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-v1.html \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-product-static-v1.test.mjs
git commit -m "feat: route early access into PostHog"
```

