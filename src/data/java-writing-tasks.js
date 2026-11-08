export const EXTRA_JAVA_TASKS = {
  '5-1': {
    title: '自己写：把冒泡的一轮扩展到整个数组',
    task: '按非递减顺序原地排列 a。允许空数组、负数和重复值。先在纸上预测一轮，再写内外两层循环。',
    signature: 'static void bubble(int[] a)',
    starter: '// 外层缩短 end，内层比较相邻两格',
    solution:
      'for (int end = a.length - 1; end > 0; end--) {\n    for (int i = 0; i < end; i++) {\n        if (a[i] > a[i + 1]) {\n            int temp = a[i];\n            a[i] = a[i + 1];\n            a[i + 1] = temp;\n        }\n    }\n}',
    support:
      '    static int checkSort(int[] a, int[] expected) {\n        bubble(a);\n        if (a.length != expected.length) return 0;\n        for (int i = 0; i < a.length; i++) {\n            if (a[i] != expected[i]) return 0;\n        }\n        return 1;\n    }\n',
    cases: [
      ['checkSort(new int[]{3,1,2}, new int[]{1,2,3})', 1],
      ['checkSort(new int[]{2,-1,2}, new int[]{-1,2,2})', 1],
      ['checkSort(new int[]{7}, new int[]{7})', 1],
      ['checkSort(new int[]{}, new int[]{})', 1],
    ],
  },
  '7-2': {
    title: '自己写：用计数表回答出现次数',
    task: '创建整数到次数的 Map，把数组 a 逐项登记，返回 target 出现的次数。不存在时返回0。只统计次数，不返回下标。',
    signature: 'static int occurrences(int[] a, int target)',
    imports: 'import java.util.Map;\nimport java.util.HashMap;',
    starter: 'Map<Integer, Integer> counts = new HashMap<>();\nreturn 0;',
    solution:
      'Map<Integer, Integer> counts = new HashMap<>();\nfor (int x : a) {\n    counts.put(x, counts.getOrDefault(x, 0) + 1);\n}\nreturn counts.getOrDefault(target, 0);',
    cases: [
      ['occurrences(new int[]{2,3,2,2}, 2)', 3],
      ['occurrences(new int[]{1,2}, 7)', 0],
      ['occurrences(new int[]{}, 2)', 0],
      ['occurrences(new int[]{-1,-1,0}, -1)', 2],
    ],
  },
  '8-1': {
    title: '自己写：递归累计到停止条件',
    task: 'n 在0到100之间。sum(n) 返回1到n的和，sum(0) 返回0。必须先处理停止条件，再调用更小的问题。',
    signature: 'static int sum(int n)',
    starter: '// 先判断 n 是否已经到0\nreturn 0;',
    solution: 'if (n == 0) return 0;\nreturn n + sum(n - 1);',
    cases: [
      ['sum(0)', 0],
      ['sum(1)', 1],
      ['sum(4)', 10],
      ['sum(8)', 36],
    ],
  },
  '9-1': {
    title: '自己写：计算二叉树的最大深度',
    task: '空树深度是0；非空节点贡献1层，再加左右子树中较大的深度。Node 和左右孩子已在本章前面介绍。',
    signature: 'static int depth(Node root)',
    starter: '// 先处理空位置，再分别问左右孩子\nreturn 0;',
    solution:
      'if (root == null) return 0;\nint left = depth(root.left);\nint right = depth(root.right);\nreturn 1 + Math.max(left, right);',
    support:
      '    static class Node {\n        int value;\n        Node left;\n        Node right;\n        Node(int value, Node left, Node right) {\n            this.value = value; this.left = left; this.right = right;\n        }\n    }\n',
    cases: [
      ['depth(null)', 0],
      ['depth(new Node(4, null, null))', 1],
      ['depth(new Node(1, new Node(2, null, null), new Node(3, null, null)))', 2],
      ['depth(new Node(1, null, new Node(2, null, new Node(3, null, null))))', 3],
    ],
  },
  '10-2': {
    title: '自己写：用 BFS 数出能到达的地点',
    task: 'graph[v] 列出顶点 v 的邻居，下标均合法。非空图的 start 是合法顶点。统计从 start 可到达的不同顶点数，含起点；空图返回0。发现时就标记。',
    signature: 'static int reachable(int[][] graph, int start)',
    imports: 'import java.util.ArrayDeque;\nimport java.util.Deque;',
    starter:
      'if (graph.length == 0) return 0;\nboolean[] seen = new boolean[graph.length];\nDeque<Integer> queue = new ArrayDeque<>();\nreturn 0;',
    solution:
      'if (graph.length == 0) return 0;\nboolean[] seen = new boolean[graph.length];\nDeque<Integer> queue = new ArrayDeque<>();\nseen[start] = true;\nqueue.addLast(start);\nint count = 0;\nwhile (!queue.isEmpty()) {\n    int v = queue.removeFirst();\n    count++;\n    for (int next : graph[v]) {\n        if (!seen[next]) {\n            seen[next] = true;\n            queue.addLast(next);\n        }\n    }\n}\nreturn count;',
    cases: [
      ['reachable(new int[][]{{1,2},{2},{0}}, 0)', 3],
      ['reachable(new int[][]{{1},{},{3},{}}, 0)', 2],
      ['reachable(new int[][]{{}}, 0)', 1],
      ['reachable(new int[][]{}, 0)', 0],
    ],
  },
  '11-2': {
    title: '自己写：按状态表计算爬楼梯走法',
    task: 'n 在1到8之间，每步爬1级或2级，顺序不同算不同走法。ways(n) 返回走法数量。本任务保留整张表，暂不做滚动优化。',
    signature: 'static int ways(int n)',
    starter: 'if (n == 1) return 1;\nint[] dp = new int[n + 1];\nreturn 0;',
    solution:
      'if (n == 1) return 1;\nint[] dp = new int[n + 1];\ndp[1] = 1;\ndp[2] = 2;\nfor (int i = 3; i <= n; i++) {\n    dp[i] = dp[i - 1] + dp[i - 2];\n}\nreturn dp[n];',
    cases: [
      ['ways(1)', 1],
      ['ways(2)', 2],
      ['ways(4)', 5],
      ['ways(5)', 8],
    ],
  },
};
export const TASK_STEPS = {
  '2-4': ['读取两个参数', '计算两数的和', '用 return 交回结果'],
  '3-2': ['总额从0开始', '循环读取每格并加入总额', '循环结束后交回总额'],
  '4-3': ['从第0格开始比较', '相等时交回当前下标', '都不相等时交回 -1'],
  '5-1': ['把 end 放在最后一格', '在本轮比较相邻项，必要时交换', '本轮结束后缩短 end，继续下一轮'],
  '6-2': ['读出 p 的旧后继', '让 n.next 接住旧后继', '再让 p.next 指向 n'],
  '7-2': ['建立空计数表', '读取旧次数，加1后写回', '查 target 的次数，不存在返回0'],
  '8-1': ['先检查 n 是否到0', '求更小的 sum(n-1)', '把当前 n 加上子问题答案后返回'],
  '9-1': ['空位置返回0', '分别计算左右孩子的深度', '取较大深度再加当前1层'],
  '10-2': ['标记起点并入队', '取队首，并发现尚未标记的邻居', '发现时标记并排到队尾，直到队列为空'],
  '11-2': ['定义 dp[i] 并准备前两项', '按 i 从小到大读取已算出的两项', '写入当前项，最后交回 dp[n]'],
  '12-4': ['用首日准备最低价与0利润', '逐天先计算卖出利润，再更新最低价', '扫描结束交回最佳利润'],
};
const repair = (question, template, answer, explanation, accepted = []) => ({
  kind: 'code',
  question,
  template,
  answer,
  explanation,
  accepted,
});
export const TASK_REPAIRS = {
  '2-4': repair(
    'sum(a,b) 要返回两数和。原来误写 return a-b，请修正右侧。',
    'return ____;',
    'a + b',
    '两数相加，不能相减。',
    ['b+a'],
  ),
  '3-2': repair(
    '数组 a 已定义。原循环条件 i<=a.length 会多走一格，修正为合法的单格访问范围。',
    'for (int i=0; ____; i++)',
    'i < a.length',
    '最大合法下标是 length-1。',
    ['i<=a.length-1', 'a.length>i'],
  ),
  '4-3': repair(
    '查找程序已确认 a[i]==target，要返回第一次出现的位置，原来误写 return a[i]。请修正。',
    'return ____;',
    'i',
    'i 是位置，a[i] 是这个位置上的值。',
  ),
  '5-1': repair(
    '冒泡的一轮会读 a[i+1]，end 是本轮最后合法位置。原来误写 i<=end，请修正条件。',
    'for (int i=0; ____; i++)',
    'i < end',
    '保证右侧的 i+1 不超过 end。',
    ['i<=end-1', 'end>i'],
  ),
  '6-2': repair(
    'p 的旧后继还没保存，n 是新节点。原来第一句误写 p.next=n。应先补哪条语句？',
    '____;',
    'n.next = p.next',
    '先让新节点接住旧后继，再改 p.next。',
  ),
  '7-2': repair(
    'oldCount 是 x 的旧次数。原来把新次数写成 x+1，请改为更新次数。',
    'counts.put(x, ____);',
    'oldCount + 1',
    'x 是被统计的键，不是旧次数。',
    ['1+oldCount'],
  ),
  '8-1': repair(
    'sum(n) 的合法输入包含0，基础情况应在 n 为0时返回0。原来误写 n==1，请修正。',
    'if (____) return 0;',
    'n == 0',
    '必须让 sum(0) 停住。',
    ['n<=0', '0==n'],
  ),
  '9-1': repair(
    'left、right 是两棵子树的深度。原来误写1+left+right，请修正最大深度的表达式。',
    'return ____;',
    '1 + Math.max(left, right)',
    '深度选择较长的一条路，不把两条路接起来。',
    ['Math.max(left,right)+1', '1+Math.max(right,left)', 'Math.max(right,left)+1'],
  ),
  '10-2': repair(
    'seen[next] 目前为false，发现邻居 next 后马上准备入队。先补上标记，避免别的边重复发现它。',
    '____;',
    'seen[next] = true',
    '发现就标记，再入队。',
  ),
  '11-2': repair(
    'dp[1]、dp[2] 已准备好，n>=3。原来 i<n 漏算 dp[n]，请修正循环条件。',
    'for (int i=3; ____; i++)',
    'i <= n',
    '最后必须计算到题目要求的第 n 级。',
    ['i<n+1', 'n>=i'],
  ),
  '12-4': repair(
    'minPrice 是今天之前的最低价，todayPrice 是今天价格。原来利润误写 minPrice-todayPrice，请修正。',
    'int profit = ____;',
    'todayPrice - minPrice',
    '卖价减买价。',
  ),
};
