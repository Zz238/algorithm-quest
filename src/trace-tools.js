const phases = {
  merge: {
    enter: '进入子问题',
    split: '拆成两段',
    'call-left': '先排左段',
    'call-right': '再排右段',
    heads: '定位队首',
    compare: '比较队首',
    take: '放入暂存区',
    write: '逐格写回',
    return: '返回上一层',
    done: '完成',
  },
  quick: {
    pivot: '选基准',
    scan: '扫描区间',
    'move-left': '移动左指针',
    'move-right': '移动右指针',
    compare: '比较',
    swap: '交换',
    advance: '交换后推进',
    partition: '分区结束',
    'call-left': '递归左段',
    'call-right': '递归右段',
    return: '返回',
    done: '完成',
  },
  bubble: {
    start: '本轮开始',
    compare: '相邻比较',
    swap: '交换',
    'inner-update': '更新内层下标',
    'inner-stop': '本轮结束',
    'outer-update': '缩短边界',
    done: '完成',
  },
};
export const phaseLabel = (mode, frame) => phases[mode]?.[frame.phase] || '';
export function phaseStops(mode, frames) {
  const found = new Set();
  return frames.flatMap((frame, index) => {
    const name = phaseLabel(mode, frame);
    if (!name || found.has(frame.phase)) return [];
    found.add(frame.phase);
    return [{ index, name }];
  });
}
const value = (v) => (typeof v === 'string' ? v : JSON.stringify(v));
export function frameChanges(before, after) {
  if (!before) return [];
  const result = [];
  for (const name of new Set([...Object.keys(before.vars), ...Object.keys(after.vars)])) {
    // A newly displayed readout is not necessarily a newly created variable.
    // Only compare observations present in both frames.
    if (!Object.hasOwn(before.vars, name) || !Object.hasOwn(after.vars, name)) continue;
    const old = value(before.vars[name]),
      next = value(after.vars[name]);
    if (old !== next) result.push({ name, before: old, after: next });
  }
  for (let index = 0; index < Math.max(before.values.length, after.values.length); index++) {
    const old = index < before.values.length ? value(before.values[index]) : '尚未加入';
    const next = index < after.values.length ? value(after.values[index]) : '已移出';
    if (old !== next) result.push({ name: '第 ' + (index + 1) + ' 项', before: old, after: next });
  }
  return result.slice(0, 10);
}
export function tracePresets(mode) {
  if (
    [
      'bubble',
      'insertion',
      'merge',
      'quick',
      'prefix',
      'for',
      'frequency',
      'set',
      'stock',
      'bruteStock',
    ].includes(mode)
  )
    return [
      ['单个元素', { array: '7' }],
      ['重复值', { array: '2,2,1' }],
      ['已经有序', { array: '1,2,3' }],
      ['逆序', { array: '3,2,1' }],
    ];
  if (['linear', 'binary'].includes(mode))
    return [
      ['单个且找到', { array: '7', target: 7 }],
      ['重复值', { array: '1,2,2,4', target: 2 }],
      ['找不到目标', { array: '1,3,5', target: 4 }],
    ];
  if (mode === 'index')
    return [
      ['右侧一格', { array: '4,8,6', i: 0 }],
      ['试一次边界', { array: '4,8,6', i: 2 }],
    ];
  if (mode === 'stack')
    return [
      ['嵌套匹配', { text: '([])' }],
      ['交叉错误', { text: '([)]' }],
      ['只有关闭括号', { text: ')' }],
    ];
  if (mode === 'recursion')
    return [
      ['最小输入', { n: 0 }],
      ['两层返回', { n: 2 }],
      ['多层调用', { n: 5 }],
    ];
  if (['dp', 'memo'].includes(mode))
    return [
      ['第1级', { n: 1 }],
      ['第2级', { n: 2 }],
      ['第5级', { n: 5 }],
    ];
  return [];
}
