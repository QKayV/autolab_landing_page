export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function sendEarlyAccess({
  endpoint,
  email,
  source,
  timestamp = new Date().toISOString(),
  fetchImpl = globalThis.fetch,
}) {
  const normalizedEmail = email.trim();
  if (!isValidEmail(normalizedEmail)) {
    return { ok: false, reason: 'invalid-email' };
  }
  if (!endpoint) {
    return { ok: false, reason: 'missing-endpoint' };
  }
  try {
    if (new URL(endpoint).protocol !== 'https:') {
      return { ok: false, reason: 'invalid-endpoint' };
    }
  } catch {
    return { ok: false, reason: 'invalid-endpoint' };
  }

  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: normalizedEmail,
        source,
        submittedAt: timestamp,
      }),
    });
    return response.ok
      ? { ok: true, reason: 'success' }
      : { ok: false, reason: 'request-failed' };
  } catch {
    return { ok: false, reason: 'request-failed' };
  }
}

const messages = Object.freeze({
  invalid: 'Enter a valid email address.',
  pending: 'Requesting access...',
  success: "You're on the list. We'll be in touch.",
  failure: 'Could not submit. Try again or email team@autolab.ai.',
});

export function initEarlyAccessForms(root = document) {
  const view = root.defaultView || window;
  for (const form of root.querySelectorAll('[data-early-access]')) {
    const input = form.querySelector('[data-early-access-email]');
    const button = form.querySelector('[data-early-access-submit]');
    const status = form.querySelector('[data-early-access-status]');
    if (!input || !button || !status) continue;

    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (button.disabled) return;
      if (!isValidEmail(input.value)) {
        status.textContent = messages.invalid;
        form.dataset.state = 'invalid';
        input.focus();
        return;
      }

      button.disabled = true;
      status.textContent = messages.pending;
      form.dataset.state = 'pending';
      const result = await sendEarlyAccess({
        endpoint: form.dataset.endpoint || '',
        email: input.value,
        source: form.dataset.source || 'unknown',
        fetchImpl: (...args) => view.fetch(...args),
      });

      if (result.ok) {
        status.textContent = messages.success;
        form.dataset.state = 'success';
        input.disabled = true;
        return;
      }

      status.textContent = messages.failure;
      form.dataset.state = 'failure';
      button.disabled = false;
    });
  }
}

if (typeof document !== 'undefined') initEarlyAccessForms();
