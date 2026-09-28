const FIELDS = ['name', 'role', 'company', 'email', 'useCase'];

export function isValidEmail(value) {
  const email = value.trim();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function missingField(values) {
  return FIELDS.find(key => key === 'email'
    ? !isValidEmail(values.email || '')
    : !String(values[key] || '').trim()) || null;
}

export async function sendDemoRequest({ endpoint, values, website = '', fetchImpl = globalThis.fetch }) {
  if (missingField(values)) return { ok: false, reason: 'invalid' };
  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, website }),
    });
    if (response.status !== 201) return { ok: false, reason: 'request-failed' };
    const body = await response.json();
    // Honeypot hits get { ok: true } with no link; treat that as a failure to show.
    return body?.ok === true && typeof body.scheduleUrl === 'string'
      ? { ok: true, scheduleUrl: body.scheduleUrl }
      : { ok: false, reason: 'request-failed' };
  } catch {
    return { ok: false, reason: 'request-failed' };
  }
}

const messages = Object.freeze({
  invalid: { name: 'Enter your name.', role: 'Enter your role.', company: 'Enter your company.', email: 'Enter a valid work email.', useCase: 'Tell us a bit about your use case.' },
  pending: 'Sending...',
  failure: 'Could not submit. Try again or email team@autolab.ai.',
});

export function initDemoForm(root = document) {
  const form = root.querySelector('[data-demo-form]');
  if (!form) return;
  const status = form.querySelector('[data-demo-status]');
  const button = form.querySelector('[data-demo-submit]');
  const done = root.querySelector('[data-demo-done]');
  const link = root.querySelector('[data-demo-schedule]');
  const greeting = root.querySelector('[data-demo-greeting]');
  const view = root.defaultView || window;

  form.addEventListener('input', event => event.target.removeAttribute('aria-invalid'));

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (button.disabled) return;
    const values = Object.fromEntries(FIELDS.map(key => [key, form.elements[key].value.trim()]));

    for (const key of FIELDS) form.elements[key].removeAttribute('aria-invalid');
    const missing = missingField(values);
    if (missing) {
      form.elements[missing].setAttribute('aria-invalid', 'true');
      form.elements[missing].focus();
      status.textContent = messages.invalid[missing];
      form.dataset.state = 'invalid';
      return;
    }

    button.disabled = true;
    status.textContent = messages.pending;
    form.dataset.state = 'pending';
    const result = await sendDemoRequest({
      endpoint: '/api/demo',
      values,
      website: form.elements.website?.value || '',
      fetchImpl: (...args) => view.fetch(...args),
    });

    if (!result.ok) {
      status.textContent = messages.failure;
      form.dataset.state = 'failure';
      button.disabled = false;
      return;
    }
    link.href = result.scheduleUrl;
    greeting.textContent = `Thanks, ${values.name.split(/\s+/)[0]}.`;
    form.hidden = true;
    done.hidden = false;
    link.focus();
  });
}

if (typeof document !== 'undefined') initDemoForm();
