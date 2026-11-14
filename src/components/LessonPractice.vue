<script setup>
import { computed } from 'vue';
import PracticeCard from './PracticeCard.vue';
import { WRITING_DRILLS } from '../data/learning-practice.js';
import { answerState, withLessonFeedback } from '../answering.js';
import { useStudyDraft } from '../study-drafts.js';

const props = defineProps({
  lesson: Object,
  mastered: Boolean,
  owner: String,
  disabled: Boolean,
  draft: Object,
});
const emit = defineEmits(['mastered', 'wrong']);
const base = props.lesson.foundation.practice.map((q, i) => withLessonFeedback(props.lesson.id, q, i));
const questions = [
  ...base,
  ...(WRITING_DRILLS[props.lesson.id] || []).map((q, i) =>
    withLessonFeedback(props.lesson.id, q, 3 + i),
  ),
];
const state =
  props.draft ||
  useStudyDraft(props.owner, props.lesson.id, 'exercise', (raw) => ({
    items: questions.map((q, i) => answerState(q, raw?.items?.[i])),
  }));
const passed = computed(() => state.items.slice(0, base.length).filter((s) => s.passed).length);
function attempted(i, result) {
  if (!result.ok) emit('wrong', props.lesson.id);
  else if (i < base.length && passed.value === base.length) emit('mastered', props.lesson.id);
}
</script>
<template>
  <section
    class="lesson-practice study-anchor"
    id="lesson-practice"
    aria-label="本节练习"
    data-study-section
    data-study-label="练习"
    data-outline="lesson-practice"
  >
    <div class="practice-header">
      <div>
        <span class="eyebrow">想一想，再动手</span>
        <h2>本节练习</h2>
      </div>
      <span class="practice-saved">{{
        mastered ? '基础练习已通过' : passed + ' / ' + base.length + ' 道基础题已通过'
      }}</span>
    </div>
    <p>可以先做会的题，稍后回来继续；在上方正文自检答过的题目会自动同步到这里。</p>
    <PracticeCard
      v-for="(q, i) in questions"
      :key="state.items[i].sig"
      :question="q"
      :state="state.items[i]"
      :label="['基础巩固', '逐步推演', '场景应用', '动手写一步'][i] || '进阶练习'"
      :code-key="lesson.codeKey"
      :disabled="disabled"
      @attempt="attempted(i, $event)"
    />
  </section>
</template>
