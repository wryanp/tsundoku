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
omarchy-shell tsundoku add <url>
omarchy-shell tsundoku count
omarchy-shell tsundoku list
omarchy-shell tsundoku ping
```

This is the path the v0.2 hotkey capture uses: `scripts/tsundoku-add` will
read the clipboard and call `omarchy-shell tsundoku add <url>`, letting the
already-running shell process do the work instead of spinning up anything
new.

## Storage

The library lives at `~/.local/share/tsundoku/library.json` — a JSON array,
newest item first. On every mutation the service reassigns the array
property wholesale (rather than mutating in place) so QML's property
bindings pick up the change, and persists it to disk immediately.

Thumbnails, once resolution lands in v0.3, cache to
`~/.local/share/tsundoku/thumbs/` as hash-named image files.

Nothing runtime lives in the plugin's own repo directory. The git checkout
under `~/.config/omarchy/plugins/william.tsundoku/` is code only.

## Theming

No color is ever hardcoded. Surfaces pull from the `Color` singleton's popup
and bar contexts; spacing, font scale, corner radius, and state fills (via
`normalFillFor` / `selectedFillFor` and `Border.controlSpec`) come from
`Style` tokens. Provider logos (v0.3) are monochrome SVGs tinted at render
time against the active theme, rather than shipped as pre-colored assets.

## Planned resolver pipeline (v0.3)

Providers live in a registry table, one entry per provider:

```
{ id, displayName, kind, domains, logoAsset, resolver, openAction }
```

Resolution shells out through Quickshell's `Io.Process` to `curl`, capped
with `--max-time 5` and a response size limit. oEmbed responses are consumed
strictly as metadata — `title`, `thumbnail_url`, `author_name` — and the
`html` embed field is never touched, in line with the never-embed-a-webview
principle.

## Planned auth (v0.5)

Where a provider needs authenticated access (Spotify first), auth uses OAuth
2.0 Authorization Code with PKCE: a loopback listener on `127.0.0.1` catches
the redirect, the authorization step opens in the system browser via
`xdg-open`, and no credential ever passes through Tsundoku itself. Tokens are
written to `~/.local/share/tsundoku/auth/<provider>.json` with `chmod 0600`.

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
