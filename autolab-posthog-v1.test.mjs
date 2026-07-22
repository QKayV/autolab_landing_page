import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  POSTHOG_CONFIG,
  POSTHOG_PROJECT_TOKEN,
  analyticsEventForClick,
  analyticsEventForSubmit,
  analyticsEventForToggle,
  initAutolabPostHog,
  shouldLoadPostHog,
} from './autolab-posthog-v1.js';

const CONTENT_MODULE = new URL(
  './.superpowers/brainstorm/39694-1784238160/content/autolab-posthog-v1.js',
  import.meta.url,
);

function createBrowserHarness(url = 'https://www.autolab.ai/product') {
  const parsed = new URL(url);
  const handlers = new Map();
  const insertedScripts = [];
  const firstScript = {
    parentNode: {
      insertBefore(script) {
        insertedScripts.push(script);
      },
    },
  };
  const documentObject = {
    head: {
      append(script) {
        insertedScripts.push(script);
      },
    },
    createElement(tagName) {
      return { tagName: tagName.toUpperCase() };
    },
    getElementsByTagName(tagName) {
      return tagName === 'script' ? [firstScript] : [];
    },
    addEventListener(type, listener, options) {
      const listeners = handlers.get(type) || [];
      listeners.push({ listener, options });
      handlers.set(type, listeners);
    },
  };
  const windowObject = {
    location: {
      hostname: parsed.hostname,
      pathname: parsed.pathname,
      protocol: parsed.protocol,
    },
  };
  return { documentObject, handlers, insertedScripts, windowObject };
}

function clickTarget({ href = '', roleId = '', tabText = '' }) {
  const role = roleId ? { id: roleId } : null;
  const link = href ? {
    getAttribute(name) {
      return name === 'href' ? href : null;
    },
    closest(selector) {
      return selector === 'details[id]' ? role : null;
    },
  } : null;
  const tab = tabText ? { textContent: tabText } : null;
  return {
    closest(selector) {
      if (selector === '[role="tab"][aria-controls]') return tab;
      if (selector === 'a[href]') return link;
      return null;
    },
  };
}

function earlyAccessForm({ valid, source }) {
  return {
    dataset: { source },
    checkValidity() {
      return valid;
    },
    closest(selector) {
      return selector === '[data-early-access]' ? this : null;
    },
    matches(selector) {
      return selector === '[data-early-access]';
    },
  };
}

test('local and file previews never initialize PostHog', () => {
  for (const location of [
    { hostname: 'localhost', protocol: 'http:' },
    { hostname: '127.0.0.1', protocol: 'http:' },
    { hostname: '[::1]', protocol: 'http:' },
    { hostname: '', protocol: 'file:' },
  ]) assert.equal(shouldLoadPostHog(location), false);

  assert.equal(shouldLoadPostHog({ hostname: 'www.autolab.ai', protocol: 'https:' }), true);
});

test('production initializes one asynchronous US PostHog instance', () => {
  const harness = createBrowserHarness();

  assert.equal(initAutolabPostHog(harness), true);
  assert.equal(initAutolabPostHog(harness), true);
  assert.equal(harness.insertedScripts.length, 1);
  assert.equal(harness.insertedScripts[0].src, 'https://us-assets.i.posthog.com/static/array.js');
  assert.equal(harness.insertedScripts[0].async, true);
  assert.equal(harness.insertedScripts[0].crossOrigin, 'anonymous');
  assert.equal(harness.windowObject.posthog._i.length, 1);
  const [token, config] = harness.windowObject.posthog._i[0];
  assert.equal(token, POSTHOG_PROJECT_TOKEN);
  assert.deepEqual(config, POSTHOG_CONFIG);
  assert.equal(typeof harness.windowObject.posthog.capture, 'function');
  assert.equal(harness.handlers.get('click').length, 1);
  assert.equal(harness.handlers.get('submit').length, 1);
  assert.equal(harness.handlers.get('toggle').length, 1);
  assert.equal(harness.handlers.get('toggle')[0].options, true);
});

test('delegated events use the live SDK after it replaces the queue stub', () => {
  const harness = createBrowserHarness();
  const captured = [];
  initAutolabPostHog(harness);

  harness.windowObject.posthog = {
    capture(name, properties) {
      captured.push({ name, properties });
    },
  };
  harness.handlers.get('click')[0].listener({
    target: clickTarget({ href: '#early-access' }),
  });

  assert.deepEqual(captured, [{
    name: 'early_access_opened',
    properties: { target: 'early_access', page_path: '/product' },
  }]);
});

