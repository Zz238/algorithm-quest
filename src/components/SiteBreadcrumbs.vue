<script setup>
import { computed } from 'vue';
import { CAREER_BY_ID } from '../data/career-index.js';
import { CODING_INDEX, JAVA_INDEX } from '../data/course-index.js';
import { routeTitle } from '../course-route.js';
import CourseLink from './CourseLink.vue';
const props = defineProps({ route: Object });
const emit = defineEmits(['navigate']);
const parts = computed(() => {
  const r = props.route;
  if (r.view === 'home')
    return [
      { label: '基础教学', to: '/' },
      ...(r.selectedChapter ? [{ label: '第 ' + r.selectedChapter + ' 章' }] : []),
    ];
  if (r.chapter)
    return [
      { label: '基础教学', to: '/' },
      { label: '第 ' + r.chapter.id + ' 章 · ' + r.chapter.title, to: '/catalog/' + r.chapter.id },
      { label: r.lesson?.title || '章节练习' },
    ];
  if (r.view === 'java')
    return [
      { label: '基础教学', to: '/' },
      { label: 'Java 起步课', to: '/java' },
      ...(r.topic ? [{ label: JAVA_INDEX[r.topic].title }] : []),
    ];
  if (r.view === 'careers') {
    const c = CAREER_BY_ID[r.routeId];
    return [
      { label: '职业路线', to: '/careers' },
      ...(c
        ? [
            { label: c.title, to: '/careers/' + c.id },
            ...(r.stageId ? [{ label: c.stages.find(([id]) => id === r.stageId)[1] }] : []),
          ]
        : []),
    ];
  }
  if (r.view.startsWith('practice') || r.view === 'playground')
    return [
      { label: '编程实践', to: '/practice' },
      ...(r.view === 'practice-review' ? [{ label: '到期复习', to: '/practice/review' }] : []),
      ...(r.topic
        ? [{ label: CODING_INDEX[r.topic].title }]
        : r.view === 'playground'
          ? [{ label: 'Java 实验台' }]
          : []),
    ];
  if (r.view === 'glossary')
    return [{ label: '术语手册', to: '/glossary' }, ...(r.topic ? [{ label: r.topic }] : [])];
  return [{ label: '首页', to: '/' }, { label: routeTitle(r).replace(' · 算法之旅', '') }];
});
</script>
<template>
  <nav class="site-breadcrumbs" aria-label="面包屑">
    <ol>
      <li v-for="(part, i) in parts" :key="i">
        <span v-if="i" aria-hidden="true" class="breadcrumb-separator">/</span
        ><CourseLink
          v-if="part.to && i < parts.length - 1"
          :to="part.to"
          @navigate="emit('navigate', $event)"
          >{{ part.label }}</CourseLink
        ><span v-else aria-current="page">{{ part.label }}</span>
      </li>
    </ol>
  </nav>
</template>
