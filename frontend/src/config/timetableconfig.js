// Single source of truth for the college's weekly time structure.
// Change values HERE; no other file hard-codes days, periods or lab length.

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// `breakBefore: true` marks the first period AFTER the lunch break.
export const PERIODS = [
  { no: 1, start: "09:00", end: "10:00" },
  { no: 2, start: "10:00", end: "11:00" },
  { no: 3, start: "11:00", end: "12:00" },
  { no: 4, start: "12:50", end: "13:45", breakBefore: true }, // lunch 12:00-12:50
  { no: 5, start: "13:45", end: "14:40" },
  { no: 6, start: "14:40", end: "15:35" },
  { no: 7, start: "15:35", end: "16:25" },
];

// A lab session occupies this many CONSECUTIVE periods (derived, never stored per subject).
export const LAB_BLOCK_PERIODS = 2;

// Produces the rows that the future /timeslots/ API endpoint will return (42 rows here).
export function buildTimeSlots() {
  const slots = [];
  let id = 1;
  DAYS.forEach((day) => {
    PERIODS.forEach((p) => {
      slots.push({ id: id++, day, period: p.no, start_time: p.start, end_time: p.end });
    });
  });
  return slots;
}

// Periods where a lab block can START without running across the lunch break.
// With the values above this returns [1, 2, 4, 5, 6]  (P3+P4 is illegal: lunch sits between them).
export function validLabStarts() {
  const starts = [];
  for (let i = 0; i + LAB_BLOCK_PERIODS <= PERIODS.length; i++) {
    let crossesBreak = false;
    for (let j = i + 1; j < i + LAB_BLOCK_PERIODS; j++) {
      if (PERIODS[j].breakBefore) crossesBreak = true;
    }
    if (!crossesBreak) starts.push(PERIODS[i].no);
  }
  return starts;
}