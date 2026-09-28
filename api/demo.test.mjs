import assert from 'node:assert/strict';
import test from 'node:test';

import demoFunction, {
  createDemoHandler,
  discordMessage,
  normalizeDemoRequest,
} from './demo.js';

const NOW = '2026-09-28T12:00:00.000Z';
const WEBHOOK = 'https://discord.com/api/webhooks/1/secret-token';
const POSTHOG = 'https://us.i.posthog.com/i/v0/e/';

const validFields = (overrides = {}) => ({
  name: '  Ada Lovelace ',
  role: 'ML Lead',
  company: ' Analytical Engines ',
  email: '  Ada@Example.com ',
  useCase: 'Speed up our fine-tuning loop.',
  website: '',
  ...overrides,
});

const request = (body, method = 'POST') => new Request('https://autolab.ai/api/demo', {
  method,
  headers: { 'Content-Type': 'application/json' },
  body: method === 'POST' ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
});

function harness({ discordOk = true, posthogOk = true, webhook = WEBHOOK } = {}) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) });
    const ok = url === POSTHOG ? posthogOk : discordOk;
    return { ok };
  };
  const handler = createDemoHandler({ fetchImpl, now: () => NOW, webhookUrl: () => webhook });
  return { calls, handler };
}

test('exports a Vercel Web Handler', () => {
  assert.equal(typeof demoFunction.fetch, 'function');
});

test('requires all four fields and a valid email', () => {
  assert.deepEqual(normalizeDemoRequest(validFields()), {
    name: 'Ada Lovelace',
    role: 'ML Lead',
    company: 'Analytical Engines',
    email: 'ada@example.com',
    useCase: 'Speed up our fine-tuning loop.',
  });
  for (const key of ['name', 'role', 'company', 'email', 'useCase']) {
    assert.equal(normalizeDemoRequest(validFields({ [key]: '   ' })), null, key);
    assert.equal(normalizeDemoRequest(validFields({ [key]: 42 })), null, key);
  }
  assert.equal(normalizeDemoRequest(validFields({ email: 'ada@' })), null);
  assert.equal(normalizeDemoRequest(validFields({ useCase: 'x'.repeat(2001) })), null);
});

test('rejects non-POST methods and malformed bodies without calling out', async () => {
  const { calls, handler } = harness();
  assert.equal((await handler(request('', 'GET'))).status, 405);
  assert.equal((await handler(request('{nope'))).status, 400);
  assert.equal((await handler(request('[]'))).status, 400);
  assert.equal((await handler(request(validFields({ role: '' })))).status, 400);
  assert.equal(calls.length, 0);
});

test('honeypot submissions look successful but get no link and no notification', async () => {
  const { calls, handler } = harness();
  const response = await handler(request(validFields({ website: 'spam.example' })));
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(calls.length, 0);
});

test('a valid request notifies Discord, records PostHog, and returns the schedule link', async () => {
  const { calls, handler } = harness();
  const response = await handler(request(validFields()));
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.match(body.scheduleUrl, /^https:\/\/calendar\.superhuman\.com\/book\//);

  const discord = calls.find(call => call.url === WEBHOOK);
  const posthog = calls.find(call => call.url === POSTHOG);
  assert.deepEqual(discord.body.allowed_mentions, { parse: [] });
  assert.equal(discord.body.embeds[0].description, 'Speed up our fine-tuning loop.');
  assert.deepEqual(discord.body.embeds[0].fields.map(field => field.value), ['Ada Lovelace', 'ML Lead', 'Analytical Engines', 'ada@example.com']);
  assert.equal(posthog.body.event, 'demo_requested');
  assert.equal(posthog.body.properties.email, 'ada@example.com');
  assert.equal(posthog.body.properties.company, 'Analytical Engines');
  assert.ok(!JSON.stringify(posthog.body).includes('fine-tuning'), 'free text stays out of analytics');
});

test('submitted text cannot ping anyone or inject markdown into Discord', () => {
  const message = discordMessage({
    name: '@everyone',
    role: '**boss** [x](https://evil.example)',
    company: '@here Corp',
    email: 'a@b.co',
    useCase: '@here `code` ||spoiler||',
  }, NOW);
  assert.deepEqual(message.allowed_mentions, { parse: [] });
  const text = JSON.stringify(message);
  assert.ok(text.includes('\\\\*\\\\*boss\\\\*\\\\*'));
  assert.ok(text.includes('\\\\[x\\\\]'));
  assert.ok(text.includes('\\\\|\\\\|spoiler\\\\|\\\\|'));
});

test('still succeeds when only one destination accepts the request', async () => {
  for (const options of [{ discordOk: false }, { posthogOk: false }, { webhook: undefined }]) {
    const { handler } = harness(options);
    const response = await handler(request(validFields()));
    assert.equal(response.status, 201, JSON.stringify(options));
  }
});

test('fails without a link when nothing could record the request', async () => {
  const { handler } = harness({ discordOk: false, posthogOk: false });
  const response = await handler(request(validFields()));
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { ok: false });
});

test('survives network errors from either destination', async () => {
  const handler = createDemoHandler({
    fetchImpl: async () => { throw new Error('boom'); },
    webhookUrl: () => WEBHOOK,
  });
  assert.equal((await handler(request(validFields()))).status, 502);
});
