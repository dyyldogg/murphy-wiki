# murphy-wiki

Murphy Shimamoto's personal site, at [murphy.wiki](https://murphy.wiki): writing and notes on movies, philosophy, and art.

- `murphy.wiki` shows the page with his portrait (`photo.jpg`).
- `murphy.wiki/aura` shows the same page with `aura.jpg` instead.

Both addresses serve the same `index.html`, so every edit appears on both. `vercel.json` handles the `/aura` routing. See `CLAUDE.md` for how it works and the rules for editing.

There's no build step. Every push to `main` deploys through Vercel.