test('analytics config is anonymous and excludes replay and form fields', () => {
  assert.match(POSTHOG_PROJECT_TOKEN, /^phc_/);
  assert.equal(POSTHOG_CONFIG.api_host, 'https://us.i.posthog.com');
  assert.equal(POSTHOG_CONFIG.ui_host, 'https://us.posthog.com');
  assert.equal(POSTHOG_CONFIG.defaults, '2026-05-30');
  assert.equal(POSTHOG_CONFIG.person_profiles, 'identified_only');
  assert.equal(POSTHOG_CONFIG.capture_pageview, true);
  assert.equal(POSTHOG_CONFIG.capture_pageleave, true);
  assert.equal(POSTHOG_CONFIG.disable_session_recording, true);
  assert.equal(POSTHOG_CONFIG.respect_dnt, true);
  assert.deepEqual(POSTHOG_CONFIG.autocapture.dom_event_allowlist, ['click']);
  assert.deepEqual(POSTHOG_CONFIG.autocapture.element_allowlist, ['a', 'button']);
  assert.ok(POSTHOG_CONFIG.autocapture.css_selector_ignorelist.includes('[data-ph-no-capture] *'));
});

test('click mapping covers the approved high-value funnel actions', () => {
  const cases = [
    [clickTarget({ href: 'https://calendar.superhuman.com/book/abc' }), 'demo_cta_clicked', { destination: 'calendar' }],
    [clickTarget({ href: 'https://docs.autolab.ai/start' }), 'docs_link_clicked', { destination: 'docs' }],
    [clickTarget({ href: 'mailto:team@autolab.ai' }), 'contact_link_clicked', { channel: 'email' }],
    [clickTarget({ href: 'https://forms.gle/example', roleId: 'infrastructure-engineer' }), 'career_application_clicked', { role: 'infrastructure-engineer' }],
    [clickTarget({ href: '#early-access' }), 'early_access_opened', { target: 'early_access' }],
    [clickTarget({ href: '#onboarding-console' }), 'onboarding_opened', { target: 'onboarding' }],
    [clickTarget({ tabText: 'Claude Code' }), 'onboarding_method_selected', { method: 'claude_code' }],
  ];

  for (const [target, name, properties] of cases) {
    assert.deepEqual(analyticsEventForClick(target), { name, properties });
  }
  assert.equal(analyticsEventForClick(clickTarget({ href: '/manifesto.html' })), null);
});

test('FAQ mapping records only an open Product or root FAQ', () => {
  const productFaq = {
    id: '',
    open: true,
    matches(selector) {
      return selector === '.product-faq details, .faqitem';
    },
    querySelector(selector) {
      return selector === 'summary' ? { textContent: 'What does Autolab connect to?' } : null;
    },
  };
  assert.deepEqual(analyticsEventForToggle(productFaq), {
    name: 'faq_opened',
    properties: { faq: 'what-does-autolab-connect-to' },
  });

  productFaq.open = false;
  assert.equal(analyticsEventForToggle(productFaq), null);
});

test('early-access mapping requires validity and never reads or returns an email', () => {
  const valid = earlyAccessForm({ valid: true, source: 'homepage' });
  Object.defineProperty(valid, 'elements', {
    get() {
      throw new Error('email fields must not be read');
    },
  });

  const detail = analyticsEventForSubmit(valid);
  assert.deepEqual(detail, {
    name: 'early_access_requested',
    properties: { source: 'homepage' },
  });
  assert.doesNotMatch(JSON.stringify(detail), /user@example\.com/i);
  assert.equal(analyticsEventForSubmit(earlyAccessForm({ valid: false, source: 'product' })), null);
});

test('local initialization and analytics failures cannot escape into the page', () => {
  const local = createBrowserHarness('http://localhost:4173/index.html');
  assert.equal(initAutolabPostHog(local), false);
  assert.equal(local.insertedScripts.length, 0);
  assert.equal(local.windowObject.posthog, undefined);
  assert.equal(local.handlers.size, 0);

  const production = createBrowserHarness();
  assert.equal(initAutolabPostHog(production), true);
  production.windowObject.posthog.capture = () => {
    throw new Error('remote analytics unavailable');
  };
  const click = production.handlers.get('click')[0].listener;
  assert.doesNotThrow(() => click({ target: clickTarget({ href: '#early-access' }) }));

  const broken = createBrowserHarness();
  broken.documentObject.createElement = () => {
    throw new Error('script injection blocked');
  };
  assert.doesNotThrow(() => initAutolabPostHog(broken));
  assert.equal(initAutolabPostHog(broken), false);
});

test('partial setup failure cannot duplicate scripts, init calls, or listeners', () => {
  const harness = createBrowserHarness();
  const addEventListener = harness.documentObject.addEventListener;
  harness.documentObject.addEventListener = function (type, listener, options) {
    if (type === 'submit') throw new Error('listener registration blocked');
    return addEventListener.call(this, type, listener, options);
  };

  assert.equal(initAutolabPostHog(harness), false);
  assert.equal(initAutolabPostHog(harness), false);
  assert.equal(harness.insertedScripts.length, 1);
  assert.equal(harness.windowObject.posthog._i.length, 1);
  assert.equal(harness.handlers.get('click').length, 1);
});

test('both static roots use one byte-identical analytics module', async () => {
  const [rootSource, contentSource] = await Promise.all([
    readFile(new URL('./autolab-posthog-v1.js', import.meta.url), 'utf8'),
    readFile(CONTENT_MODULE, 'utf8'),
  ]);
  assert.equal(contentSource, rootSource);
});
