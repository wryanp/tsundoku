var test = require("node:test")
var assert = require("node:assert")
var fs = require("node:fs")
var os = require("node:os")
var path = require("node:path")
var http = require("node:http")
var crypto = require("node:crypto")
var spawn = require("node:child_process").spawn

var Auth = require("../scripts/tsundoku-auth")

var SCRIPT = path.join(__dirname, "..", "scripts", "tsundoku-auth")

function mkTempDataDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "tsundoku-auth-test-"))
}

function authDirOf(dataDir) {
  return path.join(dataDir, "auth")
}

function tokenFilePathOf(dataDir, provider) {
  return path.join(authDirOf(dataDir), provider + ".json")
}

function writeOverlay(dataDir, overlay) {
  fs.mkdirSync(authDirOf(dataDir), { recursive: true })
  fs.writeFileSync(path.join(authDirOf(dataDir), "clients.json"), JSON.stringify(overlay))
}

function writeTokenFile(dataDir, provider, record) {
  fs.mkdirSync(authDirOf(dataDir), { recursive: true })
  fs.writeFileSync(tokenFilePathOf(dataDir, provider), JSON.stringify(record))
}

function base64urlOfSha256(input) {
  return crypto.createHash("sha256").update(input).digest("base64")
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

// Spawns the CLI and waits for it to exit — for commands with no
// mid-flight interaction (status, disconnect, token, and the connect
// paths that fail before ever opening a server).
function runCli(args, env) {
  return new Promise(function(resolve, reject) {
    var child = spawn(process.execPath, [SCRIPT].concat(args), {
      env: Object.assign({}, process.env, env)
    })
    var stdout = ""
    var stderr = ""
    child.stdout.on("data", function(d) { stdout += d })
    child.stderr.on("data", function(d) { stderr += d })
    child.on("error", reject)
    child.on("close", function(code) {
      resolve({ code: code, stdout: stdout, stderr: stderr })
    })
  })
}

// Spawns `connect` and resolves as soon as the stderr authorize_url line
// shows up, while still tracking the eventual exit — needed because a
// real connect run blocks on the loopback callback, so the test has to
// drive that callback itself before the process ever closes.
function spawnConnect(provider, env) {
  var child = spawn(process.execPath, [SCRIPT, "connect", provider], {
    env: Object.assign({}, process.env, { TSUNDOKU_AUTH_NO_BROWSER: "1" }, env)
  })
  var stdout = ""
  var stderr = ""
  var sawUrl = false
  var resolveUrl
  var authorizeUrl = new Promise(function(resolve) { resolveUrl = resolve })

  child.stdout.on("data", function(d) { stdout += d })
  child.stderr.on("data", function(d) {
    stderr += d
    if (!sawUrl) {
      var m = stderr.match(/authorize_url=(\S+)\n/)
      if (m) {
        sawUrl = true
        resolveUrl(m[1])
      }
    }
  })

  var closed = new Promise(function(resolve) {
    child.on("close", function(code) {
      resolve({ code: code, stdout: stdout, stderr: stderr })
    })
  })

  return { authorizeUrl: authorizeUrl, closed: closed }
}

function startMockTokenServer(handler) {
  return new Promise(function(resolve) {
    var server = http.createServer(function(req, res) {
      var body = ""
      req.on("data", function(chunk) { body += chunk })
      req.on("end", function() { handler(req, res, body) })
    })
    server.listen(0, "127.0.0.1", function() { resolve(server) })
  })
}

function closeServer(server) {
  return new Promise(function(resolve) { server.close(resolve) })
}

// ---- PKCE unit tests --------------------------------------------------

test("the CLI script is require()-able by its extension-less path and exports its testable pieces", function() {
  assert.strictEqual(typeof Auth.generatePkce, "function")
  assert.strictEqual(typeof Auth.effectiveConfig, "function")
  assert.strictEqual(typeof Auth.statusCommand, "function")
  assert.strictEqual(typeof Auth.connectCommand, "function")
  assert.strictEqual(typeof Auth.tokenCommand, "function")
  assert.strictEqual(typeof Auth.disconnectCommand, "function")
})

test("generatePkce produces base64url verifier/challenge/state with no padding characters", function() {
  var pkce = Auth.generatePkce()
  var b64url = /^[A-Za-z0-9_-]+$/
  assert.match(pkce.verifier, b64url)
  assert.match(pkce.challenge, b64url)
  assert.match(pkce.state, b64url)
  assert.strictEqual(pkce.verifier.length, 43)
})

test("generatePkce's challenge equals base64url(sha256(verifier)) computed independently", function() {
  var pkce = Auth.generatePkce()
  assert.strictEqual(pkce.challenge, base64urlOfSha256(pkce.verifier))
})

test("generatePkce produces a fresh verifier/state each call", function() {
  var a = Auth.generatePkce()
  var b = Auth.generatePkce()
  assert.notStrictEqual(a.verifier, b.verifier)
  assert.notStrictEqual(a.state, b.state)
})

// ---- status ---------------------------------------------------------------

test("status: unconfigured on a fresh data dir (registry clientId is empty, no overlay)", async function() {
  var dataDir = mkTempDataDir()
  var res = await runCli(["status", "spotify"], { TSUNDOKU_DATA_DIR: dataDir })
  assert.strictEqual(res.code, 0)
  assert.deepStrictEqual(JSON.parse(res.stdout), { provider: "spotify", state: "unconfigured" })
})

test("status: disconnected once the overlay supplies a clientId but no token file exists", async function() {
  var dataDir = mkTempDataDir()
  writeOverlay(dataDir, { spotify: { clientId: "abc123" } })
  var res = await runCli(["status", "spotify"], { TSUNDOKU_DATA_DIR: dataDir })
  assert.deepStrictEqual(JSON.parse(res.stdout), { provider: "spotify", state: "disconnected" })
})

test("status: connected whenever a token file exists, even without a clients.json overlay", async function() {
  var dataDir = mkTempDataDir()
  writeTokenFile(dataDir, "spotify", {
    provider: "spotify", accessToken: "x", refreshToken: "y", tokenType: "Bearer",
    scope: "", expiresAt: new Date(Date.now() + 3600000).toISOString(), obtainedAt: new Date().toISOString()
  })
  var res = await runCli(["status", "spotify"], { TSUNDOKU_DATA_DIR: dataDir })
  assert.deepStrictEqual(JSON.parse(res.stdout), { provider: "spotify", state: "connected" })
})

test("overlay clientId overrides the registry's empty clientId (status flips unconfigured -> disconnected)", async function() {
  var dataDir = mkTempDataDir()
  var before = await runCli(["status", "spotify"], { TSUNDOKU_DATA_DIR: dataDir })
  assert.strictEqual(JSON.parse(before.stdout).state, "unconfigured")
  writeOverlay(dataDir, { spotify: { clientId: "overridden" } })
  var after = await runCli(["status", "spotify"], { TSUNDOKU_DATA_DIR: dataDir })
  assert.strictEqual(JSON.parse(after.stdout).state, "disconnected")
})

// ---- disconnect -------------------------------------------------------

test("disconnect deletes the token file and is idempotent on a second run", async function() {
  var dataDir = mkTempDataDir()
  writeTokenFile(dataDir, "spotify", { provider: "spotify", accessToken: "x" })

  var res1 = await runCli(["disconnect", "spotify"], { TSUNDOKU_DATA_DIR: dataDir })
  assert.deepStrictEqual(JSON.parse(res1.stdout), { provider: "spotify", state: "disconnected" })
  assert.strictEqual(fs.existsSync(tokenFilePathOf(dataDir, "spotify")), false)

  var res2 = await runCli(["disconnect", "spotify"], { TSUNDOKU_DATA_DIR: dataDir })
  assert.strictEqual(res2.code, 0)
  assert.deepStrictEqual(JSON.parse(res2.stdout), { provider: "spotify", state: "disconnected" })
})

// ---- token / refresh ----------------------------------------------------

test("token: a fresh token is returned without hitting any endpoint", async function() {
  var dataDir = mkTempDataDir()
  writeTokenFile(dataDir, "spotify", {
    provider: "spotify", accessToken: "fresh-token", refreshToken: "r", tokenType: "Bearer",
    scope: "", expiresAt: new Date(Date.now() + 3600000).toISOString(), obtainedAt: new Date().toISOString()
  })
  // No overlay and no mock server: if this hit any endpoint it could only
  // fail, so a successful "connected" result proves it never tried.
  var res = await runCli(["token", "spotify"], { TSUNDOKU_DATA_DIR: dataDir })
  assert.deepStrictEqual(JSON.parse(res.stdout), { provider: "spotify", state: "connected", accessToken: "fresh-token" })
})

test("token: an expired token refreshes, rewrites the file, and keeps the old refresh_token when the response omits one", async function() {
  var dataDir = mkTempDataDir()
  var requests = []
  var server = await startMockTokenServer(function(req, res, body) {
    requests.push(body)
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ access_token: "new-access", expires_in: 3600, token_type: "Bearer" }))
  })
  writeOverlay(dataDir, {
    spotify: { clientId: "abc123", tokenEndpoint: "http://127.0.0.1:" + server.address().port + "/token" }
  })
  writeTokenFile(dataDir, "spotify", {
    provider: "spotify", accessToken: "old-access", refreshToken: "old-refresh", tokenType: "Bearer",
    scope: "", expiresAt: new Date(Date.now() - 1000).toISOString(), obtainedAt: new Date(Date.now() - 7200000).toISOString()
  })

  var res = await runCli(["token", "spotify"], { TSUNDOKU_DATA_DIR: dataDir })
  await closeServer(server)

  assert.deepStrictEqual(JSON.parse(res.stdout), { provider: "spotify", state: "connected", accessToken: "new-access" })
  assert.strictEqual(requests.length, 1)

  var sent = new URLSearchParams(requests[0])
  assert.strictEqual(sent.get("grant_type"), "refresh_token")
  assert.strictEqual(sent.get("refresh_token"), "old-refresh")
  assert.strictEqual(sent.get("client_id"), "abc123")

  var file = tokenFilePathOf(dataDir, "spotify")
  var stored = JSON.parse(fs.readFileSync(file, "utf8"))
  assert.strictEqual(stored.accessToken, "new-access")
  assert.strictEqual(stored.refreshToken, "old-refresh")
  assert.strictEqual(fs.statSync(file).mode & 0o777, 0o600)
})

