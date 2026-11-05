<script setup>
import GlossedText from './GlossedText.vue';
import InlineCheck from './InlineCheck.vue';
defineProps({unit:Object});
</script>
<template>
<section class="lesson-goals"><span class="eyebrow">本节目标</span><ul><li v-for="goal in unit.goals" :key="goal">{{goal}}</li></ul></section>
<section id="lesson-concepts" class="foundation-terms study-anchor"><h2>术语与例子</h2><div class="terms-table"><table><thead><tr><th>术语</th><th>通俗解释</th><th>具体例子</th></tr></thead><tbody><tr v-for="term in unit.terms" :key="term.term"><th>{{term.term}}</th><td data-label="解释">{{term.meaning}}</td><td data-label="例子">{{term.example}}</td></tr></tbody></table></div></section>
<section v-for="(section,i) in unit.sections" :key="section.title" class="foundation-section"><span class="eyebrow">理解 {{String(i+1).padStart(2,'0')}}</span><h2>{{section.title}}</h2><p v-for="paragraph in section.paragraphs" :key="paragraph"><GlossedText :text="paragraph" :terms="unit.terms"/></p><InlineCheck v-if="i<2" :question="unit.practice[i]" :label="i===0?'停一下，确认这个概念':'动手推演一次'"/></section>
<section class="worked-case"><span class="eyebrow">示例推演</span><h2>完整案例</h2><p class="case-setup">{{unit.example.setup}}</p><ol><li v-for="(step,i) in unit.example.steps" :key="i"><b>{{String(i+1).padStart(2,'0')}}</b><span>{{step}}</span></li></ol><p class="case-conclusion"><strong>因此：</strong>{{unit.example.conclusion}}</p></section>
<details v-if="unit.title.startsWith('快慢怎么比较')" class="study-details"><summary>进阶：O(1) 和 O(n) 是什么？</summary><p>已知下标时，格子再多也只定位一次，可记为 O(1)。从头找最后一格时，每格看一次，n 格就看 n 次，可记为 O(n)。这里只描述数据增多后操作次数怎样增长，不是计时。</p></details>
<section v-if="unit.comparison" class="foundation-compare"><h2>回顾与对比</h2><table><tbody><tr v-for="(row,i) in unit.comparison" :key="i"><th>{{row[0]}}</th><td>{{row[1]}}</td><td>{{row[2]}}</td></tr></tbody></table></section>
<section class="misconceptions"><h2>常见误区</h2><article v-for="mistake in unit.mistakes" :key="mistake.wrong"><p><strong>常见误解：</strong>{{mistake.wrong}}</p><p><strong>正确理解：</strong>{{mistake.right}}</p></article></section>
</template>
