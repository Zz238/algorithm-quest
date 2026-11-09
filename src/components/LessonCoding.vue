<script setup>
import { computed, defineAsyncComponent, ref } from 'vue';
import { codingForTopic } from '../data/coding-catalog.js';
import { codingReviewTask } from '../data/coding-review.js';
import CourseLink from './CourseLink.vue';
const JavaCodingTask = defineAsyncComponent(() => import('./JavaCodingTask.vue'));
const props = defineProps({ topic: String, owner: String, disabled: Boolean, review: Boolean });
const emit = defineEmits(['navigate']);
const tasks = computed(() =>
  codingForTopic(props.topic).map((t) => (props.review ? codingReviewTask(t) : t)),
);
const opened = ref(false);
</script>
<template>
  <section
    v-if="tasks.length"
    class="lesson-coding study-anchor"
    id="lesson-coding"
    data-study-section
    data-study-label="动手编程"
    data-outline="lesson-coding"
  >
    <h2>{{ review ? '合上讲解，重新写一次' : '轮到你写代码' }}</h2>
    <p>先说清输入和结果，再编写方法；运行示例后，用全部测试检查边界。卡住时可以逐层打开提示。</p>
    <details class="study-details" data-study-place="coding" @toggle="opened = $event.target.open">
      <summary>{{ tasks.length }} 项编程任务 · 展开开始</summary>
      <template v-if="opened"
        ><JavaCodingTask
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          :owner="owner"
          :disabled="disabled"
          :review="review"
      /></template>
    </details>
    <CourseLink to="/practice" @navigate="emit('navigate', $event)">打开完整编程练习库 →</CourseLink>
  </section>
</template>
