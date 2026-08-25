var test = require("node:test")
var assert = require("node:assert")
var PanelModel = require("../PanelModel.js")

// Shared mixed fixture: one unconsumed item per known kind, one consumed
// item (kind "watch", so it would collide with w1 if consumedAt were ever
// ignored), and one unconsumed item whose kind ("code") isn't a real tab.
var fixture = [
  { id: "w1", kind: "watch", consumedAt: null },
  { id: "l1", kind: "listen", consumedAt: null },
  { id: "r1", kind: "read", consumedAt: null },
  { id: "d1", kind: "watch", consumedAt: "2026-08-20T00:00:00Z" },
  { id: "c1", kind: "code", consumedAt: null }
]

function ids(list) {
  return list.map(function(it) { return it.id })
}

// --- filterTabs -------------------------------------------------------

test("filterTabs returns the five tabs in order with labels", function() {
  assert.deepStrictEqual(PanelModel.filterTabs(), [
    { key: "all", label: "All" },
    { key: "watch", label: "Watch" },
    { key: "listen", label: "Listen" },
    { key: "read", label: "Read" },
    { key: "done", label: "Done" }
  ])
})

// --- filterItems --------------------------------------------------------

test("filterItems 'all' is every unconsumed item, including unknown kinds", function() {
  assert.deepStrictEqual(ids(PanelModel.filterItems(fixture, "all")), ["w1", "l1", "r1", "c1"])
})

test("filterItems 'done' is only consumed items", function() {
  assert.deepStrictEqual(ids(PanelModel.filterItems(fixture, "done")), ["d1"])
})

test("filterItems kind tabs return only unconsumed items of that kind", function() {
  assert.deepStrictEqual(ids(PanelModel.filterItems(fixture, "watch")), ["w1"])
  assert.deepStrictEqual(ids(PanelModel.filterItems(fixture, "listen")), ["l1"])
  assert.deepStrictEqual(ids(PanelModel.filterItems(fixture, "read")), ["r1"])
})

test("filterItems: unknown kind item never appears under a kind tab", function() {
  ["watch", "listen", "read"].forEach(function(kind) {
    assert.ok(ids(PanelModel.filterItems(fixture, kind)).indexOf("c1") === -1)
  })
})

test("filterItems: consumed items never appear under a kind tab, even a matching one", function() {
  // d1 is kind "watch" but consumed, so it must be absent from the "watch" tab.
  assert.ok(ids(PanelModel.filterItems(fixture, "watch")).indexOf("d1") === -1)
})

test("filterItems: null/undefined items array yields []", function() {
  assert.deepStrictEqual(PanelModel.filterItems(null, "all"), [])
  assert.deepStrictEqual(PanelModel.filterItems(undefined, "all"), [])
  assert.deepStrictEqual(PanelModel.filterItems(null, "done"), [])
  assert.deepStrictEqual(PanelModel.filterItems(undefined, "watch"), [])
})

// --- tabCounts ------------------------------------------------------------

test("tabCounts matches filterItems(...).length for every tab key", function() {
  var counts = PanelModel.tabCounts(fixture)
  PanelModel.filterTabs().forEach(function(tab) {
    assert.strictEqual(
      counts[tab.key],
      PanelModel.filterItems(fixture, tab.key).length,
      "counts." + tab.key + " should equal filterItems length for " + tab.key
    )
  })
})

test("tabCounts spot-check exact numbers for the fixture", function() {
  var counts = PanelModel.tabCounts(fixture)
  assert.strictEqual(counts.all, 4)
  assert.strictEqual(counts.watch, 1)
  assert.strictEqual(counts.listen, 1)
  assert.strictEqual(counts.read, 1)
  assert.strictEqual(counts.done, 1)
})

test("tabCounts: empty and null input give all-zero counts", function() {
  var zero = { all: 0, watch: 0, listen: 0, read: 0, done: 0 }
  assert.deepStrictEqual(PanelModel.tabCounts([]), zero)
  assert.deepStrictEqual(PanelModel.tabCounts(null), zero)
})

// --- moveCursor -------------------------------------------------------

test("moveCursor: from -1 moving down enters row 0", function() {
  assert.strictEqual(PanelModel.moveCursor(3, -1, 1), 0)
})

test("moveCursor: moving down clamps at length - 1", function() {
  assert.strictEqual(PanelModel.moveCursor(3, 2, 1), 2)
})

test("moveCursor: from row 0 moving up returns to -1", function() {
  assert.strictEqual(PanelModel.moveCursor(3, 0, -1), -1)
})

test("moveCursor: moving up from -1 stays at -1", function() {
  assert.strictEqual(PanelModel.moveCursor(3, -1, -1), -1)
})

test("moveCursor: empty list always returns -1 regardless of index/delta", function() {
  assert.strictEqual(PanelModel.moveCursor(0, -1, 1), -1)
  assert.strictEqual(PanelModel.moveCursor(0, 5, -1), -1)
  assert.strictEqual(PanelModel.moveCursor(0, 0, 0), -1)
  assert.strictEqual(PanelModel.moveCursor(0, -1, -1), -1)
})

test("moveCursor: a delta larger than the list clamps to the last row", function() {
  assert.strictEqual(PanelModel.moveCursor(3, 0, 100), 2)
  assert.strictEqual(PanelModel.moveCursor(3, -1, 100), 2)
})

// --- clampCursor --------------------------------------------------------

test("clampCursor: index within range is unchanged", function() {
  assert.strictEqual(PanelModel.clampCursor(5, 2), 2)
})

test("clampCursor: index past a shrunken end snaps to length - 1", function() {
  assert.strictEqual(PanelModel.clampCursor(2, 5), 1)
})

test("clampCursor: length 0 returns -1", function() {
  assert.strictEqual(PanelModel.clampCursor(0, 3), -1)
})

test("clampCursor: negative index stays -1", function() {
  assert.strictEqual(PanelModel.clampCursor(5, -1), -1)
})
