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
    /@media \(max-width: 900px\) \{[\s\S]*?\.customer-boundary \{[^}]*grid-template-areas: "boundary-label" "sources" "scheduler" "pools";/,
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
    /@media \(max-width: 900px\) \{[\s\S]*?\.topology-proposed-route \{[^}]*border-left: 1px dashed var\(--mint-deep\);/,
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
  assert.match(selectedRule, /border-color: var\(--mint-deep\);/);
  assert.match(selectedRule, /background: rgba\(47,206,150,\.1\);/);
  assert.match(selectedRule, /box-shadow: inset 3px 0 0 var\(--mint\);/);
  assert.doesNotMatch(selectedRule, /(?:^|;)\s*color: var\(--mint-deep\);/);
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
    /@media \(max-width: 900px\) \{[\s\S]*?\.packet-stack \{[^}]*grid-template-columns: 1fr;/,
  );
});

test('Research packet sheets reserve non-overlapping desktop Grid tracks', async () => {
  const css = await readFile(
    new URL('./autolab-mog-product-v1.css', import.meta.url),
    'utf8',
  );
  const selectors = [
    '.packet-diff', '.packet-config', '.packet-evaluation', '.packet-logs',
    '.packet-checkpoint', '.packet-lineage', '.packet-approval',
  ];
  const expectedColumns = new Map([
    ['.packet-diff', [1, 7]],
    ['.packet-config', [7, 10]],
    ['.packet-evaluation', [10, 13]],
    ['.packet-logs', [7, 10]],
    ['.packet-checkpoint', [10, 13]],
    ['.packet-lineage', [2, 7]],
    ['.packet-approval', [7, 13]],
  ]);
  const ruleBody = selector => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return css.match(new RegExp(`(?:^|\\n)${escaped} \\{([^}]*)\\}`))?.[1] || '';
  };
  const readRange = (declarations, property) => {
    const match = declarations.match(new RegExp(`${property}: (\\d+) \\/ (\\d+);`));
    assert.ok(match, `missing ${property}`);
    return [Number(match[1]), Number(match[2])];
  };
  const rectangles = selectors.map(selector => {
    const declarations = ruleBody(selector);
    return {
      selector,
      columns: readRange(declarations, 'grid-column'),
      rows: readRange(declarations, 'grid-row'),
    };
  });

  for (let index = 0; index < rectangles.length; index += 1) {
    const left = rectangles[index];
    assert.deepEqual(left.columns, expectedColumns.get(left.selector));
    for (const right of rectangles.slice(index + 1)) {
      const rowsOverlap = Math.max(left.rows[0], right.rows[0]) < Math.min(left.rows[1], right.rows[1]);
      const columnsOverlap = Math.max(left.columns[0], right.columns[0]) < Math.min(left.columns[1], right.columns[1]);
      assert.ok(
        !(rowsOverlap && columnsOverlap),
        `${left.selector} and ${right.selector} share opaque Grid tracks`,
      );
    }
  }

  assert.match(
    css,
    /@media \(max-width: 900px\) \{[\s\S]*?\.packet-sheet,\.packet-diff,\.packet-config,\.packet-evaluation,\.packet-logs,\.packet-checkpoint,\.packet-lineage,\.packet-approval \{[^}]*grid-column: 1;[^}]*grid-row: auto;[^}]*transform: none;/,
  );
});

test('Product research accents keep required small text readable', async () => {
  const css = await readFile(
    new URL('./autolab-mog-product-v1.css', import.meta.url),
    'utf8',
  );
  const ruleBody = selector => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return css.match(new RegExp(`(?:^|\\n)${escaped} \\{([^}]*)\\}`))?.[1] || '';
  };
  const readableText = new Map([
    ['.lineage-result[data-lineage-selected] > span', 'var(--ink)'],
    ['.lineage-result[data-lineage-selected] small', 'var(--muted)'],
    ['[data-next-experiment] > span', 'var(--ink)'],
    ['.diff-added', 'var(--ink)'],
    ['.packet-evaluation > strong', 'var(--ink)'],
  ]);

  for (const [selector, token] of readableText) {
    const declarations = ruleBody(selector);
    assert.match(declarations, new RegExp(`color: ${token.replace(/[()\-]/g, '\\$&')};`));
    assert.doesNotMatch(declarations, /(?:^|;)\s*color: var\(--mint-deep\);/);
  }
  assert.match(ruleBody('.diff-added'), /border-left-color: var\(--mint\);/);
  assert.match(ruleBody('.packet-evaluation'), /border-left: 3px solid var\(--mint\);/);
});

