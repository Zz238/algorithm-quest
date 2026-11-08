import { JAVA_BY_ID } from './java-starter.js';
import { EXTRA_JAVA_TASKS } from './java-writing-tasks.js';
const output = (question, answer, explanation, hint) => ({
  kind: 'output',
  question,
  answer,
  explanation,
  hints: [hint],
});
const pick = (question, options, answer, explanation, hint) => ({
  kind: 'choice',
  question,
  options,
  answer,
  explanation,
  hints: [hint],
});
const write = (question, template, answer, explanation, hint, accepted = []) => ({
  kind: 'code',
  question,
  template,
  answer,
  accepted,
  explanation,
  hints: [hint],
});
const order = (question, options, explanation, hint) => ({
  kind: 'order',
  question,
  options,
  answer: [0, 1, 2],
  explanation,
  hints: [hint],
});
const arr = (v) => JSON.stringify(v);

// A fresh input is supplied with each practice attempt. Keep each prompt self-contained.
export function reviewVariant(id, seed = 0) {
  const a = 2 + (seed % 29),
    b = a + 3,
    c = b + 2;
  const n = (q, v, e, h) => output(q, v, e, h);
  const p = (q, x, e, h) => pick(q, x, 0, e, h);
  const A = arr([b, a, c]);
  switch (id) {
    case '1-1':
      return p(
        `买两样东西分别花 ${a} 元和 ${b} 元，任务是报总价。哪一项是输出？`,
        ['两件的总价', '商品的原始价格', '开始结算的时间'],
        '给定的金额是输入；算出的合计才是输出。',
        '先问任务要求最终交出什么。',
      );
    case '1-2':
      return n(
        `数组 a=${A}，编号从0开始。a[1] 的值是多少？`,
        a,
        '编号1是第二格，读出那格的内容。',
        '先数格子位置，再读内容。',
      );
    case '1-5':
      return n(
        `x=${a}，先加3，再乘2。执行完两步后 x 是多少？`,
        (a + 3) * 2,
        '第二步使用第一步更新后的值。',
        '先在纸上记下第一步的结果。',
      );
    case '1-3':
      return n(
        `有 ${a} 张卡片，目标只在最后一张。从第一张逐张查看，找到就停。一共看几张？`,
        a,
        '直到最后一张才找到，所有卡片都看了一次。',
        '逐个检查不能跳过前面的卡片。',
      );
    case '1-4':
      return n(
        `账单 a=${A}，从总额0开始逐项相加。请填处理完每项后记下的三个累计值。`,
        [b, b + a, b + a + c],
        '每次把新的一项加到已经记住的总额。',
        '第一项的累计就是第一张账单的金额。',
      );
    case '1-6':
      return p(
        `规则“只要有新账单，总额一定变大”。原总额 ${b} 元，哪笔新账单能推翻它？`,
        ['退款 −2 元', '消费 1 元', '消费 3 元'],
        '退款使总额变小，构成反例。',
        '找一项使规则不成立的数据。',
      );
    case '2-1':
      return n(
        `main 里依次执行 int x=${a}; x=x+3; System.out.println(x); 打印多少？`,
        b,
        '打印读取已经更新的 x。',
        '从第一行开始，记录每次更新。',
      );
    case '2-2':
      return write(
        `int count=${a}，要把当前 count 加2。补全右侧。`,
        'count = ____;',
        'count + 2',
        '先读取旧 count，再保存算出的结果。',
        '右侧需要用到已有变量。',
        ['2 + count'],
      );
    case '2-3':
      return p(
        `int x=${a}, y=${b}; 哪个表达式比较两数相等且不会改变 x？`,
        ['x == y', 'x = y', 'x + y'],
        '== 比较，= 写入。',
        '注意是两个等号还是一个等号。',
      );
    case '2-4':
      return n(
        `方法 sum(int x,int y) 返回 x+y。调用 sum(${a},${b}) 返回多少？`,
        a + b,
        '两个实参进入 x、y，相加后交回调用者。',
        '先写清两个参数各收到什么。',
      );
    case '2-5':
      return n(
        `int[] a={${b},${a},${c}}; i=0。a[i+1] 的结果是多少？`,
        a,
        'i+1 算出编号1，再读第二格。',
        '单独计算方括号里的式子。',
      );
    case '2-6':
      return write(
        `sum 接收 int x 和 int y，任务是交回它们的和。当前写的是 x-y，修正表达式（例如 x=${a}, y=${b}）。`,
        'return ____;',
        'x + y',
        '要相加，而且要把值交回调用者。',
        '检查算术符号。',
        ['y + x'],
      );
    case '3-1':
      return n(
        `num=${2 * a + 1}，如果 num 是偶数就除2，否则减1。只执行一个分支，结果是多少？`,
        2 * a,
        '奇数走减1分支。',
        '先检查 num 除2的余数。',
      );
    case '3-2':
      return n(
        `a=${A}，sum=0。从下标0开始，循环中每轮执行 sum=sum+a[i]。刚完成 i=1 的循环体，sum 是多少？`,
        b + a,
        '此时只加了下标0、1的两项。',
        '不要把还没有处理的第三格加进去。',
      );
    case '3-3':
      return n(
        `left=${a}，while(left>0) 每轮执行 left=left-1。总共执行多少轮？`,
        a,
        '每轮减1，减到0后下一次判断失败。',
        '从初始值一直数到0。',
      );
    case '3-5':
      return n(
        `a=${A}，i=1。只执行 int next=a[i+1]; 之后 i 是多少？`,
        1,
        'i+1 计算下标但没有写回 i。',
        '找找哪条语句真的给 i 赋值。',
      );
    case '3-4':
      return n(
        `num=${2 * a}，steps=0。执行一轮：偶数除2、奇数减1，再令 steps 加1。此轮结束后 num 是多少？`,
        a,
        '旧 num 是偶数，执行除2。',
        '只走一轮，不要继续直到0。',
      );
    case '3-6':
      return n(
        `在 Java 中，int n=${2 * a + 1}; 执行 n/2（两边都是整数），结果是多少？`,
        a,
        '正整数相除丢掉小数部分。',
        '先找整数商，再看余数是否要保留。',
      );
    case '4-1':
      return n(
        `数组 a=${A}，将编号1的元素改成 ${a + 1}。改完后数组是什么？`,
        [b, a + 1, c],
        '赋值只修改指定的一格。',
        '编号1是中间那格。',
      );
    case '4-5':
      return n(
        `数组 a=${A}，i=1。读取 a[i+1] 得到什么数？`,
        c,
        'i+1=2，读第3格。',
        '先算编号，再读值。',
      );
    case '4-6':
      return n(
        `a=${A}，b=a，没有新建数组。执行 b[0]=${a - 1} 后 a[0] 是多少？`,
        a - 1,
        '两个变量指向同一个数组。',
        '判断是复制了数组，还是只复制了指向。',
      );
    case '4-2': {
      const s = seed % 2 ? 'radar' : 'robot';
      return n(
        `s="${s}"，大小写按原样比较。正着读与倒着读是否相同？`,
        s === 'radar',
        s === 'radar' ? '从外往内的两对字符都相同。' : '第一对 r 和 t 就不同。',
        '先比最左和最右。',
      );
    }
    case '4-3':
      return n(
        `从左到右在 a=${A} 中找 ${c}，找到即返回从0开始的下标。返回多少？`,
        2,
        '目标出现在编号2。',
        '一个位置一个位置地比较。',
      );
    case '4-4':
      return n(
        `有序数组 a=${arr([a, b, c, c + 4, c + 9])}，查找 ${b}，返回从0开始的下标。结果是多少？`,
        1,
        '中点值比目标大，保留左边，再找到编号1。',
        '第一次检查编号2，再决定保留哪半边。',
      );
    case '5-5':
      return p(
        `对 ${arr([b, a, a])} 做非递减排序，哪组结果正确且没有丢元素？`,
        [arr([a, a, b]), arr([a, b]), arr([b, a, a])],
        '非递减允许相等，重复项必须保留。',
        '同时检查顺序和每个值的出现次数。',
      );
    case '5-6':
      return n(
        `a=${A}，要交换下标0和1。完整执行三步交换后数组是什么？`,
        [a, b, c],
        '用临时变量保存首格旧值，其他位置不变。',
        '先记下第0格原来是什么。',
      );
    case '5-1':
      return n(
        `从左向右完成一轮冒泡，数组初始为 ${A}，相邻对左大右小就交换。一轮结束后数组是什么？`,
        [a, b, c],
        '先换第一对，再比较第二对。',
        '只做这一轮，每次使用最新数组。',
      );
    case '5-2':
      return n(
        `数组 ${arr([a, c, b])} 的前两格已排好。用插入法把第三格放进前两格的合适位置，得到什么？`,
        [a, b, c],
        '将较大的 c 右移，再把待插入值填到中间。',
        '先暂存待插入值。',
      );
    case '5-3':
      return p(
        `两本书甲、乙都高 ${a} 厘米，甲原来在乙前。哪种情况体现稳定排序？`,
        ['相等时保留甲在乙前', '把乙固定换到甲前', '丢掉一本一样高的书'],
        '稳定性关心相等元素的相对次序。',
        '不只看最后的身高数值。',
      );
    case '5-4':
      return n(
        `原身高 ${A}，目标顺序为 ${arr([a, b, c])}。按同下标比较，有多少处不一致？`,
        2,
        '前两格不同，末格相同。',
        '数位置，不数交换动作。',
      );
    case '6-5':
      return n(
        `a=${A}，b=a；接着令 b=null。现在还能从 a 读到 a[0] 吗？`,
        true,
        'b 的去向被清空，a 仍指向原对象。',
        '画两个变量各自的箭头。',
      );
    case '6-1':
      return n(
        `节点 A.value=${a}，A.next 指向 B，B.value=${b}。p 初始指向 A；执行 p=p.next 后，p.value 是多少？`,
        b,
        'p 改为指向 B，读到 B 的数据。',
        '先沿 next 找对象，再读 value。',
      );
    case '6-2':
      return p(
        `链为 A(${a}) → B(${b})，要在 A 后插 N(${c}) 并保留 B。先执行哪句？`,
        ['N.next=A.next', 'A.next=N', 'N.next=N'],
        '先记住旧后继，再改 A 的连接。',
        '先问改写 A.next 后还能否从它读到旧 B。',
      );
    case '6-3':
      return n(
        `空栈依次放入 ${a}、${b}，再取出一次。取出的是哪个数？`,
        b,
        '后放的位于栈顶，先取出。',
        '想成叠盘子，只从顶端取。',
      );
    case '6-4':
      return n(
        `普通队列按到达先后处理。先加入 ${b}，再加入 ${a}，先取出谁？`,
        b,
        '先进先出，与数字大小无关。',
        '先找队首。',
      );
    case '6-6': {
      const s = seed % 2 ? '[{}]' : '{[}]';
      return n(
        `字符串 ${s} 中，每个右括号必须匹配最近未闭合的左括号，是否有效？`,
        s === '[{}]',
        s === '[{}]' ? '先闭合内层，再闭合外层。' : '第一个右括号与最近的左括号不匹配。',
        '把期待的右括号压入栈顶。',
      );
    }
    case '7-1':
      return n(
        `空 Map 先执行 put(${a},1)，再执行 put(${a},4)，get(${a}) 读到多少？`,
        4,
        '相同的键更新原记录。',
        '只看最后一次写入该键。',
      );
    case '7-2':
      return n(
        `用表统计 ${arr([a, b, a, a, c])} 的出现次数。键 ${a} 对应的值是多少？`,
        3,
        '遇到该数字三次，每次加1。',
        '键是数字，值才是次数。',
      );
    case '7-5':
      return n(
        `把 ${arr([a, b, a, c, b])} 的数逐个放进 Set，最后集合大小是多少？`,
        3,
        '相同值重复加入不增加大小。',
        '先列出不同的数。',
      );
    case '7-3':
      return n(
        `数组 ${A}，目标和是 ${b + c}。每个下标最多用一次，唯一解的两个从0开始的下标（从小到大）是什么？`,
        [0, 2],
        '第0格与第2格相加符合要求。',
        '先求“目标和减当前值”要找谁。',
      );
    case '7-4':
      return p(
        `键 ${a} 和 ${b} 被分到同一个桶；只查询键 ${b}。应怎样做？`,
        ['在桶内核对实际键', '返回桶内第一条', '认为两个键相等'],
        '桶相同只是候选位置相同，还要比较键。',
        '书架相同不代表书名相同。',
      );
    case '7-6':
      return n(
        `nums=${arr([a, a, b])}，target=${2 * a}。先查再写，返回两个不同的下标（从小到大）。`,
        [0, 1],
        '读到第二个相同数时，表里已记住第一个。',
        '不要让当前元素和自己配对。',
      );
    case '8-1':
      return n(
        `sum(0)=0；n>0 时 sum(n)=n+sum(n-1)。sum(${(a % 5) + 2}) 的结果是什么？`,
        (((a % 5) + 2) * ((a % 5) + 3)) / 2,
        '到0停止；返回时逐层相加。',
        '先写出最小的一层 sum(0)。',
      );
    case '8-5':
      return n(
        `当前层执行 return ${a}+f(0);。内层 f(0) 刚返回2，当前层最终返回多少？`,
        a + 2,
        '内层交回值后，外层接着完成加法。',
        '回到原来暂停的那条表达式。',
      );
    case '8-2':
      return n(
        `两个有序数组 [${a},${c}] 和 [${b},${c + 2}]，依次取两侧较小的首项进行合并。合并结果是什么？`,
        [a, b, c, c + 2],
        '两边各自有序，每次取较小的候选。',
        '每次只看两边还没取的第一项。',
      );
    case '8-3':
      return n(
        `正在枚举 [${a},${b}] 的组合。path=[${a},${b}]，退出刚选择 ${b} 的分支后，path 应恢复成什么？`,
        [a],
        '撤销最后一次选择，不会清空整个路径。',
        '只撤销刚才加入的一项。',
      );
    case '8-4':
      return n(
        `nums=${A}，子集递归本层选择了下标1，子层只允许选更大的下标。子层的 start 是多少？`,
        2,
        '从当前下标的下一格开始。',
        '下一层不能重用已经选过的位置。',
      );
    case '8-6':
      return p(
        `把数组 ${A} 围绕 ${b} 分成偏小和偏大部分后，可以直接说整组已排序吗？`,
        ['不能，还要整理各子区间', '可以，分区等于排序完成', '只能检查原数组长度'],
        '分区只建立两侧关系，不保证各侧内部有序。',
        '检查分组规则是否限制同一侧内部次序。',
      );
    case '9-5':
      return p(
        `二叉树根节点值 ${a}，左孩子为空、右孩子值0。哪个描述正确？`,
        ['只有一个孩子，右孩子值是0', '没有孩子，0等于空', '左孩子值就是0'],
        'null 表示没有对象，数值0仍可保存在对象里。',
        '区分字段里的引用和孩子的数据。',
      );
    case '9-1':
      return n(
        `根节点值 ${a}，左子树深度为1，右子树深度为2。按节点数计算整树最大深度是多少？`,
        3,
        '根自身贡献1，再加较深的一侧2。',
        '不是把左右两个深度相加。',
      );
    case '9-2':
      return n(
        `三节点树根为 ${a}、左孩子 ${b}、右孩子 ${c}。按根→左→右访问，顺序是什么？`,
        [a, b, c],
        '前序先处理根。',
        '访问完根，再到左边。',
      );
    case '9-6':
      return n(
        `开始处理某一层时队列只有两节点 ${a}、${b}。处理第一节点时加入3个下一层孩子。本层总共处理几个节点？`,
        2,
        '本层数量固定为这一轮开始时的队列长度。',
        '新加入的是下一层。',
      );
    case '9-3':
      return p(
        `无重复键的二叉搜索树根为 ${b}，目标 ${a} 更小，下一步查哪里？`,
        ['左子树', '右子树', '同时查两边'],
        '左侧键均小于根，右侧均大于根。',
        '利用本章的大小约束排除一侧。',
      );
    case '9-4':
      return n(
        `小顶堆优先队列加入 ${b}、${a}、${c}。第一次取出多少？`,
        a,
        '按数值优先级取当前最小，不按到达先后。',
        '比较三个数的大小。',
      );
    case '10-1':
      return n(
        `图有顶点 A、B、C，边 A→B 权重 ${a}、B→C 权重 ${b}。B 的直接出邻居有几个？`,
        1,
        '只有 B→C 从 B 出发。',
        '先看方向，权重不是邻居个数。',
      );
    case '10-5': {
      const k = seed % 3,
        g = [[1, 2, 3], [0], [0, 1], []];
      return n(
        `邻接表 graph=${arr(g)}。graph[${k}].length 是多少？`,
        g[k].length,
        '先定位外层顶点编号，再数它的邻居。',
        '两对方括号不要混为一件事。',
      );
    }
    case '10-2': {
      const seen = seed % 2 === 0;
      return pick(
        `图中 A 连 B 和 C，B、C 都能到 D。处理 C 时，D ${seen ? '已经被发现并入队' : '尚未被发现'}。现在怎样处理 D？`,
        ['跳过重复加入', '标记并加入队尾', '清空整条队列'],
        seen ? 0 : 1,
        seen ? '发现时已经标记，不能重复入队。' : '第一次发现时先标记，再加入队尾。',
        '查看“已发现”记录。',
      );
    }
    case '10-6': {
      const long = seed % 2 === 0;
      return p(
        `深搜沿 ${long ? 'A→B→C→D' : 'A→B→C'} 依次调用。最后一个点的未访问邻居用完，接下来回哪里？`,
        [long ? '回 C' : '回 B', '直接回起点 A', '清除所有访问标记'],
        '本层返回到发起调用的上一层。',
        '按调用的逆顺序返回。',
      );
    }
    case '10-3':
      return n(
        `网格 [[${a},0],[0,${a}]] 从左上开始染色，只允许上下左右且只访问同色格。总共有几个格子变色？`,
        1,
        '右下同色但只有对角相邻，不能到达。',
        '列出起点能走的合法方向。',
      );
    case '10-4':
      return n(
        `有向边 A→B 费用 ${c + 2}，A→C 费用 ${a}，C→B 费用 2。A 到 B 的最少费用是多少？`,
        a + 2,
        '先到 C 再去 B 更便宜。',
        '比较直达与绕一站的总费用。',
      );
    case '11-1':
      return n(
        `每种硬币有足够多，面额为 1、${a + 1}、${a + 2}。凑 ${2 * (a + 1)} 元，使用最少几枚？`,
        2,
        '两枚中等面额恰好凑足；没有一枚能单独达到目标。',
        '试一下不用最大硬币的方案。',
      );
    case '11-2':
      return n(
        `每次走1级或2级。到第 ${(a % 4) + 3} 级有几种顺序不同的走法？`,
        stairs((a % 4) + 3),
        '按最后一步分成两类，填表得到答案。',
        '先写第1级和第2级的答案。',
      );
    case '11-3':
      return p(
        `memo[${a}] 已存了子问题的合法结果。递归再次收到相同参数 ${a}，该怎样处理？`,
        ['读取并返回缓存结果', '清空缓存后重算', '把下标当答案'],
        '相同状态可以使用先前算出的结果。',
        '先判断缓存标记是否表示已计算。',
      );
    case '11-5':
      return n(
        `滚动变量 oldA=${a}、oldB=${b}，下一项等于两个旧值的和。先算 next，再更新两变量。next 是多少？`,
        a + b,
        '读取两项更新前的值，避免覆盖。',
        '不要先把 oldB 写进 oldA。',
      );
    case '11-6': {
      const k = 2 + (seed % 4);
      return p(
        `dp[i] 是每步走1或2级时恰好到第 i 级的走法数。哪项是 dp[${k}]？`,
        [stairs(k) + '种走法', k + '级的台阶高度', '最少步数'],
        '先确定 dp 记录的是走法数量，再从低级向高级填表。',
        '先用一句话复述 dp[i] 的含义。',
      );
    }
    case '11-4':
      return n(
        `0/1 背包容量 ${2 * a}，只有一件重 ${a}、价值 ${b} 的物品，最多拿一次。最大价值多少？`,
        b,
        '只有一个物品，不能因容量足够就拿两次。',
        '先看每件物品的使用次数限制。',
      );
    case '12-1':
      return p(
        `三天价格依次 ${arr([c, a, b])}（下标0、1、2），最多交易一次且买入早于卖出。哪组日期合法？`,
        ['下标1买入、下标2卖出', '下标2买入、下标1卖出', '在同一天先买再卖'],
        '本题要求买入日期严格早于卖出。',
        '下标从0开始，先买后卖。',
      );
    case '12-5':
      return n(
        `价格 ${arr([b, a, c])}，只能买卖一次、先买后卖，可不交易。枚举所有合法日期对，最大利润多少？`,
        c - a,
        '最低价在中间，最后一天卖出收益最大。',
        '列出 (0,1)、(0,2)、(1,2)。',
      );
    case '12-2':
      return n(
        `价格依次 ${arr([b, a, c])}，现在考虑在最后一天卖出，之前的历史最低价是多少？`,
        a,
        '只从卖出日前出现的价格中取最小值。',
        '别把未来的价格混进历史。',
      );
    case '12-3':
      return n(
        `价格 ${arr([c, b, a])} 一直下降，只能先买后卖一次，可以不交易。最大利润是多少？`,
        0,
        '交易都亏损，不交易为0。',
        '保留题目允许的“不交易”。',
      );
    case '12-4':
      return n(
        `给定价格 ${arr([a, b, a - 1, c])}。最多一次合法交易，允许不交易，返回最大利润。`,
        c - (a - 1),
        '第2号位置买，最后一个位置卖。',
        '逐日记住历史最低价和最好收益。',
      );
    case '12-6':
      return p(
        `要在编号乱序的 ${A} 中找一个目标值，只查一次。哪种起步方法可以直接使用？`,
        ['从左到右逐个比较', '不检查排序直接二分', '把值当作下标'],
        '顺序扫描不要求排序；普通二分需要有序。',
        '先核对每个方法的前提。',
      );
  }
  const mapped = {
    'java-variable': '2-2',
    'java-while': '3-3',
    'java-method': '2-4',
    'java-array': '4-5',
    'java-reference': '4-6',
  }[id];
  if (mapped) return reviewVariant(mapped, seed);
  switch (id) {
    case 'java-print':
      return p(
        `main 先打印“书架${a}”，再打印“书架${b}”。屏幕第一行显示什么？`,
        ['书架' + a, '书架' + b, 'Main'],
        '按书写顺序先打印第一行。',
        '从 main 的第一条语句开始。',
      );
    case 'java-condition':
      return n(
        `余额 ${b} 元，至少3元才扣3元，不足则不变。执行一次后余额是多少？`,
        a,
        '余额满足条件，只执行一次扣款。',
        '先核对条件是否成立。',
      );
    case 'java-for':
      return n(
        `for(int i=0;i<${a};i++) 每轮打印一次。共打印多少次？`,
        a,
        '依次访问 i=0 到 i=' + String(a - 1) + '。',
        '条件不包含右端点。',
      );
    case 'java-string': {
      const s = seed % 2 ? 'note' : 'code';
      return n(
        `String s="${s}"，读取 s.charAt(0) 会得到哪个字符？`,
        s[0],
        '首个字符编号是0。',
        '直接写字符，不加引号。',
      );
    }
    case 'java-object':
      return n(
        `a=new Card(${a})、b=new Card(${b}) 分别创建对象。将 b.value 改为 ${c}，此时 a.value 是多少？`,
        a,
        '两个 new 创建独立对象。',
        '先画两张卡片。',
      );
    case 'java-list':
      return n(
        `非空整数清单 list=${A}，删除编号1后，list.get(1) 读到多少？`,
        c,
        '删除中间项后，原第三项向前补到编号1。',
        '先写出删除后的清单。',
      );
    case 'java-grid':
      return n(
        `grid=[[${a},${b}],[${c},${c + 1}]]，grid[1][1] 是多少？`,
        c + 1,
        '先选第二行，再读这一行的第二项。',
        '两次定位的下标都从0开始。',
      );
    case 'java-call-stack':
      return n(
        `f(x) 交回 g(x)+1，g(x) 交回 x*2。f(${a}) 的结果是多少？`,
        2 * a + 1,
        '先等 g 返回两倍，再由 f 加1。',
        '先算内层，再回到原式。',
      );
    case 'java-two-loops':
      return n(
        `外层做两轮，每轮的内层都执行 ${a} 次。内层一共执行多少次？`,
        2 * a,
        '每个外层轮次都从头执行内层。',
        '把两轮的次数加起来。',
      );
    case 'java-last-step':
      return n(
        `每步走1或2级，已知到第3级有3种走法，到第2级有2种。到第4级、最后一步走 ${(seed % 2) + 1} 级的走法有几种？`,
        seed % 2 ? 2 : 3,
        '最后一步从目标级数减去步长的位置出发。',
        '把最后一步去掉，看看剩下的目标。',
      );
  }
  const j = JAVA_BY_ID[id];
  if (j) return j.variant;
  return null;
}
function stairs(n) {
  let x = 1,
    y = 1;
  for (let i = 2; i <= n; i++) [x, y] = [y, x + y];
  return y;
}

