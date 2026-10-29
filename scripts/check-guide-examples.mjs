import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {codes} from '../src/data/course.js';
import {CODE_GUIDES} from '../src/data/code-guides.js';
const tree='class TreeNode { int val; TreeNode left, right; TreeNode(int v){val=v;} }';
const sampleTree='TreeNode r=new TreeNode(3); r.left=new TreeNode(9); r.right=new TreeNode(20); r.right.left=new TreeNode(15); r.right.right=new TreeNode(7);';
const examples={
 index:['System.out.print(new Solution().nextValue(new int[]{1,2,3},0));','2'],
 copy:['int[] a={1,2,3}; int[] b=new Solution().copy(a); b[0]=9; System.out.print(Arrays.toString(a)+","+Arrays.toString(b));','[1, 2, 3],[9, 2, 3]'],
 swap:['int[] a={3,1,2}; new Solution().swapFirst(a); System.out.print(Arrays.toString(a));','[1, 3, 2]'],
 condition:['System.out.print(new Solution().next(7)+","+new Solution().next(14));','6,7'],
 forSum:['System.out.print(new Solution().total(new int[]{1,2,3}));','6'],
 set:['System.out.print(new Solution().distinct(new int[]{2,2,3}));','2'],
 dfs:['System.out.print(new Solution().count(new int[][]{{1,2},{0},{0},{}},0));','3'],
 dpTable:['System.out.print(new Solution().climbStairs(4));','5'],
 bruteStock:['System.out.print(new Solution().maxProfit(new int[]{3,1,4}));','3'],
 height:['System.out.print(new Solution().heightChecker(new int[]{1,1,4,2,1,3}));','3'],
 running:['System.out.print(Arrays.toString(new Solution().runningSum(new int[]{1,2,3,4})));','[1, 3, 6, 10]'],
 add:['System.out.print(new Solution().sum(12,5));','17'],
 entry:['Main.main(new String[]{});','5'],
 operators:['System.out.print(new Solution().same(3,3)+","+new Solution().same(3,5));','true,false'],
 reduce:['System.out.print(new Solution().numberOfSteps(14));','6'],
 linear:['System.out.print(new Solution().find(new int[]{4,1,7},7));','2'],
 binary:['System.out.print(new Solution().search(new int[]{-1,0,3,5,9,12},9));','4'],
 array:['System.out.print(new Solution().total(new int[]{3,5,2}));','10'],
 string:['System.out.print(new Solution().countA("banana"));','3'],
 bubble:['System.out.print(Arrays.toString(new Solution().bubble(new int[]{3,1,2})));','[1, 2, 3]'],
 insert:['System.out.print(Arrays.toString(new Solution().insertion(new int[]{3,1,2})));','[1, 2, 3]'],
 merge:['System.out.print(Arrays.toString(new Solution().sortArray(new int[]{5,2,3,1})));','[1, 2, 3, 5]'],
 quick:['int[] a={3,1,2}; new Solution().quick(a,0,2); System.out.print(Arrays.toString(a));','[1, 2, 3]'],
 linked:['Node p=new Node(1); p.next=new Node(3); new Solution().insertAfter(p,2); System.out.print(p.value+","+p.next.value+","+p.next.next.value);','1,2,3'],
 stack:['System.out.print(new Solution().isValid("([])")+","+new Solution().isValid("([)]"));','true,false'],
 queue:['System.out.print(new Solution().first());','7'],
 hash:['System.out.print(Arrays.toString(new Solution().twoSum(new int[]{2,7,11,15},9)));','[0, 1]'],
 freq:['Map<Integer,Integer> m=new Solution().count(new int[]{2,3,2}); System.out.print(m.get(2)+","+m.get(3));','2,1'],
 recur:['System.out.print(new Solution().sum(4));','10'],
 subsets:['System.out.print(new Solution().subsets(new int[]{1,2}));','[[], [1], [1, 2], [2]]'],
 tree:[sampleTree+' System.out.print(new Solution().maxDepth(r));','3'],
 bst:['TreeNode r=new TreeNode(2); r.left=new TreeNode(1); r.right=new TreeNode(3); System.out.print(new Solution().contains(r,3));','true'],
 heap:['System.out.print(new Solution().smallest(new int[]{5,2,7}));','2'],
 bfs:['System.out.print(new Solution().count(new int[][]{{1,2},{0,2},{0,1},{}},0));','3'],
 flood:['System.out.print(Arrays.deepToString(new Solution().floodFill(new int[][]{{1,1,0},{1,0,0}},0,0,2)));','[[2, 2, 0], [2, 0, 0]]'],
 stairs:['System.out.print(new Solution().climbStairs(4));','5'],
 memo:['System.out.print(new Solution().climb(5));','8'],
 greedy:['System.out.print(new Solution().coins(28));','6'],
 stock:['System.out.print(new Solution().maxProfit(new int[]{7,1,5,3,6,4}));','5'],
 palindrome:['System.out.print(new Solution().palindrome("level")+","+new Solution().palindrome("hello"));','true,false'],
 traversal:['TreeNode r=new TreeNode(2); r.left=new TreeNode(1); r.right=new TreeNode(3); System.out.print(new Solution().preorder(r));','[2, 1, 3]'],
 dijkstra:['int[][][] graph={{{1,2},{2,5}},{{2,1}}, {}}; System.out.print(Arrays.toString(new Solution().distances(graph,0)));','[0, 2, 3]'],
 knapsack:['System.out.print(new Solution().best(new int[]{1,3,4},new int[]{15,20,30},4));','35'],
 treeBfs:[sampleTree+' System.out.print(new Solution().maxDepth(r));','3']
};
assert.deepEqual(Object.keys(examples).sort(),Object.keys(CODE_GUIDES).sort());
const fallback='/usr/lib/jvm/java-17-openjdk-amd64/bin/java';
const java=process.env.ALGO_JAVA||(fs.existsSync(fallback)?fallback:'java');
const probe=spawnSync(java,['--list-modules'],{encoding:'utf8'});
if(!probe.stdout?.includes('jdk.compiler')){console.log('JDK compiler unavailable: guide example execution skipped.');process.exit(0);}
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'algo-guide-check-'));
try{
 for(const [key,[call,expected]] of Object.entries(examples)){
  const dir=path.join(tmp,key);fs.mkdirSync(dir);
  let body=codes[key].lines.filter(s=>!s.startsWith('import ')).join('\n').replace('public class Main','class Main');
  fs.writeFileSync(path.join(dir,'TestGuide.java'),`import java.util.*;\n${tree}\n${body}\npublic class TestGuide { public static void main(String[] args) { ${call} } }\n`);
  const compile=spawnSync(java,['com.sun.tools.javac.Main','TestGuide.java'],{cwd:dir,encoding:'utf8',timeout:20000});
  assert.equal(compile.status,0,`${key}: ${compile.stderr}`);
  const run=spawnSync(java,['-cp',dir,'TestGuide'],{encoding:'utf8',timeout:5000});
  assert.equal(run.status,0,`${key}: ${run.stderr}`);
  assert.equal(run.stdout.trim(),expected,`${key}: result differs from guide example`);
 }
 console.log(`All ${Object.keys(examples).length} Java guide examples compiled and matched their stated results.`);
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
