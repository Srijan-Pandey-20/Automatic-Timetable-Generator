// src/utils/branchOrdering.js
//
// Pure function: derives the number the ADMIN SEES (displayPosition) from
// each branch's stored `order` field. This is the single source of truth
// for "what number does the user see" — Branches.jsx must never render
// the raw database `id` as if it were a sequence number.
//
// Why this must be a pure function (no side effects, no async, no state):
// it needs to be recomputed on every render, from whatever `order` values
// currently exist, so that deletions never leave a gap in what the user sees.

export function getOrderedBranches(rawBranches) {
  const sorted = [...rawBranches].sort((a, b) => a.order - b.order);
  return sorted.map((branch, index) => ({
    ...branch,
    displayPosition: index + 1, // always contiguous 1..N, regardless of gaps in `order`
  }));
}