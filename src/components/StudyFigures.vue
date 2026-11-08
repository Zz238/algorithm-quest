<script setup>
import { computed, useId } from 'vue';
import { figureSteps } from '../data/figure-selections.js';
import { lessonDemo, runDemo } from '../lesson-demos.js';
import { displayValue } from '../trace-picture.js';
import FigureView from './FigureView.vue';

const props = defineProps({ lesson: { type: Object, required: true }, positions: Array });
const emit = defineEmits(['inspect', 'note']);
const heading = useId();
const demo = computed(() => lessonDemo(props.lesson));
const figures = computed(() =>
  figureSteps(runDemo(demo.value).frames, props.lesson.id)
    .map((value, number) => ({ ...value, number }))
    .filter((value) => !props.positions || props.positions.includes(value.number)),
);
</script>

<template>
  <section class="study-figures study-anchor" :aria-labelledby="heading">
    <h3 :id="heading" class="sr-only">对应的关键步骤图解</h3>
    <div class="figure-grid">
      <figure v-for="{ frame, index, number } in figures" :key="index">
        <div class="figure-number">
          图 {{ number + 1 }} <span>实验第 {{ index + 1 }} 步</span>
        </div>
        <FigureView :frame="frame" :mode="demo.mode" :title="frame.statement" />
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
          <button
            class="text-button"
            type="button"
            @click="
              emit('note', {
                section: 'lesson-experiment',
                step: index,
                example: true,
                label: '实验第 ' + (index + 1) + ' 步',
              })
            "
          >
            记下这一步
          </button>
        </figcaption>
      </figure>
    </div>
  </section>
</template>
