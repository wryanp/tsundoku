# Tsundoku: Foundation

## Vision

One list for everything you saved to consume later, no matter what kind of
thing it is or where you found it. Capture has to be zero-friction — a
hotkey or a paste, not a form. Opening an item means opening it in the
native app built for that kind of media, not a webview bolted onto the bar.
And the whole thing has to feel first-party: no matter which Omarchy theme
you're running, Tsundoku looks like it shipped with the desktop, not like a
plugin someone dropped in.

## Core user journeys

1. **Capture from clipboard hotkey.** Copy a URL anywhere, hit the hotkey,
   it's in your library. No window to bring forward, no field to click into.
2. **Capture by pasting in the popup.** Open the popup, paste a URL into the
   add field, done. This is the fallback path when the hotkey capture isn't
   available yet, and it always works.
3. **Triage and browse with filter tabs.** The popup lists everything you've
   saved. Filter tabs — All, Watch, Listen, Read, Done — narrow the list to
   what you're deciding among right now.
4. **One-click open, which marks the item done.** Clicking an item launches
   it in the right place — mpv, Spotify, your browser — and marks it
   consumed. Opening something is the signal that you engaged with it; you
   don't have to separately check it off.
5. **Undo and delete.** Marking something done or removing it isn't
   permanent by accident — you can undo a done-mark or delete a saved item
   that turned out not to matter.

## Item model

Every saved item is:

```
{
  id,               // stable unique identifier for this item
  url,              // the source URL as captured
  provider,         // which registry entry resolved this item (e.g. "youtube")
  kind,             // "read" | "listen" | "watch"
  title,            // resolved or fallback display title
  author,           // channel, artist, publication, or byline, when known
  thumbnailPath,    // local cached path to the preview image, if any
  durationSeconds?, // runtime, for audio/video items where it's known
  addedAt,          // when the item was captured
  consumedAt?,      // when the item was marked done, absent while unread
  notes?,           // optional freeform text the user attached
}
```

## Metadata resolution tiers

Resolving a pasted URL into a title, thumbnail, and kind happens in three
tiers, each a fallback for the one before it:

1. **Official oEmbed.** YouTube, Vimeo, Spotify, SoundCloud, and TikTok all
   expose oEmbed endpoints that return title, thumbnail, and author with no
   authentication required. This is the preferred path wherever it exists.
2. **OpenGraph and meta-tag scraping.** For everything without oEmbed —
   Medium, Substack, arXiv, Wikipedia, Hacker News, Reddit, Bandcamp, Apple
   Podcasts, and generic blogs — fall back to reading `og:title`, `og:image`,
   `og:description`, `og:site_name`, and `article:author` out of the page's
   `<head>`.
3. **Bare fallback.** If neither resolves, the item still gets saved: the
   hostname becomes the title, and a generic icon stands in for the kind.
   Nothing ever fails to capture because metadata resolution failed.

## Launch providers

| Kind   | Providers |
|--------|-----------|
| Watch  | YouTube, Vimeo, Twitch, TikTok |
| Listen | Spotify, SoundCloud, Bandcamp, Apple Podcasts, YouTube Music, podcast RSS episode URLs |
| Read   | Medium, Substack, arXiv, Wikipedia, Hacker News, Reddit, generic articles |

## Principles

- **Never embed a webview.** Tsundoku resolves metadata and hands off to a
  native player or the browser. It never renders someone else's page inside
  the shell.
- **Never ask for a password.** Where public metadata isn't enough and
  authenticated access genuinely matters, the only auth path is OAuth 2.0
  with PKCE through the system browser. Tsundoku never sees a credential.
- **Strict network hygiene.** Every outbound request runs a 5-second
  timeout, respects a download size cap, sends an honest User-Agent, and
  never renders oEmbed's `html` embed field — only the plain metadata
  fields are used.
- **Auth is strictly additive.** Nothing requires signing in. Every feature
  degrades cleanly to the unauthenticated resolution tiers if a provider
  isn't authorized.
- **Provider logic is data-driven.** All per-provider behavior lives in a
  registry table. Adding a new provider means adding a table entry, not
  writing new UI code.
- **Theme adherence is non-negotiable.** Every color comes from the shell's
  `Color` and `Style` singletons. No hardcoded hex values, anywhere.

## Roadmap

- **v0.1** — Scaffold: service, bar widget, and popup with bare-URL capture.
  No metadata resolution yet.
- **v0.2** — Clipboard capture hotkey (`SUPER+SHIFT+T`) and IPC-driven add.
- **v0.3** — Provider registry with oEmbed and OpenGraph resolution, provider
  logos, and thumbnail caching.
- **v0.4** — Per-provider open actions (launch mpv, Spotify, browser, etc.
  correctly for each provider).
- **v0.5** — OAuth support, starting with Spotify.
- **v1.0** — Polish pass and submission to omarchyplugins.com.

Explicitly out of scope, even at v1.0: animated hover previews and embedded
players. Tsundoku hands off to native apps; it doesn't try to become one.
