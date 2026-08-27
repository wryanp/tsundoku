var test = require("node:test")
var assert = require("node:assert")
var Providers = require("../Providers.js")

// One realistic full URL per domain, exercising every entry's every domain.
var domainCases = [
  { url: "https://youtu.be/dQw4w9WgXcQ", id: "youtube" },
  { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", id: "youtube" },
  { url: "https://music.youtube.com/watch?v=abc123", id: "youtubemusic" },
  { url: "https://vimeo.com/76979871", id: "vimeo" },
  { url: "https://www.twitch.tv/shroud", id: "twitch" },
  { url: "https://www.tiktok.com/@user/video/123456", id: "tiktok" },
  { url: "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC", id: "spotify" },
  { url: "https://www.spotify.com/us/", id: "spotify" },
  { url: "https://soundcloud.com/artist/track-name", id: "soundcloud" },
  { url: "https://artist.bandcamp.com/album/x", id: "bandcamp" },
  { url: "https://podcasts.apple.com/us/podcast/show/id123", id: "applepodcasts" },
  { url: "https://medium.com/@author/post-title-abc123", id: "medium" },
  { url: "https://someblog.substack.com/p/post", id: "substack" },
  { url: "https://arxiv.org/abs/2301.00001", id: "arxiv" },
  { url: "https://en.wikipedia.org/wiki/Tsundoku", id: "wikipedia" },
  { url: "https://news.ycombinator.com/item?id=123456", id: "hackernews" },
  { url: "https://www.reddit.com/r/programming/comments/abc/title/", id: "reddit" },
  { url: "https://redd.it/abc123", id: "reddit" },

  // Watch: streaming video services
  { url: "https://www.netflix.com/title/80057281", id: "netflix" },
  { url: "https://www.primevideo.com/detail/0TNSHZKPXY1RTDG5XU6ABC123/", id: "primevideo" },
  { url: "https://www.disneyplus.com/movies/example/abc123", id: "disneyplus" },
  { url: "https://www.hbomax.com/show/example/abc123", id: "hbomax" },
  { url: "https://www.max.com/show/example/abc123", id: "hbomax" },
  { url: "https://www.hulu.com/watch/abc-123-def", id: "hulu" },
  { url: "https://tv.apple.com/us/movie/example/umc.cmc.abc123", id: "appletv" },
  { url: "https://www.paramountplus.com/shows/example/video/abc123/", id: "paramountplus" },
  { url: "https://www.peacocktv.com/watch/asset/example/abc123", id: "peacock" },
  { url: "https://www.crunchyroll.com/watch/GABC12345/example-episode", id: "crunchyroll" },
  { url: "https://tubitv.com/movies/123456/example-movie", id: "tubi" },
  { url: "https://www.dailymotion.com/video/x8abc12", id: "dailymotion" },
  { url: "https://dai.ly/x8abc12", id: "dailymotion" },

  // Listen: music, radio, and audiobook services
  { url: "https://music.apple.com/us/album/example/1234567890", id: "applemusic" },
  { url: "https://music.amazon.com/albums/B00XABC123", id: "amazonmusic" },
  { url: "https://www.pandora.com/artist/example/album/example/ALbcdEFghi12345", id: "pandora" },
  { url: "https://www.iheart.com/podcast/123-example-show-12345678/", id: "iheartradio" },
  { url: "https://www.audible.com/pd/Example-Book-Audiobook/B0ABC12XYZ", id: "audible" },
  { url: "https://www.deezer.com/us/track/123456789", id: "deezer" },
  { url: "https://tidal.com/browse/track/123456789", id: "tidal" },
  { url: "https://pocketcasts.com/podcasts/abc123-def456", id: "pocketcasts" },
  { url: "https://pca.st/abc123", id: "pocketcasts" },

  // Read: articles, news, and books
  { url: "https://x.com/user/status/123456789012345678", id: "x" },
  { url: "https://twitter.com/user/status/123456789012345678", id: "x" },
  { url: "https://www.nytimes.com/2026/08/25/world/example-article.html", id: "nytimes" },
  { url: "https://www.theguardian.com/world/2026/aug/25/example-article", id: "theguardian" },
  { url: "https://www.goodreads.com/book/show/123456.Example_Title", id: "goodreads" },
  { url: "https://www.webtoons.com/en/genre/title/episode-1/viewer?title_no=123", id: "webtoon" },
  { url: "https://www.wattpad.com/story/123456789-example-story", id: "wattpad" },
  { url: "https://archiveofourown.org/works/12345678", id: "archiveofourown" },
  { url: "https://github.com/simple-icons/simple-icons", id: "github" },
  { url: "https://read.amazon.com/?asin=B00XABC123", id: "kindle" },

  // -- Watch: live TV, sports, and more streaming platforms
  { url: "https://pluto.tv/watch/example-123", id: "plutotv" },
  { url: "https://therokuchannel.roku.com/watch/example-123", id: "rokuchannel" },
  { url: "https://plex.tv/watch/example-123", id: "plex" },
  { url: "https://sling.com/watch/example-123", id: "slingtv" },
  { url: "https://fubo.tv/watch/example-123", id: "fubo" },
  { url: "https://espn.com/watch/example-123", id: "espn" },
  { url: "https://dazn.com/watch/example-123", id: "dazn" },
  { url: "https://nba.com/watch/example-123", id: "nba" },
  { url: "https://nfl.com/watch/example-123", id: "nfl" },
  { url: "https://mlb.com/watch/example-123", id: "mlb" },
  { url: "https://nhl.com/watch/example-123", id: "nhl" },
  { url: "https://formula1.com/watch/example-123", id: "formula1" },
  { url: "https://nebula.tv/watch/example-123", id: "nebula" },
  { url: "https://curiositystream.com/watch/example-123", id: "curiositystream" },
  { url: "https://mubi.com/watch/example-123", id: "mubi" },
  { url: "https://criterionchannel.com/watch/example-123", id: "criterionchannel" },
  { url: "https://shudder.com/watch/example-123", id: "shudder" },
  { url: "https://amcplus.com/watch/example-123", id: "amcplus" },
  { url: "https://starz.com/watch/example-123", id: "starz" },
  { url: "https://britbox.com/watch/example-123", id: "britbox" },
  { url: "https://discoveryplus.com/watch/example-123", id: "discoveryplus" },
  { url: "https://viki.com/watch/example-123", id: "viki" },
  { url: "https://iqiyi.com/watch/example-123", id: "iqiyi" },
  { url: "https://iq.com/watch/example-123", id: "iqiyi" },
  { url: "https://bilibili.com/watch/example-123", id: "bilibili" },
  { url: "https://b23.tv/watch/example-123", id: "bilibili" },
  { url: "https://nicovideo.jp/watch/example-123", id: "niconico" },
  { url: "https://hotstar.com/watch/example-123", id: "hotstar" },
  { url: "https://zee5.com/watch/example-123", id: "zee5" },
  { url: "https://pbs.org/watch/example-123", id: "pbs" },
  { url: "https://itv.com/watch/example-123", id: "itvx" },
  { url: "https://ted.com/watch/example-123", id: "ted" },
  { url: "https://vevo.com/watch/example-123", id: "vevo" },
  { url: "https://dropout.tv/watch/example-123", id: "dropout" },
  { url: "https://instagram.com/watch/example-123", id: "instagram" },
  // -- Listen: more music and podcast platforms
  { url: "https://qobuz.com/shows/example-episode", id: "qobuz" },
  { url: "https://napster.com/shows/example-episode", id: "napster" },
  { url: "https://overcast.fm/shows/example-episode", id: "overcast" },
  { url: "https://castbox.fm/shows/example-episode", id: "castbox" },
  { url: "https://podbean.com/shows/example-episode", id: "podbean" },
  { url: "https://acast.com/shows/example-episode", id: "acast" },
  { url: "https://tunein.com/shows/example-episode", id: "tunein" },
  { url: "https://audiomack.com/shows/example-episode", id: "audiomack" },
  { url: "https://mixcloud.com/shows/example-episode", id: "mixcloud" },
  { url: "https://last.fm/shows/example-episode", id: "lastfm" },
  { url: "https://jiosaavn.com/shows/example-episode", id: "jiosaavn" },
  { url: "https://anghami.com/shows/example-episode", id: "anghami" },
  { url: "https://librivox.org/shows/example-episode", id: "librivox" },
  { url: "https://shazam.com/shows/example-episode", id: "shazam" },
  // -- Read: news, magazines, science, culture, and books
  { url: "https://washingtonpost.com/2026/08/example-article", id: "washingtonpost" },
  { url: "https://wapo.st/2026/08/example-article", id: "washingtonpost" },
  { url: "https://wsj.com/2026/08/example-article", id: "wsj" },
  { url: "https://bloomberg.com/2026/08/example-article", id: "bloomberg" },
  { url: "https://reuters.com/2026/08/example-article", id: "reuters" },
  { url: "https://apnews.com/2026/08/example-article", id: "apnews" },
  { url: "https://cnn.com/2026/08/example-article", id: "cnn" },
  { url: "https://foxnews.com/2026/08/example-article", id: "foxnews" },
  { url: "https://nbcnews.com/2026/08/example-article", id: "nbcnews" },
  { url: "https://abcnews.go.com/2026/08/example-article", id: "abcnews" },
  { url: "https://cbsnews.com/2026/08/example-article", id: "cbsnews" },
  { url: "https://usatoday.com/2026/08/example-article", id: "usatoday" },
  { url: "https://latimes.com/2026/08/example-article", id: "latimes" },
  { url: "https://theatlantic.com/2026/08/example-article", id: "theatlantic" },
  { url: "https://newyorker.com/2026/08/example-article", id: "newyorker" },
  { url: "https://economist.com/2026/08/example-article", id: "economist" },
  { url: "https://ft.com/2026/08/example-article", id: "ft" },
  { url: "https://time.com/2026/08/example-article", id: "time" },
  { url: "https://newsweek.com/2026/08/example-article", id: "newsweek" },
  { url: "https://politico.com/2026/08/example-article", id: "politico" },
  { url: "https://politico.eu/2026/08/example-article", id: "politico" },
  { url: "https://axios.com/2026/08/example-article", id: "axios" },
  { url: "https://vox.com/2026/08/example-article", id: "vox" },
  { url: "https://huffpost.com/2026/08/example-article", id: "huffpost" },
  { url: "https://businessinsider.com/2026/08/example-article", id: "businessinsider" },
  { url: "https://forbes.com/2026/08/example-article", id: "forbes" },
  { url: "https://fortune.com/2026/08/example-article", id: "fortune" },
  { url: "https://cnbc.com/2026/08/example-article", id: "cnbc" },
  { url: "https://propublica.org/2026/08/example-article", id: "propublica" },
  { url: "https://npr.org/2026/08/example-article", id: "npr" },
  { url: "https://aljazeera.com/2026/08/example-article", id: "aljazeera" },
  { url: "https://dw.com/2026/08/example-article", id: "dw" },
  { url: "https://news.yahoo.com/2026/08/example-article", id: "yahoonews" },
  { url: "https://news.yahoo.co.jp/2026/08/example-article", id: "yahoonews" },
  { url: "https://globo.com/2026/08/example-article", id: "globo" },
  { url: "https://independent.co.uk/2026/08/example-article", id: "independent" },
  { url: "https://the-independent.com/2026/08/example-article", id: "independent" },
  { url: "https://telegraph.co.uk/2026/08/example-article", id: "telegraph" },
  { url: "https://dailymail.co.uk/2026/08/example-article", id: "dailymail" },
  { url: "https://news.sky.com/2026/08/example-article", id: "skynews" },
  { url: "https://bbc.com/2026/08/example-article", id: "bbc" },
  { url: "https://bbc.co.uk/2026/08/example-article", id: "bbc" },
  { url: "https://cbc.ca/2026/08/example-article", id: "cbc" },
  { url: "https://abc.net.au/2026/08/example-article", id: "abcau" },
  { url: "https://timesofindia.indiatimes.com/2026/08/example-article", id: "timesofindia" },
  { url: "https://ndtv.com/2026/08/example-article", id: "ndtv" },
  { url: "https://scmp.com/2026/08/example-article", id: "scmp" },
  { url: "https://lemonde.fr/2026/08/example-article", id: "lemonde" },
  { url: "https://spiegel.de/2026/08/example-article", id: "spiegel" },
  { url: "https://elpais.com/2026/08/example-article", id: "elpais" },
  { url: "https://theverge.com/2026/08/example-article", id: "theverge" },
  { url: "https://techcrunch.com/2026/08/example-article", id: "techcrunch" },
  { url: "https://arstechnica.com/2026/08/example-article", id: "arstechnica" },
  { url: "https://wired.com/2026/08/example-article", id: "wired" },
  { url: "https://engadget.com/2026/08/example-article", id: "engadget" },
  { url: "https://gizmodo.com/2026/08/example-article", id: "gizmodo" },
  { url: "https://cnet.com/2026/08/example-article", id: "cnet" },
  { url: "https://404media.co/2026/08/example-article", id: "404media" },
  { url: "https://technologyreview.com/2026/08/example-article", id: "technologyreview" },
  { url: "https://slashdot.org/2026/08/example-article", id: "slashdot" },
  { url: "https://dev.to/2026/08/example-article", id: "devto" },
  { url: "https://stackoverflow.com/2026/08/example-article", id: "stackoverflow" },
  { url: "https://quora.com/2026/08/example-article", id: "quora" },
  { url: "https://nature.com/2026/08/example-article", id: "nature" },
  { url: "https://science.org/2026/08/example-article", id: "science" },
  { url: "https://scientificamerican.com/2026/08/example-article", id: "scientificamerican" },
  { url: "https://newscientist.com/2026/08/example-article", id: "newscientist" },
  { url: "https://quantamagazine.org/2026/08/example-article", id: "quantamagazine" },
  { url: "https://nationalgeographic.com/2026/08/example-article", id: "nationalgeographic" },
  { url: "https://smithsonianmag.com/2026/08/example-article", id: "smithsonianmag" },
  { url: "https://biorxiv.org/2026/08/example-article", id: "biorxiv" },
  { url: "https://rollingstone.com/2026/08/example-article", id: "rollingstone" },
  { url: "https://variety.com/2026/08/example-article", id: "variety" },
  { url: "https://hollywoodreporter.com/2026/08/example-article", id: "hollywoodreporter" },
  { url: "https://people.com/2026/08/example-article", id: "people" },
  { url: "https://vanityfair.com/2026/08/example-article", id: "vanityfair" },
  { url: "https://vogue.com/2026/08/example-article", id: "vogue" },
  { url: "https://vulture.com/2026/08/example-article", id: "vulture" },
  { url: "https://theringer.com/2026/08/example-article", id: "theringer" },
  { url: "https://pitchfork.com/2026/08/example-article", id: "pitchfork" },
  { url: "https://billboard.com/2026/08/example-article", id: "billboard" },
  { url: "https://rottentomatoes.com/2026/08/example-article", id: "rottentomatoes" },
  { url: "https://imdb.com/2026/08/example-article", id: "imdb" },
  { url: "https://letterboxd.com/2026/08/example-article", id: "letterboxd" },
  { url: "https://boxd.it/2026/08/example-article", id: "letterboxd" },
  { url: "https://metacritic.com/2026/08/example-article", id: "metacritic" },
  { url: "https://ign.com/2026/08/example-article", id: "ign" },
  { url: "https://kotaku.com/2026/08/example-article", id: "kotaku" },
  { url: "https://polygon.com/2026/08/example-article", id: "polygon" },
  { url: "https://pcgamer.com/2026/08/example-article", id: "pcgamer" },
  { url: "https://theathletic.com/2026/08/example-article", id: "theathletic" },
  { url: "https://si.com/2026/08/example-article", id: "si" },
  { url: "https://bleacherreport.com/2026/08/example-article", id: "bleacherreport" },
  { url: "https://skysports.com/2026/08/example-article", id: "skysports" },
  { url: "https://bonappetit.com/2026/08/example-article", id: "bonappetit" },
  { url: "https://seriouseats.com/2026/08/example-article", id: "seriouseats" },
  { url: "https://allrecipes.com/2026/08/example-article", id: "allrecipes" },
  { url: "https://eater.com/2026/08/example-article", id: "eater" },
  { url: "https://atlasobscura.com/2026/08/example-article", id: "atlasobscura" },
  { url: "https://wikihow.com/2026/08/example-article", id: "wikihow" },
  { url: "https://royalroad.com/2026/08/example-article", id: "royalroad" },
  { url: "https://fanfiction.net/2026/08/example-article", id: "fanfictionnet" },
  { url: "https://mangaplus.shueisha.co.jp/2026/08/example-article", id: "mangaplus" },
  { url: "https://kobo.com/2026/08/example-article", id: "kobo" },
  { url: "https://gutenberg.org/2026/08/example-article", id: "gutenberg" },
  { url: "https://archive.org/2026/08/example-article", id: "internetarchive" },
  { url: "https://everand.com/2026/08/example-article", id: "everand" },
  { url: "https://scribd.com/2026/08/example-article", id: "everand" },
  { url: "https://thestorygraph.com/2026/08/example-article", id: "storygraph" },
  { url: "https://britannica.com/2026/08/example-article", id: "britannica" },
  { url: "https://bsky.app/2026/08/example-article", id: "bluesky" },
  { url: "https://threads.com/2026/08/example-article", id: "threads" },
  { url: "https://threads.net/2026/08/example-article", id: "threads" },
  { url: "https://tumblr.com/2026/08/example-article", id: "tumblr" },
  { url: "https://mastodon.social/2026/08/example-article", id: "mastodon" },
  { url: "https://facebook.com/2026/08/example-article", id: "facebook" },
  { url: "https://pinterest.com/2026/08/example-article", id: "pinterest" },
  { url: "https://pin.it/2026/08/example-article", id: "pinterest" },
  { url: "https://theonion.com/2026/08/example-article", id: "theonion" },
  { url: "https://xkcd.com/2026/08/example-article", id: "xkcd" },
  { url: "https://genius.com/2026/08/example-article", id: "genius" }
]

test("every provider domain resolves via a realistic URL", function() {
  domainCases.forEach(function(c) {
    var entry = Providers.match(c.url)
    assert.ok(entry, "expected a match for " + c.url)
    assert.strictEqual(entry.id, c.id, c.url + " should match " + c.id + " but matched " + (entry && entry.id))
  })
})

test("all() covers every domain exactly once across cases", function() {
  var entries = Providers.all()
  var allDomains = []
  entries.forEach(function(e) { allDomains = allDomains.concat(e.domains) })
  var testedDomains = {}
  domainCases.forEach(function(c) {
    var host = Providers.hostFromUrl(c.url)
    testedDomains[host] = true
  })
  // sanity: every registry domain has a corresponding tested host (exact or subdomain)
  allDomains.forEach(function(domain) {
    var covered = Object.keys(testedDomains).some(function(host) {
      return host === domain || host.slice(-(domain.length + 1)) === "." + domain
    })
    assert.ok(covered, "domain " + domain + " has no test coverage")
  })
})

test("music.youtube.com matches youtubemusic, not youtube (exact beats suffix)", function() {
  var entry = Providers.match("https://music.youtube.com/watch?v=x")
  assert.strictEqual(entry.id, "youtubemusic")
})

test("www.youtube.com strips www and matches youtube", function() {
  var entry = Providers.match("https://www.youtube.com/watch?v=x")
  assert.strictEqual(entry.id, "youtube")
})

test("unmatched domain returns null match and read guessKind", function() {
  assert.strictEqual(Providers.match("https://example.com/a"), null)
  assert.strictEqual(Providers.guessKind("https://example.com/a"), "read")
})

test("hostFromUrl handles port", function() {
  assert.strictEqual(Providers.hostFromUrl("https://example.com:8080/path"), "example.com")
})

test("hostFromUrl handles no-path URL", function() {
  assert.strictEqual(Providers.hostFromUrl("https://example.com"), "example.com")
})

test("hostFromUrl returns empty string for non-URL input", function() {
  assert.strictEqual(Providers.hostFromUrl("not a url"), "")
  assert.strictEqual(Providers.hostFromUrl(""), "")
  assert.strictEqual(Providers.hostFromUrl(null), "")
  assert.strictEqual(Providers.hostFromUrl(undefined), "")
})

test("hostFromUrl strips userinfo", function() {
  assert.strictEqual(Providers.hostFromUrl("https://user:pass@example.com/path"), "example.com")
})

test("guessKind returns the matched entry's kind", function() {
  assert.strictEqual(Providers.guessKind("https://youtu.be/x"), "watch")
  assert.strictEqual(Providers.guessKind("https://open.spotify.com/track/x"), "listen")
  assert.strictEqual(Providers.guessKind("https://arxiv.org/abs/1"), "read")
})

test("every entry has all required fields with valid kind and openAction", function() {
  var validKinds = ["watch", "listen", "read"]
  var validOpenActions = ["browser", "mpv"]
  Providers.all().forEach(function(entry) {
    assert.strictEqual(typeof entry.id, "string")
    assert.ok(entry.id.length > 0)
    assert.strictEqual(typeof entry.displayName, "string")
    assert.ok(entry.displayName.length > 0)
    assert.ok(validKinds.indexOf(entry.kind) >= 0, entry.id + " has invalid kind " + entry.kind)
    assert.ok(Array.isArray(entry.domains))
    assert.ok(entry.domains.length > 0)
    assert.strictEqual(entry.logoAsset, "assets/logos/" + entry.id + ".svg")
    assert.ok(validOpenActions.indexOf(entry.openAction) >= 0, entry.id + " has invalid openAction " + entry.openAction)
    assert.ok(entry.resolver && (entry.resolver.type === "oembed" || entry.resolver.type === "opengraph"))
    if (entry.resolver.type === "oembed") {
      assert.strictEqual(typeof entry.resolver.endpoint, "string")
      assert.ok(entry.resolver.endpoint.indexOf("{url}") >= 0, entry.id + " oembed endpoint missing {url} template")
    }
  })
})

test("all() returns the full 202-entry table with unique ids", function() {
  var entries = Providers.all()
  assert.strictEqual(entries.length, 202)
  var ids = entries.map(function(e) { return e.id })
  var unique = ids.filter(function(id, i) { return ids.indexOf(id) === i })
  assert.strictEqual(unique.length, ids.length)
})

test("subdomain-exact apple/amazon entries match their own subdomain, not each other or null", function() {
  var appletv = Providers.match("https://tv.apple.com/us/movie/example/umc.cmc.abc123")
  assert.ok(appletv)
  assert.strictEqual(appletv.id, "appletv")

  var applemusic = Providers.match("https://music.apple.com/us/album/example/1234567890")
  assert.ok(applemusic)
  assert.strictEqual(applemusic.id, "applemusic")

  var hbomax = Providers.match("https://www.max.com/show/example/abc123")
  assert.ok(hbomax)
  assert.strictEqual(hbomax.id, "hbomax")
})