test('Research packet headers wrap intact inside the clipped sheet', async () => {
  const [html, css] = await Promise.all([
    readFile(PRODUCT_URL, 'utf8'),
    readFile(new URL('./autolab-mog-product-v1.css', import.meta.url), 'utf8'),
  ]);
  const ruleBody = selector => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return css.match(new RegExp(`(?:^|\\n)${escaped} \\{([^}]*)\\}`))?.[1] || '';
  };
  const headerPairs = [...html.matchAll(/<header><span>([^<]+)<\/span><b>([^<]+)<\/b><\/header>/g)]
    .flatMap(match => [match[1], match[2]]);

  assert.equal(headerPairs.length, 12);
  for (const token of headerPairs) {
    assert.ok(token.length * 7 <= 92, `packet header token is too wide: ${token}`);
  }
  assert.match(ruleBody('.packet-sheet'), /gap: 7px;/);
  assert.match(ruleBody('.packet-sheet header'), /padding-bottom: 8px;/);
  assert.match(ruleBody('.packet-sheet header'), /flex-wrap: wrap;/);
  assert.match(ruleBody('.packet-sheet header'), /column-gap: 10px;/);
  assert.match(ruleBody('.packet-sheet header'), /row-gap: 3px;/);
  assert.match(ruleBody('.packet-sheet header span,.packet-sheet header b'), /min-width: 0;/);
  assert.match(ruleBody('.packet-sheet header span,.packet-sheet header b'), /flex: 0 0 auto;/);
  assert.match(ruleBody('.packet-sheet header span,.packet-sheet header b'), /white-space: nowrap;/);
  assert.match(ruleBody('.experiment-queue,.product-diff'), /overflow: hidden;/);

  const constrainedContentHeight = (2 * 72) + 12 - (2 * 15);
  const worstAuthoredContentHeight = (2 * 12.5) + 3 + 8 + 1 + (2 * 14.85) + (3 * 14) + (2 * 7);
  assert.ok(worstAuthoredContentHeight <= constrainedContentHeight);
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
});

test('Product deployment plate separates customer infrastructure from managed compute', async () => {
  const [html, css] = await Promise.all([
    readFile(PRODUCT_URL, 'utf8'),
    readFile(new URL('./autolab-mog-product-v1.css', import.meta.url), 'utf8'),
  ]);
  const text = visibleText(html);
  const customerBoundary = html.match(
    /<section class="deployment-customer-boundary" data-deployment-boundary>([\s\S]*?)<\/section>/,
  )?.[1] || '';

  assert.match(customerBoundary, /YOUR NETWORK/);
  for (const label of ['CUSTOMER CLOUD', 'CLUSTER', 'ON-PREM', 'CODE', 'DATA', 'WEIGHTS']) {
    assert.match(visibleText(customerBoundary), new RegExp(label));
  }
  assert.doesNotMatch(customerBoundary, /MANAGED COMPUTE/);
  assert.match(text, /MANAGED COMPUTE/);
  assert.match(text, /AUTOLAB CONTROL PLANE/);
  assert.equal((html.match(/data-deployment-route=/g) || []).length, 4);
  for (const route of ['customer-cloud', 'cluster', 'on-prem', 'managed-compute']) {
    assert.match(html, new RegExp(`data-deployment-route="${route}"`));
  }
  assert.match(
    css,
    /\.deployment-customer-boundary \{[^}]*border: 1px dashed[^}]*display: grid;/,
  );
  assert.match(css, /\.deployment-system \{[^}]*display: grid;/);
  assert.match(css, /\.deployment-connectors \{[^}]*position: absolute;/);
  assert.doesNotMatch(css, /\.deployment-customer-boundary \{[^}]*position: absolute;/);
});

