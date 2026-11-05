<script setup>
import InlineCheck from './InlineCheck.vue';
defineProps({items:Array,progress:Object});
const emit=defineEmits(['navigate']);
</script>
<template>
 <section v-if="items.length" class="study-prerequisites" aria-label="本节用到的前置知识">
  <h2>先确认这几件事</h2>
  <p>这节会用到下面的知识。记不清就就地复习，已经会了可以直接读下去。</p>
  <details v-for="item in items" :key="item.id" :data-study-place="'prior-'+item.id">
   <summary><span>{{item.title}}</span><small v-if="progress.mastery.includes(item.id)||progress.learning.prepared.includes(item.id)">已练过</small></summary>
   <p>{{item.summary}}</p>
   <InlineCheck v-if="item.question.kind!=='order'" :question="item.question" label="试一道前置自检"/>
   <button class="text-button" type="button" @click="emit('navigate',item.path)">看原来的小节 →</button>
  </details>
 </section>
</template>
