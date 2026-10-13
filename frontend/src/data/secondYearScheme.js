// AKTU B.Tech Second Year scheme (effective 2023-24), checked against the college's 2026-27 timetables.
// Hard-coded data, same idea as firstYearScheme.js: scaling = adding rows, not code.
//
// Covered branches: CY, IO, AL, DS, CE, ME, EC  (cycle A)   and   CS, IT  (cycle B).
//
// The "/" rows of the scheme (one paper of the pair per cycle):
//   Row 1  Sem III  BOE3** (open elective) / Maths-IV     Sem IV  Maths / BOE4**
//   Row 2  Sem III  BAS301 Technical Communication / BVE301 UHV      Sem IV  BAS401 / BVE401 (swapped)
//   Row 10 Sem III  BCC301 Cyber Security / BCC302 Python            Sem IV  BCC402 Python / BCC401 (swapped)
// CYCLE A (CY, IO, AL, DS, CE, ME, EC): FIRST option in odd sem (elective, Tech. Communication, Cyber Security)
//   and the other option in even sem (Maths, UHV, Python).
// CYCLE B (CS, IT): the exact opposite -- Sem III: Maths-IV, UHV, Python;  Sem IV: Tech. Communication,
//   Cyber Security, and the open elective (BOE4**).
//
// NOT listed (not timetable papers): BCC351 Internship Assessment / Mini Project (no periods),
// BVE451 / BVE452 Sports & Yoga-II / NSS-II (0 credits, done in the Saturday club/sports slot).
//
// Open electives are stored as TWO kinds of record (Semester III):
//   1) one regular row  "BOE3XX  Open Elective-I"  -> shown in the Semester 3 table (electiveGroup = null)
//   2) the real elective papers offered to that branch (per the timetable boards)
//      -> electiveGroup = "Open Elective-I"; the Subjects page shows them in their own section
//         below Semester 4, under that heading, NOT inside the Semester 3 table.
// Order inside Semester 3: regular papers (syllabus order), then the Open Elective-I row, then the options.

const make = (code, name, credits, L, T, P) => ({ code, name, credits, L, T, P });

// ---------------------------------------------------------------- papers common to the branches above
const TECH_COMM_3 = make("BAS301", "Technical Communication", 3, 2, 1, 0);
const CYBER_SECURITY_3 = make("BCC301", "Cyber Security", 2, 2, 0, 0);

// Cycle B (CS, IT) only
const MATHS_4_SEM3 = make("BAS303", "Mathematics-IV", 4, 3, 1, 0);
const UHV_3 = make("BVE301", "Universal Human Value and Professional Ethics", 3, 2, 1, 0);
const PYTHON_3 = make("BCC302", "Python Programming", 2, 2, 0, 0);
const TECH_COMM_4 = make("BAS401", "Technical Communication", 3, 2, 1, 0);
const CYBER_SECURITY_4 = make("BCC401", "Cyber Security", 2, 2, 0, 0);

const UHV_4 = make("BVE401", "Universal Human Value and Professional Ethics", 3, 2, 1, 0);
const PYTHON_4 = make("BCC402", "Python Programming", 2, 2, 0, 0);
const MATHS_3_CE = make("BAS402", "Mathematics-III", 4, 3, 1, 0); // CE and allied
const MATHS_4_REST = make("BAS403", "Mathematics-IV", 4, 3, 1, 0); // computer / electronics / mechanical and allied

