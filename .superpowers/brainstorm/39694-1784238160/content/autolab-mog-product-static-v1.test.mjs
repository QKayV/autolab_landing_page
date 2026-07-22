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

const tagsWithClass = (html, className) => (html.match(/<[^>]+>/g) || [])
  .filter(tag => {
    const classes = tag.match(/\bclass="([^"]*)"/)?.[1].split(/\s+/) || [];
    return classes.includes(className);
  });

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

test('Product circuit exposes three zones and one complete route', async () => {
  const html = await readFile(PRODUCT_URL, 'utf8');

  assert.equal(tagsWithClass(html, 'circuit-zone').length, 3);
  for (const zoneClass of ['circuit-inputs', 'circuit-autolab', 'circuit-output']) {
    assert.equal(tagsWithClass(html, zoneClass).length, 1, 'missing circuit zone: ' + zoneClass);
  }
  for (const routeClass of ['route-history', 'route-active', 'route-loop']) {
    assert.equal(tagsWithClass(html, routeClass).length, 1, 'missing circuit route: ' + routeClass);
  }
});

test('Product topology and experiment plates expose their static anatomy', async () => {
  const html = await readFile(PRODUCT_URL, 'utf8');

  for (const hook of [
    'data-topology-source="repository"',
    'data-topology-source="evaluation"',
    'data-topology-source="constraints"',
    'data-compute-pool="local"',
    'data-compute-pool="cloud"',
    'data-compute-pool="cluster"',
    'data-anatomy-part="change"',
    'data-anatomy-part="gpu"',
    'data-anatomy-part="trace"',
    'data-anatomy-part="logs"',
    'data-anatomy-part="checkpoint"',
    'data-anatomy-part="evaluation"',
  ]) assert.match(html, new RegExp(hook));
});

test('Product customer boundary keeps its semantic label in topology Grid flow', async () => {
  const [html, css] = await Promise.all([
    readFile(PRODUCT_URL, 'utf8'),
    readFile(new URL('./autolab-mog-product-v1.css', import.meta.url), 'utf8'),
  ]);

  assert.match(
    html,
    /<div class="customer-boundary">\s*<span class="boundary-label">CUSTOMER ENVIRONMENT<\/span>/,
  );
  assert.match(
    css,
    /\.customer-boundary \{[^}]*display: grid;[^}]*grid-template-areas: "boundary-label boundary-label boundary-label" "sources scheduler pools";/,
  );
  assert.match(css, /\.boundary-label \{[^}]*grid-area: boundary-label;/);
  assert.doesNotMatch(css, /\.boundary-label \{[^}]*position: absolute;/);
  assert.match(
    css,
    /@media \(max-width: 720px\) \{[\s\S]*?\.customer-boundary \{[^}]*grid-template-areas: "boundary-label" "sources" "scheduler" "pools";/,
  );
});

test('Product plate explanations use readable, compliant utility text', async () => {
  const css = await readFile(
    new URL('./autolab-mog-product-v1.css', import.meta.url),
    'utf8',
  );
  const ruleBody = selector => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return css.match(new RegExp(`(?:^|\\n)${escaped} \\{([^}]*)\\}`))?.[1] || '';
  };
  const readableSelectors = [
    '.plate-index',
    '.boundary-label',
    '.topology-sources small',
    '.topology-scheduler small',
    '.anatomy-core small',
    '[data-anatomy-part] > span',
    '[data-anatomy-part] > small',
  ];

  for (const selector of readableSelectors) {
    const declarations = ruleBody(selector);
    assert.match(declarations, /font: [^;]*10px\//, `${selector} must use 10px utility text`);
    assert.match(
      declarations,
      /color: (?:var\(--muted\)|#a9b0ac);/,
      `${selector} must use a compliant annotation color`,
    );
    assert.doesNotMatch(declarations, /var\(--faint\)/, `${selector} must not use --faint for text`);
  }
  assert.match(ruleBody('.compute-pools > div'), /font: [^;]*10px\//);
  assert.match(ruleBody('.plate-index small'), /color: var\(--muted\);/);
});

test('Product topology reserves dashed connectors for proposed work', async () => {
  const [html, css] = await Promise.all([
    readFile(PRODUCT_URL, 'utf8'),
    readFile(new URL('./autolab-mog-product-v1.css', import.meta.url), 'utf8'),
  ]);
  const boundaryRule = css.match(/(?:^|\n)\.customer-boundary \{([^}]*)\}/)?.[1] || '';
  const evaluationRule = css.match(
    /(?:^|\n)\[data-anatomy-part="evaluation"\] \{([^}]*)\}/,
  )?.[1] || '';

  assert.match(html, /<i class="topology-proposed-route" aria-hidden="true"><\/i>/);
  assert.match(
    css,
    /\.topology-proposed-route \{[^}]*position: absolute;[^}]*border-top: 1px dashed var\(--mint-deep\);/,
  );
  assert.match(
    css,
    /@media \(max-width: 720px\) \{[\s\S]*?\.topology-proposed-route \{[^}]*border-left: 1px dashed var\(--mint-deep\);/,
  );
  assert.doesNotMatch(boundaryRule, /dashed/);
  assert.doesNotMatch(evaluationRule, /dashed/);
});

