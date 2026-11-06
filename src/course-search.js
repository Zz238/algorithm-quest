import { chapters, codes, lessonRoute } from './data/course.js';
import { TERMS } from './data/terms.js';
import { JAVA_UNITS, javaRoute } from './data/java-starter.js';

export const glossaryPath = (term) => '/glossary/' + encodeURIComponent(term);
export const COURSE_TERMS = Object.assign(Object.create(null), TERMS);
for (const chapter of chapters)
  for (const lesson of chapter.lessons)
    for (const t of lesson.foundation.terms) {
      if (!Object.hasOwn(COURSE_TERMS, t.term))
        COURSE_TERMS[t.term] = ['课程术语', t.meaning, t.example];
    }

const normalize = (text) =>
  String(text ?? '')
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase('zh-CN');
const lessonData = chapters.flatMap((chapter) =>
  chapter.lessons.map((lesson, i) => ({
    id: lesson.id,
    title: lesson.title,
    chapter: chapter.id,
    index: i + 1,
    path: lessonRoute(lesson.id),
    lesson,
  })),
);
const aliases = { 哈希碰撞: ['碰撞'] };
if (!Object.hasOwn(COURSE_TERMS, '哈希碰撞'))
  COURSE_TERMS['哈希碰撞'] = [
    '哈希表',
    '不同的键被分到同一个候选桶。取值时仍然要核对键是否相等。',
    '教学分桶规则 key % 10 下，键 2 和 12 都进入桶 2。',
  ];
export const termLessons = Object.fromEntries(
  Object.keys(COURSE_TERMS).map((term) => [
    term,
    lessonData.filter(({ lesson }) =>
      lesson.foundation.terms.some((t) =>
        [term, ...(aliases[term] || [])].some((name) => normalize(t.term) === normalize(name)),
      ),
    ),
  ]),
);

const result = (path, title, summary, terms = '') => ({
  path,
  title,
  summary,
  index: normalize(title + ' ' + summary + ' ' + terms),
});
const lessons = lessonData.map(({ lesson, path, chapter, index }) =>
  result(
    path,
    lesson.title,
    '第 ' + chapter + ' 章 · 第 ' + index + ' 节 · ' + lesson.concept,
    [
      lesson.trap,
      lesson.story,
      lesson.learning.life.title,
      ...lesson.steps,
      ...lesson.foundation.example.steps,
      ...lesson.foundation.sections.flatMap((s) => [s.title, ...s.paragraphs]),
    ].join(' '),
  ),
);
const java = JAVA_UNITS.map((u) =>
  result(
    javaRoute(u.id),
    u.title,
    u.idea,
    u.story + ' ' + u.steps.flat().join(' ') + ' ' + u.example.source,
  ),
);
const exercise = chapters.map((c) =>
  result(
    '/boss/' + c.id,
    c.boss.title,
    '第 ' + c.id + ' 章 · LC ' + c.boss.lc + ' · ' + c.boss.description,
    [
      c.boss.question,
      ...c.boss.approach,
      ...c.boss.relation,
      c.boss.codeKey,
      codes[c.boss.codeKey].lines.join(' '),
    ].join(' '),
  ),
);
const terms = Object.entries(COURSE_TERMS).map(([term, [group, meaning, example]]) =>
  result(glossaryPath(term), term, meaning, group + ' ' + example),
);
const code = lessonData
  .filter(({ lesson }) => lesson.showCode)
  .map(({ lesson, path, chapter, index }) =>
    result(
      path,
      lesson.title,
      '第 ' + chapter + ' 章 · 第 ' + index + ' 节 · Java 示例',
      codes[lesson.codeKey].lines.join(' ') + ' ' + codes[lesson.codeKey].notes.join(' '),
    ),
  );

export function searchCourse(query, notes = {}) {
  const phrase = normalize(query).slice(0, 100),
    words = phrase.split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  // Personal notes are indexed on demand and only for the currently displayed save.
  const privateResults = lessonData.flatMap(({ id, path, title }) =>
    typeof notes[id] === 'string' && notes[id].trim() ? [result(path, title, notes[id].trim())] : [],
  );
  const rank = (item) =>
    (normalize(item.title) === phrase
      ? 100
      : normalize(item.title).startsWith(phrase)
        ? 60
        : normalize(item.title).includes(phrase)
          ? 40
          : 0) +
    (normalize(item.summary).includes(phrase) ? 15 : 0) +
    (item.index.includes(phrase) ? 5 : 0);
  return [
    ['lessons', '课程小节', [...lessons, ...java]],
    ['exercises', '章节练习', exercise],
    ['terms', '术语', terms],
    ['code', 'Java 代码', code],
    ['notes', '私人笔记', privateResults],
  ]
    .map(([key, label, entries]) => ({
      key,
      label,
      items: entries
        .filter((e) => words.every((w) => e.index.includes(w)))
        .sort((a, b) => rank(b) - rank(a))
        .map(({ path, title, summary }) => ({ path, title, summary })),
    }))
    .filter((g) => g.items.length);
}

export function filterTerms(query) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  return Object.entries(COURSE_TERMS).filter(([term, values]) =>
    words.every((w) => normalize(term + ' ' + values.join(' ')).includes(w)),
  );
}
