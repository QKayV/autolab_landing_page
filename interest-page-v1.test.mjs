import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const ROOT_PAGE = new URL('./interest.html', import.meta.url);
const CONTENT_PAGE = new URL(
  './.superpowers/brainstorm/39694-1784238160/content/interest.html',
  import.meta.url,
);

test('both static roots expose one byte-identical interest page', async () => {
  const [root, content] = await Promise.all([
    readFile(ROOT_PAGE, 'utf8'),
    readFile(CONTENT_PAGE, 'utf8'),
  ]);

  assert.equal(content, root);
  assert.equal((root.match(/<form\b/g) || []).length, 1);
  assert.equal((root.match(/<input\b[^>]*type="email"/g) || []).length, 1);
  assert.equal((root.match(/data-early-access-website/g) || []).length, 1);
});

test('interest page submits only the approved fields through the site origin', async () => {
  const html = await readFile(ROOT_PAGE, 'utf8');
  const form = html.match(/<form\b[^>]*data-early-access[^>]*>/)?.[0] || '';

  assert.match(form, /data-endpoint="\/api\/interest"/);
  assert.match(form, /data-source="interest_page"/);
  assert.match(form, /data-ph-no-capture/);
  assert.match(html, /data-early-access-email/);
  assert.match(html, /data-early-access-submit/);
  assert.match(html, /data-early-access-status[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(html, /data-early-access-website[^>]*tabindex="-1"[^>]*autocomplete="off"/);
  assert.match(html, /By requesting access, you agree that Autolab may contact you about early access\./);
});

test('interest page loads the shared form and privacy-conscious analytics modules', async () => {
  const html = await readFile(ROOT_PAGE, 'utf8');

  assert.equal(
    (html.match(/<script type="module" src="\/autolab-early-access-v1\.js"><\/script>/g) || []).length,
    1,
  );
  assert.equal(
    (html.match(/<script type="module" src="\/autolab-posthog-v1\.js"><\/script>/g) || []).length,
    1,
  );
  assert.equal(html.includes(['p', 'h', 'x', '_'].join('')), false);
});

test('interest page is accessible, responsive, and restrained', async () => {
  const html = await readFile(ROOT_PAGE, 'utf8');

  assert.match(html, /<main\b/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /<label for="interest-email">Email address<\/label>/);
  assert.match(html, /:focus-visible/);
  assert.match(html, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(html, /@media \(max-width: 720px\)/);
  assert.match(html, /href="https:\/\/calendar\.superhuman\.com\/book\//);
  assert.equal(html.includes('—'), false);
});
