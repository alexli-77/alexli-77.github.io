import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = await getPosts('en');
  return rss({
    title: 'Léon — Writing',
    description: 'Notes and essays by Yang (Léon) Li on software testing, LLMs, and systems.',
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.dek,
      pubDate: post.data.date,
      link: `/writing/${post.id}/`,
    })),
  });
}
