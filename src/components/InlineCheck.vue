<script setup>
import { computed, reactive } from 'vue';
import { answerState, scoreAnswer } from '../answering.js';
import AnswerInput from './AnswerInput.vue';

const props = defineProps({ question: Object, label: String, state: Object, disabled: Boolean });
const emit = defineEmits(['attempt']);
const localState = reactive(answerState(props.question));
const current = computed(() => props.state || localState);

function pickOption(i) {
  current.value.pick = i;
  current.value.feedback = '';
}
function check() {
  const s = current.value;
  const r = scoreAnswer(props.question, s);
  s.passed = r.ok;
  s.feedback = r.ok ? '答对了。' + r.message : r.message;
  emit('attempt', r);
}
</script>
<template>
  <details class="inline-check study-details" :class="{ 'is-passed': current.passed }">
    <summary>
      <span>{{ label || '停一下，试做一题' }}</span>
      <span v-if="current.passed" class="inline-check-badge">已通过 · 已同步至本节练习</span>
    </summary>
    <p>{{ question.question }}</p>
    <div v-if="question.kind === 'choice'" class="study-actions" role="group" aria-label="自检选项">
      <button
        v-for="(x, i) in question.options"
        :key="x"
        type="button"
        :disabled="disabled"
        :aria-pressed="current.pick === i"
        @click="pickOption(i)"
      >
        {{ x }}
      </button>
    </div>
    <label v-else-if="question.kind === 'code'" class="mini-output">
      <code>{{ question.template }}</code>
      <span>填空</span>
      <input v-model="current.value" type="text" maxlength="800" :disabled="disabled" />
    </label>
    <AnswerInput v-else v-model="current.value" :answer="question.answer" label="自检答案" />
    <button type="button" :disabled="disabled" @click="check">核对自检</button>
    <p v-if="current.feedback" class="micro" role="status">{{ current.feedback }}</p>
  </details>
</template>
