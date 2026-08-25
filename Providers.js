// Provider registry: data-driven URL -> provider resolution. Adding a
// provider means adding a table entry here, not writing new UI code.
//
// Dual-loadable: QML imports this as a namespace (top-level function/var
// declarations become the members, so no ".pragma library" and no ES module
// syntax), while tests load it with require(). Keep it plain ES5-ish JS.

function providerTable() {
  return [
    {
      id: "youtube",
      displayName: "YouTube",
      kind: "watch",
      domains: ["youtube.com", "youtu.be"],
      logoAsset: "assets/logos/youtube.svg",
      resolver: { type: "oembed", endpoint: "https://www.youtube.com/oembed?format=json&url={url}" },
      openAction: "mpv"
    },
    {
      id: "youtubemusic",
      displayName: "YouTube Music",
      kind: "listen",
      domains: ["music.youtube.com"],
      logoAsset: "assets/logos/youtubemusic.svg",
      resolver: { type: "oembed", endpoint: "https://www.youtube.com/oembed?format=json&url={url}" },
      openAction: "browser"
    },
    {
      id: "vimeo",
      displayName: "Vimeo",
      kind: "watch",
      domains: ["vimeo.com"],
      logoAsset: "assets/logos/vimeo.svg",
      resolver: { type: "oembed", endpoint: "https://vimeo.com/api/oembed.json?url={url}" },
      openAction: "mpv"
    },
    {
      id: "twitch",
      displayName: "Twitch",
      kind: "watch",
      domains: ["twitch.tv"],
      logoAsset: "assets/logos/twitch.svg",
      resolver: { type: "opengraph" },
      openAction: "mpv"
    },
    {
      id: "tiktok",
      displayName: "TikTok",
      kind: "watch",
      domains: ["tiktok.com"],
      logoAsset: "assets/logos/tiktok.svg",
      resolver: { type: "oembed", endpoint: "https://www.tiktok.com/oembed?url={url}" },
      openAction: "browser"
    },
    {
      id: "spotify",
      displayName: "Spotify",
      kind: "listen",
      domains: ["open.spotify.com", "spotify.com"],
      logoAsset: "assets/logos/spotify.svg",
      resolver: { type: "oembed", endpoint: "https://open.spotify.com/oembed?url={url}" },
      openAction: "spotify",
      // OAuth 2.0 PKCE (public client, no secret). clientId ships empty:
      // each install supplies its own Spotify app id via the clients.json
      // overlay (see scripts/tsundoku-auth) — Spotify requires the exact
      // redirect URI (including this port) to be registered on that app.
      // No scopes: catalog metadata needs only a valid user token.
      auth: {
        authEndpoint: "https://accounts.spotify.com/authorize",
        tokenEndpoint: "https://accounts.spotify.com/api/token",
        scopes: [],
        clientId: "",
        redirectPort: 41419,
        redirectPath: "/callback"
      }
    },
    {
      id: "soundcloud",
      displayName: "SoundCloud",
      kind: "listen",
      domains: ["soundcloud.com"],
      logoAsset: "assets/logos/soundcloud.svg",
      resolver: { type: "oembed", endpoint: "https://soundcloud.com/oembed?format=json&url={url}" },
      openAction: "browser"
    },
    {
      id: "bandcamp",
      displayName: "Bandcamp",
      kind: "listen",
      domains: ["bandcamp.com"],
      logoAsset: "assets/logos/bandcamp.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "applepodcasts",
      displayName: "Apple Podcasts",
      kind: "listen",
      domains: ["podcasts.apple.com"],
      logoAsset: "assets/logos/applepodcasts.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "medium",
      displayName: "Medium",
      kind: "read",
      domains: ["medium.com"],
      logoAsset: "assets/logos/medium.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "substack",
      displayName: "Substack",
      kind: "read",
      domains: ["substack.com"],
      logoAsset: "assets/logos/substack.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "arxiv",
      displayName: "arXiv",
      kind: "read",
      domains: ["arxiv.org"],
      logoAsset: "assets/logos/arxiv.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "wikipedia",
      displayName: "Wikipedia",
      kind: "read",
      domains: ["wikipedia.org"],
      logoAsset: "assets/logos/wikipedia.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "hackernews",
      displayName: "Hacker News",
      kind: "read",
      domains: ["news.ycombinator.com"],
      logoAsset: "assets/logos/hackernews.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "reddit",
      displayName: "Reddit",
      kind: "read",
      domains: ["reddit.com", "redd.it"],
      logoAsset: "assets/logos/reddit.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    }
  ]
}

function all() {
  return providerTable()
}

// Ported from Service.qml's hostFromUrl exactly: lowercase, strip
// userinfo, strip port, strip a leading "www.".
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

// Exact match wins over suffix match, so "music.youtube.com" resolves to
// youtubemusic rather than youtube (whose "youtube.com" domain would
// otherwise suffix-match it).
function match(url) {
  var host = hostFromUrl(url)
  if (!host) return null

  var entries = providerTable()

  for (var i = 0; i < entries.length; i++) {
    var domains = entries[i].domains
    for (var j = 0; j < domains.length; j++) {
      if (host === domains[j]) return entries[i]
    }
  }

  for (var i2 = 0; i2 < entries.length; i2++) {
    var domains2 = entries[i2].domains
    for (var j2 = 0; j2 < domains2.length; j2++) {
      if (host.length > domains2[j2].length && host.slice(-(domains2[j2].length + 1)) === "." + domains2[j2]) {
        return entries[i2]
      }
    }
  }

  return null
}

function guessKind(url) {
  var entry = match(url)
  return entry ? entry.kind : "read"
}

// Path only (query/fragment ignored), same no-new-URL constraint as
// hostFromUrl since this also has to run inside QML's JS engine.
function isDirectAudioUrl(url) {
  var m = String(url || "").match(/^https?:\/\/[^\/?#]+([^?#]*)/i)
  if (!m) return false
  return /\.(mp3|m4a|ogg|oga|opus|flac|wav|aac)$/i.test(m[1])
}

// open.spotify.com paths are "/{type}/{id}" or, with a locale prefix,
// "/{locale}/{type}/{id}" (e.g. "/intl-pt/track/{id}"). The path capture
// already excludes query/fragment, so the id comes out clean.
function spotifyUri(url) {
  if (hostFromUrl(url) !== "open.spotify.com") return null

  var m = String(url || "").match(/^https?:\/\/[^\/?#]+([^?#]*)/i)
  if (!m) return null

  var segs = m[1].split("/").filter(function(s) { return s.length > 0 })
  if (segs.length === 3) segs = segs.slice(1)
  if (segs.length !== 2) return null

  var type = segs[0]
  var id = segs[1]
  var validTypes = ["track", "album", "artist", "playlist", "episode", "show"]
  if (validTypes.indexOf(type) < 0) return null
  if (!id) return null

  return "spotify:" + type + ":" + id
}

// The provider's OAuth config, or null for providers with no auth story.
// scripts/tsundoku-auth requires() this module and resolves its per-install
// overlay (clients.json) on top of what this returns.
function authConfig(providerId) {
  var entries = providerTable()
  for (var i = 0; i < entries.length; i++) {
    if (entries[i].id === providerId) {
      return entries[i].auth || null
    }
  }
  return null
}

// Decides how a URL should be opened. Every fallback here is silent by
// design: a missing app (no mpv, no yt-dlp, no spotify handler) must
// never block the open, it should just degrade to the browser.
function openPlan(url, providerId, caps) {
  caps = caps || {}
  var mpv = !!caps.mpv
  var ytdlp = !!caps.ytdlp
  var spotifyHandler = !!caps.spotifyHandler

  // Direct audio files only need mpv itself, not yt-dlp extraction.
  if (isDirectAudioUrl(url) && mpv) {
    return { method: "mpv", command: ["mpv", url] }
  }

  var entries = providerTable()
  var entry = null
  for (var i = 0; i < entries.length; i++) {
    if (entries[i].id === providerId) {
      entry = entries[i]
      break
    }
  }

  if (entry && entry.openAction === "mpv" && mpv && ytdlp) {
    return { method: "mpv", command: ["mpv", url] }
  }

  if (entry && entry.openAction === "spotify" && spotifyHandler) {
    var uri = spotifyUri(url)
    if (uri) {
      return { method: "spotify", command: ["xdg-open", uri] }
    }
  }

  return { method: "browser", command: ["xdg-open", url] }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    all: all,
    match: match,
    hostFromUrl: hostFromUrl,
    guessKind: guessKind,
    isDirectAudioUrl: isDirectAudioUrl,
    spotifyUri: spotifyUri,
    authConfig: authConfig,
    openPlan: openPlan
  }
}
