<script setup>
import CourseLink from './CourseLink.vue';
defineProps({ chapter: Number });
const emit = defineEmits(['navigate']);
</script>
<template>
  <nav class="learning-tools" aria-label="本章学习辅助">
    <CourseLink to="/knowledge" @navigate="emit('navigate', $event)">知识依赖图</CourseLink
    ><CourseLink v-if="[6, 8, 9].includes(chapter)" to="/execution" @navigate="emit('navigate', $event)"
      >调用栈与引用推演</CourseLink
    ><CourseLink
      v-if="[5, 6, 8, 10].includes(chapter)"
      to="/compare"
      @navigate="emit('navigate', $event)"
      >对比辨析</CourseLink
    ><CourseLink to="/complexity" @navigate="emit('navigate', $event)">复杂度练习</CourseLink>
  </nav>
</template>