test('Product deployment routes stay centered in proportional Grid targets', async () => {
  const [html, css] = await Promise.all([
    readFile(PRODUCT_URL, 'utf8'),
    readFile(new URL('./autolab-mog-product-v1.css', import.meta.url), 'utf8'),
  ]);
  const ruleBody = selector => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return css.match(new RegExp(`(?:^|\\n)${escaped} \\{([^}]*)\\}`))?.[1] || '';
  };
  const systemRule = ruleBody('.deployment-system');

  assert.match(
    systemRule,
    /grid-template-columns: minmax\(0,3fr\) minmax\(110px,1fr\);/,
  );
  assert.match(systemRule, /column-gap: clamp\(18px,2\.4vw,28px\);/);
  assert.match(ruleBody('.deployment-managed'), /width: 100%;/);

  const routes = new Map(
    [...html.matchAll(/data-deployment-route="([^"]+)" d="M([\d.]+) [\d.]+ C[^"]* ([\d.]+) [\d.]+"/g)]
      .map(match => [match[1], { startX: Number(match[2]), endX: Number(match[3]) }]),
  );
  assert.equal(routes.size, 4);

  for (const { systemWidth, columnGap } of [
    { systemWidth: 520, columnGap: 18 },
    { systemWidth: 920, columnGap: 28 },
  ]) {
    const customerWidth = (systemWidth - columnGap) * .75;
    const cardWidth = (customerWidth - 36 - 20) / 3;
    const customerIntervals = Array.from({ length: 3 }, (_, index) => {
      const start = 18 + index * (cardWidth + 10);
      return [start, start + cardWidth];
    });
    const intervals = new Map([
      ['customer-cloud', customerIntervals[0]],
      ['cluster', customerIntervals[1]],
      ['on-prem', customerIntervals[2]],
      ['managed-compute', [0, customerWidth]],
    ]);
    const controlInterval = [customerWidth + columnGap, systemWidth];
    const fromViewBox = value => value / 960 * systemWidth;

    for (const [name, route] of routes) {
      const source = fromViewBox(route.startX);
      const target = fromViewBox(route.endX);
      const [sourceStart, sourceEnd] = intervals.get(name);
      const normalizedCenter = ((sourceStart + sourceEnd) / 2) / systemWidth * 960;
      assert.ok(source >= sourceStart && source <= sourceEnd, `${name} route misses its source`);
      assert.ok(Math.abs(route.startX - normalizedCenter) <= 12, `${name} route is off center`);
      assert.ok(
        target >= controlInterval[0] && target <= controlInterval[1],
        `${name} route misses the control plane`,
      );
    }
  }
});

test('Product deployment metadata fits the narrowest authored customer card', async () => {
  const html = await readFile(PRODUCT_URL, 'utf8');
  const metadata = [...html.matchAll(
    /data-deployment-node="(?:customer-cloud|cluster|on-prem)"><span>([^<]+)<\/span>/g,
  )].map(match => match[1]);

  assert.deepEqual(metadata, ['01 / CUSTOMER', '02 / CUSTOMER', '03 / CUSTOMER']);
  assert.doesNotMatch(html, /INFRASTRUCTURE/);

  const minimumSystemWidth = 520;
  const minimumGap = 18;
  const customerWidth = (minimumSystemWidth - minimumGap) * .75;
  const cardContentWidth = ((customerWidth - 36 - 20) / 3) - 24;
  const longestToken = Math.max(
    ...metadata.flatMap(label => label.split(/\s+/).map(token => token.length)),
  );
  const estimatedTokenWidth = longestToken * 10 * .62;
  assert.ok(estimatedTokenWidth <= cardContentWidth);
});

test('Product page restores all three accessible onboarding paths', async () => {
  const html = await readFile(PRODUCT_URL, 'utf8');
  const text = visibleText(html);
  const tabs = [...html.matchAll(/<button id="([^"]+)" role="tab" aria-selected="(true|false)" aria-controls="([^"]+)" tabindex="(-?\d)">([^<]+)<\/button>/g)];
  const panels = [...html.matchAll(/<div class="onboarding-panel" id="([^"]+)" role="tabpanel" aria-labelledby="([^"]+)"( hidden)?>/g)];

  assert.match(html, /<section class="product-onboarding" id="start-researching">/);
  assert.match(html, /data-onboarding-tabs/);
  assert.match(html, /role="tablist"/);
  assert.equal(tabs.length, 3);
  assert.equal(panels.length, 3);
  assert.deepEqual(tabs.map(match => match[5]), ['CLI', 'Claude Code', 'Codex']);
  assert.deepEqual(tabs.map(match => match[2]), ['true', 'false', 'false']);
  assert.deepEqual(tabs.map(match => match[4]), ['0', '-1', '-1']);
  assert.equal(panels.filter(match => match[3]).length, 2);

  const ids = [...tabs.map(match => match[1]), ...panels.map(match => match[1])];
  assert.equal(new Set(ids).size, 6);
  for (const tab of tabs) {
    assert.ok(panels.some(panel => panel[1] === tab[3] && panel[2] === tab[1]));
  }
  for (const line of [
    '$ curl -fsSL app.autolab.ai/install.sh | sh',
    '$ autolab init # connect the evaluation that prints your metric',
    '$ autolab start # begin proposing and running experiments',
  ]) assert.ok(text.includes(line), `missing onboarding line: ${line}`);
  assert.match(html, /<script type="module" src="autolab-mog-a3-onboarding-v1\.js"><\/script>/);
});

