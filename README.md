# Tsundoku

積ん読 — the pile of books you bought and haven't read yet. Tsundoku is that
pile as an Omarchy shell plugin: one list for everything you want to read,
listen to, or watch later. Save a link from wherever you found it, see it
again with a real title and thumbnail instead of a bare URL, and open it in
the right native app with one click.

## Install

```bash
omarchy plugin add https://github.com/wryanp/tsundoku.git
omarchy plugin enable william.tsundoku
```

The bar widget shows an unread count. Click it to open the popup: a list of
everything you've saved, filterable by All, Watch, Listen, Read, and Done.

## Capture

Paste a URL into the popup's add field to save it now. A global hotkey for
capturing straight from the clipboard — `SUPER+SHIFT+T`, backed by
`scripts/tsundoku-add` — is coming in v0.2. That script doesn't exist yet.

## Storage

Your library lives outside the plugin, in your data directory, not your
config:

- `~/.local/share/tsundoku/library.json` — the list itself
- `~/.local/share/tsundoku/thumbs/` — cached thumbnail images

Nothing runtime is stored in the plugin's own git checkout.

## Theming

Tsundoku has no hardcoded colors. Every surface, fill, and text color comes
from the shell's `Color` and `Style` singletons, so the widget and popup
follow whatever Omarchy theme you're running, including a theme switch while
the popup is open.

## Development

The working tree is `~/.config/omarchy/plugins/william.tsundoku`. Edit it in
place — saving any file under `~/.config/omarchy/plugins/` reloads the plugin,
but run `omarchy-restart-shell` after QML edits: the reload can re-instantiate
widgets from stale compiled components. Validate the manifest before
committing:

```bash
omarchy plugin validate .
```

See [docs/FOUNDATION.md](docs/FOUNDATION.md) for the product vision and
roadmap, and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how it's built.

## License

MIT
