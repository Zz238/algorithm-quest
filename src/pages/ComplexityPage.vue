<script setup>
import { computed, ref } from 'vue';
import { COMPLEXITY_QUESTIONS } from '../data/complexity-practice.js';
import { adaptiveLevel } from '../learning-insights.js';
import { useStudyDraft } from '../study-drafts.js';
import { answerState } from '../answering.js';
import PracticeCard from '../components/PracticeCard.vue';
import CourseLink from '../components/CourseLink.vue';
const props = defineProps({ owner: String, progress: Object, disabled: Boolean });
const emit = defineEmits(['navigate']);
const back = () => emit('navigate', '/');
const review = () => emit('navigate', '/review');
const adaptive = ref(true);
const work = useStudyDraft(props.owner, 'complexity-training', 'practice', (raw) => ({
  items: COMPLEXITY_QUESTIONS.map((q, i) => answerState(q, raw?.items?.[i])),
}));
const level = computed(() => adaptiveLevel(props.progress.learning.attempts || []));
const questions = computed(() => {
  const all = COMPLEXITY_QUESTIONS.map((q, index) => ({ q, index }));
  return adaptive.value
    ? all.sort(
        (a, b) =>
          Number(work.items[a.index].passed) - Number(work.items[b.index].passed) ||
          Math.abs(a.q.difficulty - level.value) - Math.abs(b.q.difficulty - level.value),
      )
    : all;
});
// Reorder between questions rather than moving an active question during an answer.
const selected = ref(questions.value[0].q.id);
const current = computed(() => questions.value.find((item) => item.q.id === selected.value));
function next() {
  if (!adaptive.value) {
    selected.value =
      COMPLEXITY_QUESTIONS[
        (COMPLEXITY_QUESTIONS.findIndex((q) => q.id === selected.value) + 1) %
          COMPLEXITY_QUESTIONS.length
      ].id;
    return;
  }
  const unfinished = questions.value.find(
    (item) => !work.items[item.index].passed && item.q.id !== selected.value,
  );
  selected.value =
    unfinished?.q.id ||
    questions.value[
      (questions.value.findIndex((item) => item.q.id === selected.value) + 1) % questions.value.length
    ].q.id;
}
</script>
<template>
  <main class="study-page">
    <CourseLink to="/" @navigate="back">← 课程目录</CourseLink>
    <h1>数清时间，也数清空间</h1>
    <p>
      先判断基本操作执行多少次，再看同时保留多少额外数据。包含常数、线性、对数、平方、递归和输出规模分析。
    </p>
    <div class="practice-toolbar">
      <label><input v-model="adaptive" type="checkbox" /> 按正确率与耗时推荐</label
      ><label
        >当前练习<select v-model="selected">
          <option v-for="item in questions" :key="item.q.id" :value="item.q.id">
            {{ work.items[item.index].passed ? '已通过 · ' : '' }}{{ item.q.title }}
          </option>
        </select></label
      >
    </div>
    <p>
      已通过 {{ work.items.filter((s) => s.passed).length }} / {{ COMPLEXITY_QUESTIONS.length }}。{{
        adaptive
          ? '当前建议难度：' +
            ['起步', '应用', '综合'][level - 1] +
            '；下一题优先推荐尚未通过且难度相近的练习。'
          : '已关闭自适应，按原始顺序练习。'
      }}
    </p>
    <pre class="study-code"><code>{{ current.q.code }}</code></pre>
    <PracticeCard
      :key="current.q.id"
      :question="current.q"
      :state="work.items[current.index]"
      :disabled="disabled"
    /><button @click="next">{{ adaptive ? '下一道推荐练习' : '下一题' }}</button
    ><CourseLink to="/review" @navigate="review">查看错误模式分析 →</CourseLink>
  </main>
</template>
