<script setup>
import { computed } from 'vue';
import { figureSteps } from '../data/figure-selections.js';
import { lessonDemo, runDemo } from '../lesson-demos.js';
import { displayValue } from '../trace-picture.js';
import TracePicture from './TracePicture.vue';

const props = defineProps({ lesson: { type: Object, required: true } });
const emit = defineEmits(['inspect']);
const demo = computed(() => lessonDemo(props.lesson));
const figures = computed(() => figureSteps(runDemo(demo.value).frames, props.lesson.id));
</script>

<template>
  <section
    id="lesson-figures"
    class="study-figures study-anchor"
    aria-labelledby="lesson-figures-heading"
  >
    <h2 id="lesson-figures-heading">关键步骤图解</h2>
    <p>先从图里找这一步改变了什么。想看中间的每个动作，可以用同一组数据进入实验。</p>
    <div class="figure-grid">
      <figure v-for="({ frame, index }, i) in figures" :key="index">
        <div class="figure-number">
          图 {{ i + 1 }} <span>实验第 {{ index + 1 }} 步</span>
        </div>
        <div class="figure-graphic"><TracePicture :frame="frame" :mode="demo.mode" /></div>
        <figcaption>
          <strong>{{ frame.statement }}</strong>
          <p>{{ frame.why }}</p>
          <p v-if="frame.secondary?.length" class="figure-data">
            <b>{{ frame.label }}：</b>{{ frame.secondary.map(displayValue).join('、') }}
          </p>
          <p v-if="frame.output !== undefined" class="figure-data">
            <b>{{ frame.error ? '访问结果' : '结果' }}：</b><code>{{ displayValue(frame.output) }}</code>
          </p>
          <button
            class="text-button figure-inspect"
            type="button"
            @click="emit('inspect', index)"
            :aria-label="'用本节示例查看实验第 ' + (index + 1) + ' 步'"
          >
            在实验里看这一步 <span aria-hidden="true">↓</span>
          </button>
        </figcaption>
      </figure>
    </div>
  </section>
</template>
