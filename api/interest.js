import { POSTHOG_PROJECT_TOKEN } from '../autolab-posthog-v1.js';

const POSTHOG_CAPTURE_ENDPOINT = 'https://us.i.posthog.com/i/v0/e/';
const SOURCES = new Set(['interest_page', 'homepage', 'product']);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body, status, headers = {}) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}

export function normalizeInterestEmail(value) {
  if (typeof value !== 'string') return '';
  const email = value.trim().toLowerCase();
  return email.length <= 254 && EMAIL_PATTERN.test(email) ? email : '';
}

export function createInterestHandler({
  fetchImpl = globalThis.fetch,
  now = () => new Date().toISOString(),
} = {}) {
  return async function handleInterest(request) {
    if (request.method !== 'POST') {
      return json({ ok: false }, 405, { Allow: 'POST' });
    }

    let body;
    try {
      body = request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')
        ? Object.fromEntries(await request.formData())
        : await request.json();
    } catch {
      return json({ ok: false }, 400);
    }
    if (!body || Array.isArray(body) || typeof body !== 'object') {
      return json({ ok: false }, 400);
    }
    if (typeof body.website === 'string' && body.website.trim()) {
      return json({ ok: true }, 201);
    }

    const email = normalizeInterestEmail(body.email);
    const source = typeof body.source === 'string' ? body.source : '';
    if (!email || !SOURCES.has(source)) {
      return json({ ok: false }, 400);
    }

    const submittedAt = now();
    const payload = {
      api_key: POSTHOG_PROJECT_TOKEN,
      event: 'interest_submitted',
      timestamp: submittedAt,
      properties: {
        distinct_id: email,
        email,
        source,
        submitted_at: submittedAt,
        $set: {
          email,
          interest_source: source,
        },
      },
    };

    try {
      const response = await fetchImpl(POSTHOG_CAPTURE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return response.ok
        ? json({ ok: true }, 201)
        : json({ ok: false }, 502);
    } catch {
      return json({ ok: false }, 502);
    }
  };
}

const handleInterest = createInterestHandler();

export default {
  fetch(request) {
    return handleInterest(request);
  },
};