test('Product onboarding keeps its console large and becomes one column below 900px', async () => {
  const css = await readFile(
    new URL('./autolab-mog-product-v1.css', import.meta.url),
    'utf8',
  );

  assert.match(
    css,
    /\.product-onboarding \{[^}]*display: grid;[^}]*grid-template-columns: minmax\(0,[^)]+\) minmax\(620px,[^)]+\);/,
  );
  assert.match(
    css,
    /@media \(max-width: 900px\) \{[\s\S]*?\.product-onboarding \{[^}]*grid-template-columns: 1fr;/,
  );
  assert.match(
    css,
    /\.product-onboarding \.onboarding-tabs button:focus-visible \{[^}]*outline: 2px solid var\(--mint\);/,
  );
  for (const selector of [
    '.product-onboarding .onboarding-access-label',
    '.product-onboarding .onboarding-head',
    '.product-onboarding .onboarding-tabs button',
  ]) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const declarations = css.match(new RegExp(`(?:^|\\n)${escaped} \\{([^}]*)\\}`))?.[1] || '';
    assert.match(declarations, /font: [^;]*10px\//, `${selector} must use at least 10px text`);
  }
});

test('Product onboarding stacks before its console crowds the copy', async () => {
  const css = await readFile(
    new URL('./autolab-mog-product-v1.css', import.meta.url),
    'utf8',
  );

  const breakpoint1080 = css.slice(
    css.indexOf('@media (max-width: 1080px)'),
    css.indexOf('@media (max-width: 900px)'),
  );
  const breakpoint900 = css.slice(
    css.indexOf('@media (max-width: 900px)'),
    css.indexOf('@media (max-width: 720px)'),
  );

  assert.match(breakpoint1080, /\.product-onboarding \{[^}]*grid-template-columns: 1fr;/);
  assert.match(breakpoint1080, /\.product-onboarding-console-column \{[^}]*min-width: 0;/);
  assert.match(breakpoint900, /\.product-onboarding \{[^}]*grid-template-columns: 1fr;/);
});

test('Product selected onboarding tab keeps its active dark-console treatment', async () => {
  const css = await readFile(
    new URL('./autolab-mog-product-v1.css', import.meta.url),
    'utf8',
  );
  const baseSelector = '.product-onboarding .onboarding-tabs button {';
  const selectedSelector = '.product-onboarding .onboarding-tabs button[aria-selected="true"] {';
  const selectedRule = css.match(
    /\.product-onboarding \.onboarding-tabs button\[aria-selected="true"\] \{([^}]*)\}/,
  )?.[1] || '';

  assert.match(selectedRule, /color: var\(--paper\);/);
  assert.match(selectedRule, /border-color: var\(--mint\);/);
  assert.ok(css.indexOf(selectedSelector) > css.indexOf(baseSelector));
});

test('Product small deployment and onboarding labels use AA text tokens on Paper', async () => {
  const css = await readFile(
    new URL('./autolab-mog-product-v1.css', import.meta.url),
    'utf8',
  );
  const ruleBody = selector => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return css.match(new RegExp(`(?:^|\\n)${escaped} \\{([^}]*)\\}`))?.[1] || '';
  };

  assert.match(ruleBody('.deployment-managed > b'), /color: var\(--ink\);/);
  assert.match(ruleBody('.product-onboarding .onboarding-access-label'), /color: var\(--ink\);/);
  assert.match(ruleBody('.product-onboarding .mono-label'), /color: var\(--muted\);/);
  assert.match(ruleBody('.product-onboarding .mono-label'), /font: [^;]*10px\//);
});

