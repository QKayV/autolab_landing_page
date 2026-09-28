import assert from 'node:assert/strict';
import test from 'node:test';

import { isValidEmail, missingField, sendDemoRequest } from './autolab-demo-v1.js';

const values = (overrides = {}) => ({
  name: 'Ada Lovelace',
  role: 'ML lead',
  company: 'Analytical Engines',
  email: 'ada@example.com',
  useCase: 'Faster fine-tuning.',
  ...overrides,
});

test('all five fields are required and email must look valid', () => {
  assert.equal(missingField(values()), null);
  for (const key of ['name', 'role', 'company', 'email', 'useCase']) {
    assert.equal(missingField(values({ [key]: '  ' })), key);
  }
  assert.equal(missingField(values({ email: 'ada@' })), 'email');
  assert.equal(isValidEmail('ada@example.com'), true);
});

test('invalid input never reaches the network', async () => {
  let called = false;
  const result = await sendDemoRequest({
    endpoint: '/api/demo',
    values: values({ role: '' }),
    fetchImpl: async () => { called = true; },
  });
  assert.deepEqual(result, { ok: false, reason: 'invalid' });
  assert.equal(called, false);
});

test('returns the schedule link only from a successful response', async () => {
  const respond = (status, body) => async () => ({ status, json: async () => body });
  const link = 'https://calendar.example/book/x';

  assert.deepEqual(
    await sendDemoRequest({ endpoint: '/api/demo', values: values(), fetchImpl: respond(201, { ok: true, scheduleUrl: link }) }),
    { ok: true, scheduleUrl: link },
  );
  // Honeypot response: success without a link must not reveal anything.
  for (const fetchImpl of [
    respond(201, { ok: true }),
    respond(502, { ok: false }),
    respond(400, { ok: false }),
    async () => { throw new Error('offline'); },
  ]) {
    assert.deepEqual(
      await sendDemoRequest({ endpoint: '/api/demo', values: values(), fetchImpl }),
      { ok: false, reason: 'request-failed' },
    );
  }
});
