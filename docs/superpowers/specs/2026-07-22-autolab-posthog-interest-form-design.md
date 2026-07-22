# Autolab PostHog Interest Form Design

**Date:** 2026-07-22
**Status:** Approved direction

## Goal

Create one simple, branded interest page that reliably stores submitted email addresses in Autolab's existing PostHog project. The implementation must add no database, CRM, form vendor, or private frontend credential.

## User experience

- Publish a production route at `/interest.html`.
- Show the Autolab wordmark, a plain headline, one email field, one `Request access` button, and a short consent line.
- Match the current Rebirth/Product visual system with a restrained paper-and-ink layout and one small research-field accent. This page is intentionally quieter than the animated homepage.
- Validate the address before sending.
- While sending, disable the button and announce progress.
- On success, replace the form state with a clear confirmation.
- On failure, retain the address and let the visitor retry.
- Support keyboard navigation, visible focus, reduced motion, and mobile layouts.

## Data flow

1. The form posts JSON to the same-origin Vercel Function at `/api/interest`.
2. The function accepts only `POST`, validates and normalizes the email, rejects an occupied honeypot field, and limits field lengths.
3. The function sends a server-side `interest_submitted` event to PostHog's US ingestion endpoint using the existing browser-safe `phc_` project token.
4. Event properties contain only `email`, `source`, and the server-generated submission timestamp. The function does not forward cookies, the request IP, or browser headers to PostHog.
5. The UI reports success only after PostHog accepts the event.

The submitted email is intentionally stored in PostHog. It is not added to general page autocapture, session replay remains disabled, and the form remains marked `data-ph-no-capture`.

## Existing site integration

- Route visible `Get early access` and equivalent interest CTAs on the selected Rebirth homepage and Product page to `/interest.html`.
- Keep the existing embedded forms functional by sending them to the same `/api/interest` endpoint.
- Preserve demo, docs, careers, SEO, motion, navigation, and all unrelated copy.
- Provide a byte-identical preview copy of the interest page/module where the existing content preview server requires it.

## PostHog operations

- Successful entries appear under the `interest_submitted` event.
- The `email` event property is the initial contact list and can be filtered or exported from PostHog.
- `source` distinguishes `interest_page`, `homepage`, and `product` submissions.
- No personal `phx_` API key, PostHog organization ID, or new Vercel environment variable is required.

## Failure behavior

- Invalid input: `Enter a valid email address.`
- Bot honeypot: return a neutral success response without creating an event.
- Unsupported method or malformed payload: return a client error.
- PostHog rejection or network failure: return a service error and show `Could not submit. Try again or email team@autolab.ai.`
- Analytics loading failures elsewhere on the site must not affect form submission.

## Verification

- Unit tests cover validation, normalization, honeypot behavior, allowed methods, PostHog payload shape, upstream failure, and UI retry/success behavior.
- Static tests prove both interest-page copies match, load the expected modules, contain no em dashes, and expose accessible form semantics.
- Existing Product, Rebirth, SEO, motion, early-access, and analytics suites remain green.
- A local server returns the page and every static asset with HTTP 200.
- The Vercel handler is exercised locally with an injected PostHog request so tests never create real interest records.

## Explicit non-goals

- Newsletter automation, confirmation emails, lead scoring, CRM synchronization, authentication, admin UI, and campaign attribution are out of scope.
- The design does not create or expose a private PostHog key.
