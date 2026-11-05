<script setup>
import {computed,ref} from 'vue';
const props=defineProps({text:String,terms:Array});
const active=ref(-1);
const parts=computed(()=>{
 const tokens=props.terms.flatMap(t=>{
  const names=[t.term,...t.term.split(/\s+/).filter(s=>s.length>=3)];
  return names.filter(x=>x.length>=2).map(name=>({name,term:t}));
 }).sort((a,b)=>b.name.length-a.name.length);
 const text=props.text||'',out=[],used=new Set();let at=0;
 for(let i=0;i<text.length;i++){
  const t=tokens.find(t=>!used.has(t.term.term)&&text.startsWith(t.name,i)&&(!/^[a-zA-Z]+$/.test(t.name)||(!/[a-zA-Z_]/.test(text[i-1]||'')&&!/[a-zA-Z_]/.test(text[i+t.name.length]||''))));
  if(!t)continue;
  if(i>at)out.push({text:text.slice(at,i)});
  out.push({text:t.name,term:t.term});used.add(t.term.term);at=i+t.name.length;i=at-1;
 }
 if(at<text.length)out.push({text:text.slice(at)});
 return out;
});
</script>
<template><span><template v-for="(part,i) in parts" :key="i"><template v-if="part.term"><button type="button" class="inline-term" :aria-expanded="active===i" @click="active=active===i?-1:i">{{part.text}}</button><span v-if="active===i" class="term-inline-card"><strong>{{part.term.term}}：</strong>{{part.term.meaning}} <small>例如 {{part.term.example}}</small></span></template><template v-else>{{part.text}}</template></template></span></template>
