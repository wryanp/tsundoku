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
  { url: "https://read.amazon.com/?asin=B00XABC123", id: "kindle" }
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

test("all() returns the full 42-entry table with unique ids", function() {
  var entries = Providers.all()
  assert.strictEqual(entries.length, 42)
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