// ---------------------------------------------------------------- department papers (from each syllabus PDF)
const DEPARTMENT_PAPERS = {
  // CS and allied branches (CY, IO, AL, DS ...) share one scheme
  CSA: {
    3: [
      make("BCS301", "Data Structure", 4, 3, 1, 0),
      make("BCS302", "Computer Organization and Architecture", 4, 3, 1, 0),
      make("BCS303", "Discrete Structures and Theory of Logic", 3, 2, 1, 0),
      make("BCS351", "Data Structure Lab", 1, 0, 0, 2),
      make("BCS352", "Computer Organization and Architecture Lab", 1, 0, 0, 2),
      make("BCS353", "Web Designing Workshop", 1, 0, 0, 2),
    ],
    4: [
      make("BCS401", "Operating System", 4, 3, 1, 0),
      make("BCS402", "Theory of Automata and Formal Languages", 4, 3, 1, 0),
      make("BCS403", "Object Oriented Programming with Java", 3, 2, 1, 0),
      make("BCS451", "Operating System Lab", 1, 0, 0, 2),
      make("BCS452", "Object Oriented Programming with Java Lab", 1, 0, 0, 2),
      make("BCS453", "Cyber Security Workshop", 1, 0, 0, 2),
    ],
  },
  CE: {
    3: [
      make("BCE301", "Engineering Mechanics", 4, 3, 1, 0),
      make("BCE302", "Surveying and Geomatics", 4, 3, 1, 0),
      make("BCE303", "Fluid Mechanics", 3, 2, 1, 0),
      make("BCE351", "Building Planning and Drawing Lab", 1, 0, 0, 2),
      make("BCE352", "Surveying and Geomatics Lab", 1, 0, 0, 2),
      make("BCE353", "Fluid Mechanics Lab", 1, 0, 0, 2),
    ],
    4: [
      make("BCE401", "Materials, Testing and Construction Practices", 4, 3, 1, 0),
      make("BCE402", "Introduction to Solid Mechanics", 4, 3, 1, 0),
      make("BCE403", "Hydraulic Engineering and Machines", 3, 2, 1, 0),
      make("BCE451", "Material Testing Lab", 1, 0, 0, 2),
      make("BCE452", "Solid Mechanics Lab", 1, 0, 0, 2),
      make("BCE453", "Hydraulics and Hydraulic Machine Lab", 1, 0, 0, 2),
    ],
  },
  ME: {
    3: [
      make("BME301", "Thermodynamics", 4, 3, 1, 0),
      make("BME302", "Fluid Mechanics and Fluid Machines", 4, 3, 1, 0),
      make("BME303", "Materials Engineering", 3, 2, 1, 0),
      make("BME351", "Fluid Mechanics Lab", 1, 0, 0, 2),
      make("BME352", "Material Testing Lab", 1, 0, 0, 2),
      make("BME353", "Computer Aided Machine Drawing-I Lab", 1, 0, 0, 2),
    ],
    4: [
      make("BME401", "Applied Thermodynamics", 4, 3, 1, 0),
      make("BME402", "Engineering Mechanics and Strength Material", 4, 3, 1, 0),
      make("BME403", "Manufacturing Processes", 3, 2, 1, 0),
      make("BME451", "Applied Thermodynamics Lab", 1, 0, 0, 2),
      make("BME452", "Manufacturing Processes Lab", 1, 0, 0, 2),
      make("BME453", "Computer Aided Machine Drawing-II Lab", 1, 0, 0, 2),
    ],
  },
  // ECE: paper NAMES and codes are from the timetable board. Credits / L-T-P are NOT from a syllabus
  // (the ECE PDF has not been shared): they follow the same 3-1-0 / 3-1-0 / 2-1-0 + three 0-0-2 labs
  // pattern as every other branch, which reproduces the scheme's 25-credit, L15-T5-P6 Semester III total.
  // Semester IV department papers: not entered until the ECE syllabus is available.
  EC: {
    3: [
      make("BEC301", "Electronic Devices", 4, 3, 1, 0),
      make("BEC302", "Digital System Design", 4, 3, 1, 0),
      make("BEC303", "Network Analysis and Synthesis", 3, 2, 1, 0),
      make("BEC351", "Electronic Devices Lab", 1, 0, 0, 2),
      make("BEC352", "Digital System Design Lab", 1, 0, 0, 2),
      make("BEC353", "Network Analysis and Synthesis Lab", 1, 0, 0, 2),
    ],
    4: [],
  },
};

// Which department scheme each branch follows.
const DEPARTMENT_OF = { CY: "CSA", IO: "CSA", AL: "CSA", DS: "CSA", CS: "CSA", IT: "CSA", CE: "CE", ME: "ME", EC: "EC" };

