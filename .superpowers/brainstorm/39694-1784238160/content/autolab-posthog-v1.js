export const POSTHOG_PROJECT_TOKEN = 'phc_BC7YoHpnnxftN9iiEJtPyDJYJAUibyU4f8BXYbomer5D';

export const POSTHOG_CONFIG = Object.freeze({
  api_host: 'https://us.i.posthog.com',
  ui_host: 'https://us.posthog.com',
  defaults: '2026-05-30',
  person_profiles: 'identified_only',
  capture_pageview: true,
  capture_pageleave: true,
  disable_session_recording: true,
  respect_dnt: true,
  autocapture: {
    dom_event_allowlist: ['click'],
    element_allowlist: ['a', 'button'],
    css_selector_ignorelist: [
      '.ph-no-capture',
      '[data-ph-no-capture]',
      '[data-ph-no-capture] *',
    ],
  },
});

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);
const INITIALIZED = '__autolabPostHogInitialized';
const QUEUED_METHODS = [
  'capture',
  'register',
  'register_once',
  'register_for_session',
  'unregister',
  'unregister_for_session',
  'getFeatureFlag',
  'getFeatureFlagResult',
  'isFeatureEnabled',
  'reloadFeatureFlags',
  'onFeatureFlags',
  'identify',
  'setPersonProperties',
  'group',
  'reset',
  'get_distinct_id',
  'get_session_id',
  'opt_in_capturing',
  'opt_out_capturing',
  'has_opted_in_capturing',
  'has_opted_out_capturing',
];

function slug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function closest(target, selector) {
  return typeof target?.closest === 'function' ? target.closest(selector) : null;
}

function detail(name, properties) {
  return { name, properties };
}

export function shouldLoadPostHog(location) {
  if (!location || location.protocol === 'file:') return false;
  return !LOCAL_HOSTS.has(String(location.hostname || '').toLowerCase());
}

export function analyticsEventForClick(target) {
  const tab = closest(target, '[role="tab"][aria-controls]');
  if (tab) {
    return detail('onboarding_method_selected', {
      method: slug(tab.textContent).replace(/-/g, '_'),
    });
  }

  const link = closest(target, 'a[href]');
  if (!link) return null;
  const href = String(link.getAttribute('href') || '');

  if (href.includes('calendar.superhuman.com/book/')) {
    return detail('demo_cta_clicked', { destination: 'calendar' });
  }
  if (href.includes('docs.autolab.ai')) {
    return detail('docs_link_clicked', { destination: 'docs' });
  }
  if (href.toLowerCase().startsWith('mailto:')) {
    return detail('contact_link_clicked', { channel: 'email' });
  }
  if (href.includes('forms.gle/')) {
    return detail('career_application_clicked', {
      role: closest(link, 'details[id]')?.id || 'open_call',
    });
  }
  if (href === '/interest.html' || href === 'interest.html') {
    return detail('early_access_opened', { target: 'interest_page' });
  }
  if (href === '#early-access') {
    return detail('early_access_opened', { target: 'early_access' });
  }
  if (href === '#onboarding-console') {
    return detail('onboarding_opened', { target: 'onboarding' });
  }
  return null;
}

export function analyticsEventForToggle(details) {
  if (!details?.open || typeof details.matches !== 'function') return null;
  if (!details.matches('.product-faq details, .faqitem')) return null;
  const faq = details.id || slug(details.querySelector?.('summary')?.textContent);
  return faq ? detail('faq_opened', { faq }) : null;
}

export function analyticsEventForSubmit(target) {
  const form = target?.matches?.('[data-early-access]')
    ? target
    : closest(target, '[data-early-access]');
  if (!form || typeof form.checkValidity !== 'function' || !form.checkValidity()) return null;
  return detail('early_access_requested', {
    source: form.dataset?.source || 'unknown',
  });
}

function queueMethod(target, method) {
  target[method] = function (...args) {
    target.push([method, ...args]);
  };
}

function installPostHogStub(windowObject, documentObject) {
  const posthog = windowObject.posthog || [];
  if (posthog.__SV) return posthog;

  windowObject.posthog = posthog;
  posthog._i = [];
  posthog.init = function (token, config, name) {
    const script = documentObject.createElement('script');
    script.type = 'text/javascript';
    script.crossOrigin = 'anonymous';
    script.async = true;
    script.src = config.api_host.replace('.i.posthog.com', '-assets.i.posthog.com')
      + '/static/array.js';

    const firstScript = documentObject.getElementsByTagName('script')[0];
    if (firstScript?.parentNode) firstScript.parentNode.insertBefore(script, firstScript);
    else documentObject.head?.append(script);

    const instance = name ? (posthog[name] = []) : posthog;
    instance.people = instance.people || [];
    for (const method of QUEUED_METHODS) queueMethod(instance, method);
    posthog._i.push([token, config, name]);
  };
  posthog.__SV = 1;
  return posthog;
}

function capture(posthog, eventDetail, pathname) {
  if (!eventDetail) return;
  try {
    posthog.capture(eventDetail.name, {
      ...eventDetail.properties,
      page_path: pathname,
    });
  } catch {}
}

function wireFunnelEvents(windowObject, documentObject) {
  const pathname = windowObject.location.pathname;
  documentObject.addEventListener('click', event => {
    capture(windowObject.posthog, analyticsEventForClick(event.target), pathname);
  });
  documentObject.addEventListener('submit', event => {
    capture(windowObject.posthog, analyticsEventForSubmit(event.target), pathname);
  });
  documentObject.addEventListener('toggle', event => {
    capture(windowObject.posthog, analyticsEventForToggle(event.target), pathname);
  }, true);
}

export function initAutolabPostHog({
  windowObject = globalThis.window,
  documentObject = globalThis.document,
} = {}) {
  if (!windowObject || !documentObject || !shouldLoadPostHog(windowObject.location)) return false;

  try {
    if (Object.prototype.hasOwnProperty.call(windowObject, INITIALIZED)) {
      return windowObject[INITIALIZED];
    }
    windowObject[INITIALIZED] = false;
    const posthog = installPostHogStub(windowObject, documentObject);
    posthog.init(POSTHOG_PROJECT_TOKEN, POSTHOG_CONFIG);
    wireFunnelEvents(windowObject, documentObject);
    windowObject[INITIALIZED] = true;
    return true;
  } catch {
    return false;
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  initAutolabPostHog({ windowObject: window, documentObject: document });
}
