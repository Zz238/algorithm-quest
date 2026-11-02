import assert from 'node:assert/strict';
import {chapters} from '../src/data/course.js';
import {solve} from '../src/logic.js';
const lessons=chapters.flatMap(c=>c.lessons),questions=lessons.flatMap(l=>l.foundation.practice);
const dependent=/(?:上述|上面的|上文|本例|本实现|按本节规则|同样规则|按规则|当前count方法)/;
for(const l of lessons)for(const q of l.foundation.practice)assert(!dependent.test(q.question),`${l.id}: question still depends on text outside its card: ${q.question}`);
for(const c of chapters)assert(!dependent.test(c.boss.question),`Chapter ${c.id}: reasoning question lacks context.`);
assert.equal(questions.length,216);
const question=(id,index)=>lessons.find(l=>l.id===id).foundation.practice[index];
function arrayIn(q,name){const match=q.question.match(new RegExp(name+'=(\\[[^\\]]+\\])'));assert(match,`${name} data must be visible in the question`);return JSON.parse(match[1]);}
const binary=question('4-4',1),nums=arrayIn(binary,'nums'),target=Number(binary.question.match(/target=(\d+)/)?.[1]);
assert(Number.isFinite(target));assert(binary.question.includes('从 0 开始'));assert.equal(solve(704,{nums,target}),binary.answer);
const bag=question('11-4',1),weights=arrayIn(bag,'weights'),values=arrayIn(bag,'values');
const capacity=Number(bag.question.match(/容量为 (\d+)/)?.[1]);assert.equal(weights.length,values.length);
let best=0;for(let mask=0;mask<1<<weights.length;mask++){let weight=0,value=0;weights.forEach((w,i)=>{if(mask&(1<<i)){weight+=w;value+=values[i];}});if(weight<=capacity)best=Math.max(best,value);}assert.equal(best,bag.answer);
const graph=question('10-5',1),adjacency=JSON.parse(graph.question.match(/graph=(\[[\d,\[\]]+\])/)?.[1]||'null');
assert(Array.isArray(adjacency)&&Array.isArray(adjacency[0]));assert.equal(adjacency[0].length,graph.answer);
console.log('Question context passed: 216 lesson prompts + 12 chapter reasoning prompts; binary-search data/indexing, graph neighbors and knapsack inputs agree with their answers.');
