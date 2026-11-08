// Placement refers to the concept that the selected state explains. Frame selection
// still comes from the algorithm engine; no independent illustration state exists.
const placement = {
  '2-5': [0, 1, 1],
  '3-2': [0, 0, 1],
  '3-5': [0, 0, 1],
  '4-5': [0, 0, 1],
  '4-6': [0, 1, 1],
  '5-1': [0, 0, 1],
  '5-2': [0, 0, 1],
  '6-5': [0, 0, 2],
  '6-1': [0, 2, 2],
  '6-2': [0, 1, 1],
  '6-3': [0, 1, 1],
  '6-4': [0, 1, 1],
  '6-6': [0, 1, 2],
  '7-1': [0, 0, 1],
  '8-1': [0, 1, 1],
  '8-5': [0, 0, 1],
  '8-2': [0, 1, 1],
  '8-3': [0, 1, 1],
  '9-1': [0, 1, 1],
  '9-2': [0, 0, 1],
  '9-6': [0, 1, 1],
  '10-5': [0, 0, 1],
  '10-2': [0, 0, 1],
  '11-5': [0, 1, 1],
};
export function figurePlacement(lesson) {
  const list = placement[lesson.id] || [0, 0, 1];
  return list.map((index) => Math.min(index, lesson.foundation.sections.length - 1));
}
