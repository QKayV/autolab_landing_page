import test from 'node:test';
import assert from 'node:assert/strict';

const EXPLAINER_URL = new URL('./autolab-mog-product-explainer-v2.js', import.meta.url);
const GLOBAL_KEYS = ['window', 'document', 'IntersectionObserver'];
let explainerImport = 0;

function installExplainerEnvironment({ reducedMotion = false } = {}) {
  const originals = new Map(
    GLOBAL_KEYS.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
  );
  const chapters = Array.from({ length: 3 }, () => ({ dataset: {} }));
  const observed = [];
  const unobserved = [];
  let observerCount = 0;
  let intersectionCallback;
  let intersectionOptions;

  class FakeIntersectionObserver {
    constructor(callback, options) {
      observerCount += 1;
      intersectionCallback = callback;
      intersectionOptions = options;
    }

    observe(target) {
      observed.push(target);
    }

    unobserve(target) {
      unobserved.push(target);
    }
  }

  const globals = {
    window: {
      matchMedia(query) {
        assert.equal(query, '(prefers-reduced-motion: reduce)');
        return { matches: reducedMotion };
      },
    },
    document: {
      querySelectorAll(selector) {
        assert.equal(selector, '[data-explainer-chapter]');
        return chapters;
      },
    },
    IntersectionObserver: FakeIntersectionObserver,
  };

  for (const [key, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value,
    });
  }

  return {
    chapters,
    observed,
    unobserved,
    get observerCount() {
      return observerCount;
    },
    get intersectionOptions() {
      return intersectionOptions;
    },
    async load() {
      const url = new URL(EXPLAINER_URL);
      url.searchParams.set('test', String(explainerImport));
      explainerImport += 1;
      await import(url.href);
    },
    intersect(entries) {
      assert.ok(intersectionCallback, 'observer callback was not created');
      intersectionCallback(entries);
    },
    restore() {
      for (const [key, descriptor] of originals) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
      }
    },
  };
}

test('normal motion reveals each Product chapter once on viewport entry', async () => {
  const environment = installExplainerEnvironment();
  try {
    await environment.load();

    assert.equal(environment.observerCount, 1);
    assert.deepEqual(environment.intersectionOptions, {
      rootMargin: '0px',
      threshold: 0.15,
    });
    assert.deepEqual(
      environment.chapters.map(chapter => chapter.dataset.reveal),
      ['pending', 'pending', 'pending'],
    );
    assert.deepEqual(environment.observed, environment.chapters);

    environment.intersect([
      { isIntersecting: false, target: environment.chapters[0] },
      { isIntersecting: true, target: environment.chapters[1] },
    ]);

    assert.equal(environment.chapters[0].dataset.reveal, 'pending');
    assert.equal(environment.chapters[1].dataset.reveal, 'resolved');
    assert.equal(environment.chapters[2].dataset.reveal, 'pending');
    assert.deepEqual(environment.unobserved, [environment.chapters[1]]);
  } finally {
    environment.restore();
  }
});

test('reduced motion resolves every Product chapter without an observer', async () => {
  const environment = installExplainerEnvironment({ reducedMotion: true });
  try {
    await environment.load();

    assert.equal(environment.observerCount, 0);
    assert.deepEqual(environment.observed, []);
    assert.deepEqual(
      environment.chapters.map(chapter => chapter.dataset.reveal),
      ['resolved', 'resolved', 'resolved'],
    );
  } finally {
    environment.restore();
  }
});