test('Product FAQ answers five technical buying questions', async () => {
  const [html, css] = await Promise.all([
    readFile(PRODUCT_URL, 'utf8'),
    readFile(new URL('./autolab-mog-product-v1.css', import.meta.url), 'utf8'),
  ]);
  const text = visibleText(html);
  const questions = [
    'What does Autolab connect to?',
    'How is this different from fixed-space tuning?',
    'Where do experiments run?',
    'What can Autolab optimize?',
    'What does a human approve?',
  ];

  assert.equal((html.match(/<details/g) || []).length, 5);
  assert.equal((html.match(/<summary/g) || []).length, 5);
  for (const question of questions) assert.ok(text.includes(question));
  for (const answerConcept of [
    /code repository/i,
    /fixed list of parameters/i,
    /customer cloud/i,
    /evaluation goal/i,
    /proposed code change and the evidence/i,
  ]) assert.match(text, answerConcept);
  assert.match(
    css,
    /\.product-faq summary:focus-visible \{[^}]*outline: 2px solid var\(--mint-deep\);/,
  );
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

test('Product chapter reveals animate only restrained diagram accents', async () => {
  const [html, css] = await Promise.all([
    readFile(PRODUCT_URL, 'utf8'),
    readFile(new URL('./autolab-mog-product-v1.css', import.meta.url), 'utf8'),
  ]);
  const collectRevealRules = state => [...css.matchAll(new RegExp(
    `([^{}]*\\[data-explainer-chapter\\]\\[data-reveal="${state}"\\][^{}]*)\\{([^}]*)\\}`,
    'g',
  ))];
  const pendingRules = collectRevealRules('pending');
  const resolvedRules = collectRevealRules('resolved');
  const pendingSelectors = pendingRules.map(match => match[1]).join('\n');
  const pendingDeclarations = pendingRules.map(match => match[2]).join('\n');
  const resolvedSource = resolvedRules.map(match => `${match[1]} ${match[2]}`).join('\n');

  assert.doesNotMatch(html, /data-reveal=/);
  for (const accent of [
    'topology-proposed-route',
    'anatomy-grid::before',
    'lineage-proposal-route',
    'packet-sheet',
  ]) {
    assert.ok(pendingSelectors.includes(accent), `missing pending reveal accent: ${accent}`);
    assert.ok(resolvedSource.includes(accent), `missing resolved reveal accent: ${accent}`);
  }
  assert.doesNotMatch(pendingSelectors, /product-copy|\bh1\b|\bh2\b|\bp\b|button|\.mono-label/);
  assert.doesNotMatch(pendingDeclarations, /opacity:\s*0(?:[;\s}]|$)/);

  const durations = [...resolvedSource.matchAll(/(\d+)ms/g)].map(match => Number(match[1]));
  assert.ok(durations.length >= 4, 'each reveal group needs a finite transition');
  assert.ok(durations.every(duration => duration <= 700), 'reveals must finish within 700ms');

  const reducedMotion = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
  assert.match(reducedMotion, /\.route-dash \{[^}]*animation: none;/);
  assert.match(reducedMotion, /\[data-explainer-chapter\][\s\S]*transition: none !important;/);
});

test('Product diagrams return to document flow below 900px', async () => {
  const css = await readFile(
    new URL('./autolab-mog-product-v1.css', import.meta.url),
    'utf8',
  );
  const below1080 = css.slice(
    css.indexOf('@media (max-width: 1080px)'),
    css.indexOf('@media (max-width: 900px)'),
  );
  const below900 = css.slice(
    css.indexOf('@media (max-width: 900px)'),
    css.indexOf('@media (max-width: 720px)'),
  );

  assert.match(below1080, /\.product-hero,\.product-chapter,\.product-chapter\.reverse,\.product-access \{[^}]*grid-template-columns: 1fr;/);
  assert.match(below1080, /\.product-chapter\.reverse \.product-copy \{[^}]*grid-row: 1;/);
  assert.match(below1080, /\.product-chapter\.reverse > figure,\.product-chapter\.reverse > :last-child \{[^}]*grid-row: 2;/);
  assert.match(below900, /\.system-cutaway \{[^}]*grid-template-columns: 1fr;[^}]*grid-template-rows: repeat\(3,minmax\(0,1fr\)\);/);
  assert.match(below900, /\.circuit-inputs,\.circuit-autolab,\.circuit-output \{[^}]*grid-column: 1;/);
  assert.match(below900, /\.customer-boundary \{[^}]*grid-template-areas: "boundary-label" "sources" "scheduler" "pools";[^}]*grid-template-columns: 1fr;/);
  assert.match(below900, /\.anatomy-grid \{[^}]*grid-template-columns: 1fr;/);
  assert.match(below900, /\.anatomy-core,\[data-anatomy-part\] \{[^}]*grid-area: auto;/);
  assert.match(below900, /\.lineage-system \{[^}]*grid-template-columns: 1fr;/);
  assert.match(below900, /\.lineage-routes \{[^}]*display: none;/);
  assert.match(below900, /\.packet-stack \{[^}]*grid-template-columns: 1fr;/);
  assert.match(below900, /\.packet-sheet,\.packet-diff,\.packet-config,\.packet-evaluation,\.packet-logs,\.packet-checkpoint,\.packet-lineage,\.packet-approval \{[^}]*grid-row: auto;/);
  assert.match(below900, /\.deployment-system \{[^}]*grid-template-areas: "customer" "managed" "control";[^}]*grid-template-columns: 1fr;/);
  assert.match(below900, /\.deployment-connectors \{[^}]*display: none;/);
});

