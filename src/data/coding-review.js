// Change the requested operation, not merely the example constants.
const changes = {
  'code-increase': [
    '把计数减少二',
    'count在−100到100之间，返回count减2后的值。',
    'return count - 2;',
    [
      ['increase(4)', 2],
      ['increase(0)', -2],
      ['increase(-3)', -5],
    ],
  ],
  'code-even': [
    '判断是否能被三整除',
    'n在−100到100之间。能被3整除返回true，0也能被3整除。',
    'return n % 3 == 0;',
    [
      ['even(6)', true],
      ['even(4)', false],
      ['even(0)', true],
      ['even(-3)', true],
    ],
  ],
  'code-maximum-two': [
    '改为选择较小的整数',
    'a、b在−100到100之间。返回较小者，相等时返回这个相同值。',
    'return Math.min(a,b);',
    [
      ['larger(3,7)', 3],
      ['larger(-8,-2)', -8],
      ['larger(4,4)', 4],
    ],
  ],
  'code-sum-to': [
    '只累计1到n的奇数',
    'n在0到100之间，只把1到n（包括n）的奇数相加。',
    'int sum=0;\nfor(int i=1;i<=n;i++)if(i%2!=0)sum+=i;\nreturn sum;',
    [
      ['sumTo(4)', 4],
      ['sumTo(0)', 0],
      ['sumTo(5)', 9],
    ],
  ],
  'code-count-even': [
    '改为数出奇数',
    '数组a非null，元素在−100到100之间。返回奇数个数；负奇数也要计入。',
    'int count=0;\nfor(int x:a)if(x%2!=0)count++;\nreturn count;',
    [
      ['countEven(new int[]{1,2,3})', 2],
      ['countEven(new int[]{-3,-2,0})', 1],
      ['countEven(new int[]{})', 0],
    ],
  ],
  'code-array-max': [
    '改为找数组最小值',
    'a非null且非空，元素−100到100。返回最小值。',
    'int best=a[0];\nfor(int x:a)best=Math.min(best,x);\nreturn best;',
    [
      ['maximum(new int[]{2,9,3})', 2],
      ['maximum(new int[]{-7,-2,-8})', -8],
      ['maximum(new int[]{5})', 5],
    ],
  ],
  'code-count-character': [
    '改为统计字母e',
    's非null，由英文字符组成。只统计小写e，大写E不计入。',
    "int count=0;\nfor(int i=0;i<s.length();i++)if(s.charAt(i)=='e')count++;\nreturn count;",
    [
      ['countA("level")', 2],
      ['countA("Ee")', 1],
      ['countA("")', 0],
    ],
  ],
  'code-chain-length': [
    '沿链表累计数值',
    'Node类已提供，链表无环，长度0到30。返回全部value的总和，空链表返回0。',
    'int sum=0;\nfor(Node p=head;p!=null;p=p.next)sum+=p.value;\nreturn sum;',
    [
      ['length(new Node(7,new Node(9,null)))', 16],
      ['length(null)', 0],
      ['length(new Node(-3,new Node(2,null)))', -1],
    ],
  ],
  'code-bracket-pairs': [
    '判断括号是否出现至少两层嵌套',
    's改为只包含合法且匹配的括号串。返回最多同时未闭合的左括号数量；空串深度0。方法仍返回boolean：深度至少2时true，否则false。',
    "int open=0,best=0;\nfor(int i=0;i<s.length();i++){if(s.charAt(i)=='(')open++;else open--;best=Math.max(best,open);}\nreturn best>=2;",
    [
      ['balanced("(())")', true],
      ['balanced("()()")', false],
      ['balanced("")', false],
    ],
  ],
  'code-core-2-4': [
    '改成计算差值',
    '完成sum(a,b)，本次返回a减b。a、b在−100到100之间。方法名保留以复用框架，请特别留意任务要求。',
    'return a-b;',
    [
      ['sum(7,2)', 5],
      ['sum(0,3)', -3],
      ['sum(-2,-2)', 0],
    ],
  ],
  'code-core-3-2': [
    '改为累计每项的平方',
    'a非null，长度0到100，元素−100到100。返回各项平方的总和；空数组返回0。',
    'int sum=0;\nfor(int x:a)sum+=x*x;\nreturn sum;',
    [
      ['total(new int[]{2,3})', 13],
      ['total(new int[]{-2,1})', 5],
      ['total(new int[]{})', 0],
    ],
  ],
  'code-core-4-3': [
    '找到最后一次出现的位置',
    'a非null，返回target最后一次出现的下标；找不到返回−1。',
    'for(int i=a.length-1;i>=0;i--)if(a[i]==target)return i;\nreturn -1;',
    [
      ['find(new int[]{4,1,4},4)', 2],
      ['find(new int[]{1,2},9)', -1],
      ['find(new int[]{},1)', -1],
    ],
  ],
  'code-word-frequency': [
    '改为统计其他单词',
    'words与target非null，每个单词非null。返回内容不等于target的单词个数。',
    'int count=0;\nfor(String word:words)if(!word.equals(target))count++;\nreturn count;',
    [
      ['frequency(new String[]{"java","sql","java"},"java")', 1],
      ['frequency(new String[]{},"java")', 0],
      ['frequency(new String[]{"sql","git"},"java")', 2],
    ],
  ],
  'code-sorted-check': [
    '检查非递增顺序',
    'a非null，元素−100到100。相邻前项不小于后项时返回true；空数组也返回true。',
    'for(int i=1;i<a.length;i++)if(a[i-1]<a[i])return false;\nreturn true;',
    [
      ['sorted(new int[]{3,2,2})', true],
      ['sorted(new int[]{1,2})', false],
      ['sorted(new int[]{})', true],
    ],
  ],
  'code-recursive-count': [
    '递归累计链表值',
    'Node类已提供，链表无环、长度0到30，value在−100到100之间。递归返回所有value之和。',
    'if(head==null)return 0;\nreturn head.value+count(head.next);',
    [
      ['count(null)', 0],
      ['count(new Node(4,null))', 4],
      ['count(new Node(-1,new Node(2,null)))', 1],
    ],
  ],
  'code-tree-size': [
    '改为数出叶子节点',
    '二叉树Node已提供，最多30个节点。左右孩子都为空的节点叫叶子。返回叶子个数，空树返回0。',
    'if(root==null)return 0;\nif(root.left==null&&root.right==null)return 1;\nreturn size(root.left)+size(root.right);',
    [
      ['size(null)', 0],
      ['size(new Node(3,null,null))', 1],
      ['size(new Node(1,new Node(2,null,null),new Node(3,null,null)))', 2],
    ],
  ],
};
export const REVIEW_VARIANT_IDS = Object.keys(changes);
export function codingReviewTask(task) {
  const change = changes[task.id];
  return change
    ? {
        ...task,
        title: '复习变式：' + change[0],
        task: change[1],
        solution: change[2],
        cases: change[3],
        hints: [
          '先比较本次要求与原任务哪里不同。',
          '重新确定状态含义、更新规则和返回值；不要照搬旧答案。',
        ],
      }
    : task;
}
