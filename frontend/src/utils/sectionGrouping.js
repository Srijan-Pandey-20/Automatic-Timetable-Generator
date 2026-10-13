// Pure function: takes the already-derived sections (with letter/subgroups
// computed by deriveSections) and nests them for display as
// branch -> semester -> sections[], sorted by branch order and semester
// number. This is presentation-only — sectionService.js and
// sectionNaming.js are untouched; this function only reshapes what
// Sections.jsx already has for rendering.
//
// includeEmptyBranches: when true, branches with zero sections still
// appear in the output (with an empty semesters array) so the admin can
// see at a glance which branches haven't been scheduled at all.
export function groupSectionsByBranchAndSemester(
  derivedSections,
  branches,
  { includeEmptyBranches = true } = {}
) {
  // Sort branches by their own display order if present (falls back to
  // array order otherwise) so this respects whatever ordering Branches.jsx
  // has established — e.g. after a drag-and-drop reorder.
  const sortedBranches = [...branches].sort((a, b) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    return orderA - orderB;
  });

  const groups = sortedBranches.map((branch) => {
    const branchSections = derivedSections.filter(
      (s) => s.branchId === branch.id
    );

    const semesterMap = new Map();
    branchSections.forEach((section) => {
      if (!semesterMap.has(section.semester)) {
        semesterMap.set(section.semester, []);
      }
      semesterMap.get(section.semester).push(section);
    });

    const semesters = Array.from(semesterMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([semester, sectionsInSemester]) => ({
        semester,
        sections: sectionsInSemester.sort((a, b) =>
          a.letter.localeCompare(b.letter)
        ),
      }));

    return { branch, semesters };
  });

  return includeEmptyBranches
    ? groups
    : groups.filter((g) => g.semesters.length > 0);
}