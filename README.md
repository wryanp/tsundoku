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

## The panel

The popup is built to live in without a mouse:

- **Tabs.** All / Watch / Listen / Read / Done, each with a live count.
  All is everything unread; Done is everything you've finished.
- **Keyboard.** The add field has focus the moment the popup opens. `Down`
  moves onto the list and `Up`/`Down` walk it; `Enter` opens the selected
  row (the same mpv/browser routing as a click), `Del` deletes it,
  and `Up` from the top row returns to the add field. `Esc` closes the
  popup. Typing anything drops you back into the add field.
- **Notes.** The 󰎞 button on a row opens an inline note field — a line
  about why you saved the thing. Notes persist in the library, and a row
  with a note shows a small 󰎞 next to its caption. `Esc` in the note field
  collapses it without closing the popup.

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

## Supported providers

Tsundoku recognizes links from these platforms and shows their logo, real
title, and thumbnail. Anything else still saves fine — it just falls back to
a bare hostname and a watch/listen/read glyph.

**Watch**

- [Netflix](https://www.netflix.com)
- [Prime Video](https://www.primevideo.com)
- [Disney+](https://www.disneyplus.com)
- [HBO Max](https://www.hbomax.com)
- [Hulu](https://www.hulu.com)
- [Apple TV](https://tv.apple.com)
- [Paramount+](https://www.paramountplus.com)
- [Peacock](https://www.peacocktv.com)
- [Crunchyroll](https://www.crunchyroll.com)
- [Tubi](https://tubitv.com)
- [Dailymotion](https://www.dailymotion.com)
- [YouTube](https://www.youtube.com)
- [Vimeo](https://vimeo.com)
- [Twitch](https://www.twitch.tv)
- [TikTok](https://www.tiktok.com)

**Listen**

- [Apple Music](https://music.apple.com)
- [Amazon Music](https://music.amazon.com)
- [Pandora](https://www.pandora.com)
- [iHeartRadio](https://www.iheart.com)
- [Audible](https://www.audible.com)
- [Deezer](https://www.deezer.com)
- [Tidal](https://tidal.com)
- [Pocket Casts](https://pocketcasts.com)
- [Spotify](https://www.spotify.com)
- [SoundCloud](https://soundcloud.com)
- [Bandcamp](https://www.bandcamp.com)
- [Apple Podcasts](https://podcasts.apple.com)
- [YouTube Music](https://music.youtube.com)

**Read**

- [X](https://x.com)
- [The New York Times](https://www.nytimes.com)
- [The Guardian](https://www.theguardian.com)
- [Goodreads](https://www.goodreads.com)
- [Webtoon](https://www.webtoons.com)
- [Wattpad](https://www.wattpad.com)
- [Archive of Our Own](https://archiveofourown.org)
- [Kindle](https://read.amazon.com)
- [Medium](https://medium.com)
- [Substack](https://substack.com)
- [arXiv](https://arxiv.org)
- [Wikipedia](https://www.wikipedia.org)
- [Hacker News](https://news.ycombinator.com)
- [Reddit](https://www.reddit.com)

## IPC

The service answers on the `tsundoku` IPC target:

```bash
omarchy-shell tsundoku add <url>       # prints "ok", "duplicate", or "invalid"
omarchy-shell tsundoku open <id>       # opens an item, prints the method used
omarchy-shell tsundoku count           # prints the unread count
omarchy-shell tsundoku list            # prints the whole library as JSON
omarchy-shell tsundoku setNote <id> <text>  # sets an item's note ("" clears)
omarchy-shell tsundoku ping            # prints "ok" — is the service alive?
```

`add` always exits 0 when the shell is reachable; what happened is in the
printed result. A non-zero exit means the shell itself wasn't running.

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

MIT. The provider logos under `assets/logos/` come from
[Simple Icons](https://simpleicons.org) (CC0); the brand marks themselves
remain the property of their respective owners — see
`assets/logos/ATTRIBUTION.md`.
