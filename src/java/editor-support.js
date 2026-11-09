// Teaching hints are intentionally bounded; the real compiler owns Java diagnostics.
export const JAVA_WORD_HELP = {
  int: '保存 32 位整数，例如下标、计数器。',
  long: '保存范围更大的 64 位整数；整数累计较大时常用。',
  boolean: '只有 true 和 false，用来保存条件判断结果。',
  String: '保存一段文字。比较文字内容使用 equals。',
  return: '结束当前方法，并交回方法声明要求的结果。',
  for: '按初始化、条件判断、循环体、更新的顺序重复。',
  while: '条件为 true 时继续重复；需要保证状态能够走向结束。',
  if: '条件为 true 才执行对应分支。',
  else: '前面的 if 条件为 false 时才选择这里。',
  new: '创建一个新对象或新数组，得到它的引用。',
  null: '当前没有指向任何对象，不能直接读取它的成员。',
  class: '定义一种对象类型，说明它有哪些数据和操作。',
  static: '这个成员属于类，可在本课程的 main 中直接调用相应静态方法。',
  void: '这个方法不交回一个结果值。',
  public: '允许从其他类访问这个成员；程序入口使用 public static void main。',
  length: '数组用 a.length；字符串使用 s.length()，两种写法不同。',
};
export const JAVA_SNIPPETS = [
  ['fori', '按下标遍历数组', 'for (int ${1:i} = 0; ${1:i} < ${2:a}.length; ${1:i}++) {\n\t${0}\n}'],
  ['foreach', '逐个取出数组元素', 'for (int ${1:value} : ${2:a}) {\n\t${0}\n}'],
  ['if', '条件分支', 'if (${1:condition}) {\n\t${0}\n}'],
  ['while', '条件循环', 'while (${1:condition}) {\n\t${0}\n}'],
  ['sout', '显示一个结果', 'System.out.println(${1:value});$0'],
  ['main', '完整程序入口', 'public static void main(String[] args) {\n\t${0}\n}'],
];
const members = {
  array: [['length', '数组项数（不加括号）', 'length']],
  String: [
    ['length', '字符单元数', 'length()'],
    ['charAt', '读取指定下标字符', 'charAt(${1:index})'],
    ['substring', '截取半开区间', 'substring(${1:begin}, ${2:end})'],
    ['equals', '比较文字内容', 'equals(${1:other})'],
    ['toCharArray', '转换为字符数组', 'toCharArray()'],
  ],
  List: [
    ['size', '列表项数', 'size()'],
    ['get', '读取指定位置', 'get(${1:index})'],
    ['add', '添加一项', 'add(${1:value})'],
    ['remove', '按位置移除（整数元素还需区分重载）', 'remove(${1:index})'],
    ['isEmpty', '是否为空', 'isEmpty()'],
  ],
  Map: [
    ['put', '保存键与值', 'put(${1:key}, ${2:value})'],
    ['get', '按键读取', 'get(${1:key})'],
    ['getOrDefault', '没有该键时给默认值', 'getOrDefault(${1:key}, ${2:defaultValue})'],
    ['containsKey', '是否已有该键', 'containsKey(${1:key})'],
    ['size', '键的数量', 'size()'],
  ],
  Set: [
    ['add', '加入一个值', 'add(${1:value})'],
    ['contains', '是否包含这个值', 'contains(${1:value})'],
    ['remove', '移除这个值', 'remove(${1:value})'],
    ['size', '不同值的数量', 'size()'],
  ],
  Deque: [
    ['push', '压入栈顶', 'push(${1:value})'],
    ['pop', '弹出栈顶，先检查非空', 'pop()'],
    ['peek', '读取栈顶', 'peek()'],
    ['isEmpty', '是否为空', 'isEmpty()'],
    ['addLast', '加入队尾', 'addLast(${1:value})'],
    ['removeFirst', '移除队首，先检查非空', 'removeFirst()'],
  ],
  Math: [
    ['max', '两个数中较大的值', 'max(${1:a}, ${2:b})'],
    ['min', '两个数中较小的值', 'min(${1:a}, ${2:b})'],
    ['abs', '绝对值', 'abs(${1:value})'],
    ['sqrt', '平方根，返回 double', 'sqrt(${1:value})'],
  ],
  'System.out': [
    ['println', '显示并换行', 'println(${1:value})'],
    ['print', '显示但不换行', 'print(${1:value})'],
  ],
  Arrays: [
    ['sort', '排序；需 import java.util.Arrays', 'sort(${1:a})'],
    ['toString', '显示一维数组；需 import java.util.Arrays', 'toString(${1:a})'],
    ['fill', '填充数组；需 import java.util.Arrays', 'fill(${1:a}, ${2:value})'],
  ],
};
function codeOnly(source) {
  return source.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, (match) =>
    match.replace(/[^\n]/g, ' '),
  );
}
export function javaDeclarations(source) {
  const result = new Map();
  const pattern =
    /\b(int|long|double|float|char|boolean|String|Integer|Node|List|ArrayList|Map|HashMap|Set|HashSet|Deque|ArrayDeque)(\s*<[^;={}()\n]+>)?\s*(\[\s*\])?\s+([A-Za-z_$][\w$]*)\b(?!\s*\()/g;
  for (const m of codeOnly(source).matchAll(pattern))
    result.set(
      m[4],
      m[3]
        ? 'array'
        : m[1]
            .replace(/^ArrayList$/, 'List')
            .replace(/^HashMap$/, 'Map')
            .replace(/^HashSet$/, 'Set')
            .replace(/^ArrayDeque$/, 'Deque'),
    );
  return result;
}
export function javaSuggestions(source, before, context = '') {
  const vars = javaDeclarations(context + '\n' + source);
  const dot = /([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)?)\.\w*$/.exec(before);
  if (dot) {
    const type = members[dot[1]] ? dot[1] : vars.get(dot[1]);
    return (members[type] || []).map(([label, detail, insertText]) => ({
      label,
      detail,
      insertText,
      kind: label === 'length' && type === 'array' ? 'field' : 'method',
    }));
  }
  return [
    ...JAVA_SNIPPETS.map(([label, detail, insertText]) => ({
      label,
      detail,
      insertText,
      kind: 'snippet',
    })),
    ...Object.entries(JAVA_WORD_HELP).map(([label, detail]) => ({
      label,
      detail,
      insertText: label,
      kind: 'keyword',
    })),
    ...[...vars].map(([label, type]) => ({
      label,
      detail: type + ' · 本例声明（常用写法提示）',
      insertText: label,
      kind: 'variable',
    })),
  ];
}
export function javaEditorDiagnostics(diagnostics, source, lineOffset = 0) {
  const lines = source.split('\n');
  return diagnostics.flatMap((d) => {
    if (!['ERROR', 'WARNING', 'MANDATORY_WARNING'].includes(d.kind) || !Number.isInteger(d.line))
      return [];
    let line = d.line - lineOffset;
    if (line === lines.length + 1 && /missing return/.test(d.message)) line = lines.length;
    if (line < 1 || line > lines.length) return [];
    const column = Math.max(1, Math.min(lines[line - 1].length + 1, Number(d.column) || 1));
    return [
      {
        line,
        column,
        message: String(d.message).slice(0, 2000),
        severity: d.kind === 'ERROR' ? 'error' : 'warning',
      },
    ];
  });
}
