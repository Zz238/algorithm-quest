import { FOUNDATION_TOPICS } from './topics/foundations.js';
import { TECHNIQUE_TOPICS } from './topics/techniques.js';
import { STRUCTURE_TOPICS } from './topics/structures.js';
import { MORE_STRUCTURE_TOPICS } from './topics/structures-more.js';
import { DP_TOPICS } from './topics/dynamic-programming.js';
import { ADVANCED_TOPICS } from './topics/advanced-algorithms.js';
export const TOPIC_LESSONS = [
  ...FOUNDATION_TOPICS,
  ...TECHNIQUE_TOPICS,
  ...STRUCTURE_TOPICS,
  ...MORE_STRUCTURE_TOPICS,
  ...DP_TOPICS,
  ...ADVANCED_TOPICS,
];
export const TOPIC_LESSON_BY_ID = Object.fromEntries(TOPIC_LESSONS.map((t) => [t.id, t]));
