const REPO = 'autolab-ai/hills';
const CACHE_KEY = 'autolab:github-stars:' + REPO;
const CACHE_TTL_MS = 60 * 60 * 1000;

function formatStars(count) {
  if (count >= 10000) return Math.round(count / 1000) + 'k';
  if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(count);
}

function readCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (cached && Number.isFinite(cached.count) && Date.now() - cached.at < CACHE_TTL_MS) return cached.count;
  } catch {}
  return null;
}

function writeCache(count) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ count, at: Date.now() })); } catch {}
}

function render(count) {
  const label = formatStars(count);
  document.querySelectorAll('[data-github-stars]').forEach((node) => { node.textContent = label; });
  document.querySelectorAll('[data-github-link]').forEach((link) => {
    link.setAttribute('aria-label', `autolab-ai/hills on GitHub, ${count} ${count === 1 ? 'star' : 'stars'}`);
  });
}

async function init() {
  if (!document.querySelector('[data-github-stars]')) return;
  const cached = readCache();
  if (cached !== null) return render(cached);
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}`, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) return;
    const { stargazers_count: count } = await res.json();
    if (!Number.isFinite(count)) return;
    writeCache(count);
    render(count);
  } catch {}
}

init();
