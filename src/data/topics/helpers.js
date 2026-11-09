import { ALGORITHM_TOPIC_BY_ID, ROADMAP_SOURCE } from '../algorithm-roadmap.js';
export { C, N } from '../units/helpers.js';
export function T(id, data) {
  const meta = ALGORITHM_TOPIC_BY_ID[id];
  if (!meta) throw new Error('Unknown algorithm topic: ' + id);
  return {
    ...meta,
    ...data,
    sections: data.sections.map(([title, ...paragraphs]) => ({ title, paragraphs })),
    terms: data.terms.map(([term, meaning]) => ({ term, meaning })),
    example: {
      input: data.example[0],
      steps: data.example[1].map(([action, state, reason, cells]) => ({ action, state, reason, cells })),
      result: data.example[2],
    },
    cost: { time: data.cost[0], space: data.cost[1], condition: data.cost[2] },
    sources: [ROADMAP_SOURCE, ...(data.sources || []).map(([name, url]) => ({ name, url }))],
  };
}
