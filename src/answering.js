import {checkLessonAnswer} from './practice.js';
import {equalOutput} from './logic.js';

const normalized=s=>String(s??'').normalize('NFKC').trim();
const numberPattern=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
function readNumber(text){
 const s=normalized(text).replace(/−/g,'-');
 if(!numberPattern.test(s)||!Number.isFinite(Number(s)))throw Error('请填一个数字，例如 3 或 -1。');
 return Number(s)===0?0:Number(s);
}
function row(text){
 let s=normalized(text);
 if(s==='空集'||/^\[\s*\]$/.test(s))return [];
 if(s.startsWith('[')&&s.endsWith(']'))s=s.slice(1,-1).trim();
 if(!s)throw Error('请填写这一项；没有元素时可写“空集”或 []。');
 const fields=s.split(/[,，、;；]/);
 if(fields.some(part=>!part.trim()))throw Error('有一格没填数字，请补全或移除空格子。');
 return fields.flatMap(part=>part.trim().split(/\s+/).map(readNumber));
}
export function readOutput(answer,value){
 if(typeof answer==='boolean'){
  if(typeof value!=='boolean')throw Error('请选择“是”或“否”。');
  return value;
 }
 if(typeof answer==='number')return readNumber(value);
 if(Array.isArray(answer)){
  if(!Array.isArray(value)||!value.length)throw Error('请至少填写一项。');
  const nested=answer.some(Array.isArray);
  return nested?value.map(row):value.flatMap(row);
 }
 const s=String(value??'').trim();if(!s)throw Error('请先填写答案。');return s;
}
export function signature(q){
 const text=JSON.stringify([q.kind,q.question,q.answer,q.options,q.template,q.accepted,q.input]);
 let hash=2166136261;
 for(const c of text){hash^=c.charCodeAt(0);hash=Math.imul(hash,16777619);}
 return (hash>>>0).toString(36);
}
export function answerState(q,raw){
 const sig=signature(q),r=raw?.sig===sig?raw:{};
 let value=r.value;
 if(Array.isArray(value))value=value.slice(0,36).map(x=>typeof x==='string'?x.slice(0,350):'');
 else if(typeof value==='string')value=value.slice(0,800);
 else if(typeof value!=='boolean')value=null;
 const options=q.options||[];
 return {sig,value,pick:Number.isInteger(r.pick)&&r.pick>=0&&r.pick<options.length?r.pick:-1,order:Array.isArray(r.order)?[...new Set(r.order.filter(i=>Number.isInteger(i)&&i>=0&&i<options.length))]:[],
  hints:Math.min(3,Math.max(0,Math.floor(Number(r.hints)||0))),helped:!!r.helped,revealed:!!r.revealed,
  passed:!!r.passed,attempts:Math.min(999,Math.max(0,Math.floor(Number(r.attempts)||0))),feedback:typeof r.feedback==='string'?r.feedback.slice(0,600):''};
}
const javaExpression=s=>normalized(s).replace(/\s+/g,'').replace(/;$/,'');
export function scoreAnswer(q,state,{codeKey,problem}={}){
 let value;
 try{
  if(q.kind==='choice'){if(state.pick<0)throw Error('请先选择一个答案。');value=state.pick;}
  else if(q.kind==='order'){if(state.order.length!==q.options.length)throw Error('请把所有步骤放入你的顺序。');value=state.order;}
  else if(q.kind==='code'){value=javaExpression(state.value);if(!value)throw Error('请先填入这一行缺少的部分。');}
  else value=readOutput(q.answer,state.value);
 }catch(e){return {ok:false,format:true,message:e.message};}
 const ok=q.kind==='code'?[q.answer,...(q.accepted||[])].some(x=>javaExpression(x)===value):
 problem?equalOutput(value,q.answer,problem):checkLessonAnswer(q,value,codeKey);
 if(ok)return {ok:true,message:q.explanation||'结果与题目要求一致。'};
 const specific=q.mistakeHints?.[q.kind==='choice'?value:String(value)];
 let message=specific;
 if(!message&&q.kind==='choice')message=`再核对“${q.options[value]}”是否满足题目的要求。先说清这一项会做什么，再试一次。`;
 if(!message&&q.kind==='order'){const i=value.findIndex((x,j)=>x!==q.answer[j]);message=`从第 ${i+1} 步重新想一想：这一条需要的数据，前面准备好了吗？`;}
 if(!message&&q.kind==='code')message='这不是本题能检查的写法。先检查变量、符号和填写位置；其他写法可以下载示例在本机运行。';
 if(!message&&Array.isArray(value)&&!value.some(Array.isArray)&&!q.answer.some(Array.isArray)){
  const i=value.findIndex((x,j)=>x!==q.answer[j]);
  message=value.length!==q.answer.length?'先检查需要输出的是一个结果、所有中间结果，还是完整数组。':
   `第 ${i+1} 项和预期不同。回到生成这一项的步骤，检查当时的状态。`;
 }
 return {ok:false,message:message||'这次结果没对上。先把输入和第一步的状态写出来，找出哪一步开始不同。'};
}
export function hintFor(q,n){
 if(q.hints?.[n-1])return q.hints[n-1];
 if(n===1&&q.kind==='code')return '读一遍空格前后的代码，确认这里需要一个值、一个下标，还是一个真假条件。';
 if(n===1)return '先圈出题目给的数据和要交出的结果，只推演第一步。';
 if(n===2&&q.kind==='choice')return '逐个解释选项做了什么，检查有没有把位置、数值、操作顺序混在一起。';
 if(n===2)return '把第一步完成后的变量写下来；后续每一步要用当前值，不要重复使用初始值。';
 return '对照本节例子里的同一个操作，换用本题数据再走一次。还卡住时，可以查看完整思路。';
}
export function practiceAnswer(q){
 if(q.kind==='choice')return q.options[q.answer];
 if(q.kind==='order')return q.answer.map(i=>q.options[i]).join(' → ');
 if(q.kind==='code')return q.template.replace('____',q.answer);
 return typeof q.answer==='boolean'?(q.answer?'是':'否'):typeof q.answer==='string'?q.answer:JSON.stringify(q.answer);
}

export function withLessonFeedback(id,q,index){
 const hints={
  '1-2:1':{1:'你填的是位置编号。先找到编号为1的格子，再读里面的值。'},
  '2-5:1':{0:'i 没变，但 a[i+1] 读的不是 i 本身。先算括号内的下标。',1:'这里问的是读出的元素值，不是算出的下标。'},
  '4-5:1':{0:'结果不是 i 本身。先计算方括号里的 i+1。',1:'下标算出来了，再从那一格读出元素。'}
 };
 return hints[id+':'+index]?{...q,mistakeHints:hints[id+':'+index]}:q;
}
