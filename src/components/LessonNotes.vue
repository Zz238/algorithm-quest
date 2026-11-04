<script setup>
import {computed,ref,watch,onMounted,onUnmounted,nextTick} from 'vue';
const props=defineProps({modelValue:String,open:Boolean,lessonTitle:String,contextLabel:String,user:Object,syncStatus:String,storageOK:Boolean,initializing:Boolean});
const emit=defineEmits(['update:modelValue','update:open','modal-change']);
const compact=ref(false),headerHeight=ref(80),editor=ref(null),panel=ref(null),trigger=ref(null);
const content=computed({get:()=>props.modelValue||'',set:value=>emit('update:modelValue',value.slice(0,5000))});
const modal=computed(()=>compact.value&&props.open);
const visible=computed(()=>!compact.value||props.open);
const status=computed(()=>{
 if(props.initializing)return '正在加载笔记…';
 if(!props.storageOK)return '本机保存不可用，请导出学习记录';
 if(!props.user)return '已保存在本机';
 return {pending:'已保存在本机，待同步',syncing:'正在同步到账号…',synced:'已同步到账号',offline:'离线 · 已保存在本机',error:'已保存在本机，云端待重试'}[props.syncStatus]||'已保存在本机';
});
let media,observer,oldOverflow,locked=false;
function close(){emit('update:open',false);}
function restoreScroll(){if(locked){document.body.style.overflow=oldOverflow;locked=false;}}
watch(modal,async value=>{
 emit('modal-change',value);
 if(value&&!locked){oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';locked=true;}else if(!value)restoreScroll();
 await nextTick();if(value)editor.value?.focus({preventScroll:true});else if(compact.value)trigger.value?.focus({preventScroll:true});
});
function keydown(event){
 if(!modal.value||event.isComposing)return;
 if(event.key==='Escape'){event.preventDefault();close();return;}
 if(event.key!=='Tab')return;
 const items=[...panel.value.querySelectorAll('button:not(:disabled),textarea:not(:disabled)')];
 if(!items.length){event.preventDefault();panel.value.focus();return;}
 const first=items[0],last=items.at(-1);
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
}
function updateMode(){compact.value=!media.matches;}
onMounted(()=>{
 media=window.matchMedia('(min-width: 1280px)');updateMode();media.addEventListener('change',updateMode);
 const header=document.querySelector('.header');
 if(header){const measure=()=>{headerHeight.value=Math.ceil(header.getBoundingClientRect().height);};measure();observer=new ResizeObserver(measure);observer.observe(header);}
});
onUnmounted(()=>{media?.removeEventListener('change',updateMode);observer?.disconnect();restoreScroll();emit('modal-change',false);});
</script>
<template>
 <div class="lesson-notes" :style="{'--notes-header-height':headerHeight+'px'}" @keydown="keydown">
  <button v-if="compact" ref="trigger" class="lesson-notes-trigger" :aria-expanded="open" aria-controls="lesson-notes-panel" :aria-label="open?'收起学习笔记':'打开学习笔记'" @click="emit('update:open',!open)"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M14 4H5v16h14v-9M10 14l1-4 8-8 3 3-8 8-4 1Z"/></svg><span>笔记</span></button>
  <Transition name="notes-backdrop"><div v-if="modal" class="lesson-notes-backdrop" aria-hidden="true" @click="close"></div></Transition>
  <Transition name="notes-panel">
   <aside v-show="visible" ref="panel" id="lesson-notes-panel" class="lesson-notes-panel" :class="{'is-modal':modal}" :role="modal?'dialog':undefined" :aria-modal="modal?true:undefined" :aria-hidden="!visible" :inert="!visible" aria-labelledby="lesson-notes-title" tabindex="-1">
    <header class="lesson-notes-heading"><div><span class="eyebrow">{{contextLabel}}</span><h2 id="lesson-notes-title">学习笔记</h2></div><button v-if="compact" class="notes-close" aria-label="关闭学习笔记" @click="close"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></header>
    <p class="lesson-notes-context">{{lessonTitle}}</p>
    <p class="lesson-notes-help">仅自己可见 · 输入后自动保存{{user?'并同步到账号':'在当前浏览器'}}</p>
    <label class="sr-only" for="lesson-private-note">本节私人笔记</label>
    <textarea id="lesson-private-note" ref="editor" v-model="content" :disabled="initializing" maxlength="5000" spellcheck="false" placeholder="记下你的理解、疑问，或一小段代码…" aria-describedby="lesson-note-status lesson-note-count"></textarea>
    <div class="lesson-notes-status"><span id="lesson-note-status" :class="{'save-warning':!storageOK||syncStatus==='error'}">{{status}}</span><span id="lesson-note-count">{{content.length}} / 5000</span></div>
   </aside>
  </Transition>
 </div>
</template>
