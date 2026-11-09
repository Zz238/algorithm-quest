export function explainJavaError(message = '') {
  if (/ArrayIndexOutOfBounds|IndexOutOfBounds/.test(message))
    return '访问的位置超出了范围。数组长度为 n 时，合法下标是 0 到 n−1；检查循环边界和 i+1。';
  if (/NullPointer/.test(message))
    return '正在访问一个没有指向对象的引用。检查它何时创建，以及使用 .next、.length 或方法前是否可能为 null。';
  if (/StackOverflow/.test(message))
    return '方法调用层数过深。检查递归停止条件，以及每次调用是否确实缩小了问题。';
  if (/ArithmeticException/.test(message)) return '算术运算失败。先检查整数除法或取余的除数是否为 0。';
  if (/cannot find symbol/.test(message))
    return '编译器找不到这个名字。核对变量或方法拼写，并确认它在使用前已经声明、且仍在作用范围内。';
  if (/';' expected/.test(message)) return '这里通常缺少分号。也检查上一行是否完整结束。';
  if (/incompatible types/.test(message))
    return '左右两侧的数据类型不一致。检查方法要求返回什么，以及表达式实际得到什么。';
  if (/missing return/.test(message))
    return '有一条执行路径没有交回结果。检查 if 的另一条分支，或循环结束后的 return。';
  if (/Output|16384/.test(message))
    return '输出过多，已限制为 16 KB。检查是否在没有终止条件的循环中反复打印。';
  return '先从第一条错误开始检查；后面的报错可能是它引起的。修正后再次运行。';
}

export function parseCaseOutput(stdout = '') {
  const cases = [],
    ordinary = [];
  for (const line of stdout.split(/\r?\n/)) {
    if (line.startsWith('@@AQ@@')) {
      try {
        const value = JSON.parse(line.slice(6));
        if (typeof value.ok === 'boolean') cases.push(value);
      } catch {
        ordinary.push(line);
      }
    } else ordinary.push(line);
  }
  return { cases, output: ordinary.join('\n').trimEnd() };
}
