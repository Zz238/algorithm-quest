<script setup>
defineProps({unit:Object});
</script>
<template>
<section class="lesson-goals"><span class="eyebrow">本节只聚焦这些能力</span><ul><li v-for="goal in unit.goals" :key="goal">{{goal}}</li></ul></section>
<section class="foundation-terms"><h2>先把术语说清楚</h2><div class="terms-table"><table><thead><tr><th>术语</th><th>通俗解释</th><th>具体例子</th></tr></thead><tbody><tr v-for="term in unit.terms" :key="term.term"><th>{{term.term}}</th><td>{{term.meaning}}</td><td>{{term.example}}</td></tr></tbody></table></div></section>
<section v-for="(section,i) in unit.sections" :key="section.title" class="foundation-section"><span class="eyebrow">理解 {{String(i+1).padStart(2,'0')}}</span><h2>{{section.title}}</h2><p v-for="paragraph in section.paragraphs" :key="paragraph">{{paragraph}}</p></section>
<section class="worked-case"><span class="eyebrow">拿一组确定的数据，亲手推一遍</span><h2>完整案例</h2><p class="case-setup">{{unit.example.setup}}</p><ol><li v-for="(step,i) in unit.example.steps" :key="i"><b>{{String(i+1).padStart(2,'0')}}</b><span>{{step}}</span></li></ol><p class="case-conclusion"><strong>因此：</strong>{{unit.example.conclusion}}</p></section>
<section v-if="unit.comparison" class="foundation-compare"><h2>回顾与对比</h2><table><tbody><tr v-for="(row,i) in unit.comparison" :key="i"><th>{{row[0]}}</th><td>{{row[1]}}</td><td>{{row[2]}}</td></tr></tbody></table></section>
<section class="misconceptions"><h2>这些地方最容易理解错</h2><article v-for="mistake in unit.mistakes" :key="mistake.wrong"><p><strong>常见误解：</strong>{{mistake.wrong}}</p><p><strong>正确理解：</strong>{{mistake.right}}</p></article></section>
</template>
