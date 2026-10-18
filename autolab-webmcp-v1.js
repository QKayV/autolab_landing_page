// WebMCP: exposes Autolab's key site actions to in-browser AI agents.
const ORIGIN = 'https://www.autolab.ai';
const PAGES = [
  { title: 'Home', url: `${ORIGIN}/`, about: 'Product overview of the autoresearch platform' },
  { title: 'What is autoresearch?', url: `${ORIGIN}/autoresearch.html`, about: 'Definition, how agentic model training works, comparison with AutoML' },
  { title: 'Vision', url: `${ORIGIN}/manifesto.html`, about: 'Why AI research is becoming an engineering discipline' },
  { title: 'Research', url: `${ORIGIN}/research/`, about: 'Blog posts and the running model comparison' },
  { title: 'Careers', url: `${ORIGIN}/careers.html`, about: 'Open roles in San Francisco' },
  { title: 'Book a demo', url: `${ORIGIN}/demo`, about: 'Request a demo and pick a time' },
  { title: 'Early access', url: `${ORIGIN}/interest.html`, about: 'Request early access' },
];
const text = value => ({ content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }] });
const noInput = { type: 'object', properties: {} };

const tools = [
  {
    name: 'autolab_overview',
    description: 'Short factual summary of what Autolab is and how it works.',
    inputSchema: noInput,
    annotations: { readOnlyHint: true },
    execute: async () => text(
      'Autolab is the autoresearch platform: autonomous AI agents plan, run, and score ML experiments in parallel on the customer\'s own GPUs, judged by the customer\'s own evals. ' +
      'Agents write real code in the user\'s repository, every experiment is a reproducible commit, and code, data and weights never leave the customer\'s network. ' +
      'Install: curl -fsSL app.autolab.ai/install.sh | sh. Contact: team@autolab.ai.'),
  },
  {
    name: 'list_autolab_pages',
    description: 'List the pages of autolab.ai with their URLs and what each covers.',
    inputSchema: noInput,
    annotations: { readOnlyHint: true },
    execute: async () => text(PAGES),
  },
  {
    name: 'open_demo_booking',
    description: 'Open the Autolab demo request form so the user can book a demo.',
    inputSchema: noInput,
    execute: async () => { window.location.assign('/demo'); return text('Opened the demo request form at /demo.'); },
  },
];

const modelContext = document.modelContext || navigator.modelContext;
if (modelContext?.registerTool) {
  for (const tool of tools) {
    try { Promise.resolve(modelContext.registerTool(tool)).catch(() => {}); } catch { /* already registered */ }
  }
}
