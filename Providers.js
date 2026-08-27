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
      id: "github",
      displayName: "GitHub",
      kind: "read",
      domains: ["github.com"],
      logoAsset: "assets/logos/github.svg",
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
    },

    // --- Watch: live TV, sports, and more streaming platforms ---
    {
      id: "plutotv",
      displayName: "Pluto TV",
      kind: "watch",
      domains: ["pluto.tv"],
      logoAsset: "assets/logos/plutotv.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "rokuchannel",
      displayName: "The Roku Channel",
      kind: "watch",
      domains: ["therokuchannel.roku.com"],
      logoAsset: "assets/logos/rokuchannel.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "plex",
      displayName: "Plex",
      kind: "watch",
      domains: ["plex.tv"],
      logoAsset: "assets/logos/plex.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "slingtv",
      displayName: "Sling TV",
      kind: "watch",
      domains: ["sling.com"],
      logoAsset: "assets/logos/slingtv.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "fubo",
      displayName: "Fubo",
      kind: "watch",
      domains: ["fubo.tv"],
      logoAsset: "assets/logos/fubo.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "espn",
      displayName: "ESPN",
      kind: "watch",
      domains: ["espn.com"],
      logoAsset: "assets/logos/espn.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "dazn",
      displayName: "DAZN",
      kind: "watch",
      domains: ["dazn.com"],
      logoAsset: "assets/logos/dazn.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "nba",
      displayName: "NBA",
      kind: "watch",
      domains: ["nba.com"],
      logoAsset: "assets/logos/nba.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "nfl",
      displayName: "NFL",
      kind: "watch",
      domains: ["nfl.com"],
      logoAsset: "assets/logos/nfl.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "mlb",
      displayName: "MLB",
      kind: "watch",
      domains: ["mlb.com"],
      logoAsset: "assets/logos/mlb.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "nhl",
      displayName: "NHL",
      kind: "watch",
      domains: ["nhl.com"],
      logoAsset: "assets/logos/nhl.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "formula1",
      displayName: "Formula 1",
      kind: "watch",
      domains: ["formula1.com"],
      logoAsset: "assets/logos/formula1.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "nebula",
      displayName: "Nebula",
      kind: "watch",
      domains: ["nebula.tv"],
      logoAsset: "assets/logos/nebula.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "curiositystream",
      displayName: "CuriosityStream",
      kind: "watch",
      domains: ["curiositystream.com"],
      logoAsset: "assets/logos/curiositystream.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "mubi",
      displayName: "MUBI",
      kind: "watch",
      domains: ["mubi.com"],
      logoAsset: "assets/logos/mubi.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "criterionchannel",
      displayName: "Criterion Channel",
      kind: "watch",
      domains: ["criterionchannel.com"],
      logoAsset: "assets/logos/criterionchannel.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "shudder",
      displayName: "Shudder",
      kind: "watch",
      domains: ["shudder.com"],
      logoAsset: "assets/logos/shudder.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "amcplus",
      displayName: "AMC+",
      kind: "watch",
      domains: ["amcplus.com"],
      logoAsset: "assets/logos/amcplus.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "starz",
      displayName: "Starz",
      kind: "watch",
      domains: ["starz.com"],
      logoAsset: "assets/logos/starz.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "britbox",
      displayName: "BritBox",
      kind: "watch",
      domains: ["britbox.com"],
      logoAsset: "assets/logos/britbox.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "discoveryplus",
      displayName: "Discovery+",
      kind: "watch",
      domains: ["discoveryplus.com"],
      logoAsset: "assets/logos/discoveryplus.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "viki",
      displayName: "Rakuten Viki",
      kind: "watch",
      domains: ["viki.com"],
      logoAsset: "assets/logos/viki.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "iqiyi",
      displayName: "iQIYI",
      kind: "watch",
      domains: ["iqiyi.com", "iq.com"],
      logoAsset: "assets/logos/iqiyi.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "bilibili",
      displayName: "Bilibili",
      kind: "watch",
      domains: ["bilibili.com", "b23.tv"],
      logoAsset: "assets/logos/bilibili.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "niconico",
      displayName: "Niconico",
      kind: "watch",
      domains: ["nicovideo.jp"],
      logoAsset: "assets/logos/niconico.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "hotstar",
      displayName: "JioHotstar",
      kind: "watch",
      domains: ["hotstar.com"],
      logoAsset: "assets/logos/hotstar.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "zee5",
      displayName: "ZEE5",
      kind: "watch",
      domains: ["zee5.com"],
      logoAsset: "assets/logos/zee5.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "pbs",
      displayName: "PBS",
      kind: "watch",
      domains: ["pbs.org"],
      logoAsset: "assets/logos/pbs.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "itvx",
      displayName: "ITVX",
      kind: "watch",
      domains: ["itv.com"],
      logoAsset: "assets/logos/itvx.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "ted",
      displayName: "TED",
      kind: "watch",
      domains: ["ted.com"],
      logoAsset: "assets/logos/ted.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "vevo",
      displayName: "Vevo",
      kind: "watch",
      domains: ["vevo.com"],
      logoAsset: "assets/logos/vevo.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "dropout",
      displayName: "Dropout",
      kind: "watch",
      domains: ["dropout.tv"],
      logoAsset: "assets/logos/dropout.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "instagram",
      displayName: "Instagram",
      kind: "watch",
      domains: ["instagram.com"],
      logoAsset: "assets/logos/instagram.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },

    // --- Listen: more music and podcast platforms ---
    {
      id: "qobuz",
      displayName: "Qobuz",
      kind: "listen",
      domains: ["qobuz.com"],
      logoAsset: "assets/logos/qobuz.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "napster",
      displayName: "Napster",
      kind: "listen",
      domains: ["napster.com"],
      logoAsset: "assets/logos/napster.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "overcast",
      displayName: "Overcast",
      kind: "listen",
      domains: ["overcast.fm"],
      logoAsset: "assets/logos/overcast.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "castbox",
      displayName: "Castbox",
      kind: "listen",
      domains: ["castbox.fm"],
      logoAsset: "assets/logos/castbox.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "podbean",
      displayName: "Podbean",
      kind: "listen",
      domains: ["podbean.com"],
      logoAsset: "assets/logos/podbean.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "acast",
      displayName: "Acast",
      kind: "listen",
      domains: ["acast.com"],
      logoAsset: "assets/logos/acast.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "tunein",
      displayName: "TuneIn",
      kind: "listen",
      domains: ["tunein.com"],
      logoAsset: "assets/logos/tunein.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "audiomack",
      displayName: "Audiomack",
      kind: "listen",
      domains: ["audiomack.com"],
      logoAsset: "assets/logos/audiomack.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "mixcloud",
      displayName: "Mixcloud",
      kind: "listen",
      domains: ["mixcloud.com"],
      logoAsset: "assets/logos/mixcloud.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "lastfm",
      displayName: "Last.fm",
      kind: "listen",
      domains: ["last.fm"],
      logoAsset: "assets/logos/lastfm.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "jiosaavn",
      displayName: "JioSaavn",
      kind: "listen",
      domains: ["jiosaavn.com"],
      logoAsset: "assets/logos/jiosaavn.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "anghami",
      displayName: "Anghami",
      kind: "listen",
      domains: ["anghami.com"],
      logoAsset: "assets/logos/anghami.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "librivox",
      displayName: "LibriVox",
      kind: "listen",
      domains: ["librivox.org"],
      logoAsset: "assets/logos/librivox.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "shazam",
      displayName: "Shazam",
      kind: "listen",
      domains: ["shazam.com"],
      logoAsset: "assets/logos/shazam.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },

    // --- Read: news, magazines, science, culture, and books ---
    {
      id: "washingtonpost",
      displayName: "The Washington Post",
      kind: "read",
      domains: ["washingtonpost.com", "wapo.st"],
      logoAsset: "assets/logos/washingtonpost.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "wsj",
      displayName: "The Wall Street Journal",
      kind: "read",
      domains: ["wsj.com"],
      logoAsset: "assets/logos/wsj.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "bloomberg",
      displayName: "Bloomberg",
      kind: "read",
      domains: ["bloomberg.com"],
      logoAsset: "assets/logos/bloomberg.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "reuters",
      displayName: "Reuters",
      kind: "read",
      domains: ["reuters.com"],
      logoAsset: "assets/logos/reuters.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "apnews",
      displayName: "AP News",
      kind: "read",
      domains: ["apnews.com"],
      logoAsset: "assets/logos/apnews.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "cnn",
      displayName: "CNN",
      kind: "read",
      domains: ["cnn.com"],
      logoAsset: "assets/logos/cnn.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "foxnews",
      displayName: "Fox News",
      kind: "read",
      domains: ["foxnews.com"],
      logoAsset: "assets/logos/foxnews.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "nbcnews",
      displayName: "NBC News",
      kind: "read",
      domains: ["nbcnews.com"],
      logoAsset: "assets/logos/nbcnews.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "abcnews",
      displayName: "ABC News",
      kind: "read",
      domains: ["abcnews.go.com"],
      logoAsset: "assets/logos/abcnews.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "cbsnews",
      displayName: "CBS News",
      kind: "read",
      domains: ["cbsnews.com"],
      logoAsset: "assets/logos/cbsnews.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "usatoday",
      displayName: "USA Today",
      kind: "read",
      domains: ["usatoday.com"],
      logoAsset: "assets/logos/usatoday.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "latimes",
      displayName: "Los Angeles Times",
      kind: "read",
      domains: ["latimes.com"],
      logoAsset: "assets/logos/latimes.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "theatlantic",
      displayName: "The Atlantic",
      kind: "read",
      domains: ["theatlantic.com"],
      logoAsset: "assets/logos/theatlantic.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "newyorker",
      displayName: "The New Yorker",
      kind: "read",
      domains: ["newyorker.com"],
      logoAsset: "assets/logos/newyorker.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "economist",
      displayName: "The Economist",
      kind: "read",
      domains: ["economist.com"],
      logoAsset: "assets/logos/economist.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "ft",
      displayName: "Financial Times",
      kind: "read",
      domains: ["ft.com"],
      logoAsset: "assets/logos/ft.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "time",
      displayName: "Time",
      kind: "read",
      domains: ["time.com"],
      logoAsset: "assets/logos/time.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "newsweek",
      displayName: "Newsweek",
      kind: "read",
      domains: ["newsweek.com"],
      logoAsset: "assets/logos/newsweek.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "politico",
      displayName: "Politico",
      kind: "read",
      domains: ["politico.com", "politico.eu"],
      logoAsset: "assets/logos/politico.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "axios",
      displayName: "Axios",
      kind: "read",
      domains: ["axios.com"],
      logoAsset: "assets/logos/axios.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "vox",
      displayName: "Vox",
      kind: "read",
      domains: ["vox.com"],
      logoAsset: "assets/logos/vox.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "huffpost",
      displayName: "HuffPost",
      kind: "read",
      domains: ["huffpost.com"],
      logoAsset: "assets/logos/huffpost.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "businessinsider",
      displayName: "Business Insider",
      kind: "read",
      domains: ["businessinsider.com"],
      logoAsset: "assets/logos/businessinsider.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "forbes",
      displayName: "Forbes",
      kind: "read",
      domains: ["forbes.com"],
      logoAsset: "assets/logos/forbes.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "fortune",
      displayName: "Fortune",
      kind: "read",
      domains: ["fortune.com"],
      logoAsset: "assets/logos/fortune.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "cnbc",
      displayName: "CNBC",
      kind: "read",
      domains: ["cnbc.com"],
      logoAsset: "assets/logos/cnbc.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "propublica",
      displayName: "ProPublica",
      kind: "read",
      domains: ["propublica.org"],
      logoAsset: "assets/logos/propublica.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "npr",
      displayName: "NPR",
      kind: "read",
      domains: ["npr.org"],
      logoAsset: "assets/logos/npr.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "aljazeera",
      displayName: "Al Jazeera",
      kind: "read",
      domains: ["aljazeera.com"],
      logoAsset: "assets/logos/aljazeera.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "dw",
      displayName: "DW",
      kind: "read",
      domains: ["dw.com"],
      logoAsset: "assets/logos/dw.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "yahoonews",
      displayName: "Yahoo News",
      kind: "read",
      domains: ["news.yahoo.com", "news.yahoo.co.jp"],
      logoAsset: "assets/logos/yahoonews.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "globo",
      displayName: "Globo",
      kind: "read",
      domains: ["globo.com"],
      logoAsset: "assets/logos/globo.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "independent",
      displayName: "The Independent",
      kind: "read",
      domains: ["independent.co.uk", "the-independent.com"],
      logoAsset: "assets/logos/independent.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "telegraph",
      displayName: "The Telegraph",
      kind: "read",
      domains: ["telegraph.co.uk"],
      logoAsset: "assets/logos/telegraph.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "dailymail",
      displayName: "Daily Mail",
      kind: "read",
      domains: ["dailymail.co.uk"],
      logoAsset: "assets/logos/dailymail.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "skynews",
      displayName: "Sky News",
      kind: "read",
      domains: ["news.sky.com"],
      logoAsset: "assets/logos/skynews.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "bbc",
      displayName: "BBC",
      kind: "read",
      domains: ["bbc.com", "bbc.co.uk"],
      logoAsset: "assets/logos/bbc.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "cbc",
      displayName: "CBC",
      kind: "read",
      domains: ["cbc.ca"],
      logoAsset: "assets/logos/cbc.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "abcau",
      displayName: "ABC News (Australia)",
      kind: "read",
      domains: ["abc.net.au"],
      logoAsset: "assets/logos/abcau.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "timesofindia",
      displayName: "The Times of India",
      kind: "read",
      domains: ["timesofindia.indiatimes.com"],
      logoAsset: "assets/logos/timesofindia.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "ndtv",
      displayName: "NDTV",
      kind: "read",
      domains: ["ndtv.com"],
      logoAsset: "assets/logos/ndtv.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "scmp",
      displayName: "South China Morning Post",
      kind: "read",
      domains: ["scmp.com"],
      logoAsset: "assets/logos/scmp.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "lemonde",
      displayName: "Le Monde",
      kind: "read",
      domains: ["lemonde.fr"],
      logoAsset: "assets/logos/lemonde.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "spiegel",
      displayName: "Der Spiegel",
      kind: "read",
      domains: ["spiegel.de"],
      logoAsset: "assets/logos/spiegel.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "elpais",
      displayName: "El País",
      kind: "read",
      domains: ["elpais.com"],
      logoAsset: "assets/logos/elpais.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "theverge",
      displayName: "The Verge",
      kind: "read",
      domains: ["theverge.com"],
      logoAsset: "assets/logos/theverge.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "techcrunch",
      displayName: "TechCrunch",
      kind: "read",
      domains: ["techcrunch.com"],
      logoAsset: "assets/logos/techcrunch.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "arstechnica",
      displayName: "Ars Technica",
      kind: "read",
      domains: ["arstechnica.com"],
      logoAsset: "assets/logos/arstechnica.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "wired",
      displayName: "Wired",
      kind: "read",
      domains: ["wired.com"],
      logoAsset: "assets/logos/wired.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "engadget",
      displayName: "Engadget",
      kind: "read",
      domains: ["engadget.com"],
      logoAsset: "assets/logos/engadget.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "gizmodo",
      displayName: "Gizmodo",
      kind: "read",
      domains: ["gizmodo.com"],
      logoAsset: "assets/logos/gizmodo.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "cnet",
      displayName: "CNET",
      kind: "read",
      domains: ["cnet.com"],
      logoAsset: "assets/logos/cnet.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "404media",
      displayName: "404 Media",
      kind: "read",
      domains: ["404media.co"],
      logoAsset: "assets/logos/404media.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "technologyreview",
      displayName: "MIT Technology Review",
      kind: "read",
      domains: ["technologyreview.com"],
      logoAsset: "assets/logos/technologyreview.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "slashdot",
      displayName: "Slashdot",
      kind: "read",
      domains: ["slashdot.org"],
      logoAsset: "assets/logos/slashdot.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "devto",
      displayName: "DEV Community",
      kind: "read",
      domains: ["dev.to"],
      logoAsset: "assets/logos/devto.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "stackoverflow",
      displayName: "Stack Overflow",
      kind: "read",
      domains: ["stackoverflow.com"],
      logoAsset: "assets/logos/stackoverflow.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "quora",
      displayName: "Quora",
      kind: "read",
      domains: ["quora.com"],
      logoAsset: "assets/logos/quora.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "nature",
      displayName: "Nature",
      kind: "read",
      domains: ["nature.com"],
      logoAsset: "assets/logos/nature.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "science",
      displayName: "Science",
      kind: "read",
      domains: ["science.org"],
      logoAsset: "assets/logos/science.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "scientificamerican",
      displayName: "Scientific American",
      kind: "read",
      domains: ["scientificamerican.com"],
      logoAsset: "assets/logos/scientificamerican.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "newscientist",
      displayName: "New Scientist",
      kind: "read",
      domains: ["newscientist.com"],
      logoAsset: "assets/logos/newscientist.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "quantamagazine",
      displayName: "Quanta Magazine",
      kind: "read",
      domains: ["quantamagazine.org"],
      logoAsset: "assets/logos/quantamagazine.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "nationalgeographic",
      displayName: "National Geographic",
      kind: "read",
      domains: ["nationalgeographic.com"],
      logoAsset: "assets/logos/nationalgeographic.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "smithsonianmag",
      displayName: "Smithsonian Magazine",
      kind: "read",
      domains: ["smithsonianmag.com"],
      logoAsset: "assets/logos/smithsonianmag.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "biorxiv",
      displayName: "bioRxiv",
      kind: "read",
      domains: ["biorxiv.org"],
      logoAsset: "assets/logos/biorxiv.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "rollingstone",
      displayName: "Rolling Stone",
      kind: "read",
      domains: ["rollingstone.com"],
      logoAsset: "assets/logos/rollingstone.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "variety",
      displayName: "Variety",
      kind: "read",
      domains: ["variety.com"],
      logoAsset: "assets/logos/variety.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "hollywoodreporter",
      displayName: "The Hollywood Reporter",
      kind: "read",
      domains: ["hollywoodreporter.com"],
      logoAsset: "assets/logos/hollywoodreporter.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "people",
      displayName: "People",
      kind: "read",
      domains: ["people.com"],
      logoAsset: "assets/logos/people.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "vanityfair",
      displayName: "Vanity Fair",
      kind: "read",
      domains: ["vanityfair.com"],
      logoAsset: "assets/logos/vanityfair.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "vogue",
      displayName: "Vogue",
      kind: "read",
      domains: ["vogue.com"],
      logoAsset: "assets/logos/vogue.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "vulture",
      displayName: "Vulture",
      kind: "read",
      domains: ["vulture.com"],
      logoAsset: "assets/logos/vulture.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "theringer",
      displayName: "The Ringer",
      kind: "read",
      domains: ["theringer.com"],
      logoAsset: "assets/logos/theringer.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "pitchfork",
      displayName: "Pitchfork",
      kind: "read",
      domains: ["pitchfork.com"],
      logoAsset: "assets/logos/pitchfork.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "billboard",
      displayName: "Billboard",
      kind: "read",
      domains: ["billboard.com"],
      logoAsset: "assets/logos/billboard.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "rottentomatoes",
      displayName: "Rotten Tomatoes",
      kind: "read",
      domains: ["rottentomatoes.com"],
      logoAsset: "assets/logos/rottentomatoes.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "imdb",
      displayName: "IMDb",
      kind: "read",
      domains: ["imdb.com"],
      logoAsset: "assets/logos/imdb.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "letterboxd",
      displayName: "Letterboxd",
      kind: "read",
      domains: ["letterboxd.com", "boxd.it"],
      logoAsset: "assets/logos/letterboxd.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "metacritic",
      displayName: "Metacritic",
      kind: "read",
      domains: ["metacritic.com"],
      logoAsset: "assets/logos/metacritic.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "ign",
      displayName: "IGN",
      kind: "read",
      domains: ["ign.com"],
      logoAsset: "assets/logos/ign.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "kotaku",
      displayName: "Kotaku",
      kind: "read",
      domains: ["kotaku.com"],
      logoAsset: "assets/logos/kotaku.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "polygon",
      displayName: "Polygon",
      kind: "read",
      domains: ["polygon.com"],
      logoAsset: "assets/logos/polygon.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "pcgamer",
      displayName: "PC Gamer",
      kind: "read",
      domains: ["pcgamer.com"],
      logoAsset: "assets/logos/pcgamer.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "theathletic",
      displayName: "The Athletic",
      kind: "read",
      domains: ["theathletic.com"],
      logoAsset: "assets/logos/theathletic.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "si",
      displayName: "Sports Illustrated",
      kind: "read",
      domains: ["si.com"],
      logoAsset: "assets/logos/si.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "bleacherreport",
      displayName: "Bleacher Report",
      kind: "read",
      domains: ["bleacherreport.com"],
      logoAsset: "assets/logos/bleacherreport.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "skysports",
      displayName: "Sky Sports",
      kind: "read",
      domains: ["skysports.com"],
      logoAsset: "assets/logos/skysports.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "bonappetit",
      displayName: "Bon Appétit",
      kind: "read",
      domains: ["bonappetit.com"],
      logoAsset: "assets/logos/bonappetit.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "seriouseats",
      displayName: "Serious Eats",
      kind: "read",
      domains: ["seriouseats.com"],
      logoAsset: "assets/logos/seriouseats.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "allrecipes",
      displayName: "Allrecipes",
      kind: "read",
      domains: ["allrecipes.com"],
      logoAsset: "assets/logos/allrecipes.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "eater",
      displayName: "Eater",
      kind: "read",
      domains: ["eater.com"],
      logoAsset: "assets/logos/eater.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "atlasobscura",
      displayName: "Atlas Obscura",
      kind: "read",
      domains: ["atlasobscura.com"],
      logoAsset: "assets/logos/atlasobscura.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "wikihow",
      displayName: "wikiHow",
      kind: "read",
      domains: ["wikihow.com"],
      logoAsset: "assets/logos/wikihow.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "royalroad",
      displayName: "Royal Road",
      kind: "read",
      domains: ["royalroad.com"],
      logoAsset: "assets/logos/royalroad.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "fanfictionnet",
      displayName: "FanFiction.Net",
      kind: "read",
      domains: ["fanfiction.net"],
      logoAsset: "assets/logos/fanfictionnet.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "mangaplus",
      displayName: "MANGA Plus",
      kind: "read",
      domains: ["mangaplus.shueisha.co.jp"],
      logoAsset: "assets/logos/mangaplus.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "kobo",
      displayName: "Kobo",
      kind: "read",
      domains: ["kobo.com"],
      logoAsset: "assets/logos/kobo.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "gutenberg",
      displayName: "Project Gutenberg",
      kind: "read",
      domains: ["gutenberg.org"],
      logoAsset: "assets/logos/gutenberg.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "internetarchive",
      displayName: "Internet Archive",
      kind: "read",
      domains: ["archive.org"],
      logoAsset: "assets/logos/internetarchive.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "everand",
      displayName: "Everand",
      kind: "read",
      domains: ["everand.com", "scribd.com"],
      logoAsset: "assets/logos/everand.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "storygraph",
      displayName: "The StoryGraph",
      kind: "read",
      domains: ["thestorygraph.com"],
      logoAsset: "assets/logos/storygraph.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "britannica",
      displayName: "Britannica",
      kind: "read",
      domains: ["britannica.com"],
      logoAsset: "assets/logos/britannica.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "bluesky",
      displayName: "Bluesky",
      kind: "read",
      domains: ["bsky.app"],
      logoAsset: "assets/logos/bluesky.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "threads",
      displayName: "Threads",
      kind: "read",
      domains: ["threads.com", "threads.net"],
      logoAsset: "assets/logos/threads.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "tumblr",
      displayName: "Tumblr",
      kind: "read",
      domains: ["tumblr.com"],
      logoAsset: "assets/logos/tumblr.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "mastodon",
      displayName: "Mastodon",
      kind: "read",
      domains: ["mastodon.social"],
      logoAsset: "assets/logos/mastodon.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "facebook",
      displayName: "Facebook",
      kind: "read",
      domains: ["facebook.com"],
      logoAsset: "assets/logos/facebook.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "pinterest",
      displayName: "Pinterest",
      kind: "read",
      domains: ["pinterest.com", "pin.it"],
      logoAsset: "assets/logos/pinterest.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "theonion",
      displayName: "The Onion",
      kind: "read",
      domains: ["theonion.com"],
      logoAsset: "assets/logos/theonion.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "xkcd",
      displayName: "xkcd",
      kind: "read",
      domains: ["xkcd.com"],
      logoAsset: "assets/logos/xkcd.svg",
      resolver: { type: "opengraph" },
      openAction: "browser"
    },
    {
      id: "genius",
      displayName: "Genius",
      kind: "read",
      domains: ["genius.com"],
      logoAsset: "assets/logos/genius.svg",
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
