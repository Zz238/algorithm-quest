<script setup>
import {computed} from 'vue';
const props=defineProps({answer:null,modelValue:null,label:{type:String,default:'你的答案'}});
const emit=defineEmits(['update:modelValue']);
const values=computed(()=>Array.isArray(props.modelValue)&&props.modelValue.length?props.modelValue:['']);
const nested=computed(()=>Array.isArray(props.answer)&&props.answer.some(Array.isArray));
function edit(i,value){const xs=[...values.value];xs[i]=value;emit('update:modelValue',xs);}
function add(){if(values.value.length<36)emit('update:modelValue',[...values.value,'']);}
function remove(i){const xs=values.value.filter((_,j)=>j!==i);emit('update:modelValue',xs.length?xs:['']);}
</script>
<template>
 <div v-if="typeof answer==='boolean'" class="answer-switch" role="group" :aria-label="label">
  <button type="button" v-for="v in [true,false]" :key="String(v)" :aria-pressed="modelValue===v" @click="emit('update:modelValue',v)">{{v?'是':'否'}}</button>
 </div>
 <div v-else-if="Array.isArray(answer)" class="answer-list" role="group" :aria-label="label">
  <p class="micro">{{nested?'每组占一行，数字之间用逗号分开；没有元素的组写“空集”。':'每格填写一个数；也可将一串数字用逗号分开放进同一格。'}}</p>
  <div class="answer-cells" :class="{nested}">
   <label v-for="(value,i) in values" :key="i"><span>{{nested?'第 '+(i+1)+' 组':'第 '+(i+1)+' 格'}}</span><span class="answer-cell"><input :value="value" type="text" :inputmode="nested?'text':'decimal'" :maxlength="350" :placeholder="nested?'例如 1, 2':'填数字'" :aria-label="label+'，第 '+(i+1)+(nested?' 组':' 格')" @input="edit(i,$event.target.value)"/><button v-if="values.length>1" type="button" class="answer-remove" :aria-label="'移除第 '+(i+1)+(nested?' 组':' 格')" @click.prevent="remove(i)">×</button></span></label>
  </div>
  <button type="button" :disabled="values.length>=36" @click="add">{{nested?'添加一组':'添加一格'}}</button>
 </div>
 <label v-else class="mini-output"><span>{{label}}</span><input :value="modelValue??''" type="text" :inputmode="typeof answer==='number'?'decimal':'text'" maxlength="800" :placeholder="typeof answer==='number'?'例如：3':'直接填写文字'" @input="emit('update:modelValue',$event.target.value)"/></label>
</template>
