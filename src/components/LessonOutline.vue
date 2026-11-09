<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { jumpTo } from '../useCourseNavigation.js';
defineProps({ code: Boolean, coding: Boolean });
const active = ref('lesson-story');
let frame;
function update() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    const top =
      Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--header-offset'),
      ) || 80;
    const sections = [...document.querySelectorAll('[data-outline]')];
    const current =
      sections.filter((e) => e.getBoundingClientRect().top <= top + 130).at(-1) || sections[0];
    if (current) active.value = current.dataset.outline;
  });
}
onMounted(() => {
  window.addEventListener('scroll', update, { passive: true });
  update();
});
onUnmounted(() => {
  window.removeEventListener('scroll', update);
  cancelAnimationFrame(frame);
});
</script>
<template>
  <nav class="lesson-outline" aria-label="本节目录">
    <button
      v-for="[id, name] in [
        ['lesson-story', '例子'],
        ['lesson-concepts', '概念与图解'],
        ['lesson-experiment', '实验'],
        ...(code ? [['lesson-code', 'Java 实现']] : []),
        ['lesson-practice', '练习'],
        ...(coding ? [['lesson-coding', '动手编程']] : []),
        ['lesson-challenge', '挑战'],
      ]"
      :key="id"
      :aria-current="active === id ? 'location' : undefined"
      @click="jumpTo(id)"
    >
      {{ name }}
    </button>
  </nav>
</template>
