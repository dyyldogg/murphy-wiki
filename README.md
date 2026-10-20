# murphy-wiki

Personal site for Murphy Shimamoto: writing and notes on movies, philosophy, and art.

It's one static page, `index.html`, plus two photos, `murphy.jpg` and `friends.jpg`. There's no build step. Open `index.html` in a browser to preview it.

## Editing

Everything is in `index.html`, in plain HTML:

- **Contact**: email and links.
- **About**: one short paragraph.
- **Writing**: one `<li>` per essay with a bold title, a one-line description, and a bold date. Wrap the title in `<a href="...">` once the essay has a page.
- **Recently Watched**: one `<li>` per film, title in `<i>`, then director and year.

To change the photo, replace `murphy.jpg` with a square image of the same name (about 440×440 is plenty).

## Publishing

The repo is connected to Vercel. Every push to `main` goes live automatically within a minute or so.
