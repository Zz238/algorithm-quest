<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { buildTrace, traceDefaults, parseTraceArray } from '../traces';
import { useStudyDraft, writeDraft, draftKey, browserStorage } from '../study-drafts.js';
import { nextPrediction } from '../trace-prediction.js';
import TracePicture from './TracePicture.vue';
import UiButton from './ui/UiButton.vue';
import UiSegments from './ui/UiSegments.vue';
import { frameChanges, phaseLabel, phaseStops, tracePresets } from '../trace-tools.js';
const props = defineProps({
  mode: String,
  plain: Boolean,
  variant: String,
  initial: Object,
  topic: String,
  owner: String,
  codeAvailable: { type: Boolean, default: true },
  comparison: Boolean,
  allowEdit: { type: Boolean, default: true },
  location: Object,
});
const emit = defineEmits(['note']);
const arrayModes = [
  'index',
  'copy',
  'swap',
  'bubble',
  'insertion',
  'merge',
  'quick',
  'for',
  'prefix',
  'linear',
  'binary',
  'frequency',
  'twoSum',
  'stock',
  'bruteStock',
  'set',
];
const initial = () => ({ ...traceDefaults(props.mode), ...props.initial });
function cleanConfig(raw) {
  const config = initial();
  for (const key of ['array', 'text', 'i', 'target', 'n', 'order']) {
    const v = raw?.[key];
    if (key === 'order' && !['preorder', 'inorder', 'postorder'].includes(v)) continue;
    if ((typeof v === 'string' && v.length <= 100) || (typeof v === 'number' && Number.isFinite(v)))
      config[key] = v;
  }
  return config;
}
const draft = useStudyDraft(props.owner, props.topic || 'temporary-' + props.mode, 'trace', (raw) => ({
  input: props.location?.example ? initial() : cleanConfig(props.location?.input || raw?.input),
  applied: props.location?.example ? initial() : cleanConfig(props.location?.input || raw?.applied),
  step: props.location?.step ?? (Number.isInteger(raw?.step) ? raw.step : 0),
  predict: !!raw?.predict,
  code: !!raw?.code,
  speed: [0.5, 1, 2].includes(raw?.speed) ? raw.speed : 1,
}));
function make(config) {
  const input = { ...config, variant: props.variant };
  if (arrayModes.includes(props.mode) && !Array.isArray(input.a))
    input.a = parseTraceArray(String(input.array));
  return buildTrace(props.mode, input);
}
let first;
try {
  first = make(draft.applied);
} catch {
  draft.applied = initial();
  first = make(draft.applied);
}
const config = ref(draft.input),
  trace = ref(first),
  at = ref(Math.max(0, Math.min(draft.step, first.frames.length - 1))),
  error = ref(''),
  playing = ref(false);
let timer;
const guess = ref(''),
  predictionFeedback = ref(''),
  predicted = ref(false);
