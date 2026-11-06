<script setup>
import { computed, ref } from 'vue';
import { codes, findLesson, lessonRoute } from '../data/course.js';
import { studyTime, prerequisites } from '../data/learning-path.js';
import { JAVA_TASKS } from '../data/learning-practice.js';
import { lessonDemo } from '../lesson-demos.js';
import { courseStages } from '../useLearningProgress.js';
import { jumpTo } from '../useCourseNavigation.js';
import ChapterIntroduction from '../components/ChapterIntroduction.vue';
import CodeReader from '../components/CodeReader.vue';
import EverydayExample from '../components/EverydayExample.vue';
import JavaWriteTask from '../components/JavaWriteTask.vue';
import LessonComments from '../components/LessonComments.vue';
import LessonFoundation from '../components/LessonFoundation.vue';
import LessonPractice from '../components/LessonPractice.vue';
import NodeAnatomy from '../components/NodeAnatomy.vue';
import PrerequisitePanel from '../components/PrerequisitePanel.vue';
import StudyFigures from '../components/StudyFigures.vue';
import TraceLab from '../components/TraceLab.vue';
import VariantPractice from '../components/VariantPractice.vue';

const props = defineProps({
  chapter: Object,
  lesson: Object,
  lessonIndex: Number,
  progress: Object,
  owner: String,
  today: String,
  todayCount: Number,
  goal: Number,
  signedToday: Boolean,
  disabled: Boolean,
  user: Object,
  commentsService: Object,
});
const emit = defineEmits(['navigate', 'read', 'mastered', 'wrong', 'variant', 'login']);
const navigate = (path) => emit('navigate', path);
const demo = computed(() => lessonDemo(props.lesson));
const prior = computed(() => prerequisites(props.lesson, findLesson, lessonRoute));
const lessonMastered = computed(() => props.progress.mastery.includes(props.lesson.id));
const lessonIndependent = computed(() => props.progress.learning.independent.includes(props.lesson.id));
const canShowMethod = computed(
  () =>
    props.lesson.showCode &&
    (props.lesson.id !== '2-3' ||
      props.progress.learning.prepared.includes('java-method') ||
      props.progress.mastery.includes('2-4')),
);
const lab = ref(null);
function inspectFigure(index) {
  lab.value?.showExampleStep(index);
  jumpTo('lesson-experiment');
}
</script>
<template>
  <article class="lesson-content" :data-lesson="lesson.id">
    <div class="breadcrumb">
      {{ courseStages[chapter.world] }} / 第 {{ chapter.id }} 章 / 小节 {{ lessonIndex + 1 }}
      <span v-if="lesson.optional">· 选学</span>
    </div>
    <div class="lesson-title">
      <div>
        <span class="eyebrow">{{ studyTime(lesson) }}</span>
        <h1>{{ lesson.title }}</h1>
      </div>
    </div>
    <div class="study-status" aria-label="本节学习状态">
      <span :class="{ done: progress.lessons.includes(lesson.id) }">{{
        progress.lessons.includes(lesson.id) ? '已阅读' : '未记录阅读'
      }}</span
      ><span :class="{ done: lessonMastered }">{{ lessonMastered ? '基础练习通过' : '待练习' }}</span
      ><span :class="{ done: lessonIndependent }">{{
        lessonIndependent ? '变式已独立完成' : '可挑战一道新题'
      }}</span>
    </div>
    <nav class="lesson-outline" aria-label="本节目录">
      <button @click="jumpTo('lesson-story')">生活例子</button
      ><button @click="jumpTo('lesson-concepts')">概念</button
      ><button @click="jumpTo('lesson-figures')">图解</button
      ><button @click="jumpTo('lesson-experiment')">逐步实验</button
      ><button @click="jumpTo('lesson-practice')">练习</button
      ><button @click="jumpTo('lesson-challenge')">独立挑战</button>
    </nav>
    <PrerequisitePanel :items="prior" :progress="progress" @navigate="navigate" />
    <p v-if="lesson.optional" class="optional-note">
      这是进阶选学。先完成本章基础内容和练习也能闯关，熟练后可再回来学习。
    </p>
    <ChapterIntroduction
      :key="'intro-' + lesson.id"
      :intro="chapter.introduction"
      :chapter-id="chapter.id"
      :first="lessonIndex === 0"
      @navigate="navigate"
    />
    <div id="lesson-story" class="study-anchor"><EverydayExample :example="lesson.learning.life" /></div>
    <LessonFoundation :unit="lesson.foundation" />
    <NodeAnatomy v-if="lesson.id === '6-1'" />
    <StudyFigures :lesson="lesson" @inspect="inspectFigure" />
    <p id="lesson-experiment" class="experiment-bridge study-anchor">
      <strong>接下来在实验里看什么：</strong>{{ lesson.learning.demo.explanation }}
    </p>
    <TraceLab
      ref="lab"
      :key="lesson.id"
      :mode="demo.mode"
      :initial="demo.initial"
      :variant="demo.variant"
      :plain="true"
      :topic="lesson.id"
      :owner="owner"
      :comparison="lesson.id === '9-2'"
      :code-available="canShowMethod"
    />
    <aside v-if="lesson.showCode || chapter.id === 6" class="cost-note">
      <strong>时间和空间怎么数</strong>
      <p>{{ lesson.complexity }}</p>
    </aside>
    <details v-if="canShowMethod" class="code-stage" data-study-place="code">
      <summary>
        {{ lesson.learning.codeLabel || '理解了例子，再看 Java 实现' }} <span aria-hidden="true">⌄</span>
      </summary>
      <p class="code-bridge">{{ lesson.learning.codeExplanation }}</p>
      <CodeReader
        :guide-key="lesson.codeKey"
        :program="codes[lesson.codeKey]"
        :filename="lesson.codeKey === 'entry' ? 'Main.java' : 'Solution.java'"
      />
    </details>
    <details v-else-if="lesson.id === '2-3'" class="study-details">
      <summary>只看本节学过的比较写法</summary>
      <pre class="study-code"><code>int a = 3;
