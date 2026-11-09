<script setup>
import { ref } from 'vue';
import JavaRunPanel from '../components/JavaRunPanel.vue';
import { useStudyDraft } from '../study-drafts.js';
import JavaCodeEditor from '../components/JavaCodeEditor.vue';
const props = defineProps({ owner: String });
const draft = useStudyDraft(props.owner, 'java-playground', 'source', (raw) => ({
  source:
    typeof raw?.source === 'string'
      ? raw.source.slice(0, 12000)
      : 'public class Main {\n    public static void main(String[] args) {\n        int[] a = {1, 2, 3};\n        int sum = 0;\n        for (int value : a) {\n            sum += value;\n        }\n        System.out.println(sum);\n    }\n}',
  stdin: typeof raw?.stdin === 'string' ? raw.stdin.slice(0, 2000) : '',
}));
const showInput = ref(false);
const codeEditor = ref(null),
  runPanel = ref(null),
  diagnostics = ref([]);
</script>
<template>
  <main class="study-page coding-page">
    <span class="eyebrow">Java 实验台</span>
    <h1>写一段，运行看看</h1>
    <p>
      这是完整程序编辑区，从 main 开始执行。初始示例的数组是
      a=[1,2,3]；先预测总和，再运行。然后修改其中一个数，重新验证。
    </p>
    <JavaCodeEditor
      ref="codeEditor"
      v-model="draft.source"
      label="Java 完整程序"
      :diagnostics="diagnostics"
      @run="runPanel?.execute()"
    />
    <button class="text-button" @click="showInput = !showInput">
      {{ showInput ? '收起标准输入' : '需要 Scanner 输入？展开标准输入' }}
    </button>
    <label v-if="showInput" class="mini-output"
      >标准输入<textarea v-model="draft.stdin" rows="3" maxlength="2000" />
    </label>
    <JavaRunPanel
      ref="runPanel"
      :source="draft.source"
      :stdin="draft.stdin"
      @diagnostics="diagnostics = $event"
      @locate="codeEditor?.locate($event)"
    />
  </main>
</template>
