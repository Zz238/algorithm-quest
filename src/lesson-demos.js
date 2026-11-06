import { buildTrace } from './traces.js';

// Both the printed figure and the lab use this descriptor and the same engine.
export function lessonDemo(lesson) {
  const { mode, initial } = lesson.learning.demo;
  return { mode, initial: { ...initial }, variant: lesson.learning.variant || '' };
}

export function bossDemo(boss, example = boss.cases[0]) {
  const input = example.input;
  const initial = Object.fromEntries(
    Object.entries(boss.demo.inputs).map(([target, source]) => [target, input[source]]),
  );
  if (Object.hasOwn(initial, 'a') && boss.demo.editableArray) {
    initial.array = initial.a.join(',');
    delete initial.a;
  }
  return { mode: boss.demo.mode, initial };
}

export const runDemo = ({ mode, initial, variant }) => buildTrace(mode, { ...initial, variant });
