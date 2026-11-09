export function javaLiteral(value) {
  if (Array.isArray(value)) {
    const type = value.some((x) => typeof x === 'string') ? 'String' : 'int';
    return 'new ' + type + '[]{' + value.map(javaLiteral).join(',') + '}';
  }
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'boolean' || Number.isInteger(value)) return String(value);
  throw new Error('Unsupported course test value');
}

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
    static void __aqCheck(int id, String input, Object actual, Object expected) {
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
    }
}`,
  };
}
