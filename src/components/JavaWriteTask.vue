<script setup>
import { computed, ref } from 'vue';
import { taskProgram } from '../data/learning-practice.js';
import { useStudyDraft } from '../study-drafts.js';
import RunnableJava from './RunnableJava.vue';
import PracticeCard from './PracticeCard.vue';
import { TASK_STEPS, TASK_REPAIRS } from '../data/java-writing-tasks.js';
import { answerState, withLessonFeedback } from '../answering.js';
const props = defineProps({ topic: String, owner: String, task: Object });
const sequence = withLessonFeedback(
  props.topic,
  {
    kind: 'order',
    question: props.task.task + ' 开始编写前，排好这三步的顺序。',
    options: props.task.steps || TASK_STEPS[props.topic],
    answer: [0, 1, 2],
    explanation: '先准备所需状态，再处理数据，最后交出结果。',
  },
  -1,
);
const repair = withLessonFeedback(props.topic, TASK_REPAIRS[props.topic], -1);
const draft = useStudyDraft(props.owner, props.topic, 'java-write', (raw) => ({
  body: typeof raw?.body === 'string' ? raw.body.slice(0, 2400) : props.task.starter,
  reference: !!raw?.reference,
  sequence: answerState(sequence, raw?.sequence),
  repair: repair ? answerState(repair, raw?.repair) : null,
}));
const program = computed(() => taskProgram(props.task, draft.body));
const show = ref(false);
</script>
<template>
  <details class="study-details java-write-task" data-study-place="write">
    <summary>{{ task.title }}</summary>
    <p>{{ task.task }}</p>
    <details class="writing-ladder">
      <summary>写之前，先把关键步骤排清楚</summary>
      <PracticeCard :question="sequence" :state="draft.sequence" label="从推演过渡到编写" />
    </details>
    <details v-if="repair" class="writing-ladder">
      <summary>再修正一处常见错误</summary>
      <PracticeCard :question="repair" :state="draft.repair" label="修正关键语句" />
    </details>
    <label class="mini-output"
      ><code>{{ task.signature }} { … }</code><span>在下面写方法体</span
      ><textarea
        v-model="draft.body"
        rows="6"
        maxlength="2400"
        spellcheck="false"
        autocapitalize="off"
        autocomplete="off"
      />
    </label>
    <p class="micro">草稿自动保存在本机。下载后在自己的电脑上执行测试，网站不执行这段输入。</p>
    <details>
      <summary>这份测试会检查哪些输入？</summary>
      <ul>
        <li v-for="[call, want] in task.cases" :key="call">
          <code>{{ call }}</code> 应得到 <strong>{{ want }}</strong>
        </li>
      </ul>
    </details>
    <RunnableJava
      :source="program"
      :expected="'All ' + task.cases.length + ' cases passed.'"
      title="下载你写的代码与配套测试"
    />
    <button
      type="button"
      @click="
        show = !show;
        if (show) draft.reference = true;
      "
    >
      {{ show ? '收起参考写法' : '对照参考写法' }}
    </button>
    <pre v-if="show" class="study-code"><code>{{task.solution}}</code></pre>
  </details>
</template>
