export const TOPIC_TRACE_DEFAULTS = {
  'prefix-sum': { array: '2,4,1,3', left: 1, right: 3 },
  'sliding-window': { array: '2,1,5,1', k: 2 },
  'selection-sort': { array: '3,1,2' },
  'counting-sort': { array: '2,0,2,1' },
  'monotonic-stack': { array: '2,1,3' },
  'monotonic-queue': { array: '1,3,-1,2', k: 2 },
  'linear-dp': { array: '-2,3,-1,2' },
  'fenwick-tree': { array: '2,1,3,4', at: 1, delta: 5, end: 3 },
};
const show = (a) => JSON.stringify(a);
function integer(value, name, min, max) {
  if (
    String(value).trim() === '' ||
    !Number.isInteger(Number(value)) ||
    Number(value) < min ||
    Number(value) > max
  )
    throw Error(`${name}需要是 ${min}～${max} 的整数。`);
  return Number(value);
}
export function generateTopicTrace(id, values) {
  if (!TOPIC_TRACE_DEFAULTS[id]) throw Error('这个专题使用正文中的固定案例。');
  const fields = String(values.array ?? '')
    .replace(/−/g, '-')
    .split(/[,，\s]+/)
    .filter(Boolean);
  if (fields.length < 1 || fields.length > 12)
    throw Error('实验数组需要 1～12 个整数，用逗号分隔。空输入可在编程任务中按题目约定练习。');
  const a = fields.map((v) => integer(v, '每个元素', -100, 100));
  const steps = [];
  const push = (action, state, reason, cells) =>
    steps.push({ action, state, reason, ...(cells ? { cells: [...cells] } : {}) });
  let result;
  if (id === 'prefix-sum') {
    const left = integer(values.left, '左下标 l', 0, a.length - 1),
      right = integer(values.right, '右下标 r', left, a.length - 1),
      p = [0];
    push('先保存空前缀', `prefix=${show(p)}`, 'prefix[i] 表示前 i 项之和，多出的第 0 格保存 0。', p);
    a.forEach((v, i) => {
      p.push(p[i] + v);
      push(
        `读 a[${i}]=${v}`,
        `prefix[${i + 1}]=${p[i]}+(${v})=${p[i + 1]}`,
        '读取旧累计值后加入当前项，前面的前缀保持不变。',
        p,
      );
    });
    result = p[right + 1] - p[left];
    push(
      '查询闭区间',
      `[${left},${right}]：prefix[${right + 1}]−prefix[${left}]=${result}`,
      '先拿到右端之后的累计值，再扣掉左端之前的累计值。',
      p,
    );
  } else if (id === 'sliding-window') {
    const k = integer(values.k, '窗口长度 k', 1, a.length);
    let sum = 0;
    for (let i = 0; i < k; i++) sum += a[i];
    let best = sum;
    push(
      '建立第一个完整窗口',
      `下标 [0,${k - 1}]，sum=${sum}，best=${best}`,
      '用真实窗口和初始化，避免把全负输入误当成 0。',
      a.slice(0, k),
    );
    for (let i = k; i < a.length; i++) {
      const old = sum;
      sum = sum - a[i - k] + a[i];
      best = Math.max(best, sum);
      push(
        `移出下标 ${i - k}，移入下标 ${i}`,
        `sum=${old}−(${a[i - k]})+(${a[i]})=${sum}；best=${best}`,
        '中间重合的元素不用重算。',
        a.slice(i - k + 1, i + 1),
      );
    }
    result = best;
  } else if (id === 'selection-sort') {
    const b = [...a];
    push('开始选择排序', `a=${show(b)}`, '每轮先扫描最小位置，再交换，不在每次比较时改数组。', b);
    for (let i = 0; i < b.length - 1; i++) {
      let min = i;
      for (let j = i + 1; j < b.length; j++) {
        const before = min;
        if (b[j] < b[min]) min = j;
        push(
          `第 ${i + 1} 轮，比较下标 ${j}`,
          `a[${j}]=${b[j]}；minIndex：${before}→${min}`,
          min === j ? '当前项更小，更新候选位置。' : '当前候选不大于这一项，保留原位置。',
          b,
        );
      }
      const temp = b[i];
      b[i] = b[min];
      b[min] = temp;
      push(
        `第 ${i + 1} 轮结束，交换 ${i} 与 ${min}`,
        `a=${show(b)}；下标 0～${i} 已排好`,
        '只有扫描完未排序段，才固定本轮最小项。',
        b,
      );
    }
    result = b;
  } else if (id === 'counting-sort') {
    if (a.some((x) => x < 0 || x > 10))
      throw Error('计数排序实验限定元素为 0～10。其他范围需要另定偏移与空间方案。');
    const count = Array(Math.max(3, ...a) + 1).fill(0),
      out = [];
    push('准备数值对应的计数格', `count=${show(count)}`, '格子编号是可能值，不是原数组下标。', count);
    a.forEach((v, i) => {
      count[v]++;
      push(`读 a[${i}]=${v}`, `count[${v}]=${count[v]}`, '只让这个数值的出现次数增加。', count);
    });
    count.forEach((n, v) => {
      if (!n) return;
      for (let i = 0; i < n; i++) out.push(v);
      push(`按值 ${v} 输出 ${n} 次`, `结果=${show(out)}`, '从较小值到较大值恢复，保留全部重复项。', out);
    });
    result = out;
  } else if (id === 'monotonic-stack') {
    const stack = [],
      out = Array(a.length).fill(-1);
    a.forEach((v, i) => {
      while (stack.length && a[stack.at(-1)] < v) {
        const old = stack.pop();
        out[old] = v;
        push(
          `a[${i}]=${v} 回答下标 ${old}`,
          `答案=${show(out)}；待解决下标=${show(stack)}`,
          '这是该位置第一次等到严格更大的右侧值。',
          out,
        );
      }
      stack.push(i);
      push(
        `保存当前下标 ${i}`,
        `栈下标=${show(stack)}；对应值=${show(stack.map((j) => a[j]))}`,
        '仍未找到答案的位置继续等待，相等值不算更大。',
        stack.map((j) => a[j]),
      );
    });
    push('遍历结束', `答案=${show(out)}`, '没有被回答的位置保留约定的 -1。', out);
    result = out;
  } else if (id === 'monotonic-queue') {
    const k = integer(values.k, '窗口长度 k', 1, a.length),
      q = [],
      out = [];
    a.forEach((v, i) => {
      while (q.length && q[0] <= i - k) {
        const old = q.shift();
        push(
          `移除过期下标 ${old}`,
          `候选下标=${show(q)}`,
          '它已经离开当前窗口，即使值很大也不能继续当答案。',
          q.map((j) => a[j]),
        );
      }
      while (q.length && a[q.at(-1)] <= v) {
        const old = q.pop();
        push(
          `新值 ${v} 淘汰下标 ${old}`,
          `候选下标=${show(q)}`,
          '新值不小且更晚过期，旧候选不再有用。',
          q.map((j) => a[j]),
        );
      }
      q.push(i);
      if (i >= k - 1) out.push(a[q[0]]);
      push(
        `加入下标 ${i}`,
        `候选下标=${show(q)}；已得到答案=${show(out)}`,
        i >= k - 1 ? '窗口已完整，读取当前队首对应的值。' : '还没凑够一个完整窗口，暂不输出答案。',
        q.map((j) => a[j]),
      );
    });
    result = out;
  } else if (id === 'linear-dp') {
    let end = a[0],
      best = a[0];
    push('用第一项初始化', `end=${end}，best=${best}`, '要求非空，所以不把 0 当成虚构候选。', [end]);
    for (let i = 1; i < a.length; i++) {
      const old = end;
      end = Math.max(a[i], old + a[i]);
      best = Math.max(best, end);
      push(
        `处理下标 ${i}`,
        `end=max(${a[i]},${old}+(${a[i]}))=${end}；best=${best}`,
        '比较重新开始与接上前一结尾段，不任意跳过中间项。',
        [end, best],
      );
    }
    result = best;
  } else if (id === 'fenwick-tree') {
    const n = a.length,
      at = integer(values.at, '修改下标 at', 0, n - 1),
      delta = integer(values.delta, '增量 delta', -20, 20),
      end = integer(values.end, '前缀项数 end', 0, n),
      tree = Array(n + 1).fill(0);
    for (let i = 0; i < n; i++) for (let j = i + 1; j <= n; j += j & -j) tree[j] += a[i];
    push(
      '建立 1 基树状数组',
      `tree[1..n]=${show(tree.slice(1))}`,
      '外部 a 从下标 0 开始，内部编号从 1 开始。',
      tree.slice(1),
    );
    for (let i = at + 1; i <= n; i += i & -i) {
      tree[i] += delta;
      push(
        `给内部编号 ${i} 增加 ${delta}`,
        `tree[1..n]=${show(tree.slice(1))}`,
        '下一负责人是 i+lowbit(i)，不是简单的下一个数组位置。',
        tree.slice(1),
      );
    }
    let sum = 0;
    for (let i = end; i > 0; i -= i & -i) {
      sum += tree[i];
      push(
        `查询时读取 tree[${i}]`,
        `累计=${sum}；下一编号=${i - (i & -i)}`,
        '减去 lowbit，把尚未计入的前缀继续拆成不重叠小段。',
        tree.slice(1),
      );
    }
    result = sum;
    push('完成前缀查询', `前 ${end} 项之和=${sum}`, 'end 为项数；end=0 时空前缀的和就是 0。');
  }
  return {
    input:
      `a=${show(a)}` +
      Object.entries(values)
        .filter(([k]) => k !== 'array')
        .map(([k, v]) => `，${k}=${v}`)
        .join(''),
    steps,
    result,
    resultText: typeof result === 'object' ? show(result) : String(result),
  };
}
