export function nextPrediction(trace,step){
 const current=trace.frames[step],next=trace.frames[step+1];if(!next)return null;
 let prompt='根据当前状态，接下来会做哪件事？',answer=next.statement,options;
 if(next.phase==='inner-update'||next.phase==='outer-update'){
  prompt='接下来实际更新哪个变量？';
  answer=next.phase==='inner-update'?'更新内层 i（i++）':'更新外层 end（end--）';
  options=['更新内层 i（i++）','更新外层 end（end--）','同时更新 i 和 end'];
 }else if(typeof next.output==='number'){
  prompt='下一步会得到哪个结果？';answer=String(next.output);
  options=[answer,String(next.output+1),String(next.output-1)];
 }else if(typeof next.output==='boolean'){
  prompt='根据当前状态，下一步的结果成立吗？';answer=next.output?'是':'否';options=['是','否'];
 }else{
  options=[...new Set([answer,current.statement,trace.frames[step+2]?.statement,'结束并交出结果'].filter(Boolean))].slice(0,3);
 }
 const offset=step%options.length;
 return {prompt,options:[...options.slice(offset),...options.slice(0,offset)],answer,reason:next.why};
}
