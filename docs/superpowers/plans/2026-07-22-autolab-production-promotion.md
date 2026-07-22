# Autolab Production Promotion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the approved Rebirth homepage and illustrated Product page from the repository root while preserving SEO, analytics, interest capture, and the approved six-question FAQ.

**Architecture:** The approved pages in `.superpowers/brainstorm/39694-1784238160/content/` remain the design sources and backups. Production copies live at `index.html` and `product.html`, with their modular CSS and JavaScript dependencies copied to the repository root because Vercel serves that directory. A root contract test verifies page identity, local asset availability, navigation, metadata, and FAQ parity so a successful deployment cannot silently publish the old homepage again.

**Tech Stack:** Static HTML, CSS, browser-native ES modules, Node.js test runner, Vercel static hosting.

## Global Constraints

- Preserve the approved Rebirth visuals and motion without redesigning them.
- Preserve Artem's canonical, Open Graph, Twitter, crawler, sitemap, and JSON-LD infrastructure.
- Product FAQ visible copy must match the six user-approved questions and answers exactly, including supplied em dashes.
- Keep PostHog and `/api/interest` behavior unchanged.
- Do not touch untracked design backups.

---

### Task 1: Add a production-root deployment contract

**Files:**
- Create: `production-pages-v1.test.mjs`

**Interfaces:**
- Consumes: production `index.html`, `product.html`, `sitemap.xml`, and local `href`/`src` assets.
- Produces: a Node test that fails whenever Vercel's root would publish the wrong design or broken local assets.

- [ ] **Step 1: Write the failing production identity test**

Assert that `index.html` contains `data-ending="rebirth"`, the semantic experiment legend, and a link to `product.html`; assert that `product.html` contains `class="product-page"` and all six approved FAQ questions; assert that neither page links to a `.superpowers` path.

- [ ] **Step 2: Write the failing local asset and SEO tests**

Extract root-relative local stylesheet and module references, assert each referenced file exists, and assert the homepage retains canonical, Open Graph, Twitter, and Organization/SoftwareApplication JSON-LD metadata. Assert the sitemap contains `https://www.autolab.ai/product.html`.

- [ ] **Step 3: Run the test and verify RED**

Run: `node --test production-pages-v1.test.mjs`

Expected: FAIL because the current root is the old homepage and `product.html` does not exist.

### Task 2: Promote the approved homepage and Product page

**Files:**
- Replace: `index.html`
- Create: `product.html`
- Create: `autolab-mog-core-v1.css`
- Create: `autolab-mog-a3-core-v1.css`
- Create: `autolab-mog-gpu-v1.css`
- Create: `autolab-mog-product-v1.css`
- Create: `autolab-mog-a3-motion-v1.js`
- Create: `autolab-mog-a3-scene-v1.js`
- Create: `autolab-mog-a3-onboarding-v1.js`
- Create: `autolab-mog-hero-cycle-v1.js`
- Create: `autolab-mog-gpu-motion-v1.js`
- Create: `autolab-mog-gpu-scene-v1.js`
- Create: `autolab-mog-product-motion-v1.js`
- Create: `autolab-mog-product-scene-v1.js`
- Create: `autolab-mog-product-explainer-v2.js`
- Modify: `sitemap.xml`
- Modify: `llms.txt`

**Interfaces:**
- Consumes: approved design-source pages and modules under `.superpowers/brainstorm/39694-1784238160/content/`.
- Produces: deployable root pages at `/` and `/product.html`, with `/interest.html`, `/autoresearch.html`, `/api/interest`, and shared PostHog scripts unchanged.

- [ ] **Step 1: Copy the approved modular assets to the root**

Copy only the CSS and JavaScript dependencies referenced by the approved homepage and Product page. Preserve byte identity with the source modules.

- [ ] **Step 2: Promote the Rebirth homepage**

Use the approved Rebirth body and module references. Change the Product navigation target to `product.html`. Retain canonical, Open Graph, Twitter, favicon, and Organization/WebSite/SoftwareApplication/WebPage JSON-LD metadata in the head.

- [ ] **Step 3: Promote the Product page**

Use the approved Product page body and exact six-question FAQ. Change homepage links to `/` and Product links to `product.html`. Add canonical/social metadata and FAQPage JSON-LD whose answers match the visible FAQ.

- [ ] **Step 4: Update discovery files**

Add `https://www.autolab.ai/product.html` to `sitemap.xml` and the Product page to the Pages list in `llms.txt`.

- [ ] **Step 5: Run the production contract and verify GREEN**

Run: `node --test production-pages-v1.test.mjs`

Expected: all production identity, asset, navigation, SEO, and FAQ checks pass.

### Task 3: Verify, commit, push, and inspect production

**Files:**
- Verify all tracked production and test files from Tasks 1 and 2.

**Interfaces:**
- Consumes: the deployable root and full repository test suite.
- Produces: a verified `origin/main` commit and a live Vercel deployment serving the Rebirth homepage.

- [ ] **Step 1: Run the complete test suite**

Run: `node --test $(find . -name '*.test.mjs' -not -path '*/node_modules/*' -print | sort)`

Expected: zero failures.

- [ ] **Step 2: Verify static syntax and links**

Run `node --check` against every promoted JavaScript module, run `git diff --check`, and request each local page and asset from a static server.

- [ ] **Step 3: Commit and push**

Commit the promotion on `codex/autolab-landing-refresh`, then push its verified HEAD to `origin/main` without force.

- [ ] **Step 4: Verify Vercel and the live domain**

Confirm GitHub's Vercel status succeeds for the pushed SHA. Fetch `https://www.autolab.ai/` and verify the Rebirth markers, then fetch `/product.html` and verify the exact six-question FAQ.
