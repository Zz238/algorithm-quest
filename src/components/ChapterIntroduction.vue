<script setup>
import {ref} from 'vue';
defineProps({intro:Object,chapterId:Number,first:Boolean});
const chosen=ref(-1),checked=ref(false);
</script>
<template>
 <details class="chapter-introduction" data-study-place="intro" :open="first">
  <summary><span><span class="eyebrow">本章导读 · 第 {{chapterId}} 章</span><strong>{{intro.heading}}</strong></span><span class="intro-expand" aria-hidden="true">⌄</span></summary>
  <div class="chapter-intro-body">
   <p v-for="paragraph in intro.why" :key="paragraph">{{paragraph}}</p>
   <section class="chapter-definition"><h3>它是什么？</h3><p>{{intro.definition}}</p></section>
   <details class="study-details" data-study-place="intro-more"><summary>继续看本章词语、例子和自检</summary><h3>先把这些词换成大白话</h3>
   <dl class="intro-concepts"><div v-for="concept in intro.concepts" :key="concept.name"><dt>{{concept.name}}</dt><dd><p>{{concept.meaning}}</p><small>{{concept.example}}</small></dd></div></dl>
   <section class="intro-example"><h3>拿一件具体的事走一遍</h3><p>{{intro.example.setup}}</p><ol><li v-for="step in intro.example.steps" :key="step">{{step}}</li></ol><p class="intro-takeaway">{{intro.example.conclusion}}</p></section>
   <section v-if="intro.boundaries"><h3>这个类比能说明什么，又不能说明什么？</h3><ul><li v-for="item in intro.boundaries" :key="item">{{item}}</li></ul></section>
   <section><h3>这一章会按什么顺序学？</h3><ol><li v-for="item in intro.path" :key="item">{{item}}</li></ol></section>
   <section class="intro-check" aria-label="章前理解自检"><h3>先确认一个小问题</h3><p>{{intro.check.question}}</p><div class="intro-options"><button v-for="(option,index) in intro.check.options" :key="option" :aria-pressed="chosen===index" :class="{selected:chosen===index}" @click="chosen=index;checked=false"><span>{{'ABC'[index]}}</span>{{option}}</button></div><button :disabled="chosen<0" @click="checked=true">检查理解</button><p v-if="checked" class="intro-feedback" role="status"><strong>{{chosen===intro.check.answer?'理解正确。':'再想一想。'}}</strong>{{intro.check.explanation}}</p></section>
   </details><details class="intro-further"><summary>基础理解后，再看一点进阶</summary><ul><li v-for="item in intro.further" :key="item">{{item}}</li></ul></details>
   <p v-if="intro.sources" class="intro-sources">参考与延伸阅读：<a v-for="source in intro.sources" :key="source.url" :href="source.url" target="_blank" rel="noopener">{{source.name}} ↗</a></p>
  </div>
 </details>
</template>
