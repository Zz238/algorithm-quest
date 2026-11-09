<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { TOPIC_TRACE_DEFAULTS, generateTopicTrace } from '../topic-traces.js';
import UiButton from './ui/UiButton.vue';
const props = defineProps({ topic: Object, draft: Object, target: Object, disabled: Boolean });
// The article owns this draft and remounts it for every account/topic.
const draft = props.draft;
const editable = !!TOPIC_TRACE_DEFAULTS[props.topic.id];
const values = reactive({ ...(draft.config || {}) });
const initial = editable ? generateTopicTrace(props.topic.id, draft.config) : props.topic.example;
const trace = ref(initial),
  error = ref('');
const index = computed({
  get: () => Math.max(0, Math.min(trace.value.steps.length - 1, draft.step)),
  set: (value) => {
    draft.step = Number(value);
  },
});
const frame = computed(() => trace.value.steps[index.value]);
if (props.target?.section === 'topic-example' && Number.isInteger(props.target.step))
  index.value = Math.min(trace.value.steps.length - 1, props.target.step);
const labels = {
  left: '左下标 l（含）',
  right: '右下标 r（含）',
  k: '窗口长度 k',
  at: '修改下标 at（从 0 起）',
  delta: '增加量 delta',
  end: '查询前 end 项',
};
const parameterKeys = Object.keys(TOPIC_TRACE_DEFAULTS[props.topic.id] || {}).filter(
  (k) => k !== 'array',
);
watch(
  () => draft.step,
  (value) => {
    if (value > trace.value.steps.length - 1) draft.step = trace.value.steps.length - 1;
  },
);
watch(
  () => draft.step,
  () => window.dispatchEvent(new Event('study-activity')),
  { flush: 'post' },
);
function apply() {
  error.value = '';
  try {
    const result = generateTopicTrace(props.topic.id, values);
    trace.value = result;
    Object.assign(draft.config, values);
    index.value = 0;
  } catch (e) {
    error.value = e.message;
  }
}
function cellLabel(i) {
  const id = props.topic.id;
  if (id === 'prefix-sum') return `prefix[${i}]`;
  if (id === 'fenwick-tree') return `tree[${i + 1}]`;
  if (id === 'selection-sort') return `a[${i}]`;
  if (id === 'counting-sort') return (frame.value.action.includes('输出') ? 'out' : 'count') + `[${i}]`;
  if (id === 'linear-dp') return i === 0 ? 'end' : 'best';
  if (id === 'monotonic-queue' || (id === 'monotonic-stack' && frame.value.action.startsWith('保存')))
    return '候选值 ' + (i + 1);
  if (id === 'monotonic-stack') return `答案[${i}]`;
  return '状态格 ' + (i + 1);
}
</script>
<template>
  <figure class="topic-trace" :data-trace="topic.id" :data-trace-step="index">
    <figcaption>
      <strong>{{ editable ? '修改输入，逐步验证' : '给定数据，逐步手算' }}</strong
      ><span>{{ index + 1 }} / {{ trace.steps.length }}</span>
    </figcaption>
    <form v-if="editable" class="topic-trace-inputs" @submit.prevent="apply">
      <label class="topic-array-field"
        >数组 a<input
          v-model="values.array"
          maxlength="200"
          :disabled="disabled"
          placeholder="用逗号分隔 1～12 个整数" /></label
      ><label v-for="key in parameterKeys" :key="key"
        >{{ labels[key]
        }}<input v-model="values[key]" type="number" step="1" :disabled="disabled" /></label
      ><UiButton type="submit" :disabled="disabled">应用输入，从头推演</UiButton>
    </form>
    <p v-if="error" class="mini-feedback error" role="alert">{{ error }}</p>
    <p class="topic-given"><strong>本次完整输入：</strong>{{ trace.input }}</p>
    <div class="topic-frame" aria-live="polite" aria-atomic="true">
      <span class="eyebrow">第 {{ index + 1 }} 步</span>
      <h3>{{ frame.action }}</h3>
      <p class="topic-state">{{ frame.state }}</p>
      <div
        v-if="frame.cells"
        class="topic-cells"
        :aria-label="'本步状态：' + JSON.stringify(frame.cells)"
      >
        <span v-for="(value, i) in frame.cells" :key="i"
          ><small>{{ cellLabel(i) }}</small
          ><b>{{ value }}</b></span
        ><em v-if="!frame.cells.length">当前为空</em>
      </div>
      <p><strong>为什么：</strong>{{ frame.reason }}</p>
    </div>
    <div class="study-actions topic-trace-controls">
      <UiButton :disabled="index === 0" @click="index--">← 上一条</UiButton
      ><UiButton variant="primary" :disabled="index === trace.steps.length - 1" @click="index++"
        >下一条 →</UiButton
      ><UiButton :disabled="index === 0" @click="index = 0">从头推演</UiButton>
    </div>
    <label class="topic-step-range"
      >定位步骤<input
        v-model="index"
        type="range"
        min="0"
        :max="trace.steps.length - 1"
        step="1"
        :aria-valuetext="'第 ' + (index + 1) + ' 步：' + frame.action"
    /></label>
    <details class="topic-trace-result">
      <summary>核对完整结果</summary>
      <p>{{ trace.resultText ?? trace.result }}</p>
    </details>
    <p class="micro">
      {{
        editable
          ? '每次应用输入后，步骤由实际算法重新生成。这里的可视化用于理解状态；Java 编程题另行运行测试。'
          : '这组步骤对应上面的固定数据；每一步都说明当时状态，不代表可以自动计算任意输入。'
      }}
    </p>
  </figure>
</template>
