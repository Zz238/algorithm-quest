// Learning records are optional additions to the existing version-1 cloud document.
export const STARTER_IDS=['java-print','java-variable','java-condition','java-for','java-while','java-method','java-array','java-string','java-object','java-reference','java-list','java-grid'];
export const BRIDGE_IDS=['java-call-stack','java-two-loops','java-last-step'];
export const DEFAULT_GOAL=4;
const extraKeys=new Set([...STARTER_IDS,...BRIDGE_IDS,'transfer-1','transfer-2','transfer-3','transfer-4']);
export function localDateKey(date=new Date()){
 const pad=n=>String(n).padStart(2,'0');
 return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
}
export function validDateKey(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const [year,month,day]=value.split('-').map(Number);
 return year>=1900&&month>=1&&month<=12&&day>=1&&localDateKey(new Date(year,month-1,day,12))===value;
}
export function shiftDateKey(date,days){
 if(!validDateKey(date)||!Number.isInteger(days))throw Error('日期格式无效');
 const [y,m,d]=date.split('-').map(Number);
 return localDateKey(new Date(y,m-1,d+days,12));
}
export const emptyLearning=()=>({prepared:[],independent:[],review:{},activity:{},goal:null});
const record=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const union=(a=[],b=[])=>[...new Set([...a,...b])].sort();
const unique=(xs,valid)=>Array.isArray(xs)?union(xs.filter(valid)):[];
const stamp=n=>Number.isSafeInteger(n)&&n>=0;
const validGoal=n=>[1,2,3,4].includes(n);
export function cleanLearning(raw,ids){
 const v=record(raw),valid=id=>ids.has(id)||extraKeys.has(id),g=record(v.goal);
 return {
  prepared:unique(v.prepared,id=>extraKeys.has(id)&&id.startsWith('java-')),
  independent:unique(v.independent,valid),
  review:Object.fromEntries(Object.entries(record(v.review)).filter(([id,r])=>valid(id)&&validDateKey(r?.due)&&validDateKey(r?.day)&&Number.isInteger(r?.box)&&r.box>=0&&r.box<=4&&stamp(r?.at)).map(([id,r])=>[id,{due:r.due,day:r.day,box:r.box,at:r.at,needsWork:r.needsWork===true}])),
  activity:Object.fromEntries(Object.entries(record(v.activity)).filter(([day,items])=>validDateKey(day)&&Array.isArray(items)).sort(([a],[b])=>a.localeCompare(b)).slice(-400).map(([day,items])=>[day,unique(items,valid)]).filter(([,items])=>items.length)),
  goal:validGoal(g.count)&&stamp(g.at)?{count:g.count,at:g.at}:null
 };
}
const newer=(a,b,tie)=>!a?b:!b?a:a.at!==b.at?(a.at>b.at?a:b):(tie(a)>=tie(b)?a:b);
export function mergeLearning(a,b){
 const review={},activity={};
 for(const key of union(Object.keys(a.review),Object.keys(b.review)))review[key]=newer(a.review[key],b.review[key],r=>[r.needsWork?'1':'0',r.due,r.day,r.box].join(':'));
 for(const day of union(Object.keys(a.activity),Object.keys(b.activity)).slice(-400))activity[day]=union(a.activity[day],b.activity[day]);
 return {prepared:union(a.prepared,b.prepared),independent:union(a.independent,b.independent),review,activity,goal:newer(a.goal,b.goal,g=>g.count)};
}
export const dailyGoal=p=>p.learning?.goal?.count||DEFAULT_GOAL;
export const dailyStudyCount=(p,day)=>new Set([...(p.dailyRead?.[day]||[]),...(p.learning?.activity?.[day]||[])]).size;
export function setDailyGoal(p,count,now=Date.now()){
 if(!validGoal(count))return false;
 p.learning.goal={count,at:Math.max(now,(p.learning.goal?.at||0)+1)};return true;
}
export function recordStudyActivity(p,id,day){
 if(!validDateKey(day))return false;
 const items=p.learning.activity[day]||[];
 if(items.includes(id))return false;
 p.learning.activity[day]=[...items,id];
 const keys=Object.keys(p.learning.activity).sort();
 for(const key of keys.slice(0,Math.max(0,keys.length-400)))delete p.learning.activity[key];
 return true;
}
const intervals=[1,3,7,14,30];
export function queueReview(p,id,day,wrong=false,now=Date.now()){
 if(!validDateKey(day))return;
 const before=p.learning.review[id];
 if(!wrong&&before)return;
 p.learning.review[id]={box:0,day,due:wrong?day:shiftDateKey(day,1),at:Math.max(now,(before?.at||0)+1),needsWork:wrong};
}
export function completeReview(p,id,day,assisted,now=Date.now()){
 if(!validDateKey(day))return;
 const before=p.learning.review[id];
 // Repeating a known question on the same day does not advance another interval.
 const due=before?.due<=day;
 const box=assisted?0:before&&!before.needsWork&&due?Math.min(4,before.box+1):before?.box||0;
 p.learning.review[id]={box,day,due:!assisted&&before&&!due?before.due:shiftDateKey(day,intervals[box]),at:Math.max(now,(before?.at||0)+1),needsWork:assisted};
 recordStudyActivity(p,id,day);
}
export function dueReviews(p,day){
 return Object.entries(p.learning.review).filter(([,v])=>v.due<=day).sort(([a,x],[b,y])=>x.due.localeCompare(y.due)||a.localeCompare(b));
}
