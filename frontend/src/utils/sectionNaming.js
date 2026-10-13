// src/utils/sectionNaming.js
//
// Derives each Section's letter (A, B, C…) and its two SubGroup names
// purely from POSITION within its (branchId, semester) group — nothing
// is ever stored. This guarantees that deleting a section automatically
// re-derives every subsequent section's letter and subgroup numbers on
// the next read, with no manual renumbering logic needed anywhere else.
//
// Pattern: {BranchCode}-{Semester}{RunningSubgroupNumber}
// e.g. Branch "CS", Semester 7, Section A (1st in group) -> CS-71, CS-72
//      Same group, Section B (2nd in group)              -> CS-73, CS-74

export function deriveSections(rawSections, branches) {
  const branchCode = (branchId) => {
    const b = branches.find((br) => br.id === branchId);
    return b ? b.code : "??";
  };

  // Group sections by (branchId, semester), preserving the order they
  // appear in rawSections (i.e. creation order / array order).
  const groups = {};
  rawSections.forEach((s) => {
    const key = `${s.branchId}::${s.semester}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  });

  const derived = [];
  Object.values(groups).forEach((group) => {
    group.forEach((section, idx) => {
      const letter = String.fromCharCode(65 + idx); // 0->A, 1->B, 2->C...
      const code = branchCode(section.branchId);
      const sub1Num = idx * 2 + 1;
      const sub2Num = idx * 2 + 2;

      derived.push({
        ...section,
        letter,
        subgroups: [
          { name: `${code}-${section.semester}${sub1Num}`, strength: 30 },
          { name: `${code}-${section.semester}${sub2Num}`, strength: 30 },
        ],
      });
    });
  });

  // Sort for stable, readable table display: by branch code, then
  // semester, then letter. This is DISPLAY ORDER ONLY — it does not
  // affect the position-based letter/number derivation above, which
  // already happened using each group's original array order.
  derived.sort((a, b) => {
    const ca = branchCode(a.branchId);
    const cb = branchCode(b.branchId);
    if (ca !== cb) return ca.localeCompare(cb);
    if (a.semester !== b.semester) return a.semester - b.semester;
    return a.letter.localeCompare(b.letter);
  });

  return derived;
}