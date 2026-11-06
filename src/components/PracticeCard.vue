<script setup>
import { computed } from 'vue';
import AnswerInput from './AnswerInput.vue';
import { scoreAnswer, hintFor, practiceAnswer } from '../answering.js';
const props = defineProps({
  question: Object,
  state: Object,
  label: String,
  codeKey: String,
  problem: Number,
  disabled: Boolean,
  priorHelp: Boolean,
});
const emit = defineEmits(['attempt', 'help']);
const q = computed(() => props.question),
  s = computed(() => props.state);
const options = computed(() => {
  const list = (q.value.options || []).map((text, id) => ({ text, id }));
  if (q.value.kind === 'order') return [...list].reverse();
  // Keep answer positions varied without changing persisted indices.
  if (q.value.kind === 'choice' && q.value.hints) {
    const offset = parseInt(s.value.sig.slice(-2), 36) % list.length;
    return [...list.slice(offset), ...list.slice(0, offset)];
  }
  return list;
});
const kind = computed(
  () => ({ choice: '单选', output: '推演', order: '步骤排序', code: '补全或修正代码' })[q.value.kind],
);
function changed() {
  s.value.passed = false;
  s.value.feedback = '';
  s.value.issue = '';
}
function set(v) {
  s.value.value = v;
  changed();
}
function select(i) {
  s.value.pick = i;
  changed();
}
function add(i) {
  if (!s.value.order.includes(i)) s.value.order.push(i);
  changed();
}
function move(i, step) {
  const j = i + step;
  if (j < 0 || j >= s.value.order.length) return;
  const v = s.value.order[i];
  s.value.order.splice(i, 1);
  s.value.order.splice(j, 0, v);
  changed();
}
function requestHint() {
  s.value.hints = Math.min(3, s.value.hints + 1);
  s.value.helped = true;
  emit('help');
}
function reveal() {
  s.value.revealed = !s.value.revealed;
  if (s.value.revealed && !s.value.passed) {
    s.value.helped = true;
    emit('help');
  }
}
function check() {
  if (props.disabled) return;
  const result = scoreAnswer(q.value, s.value, { codeKey: props.codeKey, problem: props.problem });
  s.value.passed = result.ok;
  s.value.feedback = result.message;
  s.value.issue = result.ok ? '' : result.format ? 'format' : q.value.kind;
  if (!result.ok && !result.format)
    s.value.errors[q.value.kind] = (s.value.errors[q.value.kind] || 0) + 1;
  if (result.format) return;
  s.value.attempts++;
  emit('attempt', {
    ok: result.ok,
    assisted: s.value.helped || props.priorHelp,
    attempts: s.value.attempts,
    hints: s.value.hints,
  });
}
</script>
<template>
  <article class="mini-question study-question" :class="{ passed: s.passed }">
    <div class="question-heading">
      <span v-if="label" class="eyebrow">{{ label }}</span
      ><span class="question-type">{{ kind }}</span>
    </div>
    <h3>{{ q.question }}</h3>
    <pre v-if="q.input" class="study-code" aria-label="本题给定数据">{{
      JSON.stringify(q.input, null, 2)
    }}</pre>
    <div v-if="q.kind === 'choice'" class="mini-options" role="group" aria-label="答案选项">
      <button
        v-for="(o, i) in options"
        type="button"
        :key="o.id"
        :aria-pressed="s.pick === o.id"
        :class="{ selected: s.pick === o.id }"
        @click="select(o.id)"
      >
        <b>{{ 'ABCDEF'[i] }}</b
        ><span>{{ o.text }}</span>
      </button>
    </div>
    <div v-else-if="q.kind === 'order'" class="order-answer">
      <p class="micro">按顺序点选语句。选中后可用“上移／下移”调整。</p>
      <div class="study-actions">
        <button
          v-for="o in options"
          :key="o.id"
          type="button"
          :disabled="s.order.includes(o.id)"
          @click="add(o.id)"
        >
          {{ o.text }}
        </button>
      </div>
      <ol v-if="s.order.length" class="ordered-steps">
        <li v-for="(id, i) in s.order" :key="id">
          <code>{{ q.options[id] }}</code
          ><span
            ><button
              type="button"
              :disabled="i === 0"
              :aria-label="'上移步骤 ' + (i + 1)"
              @click="move(i, -1)"
            >
              上移</button
            ><button
              type="button"
              :disabled="i === s.order.length - 1"
              :aria-label="'下移步骤 ' + (i + 1)"
              @click="move(i, 1)"
            >
              下移</button
            ><button
              type="button"
              :aria-label="'移除步骤 ' + (i + 1)"
              @click="
                s.order.splice(i, 1);
                changed();
              "
            >
              移除
            </button></span
          >
        </li>
      </ol>
    </div>
    <label v-else-if="q.kind === 'code'" class="mini-output"
      ><code class="fill-template">{{ q.template }}</code
      ><span>填写空格里的代码</span
      ><input
        :value="s.value ?? ''"
        type="text"
        maxlength="800"
        spellcheck="false"
        autocomplete="off"
        autocapitalize="off"
        @input="set($event.target.value)"
        @keydown.enter.prevent="check"
    /></label>
    <AnswerInput v-else :answer="q.answer" :model-value="s.value" @update:model-value="set" />
    <div class="mini-actions">
      <button type="button" class="primary" :disabled="disabled || s.passed" @click="check">
        {{ s.passed ? (s.helped || priorHelp ? '参考后完成' : '已答对') : '检查答案' }}</button
      ><button v-if="!s.passed && s.hints < 3" type="button" @click="requestHint">
        {{ s.hints ? '下一层提示' : '给我一点提示' }}</button
      ><button type="button" @click="reveal">{{ s.revealed ? '收起思路' : '查看思路与答案' }}</button>
    </div>
    <p
      v-if="s.feedback"
      class="mini-feedback"
      :class="{
        correct: s.passed,
        error: !s.passed && s.issue !== 'format',
        format: s.issue === 'format',
      }"
      role="status"
    >
      <strong>{{
        s.passed ? '答对了。' : s.issue === 'format' ? '还有一项需要填写或调整。' : '再试一次。'
      }}</strong>
      {{ s.feedback }}
    </p>
    <p v-if="s.attempts > 1 || s.hints" class="micro practice-history">
      核对 {{ s.attempts }} 次 · 已看 {{ s.hints }} 层提示
    </p>
    <ol v-if="s.hints" class="practice-hints" aria-label="分层提示">
      <li v-for="n in s.hints" :key="n">{{ hintFor(q, n) }}</li>
    </ol>
    <div v-if="s.revealed" class="mini-solution">
      <p>
        <strong>参考答案：</strong> <code>{{ practiceAnswer(q) }}</code>
      </p>
      <p>{{ q.explanation }}</p>
      <p v-if="!s.passed" class="micro">看过答案后，可以换一道题检验自己是否真的会做。</p>
    </div>
  </article>
</template>
