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
  { url: "https://redd.it/abc123", id: "reddit" }
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
  var validOpenActions = ["browser", "mpv", "spotify"]
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

test("all() returns the full 15-entry table with unique ids", function() {
  var entries = Providers.all()
  assert.strictEqual(entries.length, 15)
  var ids = entries.map(function(e) { return e.id })
  var unique = ids.filter(function(id, i) { return ids.indexOf(id) === i })
  assert.strictEqual(unique.length, ids.length)
})

test("authConfig returns spotify's OAuth block", function() {
  var auth = Providers.authConfig("spotify")
  assert.strictEqual(auth.authEndpoint, "https://accounts.spotify.com/authorize")
  assert.strictEqual(auth.tokenEndpoint, "https://accounts.spotify.com/api/token")
  assert.deepStrictEqual(auth.scopes, [])
  assert.strictEqual(auth.clientId, "")
  assert.strictEqual(auth.redirectPort, 41419)
  assert.strictEqual(auth.redirectPath, "/callback")
})

test("authConfig returns null for providers with no auth story and for unknown ids", function() {
  assert.strictEqual(Providers.authConfig("youtube"), null)
  assert.strictEqual(Providers.authConfig("not-a-real-provider"), null)
})

// Pinned against accidental drift: the Spotify app registration on
// accounts.spotify.com has this exact redirect URI on file, so changing
// either value here breaks OAuth for every existing install.
test("spotify registry entry pins redirectPort and redirectPath", function() {
  var entry = Providers.match("https://open.spotify.com/track/x")
  assert.strictEqual(entry.auth.redirectPort, 41419)
  assert.strictEqual(entry.auth.redirectPath, "/callback")
})