test('Product chapters preserve approved copy, figures, and image summaries', async () => {
  const html = await readFile(PRODUCT_URL, 'utf8');
  const text = visibleText(html);
  const chapterCopy = [
    [
      'Connect what you already have.',
      'Point Autolab at your repository, evaluation, constraints, and available compute. Machines across a workstation, cloud account, or cluster participate in one experiment queue.',
    ],
    [
      'See what every run is doing.',
      'Autolab reads the proposed code change, assigned GPU, training trace, logs, checkpoints, and evaluation state while each experiment runs.',
    ],
    [
      'Stop waste. Keep GPUs moving.',
      'Watchdog models stop runs that have plateaued or are clearly trending toward failure. The evidence remains, and the freed GPU immediately becomes available to the next queued experiment.',
    ],
    [
      'Turn every result into the next experiment.',
      'Completed, stopped, and failed runs all add evidence. Autolab uses that history to propose concrete changes, avoid repeated dead ends, and choose the next experiments worth running.',
    ],
    [
      'Review the full research record.',
      'The winning change arrives with its configuration, evaluation state, logs, checkpoint reference, and experiment lineage. Your team decides what ships.',
    ],
    [
      'Deploy where your research already runs.',
      'Run Autolab in your cloud account, on your cluster, on-prem, or with managed compute. Code, data, and model weights can remain inside your network.',
    ],
  ];
  const figureClasses = [
    'topology-plate', 'experiment-anatomy', 'watchdog-feature',
    'lineage-plate', 'research-packet', 'deployment-plate',
  ];

  let previous = -1;
  for (const [headline, paragraph] of chapterCopy) {
    const index = text.indexOf(headline + ' ' + paragraph);
    assert.ok(index > previous, 'missing or unordered chapter copy: ' + headline);
    previous = index;
  }
  for (const figureClass of figureClasses) {
    assert.equal(tagsWithClass(html, figureClass).length, 1, 'missing figure hook: ' + figureClass);
  }

  const summaryTags = [
    tagsWithClass(html, 'product-circuit')[0],
    tagsWithClass(html, 'topology-plate')[0],
    tagsWithClass(html, 'experiment-anatomy')[0],
    tagsWithClass(html, 'watchdog-instrument')[0],
    tagsWithClass(html, 'lineage-plate')[0],
    tagsWithClass(html, 'research-packet')[0],
    tagsWithClass(html, 'deployment-plate')[0],
  ];

  for (const tag of summaryTags) {
    assert.match(tag, /\brole="img"/);
    const summary = tag.match(/\baria-label="([^"]+)"/)?.[1] || '';
    assert.ok(summary.length > 0 && summary.length <= 160, 'missing or verbose image summary');
  }
  const circuitSummary = summaryTags[0].match(/\baria-label="([^"]+)"/)[1];
  for (const zone of ['Your System', 'Autolab', 'Your Team']) {
    assert.match(circuitSummary, new RegExp(zone, 'i'));
  }
});

test('Product watchdog canvas stays nested inside its instrument', async () => {
  const html = await readFile(PRODUCT_URL, 'utf8');

  assert.equal((html.match(/id="watchdog-canvas"/g) || []).length, 1);
  assert.match(
    html,
    /<div\b[^>]*class="[^"]*\bwatchdog-instrument\b[^"]*"[^>]*>\s*<canvas id="watchdog-canvas" aria-hidden="true"><\/canvas>\s*<\/div>/,
  );
});

