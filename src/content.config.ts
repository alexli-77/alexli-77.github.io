import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Every .md file in src/content/writing becomes a post. Files starting with "_" are ignored.
const writing = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    dek: z.string(),
    kind: z.enum(['Essay', 'Research', 'Notes']).default('Notes'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { writing };
