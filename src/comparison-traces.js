export const COMPARISONS = {
  containers: {
    title: '栈 vs 队列',
    left: '栈 · 后进先出',
    right: '队列 · 先进先出',
    input: '1,2,3,4',
    difference: '输入顺序相同：栈从末尾弹出，队列从头部取出。它们解决的是不同的处理顺序问题。',
  },
  traversal: {
    title: 'BFS vs DFS',
    left: 'BFS · 先扩展同层',
    right: 'DFS · 先沿一条路深入',
    input: '1,2,3,4,5,6,7',
    difference:
      '相同完全二叉树中，BFS 使用队列按层访问，DFS 使用栈先走左分支。这里比较访问顺序；DFS 不能保证无权图最短路。',
  },
  sorting: {
    title: '归并排序 vs 快速排序',
    left: '归并 · 先分再合',
    right: '快排 · 先分区再递归',
    input: '4,1,3,2',
    difference:
      '归并需要额外合并空间且最坏时间 O(n log n)；这里快排取末元素为基准，最坏 O(n²)，递归栈最坏 O(n)。相同结果不代表相同过程。',
  },
};
export function comparisonTrace(mode, input) {
  const a = input.trim()
    ? input
        .trim()
        .split(/[,，\s]+/)
        .map(Number)
    : [];
  if (!a.length || a.length > 8 || a.some((x) => !Number.isInteger(x) || Math.abs(x) > 99))
    throw Error('请输入 1～8 个 −99～99 的整数。');
  const left = [],
    right = [];
  const save = (list, data, message, extra = '') => list.push({ values: [...data], message, extra });
  if (mode === 'containers') {
    const stack = [],
      queue = [],
      stackOut = [],
      queueOut = [];
    for (const value of a) {
      stack.push(value);
      queue.push(value);
      save(left, stack, '入栈 ' + value);
      save(right, queue, '入队 ' + value);
    }
    while (stack.length) {
      stackOut.push(stack.pop());
      queueOut.push(queue.shift());
      save(left, stack, '从栈顶取出', '输出：' + stackOut.join(' → '));
      save(right, queue, '从队头取出', '输出：' + queueOut.join(' → '));
    }
  } else if (mode === 'traversal') {
    for (const [list, bfs] of [
      [left, true],
      [right, false],
    ]) {
      const frontier = [0],
        output = [];
      save(list, [], '初始根节点入' + (bfs ? '队' : '栈'), '待访问下标：0');
      while (frontier.length) {
        const index = bfs ? frontier.shift() : frontier.pop();
        output.push(a[index]);
        const children = [index * 2 + 1, index * 2 + 2].filter((i) => i < a.length);
        frontier.push(...(bfs ? children : children.reverse()));
        save(
          list,
          output,
          '访问下标 ' + index + ' 的节点 ' + a[index],
          '待访问下标：' + (frontier.join(', ') || '空'),
        );
      }
    }
  } else {
    const merge = [...a],
      quick = [...a];
    save(left, merge, '原始输入');
    save(right, quick, '原始输入');
    function sort(l, r) {
      if (r - l < 2) return;
      const m = Math.floor((l + r) / 2);
      save(left, merge, '分开区间 [' + l + ',' + r + ')，中点 ' + m);
      sort(l, m);
      sort(m, r);
      const temp = [];
      let i = l,
        j = m;
      while (i < m || j < r)
        temp.push(j >= r || (i < m && merge[i] <= merge[j]) ? merge[i++] : merge[j++]);
      merge.splice(l, r - l, ...temp);
      save(left, merge, '合并有序区间 [' + l + ',' + m + ') 与 [' + m + ',' + r + ')');
    }
    function partition(l, r) {
      if (l >= r) return;
      const pivot = quick[r];
      let at = l;
      save(right, quick, '区间 [' + l + ',' + r + '] 取基准 ' + pivot);
      for (let j = l; j < r; j++)
        if (quick[j] <= pivot) {
          [quick[at], quick[j]] = [quick[j], quick[at]];
          at++;
          save(right, quick, '把不大于基准的值移到左区间');
        }
      [quick[at], quick[r]] = [quick[r], quick[at]];
      save(right, quick, '基准归位到下标 ' + at);
      partition(l, at - 1);
      partition(at + 1, r);
    }
    sort(0, a.length);
    partition(0, a.length - 1);
    save(left, merge, '排序完成');
    save(right, quick, '排序完成');
  }
  return { left, right };
}
