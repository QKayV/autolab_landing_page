# Autolab Onboarding Console Scale Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enlarge the right-hand onboarding console to roughly 740px at a 1440px viewport and make its command text easier to read.

**Architecture:** Keep the existing onboarding markup and JavaScript unchanged. Adjust only the shared landing stylesheet's onboarding grid and type scale, with a static CSS contract test protecting the approved desktop and mobile values.

**Tech Stack:** HTML, CSS, Node.js built-in test runner

## Global Constraints

- Preserve the existing dark instrument styling, tabs, copy, interaction, and section rhythm.
- Keep the current single-column mobile layout and prevent page-level horizontal overflow.
- Do not alter the hero terminal, animation system, onboarding commands, navigation, SEO files, or breakpoint structure.

---

### Task 1: Enlarge the onboarding console

**Files:**
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs:87-103`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-core-v1.css:238-343`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-core-v1.css:451-464`

**Interfaces:**
- Consumes: the existing `.get-started`, `.onboarding-panel pre`, and mobile media-query selectors.
- Produces: a `.72fr / 1.18fr` desktop grid with a reduced responsive gap, 13px desktop command text, and 11px mobile command text.

- [ ] **Step 1: Write the failing static contract test**

Add these assertions to `navigation uses one centered stage and onboarding has responsive styling`:

```js
assert.match(
  css,
  /\.get-started\s*\{[^}]*grid-template-columns:\s*minmax\(0,\.72fr\)\s+minmax\(520px,1\.18fr\)/s,
);
assert.match(
  css,
  /\.onboarding-panel pre\s*\{[^}]*font:\s*400 13px\/1\.95 "IBM Plex Mono",monospace/s,
);
assert.match(
  css,
  /@media \(max-width:\s*900px\)[\s\S]*\.onboarding-panel pre\s*\{\s*font-size:\s*11px;\s*\}/s,
);
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs
```

Expected: FAIL in `navigation uses one centered stage and onboarding has responsive styling` because the stylesheet still contains the previous grid ratio and font sizes.

- [ ] **Step 3: Make the minimal CSS change**

Change the desktop onboarding layout and command text to:

```css
.get-started {
  grid-template-columns: minmax(0,.72fr) minmax(520px,1.18fr);
  gap: clamp(56px,6vw,96px);
}

.onboarding-panel pre {
  font: 400 13px/1.95 "IBM Plex Mono",monospace;
}
```

Inside the existing `@media (max-width: 900px)` block, change the mobile override to:

```css
.onboarding-panel pre { font-size: 11px; }
```

- [ ] **Step 4: Run focused and full automated verification**

Run:

```bash
node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs
node --test .superpowers/brainstorm/39694-1784238160/content/*.test.mjs
git diff --check
```

Expected: focused test passes, all project tests pass with zero failures, and `git diff --check` exits 0.

- [ ] **Step 5: Verify the rendered proportions**

Open the Rebirth preview and inspect the onboarding section at 1440px and 390px viewport widths. At desktop, confirm the console is approximately 740px wide and command text computes to 13px. At mobile, confirm command text computes to 11px, the console remains within the page padding, and `document.documentElement.scrollWidth === document.documentElement.clientWidth`.

- [ ] **Step 6: Commit the implementation**

```bash
git add \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs \
  .superpowers/brainstorm/39694-1784238160/content/autolab-mog-core-v1.css
git commit -m "style: enlarge the onboarding console"
```
