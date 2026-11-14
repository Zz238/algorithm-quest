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
    <div class="section-bar">
      <div>
        <span class="eyebrow">选做进阶 · 不影响本章过关登记</span>
        <h2>同章挑战配对：从达标到进阶</h2>
      </div>
    </div>
    <p>完成上方本章正题后，可在这里挑战同主题的进阶手算题。Easy 检验基础概念，Medium 检验条件与边界迁移。</p>
    <ol class="challenge-pair-list">
      <li v-for="item in pair" :key="item.lc">
        <strong>{{ item.difficulty }} · LC {{ item.lc }} · {{ item.title }}</strong>
        <p>{{ item.existing ? '上方正题：本章核心必做练习。' : item.prerequisite }}</p>
        <a v-if="!item.existing" :href="item.url" target="_blank" rel="noopener">力扣原题 ↗</a
        ><a v-else href="#boss-question">回到上方正题 ↑</a>
      </li>
    </ol>
    <h3>{{ extra.difficulty }} · {{ extra.title }} · 本地手算练习</h3>
    <p class="micro">{{ extra.prerequisite }}</p>
    <PracticeCard :question="extra.exercise" :state="work.item" :disabled="disabled" />
  </section>
</template>