const prediction = computed(() => (draft.predict ? nextPrediction(trace.value, at.value) : null));
const showCode = computed(
  () => trace.value.code.length && props.codeAvailable && (!props.plain || draft.code),
);
watch(at, (v) => {
  draft.step = v;
  guess.value = '';
  predicted.value = false;
  predictionFeedback.value = '';
});
watch(
  () => draft.predict,
  (v) => {
    if (v) stop();
    guess.value = '';
    predicted.value = false;
    predictionFeedback.value = '';
  },
);
function predictNext() {
  if (!guess.value || !prediction.value) return;
  predicted.value = guess.value === prediction.value.answer;
  predictionFeedback.value = predicted.value
    ? '预测正确。点“下一条”查看实际变化。'
    : '再看当前状态和这一轮的边界。需要时可以切回自由推演。';
}
const frame = computed(() => trace.value.frames[at.value]);
const changes = computed(() => frameChanges(trace.value.frames[at.value - 1], frame.value));
const phases = computed(() => phaseStops(props.mode, trace.value.frames));
const presets = computed(() => tracePresets(props.mode));
const display = (v) => (typeof v === 'string' ? v : JSON.stringify(v));
function showExampleStep(index) {
  stop();
  config.value = initial();
  draft.input = config.value;
  apply();
  at.value = Math.max(0, Math.min(index, trace.value.frames.length - 1));
  draft.step = at.value;
}
defineExpose({ showExampleStep });
function changeOrder(order) {
  config.value.order = order;
  apply();
}
function stop() {
  clearInterval(timer);
  playing.value = false;
}
function apply() {
  stop();
  try {
    trace.value = make(config.value);
    draft.applied = cleanConfig(config.value);
    at.value = 0;
    draft.step = 0;
    error.value = '';
    guess.value = '';
    predicted.value = false;
    predictionFeedback.value = '';
  } catch (e) {
    error.value = e.message;
  }
}
function next(step) {
  stop();
  if (step > 0 && prediction.value && !predicted.value) return;
  at.value = Math.max(0, Math.min(trace.value.frames.length - 1, at.value + step));
}
function play() {
  if (draft.predict) return;
  if (playing.value) {
    stop();
    return;
  }
  if (at.value === trace.value.frames.length - 1) at.value = 0;
  playing.value = true;
  timer = setInterval(() => {
    if (at.value < trace.value.frames.length - 1) at.value++;
    else stop();
  }, 1800 / draft.speed);
}
watch(
  () => draft.speed,
  () => {
    if (playing.value) {
      stop();
      play();
    }
  },
);
watch(at, () => window.dispatchEvent(new Event('study-activity')), { flush: 'post' });
function preset(input) {
  Object.assign(config.value, initial(), input);
  apply();
}
function locate(index) {
  stop();
  if (!draft.predict) at.value = Number(index);
}
function keyboard(event) {
  if (
    event.target.closest('button,input,textarea,select,a,[contenteditable]') ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.isComposing
  )
    return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    next(event.key === 'ArrowRight' ? 1 : -1);
  }
  if (event.key === ' ' && !draft.predict) {
    event.preventDefault();
    play();
  }
}
watch(
  () => [props.mode, props.initial, props.variant],
  () => {
    config.value = initial();
    draft.input = config.value;
    apply();
  },
);
onUnmounted(stop);
onMounted(() => {
  if (props.location)
    writeDraft(
      draftKey(props.owner, props.topic || 'temporary-' + props.mode, 'trace'),
      draft,
      browserStorage(),
    );
});
</script>
<template>
  <section
    class="trace-lab"
    aria-label="逐条操作实验"
    :data-trace-step="at"
    tabindex="0"
    @keydown="keyboard"
  >
    <div class="section-bar">
      <div>
        <h3>逐条操作实验</h3>
        <span class="micro">{{ trace.title }}</span>
      </div>
      <span class="micro">{{ at + 1 }} / {{ trace.frames.length }}</span>
    </div>
    <p class="trace-intro">每次只看一个动作。图和变量栏显示的是这一步执行后的状态。</p>
    <div class="trace-mode study-actions">
      <UiSegments
        v-model="draft.predict"
        label="实验推演模式"
        :options="[
          { value: false, label: '自由推演' },
          { value: true, label: '先预测再走' },
        ]"
      />
      <UiButton
        v-if="plain && codeAvailable && trace.code.length"
        type="button"
        variant="ghost"
        :icon="draft.code ? 'close' : 'code'"
        :aria-pressed="draft.code"
        @click="draft.code = !draft.code"
      >
        {{ draft.code ? '收起联动代码' : '看对应代码' }}
      </UiButton>
    </div>
    <UiSegments
      v-if="comparison"
      class="trace-orders"
      :model-value="config.order || 'preorder'"
      label="二叉树遍历顺序"
      :options="[
        { value: 'preorder', label: '前序 · 根左右' },
        { value: 'inorder', label: '中序 · 左根右' },
        { value: 'postorder', label: '后序 · 左右根' },
      ]"
      @update:model-value="changeOrder"
    />
    <p v-if="comparison" class="trace-intro">
      三种顺序用同一棵树。切换后，访问步骤和下方的小段代码会一起改变；完整 Java 示例以默认的前序为例。
    </p>
    <form
      v-if="
        allowEdit &&
        (arrayModes.includes(mode) ||
          ['recursion', 'dp', 'memo', 'condition', 'reduce', 'stack'].includes(mode))
      "
      class="trace-inputs"
      @submit.prevent="apply"
    >
      <label v-if="arrayModes.includes(mode)"
        >数组 a<input v-model="config.array" aria-label="实验数组a" placeholder="1,2,3"
      /></label>
      <label v-if="['index', 'copy'].includes(mode)"
        >当前下标 i<input v-model.number="config.i" type="number" min="0" max="6" aria-label="实验下标i"
      /></label>
      <label v-if="['linear', 'binary', 'twoSum'].includes(mode)"
        >目标 target<input v-model.number="config.target" type="number" aria-label="实验目标值"
      /></label>
      <label v-if="['recursion', 'dp', 'memo', 'condition', 'reduce'].includes(mode)"
        >{{ ['condition', 'reduce'].includes(mode) ? '输入 num' : '输入 n'
        }}<input
          v-model.number="config.n"
          type="number"
          :min="['dp', 'memo'].includes(mode) ? 1 : 0"
          :max="['condition', 'reduce'].includes(mode) ? 99 : 8"
          aria-label="实验输入n"
      /></label>
      <label v-if="mode === 'stack'"
        >括号字符串<input v-model="config.text" aria-label="实验括号字符串"
      /></label>
      <UiButton type="submit" icon="restart">应用输入并重来</UiButton>
    </form>
    <div v-if="allowEdit && presets.length" class="trace-presets">
      <span>换个小输入验证：</span
      ><button v-for="[name, input] in presets" :key="name" type="button" @click="preset(input)">
        {{ name }}
      </button>
    </div>
    <p v-if="error" class="trace-error" role="alert">{{ error }}</p>
    <div class="trace-current" :aria-live="playing ? 'off' : 'polite'">
      <span class="eyebrow">当前动作 · 执行后的状态</span>
      <h4>{{ frame.statement }}</h4>
      <span v-if="phaseLabel(mode, frame)" class="trace-phase">{{ phaseLabel(mode, frame) }}</span>
    </div>
    <div v-if="changes.length" class="trace-changes" aria-label="本步的变化">
      <span v-for="change in changes" :key="change.name"
        ><b>{{ change.name }}</b> <code>{{ change.before }} → {{ change.after }}</code></span
      >
    </div>
    <div class="trace-state">
      <TracePicture :frame="frame" :mode="mode" />
      <p v-if="frame.stack?.length" class="trace-stack-path">
        <strong>调用栈（最右是当前层）：</strong> <code>{{ frame.stack.join(' → ') }}</code>
      </p>
      <p v-if="frame.groups?.length" class="trace-stack-path">
        <strong>两段下标：</strong>
        <code>{{ frame.groups.map((x) => '[' + x.join(', ') + ']').join(' 与 ') }}</code>
      </p>
      <dl v-if="Object.keys(frame.vars).length" class="trace-vars">
        <div v-for="(value, name) in frame.vars" :key="name">
          <dt>{{ name }}</dt>
          <dd>{{ display(value) }}</dd>
        </div>
      </dl>
      <div v-if="frame.secondary" class="trace-secondary">
        <strong>{{ frame.label }}</strong>
        <div>
          <code v-for="(v, i) in frame.secondary" :key="i">{{ display(v) }}</code
          ><span v-if="!frame.secondary.length">空</span>
        </div>
      </div>
      <p class="trace-why"><strong>为什么这样做：</strong>{{ frame.why }}</p>
      <div v-if="frame.output !== undefined" class="trace-output" :class="{ error: frame.error }">
        <strong>{{ frame.error ? '访问结果' : '本次结果' }}</strong
        ><code>{{ display(frame.output) }}</code>
      </div>
    </div>
    <div v-if="showCode" class="trace-code">
      <span class="micro">对应的小片段（理解操作顺序；完整程序见对应的 Java 示例）</span>
      <div v-for="(line, i) in trace.code" :key="i" :class="{ current: frame.line === i }">
        <span>{{ i + 1 }}</span
        ><code>{{ line }}</code>
      </div>
    </div>
    <div v-if="prediction" class="trace-prediction">
      <strong>{{ prediction.prompt }}</strong>
      <div class="study-actions" role="group" aria-label="下一步的预测">
        <button
          v-for="choice in prediction.options"
          :key="choice"
          type="button"
          :aria-pressed="guess === choice"
          @click="
            guess = choice;
            predicted = false;
            predictionFeedback = '';
          "
        >
          {{ choice }}
        </button>
      </div>
      <button type="button" :disabled="!guess || predicted" @click="predictNext">核对预测</button>
      <p v-if="predictionFeedback" role="status">{{ predictionFeedback }}</p>
    </div>
    <div class="trace-controls">
      <UiButton icon="previous" @click="next(-1)" :disabled="at === 0">上一条</UiButton>
      <UiButton
        variant="primary"
        trailing-icon="next"
        @click="next(1)"
        :disabled="at === trace.frames.length - 1 || (prediction && !predicted)"
      >
        下一条</UiButton
      >
      <UiButton
        :icon="playing ? 'pause' : 'play'"
        :aria-pressed="playing"
        @click="play"
        :disabled="draft.predict"
        >{{ playing ? '暂停' : '自动播放' }}</UiButton
      >
      <UiButton
        icon="restart"
        @click="
          stop();
          at = 0;
        "
      >
        从头推演
      </UiButton>
      <label class="trace-speed"
        >播放速度
        <select v-model.number="draft.speed" aria-label="实验播放速度">
          <option :value="0.5">0.5×</option>
          <option :value="1">1×</option>
          <option :value="2">2×</option>
        </select></label
      >
    </div>
    <div class="trace-tools study-actions">
      <label v-if="phases.length"
        >阶段定位
        <select
          aria-label="实验阶段定位"
          :disabled="draft.predict"
          @change="locate($event.target.value)"
        >
          <option value="" selected disabled>跳到某阶段的第一次出现</option>
          <option v-for="item in phases" :key="item.index" :value="item.index">
            第 {{ item.index + 1 }} 步 · {{ item.name }}
          </option>
        </select></label
      ><button
        v-if="topic"
        class="text-button"
        type="button"
        @click="
          emit('note', {
            section: 'lesson-experiment',
            step: at,
            input: cleanConfig(draft.applied),
            label: '实验第 ' + (at + 1) + ' 步',
            prompt: '这一步：' + frame.statement + '\n我的理解：',
          })
        "
      >
        记下当前这一步
      </button>
    </div>
    <label class="timeline"
      ><span>定位步骤</span
      ><input
        type="range"
        min="0"
        :max="trace.frames.length - 1"
        v-model.number="at"
        :disabled="draft.predict"
        @input="stop"
        aria-label="逐条实验步骤"
    /></label>
    <p class="trace-keyboard micro">聚焦实验区后，← / → 单步，空格播放或暂停；输入框内照常输入。</p>
  </section>
</template>
