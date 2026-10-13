// AKTU B.Tech First Year scheme (effective 2026-27, Sem I and Sem II) — the source table.
// Source: the official scheme PDF. Verify any change against that PDF, not against websites.
//
// `variant` records which side of the "/" a row is printed on in the scheme:
//   "A" = before the slash, "B" = after it, null = the same paper for everybody.
// It is used ONLY here, once, to expand this table into per-branch records (buildFirstYearSeed).
// The running app has no options/cycles: every subject simply belongs to one branch + semester.

const make = (code, name, semester, variant, credits, L, T, P) => ({
  code, name, semester, variant, credits, L, T, P,
});

const FIRST_YEAR_SCHEME = [
  // ---------- Semester I ----------
  make("AAS101E", "Quantum Physics and Applications", 1, "A", 3, 3, 0, 0),
  make("AAS102D", "Applied Chemistry for Smart Systems", 1, "B", 3, 3, 0, 0),
  make("AAS103D", "Numerical Methods", 1, "A", 4, 3, 1, 0),
  make("AAS103C", "Calculus and Linear Algebra", 1, "B", 4, 3, 1, 0),
  make("AEE101A", "Fundamentals of Electrical Engineering", 1, "A", 3, 2, 1, 0),
  make("AEC101A", "Fundamentals of Electronics Engineering", 1, "B", 3, 2, 1, 0),
  make("ACS101", "Programming Languages", 1, null, 3, 2, 1, 0),
  make("AAS104", "Introduction to Indian Knowledge System", 1, "A", 2, 2, 0, 0),
  make("AAS105", "Professional Communication and Technical Writing", 1, "B", 2, 2, 0, 0),
  make("AAI101", "Introduction to AI and Prompt Engineering", 1, "A", 2, 2, 0, 0),
  make("AME101A", "Fundamentals of Mechanical Engineering", 1, "B", 2, 2, 0, 0),
  make("AAS151", "Applied Physics Lab", 1, "A", 1, 0, 0, 2),
  make("AAS152D", "Applied Chemistry for Smart Systems Lab", 1, "B", 1, 0, 0, 2),
  make("AEE151A", "Electrical Engineering Lab", 1, "A", 1, 0, 0, 2),
  make("AEC151A", "Electronics Engineering Lab", 1, "B", 1, 0, 0, 2),
  make("ACE151E", "Computer-Aided Engineering Drawing Lab", 1, "A", 2, 0, 1, 2),
  make("AID151", "Innovation and Design Thinking Lab (PBL)", 1, "B", 2, 0, 1, 2),
  make("AAS153", "Language Lab", 1, "A", 0, 0, 0, 2),
  make("AAC101", "Environment and Sustainability", 1, "B", 0, 2, 0, 0),

  // ---------- Semester II ----------
  make("AAS201E", "Quantum Physics and Applications", 2, "A", 3, 3, 0, 0),
  make("AAS202D", "Applied Chemistry for Smart Systems", 2, "B", 3, 3, 0, 0),
  make("AAS203D", "Numerical Methods", 2, "A", 4, 3, 1, 0),
  make("AAS203C", "Calculus and Linear Algebra", 2, "B", 4, 3, 1, 0),
  make("AEE201A", "Fundamentals of Electrical Engineering", 2, "A", 3, 2, 1, 0),
  make("AEC201A", "Fundamentals of Electronics Engineering", 2, "B", 3, 2, 1, 0),
  make("ACS201", "Essentials of Data Structure", 2, null, 3, 2, 1, 0),
  make("AAS204", "Introduction to Indian Knowledge System", 2, "A", 2, 2, 0, 0),
  make("AAS205", "Professional Communication and Technical Writing", 2, "B", 2, 2, 0, 0),
  make("AAI201", "Introduction to AI and Prompt Engineering", 2, "A", 2, 2, 0, 0),
  make("AME201A", "Fundamentals of Mechanical Engineering", 2, "B", 2, 2, 0, 0),
  make("AAS251", "Applied Physics Lab", 2, "A", 1, 0, 0, 2),
  make("AAS252D", "Applied Chemistry for Smart Systems Lab", 2, "B", 1, 0, 0, 2),
  make("AEE251A", "Electrical Engineering Lab", 2, "A", 1, 0, 0, 2),
  make("AEC251A", "Electronics Engineering Lab", 2, "B", 1, 0, 0, 2),
  make("ACE251E", "Computer-Aided Engineering Drawing Lab", 2, "A", 2, 0, 1, 2),
  make("AID251", "Innovation and Design Thinking Lab (PBL)", 2, "B", 2, 0, 1, 2),
  make("AAS253", "Language Lab", 2, "A", 0, 0, 0, 2),
  make("AAC201", "Environment and Sustainability", 2, "B", 0, 2, 0, 0),
  make("AGP251", "General Proficiency", 2, null, 0, 0, 0, 2),
];

// Branch groups (from the college's 2026-27 first-year timetables):
//   Physics group   = AL, CY, IO, IT, DS  -> "before the slash" papers in Semester 1
//                                            (Applied Physics cycle), "after the slash" in Semester 2.
//   Chemistry group = CS, ME, CE, EE, ECE -> "after the slash" papers in Semester 1
//                                            (Applied Chemistry cycle), "before the slash" in Semester 2.
const FIRST_OPTION_BRANCH_CODES = ["AL", "CY", "IO", "IT", "DS"];

// Expands the scheme into plain records: { code, name, branchId, semester, credits, L, T, P }.
export function buildFirstYearSeed(branches) {
  const records = [];
  branches.forEach((branch) => {
    const sem1Side = FIRST_OPTION_BRANCH_CODES.includes(branch.code) ? "A" : "B";
    const sideFor = (semester) => (semester === 1 ? sem1Side : sem1Side === "A" ? "B" : "A");

    FIRST_YEAR_SCHEME.forEach((p) => {
      if (p.variant !== null && p.variant !== sideFor(p.semester)) return;
      records.push({
        code: p.code,
        name: p.name,
        branchId: branch.id,
        semester: p.semester,
        credits: p.credits,
        L: p.L,
        T: p.T,
        P: p.P,
      });
    });
  });
  return records;
}