const output=(question,answer,explanation,hint)=>({kind:'output',question,answer,explanation,hints:[hint]});
const choice=(question,options,answer,explanation,hint)=>({kind:'choice',question,options,answer,explanation,hints:[hint]});
export const TRIAL=[
 {id:'index',label:'访问数组',lesson:'/learn/4/1',questions:[
  output('a=[4,8,6,2]，i=1，下标从0开始。读取 a[i+1] 得到多少？',6,'i+1=2；编号2的值是6。','先算方括号里的数，再找对应格。'),
  output('换一组：a=[9,3,7,1]，i=0。读取 a[i+1] 得到多少？',3,'i+1=1，编号1的值是3。','把编号与值写在两行。')]},
 {id:'bubble',label:'内外层循环',lesson:'/learn/5/2',questions:[
  choice('冒泡排序外层 end=3，内层条件 i<end；a=[5,2,4,1]。刚完成 i=0 的交换，循环体结束。接下来先更新哪个变量？',['先执行 i++','先执行 end--','两个都立即更新'],0,'内层更新先执行；只有内层条件失败后，外层才会更新。','这一轮还有 i=1 和 i=2 两对未处理。'),
  choice('换一组：a=[4,6,2,3]，end=3，i=3。检查 i<end 已为假、内层刚结束。接下来怎样更新边界？',['end--','i++ 后再访问 a[4]','把 end 加1'],0,'内层退出后才更新外层 end。','现在不再执行内层循环体。')]},
 {id:'next',label:'引用与 next',lesson:'/learn/6/1',questions:[
  choice('A.value=4，A.next 指向 B(value=6)，p 指向 A。执行 p=p.next，哪项发生了变化？',['p 改为指向 B；A.next 仍指向 B','A.next 被改写','把 B 的数字写入 A'],0,'赋值的左侧是变量 p，只改变它保存的引用。','看等号左边是 p 还是 p.next。'),
  choice('换一组：p 指向 A(value=2)，A.next 指向 B(value=8)，n 指向新节点 N(value=5)。只执行 p.next=n，哪个连接变了？',['A.next 现在指向 N','p 现在指向 N','B.value 改为5'],0,'左侧是 A 对象的 next 字段，p 仍指向 A。','先用 p 找到对象，再看要写哪个字段。')]}
];
