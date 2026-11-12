<script setup>
import { computed } from 'vue';
import { CHAPTER_CHALLENGES } from '../data/chapter-challenges.js';
import { useStudyDraft } from '../study-drafts.js';
import { answerState } from '../answering.js';
import PracticeCard from './PracticeCard.vue';
const props = defineProps({ chapter: Object, owner: String, disabled: Boolean });
const extra = CHAPTER_CHALLENGES[props.chapter.id];
const work = useStudyDraft(props.owner, 'chapter-pair-' + props.chapter.id, 'exercise', (raw) => ({
  item: answerState(extra.exercise, raw?.item),
}));
const pair = computed(() =>
  [
    { ...props.chapter.boss, difficulty: props.chapter.id === 8 ? 'Medium' : 'Easy', existing: true },
    extra,
  ].sort((a, b) => Number(a.difficulty === 'Medium') - Number(b.difficulty === 'Medium')),
);
</script>
<template>
  <section class="chapter-challenge-pair boss-section">
    <h2>每章两步：概念验证与应用进阶</h2>
    <p>Easy 检查概念，Medium 检验迁移。进阶题可分阶段完成，不增加本章登记完成的门槛。</p>
    <ol class="challenge-pair-list">
      <li v-for="item in pair" :key="item.lc">
        <strong>{{ item.difficulty }} · LC {{ item.lc }} · {{ item.title }}</strong>
        <p>{{ item.existing ? '本章完整讲解与练习在下方。' : item.prerequisite }}</p>
        <a v-if="!item.existing" :href="item.url" target="_blank" rel="noopener">力扣原题 ↗</a
        ><a v-else href="#boss-question">阅读本章题解 ↓</a>
      </li>
    </ol>
    <h3>{{ extra.difficulty }} · {{ extra.title }} · 本地手算练习</h3>
    <p class="micro">{{ extra.prerequisite }}</p>
    <PracticeCard :question="extra.exercise" :state="work.item" :disabled="disabled" />
  </section>
</template>
