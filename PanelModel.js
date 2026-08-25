// Pure panel logic: filter tabs, per-tab counts, and the keyboard cursor
// model. Kept out of BarWidget.qml so the semantics are node-testable.
//
// Dual-loadable, same rules as Providers.js: QML imports this as a
// namespace (top-level declarations become the members, so no
// ".pragma library" and no ES module syntax), while tests load it with
// require(). Keep it plain ES5-ish JS.

// Display order + labels for the popup's filter row. `key` doubles as the
// filter value passed to filterItems/tabCounts lookups.
function filterTabs() {
  return [
    { key: "all", label: "All" },
    { key: "watch", label: "Watch" },
    { key: "listen", label: "Listen" },
    { key: "read", label: "Read" },
    { key: "done", label: "Done" }
  ]
}

// Which items a tab shows. "done" is everything consumed; "all" is
// everything not consumed; the kind tabs are the unconsumed items of that
// kind. (An item whose kind matches no tab still appears under "all".)
function filterItems(items, filter) {
  var list = items || []
  if (filter === "done") return list.filter(function(it) { return !!it.consumedAt })
  if (filter === "all") return list.filter(function(it) { return !it.consumedAt })
  return list.filter(function(it) { return !it.consumedAt && it.kind === filter })
}

// Live count for every tab at once, keyed by tab key. Defined as: the
// length filterItems would return for that tab, computed in one pass.
function tabCounts(items) {
  var counts = { all: 0, watch: 0, listen: 0, read: 0, done: 0 }
  var list = items || []
  for (var i = 0; i < list.length; i++) {
    var it = list[i]
    if (it.consumedAt) {
      counts.done++
    } else {
      counts.all++
      if (it.kind === "watch" || it.kind === "listen" || it.kind === "read") {
        counts[it.kind]++
      }
    }
  }
  return counts
}

// Keyboard cursor model. Index -1 is the add field (the resting zone);
// 0..length-1 are the visible list rows. Moving down from the field enters
// the list, moving up from row 0 returns to the field, and both ends clamp.
function moveCursor(length, index, delta) {
  if (length <= 0) return -1
  var next = index + delta
  if (next < -1) return -1
  if (next > length - 1) return length - 1
  return next
}

// Re-fit the cursor after the visible list changes under it (a delete, a
// mark-done under a kind filter, ...). A cursor in the field stays there;
// one past the new end snaps to the last row; an emptied list returns the
// cursor to the field.
function clampCursor(length, index) {
  if (index < 0 || length <= 0) return -1
  return Math.min(index, length - 1)
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    filterTabs: filterTabs,
    filterItems: filterItems,
    tabCounts: tabCounts,
    moveCursor: moveCursor,
    clampCursor: clampCursor
  }
}
