<script setup>
import { defineAsyncComponent, ref } from 'vue';
import { useStudyDraft } from '../study-drafts.js';
import { useCodingProgress } from '../coding-progress.js';
import UiButton from './ui/UiButton.vue';
import JavaCodeEditor from './JavaCodeEditor.vue';
const props = defineProps({
  source: String,
  expected: String,
  title: { type: String, default: '在电脑上运行这个例子' },
  showSource: { type: Boolean, default: true },
  topic: String,
  owner: String,
});
const JavaRunPanel = defineAsyncComponent(() => import('./JavaRunPanel.vue'));
const coding = useCodingProgress();
let sourceHash = 0;
for (const char of props.source) sourceHash = (Math.imul(sourceHash, 31) + char.charCodeAt(0)) | 0;
const editable = ref(false);
const exampleDraft = useStudyDraft(
  props.owner || coding?.owner.value || 'guest',
  props.topic || 'example-' + (sourceHash >>> 0).toString(36),
  'example-source',
  (raw) => ({ source: typeof raw?.source === 'string' ? raw.source.slice(0, 12000) : props.source }),
);
const status = ref('');
const codeEditor = ref(null),
  runPanel = ref(null),
  diagnostics = ref([]);
function download() {
  const url = URL.createObjectURL(new Blob([props.source], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Main.java';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status.value = '已请求下载 Main.java';
}
async function copy() {
  try {
    await navigator.clipboard.writeText(props.source);
    status.value = '已复制完整 Main.java。';
  } catch {
    status.value = '复制不可用，可以下载文件。';
  }
}
</script>
<template>
  <div class="runnable-java">
    <div class="study-block-head">
      <div>
        <h4>{{ title }}</h4>
        <p>这是完整的 Main.java，已经带上本例的输入和入口。</p>
      </div>
      <div class="study-actions">
        <UiButton :icon="status.startsWith('已复制') ? 'check' : 'copy'" @click="copy"
          >复制完整示例</UiButton
        ><UiButton variant="primary" icon="download" @click="download">下载 Main.java</UiButton>
      </div>
    </div>
    <p v-if="status" class="micro" role="status">{{ status }}</p>
    <details @toggle="editable = $event.target.open">
      <summary>在这里改写并运行，不用安装 Java</summary>
      <template v-if="editable"
        ><p>先只修改本节讲过的语句或输入，保留其余程序框架。预测结果，再点击运行核对。</p>
        <JavaCodeEditor
          ref="codeEditor"
          v-model="exampleDraft.source"
          label="改写当前 Java 示例"
          :diagnostics="diagnostics"
          :disabled="coding?.disabled.value"
          @run="runPanel?.execute()" />
        <JavaRunPanel
          ref="runPanel"
          :source="exampleDraft.source"
          :disabled="coding?.disabled.value"
          @diagnostics="diagnostics = $event"
          @locate="codeEditor?.locate($event)"
      /></template>
    </details>
    <details v-if="showSource">
      <summary>展开完整源代码</summary>
      <pre class="study-code"><code>{{source}}</code></pre>
    </details>
    <p v-if="expected !== undefined" class="expected-output">
      <strong>预期输出</strong><code>{{ expected }}</code>
    </p>
    <details class="run-instructions">
      <summary>第一次运行？看具体步骤</summary>
      <ol>
        <li>
          安装
          <a href="https://dev.java/learn/getting-started/" target="_blank" rel="noopener"
            >JDK 17 或以上</a
          >。终端输入 <code>javac -version</code>，看到版本号就可以继续。
        </li>
        <li>
          把下载的文件保存为 <code>Main.java</code>。Windows 可打开它所在的文件夹，在地址栏输入
          <code>cmd</code> 并回车。其他系统可在终端用 <code>cd</code> 进入文件所在文件夹。
        </li>
        <li>在该文件夹依次执行以下两行；第一行成功通常不显示任何内容。</li>
      </ol>
      <pre class="study-code"><code>javac -encoding UTF-8 Main.java
java Main</code></pre>
      <p>
        如果提示“找不到文件”，先核对终端所在文件夹和文件名。运行成功后改一个输入，重新编译、运行，对照你预测的结果。
      </p>
    </details>
  </div>
</template>
