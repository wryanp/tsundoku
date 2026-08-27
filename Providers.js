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
    },

    // --- Watch: streaming video services ---
    {
      id: "netflix",
      displayName: "Netflix",
      kind: "watch",
      domains: ["netflix.com"],
      logoAsset: "assets/logos/netflix.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "primevideo",
      displayName: "Prime Video",
      kind: "watch",
      domains: ["primevideo.com"],
      logoAsset: "assets/logos/primevideo.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "disneyplus",
      displayName: "Disney+",
      kind: "watch",
      domains: ["disneyplus.com"],
      logoAsset: "assets/logos/disneyplus.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "hbomax",
      displayName: "HBO Max",
      kind: "watch",
      // max.com kept alongside hbomax.com so pre-rebrand links still match.
      domains: ["hbomax.com", "max.com"],
      logoAsset: "assets/logos/hbomax.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "hulu",
      displayName: "Hulu",
      kind: "watch",
      domains: ["hulu.com"],
      logoAsset: "assets/logos/hulu.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "appletv",
      displayName: "Apple TV",
      kind: "watch",
      // Exact-match subdomain, same pattern as music.youtube.com: no
      // parent apple.com entry exists anywhere in this table.
      domains: ["tv.apple.com"],
      logoAsset: "assets/logos/appletv.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "paramountplus",
      displayName: "Paramount+",
      kind: "watch",
      domains: ["paramountplus.com"],
      logoAsset: "assets/logos/paramountplus.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "peacock",
      displayName: "Peacock",
      kind: "watch",
      domains: ["peacocktv.com"],
      logoAsset: "assets/logos/peacock.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "crunchyroll",
      displayName: "Crunchyroll",
      kind: "watch",
      domains: ["crunchyroll.com"],
      logoAsset: "assets/logos/crunchyroll.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "tubi",
      displayName: "Tubi",
      kind: "watch",
      domains: ["tubitv.com"],
      logoAsset: "assets/logos/tubi.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "dailymotion",
      displayName: "Dailymotion",
      kind: "watch",
      domains: ["dailymotion.com", "dai.ly"],
      logoAsset: "assets/logos/dailymotion.svg",
      resolver: { type: "oembed", endpoint: "https://www.dailymotion.com/services/oembed?url={url}" },
      openAction: "mpv"
    },

    // --- Listen: music, radio, and audiobook services ---
    {
      id: "applemusic",
      displayName: "Apple Music",
      kind: "listen",
      // Exact-match subdomain, same pattern as music.youtube.com: no
      // parent apple.com entry exists anywhere in this table.
      domains: ["music.apple.com"],
      logoAsset: "assets/logos/applemusic.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "amazonmusic",
      displayName: "Amazon Music",
      kind: "listen",
      // Exact-match subdomain, same pattern as music.youtube.com: no
      // parent amazon.com entry exists anywhere in this table.
      domains: ["music.amazon.com"],
      logoAsset: "assets/logos/amazonmusic.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "pandora",
      displayName: "Pandora",
      kind: "listen",
      domains: ["pandora.com"],
      logoAsset: "assets/logos/pandora.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "iheartradio",
      displayName: "iHeartRadio",
      kind: "listen",
      domains: ["iheart.com"],
      logoAsset: "assets/logos/iheartradio.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "audible",
      displayName: "Audible",
      kind: "listen",
      domains: ["audible.com"],
      logoAsset: "assets/logos/audible.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "deezer",
      displayName: "Deezer",
      kind: "listen",
      domains: ["deezer.com"],
      logoAsset: "assets/logos/deezer.svg",
      resolver: { type: "oembed", endpoint: "https://api.deezer.com/oembed?url={url}" },
      openAction: "browser"
    },
    {
      id: "tidal",
      displayName: "Tidal",
      kind: "listen",
      domains: ["tidal.com"],
      logoAsset: "assets/logos/tidal.svg",
      // opengraph on purpose: Tidal's oEmbed response lacks the title
      // field our resolve script's oEmbed tier requires.
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "pocketcasts",
      displayName: "Pocket Casts",
      kind: "listen",
      domains: ["pocketcasts.com", "pca.st"],
      logoAsset: "assets/logos/pocketcasts.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },

    // --- Read: articles, news, and books ---
    {
      id: "x",
      displayName: "X",
      kind: "read",
      domains: ["x.com", "twitter.com"],
      logoAsset: "assets/logos/x.svg",
      // opengraph on purpose: publish.x.com oEmbed returns no title field.
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "nytimes",
      displayName: "The New York Times",
      kind: "read",
      domains: ["nytimes.com"],
      logoAsset: "assets/logos/nytimes.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "theguardian",
      displayName: "The Guardian",
      kind: "read",
      domains: ["theguardian.com"],
      logoAsset: "assets/logos/theguardian.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "goodreads",
      displayName: "Goodreads",
      kind: "read",
      domains: ["goodreads.com"],
      logoAsset: "assets/logos/goodreads.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "webtoon",
      displayName: "Webtoon",
      kind: "read",
      domains: ["webtoons.com"],
      logoAsset: "assets/logos/webtoon.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "wattpad",
      displayName: "Wattpad",
      kind: "read",
      domains: ["wattpad.com"],
      logoAsset: "assets/logos/wattpad.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "archiveofourown",
      displayName: "Archive of Our Own",
      kind: "read",
      domains: ["archiveofourown.org"],
      logoAsset: "assets/logos/archiveofourown.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "kindle",
      displayName: "Kindle",
      kind: "read",
      // Exact-match subdomain, same pattern as music.youtube.com: no
      // parent amazon.com entry exists anywhere in this table.
      // Login-walled: OpenGraph tags will be thin here, so the bare
      // hostname fallback tier carries most Kindle links.
      domains: ["read.amazon.com"],
      logoAsset: "assets/logos/kindle.svg",
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

// Decides how a URL should be opened. Every fallback here is silent by
// design: a missing app (no mpv, no yt-dlp) must never block the open,
// it should just degrade to the browser.
function openPlan(url, providerId, caps) {
  caps = caps || {}
  var mpv = !!caps.mpv
  var ytdlp = !!caps.ytdlp

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

  return { method: "browser", command: ["xdg-open", url] }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    all: all,
    match: match,
    hostFromUrl: hostFromUrl,
    guessKind: guessKind,
    isDirectAudioUrl: isDirectAudioUrl,
    openPlan: openPlan
  }
}
