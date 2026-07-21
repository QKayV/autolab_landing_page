import test from 'node:test';
import assert from 'node:assert/strict';
import {
  initEarlyAccessForms,
  isValidEmail,
  sendEarlyAccess,
} from './autolab-early-access-v1.js';

test('email validation accepts useful addresses and rejects incomplete input', () => {
  assert.equal(isValidEmail('researcher@example.com'), true);
  assert.equal(isValidEmail('  researcher@example.com  '), true);
  assert.equal(isValidEmail('researcher@'), false);
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

test('non-HTTPS endpoint fails before a request is made', async () => {
  let calls = 0;
  const result = await sendEarlyAccess({
    endpoint: 'http://forms.example.test/early-access',
    email: 'researcher@example.com',
    source: 'homepage',
    fetchImpl: async () => { calls += 1; },
  });
  assert.deepEqual(result, { ok: false, reason: 'invalid-endpoint' });
  assert.equal(calls, 0);
});

test('successful submission sends the normalized payload once', async () => {
  const calls = [];
  const result = await sendEarlyAccess({
    endpoint: 'https://forms.example.test/early-access',
    email: '  researcher@example.com  ',
    source: 'product',
    timestamp: '2026-07-21T12:00:00.000Z',
    fetchImpl: async (...args) => {
      calls.push(args);
      return { ok: true };
    },
  });

  assert.deepEqual(result, { ok: true, reason: 'success' });
  assert.equal(calls.length, 1);
  assert.deepEqual(JSON.parse(calls[0][1].body), {
    email: 'researcher@example.com',
    source: 'product',
    submittedAt: '2026-07-21T12:00:00.000Z',
  });
});

test('failed requests return failure instead of success', async () => {
  const result = await sendEarlyAccess({
    endpoint: 'https://forms.example.test/early-access',
    email: 'researcher@example.com',
    source: 'homepage',
    fetchImpl: async () => ({ ok: false }),
  });
  assert.deepEqual(result, { ok: false, reason: 'request-failed' });
});

function createFormHarness({ email = '', endpoint = '', fetchImpl = async () => ({ ok: true }) } = {}) {
  const listeners = {};
  const input = { value: email, disabled: false, focused: false, focus() { this.focused = true; } };
  const button = { disabled: false };
  const status = { textContent: '' };
  const form = {
    dataset: { endpoint, source: 'homepage' },
    addEventListener(type, listener) { listeners[type] = listener; },
    querySelector(selector) {
      return {
        '[data-early-access-email]': input,
        '[data-early-access-submit]': button,
        '[data-early-access-status]': status,
      }[selector];
    },
  };
  const root = {
    defaultView: { fetch: fetchImpl },
    querySelectorAll() { return [form]; },
  };
  initEarlyAccessForms(root);
  return {
    form,
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
    endpoint: 'https://forms.example.test/early-access',
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

  resolveRequest({ ok: true });
  await submission;
  assert.equal(harness.form.dataset.state, 'success');
  assert.equal(harness.status.textContent, "You're on the list. We'll be in touch.");
  assert.equal(harness.input.disabled, true);
});

test('missing endpoint and server failure remain editable and never show success', async () => {
  for (const endpoint of ['', 'https://forms.example.test/early-access']) {
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
