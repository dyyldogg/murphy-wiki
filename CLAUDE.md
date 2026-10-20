# Murphy's site

This repo is Murphy Shimamoto's personal website, murphy.wiki. Murphy writes about movies, philosophy, and art. When he asks for a change, make it here and push to `main`. Vercel deploys every push to `main` to the live site automatically.

## Two addresses, one page

- `murphy.wiki` shows the page with his portrait.
- `murphy.wiki/aura` shows the exact same page with a different photo.

Both addresses serve the same `index.html`. Only the photo differs, so any edit to `index.html` shows up on both automatically. This works because:

- The photo is `<img src="photo.jpg">`, a **relative** path. At `/` it loads `/photo.jpg`. At `/aura/` it loads `/aura/photo.jpg`.
- `vercel.json` sends `/aura` to `/aura/`, serves `index.html` there, and maps `/aura/photo.jpg` to `aura.jpg`.

Rules that keep this working:

- Never create a separate aura page or an `aura/` folder.
- Keep the photo's `src` exactly `photo.jpg`, with no leading slash.
- Every other link or asset in `index.html` must start with `/` (for example `/writing/ozu.html`). Otherwise it breaks on the `/aura/` page.

## Files

- `index.html`: the whole site. Plain HTML with a small `<style>` block.
- `photo.jpg`: the portrait on the main page.
- `aura.jpg`: the photo on the `/aura` page.
- `vercel.json`: the `/aura` routing described above.

## Style rules

The look is deliberately plain, like an unstyled academic homepage. Keep it that way unless Murphy asks otherwise.

- White background, black text, Times New Roman, default blue/purple underlined links.
- Bold `<h1>` name, photo under it, then `<h2>` sections: Contact, About, Writing, Recently Watched.
- No frameworks, build tools, JavaScript, web fonts, or extra CSS files.
- Film, book, and artwork titles go in `<i>`.

## Common changes

**Add an essay.** Add an `<li>` at the top of the Writing list:

```html
<li>
  <b>Title of the Essay</b><br>
  One-line description.<br>
  <b>Month Year</b>
</li>
```

If the essay has its own page, create `writing/<slug>.html` using the same `<style>` block as `index.html`, and link the title with a root path: `<a href="/writing/<slug>.html">`.

**Log a film.** Add `<li><i>Title</i> (Director, Year)</li>` at the top of Recently Watched. Keep about the last five or six films.

**Change a photo.** Replace `photo.jpg` (main page) or `aura.jpg` (aura page), keeping the file name. Both are shown 160px tall at their own proportions.

## Before pushing

Open `index.html` and check that nothing is broken. Write a short commit message that says what changed.
