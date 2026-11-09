import assert from 'node:assert/strict';
import {
  ROADMAP_ITEMS,
  ROADMAP_STAGES,
  ALGORITHM_TOPICS,
  ALGORITHM_TOPIC_BY_ID,
  roadmapItemRoute,
} from '../src/data/algorithm-roadmap.js';
import { TOPIC_LESSONS, TOPIC_LESSON_BY_ID } from '../src/data/algorithm-topics.js';
import { CHAPTER_DEPTH } from '../src/data/chapter-depth.js';
import { LESSON_DEPTH } from '../src/data/lesson-depth.js';
import { chapters, COURSE_TERMS } from '../src/data/course-index.js';
import { CODING_BY_ID } from '../src/data/coding-catalog.js';
import { TOPIC_CODING_TASKS } from '../src/data/topic-coding.js';
import { parseRoute } from '../src/course-route.js';
import { topicPrerequisite } from '../src/topic-links.js';
import { loadAlgorithmTopic } from '../src/data/topic-loader.js';
import { answerState, scoreAnswer } from '../src/answering.js';
import { TOPIC_TRACE_DEFAULTS, generateTopicTrace } from '../src/topic-traces.js';

assert.equal(ROADMAP_ITEMS.length, 66);
assert.equal(ROADMAP_ITEMS.filter((t) => t.lesson).length, 26);
assert.equal(ALGORITHM_TOPICS.length, 41);
assert.equal(new Set(TOPIC_LESSONS.map((t) => t.id)).size, ALGORITHM_TOPICS.length);
assert.deepEqual(
  new Set(Object.keys(LESSON_DEPTH)),
  new Set(chapters.flatMap((c) => c.lessons.map((l) => l.id))),
);
assert.equal(Object.keys(CHAPTER_DEPTH).length, 12);
for (const c of chapters) {
  const depth = CHAPTER_DEPTH[c.id];
  assert(depth.focus && depth.operations.length >= 3 && depth.applications.length >= 2);
  for (const id of depth.topics)
    assert(
      ROADMAP_ITEMS.some((t) => t.id === id),
      `chapter ${c.id}: ${id}`,
    );
  for (const lesson of c.lessons) {
    const section = LESSON_DEPTH[lesson.id];
    assert(section.title && section.paragraphs.length >= 2, lesson.id);
  }
}
for (const t of ROADMAP_ITEMS) {
  assert.notEqual(parseRoute(roadmapItemRoute(t), COURSE_TERMS).view, 'not-found', t.id);
  assert(ROADMAP_STAGES.some((s) => s.id === t.stage));
}
let checks = 0;
for (const t of TOPIC_LESSONS) {
  assert(ALGORITHM_TOPIC_BY_ID[t.id]);
  assert.equal((await loadAlgorithmTopic(t.id)).id, t.id);
  assert(t.story && t.definition && t.mistake && t.challenge && t.requires.length, t.id);
  assert(
    t.terms.length >= 3 && t.sections.length >= 2 && t.sections.every((s) => s.paragraphs.length >= 2),
  );
  assert(t.example.input && t.example.result && t.example.steps.length >= 3, t.id);
  assert(
    t.example.steps.every((s) => s.action && s.state && s.reason),
    t.id,
  );
  assert(t.cost.time && t.cost.space && t.cost.condition, t.id);
  for (const s of t.sources) assert.equal(new URL(s.url).protocol, 'https:');
  for (const id of t.requires) {
    const prerequisite = topicPrerequisite(id);
    assert(prerequisite, `${t.id}: missing prerequisite ${id}`);
    assert.notEqual(parseRoute(prerequisite.path, COURSE_TERMS).view, 'not-found');
  }
  assert.equal(t.checks.length, 2);
  for (const q of t.checks) {
    assert(
      q.question && q.explanation && !/上述|上面的|如上|同样的物品|同一棵树|第一组/.test(q.question),
      t.id + ': context missing',
    );
    const state = answerState(q);
    if (q.kind === 'choice') {
      assert(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length);
      state.pick = q.answer;
    } else
      state.value = Array.isArray(q.answer)
        ? q.answer.map(String)
        : typeof q.answer === 'boolean'
          ? q.answer
          : String(q.answer);
    assert.equal(scoreAnswer(q, state).ok, true, t.id + ': typed answer mismatch');
    checks++;
  }
  if (t.coding) assert(CODING_BY_ID[t.coding], t.id + ': missing coding task');
}
assert.equal(checks, 82);
assert.equal(TOPIC_CODING_TASKS.length, 12);
for (const task of TOPIC_CODING_TASKS) {
  const topic = TOPIC_LESSON_BY_ID[task.topic.slice(6)];
  assert.equal(topic?.coding, task.id, task.id + ': wrong lesson/task connection');
}
// A topic cannot require itself, or create a prerequisite loop among the new topics.
function visit(id, path = []) {
  assert(!path.includes(id), 'Prerequisite cycle: ' + [...path, id].join(' → '));
  for (const next of TOPIC_LESSON_BY_ID[id]?.requires || [])
    if (TOPIC_LESSON_BY_ID[next]) visit(next, [...path, id]);
}
for (const t of TOPIC_LESSONS) visit(t.id);

