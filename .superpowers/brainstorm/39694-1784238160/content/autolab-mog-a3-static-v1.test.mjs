import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const variants = ['slingshot', 'rebirth', 'loop'];
const requiredIds = [
  'topbar',
  'brand-caret',
  'research-run',
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
  });
}
