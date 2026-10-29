<script setup>
import {ref,computed,watch,onUnmounted} from 'vue';
import {buildTrace,traceDefaults,parseTraceArray} from '../traces';
const props=defineProps({mode:String,plain:Boolean,variant:String});
const config=ref(traceDefaults(props.mode)),trace=ref(buildTrace(props.mode,{variant:props.variant})),at=ref(0),error=ref(''),playing=ref(false);let timer;
const arrayModes=['index','copy','swap','bubble','insertion','merge','quick','for','prefix','linear','binary','frequency','twoSum','stock','bruteStock','set'];
const frame=computed(()=>trace.value.frames[at.value]);
const positions=computed(()=>frame.value.kind==='tree'?[[260,30],[140,105],[380,105],[320,180],[440,180]]:[[70,100],[230,35],[230,175],[420,100]]);
const edges=computed(()=>frame.value.kind==='tree'?[[0,1],[0,2],[2,3],[2,4]]:[[0,1],[0,2],[1,3],[2,3]]);
const display=v=>typeof v==='string'?v:JSON.stringify(v);
function tileLabel(i){if(frame.value.labels)return frame.value.labels[i];const kind=frame.value.kind;if(kind==='stack')return i===frame.value.values.length-1?'栈顶':i===0?'栈底':'';if(kind==='linked')return '结点';if(kind==='queue')return i===0?'队首':i===frame.value.values.length-1?'队尾':'等待中';return ['dp','memo'].includes(props.mode)?`第${i+1}级 · ${props.mode==='memo'?'memo':'dp'}[${i+1}]`:`下标 ${i}`;}
function stop(){clearInterval(timer);playing.value=false;}
function apply(){stop();try{const input={...config.value,variant:props.variant};if(arrayModes.includes(props.mode))input.a=parseTraceArray(input.array);trace.value=buildTrace(props.mode,input);at.value=0;error.value='';}catch(e){error.value=e.message;}}
function next(step){stop();at.value=Math.max(0,Math.min(trace.value.frames.length-1,at.value+step));}
function play(){if(playing.value){stop();return;}if(at.value===trace.value.frames.length-1)at.value=0;playing.value=true;timer=setInterval(()=>{if(at.value<trace.value.frames.length-1)at.value++;else stop();},1800);}
watch(()=>props.mode,()=>{config.value=traceDefaults(props.mode);apply();});onUnmounted(stop);
</script>
<template>
<section class="trace-lab" aria-label="逐条操作实验">
  <div class="section-bar"><div><h3>逐条操作实验</h3><span class="micro">{{trace.title}}</span></div><span class="micro">{{at+1}} / {{trace.frames.length}}</span></div>
  <p class="trace-intro">先预测下一步，再点「下一条」。上方显示当前动作，图和变量栏显示该动作后的状态；复杂读取会拆成求下标、检查、读值的小动作。</p>
  <form v-if="arrayModes.includes(mode)||['recursion','dp','memo','condition','stack'].includes(mode)" class="trace-inputs" @submit.prevent="apply">
    <label v-if="arrayModes.includes(mode)">数组 a<input v-model="config.array" aria-label="实验数组a" placeholder="1,2,3"/></label>
    <label v-if="['index','copy'].includes(mode)">当前下标 i<input v-model.number="config.i" type="number" min="0" max="6" aria-label="实验下标i"/></label>
    <label v-if="['linear','binary','twoSum'].includes(mode)">目标 target<input v-model.number="config.target" type="number" aria-label="实验目标值"/></label>
    <label v-if="['recursion','dp','memo','condition'].includes(mode)">{{mode==='condition'?'输入 num':'输入 n'}}<input v-model.number="config.n" type="number" :min="['dp','memo'].includes(mode)?1:0" :max="mode==='condition'?99:8" aria-label="实验输入n"/></label>
    <label v-if="mode==='stack'">括号字符串<input v-model="config.text" aria-label="实验括号字符串"/></label>
    <button type="submit">应用输入并重来</button>
  </form>
  <p v-if="error" class="trace-error" role="alert">{{error}}</p>
  <div class="trace-current" aria-live="polite"><span class="eyebrow">当前动作 · 执行后的状态</span><h4>{{frame.statement}}</h4></div>
  <div class="trace-state">
    <svg v-if="['tree','graph'].includes(frame.kind)" viewBox="0 0 520 220" class="node-svg" role="img" :aria-label="frame.statement"><line v-for="(e,i) in edges" :key="i" :x1="positions[e[0]][0]" :y1="positions[e[0]][1]" :x2="positions[e[1]][0]" :y2="positions[e[1]][1]"/><g v-for="(v,i) in frame.values" :key="i" :class="{lit:frame.active.includes(i)}"><rect :x="positions[i][0]-21" :y="positions[i][1]-20" width="42" height="40"/><text :x="positions[i][0]" :y="positions[i][1]+6">{{v}}</text></g></svg>
    <div v-else class="trace-tiles" :class="frame.kind"><template v-for="(value,i) in frame.values" :key="i"><div class="trace-tile-wrap"><div class="trace-tile" :class="{active:frame.active.includes(i),excluded:frame.range&&(i<frame.range[0]||i>frame.range[1])}">{{value}}</div><small>{{tileLabel(i)}}</small></div><span v-if="frame.kind==='linked'&&i<frame.values.length-1" aria-hidden="true">→</span></template><p v-if="!frame.values.length" class="muted">当前为空</p></div>
    <dl v-if="Object.keys(frame.vars).length" class="trace-vars"><div v-for="(value,name) in frame.vars" :key="name"><dt>{{name}}</dt><dd>{{display(value)}}</dd></div></dl>
    <div v-if="frame.secondary" class="trace-secondary"><strong>{{frame.label}}</strong><div><code v-for="(v,i) in frame.secondary" :key="i">{{display(v)}}</code><span v-if="!frame.secondary.length">空</span></div></div>
    <p class="trace-why"><strong>为什么这样做：</strong>{{frame.why}}</p>
    <div v-if="frame.output!==undefined" class="trace-output" :class="{error:frame.error}"><strong>{{frame.error?'访问结果':'本次结果'}}</strong><code>{{display(frame.output)}}</code></div>
  </div>
  <div v-if="!plain" class="trace-code"><span class="micro">对应的小片段（理解操作顺序；完整程序见对应的 Java 示例）</span><div v-for="(line,i) in trace.code" :key="i" :class="{current:frame.line===i}"><span>{{i+1}}</span><code>{{line}}</code></div></div>
  <div class="trace-controls"><button @click="next(-1)" :disabled="at===0">← 上一条</button><button class="primary" @click="next(1)" :disabled="at===trace.frames.length-1">下一条 →</button><button @click="play">{{playing?'暂停':'自动播放'}}</button><button @click="stop();at=0">从头推演</button></div>
  <label class="timeline"><span>定位步骤</span><input type="range" min="0" :max="trace.frames.length-1" v-model.number="at" @input="stop" aria-label="逐条实验步骤"/></label>
</section>
</template>
