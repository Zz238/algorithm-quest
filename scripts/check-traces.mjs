import assert from 'node:assert/strict';
import {buildTrace,TRACE_TYPES,parseTraceArray} from '../src/traces.js';

const result=(type,config)=>buildTrace(type,config).frames.at(-1).output;
for(const type of TRACE_TYPES){const t=buildTrace(type);assert(t.frames.length>=2);for(const f of t.frames){assert(f.statement&&f.why);assert(f.active.every(i=>i>=0&&i<f.values.length),`${type}: invalid highlighted position`);}}
assert.deepEqual(parseTraceArray('1， 2 -3'),[1,2,-3]);
assert.throws(()=>parseTraceArray('1,hello'));assert.throws(()=>parseTraceArray('1,2,3,4,5,6,7'));
for(const i of [0,1]){const t=buildTrace('index',{a:[1,2,3],i});assert.equal(t.frames.at(-1).output,[1,2,3][i+1]);assert(t.frames.filter(f=>'i' in f.vars).every(f=>f.vars.i===i),'Evaluating i+1 must not mutate i.');assert(t.frames.every(f=>JSON.stringify(f.values)==='[1,2,3]'));}
assert(buildTrace('index',{a:[1,2,3],i:2}).frames.at(-1).error);
assert.deepEqual(result('copy',{a:[3,1,2],i:0}),[3,3,2]);
assert.deepEqual(result('swap',{a:[3,1,2]}),[1,3,2]);
assert.throws(()=>buildTrace('binary',{a:[3,1,2]}),/有序|顺序/);
assert.throws(()=>buildTrace('linear',{target:NaN}),/整数/);
let seed=20261028;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
for(let trial=0;trial<60;trial++){
 const a=Array.from({length:1+Math.floor(random()*6)},()=>Math.floor(random()*15)-7),before=[...a],sorted=[...a].sort((x,y)=>x-y);
 for(const type of ['bubble','insertion','merge','quick'])assert.deepEqual(result(type,{a}),sorted,`${type}: ${a}`);
 assert.deepEqual(a,before,'Experiments must not mutate the caller input.');
 assert.equal(result('for',{a}),a.reduce((sum,x)=>sum+x,0));
 let total=0;assert.deepEqual(result('prefix',{a}),a.map(x=>total+=x));
 assert.equal(result('bruteStock',{a}),result('stock',{a}));
 assert.equal(result('stock',{a}),Math.max(0,...a.flatMap((buy,i)=>a.slice(i+1).map(sell=>sell-buy))));
 const target=trial%2?a[Math.floor(random()*a.length)]:99;
 assert.equal(result('linear',{a,target}),a.indexOf(target));
 const found=result('binary',{a:sorted,target});assert(target===99?found===-1:sorted[found]===target);
}
const insertion=buildTrace('insertion',{a:[3,1,2]}).frames;
assert(insertion.some(f=>f.statement.includes('j--')));
for(const [at,f] of insertion.entries())if(f.statement.includes('j--')){assert.deepEqual(f.values,insertion[at-1].values,'j-- only changes the index.');assert.equal(f.vars.value,insertion[at-1].vars.value,'Saved value must survive leftward scanning.');}
assert.equal(result('stack',{text:'([)]'}),false);assert.equal(result('stack',{text:'([])'}),true);assert.equal(result('stack',{text:''}),true);
for(let n=1;n<=8;n++){let a=1,b=1;for(let i=1;i<=n;i++)[a,b]=[b,a+b];assert.equal(result('dp',{n}),a);assert.equal(result('dp',{n,variant:'rolling'}),a);assert.equal(result('recursion',{n}),n*(n+1)/2);}
assert.equal(result('condition',{n:7}),6);assert.equal(result('condition',{n:14}),7);assert.equal(result('set',{a:[2,2,3]}),2);assert.equal(result('bruteStock',{a:[3,1,4]}),3);assert.equal(result('memo',{n:6}),13);assert(buildTrace('memo',{n:6}).frames.some(f=>f.statement.includes('命中缓存')));
assert.equal(result('bfs'),4);assert.equal(result('dfs'),4);assert.equal(result('treeDepth'),3);assert.equal(result('treeBfs'),3);assert.deepEqual(result('preorder'),[3,9,20,15,7]);
console.log(`All ${TRACE_TYPES.length} trace models passed; 60 reproducible input sets checked for sorting, loops, search and stock, plus bounds and state invariants.`);
