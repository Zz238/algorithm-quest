import assert from 'node:assert/strict';
import {createRenderer,ref,nextTick} from 'vue';
import {isSendKey,validateComment,pixelAvatar} from '../src/comments.js';
import {useLessonComments} from '../src/useLessonComments.js';
assert(isSendKey({key:'Enter'}));assert(!isSendKey({key:'Enter',shiftKey:true}));
assert(!isSendKey({key:'Enter',isComposing:true}));assert(!isSendKey({key:'Enter',keyCode:229}));
assert(!isSendKey({key:'Enter'},true));assert(!isSendKey({key:'Enter'},false,true));
assert(validateComment(' \n\t '));assert(validateComment('字'.repeat(2001)));assert.equal(validateComment('😀'.repeat(2000)),'');
assert.deepEqual(pixelAvatar('learner'),pixelAvatar('learner'));
const prior={window:globalThis.window,sessionStorage:globalThis.sessionStorage};
const values=new Map();globalThis.sessionStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
const win=new EventTarget();win.document=Object.assign(new EventTarget(),{visibilityState:'visible'});globalThis.window=win;
const topic=ref('1-1'),user=ref({id:'alice'}),records=[],subscribers=new Map();
let failAfterCommit=false,postGate=null,readGate=null,postCalls=0,readCalls=0;
const service={available:true,
 async list(lesson,order,offset){readCalls++;if(lesson==='1-1'&&readGate)await readGate;const data=records.filter(r=>r.lesson_id===lesson);return {items:structuredClone(data.slice().sort((a,b)=>order==='newest'?b.created_at.localeCompare(a.created_at):a.created_at.localeCompare(b.created_at)).slice(offset,offset+20)),total:data.length};},
 async post(id,lesson,body){postCalls++;if(postGate)await postGate;let row=records.find(r=>r.id===id);if(!row){row={id,lesson_id:lesson,body,author_name:'learner',created_at:new Date().toISOString(),is_mine:true};records.push(row);}if(failAfterCommit){failAfterCommit=false;throw Error('Network response lost');}return structuredClone(row);},
 async withdraw(id){const at=records.findIndex(r=>r.id===id);if(at>=0)records.splice(at,1);return at>=0;},
 subscribe(lesson,changed){subscribers.set(lesson,changed);return ()=>subscribers.delete(lesson);}
};
const renderer=createRenderer({createElement:()=>({}),createText:()=>({}),createComment:()=>({}),setText(){},setElementText(){},parentNode(){},nextSibling(){},insert(){},remove(){},patchProp(){}});
let model;const app=renderer.createApp({setup(){model=useLessonComments(topic,user,service);return ()=>null;}});app.mount({});
const flush=async()=>{await nextTick();await new Promise(resolve=>setTimeout(resolve,0));};
try{
 await flush();model.draft.value=' \n ';await model.send();assert.equal(postCalls,0);
 model.draft.value='先算下标，再访问元素。';await model.send();assert.equal(model.items.value[0].body,'先算下标，再访问元素。');assert.equal(model.draft.value,'');
 failAfterCommit=true;model.draft.value='网络重试不会重复发送';await model.send();assert(model.sendError.value);assert.equal(model.draft.value,'网络重试不会重复发送');const before=records.length;await model.send();assert.equal(records.length,before,'An ambiguous retry must reuse the same message ID.');
 let release;postGate=new Promise(resolve=>{release=resolve;});model.draft.value='正在发送的内容';const one=model.send();await model.send();const calls=postCalls;model.draft.value='请求期间输入的下一条草稿';release();await one;postGate=null;assert.equal(postCalls,calls);assert.equal(model.draft.value,'请求期间输入的下一条草稿');
 const mine=model.items.value.find(r=>r.body==='正在发送的内容');await model.withdraw(mine);assert(!model.items.value.some(r=>r.id===mine.id));
 const refreshes=readCalls;subscribers.get('1-1')();await new Promise(resolve=>setTimeout(resolve,230));assert(readCalls>refreshes,'A realtime signal must refresh the visible list.');
 readGate=new Promise(resolve=>{release=resolve;});const oldRead=model.refresh();topic.value='2-1';await flush();release();await oldRead;readGate=null;assert.equal(model.items.value.length,0,'Late responses from the old lesson must not overwrite the new lesson.');
 model.draft.value='第二节草稿';user.value={id:'bob'};await flush();assert.equal(model.draft.value,'','A new account must not inherit the previous draft.');
 user.value={id:'alice'};await flush();assert.equal(model.draft.value,'第二节草稿');
 user.value=null;await flush();model.draft.value='游客不能发送';const count=postCalls;await model.send();assert.equal(postCalls,count);const remaining=records.length;await model.withdraw({...records[0],is_mine:true});assert.equal(records.length,remaining,'Guest mode must not send a stale owner-only withdrawal request.');
 console.log('Comment checks passed: Enter/IME handling, whitespace/Unicode limits, immediate list updates, duplicate prevention, lost-response retries, in-flight editing, withdrawal, realtime refresh, lesson races and account draft isolation.');
}finally{app.unmount();if(prior.window===undefined)delete globalThis.window;else globalThis.window=prior.window;if(prior.sessionStorage===undefined)delete globalThis.sessionStorage;else globalThis.sessionStorage=prior.sessionStorage;}
