// These bounded Java examples are interpreted as explicit teaching operations, never eval.
export const EXECUTION_EXAMPLES = {
  recursion: {
    title: '递归求和与调用栈',
    code: [
      'static int sum(int n) {',
      '  if (n == 0) return 0;',
      '  int child = sum(n - 1);',
      '  return n + child;',
      '}',
      'int answer = sum(INPUT);',
    ],
  },
  linked: {
    title: '反转链表与引用指向',
    code: [
      'Node prev = null;',
      'Node cur = head;',
      'while (cur != null) {',
      '  Node next = cur.next;',
      '  cur.next = prev;',
      '  prev = cur;',
      '  cur = next;',
      '}',
      'head = prev;',
    ],
  },
};
export function recursionTrace(n) {
  if (!Number.isInteger(n) || n < 0 || n > 6) throw Error('请输入 0～6 的整数，便于观察每一层调用。');
  const frames = [],
    steps = [];
  const save = (line, message, result = null) =>
    steps.push({ line, message, frames: structuredClone(frames), heap: [], refs: {}, result });
  function call(value) {
    frames.push({ name: 'sum(' + value + ')', locals: { n: value } });
    save(1, '进入 sum(' + value + ')：新调用拥有自己的 n。');
    save(2, value === 0 ? 'n 为 0，命中停止条件。' : 'n 不为 0，继续向下调用。');
    if (!value) {
      frames.pop();
      save(2, 'sum(0) 返回 0，弹出这一帧。', 0);
      return 0;
    }
    save(3, '当前调用暂停，等待 sum(' + (value - 1) + ') 的返回值。');
    const child = call(value - 1);
    frames.at(-1).locals.child = child;
    save(4, '恢复 sum(' + value + ')，child=' + child + '，返回 ' + (value + child) + '。');
    frames.pop();
    save(4, '弹出 sum(' + value + ') 的作用域；只把返回值交给调用者。', value + child);
    return value + child;
  }
  save(6, '主程序准备调用 sum(' + n + ')。');
  const answer = call(n);
  frames.push({ name: 'main', locals: { answer } });
  save(6, '调用结束，主程序得到 answer=' + answer + '。', answer);
  return steps;
}
export function linkedTrace(values) {
  if (
    !Array.isArray(values) ||
    values.length > 6 ||
    values.some((v) => !Number.isInteger(v) || Math.abs(v) > 99)
  )
    throw Error('请输入最多 6 个 −99～99 的整数，用逗号分隔；空输入表示空链表。');
  const heap = values.map((value, i) => ({
    id: 'N' + i,
    value,
    next: i + 1 < values.length ? 'N' + (i + 1) : null,
  }));
  const refs = { head: heap[0]?.id || null, prev: null, cur: null },
    steps = [];
  const save = (line, message) =>
    steps.push({
      line,
      message,
      frames: [{ name: 'reverse', locals: { ...refs } }],
      refs: { ...refs },
      heap: structuredClone(heap),
    });
  save(1, 'prev 为 null，尚未构造反转后的链。');
  refs.cur = refs.head;
  save(2, 'cur 和 head 指向同一个节点，并没有复制对象。');
  while (refs.cur !== null) {
    save(3, 'cur 不是 null，进入循环。');
    const node = heap.find((n) => n.id === refs.cur);
    refs.next = node.next;
    save(4, '先用 next 保存原来的后继，避免改引用后丢失剩余链。');
    node.next = refs.prev;
    save(5, node.id + '.next 改指向 prev；改变的是对象字段。');
    refs.prev = refs.cur;
    save(6, 'prev 移到刚反转好的节点。');
    refs.cur = refs.next;
    save(7, 'cur 移到保存的 next，继续处理。');
    delete refs.next;
  }
  save(3, 'cur 为 null，循环结束。');
  refs.head = refs.prev;
  save(9, 'head 指向反转后的首节点。');
  return steps;
}
