import { chapters } from '../src/data/course.js';
import { JAVA_UNITS } from '../src/data/java-starter.js';
import { TERMS } from '../src/data/terms.js';
import { CODING_TASKS } from '../src/data/coding-catalog.js';
import { readFileSync, writeFileSync } from 'node:fs';
const terms = new Set([
  ...Object.keys(TERMS),
  '哈希碰撞',
  ...chapters.flatMap((c) => c.lessons.flatMap((l) => l.foundation.terms.map((t) => t.term))),
]);
const value = {
  chapters: chapters.map((c) => ({
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    world: c.world,
    boss: { title: c.boss.title, lc: c.boss.lc },
    lessons: c.lessons.map((l) => ({ id: l.id, title: l.title, optional: !!l.optional })),
  })),
  java: JAVA_UNITS.map((u) => ({ id: u.id, title: u.title })),
  terms: [...terms].sort(),
  coding: CODING_TASKS.map((t) => ({ id: t.id, title: t.title, topic: t.topic })),
};
const file = new URL('../src/data/course-index.json', import.meta.url),
  text = JSON.stringify(value, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (readFileSync(file, 'utf8') !== text)
    throw new Error('Run npm run generate:index; generated navigation index is stale.');
  console.log('Navigation metadata matches course and coding sources.');
} else {
  writeFileSync(file, text);
  console.log('Generated lightweight navigation metadata.');
}
