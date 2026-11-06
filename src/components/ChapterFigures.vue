<script setup>
import { computed } from 'vue';
import { findLesson, lessonRoute } from '../data/course.js';
import { CHAPTER_FIGURES, figureSteps } from '../data/figure-selections.js';
import { lessonDemo, runDemo } from '../lesson-demos.js';
import TracePicture from './TracePicture.vue';

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
  <section class="chapter-figures" :aria-label="'第 ' + chapterId + ' 章示意图'">
    <h3>这一章先看这几张图</h3>
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
  </section>
</template>
