const tree =
  'class TreeNode { int val; TreeNode left,right; TreeNode(int v){val=v;} TreeNode(int v,TreeNode l,TreeNode r){val=v;left=l;right=r;} }';
function rootExpr(arr) {
  if (!arr.length || arr[0] === null) return 'null';
  let root = { v: arr[0] },
    q = [root],
    i = 1;
  for (let h = 0; h < q.length && i < arr.length; h++)
    for (const side of ['l', 'r']) {
      if (i < arr.length) {
        let v = arr[i++];
        if (v !== null) {
          q[h][side] = { v };
          q.push(q[h][side]);
        }
      }
    }
  const rec = (n) => (n ? `new TreeNode(${n.v},${rec(n.l)},${rec(n.r)})` : 'null');
  return rec(root);
}
export { tree };
const a1 = (a) => 'new int[]{' + a.join(',') + '}',
  a2 = (a) => 'new int[][]{' + a.map((r) => '{' + r.join(',') + '}').join(',') + '}';
function call(b, t) {
  const p = t.input;
  switch (b.lc) {
    case 1480:
      return `Arrays.toString(s.runningSum(${a1(p.nums)}))`;
    case 2235:
      return `s.sum(${p.num1},${p.num2})`;
    case 1342:
      return `s.numberOfSteps(${p.num})`;
    case 704:
      return `s.search(${a1(p.nums)},${p.target})`;
    case 1051:
      return `s.heightChecker(${a1(p.heights)})`;
    case 912:
      return `Arrays.toString(s.sortArray(${a1(p.nums)}))`;
    case 20:
      return `s.isValid(${JSON.stringify(p.s)})`;
    case 1:
      return `Arrays.toString(s.twoSum(${a1(p.nums)},${p.target}))`;
    case 78:
      return `s.subsets(${a1(p.nums)})`;
    case 104:
      return `s.maxDepth(${rootExpr(p.root)})`;
    case 733:
      return `Arrays.deepToString(s.floodFill(${a2(p.image)},${p.sr},${p.sc},${p.color}))`;
    case 70:
      return `s.climbStairs(${p.n})`;
    case 121:
      return `s.maxProfit(${a1(p.prices)}))`.slice(0, -1);
  }
}
export function caseProgram(boss, code) {
  const body = code.lines.filter((line) => !line.startsWith('import ')).join('\n');
  return (
    'import java.util.*;\n' +
    (body.includes('TreeNode') ? tree + '\n' : '') +
    body +
    '\npublic class Main { public static void main(String[] args) { Solution s=new Solution();\n' +
    boss.cases.map((t) => 'System.out.println(' + call(boss, t) + ');').join('\n') +
    '\n} }\n'
  );
}
