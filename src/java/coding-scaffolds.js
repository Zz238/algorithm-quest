import { buildLearnerProgram } from './coding-program.js';

// Activities reuse reviewed course solutions; generated snippets never run as JavaScript.
const STEP_OVERRIDES = {
  'code-greeting': [
    '确定返回文字由问候语和传入名字组成。',
    '按题目要求保留中文逗号，把两段文字连接。',
    '交回拼接后的字符串。',
  ],
  'code-increase': ['读取传入的旧计数。', '在旧值上增加题目要求的数量。', '交回增加后的新值。'],
  'code-even': [
    '明确 0 和负数也要按同一规则判断。',
    '检查整数除以 2 后是否没有余数。',
    '交回表示判断结果的布尔值。',
  ],
  'code-core-2-4': ['读取两个传入参数。', '用加法得到它们的和。', '把计算结果交回调用者。'],
  'code-core-3-2': [
    '在循环前准备累计值，空数组的总和为 0。',
    '逐格遍历数组，把当前值加入累计值。',
    '循环结束后交回总和。',
  ],
  'code-core-4-3': [
    '从第一个下标开始，逐格查看数组。',
    '找到等于目标的元素时，立即交回下标。',
    '遍历后仍未找到，交回题目约定的未找到标记。',
  ],
  'code-core-5-1': [
    '外层确定本轮需要排到哪里，逐轮缩短范围。',
    '内层比较相邻两格，顺序错误时用临时变量交换。',
    '重复各轮，直接修改传入数组。',
  ],
  'code-core-6-2': [
    '先让新节点连接原来的后半段。',
    '再把前一个节点连接到新节点。',
    '核对先后顺序，避免丢失原链表。',
  ],
  'code-core-7-2': [
    '创建计数表，记录每个数字已经出现几次。',
    '遍历数组，把当前数字的旧次数增加 1。',
    '读取目标数字的次数，未出现时按 0 处理。',
  ],
  'code-core-8-1': [
    '先判断是否到达最小问题，并给出停止条件。',
    '调用更小的问题，保证每次都更接近停止。',
    '把当前数字与子问题的答案组合后交回。',
  ],
  'code-core-9-1': [
    '空节点的深度为 0，先处理这个边界。',
    '分别求左子树和右子树的深度。',
    '取较深的一边，再加当前节点这一层。',
  ],
  'code-core-10-2': [
    '准备访问标记与队列，把起点登记入队。',
    '逐个取出地点，登记从未访问过的相邻地点。',
    '累计已处理的地点数量，队列清空后交回。',
  ],
  'code-core-11-2': [
    '先处理最小输入，准备状态表和初始走法。',
    '从小到大计算当前台阶，使用前两格的已知答案。',
    '交回目标台阶对应的表项。',
  ],
  'code-core-12-4': [
    '记录目前最低买入价和已知最大收益。',
    '逐日先计算当天卖出收益，再更新最低价格。',
    '交回最大收益，不能获利时保持为 0。',
  ],
  'code-binary-search': [
    '准备闭区间左右边界，空数组应自然退出。',
    '比较中点和目标，排除中点并缩小候选区间。',
    '找到时交回下标，区间耗尽时交回未找到标记。',
  ],
  'code-two-sum': [
    '准备哈希表，保存已经见过的数字及下标。',
    '遍历时计算需要的搭档，先查询搭档再登记自己。',
    '找到时交回两个不同位置，否则交回空数组。',
  ],
  'code-reverse-array': [
    '让两个指针分别站在数组左右两端。',
    '交换两端后一起向中间移动，直到相遇。',
    '交回已经原地反转的数组。',
  ],
  'code-chain-length': [
    '准备计数器和指向当前节点的引用。',
    '只要当前引用不为空，就计数并沿 next 前进。',
    '到达链尾后交回节点数量。',
  ],
};

// Retain source positions; repeated names inside strings must never become holes.
function tokensOf(source) {
  const tokens = [];
  const pattern =
    /\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[A-Za-z_$][\w$]*|\d+(?:\.\d+)?|>>>=|>>>|<<=|>>=|==|!=|<=|>=|&&|\|\||\+\+|--|\+=|-=|\*=|\/=|%=|<<|>>|->|[^\s]/g;
  for (const match of source.matchAll(pattern))
    tokens.push({ text: match[0], start: match.index, end: match.index + match[0].length });
  return tokens;
}

// Only insert line breaks outside strings, for headers, and array initializers.
export function formatCodingBody(source) {
  const tokens = tokensOf(String(source || ''));
  const lines = [],
    braces = [];
  let indent = 0,
    parentheses = 0,
    start = 0;
  const flush = (end) => {
    const text = source.slice(start, end).trim();
    if (text) lines.push('    '.repeat(indent) + text);
    start = end;
  };
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.text === '(') parentheses++;
    else if (token.text === ')') parentheses--;
    else if (token.text === '{') {
      const array = tokens[i - 1]?.text === ']' || braces.at(-1) === 'array';
      braces.push(array ? 'array' : 'block');
      if (!array) {
        flush(token.end);
        indent++;
      }
    } else if (token.text === '}') {
      if (braces.pop() === 'block') {
        flush(token.start);
        indent = Math.max(0, indent - 1);
        flush(token.end);
      }
    } else if (token.text === ';' && parentheses === 0 && braces.at(-1) !== 'array') flush(token.end);
  }
  flush(source.length);
  return lines.join('\n');
}

