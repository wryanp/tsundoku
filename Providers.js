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
      openAction: "browser"
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
      openAction: "browser"
    },
    {
      id: "twitch",
      displayName: "Twitch",
      kind: "watch",
      domains: ["twitch.tv"],
      logoAsset: "assets/logos/twitch.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
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
      openAction: "browser"
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

if (typeof module !== "undefined" && module.exports) {
  module.exports = { all: all, match: match, hostFromUrl: hostFromUrl, guessKind: guessKind }
}
