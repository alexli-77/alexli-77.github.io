# alexli-77.github.io

Personal site of Yang (Léon) Li — magazine-style layout, built with [Astro](https://astro.build), deployed to GitHub Pages.

Live: https://alexli-77.github.io

## Run locally

```bash
npm install
npm run dev        # http://localhost:4321
```

## Write a post

1. `npm run new "Your post title"` — creates `src/content/writing/your-post-title.md` as a draft
2. Write in Markdown. `npm run dev` shows drafts with a DRAFT badge
3. Delete the `draft: true` line when it's ready
4. `git add . && git commit -m "post: your post title" && git push` — GitHub Actions publishes it in ~1 minute

Frontmatter fields (see `src/content/writing/_template.md`):

| field   | required | notes                                   |
| ------- | -------- | --------------------------------------- |
| `title` | yes      |                                         |
| `date`  | yes      | `YYYY-MM-DD`, newest first              |
| `dek`   | yes      | one-line summary under the title        |
| `kind`  | no       | `Essay` / `Research` / `Notes`          |
| `draft` | no       | `true` = local only, never published    |

Images: put them in `public/images/` and reference as `![alt](/images/file.png)`.

## Where things live

- `src/pages/index.astro` — about, projects, latest writing
- `src/content/writing/` — blog posts (Markdown)
- `src/styles/global.css` — all styles; palette variables at the top
- `.github/workflows/deploy.yml` — build + deploy on push to `main`
