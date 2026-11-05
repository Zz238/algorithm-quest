import assert from 'node:assert/strict';
import {chapters,findLesson} from '../src/data/course.js';
import {coreJava,bridgeJava,JAVA_BY_ID} from '../src/data/java-starter.js';
import {priorIds} from '../src/data/learning-path.js';
import {reviewVariant,TRANSFERS,transferScenario,WRITING_DRILLS} from '../src/data/learning-practice.js';
import {answerState,readOutput,scoreAnswer,signature} from '../src/answering.js';
import {freshProgress,recordLessonReading,recordCheckin} from '../src/logic.js';
import {dailyStudyCount,queueReview,completeReview,setDailyGoal,dailyGoal,dueReviews,cleanLearning} from '../src/study-state.js';
import {documentFromProgress,mergeDocuments,stableStringify} from '../src/cloud-progress.js';
import {draftKey,readDraft,writeDraft} from '../src/study-drafts.js';
import {buildTrace} from '../src/traces.js';
import {nextPrediction} from '../src/trace-prediction.js';

const lessons=chapters.flatMap(c=>c.lessons),ids=lessons.map(l=>l.id),known=new Set(ids);
const fill=(q,s)=>{
 if(q.kind==='choice')s.pick=q.answer;
 else if(q.kind==='order')s.order=[...q.answer];
 else if(q.kind==='code')s.value=q.answer;
 else if(Array.isArray(q.answer))s.value=q.answer.length?q.answer.map(v=>Array.isArray(v)?v.length?v.join('，'):'空集':String(v)):['[]'];
 else s.value=typeof q.answer==='boolean'?q.answer:String(q.answer);
};
function accepted(q,options){
 const s=answerState(q);fill(q,s);const result=scoreAnswer(q,s,options);
 assert(result.ok,`${q.question}: ${result.message}`);
}
assert.equal(lessons.filter(l=>!l.optional).length,68);
assert.equal(coreJava.length,12);assert.equal(bridgeJava.length,3);
for(const [i,l] of lessons.entries()){
 assert(priorIds(l.id).every(id=>JAVA_BY_ID[id]||ids.indexOf(id)>=0&&ids.indexOf(id)<i),`Broken prerequisite: ${l.id}`);
 for(const q of l.foundation.practice)accepted(q,{codeKey:l.codeKey});
 for(const q of WRITING_DRILLS[l.id]||[])accepted(q);
 const a=reviewVariant(l.id,11),b=reviewVariant(l.id,12);
 assert(a&&b&&signature(a)!==signature(b),`No fresh variant for ${l.id}`);
 accepted(a);accepted(b);
}
assert(priorIds('9-6').includes('6-4'));assert(priorIds('6-1').includes('java-object'));assert(priorIds('8-3').includes('java-list'));assert(priorIds('11-2').includes('java-last-step'));
assert(!priorIds('9-6').includes('9-4'));
for(const u of [...coreJava,...bridgeJava]){assert(u.steps.length>=3&&u.example.source.includes('public class Main'));accepted(u.practice);accepted(u.variant);accepted(reviewVariant(u.id,14));}
for(const t of TRANSFERS){assert(findLesson(t.source)&&findLesson(t.after));const x=transferScenario(t.id,0),y=transferScenario(t.id,1);assert.notEqual(x.prompt,y.prompt);for(const s of [x,y])for(const q of s.questions){assert(q.question.startsWith(s.prompt));accepted(q);}}
assert.deepEqual(readOutput([1,2,3],['１，２、３']),[1,2,3]);
assert.deepEqual(readOutput([[],[1,2]],['空集','1, 2']),[[],[1,2]]);
assert.equal(readOutput(true,false),false);
assert.throws(()=>readOutput(0,''));
assert.throws(()=>readOutput([1,2],['1,']));
assert.throws(()=>readOutput([1,2],['1','']));
const debug=WRITING_DRILLS['3-2'][0],condition=answerState(debug);
condition.value='i <= a.length';assert(!scoreAnswer(debug,condition).ok);
condition.value='i <= a.length - 1';assert(scoreAnswer(debug,condition).ok);
const ordered=WRITING_DRILLS['5-6'][0],swaps=answerState(ordered);swaps.order=[1,0,2];assert.match(scoreAnswer(ordered,swaps).message,/第 1 步/);
const a=reviewVariant('4-5',11),b=reviewVariant('4-5',12),s=answerState(a);fill(a,s);s.helped=true;
assert.equal(answerState(a,s).helped,true);assert.equal(answerState(b,s).value,null);assert.equal(answerState(b,s).helped,false);
const nested=chapters[7].boss.cases[0],q={kind:'output',answer:nested.output};
const ns={value:nested.output.slice().reverse().map(v=>v.length?v.join(','):'空集')};
assert(scoreAnswer(q,ns,{problem:78}).ok,'Subset order should not be an input-format trap');

