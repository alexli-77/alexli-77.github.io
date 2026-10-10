---
name: magazine-design
description: Léon's editorial "magazine issue" design system: cream paper, navy ink, mustard accent, Fraunces serif headlines, mono kickers, rules and drop caps. Use when adding or restyling any page, section, or component on alexli-77.github.io, or when the user asks for something "in the magazine style", "like my site", or "杂志风".
---

# Magazine design system

The site reads like one printed issue: a masthead, a cover story, features, and a writing section. Restraint is the point. Every new element should look like it was typeset, not decorated.

Source of truth: `src/styles/global.css`. Reuse its classes before writing new CSS. Markup for each component is in [COMPONENTS.md](COMPONENTS.md).

## Tokens

| token | value | use |
|---|---|---|
| `--paper` | `#fffaeb` | page background |
| `--paper-2` | `#fceec5` | highlight under headline words, image shadow |
| `--navy` | `#102a42` | headings, heavy rules, dark band background |
| `--body` | `#48647f` | paragraph text |
| `--muted` | `#617d98` | tags, secondary meta, italic section subtitles |
| `--mustard` | `#e9b949` | accent fills, underlines, rules. **Never small text on cream** |
| `--mustard-ink` | `#7a5c10` | kickers and italic accents on cream (passes contrast) |
| `--rule` | `#dae2ec` | hairline dividers |

On the navy band: headings `--paper`, body `#bcccdc`, meta `#829ab0`, accents `--mustard`.

Type: headlines in **Fraunces** (600, plus 400 italic for emphasis). Body in **Inter** 17px/1.65. All meta (kickers, dates, tags, counts) in **JetBrains Mono** 12px, uppercase, letter-spacing 0.06–0.12em.

Layout: `.wrap` caps width at 1200px with a fluid `--gutter`. The cover uses a 12-column grid (lede spans 7, sidebar spans 4 from column 9). Breakpoints are 960px (stack to one column) and 640px (mobile).

## Rules

1. **Headline formula.** Navy roman words, a mustard-ink *italic* word for rhythm, and at most one `.highlight` span per headline.
2. **Every section opens with `.section-head`**: a 3px navy top rule, a serif `h2` with an italic muted subtitle (`Projects <span>— selected work</span>`), and a mono kicker on the right.
3. **Kicker above every title** (`Cover Story · About`, `Lead feature · Research`). Use `·` as the separator.
4. **Rules carry the structure**, not boxes: 3px navy for section starts, 3px mustard for sidebars, 1px `--rule` between items. No cards with backgrounds, no rounded corners, no blur shadows.
5. **One drop cap per page**, on the first paragraph of the lede or the article.
6. **Rhythm alternates cream → navy band → cream.** At most one navy band per page.
7. **Links** are navy with a 2px mustard bottom border. On hover, swap to a navy border or a mustard text color. Never default blue underlines.
8. **Motion is minimal**: 0.2s color/border transitions and a 1.03 image scale on hover. Nothing loops or bounces.

## Don't

- Pixel, retro, or 8-bit elements. They were tried and rejected as clashing with the editorial tone.
- Emoji, gradients (other than the `.highlight` underline), glassmorphism, or icon libraries.
- New colors or fonts. If something seems to need one, use a tint of an existing token.
- Mustard text smaller than 24px on cream. Use `--mustard-ink`.

## Workflow for a new page or section

1. Pick the closest existing pattern in [COMPONENTS.md](COMPONENTS.md) and copy its markup.
2. Wrap the page in `Base.astro` so the issue bar, masthead, and colophon come for free.
3. Add CSS only for what's missing, in `global.css` next to the related block, using tokens only.
4. Check at 1440px and 390px: no horizontal overflow, and the section head still reads cleanly.
5. Run `npm run build` and confirm it's clean.
