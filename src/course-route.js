import { chapters } from './data/course.js';
import { JAVA_BY_ID } from './data/java-starter.js';
import { TRANSFER_BY_ID } from './data/learning-practice.js';

export const allLessons = chapters.flatMap((c) => c.lessons);
export const lessonIds = allLessons.map((l) => l.id);
const lessons = new Set(lessonIds);
const staticRoutes = new Map([
  ['/', 'home'],
  ['/search', 'search'],
  ['/glossary', 'glossary'],
  ['/progress', 'progress'],
  ['/account', 'account'],
  ['/login', 'login'],
  ['/privacy', 'privacy'],
  ['/notes', 'notes'],
  ['/java', 'java'],
  ['/review', 'review'],
  ['/trial', 'trial'],
]);

export function parseRoute(input, terms = {}) {
  const path = input === '' ? '/' : input === '/checkin' ? '/account' : input;
  const fallback = { path, view: 'not-found', chapter: null, lesson: null, index: null, topic: null };
  if (staticRoutes.has(path)) return { ...fallback, view: staticRoutes.get(path) };
  const course = /^\/(learn|boss)\/([1-9]\d?)(?:\/(0|[1-9]\d?))?$/.exec(path);
  if (course) {
    const [, view, id, slot] = course;
    const chapter = chapters.find((c) => c.id === Number(id));
    if (!chapter) return fallback;
    if (view === 'boss') return slot === undefined ? { ...fallback, view, chapter } : fallback;
    const index = Number(slot);
    return chapter.lessons[index]
      ? { ...fallback, view, chapter, index, lesson: chapter.lessons[index] }
      : fallback;
  }
  const java = /^\/java\/([a-z-]+)$/.exec(path);
  if (java && Object.hasOwn(JAVA_BY_ID, 'java-' + java[1]))
    return { ...fallback, view: 'java', topic: 'java-' + java[1] };
  const review = /^\/review\/([\w-]+)$/.exec(path);
  if (
    review &&
    (lessons.has(review[1]) ||
      Object.hasOwn(JAVA_BY_ID, review[1]) ||
      Object.hasOwn(TRANSFER_BY_ID, review[1]))
  ) {
    return { ...fallback, view: 'review', topic: review[1] };
  }
  const glossary = /^\/glossary\/([^/]+)$/.exec(path);
  if (glossary) {
    try {
      const topic = decodeURIComponent(glossary[1]);
      if (Object.hasOwn(terms, topic)) return { ...fallback, view: 'glossary', topic };
    } catch {
      /* A bad escape is an invalid link. */
    }
  }
  return fallback;
}

const TITLES = {
  home: '课程目录',
  search: '搜索课程与笔记',
  glossary: '术语手册',
  progress: '学习记录',
  account: '账号与学习足迹',
  notes: '私人学习笔记',
  login: '登录',
  privacy: '隐私说明',
  java: 'Java 预备课',
  review: '复习与阶段练习',
  trial: '零基础试学',
  'not-found': '没有找到页面',
};
export function routeTitle({ view, lesson, chapter, topic }) {
  const title =
    lesson?.title ||
    (view === 'boss'
      ? chapter.boss.title
      : view === 'java' && topic
        ? JAVA_BY_ID[topic].title
        : view === 'glossary' && topic
          ? topic + ' · 术语手册'
          : TITLES[view]);
  return title + ' · 算法之旅';
}
