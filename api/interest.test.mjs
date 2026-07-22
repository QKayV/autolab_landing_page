import assert from 'node:assert/strict';
import test from 'node:test';

import interestFunction, {
  createInterestHandler,
  normalizeInterestEmail,
} from './interest.js';
import { POSTHOG_PROJECT_TOKEN } from '../autolab-posthog-v1.js';

const ENDPOINT = 'https://us.i.posthog.com/i/v0/e/';
const NOW = '2026-07-22T12:00:00.000Z';

function request(body, { method = 'POST' } = {}) {
  return new Request('https://autolab.ai/api/interest', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: method === 'POST' ? body : undefined,
  });
}

function validBody(overrides = {}) {
  return JSON.stringify({
    email: '  Researcher@Example.com  ',
    source: 'interest_page',
    website: '',
    submittedAt: '1999-01-01T00:00:00.000Z',
    ...overrides,
  });
}

test('exports a Vercel Web Handler', () => {
  assert.equal(typeof interestFunction.fetch, 'function');
});

test('normalizes useful addresses and rejects invalid or oversized input', () => {
  assert.equal(normalizeInterestEmail('  Researcher@Example.com  '), 'researcher@example.com');
  assert.equal(normalizeInterestEmail('researcher@'), '');
  assert.equal(normalizeInterestEmail('a'.repeat(245) + '@example.com'), '');
  assert.equal(normalizeInterestEmail(null), '');
});

test('rejects unsupported methods without contacting PostHog', async () => {
  let calls = 0;
  const handler = createInterestHandler({
    fetchImpl: async () => { calls += 1; },
  });

  const response = await handler(request(null, { method: 'GET' }));

  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'POST');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(calls, 0);
});

test('rejects malformed JSON and invalid fields without contacting PostHog', async () => {
  const calls = [];
  const handler = createInterestHandler({
    fetchImpl: async (...args) => { calls.push(args); },
  });

  for (const body of [
    '{',
    validBody({ email: 'researcher@' }),
    validBody({ source: 'untrusted-source' }),
    JSON.stringify([]),
  ]) {
    const response = await handler(request(body));
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { ok: false });
  }
  assert.equal(calls.length, 0);
});

test('a filled honeypot returns neutral success without creating an event', async () => {
  let calls = 0;
  const handler = createInterestHandler({
    fetchImpl: async () => { calls += 1; },
  });

  const response = await handler(request(validBody({ website: 'https://spam.example' })));

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(calls, 0);
});

test('successful submissions send one normalized interest event to PostHog', async () => {
  const calls = [];
  const handler = createInterestHandler({
    now: () => NOW,
    fetchImpl: async (...args) => {
      calls.push(args);
      return new Response('ok', { status: 200 });
    },
  });

  const response = await handler(request(validBody()));

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], ENDPOINT);
  assert.equal(calls[0][1].method, 'POST');
  assert.equal(calls[0][1].headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(calls[0][1].body), {
    api_key: POSTHOG_PROJECT_TOKEN,
    event: 'interest_submitted',
    timestamp: NOW,
    properties: {
      distinct_id: 'researcher@example.com',
      email: 'researcher@example.com',
      source: 'interest_page',
      submitted_at: NOW,
      $set: {
        email: 'researcher@example.com',
        interest_source: 'interest_page',
      },
    },
  });
});

test('PostHog rejection and network failure return a retryable service error', async () => {
  const handlers = [
    createInterestHandler({ fetchImpl: async () => new Response('no', { status: 503 }) }),
    createInterestHandler({ fetchImpl: async () => { throw new Error('offline'); } }),
  ];

  for (const handler of handlers) {
    const response = await handler(request(validBody({ source: 'product' })));
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { ok: false });
  }
});
