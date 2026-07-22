# Autolab Site-Wide PostHog Design

## Goal

Add working PostHog product analytics to every production-facing Autolab page without exposing the privileged account credential, collecting email values, affecting the UI, or polluting analytics during local development.

## Scope

The integration covers these two static-site surfaces:

- Root production pages: `index.html`, `autoresearch.html`, `manifesto.html`, and `careers.html`.
- Selected redesign pages: `autolab-mog-a3-rebirth-v1.html` and `autolab-mog-product-v1.html` under `.superpowers/brainstorm/39694-1784238160/content/`.

Prototype choosers, discarded visual directions, and other brainstorm HTML files stay uninstrumented.

## Credential Model

The credential supplied by the user is a privileged personal API key. It was used ephemerally to discover the project configuration and must never appear in a browser asset, test fixture, Git commit, or final source file.

The discovered project is PostHog Cloud US and exposes a browser-safe project token. That project token is intentionally public and may be embedded in the static JavaScript loader, which matches PostHog's documented browser installation model. The ingestion host is `https://us.i.posthog.com` and the UI host is `https://us.posthog.com`.

## Architecture

Create one dependency-free ES module named `autolab-posthog-v1.js`. Because the repository currently contains two independent static document roots, keep a byte-identical copy at the repository root and in the selected redesign content directory. A regression test must prove the two copies remain identical.

Each in-scope page loads the module with a relative `type="module"` script tag. The module:

1. Returns immediately for `localhost`, `127.0.0.1`, `[::1]`, and `file:` previews.
2. Returns immediately if the integration has already initialized on the page.
3. Installs the documented PostHog queue stub and asynchronously loads the US PostHog browser SDK.
4. Initializes analytics with the current documented defaults snapshot, anonymous-only person profiles, pageview and pageleave capture, restricted link/button autocapture, session replay disabled, and Do Not Track respected.
5. Installs small delegated listeners for high-value funnel events.

No PostHog failure may throw into page code, block rendering, change navigation, or interfere with any existing form or tab controller.

## Data Collection

The integration captures anonymous pageviews and these custom events using lowercase snake case:

- `demo_cta_clicked`
- `docs_link_clicked`
- `contact_link_clicked`
- `career_application_clicked`
- `early_access_opened`
- `early_access_requested`
- `onboarding_opened`
- `onboarding_method_selected`
- `faq_opened`

Allowed properties are limited to stable, non-sensitive context such as page pathname, CTA destination category, early-access source, onboarding method, career role ID, and FAQ ID. The module must never read an email input value or send an email property.

Early-access forms receive `data-ph-no-capture`, and the autocapture ignore list includes that attribute and its descendants. A valid form submit emits only `early_access_requested` and the form's static `data-source` value.

## Privacy and Performance Defaults

- `person_profiles` is `identified_only`.
- `disable_session_recording` is `true`.
- `respect_dnt` is `true`.
- `capture_pageview` and `capture_pageleave` are enabled.
- Autocapture is limited to clicks on links and buttons.
- Inputs, form fields, and early-access descendants are excluded from autocapture.
- The SDK loads asynchronously after the local module executes.
- No dependency, package manager, cookie banner, identity call, survey, feature flag, or session replay UI is added.

These defaults provide useful acquisition and conversion data without silently opting the site into replay or PII collection. A later privacy-policy or consent project can change capture consent independently.

## Failure Behavior

- If the remote SDK cannot load, the existing site continues normally and queued analytics calls remain inert.
- If an event target does not match a known funnel action, no custom event is emitted.
- If a form is invalid, no `early_access_requested` event is emitted.
- If capture throws, the exception is swallowed inside the analytics boundary.
- Local and file previews do not load the remote SDK or initialize PostHog.

## Testing

Use Node's built-in test runner and the real module code.

Tests must prove:

- All six pages load the correct relative module.
- The two static-root module copies are byte-identical.
- No tracked file contains a privileged personal PostHog key.
- Local and file URLs do not initialize or inject a remote script.
- A production URL injects exactly one asynchronous US SDK script and queues exactly one init call.
- The init call uses the browser project token and all required privacy/performance options.
- Repeated initialization is idempotent.
- Each custom funnel mapping produces the expected event and properties.
- Invalid early-access submits are ignored.
- Valid early-access events contain no email value or email property.
- Listener or capture failures cannot escape into the page.
- Existing content and root-page regression suites remain green.

## Success Criteria

- Site-wide anonymous analytics is functional on production hosts.
- The privileged account key is absent from the repository.
- The public project token targets the verified PostHog Cloud US project.
- All in-scope pages are instrumented and local previews remain clean.
- No PII, session replay, visual change, navigation regression, or new runtime dependency is introduced.
