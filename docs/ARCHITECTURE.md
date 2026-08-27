# Tsundoku: Architecture

## Plugin anatomy

One repo is one plugin. `manifest.json` at the root declares
`kinds: ["service", "bar-widget"]` with `entryPoints` pointing at
`Service.qml` and `BarWidget.qml`, and sets `keepLoaded: true` so the service
stays mounted rather than being torn down between uses.

There's no `panel` kind here, deliberately. The popup is a `PopupCard` —
built on Quickshell's `PopupWindow` via the shell's `qs.Ui` kit — anchored to
the bar widget itself, the same pattern the first-party media widget uses.
The shell's `panel` kind is for standalone windows that get summoned by IPC
(the OSD, for instance); Tsundoku's popup only ever opens relative to its own
bar widget, so it doesn't need that machinery.

## Process model

There's no external daemon. The `service` kind *is* the daemon: a headless
singleton `Item` that `omarchy-shell` instantiates at startup because the
manifest declares it. The bar widget doesn't own any state itself — it finds
the running service with `bar.shell.serviceFor("william.tsundoku")` and binds
its UI to the service's properties.

Data flows one way: the widget renders whatever the service's state is, and
calls functions on the service to change anything. The service is the only
thing that mutates the library; the widget and popup are pure views over it.

## IPC

The service registers an `IpcHandler` under the target name `tsundoku`,
reachable as:

```
omarchy-shell tsundoku add <url>   # prints "ok" | "duplicate" | "invalid"
omarchy-shell tsundoku count
omarchy-shell tsundoku list
omarchy-shell tsundoku ping
```

`add` returns a distinct result for each outcome so callers can react;
the IPC call itself exits 0 whenever the shell is reachable, so scripts
must read the printed result, not the exit code.

This is the path the hotkey capture uses: `scripts/tsundoku-add` reads the
clipboard with `wl-paste`, validates it as a URL, and calls
`omarchy-shell tsundoku add <url>`, letting the already-running shell
process do the work instead of spinning up anything new. Every outcome is
surfaced via `notify-send` (with a synchronous hint so repeated presses
replace the toast rather than stacking).

## Storage

The library lives at `~/.local/share/tsundoku/library.json` — a JSON array,
newest item first. On every mutation the service reassigns the array
property wholesale (rather than mutating in place) so QML's property
bindings pick up the change, and persists it to disk immediately.

Thumbnails cache to `~/.local/share/tsundoku/thumbs/`, named by the SHA-256
of the source image URL. `removeItem` deletes an item's cached thumbnail
file (only ever inside that cache dir, never elsewhere) when the item goes.

Nothing runtime lives in the plugin's own repo directory. The git checkout
under `~/.config/omarchy/plugins/william.tsundoku/` is code only.

## Theming

No color is ever hardcoded. Surfaces pull from the `Color` singleton's popup
and bar contexts; spacing, font scale, corner radius, and state fills (via
`normalFillFor` / `selectedFillFor` and `Border.controlSpec`) come from
`Style` tokens. Provider logos (v0.3) are monochrome SVGs tinted at render
time against the active theme, rather than shipped as pre-colored assets.

## Resolver pipeline (v0.3)

`Providers.js` is the registry, one entry per provider:

```
{ id, displayName, kind, domains, logoAsset, resolver, openAction }
```

`Providers.match(url)` picks an entry by domain (exact match wins over a
suffix match, so `music.youtube.com` doesn't fall into `youtube`'s
`youtube.com` entry); `addUrl` uses it to set `item.provider`/`item.kind`,
falling back to the old bare-host guess when nothing matches.

`addUrl` returns "ok" immediately — resolution runs asynchronously, so
callers never block on network I/O. The service spawns one `Process` per
item running `scripts/tsundoku-resolve`, which tries three tiers in order:
oEmbed (when the matched provider has one), OpenGraph scraping of the page
itself, and a bare-hostname title as the last resort. oEmbed responses are
consumed strictly as metadata — `title`, `thumbnail_url`, `author_name` —
the `html` embed field is never touched, in line with the
never-embed-a-webview principle. Each fetch is capped with `--max-time 5`
and a 256 KiB response limit; the script always exits 0 and prints exactly
one line of JSON, so a resolution failure never surfaces as a process error
to the service.

Every item carries `resolveState`: `"pending"` while its Process is in
flight, `"resolved"` once oEmbed or OpenGraph actually produced a title,
`"failed"` otherwise — including the bare-host fallback tier, so it stays
retriable. The popup shows a retry action only on `"failed"` items, calling
the service's public `resolveItem(id)` directly; `"pending"` gets no
affordance, it's a quiet state. On the first successful library load, the
service also re-resolves every unconsumed item whose state is missing
(pre-0.3 libraries never had the field) or `"pending"` (a resolve an
interrupted shell restart left hanging) — `"failed"` items are left alone,
that retry is manual only. A one-shot flag stops this pass from replaying
on every `saveLibrary()`-triggered file reload.

Thumbnails download to `~/.local/share/tsundoku/thumbs/`, named by the
SHA-256 of the source image URL so a repeat resolve is a cache hit rather
than a re-fetch. `removeItem` deletes an item's cached thumbnail file when
it lives inside that cache dir.

Provider logos are monochrome SVGs (`assets/logos/`) tinted at render
time: a hidden `Image` sampled through `MultiEffect { colorization: 1.0;
colorizationColor: root.bar.foreground }`, the same idiom the shell's own
tray icons use for symbolic icons. The bar widget shows a resolved
thumbnail when there is one, the tinted logo otherwise, and the plain kind
glyph as the fallback while either is still loading — so there's never a
flash of an untinted or broken image.

## Dev workflow

Edit directly in `~/.config/omarchy/plugins/william.tsundoku` — saving any
file there triggers the shell's plugin reload. Caveat found in practice: the
reload re-instantiates widgets but the QML engine can serve stale compiled
components, so after editing `.qml` files run `omarchy-restart-shell` to be
sure the new code is live. Manifest and enable-state changes take effect on
reload without a restart.

```bash
omarchy plugin validate .
omarchy-shell shell rescanPlugins
omarchy plugin list --json
omarchy-restart-shell            # after QML edits — see caveat above
```

`rescanPlugins` forces a reload if hot-reload doesn't pick up a change (e.g.
after editing `manifest.json` itself); `plugin list --json` is the quickest
way to confirm the manifest parsed and the plugin is enabled.
