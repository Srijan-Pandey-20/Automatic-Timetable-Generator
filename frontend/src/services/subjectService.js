// src/services/subjectService.js
//
// One Subject record = one paper studied by ONE branch in ONE semester:
//   { id, code, name, semester (1-8), branchId, credits, L, T, P, order, electiveGroup }
// `electiveGroup` is null for a regular paper, or a heading such as "Open Elective-I" for a paper that is
// one of the OPTIONS offered under that elective slot (these are listed in their own section by the UI).
// The same paper code can exist for several branches (e.g. AAS101E for CS, CY, IO), so the
// uniqueness rule is (branchId + code), not code alone.
// Weekly slots are never stored: they follow from L, T, P (see utils/subjectLoad.js).
//
// `order` works like Branch.order: a stored integer used only to sequence the papers inside
// one (branch, semester) list. Gaps after a delete are fine because the UI never shows it.

import { getBranches } from "./branchService";
import { buildFirstYearSeed } from "../data/firstYearScheme";
import { buildSecondYearSeed } from "../data/secondYearScheme";
import { LAB_BLOCK_PERIODS } from "../config/timetableconfig";

let subjects = null; // filled on first use, because the seed needs the real branch ids
let nextId = 1;

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

// Next free `order` value inside one (branch, semester) list.
function nextOrder(branchId, semester) {
  return subjects
    .filter((s) => s.branchId === branchId && s.semester === semester)
    .reduce((max, s) => Math.max(max, s.order), -1) + 1;
}

async function ensureSeeded() {
  if (subjects !== null) return;
  const branches = await getBranches();
  const counters = {}; // running order per (branch, semester)
  // Seed order inside each (branch, semester) list = array order, so regular papers
  // (listed first in each seed file) come before electives.
  const seed = [...buildFirstYearSeed(branches), ...buildSecondYearSeed(branches)];
  subjects = seed.map((s) => {
    const key = `${s.branchId}-${s.semester}`;
    counters[key] = (counters[key] ?? -1) + 1;
    return { id: nextId++, ...s, electiveGroup: s.electiveGroup ?? null, order: counters[key] };
  });
}

// Validates raw form input and returns a clean record (or throws a readable Error).
async function clean(input) {
  const code = String(input.code ?? "").trim().toUpperCase();
  const name = String(input.name ?? "").trim();
  if (!code) throw new Error("Subject code is required.");
  if (!name) throw new Error("Subject name is required.");

  const semester = Number(input.semester);
  if (!Number.isInteger(semester) || semester < 1 || semester > 8) {
    throw new Error("Semester must be a whole number from 1 to 8.");
  }

  const branchId = Number(input.branchId);
  const branches = await getBranches();
  if (!branches.some((b) => b.id === branchId)) throw new Error("Choose a valid branch.");

  const numbers = {};
  [["credits", "Credits"], ["L", "Lecture hours"], ["T", "Tutorial hours"], ["P", "Practical hours"]].forEach(
    ([key, label]) => {
      const raw = input[key];
      if (raw === "" || raw === null || raw === undefined) throw new Error(`${label} is required.`);
      const n = Number(raw);
      if (!Number.isInteger(n) || n < 0 || n > 10) {
        throw new Error(`${label} must be a whole number from 0 to 10.`);
      }
      numbers[key] = n;
    }
  );
  if (numbers.L + numbers.T + numbers.P === 0) {
    throw new Error("Enter at least one of L, T, P hours.");
  }
  if (numbers.P % LAB_BLOCK_PERIODS !== 0) {
    throw new Error(`Practical hours must be a multiple of ${LAB_BLOCK_PERIODS} (one lab block = ${LAB_BLOCK_PERIODS} periods).`);
  }

  return { code, name, semester, branchId, ...numbers };
}

export async function getSubjects() {
  await delay();
  await ensureSeeded();
  return subjects.map((s) => ({ ...s }));
}

export async function createSubject(input) {
  await delay();
  await ensureSeeded();
  const record = await clean(input);
  if (subjects.some((s) => s.branchId === record.branchId && s.code === record.code)) {
    throw new Error(`Subject code "${record.code}" already exists for this branch.`);
  }
  const newSubject = {
    id: nextId++,
    ...record,
    electiveGroup: null, // papers made with the form are regular papers
    order: nextOrder(record.branchId, record.semester), // new papers go to the end of the list
  };
  subjects.push(newSubject);
  return { ...newSubject };
}

export async function updateSubject(id, input) {
  await delay();
  await ensureSeeded();
  const record = await clean(input);
  const subject = subjects.find((s) => s.id === id);
  if (!subject) throw new Error("Subject not found.");
  if (subjects.some((s) => s.id !== id && s.branchId === record.branchId && s.code === record.code)) {
    throw new Error(`Subject code "${record.code}" already exists for this branch.`);
  }
  // Moved to another semester -> goes to the end of that semester's list.
  const newOrder =
    record.semester !== subject.semester ? nextOrder(record.branchId, record.semester) : subject.order;
  Object.assign(subject, record, { order: newOrder }); // only after ALL validation passed
  return { ...subject };
}

export async function deleteSubject(id) {
  await delay();
  await ensureSeeded();
  subjects = subjects.filter((s) => s.id !== id);
  return { success: true };
}

// orderedIds: ids of ONE (branch, semester) list, in the NEW desired sequence.
export async function reorderSubjects(orderedIds) {
  await delay();
  await ensureSeeded();
  const items = orderedIds.map((id) => subjects.find((s) => s.id === id));
  if (items.some((s) => !s)) throw new Error("Subject not found.");
  const { branchId, semester } = items[0] ?? {};
  if (items.some((s) => s.branchId !== branchId || s.semester !== semester)) {
    throw new Error("Only subjects of the same branch and semester can be reordered together.");
  }
  items.forEach((s, index) => {
    s.order = index;
  });
  return { success: true };
}