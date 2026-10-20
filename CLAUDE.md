# Murphy's site

This repo is Murphy Shimamoto's personal website. Murphy writes about movies, philosophy, and art. When he asks for a change, make it here and push to `main`. Vercel deploys every push to `main` to the live site automatically.

## Files

- `index.html`: the whole site. Plain HTML with a small `<style>` block.
- `murphy.jpg`: his portrait, square, shown at 160×160 under his name.
- `friends.jpg`: the photo at the bottom of the page.

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

If the essay has its own page, create `writing/<slug>.html` using the same `<style>` block as `index.html`, and link the title to it.

**Log a film.** Add `<li><i>Title</i> (Director, Year)</li>` at the top of Recently Watched. Keep about the last five or six films.

**Update the photo.** Replace `murphy.jpg` with a square image of the same name.

## Before pushing

Open `index.html` and check that nothing is broken. Write a short commit message that says what changed.
