var test = require("node:test")
var assert = require("node:assert")
var path = require("node:path")
var execFileSync = require("node:child_process").execFileSync

var SCRIPT = path.join(__dirname, "..", "scripts", "tsundoku-resolve")

// Sources the script in library mode (TSUNDOKU_RESOLVE_LIB=1 stops it
// before arg parsing) and calls one predicate. Prints "yes" or "no" so the
// harness never depends on exit-code plumbing through execFileSync.
function predicate(fn, arg) {
  return execFileSync("bash", [
    "-c",
    'TSUNDOKU_RESOLVE_LIB=1 source "$0" && ' + fn + ' "$1" && echo yes || echo no',
    SCRIPT,
    arg
  ]).toString().trim()
}

test("ip_is_public rejects loopback, private, link-local, and reserved ranges", function() {
  var blocked = [
    "127.0.0.1", "127.255.255.255",
    "10.0.0.1", "172.16.0.1", "172.31.255.255", "192.168.1.1",
    "169.254.169.254",
    "100.64.0.1", "100.127.255.255",
    "0.0.0.0", "224.0.0.1", "255.255.255.255",
    "::", "::1", "fe80::1", "fc00::1", "fd12:3456::1",
    "::ffff:127.0.0.1", "::ffff:192.168.0.1"
  ]
  blocked.forEach(function(ip) {
    assert.strictEqual(predicate("ip_is_public", ip), "no", ip + " should be rejected")
  })
})

test("ip_is_public accepts public addresses", function() {
  var open = [
    "8.8.8.8", "93.184.216.34", "1.1.1.1",
    "172.15.0.1", "172.32.0.1",
    "100.63.0.1", "100.128.0.1",
    "223.255.255.255",
    "2606:4700::1111", "::ffff:8.8.8.8"
  ]
  open.forEach(function(ip) {
    assert.strictEqual(predicate("ip_is_public", ip), "yes", ip + " should be accepted")
  })
})

test("ip_is_public rejects garbage", function() {
  var junk = ["", "not-an-ip", "10.0.0", "1.2.3.4.5"]
  junk.forEach(function(ip) {
    assert.strictEqual(predicate("ip_is_public", ip), "no", JSON.stringify(ip) + " should be rejected")
  })
})

test("url_is_public rejects non-http schemes and local destinations", function() {
  var blocked = [
    "file:///etc/passwd",
    "ftp://example.com/x",
    "gopher://example.com/x",
    "http://localhost/status",
    "http://127.0.0.1:8080/admin",
    "http://[::1]/metrics",
    "http://10.0.0.5/router",
    "http://169.254.169.254/latest/meta-data/",
    "http://user@127.0.0.1/x",
    "not a url"
  ]
  blocked.forEach(function(u) {
    assert.strictEqual(predicate("url_is_public", u), "no", u + " should be rejected")
  })
})

test("url_is_public accepts public IP literals over http(s)", function() {
  // IP literals resolve without DNS, so this stays hermetic on CI.
  var open = ["http://93.184.216.34/page", "https://8.8.8.8/x", "https://[2606:4700::1111]/x"]
  open.forEach(function(u) {
    assert.strictEqual(predicate("url_is_public", u), "yes", u + " should be accepted")
  })
})
