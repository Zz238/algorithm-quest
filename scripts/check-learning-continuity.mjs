import assert from 'node:assert/strict';
import { chapters } from '../src/data/course.js';
import { buildTrace } from '../src/traces.js';
import { lessonDemo, runDemo } from '../src/lesson-demos.js';

// Expected results are independent, concrete lesson examples. A lab silently
// switching back to a shared default input must fail this check.
const expected = {
  '1-1': 5,
  '1-2': 2,
  '1-3': 16,
  '1-5': 6,
  '1-4': [1, 3, 6],
  '1-6': 4,
  '2-1': 5,
  '2-2': 5,
  '2-3': false,
  '2-4': 17,
  '2-5': 20,
  '2-6': -6,
  '3-1': 6,
  '3-2': 6,
  '3-3': 3,
  '3-5': 3,
  '3-4': 6,
  '3-6': 1,
  '4-1': 8,
  '4-5': 2,
  '4-6': { a: [1, 2, 3], b: [9, 2, 3] },
  '4-2': true,
  '4-3': 2,
  '4-4': 4,
  '5-5': [1, 2, 3],
  '5-6': [1, 3, 2],
  '5-1': [1, 2, 3],
  '5-2': [1, 2, 3],
  '5-3': [1, '2甲', '2乙'],
  '5-4': 3,
  '6-5': [9, 2],
  '6-1': 3,
  '6-2': [1, 2, 3],
  '6-3': [7],
  '6-4': 7,
  '6-6': true,
  '7-1': { 2: 2, 3: 1 },
  '7-2': { 2: 2, 3: 1 },
  '7-5': 2,
  '7-3': [0, 1],
  '7-4': 'b',
  '7-6': [0, 1],
  '8-1': 10,
  '8-5': 6,
  '8-2': [1, 2, 3, 5],
  '8-3': [[], [1], [1, 2], [2]],
  '8-4': [[], [1], [1, 2], [2]],
  '8-6': [1, 2, 3],
  '9-5': 3,
  '9-1': 3,
  '9-2': [2, 1, 3],
  '9-6': 3,
  '9-3': true,
  '9-4': 2,
  '10-1': 4,
  '10-5': 3,
  '10-2': 4,
  '10-6': 4,
  '10-3': [
    [2, 2, 0],
    [2, 0, 0],
  ],
  '10-4': [0, 2, 3],
  '11-1': 2,
  '11-2': 5,
  '11-3': 8,
  '11-5': 5,
  '11-6': 3,
  '11-4': 35,
  '12-1': 4,
  '12-5': 3,
  '12-2': 5,
  '12-3': 3,
  '12-4': 5,
  '12-6': '先确认任务和前提，再选方法',
};
const seen = new Set();
let frames = 0;
for (const chapter of chapters) {
  const intro = chapter.introduction;
  assert(
    intro && intro.why.length >= 2 && intro.definition.length > 30,
    `Chapter ${chapter.id}: opening and definition`,
  );
  assert(intro.concepts.length >= 4 && intro.path.length >= 3 && intro.example.steps.length >= 3);
  assert(intro.check.options.length === 3 && intro.check.explanation.length > 10);
  for (const lesson of chapter.lessons) {
    assert(!seen.has(lesson.id));
    seen.add(lesson.id);
    const { life, demo, codeExplanation } = lesson.learning;
    assert(
      life.story.length > 25 &&
        life.steps.length >= 3 &&
        life.mapping.length > 15 &&
        life.boundary.length > 15,
      `${lesson.id}: everyday example must map to the concept and name its limits`,
    );
    assert(
      demo.explanation.length > 15 && codeExplanation.length > 8,
      `${lesson.id}: experiment/code bridge`,
    );
    const list = runDemo(lessonDemo(lesson)).frames;
    assert(list.length >= 2);
    for (const f of list) {
      assert(
        f.values.every((v) => v !== undefined),
        `${lesson.id}: missing data in diagram`,
      );
      assert(
        f.active.every((i) => Number.isInteger(i) && i >= 0 && i < f.values.length),
        `${lesson.id}: invalid highlighted position`,
      );
      for (const edge of f.edges || [])
        assert(
          edge[0] < f.values.length && edge[1] < f.values.length,
          `${lesson.id}: edge to a nonexistent node`,
        );
    }
    frames += list.length;
    if (lesson.id in expected)
      assert.deepEqual(
        list.at(-1).output,
        expected[lesson.id],
        `${lesson.id}: experiment no longer matches its stated example`,
      );
  }
}
assert.equal(seen.size, 72);
const lesson = (id) => chapters.flatMap((c) => c.lessons).find((l) => l.id === id);
for (const [id, mode] of [
  ['6-5', 'reference'],
  ['6-1', 'linkedRead'],
  ['6-2', 'linked'],
  ['6-3', 'stackBasic'],
  ['6-6', 'stack'],
])
  assert.equal(lesson(id).learning.demo.mode, mode);
assert(
  !lesson('6-5').showCode && !lesson('6-1').showCode && !lesson('6-3').showCode,
  'Definitions and basic stack operations must not show the insertion/bracket program prematurely.',
);
assert(lesson('6-2').showCode && lesson('6-6').showCode);
for (const id of ['2-1', '2-2', '2-3', '2-4', '2-6', '3-1', '3-3']) {
  const d = lesson(id).learning.demo,
    t = buildTrace(d.mode, d.initial);
  assert(
    t.frames.every((f) => f.values.length === 0),
    `${id}: scalar operation must not display an unrelated default array`,
  );
}
const coins = buildTrace('coinGreedy').frames;
assert(coins.some((f) => f.vars.count === 3) && coins.some((f) => f.vars.count === 2));
const bag = buildTrace('knapsack01').frames;
assert(
  bag.slice(1, 5).every((f) => f.values.every((v) => v <= 15)),
  'One weight-1 item must not be reused during its own capacity pass.',
);
assert.deepEqual(buildTrace('palindrome', { text: 'hello' }).frames.at(-1).output, false);
assert.equal(buildTrace('palindrome', { text: '' }).frames.at(-1).output, true);
console.log(
  `Learning continuity passed: 12 chapter openings, 72 mapped everyday examples, ${frames} lesson frames and ${Object.keys(expected).length} independent expected results; references/nodes/insertion/stack are staged separately.`,
);
