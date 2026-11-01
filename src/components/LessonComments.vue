<script setup>
import {ref,computed,toRef} from 'vue';
import {useLessonComments} from '../useLessonComments.js';
import {COMMENT_LIMIT,commentLength,isSendKey,pixelAvatar} from '../comments.js';
const props=defineProps({lessonId:{type:String,required:true},user:Object,service:Object});
const emit=defineEmits(['login']);
const model=useLessonComments(toRef(props,'lessonId'),toRef(props,'user'),props.service);
const {draft,items,total,order,page,pageCount,loading,sending,loadError,sendError,status,withdrawing,canSend,refresh,send,withdraw,available}=model;
const preview=ref(false),composing=ref(false);let compositionEnded=-Infinity;
const length=computed(()=>commentLength(draft.value));
const name=computed(()=>props.user?.user_metadata?.user_name||'学习者');
function keydown(event){
 if(isSendKey(event,composing.value,performance.now()-compositionEnded<50)){event.preventDefault();if(!event.repeat)send();}
}
function compositionEnd(){composing.value=false;compositionEnded=performance.now();}
function formatTime(value){const date=new Date(value);return Number.isNaN(date.valueOf())?'刚刚':new Intl.DateTimeFormat('zh-CN',{dateStyle:'medium',timeStyle:'short'}).format(date);}
function sort(value){page.value=0;order.value=value;}
</script>
<template>
<section class="lesson-comments" aria-labelledby="discussion-title">
 <div class="discussion-intro"><span class="eyebrow">本节交流</span><h2 id="discussion-title">笔记与讨论</h2><p>写下本节的问题、解法或阅读补充。</p></div>
 <div class="discussion-heading"><h3><strong>{{total}}</strong> 条笔记评论</h3><div class="comment-sort" aria-label="评论排序"><button :aria-pressed="order==='oldest'" @click="sort('oldest')">最早</button><button :aria-pressed="order==='newest'" @click="sort('newest')">最新</button></div></div>
 <form class="comment-composer" @submit.prevent="send">
  <div class="composer-tabs" aria-label="笔记编辑模式"><button type="button" :aria-pressed="!preview" @click="preview=false">写笔记</button><button type="button" :aria-pressed="preview" @click="preview=true">预览</button><span class="composer-label">公开 · 本节交流</span></div>
  <div v-if="!preview" class="comment-input-wrap"><label :for="'comment-input-'+lessonId" class="sr-only">本节公开笔记评论</label><textarea :id="'comment-input-'+lessonId" v-model="draft" :disabled="!user||!available" :maxlength="COMMENT_LIMIT*2" :placeholder="user?'你是怎样理解这一步的？也可以留下疑问或改进建议…':'使用 GitHub 登录后，分享你的笔记与问题…'" @keydown="keydown" @compositionstart="composing=true" @compositionend="compositionEnd" :aria-describedby="'comment-help-'+lessonId"></textarea></div>
  <div v-else class="comment-preview"><p v-if="draft" class="comment-body">{{draft}}</p><p v-else class="muted">写下一点内容，就能在这里预览。</p></div>
  <div class="composer-bottom"><div><p :id="'comment-help-'+lessonId">Enter 发送 · Shift + Enter 换行</p><p class="comment-privacy">公开评论所有访客可见；上方学习笔记仅自己可见。</p></div><span class="comment-length" :class="{exceeded:length>COMMENT_LIMIT}">{{length}} / {{COMMENT_LIMIT}}</span><button v-if="user" class="primary send-comment" type="submit" :disabled="!canSend">{{sending?'发送中…':'发送笔记 →'}}</button><button v-else class="primary send-comment" type="button" @click="emit('login')">使用 GitHub 登录</button></div>
  <p v-if="!available" class="comment-notice">离线版可使用上方私人笔记，公开评论请在正式网站使用。</p>
 </form>
 <p v-if="sendError" class="comment-error" role="alert">{{sendError}}</p><p class="comment-feedback" role="status">{{status}}</p>
 <div v-if="loadError" class="comment-load-error" role="status"><p>{{loadError}}</p><button @click="refresh" :disabled="loading">重新加载评论</button></div>
 <p v-if="loading&&!items.length" class="comment-empty">正在翻开本节的交流记录…</p><p v-else-if="!items.length&&!loadError" class="comment-empty">还没有笔记评论。你的一个思路，也许正好能帮到下一位学习者。</p>
 <ol class="comment-list" aria-label="本节笔记评论列表" aria-live="polite" aria-relevant="additions removals">
  <li v-for="item in items" :key="item.id" class="comment-card">
   <div class="comment-card-heading"><span class="comment-avatar" aria-hidden="true"><i v-for="(lit,i) in pixelAvatar(item.author_name)" :key="i" :class="{lit}"></i></span><div class="comment-author"><strong>{{item.author_name}}</strong><span v-if="user&&item.is_mine" class="comment-mine">我</span><time :datetime="item.created_at">{{formatTime(item.created_at)}}</time></div><span class="comment-floor" aria-hidden="true">#{{item.id.slice(0,4)}}</span></div>
   <p class="comment-body">{{item.body}}</p><div v-if="user&&item.is_mine" class="comment-card-actions"><button @click="withdraw(item)" :disabled="withdrawing===item.id">{{withdrawing===item.id?'撤回中…':'撤回我的笔记'}}</button></div>
  </li>
 </ol>
 <div v-if="pageCount>1" class="comment-pagination"><button @click="page--" :disabled="page===0||loading">← 上一页</button><span>{{page+1}} / {{pageCount}} 页</span><button @click="page++" :disabled="page+1>=pageCount||loading">下一页 →</button></div>
</section>
</template>
