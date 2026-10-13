// src/services/sectionService.js
// MOCK DATA LAYER — Section has no free-text name. Only branchId + semester are stored;
// letter and subgroup names are always derived (see src/utils/sectionNaming.js), which is
// what makes "delete a middle section -> everything after it renumbers" work.

// Demo data. In-memory only, so it resets on a browser refresh — that is why it is seeded here.
// Branch ids (see branchService.js): 1 CS, 2 AL, 3 CY, 4 IO, 5 DS, 6 ME, 7 CE, 8 IT, 9 EE, 10 ECE.
// Plan format: { semester: numberOfSections }. Every branch has sections in both cycles
// (odd: 1,3,5,7 / even: 2,4,6,8). Section letters are derived from creation order.
const SEED_PLAN = {
  1: { 1: 3, 2: 3, 3: 2, 4: 2, 5: 2, 6: 2, 7: 1, 8: 1 }, // CS
  2: { 1: 2, 2: 2, 3: 2, 4: 1, 5: 1, 6: 2, 7: 1 },       // AL
  3: { 1: 2, 2: 2, 3: 1, 4: 1, 5: 1, 6: 1 },             // CY
  4: { 1: 1, 2: 1, 3: 2, 4: 2, 5: 1, 6: 1, 8: 1 },       // IO
  5: { 1: 2, 2: 2, 3: 1, 4: 1, 5: 2, 6: 1, 7: 1 },       // DS
  6: { 1: 2, 2: 2, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1 }, // ME
  7: { 1: 1, 2: 1, 3: 1, 4: 2, 5: 1, 6: 1 },             // CE
  8: { 1: 3, 2: 3, 3: 2, 4: 2, 5: 1, 6: 2, 7: 1 },       // IT
  9: { 1: 2, 2: 2, 3: 1, 4: 1, 5: 1, 6: 1, 8: 1 },       // EE
  10: { 1: 2, 2: 2, 3: 1, 4: 1, 5: 2, 6: 1, 7: 1 },      // ECE
};

let mockSections = [];
let nextId = 1;
Object.entries(SEED_PLAN).forEach(([branchId, bySemester]) => {
  Object.entries(bySemester).forEach(([semester, count]) => {
    for (let i = 0; i < count; i++) {
      mockSections.push({ id: nextId++, branchId: Number(branchId), semester: Number(semester) });
    }
  });
});

const simulateDelay = (data, ms = 400) =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

// Returns RAW sections only. Call deriveSections(raw, branches) in the
// component to get display-ready letter/subgroup data.
export async function getSections() {
  return simulateDelay([...mockSections]);
}

export async function createSection(branchId, semester) {
  // New section is appended to the end of the array, which places it
  // last within its (branchId, semester) group -> it automatically
  // gets the next available letter when derived.
  const newSection = { id: nextId++, branchId, semester };
  mockSections.push(newSection);
  return simulateDelay(newSection);
}

export async function updateSection(id, branchId, semester) {
  mockSections = mockSections.map((s) =>
    s.id === id ? { ...s, branchId, semester } : s
  );
  return simulateDelay(mockSections.find((s) => s.id === id));
}

export async function deleteSection(id) {
  mockSections = mockSections.filter((s) => s.id !== id);
  // No renumbering logic needed here — the next getSections() +
  // deriveSections() call recomputes every letter/subgroup name from
  // scratch based on the remaining sections' positions.
  return simulateDelay({ success: true });
}

/*
FUTURE SWAP — once /api/v1/sections/ is confirmed working:

import axios from "axios";
const API_URL = "/api/v1/sections/";

export async function getSections() {
  const res = await axios.get(API_URL);
  return res.data; // raw {id, branchId, semester} list — derive client-side as now,
                    // OR have the backend return derived letter/subgroups directly.
                    // Decide this with the backend dev before wiring up.
}
export async function createSection(branchId, semester) {
  const res = await axios.post(API_URL, { branch: branchId, semester });
  return res.data;
}
export async function updateSection(id, branchId, semester) {
  const res = await axios.patch(`${API_URL}${id}/`, { branch: branchId, semester });
  return res.data;
}
export async function deleteSection(id) {
  await axios.delete(`${API_URL}${id}/`);
  return { success: true };
}
*/