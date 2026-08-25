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

Two ways in:

- **Hotkey.** Copy a URL anywhere and press `SUPER+SHIFT+U`.
  `scripts/tsundoku-add` reads the clipboard with `wl-paste`, saves it over
  IPC, and confirms with a "Saved to Tsundoku" notification. A non-URL
  clipboard, a duplicate, or an unreachable shell each produce a clear error
  toast instead — a keypress never fails silently.
- **Popup.** Click the bar icon and paste into the add field. Enter or the
  add button submits, the field clears on success, and an invalid or
  duplicate URL shows inline feedback under the field.

Bind the hotkey in `~/.config/hypr/bindings.lua`:

```lua
o.bind("SUPER + SHIFT + U", "Tsundoku capture",
  os.getenv("HOME") .. "/.config/omarchy/plugins/william.tsundoku/scripts/tsundoku-add")
```

Pick any free chord — on a stock Omarchy install `SUPER+SHIFT+U` is
unclaimed. Run `omarchy menu keybindings --print` to check yours.

## Previews

A saved link resolves into a real title, author, and thumbnail in the
background — the item appears instantly and upgrades in place. Resolution
tries three tiers in order: the platform's official oEmbed endpoint
(YouTube, Vimeo, Spotify, SoundCloud, TikTok), then OpenGraph tags scraped
from the page, then the bare hostname. Every request runs a 5-second
timeout, a size cap, and an honest User-Agent, and nothing ever fails to
save because resolution failed — a link that can't be resolved keeps its
hostname title and shows a retry button.

Items from recognized platforms show that platform's logo, tinted to your
theme's foreground color. Everything else gets a watch/listen/read glyph.

## Connect Spotify (optional)

Signing in is never required — Spotify links always work with public
metadata. Connecting your account upgrades them: real artist names, track
durations, and higher-resolution artwork straight from the Web API.

Auth is OAuth 2.0 with PKCE through your normal browser. Tsundoku never
sees a password; it only ever holds the resulting token, stored at
`~/.local/share/tsundoku/auth/spotify.json` with `0600` permissions and
refreshed silently. Disconnecting deletes that file.

Because Spotify requires every app to register its own OAuth client, a
one-time setup is needed before the Connect button goes live:

1. Create an app at <https://developer.spotify.com/dashboard> (any name).
2. Add `http://127.0.0.1:41419/callback` as a Redirect URI — exactly that,
   the port matters.
3. Put the app's Client ID where Tsundoku looks for it:

```bash
mkdir -p ~/.local/share/tsundoku/auth
echo '{"spotify": {"clientId": "YOUR_CLIENT_ID"}}' > ~/.local/share/tsundoku/auth/clients.json
```

Then hit Connect in the popup's settings row. No scopes are requested —
the token only reads public catalog metadata.

## IPC

The service answers on the `tsundoku` IPC target:

```bash
omarchy-shell tsundoku add <url>       # prints "ok", "duplicate", or "invalid"
omarchy-shell tsundoku open <id>       # opens an item, prints the method used
omarchy-shell tsundoku count           # prints the unread count
omarchy-shell tsundoku list            # prints the whole library as JSON
omarchy-shell tsundoku ping            # prints "ok" — is the service alive?
omarchy-shell tsundoku authStatus      # prints connection state per provider
omarchy-shell tsundoku authConnect spotify     # starts the browser auth flow
omarchy-shell tsundoku authDisconnect spotify  # forgets the stored token
```

`add` always exits 0 when the shell is reachable; what happened is in the
printed result. A non-zero exit means the shell itself wasn't running.

## Storage

Your library lives outside the plugin, in your data directory, not your
config:

- `~/.local/share/tsundoku/library.json` — the list itself
- `~/.local/share/tsundoku/thumbs/` — cached thumbnail images
- `~/.local/share/tsundoku/auth/` — OAuth tokens (`0600`) and your
  `clients.json` client-id overlay, if you've connected a provider

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

MIT. The provider logos under `assets/logos/` come from
[Simple Icons](https://simpleicons.org) (CC0); the brand marks themselves
remain the property of their respective owners — see
`assets/logos/ATTRIBUTION.md`.
