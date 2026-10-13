// Pure functions for the Generate page / solver (not used by the Subjects page).
// They turn a subject's syllabus hours (L-T-P) into weekly slot requirements.

import { DAYS, PERIODS, LAB_BLOCK_PERIODS } from "../config/timetableconfig";

// Slots a subject needs per week, taken directly from the syllabus hours.
//   lectures  : section-level, both subgroups together, 1 period each  (= L)
//   tutorials : subgroup-level, 1 period each                          (= T)
//   labBlocks : subgroup-level, LAB_BLOCK_PERIODS consecutive periods  (= P / 2)
export function deriveSessions({ L, T, P }) {
  return {
    lectures: L,
    tutorials: T,
    labBlocks: P > 0 ? Math.ceil(P / LAB_BLOCK_PERIODS) : 0,
  };
}

// Weekly load of one subgroup for a list of subjects, compared with the week's capacity.
export function sectionLoad(subjects) {
  let lectures = 0, tutorials = 0, labPeriods = 0;
  subjects.forEach((s) => {
    const d = deriveSessions(s);
    lectures += d.lectures;
    tutorials += d.tutorials;
    labPeriods += d.labBlocks * LAB_BLOCK_PERIODS;
  });
  const perSubgroup = lectures + tutorials + labPeriods;
  const capacity = DAYS.length * PERIODS.length;
  return { lectures, tutorials, labPeriods, perSubgroup, capacity, free: capacity - perSubgroup, ok: perSubgroup <= capacity };
}