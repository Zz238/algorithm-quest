<script setup>
import { computed, ref, watch } from 'vue';
import { searchCourse } from '../course-search.js';
const props = defineProps({ query: String, notes: Object });
const emit = defineEmits(['navigate']);
const groups = computed(() => searchCourse(props.query, props.notes));
const total = computed(() => groups.value.reduce((n, g) => n + g.items.length, 0));
const expanded = ref({});
watch(
  () => props.query,
  () => {
    expanded.value = {};
  },
);
</script>
<template>
  <div v-if="query?.trim()" class="search-results grouped-results" aria-label="搜索结果">
    <p class="search-count" role="status">
      {{ total ? '找到 ' + total + ' 条结果' : '没有找到结果，试试更短的词或代码中的名字。' }}
    </p>
    <section v-for="group in groups" :key="group.key" class="result-group">
      <h3>
        {{ group.label }} <small>{{ group.items.length }}</small>
      </h3>
      <ul>
        <li
          v-for="entry in group.items.slice(0, expanded[group.key] ? undefined : 8)"
          :key="entry.path + entry.title"
        >
          <a :href="'#' + entry.path" @click.exact.prevent="emit('navigate', entry.path)">
            <strong>{{ entry.title }}</strong
            ><span>{{ entry.summary }}</span
            ><span class="search-arrow" aria-hidden="true">→</span>
          </a>
        </li>
      </ul>
      <button
        v-if="group.items.length > 8"
        type="button"
        class="text-button"
        :aria-expanded="!!expanded[group.key]"
        @click="expanded[group.key] = !expanded[group.key]"
      >
        {{ expanded[group.key] ? '收起' : '查看全部 ' + group.items.length + ' 条' }}{{ group.label }}
      </button>
    </section>
  </div>
</template>
