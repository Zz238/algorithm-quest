<script setup>
import { computed } from 'vue';
import { findLesson, lessonRoute } from '../data/course.js';
import { CHAPTER_FIGURES, figureSteps } from '../data/figure-selections.js';
import { lessonDemo, runDemo } from '../lesson-demos.js';
import TracePicture from './TracePicture.vue';
import { CHAPTER_PREVIEWS } from '../data/reading-guide.js';

const props = defineProps({ chapterId: Number });
const emit = defineEmits(['navigate']);
const figures = computed(() =>
  CHAPTER_FIGURES[props.chapterId].map(([id, title]) => {
    const demo = lessonDemo(findLesson(id));
    const frames = runDemo(demo).frames;
    return { id, title, mode: demo.mode, frame: figureSteps(frames, id)[1].frame };
  }),
);
</script>
<template>
  <section class="chapter-figures" :aria-label="'第 ' + chapterId + ' 章学习顺序'">
    <h3>这一章先解决哪几件事</h3>
    <ol class="chapter-preview-list">
      <li v-for="(text, index) in CHAPTER_PREVIEWS[chapterId]" :key="text">
        <b>{{ index + 1 }}</b
        ><span>{{ text }}</span>
      </li>
    </ol>
    <details class="study-details">
      <summary>学到对应小节后，再看代码符号与实验预览</summary>
      <div class="figure-grid">
        <figure v-for="figure in figures" :key="figure.id">
          <div class="figure-graphic"><TracePicture :frame="figure.frame" :mode="figure.mode" /></div>
          <figcaption>
            <strong>{{ figure.title }}</strong>
            <p>{{ figure.frame.statement }}</p>
            <a
              :href="'#' + lessonRoute(figure.id)"
              @click.exact.prevent="emit('navigate', lessonRoute(figure.id))"
              >去对应小节 <span aria-hidden="true">→</span></a
            >
          </figcaption>
        </figure>
      </div>
    </details>
  </section>
</template>
