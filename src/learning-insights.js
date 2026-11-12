import { inject } from 'vue';

export const LEARNING_INSIGHTS = Symbol('learning-insights');
export const useLearningInsights = () => inject(LEARNING_INSIGHTS, null);
export const ERROR_CATEGORIES = {
  concept: {
    title: '概念理解',
    advice: '回到术语和对比辨析，用自己的话说明为什么选择这种结构或算法。',
    path: '/compare',
  },
  boundary: {
    title: '边界条件',
    advice: '先手算空输入、单个元素和最后一次循环，再检查下标与终止条件。',
    path: '/execution',
  },
  complexity: {
    title: '复杂度判断',
    advice: '区分循环总次数、递归深度和额外空间，先从小规模输入数操作次数。',
    path: '/complexity',
  },
};
export function questionCategory(question) {
  if (ERROR_CATEGORIES[question.category]) return question.category;
  const text = [question.question, question.prompt, question.focus?.key, question.explanation].join(' ');
  if (/复杂度|O\(|空间|操作次数|增长速度/.test(text)) return 'complexity';
  if (/边界|越界|为空|空数组|空链表|null|终止|下标|最后|长度为 0/.test(text)) return 'boundary';
  return 'concept';
}
export function cleanAttempts(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (a) =>
        a &&
        typeof a.id === 'string' &&
        a.id.length < 100 &&
        typeof a.topic === 'string' &&
        a.topic.length < 100 &&
        typeof a.key === 'string' &&
        a.key.length < 500 &&
        typeof a.ok === 'boolean' &&
        ERROR_CATEGORIES[a.category] &&
        Number.isSafeInteger(a.at) &&
        a.at > 0 &&
        Number.isFinite(a.elapsed) &&
        a.elapsed >= 0 &&
        a.elapsed <= 3600000 &&
        [1, 2, 3].includes(a.difficulty),
    )
    .map(({ id, topic, key, ok, category, at, elapsed, difficulty }) => ({
      id,
      topic,
      key,
      ok,
      category,
      at,
      elapsed,
      difficulty,
    }))
    .slice(-600);
}
export function mergeAttempts(a = [], b = []) {
  return cleanAttempts(
    [...new Map([...a, ...b].map((item) => [item.id, item])).values()].sort(
      (x, y) => x.at - y.at || x.id.localeCompare(y.id),
    ),
  );
}
export function attemptSummary(attempts = []) {
  return Object.entries(ERROR_CATEGORIES)
    .map(([category, meta]) => {
      const items = attempts.filter((a) => a.category === category);
      const wrong = items.filter((a) => !a.ok).length;
      return {
        category,
        ...meta,
        total: items.length,
        wrong,
        rate: items.length ? wrong / items.length : 0,
      };
    })
    .sort((a, b) => b.rate - a.rate || b.wrong - a.wrong);
}
export function adaptiveLevel(attempts = []) {
  const recent = attempts.slice(-12);
  if (recent.length < 4) return 1;
  const rate = recent.filter((a) => a.ok).length / recent.length;
  const seconds = recent.reduce((sum, a) => sum + a.elapsed, 0) / recent.length / 1000;
  return rate >= 0.8 && seconds < 90 ? 3 : rate >= 0.55 ? 2 : 1;
}
export function recommendTasks(tasks, records, attempts = []) {
  const level = adaptiveLevel(attempts);
  const difficulty = (task) =>
    /进阶|工程|综合|阶段/.test(task.level) ? 3 : /基础|起步|入门/.test(task.level) ? 1 : 2;
  const score = (task) => {
    const record = records[task.id];
    const topic = attempts.filter((a) => a.topic === task.topic).slice(-10);
    return (
      (record?.failures ? Math.min(record.failures, 5) * 3 : 0) +
      topic.filter((a) => !a.ok).length * 2 +
      (record?.passedAt ? 0 : 8) -
      Math.abs(difficulty(task) - level) * 6
    );
  };
  return [...tasks].sort((a, b) => score(b) - score(a));
}
