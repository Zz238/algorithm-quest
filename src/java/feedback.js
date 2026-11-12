export function explainJavaError(message = '') {
  if (/环境.*加载超时/.test(message))
    return 'Java 环境还没有下载或初始化完成，这不是你的代码运行超时。检查网络，稍后重试；代码草稿已保留。';
  if (/编译超时/.test(message))
    return '编译器没有在时限内完成检查。保留当前代码后重试；这不表示循环或递归一定有问题。';
  const bounds = /Index (-?\d+) out of bounds for length (\d+)/.exec(message);
  if (bounds)
    return Number(bounds[2]) === 0
      ? '数组越界啦！这是长度为 0 的空数组，没有合法下标。先检查数组是否为空。'
      : `数组越界啦！访问了下标 ${bounds[1]}，数组长度是 ${bounds[2]}，最大下标只能是 ${Number(bounds[2]) - 1}。检查循环条件是不是写成了 <= array.length，以及是否多走了一步。`;
  if (/运行超时|execution.*timed? ?out|time limit/i.test(message))
    return '程序运行超时，通常是 while 循环中的递增条件忘记写，或者递归没有终止条件。请检查每一步是否更接近结束。';
  if (/non-static .*cannot be referenced from a static context/.test(message))
    return '静态方法不能直接调用属于某个对象的成员。先 new 创建对象，再通过对象调用；只有确实不依赖对象状态的方法才适合改成 static。';
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