test("token: refresh returning 400 invalid_grant deletes the token file and reports disconnected", async function() {
  var dataDir = mkTempDataDir()
  var server = await startMockTokenServer(function(req, res) {
    res.writeHead(400, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ error: "invalid_grant" }))
  })
  writeOverlay(dataDir, {
    spotify: { clientId: "abc123", tokenEndpoint: "http://127.0.0.1:" + server.address().port + "/token" }
  })
  writeTokenFile(dataDir, "spotify", {
    provider: "spotify", accessToken: "old-access", refreshToken: "old-refresh", tokenType: "Bearer",
    scope: "", expiresAt: new Date(Date.now() - 1000).toISOString(), obtainedAt: new Date(Date.now() - 7200000).toISOString()
  })

  var res = await runCli(["token", "spotify"], { TSUNDOKU_DATA_DIR: dataDir })
  await closeServer(server)

  assert.deepStrictEqual(JSON.parse(res.stdout), { provider: "spotify", state: "disconnected" })
  assert.strictEqual(fs.existsSync(tokenFilePathOf(dataDir, "spotify")), false)
})

test("token: disconnected when no token file exists", async function() {
  var dataDir = mkTempDataDir()
  var res = await runCli(["token", "spotify"], { TSUNDOKU_DATA_DIR: dataDir })
  assert.deepStrictEqual(JSON.parse(res.stdout), { provider: "spotify", state: "disconnected" })
})