test('Product plates contain mobile overflow inside the authored control', async () => {
  const css = await readFile(
    new URL('./autolab-mog-product-v1.css', import.meta.url),
    'utf8',
  );
  const below540 = css.slice(
    css.indexOf('@media (max-width: 540px)'),
    css.indexOf('@media (max-width: 430px)'),
  );

  assert.match(css, /\.product-page \{[^}]*overflow-x: clip;/);
  assert.match(
    below540,
    /\.product-hero,\.product-chapter,\.product-onboarding,\.product-faq,\.product-access \{[^}]*width: calc\(100vw - 36px\);/,
  );
  assert.match(
    below540,
    /\.system-cutaway,\.technical-plate,\.watchdog-instrument,\.experiment-queue,\.product-diff,\.compute-map,\.product-onboarding \.onboarding-console \{[^}]*max-width: 100%;[^}]*min-width: 0;/,
  );
  assert.match(below540, /\.plate-index,[^{]+\{[^}]*overflow-wrap: anywhere;/);
  assert.match(
    below540,
    /\.product-onboarding \.onboarding-tabs \{[^}]*max-width: 100%;[^}]*overflow-x: auto;[^}]*overscroll-behavior-inline: contain;/,
  );
  assert.match(below540, /\.product-onboarding \.onboarding-tabs button \{[^}]*flex: 0 0 auto;/);
});

test('Product qualitative copy and explainer controller avoid synthetic claims and ongoing work', async () => {
  const [html, explainer, scene] = await Promise.all([
    readFile(PRODUCT_URL, 'utf8'),
    readFile(new URL('./autolab-mog-product-explainer-v2.js', import.meta.url), 'utf8'),
    readFile(new URL('./autolab-mog-product-scene-v1.js', import.meta.url), 'utf8'),
  ]);
  const generatedCopy = `${visibleText(html)} ${explainer} ${scene}`;
  const savingsClaim = /\b(?:save|saved|saving|savings|reduce|reduced|reduction)\b[^.!?\n]{0,48}\b\d+(?:\.\d+)?\s*(?:gpu(?:-hours?)?|hours?|runs?|experiments?|dollars?)\b|\b\d+(?:\.\d+)?\s*(?:gpu(?:-hours?)?|hours?|runs?|experiments?|dollars?)\b[^.!?\n]{0,48}\b(?:save|saved|saving|savings|reduce|reduced|reduction)\b/i;

  assert.match(
    html,
    /<script type="module" src="autolab-mog-product-explainer-v2\.js"><\/script>/,
  );
  assert.doesNotMatch(generatedCopy, /—/);
  assert.doesNotMatch(generatedCopy, /\b\d+(?:\.\d+)?\s*(?:%|x)\b/i);
  assert.doesNotMatch(generatedCopy, savingsClaim);
  assert.doesNotMatch(explainer, /requestAnimationFrame|setTimeout|setInterval/);
  assert.doesNotMatch(explainer, /addEventListener\s*\(\s*['"]scroll['"]|\.onscroll\b/);
});
