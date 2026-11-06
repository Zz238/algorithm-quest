import assert from 'node:assert/strict';
import { chapters, codes, findLesson } from '../src/data/course.js';
import { CHAPTER_FIGURES, LESSON_MILESTONES, figureSteps } from '../src/data/figure-selections.js';
import { bossDemo, lessonDemo, runDemo } from '../src/lesson-demos.js';
import { TRACE_TYPES, buildTrace } from '../src/traces.js';
import { edgeGeometry, pictureFor, pictureTextSize } from '../src/trace-picture.js';

let lessonPictures = 0,
  chapterPictures = 0,
  cases = 0;
assert.throws(() => buildTrace('misspelling'), /未知/);
assert.throws(() => buildTrace('constructor'), /未知/);
for (const chapter of chapters) {
  assert.equal(CHAPTER_FIGURES[chapter.id].length, 3);
  for (const [id, label] of CHAPTER_FIGURES[chapter.id]) {
    assert(chapter.lessons.includes(findLesson(id)), id);
    assert(label.length > 3);
    chapterPictures++;
  }
  for (const lesson of chapter.lessons) {
    assert(codes[lesson.codeKey], lesson.id);
    const demo = lessonDemo(lesson),
      trace = runDemo(demo),
      frames = trace.frames;
    const picked = figureSteps(frames, lesson.id);
    assert(picked.length >= 2);
    assert.equal(picked[0].index, 0);
    assert.equal(picked.at(-1).index, frames.length - 1);
    if (LESSON_MILESTONES[lesson.id] && frames.length > 2) {
      assert(
        LESSON_MILESTONES[lesson.id](picked[1].frame, picked[1].index),
        lesson.id + ' selected milestone does not exist',
      );
    }
    for (const { frame, index } of picked) assert.equal(frame, frames[index]);
    lessonPictures += picked.length;
  }
  for (const example of chapter.boss.cases) {
    const demo = bossDemo(chapter.boss, example);
    const { frames } = runDemo(demo);
    assert.deepEqual(
      frames.at(-1).output,
      example.output,
      'chapter ' + chapter.id + ' example mismatch',
    );
    for (const [key, source] of Object.entries(chapter.boss.demo.inputs)) {
      const actual = demo.initial[key] ?? (key === 'a' && demo.initial.array?.split(',').map(Number));
      assert.deepEqual(actual, example.input[source], 'chapter ' + chapter.id + ' lost an input field');
    }
    cases++;
  }
}
for (const mode of TRACE_TYPES) {
  const { frames, code } = buildTrace(mode);
  for (const frame of frames) {
    const p = pictureFor(frame, mode);
    assert(
      Number.isInteger(frame.line) && frame.line >= -1 && frame.line < code.length,
      mode + ' code step is outside the snippet',
    );
    assert(p.width > 0 && p.height > 0 && p.cells.length);
    assert(
      p.cells.every(
        (c) => typeof c.value === 'string' && Number.isFinite(pictureTextSize(c.value, c.width)),
      ),
    );
    for (const edge of p.edges)
      assert(Object.values(edgeGeometry(edge, p.cells)).every(Number.isFinite), mode + ' invalid edge');
  }
}
const merge = buildTrace('merge', { a: [5, 2, 3, 1] }).frames;
assert(merge.some((f) => f.phase === 'compare' && f.vars.l === 0 && f.stack.length === 1));
assert(merge.some((f) => f.phase === 'split' && f.stack.length === 2));
for (const [i, frame] of merge.entries()) {
  const before = merge[i - 1];
  if (frame.phase === 'take') {
    assert.deepEqual(frame.values, before.values, 'Merging into temp must not change a.');
    assert.equal(frame.secondary[frame.vars.dest], frame.values[frame.vars.from]);
  }
  if (frame.phase === 'write') {
    assert.equal(frame.values[frame.vars.p], frame.secondary[frame.vars.p]);
    assert(
      frame.values.every((v, j) => j === frame.vars.p || v === before.values[j]),
      'Only the current destination may change.',
    );
  }
}
const quick = buildTrace('quick', { a: [4, 3, 3, 1, 2] }).frames;
assert(quick.some((f) => f.phase === 'call-left' || f.phase === 'call-right'));
for (const [i, frame] of quick.entries()) {
  if (frame.phase !== 'advance') continue;
  const before = quick[i - 1];
  assert.equal(before.phase, 'swap');
  assert.deepEqual(frame.values, before.values);
  assert.equal(frame.vars.i, before.vars.i + 1);
  assert.equal(frame.vars.j, before.vars.j - 1);
}
const tree = { root: [4, 1, 3, null, 2] };
for (const [order, output] of Object.entries({
  preorder: [4, 1, 2, 3],
  inorder: [1, 2, 4, 3],
  postorder: [2, 1, 3, 4],
})) {
  assert.deepEqual(buildTrace('preorder', { ...tree, order }).frames.at(-1).output, output);
}
console.log(
  'Verified ' +
    lessonPictures +
    ' lesson figures, ' +
    chapterPictures +
    ' chapter figures, ' +
    cases +
    ' case traces and all diagram types.',
);
