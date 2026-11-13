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
import { useReadingDevice } from '../java/device-policy.js';
import PracticeCard from './PracticeCard.vue';
import { answerState } from '../answering.js';
import { useLearningInsights } from '../learning-insights.js';
import CodingScaffold from './CodingScaffold.vue';
import { createCodingScaffold, fillScaffold } from '../java/coding-scaffolds.js';
const insights = useLearningInsights();
let attemptStarted = Date.now();
const readingDevice = useReadingDevice();
const props = defineProps({ task: Object, owner: String, review: Boolean, disabled: Boolean });
const coding = useCodingProgress();
const scaffold = createCodingScaffold(props.task);
const independentKind = props.review ? 'coding-review-' + localDateKey() : 'coding-write';
const existing = readDraft(draftKey(props.owner, props.task.id, independentKind), browserStorage());
const prediction = {
  kind: 'output',
  category: 'boundary',
  question:
    props.task.task +
    ' 输入：' +
    props.task.cases[0][0] +
    '。请预测返回值；数组和字符串用 JSON 格式填写。',
  answer: props.task.cases[0][1],
  explanation: '结果为 ' + JSON.stringify(props.task.cases[0][1]) + '。' + props.task.hints.join(' '),
  hints: props.task.hints,
};
const mobileWork = useStudyDraft(props.owner, props.task.id, 'mobile-prediction', (raw) => ({
  item: answerState(prediction, raw?.item),
}));
const previous = !props.review
  ? readDraft(draftKey(props.owner, props.task.topic, 'java-write'), browserStorage())
  : null;
const draft = useStudyDraft(props.owner, props.task.id, independentKind, (raw) => ({
  source:
    raw || previous
      ? restoreCodingSource(props.task, raw, previous)
      : buildLearnerProgram(props.task, scaffold.starter),
  hints: Number.isInteger(raw?.hints) ? Math.max(0, Math.min(2, raw.hints)) : 0,
  reference: raw?.reference === true || (!raw && previous?.reference === true),
  explanation: typeof raw?.explanation === 'string' ? raw.explanation.slice(0, 1000) : '',
  selfChecked: raw?.selfChecked === true,
}));
const blockIds = scaffold.blocks.map((b) => b.id);
const practice = useStudyDraft(
  props.owner,
  props.task.id,
  'coding-scaffold' + (props.review ? '-review-' + localDateKey() : ''),
  (raw) => ({
    mode: props.review
      ? 'independent'
      : ['one', 'three', 'independent', 'parsons', 'typing'].includes(raw?.mode)
        ? raw.mode
        : existing || previous
          ? 'independent'
          : 'one',
    one: scaffold.one.answers.map((_, i) =>
      typeof raw?.one?.[i] === 'string' ? raw.one[i].slice(0, 1000) : '',
    ),
    three: scaffold.three.answers.map((_, i) =>
      typeof raw?.three?.[i] === 'string' ? raw.three[i].slice(0, 1000) : '',
    ),
    typing: typeof raw?.typing === 'string' ? raw.typing.slice(0, CODING_SOURCE_LIMIT) : '',
    order:
      Array.isArray(raw?.order) &&
      raw.order.length === blockIds.length &&
      new Set(raw.order).size === blockIds.length &&
      raw.order.every((id) => blockIds.includes(id))
        ? raw.order
        : [...blockIds].reverse(),
    indents: Object.fromEntries(
      scaffold.blocks.map((b) => [
        b.id,
        Number.isInteger(raw?.indents?.[b.id]) ? Math.max(0, Math.min(6, raw.indents[b.id])) : 0,
      ]),
    ),
    completed: Object.fromEntries(
      ['one', 'three', 'parsons', 'typing']
        .filter((mode) => ['checked', 'tested'].includes(raw?.completed?.[mode]))
        .map((mode) => [mode, raw.completed[mode]]),
    ),
  }),
);
const activeSource = computed(() => {
  if (practice.mode === 'independent') return draft.source;
  const body =
    practice.mode === 'one' || practice.mode === 'three'
      ? fillScaffold(scaffold[practice.mode].parts, practice[practice.mode])
      : practice.mode === 'typing'
        ? practice.typing
        : practice.order
            .map(
              (id) =>
                '    '.repeat(practice.indents[id]) + scaffold.blocks.find((b) => b.id === id).code,
            )
            .join('\n');
  return buildLearnerProgram(props.task, body);
});
function changeMode(mode) {
  if (props.disabled || coding?.disabled.value) return;
  practice.mode = mode;
  diagnostics.value = [];
  resetConfirm.value = false;
  referenceOpen.value = false;
  attemptStarted = Date.now();
}
function checked(mode) {
  if (!props.disabled && !coding?.disabled.value && practice.completed[mode] !== 'tested')
    practice.completed[mode] = 'checked';
}
function updatePractice(patch) {
  if (props.disabled || coding?.disabled.value) return;
  delete practice.completed[practice.mode];
  Object.assign(practice, patch);
}
const referenceOpen = ref(false),
  resetConfirm = ref(false),
  codeEditor = ref(null),
  runPanel = ref(null),
  diagnostics = ref([]);
