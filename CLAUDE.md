# Murphy's site

This repo is Murphy Shimamoto's personal website, murphy.wiki. Murphy writes about movies, philosophy, and art. When he asks for a change, make it here and push to `main`. Vercel deploys every push to `main` to the live site automatically.

## Two addresses, one page

- `murphy.wiki` shows the page with his portrait.
- `murphy.wiki/aura` shows the exact same page with a different photo.

Both addresses serve the same `index.html`. Only the photo differs, so any edit to `index.html` shows up on both automatically. This works because:

- The photo is `<img srcset="photo.jpg 2x">`, a **relative** path. At `/` it loads `/photo.jpg`. At `/aura/` it loads `/aura/photo.jpg`.
- `vercel.json` sends `/aura` to `/aura/`, serves `index.html` there, and maps `/aura/photo.jpg` to `aura.jpg`.
- The `2x` makes each photo show at half its pixel size, so each file sets its own display size. Don't add a `src` attribute, because Chrome would then show the photo at full size on regular screens.

Rules that keep this working:

- Never create a separate aura page or an `aura/` folder.
- Keep the photo as `srcset="photo.jpg 2x"`, with no leading slash and no `src`.
- Every other link or asset in `index.html` must start with `/` (for example `/writing/ozu.html`). Otherwise it breaks on the `/aura/` page.

## Files

- `index.html`: the home page. Plain HTML with a small `<style>` block.
- `photo.jpg`: the portrait on the main page. 320×320 pixels, shown at 160×160.
- `aura.jpg`: the photo on the `/aura` page. 730×589 pixels, shown at 365×295.
- `vercel.json`: the `/aura` routing described above, plus `/movies` → `movies.html`.
- `movies.html`: every movie Murphy has watched, ranked, at `murphy.wiki/movies`.
- `writing/*.html`: one page per essay.
- `essay.css`, `essay.js`: shared by every essay page. They lay the essay out like an MLA paper in Google Docs.

## Style rules

The look is deliberately plain, like an unstyled academic homepage. Keep it that way unless Murphy asks otherwise.

- White background, black text, Times New Roman, default blue/purple underlined links.
- Bold `<h1>` name, photo under it, then `<h2>` sections: Contact, About, Writing, Movies.
- No frameworks, build tools, web fonts, or JavaScript on the home page. The only scripts on the site are `essay.js` and the one-line count updater in `movies.html`.
- Film, book, and artwork titles go in `<i>`.

## Essay pages

Every essay looks like an MLA paper open in Google Docs. That means letter-size white pages on the gray Docs background, 1-inch margins, Times New Roman 12 pt, double spacing, the page number alone in the top-right header, a one-line heading (his name, no date), a centered title, half-inch first-line indents, and Works Cited on its own page with hanging indents. `essay.js` flows the text onto pages and numbers them, so never add page breaks or page numbers by hand.

To add an essay, copy `writing/you-can-see-everything.html` to `writing/<slug>.html` and change only the `<head>` text and the contents of `<article id="source">`:

```html
<article class="source essay" id="source">
  <p class="heading-line">Murphy Shimamoto</p>
  <h1 class="title">Title of the Essay</h1>
  <p>Each paragraph is a plain p. The first line is indented automatically.</p>
  <h2 class="works-cited-title" data-page-break>Works Cited</h2>
  <p class="entry">Surname, First. <i>Title</i>. Publisher, Year.</p>
</article>
```

- Section headings, if the essay has them: `<h2 class="section-heading">Plato</h2>`. They're bold and flush left.
- Footnotes are written as numbered endnotes on a Notes page placed before Works Cited, and that is how they look without JavaScript. With JavaScript, `essay.js` sets each note at the foot of the page that cites it (10 pt, single spaced, under a short rule, as in a Google Doc) and leaves out the Notes page, so never place notes by hand. In the text: `<sup><a id="fnref1" href="#fn1">1</a></sup>`. On the Notes page, after `<h2 class="notes-title" data-page-break>Notes</h2>`: `<p class="note" id="fn1"><sup><a href="#fnref1">1</a></sup> Nietzsche, <i>The Gay Science</i>, 193-4.</p>`.
- Essays carry no date. The only place an essay's date appears is its entry in the home page Writing list.
- Italicize a film or book title inside the essay title, as MLA does: `<i>You Can See Everything</i>: The Impenetrability of the Subject`.
- Keep Works Cited entries in alphabetical order, ignoring a leading "The" or "A".
- Never change Murphy's essay wording while reformatting.

## Common changes

**Add an essay.** Add an `<li>` at the top of the Writing list:

```html
<li>
  <b>Title of the Essay</b><br>
  One-line description.<br>
  <b>Month Year</b>
</li>
```

Make its page as described under Essay pages, and link the title with a root path: `<b><a href="/writing/<slug>.html">Title</a></b>`.

**Add a film to the ranking.** In `movies.html`, insert `<li><i>Title</i></li>` inside `<ol id="ranking">` at the film's rank (best first). Put a year or note that isn't part of the title outside the italics: `<li><i>Cold War</i> (2018)</li>`. Escape `&` as `&amp;`. The numbers come from the `<ol>`, and the movie count under the heading updates itself, so don't type either by hand.

**Change a photo.** Replace `photo.jpg` (main page) or `aura.jpg` (aura page), keeping the file name. Save the new file at twice the size you want it shown. For example, a 320×320 file shows at 160×160.

## Before pushing

Open `index.html` and check that nothing is broken. Write a short commit message that says what changed.
