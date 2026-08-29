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

test("url_is_public rejects userinfo, malformed authorities, and ambiguous numeric hosts", function() {
  var blocked = [
    "http://user@8.8.8.8/x",         // userinfo, even with a public host
    "http://user:pass@example.com/", // userinfo with password
    "http://8.8.8.8:80:80/",         // second colon without brackets
    "http://[::ffff:8.8.8.8/x",      // unclosed bracket
    "http://[2606:4700::1111]junk/", // trailing junk after bracket
    "http://[fe80::1%25eth0]/",      // zone index
    "http://8.8.8.8:0/",             // port out of range
    "http://8.8.8.8:99999/",         // port out of range
    "http://8.8.8.8:080/",           // zero-padded port
    "http://8.8.8.8:/",              // empty port
    "http://010.0.0.1/",             // octal: glibc says 8.0.0.1, others 10.0.0.1
    "http://0x7f.0.0.1/",            // hex octet
    "http://0x7f000001/",            // hex integer
    "http://2130706433/",            // decimal integer (127.0.0.1)
    "http://1.2.3.4.5/",             // too many octets
    "http://256.1.2.3/",             // octet out of range
    "http://:80/"                    // empty host
  ]
  blocked.forEach(function(u) {
    assert.strictEqual(predicate("url_is_public", u), "no", u + " should be rejected")
  })
})

// Sources the script in library mode with getent stubbed to return the
// given ahosts lines, runs url_resolve_pin, and prints the resolve_opts
// array it produced ("(rejected)" if the URL was refused, "(none)" if it
// was accepted with nothing to pin). Stubbing getent keeps the DNS-named
// cases hermetic on CI.
function pinFor(url, ahostsLines) {
  return execFileSync("bash", [
    "-c",
    'TSUNDOKU_RESOLVE_LIB=1 source "$0" && ' +
      'getent() { printf %s "$FAKE_AHOSTS"; } && ' +
      'if url_resolve_pin "$1"; then echo "${resolve_opts[*]:-(none)}"; else echo "(rejected)"; fi',
    SCRIPT,
    url
  ], { env: Object.assign({}, process.env, { FAKE_AHOSTS: ahostsLines }) }).toString().trim()
}

test("url_resolve_pin pins the vetted address for DNS-named hosts", function() {
  assert.strictEqual(
    pinFor("http://example.test/page", "93.184.216.34 STREAM example.test\n93.184.216.34 DGRAM \n"),
    "--resolve example.test:80:93.184.216.34")
  assert.strictEqual(
    pinFor("https://example.test/page", "93.184.216.34 STREAM example.test\n"),
    "--resolve example.test:443:93.184.216.34")
  assert.strictEqual(
    pinFor("https://example.test:8443/page", "93.184.216.34 STREAM example.test\n"),
    "--resolve example.test:8443:93.184.216.34")
})

test("url_resolve_pin prefers an IPv4 pin and brackets an IPv6-only one", function() {
  assert.strictEqual(
    pinFor("https://example.test/", "2606:4700::1111 STREAM example.test\n93.184.216.34 STREAM example.test\n"),
    "--resolve example.test:443:93.184.216.34")
  assert.strictEqual(
    pinFor("https://example.test/", "2606:4700::1111 STREAM example.test\n"),
    "--resolve example.test:443:[2606:4700::1111]")
})

test("url_resolve_pin rejects the URL when any resolved address is non-public", function() {
  assert.strictEqual(
    pinFor("http://example.test/", "93.184.216.34 STREAM example.test\n10.0.0.5 STREAM example.test\n"),
    "(rejected)")
  assert.strictEqual(pinFor("http://example.test/", ""), "(rejected)")
})

test("url_resolve_pin needs no pin for IP-literal hosts", function() {
  assert.strictEqual(pinFor("http://93.184.216.34/x", ""), "(none)")
  assert.strictEqual(pinFor("https://[2606:4700::1111]/x", ""), "(none)")
})