const full = computed(() => buildSourceJudgingProgram(props.task, activeSource.value));
const saved = computed(() => coding?.progress.learning.coding[props.task.id]);
function attempted(result) {
  if (!result.all || result.state === 'stopped' || props.disabled || coding?.disabled.value) return;
  if (coding?.owner && coding.owner.value !== props.owner) return;
  const passed =
    result.state === 'finished' &&
    result.cases.length === props.task.cases.length &&
    result.cases.every((c) => c.ok);
  if (practice.mode !== 'independent') {
    if (passed) practice.completed[practice.mode] = 'tested';
    return;
  }
  insights?.record({
    key: props.task.id,
    ok: passed,
    elapsed: Math.min(3600000, Date.now() - attemptStarted),
    category: result.state === 'compile-error' ? 'concept' : 'boundary',
    difficulty: /进阶|工程|综合|阶段/.test(props.task.level)
      ? 3
      : /基础|起步|入门/.test(props.task.level)
        ? 1
        : 2,
  });
  attemptStarted = Date.now();
  coding?.record(
    props.task.id,
    { passed, assisted: draft.hints > 0 || draft.reference },
    props.task.topic,
  );
}
function reset() {
  if (practice.mode === 'independent') {
    draft.source = buildLearnerProgram(props.task, scaffold.starter);
    draft.hints = 0;
    draft.reference = false;
  } else {
    delete practice.completed[practice.mode];
    if (practice.mode === 'one' || practice.mode === 'three')
      practice[practice.mode] = scaffold[practice.mode].answers.map(() => '');
    else if (practice.mode === 'typing') practice.typing = '';
    else {
      practice.order = [...blockIds].reverse();
      practice.indents = Object.fromEntries(blockIds.map((id) => [id, 0]));
    }
  }
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
    <PracticeCard
      v-if="readingDevice"
      :question="prediction"
      :state="mobileWork.item"
      :disabled="disabled"
    />
    <div v-else class="coding-example">
      <strong>先预测一个例子</strong><code>{{ task.cases[0][0] }}</code
      ><span>预期：{{ JSON.stringify(task.cases[0][1]) }}</span>
    </div>
    <p class="micro">
      完整代码都在下面的 Main.java 中。运行示例会执行文件里的
      main；提交全部测试会按题目要求调用方法，请保留 Main 类名和题目给定的方法声明。
    </p>
    <CodingScaffold
      :key="practice.mode"
      :task="task"
      :scaffold="scaffold"
      :state="practice"
      :disabled="disabled || coding?.disabled.value"
      :reading="readingDevice"
      @mode="changeMode"
      @checked="checked"
      @update="updatePractice"
    >
      <JavaCodeEditor
        v-if="practice.mode === 'independent'"
        ref="codeEditor"
        v-model="draft.source"
        :label="task.title + '代码'"
        :maxlength="CODING_SOURCE_LIMIT"
        :disabled="disabled"
        :diagnostics="diagnostics"
        @run="runPanel?.execute(false)"
      />
    </CodingScaffold>
    <p class="micro">
      草稿自动保存在本机。测试结果和复习安排可随现有账号存档同步；代码不会加入客流统计。
    </p>
    <JavaRunPanel
      ref="runPanel"
      :key="task.id + practice.mode"
      :source="full.source"
      :sample-source="activeSource"
      :entry-class="full.entryClass"
      :sample-judged="false"
      :editable-lines="activeSource.split('\n').length"
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
      ><UiButton icon="download" @click="downloadText('Main.java', activeSource)"
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
