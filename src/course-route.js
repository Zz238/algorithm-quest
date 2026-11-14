import { chapters, JAVA_INDEX as JAVA_BY_ID, CODING_INDEX } from './data/course-index.js';
import { splitStudyTarget } from './study-target.js';
import { ALGORITHM_TOPIC_BY_ID, ROADMAP_STAGES } from './data/algorithm-roadmap.js';

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
  ['/playground', 'playground'],
  ['/practice', 'practice'],
  ['/practice/review', 'practice-review'],
  ['/topics', 'topics'],
  ['/knowledge', 'knowledge'],
  ['/execution', 'execution'],
  ['/compare', 'compare'],
  ['/complexity', 'complexity'],
]);

function parseBaseRoute(input, terms = {}) {
  const path = input === '' ? '/' : input === '/checkin' ? '/account' : input;
  const fallback = { path, view: 'not-found', chapter: null, lesson: null, index: null, topic: null };
  if (staticRoutes.has(path)) return { ...fallback, view: staticRoutes.get(path) };
  const topicStage = /^\/topics\/stage\/([a-z-]+)$/.exec(path);
  if (topicStage && ROADMAP_STAGES.some((s) => s.id === topicStage[1]))
    return { ...fallback, view: 'topics', topicStage: topicStage[1] };
  const algorithmTopic = /^\/topics\/([a-z-]+)$/.exec(path);
  if (algorithmTopic && Object.hasOwn(ALGORITHM_TOPIC_BY_ID, algorithmTopic[1]))
    return { ...fallback, view: 'topics', topic: algorithmTopic[1] };
  const catalog = /^\/catalog\/([1-9]\d?)$/.exec(path);
  if (catalog && chapters.some((c) => c.id === Number(catalog[1])))
    return { ...fallback, view: 'home', selectedChapter: Number(catalog[1]) };
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
      /^transfer-[1-4]$/.test(review[1]))
  ) {
    return { ...fallback, view: 'review', topic: review[1] };
  }
  const practice = /^\/practice\/(review\/)?(code-[a-z0-9-]+)$/.exec(path);
  if (practice && Object.hasOwn(CODING_INDEX, practice[2]))
    return { ...fallback, view: practice[1] ? 'practice-review' : 'practice', topic: practice[2] };
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

export function parseRoute(input, terms = {}) {
  const split = splitStudyTarget(input);
  if (!split)
    return {
      path: input,
      view: 'not-found',
      chapter: null,
      lesson: null,
      index: null,
      topic: null,
      target: null,
    };
  const route = parseBaseRoute(split.path, terms);
  return { ...route, target: route.view === 'not-found' ? null : split.target };
}

const TITLES = {
  knowledge: '学习知识图谱',
  execution: '逐行执行与内存',
  compare: '算法对比辨析',
  complexity: '复杂度训练',
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
  playground: 'Java 在线实验台',
  practice: '编程练习库',
  topics: '算法专题与进阶路线',
  'practice-review': '编程复习',
  'not-found': '没有找到页面',
};
export function routeTitle({ view, lesson, chapter, topic, topicStage }) {
  const title =
    lesson?.title ||
    (view === 'boss'
      ? chapter.boss.title
      : view === 'java' && topic
        ? JAVA_BY_ID[topic].title
        : view === 'glossary' && topic
          ? topic + ' · 术语手册'
          : TITLES[view]);
  return (
    (view === 'topics'
      ? ALGORITHM_TOPIC_BY_ID[topic]?.title ||
        ROADMAP_STAGES.find((s) => s.id === topicStage)?.title ||
        TITLES.topics
      : view.startsWith('practice') && topic
        ? CODING_INDEX[topic].title
        : title) + ' · 算法之旅'
  );
}
