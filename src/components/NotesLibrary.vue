<script setup>
import {computed,ref} from 'vue';
import {findLesson,lessonRoute} from '../data/course.js';
const props=defineProps({notes:Object});
const emit=defineEmits(['navigate']);
const query=ref('');
const items=computed(()=>{
 const word=query.value.trim().toLowerCase();
 return Object.entries(props.notes||{}).filter(([id,value])=>value.trim()&&findLesson(id)).map(([id,body])=>({id,body,title:findLesson(id).title})).filter(i=>!word||(i.title+' '+i.body).toLowerCase().includes(word));
});
</script>
<template>
 <section class="notes-library" aria-labelledby="notes-library-title">
  <div class="study-block-head"><div><h2 id="notes-library-title">我的笔记</h2><p>仅当前存档可见。打开原小节即可继续在右侧编辑。</p></div></div>
  <label class="mini-output"><span>搜索笔记</span><input type="search" v-model="query" placeholder="搜索课程标题或笔记内容"/></label>
  <p v-if="!items.length" role="status">{{query.trim()?'没有匹配的笔记。':'还没有私人笔记。学习时可以在右侧记下自己的理解。'}}</p>
  <article v-for="item in items" :key="item.id" class="note-library-item"><h3>{{item.title}}</h3><p>{{item.body}}</p><button class="text-button" @click="emit('navigate',lessonRoute(item.id))">回小节编辑 →</button></article>
 </section>
</template>