// ---- connect ------------------------------------------------------------

test("connect: unconfigured when there is no overlay clientId, without ever opening a server", async function() {
  var dataDir = mkTempDataDir()
  var res = await runCli(["connect", "spotify"], { TSUNDOKU_DATA_DIR: dataDir, TSUNDOKU_AUTH_NO_BROWSER: "1" })
  assert.deepStrictEqual(JSON.parse(res.stdout), { provider: "spotify", state: "error", error: "unconfigured" })
  assert.strictEqual(res.stderr.indexOf("authorize_url="), -1)
})

test("connect: port-busy when the configured redirect port is already taken", async function() {
  var dataDir = mkTempDataDir()
  var blocker = http.createServer(function() {})
  await new Promise(function(resolve) { blocker.listen(0, "127.0.0.1", resolve) })
  var busyPort = blocker.address().port

  writeOverlay(dataDir, { spotify: { clientId: "abc123", tokenEndpoint: "http://127.0.0.1:1/token", redirectPort: busyPort } })
  var res = await runCli(["connect", "spotify"], { TSUNDOKU_DATA_DIR: dataDir, TSUNDOKU_AUTH_NO_BROWSER: "1" })
  await closeServer(blocker)

  assert.deepStrictEqual(JSON.parse(res.stdout), { provider: "spotify", state: "error", error: "port-busy" })
})

test("connect: times out when nothing ever calls back", async function() {
  var dataDir = mkTempDataDir()
  writeOverlay(dataDir, { spotify: { clientId: "abc123", tokenEndpoint: "http://127.0.0.1:1/token", redirectPort: 0 } })
  var handle = spawnConnect("spotify", { TSUNDOKU_DATA_DIR: dataDir, TSUNDOKU_AUTH_TIMEOUT_MS: "200" })
  await handle.authorizeUrl
  var result = await handle.closed
  assert.strictEqual(result.code, 0)
  assert.deepStrictEqual(JSON.parse(result.stdout), { provider: "spotify", state: "error", error: "timeout" })
})