test('Research memory preserves every outcome and proposes a next batch', async () => {
  const [html, css] = await Promise.all([
    readFile(PRODUCT_URL, 'utf8'),
    readFile(new URL('./autolab-mog-product-v1.css', import.meta.url), 'utf8'),
  ]);
  const text = visibleText(html);
  const outcomes = [
    ['completed', '● COMPLETED'],
    ['stopped', '○ STOPPED'],
    ['failed', '× FAILED'],
  ];

  for (const [outcome, label] of outcomes) {
    assert.equal(
      (html.match(new RegExp(`data-lineage-result="${outcome}"`, 'g')) || []).length,
      1,
      `missing lineage outcome: ${outcome}`,
    );
    assert.match(text, new RegExp(label.replace(/[●○×]/g, '\\$&')));
  }
  assert.equal((html.match(/data-next-experiment/g) || []).length, 3);
  assert.equal(tagsWithClass(html, 'lineage-history-route').length, 3);
  assert.equal(tagsWithClass(html, 'lineage-proposal-route').length, 3);
  assert.equal(tagsWithClass(html, 'lineage-memory').length, 1);
  assert.equal((html.match(/data-lineage-selected/g) || []).length, 1);
  assert.equal((text.match(/▸ PROPOSED CHANGE/g) || []).length, 3);
  assert.match(text, /RESEARCH MEMORY/);
  assert.match(text, /dead ends remain useful evidence/i);
  assert.match(text, /useful results shape the next batch/i);

  const historyRule = css.match(/(?:^|\n)\.lineage-history-route \{([^}]*)\}/)?.[1] || '';
  const proposalRule = css.match(/(?:^|\n)\.lineage-proposal-route \{([^}]*)\}/)?.[1] || '';
  const selectedRule = css.match(/(?:^|\n)\.lineage-result\[data-lineage-selected\] \{([^}]*)\}/)?.[1] || '';
  assert.match(historyRule, /stroke: rgba\(20,20,20,/);
  assert.doesNotMatch(historyRule, /stroke-dasharray/);
  assert.match(proposalRule, /stroke: var\(--mint-deep\);/);
  assert.match(proposalRule, /stroke-dasharray:/);
  assert.match(selectedRule, /color: var\(--mint-deep\);/);
});

test('Research packet makes the human review boundary concrete', async () => {
  const [html, css] = await Promise.all([
    readFile(PRODUCT_URL, 'utf8'),
    readFile(new URL('./autolab-mog-product-v1.css', import.meta.url), 'utf8'),
  ]);
  const text = visibleText(html);
  const parts = [
    ['diff', 'CODE DIFF'],
    ['config', 'RUN CONFIG'],
    ['evaluation', 'EVALUATION'],
    ['logs', 'LOGS'],
    ['checkpoint', 'CHECKPOINT'],
    ['lineage', 'LINEAGE'],
    ['approval', 'HUMAN APPROVAL REQUIRED'],
  ];

  for (const [part, label] of parts) {
    assert.equal(
      (html.match(new RegExp(`data-packet-part="${part}"`, 'g')) || []).length,
      1,
      `missing research packet part: ${part}`,
    );
    assert.match(text, new RegExp(label));
  }
  assert.equal((html.match(/data-packet-part=/g) || []).length, 7);
  assert.equal(tagsWithClass(html, 'diff-removed').length, 1);
  assert.equal(tagsWithClass(html, 'diff-added').length, 1);
  for (const detail of [
    'environment attached',
    '○ IMPROVED',
    'run record attached',
    'artifact referenced',
    'history attached',
    'YOUR TEAM DECIDES WHAT SHIPS',
  ]) assert.match(text, new RegExp(detail));

  assert.match(
    css,
    /\.packet-stack \{[^}]*display: grid;[^}]*grid-template-columns: repeat\(12,minmax\(0,1fr\)\);/,
  );
  assert.match(
    css,
    /\.packet-approval \{[^}]*background: #0c1210;[^}]*color: var\(--paper\);/,
  );
  assert.match(
    css,
    /@media \(max-width: 720px\) \{[\s\S]*?\.packet-stack \{[^}]*grid-template-columns: 1fr;/,
  );
});

test('Product page visible copy avoids em dashes', async () => {
  const html = await readFile(PRODUCT_URL, 'utf8');

  assert.doesNotMatch(visibleText(html), /—/);
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
