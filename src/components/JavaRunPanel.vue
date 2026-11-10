<script setup>
import { computed, onUnmounted, ref, watch } from 'vue';
import UiButton from './ui/UiButton.vue';
import UiStatus from './ui/UiStatus.vue';
import { explainJavaError, parseCaseOutput } from '../java/feedback.js';
const props = defineProps({
  source: String,
  sampleSource: String,
  entryClass: { type: String, default: 'Main' },
  sampleEntryClass: { type: String, default: 'Main' },
  sampleJudged: { type: Boolean, default: true },
  stdin: { type: String, default: '' },
  lineOffset: { type: Number, default: 0 },
  editableLines: Number,
  disabled: Boolean,
  judged: Boolean,
});
const emit = defineEmits(['result', 'diagnostics', 'locate']);
const busy = ref(false),
  phase = ref(''),
  result = ref(null),
  failure = ref('');
const completedAll = ref(true);
const judgedResult = computed(() => props.judged && (completedAll.value || props.sampleJudged));
let engine,
  runToken = 0;
const messages = {
  loading: '首次加载 Java 17 环境，之后浏览器会缓存运行资源…',
  compiling: '正在真实编译 Java…',
  running: '正在执行你的代码…',
};
const parsed = computed(() => parseCaseOutput(result.value?.stdout));
const diagnostic = computed(() => result.value?.diagnostics?.filter((d) => d.kind === 'ERROR') || []);
watch(
  () => [props.source, props.sampleSource, props.stdin, props.entryClass, props.sampleEntryClass],
  () => {
    emit('diagnostics', []);
    if (!busy.value) {
      result.value = null;
      failure.value = '';
    }
  },
);
async function execute(all = true) {
  if (busy.value || props.disabled) return;
  busy.value = true;
  emit('diagnostics', []);
  result.value = null;
  failure.value = '';
  phase.value = 'loading';
  const token = ++runToken;
  const source = !all && props.sampleSource ? props.sampleSource : props.source,
    stdin = props.stdin,
    entryClass = !all && props.sampleSource ? props.sampleEntryClass : props.entryClass;
  try {
    if (!engine) {
      const { createJavaSandbox } = await import('../java/sandbox.js');
      if (token !== runToken) return;
      engine = createJavaSandbox({
        onStatus: (value) => {
          phase.value = value;
        },
      });
    }
    const response = await engine.run({ source, stdin, entryClass });
    if (token !== runToken) return;
    if (
      source !== (!all && props.sampleSource ? props.sampleSource : props.source) ||
      stdin !== props.stdin ||
      entryClass !== (!all && props.sampleSource ? props.sampleEntryClass : props.entryClass)
    ) {
      failure.value = '运行期间代码或输入已更改，本次结果未计入。请重新运行当前版本。';
      return;
    }
    result.value = response;
    completedAll.value = all;
    emit('diagnostics', response.diagnostics || []);
    emit('result', { ...result.value, ...parsed.value, all });
  } catch (error) {
    if (token === runToken) {
      failure.value = error.message;
      emit('result', { state: 'stopped', error: error.message, cases: [], all });
    }
  } finally {
    if (token === runToken) {
      busy.value = false;
      phase.value = '';
    }
  }
}
function stop() {
  runToken++;
  engine?.stop();
  busy.value = false;
  phase.value = '';
  failure.value = '已停止运行。代码草稿保留。';
}
onUnmounted(() => {
  runToken++;
  engine?.dispose();
});
defineExpose({ execute });
function editorLine(d) {
  const line = d.line - props.lineOffset;
  return line > 0 && line <= (props.editableLines || props.source.split('\n').length) ? line : null;
}
</script>
<template>
  <section class="java-run-panel" aria-label="Java 运行与判题">
    <div class="study-actions">
      <UiButton v-if="sampleSource" icon="play" :disabled="busy || disabled" @click="execute(false)"
        >运行示例</UiButton
      >
      <UiButton
        variant="primary"
        :icon="busy ? 'pause' : 'play'"
        :loading="busy"
        :disabled="disabled"
        @click="execute(true)"
        >{{ judged ? '提交全部测试' : '运行 Java' }}</UiButton
      >
      <UiButton v-if="busy" icon="close" @click="stop">停止运行</UiButton>
    </div>
    <UiStatus v-if="busy" :loading="true" kind="waiting">{{
      messages[phase] || messages.loading
    }}</UiStatus>
    <p class="micro">
      Built with <a href="https://cheerpj.com/" target="_blank" rel="noopener">CheerpJ ↗</a> · Java
      在当前浏览器的隔离环境中运行；首次加载需要联网。代码不会发送给判题服务器。执行阶段最多 5
      秒，输出最多 16 KB。
    </p>
    <div v-if="failure" class="coding-feedback is-error" role="alert">{{ failure }}</div>
    <div v-if="result" class="coding-result" aria-live="polite">
      <p
        :class="[
          'coding-feedback',
          result.state === 'finished' &&
          (!judgedResult || (parsed.cases.length && parsed.cases.every((c) => c.ok)))
            ? 'is-success'
            : 'is-error',
        ]"
      >
        {{
          result.state === 'finished'
            ? judgedResult && parsed.cases.length
              ? `测试通过 ${parsed.cases.filter((c) => c.ok).length} / ${parsed.cases.length}`
              : judgedResult
                ? '程序结束，但没有完成有效测试。请检查是否提前退出或改动了测试框架。'
                : '程序已执行完成'
            : result.state === 'compile-error'
              ? '编译未通过，请修正后重试'
              : '运行中发生错误'
        }}
      </p>
      <ol v-if="diagnostic.length" class="java-diagnostics">
        <li v-for="(d, i) in diagnostic" :key="i">
          <button
            v-if="editorLine(d)"
            type="button"
            class="diagnostic-location text-button"
            @click="emit('locate', d)"
          >
            定位编辑区第 {{ editorLine(d) }} 行 →
          </button>
          <strong v-else>程序框架第 {{ d.line }} 行</strong><code>{{ d.message }}</code>
          <p>{{ explainJavaError(d.message) }}</p>
        </li>
      </ol>
      <div v-if="result.error" class="coding-feedback is-error">
        <code>{{ result.error }}</code>
        <p>{{ explainJavaError(result.error) }}</p>
      </div>
      <div v-if="parsed.cases.length" class="coding-case-list">
        <div v-for="item in parsed.cases" :key="item.id" :class="['coding-case', { failed: !item.ok }]">
          <strong>{{ item.ok ? '✓ 通过' : '✕ 待修正' }} · 用例 {{ item.id }}</strong
          ><code>{{ item.input }}</code
          ><span
            >预期：{{ JSON.stringify(item.expected) }}　实际：{{ JSON.stringify(item.actual) }}</span
          >
        </div>
      </div>
      <div v-if="parsed.output || result.stderr">
        <h3>程序输出</h3>
        <pre
          class="study-code"
        ><code>{{ parsed.output }}{{ result.stderr ? '\n' + result.stderr : '' }}</code></pre>
      </div>
    </div>
  </section>
</template>
