<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { javaEditorDiagnostics } from '../java/editor-support.js';
import { useReadingDevice } from '../java/device-policy.js';
import ReadonlyJava from './ReadonlyJava.vue';
const readingDevice = useReadingDevice();
const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, required: true },
  context: { type: String, default: '' },
  maxlength: { type: Number, default: 12000 },
  disabled: Boolean,
  diagnostics: { type: Array, default: () => [] },
  lineOffset: { type: Number, default: 0 },
});
const emit = defineEmits(['update:modelValue', 'run']);
const shell = ref(null),
  host = ref(null),
  fallback = ref(null),
  ready = ref(false),
  loading = ref(false),
  issue = ref(''),
  expanded = ref(false),
  wrap = ref(true),
  fontSize = ref(16),
  dark = ref(document.documentElement.dataset.theme === 'dark'),
  cursor = ref({ lineNumber: 1, column: 1 });
const offline = import.meta.env.MODE === 'offline' || location.protocol === 'file:';
const simple = ref(offline || window.matchMedia('(max-width:600px)').matches);
const mode = computed(() => (ready.value && !simple.value ? 'monaco' : 'simple'));
let editor,
  model,
  monaco,
  observer,
  resizeObserver,
  themeObserver,
  disposed = false,
  composing = false;
const disposables = [];
const text = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value.slice(0, props.maxlength)),
});
function markers() {
  if (!model) return;
  const points = javaEditorDiagnostics(props.diagnostics, props.modelValue, props.lineOffset);
  monaco.editor.setModelMarkers(
    model,
    'java-compiler',
    points.map((p) => ({
      startLineNumber: p.line,
      endLineNumber: p.line,
      startColumn: p.column,
      endColumn:
        model.getWordAtPosition({ lineNumber: p.line, column: p.column })?.endColumn || p.column + 1,
      message: p.message,
      severity: p.severity === 'error' ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
      source: 'Java 编译器',
    })),
  );
}
async function start() {
  if (readingDevice.value || offline || simple.value || ready.value || loading.value || disposed) return;
  loading.value = true;
  issue.value = '';
  try {
    const { createJavaEditor } = await import('../java/monaco-java.js');
    if (disposed || simple.value || readingDevice.value) return;
    if (composing) {
      issue.value = '输入结束后可启用专业编辑器。';
      return;
    }
    const focused = document.activeElement === fallback.value,
      selection = fallback.value?.selectionStart || 0;
    const api = createJavaEditor(
      host.value,
      {
        value: props.modelValue,
        ariaLabel: props.label,
        readOnly: props.disabled,
        fontSize: fontSize.value,
        fontFamily: 'Consolas, "SFMono-Regular", Menlo, monospace',
        lineHeight: 26,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: false,
        wordWrap: wrap.value ? 'on' : 'off',
        tabSize: 4,
        insertSpaces: true,
        detectIndentation: false,
        autoIndent: 'full',
        autoClosingBrackets: 'always',
        autoClosingQuotes: 'always',
        bracketPairColorization: { enabled: true },
        renderLineHighlight: 'line',
        theme: dark.value ? 'vs-dark' : 'vs',
        padding: { top: 16, bottom: 16 },
        lineNumbersMinChars: 3,
        stickyScroll: { enabled: false },
        scrollbar: { alwaysConsumeMouseWheel: false },
        suggest: { showWords: false },
        wordBasedSuggestions: 'off',
        quickSuggestions: { other: true, comments: false, strings: false },
        tabCompletion: 'on',
        fixedOverflowWidgets: false,
        accessibilitySupport: 'auto',
        editContext: false,
      },
      props.context,
    );
    ({ editor, model, monaco } = api);
    disposables.push(
      editor.onDidChangeModelContent(() => {
        const value = model.getValue();
        if (value.length > props.maxlength) {
          const at = model.getPositionAt(props.maxlength),
            end = model.getPositionAt(value.length);
          model.applyEdits([
            { range: new monaco.Range(at.lineNumber, at.column, end.lineNumber, end.column), text: '' },
          ]);
          issue.value = '最多输入 ' + props.maxlength + ' 个字符，超出的部分未保留。';
          return;
        }
        emit('update:modelValue', value);
      }),
    );
    disposables.push(
      editor.onDidChangeCursorPosition((event) => {
        cursor.value = event.position;
      }),
    );
    disposables.push(
      editor.addAction({
        id: 'quest.run.java',
        label: '运行当前 Java',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
        run: () => {
          if (!props.disabled) emit('run');
        },
      }),
    );
    ready.value = true;
    await nextTick();
    if (disposed) return;
    editor.layout();
    markers();
    resizeObserver = new ResizeObserver(() => editor?.layout());
    resizeObserver.observe(host.value);
    if (focused) {
      editor.setPosition(model.getPositionAt(selection));
      editor.focus();
    }
  } catch {
    issue.value = '专业编辑器未能加载，已保留简易编辑和全部草稿。可重试。';
  } finally {
    loading.value = false;
  }
}
async function toggleMode() {
  simple.value = !simple.value;
  if (!simple.value) {
    await start();
    await nextTick();
    editor?.layout();
  }
}
function locate(diagnostic) {
  const point = javaEditorDiagnostics([diagnostic], props.modelValue, props.lineOffset)[0];
  if (!point) return;
  if (mode.value === 'monaco') {
    editor.setPosition({ lineNumber: point.line, column: point.column });
    editor.revealLineInCenter(point.line);
    editor.focus();
  } else {
    const at =
      props.modelValue
        .split('\n')
        .slice(0, point.line - 1)
        .reduce((n, line) => n + line.length + 1, 0) +
      point.column -
      1;
    fallback.value?.focus();
    fallback.value?.setSelectionRange(at, at);
  }
  shell.value?.scrollIntoView({
    block: 'center',
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  });
}
watch(
  () => props.modelValue,
  (value) => {
    if (model && model.getValue() !== value) {
      editor.executeEdits('external-update', [{ range: model.getFullModelRange(), text: value }]);
      editor.pushUndoStop();
    }
    markers();
  },
);
watch(() => props.diagnostics, markers, { deep: true });
watch(
  () => props.disabled,
  (value) => editor?.updateOptions({ readOnly: value }),
);
watch([wrap, fontSize, dark], () =>
  editor?.updateOptions({
    wordWrap: wrap.value ? 'on' : 'off',
    fontSize: fontSize.value,
    theme: dark.value ? 'vs-dark' : 'vs',
  }),
);
watch([expanded, simple], async () => {
  await nextTick();
  editor?.layout();
});
watch(readingDevice, async (reading) => {
  observer?.disconnect();
  if (reading) {
    resizeObserver?.disconnect();
    for (const d of disposables.splice(0)) d.dispose();
    editor?.dispose();
    model?.dispose();
    editor = null;
    model = null;
    ready.value = false;
  } else {
    await nextTick();
    if (!offline && !simple.value) await start();
  }
});
onMounted(() => {
  themeObserver = new MutationObserver(() => {
    dark.value = document.documentElement.dataset.theme === 'dark';
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if (!readingDevice.value && !offline && !simple.value) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          start();
        }
      },
      { rootMargin: '150px' },
    );
    observer.observe(shell.value);
  }
});
onUnmounted(() => {
  disposed = true;
  observer?.disconnect();
  themeObserver?.disconnect();
  resizeObserver?.disconnect();
  for (const d of disposables) d.dispose();
  editor?.dispose();
  model?.dispose();
});
defineExpose({ locate });
</script>
<template>
  <section
    v-if="!readingDevice"
    ref="shell"
    class="java-code-editor"
    :class="{ 'is-expanded': expanded, 'is-dark': dark }"
    :data-editor-mode="mode"
    :aria-label="label + '编辑区'"
  >
    <header class="java-editor-toolbar">
      <div><strong>Main.java</strong><span>Java 17</span></div>
      <div class="java-editor-tools">
        <label
          >字号<select v-model.number="fontSize">
            <option :value="14">14</option>
            <option :value="16">16</option>
            <option :value="18">18</option>
            <option :value="20">20</option>
          </select></label
        ><button type="button" :aria-pressed="wrap" @click="wrap = !wrap">自动换行</button
        ><button type="button" :aria-pressed="dark" @click="dark = !dark">
          {{ dark ? '浅色' : '深色' }}</button
        ><button type="button" :aria-expanded="expanded" @click="expanded = !expanded">
          {{ expanded ? '收起编辑区' : '放大编辑区' }}
        </button>
      </div>
    </header>
    <p class="java-editor-label">{{ label }}</p>
    <div class="java-editor-surface" :style="{ '--editor-font-size': fontSize + 'px' }">
      <div v-show="mode === 'monaco'" ref="host" class="monaco-host"></div>
      <textarea
        v-if="mode !== 'monaco'"
        ref="fallback"
        v-model="text"
        :aria-label="label"
        :maxlength="maxlength"
        :disabled="disabled"
        spellcheck="false"
        autocapitalize="off"
        autocomplete="off"
        :wrap="wrap ? 'soft' : 'off'"
        @compositionstart="composing = true"
        @compositionend="composing = false"
        @keydown.ctrl.enter.prevent="emit('run')"
        @keydown.meta.enter.prevent="emit('run')"
      />
    </div>
    <footer class="java-editor-status">
      <span
        >{{
          mode === 'monaco'
            ? 'Monaco · 第 ' + cursor.lineNumber + ' 行，第 ' + cursor.column + ' 列'
            : loading
              ? '正在加载专业编辑器…'
              : '简易编辑'
        }}
        · {{ modelValue.length }} / {{ maxlength }}</span
      ><button v-if="!offline" type="button" class="text-button" @click="toggleMode">
        {{ simple ? '启用专业编辑' : '简易编辑' }}
      </button>
    </footer>
    <p v-if="issue" class="java-editor-message" role="status">
      {{ issue }} <button v-if="!ready && !simple" type="button" @click="start">重试加载</button>
    </p>
    <details class="java-editor-help">
      <summary>编辑快捷键与提示</summary>
      <p>
        Ctrl/⌘ + Enter 运行；Ctrl + Space 打开补全；Ctrl/⌘ + F 查找；Ctrl/⌘ + / 注释；Ctrl/⌘ + Z
        撤销。Tab 缩进；Windows/Linux 按 Ctrl + M、macOS 按 Ctrl + Shift + M 切换 Tab 为焦点导航。
      </p>
      <p>
        输入 fori、foreach 或 sout 可选用常用片段。常用 Java
        提示帮助书写；类型和语法错误以运行后的真实编译结果为准。触屏设备使用只读代码与手算练习。
      </p>
    </details>
  </section>
  <ReadonlyJava v-else :source="modelValue" :label="label" />
</template>
