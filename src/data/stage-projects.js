import { EXTRA_JAVA_TASKS } from './java-writing-tasks.js';
export const PROJECT_TASKS = {
  'transfer-1': {
    title: '把采购记录变成预算小工具',
    task: 'costs 保存每笔金额，budget 是预算。返回超支金额；没超支返回0。空记录也应得到0。',
    signature: 'static int overBudget(int[] costs, int budget)',
    starter: 'int total = 0;\nreturn 0;',
    solution:
      'int total = 0;\nfor (int cost : costs) total += cost;\nif (total > budget) return total - budget;\nreturn 0;',
    steps: ['总额从0开始', '逐笔累加 costs 中的金额', '比较预算，只交回正的超支金额'],
    cases: [
      ['overBudget(new int[]{4,2,7}, 10)', 3],
      ['overBudget(new int[]{3,5,4}, 9)', 3],
      ['overBudget(new int[]{2,3}, 8)', 0],
      ['overBudget(new int[]{}, 8)', 0],
    ],
  },
  'transfer-2': {
    title: '给取餐窗口写“下一位是谁”',
    task: 'waiting 按先来后到排列，可为空。先完成已有队首（若有），再把 newcomer 加入队尾，返回此时下一位的号码。号码不是优先级。',
    imports: 'import java.util.Deque;\nimport java.util.ArrayDeque;',
    signature: 'static int nextOrder(int[] waiting, int newcomer)',
    starter: 'Deque<Integer> queue = new ArrayDeque<>();\nreturn 0;',
    solution:
      'Deque<Integer> queue = new ArrayDeque<>();\nfor (int number : waiting) queue.addLast(number);\nif (!queue.isEmpty()) queue.removeFirst();\nqueue.addLast(newcomer);\nreturn queue.peekFirst();',
    steps: [
      '按到达顺序登记原有号码',
      '完成已有队首，再把新号码加到队尾',
      '只查看新队首，不按号码大小排序',
    ],
    cases: [
      ['nextOrder(new int[]{7,2}, 5)', 2],
      ['nextOrder(new int[]{8,3}, 6)', 3],
      ['nextOrder(new int[]{9}, 4)', 4],
      ['nextOrder(new int[]{}, 4)', 4],
    ],
  },
  'transfer-3': {
    ...EXTRA_JAVA_TASKS['9-1'],
    title: '给简化目录写最大层数工具',
    task: '这份简化目录每个文件夹最多有两个子文件夹，使用已学的 Node.left、Node.right 表示。空位置0层，文件夹自身1层。返回最大层数，不能把两条分支相加。',
    steps: ['空位置返回0层', '分别询问两个子目录的层数', '取较深分支，再加当前目录1层'],
  },
  'transfer-4': {
    title: '把书签方案写成状态表',
    task: '纸条长1格或3格，每种不限，顺序不同算不同方案。n 在0到8之间。ways(n) 返回刚好拼满 n 格的方案数。空书签有1种方案：什么都不放，因此 dp[0]=1。',
    signature: 'static int ways(int n)',
    starter: 'int[] dp = new int[n + 1];\ndp[0] = 1;\nreturn 0;',
    solution:
      'int[] dp = new int[n + 1];\ndp[0] = 1;\nfor (int i = 1; i <= n; i++) {\n    dp[i] = dp[i - 1];\n    if (i >= 3) dp[i] += dp[i - 3];\n}\nreturn dp[n];',
    steps: [
      '定义 dp[i]，并把空书签记为1种',
      '按最后纸条长1或3，把合法来源相加',
      '按长度从小到大填表，交回 dp[n]',
    ],
    cases: [
      ['ways(4)', 3],
      ['ways(5)', 4],
      ['ways(0)', 1],
      ['ways(2)', 1],
    ],
  },
};
export const PROJECT_BOUNDARIES = {
  'transfer-1': ['记录为空：总额0，不会超支。', '总额小于预算：超支金额不能是负数。'],
  'transfer-2': [
    '只有一个人在等：完成他以后，新来的人就是队首。',
    '没有人在等：不执行移除，直接接待新来的人。',
  ],
  'transfer-3': ['目录为空：0层。', '只有根目录：1层。深度不是节点总数。'],
  'transfer-4': ['0格：1种空方案。', '不足3格：不能使用3格纸条，也不能访问负下标。'],
};
