<script setup>
import { computed } from 'vue';
import { reviewVariant } from '../data/learning-practice.js';
import { answerState, signature, withLessonFeedback } from '../answering.js';
import { useStudyDraft } from '../study-drafts.js';
import PracticeCard from './PracticeCard.vue';
const props = defineProps({
  topic: String,
  owner: String,
  day: String,
  mode: { type: String, default: 'challenge' },
  disabled: Boolean,
});
const emit = defineEmits(['complete', 'wrong']);
const daily = props.mode === 'review';
const base = Number(props.day?.replaceAll('-', '') || 0) % 997;
const state = useStudyDraft(props.owner, props.topic, 'variant-' + props.mode, (raw) => {
  const current = !daily || raw?.day === props.day ? raw : null;
  const seed = Number.isSafeInteger(current?.seed) && current.seed >= 0 ? current.seed % 100000 : base;
  return {
    seed,
    day: props.day,
    seen: Array.isArray(current?.seen)
      ? current.seen.filter((x) => typeof x === 'string').slice(-75)
      : [],
    item: answerState(reviewVariant(props.topic, seed), current?.item),
    log: Array.isArray(current?.log)
      ? current.log
          .filter((r) => r && Number.isInteger(r.attempts) && typeof r.ok === 'boolean')
          .slice(-12)
      : [],
  };
});
const question = computed(() =>
  withLessonFeedback(props.topic, reviewVariant(props.topic, state.seed), -1),
);
const seen = computed(() => state.seen.includes(signature(question.value)));
function help() {
  const id = signature(question.value);
  if (!state.seen.includes(id)) state.seen = [...state.seen, id].slice(-75);
}
function another() {
  state.seed = (state.seed + 1) % 100000;
  state.item = answerState(question.value);
}
function attempt(r) {
  state.log = [
    ...state.log,
    {
      ok: r.ok,
      assisted: !!(r.assisted || seen.value),
      attempts: r.attempts,
      hints: r.hints,
      type: question.value.kind,
    },
  ].slice(-12);
  if (r.ok) emit('complete', { ...r, assisted: r.assisted || seen.value });
  else emit('wrong', props.topic);
}
</script>
<template>
  <section class="variant-panel" v-if="question">
    <div class="study-block-head">
      <div>
        <h2>{{ mode === 'review' ? '换一道题复习' : '独立小挑战' }}</h2>
        <p>
          {{
            mode === 'review'
              ? '先回忆，再核对；答对后安排下一次复习。'
              : '换一组输入再试。不看提示、独立答对，会记录本节的独立完成。'
          }}
        </p>
      </div>
      <button type="button" @click="another">换一题</button>
    </div>
    <PracticeCard
      :key="state.item.sig"
      :question="question"
      :state="state.item"
      :prior-help="seen"
      :disabled="disabled"
      @help="help"
      @attempt="attempt"
    />
    <details v-if="state.log.length" class="study-details retry-log">
      <summary>本机重试记录（{{ state.log.length }} 次）</summary>
      <ol>
        <li v-for="(entry, i) in state.log" :key="i">
          {{ entry.ok ? (entry.assisted ? '参考后完成' : '独立答对') : '待重试' }} ·
          {{
            { choice: '选择', output: '结果推演', order: '步骤顺序', code: '代码填空' }[entry.type] ||
            '练习'
          }}
          · 核对 {{ entry.attempts }} 次 · 提示 {{ entry.hints }} 层
        </li>
      </ol>
    </details>
  </section>
</template>
