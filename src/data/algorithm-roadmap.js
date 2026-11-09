import { lessonRoute } from './course-index.js';

export const ROADMAP_SOURCE = {
  name: '英雄编程 · 数据结构和算法学习路线',
  url: 'https://ufbva3m5zn.feishu.cn/docx/BYlOdtTPSoIdRqxFIeec5vBznug',
};
export const ROADMAP_STAGES = [
  {
    id: 'structures',
    title: '基础数据结构',
    description: '先认识数据怎样放、怎样取。学到需要它的算法时，可以回来补对应结构。',
  },
  {
    id: 'algorithms',
    title: '基础算法与常用技巧',
    description: '先枚举和模拟，再用排序、前缀和、窗口减少重复工作；图算法要先会存图。',
  },
  {
    id: 'advanced-structures',
    title: '进阶数据结构',
    description: '围绕具体需求学新结构。并查集、单调结构、区间查询分别解决不同问题。',
  },
  {
    id: 'advanced-algorithms',
    title: '进阶算法',
    description: '先用小数据手算状态，再讨论优化。这里是基础课之后的选学，不是入门门槛。',
  },
];
const groups = [
  [
    ['sequence-list', '顺序表：按位置访问与移动', '4-1'],
    ['singly-linked', '单向链表：沿引用找下一站', '6-1'],
    ['stack', '栈：后放的先取', '6-3'],
    ['queue', '队列：先来的先处理', '6-4'],
    ['string', '字符串：一段有顺序的文字', '4-2'],
    ['tree', '树：用层级表达关系', '9-5'],
    ['binary-tree', '二叉树与三种遍历', '9-2'],
    ['bst', '二叉搜索树的整体约束', '9-3'],
    ['hash-table', '哈希表：键、值与碰撞', '7-1'],
    ['adjacency-list', '邻接表：逐点列出邻居', '10-5'],
    ['adjacency-matrix', '邻接矩阵：把连接画成表格'],
  ],
  [
    ['enumeration', '枚举：先把合法候选列完整'],
    ['simulation', '模拟与递推：规则怎样变成下一步'],
    ['selection-sort', '选择排序：每轮只选一个最小值'],
    ['bubble-sort', '冒泡排序：相邻比较的一整轮', '5-1'],
    ['insertion-sort', '插入排序：给手中的牌找位置', '5-2'],
    ['counting-sort', '计数排序：小值域换一种排法'],
    ['merge-sort', '归并排序：分别排好再合并', '8-2'],
    ['quick-sort', '快速排序：先分区，再处理两边', '8-6'],
    ['bucket-sort', '桶排序：先分组，组内还要排序'],
    ['radix-sort', '基数排序：保留前一位的排队结果'],
    ['heap-sort', '堆排序：把当前最大值放到末尾'],
    ['hash-algorithm', '哈希：快速定位仍然要核对键', '7-4'],
    ['greedy', '贪心：先用反例检查直觉', '11-1'],
    ['prefix-sum', '前缀和：用两笔累计值算一段总额'],
    ['two-pointers', '双指针：每次移动都要有理由', '4-2'],
    ['sliding-window', '滑动窗口：移出一项，再移入一项'],
    ['binary-search', '二分：有序、边界与不漏答案', '4-4'],
    ['dijkstra', 'Dijkstra：非负权最短路', '10-4'],
    ['prim', 'Prim：把所有地点低成本连起来'],
    ['dfs', 'DFS：深入、返回与访问标记', '10-6'],
    ['bfs', 'BFS：按距离一层层展开', '10-2'],
    ['bellman-ford', 'Bellman–Ford：允许负权的最短路'],
    ['floyd-warshall', 'Floyd–Warshall：逐个允许中转站'],
    ['dijkstra-heap', '堆优化 Dijkstra：跳过旧候选', '10-4'],
    ['spfa', 'SPFA：只通知可能受影响的邻居'],
    ['topological-sort', '拓扑排序：先完成前置任务'],
    ['dynamic-programming', '动态规划：先说清每个状态', '11-2'],
  ],
  [
    ['big-integer', '大整数：超出 long 后怎样表示'],
    ['doubly-linked', '双向链表：向前找和向后找'],
    ['forward-star', '链式前向星：用数组记录边链'],
    ['binary-heap', '二叉堆与优先队列', '9-4'],
    ['monotonic-stack', '单调栈：等待下一个更大的数'],
    ['monotonic-queue', '单调队列：窗口最值与过期下标'],
    ['disjoint-set', '并查集：两个人是不是同一组'],
    ['coordinate-compression', '离散化：保留大小顺序，换成紧凑编号'],
    ['fenwick-tree', '树状数组：让累计表支持更新'],
    ['trie', '字典树：让相同前缀共用一条路'],
    ['segment-tree', '线段树：按区间分工保存答案'],
    ['balanced-bst', '平衡搜索树：避免一路长成链'],
  ],
  [
    ['linear-dp', '线性 DP：连续子数组的最好总和'],
    ['memoization', '记忆化：同一个小问题只算一次', '11-3'],
    ['zero-one-knapsack', '0/1 背包：每件物品至多一次', '11-4'],
    ['complete-knapsack', '完全背包：允许同一种物品再用一次'],
    ['bounded-knapsack', '多重背包：每种物品有数量上限'],
    ['group-knapsack', '分组背包：每组至多选一个'],
    ['dependency-knapsack', '依赖背包：选附件之前先选主件'],
    ['tree-dp', '树形 DP：合并孩子交回的小答案'],
    ['digit-dp', '数位 DP：逐位检查，不枚举每个整数'],
    ['bitmask-dp', '状态压缩：用二进制记录一个小集合'],
    ['interval-dp', '区间 DP：先解决短段，再拼成长段'],
    ['string-hashing', '字符串哈希：快速筛选后仍要认识碰撞'],
    ['manacher', 'Manacher：把已经知道的回文借过来'],
    ['lca', '最近公共祖先：先到同一层，再一起向上'],
    ['bipartite-matching', '二分图匹配：让已经分配的人换个位置'],
    ['strongly-connected', '强连通分量：哪些地点能够互相到达'],
  ],
];
export const ROADMAP_ITEMS = groups.flatMap((items, stage) =>
  items.map(([id, title, lesson], i) => ({
    id,
    title,
    lesson,
    stage: ROADMAP_STAGES[stage].id,
    sourceSection: `2.${stage + 1}.${i + 1}`,
  })),
);
export const ALGORITHM_TOPICS = [
  ...ROADMAP_ITEMS.filter((t) => !t.lesson),
  {
    id: 'bit-operations',
    title: '二进制与位运算：先把格子里的 0 和 1 看懂',
    stage: 'advanced-structures',
    sourceSection: null,
  },
];
export const ALGORITHM_TOPIC_BY_ID = Object.fromEntries(ALGORITHM_TOPICS.map((t) => [t.id, t]));
export const algorithmTopicRoute = (id) => '/topics/' + id;
export const roadmapItemRoute = (item) =>
  item.lesson ? lessonRoute(item.lesson) : algorithmTopicRoute(item.id);
