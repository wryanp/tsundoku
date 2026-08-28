# Changelog

Notable changes to Tsundoku. The version in `manifest.json` is the source of
truth; pushing a new version to `main` tags and publishes the release
automatically.

## v1.1.1 — 2026-08-27

Security hardening of link resolution, prompted by marketplace review
(HANCORE-linux/omarchy-plugin-marketplace#2836). A saved link is
attacker-chosen input, and resolution now treats it that way:

- Page, oEmbed, and thumbnail fetches refuse URLs whose hosts resolve to
  loopback, private, link-local, or otherwise non-public addresses, and
  redirects are followed manually with the same check on every hop — a
  saved link can no longer probe local or internal services. Blocked links
  still save; they just fall back to the bare-hostname tier.
- Item titles and captions render with `Text.PlainText`, so markup in
  remote metadata is displayed rather than interpreted.
- Thumbnails download to a fresh temp file that is renamed into the cache,
  and a symlink at the cache path is never followed or trusted.

## v1.1.0 — 2026-08-27

- Provider registry expanded from 42 to 202 platforms: GitHub, live TV and
  sports (Pluto TV, ESPN, the NBA/NFL/MLB/NHL, F1), more streaming services
  (Plex, MUBI, Criterion, Bilibili, JioHotstar, PBS, and others), music and
  podcast apps (Qobuz, Overcast, Mixcloud, Last.fm, TuneIn), major US and
  international news, tech/science/culture publications, books and fiction
  platforms (Royal Road, Kobo, Project Gutenberg, Internet Archive), and
  social reading (Bluesky, Threads, Tumblr, Mastodon).
- 57 new brand logos from Simple Icons (CC0), each verified against Simple
  Icons metadata; providers without freely licensed artwork use the generic
  category glyphs and still get real titles and thumbnails at resolve time.
- Per-domain test coverage for every new provider.

## v1.0.0 — 2026-08-27

Initial release.

- Save links via a capture hotkey (`wl-paste` over IPC) or the popup's add
  field, with duplicate and invalid-URL feedback.
- Bar widget with unread badge; keyboard-first popup with All / Watch /
  Listen / Read / Done tabs and per-item notes.
- Background resolution to real titles, authors, and thumbnails (oEmbed,
  then OpenGraph, then hostname fallback).
- Watch links open in `mpv` (with `yt-dlp`) when available, otherwise in
  the browser; audio files play directly in `mpv`.
- 42 recognized providers with logos.
