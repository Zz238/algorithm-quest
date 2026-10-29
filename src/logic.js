export const LEVELS=[{name:'算法小白',min:0},{name:'算法学徒',min:100},{name:'算法探索者',min:300},{name:'算法能手',min:700},{name:'算法高手',min:1500},{name:'算法大牛',min:3000}];
export const WORLD_NAMES=['启程村','结构森林','思路山脉','算法城'];
export function normalize(value,id){
 if(id===78)return value.map(a=>[...a].sort((a,b)=>a-b).join(',')).sort();
 if(id===1)return [...value].sort((a,b)=>a-b);
 return value;
}
export function equalOutput(a,b,id){try{return JSON.stringify(normalize(a,id))===JSON.stringify(normalize(b,id));}catch{return false;}}
export function solve(id,p){
 switch(id){
 case 1480:{let sum=0;return p.nums.map(x=>sum+=x);}
 case 2235:return p.num1+p.num2;
 case 1342:{let n=p.num,s=0;while(n>0){n=n%2===0?n/2:n-1;s++;}return s;}
 case 704:{let l=0,r=p.nums.length-1;while(l<=r){const m=l+Math.floor((r-l)/2);if(p.nums[m]===p.target)return m;if(p.nums[m]<p.target)l=m+1;else r=m-1;}return -1;}
 case 912:return [...p.nums].sort((a,b)=>a-b);
 case 1051:{const expected=[...p.heights].sort((a,b)=>a-b);return p.heights.filter((v,i)=>v!==expected[i]).length;}
 case 20:{const st=[],pairs={'(':')','[':']','{':'}'};for(const c of p.s){if(pairs[c])st.push(pairs[c]);else if(!st.length||st.pop()!==c)return false;}return !st.length;}
 case 1:{const map=new Map();for(let i=0;i<p.nums.length;i++){const need=p.target-p.nums[i];if(map.has(need))return [map.get(need),i];map.set(p.nums[i],i);}return [];}
 case 78:{const out=[],path=[];function dfs(s){out.push([...path]);for(let i=s;i<p.nums.length;i++){path.push(p.nums[i]);dfs(i+1);path.pop();}}dfs(0);return out;}
 case 104:{const arr=p.root;if(!arr.length||arr[0]===null)return 0;let q=[0],next=1,depth=0;while(q.length){const nq=[];for(const _ of q){for(let k=0;k<2;k++){if(next<arr.length){const at=next++;if(arr[at]!==null)nq.push(at);}}}depth++;q=nq;}return depth;}
 case 733:{const a=p.image.map(r=>[...r]),old=a[p.sr][p.sc];if(old===p.color)return a;const q=[[p.sr,p.sc]];a[p.sr][p.sc]=p.color;for(let head=0;head<q.length;head++){const [r,c]=q[head];for(const [dr,dc] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=r+dr,y=c+dc;if(x>=0&&x<a.length&&y>=0&&y<a[0].length&&a[x][y]===old){a[x][y]=p.color;q.push([x,y]);}}}return a;}
 case 70:{if(p.n<=2)return p.n;let a=1,b=2;for(let i=3;i<=p.n;i++)[a,b]=[b,a+b];return b;}
 case 121:{let min=p.prices[0],best=0;for(let i=1;i<p.prices.length;i++){best=Math.max(best,p.prices[i]-min);min=Math.min(min,p.prices[i]);}return best;}
 default:throw Error('未定义的题号');
 }
}
export function localDateKey(date=new Date()){
 const pad=n=>String(n).padStart(2,'0');
 return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
}
export function validDateKey(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const [year,month,day]=value.split('-').map(Number);
 if(year<1900||month<1||month>12||day<1)return false;
 const d=new Date(year,month-1,day,12);
 return d.getFullYear()===year&&d.getMonth()===month-1&&d.getDate()===day;
}
export function shiftDateKey(date,days){
 if(!validDateKey(date)||!Number.isInteger(days))throw Error('日期格式无效');
 const [y,m,d]=date.split('-').map(Number);
 return localDateKey(new Date(y,m-1,d+days,12));
}
export function checkinStats(checkins,today=localDateKey()){
 const days=[...new Set((checkins||[]).filter(d=>validDateKey(d)&&d<=today))].sort();
 const marked=new Set(days);
 let current=0,key=marked.has(today)?today:shiftDateKey(today,-1);
 while(marked.has(key)){current++;key=shiftDateKey(key,-1);}
 let longest=0,run=0,previous='';
 for(const day of days){run=previous&&shiftDateKey(previous,1)===day?run+1:1;longest=Math.max(longest,run);previous=day;}
 return {total:days.length,current,longest};
}
export function canCheckin(progress,chapters,date){
 const read=new Set(progress.dailyRead?.[date]||[]);
 return chapters.some(chapter=>chapter.lessons.filter(lesson=>!lesson.optional).every(lesson=>read.has(lesson.id)));
}
export function recordCheckin(progress,chapters,date){
 if(!validDateKey(date)||progress.checkins.includes(date)||!canCheckin(progress,chapters,date))return false;
 progress.checkins.push(date);return true;
}
export function freshProgress(){return {version:1,lessons:[],mastery:[],bosses:[],bossTasks:{},notes:{},bookmarks:[],checkins:[],dailyRead:{}};}
export function cleanProgress(p,lessonIds){
 if(p?.version!==1)throw Error('备份版本不支持');
 const known=new Set(lessonIds),chapterIds=new Set(lessonIds.map(id=>Number(id.split('-')[0])));
 const dailyRead=p.dailyRead&&typeof p.dailyRead==='object'&&!Array.isArray(p.dailyRead)?p.dailyRead:{};
 return {version:1,
  lessons:[...new Set((Array.isArray(p.lessons)?p.lessons:[]).filter(x=>known.has(x)))],
  mastery:[...new Set((Array.isArray(p.mastery)?p.mastery:[]).filter(x=>known.has(x)))],
  bosses:[...new Set((Array.isArray(p.bosses)?p.bosses:[]).filter(x=>Number.isInteger(x)&&chapterIds.has(x)))],
  bossTasks:Object.fromEntries(Object.entries(p.bossTasks||{}).filter(([id,lc])=>chapterIds.has(Number(id))&&Number.isInteger(lc)&&lc>0)),
  notes:Object.fromEntries(Object.entries(p.notes||{}).filter(([k,v])=>known.has(k)&&typeof v==='string').map(([k,v])=>[k,v.slice(0,5000)])),
  bookmarks:[...new Set((Array.isArray(p.bookmarks)?p.bookmarks:[]).filter(x=>known.has(x)))],
  checkins:[...new Set((Array.isArray(p.checkins)?p.checkins:[]).filter(validDateKey))].sort(),
  dailyRead:Object.fromEntries(Object.entries(dailyRead).filter(([day,items])=>validDateKey(day)&&Array.isArray(items)).map(([day,items])=>[day,[...new Set(items.filter(x=>known.has(x)))]]).filter(([,items])=>items.length))
 };
}
export function experience(p){return p.lessons.length*30+p.bosses.length*150;}
