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
    assert.match(
      html,
      /class="nav-status" aria-hidden="true"><i><\/i><span class="nav-status-copy"><\/span><\/span>/,
    );
    assert.match(html, /class="nav-center"/);
    assert.match(html, /id="get-started"/);
    assert.match(html, /role="tablist"/);
    assert.equal((html.match(/role="tab"/g) || []).length, 3);
    assert.equal((html.match(/role="tabpanel"/g) || []).length, 3);
    if (variant === 'rebirth') {
      assert.match(html, /href="#early-access"[^>]*>Get early access/);
    } else {
      assert.match(html, /href="#get-started"[^>]*>Start researching/);
    }
    assert.match(html, /href="#get-started"[^>]*>Run Autolab/);
    if (variant === 'rebirth') {
      assert.match(html, /href="#onboarding-console"[^>]*>\$ curl -fsSL/);
    } else {
      assert.match(html, /href="#get-started"[^>]*>\$ curl -fsSL/);
    }
    assert.match(html, /curl -fsSL app\.autolab\.ai\/install\.sh \| sh/);
    assert.match(html, /autolab install claude-code/);
    assert.match(html, /autolab install codex/);
    assert.match(html, /autolab-mog-a3-onboarding-v1\.js/);
    assert.match(
      html,
      /https:\/\/calendar\.superhuman\.com\/book\/11Wx5q95SPgTTclPo4\/KrRGA/,
    );
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

test('rebirth explains the autonomous experiment loop in plain language', async () => {
  const [html, scene, gpuScene] = await Promise.all([
    readFile(new URL('./autolab-mog-a3-rebirth-v1.html', import.meta.url), 'utf8'),
    readFile(new URL('./autolab-mog-a3-scene-v1.js', import.meta.url), 'utf8'),
    readFile(new URL('./autolab-mog-gpu-scene-v1.js', import.meta.url), 'utf8'),
  ]);
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  assert.match(text, /Set a goal and connect your GPUs\. Autolab's agents run experiments, stop jobs once they stop improving or are clearly failing, and use every result to decide what to try next\./);
  assert.match(text, /Tell Autolab what to improve\./);
  assert.match(text, /Choose the metric that matters, such as accuracy, cost, or latency\./);
  assert.match(text, /Turn ideas into experiments\./);
  assert.match(text, /Agents read your code and create concrete changes they can test\./);
  assert.match(text, /Run them across your GPUs\./);
  assert.match(text, /Autolab sends each experiment to the next available machine\./);
  assert.match(text, /Stop wasted work early\./);
  assert.match(text, /Runs stop when they have plateaued or are clearly going to fail\./);
  assert.match(text, /Choose what to try next\./);
  assert.match(text, /Every result helps Autolab propose a better next experiment\./);
  assert.match(text, /Return the best change\./);
  assert.match(text, /You get the winning code, its results, and the history behind it\./);
  assert.match(text, /Autolab watches every job\. When a run stops improving or is clearly failing, it ends the job and gives that GPU to the next experiment\./);
  assert.match(text, /More useful experiments finish without adding more compute\./);
  assert.doesNotMatch(`${html}\n${scene}\n${gpuScene}`, /—/);
});

test('rebirth exposes the Product page and exact conversion targets', async () => {
  const html = await readFile(
    new URL('./autolab-mog-a3-rebirth-v1.html', import.meta.url),
    'utf8',
  );

  assert.match(html, /href="autolab-mog-product-v1\.html"[^>]*>Product</);
  assert.match(html, /href="#research-run"[^>]*>How it works</);
  assert.match(html, /href="https:\/\/docs\.autolab\.ai"[^>]*>Docs</);
  assert.match(html, /href="#early-access"[^>]*>Get early access/);
  assert.match(html, /href="#onboarding-console"[^>]*>\$ curl -fsSL/);
});

test('hero cycle reserves one unbroken word and period', async () => {
  const [html, css] = await Promise.all([
    readFile(new URL('./autolab-mog-a3-rebirth-v1.html', import.meta.url), 'utf8'),
    readFile(new URL('./autolab-mog-core-v1.css', import.meta.url), 'utf8'),
  ]);

  assert.match(
    html,
    /class="hero-cycle-word"><em data-hero-cycle>research<\/em><span class="hero-period">\.<\/span><\/span>/,
  );
  assert.match(css, /\.hero-cycle-word\s*\{[^}]*white-space:\s*nowrap/s);
  assert.match(css, /\.hero-cycle-word\s*\{[^}]*min-width:/s);
});

test('navigation telemetry is hidden by default and driven by the motion timeline', async () => {
  const [css, scene] = await Promise.all([
    readFile(new URL('./autolab-mog-core-v1.css', import.meta.url), 'utf8'),
    readFile(new URL('./autolab-mog-a3-scene-v1.js', import.meta.url), 'utf8'),
  ]);

  assert.match(css, /\.nav-status\s*\{[^}]*opacity:\s*0/s);
  assert.match(css, /\.nav-status\.is-live\s*\{[^}]*opacity:\s*1/s);
  assert.match(scene, /navigationTelemetryFor\(progress\)/);
  assert.match(scene, /classList\.toggle\('is-live', telemetry\.visible\)/);
});

test('navigation uses one centered stage and onboarding has responsive styling', async () => {
  const [css, scene] = await Promise.all([
    readFile(new URL('./autolab-mog-core-v1.css', import.meta.url), 'utf8'),
    readFile(new URL('./autolab-mog-a3-scene-v1.js', import.meta.url), 'utf8'),
  ]);

  assert.match(css, /\.nav-shell\s*\{[^}]*display:\s*grid/s);
  assert.match(css, /\.nav-center\s*\{[^}]*grid-area:/s);
  assert.match(css, /\.topbar\.has-telemetry\s+\.nav-links/s);
  assert.match(css, /\.get-started\s*\{[^}]*display:\s*grid/s);
  assert.match(
    css,
    /\.get-started\s*\{[^}]*grid-template-columns:\s*minmax\(0,\.72fr\)\s+minmax\(520px,1\.18fr\)/s,
  );
  assert.match(css, /\.onboarding-tabs\s*\{/s);
  assert.match(
    css,
    /\.onboarding-panel pre\s*\{[^}]*font:\s*400 13px\/1\.95 "IBM Plex Mono",monospace/s,
  );
  assert.match(
    css,
    /@media \(max-width:\s*900px\)[\s\S]*\.onboarding-panel pre\s*\{\s*font-size:\s*11px;\s*\}/s,
  );
  assert.match(css, /:focus-visible/s);
  assert.match(
    scene,
    /classList\.toggle\('has-telemetry', telemetry\.visible\)/,
  );
});

test('settled vectors consume the topology gradient for their heading', async () => {
  const scene = await readFile(
    new URL('./autolab-mog-a3-scene-v1.js', import.meta.url),
    'utf8',
  );

  assert.match(scene, /surfaceGradient\(/);
  assert.match(scene, /surfaceAlignmentFor\(progress\)/);
  assert.match(scene, /target\.surfaceAlignment/);
  assert.match(scene, /target\.surfaceAngle/);
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
