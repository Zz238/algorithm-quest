import index from './course-index.json' with { type: 'json' };
export const chapters = index.chapters;
export const JAVA_INDEX = Object.fromEntries(index.java.map((u) => [u.id, u]));
export const COURSE_TERMS = Object.fromEntries(index.terms.map((t) => [t, true]));
export const CODING_INDEX = Object.fromEntries(index.coding.map((t) => [t.id, t]));
export const requiredLessons = (c) => c.lessons.filter((l) => !l.optional);
export const findLesson = (id) => chapters.flatMap((c) => c.lessons).find((l) => l.id === id);
export function lessonRoute(id) {
  const c = chapters.find((c) => c.lessons.some((l) => l.id === id));
  return c ? '/learn/' + c.id + '/' + c.lessons.findIndex((l) => l.id === id) : '/';
}
