import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Product page explains the complete useful-GPU loop in order', async () => {
  const html = await readFile(
    new URL('./autolab-mog-product-v1.html', import.meta.url),
    'utf8',
  );
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const headlines = [
    'Connect the GPUs you already have.',
    'Watch every experiment as it runs.',
    'Stop runs when they stop being useful.',
    'Use every result to choose what comes next.',
    'Review what worked.',
  ];

  let previous = -1;
  for (const headline of headlines) {
    const index = text.indexOf(headline);
    assert.ok(index > previous, `missing or unordered headline: ${headline}`);
    previous = index;
  }
  assert.equal((html.match(/data-product-feature/g) || []).length, 5);
  assert.match(text, /Your GPUs, running the next useful experiment\./);
  assert.match(text, /Autolab connects your compute, watches every training run, stops wasted work, and uses each result to decide what to try next\./);
  assert.match(text, /Autolab connects machines across your cluster or cloud account and treats them as one experiment pool\. A spare GPU and a multi-node cluster participate in the same queue\./);
  assert.match(text, /Autolab reads training metrics, logs, failures, checkpoints, and evaluation results while each job is running\./);
  assert.match(text, /Autolab's watchdog models detect experiments that have plateaued or are clearly likely to fail\. Those jobs stop before they consume more GPU time\./);
  assert.match(text, /Completed, failed, and stopped experiments all produce information\. Autolab uses that evidence to propose the next changes worth testing\./);
  assert.match(text, /Winning experiments arrive with the code change, metrics, logs, and experiment history behind them\. Your team decides what ships\./);
  assert.match(text, /Your infrastructure or ours\./);
  assert.match(text, /Run Autolab on your cluster or in your cloud account\. Code, data, and model weights can stay inside your network\./);
  assert.doesNotMatch(html, /—/);
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
