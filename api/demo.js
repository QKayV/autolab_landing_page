import { POSTHOG_PROJECT_TOKEN } from '../autolab-posthog-v1.js';

const POSTHOG_CAPTURE_ENDPOINT = 'https://us.i.posthog.com/i/v0/e/';
const SCHEDULE_URL = 'https://calendar.superhuman.com/book/11Wx5q95SPgTTclPo4/KrRGA';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMITS = Object.freeze({ name: 120, role: 120, company: 120, email: 254, useCase: 2000 });
const REQUEST_TIMEOUT_MS = 5000;

function json(body, status, headers = {}) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}

function cleanText(value, max) {
  if (typeof value !== 'string') return '';
  const text = value.replace(/\r\n?/g, '\n').trim();
  return text.length <= max ? text : '';
}

export function normalizeDemoRequest(body) {
  const email = cleanText(body?.email, LIMITS.email).toLowerCase();
  const fields = {
    name: cleanText(body?.name, LIMITS.name),
    role: cleanText(body?.role, LIMITS.role),
    company: cleanText(body?.company, LIMITS.company),
    email: EMAIL_PATTERN.test(email) ? email : '',
    useCase: cleanText(body?.useCase, LIMITS.useCase),
  };
  return Object.values(fields).every(Boolean) ? fields : null;
}

// Neutralize Discord markdown so submitted text renders as plain text.
function plain(text) {
  return text.replace(/[\\*_~`|>[\]]/g, '\\$&');
}

export function discordMessage({ name, role, company, email, useCase }, submittedAt) {
  return {
    // Never let submitted text ping @everyone, roles or users.
    allowed_mentions: { parse: [] },
    embeds: [{
      title: 'New demo request',
      color: 0x2fce96,
      description: plain(useCase),
      fields: [
        { name: 'Name', value: plain(name), inline: true },
        { name: 'Role', value: plain(role), inline: true },
        { name: 'Company', value: plain(company) },
        { name: 'Work email', value: plain(email) },
      ],
      timestamp: submittedAt,
    }],
  };
}

async function post(fetchImpl, url, body) {
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  return response.ok;
}

export function createDemoHandler({
  fetchImpl = globalThis.fetch,
  now = () => new Date().toISOString(),
  webhookUrl = () => process.env.DISCORD_WEBHOOK_URL,
} = {}) {
  return async function handleDemo(request) {
    if (request.method !== 'POST') {
      return json({ ok: false }, 405, { Allow: 'POST' });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false }, 400);
    }
    if (!body || Array.isArray(body) || typeof body !== 'object') {
      return json({ ok: false }, 400);
    }
    // Honeypot: pretend success so bots learn nothing, but give them no link.
    if (typeof body.website === 'string' && body.website.trim()) {
      return json({ ok: true }, 201);
    }

    const fields = normalizeDemoRequest(body);
    if (!fields) return json({ ok: false }, 400);

    const submittedAt = now();
    const discordUrl = webhookUrl();
    const sinks = await Promise.allSettled([
      discordUrl
        ? post(fetchImpl, discordUrl, discordMessage(fields, submittedAt))
        : Promise.resolve(false),
      post(fetchImpl, POSTHOG_CAPTURE_ENDPOINT, {
        api_key: POSTHOG_PROJECT_TOKEN,
        event: 'demo_requested',
        timestamp: submittedAt,
        properties: {
          distinct_id: fields.email,
          email: fields.email,
          role: fields.role,
          company: fields.company,
          source: 'demo_page',
          submitted_at: submittedAt,
          $set: { email: fields.email, role: fields.role, company: fields.company },
        },
      }),
    ]);
    const [discord, posthog] = sinks.map(result => result.status === 'fulfilled' && result.value === true);

    if (!discord) console.error('demo request: Discord notification failed');
    // The request counts as received if at least one place has it.
    if (!discord && !posthog) return json({ ok: false }, 502);
    return json({ ok: true, scheduleUrl: SCHEDULE_URL }, 201);
  };
}

const handleDemo = createDemoHandler();

export default {
  fetch(request) {
    return handleDemo(request);
  },
};
