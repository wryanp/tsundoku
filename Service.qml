import QtQuick
import Quickshell
import Quickshell.Io

// Headless service: sole owner of the tsundoku library. The bar widget
// (and any future UI) finds this via shell.serviceFor("william.tsundoku")
// and binds to items/unreadCount, calling the mutator functions below.
// Step 1 scaffold: bare-fallback metadata only, no provider resolution,
// no thumbnails, no network calls.
Item {
  id: root

  property var shell: null
  property var manifest: null

  property string homeDir: Quickshell.env("HOME")
  property string dataDir: root.homeDir + "/.local/share/tsundoku"
  property string thumbsDir: root.dataDir + "/thumbs"
  property string libraryPath: root.dataDir + "/library.json"

  // Full library, newest first. Reassigned wholesale on every mutation so
  // QML bindings (in-place array mutation is invisible to them) pick it up.
  property var items: []

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

  function addUrl(url) {
    var trimmed = String(url || "").trim()
    if (!/^https?:\/\//i.test(trimmed)) return false

    for (var i = 0; i < root.items.length; i++) {
      if (root.items[i].url === trimmed) return false
    }

    var host = root.hostFromUrl(trimmed)
    if (!host) return false

    var item = {
      id: root.makeId(),
      url: trimmed,
      provider: host,
      kind: root.guessKind(host),
      title: host,
      author: "",
      thumbnailPath: "",
      durationSeconds: null,
      addedAt: new Date().toISOString(),
      consumedAt: null,
      notes: ""
    }

    root.items = [item].concat(root.items)
    root.saveLibrary()
    return true
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

  function removeItem(id) {
    root.items = root.items.filter(function(item) { return item.id !== id })
    root.saveLibrary()
  }

  function openItem(id) {
    var item = root.findItem(id)
    if (!item) return
    Quickshell.execDetached(["xdg-open", item.url])
    root.markConsumed(id)
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

  Component.onCompleted: mkdirProc.running = true

  Process {
    id: mkdirProc
    command: ["mkdir", "-p", root.dataDir, root.thumbsDir]
  }

  FileView {
    id: libraryFile
    path: root.libraryPath
    watchChanges: true
    atomicWrites: true
    printErrors: false
    onLoaded: root.loadLibrary(text())
    onLoadFailed: root.loadLibrary("[]")
    onFileChanged: reload()
  }

  IpcHandler {
    target: "tsundoku"

    function ping(): string {
      return "ok"
    }

    function add(url: string): string {
      return root.addUrl(url) ? "ok" : "duplicate-or-invalid"
    }

    function count(): string {
      return String(root.unreadCount)
    }

    function list(): string {
      return JSON.stringify(root.items)
    }
  }
}
