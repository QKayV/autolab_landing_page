import test from 'node:test';
import assert from 'node:assert/strict';
import {
  initEarlyAccessForms,
  isValidEmail,
  sendEarlyAccess,
} from './autolab-early-access-v1.js';

function acceptedResponse() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}

test('email validation accepts useful addresses and rejects incomplete input', () => {
  assert.equal(isValidEmail('researcher@example.com'), true);
  assert.equal(isValidEmail('  researcher@example.com  '), true);
  assert.equal(isValidEmail('researcher@'), false);
  assert.equal(isValidEmail('a'.repeat(245) + '@example.com'), false);
  assert.equal(isValidEmail(''), false);
});

test('missing endpoint fails without pretending to submit', async () => {
  let calls = 0;
  const result = await sendEarlyAccess({
    endpoint: '',
    email: 'researcher@example.com',
    source: 'homepage',
    fetchImpl: async () => { calls += 1; },
  });
  assert.deepEqual(result, { ok: false, reason: 'missing-endpoint' });
  assert.equal(calls, 0);
});

test('cross-origin and non-HTTPS endpoints fail before a request is made', async () => {
  let calls = 0;
  for (const endpoint of [
    'https://forms.example.test/early-access',
    'http://autolab.ai/api/interest',
  ]) {
    const result = await sendEarlyAccess({
      endpoint,
      baseUrl: 'https://autolab.ai',
      email: 'researcher@example.com',
      source: 'homepage',
      fetchImpl: async () => { calls += 1; },
    });
    assert.deepEqual(result, { ok: false, reason: 'invalid-endpoint' });
  }
  assert.equal(calls, 0);
});

test('successful submission resolves the same-origin endpoint and sends the normalized payload once', async () => {
  const calls = [];
  const result = await sendEarlyAccess({
    endpoint: '/api/interest',
    baseUrl: 'https://autolab.ai',
    email: '  researcher@example.com  ',
    source: 'product',
    website: '',
    timestamp: '2026-07-21T12:00:00.000Z',
    fetchImpl: async (...args) => {
      calls.push(args);
      return acceptedResponse();
    },
  });

  assert.deepEqual(result, { ok: true, reason: 'success' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'https://autolab.ai/api/interest');
  assert.deepEqual(JSON.parse(calls[0][1].body), {
    email: 'researcher@example.com',
    source: 'product',
    website: '',
    submittedAt: '2026-07-21T12:00:00.000Z',
  });
});

test('failed requests return failure instead of success', async () => {
  const result = await sendEarlyAccess({
    endpoint: '/api/interest',
    baseUrl: 'https://autolab.ai',
    email: 'researcher@example.com',
    source: 'homepage',
    fetchImpl: async () => ({ ok: false }),
  });
  assert.deepEqual(result, { ok: false, reason: 'request-failed' });
});

test('only the API confirmation response counts as a successful capture', async () => {
  for (const response of [
    new Response('<html>fallback</html>', { status: 200 }),
    new Response(JSON.stringify({ ok: false }), { status: 201 }),
    new Response('not json', { status: 201 }),
  ]) {
    const result = await sendEarlyAccess({
      endpoint: '/api/interest',
      baseUrl: 'https://autolab.ai',
      email: 'researcher@example.com',
      source: 'homepage',
      fetchImpl: async () => response,
    });
    assert.deepEqual(result, { ok: false, reason: 'request-failed' });
  }
});

function createFormHarness({
  email = '',
  endpoint = '',
  fetchImpl = async () => acceptedResponse(),
  origin = 'https://autolab.ai',
  website = '',
} = {}) {
  const listeners = {};
  const input = { value: email, disabled: false, focused: false, focus() { this.focused = true; } };
  const honeypot = { value: website };
  const button = { disabled: false };
  const status = { textContent: '' };
  const form = {
    dataset: { endpoint, source: 'homepage' },
    addEventListener(type, listener) { listeners[type] = listener; },
    querySelector(selector) {
      return {
        '[data-early-access-email]': input,
        '[data-early-access-website]': honeypot,
        '[data-early-access-submit]': button,
        '[data-early-access-status]': status,
      }[selector];
    },
  };
  const root = {
    defaultView: { fetch: fetchImpl, location: { origin } },
    querySelectorAll() { return [form]; },
  };
  initEarlyAccessForms(root);
  return {
    form,
    honeypot,
    input,
    button,
    status,
    submit: () => listeners.submit({ preventDefault() {} }),
  };
}

test('invalid form input focuses the email field and announces the problem', async () => {
  const harness = createFormHarness({ email: 'researcher@' });
  await harness.submit();
  assert.equal(harness.form.dataset.state, 'invalid');
  assert.equal(harness.status.textContent, 'Enter a valid email address.');
  assert.equal(harness.input.focused, true);
  assert.equal(harness.button.disabled, false);
});

test('form stays pending until one successful request completes', async () => {
  let resolveRequest;
  let calls = 0;
  const harness = createFormHarness({
    email: 'researcher@example.com',
    endpoint: '/api/interest',
    fetchImpl: async () => {
      calls += 1;
      return new Promise(resolve => { resolveRequest = resolve; });
    },
  });

  const submission = harness.submit();
  assert.equal(harness.form.dataset.state, 'pending');
  assert.equal(harness.status.textContent, 'Requesting access...');
  assert.equal(harness.button.disabled, true);
  await harness.submit();
  assert.equal(calls, 1);

  resolveRequest(acceptedResponse());
  await submission;
  assert.equal(harness.form.dataset.state, 'success');
  assert.equal(harness.status.textContent, "You're on the list. We'll be in touch.");
  assert.equal(harness.input.disabled, true);
});

test('missing endpoint and server failure remain editable and never show success', async () => {
  for (const endpoint of ['', '/api/interest']) {
    const harness = createFormHarness({
      email: 'researcher@example.com',
      endpoint,
      fetchImpl: async () => ({ ok: false }),
    });
    await harness.submit();
    assert.equal(harness.form.dataset.state, 'failure');
    assert.equal(harness.status.textContent, 'Could not submit. Try again or email team@autolab.ai.');
    assert.equal(harness.button.disabled, false);
    assert.equal(harness.input.disabled, false);
  }
});

test('form submission includes the honeypot and resolves against the page origin', async () => {
  const calls = [];
  const harness = createFormHarness({
    email: 'researcher@example.com',
    endpoint: '/api/interest',
    origin: 'https://preview.autolab.ai',
    website: 'leave-empty',
    fetchImpl: async (...args) => {
      calls.push(args);
      return acceptedResponse();
    },
  });

  await harness.submit();

  assert.equal(calls[0][0], 'https://preview.autolab.ai/api/interest');
  assert.equal(JSON.parse(calls[0][1].body).website, 'leave-empty');
});
