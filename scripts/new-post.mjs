// Usage: npm run new "Post title"
import { existsSync, writeFileSync } from 'node:fs';

const title = process.argv.slice(2).join(' ').trim();
if (!title) {
  console.error('Usage: npm run new "Post title"');
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');
const file = `src/content/writing/${slug}.md`;
if (existsSync(file)) {
  console.error(`Already exists: ${file}`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  file,
  `---
title: ${JSON.stringify(title)}
date: ${today}
dek: ""
kind: Notes # Essay | Research | Notes
draft: true # remove to publish
---

Start writing here.
`,
);
console.log(`Created ${file}\nPreview: npm run dev → http://localhost:4321/writing/${slug}/`);
