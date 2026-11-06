<script setup>
import { computed, ref, watch } from 'vue';
import { filterTerms } from '../course-search.js';
import TermDetails from '../components/TermDetails.vue';
const props = defineProps({ initialTerm: String });
const emit = defineEmits(['navigate']);
const query = ref(''),
  selected = ref(props.initialTerm || 'int');
const matches = computed(() => filterTerms(query.value));
watch(matches, (entries) => {
  if (!entries.some(([term]) => term === selected.value)) selected.value = entries[0]?.[0] || '';
});
</script>
<template>
  <main class="glossary-page">
    <span class="eyebrow">术语查询</span>
    <h1>术语手册</h1>
    <p class="page-lead">查一个词的意思，也可以回到讲过这个词的小节。</p>
    <label class="mini-output" for="glossary-search"
      ><span>搜索术语</span>
      <input
        id="glossary-search"
        v-model="query"
        placeholder="例如：int、返回值、队列"
        type="search"
        maxlength="100"
      />
    </label>
    <div class="glossary-layout">
      <div class="term-list">
        <p v-if="!matches.length" class="empty-state" role="status">
          没有找到相关术语，试试更短的关键词。
        </p>
        <div v-for="[term, info] in matches" :key="term" class="term-row">
          <button
            :class="{ selected: selected === term }"
            :aria-expanded="selected === term"
            @click="selected = term"
          >
            <code>{{ term }}</code
            ><small>{{ info[0] }}</small>
          </button>
          <TermDetails
            v-if="selected === term"
            :term="term"
            class="glossary-inline"
            @navigate="emit('navigate', $event)"
          />
        </div>
      </div>
      <aside v-if="selected" class="glossary-desktop">
        <TermDetails :term="selected" @navigate="emit('navigate', $event)" />
      </aside>
    </div>
  </main>
</template>
