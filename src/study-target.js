export const SECTION_LABELS = {
  'lesson-story': '生活例子',
  'lesson-concepts': '概念',
  'lesson-figures': '图解回顾',
  'lesson-experiment': '逐步实验',
  'lesson-code': 'Java 实现',
  'lesson-practice': '练习',
  'lesson-challenge': '独立挑战',
  'java-experiment': 'Java 小步实验',
};
const sectionOK = (value) =>
  Object.hasOwn(SECTION_LABELS, value) || /^lesson-concept-[0-9]{1,2}$/.test(value);
export function splitStudyTarget(raw) {
  if (typeof raw !== 'string' || raw.length > 2400) return null;
  const [path, query, ...extra] = raw.split('?');
  if (extra.length) return null;
  if (query === undefined) return { path, target: null };
  const params = new URLSearchParams(query);
  const allowed = new Set(['at', 'step', 'example', 'input']);
  if ([...params.keys()].some((k) => !allowed.has(k) || params.getAll(k).length !== 1)) return null;
  if (!/^\/(learn|boss|java)\//.test(path)) return null;
  const section = params.get('at');
  if (!section || !sectionOK(section)) return null;
  const target = { section };
  if (params.has('step')) {
    if (!/^(0|[1-9]\d{0,3})$/.test(params.get('step'))) return null;
    target.step = Number(params.get('step'));
  }
  if (params.has('example')) {
    if (params.get('example') !== '1') return null;
    target.example = true;
  }
  if (params.has('input')) {
    try {
      const input = JSON.parse(params.get('input'));
      if (!input || Array.isArray(input) || typeof input !== 'object') return null;
      if (
        Object.entries(input).some(
          ([k, v]) =>
            !['array', 'text', 'i', 'target', 'n', 'order'].includes(k) ||
            !(
              (typeof v === 'string' && v.length <= 100) ||
              (typeof v === 'number' && Number.isFinite(v))
            ),
        )
      )
        return null;
      target.input = input;
    } catch {
      return null;
    }
  }
  return { path, target };
}
export function studyTarget(path, section, options = {}) {
  const params = new URLSearchParams({ at: section });
  if (Number.isInteger(options.step)) params.set('step', options.step);
  if (options.example) params.set('example', '1');
  if (options.input) params.set('input', JSON.stringify(options.input));
  const value = path.split('?')[0] + '?' + params;
  return splitStudyTarget(value) ? value : path.split('?')[0];
}
export function referenceText(title, path, section, options = {}) {
  const label = options.label || SECTION_LABELS[section] || '概念讲解';
  return '[' + title + ' · ' + label + '](#' + studyTarget(path, section, options) + ')';
}
// Only our own bounded hash links become clickable. User HTML is always plain text.
export function noteReferences(body) {
  const result = [];
  // Lesson names can themselves contain brackets, e.g. a[i+1].
  const expression = /\[([^\n]{1,180}?)\]\(#([^\s)]+)\)/g;
  for (const match of body.matchAll(expression)) {
    const target = splitStudyTarget(match[2]);
    if (target?.target) result.push({ label: match[1], path: match[2] });
  }
  return result.slice(0, 24);
}
