# Components

All classes already exist in `src/styles/global.css`. Copy the markup and change the content.

## Section head (every section starts here)

```html
<div class="section-head">
  <h2>Projects <span>— selected work</span></h2>
  <span class="kicker">07 entries</span>
</div>
```

## Cover headline + lede + sidebar

```html
<section class="cover">
  <div class="wrap">
    <div class="cover-head">
      <span class="kicker">Cover Story · About</span>
      <h1>Research-minded <em>engineer.</em> <span class="highlight">Systems-minded</span> <em>researcher.</em></h1>
    </div>
    <div class="lede"><p>First paragraph gets the drop cap…</p></div>
    <aside class="glance">
      <span class="kicker">At a glance</span>
      <dl><div><dt>Now</dt><dd>Ph.D., Université de Montréal</dd></div></dl>
      <a class="cta" href="/contact/">Contact →</a>
    </aside>
  </div>
</section>
```

## Lead feature (one per page, the most important item)

```html
<a class="lead-feature" href="…">
  <div class="frame"><img src="…" alt="…" /></div>
  <div>
    <span class="kicker">Lead feature · Research</span>
    <h3>Title that can run two or three lines</h3>
    <p>Two-sentence summary.</p>
    <div class="tags">Java · LLM · Software Testing</div>
    <span class="read-more">View repository</span>
  </div>
</a>
```

## Card grid (3 → 2 → 1 columns)

```html
<div class="project-grid">
  <a class="card" href="…">
    <div class="frame"><img src="…" alt="…" loading="lazy" /></div>
    <span class="num">02 — Systems</span>
    <h3>KDS</h3>
    <p>One-sentence summary.</p>
    <div class="tags">Go · Kubernetes</div>
  </a>
</div>
```

`.num` is a zero-padded index plus a category. Keep numbering continuous with the lead feature as 01.

## Navy band with a list of entries

```html
<section class="writing">
  <div class="wrap">
    <div class="section-head">…</div>
    <a class="post" href="…">
      <time>2026 · 09 · 28</time>
      <div><h3>Entry title</h3><p>One-line dek.</p></div>
      <span class="meta">8 min · Essay</span>
    </a>
    <a class="all-posts" href="…">All writing →</a>
  </div>
</section>
```

Dates are `YYYY · MM · DD` in mono. An empty list uses `<p class="empty">…</p>` in italic serif.

## Long-form article

```html
<article class="article">
  <div class="wrap">
    <header class="article-head">
      <span class="kicker">Essay</span>
      <h1>Title</h1>
      <p class="dek">Italic one-sentence standfirst.</p>
      <div class="article-meta"><time>2026 · 10 · 09</time><span>8 min read</span></div>
    </header>
    <div class="prose"><!-- Markdown renders here --></div>
    <a class="back" href="/writing/">← All writing</a>
  </div>
</article>
```

Inside `.prose`, a `>` blockquote becomes a pull quote, `---` becomes a `◆ ◆ ◆` break, and the first paragraph gets the drop cap automatically.

## Contact methods + social icons (contact page)

```html
<ul class="reach">
  <li><svg …/><button class="spaced" data-copy="name@example.com">name@example.com</button><span class="copied" data-copied="Copied"></span></li>
</ul>
<ul class="socials"><li><a href="…" aria-label="GitHub"><svg …/></a></li></ul>
```

Clicking the email copies it. Brand icon paths live in `src/icons.ts` (inline SVG, `currentColor`); links are set in `src/profile.ts`. The contact page is the only place icons are used.
