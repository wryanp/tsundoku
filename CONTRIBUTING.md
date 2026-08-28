# Contributing

Thanks for helping out. Small, focused pull requests are easiest to review
and merge; open an issue first if you're unsure whether a change fits.

## Running the code

Tests need only Node (no dependencies to install):

```bash
node --test
```

To try changes live, clone your fork where Omarchy loads plugins from and
enable it:

```bash
omarchy plugin add https://github.com/<you>/tsundoku.git
omarchy plugin enable wryanp.tsundoku
```

The shell hot-reloads plugin code on save, so edits show up immediately.

## Adding a provider

The most common contribution. Providers are data, not code — one table
entry in `Providers.js` plus a logo, a test case, and two doc lines:

1. **`Providers.js`** — add an entry to `providerTable()` in the matching
   kind section (`watch` / `listen` / `read`). Copy a neighboring entry;
   `logoAsset` must be `assets/logos/<id>.svg`. Use `resolver: { type:
   "opengraph" }` unless the platform has an oEmbed endpoint that returns a
   `title` field. List only the domains the platform actually serves
   content from — subdomains are matched by suffix automatically.
2. **`assets/logos/<id>.svg`** — fetch the brand's icon from
   [Simple Icons](https://simpleicons.org) (CC0):
   `https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/<slug>.svg`.
   Confirm the slug is the brand you mean (some slugs collide across
   brands — check the icon's source URL in Simple Icons' metadata). If no
   slug exists, copy the generic glyph for the kind (`primevideo.svg` for
   watch, `amazonmusic.svg` for listen, `kindle.svg` for read). Please
   don't hand-draw an approximation of a trademarked mark.
3. **`assets/logos/ATTRIBUTION.md`** — add the file-to-slug row, or add
   the file to the generic-glyph list.
4. **`tests/providers.test.cjs`** — add one realistic URL per domain to
   `domainCases`, and bump the entry count in the "full N-entry table"
   test.
5. **`README.md`** — add the platform to the matching Supported providers
   list.

Providers should be broadly mainstream places people watch, listen, or
read. Adult-content platforms aren't accepted.

## Code style

- `.js` files are loaded both by QML (as a namespace) and by Node's test
  runner (via `require`), so they stay plain ES5-ish: no ES modules, no
  classes, no `let`/`const`/arrow functions. Match what's there.
- QML follows the surrounding style; comments explain constraints the code
  can't (why, not what).
- No runtime dependencies beyond what a stock Omarchy install ships
  (`curl`, `jq`, `sha256sum`, `wl-paste`, `notify-send`; `mpv`/`yt-dlp`
  optional).

## Pull requests

- Run `node --test` before pushing; CI runs the same tests plus manifest
  validation on every push and PR.
- Don't bump the version in `manifest.json` — releases are cut by the
  maintainer, and pushing a version change to `main` tags and publishes it
  automatically.
