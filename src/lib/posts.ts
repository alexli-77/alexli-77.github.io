import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'writing'>;

// Drafts show up in `npm run dev` but never in the published build.
// English pages list English posts only; Chinese pages list both languages.
export async function getPosts(lang: 'en' | 'zh' = 'en') {
  const posts = await getCollection(
    'writing',
    ({ data }) => (import.meta.env.DEV || !data.draft) && (lang === 'zh' || data.lang === 'en'),
  );
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function formatDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()} · ${pad(date.getUTCMonth() + 1)} · ${pad(date.getUTCDate())}`;
}

/** Minutes to read. Counts CJK characters at ~400/min and other words at ~220/min. */
export function readingTime(post: Post) {
  const body = post.body ?? '';
  const cjk = (body.match(/[\u3400-\u9fff]/g) ?? []).length;
  const words = body.replace(/[\u3400-\u9fff]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220 + cjk / 400));
}
