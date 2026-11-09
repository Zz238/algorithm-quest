<script setup>
import { ref } from 'vue';
import SearchResults from '../components/SearchResults.vue';
import UiSearchField from '../components/ui/UiSearchField.vue';
defineProps({ notes: Object });
const emit = defineEmits(['navigate']);
const query = ref('');
</script>
<template>
  <main class="study-page course-search-page">
    <div class="study-page-lead">
      <h1>搜索课程与笔记</h1>
      <p>
        搜索基础教学、编程任务、职业路线、术语与私人笔记。例如「二分」「SQL」「均方误差」。按 / 或 Ctrl/⌘
        K 可打开搜索；私人笔记只在当前存档内搜索。
      </p>
    </div>
    <UiSearchField
      v-model="query"
      label="搜索课程、题目、术语、代码和笔记"
      maxlength="100"
      placeholder="例如：归并 辅助数组"
    />
    <SearchResults :query="query" :notes="notes" @navigate="emit('navigate', $event)" />
  </main>
</template>
