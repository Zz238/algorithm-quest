<script setup>
import { computed, ref } from 'vue';
import { useStudyDraft, browserStorage, draftKey, readDraft } from '../study-drafts.js';
import { localDateKey } from '../study-state.js';
import { useCodingProgress } from '../coding-progress.js';
import {
  buildLearnerProgram,
  buildSourceJudgingProgram,
  restoreCodingSource,
  CODING_SOURCE_LIMIT,
} from '../java/coding-program.js';
import { downloadText } from '../download.js';
import JavaRunPanel from './JavaRunPanel.vue';
import UiButton from './ui/UiButton.vue';
import UiCheckbox from './ui/UiCheckbox.vue';
import CourseLink from './CourseLink.vue';
import JavaCodeEditor from './JavaCodeEditor.vue';
const props = defineProps({ task: Object, owner: String, review: Boolean, disabled: Boolean });
const coding = useCodingProgress();
const previous = !props.review
  ? readDraft(draftKey(props.owner, props.task.topic, 'java-write'), browserStorage())
  : null;
const draft = useStudyDraft(
  props.owner,
  props.task.id,
  props.review ? 'coding-review-' + localDateKey() : 'coding-write',
  (raw) => ({
    source: restoreCodingSource(props.task, raw, previous),
    hints: Number.isInteger(raw?.hints) ? Math.max(0, Math.min(2, raw.hints)) : 0,
    reference: raw?.reference === true || (!raw && previous?.reference === true),
    explanation: typeof raw?.explanation === 'string' ? raw.explanation.slice(0, 1000) : '',
    selfChecked: raw?.selfChecked === true,
  }),
);
const referenceOpen = ref(false),
  resetConfirm = ref(false),
  codeEditor = ref(null),
  runPanel = ref(null),
  diagnostics = ref([]);
const full = computed(() => buildSourceJudgingProgram(props.task, draft.source));
const saved = computed(() => coding?.progress.learning.coding[props.task.id]);
function attempted(result) {
  if (!result.all || result.state === 'stopped' || props.disabled) return;
  if (coding?.owner && coding.owner.value !== props.owner) return;
  const passed =
    result.state === 'finished' &&
    result.cases.length === props.task.cases.length &&
    result.cases.every((c) => c.ok);
  coding?.record(
    props.task.id,
    { passed, assisted: draft.hints > 0 || draft.reference },
    props.task.topic,
  );
}
function reset() {
  draft.source = buildLearnerProgram(props.task);
  draft.hints = 0;
  draft.reference = false;
  referenceOpen.value = false;
  resetConfirm.value = false;
}
</script>
<template>
  <section class="coding-task" :data-coding-task="task.id">
    <div class="study-block-head">
      <div>
        <span class="eyebrow">{{ review ? '先回忆，再运行' : '动手编程' }} · {{ task.level }}</span>
        <h2>{{ task.title }}</h2>
      </div>
      <span v-if="saved?.passedAt" class="coding-badge">{{
        saved.independentAt ? '曾独立通过' : '曾参考后通过'
      }}</span>
    </div>
    <p>{{ task.task }}</p>
    <aside
      v-if="
        coding &&
        !coding.progress.learning.prepared.includes('java-method') &&
        !coding.progress.mastery.includes('2-4')
      "
      class="study-note"
    >
      Main.java 中已经放好了类、方法声明和示例入口。先完成方法里的任务，会用到参数和
      return。还没学过时，可先打开
      <CourseLink to="/java/method" @navigate="coding.navigate('/java/method')"
        >方法与返回值起步课 →</CourseLink
      >，或者在 Java 起步示例中先练改写完整程序。
    </aside>
    <aside v-if="task.preparation" class="study-note">
      <strong>这里新增的写法</strong>
      <p>{{ task.preparation }}</p>
    </aside>
    <div class="coding-example">
      <strong>先预测一个例子</strong><code>{{ task.cases[0][0] }}</code
      ><span>预期：{{ JSON.stringify(task.cases[0][1]) }}</span>
    </div>
    <p class="micro">
      完整代码都在下面的 Main.java 中。运行示例会执行文件里的
      main；提交全部测试会按题目要求调用方法，请保留 Main 类名和题目给定的方法声明。
    </p>
    <JavaCodeEditor
      ref="codeEditor"
      v-model="draft.source"
      :label="task.title + '代码'"
      :maxlength="CODING_SOURCE_LIMIT"
      :disabled="disabled"
      :diagnostics="diagnostics"
      @run="runPanel?.execute(false)"
    />
    <p class="micro">
      草稿自动保存在本机。测试结果和复习安排可随现有账号存档同步；代码不会加入客流统计。
    </p>
    <JavaRunPanel
      ref="runPanel"
      :key="task.id"
      :source="full.source"
      :sample-source="draft.source"
      :entry-class="full.entryClass"
      :sample-judged="false"
      :editable-lines="draft.source.split('\n').length"
      :disabled="disabled || coding?.disabled.value"
      judged
      @result="attempted"
      @diagnostics="diagnostics = $event"
      @locate="codeEditor?.locate($event)"
    />
    <div class="coding-help">
      <UiButton
        icon="info"
        :disabled="draft.hints >= Math.min(2, task.hints.length)"
        @click="draft.hints++"
        >{{ draft.hints ? '再给一点提示' : '给一点提示' }}</UiButton
      ><UiButton
        icon="code"
        @click="
          referenceOpen = !referenceOpen;
          if (referenceOpen) draft.reference = true;
        "
        >{{ referenceOpen ? '收起参考写法' : '查看参考写法' }}</UiButton
      ><UiButton icon="download" @click="downloadText('Main.java', draft.source)"
        >下载自己的 Main.java</UiButton
      ><button class="text-button" @click="resetConfirm = !resetConfirm">重新练习</button>
    </div>
    <ol v-if="draft.hints" class="study-note">
      <li v-for="hint in task.hints.slice(0, draft.hints)" :key="hint">{{ hint }}</li>
    </ol>
    <div v-if="referenceOpen" class="study-note">
      <p>看过答案后会记录“参考后完成”。稍后在复习模式重新编写，再检验是否能独立完成。</p>
      <pre class="study-code"><code>{{ buildLearnerProgram(task, task.solution) }}</code></pre>
    </div>
    <div v-if="resetConfirm" class="coding-feedback">
      <p>将清空这道题当前编辑区和提示状态；历史测试记录保留。</p>
      <UiButton @click="reset">确认重置本题草稿</UiButton
      ><UiButton variant="ghost" @click="resetConfirm = false">保留草稿</UiButton>
    </div>
    <details class="coding-reflection">
      <summary>通过之后：说清楚为什么</summary>
      <label class="mini-output"
        >这段代码保留了什么状态？最容易错的边界是什么？<textarea
          v-model="draft.explanation"
          rows="3"
          maxlength="1000"
        /></label
      ><UiCheckbox v-model="draft.selfChecked"
        >我能解释自己的代码，并尝试了空输入、最小输入或重复值中的适用情况。</UiCheckbox
      >
      <p class="micro">
        这是本人复盘，不替代实际测试结果。浏览器判题用于学习自测，不作为防作弊考试成绩。
      </p>
    </details>
  </section>
</template>
