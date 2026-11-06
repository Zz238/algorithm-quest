<script setup>
import { ref } from 'vue';
import SearchResults from '../components/SearchResults.vue';
defineProps({ notes: Object });
const emit = defineEmits(['navigate']);
const query = ref('');
</script>
<template>
  <main class="study-page course-search-page">
    <div class="study-page-lead">
      <h1>搜索课程与笔记</h1>
      <p>
        可以输入概念、题号或代码里的名字，例如「二分」「1051」「pivot」。私人笔记只在当前存档内搜索。
      </p>
    </div>
    <label class="mini-output"
      ><span>搜索课程、题目、术语、代码和笔记</span>
      <input v-model="query" type="search" maxlength="100" placeholder="例如：归并 辅助数组" />
    </label>
    <SearchResults :query="query" :notes="notes" @navigate="emit('navigate', $event)" />
  </main>
</template>
