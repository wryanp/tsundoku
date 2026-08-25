import QtQuick
import Quickshell
import Quickshell.Io
import "Providers.js" as Providers

// Headless service: sole owner of the tsundoku library. The bar widget
// (and any future UI) finds this via shell.serviceFor("william.tsundoku")
// and binds to items/unreadCount, calling the mutator functions below.
// Provider matching is data-driven (Providers.js); metadata resolution
// (title/author/thumbnail) runs asynchronously per item via
// scripts/tsundoku-resolve — see resolveItem below.
Item {
  id: root

  property var shell: null
  property var manifest: null

  property string homeDir: Quickshell.env("HOME")
  property string dataDir: root.homeDir + "/.local/share/tsundoku"
  property string thumbsDir: root.dataDir + "/thumbs"
  property string libraryPath: root.dataDir + "/library.json"

  // Absolute path to the resolve script, derived from this file's own
  // location so it works regardless of where the plugin checkout lives.
  readonly property string resolveScriptPath: String(Qt.resolvedUrl("scripts/tsundoku-resolve")).replace(/^file:\/\//, "")

  // Same recipe, for the OAuth helper.
  readonly property string authScriptPath: String(Qt.resolvedUrl("scripts/tsundoku-auth")).replace(/^file:\/\//, "")

  // Full library, newest first. Reassigned wholesale on every mutation so
  // QML bindings (in-place array mutation is invisible to them) pick it up.
  property var items: []

  // ids currently being resolved — guards a retry racing an in-flight
  // resolve, and a reload racing the startup re-resolution pass.
  property var resolvingIds: ({})

  // Set once the startup/migration re-resolution pass has run. Guards
  // against libraryFile's watchChanges -> onFileChanged -> reload ->
  // loadLibrary loop (every saveLibrary() triggers one) replaying the pass
  // on every single save.
  property bool autoResolveDone: false

  // Which open targets exist on this machine, probed once at startup.
  // All-false until the probe answers (and stays all-false if it fails),
  // so every open falls back to the browser rather than a missing app.
  // node guards executing the node-shebanged auth script directly.
  property var openCaps: ({ mpv: false, ytdlp: false, spotifyHandler: false, node: false })

  // Per-provider OAuth state. "spotify" is the only key today. Reassigned
  // wholesale on every change, same rationale as items above. "unknown"
  // until the startup status probe (or a connect/disconnect) resolves it.
  property var authState: ({ spotify: "unknown" })

  // Set from a connect/disconnect result's error field; cleared whenever a
  // new flow starts so a stale message never survives past its cause.
  property string lastAuthError: ""

  readonly property int unreadCount: {
    var count = 0
    for (var i = 0; i < root.items.length; i++) {
      if (!root.items[i].consumedAt) count++
    }
    return count
  }

  readonly property var watchHosts: ["youtube.com", "youtu.be", "vimeo.com", "twitch.tv", "tiktok.com"]
  readonly property var listenHosts: ["open.spotify.com", "soundcloud.com", "bandcamp.com", "podcasts.apple.com", "music.youtube.com"]

  function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  }

  function hostFromUrl(url) {
    var m = String(url || "").match(/^https?:\/\/([^\/?#]+)/i)
    if (!m) return ""
    var host = m[1].toLowerCase()
    var atIdx = host.indexOf("@")
    if (atIdx >= 0) host = host.substring(atIdx + 1)
    var colonIdx = host.indexOf(":")
    if (colonIdx >= 0) host = host.substring(0, colonIdx)
    if (host.indexOf("www.") === 0) host = host.substring(4)
    return host
  }

  function guessKind(host) {
    if (root.watchHosts.indexOf(host) >= 0) return "watch"
    if (root.listenHosts.indexOf(host) >= 0) return "listen"
    return "read"
  }

  function findItem(id) {
    for (var i = 0; i < root.items.length; i++) {
      if (root.items[i].id === id) return root.items[i]
    }
    return null
  }

  function providerEntryFor(providerId) {
    if (!providerId) return null
    var entries = Providers.all()
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].id === providerId) return entries[i]
    }
    return null
  }

  // Returns "ok", "duplicate", or "invalid" — the popup and the IPC add
  // both surface these distinctly, so callers can tell what happened.
  function addUrl(url) {
    var trimmed = String(url || "").trim()
    if (!/^https?:\/\//i.test(trimmed)) return "invalid"

    for (var i = 0; i < root.items.length; i++) {
      if (root.items[i].url === trimmed) return "duplicate"
    }

    var host = root.hostFromUrl(trimmed)
    if (!host) return "invalid"

    var matched = Providers.match(trimmed)

    var item = {
      id: root.makeId(),
      url: trimmed,
      provider: matched ? matched.id : host,
      kind: matched ? matched.kind : root.guessKind(host),
      title: host,
      author: "",
      thumbnailPath: "",
      durationSeconds: null,
      addedAt: new Date().toISOString(),
      consumedAt: null,
      notes: "",
      resolveState: "pending"
    }

    root.items = [item].concat(root.items)
    root.saveLibrary()
    root.resolveItem(item.id)
    return "ok"
  }

  // Kicks off async resolution for one item: spawns tsundoku-resolve and,
  // on completion, merges title/author/thumbnailPath and sets resolveState.
  // Public (not just internal) so the popup's retry button can call it
  // directly on a previously-failed item. No-ops if the item is already
  // being resolved.
  function resolveItem(id) {
    var item = root.findItem(id)
    if (!item) return
    if (root.resolvingIds[id]) return
    root.resolvingIds[id] = true

    root.items = root.items.map(function(it) {
      if (it.id !== id) return it
      var copy = {}
      for (var k in it) copy[k] = it[k]
      copy.resolveState = "pending"
      return copy
    })

    var args = [root.resolveScriptPath, "--thumbs-dir", root.thumbsDir, "--auth-cmd", root.authScriptPath]
    var entry = root.providerEntryFor(item.provider)
    if (entry && entry.resolver && entry.resolver.type === "oembed" && entry.resolver.endpoint) {
      var endpoint = entry.resolver.endpoint.replace("{url}", encodeURIComponent(item.url))
      args.push("--oembed", endpoint)
    }
    args.push(item.url)

    var proc = resolveProcessComponent.createObject(root, { tsundokuItemId: id })
    if (!proc) {
      delete root.resolvingIds[id]
      return
    }
    proc.command = args
    proc.running = true
  }

  // Handles one resolve Process's stdout. Bails silently if the item was
  // deleted mid-flight. Parse failures and empty stdout land as "failed" so
  // the UI's retry button can surface — tsundoku-resolve itself always
  // exits 0, so a bad/missing line here means something upstream broke.
  function finishResolve(proc, raw) {
    var id = proc.tsundokuItemId
    delete root.resolvingIds[id]
    proc.destroy()

    if (!root.findItem(id)) return

    var parsed = null
    var trimmedRaw = String(raw || "").trim()
    if (trimmedRaw) {
      try {
        parsed = JSON.parse(trimmedRaw)
      } catch (e) {
        parsed = null
      }
    }

    root.items = root.items.map(function(it) {
      if (it.id !== id) return it
      var copy = {}
      for (var k in it) copy[k] = it[k]
      if (parsed && typeof parsed === "object") {
        if (parsed.title) copy.title = parsed.title
        copy.author = parsed.author || ""
        if (parsed.thumbnailPath) copy.thumbnailPath = parsed.thumbnailPath
        if (typeof parsed.durationSeconds === "number") copy.durationSeconds = parsed.durationSeconds
        copy.resolveState = parsed.status === "resolved" ? "resolved" : "failed"
      } else {
        copy.resolveState = "failed"
      }
      return copy
    })
    root.saveLibrary()
  }

  // Startup/migration pass: re-resolve every unconsumed item whose
  // resolveState is missing (v0.2-era items, before resolveState existed)
  // or "pending" (a resolve interrupted by a shell restart mid-flight).
  // Items left "failed" by a completed-but-unsuccessful resolve are NOT
  // retried here — only via the UI's retry button. Runs at most once per
  // service lifetime (see autoResolveDone above).
  function autoResolvePendingItems() {
    if (root.autoResolveDone) return
    root.autoResolveDone = true

    // v0.2-era items stored the raw host as `provider` (there was no
    // registry yet), which would leave them logo-less and stuck on the
    // OpenGraph tier forever. Re-match those against the registry before
    // resolving; finishResolve persists the result.
    root.items = root.items.map(function(it) {
      if (it.consumedAt) return it
      if (it.resolveState && it.resolveState !== "pending") return it
      if (root.providerEntryFor(it.provider)) return it
      var matched = Providers.match(it.url)
      if (!matched) return it
      var copy = {}
      for (var k in it) copy[k] = it[k]
      copy.provider = matched.id
      copy.kind = matched.kind
      return copy
    })

    for (var i = 0; i < root.items.length; i++) {
      var it = root.items[i]
      if (it.consumedAt) continue
      if (!it.resolveState || it.resolveState === "pending") {
        root.resolveItem(it.id)
      }
    }
  }

  function markConsumed(id) {
    var now = new Date().toISOString()
    root.items = root.items.map(function(item) {
      if (item.id !== id) return item
      var copy = {}
      for (var k in item) copy[k] = item[k]
      copy.consumedAt = now
      return copy
    })
    root.saveLibrary()
  }

  function unmarkConsumed(id) {
    root.items = root.items.map(function(item) {
      if (item.id !== id) return item
      var copy = {}
      for (var k in item) copy[k] = item[k]
      copy.consumedAt = null
      return copy
    })
    root.saveLibrary()
  }

  // Trims text and stores it as the item's notes; "" clears the note.
  function setNote(id, text) {
    var target = root.findItem(id)
    if (!target) return "missing"
    var note = String(text || "").trim()
    root.items = root.items.map(function(item) {
      if (item.id !== id) return item
      var copy = {}
      for (var k in item) copy[k] = item[k]
      copy.notes = note
      return copy
    })
    root.saveLibrary()
    return "ok"
  }

  function removeItem(id) {
    var target = root.findItem(id)
    // Only ever delete inside our own thumbs cache — never a path outside it.
    if (target && target.thumbnailPath && target.thumbnailPath.indexOf(root.thumbsDir + "/") === 0) {
      Quickshell.execDetached(["rm", "-f", target.thumbnailPath])
    }
    root.items = root.items.filter(function(item) { return item.id !== id })
    root.saveLibrary()
  }

  // Reassigns authState wholesale, same rationale as items/openCaps above
  // (in-place mutation of the existing object is invisible to bindings).
  // Skips the reassign when nothing changed, so authStateChanged only fires
  // on real transitions — the popup clears its inline auth hint on that
  // signal and must not lose it to a same-state re-probe.
  function setAuthState(providerId, state) {
    if (root.authState[providerId] === state) return
    var copy = {}
    for (var k in root.authState) copy[k] = root.authState[k]
    copy[providerId] = state
    root.authState = copy
  }

  // Re-probe the stored connection state on demand (the popup opening) so
  // dropping clients.json into place is noticed without a shell restart.
  // Never during an active connect — the probe reports token-file state
  // and would clobber "connecting" mid-flow.
  function refreshAuthStatus() {
    if (!root.openCaps.node) return
    if (root.authState.spotify === "connecting") return
    if (authStatusProc.running) return
    authStatusProc.running = true
  }

  // Starts the spotify OAuth flow in the background via tsundoku-auth —
  // the browser round trip can take minutes, so this must never block.
  // Guarded to spotify (the only wired provider), the node cap (the script
  // is node-shebanged), and against stacking a second flow on a running
  // one. Returns whether a flow was actually started, so the IPC method
  // can report "unavailable" when it wasn't.
  function connectProvider(providerId) {
    if (providerId !== "spotify") return false
    if (!root.openCaps.node) return false
    if (root.authState[providerId] === "connecting") return false

    root.lastAuthError = ""
    root.setAuthState(providerId, "connecting")

    var proc = authProcessComponent.createObject(root, { tsundokuAuthProviderId: providerId, tsundokuAuthAction: "connect" })
    if (!proc) return false
    proc.command = [root.authScriptPath, "connect", providerId]
    proc.running = true
    return true
  }

  // Disconnect is quick (no browser round trip) but still routed through
  // the same dynamic Process shape as connect for consistency.
  function disconnectProvider(providerId) {
    if (providerId !== "spotify") return false
    if (!root.openCaps.node) return false

    var proc = authProcessComponent.createObject(root, { tsundokuAuthProviderId: providerId, tsundokuAuthAction: "disconnect" })
    if (!proc) return false
    proc.command = [root.authScriptPath, "disconnect", providerId]
    proc.running = true
    return true
  }

  // Handles one auth Process's stdout, for both connect and disconnect —
  // tsundoku-auth (like tsundoku-resolve) always exits 0, so a bad/missing
  // JSON line here means something upstream broke and lands as "error".
  // On a successful spotify connect, every unconsumed item already piled
  // under that provider is re-resolved so it can pick up enriched metadata
  // without the user having to retry it by hand.
  function finishAuth(proc, raw) {
    var providerId = proc.tsundokuAuthProviderId
    var action = proc.tsundokuAuthAction
    proc.destroy()

    var parsed = null
    var trimmedRaw = String(raw || "").trim()
    if (trimmedRaw) {
      try {
        parsed = JSON.parse(trimmedRaw)
      } catch (e) {
        parsed = null
      }
    }

    if (!parsed || typeof parsed !== "object" || !parsed.state) {
      root.setAuthState(providerId, "error")
      return
    }

    if (action === "connect") {
      if (parsed.state === "connected") {
        root.setAuthState(providerId, "connected")
        root.items.filter(function(it) {
          return !it.consumedAt && it.provider === providerId
        }).forEach(function(it) {
          root.resolveItem(it.id)
        })
      } else {
        root.setAuthState(providerId, parsed.state)
        root.lastAuthError = parsed.error || ""
      }
    } else {
      root.setAuthState(providerId, parsed.state)
    }
  }

  // Routes through Providers.openPlan so watch links land in mpv and
  // listen links in the Spotify client when those exist on this machine,
  // with a silent browser fallback otherwise. Returns the method used so
  // the IPC open can report it; "" means the id wasn't found.
  function openItem(id) {
    var item = root.findItem(id)
    if (!item) return ""
    var plan = Providers.openPlan(item.url, item.provider, root.openCaps)
    Quickshell.execDetached(plan.command)
    root.markConsumed(id)
    return plan.method
  }

  function loadLibrary(raw) {
    try {
      var parsed = JSON.parse(String(raw || "[]"))
      root.items = Array.isArray(parsed) ? parsed : []
    } catch (e) {
      console.warn("tsundoku: failed to parse library.json, starting empty:", e)
      root.items = []
    }
  }

  function saveLibrary() {
    libraryFile.setText(JSON.stringify(root.items, null, 2) + "\n")
  }

  Component.onCompleted: {
    mkdirProc.running = true
    capsProc.running = true
  }

  Process {
    id: mkdirProc
    command: ["mkdir", "-p", root.dataDir, root.thumbsDir]
  }

  // Probes for mpv, yt-dlp, a registered Spotify URI handler, and node
  // (needed to execute the node-shebanged auth script directly) once at
  // startup. Never touches openCaps on a bad parse or a non-zero exit —
  // the all-false default (browser for everything, auth unavailable) is
  // always safe.
  Process {
    id: capsProc
    command: ["sh", "-c", "m=false; command -v mpv >/dev/null 2>&1 && m=true; y=false; command -v yt-dlp >/dev/null 2>&1 && y=true; s=false; [ -n \"$(xdg-mime query default x-scheme-handler/spotify 2>/dev/null)\" ] && s=true; n=false; command -v node >/dev/null 2>&1 && n=true; printf '{\"mpv\":%s,\"ytdlp\":%s,\"spotifyHandler\":%s,\"node\":%s}\\n' \"$m\" \"$y\" \"$s\" \"$n\""]

    stdout: StdioCollector {
      waitForEnd: true
      onStreamFinished: {
        try {
          var parsed = JSON.parse(String(text || "").trim())
          if (parsed && typeof parsed === "object") root.openCaps = parsed
        } catch (e) {
          // leave openCaps at its all-false default
        }
        // Only fires on a successful parse with node true — openCaps.node
        // stays false otherwise, per the all-false-is-safe default above.
        if (root.openCaps.node) authStatusProc.running = true
      }
    }
  }

  // Startup read of the spotify connection state. Runs only once node is
  // known to exist (see capsProc above) since the script is node-shebanged.
  // Parse failure leaves authState.spotify at its "unknown" default.
  Process {
    id: authStatusProc
    command: [root.authScriptPath, "status", "spotify"]

    stdout: StdioCollector {
      waitForEnd: true
      onStreamFinished: {
        try {
          var parsed = JSON.parse(String(text || "").trim())
          if (parsed && typeof parsed === "object" && parsed.state) root.setAuthState("spotify", parsed.state)
        } catch (e) {
          // leave authState.spotify at "unknown"
        }
      }
    }
  }

  // One of these is created per resolveItem() call and destroyed on
  // completion — resolution is fully concurrent across items, not queued.
  Component {
    id: resolveProcessComponent

    Process {
      id: proc
      property string tsundokuItemId: ""

      stdout: StdioCollector {
        waitForEnd: true
        onStreamFinished: root.finishResolve(proc, text)
      }
    }
  }

  // One of these is created per connect/disconnect call, mirroring
  // resolveProcessComponent — connect especially can run for minutes
  // waiting on the user's browser, so it must never block anything else.
  Component {
    id: authProcessComponent

    Process {
      id: proc
      property string tsundokuAuthProviderId: ""
      property string tsundokuAuthAction: ""

      stdout: StdioCollector {
        waitForEnd: true
        onStreamFinished: root.finishAuth(proc, text)
      }
    }
  }

  FileView {
    id: libraryFile
    path: root.libraryPath
    watchChanges: true
    atomicWrites: true
    printErrors: false
    onLoaded: {
      root.loadLibrary(text())
      root.autoResolvePendingItems()
    }
    onLoadFailed: root.loadLibrary("[]")
    onFileChanged: reload()
  }

  IpcHandler {
    target: "tsundoku"

    function ping(): string {
      return "ok"
    }

    function add(url: string): string {
      return root.addUrl(url)
    }

    function open(id: string): string {
      return root.openItem(id)
    }

    function count(): string {
      return String(root.unreadCount)
    }

    function list(): string {
      return JSON.stringify(root.items)
    }

    function setNote(id: string, text: string): string {
      return root.setNote(id, text)
    }

    function authStatus(): string {
      return JSON.stringify(root.authState)
    }

    function authConnect(provider: string): string {
      return root.connectProvider(provider) ? "started" : "unavailable"
    }

    function authDisconnect(provider: string): string {
      return root.disconnectProvider(provider) ? "ok" : "unavailable"
    }
  }
}
