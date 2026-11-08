import { draftKey, readDraft, browserStorage } from './study-drafts.js';
export const CONCEPT_FOCUS = {
  position: {
    label: '下标、长度与元素值',
    section: 'lesson-concept-0',
    explanation: '先写出位置编号，再读取格子中的值；length 是格子数。',
  },
  update: {
    label: '旧值与更新顺序',
    section: 'lesson-concept-0',
    explanation: '一条赋值先用旧值算右边，再写入左边。',
  },
  loop: {
    label: '循环边界与内外层更新',
    section: 'lesson-concept-0',
    explanation: '先判断，再执行循环体，最后更新本层变量；外层要等内层结束。',
  },
  reference: {
    label: '引用与实际对象',
    section: 'lesson-concept-0',
    explanation: '复制引用不创建新对象；改对象的内容与改变量的指向是两件事。',
  },
  link: {
    label: '先保存后继，再改连接',
    section: 'lesson-concept-0',
    explanation: '改前面的去向之前，先让新节点接住旧的后半段。',
  },
  order: {
    label: '取放顺序与容器状态',
    section: 'lesson-concept-0',
    explanation: '栈关注最近加入的一项，队列关注最早等待的一项；查看与取走不同。',
  },
  hash: {
    label: '键、值与先查后写',
    section: 'lesson-concept-0',
    explanation: '先说明表里每个键和值代表什么，再决定查询、累计或写入的顺序。',
  },
  call: {
    label: '停止条件与返回位置',
    section: 'lesson-concept-1',
    explanation: '当前层保存自己的变量，子调用返回后，继续完成当前层尚未做的工作。',
  },
  tree: {
    label: '孩子关系与访问顺序',
    section: 'lesson-concept-0',
    explanation: '沿已存在的孩子连接推演；计算深度、遍历所有节点与逐层访问的目标不同。',
  },
  visited: {
    label: '发现、标记与处理',
    section: 'lesson-concept-0',
    explanation: '先说明何时算发现一个点，再检查是否已标记，避免重复加入待处理集合。',
  },
  state: {
    label: '状态含义与仍需保留的旧值',
    section: 'lesson-concept-0',
    explanation: '先用一句话定义状态代表什么，再列出初值、依赖和更新顺序。',
  },
  problem: {
    label: '任务目标与边界验证',
    section: 'lesson-concept-0',
    explanation: '先明确输入、输出和合法操作，再用最小及重复输入核对每一步。',
  },
};
const overrides = {
  '1-2': 'position',
  '2-5': 'position',
  '3-5': 'position',
  '4-1': 'position',
  '4-5': 'position',
  '4-6': 'update',
  '5-6': 'update',
  '6-5': 'reference',
  '6-1': 'reference',
  '6-2': 'link',
  '6-3': 'order',
  '6-4': 'order',
  '6-6': 'order',
  '8-1': 'call',
  '8-5': 'call',
};
export function lessonFocus(id) {
  const chapter = Number(id.split('-')[0]);
  const key =
    overrides[id] ||
    {
      1: 'problem',
      2: 'update',
      3: 'loop',
      4: 'position',
      5: 'update',
      6: 'order',
      7: 'hash',
      8: 'call',
      9: 'tree',
      10: 'visited',
      11: 'state',
      12: 'problem',
    }[chapter];
  return CONCEPT_FOCUS[key] ? { key, ...CONCEPT_FOCUS[key] } : null;
}
export function localLearningGaps(owner, lessons, progress, storage = browserStorage()) {
  return lessons.flatMap((lesson) => {
    const focus = lessonFocus(lesson.id);
    const raw = readDraft(draftKey(owner, lesson.id, 'exercise'), storage);
    const items = Array.isArray(raw?.items)
      ? raw.items.filter((item) => item && typeof item === 'object').slice(0, 30)
      : [];
    const errors = items.reduce(
      (n, item) => n + Math.max(0, Math.min(999, Number(item.concepts?.[focus?.key]) || 0)),
      0,
    );
    const unresolved = items.some((item) => item.issue && !item.passed);
    const review = progress.learning.review[lesson.id];
    if (!focus || (!review?.needsWork && !(errors && unresolved))) return [];
    return [{ id: lesson.id, title: lesson.title, focus, errors }];
  });
}
