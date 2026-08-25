var test = require("node:test")
var assert = require("node:assert")
var Providers = require("../Providers.js")

test("isDirectAudioUrl matches a plain .mp3", function() {
  assert.strictEqual(Providers.isDirectAudioUrl("https://example.com/song.mp3"), true)
})

test("isDirectAudioUrl is case-insensitive", function() {
  assert.strictEqual(Providers.isDirectAudioUrl("https://example.com/song.MP3"), true)
})

test("isDirectAudioUrl ignores query string and fragment", function() {
  assert.strictEqual(Providers.isDirectAudioUrl("https://example.com/song.mp3?x=1#t=10"), true)
})

test("isDirectAudioUrl rejects a non-audio page", function() {
  assert.strictEqual(Providers.isDirectAudioUrl("https://example.com/page.html"), false)
})

test("isDirectAudioUrl rejects a non-URL string", function() {
  assert.strictEqual(Providers.isDirectAudioUrl("not a url"), false)
})

test("spotifyUri converts a track URL", function() {
  assert.strictEqual(
    Providers.spotifyUri("https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC"),
    "spotify:track:4uLU6hMCjMI75M1A2tKUQC"
  )
})

test("spotifyUri handles an intl-xx locale segment", function() {
  assert.strictEqual(
    Providers.spotifyUri("https://open.spotify.com/intl-pt/track/4uLU6hMCjMI75M1A2tKUQC"),
    "spotify:track:4uLU6hMCjMI75M1A2tKUQC"
  )
})

test("spotifyUri strips a ?si= query", function() {
  assert.strictEqual(
    Providers.spotifyUri("https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC?si=abc123"),
    "spotify:track:4uLU6hMCjMI75M1A2tKUQC"
  )
})

test("spotifyUri handles album, episode, and show types", function() {
  assert.strictEqual(
    Providers.spotifyUri("https://open.spotify.com/album/6vV5UrXcfyQD1wu4Qo2I9K"),
    "spotify:album:6vV5UrXcfyQD1wu4Qo2I9K"
  )
  assert.strictEqual(
    Providers.spotifyUri("https://open.spotify.com/episode/512ojhOuo1ktJprKbVcKyQ"),
    "spotify:episode:512ojhOuo1ktJprKbVcKyQ"
  )
  assert.strictEqual(
    Providers.spotifyUri("https://open.spotify.com/show/4rOoJ6Egrf8K2IrywzwOMk"),
    "spotify:show:4rOoJ6Egrf8K2IrywzwOMk"
  )
})

test("spotifyUri returns null for a non-spotify host", function() {
  assert.strictEqual(Providers.spotifyUri("https://example.com/track/123"), null)
})

test("spotifyUri returns null for a bare open.spotify.com URL", function() {
  assert.strictEqual(Providers.spotifyUri("https://open.spotify.com/"), null)
})

test("spotifyUri returns null for an unknown type", function() {
  assert.strictEqual(Providers.spotifyUri("https://open.spotify.com/foo/123"), null)
})

test("openPlan: youtube with full caps uses mpv", function() {
  var plan = Providers.openPlan("https://youtu.be/dQw4w9WgXcQ", "youtube", { mpv: true, ytdlp: true, spotifyHandler: true })
  assert.deepStrictEqual(plan, { method: "mpv", command: ["mpv", "https://youtu.be/dQw4w9WgXcQ"] })
})

test("openPlan: youtube with mpv but no ytdlp falls back to browser", function() {
  var url = "https://youtu.be/dQw4w9WgXcQ"
  var plan = Providers.openPlan(url, "youtube", { mpv: true, ytdlp: false })
  assert.deepStrictEqual(plan, { method: "browser", command: ["xdg-open", url] })
})

test("openPlan: youtube with no caps falls back to browser", function() {
  var url = "https://youtu.be/dQw4w9WgXcQ"
  var plan = Providers.openPlan(url, "youtube", {})
  assert.deepStrictEqual(plan, { method: "browser", command: ["xdg-open", url] })
})

test("openPlan: vimeo with full caps uses mpv", function() {
  var url = "https://vimeo.com/76979871"
  var plan = Providers.openPlan(url, "vimeo", { mpv: true, ytdlp: true })
  assert.deepStrictEqual(plan, { method: "mpv", command: ["mpv", url] })
})

test("openPlan: twitch with full caps uses mpv", function() {
  var url = "https://www.twitch.tv/shroud"
  var plan = Providers.openPlan(url, "twitch", { mpv: true, ytdlp: true })
  assert.deepStrictEqual(plan, { method: "mpv", command: ["mpv", url] })
})

test("openPlan: tiktok with full caps still opens in browser (mpv handoff excludes it)", function() {
  var url = "https://www.tiktok.com/@user/video/123456"
  var plan = Providers.openPlan(url, "tiktok", { mpv: true, ytdlp: true, spotifyHandler: true })
  assert.deepStrictEqual(plan, { method: "browser", command: ["xdg-open", url] })
})

test("openPlan: spotify track with handler uses the spotify uri", function() {
  var url = "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC"
  var plan = Providers.openPlan(url, "spotify", { spotifyHandler: true })
  assert.deepStrictEqual(plan, { method: "spotify", command: ["xdg-open", "spotify:track:4uLU6hMCjMI75M1A2tKUQC"] })
})

test("openPlan: spotify without handler falls back to browser", function() {
  var url = "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC"
  var plan = Providers.openPlan(url, "spotify", { spotifyHandler: false })
  assert.deepStrictEqual(plan, { method: "browser", command: ["xdg-open", url] })
})

test("openPlan: spotify with handler but an unconvertible URL falls back to browser", function() {
  var url = "https://open.spotify.com/"
  var plan = Providers.openPlan(url, "spotify", { spotifyHandler: true })
  assert.deepStrictEqual(plan, { method: "browser", command: ["xdg-open", url] })
})

test("openPlan: a direct .mp3 with only mpv true uses mpv without needing ytdlp", function() {
  var url = "https://example.com/song.mp3"
  var plan = Providers.openPlan(url, "example.com", { mpv: true })
  assert.deepStrictEqual(plan, { method: "mpv", command: ["mpv", url] })
})

test("openPlan: a direct .mp3 with no caps falls back to browser", function() {
  var url = "https://example.com/song.mp3"
  var plan = Providers.openPlan(url, "example.com", {})
  assert.deepStrictEqual(plan, { method: "browser", command: ["xdg-open", url] })
})

test("openPlan: unknown provider id (raw host) falls back to browser", function() {
  var url = "https://example.com/page"
  var plan = Providers.openPlan(url, "example.com", { mpv: true, ytdlp: true, spotifyHandler: true })
  assert.deepStrictEqual(plan, { method: "browser", command: ["xdg-open", url] })
})

test("openPlan: undefined caps falls back to browser", function() {
  var url = "https://youtu.be/dQw4w9WgXcQ"
  var plan = Providers.openPlan(url, "youtube", undefined)
  assert.deepStrictEqual(plan, { method: "browser", command: ["xdg-open", url] })
})
