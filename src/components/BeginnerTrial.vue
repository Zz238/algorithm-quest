<script setup>
import {ref,computed} from 'vue';
import {TRIAL} from '../data/beginner-trial.js';
import {answerState} from '../answering.js';
import {useStudyDraft} from '../study-drafts.js';
import PracticeCard from './PracticeCard.vue';
const props=defineProps({owner:String});
const emit=defineEmits(['navigate']);
const questions=TRIAL.flatMap(t=>t.questions);
const state=useStudyDraft(props.owner,'trial-v1','trial',raw=>({
 items:questions.map((q,i)=>answerState(q,raw?.items?.[i])),
 stats:questions.map((_,i)=>Array.isArray(raw?.stats?.[i])?raw.stats[i].slice(0,5):null),
 difficulty:TRIAL.map((_,i)=>['','题意','术语','执行顺序','填写答案','没有卡住'].includes(raw?.difficulty?.[i])?raw.difficulty[i]:''),
}));
const consent=ref(false),started=ref(false),at=ref(0),start=ref(0),stopped=ref(false);
const item=computed(()=>TRIAL[Math.floor(at.value/2)]),q=computed(()=>questions[at.value]),done=computed(()=>stopped.value||at.value>=questions.length);
function begin(){if(!consent.value)return;const first=state.stats.findIndex(x=>!x?.[2]);at.value=first<0?questions.length:first;started.value=true;start.value=Date.now();}
function attempted(r){
 const old=state.stats[at.value];
 state.stats[at.value]=[old?.[0]??Math.round((Date.now()-start.value)/1000),r.attempts,r.ok,r.assisted,r.hints];
}
function advance(){if(state.items[at.value].passed){at.value++;start.value=Date.now();}}
function download(){
 const report={version:1,description:'零基础自愿试学；秒数包含停顿，不代表掌握程度',tasks:TRIAL.map((t,i)=>({task:t.id,firstStuck:state.difficulty[i],attempts:t.questions.map((_,j)=>{const [seconds,tries,passed,assisted,hints]=state.stats[i*2+j]||[];return {secondsToFirstCheck:seconds,tries,passed,assisted,hints};})}))};
 const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='algo-quest-beginner-trial.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
</script>
<template>
 <main class="study-page beginner-trial">
  <button class="text-button" @click="emit('navigate','/progress')">← 学习记录</button>
  <div class="study-page-lead"><span class="eyebrow">自愿参加</span><h1>零基础试学</h1><p>试一试数组读取、循环顺序和链表引用。每项先做一次，再换一组数据。结果只留在当前浏览器，可以自行导出。</p></div>
  <section v-if="!started" class="study-core"><p>请按自己的理解作答。卡住就用提示，并记下第一处卡点。试学记录不影响你的课程进度或打卡。</p><label class="study-consent"><input type="checkbox" v-model="consent"/> 我愿意参加这次本机试学</label><button class="primary" :disabled="!consent" @click="begin">开始试学</button></section>
  <section v-else-if="done" class="study-core"><h2>{{stopped?'试学已暂停':'试学任务已走完'}}</h2><p>你可以导出匿名记录。报告只包含题目编号、用时、尝试和提示情况、选择的卡点。</p><button class="primary" @click="download">导出试学记录</button><button v-if="stopped" @click="stopped=false;start=Date.now()">继续当前任务</button></section>
  <template v-else>
   <p class="micro">{{at+1}} / {{questions.length}} · {{item.label}} · {{at%2?'换一组数据':'第一次尝试'}}</p>
   <PracticeCard :key="at" :question="q" :state="state.items[at]" @attempt="attempted"/>
   <div class="study-actions"><label>第一次卡在哪里？<select v-model="state.difficulty[Math.floor(at/2)]"><option value="">还没选择</option><option>题意</option><option>术语</option><option>执行顺序</option><option>填写答案</option><option>没有卡住</option></select></label><button class="primary" :disabled="!state.items[at].passed" @click="advance">{{at===questions.length-1?'结束试学':'下一题'}} →</button></div>
   <button class="text-button" @click="stopped=true">暂停并导出目前的记录</button><p class="micro">需要讲解？<button class="text-button" @click="emit('navigate',item.lesson)">去原小节看一看</button>，再回来继续。</p>
  </template>
 </main>
</template>