// Branches that take the OTHER side of every "/" row (see header). Everyone else is cycle A.
const CYCLE_B_BRANCHES = ["CS", "IT"];

// ---------------------------------------------------------------- open electives (Semester III only)
const ELECTIVE_HOURS = { credits: 4, L: 3, T: 1, P: 0 };
const OPEN_ELECTIVE_I = "Open Elective-I";
// The row shown in the Semester 3 table (the syllabus prints it as BOE3**, the timetable boards as BOE-3XX).
const OPEN_ELECTIVE_I_SLOT = make("BOE3XX", OPEN_ELECTIVE_I, 4, 3, 1, 0);

const OPEN_ELECTIVES = {
  BOE301: "Electric and Hybrid Vehicles",
  BOE302: "Automation and Robotics",
  BOE304: "Energy Science and Engineering",
  BOE310: "Digital Electronics",
  BOE312: "Laser System and Applications",
};

// Offered per branch, from the timetable boards (Gr.-1/2/3 are parallel batches of the SAME paper).
const SEM3_ELECTIVES = {
  CE: ["BOE301", "BOE304"],
  CY: ["BOE301", "BOE302", "BOE304", "BOE310", "BOE312"],
  IO: ["BOE302", "BOE304", "BOE310", "BOE312"],
  AL: ["BOE301", "BOE302", "BOE304", "BOE310", "BOE312"],
  DS: ["BOE301", "BOE302", "BOE304", "BOE310", "BOE312"],
  ME: ["BOE304"],
  EC: ["BOE302", "BOE304", "BOE312"],
};

// ---------------------------------------------------------------- assembly
function papersFor(branchCode, semester) {
  const dept = DEPARTMENT_OF[branchCode];
  if (!dept) return [];
  const deptPapers = DEPARTMENT_PAPERS[dept][semester];

  const cycleB = CYCLE_B_BRANCHES.includes(branchCode);

  if (semester === 3) {
    if (cycleB) return [MATHS_4_SEM3, UHV_3, ...deptPapers, PYTHON_3]; // no open elective in odd sem
    const options = (SEM3_ELECTIVES[branchCode] ?? []).map((code) => ({
      ...make(code, OPEN_ELECTIVES[code], ELECTIVE_HOURS.credits, ELECTIVE_HOURS.L, ELECTIVE_HOURS.T, ELECTIVE_HOURS.P),
      electiveGroup: OPEN_ELECTIVE_I,
    }));
    return [TECH_COMM_3, ...deptPapers, CYBER_SECURITY_3, OPEN_ELECTIVE_I_SLOT, ...options];
  }
  if (semester === 4) {
    if (cycleB) {
      // TODO (even-sem cycle): add the open elective for CS and IT here -- the "BOE4XX Open Elective-II" row
      // for the Semester 4 table plus the offered BOE4** options (electiveGroup: "Open Elective-II").
      return [TECH_COMM_4, ...deptPapers, CYBER_SECURITY_4];
    }
    const maths = branchCode === "CE" ? MATHS_3_CE : MATHS_4_REST;
    return [maths, UHV_4, ...deptPapers, PYTHON_4];
  }
  return [];
}

/**
 * Plain per-branch records for second year: { code, name, branchId, semester, credits, L, T, P, electiveGroup }
 * (same shape as buildFirstYearSeed). Branches not listed above get nothing.
 */
export function buildSecondYearSeed(branches) {
  const records = [];
  branches.forEach((branch) => {
    const branchCode = String(branch.code).toUpperCase();
    [3, 4].forEach((semester) => {
      papersFor(branchCode, semester).forEach((p) => {
        records.push({
          code: p.code,
          name: p.name,
          branchId: branch.id,
          semester,
          credits: p.credits,
          L: p.L,
          T: p.T,
          P: p.P,
          electiveGroup: p.electiveGroup ?? null, // null = regular row; "Open Elective-I" = an option under that heading
        });
      });
    });
  });
  return records;
}