export const TRANSFERS = [
  {
    id: 'transfer-1',
    title: '值日用品的花费',
    after: '3-6',
    source: '1-4',
    prompt: '三笔记录为 [4,2,7]，预算为10元。你只关心是否超出预算，不需要保存每次的中间结果。',
    questions: [
      pick(
        '怎样处理数据最合适？',
        ['逐项累计，结束后比较预算', '先把金额排序再丢掉最小值', '只看最后一笔'],
        0,
        '只需维护一个总额，每笔都必须参与。',
        '问自己是否需要完整的排序结果。',
      ),
      output('总额比预算10元多多少？', 3, '4+2+7=13，超出3元。', '先算总额，再减预算。'),
    ],
  },
  {
    id: 'transfer-2',
    title: '取餐窗口的两个号码',
    after: '6-6',
    source: '6-4',
    prompt: '普通窗口按到达顺序服务。等候名单先登记7，再登记2。完成第一个订单后，号码5来到队尾。',
    questions: [
      pick(
        '哪种办法能保持服务顺序？',
        ['一端加入，另一端取出最早到的', '每次先取号码小的', '每次先取最近登记的'],
        0,
        '这是先进先出的排队规则。',
        '任务关心到达顺序。',
      ),
      output(
        '完成第一个订单、5已加入后，队首到队尾是什么？',
        [2, 5],
        '7先离开，2还在首位，新来的5到尾部。',
        '画出队首和队尾。',
      ),
    ],
  },
  {
    id: 'transfer-3',
    title: '文件夹最多套了几层',
    after: '9-3',
    source: '9-1',
    prompt:
      '根文件夹 A 内有 B、C；C 内有 D；B、D 都没有子文件夹。计算从 A 开始最深的一条路径的层数，A 算第1层。',
    questions: [
      pick(
        '怎样求任意一个文件夹下面的最大层数？',
        [
          '分别问每个子文件夹的最大层数，取最大值后加1',
          '把所有子文件夹的层数加起来',
          '按照文件夹名字排序',
        ],
        0,
        '最深的一条路只能选一个孩子继续，当前文件夹再贡献一层。',
        '选最长的一条路，不是把所有路径拼起来。',
      ),
      output('这个目录最深有几层？', 3, 'A→C→D 一共3层。', '从 A 开始，沿最长的路径数文件夹。'),
    ],
  },
  {
    id: 'transfer-4',
    title: '拼出四格长的书签',
    after: '12-6',
    source: '11-2',
    prompt:
      '可使用长度1格或3格的彩纸条，每种不限数量。只许首尾相接，刚好拼满4格；放置顺序不同算不同方案。',
    questions: [
      pick(
        '按最后一段分类，前面还剩多少格？',
        ['3格或1格', '3格或2格', '固定还剩2格'],
        0,
        '最后一段长1或3，所以剩余4-1或4-3。',
        '从4减去最后一段的长度。',
      ),
      output(
        '拼满4格有多少种不同顺序？',
        3,
        '[1,1,1,1]、[1,3]、[3,1]，共三种。',
        '分别列出不用3格纸条和用一张3格纸条的情况。',
      ),
    ],
  },
];
export const TRANSFER_BY_ID = Object.fromEntries(TRANSFERS.map((t) => [t.id, t]));
export function transferScenario(id, seed) {
  const original = TRANSFER_BY_ID[id];
  if (!original) return null;
  let prompt = original.prompt,
    questions = original.questions;
  if (seed % 2) {
    if (id === 'transfer-1') {
      prompt = '值日采购花了 [3,5,4] 元，预算9元，只需要判断超出多少。';
      questions = [
        original.questions[0],
        output('比预算多多少？', 3, '3+5+4=12，超出3元。', '先算合计。'),
      ];
    }
    if (id === 'transfer-2') {
      prompt = '按到达顺序取餐，号码8先来、3后来。先完成第一个订单，再让号码6加入。';
      questions = [
        original.questions[0],
        output('现在队首到队尾是什么？', [3, 6], '8先离开，6到队尾。', '先去掉最早来的号码。'),
      ];
    }
    if (id === 'transfer-3') {
      prompt =
        '根文件夹 A 内有 B、C；B 内有 D；D 内有 E；C 和 E 没有子文件夹。求从 A 开始的最大层数，A 算第1层。';
      questions = [
        original.questions[0],
        output('这个目录最深有几层？', 4, 'A→B→D→E 一共4层。', '从根往更深的子文件夹数。'),
      ];
    }
    if (id === 'transfer-4') {
      prompt = '彩纸条长度1格或3格，每种不限，拼满5格，顺序不同算不同方案。';
      questions = [
        pick(
          '按最后一段分类，前面还剩多少格？',
          ['4格或2格', '4格或3格', '固定2格'],
          0,
          '最后一段长1或3。',
          '用5减去最后一段。',
        ),
        output(
          '一共有多少种？',
          4,
          '五条1格纸有1种；一条3格和两条1格有3种。',
          '分别数没有3格纸和有一条3格纸。',
        ),
      ];
    }
  }
  return {
    ...original,
    prompt,
    questions: questions.map((q) => ({ ...q, question: prompt + ' ' + q.question })),
  };
}

