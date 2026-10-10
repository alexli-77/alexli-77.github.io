# alexli-77.github.io

Personal site of Yang (Léon) Li — magazine-style layout, built with [Astro](https://astro.build), deployed to GitHub Pages.

Live: https://alexli-77.github.io

## Run locally

```bash
npm install
npm run dev        # http://localhost:4321
```

## Write a post (Obsidian)

One-time setup:

1. Obsidian → Open folder as vault → `src/content/writing`
2. Settings → Core plugins → enable **Templates** (already pointed at `_templates/`)
3. Settings → Community plugins → install **Git** (by Vinzent03) → enable
4. Git plugin settings → Advanced → turn on **Limit file operations to the vault**

Each post:

1. New note. The file name becomes the URL: `Test Oracles.md` → `/writing/test-oracles/`
2. Command palette → **Templates: Insert template** → `post`, then write
3. Paste images directly; they land in `images/` and work as-is
4. Delete the `draft: true` line when it's ready
5. Command palette → **Git: Commit-and-sync** — the site updates in about a minute

Preview before publishing: `npm run dev` → http://localhost:4321/writing/ (drafts show with a DRAFT badge).

Without Obsidian: `npm run new "Post title"` creates the same file from the terminal.

Frontmatter fields:

| field   | required | notes                                   |
| ------- | -------- | --------------------------------------- |
| `title` | yes      |                                         |
| `date`  | yes      | `YYYY-MM-DD`, newest first              |
| `dek`   | yes      | one-line summary under the title        |
| `kind`  | no       | `Essay` / `Research` / `Notes`          |
| `draft` | no       | `true` = local only, never published    |

## Where things live

- `src/views/` — page content in both languages (`Home`, `Contact`, `WritingIndex`, `Article`)
- `src/pages/` — routes: English at `/`, Chinese under `/zh/`
- `src/i18n.ts` — shared UI strings (nav, footer, labels)
- `src/content/writing/` — blog posts (Markdown); also the Obsidian vault
- `src/styles/global.css` — all styles; light and dark palette variables at the top
- `.github/workflows/deploy.yml` — build + deploy on push to `main`
