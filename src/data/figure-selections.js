// One representative milestone between the starting and final states.
// Each selector is evaluated against the real example trace, not an independent illustration.
const phase = (name) => (frame) => frame.phase === name;
const line = (number) => (frame) => frame.line === number;
const step = (number) => (_frame, index) => index === number;
const contains = (part) => (frame) => frame.statement.includes(part);
export const LESSON_MILESTONES = {
  '1-1': line(2),
  '1-4': line(3),
  '1-6': line(2),
  '2-1': step(2),
  '2-2': step(1),
  '2-4': step(1),
  '2-5': contains('计算i+1'),
  '2-6': step(1),
  '3-2': contains('i++'),
  '3-3': contains('steps加1'),
  '3-4': contains('14÷2'),
  '3-5': contains('计算i+1'),
  '4-1': contains('编号合法'),
  '4-5': contains('计算i+1'),
  '4-6': contains('抄到'),
  '4-2': contains('各向内走'),
  '4-3': contains('不等于'),
  '4-4': contains('left变'),
  '5-1': phase('inner-stop'),
  '5-2': line(4),
  '5-3': contains('拿起 1'),
  '5-4': contains('计数加 1'),
  '5-6': line(1),
  '6-5': contains('通过 b 修改'),
  '6-1': contains('把 A.next'),
  '6-2': line(1),
  '6-3': contains('peek'),
  '6-4': contains('队尾加入2'),
  '6-6': contains('压入期待]'),
  '7-1': contains('写入2 → 1'),
  '7-2': contains('写入2 → 2'),
  '7-5': contains('加入2，集合大小1'),
  '7-3': contains('再保存'),
  '7-4': contains('键 12 也落入'),
  '7-6': contains('再保存'),
  '8-1': contains('进入sum(0)'),
  '8-5': contains('sum(1)返回'),
  '8-2': (frame) => frame.phase === 'compare' && frame.vars.l === 0 && frame.vars.r === 3,
  '8-3': contains('选择编号 1'),
  '8-4': (frame) => frame.vars.start === 2,
  '8-6': phase('partition'),
  '9-1': contains('结点20返回'),
  '9-2': contains('记录结点 1'),
  '9-6': contains('固定 size=2'),
  '10-2': contains('发现C'),
  '10-6': contains('离开C'),
  '10-3': contains('发现'),
  '10-4': contains('1 最近'),
  '11-3': contains('命中缓存'),
  '11-5': contains('next='),
  '11-6': contains('next='),
  '11-4': (frame) => frame.vars.i === 1,
  '12-1': contains('买入日1'),
  '12-5': contains('买入日1'),
  '12-2': contains('6-1=5'),
  '12-4': contains('6-1=5'),
};
export const CHAPTER_FIGURES = {
  1: [
    ['1-2', '下标和值分开看'],
    ['1-5', '顺序改变状态'],
    ['1-4', '接着上一次累计'],
  ],
  2: [
    ['2-2', '先用旧值计算'],
    ['2-3', '比较后得到真假'],
    ['2-4', '方法把值交回去'],
  ],
  3: [
    ['3-1', '只走一个分支'],
    ['3-2', '执行完才更新下标'],
    ['3-4', '看奇偶循环每一轮'],
  ],
  4: [
    ['4-5', '先算编号，再打开格子'],
    ['4-6', '原数组和副本分开'],
    ['4-4', '二分排除一段'],
  ],
  5: [
    ['5-6', '旧值暂存在 temp'],
    ['5-1', '一轮结束才缩短边界'],
    ['5-2', '右移给待插入值让位'],
  ],
  6: [
    ['6-2', '下一条引用先接好'],
    ['6-3', '栈顶只看不取'],
    ['6-4', '队尾排队，队首出队'],
  ],
  7: [
    ['7-2', '键相同，累加次数'],
    ['7-4', '同一个桶，实际键不同'],
    ['7-3', '先查搭档，再登记'],
  ],
  8: [
    ['8-1', '调用层层等待'],
    ['8-2', '归并取较小的队首'],
    ['8-3', '回溯保存后再撤销'],
  ],
  9: [
    ['9-5', '谁是谁的孩子'],
    ['9-2', '按前序记录节点'],
    ['9-6', '本层队列先数清'],
  ],
  10: [
    ['10-1', '连边表示可以直达'],
    ['10-2', '发现就入队并标记'],
    ['10-3', '同色且四方向连通才染'],
  ],
  11: [
    ['11-1', '拿最大不一定最省'],
    ['11-2', '上一格和上两格决定当前格'],
    ['11-5', '先算新值，再覆盖旧值'],
  ],
  12: [
    ['12-1', '只比较先买后卖'],
    ['12-2', '用过去最低价算今天利润'],
    ['12-3', '用边界输入验证规则'],
  ],
};

export function figureSteps(frames, id) {
  const last = frames.length - 1;
  if (last <= 1) return frames.map((frame, index) => ({ frame, index }));
  const select = LESSON_MILESTONES[id];
  const found = select ? frames.findIndex((f, i) => i > 0 && i < last && select(f, i)) : -1;
  const middle = found > 0 ? found : Math.max(1, Math.floor(last / 2));
  return [0, middle, last].map((index) => ({ frame: frames[index], index }));
}
