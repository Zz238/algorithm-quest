<script setup>
import { computed, nextTick, ref, useId, watch, onUnmounted } from 'vue';
import { TERMS } from '../data/terms.js';
import { CODE_GUIDES } from '../data/code-guides.js';
import { runnableExample } from '../data/java-samples.js';
import { downloadText } from '../download.js';
import RunnableJava from './RunnableJava.vue';
import UiButton from './ui/UiButton.vue';

const props = defineProps({
  program: { type: Object, required: true },
  guideKey: String,
  title: { default: 'Java 逐行说明' },
  filename: { default: 'Solution.java' },
});
const guide = computed(() => CODE_GUIDES[props.guideKey]);
const example = computed(() => runnableExample(props.guideKey, props.program));
const line = ref(0),
  term = ref(''),
  status = ref(''),
  wrap = ref(true),
  full = ref(false),
  dialog = ref(null),
  source = ref(null);
const fullTarget = useId() + '-full-code',
  fullTitle = useId() + '-code-title';
const keywords = new Set([
  'public',
  'private',
  'class',
  'static',
  'void',
  'int',
  'boolean',
  'char',
  'if',
  'else',
  'for',
  'while',
  'return',
  'new',
  'import',
  'break',
  'continue',
]);
const tokens = computed(() =>
  props.program.lines.map(
    (s) => s.match(/\s+|\+\+|--|==|!=|<=|>=|&&|\|\||->|\+=|%=|[A-Za-z_][A-Za-z_0-9]*|\d+|./g) || [],
  ),
);
const words = computed(() => [...new Set(tokens.value[line.value].filter((t) => /\S/.test(t)))]);
const codeLine = computed(() => props.program.lines[line.value].trim());
const termInfo = computed(() => {
  if (
    ['<', '>'].includes(term.value) &&
    /(?:List|Map|Deque|Queue|ArrayList|HashMap|PriorityQueue)</.test(codeLine.value)
  ) {
    return ['泛型尖括号', '这里说明容器存什么类型。若尖括号为空，由编译器推断类型。', codeLine.value];
  }
  if (Object.hasOwn(TERMS, term.value)) return TERMS[term.value];
  if (/^\d+$/.test(term.value))
    return ['数字字面量', '这个数用于本行的赋值、边界或计算。', codeLine.value];
  return [
    '程序里的名字或符号',
    '名字通常由程序员定义。结合这一行的说明，看看这里用它来保存或读取什么。',
    codeLine.value,
  ];
});
watch(
  () => props.program,
  () => {
    line.value = 0;
    term.value = '';
    status.value = '';
    copied.value = false;
    clearTimeout(copyTimer);
  },
);
function choose(i, t = '') {
  line.value = i;
  term.value = t;
}
async function lineKey(event, i) {
  const target = { ArrowUp: i - 1, ArrowDown: i + 1, Home: 0, End: tokens.value.length - 1 }[event.key];
  if (target === undefined) return;
  event.preventDefault();
  choose(Math.max(0, Math.min(tokens.value.length - 1, target)));
  await nextTick();
  source.value?.querySelector('[data-line-button="' + line.value + '"]')?.focus();
}
const text = () => props.program.lines.join('\n');
const copied = ref(false);
let copyTimer;
function copiedFeedback() {
  copied.value = true;
  status.value = '已复制';
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => {
    copied.value = false;
  }, 2400);
}
onUnmounted(() => clearTimeout(copyTimer));
function download() {
  downloadText(props.filename, text() + '\n');
}
async function copy() {
  copied.value = false;
  clearTimeout(copyTimer);
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text());
      copiedFeedback();
      return;
    } catch {
      /* Fall back to a selectable field. */
    }
  }
  const box = document.createElement('textarea');
  box.value = text();
  box.readOnly = true;
  box.style.position = 'fixed';
  box.style.opacity = '0';
  const previous = document.activeElement;
  (full.value ? dialog.value : document.body).append(box);
  box.select();
  let didCopy = false;
  try {
    didCopy = document.execCommand('copy');
  } catch {
    /* Clipboard is not available. */
  }
  box.remove();
  previous?.focus({ preventScroll: true });
  if (didCopy) {
    copiedFeedback();
    return;
  }
  if (source.value) {
    const range = document.createRange();
    range.selectNodeContents(source.value);
    const selected = window.getSelection();
    selected?.removeAllRanges();
    selected?.addRange(range);
  }
  status.value = '浏览器未允许自动复制。可以手动复制选中的代码，或下载源码。';
}
function expand() {
  full.value = true;
  dialog.value.showModal();
}
</script>

