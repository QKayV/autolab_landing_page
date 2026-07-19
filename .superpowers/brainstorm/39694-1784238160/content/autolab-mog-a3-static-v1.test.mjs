import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { TIMELINE, phaseFor } from './autolab-mog-a3-motion-v1.js';

const variants = ['slingshot', 'rebirth', 'loop'];
const requiredIds = [
  'topbar',
  'brand-caret',
  'research-run',
  'ending-preview',
  'research-canvas',
  'flight-object',
  'event-horizon',
  'result-card',
];

for (const variant of variants) {
  test(`${variant} page exposes the shared scene contract`, async () => {
    const html = await readFile(
      new URL(`./autolab-mog-a3-${variant}-v1.html`, import.meta.url),
      'utf8',
    );
    assert.match(html, new RegExp(`data-ending="${variant}"`));
    for (const id of requiredIds) {
      assert.match(html, new RegExp(`id="${id}"`));
    }
    assert.match(html, /autolab-mog-core-v1\.css/);
    assert.match(html, /autolab-mog-a3-core-v1\.css/);
    assert.match(html, /autolab-mog-a3-scene-v1\.js/);
    assert.doesNotMatch(html, /<iframe/i);
    for (const linkedVariant of variants) {
      assert.match(
        html,
        new RegExp(`autolab-mog-a3-${linkedVariant}-v1\\.html#ending-preview`),
      );
    }
  });
}

test('chooser links all endings and the preserved A2', async () => {
  const html = await readFile(
    new URL('./autolab-mog-a3-three-collapses-chooser-v1.html', import.meta.url),
    'utf8',
  );
  for (const variant of variants) {
    assert.match(
      html,
      new RegExp(`autolab-mog-a3-${variant}-v1\\.html#ending-preview`),
    );
  }
  assert.match(html, /autolab-mog-a-impact-frontier-v2\.html/);
  assert.doesNotMatch(html, /<iframe/i);
});

test('ending preview target enters the unique ending on desktop and mobile', async () => {
  const css = await readFile(
    new URL('./autolab-mog-a3-core-v1.css', import.meta.url),
    'utf8',
  );
  const anchorMatch = css.match(/\.ending-preview-anchor\s*\{[^}]*top:\s*([\d.]+)%/);
  const runHeights = [...css.matchAll(/\.research-run\s*\{[^}]*height:\s*([\d.]+)vh/g)]
    .map(match => Number(match[1]));

  assert.ok(anchorMatch, 'ending preview anchor must have a percentage offset');
  assert.deepEqual(runHeights, [680, 720]);

  const anchorFraction = Number(anchorMatch[1]) / 100;
  for (const runHeight of runHeights) {
    const progress = anchorFraction * runHeight / (runHeight - 100);
    assert.equal(phaseFor(progress), 'ending');
    assert.ok(progress > TIMELINE.compression && progress < 0.94);
  }
});
