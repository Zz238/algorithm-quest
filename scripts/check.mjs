import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {chapters,codes,requiredLessons,lessonRoute} from '../src/data/course.js';import {framesFor} from '../src/visuals.js';import {solve,equalOutput,experience,cleanProgress,freshProgress,localDateKey,validDateKey,shiftDateKey,checkinStats,canCheckin,recordCheckin} from '../src/logic.js';
import {checkLessonAnswer} from '../src/practice.js';
import './check-traces.mjs';
import {CODE_GUIDES} from '../src/data/code-guides.js';
assert.equal(chapters.length,12);assert.equal(chapters.flatMap(c=>c.lessons).length,72);
assert.deepEqual(Object.keys(CODE_GUIDES).sort(),Object.keys(codes).sort(),'Every Java example needs its own overview.');
for(const [key,g] of Object.entries(CODE_GUIDES)){for(const field of ['goal','input','output','example','tip'])assert(typeof g[field]==='string'&&g[field].trim().length>2,`${key}: ${field}`);assert(Array.isArray(g.steps)&&g.steps.length>=3&&g.steps.every(s=>s.trim().length>6),`${key}: steps`);}
for(const c of chapters){for(const l of c.lessons)assert(CODE_GUIDES[l.codeKey],`Missing overview for ${l.id}`);assert(CODE_GUIDES[c.boss.codeKey],`Missing boss overview for ${c.id}`);}
const lessons=chapters.flatMap(c=>c.lessons),positions=new Map(lessons.map((l,i)=>[l.id,i]));
assert.equal(Object.keys(codes).length,44);
assert.equal(lessons.filter(l=>l.optional).length,4);
let questions=0;
for(const c of chapters)for(const [index,l] of c.lessons.entries()){
 const u=l.foundation;
 assert.equal(lessonRoute(l.id),`/learn/${c.id}/${index}`,'Reading order must not be inferred from legacy IDs.');
 assert(u.goals.length>=2&&u.terms.length>=3&&u.sections.length>=2);
 assert(u.sections.every(section=>section.paragraphs.length>=2));
 assert(u.example.steps.length>=3&&u.mistakes.length>=2);
 assert.equal(u.practice.length,3);
 for(const id of l.prerequisiteIds)assert(positions.get(id)<positions.get(l.id),`${l.id}: future prerequisite ${id}`);
 for(const q of u.practice){
  assert(q.question.trim().length>3&&q.explanation.trim().length>5,`${l.id}: question/feedback`);
  if(q.kind==='choice')assert(q.options.length===3&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<3);
  else {assert(checkLessonAnswer(q,JSON.parse(JSON.stringify(q.answer)),l.codeKey),`${l.id}: stated answer rejected`);assert(!checkLessonAnswer(q,null,l.codeKey),`${l.id}: null accepted`);}
  questions++;
 }
}
assert.equal(questions,216);
for(const c of chapters)for(const id of c.boss.review)assert(Number(id.split('-')[0])<=c.id);
assert.equal(chapters[4].boss.lc,1051);assert(lessons.find(l=>l.id==='8-2').foundation.links.some(link=>link.lc===912&&link.url.includes('sort-an-array')));
const previous=cleanProgress({version:1,lessons:['5-3'],bosses:[5],notes:{'5-3':'old'},checkins:['2026-10-27']},lessons.map(l=>l.id));
assert.deepEqual(previous.mastery,[]);assert.deepEqual(previous.bossTasks,{});assert.deepEqual(previous.lessons,['5-3']);assert.equal(experience(previous),180);
const optionalChapter=chapters[7],optionalProgress=freshProgress();optionalProgress.dailyRead['2026-10-27']=requiredLessons(optionalChapter).map(l=>l.id);assert(canCheckin(optionalProgress,chapters,'2026-10-27'),'Optional quicksort must not block reading check-in.');
let cases=0;
for(const c of chapters){assert.equal(c.lessons.length,6);for(const l of c.lessons){for(const k of ['story','concept','trap','complexity'])assert(l[k].length>0,`${l.id} ${k}`);assert(l.steps.length>=3);assert(framesFor(l.viz).length>=2);assert.equal(l.code.lines.length,l.code.notes.length);assert(l.code.notes.every(x=>x.trim().length>0));}const b=c.boss;assert(b.url.includes('leetcode.com/problems/'));for(const k of ['description','proof','complexity'])assert(b[k].length>15);assert(b.approach.length>=3&&b.hints.length===3&&b.relation.length>=2);for(const t of b.cases){assert(equalOutput(solve(b.lc,t.input),t.output,b.lc),`LC ${b.lc}`);cases++;}}
assert.equal(experience({lessons:Array(72),bosses:Array(12)}),3960);
assert.deepEqual(cleanProgress({version:1,lessons:['1-1','bad'],bosses:[1,1,100],notes:{'bad':'x'},bookmarks:[]},['1-1']),{version:1,lessons:['1-1'],mastery:[],bosses:[1],bossTasks:{},notes:{},bookmarks:[],checkins:[],dailyRead:{}});
assert.equal(localDateKey(new Date(2026,9,27,0,30)),'2026-10-27');
assert(validDateKey('2024-02-29'));assert(!validDateKey('2026-02-29'));assert.equal(shiftDateKey('2026-01-01',-1),'2025-12-31');
const daily=freshProgress(),day='2026-10-27',chapter=chapters[0];
daily.dailyRead[day]=requiredLessons(chapter).slice(0,-1).map(l=>l.id);
assert(!canCheckin(daily,chapters,day));assert(!recordCheckin(daily,chapters,day));
daily.dailyRead[day].push(requiredLessons(chapter).at(-1).id);assert(canCheckin(daily,chapters,day));assert(recordCheckin(daily,chapters,day));assert(!recordCheckin(daily,chapters,day));assert.deepEqual(daily.checkins,[day]);
assert.deepEqual(checkinStats(['2026-10-25','2026-10-26','2026-10-26'],'2026-10-27'),{total:2,current:2,longest:2});
assert.deepEqual(checkinStats(['2026-10-24','2026-10-26','2026-10-27'],'2026-10-27'),{total:3,current:2,longest:2});
const cleaned=cleanProgress({version:1,checkins:['2026-10-27','2026-10-27','2026-02-29'],dailyRead:{'2026-10-27':['1-1','1-1','bad'],'not-a-date':['1-1']}},['1-1']);
assert.deepEqual(cleaned.checkins,['2026-10-27']);assert.deepEqual(cleaned.dailyRead,{'2026-10-27':['1-1']});
for(let k=0;k<100;k++){const a=Array.from({length:1+Math.floor(Math.random()*12)},()=>Math.floor(Math.random()*50)-25);const sorted=[...a].sort((a,b)=>a-b),target=a[Math.floor(Math.random()*a.length)],p=solve(704,{nums:sorted,target});assert.equal(sorted[p],target);assert.equal(solve(121,{prices:a}),Math.max(0,...a.flatMap((v,i)=>a.slice(i+1).map(x=>x-v))));assert.equal(solve(1480,{nums:a}).at(-1),a.reduce((a,b)=>a+b,0));}
console.log(`Course structure passed: 12 chapters / 72 lessons / ${Object.keys(codes).length} annotated programs / ${cases} boss cases. Randomized reference checks passed.`);
if(process.argv.includes('--skip-java')){console.log('Java source unchanged; optional Java recheck skipped.');process.exit(0)}
const fallback='/usr/lib/jvm/java-17-openjdk-amd64/bin/java';const java=process.env.ALGO_JAVA||(fs.existsSync(fallback)?fallback:'java');const probe=spawnSync(java,['--list-modules'],{encoding:'utf8'});
if(!probe.stdout?.includes('jdk.compiler')){console.log('Java compiler module unavailable: Java compilation checks skipped. Install a JDK to run these optional checks.');process.exit(0)}
const tree='class TreeNode { int val; TreeNode left,right; TreeNode(int v){val=v;} TreeNode(int v,TreeNode l,TreeNode r){val=v;left=l;right=r;} }';
function rootExpr(arr){if(!arr.length||arr[0]===null)return 'null';let root={v:arr[0]},q=[root],i=1;for(let h=0;h<q.length&&i<arr.length;h++)for(const side of ['l','r']){if(i<arr.length){let v=arr[i++];if(v!==null){q[h][side]={v};q.push(q[h][side]);}}}const rec=n=>n?`new TreeNode(${n.v},${rec(n.l)},${rec(n.r)})`:'null';return rec(root)}
const a1=a=>'new int[]{'+a.join(',')+'}',a2=a=>'new int[][]{'+a.map(r=>'{'+r.join(',')+'}').join(',')+'}';
function call(b,t){const p=t.input;switch(b.lc){case 1480:return `Arrays.toString(s.runningSum(${a1(p.nums)}))`;case 2235:return `s.sum(${p.num1},${p.num2})`;case 1342:return `s.numberOfSteps(${p.num})`;case 704:return `s.search(${a1(p.nums)},${p.target})`;case 1051:return `s.heightChecker(${a1(p.heights)})`;case 912:return `Arrays.toString(s.sortArray(${a1(p.nums)}))`;case 20:return `s.isValid(${JSON.stringify(p.s)})`;case 1:return `Arrays.toString(s.twoSum(${a1(p.nums)},${p.target}))`;case 78:return `s.subsets(${a1(p.nums)})`;case 104:return `s.maxDepth(${rootExpr(p.root)})`;case 733:return `Arrays.deepToString(s.floodFill(${a2(p.image)},${p.sr},${p.sc},${p.color}))`;case 70:return `s.climbStairs(${p.n})`;case 121:return `s.maxProfit(${a1(p.prices)}))`.slice(0,-1)}}
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'algo-java-')),outDir=path.resolve('java-validation');fs.mkdirSync(outDir,{recursive:true});let checked=new Set();
try{
 for(const c of chapters){const b=c.boss,dir=path.join(temp,'lc'+b.lc);fs.mkdirSync(dir);let body=b.code.lines.filter(x=>!x.startsWith('import ')).join('\n');let imports='import java.util.*;\n';let source=imports+(body.includes('TreeNode')?tree+'\n':'')+body+`\npublic class Main { public static void main(String[] args) { Solution s=new Solution();\n${b.cases.map(t=>'System.out.println('+call(b,t)+');').join('\n')}\n} }\n`;fs.writeFileSync(path.join(dir,'Main.java'),source);fs.mkdirSync(path.join(outDir,'LC'+b.lc),{recursive:true});fs.writeFileSync(path.join(outDir,'LC'+b.lc,'Main.java'),source);const compile=spawnSync(java,['com.sun.tools.javac.Main','Main.java'],{cwd:dir,encoding:'utf8',timeout:20000});assert.equal(compile.status,0,`LC${b.lc}: ${compile.stderr}`);const run=spawnSync(java,['-cp',dir,'Main'],{encoding:'utf8',timeout:5000});assert.equal(run.status,0,run.stderr);const lines=run.stdout.trim().split(/\r?\n/);assert.equal(lines.length,2);lines.forEach((v,i)=>assert(equalOutput(JSON.parse(v),b.cases[i].output,b.lc),`Java LC${b.lc} case ${i}`));checked.add(b.codeKey);}
 console.log('All 12 Java boss solutions compiled and passed 24 executable cases.');
 for(const [key,code] of Object.entries(codes)){if(checked.has(key))continue;const dir=path.join(temp,key);fs.mkdirSync(dir);let body=code.lines.join('\n'),imports=code.lines.filter(x=>x.startsWith('import ')).join('\n');body=code.lines.filter(x=>!x.startsWith('import ')).join('\n');const file=body.includes('public class Main')?'Main.java':'Snippet.java';fs.writeFileSync(path.join(dir,file),imports+'\n'+(body.includes('TreeNode')?tree+'\n':'')+body);const cp=spawnSync(java,['com.sun.tools.javac.Main',file],{cwd:dir,encoding:'utf8',timeout:20000});assert.equal(cp.status,0,`${key}: ${cp.stderr}`);}
 console.log('All other lesson Java snippets also compiled.');
}finally{fs.rmSync(temp,{recursive:true,force:true})}
