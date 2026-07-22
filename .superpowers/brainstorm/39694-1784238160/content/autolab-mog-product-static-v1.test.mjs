import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const PRODUCT_URL = new URL('./autolab-mog-product-v1.html', import.meta.url);

const visibleText = html => html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

test('Product page opens one complete illustrated research circuit', async () => {
  const html = await readFile(PRODUCT_URL, 'utf8');
  const text = visibleText(html);
  const concepts = [
    'REPOSITORY', 'EVALUATION', 'CONSTRAINTS', 'GPU POOL',
    'EXPERIMENT AGENTS', 'SCHEDULER', 'WATCHDOG',
    'RESEARCH MEMORY', 'NEXT EXPERIMENTS', 'RESEARCH PACKET',
  ];

  assert.match(html, /data-product-circuit/);
  for (const concept of concepts) assert.match(text, new RegExp(concept));
  for (const key of ['▸ experiment', '□ GPU', '○ evaluation', '● selected result']) {
    assert.match(text, new RegExp(key));
  }
});

test('Product chapters progressively open the same system', async () => {
  const html = await readFile(PRODUCT_URL, 'utf8');
  const text = visibleText(html);
  const headlines = [
    'Connect what you already have.',
    'See what every run is doing.',
    'Stop waste. Keep GPUs moving.',
    'Turn every result into the next experiment.',
    'Review the full research record.',
    'Deploy where your research already runs.',
  ];

  let previous = -1;
  for (const headline of headlines) {
    const index = text.indexOf(headline);
    assert.ok(index > previous, 'missing or unordered headline: ' + headline);
    previous = index;
  }
  assert.equal((html.match(/data-explainer-chapter/g) || []).length, 6);
});

test('Product page shares navigation and early-access contracts', async () => {
  const html = await readFile(
    new URL('./autolab-mog-product-v1.html', import.meta.url),
    'utf8',
  );

  assert.match(html, /href="autolab-mog-a3-rebirth-v1\.html" class="wordmark"/);
  assert.match(html, /href="autolab-mog-a3-rebirth-v1\.html#research-run"[^>]*>How it works/);
  assert.match(html, /href="https:\/\/docs\.autolab\.ai"[^>]*>Docs/);
  assert.match(html, /id="watchdog-canvas"/);
  assert.match(html, /id="early-access"[^>]*data-early-access/);
  assert.match(html, /autolab-early-access-v1\.js/);
  assert.doesNotMatch(html, /role="tablist"/);
});

test('Product access input exposes a high-contrast keyboard focus ring', async () => {
  const css = await readFile(
    new URL('./autolab-mog-product-v1.css', import.meta.url),
    'utf8',
  );

  assert.match(
    css,
    /\.product-access \.early-access-control input:focus-visible \{ border-color: var\(--mint\); outline: 2px solid var\(--mint\); outline-offset: 3px; box-shadow: 0 0 0 5px rgba\(47,206,150,\.18\); \}/,
  );
});

test('Product access form scopes readable status colors to the dark panel', async () => {
  const css = await readFile(
    new URL('./autolab-mog-product-v1.css', import.meta.url),
    'utf8',
  );

  assert.match(
    css,
    /\.product-access \.early-access-form label \{ color: #b8c1bc; \}/,
  );
  assert.match(
    css,
    /\.product-access \.early-access-status \{ color: #a9b0ac; \}/,
  );
  assert.match(
    css,
    /\.product-access \.early-access-form\[data-state="success"\] \.early-access-status \{ color: var\(--mint\); \}/,
  );
  assert.match(
    css,
    /\.product-access \.early-access-form\[data-state="invalid"\] \.early-access-status,\n\.product-access \.early-access-form\[data-state="failure"\] \.early-access-status \{ color: #f0a38e; \}/,
  );
});

test('Product watchdog renderer is connected without synthetic claims', async () => {
  const [html, scene] = await Promise.all([
    readFile(new URL('./autolab-mog-product-v1.html', import.meta.url), 'utf8'),
    readFile(new URL('./autolab-mog-product-scene-v1.js', import.meta.url), 'utf8'),
  ]);
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const claims = `${text} ${scene}`;

  assert.match(html, /<canvas id="watchdog-canvas" aria-hidden="true"><\/canvas>/);
  assert.match(html, /<script type="module" src="autolab-mog-product-scene-v1\.js"><\/script>/);
  assert.match(scene, /from '\.\/autolab-mog-product-motion-v1\.js'/);
  assert.match(scene, /WATCHDOG_CYCLE_MS/);
  assert.doesNotMatch(scene, /const CYCLE_MS\s*=/);
  assert.doesNotMatch(scene, /\b7200\b/);
  assert.match(scene, /new IntersectionObserver/);
  assert.match(scene, /new ResizeObserver/);
  assert.doesNotMatch(scene, /—/);
  assert.doesNotMatch(claims, /\b\d+(?:\.\d+)?(?:%|x)\b/i);
});