int b = 5;
boolean equal = (a == b);</code></pre>
      <p>先比较 a 与 b，得到 false，再把这个结果写给 equal。完整方法版在学过“方法与返回值”之后显示。</p>
      <button @click="navigate(lessonRoute('2-4'))">学习方法与返回值 →</button>
    </details>
    <p v-else class="code-later">{{ lesson.learning.codeExplanation }}</p>
    <section v-if="lesson.foundation.links" class="related-problems">
      <h2>对应的力扣练习</h2>
      <article v-for="link in lesson.foundation.links" :key="link.lc">
        <a :href="link.url" target="_blank" rel="noopener">LC {{ link.lc }} · {{ link.name }} ↗</a>
        <p>{{ link.focus }}</p>
        <details v-if="link.lc === 912">
          <summary>本节已学方法的完整答案</summary>
          <CodeReader guide-key="merge" :program="codes.merge" title="LC 912 · 归并排序完整答案" />
        </details>
      </article>
    </section>
    <LessonPractice
      :key="owner + '-' + lesson.id"
      :owner="owner"
      :lesson="lesson"
      :mastered="lessonMastered"
      :disabled="disabled"
      @mastered="emit('mastered', $event)"
      @wrong="emit('wrong', $event)"
    />
    <JavaWriteTask
      v-if="JAVA_TASKS[lesson.id]"
      :task="JAVA_TASKS[lesson.id]"
      :owner="owner"
      :topic="lesson.id"
    />
    <details id="lesson-challenge" class="study-details study-anchor" data-study-place="challenge">
      <summary>独立小挑战 · 换一道题试试</summary>
      <VariantPractice
        :topic="lesson.id"
        :owner="owner"
        :day="today"
        :disabled="disabled"
        @complete="emit('variant', { id: lesson.id, assisted: $event.assisted })"
        @wrong="emit('wrong', $event)"
      />
    </details>
    <div class="daily-lesson">
      <span
        >今天已记录 {{ todayCount }} / {{ goal }} 个学习任务{{ signedToday ? ' · 已打卡' : '' }}</span
      >
      <p>
        读完可以直接记录，练习稍后补做。预备课和复习也可以计入每日目标；同一小节当天只计一次。<button
          type="button"
          class="text-button"
          @click="navigate('/account')"
        >
          查看或调整目标
        </button>
      </p>
    </div>
    <div class="lesson-actions">
      <button
        @click="navigate('/learn/' + chapter.id + '/' + Math.max(0, lessonIndex - 1))"
        :disabled="lessonIndex === 0"
      >
        ← 上一节</button
      ><button @click="emit('read', false)" :disabled="disabled">只记录已读</button
      ><button class="primary" @click="emit('read', true)" :disabled="disabled">记录阅读并继续 →</button>
    </div>
    <LessonComments
      :lesson-id="lesson.id"
      :user="user"
      :service="commentsService"
      @login="emit('login')"
    />
  </article>
</template>
