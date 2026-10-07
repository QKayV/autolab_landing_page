// Regenerates the digests in .well-known/agent-skills/index.json after editing skills/*/SKILL.md.
//   node scripts/build-discovery.mjs
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://www.autolab.ai';
const SKILLS = ['autolab-overview', 'book-autolab-demo'];

const skills = SKILLS.map(name => {
  const text = readFileSync(join(root, 'skills', name, 'SKILL.md'), 'utf8');
  const description = text.match(/^description: (.*)$/m)[1];
  return {
    name,
    type: 'skill-md',
    description,
    url: `${ORIGIN}/skills/${name}/SKILL.md`,
    sha256: createHash('sha256').update(text).digest('hex'),
  };
});

writeFileSync(
  join(root, '.well-known/agent-skills/index.json'),
  JSON.stringify({ $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json', skills }, null, 2) + '\n',
);
console.log('wrote .well-known/agent-skills/index.json');