function spansFor(source) {
  const tokens = tokensOf(source),
    candidates = [];
  const add = (first, last, kind, score) => {
    if (first <= last && first >= 0 && last < tokens.length)
      candidates.push({ start: tokens[first].start, end: tokens[last].end, kind, score });
  };
  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i].text;
    if (['for', 'while', 'if'].includes(word) && tokens[i + 1]?.text === '(') {
      let depth = 1,
        end = i + 2;
      const separators = [];
      for (; end < tokens.length; end++) {
        if (tokens[end].text === '(') depth++;
        if (tokens[end].text === ')') depth--;
        if (!depth) break;
        if (depth === 1 && tokens[end].text === ';') separators.push(end);
      }
      if (word === 'for' && separators.length === 2)
        add(separators[0] + 1, separators[1] - 1, 'condition', 90);
      else add(i + 2, end - 1, 'condition', word === 'while' ? 95 : 65);
    }
    if (word === 'return') {
      let end = i + 1;
      while (end < tokens.length && tokens[end].text !== ';') end++;
      add(i + 1, end - 1, 'return', 75);
    }
    if (['=', '+=', '-=', '*=', '/=', '%='].includes(word)) {
      let end = i + 1,
        depth = 0;
      for (; end < tokens.length; end++) {
        const value = tokens[end].text;
        if (depth === 0 && [';', ',', '}'].includes(value)) break;
        if (['(', '[', '{'].includes(value)) depth++;
        if ([')', ']', '}'].includes(value)) {
          if (depth === 0) break;
          depth--;
        }
      }
      // Reassigning existing state teaches more than erasing a declaration's initial 0.
      const left = tokens[i - 1]?.text;
      const reassigns = left === ']' || tokens.slice(0, i - 1).some((token) => token.text === left);
      const expression = tokens.slice(i + 1, end);
      const score =
        word !== '=' || reassigns
          ? 100
          : expression.length > 1 && expression[0]?.text !== 'new'
            ? 75
            : 60;
      add(i + 1, end - 1, 'update', score);
    }
  }
  const unique = new Map(
    candidates.map((candidate) => [candidate.start + ':' + candidate.end, candidate]),
  );
  const excluded = new Set([
    'return',
    'if',
    'else',
    'for',
    'while',
    'int',
    'boolean',
    'String',
    'new',
    'static',
    'public',
    'void',
    'try',
    'catch',
  ]);
  const atoms = tokens.filter(
    (token) =>
      !excluded.has(token.text) &&
      (/^[A-Za-z_$\d"']/.test(token.text) ||
        ['+', '-', '*', '/', '%', '==', '!=', '<', '>', '<=', '>='].includes(token.text)),
  );
  return {
    candidates: [...unique.values()].sort((a, b) => b.score - a.score || a.start - b.start),
    atoms,
  };
}

function makeHoles(source, count) {
  const { candidates, atoms } = spansFor(source);
  const overlap = (a, b) => a.start < b.end && b.start < a.end;
  const selected = [],
    kinds = new Set();
  for (const candidate of candidates) {
    if (selected.length === count) break;
    if (selected.some((span) => overlap(span, candidate)) || (count > 1 && kinds.has(candidate.kind)))
      continue;
    // A short expression must retain enough distinct tokens for all three holes.
    const remaining = atoms.filter(
      (atom) => !overlap(atom, candidate) && !selected.some((span) => overlap(span, atom)),
    );
    if (remaining.length < count - selected.length - 1) continue;
    selected.push(candidate);
    kinds.add(candidate.kind);
  }
  for (const atom of atoms) {
    if (selected.length === count) break;
    if (!selected.some((span) => overlap(span, atom))) selected.push(atom);
  }
  selected.sort((a, b) => a.start - b.start);
  const parts = [],
    answers = [];
  let at = 0;
  for (const span of selected) {
    parts.push(source.slice(at, span.start));
    answers.push(source.slice(span.start, span.end));
    at = span.end;
  }
  parts.push(source.slice(at));
  return { parts, answers };
}

export function fillScaffold(parts, values = []) {
  return parts.map((part, i) => part + (i < parts.length - 1 ? String(values[i] ?? '') : '')).join('');
}

function defaultReturn(task) {
  const type = task.signature.match(/\bstatic\s+([^\s]+)\s+/)?.[1];
  if (type === 'void') return '';
  if (type === 'boolean') return 'return false;';
  if (type === 'String') return 'return "";';
  if (type === 'int[]') return 'return new int[0];';
  return /^(?:byte|short|int|long|float|double|char)$/.test(type || '') ? 'return 0;' : 'return null;';
}

export function createCodingScaffold(task) {
  const body = formatCodingBody(task.solution);
  const steps =
    STEP_OVERRIDES[task.id] ||
    (task.steps?.length
      ? [...task.steps]
      : ['先画出题目给定示例，明确输入、目标和空输入等边界。', ...(task.hints || []).slice(0, 2)]);
  const starter =
    steps
      .map((step, i) => '// 【第' + (i + 1) + '步】' + step + '\n// TODO: 把这一步翻译成 Java。')
      .join('\n\n') +
    '\n\n// 下方是待替换的返回占位，完成上方步骤后交回真实结果。\n' +
    defaultReturn(task);
  return {
    body,
    fullSource: buildLearnerProgram(task, body),
    steps,
    one: makeHoles(body, 1),
    three: makeHoles(body, 3),
    blocks: body
      .split('\n')
      .filter((line) => line.trim())
      .map((line, i) => ({
        id: task.id + '-line-' + i,
        code: line.trimStart(),
        indent: Math.floor((line.length - line.trimStart().length) / 4),
      })),
    typing: body,
    starter,
  };
}
