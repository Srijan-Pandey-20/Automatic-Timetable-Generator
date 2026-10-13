// src/services/branchService.js
//
// Branch CRUD. Two numbering concepts live here and must not be confused:
//
// - id: permanent primary key. Never reused after delete. Referenced as a
//   foreign key by Section (branchId). NEVER shown to the user.
// - order: an explicit, persisted integer used purely for sequencing.
//   It CAN have gaps after a delete (e.g. 0,1,3,4,5,6) — that is fine and
//   expected. The gap is invisible to the user because the UI never
//   displays `order` directly; it always displays the derived
//   displayPosition from utils/branchOrdering.js.

let branches = [
  { id: 1, code: "CS", name: "Computer Science", order: 0 },
  { id: 2, code: "AL", name: "Artificial Intelligence & Machine Learning", order: 1 },
  { id: 3, code: "CY", name: "Cyber Security", order: 2 },
  { id: 4, code: "IO", name: "Internet of Things", order: 3 },
  { id: 5, code: "DS", name: "Data Science", order: 4 },
  { id: 6, code: "ME", name: "Mechanical Engineering", order: 5 },
  { id: 7, code: "CE", name: "Civil Engineering", order: 6 },
  { id: 8, code: "IT", name: "Information Technology", order: 7 },
  { id: 9, code: "EE", name: "Electrical Engineering", order: 8 },
  { id: 10, code: "ECE", name: "Electronics & Communication Engineering", order: 9 },
];

let nextId = 11; // simulates a DB auto-increment counter; only ever goes up

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getBranches() {
  await delay();
  return branches.map((b) => ({ ...b })); // return copies, protect internal state
}

export async function createBranch({ code, name }) {
  await delay();
  const trimmedCode = code.trim().toUpperCase();

  if (branches.some((b) => b.code === trimmedCode)) {
    throw new Error(`Branch code "${trimmedCode}" already exists.`);
  }

  const maxOrder = branches.reduce((max, b) => Math.max(max, b.order), -1);
  const newBranch = {
    id: nextId++,
    code: trimmedCode,
    name: name.trim(),
    order: maxOrder + 1, // a newly created branch is always appended at the end
  };

  branches.push(newBranch);
  return { ...newBranch };
}

export async function updateBranch(id, { code, name }) {
  await delay();
  const trimmedCode = code.trim().toUpperCase();

  const clash = branches.some((b) => b.code === trimmedCode && b.id !== id);
  if (clash) {
    throw new Error(`Branch code "${trimmedCode}" already exists.`);
  }

  const branch = branches.find((b) => b.id === id);
  if (!branch) throw new Error("Branch not found.");

  branch.code = trimmedCode;
  branch.name = name.trim();
  return { ...branch };
}

export async function deleteBranch(id) {
  await delay();
  branches = branches.filter((b) => b.id !== id);
  // Deliberately NO renumbering logic here. `order` values may now have
  // gaps. That is fine — see utils/branchOrdering.js.
  return { success: true };
}

export async function reorderBranches(orderedIds) {
  await delay();
  // orderedIds: array of branch ids in the NEW desired sequence,
  // e.g. [3, 1, 2, 4, 5, 6, 7] after dragging Cyber Security to the top.
  // We rewrite `order` for every branch to match this exact sequence,
  // closing any pre-existing gaps at the same time.
  orderedIds.forEach((id, index) => {
    const branch = branches.find((b) => b.id === id);
    if (branch) branch.order = index;
  });
  return branches.map((b) => ({ ...b }));
}