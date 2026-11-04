<script setup>
defineProps({example:Object});
</script>
<template>
 <section class="everyday-example" aria-label="从生活例子理解本节"><span class="eyebrow">先用一件小事理解</span><h2>{{example.title}}</h2><p>{{example.story}}</p><ol><li v-for="step in example.steps" :key="step">{{step}}</li></ol><p class="life-mapping"><strong>换成程序里的意思：</strong>{{example.mapping}}</p><p class="life-boundary"><strong>类比到这里为止：</strong>{{example.boundary}}</p></section>
</template>
