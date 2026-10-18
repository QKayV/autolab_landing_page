import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const ROOT = new URL('./', import.meta.url);
const HOME_URL = new URL('./index.html', ROOT);
const SOURCE_ROOT = new URL('./.superpowers/brainstorm/39694-1784238160/content/', ROOT);

const approvedFaq = [
  [
    'What is autoresearch?',
    'Autoresearch is autonomous AI agents running the machine learning research loop: proposing experiments, writing the code, training and evaluating models, and deciding what to try next — while humans set the goal. Instead of one researcher hand-running one experiment at a time, an autoresearch platform runs thousands in parallel and merges only what improves the metric. Read the full explanation →',
  ],
  [
    'What is Autolab?',
    'Autolab is an autoresearch platform for AI model training. You give it a goal and an eval; its agents read your repo, plan experiments, launch them across your GPUs, score every run against your metric, and keep iterating until the goal is met. It was built by ML researchers from MIT, Harvard, Stanford, and Google DeepMind.',
  ],
  [
    'What is agentic training of models?',
    'Agentic model training means AI agents, not humans, drive the training loop: they sweep learning rates, change data mixes, modify architectures, launch runs, read the training logs, and decide the next experiment. Autolab coordinates hundreds of these agents against a single goal, on your own compute.',
  ],
  [
    'How is this different from AutoML or hyperparameter tuning?',
    'AutoML and hyperparameter optimization search a fixed space with predefined strategies. Autoresearch agents write real code in your repository: new data pipelines, loss functions, kernels, quantization and serving configs — anything a researcher could try — and every change is scored against your own evals before it merges.',
  ],
  [
    'Where do the experiments run?',
    'On your cluster or in your cloud account. Code, data, and weights never leave your network, and on-prem installs are available for pilots. Autolab keeps whatever GPUs you have — from a spare 3090 to a multi-node H100 cluster — saturated with the next-most-valuable experiment.',
  ],
  [
    'What can Autolab optimize?',
    'Whatever your eval measures: model accuracy, training cost, inference latency, throughput. Teams use it for pre-training and fine-tuning experiments, post-training recipes, and inference optimization — the agents push the number, and nothing ships unless it moves.',
  ],
];

const visibleText = html => html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const readOrEmpty = url => readFile(url, 'utf8').catch(() => '');

test('Vercel root publishes the approved Rebirth homepage', async () => {
  const home = await readOrEmpty(HOME_URL);

  assert.match(home, /<body data-ending="rebirth">/);
  assert.match(home, /Autolab \/ model improvement loop/);
  assert.doesNotMatch(home, /href="product\.html"/);
  assert.doesNotMatch(home, /\.superpowers\/|autolab-(?:mog-)?(?:a3-rebirth|product)-v1\.html/);
});

test('production pages retain SEO metadata and expose only existing local assets', async () => {
  const [home, sitemap] = await Promise.all([
    readOrEmpty(HOME_URL),
    readFile(new URL('./sitemap.xml', ROOT), 'utf8'),
  ]);

  for (const marker of [
    '<link rel="canonical" href="https://www.autolab.ai/">',
    'property="og:image" content="https://www.autolab.ai/og.png"',
    'name="twitter:card" content="summary_large_image"',
    '"@type": "Organization"',
    '"@type": "SoftwareApplication"',
  ]) assert.ok(home.includes(marker), 'missing homepage metadata: ' + marker);

  const pages = [home];
  const assetPaths = new Set(pages.flatMap(html => [...html.matchAll(
    /(?:href|src)="([^"?#]+\.(?:css|js))"/g,
  )].map(match => match[1].replace(/^\//, ''))));
  assert.ok(assetPaths.size > 0);
  for (const assetPath of assetPaths) await access(new URL(assetPath, ROOT));

  assert.doesNotMatch(sitemap, /product\.html/);
});

test('landing headers expose the full navigation in the mobile menu', async () => {
  const pages = [
    ['homepage', await readOrEmpty(HOME_URL)],
  ];
  const expectedLinks = [
    ['How it works', /#research-run/],
    ['Research', /(?:research\/index\.html|\/research\/)/],
    ['Careers', /careers\.html/],
    ['Discord', /https:\/\/discord\.gg\/2ZVZmE8Ppb/],
  ];

  for (const [page, html] of pages) {
    const menu = html.match(/<details class="mobile-nav">[\s\S]*?<\/details>/)?.[0] || '';
    assert.match(menu, /<summary aria-label="Open main navigation">Menu<\/summary>/, page + ' missing mobile menu trigger');
    for (const [label, hrefPattern] of expectedLinks) {
      assert.ok(menu.includes('>' + label + '</a>'), page + ' mobile menu missing ' + label);
      assert.match(menu, hrefPattern, page + ' mobile menu missing href for ' + label);
    }
  }
});

test('promoted modules stay byte-identical to the approved design sources', async () => {
  const promotedAssets = [
    'autolab-core-v1.css',
    'autolab-a3-core-v1.css',
    'autolab-gpu-v1.css',
    'autolab-a3-motion-v1.js',
    'autolab-a3-scene-v1.js',
    'autolab-a3-onboarding-v1.js',
    'autolab-hero-cycle-v1.js',
    'autolab-gpu-motion-v1.js',
    'autolab-gpu-scene-v1.js',
  ];

  for (const asset of promotedAssets) {
    const [production, source] = await Promise.all([
      readOrEmpty(new URL(asset, ROOT)),
      readOrEmpty(new URL(asset, SOURCE_ROOT)),
    ]);
    assert.ok(production.length > 0, 'missing production asset: ' + asset);
    assert.equal(production, source, 'promoted asset drifted: ' + asset);
  }
});
