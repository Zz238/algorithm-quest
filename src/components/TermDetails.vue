<script setup>
import { computed } from 'vue';
import { COURSE_TERMS, termLessons } from '../course-search.js';
const props = defineProps({ term: String });
const emit = defineEmits(['navigate']);
const info = computed(() => COURSE_TERMS[props.term]);
const lessons = computed(() => termLessons[props.term] || []);
</script>
<template>
  <section v-if="info" class="explanation-panel glossary-term">
    <h2>{{ term }}</h2>
    <span class="eyebrow">{{ info[0] }}</span>
    <p>{{ info[1] }}</p>
    <pre>{{ info[2] }}</pre>
    <template v-if="lessons.length">
      <h3>在哪些小节讲过</h3>
      <ul class="term-related">
        <li v-for="lesson in lessons" :key="lesson.id">
          <a :href="'#' + lesson.path" @click.exact.prevent="emit('navigate', lesson.path)"
            >第 {{ lesson.chapter }} 章 · {{ lesson.title }} →</a
          >
        </li>
      </ul>
    </template>
  </section>
</template>
