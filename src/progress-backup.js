import { chapters } from './data/course.js';
import { cleanProgress, freshProgress } from './logic.js';
import { mergeLearning } from './study-state.js';

const object = (value) => value && typeof value === 'object' && !Array.isArray(value);
const union = (a, b) => [...new Set([...a, ...b])];
export function parseBackup(text, ids) {
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error('这不是有效的 JSON 文件，请选择本站导出的学习备份。');
  }
  if (!object(value) || value.version !== 1 || !Array.isArray(value.lessons) || !object(value.notes)) {
    throw new Error('这份备份的格式不受支持；请选择本站导出的学习记录 JSON。');
  }
  const cleaned = cleanProgress(value, ids);
  if (
    value.lessons.length &&
    !cleaned.lessons.length &&
    Object.keys(value.notes).length &&
    !Object.keys(cleaned.notes).length
  ) {
    throw new Error('这份文件的课程编号与当前课程不匹配。');
  }
  return cleaned;
}
export function describeBackup(before, incoming) {
  const countNotes = (notes) => Object.values(notes).filter((value) => value.trim()).length;
  return {
    reads: incoming.lessons.length,
    practice: incoming.mastery.length,
    chapters: incoming.bosses.length,
    notes: countNotes(incoming.notes),
    currentNotes: countNotes(before.notes),
    checkins: incoming.checkins.length,
    conflicts: Object.keys(incoming.notes).filter(
      (id) => Object.hasOwn(before.notes, id) && before.notes[id] !== incoming.notes[id],
    ),
  };
}
export function mergeBackup(current, incoming, ids, noteConflict = 'current') {
  const a = cleanProgress(current, ids),
    b = cleanProgress(incoming, ids),
    out = freshProgress();
  for (const key of ['lessons', 'mastery', 'bosses', 'checkins', 'bookmarks'])
    out[key] = union(a[key], b[key]);
  out.notes = noteConflict === 'backup' ? { ...a.notes, ...b.notes } : { ...b.notes, ...a.notes };
  out.bossTasks = { ...a.bossTasks };
  for (const [id, lc] of Object.entries(b.bossTasks)) {
    if (!out.bossTasks[id] || lc === chapters.find((c) => c.id === Number(id))?.boss.lc)
      out.bossTasks[id] = lc;
  }
  for (const day of union(Object.keys(a.dailyRead), Object.keys(b.dailyRead))) {
    out.dailyRead[day] = union(a.dailyRead[day] || [], b.dailyRead[day] || []);
  }
  out.learning = mergeLearning(a.learning, b.learning);
  return cleanProgress(out, ids);
}
export function resetProgress(current, scope) {
  if (scope === 'notes') return { ...current, notes: {} };
  if (scope === 'progress')
    return { ...freshProgress(), notes: current.notes, bookmarks: current.bookmarks };
  if (scope === 'all') return freshProgress();
  throw new RangeError('未知重置范围');
}
