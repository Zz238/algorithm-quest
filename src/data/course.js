import {chapters as original,codes as originalCodes} from './base-course.js';
import {EXTRA_CODES} from './extra-codes.js';
import {START_UNITS} from './units/start.js';
import {SEQUENCE_UNITS} from './units/sequence.js';
import {RELATION_UNITS} from './units/relationships.js';
import {STRATEGY_UNITS} from './units/strategy.js';
export const units={...START_UNITS,...SEQUENCE_UNITS,...RELATION_UNITS,...STRATEGY_UNITS};
export const codes={...originalCodes,...EXTRA_CODES};
const order={1:[1,2,5,3,4,6],2:[1,2,3,4,5,6],3:[1,2,3,5,4,6],4:[1,5,6,2,3,4],5:[5,6,1,2,3,4],6:[5,1,2,3,4,6],7:[1,2,5,3,4,6],8:[1,5,2,3,4,6],9:[5,1,2,6,3,4],10:[1,5,2,6,3,4],11:[1,2,3,5,6,4],12:[1,5,2,3,4,6]};
const overrides={'2-5':'index','3-1':'condition','3-2':'forSum','3-5':'index','4-1':'index','4-5':'index','4-6':'copy','5-6':'swap'};
const cost={index:'读取已知的合法位置只需要固定工作量：时间O(1)，额外空间O(1)。',copy:'每格复制一次：时间O(n)；创建n格独立副本，额外空间O(n)。',swap:'固定三次赋值：时间O(1)，只用一个临时整数，额外空间O(1)。',condition:'只执行一次条件分支，时间和额外空间都是O(1)。',forSum:'每个元素处理一次：时间O(n)；只保留sum、i，额外空间O(1)。',set:'合理散列条件下期望时间O(n)，最坏保存n个不同值，额外空间O(n)。',dfs:'邻接表下每个可达顶点和出边处理常数次，时间O(V+E)；seen与递归栈额外O(V)。',dpTable:'从第3级填到第n级，时间O(n)；保留整张表，额外空间O(n)。',bruteStock:'检查约n(n-1)/2个日期对，时间O(n²)；只记几个整数，额外空间O(1)。',height:'复制O(n)，基础冒泡O(n²)，比较O(n)；总时间O(n²)，副本额外O(n)。',bubble:'这份基础冒泡没有提前停止标记，固定比较约n(n-1)/2次，时间O(n²)，额外空间O(1)。',insert:'最坏每次向左移动许多元素，O(n²)；已排序时约O(n)，额外空间O(1)。',merge:'每层合并O(n)，约log n层，时间O(n log n)；辅助数组O(n)，递归栈O(log n)。',quick:'通常平均O(n log n)，最坏不平衡划分O(n²)；递归空间随实际深度而变。',array:'每格累加一次，时间O(n)，只保留总额，额外空间O(1)。',treeBfs:'每个结点进出队一次，时间O(n)；队列最多保存一层及下一层的部分结点，最坏O(n)。'};
const review={1:['1-2','1-4','1-6'],2:['2-2','2-4','2-6'],3:['3-1','3-2','3-3','3-4'],4:['4-1','4-5','4-4'],5:['4-6','5-6','5-1','5-4'],6:['6-3','6-6'],7:['7-1','7-3','7-6'],8:['8-1','8-3','8-4'],9:['9-5','9-1','9-6'],10:['10-5','10-2','10-3'],11:['11-2','11-3','11-5','11-6'],12:['12-1','12-5','12-2','12-3']};
const oldLessons=Object.fromEntries(original.flatMap(c=>c.lessons).map(l=>[l.id,l]));
let previousCore=null;
export const chapters=original.map(c=>{
 const lessons=order[c.id].map(suffix=>{
  const id=`${c.id}-${suffix}`,u=units[id],old=oldLessons[id],codeKey=overrides[id]||u.codeKey;
  const prerequisites=[...new Set([...(previousCore?[previousCore]:[]),...(u.requires||[])])];
  const result={...old,id,title:u.title,story:u.example.setup,concept:u.sections[0].paragraphs[0],steps:u.example.steps,trap:u.mistakes[0].right,codeKey,code:codes[codeKey],viz:u.viz,complexity:cost[codeKey]||(old?.codeKey===codeKey?old.complexity:null)||'先根据实际步骤数操作，再分别统计保存的数据；不要只按程序行数估计。',foundation:u,optional:!!u.optional,prerequisiteIds:prerequisites,showCode:c.id!==1&&u.showCode!==false};
  if(!u.optional)previousCore=id;
  return result;
 });
 const boss={...c.boss,code:codes[c.boss.codeKey],review:review[c.id],difficulty:c.id===8?'综合应用':'基础应用'};
 if(c.id===1)boss.codePrerequisiteChapters=[2,3];
 return {...c,title:c.id===5?'排序基础：交换、冒泡与插入':c.title,subtitle:c.id===5?'一次只聚焦一种移动规则':c.subtitle,lessons,boss};
});
chapters[4].boss={
 lc:1051,title:'高度检查器',url:'https://leetcode.com/problems/height-checker/',codeKey:'height',code:codes.height,difficulty:'基础应用',review:review[5],
 description:'给出学生当前身高顺序heights。复制一份并排成非递减顺序，作为每个位置的目标身高。返回当前数组与目标数组在相同下标处数值不一致的位置数量。长度1到100，身高1到100；不要把答案当成交换次数。',
 relation:['第4章的独立数组复制，保留原顺序','本章的三步交换和冒泡排序','按下标逐格比较，并用计数器累计不同位置'],
 cases:[{input:{heights:[1,1,4,2,1,3]},output:3},{input:{heights:[5,1,2,3,4]},output:5}],
 question:'为什么先复制heights，再把副本排序？',options:['排序后长度会自动改变','要同时保留原始顺序和目标顺序来逐位置比较','为了把交换次数当作答案'],correct:1,
 hints:['先保留原数组，新建同样长度的expected并复制每个元素。','用已学的冒泡把expected排好；本题长度最多100，O(n²)足以作为基础练习。','最后比较heights[i]与expected[i]，不同就count加1。'],
 approach:['明确答案是值不符合目标的位置数量，而非最少移动次数。','创建expected副本，逐格复制，不修改原heights。','在expected上执行本章的基础冒泡排序。','逐下标比较原值与目标值，遇到不同就计数。','返回count。例1不同下标是2、4、5，故答案3。'],
 proof:'副本包含与原数组相同的所有元素。冒泡逐轮把未排序范围的最大值放到正确末尾，最终expected成为非递减目标顺序。原数组未被修改。逐位置比较恰好覆盖每个下标，每个不同位置计一次，因此count正是题目要求的数量。',
 pitfalls:['不要把不匹配位置的数量当成交换次数。','不能直接排序原数组后再与它自身比较。','升序允许相等；复制时保留每个重复值。'],
 complexity:'基础冒泡O(n²)时间，复制和逐位比较各O(n)；辅助副本O(n)空间。本题n≤100。要求O(n log n)的力扣912在第8章归并之后再练。',
};
export const requiredLessons=c=>c.lessons.filter(l=>!l.optional);
export const findLesson=id=>chapters.flatMap(c=>c.lessons).find(l=>l.id===id);
export function lessonRoute(id){const c=chapters.find(c=>c.lessons.some(l=>l.id===id));return c?`/learn/${c.id}/${c.lessons.findIndex(l=>l.id===id)}`:'/';}
export const CURRICULUM_SOURCES=[
 {name:'Hello 算法 · 数组',url:'https://www.hello-algo.com/chapter_array_and_linkedlist/array/',note:'参考从结构示意、基本操作到案例分析的组织方式。'},
 {name:'Hello 算法 · 插入排序',url:'https://www.hello-algo.com/chapter_sorting/insertion_sort/',note:'参考把拿起、移动、回填分别展示的方法。'},
 {name:'VisuAlgo · Sorting',url:'https://visualgo.net/en/sorting/',note:'参考自定义小输入、暂停和单步观察；本站演示自行实现。'},
 {name:'OpenDSA',url:'https://opendsa.cs.vt.edu/',note:'参考阅读与操作练习结合、即时反馈的教学组织。'},
 {name:'Java 官方 · Arrays',url:'https://dev.java/learn/language-basics/arrays/',note:'核对Java数组类型、创建、下标、length与复制语义。'}
];