const trace=buildTrace('bubble',{array:'3,1,2,4'});
const firstSwap=trace.frames.findIndex(f=>f.line===5);
assert.equal(trace.frames[firstSwap].vars.end,3);
assert.deepEqual(trace.frames[firstSwap].values,[1,3,2,4]);
assert.equal(nextPrediction(trace,firstSwap).answer,'更新内层 i（i++）');
assert.equal(trace.frames[firstSwap+1].vars.i,1);
assert.equal(trace.frames[firstSwap+1].vars.end,3);
const lastInner=trace.frames.findIndex(f=>f.phase==='inner-stop');
assert.equal(nextPrediction(trace,lastInner).answer,'更新外层 end（end--）');
assert.equal(trace.frames[lastInner+1].vars.end,2);
assert.deepEqual(trace.frames.at(-1).output,[1,2,3,4]);

const day='2026-11-05',tomorrow='2026-11-06',p=freshProgress();
assert(recordLessonReading(p,'1-1',day,true).ok,'Reading must be recordable before quiz');
assert.deepEqual(p.mastery,[]);assert.equal(dailyStudyCount(p,day),1);
assert(!recordCheckin(p,day,true));setDailyGoal(p,2,40);
queueReview(p,'1-1',day,false,41);assert.equal(p.learning.review['1-1'].due,tomorrow);
completeReview(p,'1-1',day,false,42);assert.equal(dailyStudyCount(p,day),1,'Reading + review of the same topic counts once');
completeReview(p,'java-print',day,false,43);assert.equal(dailyStudyCount(p,day),2);
assert(!recordCheckin(p,day,false));assert(recordCheckin(p,day,true));assert(!recordCheckin(p,day,true));
completeReview(p,'1-1',tomorrow,false,44);assert.equal(p.learning.review['1-1'].due,'2026-11-09');
completeReview(p,'1-1',tomorrow,false,45);assert.equal(p.learning.review['1-1'].due,'2026-11-09');
queueReview(p,'1-1',tomorrow,true,46);assert(dueReviews(p,tomorrow).some(([id])=>id==='1-1'));
completeReview(p,'1-1',tomorrow,true,47);assert(p.learning.review['1-1'].needsWork);
assert.equal(p.learning.review['1-1'].due,'2026-11-07');
p.notes['1-1']='原来的私人笔记';p.learning.prepared.push('java-print');p.learning.independent.push('1-1');
const device=freshProgress();setDailyGoal(device,1,100);device.learning.prepared.push('java-array');
const pa=documentFromProgress(p,ids,'A',100),pb=documentFromProgress(device,ids,'B',100);
const merged=mergeDocuments(pa,pb,ids);
assert.equal(stableStringify(merged),stableStringify(mergeDocuments(pb,pa,ids)));
assert.equal(dailyGoal(merged.progress),1);
assert.deepEqual(merged.progress.learning.prepared,['java-array','java-print']);
assert.deepEqual(merged.progress.learning.independent,['1-1']);
assert.equal(merged.progress.notes['1-1'],'原来的私人笔记');
assert.deepEqual(merged.progress.checkins,[day]);
const invalid=cleanLearning({prepared:['bad'],independent:['bad'],activity:{'2026-02-30':['java-print']},goal:{count:500,at:0}},known);
assert.equal(invalid.goal,null);assert.deepEqual(invalid.activity,{});assert.deepEqual(invalid.independent,[]);

const mem=new Map(),storage={getItem:k=>mem.get(k),setItem:(k,v)=>mem.set(k,v)};
const key=draftKey('A','4-5','exercise');
assert(writeDraft(key,{answer:'2',step:3},storage));
assert.deepEqual(readDraft(key,storage),{answer:'2',step:3});
assert.equal(readDraft(draftKey('B','4-5','exercise'),storage),null);
assert.equal(readDraft(draftKey('A','4-6','exercise'),storage),null);
console.log('Beginner route passed: 12 Java units + 3 bridges, 72 prerequisite maps and fresh variants, all 216 typed answers, 4 stage applications, nested-loop prediction, draft isolation, read/quiz separation and spaced review/cloud merge.');
