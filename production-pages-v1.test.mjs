import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const ROOT = new URL('./', import.meta.url);
const HOME_URL = new URL('./index.html', ROOT);
const PRODUCT_URL = new URL('./product.html', ROOT);
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

test('Vercel root publishes the approved Rebirth homepage and Product page', async () => {
  const [home, product] = await Promise.all([
    readOrEmpty(HOME_URL),
    readOrEmpty(PRODUCT_URL),
  ]);

  assert.match(home, /<body data-ending="rebirth">/);
  assert.match(home, /EACH ARROW IS AN EXPERIMENT/);
  assert.match(home, /href="product\.html"[^>]*>Product<\/a>/);
  assert.match(product, /<body class="product-page">/);
  assert.match(product, /href="\/" class="wordmark"/);
  assert.doesNotMatch(`${home}\n${product}`, /\.superpowers\/|autolab-mog-(?:a3-rebirth|product)-v1\.html/);
});

test('production pages retain SEO metadata and expose only existing local assets', async () => {
  const [home, product, sitemap] = await Promise.all([
    readOrEmpty(HOME_URL),
    readOrEmpty(PRODUCT_URL),
    readFile(new URL('./sitemap.xml', ROOT), 'utf8'),
  ]);

  for (const marker of [
    '<link rel="canonical" href="https://www.autolab.ai/">',
    'property="og:image" content="https://www.autolab.ai/og.png"',
    'name="twitter:card" content="summary_large_image"',
    '"@type": "Organization"',
    '"@type": "SoftwareApplication"',
  ]) assert.ok(home.includes(marker), 'missing homepage metadata: ' + marker);

  for (const marker of [
    '<link rel="canonical" href="https://www.autolab.ai/product.html">',
    'property="og:image" content="https://www.autolab.ai/og.png"',
    'name="twitter:card" content="summary_large_image"',
    '"@type": "FAQPage"',
  ]) assert.ok(product.includes(marker), 'missing Product metadata: ' + marker);

  const pages = [home, product];
  const assetPaths = new Set(pages.flatMap(html => [...html.matchAll(
    /(?:href|src)="([^"?#]+\.(?:css|js))"/g,
  )].map(match => match[1].replace(/^\//, ''))));
  assert.ok(assetPaths.size > 0);
  for (const assetPath of assetPaths) await access(new URL(assetPath, ROOT));

  assert.match(sitemap, /<loc>https:\/\/www\.autolab\.ai\/product\.html<\/loc>/);
});

test('production Product FAQ matches the approved visible and structured copy', async () => {
  const product = await readOrEmpty(PRODUCT_URL);
  const faqSection = product.match(/<section class="product-faq"[\s\S]*?<\/section>/)?.[0] || '';
  const faqText = visibleText(faqSection);
  const schemas = [...product.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  )].map(match => JSON.parse(match[1]));
  const faqSchema = schemas.find(schema => schema['@type'] === 'FAQPage');

  assert.equal((faqSection.match(/<details/g) || []).length, 6);
  assert.equal(faqSchema?.mainEntity?.length, 6);
  let previousQuestion = -1;
  for (const [index, [question, answer]] of approvedFaq.entries()) {
    const questionIndex = faqText.indexOf(question);
    assert.ok(questionIndex > previousQuestion, 'missing or unordered FAQ: ' + question);
    assert.ok(faqText.includes(answer), 'visible answer differs: ' + question);
    assert.equal(faqSchema.mainEntity[index].name, question);
    assert.equal(
      faqSchema.mainEntity[index].acceptedAnswer.text,
      answer.replace(/ Read the full explanation →$/, ''),
    );
    previousQuestion = questionIndex;
  }
});

test('promoted modules stay byte-identical to the approved design sources', async () => {
  const promotedAssets = [
    'autolab-mog-core-v1.css',
    'autolab-mog-a3-core-v1.css',
    'autolab-mog-gpu-v1.css',
    'autolab-mog-product-v1.css',
    'autolab-mog-a3-motion-v1.js',
    'autolab-mog-a3-scene-v1.js',
    'autolab-mog-a3-onboarding-v1.js',
    'autolab-mog-hero-cycle-v1.js',
    'autolab-mog-gpu-motion-v1.js',
    'autolab-mog-gpu-scene-v1.js',
    'autolab-mog-product-motion-v1.js',
    'autolab-mog-product-scene-v1.js',
    'autolab-mog-product-explainer-v2.js',
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
