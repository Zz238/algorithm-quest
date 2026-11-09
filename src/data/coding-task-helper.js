export function exercise(id, topic, title, signature, prompt, solution, tests, hints, extra = {}) {
  const returns = signature.match(/static\s+(\S+)/)?.[1];
  return {
    id: 'code-' + id,
    topic,
    title,
    signature,
    task: prompt,
    solution,
    cases: tests,
    starter:
      '// 在这里写方法体\n' +
      (returns === 'boolean'
        ? 'return false;'
        : returns === 'String'
          ? 'return "";'
          : returns === 'int[]'
            ? 'return new int[0];'
            : returns === 'void'
              ? ''
              : returns === 'Node'
                ? 'return null;'
                : 'return 0;'),
    hints,
    level: '基础',
    ...extra,
  };
}
