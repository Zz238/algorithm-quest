import assert from 'node:assert/strict';
import { chapters, findLesson } from '../src/data/course.js';
import { parseRoute } from '../src/course-route.js';
import { lessonDemo, runDemo } from '../src/lesson-demos.js';
import { figureSteps } from '../src/data/figure-selections.js';
import { figurePlacement } from '../src/data/figure-placement.js';
import { CHAPTER_PREVIEWS, CHAPTER_BRIDGES, JAVA_START } from '../src/data/reading-guide.js';
import { splitStudyTarget, studyTarget, noteReferences, referenceText } from '../src/study-target.js';
import { frameChanges, phaseStops, tracePresets } from '../src/trace-tools.js';
import { buildTrace, parseTraceArray, TRACE_TYPES } from '../src/traces.js';
import { TASK_REPAIRS, TASK_STEPS } from '../src/data/java-writing-tasks.js';
import { JAVA_TASKS } from '../src/data/learning-practice.js';
import { PROJECT_TASKS, PROJECT_BOUNDARIES } from '../src/data/stage-projects.js';
import { answerState, scoreAnswer, withLessonFeedback } from '../src/answering.js';
import { freshProgress } from '../src/logic.js';
import { draftKey } from '../src/study-drafts.js';
import { localLearningGaps } from '../src/misconceptions.js';

const target = studyTarget('/learn/6/0', 'lesson-experiment', { step: 2, example: true });
assert.equal(parseRoute(target).lesson.id, '6-5');
assert.deepEqual(parseRoute(target).target, { section: 'lesson-experiment', step: 2, example: true });
for (const path of [
  '/learn/6/0?at=x',
  '/learn/6/0?at=lesson-experiment&step=-1',
  '/learn/6/0?at=lesson-experiment&step=NaN',
  '/learn/6/0?at=lesson-code&at=lesson-story',
  '/?at=lesson-story',
  '/learn/6/0?at=lesson-story&script=alert(1)',
  '/learn/6/0?at=lesson-story&input=%7B%22__proto__%22%3A1%7D',
])
  assert.equal(parseRoute(path).view, 'not-found', path);
const custom = studyTarget('/learn/4/1', 'lesson-experiment', {
  step: 4,
  input: { array: '7,8,9', i: 0 },
});
assert.deepEqual(splitStudyTarget(custom).target.input, { array: '7,8,9', i: 0 });
const note = referenceText('引用', '/learn/6/0', 'lesson-experiment', { step: 2, example: true });
assert.equal(noteReferences(note)[0].path, target);
assert.deepEqual(
  noteReferences('[坏链接](javascript:alert(1))\n[坏链接](#https://evil.test?at=lesson-code)'),
  [],
);
assert.deepEqual(JAVA_START, ['java-print', 'java-variable', 'java-condition']);
let figureCount = 0;
for (const chapter of chapters) {
  assert.equal(CHAPTER_PREVIEWS[chapter.id].length, 3);
  assert(CHAPTER_BRIDGES[chapter.id].length > 30);
  for (const lesson of chapter.lessons) {
    const picked = figureSteps(runDemo(lessonDemo(lesson)).frames, lesson.id);
    const positions = figurePlacement(lesson).slice(0, picked.length);
    assert.equal(positions.length, picked.length);
    assert(positions.every((i) => lesson.foundation.sections[i]));
    figureCount += positions.length;
  }
}
assert.equal(figureCount, 215);
assert(!CHAPTER_PREVIEWS[6].join('').match(/\bNode\b|peek\(|\.next/));
for (const mode of TRACE_TYPES) {
  const trace = buildTrace(mode);
  for (const point of phaseStops(mode, trace.frames)) assert(trace.frames[point.index].phase);
  for (const [, preset] of tracePresets(mode)) {
    const input = { ...preset };
    if (input.array) input.a = parseTraceArray(input.array);
    assert(buildTrace(mode, input).frames.length > 0, mode);
  }
}
const frames = buildTrace('reference').frames;
const changing = frames.findIndex((f) => f.statement.includes('通过 b 修改'));
assert(
  frameChanges(frames[changing - 1], frames[changing]).some((c) => c.before === '1' && c.after === '9'),
);
assert(!frameChanges(frames[changing - 1], frames[changing]).some((c) => c.before === '未设置'));
assert.deepEqual(
  frameChanges({ vars: { i: 0 }, values: [7] }, { vars: { i: 1 }, values: [] }).map((c) => c.after),
  ['1', '已移出'],
);
for (const id of Object.keys(JAVA_TASKS)) {
  assert.equal(TASK_STEPS[id].length, 3);
  const q = TASK_REPAIRS[id],
    state = answerState(q);
  state.value = q.answer;
  assert(scoreAnswer(q, state).ok, id);
  state.value = 'anotherLegalFormWeDidNotCompile';
  assert(scoreAnswer(q, state).unverified, id);
}
for (const [id, task] of Object.entries(PROJECT_TASKS)) {
  assert.equal(task.steps.length, 3);
  assert(task.cases.length >= 3);
  assert(PROJECT_BOUNDARIES[id].length >= 2);
}
const q = withLessonFeedback('3-5', findLesson('3-5').foundation.practice[0], 0),
  state = answerState(q);
state.pick = 0;
assert.match(scoreAnswer(q, state).message, /i\+1=3/);
const map = new Map(),
  storage = { getItem: (key) => map.get(key) };
map.set(
  draftKey('A', '3-5', 'exercise'),
  JSON.stringify({ items: [{ issue: 'choice', passed: false, concepts: { position: 1 } }] }),
);
assert.equal(localLearningGaps('A', [findLesson('3-5')], freshProgress(), storage).length, 1);
assert.equal(localLearningGaps('B', [findLesson('3-5')], freshProgress(), storage).length, 0);
console.log(
  'Learning flow passed: bounded note links, valid restored targets, 215 concept placements, presets, real state deltas, 11 writing ladders, 4 projects and owner-isolated feedback.',
);
