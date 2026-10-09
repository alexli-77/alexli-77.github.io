import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Every top-level .md file in src/content/writing becomes a post. "_" files and subfolders (_templates, images, .obsidian) are ignored.
const writing = defineCollection({
  loader: glob({ pattern: '[^_]*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    dek: z.string(),
    kind: z.enum(['Essay', 'Research', 'Notes']).default('Notes'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { writing };
