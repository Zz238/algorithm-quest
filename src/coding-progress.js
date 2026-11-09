import { inject } from 'vue';
import { localDateKey, shiftDateKey } from './study-state.js';
export const CODING_SERVICE = Symbol('coding-progress');
export const useCodingProgress = () => inject(CODING_SERVICE, null);
const intervals = [1, 3, 7, 14, 30];
export function recordCoding(progress, id, result, now = Date.now(), day = localDateKey()) {
  if (!/^code-[a-z0-9-]{1,60}$/.test(id)) return;
  const previous = progress.learning.coding[id] || {};
  const passed = result.passed === true;
  const independent = passed && result.assisted === false;
  const box =
    independent && previous.due <= day && previous.lastDay !== day
      ? Math.min(4, (previous.box || 0) + 1)
      : independent
        ? previous.box || 0
        : 0;
  progress.learning.coding[id] = {
    at: Math.max(now, (previous.at || 0) + 1),
    passedAt: passed ? now : previous.passedAt || 0,
    independentAt: independent ? now : previous.independentAt || 0,
    attempts: Math.min(10000, (previous.attempts || 0) + 1),
    failures: Math.min(10000, (previous.failures || 0) + (passed ? 0 : 1)),
    passed,
    assisted: result.assisted !== false,
    box,
    lastDay: day,
    due: passed
      ? previous.due > day && independent
        ? previous.due
        : shiftDateKey(day, intervals[box])
      : day,
  };
}
