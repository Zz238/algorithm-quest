const frame=(statement,values,vars,why,extra={})=>({statement,values:[...values],vars:{...vars},why,line:-1,active:[],...extra});
export const CONCEPT_TRACE_TITLES={reference:'两个名字，一份数组',linkedRead:'创建、连接，再沿 next 读取',stackBasic:'放盘子、看盘子、取盘子',arrayClone:'新建数组，逐格复制',sortGoal:'先验证排序的两个条件',stableSort:'用甲乙标签比较稳定性',heightCheck:'原身高与目标身高逐位置比较',collision:'同一个桶里仍要分清不同的键',adjacency:'邻接表的一行对应哪个顶点',treeStructure:'先看根、孩子与空连接',graphStructure:'先认顶点与边，不急着搜索',bstRead:'沿大小关系寻找目标',heapOrder:'优先队列每次返回当前最小值',floodFill:'只染四方向连通的同色格子',dijkstraIntro:'当前最近距离与松弛',coinGreedy:'最大面额规则的一个反例',knapsack01:'每件最多一次，容量倒序更新',palindrome:'左右两端逐对检查',subsets:'选择、保存一份、撤销',dataPositions:'编号不等于格子里的值',operationOrder:'先加后乘与先乘后加',arithmetic:'整数除法和余数',testStock:'用不同输入核对同一个规则',strategyReview:'任务的条件决定可用的方法'};
export function buildConceptTrace(type,config={}){
 const frames=[],put=(...args)=>frames.push(frame(...args));let code=[];
 if(type==='reference'){
  put('创建一份数组 A=[1,2]',[1,2],{a:'数组 A'},'A 是图中这份对象的名称，不是内存地址。',{labels:['A 的下标 0','A 的下标 1']});
  put('把 a 保存的引用复制给 b',[1,2],{a:'数组 A',b:'数组 A'},'图中仍只有一份数组；两个变量都能找到它。',{labels:['A 的下标 0','A 的下标 1']});
  put('通过 b 修改第 0 格为 9',[9,2],{a:'数组 A',b:'数组 A','a[0]':9,'b[0]':9},'修改的是共同对象里的数据，所以两个名字读到同样的改变。',{active:[0],labels:['A 的下标 0','A 的下标 1']});
  put('把 b 改为 null，a 仍找到 A',[9,2],{a:'数组 A',b:null},'重新绑定 b 没有修改 a，更没有清空数组。',{output:[9,2],labels:['A 的下标 0','A 的下标 1']});
 }else if(type==='linkedRead'){
  put('先创建节点 A，value=1、next=null',[1],{head:'A'},'Node 是节点类型；对象 A 有独立的 value 和 next 两栏。',{kind:'linked',labels:['节点 A']});
  put('再创建节点 B，暂未接入主链',[1],{head:'A',tail:'B'},'创建对象不等于自动连接。此时 A.next 仍是 null。',{kind:'linked',labels:['节点 A'],secondary:['节点 B：value=3，next=null'],label:'独立的新节点'});
  put('把 A.next 设为找到 B 的引用',[1,3],{head:'A',tail:'B'},'现在从 head 出发能沿连接走到 B；B.next 仍是 null。',{kind:'linked',labels:['节点 A','节点 B']});
  put('p=head，读取 p.value 得到 1',[1,3],{head:'A',p:'A','p.value':1},'p 是可移动的访问名字；head 继续记住入口。',{kind:'linked',active:[0],labels:['节点 A','节点 B']});
  put('p=p.next，p 改为找到 B',[1,3],{head:'A',p:'B','p.value':3,'p.next':null},'只改变 p 的引用，链条和 head 都不变。下一项为 null，说明已经到尾部。',{kind:'linked',active:[1],labels:['节点 A','节点 B'],output:3});
 }else if(type==='stackBasic'){
  const kind='stack';put('空栈：还没有盘子',[],{},'图中按栈底到栈顶列出。',{kind});
  put('push(7)，放入第一只盘子',[7],{},'第一只盘子同时位于底部和顶端。',{kind,active:[0]});
  put('push(2)，2 放在顶端',[7,2],{},'后加入的 2 先被拿到，和数值大小无关。',{kind,active:[1]});
  put('peek() 得到 2，但不取走',[7,2],{peek:2},'只查看，因此盘子数量和次序没有改变。',{kind,active:[1]});
  put('确认非空后 pop()，取走 2',[7],{removed:2},'后进先出，剩下的 7 成为栈顶。',{kind,active:[0],output:[7]});
 }else if(type==='arrayClone'){
  const a=config.a||[1,2,3],b=Array(a.length).fill(0);code=['int[] b=new int[a.length];','for(int i=0;i<a.length;i++) b[i]=a[i];','b[0]=9;'];
  const emit=(s,why,active=[])=>put(s,a,{a:'原数组',b:'独立副本'},why,{secondary:[...b],label:'新数组 b',active});
  emit('先新建 b，初始各格为 0','a 和 b 指向两份不同的数组。');a.forEach((v,i)=>{b[i]=v;emit(`把 a[${i}]=${v} 抄到 b[${i}]`,'复制的是当前格的整数值，不是让两个名字指向同一份数组。',[i]);});
  b[0]=9;put('只把副本 b[0] 改为 9',a,{a:'原数组',b:'独立副本'},'原数组没有变化；这才是与 b=a 不同的独立复制。',{secondary:[...b],label:'修改后的副本 b',output:{a:[...a],b:[...b]}});
 }else if(type==='sortGoal'){
  const original=[3,1,2];put('原来的三本书，不能丢也不能多',[3,1,2],{},'目标是重排原值，不是另写一组好看的数字。');
  put('[1,2,2] 虽有序，却不是合法结果',[1,2,2],{},'丢了 3、多了一个 2；顺序与元素数量两个条件必须同时满足。',{secondary:original,label:'原数据',error:true});
  put('[1,2,3] 同时满足两项条件',[1,2,3],{},'所有原值仍在，且每个相邻对都不下降。',{output:[1,2,3]});
 }else if(type==='stableSort'){
  const original=['2甲',1,'2乙'],result=[1,'2甲','2乙'];
  put('给相等的 2 保留甲乙身份',original,{},'排序比较的是数值 2，标签只用来观察相对先后，不参与大小判断。',{labels:['第一个 2','值 1','第二个 2']});
  put('冒泡：2甲 大于 1，交换',result,{method:'冒泡'},'接着比较 2甲 与 2乙，数值相等，不交换，甲仍在乙前面。',{active:[0,1],labels:['值 1','第一个 2','第二个 2']});
  put('插入：从同一份原输入重新开始',original,{method:'插入'},'这是一轮独立对比，不是在冒泡结果上接着插入。',{labels:['第一个 2','值 1','第二个 2']});
  put('拿起 1，将 2甲 右移，再回填 1',result,{method:'插入'},'之后拿起 2乙，左边 2甲 并不严格更大，因此不让它越过。',{active:[0,1],labels:['值 1','第一个 2','第二个 2']});
  put('两种方法都保留甲先乙后',result,{},'本课程两份实现都只在严格大于时交换或移动，因此稳定。',{labels:['值 1','第一个 2','第二个 2'],output:result});
 }else if(type==='heightCheck'){
  const a=config.a||[1,1,4,2,1,3],expected=[...a].sort((x,y)=>x-y);let count=0;
  put('保留原身高，并把独立副本排好',a,{count},'本例先使用已学冒泡得到目标顺序；本实验聚焦后面的比较，不重新讲另一种排序。',{secondary:expected,label:'目标身高 expected'});
  a.forEach((v,i)=>{const different=v!==expected[i];if(different)count++;put(`编号 ${i}：原值 ${v}，目标 ${expected[i]}，${different?'不同，计数加 1':'相同，不增加'}`,a,{i,count},'数的是这个位置是否不同，不是为排好序做了几次交换。',{active:[i],secondary:expected,label:'目标身高 expected'});});
  put('所有位置比较完毕',a,{count},'恰好统计所有不匹配位置。',{secondary:expected,label:'目标身高 expected',output:count});
 }else if(type==='collision'){
  put('教学规则：非负整数按 key%10 分桶',['桶 2'],{},'这是人为选的小模型，不是 Java HashMap 的实际哈希函数。');
  put('2%10=2，登记键 2 对应的值 a',['2 → a'],{bucket:2},'先算候选桶，再保存实际键。',{labels:['桶 2 内']});
  put('12%10=2，键 12 也落入同一桶',['2 → a','12 → b'],{bucket:2},'碰撞不等于键相同；两条实际记录都要保留。',{labels:['桶 2 内','桶 2 内']});
  put('查询键 12，比较实际键后返回 b',['2 → a','12 → b'],{key:12},'不能因为 2 在这个桶里，就把它当成键 12 的答案。',{active:[1],labels:['桶 2 内','桶 2 内'],output:'b'});
 }else if(type==='adjacency'){
  const graph=[[1,2],[0],[0],[]];put('四个顶点：0、1、2、3',[0,1,2,3],{},'本例边是 0—1、0—2；3 是孤立点，没有连接 D 的额外边。',{labels:['顶点','顶点','顶点','孤立点']});
  graph.forEach((neighbors,v)=>put(`读 graph[${v}]=[${neighbors}]`,neighbors,{vertex:v,neighborCount:neighbors.length},neighbors.length?'列表中的每个数是可直接到达的邻居编号，不是权重。':'空列表表示这个顶点没有直接邻居，不表示图里没有这个顶点。',{labels:neighbors.map(()=>`顶点 ${v} 的邻居`)}));
  put('从顶点 0 出发，只能到达 0、1、2',[0,1,2],{unreachable:3},'孤立点 3 仍属于图，但不是这次从 0 出发的可达点。',{labels:['可达','可达','可达'],output:3});
 }else if(type==='treeStructure'){
  const values=[3,9,20,15,7];put('3 是根，9 与 20 是它的孩子',values,{root:3},'连接表示上下层关系，数字不是层号。',{kind:'tree',active:[0,1,2]});
  put('20 还有两个孩子 15 和 7',values,{parent:20},'20 下方这块结构称为以 20 为根的子树。',{kind:'tree',active:[2,3,4]});
  put('9、15、7 没有孩子，是叶子',values,{leafCount:3},'缺少的孩子连接是 null，不是值为 0 的隐藏节点。',{kind:'tree',active:[1,3,4],output:3});
 }else if(type==='graphStructure'){
  const values=['A','B','C','D'],kind='graph';
  put('四个站点是四个顶点',values,{},'图中的线表示四条无向边 A—B、A—C、B—D、C—D。',{kind,active:[0,1,2,3]});
  put('B 与 C 都直接连接 D',values,{neighborsOfD:'B、C'},'一个点可以有多个来路，这不同于树中唯一的父方向。',{kind,active:[1,2,3]});
  put('可以沿 A—B—D—C—A 绕回起点',values,{cycle:true},'之后搜索必须标记已发现的点，否则可能重复绕圈。',{kind,output:4});
 }else if(type==='bstRead'){
  const values=[2,1,3],positions=[[260,35],[140,125],[380,125]],edges=[[0,1],[0,2]];const extra={kind:'tree',positions,edges};
  put('目标 3，从根 2 出发',values,{target:3},'左子树都小于 2，右子树都大于 2，本例没有重复值。',{...extra,active:[0]});
  put('3>2，进入右子树',values,{target:3},'大小约束覆盖整个子树，所以可以排除左侧全部候选。',{...extra,active:[2]});
  put('当前节点值为 3，找到目标',values,{target:3},'只沿一条路径走；树很不平衡时路径仍可能很长。',{...extra,active:[2],output:true});
 }else if(type==='heapOrder'){
  put('空优先队列依次加入 5、2、7',[5,2,7],{},'此处按加入清单列出，不宣称这就是底层堆数组顺序。',{labels:['已加入','已加入','已加入']});
  put('第一次 poll() 得到当前最小的 2',[5,7],{removed:2},'默认整数优先队列按最小值优先；迭代或直接打印不保证全部有序。',{labels:['剩余元素','剩余元素']});
  put('peek() 看剩余最小值 5，不再移除',[5,7],{removed:2,peek:5},'本节 smallest 方法只取一次，返回 2；这里只查看下一次可能取到的值，队列内容不变。',{output:2,labels:['剩余元素','剩余元素']});
 }else if(type==='floodFill'){
  const image=[[1,1,0],[1,0,0]],q=[[0,0]],rows=2,cols=3,kind='grid';image[0][0]=2;
  const emit=(s,cell,why)=>put(s,image.flat(),{queue:q.map(([r,c])=>`(${r},${c})`).join(',')},why,{kind,columns:cols,labels:image.flat().map((_,i)=>`(${Math.floor(i/cols)},${i%cols})`),active:[cell]});
  emit('起点 (0,0) 原色 1，改成 2 并入队',0,'改色同时标记已发现，避免同一个格子重复入队。');
  while(q.length){const [r,c]=q.shift();emit(`处理 (${r},${c})，查看四方向邻居`,r*cols+c,'只允许上、下、左、右；越界、不同色或已改色的都跳过。');for(const [dr,dc]of [[0,1],[1,0],[0,-1],[-1,0]]){const nr=r+dr,nc=c+dc;if(nr>=0&&nr<rows&&nc>=0&&nc<cols&&image[nr][nc]===1){image[nr][nc]=2;q.push([nr,nc]);emit(`发现同色邻居 (${nr},${nc})，改色并入队`,nr*cols+nc,'队列保持 BFS 顺序，已经改为 2 的格子不再重复加入。');}}}
  put('队列为空，同色连通区域全部改完',image.flat(),{},'原来的 0 不是目标颜色，保持不变。',{kind,columns:cols,output:image.map(r=>[...r]),labels:['(0,0)','(0,1)','(0,2)','(1,0)','(1,1)','(1,2)']});
 }else if(type==='dijkstraIntro'){
  const values=[0,1,2],positions=[[70,100],[230,35],[420,100]],edges=[[0,1,2],[0,2,5],[1,2,1]],extra={kind:'graph',positions,edges,weighted:true};
  put('起点 0 距离为 0，其余未知',values,{dist:'[0,∞,∞]'},'边只含非负权：0→1 为 2，0→2 为 5，1→2 为 1。',{...extra,active:[0]});
  put('从 0 更新到 1、2 的候选距离',values,{dist:'[0,2,5]'},'先发现的路线未必是最终最短，当前都是暂定距离。',{...extra,active:[1,2]});
  put('待处理点中 1 最近，先处理它',values,{dist:'[0,2,3]'},'经 1 到 2 的成本为 2+1=3，比原候选 5 小，因此更新；这个动作叫松弛。',{...extra,active:[1,2]});
  put('再处理 2，最短距离确定',values,{dist:'[0,2,3]'},'此方法依赖边权非负；不能直接用于含负权边的图。',{...extra,active:[2],output:[0,2,3]});
 }else if(type==='coinGreedy'){
  put('面额 1、3、4，目标是 6',[1,3,4],{amount:6},'任务是用最少硬币凑出 6；每种币可重复使用。',{labels:['面额','面额','面额']});
  put('总拿不超过余额的最大币：先拿 4',[4,1,1],{count:3},'还剩 2，只能补两个 1，一共三枚。',{labels:['第一枚','第二枚','第三枚']});
  put('另一方案 3+3 只需要两枚',[3,3],{count:2},'存在更好的合法方案，就足以否定“这种贪心对所有面额都最优”。',{labels:['第一枚','第二枚'],output:2});
 }else if(type==='knapsack01'){
  const weights=[1,3,4],values=[15,20,30],capacity=4,dp=Array(5).fill(0),labels=dp.map((_,i)=>`容量 ${i}`);code=['for(int i=0;i<weights.length;i++)','    for(int c=capacity;c>=weights[i];c--)','        dp[c]=Math.max(dp[c],dp[c-weights[i]]+values[i]);'];
  put('每件物品最多一次，dp[c] 从 0 开始',dp,{},'物品是 (重量1,价值15)、(重量3,价值20)、(重量4,价值30)。',{labels});
  weights.forEach((w,i)=>{for(let c=capacity;c>=w;c--){const old=dp[c],candidate=dp[c-w]+values[i];dp[c]=Math.max(old,candidate);put(`物品 ${i}，容量 ${c}：max(${old},${candidate})=${dp[c]}`,dp,{i,weight:w,value:values[i],c},'容量倒序，读取的较小容量尚未使用当前物品，避免同一件拿多次。',{labels,active:[c]});}});
  put('三件都考虑完，容量 4 的最好价值是 35',dp,{},'选重量 1 与重量 3，各拿一次，总重 4，价值 15+20=35。',{labels,output:dp[capacity]});
 }else if(type==='palindrome'){
  const text=config.text??'level',values=[...text];let l=0,r=values.length-1,ok=true;
  code=['int l=0,r=s.length()-1;','while(l<r) {','    if(s.charAt(l)!=s.charAt(r)) return false;','    l++; r--;','}','return true;'];
  put('左右指针从两端开始',values,{s:text,l,r},'本实验用基础英文字符，保留大小写和标点，不自动清洗。');
  while(l<r){const same=values[l]===values[r];put(`比较编号 ${l} 与 ${r}：${values[l]} ${same?'等于':'不等于'} ${values[r]}`,values,{l,r},same?'这一对符合对称，下一步继续向内。':'一对不同就足以否定回文，不用继续。',{active:[l,r]});if(!same){ok=false;break;}l++;r--;put('两个指针各向内走一步',values,{l,r},'已比较的两端被排除，剩下中间待检查。');}
  put(ok?'所有对应位置都相等':'已发现不相等的一对',values,{l,r},ok?'相遇或交错后，没有未比较的成对位置。':'立即返回 false。',{output:ok});
 }else if(type==='subsets'){
  const nums=config.a||[1,2],path=[],out=[];code=['result.add(new ArrayList<>(path));','for(int i=start;i<nums.length;i++) {','    path.add(nums[i]);','    backtrack(nums,i+1,path,result);','    path.remove(path.size()-1);','}'];
  function visit(start){out.push([...path]);put(`保存当前路径 [${path}] 的一份副本`,nums,{start,path:`[${path}]`},'记录副本，之后撤销路径不会抹掉已经保存的答案。',{secondary:out.map(x=>`[${x}]`),label:'已收集的子集'});for(let i=start;i<nums.length;i++){path.push(nums[i]);put(`选择编号 ${i} 的 ${nums[i]}`,nums,{start,i,path:`[${path}]`},'后续只选更靠后的编号，避免同一组合换顺序重复生成。',{active:[i]});visit(i+1);path.pop();put(`返回并撤销 ${nums[i]}`,nums,{start,i,path:`[${path}]`},'恢复到本层开始尝试前的路径，再试另一分支。');}}
  visit(0);put('所有分支完成',nums,{},'空集和每一种合法选择都已保存，path 最后回到空。',{secondary:out.map(x=>`[${x}]`),label:'全部子集',output:out});
 }else if(type==='dataPositions'){
  const values=[1,2,3],labels=['下标 0','下标 1','下标 2'];put('三格的位置编号从 0 开始',values,{},'编号写在格子下面，格子里面才是数据。',{labels});put('读取下标 1，得到值 2',values,{index:1,value:2},'第二格编号为 1，不是编号 2。',{labels,active:[1]});put('长度是 3，但没有下标 3',values,{length:3},'下标总比长度小，长度不是最后一个编号。',{labels,output:2});
 }else if(type==='operationOrder'){
  put('初始数是 2',[2],{},'同样两个动作，先后不同可能得到不同结果。',{labels:['初始值']});put('先加 1，得到 3',[3],{},'这时保存的状态已经更新，下一步用 3。',{labels:['加一后的值']});put('再乘 2，得到 6',[6],{},'若先乘 2 再加 1，结果是 5，因此执行顺序不能交换。',{labels:['最终值'],output:6});
 }else if(type==='arithmetic'){
  put('把 7 颗糖每袋装 2 颗',[7],{},'问装满几袋，与剩下几颗，是两个问题。',{labels:['糖果总数']});put('整数除法 7/2 得到 3',[3],{},'正整数除法只保留完整商，不是四舍五入成 4。',{labels:['装满的袋数']});put('取余 7%2 得到 1',[1],{},'7=2×3+1；余数是 1，所以 7 不是偶数。',{labels:['剩余糖果'],output:1});
 }else if(type==='testStock'){
  for(const prices of [[7],[3,3],[5,4,3],[3,1,4]]){let min=prices[0],best=0;for(const price of prices){best=Math.max(best,price-min);min=Math.min(min,price);}put(`测试 prices=[${prices}]，最好利润 ${best}`,prices,{best},prices.length===1?'只有一天，没有合法先买后卖的日期对，允许不交易，结果为 0。':best===0?'不交易比亏损更好，best 不能强迫成负数。':'第 1 天买入 1，第 2 天卖出 4，合法利润为 3。',{labels:prices.map((_,i)=>`第 ${i} 天`),output:best});}
 }else if(type==='strategyReview'){
  put('任务：有序数组找目标，返回下标',['有序','下标'],{},'先确认有序性，再考虑二分，不必先建哈希表。',{labels:['已知条件','所求结果']});
  put('任务：只问数字是否出现过',['是否存在'],{},'集合已经够用；若还要次数，就需要映射保存额外值。',{labels:['信息需求']});
  put('任务：最近打开的括号先关闭',['后进先出'],{},'这种顺序对应栈，不是普通队列。',{labels:['操作规则']});
  put('任务：一次扫描股票最好利润',['历史最低价','最好利润'],{},'回顾下方程序时，明确它只是这一类任务的示范，不是所有题目的通用模板。',{labels:['状态 1','状态 2'],output:'先确认任务和前提，再选方法'});
 }
 return {title:CONCEPT_TRACE_TITLES[type],frames,code};
}
