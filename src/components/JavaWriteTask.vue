<script setup>
import { computed, defineAsyncComponent, ref } from 'vue';
import { CODING_BY_ID } from '../data/coding-catalog.js';
const JavaCodingTask = defineAsyncComponent(() => import('./JavaCodingTask.vue'));
const props = defineProps({ topic: String, owner: String, task: Object });
const opened = ref(false);
const normalized = computed(
  () =>
    CODING_BY_ID['code-core-' + props.topic] || {
      ...props.task,
      id: 'code-core-' + props.topic,
      topic: props.topic,
      level: '基础',
      hints: props.task.steps || ['先明确输入和输出。', '准备状态，再处理数据。'],
    },
);
</script>
<template>
  <details
    class="study-details java-write-task"
    data-study-place="write"
    @toggle="opened = $event.target.open"
  >
    <summary>{{ task.title }}</summary>
    <JavaCodingTask v-if="opened" :task="normalized" :owner="owner" />
  </details>
</template>
