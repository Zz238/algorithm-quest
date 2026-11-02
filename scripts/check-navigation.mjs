import assert from 'node:assert/strict';
import {createNavigation} from '../src/navigation.js';
let route='/',time=0,motion=false,waiting=false,id=0;
const jobs=new Map(),commits=[];
const nav=createNavigation({current:()=>route,commit:p=>{route=p;commits.push({p,time});},pending:p=>waiting=p,reducedMotion:()=>motion,setTimer:(fn,ms)=>{jobs.set(++id,{fn,at:time+ms});return id;},clearTimer:key=>jobs.delete(key)});
function advance(ms){time+=ms;for(const [key,job] of [...jobs])if(job.at<=time){jobs.delete(key);job.fn();}}
nav.request('/learn/1/0');assert(waiting);assert.equal(route,'/');
advance(109);assert.equal(route,'/');advance(1);assert.equal(route,'/learn/1/0');assert(!waiting);
nav.request('/learn/1/1');advance(50);nav.request('/glossary');advance(60);
assert.equal(route,'/learn/1/0','A superseded click must not navigate later.');advance(50);assert.equal(route,'/glossary');
nav.request('/progress');nav.cancel();advance(200);assert.equal(route,'/glossary','Browser history or teardown must cancel a queued click.');assert(!waiting);
nav.request('/progress');assert.equal(nav.request('/glossary'),false);advance(200);assert.equal(route,'/glossary','Returning to the current page cancels pending navigation.');
motion=true;nav.request('/account');assert.equal(route,'/account','Reduced motion navigates immediately.');assert(!waiting);assert.equal(jobs.size,0);
assert.deepEqual(commits.map(c=>c.p),['/learn/1/0','/glossary','/account']);
console.log('Navigation passed: 110ms acknowledgement, latest click wins, history/unmount cancellation, same-route cancellation, reduced motion.');