test("connect: denied when the callback carries a matching state and an error param", async function() {
  var dataDir = mkTempDataDir()
  writeOverlay(dataDir, { spotify: { clientId: "abc123", tokenEndpoint: "http://127.0.0.1:1/token", redirectPort: 0 } })
  var handle = spawnConnect("spotify", { TSUNDOKU_DATA_DIR: dataDir })

  var authorizeUrl = await handle.authorizeUrl
  var parsed = new URL(authorizeUrl)
  var state = parsed.searchParams.get("state")
  var redirectUri = parsed.searchParams.get("redirect_uri")

  await fetch(redirectUri + "?state=" + encodeURIComponent(state) + "&error=access_denied")

  var result = await handle.closed
  assert.deepStrictEqual(JSON.parse(result.stdout), { provider: "spotify", state: "error", error: "denied" })
})

test("connect: ignores a favicon probe and a wrong-state callback, then still completes on the real one", async function() {
  var dataDir = mkTempDataDir()
  var receivedBody = null
  var server = await startMockTokenServer(function(req, res, body) {
    receivedBody = body
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ access_token: "at", refresh_token: "rt", expires_in: 3600, token_type: "Bearer", scope: "" }))
  })
  writeOverlay(dataDir, {
    spotify: { clientId: "abc123", tokenEndpoint: "http://127.0.0.1:" + server.address().port + "/token", redirectPort: 0 }
  })

  var handle = spawnConnect("spotify", { TSUNDOKU_DATA_DIR: dataDir })
  var authorizeUrl = await handle.authorizeUrl
  var parsed = new URL(authorizeUrl)
  var state = parsed.searchParams.get("state")
  var challenge = parsed.searchParams.get("code_challenge")
  var redirectUri = parsed.searchParams.get("redirect_uri")

  var faviconRes = await fetch(redirectUri.replace(/\/callback$/, "/favicon.ico"))
  assert.strictEqual(faviconRes.status, 404)

  var wrongStateRes = await fetch(redirectUri + "?state=not-the-real-state&code=abc")
  assert.strictEqual(wrongStateRes.status, 400)

  await fetch(redirectUri + "?state=" + encodeURIComponent(state) + "&code=goodcode")

  var result = await handle.closed
  await closeServer(server)

  assert.strictEqual(result.code, 0)
  assert.deepStrictEqual(JSON.parse(result.stdout), { provider: "spotify", state: "connected" })

  var sent = new URLSearchParams(receivedBody)
  assert.strictEqual(sent.get("grant_type"), "authorization_code")
  assert.strictEqual(sent.get("code"), "goodcode")
  assert.strictEqual(sent.get("redirect_uri"), redirectUri)
  assert.strictEqual(sent.get("client_id"), "abc123")
  assert.strictEqual(challenge, base64urlOfSha256(sent.get("code_verifier")))

  var file = tokenFilePathOf(dataDir, "spotify")
  var stored = JSON.parse(fs.readFileSync(file, "utf8"))
  assert.strictEqual(stored.provider, "spotify")
  assert.strictEqual(stored.accessToken, "at")
  assert.strictEqual(stored.refreshToken, "rt")
  assert.strictEqual(stored.tokenType, "Bearer")
  assert.ok(stored.expiresAt)
  assert.ok(stored.obtainedAt)
  assert.strictEqual(fs.statSync(file).mode & 0o777, 0o600)
})

test("connect: exchange-failed when the token endpoint rejects the code", async function() {
  var dataDir = mkTempDataDir()
  var server = await startMockTokenServer(function(req, res) {
    res.writeHead(400, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ error: "invalid_grant" }))
  })
  writeOverlay(dataDir, {
    spotify: { clientId: "abc123", tokenEndpoint: "http://127.0.0.1:" + server.address().port + "/token", redirectPort: 0 }
  })

  var handle = spawnConnect("spotify", { TSUNDOKU_DATA_DIR: dataDir })
  var authorizeUrl = await handle.authorizeUrl
  var parsed = new URL(authorizeUrl)
  var state = parsed.searchParams.get("state")
  var redirectUri = parsed.searchParams.get("redirect_uri")

  await fetch(redirectUri + "?state=" + encodeURIComponent(state) + "&code=whatever")

  var result = await handle.closed
  await closeServer(server)

  assert.deepStrictEqual(JSON.parse(result.stdout), { provider: "spotify", state: "error", error: "exchange-failed" })
  assert.strictEqual(fs.existsSync(tokenFilePathOf(dataDir, "spotify")), false)
})
