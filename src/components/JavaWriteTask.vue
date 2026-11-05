<script setup>
import {computed,ref} from 'vue';
import {taskProgram} from '../data/learning-practice.js';
import {useStudyDraft} from '../study-drafts.js';
import RunnableJava from './RunnableJava.vue';
const props=defineProps({topic:String,owner:String,task:Object});
const draft=useStudyDraft(props.owner,props.topic,'java-write',raw=>({body:typeof raw?.body==='string'?raw.body.slice(0,2400):props.task.starter,reference:!!raw?.reference}));
const program=computed(()=>taskProgram(props.task,draft.body));
const show=ref(false);
</script>
<template>
 <details class="study-details java-write-task" data-study-place="write">
  <summary>{{task.title}}</summary>
  <p>{{task.task}}</p>
  <label class="mini-output"><code>{{task.signature}} { … }</code><span>在下面写方法体</span><textarea v-model="draft.body" rows="6" maxlength="2400" spellcheck="false" autocapitalize="off" autocomplete="off"/></label>
  <p class="micro">草稿自动保存在本机。下载后在自己的电脑上执行测试，网站不执行这段输入。</p>
  <details><summary>这份测试会检查哪些输入？</summary><ul><li v-for="[call,want] in task.cases" :key="call"><code>{{call}}</code> 应得到 <strong>{{want}}</strong></li></ul></details>
  <RunnableJava :source="program" :expected="'All '+task.cases.length+' cases passed.'" title="下载你写的代码与配套测试"/>
  <button type="button" @click="show=!show;if(show)draft.reference=true">{{show?'收起参考写法':'对照参考写法'}}</button><pre v-if="show" class="study-code"><code>{{task.solution}}</code></pre>
 </details>
</template>
