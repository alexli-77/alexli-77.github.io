import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'writing'>;

// Drafts show up in `npm run dev` but never in the published build.
export async function getPosts() {
  const posts = await getCollection('writing', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function formatDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()} · ${pad(date.getUTCMonth() + 1)} · ${pad(date.getUTCDate())}`;
}

export function readingTime(post: Post) {
  const words = (post.body ?? '').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 220))} min`;
}
