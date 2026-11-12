<script setup>
import { shortLessonTitle } from '../data/reading-guide.js';
import CourseLink from './CourseLink.vue';
import LearningToolLinks from './LearningToolLinks.vue';
defineProps({ view: String, chapter: Object, lessonIndex: Number, progress: Object });
const emit = defineEmits(['navigate']);
</script>
<template>
  <main class="learning-shell">
    <aside class="course-sidebar">
      <CourseLink class="back-map" to="/" @navigate="emit('navigate', $event)">← 回到课程目录</CourseLink
      ><span class="eyebrow">第 {{ String(chapter.id).padStart(2, '0') }} 章</span>
      <h2>{{ chapter.title }}</h2>
      <p>{{ chapter.subtitle }}</p>
      <nav class="lesson-nav" aria-label="本章小节">
        <CourseLink
          v-for="(l, i) in chapter.lessons"
          :key="l.id"
          :class="{ selected: view === 'learn' && lessonIndex === i }"
          :aria-current="view === 'learn' && lessonIndex === i ? 'page' : undefined"
          :to="'/learn/' + chapter.id + '/' + i"
          @navigate="emit('navigate', $event)"
          :title="l.title"
        >
          <b>{{ progress.mastery.includes(l.id) ? '✓' : i + 1 }}</b
          ><span
            >{{ shortLessonTitle(l) }}<small v-if="l.optional">选学 · 不影响基础学习</small></span
          ></CourseLink
        ><CourseLink
          :class="{ selected: view === 'boss' }"
          :aria-current="view === 'boss' ? 'page' : undefined"
          :to="'/boss/' + chapter.id"
          @navigate="emit('navigate', $event)"
        >
          <b>练</b
          ><span
            >章节练习<br /><small>{{ chapter.boss.title }}</small></span
          >
        </CourseLink>
      </nav>
      <div class="side-tip">
        <strong>本章学习</strong>
        <p>遇到不熟悉的词，可以在术语手册里查找。</p>
        <button @click="emit('navigate', '/glossary')">打开术语手册 →</button>
      </div>
    </aside>
    <div class="chapter-reading-column">
      <LearningToolLinks :chapter="chapter.id" @navigate="emit('navigate', $event)" /><slot />
    </div>
  </main>
</template>