export const WRITING_DRILLS = {
  '1-4': [
    order(
      '从0开始累计三笔账单，按正确顺序排列。',
      ['先把总额记为0', '读一笔就把金额加入总额，直到都读完', '交出最终总额'],
      '先准备状态，再更新，最后交出结果。',
      '不要在读完之前交出总额。',
    ),
  ],
  '2-4': [
    write(
      '给定整数 price、fee，方法需要交回总费用。补全这一行。',
      'return ____;',
      'price + fee',
      '把相加结果交给调用者。',
      '总费用包含两项。',
      ['fee + price'],
    ),
  ],
  '3-2': [
    write(
      '数组 a 已定义。循环每次处理一格，修正条件，确保 i 永远是合法下标。',
      'for (int i = 0; ____; i++)',
      'i < a.length',
      '最大合法下标是 length-1。',
      '等于 length 时已越界。',
      ['i <= a.length - 1', 'a.length > i'],
    ),
  ],
  '4-5': [
    write(
      'a 是整数数组，i+1 合法。读取当前格右边一格，补全赋值。',
      'int nextValue = ____;',
      'a[i + 1]',
      '先算下标，再访问该格。',
      '不要让 i 自增。',
      ['a[1 + i]'],
    ),
  ],
  '5-6': [
    order(
      '交换整数数组 a 的下标0和1。下列三条语句的正确顺序是什么？',
      ['int temp = a[0];', 'a[0] = a[1];', 'a[1] = temp;'],
      '覆盖第一格前先保存它。',
      '先找哪条会丢失一个旧值。',
    ),
  ],
  '5-1': [
    write(
      '在冒泡排序的一轮中，end 是未排序范围的最后下标。比较 a[i]、a[i+1] 前，i 应满足什么条件？',
      'for (int i = 0; ____; i++)',
      'i < end',
      '右侧邻居 i+1 可以等于 end，i 自己不能等于 end。',
      '代入 i=end 看看右侧会去哪。',
      ['i <= end - 1', 'end > i'],
    ),
  ],
  '6-2': [
    write(
      'p 指向已存在的节点，n 是新节点。第一句应先让 n 接住 p 的旧后继，补全右边。',
      'n.next = ____;',
      'p.next',
      '随后再写 p.next=n，旧后半段仍保留。',
      '先读取旧连接，暂不改 p。',
    ),
  ],
  '7-2': [
    write(
      'counts 是整数到次数的 Map。oldCount 是 x 的旧次数（第一次为0）。补全写回的新次数。',
      'counts.put(x, ____);',
      'oldCount + 1',
      '读旧次数、加1、再写回原键。',
      'x 是键，别把 x 加1。',
      ['1 + oldCount'],
    ),
  ],
  '8-3': [
    write(
      '非空列表 path 刚加入一个选择，现在要撤销。填删除的位置。',
      'path.remove(____);',
      'path.size() - 1',
      '撤销最后一项，保留更早选择。',
      '编号从0开始。',
    ),
  ],
  '9-1': [
    write(
      'left、right 已分别保存左右子树深度。当前节点非空。补全整棵子树深度。',
      'return ____;',
      '1 + Math.max(left, right)',
      '当前层加上较深的一侧。',
      '只选更深的一边。',
      ['Math.max(left, right) + 1', '1 + Math.max(right, left)', 'Math.max(right, left) + 1'],
    ),
  ],
  '10-5': [
    write(
      'graph[v] 是顶点 v 的所有邻居。取其中第一个邻居（保证不为空）。',
      'int first = ____;',
      'graph[v][0]',
      '先选顶点，再选邻居的位置。',
      '第一个位置下标是0。',
    ),
  ],
  '11-2': [
    write(
      'dp[i] 是每次爬1或2级时到第 i 级的走法数。i>=3，前两项已算好。补全这一项。',
      'dp[i] = ____;',
      'dp[i-1] + dp[i-2]',
      '两类最后一步互不重叠。',
      '分别从哪两级走到这里？',
      ['dp[i-2] + dp[i-1]'],
    ),
  ],
  '12-2': [
    write(
      'minPrice 是今天之前的最低价，todayPrice 是今天的价格。填“今天卖出”的利润。',
      'int profit = ____;',
      'todayPrice - minPrice',
      '利润等于卖价减买价。',
      '只能用今天之前的买入价。',
    ),
  ],
};

