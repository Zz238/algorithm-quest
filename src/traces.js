import { CONCEPT_TRACE_TITLES, buildConceptTrace } from './concept-traces.js';
function layoutTree(children) {
  if (!children.length) return [];
  let deepest = 0;
  function depth(v, d) {
    if (v === undefined) return;
    deepest = Math.max(deepest, d);
    children[v].forEach((child) => depth(child, d + 1));
  }
  depth(0, 0);
  const positions = [];
  function place(v, left, right, d) {
    if (v === undefined) return;
    const middle = (left + right) / 2;
    positions[v] = [middle, 26 + (d * 156) / Math.max(1, deepest)];
    place(children[v][0], left, middle, d + 1);
    place(children[v][1], middle, right, d + 1);
  }
  place(0, 25, 495, 0);
  return positions;
}
/**
 * One rendered algorithm step. line is the zero-based position in trace.code
 * after executing the step, or -1 when no source line applies.
 * @typedef {{statement:string, line:number, values:(number|string)[], vars:Record<string,unknown>,
 * why:string, active:number[], secondary?:unknown[], range?:number[], groups?:number[][],
 * stack?:unknown[], output?:unknown, kind?:string, edges?:number[][], positions?:number[][]}} TraceFrame
 */
/** @returns {TraceFrame} */
const F = (statement, line, a, vars = {}, why = '', extra = {}) => ({
  statement,
  line,
  values: [...a],
  vars: { ...vars },
  why,
  active: [],
  ...extra,
});
const TITLES = {
  condition: '一次分支，只执行一种规则',
  set: '重复加入不增加集合大小',
  bruteStock: '枚举所有先买后卖日期',
  memo: '递归请求与缓存命中',
  index: '下标求值与访问',
  copy: '单向复制，不是交换',
  swap: '三条赋值交换两格',
  bubble: '相邻比较与三步交换',
  insertion: '拿起、右移、回填',
  for: 'for循环的真实顺序',
  prefix: '每一步累计值',
  linear: '顺序查找的位置',
  binary: '闭区间二分查找',
  assignment: '先读旧值，再保存新值',
  comparison: '比较产生真假',
  function: '参数、计算与返回',
  reduce: '奇偶分支与循环次数',
  frequency: '从旧次数更新计数表',
  twoSum: '先查搭档，再登记当前',
  recursion: '调用向下，答案向上',
  stack: '期待括号的入栈与出栈',
  queue: '先进先出的等待区',
  linked: '先保存旧后继',
  dp: '状态表逐格填写',
  stock: '历史最低价与最好收益',
  merge: '递归拆分与合并写回',
  quick: '分区与递归子区间',
  bfs: '队列、已发现与当前顶点',
  dfs: '递归探索与返回',
  treeDepth: '左右子树返回深度',
  preorder: '根、左、右的访问',
  treeBfs: '冻结本层size再扩展',
};
export const TRACE_TYPES = [...Object.keys(TITLES), ...Object.keys(CONCEPT_TRACE_TITLES)];
export function traceDefaults(type) {
  return {
    array: ['bubble', 'insertion', 'swap', 'merge', 'quick'].includes(type)
      ? '3,1,2'
      : type === 'binary'
        ? '-1,0,3,5,9,12'
        : type === 'stock'
          ? '7,1,5,3,6,4'
          : type === 'bruteStock'
            ? '3,1,4'
            : type === 'twoSum'
              ? '2,7,11,15'
              : ['frequency', 'set'].includes(type)
                ? '2,3,2'
                : '1,2,3',
    i: 0,
    target: type === 'binary' ? 9 : type === 'twoSum' ? 9 : 2,
    n: ['dp', 'memo'].includes(type) ? 5 : type === 'condition' ? 7 : type === 'reduce' ? 14 : 4,
    text: '([])',
  };
}
export function parseTraceArray(text) {
  const p = text
    .trim()
    .split(/[,，\s]+/)
    .filter(Boolean);
  if (!p.length || p.length > 6 || p.some((x) => !/^[-+]?\d+$/.test(x) || Math.abs(Number(x)) > 99))
    throw Error('请输入1～6个-99到99之间的整数，用逗号分隔。');
  return p.map(Number);
}
export function buildTrace(type, config = {}) {
  if (Object.hasOwn(CONCEPT_TRACE_TITLES, type)) return buildConceptTrace(type, config);
  if (!TRACE_TYPES.includes(type)) throw new RangeError('未知的图解类型：' + type);
  const defaults = traceDefaults(type),
    a = Array.isArray(config.a) ? [...config.a] : parseTraceArray(config.array ?? defaults.array),
    i0 = Number(config.i ?? 0),
    target = Number(config.target ?? defaults.target),
    n = Number(config.n ?? defaults.n),
    frames = [];
  let code = [];
  if (
    ['linear', 'binary', 'twoSum'].includes(type) &&
    (!Number.isInteger(target) || Math.abs(target) > 999)
  )
    throw Error('目标值请输入-999到999之间的整数。');
  if (['condition', 'assignment', 'comparison', 'function', 'reduce'].includes(type)) a.length = 0;
  const put = (statement, line, vars, why, extra = {}) =>
    frames.push(F(statement, line, a, vars, why, extra));
  if (type === 'condition') {
    if (!Number.isInteger(n) || n < 0 || n > 99) throw Error('输入num请输入0～99的整数。');
    code = ['if (num % 2 == 0) {', '    return num / 2;', '}', 'return num - 1;'];
    const even = n % 2 === 0;
    put(`接收本次num=${n}`, -1, { num: n }, '先确定输入；这里只执行一次分支，不会循环到0。');
    put(
      `${n}%2=${n % 2}，等于0为${even}`,
      0,
      { num: n, remainder: n % 2, condition: even },
      '求余后比较，真假决定本次走哪一条返回语句。',
    );
    put(
      even ? `走偶数分支，返回${n / 2}` : `走奇数分支，返回${n - 1}`,
      even ? 1 : 3,
      { num: n },
      'return交回一个新值后结束方法；没有再次执行分支，也没有改变传入的整数。',
      { output: even ? n / 2 : n - 1 },
    );
  } else if (type === 'set') {
    const seen = new Set();
    code = [
      'Set<Integer> seen=new HashSet<>();',
      'for(int x:a) {',
      '    seen.add(x);',
      '}',
      'return seen.size();',
    ];
    put('建立空集合', 0, {}, '集合只记某个值是否出现，不记录频次。', {
      secondary: [],
      label: 'Set中的不同值',
    });
    for (let i = 0; i < a.length; i++) {
      const x = a[i],
        had = seen.has(x);
      seen.add(x);
      put(
        `加入${x}，集合大小${seen.size}`,
        2,
        { i, x, size: seen.size },
        had ? '这个值已存在，本次大小不增加；它仍是同一种值。' : '这是新值，集合中多了一种不同的值。',
        {
          active: [i],
          secondary: [...seen],
          label: 'Set中的不同值（展示采用加入顺序，HashSet不保证迭代顺序）',
        },
      );
    }
    put('读取不同值的种类数', 4, { size: seen.size }, '只返回size，不把重复元素多计一次。', {
      secondary: [...seen],
      label: '最终不同值',
      output: seen.size,
    });
  } else if (type === 'bruteStock') {
    let best = 0;
    code = [
      'int best=0;',
      'for(int i=0;i<prices.length;i++) {',
      '    for(int j=i+1;j<prices.length;j++) {',
      '        best=Math.max(best,prices[j]-prices[i]);',
      '    }',
      '}',
      'return best;',
    ];
    put('best从0开始', 0, { best }, '可以不交易，不能强迫接受负利润。');
    for (let i = 0; i < a.length; i++)
      for (let j = i + 1; j < a.length; j++) {
        const profit = a[j] - a[i];
        best = Math.max(best, profit);
        put(
          `买入日${i}，卖出日${j}：${a[j]}-${a[i]}=${profit}`,
          3,
          { i, j, profit, best },
          'j从i+1开始，保证先买后卖；把这一对与已有最好结果比较。',
          { active: [i, j] },
        );
      }
    put('所有合法日期对检查完', 6, { best }, '直接枚举提供小规模正确性基准；下一节再减少重复工作。', {
      output: best,
    });
  } else if (type === 'memo') {
    if (!Number.isInteger(n) || n < 1 || n > 8) throw Error('记忆化实验n请输入1～8的整数。');
    const memo = Array(n + 1).fill(-1),
      stack = [];
    code = [
      'if(n<=2) return n;',
      'if(memo[n]!=-1) return memo[n];',
      'memo[n]=solve(n-1,memo)+solve(n-2,memo);',
      'return memo[n];',
    ];
    const emit = (statement, line, k, why, extra = {}) =>
      frames.push(
        F(statement, line, memo.slice(1), { n: k }, why, {
          active: [k - 1],
          secondary: [...stack],
          label: '等待返回的调用',
          ...extra,
        }),
      );
    function solve(k) {
      stack.push(`solve(${k})`);
      emit(`请求solve(${k})`, -1, k, '先看基础情况，再看这道子问题是否已有缓存。');
      let ans;
      if (k <= 2) {
        ans = k;
        emit(`基础情况直接返回${k}`, 0, k, '1级1种、2级2种；本实现的基础答案直接返回，不写入memo。');
      } else if (memo[k] !== -1) {
        ans = memo[k];
        emit(`memo[${k}]=${ans}，命中缓存`, 1, k, '这个子问题已完整求解，直接复用答案，不再向下展开。');
      } else {
        const left = solve(k - 1),
          right = solve(k - 2);
        ans = left + right;
        memo[k] = ans;
        emit(
          `memo[${k}]=${left}+${right}=${ans}`,
          2,
          k,
          '两个更小答案都已返回，保存本题结果，供之后相同请求复用。',
        );
      }
      stack.pop();
      return ans;
    }
    const ans = solve(n);
    emit('最初请求得到答案', 3, n, '-1表示未缓存，不是走法数；缓存避免重复展开同一个非基础状态。', {
      output: ans,
    });
  } else if (['index', 'copy'].includes(type)) {
    if (!Number.isInteger(i0) || i0 < 0 || i0 > a.length)
      throw Error('当前编号i请输入0到数组长度之间的整数；最后一个值可用来观察越界。');
    code =
      type === 'index'
        ? [`int[] a = {${a.join(', ')}};`, `int i = ${i0};`, 'int result = a[i + 1];']
        : ['int i = ' + i0 + ';', 'a[i + 1] = a[i];'];
    put('建立数组并标出每格下标', 0, {}, '上面是元素值，下面是位置编号；第一个位置是0。');
    put(
      `保存当前i=${i0}`,
      type === 'index' ? 1 : 0,
      { i: i0 },
      'i只是一个整数位置变量，数组里的值不会因此改变。',
    );
    const at = i0 + 1;
    put(
      `计算i+1=${at}`,
      type === 'index' ? 2 : 1,
      { i: i0, 'i+1': at },
      '方括号里的表达式先算出要访问的位置；这不是i++。',
    );
    if (at >= a.length || i0 >= a.length) {
      put(
        `编号${at}越界，停止本次访问`,
        type === 'index' ? 2 : 1,
        { i: i0, 'i+1': at, length: a.length },
        `有效下标是0～${a.length - 1}。不能把不存在的格子当作0，也不能自动回到开头。`,
        { error: true, output: '没有合法访问结果' },
      );
    } else if (type === 'index') {
      put(
        `检查0≤${at}<${a.length}，编号合法`,
        2,
        { i: i0, 'i+1': at, length: a.length },
        '先确认位置在有效范围内，之后才能安全读取；这里仍未取得元素值。',
        { active: [at] },
      );
      put(
        `读取a[${at}]得到${a[at]}`,
        2,
        { i: i0, 'i+1': at, result: a[at] },
        `先确定编号${at}，再读取那格的${a[at]}；当前i仍是${i0}。`,
        { active: [at], output: a[at] },
      );
    } else {
      const old = a[at],
        value = a[i0];
      put(
        `先读右侧a[${i0}]=${value}`,
        1,
        { i: i0, value },
        '赋值先读取右侧；被写入格子的旧值不会自动换到另一边。',
        { active: [i0] },
      );
      a[at] = value;
      put(
        `再写左侧a[${at}]=${value}`,
        1,
        { i: i0, value },
        `旧值${old}被覆盖；这条单向复制不是交换，i没有变化。`,
        { active: [at], output: [...a] },
      );
    }
  } else if (type === 'swap') {
    if (a.length < 2) throw Error('交换实验至少需要两个元素。');
    code = ['int temp = a[0];', 'a[0] = a[1];', 'a[1] = temp;'];
    put('初始状态：准备交换前两格', -1, {}, '先保留会被覆盖的旧值。');
    const temp = a[0];
    put(`temp取得旧a[0]的${temp}`, 0, { temp }, 'temp是整数副本；之后修改数组不会使它自动改变。', {
      active: [0],
    });
    a[0] = a[1];
    put('第二格的值写入第一格', 1, { temp }, '数组暂时重复没有关系，旧第一格仍保存在temp。', {
      active: [0, 1],
    });
    a[1] = temp;
    put('把temp写入第二格，交换完成', 2, { temp }, '两个位置互换了原值，其他位置没有动。', {
      active: [0, 1],
      output: [...a],
    });
  } else if (['for', 'prefix', 'linear'].includes(type)) {
    const prefix = type === 'prefix',
      search = type === 'linear';
    code = search
      ? ['for (int i=0; i<a.length; i++) {', '    if (a[i] == target) return i;', '}', 'return -1;']
      : [
          'int sum = 0;',
          'for (int i=0; i<a.length; i++) {',
          '    sum = sum + a[i];',
          ...(prefix ? ['    result[i] = sum;'] : []),
          '}',
          ...(prefix ? ['return result;'] : ['return sum;']),
        ];
    let sum = 0,
      found = false;
    const result = Array(a.length).fill('—');
    put(
      search ? '从第一个候选开始' : 'sum初始化为0',
      search ? 0 : 0,
      search ? { target } : { sum },
      search ? '位置从0开始，前面还没有需要排除的候选。' : '未处理任何元素，已处理部分的和是0。',
      prefix ? { secondary: [...result], label: '累计答案' } : {},
    );
    for (let i = 0; i < a.length; i++) {
      put(
        `判断${i}<${a.length}为true`,
        search ? 0 : 1,
        search ? { i, target } : { i, sum },
        '条件成立才进入循环体；这个编号在有效范围内。',
        { active: [i] },
      );
      if (search) {
        if (a[i] === target) {
          put(
            `a[${i}]=${target}，命中并return ${i}`,
            1,
            { i, target },
            '返回的是下标，方法在这里结束，不继续查后面重复值。',
            { active: [i], output: i },
          );
          found = true;
          break;
        }
        put(`${a[i]}不等于${target}，继续下一格`, 1, { i, target }, '只排除当前格，目标仍可能在后面。', {
          active: [i],
        });
      } else {
        const old = sum;
        sum += a[i];
        put(`sum=${old}+${a[i]}=${sum}`, 2, { i, sum }, '读取旧总额和当前元素，再把新总额保存回sum。', {
          active: [i],
          ...(prefix ? { secondary: [...result], label: '累计答案' } : {}),
        });
        if (prefix) {
          result[i] = sum;
          put(`result[${i}]=${sum}`, 3, { i, sum }, '本题要每一站累计值，所以另外保存当前结果。', {
            active: [i],
            secondary: [...result],
            label: '累计答案',
          });
        }
      }
      put(
        `执行i++，下一次i=${i + 1}`,
        search ? 0 : 1,
        search ? { i: i + 1, target } : { i: i + 1, sum },
        '更新发生在本轮循环体之后；接下来还要重新判断条件。',
      );
    }
    if (!found)
      put(
        `i=${a.length}，条件为false，退出`,
        search ? 3 : code.length - 1,
        search ? { i: a.length, target } : { i: a.length, sum },
        search ? '所有候选都被排除，返回-1。' : '条件失败时不再读a[length]，返回已经累计的答案。',
        {
          output: search ? -1 : prefix ? [...result] : sum,
          ...(prefix ? { secondary: [...result], label: '累计答案' } : {}),
        },
      );
  } else if (type === 'binary') {
    if (a.some((v, i) => i > 0 && a[i - 1] > v))
      throw Error('二分实验要求数组已按非递减顺序排列，请先使用有序输入。');
    code = [
      'int left=0, right=a.length-1;',
      'while (left <= right) {',
      '    int mid=left+(right-left)/2;',
      '    if (a[mid]==target) return mid;',
      '    if (a[mid]<target) left=mid+1;',
      '    else right=mid-1;',
      '}',
      'return -1;',
    ];
    let left = 0,
      right = a.length - 1,
      found = false;
    put(
      '设定闭区间[left,right]',
      0,
      { left, right, target },
      '左右端都属于候选，数组有序才允许整段排除。',
    );
    while (left <= right) {
      const mid = left + Math.floor((right - left) / 2);
      put(
        `mid=${left}+(${right}-${left})/2=${mid}`,
        2,
        { left, right, mid, target },
        '整数除法取中间编号，而不是把中间值当下标。',
        { active: [mid], range: [left, right] },
      );
      if (a[mid] === target) {
        put(
          `中间值${a[mid]}等于目标，返回${mid}`,
          3,
          { left, right, mid, target },
          '已经找到符合目标的位置。',
          { active: [mid], range: [left, right], output: mid },
        );
        found = true;
        break;
      }
      if (a[mid] < target) {
        left = mid + 1;
        put(
          `${a[mid]}偏小，left变${left}`,
          4,
          { left, right, mid, target },
          '有序性说明mid及左侧都不可能是目标，连mid一起排除。',
          { range: [left, right] },
        );
      } else {
        right = mid - 1;
        put(
          `${a[mid]}偏大，right变${right}`,
          5,
          { left, right, mid, target },
          'mid及右侧都不可能是目标，区间严格缩小。',
          { range: [left, right] },
        );
      }
    }
    if (!found)
      put('left>right，区间为空', 7, { left, right, target }, '已排除所有位置，返回-1。', {
        output: -1,
      });
  } else if (type === 'insertion') {
    code = [
      'for (int i=1; i<a.length; i++) {',
      '    int value=a[i];',
      '    int j=i-1;',
      '    while (j>=0 && a[j]>value) {',
      '        a[j+1]=a[j];',
      '        j--;',
      '    }',
      '    a[j+1]=value;',
      '}',
    ];
    put('第一格单独看作有序', -1, {}, '一次只把一个新值插入已排序前缀，不同时处理整段。');
    for (let i = 1; i < a.length; i++) {
      const value = a[i];
      let j = i - 1;
      put(
        `保存value=a[${i}]=${value}`,
        1,
        { i, value },
        '提前把待插入值拿出来，右移过程中即使原位置被覆盖也不会丢。',
        { active: [i] },
      );
      put(`j=i-1=${j}`, 2, { i, j, value }, '从左侧已排序部分的最右端向左找落点。', { active: [j] });
      while (true) {
        const ok = j >= 0 && a[j] > value;
        put(
          j < 0 ? 'j=-1，左侧已没有格子' : `检查a[${j}]=${a[j]}是否大于${value}`,
          3,
          { i, j, value, condition: ok },
          j < 0
            ? '&&左边为假，短路跳过a[-1]的读取。'
            : ok
              ? '左值较大，必须向右挪，给value留空位。'
              : '当前左值不大于value，不必再右移。',
          { active: j >= 0 ? [j] : [] },
        );
        if (!ok) break;
        const moved = a[j];
        a[j + 1] = a[j];
        put(
          `a[${j + 1}]=a[${j}]=${moved}`,
          4,
          { i, j, value },
          `只复制${moved}到右边；value仍是${value}，暂时重复是正常中间状态。`,
          { active: [j, j + 1] },
        );
        j--;
        put(
          `j--后j=${j}`,
          5,
          { i, j, value },
          '只改变比较位置，数组和value都不因这一条再变化；下一条重新检查条件。',
          { active: j >= 0 ? [j] : [] },
        );
      }
      a[j + 1] = value;
      put(
        `a[j+1]=a[${j + 1}]=${value}`,
        7,
        { i, j, value, 'j+1': j + 1 },
        '循环停在不需要移动的位置或左边界外，真正空位是j+1。',
        { active: [j + 1] },
      );
    }
    put('全部待插入元素处理完成', 8, {}, '左侧有序前缀已扩展为整个数组。', { output: [...a] });
  } else if (type === 'bubble') {
    code = [
      'for (int end=a.length-1; end>0; end--) {',
      '    for (int i=0; i<end; i++) {',
      '        if (a[i]>a[i+1]) {',
      '            int temp=a[i];',
      '            a[i]=a[i+1];',
      '            a[i+1]=temp;',
      '        }',
      '    }',
      '}',
    ];
    put('初始未排序数组', -1, {}, '每轮从左到右比较相邻两格，较大者向右移动。');
    for (let end = a.length - 1; end > 0; end--) {
      const round = a.length - end;
      put(
        `第 ${round} 轮开始，内层 i 初始化为0`,
        1,
        { round, end, i: 0 },
        '外层确定这轮的右边界；内层从头走。',
        { phase: 'start' },
      );
      for (let i = 0; i < end; i++) {
        const vars = { round, end, i },
          ok = a[i] > a[i + 1];
        put(
          `比较a[${i}]=${a[i]}与a[${i + 1}]=${a[i + 1]}`,
          2,
          { ...vars, 'i+1': i + 1, condition: ok },
          ok ? '左值更大，要用三条赋值交换。' : '这对已非递减，不交换，仍会执行内层更新。',
          { active: [i, i + 1], phase: 'compare' },
        );
        if (ok) {
          const temp = a[i];
          put(`temp=${temp}`, 3, { ...vars, temp }, '保存即将被覆盖的左值。', {
            active: [i],
            phase: 'swap',
          });
          a[i] = a[i + 1];
          put('右值写入左格', 4, { ...vars, temp }, '旧左值仍在temp中，因此中间重复不丢数据。', {
            active: [i],
            phase: 'swap',
          });
          a[i + 1] = temp;
          put('temp写入右格', 5, { ...vars, temp }, '当前两格互换完成。内层更新还没发生。', {
            active: [i + 1],
            phase: 'swap',
          });
        }
        put(
          `执行 i++：i 从 ${i} 变为 ${i + 1}`,
          1,
          { ...vars, i: i + 1 },
          i + 1 < end
            ? 'i 仍小于 end，下一次继续比较同一轮的下一对。'
            : 'i 已等于 end，下一次条件检查会结束内层；此时 end 还没变。',
          { phase: 'inner-update' },
        );
      }
      put(
        `检查 i < end 为假：编号 ${end} 已确定`,
        1,
        { round, end, i: end, condition: false },
        '内层现在才结束。外层的更新是接下来的动作。',
        { active: [end], phase: 'inner-stop' },
      );
      put(
        `执行 end--：end 从 ${end} 变为 ${end - 1}`,
        0,
        { round, end: end - 1 },
        '缩小下轮的未排序范围，已确定的末尾位置不再参与比较。',
        { phase: 'outer-update' },
      );
    }
    put('排序完成', 8, {}, '所有元素保留，并按非递减顺序排列。', { output: [...a], phase: 'done' });
  } else if (['assignment', 'comparison', 'function'].includes(type)) {
    if (type === 'assignment') {
      const name = config.name || 'x',
        start = config.start ?? 3,
        add = config.add ?? 2,
        result = start + add;
      code = [`int ${name}=${start};`, `${name}=${name}+${add};`, `System.out.println(${name});`];
      put(`${name}初始化为${start}`, 0, { [name]: start }, '变量名不变，当前整数值已经保存。');
      put(
        `先用旧值计算${start}+${add}=${result}`,
        1,
        { [name]: start, 右侧结果: result },
        '求值阶段尚未覆盖左侧变量。',
      );
      put(`把${result}保存回${name}`, 1, { [name]: result }, '赋值完成，之后读取会得到新值。');
      put('输出当前值', 2, { [name]: result }, '输出不再改变这个变量。', { output: result });
    }
    if (type === 'comparison') {
      code = ['int a=3, b=5;', 'boolean equal=(a==b);'];
      put('保存两个输入整数', 0, { a: 3, b: 5 }, '两个变量互相独立。');
      put('比较3==5得到false', 1, { a: 3, b: 5, equal: false }, '比较只产生真假，不改变输入。', {
        output: false,
      });
    }
    if (type === 'function') {
      const left = config.left ?? 12,
        right = config.right ?? 5,
        result = left + right;
      code = [
        `int result=sum(${left},${right});`,
        '// 方法内：return num1+num2;',
        'System.out.println(result);',
      ];
      put('传入本次两个参数', 0, { num1: left, num2: right }, '参数分别接收本次调用提供的整数。');
      put(
        `计算${left}+${right}并return ${result}`,
        1,
        { num1: left, num2: right, result },
        'return交回值并结束这次方法。',
      );
      put(`调用者得到${result}`, 2, { result }, '返回与是否打印是两件事。', { output: result });
    }
  } else if (type === 'reduce') {
    let num = Number(config.n ?? 14),
      steps = 0;
    if (!Number.isInteger(num) || num < 0 || num > 99) throw Error('输入 num 请输入 0～99 的整数。');
    code = [
      'int steps=0;',
      'while(num>0) {',
      '    if(num%2==0) num=num/2;',
      '    else num=num-1;',
      '    steps++;',
      '}',
      'return steps;',
    ];
    put(`初始num=${num}、steps=0`, 0, { num, steps }, '起点状态不算做过一次操作。');
    while (num > 0) {
      const old = num,
        even = num % 2 === 0;
      put(
        `${num}%2==0为${even}`,
        even ? 2 : 3,
        { num, steps, '偶数?': even },
        '先计算条件，这一轮只选一个分支。',
      );
      num = even ? num / 2 : num - 1;
      put(
        even ? `${old}÷2=${num}` : `${old}-1=${num}`,
        even ? 2 : 3,
        { num, steps },
        '更新num后，下一轮必须用这个新值判断。',
      );
      steps++;
      put('steps加1', 4, { num, steps }, '一条变化对应一次计数，不把初始数字另计一次。');
    }
    put('num=0，不再进入循环', 6, { num, steps }, '返回已完成操作次数。', { output: steps });
  } else if (['frequency', 'twoSum'].includes(type)) {
    const map = new Map();
    code =
      type === 'frequency'
        ? [
            'Map<Integer,Integer> counts=new HashMap<>();',
            'for(int x:a) {',
            '    int old=counts.getOrDefault(x,0);',
            '    counts.put(x,old+1);',
            '}',
          ]
        : [
            'Map<Integer,Integer> seen=new HashMap<>();',
            'for(int i=0;i<a.length;i++) {',
            '    int need=target-a[i];',
            '    if(seen.containsKey(need)) return new int[]{seen.get(need),i};',
            '    seen.put(a[i],i);',
            '}',
          ];
    const entries = () => Array.from(map, ([k, v]) => `${k} → ${v}`);
    put(
      '表初始为空',
      0,
      {},
      type === 'frequency' ? '键是数字，值是次数。' : '键是过去的值，值是过去下标。',
      { secondary: ['空表'], label: type === 'frequency' ? '数字 → 次数' : '数字 → 下标' },
    );
    let found = false;
    for (let i = 0; i < a.length; i++) {
      const x = a[i];
      if (type === 'frequency') {
        const old = map.get(x) || 0;
        put(
          `读取${x}的旧次数${old}`,
          2,
          { i, x, old },
          map.has(x) ? '键存在，读取已有次数。' : '键不存在，本次按默认次数0处理。',
          { active: [i], secondary: entries(), label: '更新前' },
        );
        map.set(x, old + 1);
        put(`写入${x} → ${old + 1}`, 3, { i, x, count: old + 1 }, '只更新当前数字的次数，其他键不变。', {
          active: [i],
          secondary: entries(),
          label: '数字 → 次数',
        });
      } else {
        const need = target - x;
        put(
          `need=${target}-${x}=${need}`,
          2,
          { i, x, target, need },
          '当前值已定，另一数必须是这个补数。',
          { active: [i], secondary: entries(), label: '只含之前的位置' },
        );
        if (map.has(need)) {
          const pair = [map.get(need), i];
          put('旧表中找到搭档', 3, { i, need }, '先前位置与当前位置不同，保证没有复用同一格。', {
            active: pair,
            secondary: entries(),
            label: '命中的旧记录',
            output: pair,
          });
          found = true;
          break;
        }
        map.set(x, i);
        put(
          `未命中，再保存${x} → ${i}`,
          4,
          { i, x, need },
          '查询发生在登记当前值之前，不能把自己当成搭档。',
          { active: [i], secondary: entries(), label: '供未来使用' },
        );
      }
    }
    if (type === 'frequency')
      put('全部计数完成', 4, {}, '每个元素只登记一次。', {
        secondary: entries(),
        label: '最终频次',
        output: Object.fromEntries(map),
      });
    else if (!found)
      put('没有找到不同位置的一对', 5, { target }, '这组实验输入没有匹配答案。', { output: [] });
  } else if (type === 'recursion') {
    if (!Number.isInteger(n) || n < 0 || n > 8) throw Error('递归实验n请输入0～8的整数。');
    code = ['int sum(int n) {', '    if(n==0) return 0;', '    return n+sum(n-1);', '}'];
    const stack = [];
    for (let x = n; x >= 0; x--) {
      stack.push(`sum(${x})`);
      frames.push(
        F(
          `进入sum(${x})`,
          x === 0 ? 1 : 2,
          stack,
          { n: x },
          x === 0 ? '到达基础情况，直接返回0。' : `本层保留${x}，等更小的sum(${x - 1})返回再相加。`,
          { kind: 'stack', active: [stack.length - 1] },
        ),
      );
    }
    let result = 0;
    stack.pop();
    for (let x = 1; x <= n; x++) {
      result += x;
      frames.push(
        F(
          `sum(${x})返回${result}`,
          2,
          stack,
          { n: x, 子答案: result - x, result },
          `${x}+${result - x}=${result}，回到上层等待的位置继续。`,
          { kind: 'stack', active: [stack.length - 1] },
        ),
      );
      stack.pop();
    }
    frames.push(
      F('回到最初调用者', 3, [], { result }, '返回值不是自动打印的输出序列。', {
        output: result,
        kind: 'stack',
      }),
    );
  } else if (type === 'stack') {
    const text = config.text ?? defaults.text;
    if (text.length > 12 || !/^[()[\]{}]*$/.test(text))
      throw Error('请输入最多12个小括号、中括号或花括号。');
    const st = [],
      pairs = { '(': ')', '[': ']', '{': '}' };
    code = [
      'for(char c:s.toCharArray()) {',
      '    // 左括号：push对应的右括号',
      '    // 右括号：检查栈空或pop是否匹配',
      '}',
      'return stack.isEmpty();',
    ];
    let valid = true;
    frames.push(
      F('期待栈初始为空', -1, [], { s: text }, '栈从底到顶显示，最后一个是当前最需要匹配的期待。', {
        kind: 'stack',
      }),
    );
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (pairs[c]) {
        st.push(pairs[c]);
        frames.push(
          F(
            `读到${c}，压入期待${pairs[c]}`,
            1,
            st,
            { i, c },
            '最近打开的必须最先关闭，所以新的期待放在栈顶。',
            { kind: 'stack', active: [st.length - 1] },
          ),
        );
      } else if (!st.length || st.at(-1) !== c) {
        frames.push(
          F(
            `读到${c}，无法匹配`,
            2,
            st,
            { i, c },
            st.length
              ? `栈顶期待${st.at(-1)}，类型不一致，立即失败。`
              : '栈为空，没有左侧搭档，不能pop。',
            { kind: 'stack', error: true, output: false },
          ),
        );
        valid = false;
        break;
      } else {
        st.pop();
        frames.push(
          F(`${c}匹配栈顶，移除一个期待`, 2, st, { i, c }, '只关闭最近的一对，其他期待继续保留。', {
            kind: 'stack',
          }),
        );
      }
    }
    if (valid)
      frames.push(
        F(
          '字符串已读完',
          4,
          st,
          {},
          st.length ? '还有未关闭的期待，所以不完整。' : '没有错配且期待全部关闭。',
          { kind: 'stack', output: st.length === 0 },
        ),
      );
  } else if (type === 'queue') {
    code = ['queue.offerLast(7);', 'queue.offerLast(2);', 'int first=queue.pollFirst();'];
    frames.push(F('空队列', -1, [], {}, '左侧为队首，右侧为队尾。', { kind: 'queue' }));
    frames.push(
      F('队尾加入7', 0, [7], {}, '第一位等待者也是当前队首。', { kind: 'queue', active: [0] }),
    );
    frames.push(
      F('队尾加入2', 1, [7, 2], {}, '新来的排在已有元素之后。', { kind: 'queue', active: [1] }),
    );
    frames.push(
      F('队首取出7', 2, [2], { first: 7 }, '先进先出，2仍在队列中。', { kind: 'queue', output: 7 }),
    );
  } else if (type === 'linked') {
    code = ['Node n=new Node(2);', 'n.next=p.next;', 'p.next=n;'];
    frames.push(
      F('p指向1，旧后继是3', -1, [1, 3], { 'p.value': 1 }, '箭头表示next引用，数字大小不决定连接。', {
        kind: 'linked',
      }),
    );
    frames.push(
      F('创建新结点2', 0, [1, 3], { 'n.value': 2 }, '新对象已存在，但还没接进从p开始的主链。', {
        kind: 'linked',
        secondary: ['n: 2 → null'],
        label: '新结点',
        detached: { value: 2, next: null, name: '新结点 n' },
      }),
    );
    frames.push(
      F('n先连到旧后继3', 1, [1, 3], { 'n.next': '结点3' }, '先保存后半段，p.next仍然是旧的3。', {
        kind: 'linked',
        secondary: ['n: 2 → 3'],
        label: '已接后半段',
        detached: { value: 2, next: 1, name: '新结点 n' },
      }),
    );
    frames.push(
      F('p再连到n', 2, [1, 2, 3], { 'p.next': '结点2' }, '前后连接都完成，旧后继没有丢。', {
        kind: 'linked',
        output: [1, 2, 3],
      }),
    );
  } else if (type === 'dp' && config.variant === 'rolling') {
    if (!Number.isInteger(n) || n < 1 || n > 8) throw Error('台阶数n请输入1～8的整数。');
    code = [
      'if(n<=2) return n;',
      'int a=1, b=2;',
      'for(int i=3;i<=n;i++) {',
      '    int next=a+b;',
      '    a=b;',
      '    b=next;',
      '}',
      'return b;',
    ];
    if (n <= 2) {
      frames.push(
        F(`输入n=${n}`, -1, [n], { n }, '先检查是否属于已知的基础情况。', { labels: ['输入n'] }),
      );
      frames.push(
        F(`基础情况返回${n}`, 0, [n], { n }, '1级1种、2级2种，不进入循环。', {
          labels: ['答案'],
          output: n,
        }),
      );
    } else {
      let a = 1,
        b = 2;
      const emit = (statement, line, vars, why, extra = {}) =>
        frames.push(F(statement, line, [a, b], vars, why, { labels: ['变量a', '变量b'], ...extra }));
      emit('a=1、b=2保存第1、2级答案', 1, { a, b }, '最初两项已知，下一轮从第3级开始。');
      for (let i = 3; i <= n; i++) {
        const next = a + b;
        emit(
          `next=${a}+${b}=${next}`,
          3,
          { i, a, b, next },
          '先用两份旧答案算新答案并暂存；此时a、b还未覆盖。',
        );
        a = b;
        emit(
          `a=b，把旧b的${b}放进a`,
          4,
          { i, a, b, next },
          'a向前滚动；新答案仍保存在next里，不能先改b。',
        );
        b = next;
        emit(
          `b=next，把${next}放进b`,
          5,
          { i, a, b, next },
          '本轮结束后，a、b分别代表第i-1级、第i级的答案。',
        );
      }
      emit(`返回b=${b}`, 7, { n, a, b }, '不必保留整张表，只保留下一次计算会用到的两项。', {
        output: b,
      });
    }
  } else if (type === 'dp') {
    if (!Number.isInteger(n) || n < 1 || n > 8) throw Error('台阶数n请输入1～8的整数。');
    const dp = Array(n + 1).fill('—');
    code = [
      'dp[1]=1;',
      'if(n>=2) dp[2]=2;',
      'for(int i=3;i<=n;i++) {',
      '    dp[i]=dp[i-1]+dp[i-2];',
      '}',
      'return dp[n];',
    ];
    dp[1] = 1;
    frames.push(
      F('填写第1级基础答案1', 0, dp.slice(1), { i: 1 }, '只有一次走1级这一种方案。', { active: [0] }),
    );
    if (n >= 2) {
      dp[2] = 2;
      frames.push(
        F('填写第2级基础答案2', 1, dp.slice(1), { i: 2 }, '1+1与2是两种不同方案。', { active: [1] }),
      );
    }
    for (let i = 3; i <= n; i++) {
      dp[i] = dp[i - 1] + dp[i - 2];
      frames.push(
        F(
          `dp[${i}]=${dp[i - 1]}+${dp[i - 2]}=${dp[i]}`,
          3,
          dp.slice(1),
          { i, 前一级: dp[i - 1], 前两级: dp[i - 2] },
          '按最后一步来自前一级或前两级分组，两类不重复，依赖都已算好。',
          { active: [i - 3, i - 2, i - 1] },
        ),
      );
    }
    frames.push(
      F('读取目标状态', 5, dp.slice(1), { n }, '此时每个已填格都表示到那一级的方案数。', {
        output: dp[n],
      }),
    );
  } else if (type === 'stock') {
    let min = a[0],
      best = 0;
    code = [
      'int min=prices[0], best=0;',
      'for(int i=1;i<prices.length;i++) {',
      '    best=Math.max(best,prices[i]-min);',
      '    min=Math.min(min,prices[i]);',
      '}',
      'return best;',
    ];
    put('第一天作为历史买入候选', 0, { min, best }, '不交易利润0；第一天还没有更早的合法买入日。', {
      active: [0],
    });
    for (let i = 1; i < a.length; i++) {
      const profit = a[i] - min;
      best = Math.max(best, profit);
      put(
        `今天卖出候选利润${a[i]}-${min}=${profit}`,
        2,
        { i, min, best, profit },
        '先用此前最低买价考虑今天卖出，保留最好合法结果。',
        { active: [i] },
      );
      min = Math.min(min, a[i]);
      put(
        `更新未来要用的min=${min}`,
        3,
        { i, min, best },
        '把今天价格加入历史，供下一天作为买入候选。',
        { active: [i] },
      );
    }
    put('所有卖出日都已考虑', 5, { min, best }, 'best至少为0，不强迫进行亏损交易。', { output: best });
  } else if (type === 'merge') {
    code = [
      'if (l >= r) return;',
      'int m = l + (r-l)/2;',
      'sort(a, temp, l, m);',
      'sort(a, temp, m+1, r);',
      'int i=l, j=m+1, k=l;',
      'while (i<=m && j<=r) {',
      '    if (a[i]<=a[j]) temp[k++]=a[i++];',
      '    else temp[k++]=a[j++];',
      '}',
      'while (i<=m) temp[k++]=a[i++];',
      'while (j<=r) temp[k++]=a[j++];',
      'for (int p=l; p<=r; p++) a[p]=temp[p];',
    ];
    const temp = Array(a.length).fill('—'),
      calls = [];
    function sort(l, r) {
      calls.push('[' + l + ',' + r + ']');
      const snap = (statement, line, vars, why, extra = {}) =>
        put(statement, line, { l, r, ...vars }, why, {
          range: [l, r],
          stack: [...calls],
          ...extra,
        });
      snap(
        '进入区间 [' + l + ',' + r + ']',
        0,
        {},
        l >= r ? '一个元素已经有序，返回上一层。' : '先拆成更小的同类问题。',
        { phase: l >= r ? 'base' : 'enter' },
      );
      if (l >= r) {
        calls.pop();
        return;
      }
      const m = l + Math.floor((r - l) / 2);
      const groups = [
        [l, m],
        [m + 1, r],
      ];
      snap('中点 m=' + m + '，分为两个区间', 1, { m }, '按下标分两段，不是按数值大小分组。', {
        groups,
        phase: 'split',
      });
      snap('先递归左半段', 2, { m }, '当前区间暂停，等左半段排好。', { groups, phase: 'call-left' });
      sort(l, m);
      snap('左半段返回，再递归右半段', 3, { m }, '左边已排好；现在单独处理右边。', {
        groups,
        phase: 'call-right',
      });
      sort(m + 1, r);
      let i = l,
        j = m + 1,
        k = l;
      const snapshot = (statement, line, why, active, phase, vars = {}) =>
        snap(statement, line, { m, i, j, k, ...vars }, why, {
          active,
          groups,
          secondary: [...temp],
          label: '辅助数组 temp',
          phase,
        });
      snapshot(
        '两个有序段都已返回，准备合并',
        4,
        'i、j 指向两边待取的第一个位置；k 指向暂存位置。',
        [i, j],
        'heads',
      );
      function copy(from, line, reason) {
        const dest = k;
        temp[k++] = a[from];
        snapshot(
          '把 a[' + from + ']=' + a[from] + ' 写入 temp[' + dest + ']',
          line,
          reason,
          [from],
          'take',
          { from, dest },
        );
      }
      while (i <= m && j <= r) {
        const takeLeft = a[i] <= a[j];
        snapshot(
          '比较左队首 ' + a[i] + ' 与右队首 ' + a[j],
          5,
          '取更小者；相等时先取左边，保留原先顺序。',
          [i, j],
          'compare',
        );
        if (takeLeft) copy(i++, 6, '左队首较小或相等，先取左边；原数组尚未改动。');
        else copy(j++, 7, '右队首较小，先取右边；原数组尚未改动。');
      }
      while (i <= m) copy(i++, 9, '右半段取完，顺序补左边剩下的值。');
      while (j <= r) copy(j++, 10, '左半段取完，顺序补右边剩下的值。');
      for (let p = l; p <= r; p++) {
        a[p] = temp[p];
        snapshot('写回 a[' + p + ']=' + a[p], 11, '只写回当前区间，其他位置不动。', [p], 'write', { p });
      }
      snap('有序区间 [' + l + ',' + r + '] 返回', 11, { m }, '父调用可以把这一段当作有序子结果。', {
        groups,
        secondary: [...temp],
        label: '当前合并结果',
        phase: 'return',
      });
      calls.pop();
    }
    sort(0, a.length - 1);
    put('归并排序完成', -1, {}, '所有递归已返回，原数组中保留所有元素，且从小到大。', {
      output: [...a],
      phase: 'done',
      stack: [],
    });
  } else if (type === 'quick') {
    code = [
      'if (l>=r) return;',
      'int i=l,j=r,pivot=a[l+(r-l)/2];',
      'while (i<=j) {',
      '    while (a[i]<pivot) i++;',
      '    while (a[j]>pivot) j--;',
      '    if (i<=j) {',
      '        int temp=a[i]; a[i]=a[j]; a[j]=temp;',
      '        i++; j--;',
      '    }',
      '}',
      'if (l<j) quick(a,l,j);',
      'if (i<r) quick(a,i,r);',
    ];
    const calls = [];
    function quick(l, r) {
      calls.push('[' + l + ',' + r + ']');
      let i = l,
        j = r,
        pivot;
      const inRange = (index) => index >= l && index <= r;
      const pointers = () => [...new Set([i, j].filter(inRange))];
      const snap = (statement, line, why, phase, extra = {}) =>
        put(statement, line, { l, r, i, j, ...(pivot !== undefined ? { pivot } : {}) }, why, {
          range: [l, r],
          stack: [...calls],
          active: pointers(),
          phase,
          ...extra,
        });
      if (l >= r) {
        snap('区间最多一个元素，直接返回', 0, '单个元素不需要分区。', 'base');
        calls.pop();
        return;
      }
      const p = l + Math.floor((r - l) / 2);
      pivot = a[p];
      snap(
        '从下标 ' + p + ' 保存基准值 ' + pivot,
        1,
        '保存的是值；交换数组元素不会改动 pivot。',
        'pivot',
      );
      while (i <= j) {
        snap('指针尚未交错，开始本轮扫描', 2, '左边找 ≥ pivot，右边找 ≤ pivot。', 'scan');
        while (a[i] < pivot) {
          i++;
          snap('左指针向右走到 ' + i, 3, '刚才的值小于基准，可以留在左边。', 'move-left');
        }
        while (a[j] > pivot) {
          j--;
          snap('右指针向左走到 ' + j, 4, '刚才的值大于基准，可以留在右边。', 'move-right');
        }
        if (i <= j) {
          snap(
            '两侧都已停下，位置 ' + i + ' 与 ' + j + ' 可以交换',
            5,
            '只有 i≤j 才交换；两指针重合时是原地交换。',
            'compare',
          );
          [a[i], a[j]] = [a[j], a[i]];
          snap('交换 a[' + i + '] 与 a[' + j + ']', 6, '这一帧只改变数组，两个指针还没移动。', 'swap');
          i++;
          j--;
          snap(
            '交换后 i++、j--',
            7,
            '相等值也必须推进两个指针，否则可能反复停在同一对位置。',
            'advance',
          );
        }
      }
      const groups = [
        [l, j],
        [i, r],
      ].filter(([lo, hi]) => lo <= hi);
      snap('指针已交错：本区间分组结束', 9, '左、右子区间只完成分组，组内可能仍无序。', 'partition', {
        groups,
      });
      if (l < j) {
        snap('递归左边 [' + l + ',' + j + ']', 10, '只把仍有多个元素的左区间交给下一层。', 'call-left', {
          groups,
        });
        quick(l, j);
      }
      if (i < r) {
        snap(
          '递归右边 [' + i + ',' + r + ']',
          11,
          '只把仍有多个元素的右区间交给下一层。',
          'call-right',
          { groups },
        );
        quick(i, r);
      }
      snap('区间 [' + l + ',' + r + '] 已处理完', -1, '子区间都已返回，回到调用它的位置。', 'return');
      calls.pop();
    }
    quick(0, a.length - 1);
    put('快排完成', -1, {}, '分区与递归都结束，整个数组已排好。', {
      output: [...a],
      phase: 'done',
      stack: [],
    });
  } else if (['bfs', 'dfs'].includes(type)) {
    const graph = [
        [1, 2],
        [0, 3],
        [0, 3],
        [1, 2],
      ],
      names = ['A', 'B', 'C', 'D'],
      seen = new Set(),
      q = [],
      order = [];
    code =
      type === 'bfs'
        ? [
            'q.offer(start); seen[start]=true;',
            'while(!q.isEmpty()) {',
            '    int v=q.poll();',
            '    for(int next:graph[v]) {',
            '        if(!seen[next]) { seen[next]=true; q.offer(next); }',
            '    }',
            '}',
          ]
        : ['if(seen[v]) return;', 'seen[v]=true;', 'for(int next:graph[v]) visit(next);'];
    const emit = (s, line, v, why) =>
      frames.push(
        F(
          s,
          line,
          names,
          { current: names[v], seen: Array.from(seen, (x) => names[x]).join(',') },
          why,
          {
            active: [v],
            kind: 'graph',
            secondary: type === 'bfs' ? q.map((x) => names[x]) : [...order],
            label: type === 'bfs' ? '队首 → 队尾' : '访问顺序',
          },
        ),
      );
    if (type === 'bfs') {
      seen.add(0);
      q.push(0);
      emit('起点A发现并入队', 0, 0, '发现时就标记，防止之后重复入队。');
      while (q.length) {
        const v = q.shift();
        order.push(names[v]);
        emit(`取出${names[v]}处理`, 2, v, '先进先出，使浅层先于更深层。');
        for (const x of graph[v])
          if (!seen.has(x)) {
            seen.add(x);
            q.push(x);
            emit(`发现${names[x]}并立即标记入队`, 4, x, '以后再次遇到这个点就不再重复加入。');
          }
      }
    } else {
      function visit(v) {
        if (seen.has(v)) return;
        seen.add(v);
        order.push(names[v]);
        emit(`进入${names[v]}并标记`, 1, v, '先深入当前分支，调用栈保留返回位置。');
        for (const x of graph[v]) visit(x);
        emit(`离开${names[v]}，返回上一层`, 2, v, '当前点所有邻居已尝试，回到调用者继续其他分支。');
      }
      visit(0);
    }
    frames.push(
      F(
        '可到达顶点全部处理完',
        code.length - 1,
        names,
        { count: seen.size },
        '顺序可能不同，但每个可达顶点只计一次。',
        { kind: 'graph', output: seen.size, secondary: order, label: '实际处理顺序' },
      ),
    );
  } else if (['treeDepth', 'preorder', 'treeBfs'].includes(type)) {
    const levelOrder =
      config.root ?? (config.tree === 'three' ? [2, 1, 3] : [3, 9, 20, null, null, 15, 7]);
    const values = [],
      children = [],
      treeEdges = [];
    if (levelOrder[0] != null) {
      values.push(levelOrder[0]);
      let next = 1;
      for (let parent = 0; parent < values.length; parent++) {
        children[parent] = [undefined, undefined];
        for (let side = 0; side < 2 && next < levelOrder.length; side++) {
          const value = levelOrder[next++];
          if (value != null) {
            children[parent][side] = values.length;
            treeEdges.push([parent, values.length, side]);
            values.push(value);
          }
        }
      }
    }
    const positions = layoutTree(children),
      out = [];
    const emit = (s, line, active, vars, why, extra = {}) =>
      frames.push(
        F(s, line, values, vars, why, {
          kind: 'tree',
          active,
          edges: treeEdges,
          positions,
          ...extra,
        }),
      );
    if (type === 'treeDepth') {
      code = [
        'if(node==null) return 0;',
        'int left=depth(node.left);',
        'int right=depth(node.right);',
        'return 1+Math.max(left,right);',
      ];
      const calls = [];
      function depth(v) {
        if (v === undefined) return 0;
        calls.push(values[v]);
        emit('进入结点' + values[v], 1, [v], {}, '先取得左右子树各自的答案。', { stack: [...calls] });
        const l = depth(children[v][0]),
          r = depth(children[v][1]),
          ans = 1 + Math.max(l, r);
        emit(
          '结点' + values[v] + '返回' + ans,
          3,
          [v],
          { left: l, right: r, result: ans },
          '当前这一层1，加上更深的一边max(' + l + ',' + r + ')。',
          { stack: [...calls] },
        );
        calls.pop();
        return ans;
      }
      const ans = depth(values.length ? 0 : undefined);
      emit('整棵树深度求出', 3, values.length ? [0] : [], {}, '按节点层数计数，空树深度为 0。', {
        output: ans,
      });
    } else if (type === 'preorder') {
      const order = config.order || 'preorder',
        place = { preorder: 0, inorder: 1, postorder: 2 }[order];
      if (place === undefined) throw new RangeError('未知的遍历顺序：' + order);
      const name = ['前序', '中序', '后序'][place],
        rule = ['根 → 左 → 右', '左 → 根 → 右', '左 → 右 → 根'][place];
      code = [
        'if(node==null) return;',
        ...Array.from({ length: 3 }, (_, i) =>
          i === place
            ? 'result.add(node.val);'
            : i < place
              ? i === 0
                ? 'visit(node.left);'
                : 'visit(node.right);'
              : i === 1
                ? 'visit(node.left);'
                : 'visit(node.right);',
        ),
      ];
      function visit(v) {
        if (v === undefined) return;
        function record() {
          out.push(values[v]);
          emit('记录结点 ' + values[v], place + 1, [v], {}, name + '按 ' + rule + ' 处理。', {
            secondary: [...out],
            label: '已经记录的顺序',
          });
        }
        if (place === 0) record();
        visit(children[v][0]);
        if (place === 1) record();
        visit(children[v][1]);
        if (place === 2) record();
      }
      visit(values.length ? 0 : undefined);
      emit(name + '遍历完成', -1, [], {}, '结果由 ' + rule + ' 决定，普通二叉树并不保证数值有序。', {
        output: out,
      });
      return { title: name + '遍历 · ' + rule, frames, code };
    } else {
      code = [
        'if (root==null) return 0;',
        'q.offer(root); int depth=0;',
        'while(!q.isEmpty()) {',
        '    int size=q.size();',
        '    // 恰好处理size个结点，孩子入队',
        '    depth++;',
        '}',
        'return depth;',
      ];
      const q = values.length ? [0] : [];
      let depth = 0;
      if (q.length)
        emit('根进入队列', 1, q, { depth }, '根是第一层唯一的结点。', {
          secondary: [values[0]],
          label: '队首 → 队尾',
        });
      while (q.length) {
        const size = q.length;
        emit(
          '本轮固定 size=' + size,
          3,
          q,
          { size, depth },
          '接下来新加入的孩子属于下一层，不能改变本轮处理数量。',
          { secondary: q.map((v) => values[v]), label: '本层队列' },
        );
        for (let k = 0; k < size; k++) {
          const v = q.shift();
          q.push(...children[v].filter((child) => child !== undefined));
          emit(
            '处理 ' + values[v] + '，加入存在的孩子',
            4,
            [v],
            { size, k, depth },
            '只处理本轮开始的 size 个结点，队尾的新孩子留到下一轮。',
            { secondary: q.map((v) => values[v]), label: '剩余队列' },
          );
        }
        depth++;
        emit('本层处理完，depth 加 1', 5, [], { depth }, '计数增加一层，而不是每个结点增加一次。');
      }
      emit('队列为空，返回深度', 7, [], { depth }, '所有层都处理完毕。', { output: depth });
    }
  }
  return {
    title:
      type === 'dp' && config.variant === 'rolling' ? '滚动变量：先算next，再更新a和b' : TITLES[type],
    code,
    frames,
  };
}
