<script setup>
import {reactive} from 'vue';
import {answerState,scoreAnswer} from '../answering.js';
import AnswerInput from './AnswerInput.vue';
const props=defineProps({question:Object,label:String});
const state=reactive(answerState(props.question));
function check(){const r=scoreAnswer(props.question,state);state.passed=r.ok;state.feedback=r.ok?'答对了。'+r.message:r.message;}
</script>
<template>
 <details class="inline-check study-details">
  <summary>{{label||'停一下，试做一题'}}</summary>
  <p>{{question.question}}</p>
  <div v-if="question.kind==='choice'" class="study-actions" role="group" aria-label="自检选项"><button v-for="(x,i) in question.options" :key="x" type="button" :aria-pressed="state.pick===i" @click="state.pick=i;state.feedback=''">{{x}}</button></div>
  <label v-else-if="question.kind==='code'" class="mini-output"><code>{{question.template}}</code><span>填空</span><input v-model="state.value" type="text" maxlength="800"/></label>
  <AnswerInput v-else v-model="state.value" :answer="question.answer" label="自检答案"/>
  <button type="button" @click="check">核对自检</button>
  <p v-if="state.feedback" class="micro" role="status">{{state.feedback}}</p>
 </details>
</template>
