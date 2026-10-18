// Generates md/*.md — Markdown twins of every HTML page, served when a client
// sends `Accept: text/markdown` (see vercel.json). Dependency-free; run:
//   node scripts/build-markdown.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://www.autolab.ai';

export const PAGES = [
  ['index.html', 'index', '/'],
  ['autoresearch.html', 'autoresearch', '/autoresearch.html'],
  ['manifesto.html', 'manifesto', '/manifesto.html'],
  ['careers.html', 'careers', '/careers.html'],
  ['interest.html', 'interest', '/interest.html'],
  ['demo.html', 'demo', '/demo'],
  ['research/index.html', 'research/index', '/research/'],
  ['research/blog-1-how-to-pick-the-best-model/index.html', 'research/blog-1-how-to-pick-the-best-model', '/research/blog-1-how-to-pick-the-best-model/'],
  ['research/best-model/index.html', 'research/best-model', '/research/best-model/'],
];

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—', ndash: '–', hellip: '…', rarr: '→', larr: '←', middot: '·', copy: '©' };
const decode = s => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);

function absolute(href, pagePath) {
  if (/^(https?:|mailto:)/.test(href)) return href;
  if (href.startsWith('#')) return ORIGIN + pagePath + href;
  return new URL(href, ORIGIN + pagePath).href;
}

export function htmlToMarkdown(html, pagePath) {
  const title = decode((html.match(/<title>([\s\S]*?)<\/title>/i) || [, ''])[1]).trim();
  const description = decode((html.match(/<meta name="description" content="([^"]*)"/i) || [, ''])[1]).trim();
  let body = (html.match(/<body[^>]*>([\s\S]*)<\/body>/i) || [, html])[1];
  body = body
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|svg|noscript|canvas|template|select|textarea)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<(header|nav)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<input\b[^>]*>/gi, '')
    .replace(/<[^>]+(aria-hidden="true"|class="field-trap")[^>]*>\s*<\/[a-z]+>/gi, '');
  body = body
    .replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
      const label = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      return label ? `[${label}](${absolute(decode(href), pagePath)})` : '';
    })
    .replace(/<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/gi, (_, n, attrs, inner) => {
      const aria = attrs.match(/aria-label="([^"]+)"/);
      return `\n\n${'#'.repeat(+n)} ${aria ? aria[1] : inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}\n\n`;
    })
    .replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_, n, t) => `\n\n${'#'.repeat(+n)} ${t.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()}\n\n`)
    .replace(/<pre\b[^>]*>([\s\S]*?)<\/pre>/gi, (_, t) => `\n\n\`\`\`\n${decode(t.replace(/<[^>]+>/g, ''))}\n\`\`\`\n\n`)
    .replace(/<(strong|b)\b[^>]*>(\s*[^<\s][\s\S]*?)<\/\1>/gi, '**$2**')
    .replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*')
    .replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
    .replace(/<li\b[^>]*>/gi, '\n- ')
    .replace(/<img\b[^>]*alt="([^"]+)"[^>]*>/gi, '\n\n_[image: $1]_\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|section|article|ul|ol|tr|figure|figcaption|blockquote|main|footer|form|label|button|dt|dd|table|span)>/gi, m => (m === '</span>' ? ' ' : '\n\n'))
    .replace(/<\/(td|th)>/gi, ' | ')
    .replace(/<[^>]+>/g, '');
  body = decode(body)
    .replace(/\)\[/g, ') [')
    .split('\n').map(l => l.replace(/[ \t]+/g, ' ').trim())
    .map(l => ((l.match(/\*\*/g) || []).length % 2 || l.includes('****') ? l.replace(/\*\*/g, '') : l))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\nurl: ${ORIGIN}${pagePath}\n---\n\n${body}\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const [file, out, pagePath] of PAGES) {
    const dest = join(root, 'md', `${out}.md`);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, htmlToMarkdown(readFileSync(join(root, file), 'utf8'), pagePath));
    console.log('wrote', `md/${out}.md`);
  }
}