<template>
  <section class="code-reader">
    <div class="section-bar">
      <h3>{{ title }}</h3>
      <div class="code-header-actions">
        <UiButton :icon="copied ? 'check' : 'copy'" @click="copy">复制</UiButton>
        <UiButton icon="download" @click="download">{{
          filename === 'Main.java' ? '下载示例' : '下载方法版'
        }}</UiButton>
        <small role="status">{{ status }}</small>
      </div>
    </div>
    <section v-if="guide" class="code-overview" aria-label="代码整体讲解">
      <span class="eyebrow">代码说明</span>
      <h4>这段代码要做什么？</h4>
      <p class="overview-goal">{{ guide.goal }}</p>
      <div class="overview-io">
        <p>
          <strong>输入</strong><span>{{ guide.input }}</span>
        </p>
        <p>
          <strong>输出</strong><span>{{ guide.output }}</span>
        </p>
      </div>
      <div class="overview-example">
        <h4>运行示例</h4>
        <p>{{ guide.example }}</p>
        <ol>
          <li v-for="(step, i) in guide.steps" :key="i">
            <b>{{ String(i + 1).padStart(2, '0') }}</b
            ><span>{{ step }}</span>
          </li>
        </ol>
      </div>
      <p class="overview-tip"><strong>理解重点：</strong>{{ guide.tip }}</p>
    </section>
    <p class="micro">点行号看这行的作用。键盘可用 ↑ / ↓ 切换行，也可以从讲解里选择术语。</p>
    <div class="code-tools study-actions">
      <button type="button" :aria-pressed="wrap" @click="wrap = !wrap">
        {{ wrap ? '关闭自动换行' : '开启自动换行' }}
      </button>
      <UiButton icon="expand" @click="expand">全屏阅读代码</UiButton>
    </div>
    <dialog ref="dialog" class="code-full-dialog" :aria-labelledby="fullTitle" @close="full = false">
      <div class="section-bar">
        <h2 :id="fullTitle">全屏阅读代码</h2>
        <div class="code-header-actions">
          <button @click="wrap = !wrap" :aria-pressed="wrap">
            {{ wrap ? '关闭自动换行' : '开启自动换行' }}
          </button>
          <UiButton :icon="copied ? 'check' : 'copy'" @click="copy">复制</UiButton>
          <UiButton icon="close" autofocus @click="dialog.close()">返回课程</UiButton>
          <small role="status">{{ status }}</small>
        </div>
      </div>
      <div :id="fullTarget"></div>
    </dialog>
    <Teleport :to="'#' + fullTarget" :disabled="!full">
      <div class="code-layout" :class="{ 'wrap-code': wrap }">
        <div ref="source" class="code-scroll" role="group" aria-label="Java 源码行">
          <div
            v-for="(parts, i) in tokens"
            :key="i"
            class="code-line"
            :class="{ selected: line === i }"
            :data-line="i + 1"
          >
            <button
              class="line-num"
              type="button"
              :data-line-button="i"
              :tabindex="line === i ? 0 : -1"
              :aria-current="line === i ? 'true' : undefined"
              :aria-label="'解释第 ' + (i + 1) + ' 行'"
              @keydown="lineKey($event, i)"
              @click="choose(i)"
            >
              {{ i + 1 }}
            </button>
            <code @click="choose(i)"
              ><template v-for="(t, j) in parts" :key="j"
                ><span
                  v-if="/\S/.test(t)"
                  class="token"
                  :class="{ keyword: keywords.has(t) }"
                  @click.stop="choose(i, t)"
                  >{{ t }}</span
                ><span v-else>{{ t }}</span></template
              ></code
            >
          </div>
        </div>
        <aside class="explanation-panel code-explain">
          <div aria-live="polite">
            <span class="eyebrow">第 {{ line + 1 }} 行讲解</span>
            <code class="selected-source">{{ codeLine || '（空行）' }}</code>
            <p>{{ program.notes[line] }}</p>
          </div>
          <label class="mini-output code-term-select"
            ><span>查这一行的术语或符号</span>
            <select v-model="term">
              <option value="">选择一个词</option>
              <option v-for="word in words" :key="word">{{ word }}</option>
            </select>
          </label>
          <div v-if="term" class="term-card">
            <strong
              >{{ term }} <small>{{ termInfo[0] }}</small></strong
            >
            <p>{{ termInfo[1] }}</p>
            <code>{{ termInfo[2] }}</code>
          </div>
        </aside>
      </div>
    </Teleport>
    <details v-if="example" class="study-details run-from-code">
      <summary>想实际运行？打开完整 Main.java</summary>
      <RunnableJava :source="example.source" :expected="example.expected" />
    </details>
  </section>
</template>