const expected = {
  'prefix-sum': 8,
  'sliding-window': 6,
  'selection-sort': [1, 2, 3],
  'counting-sort': [0, 1, 2, 2],
  'monotonic-stack': [3, 3, -1],
  'monotonic-queue': [3, 3, 2],
  'linear-dp': 4,
  'fenwick-tree': 11,
};
for (const [id, input] of Object.entries(TOPIC_TRACE_DEFAULTS)) {
  const snapshot = JSON.stringify(input);
  assert.deepEqual(generateTopicTrace(id, input).result, expected[id], id + ': fixed example');
  assert.equal(JSON.stringify(input), snapshot, 'Input config must remain unchanged');
}
// Deliberately simple reference enumerations validate results across fixed-seed inputs.
let seed = 0x51ab71;
const random = (n) => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed % n;
};
const sum = (a) => a.reduce((s, v) => s + v, 0);
for (let trial = 0; trial < 80; trial++) {
  const a = Array.from({ length: 1 + random(12) }, () => random(31) - 15),
    array = a.join(',');
  const k = 1 + random(a.length),
    left = random(a.length),
    right = left + random(a.length - left);
  const windows = Array.from({ length: a.length - k + 1 }, (_, i) => a.slice(i, i + k));
  assert.equal(
    generateTopicTrace('prefix-sum', { array, left, right }).result,
    sum(a.slice(left, right + 1)),
  );
  assert.equal(generateTopicTrace('sliding-window', { array, k }).result, Math.max(...windows.map(sum)));
  assert.deepEqual(
    generateTopicTrace('selection-sort', { array }).result,
    [...a].sort((a, b) => a - b),
  );
  const nonnegative = a.map((x) => Math.abs(x) % 11);
  assert.deepEqual(
    generateTopicTrace('counting-sort', { array: nonnegative.join(',') }).result,
    [...nonnegative].sort((a, b) => a - b),
  );
  assert.deepEqual(
    generateTopicTrace('monotonic-stack', { array }).result,
    a.map((v, i) => a.slice(i + 1).find((x) => x > v) ?? -1),
  );
  assert.deepEqual(
    generateTopicTrace('monotonic-queue', { array, k }).result,
    windows.map((w) => Math.max(...w)),
  );
  let best = -Infinity;
  for (let i = 0; i < a.length; i++)
    for (let j = i; j < a.length; j++) best = Math.max(best, sum(a.slice(i, j + 1)));
  assert.equal(generateTopicTrace('linear-dp', { array }).result, best);
  const at = random(a.length),
    delta = random(41) - 20,
    end = random(a.length + 1);
  assert.equal(
    generateTopicTrace('fenwick-tree', { array, at, delta, end }).result,
    sum(a.slice(0, end)) + (at < end ? delta : 0),
  );
}
const trace = generateTopicTrace('selection-sort', { array: '3,1,2' });
assert.deepEqual(trace.steps[0].cells, [3, 1, 2], 'Past frames must not turn into the final state');
assert.deepEqual(trace.steps.at(-1).cells, [1, 2, 3]);
for (const [id, input] of [
  ['prefix-sum', { array: '1,2', left: 1, right: 0 }],
  ['sliding-window', { array: '1,2', k: 0 }],
  ['counting-sort', { array: '-1,2' }],
  ['fenwick-tree', { array: '2', at: 0, delta: 1, end: 2 }],
  ['selection-sort', { array: '' }],
  ['selection-sort', { array: '1,no' }],
  ['unknown', { array: '1' }],
])
  assert.throws(() => generateTopicTrace(id, input));
console.log(
  `Roadmap passed: 66 mapped points, 72 expanded lessons, 41 topic pages, ${checks} self-contained checks, 12 linked Java tasks, acyclic prerequisites and 640 fixed-seed algorithm comparisons.`,
);
