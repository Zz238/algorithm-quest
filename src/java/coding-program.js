export function javaLiteral(value) {
  if (Array.isArray(value)) {
    const type = value.some((x) => typeof x === 'string') ? 'String' : 'int';
    return 'new ' + type + '[]{' + value.map(javaLiteral).join(',') + '}';
  }
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'boolean' || Number.isInteger(value)) return String(value);
  throw new Error('Unsupported course test value');
}

const CHECK_METHODS = `    static void __aqCheck(int id, String input, Object actual, Object expected) {
        boolean ok = java.util.Objects.deepEquals(actual, expected);
        System.out.println("@@AQ@@{\\\"id\\\":" + id + ",\\\"input\\\":" + __aqJson(input) + ",\\\"ok\\\":" + ok + ",\\\"expected\\\":" + __aqJson(expected) + ",\\\"actual\\\":" + __aqJson(actual) + "}");
    }
    static String __aqJson(Object value) {
        if (value == null) return "null";
        if (value instanceof Number || value instanceof Boolean) return value.toString();
        if (value.getClass().isArray()) {
            StringBuilder out = new StringBuilder("[");
            for (int i=0;i<java.lang.reflect.Array.getLength(value);i++) {
                if(i>0)out.append(','); out.append(__aqJson(java.lang.reflect.Array.get(value,i)));
            }
            return out.append(']').toString();
        }
        String text=value.toString(); StringBuilder out=new StringBuilder("\\\"");
        for(int i=0;i<text.length();i++) {
            char c=text.charAt(i);
            if(c=='\\\\'||c=='"')out.append('\\\\');
            if(c=='\\n')out.append("\\\\n"); else if(c=='\\r')out.append("\\\\r"); else if(c=='\\t')out.append("\\\\t"); else out.append(c);
        }
        return out.append('"').toString();
    }`;

export function buildCodingProgram(task, body, { sample = false } = {}) {
  const header = `${task.imports || ''}\npublic class Main {\n${task.support || ''}\n    ${task.signature} {\n`;
  const selected = sample ? task.cases.slice(0, 1) : task.cases;
  const calls = selected
    .map(
      ([call, want], i) =>
        `        __aqCheck(${i + 1}, ${JSON.stringify(call)}, ${call}, ${javaLiteral(want)});`,
    )
    .join('\n');
  return {
    lineOffset: header.split('\n').length - 1,
    source:
      header +
      body +
      `\n    }
    public static void main(String[] args) {
${calls}
    }
${CHECK_METHODS}
}`,
  };
}

export const CODING_SOURCE_LIMIT = 12000;
export function buildLearnerProgram(task, body = task.starter) {
  const imports = task.imports ? task.imports.trim() + '\n\n' : '';
  const support = task.support ? task.support.trimEnd() + '\n\n' : '';
  const signature = task.signature.startsWith('public ') ? task.signature : 'public ' + task.signature;
  const [call, expected] = task.cases[0];
  const output = Array.isArray(expected) ? 'java.util.Arrays.toString(' + call + ')' : call;
  const header = imports + 'public class Main {\n' + support + '    ' + signature + ' {\n';
  const footer =
    '\n    }\n\n    public static void main(String[] args) {\n        System.out.println(' +
    output +
    ');\n    }\n}';
  const indented = body
    .split('\n')
    .map((line) => (line ? '        ' + line : ''))
    .join('\n');
  // Preserve even unusually long legacy drafts instead of truncating them during migration.
  return (
    header +
    (header.length + indented.length + footer.length <= CODING_SOURCE_LIMIT ? indented : body) +
    footer
  );
}

export function restoreCodingSource(task, raw, previous) {
  if (typeof raw?.source === 'string') return raw.source.slice(0, CODING_SOURCE_LIMIT);
  const body =
    typeof raw?.body === 'string'
      ? raw.body.slice(0, 8000)
      : typeof previous?.body === 'string'
        ? previous.body.slice(0, 8000)
        : task.starter;
  return buildLearnerProgram(task, body);
}

// The learner's file remains intact. Tests run from a separate generated entry class.
export function buildSourceJudgingProgram(task, source) {
  const calls = task.cases
    .map(
      ([call, expected], i) =>
        `        __aqCheck(${i + 1}, ${JSON.stringify(call)}, ${call}, ${javaLiteral(expected)});`,
    )
    .join('\n');
  return {
    source:
      source +
      '\n\nclass __QuestTests extends Main {\n    public static void main(String[] args) {\n' +
      calls +
      '\n    }\n' +
      CHECK_METHODS +
      '\n}',
    entryClass: '__QuestTests',
  };
}