export const JAVA_TASKS = {
  ...EXTRA_JAVA_TASKS,
  '2-4': {
    title: '自己写一个相加方法',
    task: '完成 sum，交回两个整数的和。运行后会验证普通值、负数和0。',
    signature: 'static int sum(int a, int b)',
    starter: 'return 0;',
    solution: 'return a + b;',
    cases: [
      ['sum(2, 3)', 5],
      ['sum(-4, 2)', -2],
      ['sum(0, 0)', 0],
    ],
  },
  '3-2': {
    title: '自己写一个循环累计',
    task: '完成 total，把数组每一格加进总额。空数组应返回0。',
    signature: 'static int total(int[] a)',
    starter: 'int sum = 0;\nreturn sum;',
    solution:
      'int sum = 0;\nfor (int i = 0; i < a.length; i++) {\n    sum = sum + a[i];\n}\nreturn sum;',
    cases: [
      ['total(new int[]{2, 4, 1})', 7],
      ['total(new int[]{-3, 1})', -2],
      ['total(new int[]{})', 0],
    ],
  },
  '4-3': {
    title: '独立完成顺序查找',
    task: '从左到右返回 target 第一次出现的下标。找不到返回 -1。',
    signature: 'static int find(int[] a, int target)',
    starter: 'return -1;',
    solution: 'for (int i = 0; i < a.length; i++) {\n    if (a[i] == target) return i;\n}\nreturn -1;',
    cases: [
      ['find(new int[]{4, 1, 4}, 4)', 0],
      ['find(new int[]{3, 7, 2}, 7)', 1],
      ['find(new int[]{3, 7}, 0)', -1],
      ['find(new int[]{}, 2)', -1],
    ],
  },
  '6-2': {
    title: '动手写：在节点后插入新节点',
    task: 'p 一定指向一个节点，n 是独立的新节点。先接住 p 的旧后继，再让 p.next 指向 n。p 若已经是末尾，旧后继就是 null。',
    signature: 'static void insertAfter(Node p, Node n)',
    starter: '// 先保存旧的后半段，再更新 p 的连接',
    solution: 'n.next = p.next;\np.next = n;',
    support:
      '    static class Node {\n        int value;\n        Node next;\n        Node(int value, Node next) { this.value = value; this.next = next; }\n    }\n\n    static int checkInsert(int first, int inserted, Node tail) {\n        Node head = new Node(first, tail);\n        Node fresh = new Node(inserted, null);\n        insertAfter(head, fresh);\n        return head.next == fresh && fresh.next == tail ? 1 : 0;\n    }\n',
    cases: [
      ['checkInsert(1, 2, new Node(3, null))', 1],
      ['checkInsert(7, 4, null)', 1],
      ['checkInsert(2, 2, new Node(2, new Node(5, null)))', 1],
    ],
  },
  '12-4': {
    title: '独立完成一次交易的最佳收益',
    task: '先买后卖，最多一次交易。可以不交易，利润为0。prices 至少有一天。',
    signature: 'static int bestProfit(int[] prices)',
    starter: 'return 0;',
    solution:
      'int minPrice = prices[0];\nint best = 0;\nfor (int i = 1; i < prices.length; i++) {\n    best = Math.max(best, prices[i] - minPrice);\n    minPrice = Math.min(minPrice, prices[i]);\n}\nreturn best;',
    cases: [
      ['bestProfit(new int[]{4, 2, 8, 1})', 6],
      ['bestProfit(new int[]{6, 4, 2})', 0],
      ['bestProfit(new int[]{2})', 0],
      ['bestProfit(new int[]{2, 2, 3})', 1],
    ],
  },
};
export function taskProgram(task, body) {
  const checks = task.cases
    .map(([call, want], i) => `        verify(${i + 1}, ${call}, ${want});`)
    .join('\n');
  return `${task.imports ? task.imports + '\n\n' : ''}public class Main {
${task.support ? task.support + '\n' : ''}    ${task.signature} {
${body
  .split('\n')
  .map((l) => '        ' + l)
  .join('\n')}
    }

    public static void main(String[] args) {
${checks}
        System.out.println("All ${task.cases.length} cases passed.");
    }

    static void verify(int caseNo, int actual, int expected) {
        if (actual != expected) {
            throw new AssertionError("Case " + caseNo + ": expected " + expected + ", got " + actual);
        }
    }
}
`;
}
