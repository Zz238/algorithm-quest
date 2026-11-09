<script setup>
import { computed } from 'vue';
import { chapters, codes, requiredLessons, findLesson, lessonRoute } from '../data/course.js';
import { answerState } from '../answering.js';
import { useStudyDraft } from '../study-drafts.js';
import { bossDemo } from '../lesson-demos.js';
import { jumpTo } from '../useCourseNavigation.js';
import { TRANSFERS } from '../data/learning-practice.js';
import PracticeCard from './PracticeCard.vue';
import TraceLab from './TraceLab.vue';
import CodeReader from './CodeReader.vue';
const props = defineProps({
  chapter: Object,
  progress: Object,
  owner: String,
  completed: Boolean,
  disabled: Boolean,
});
const emit = defineEmits(['navigate', 'complete', 'wrong']);
const c = chapters.find(ch=>ch.id===props.chapter.id),
  boss = c.boss;
const application = TRANSFERS.find((t) => t.after.startsWith(c.id + '-'));
const missing = computed(() =>
  requiredLessons(c).filter(
    (l) => !props.progress.lessons.includes(l.id) || !props.progress.mastery.includes(l.id),
  ),
);
const ready = computed(() => !missing.value.length);
const cases = boss.cases.map((item, i) => ({
  kind: 'output',
  question: '情境 ' + (i + 1) + '：根据本题的输入，填出结果。',
  input: item.input,
  answer: item.output,
  explanation: '与本情境的预期结果一致。试着再说明哪一步决定了它。',
  hints: boss.hints,
}));
const choice = {
  kind: 'choice',
  question: boss.question,
  options: boss.options,
  answer: boss.correct,
  explanation: boss.relation.join('。') + '。',
  hints: boss.hints,
};
const questions = [...cases, choice];
const work = useStudyDraft(props.owner, 'boss-' + c.id, 'exercise', (r) => ({
  items: questions.map((q, i) => answerState(q, r?.items?.[i])),
  solution: !!r?.solution,
  exampleIndex: r?.exampleIndex === 1 ? 1 : 0,
}));
const allCorrect = computed(() => work.items.every((s) => s.passed));
const codeReady = computed(
  () =>
    !boss.codePrerequisiteChapters ||
    ['java-method', 'java-array', 'java-for'].every((id) =>
      props.progress.learning.prepared.includes(id),
    ) ||
    boss.codePrerequisiteChapters.every((id) =>
      requiredLessons(chapters.find((ch) => ch.id === id)).every((l) =>
        props.progress.mastery.includes(l.id),
      ),
    ),
);
const demo = computed(() => bossDemo(boss, boss.cases[work.exampleIndex]));
function attempted(result) {
  if (!result.ok && boss.review.length) emit('wrong', boss.review.at(-1));
}
</script>
<template>
  <article class="boss-content" :data-chapter="c.id">
    <div class="boss-heading">
      <div>
        <span class="eyebrow">章节练习 · LC {{ boss.lc }}</span>
        <h1>{{ boss.title }}</h1>
        <p>
          {{ completed ? '已记录完成，可以随时回来复习。' : '先读题、再手算；需要时可以展开提示。' }}
        </p>
      </div>
      <span class="reward">{{ boss.difficulty }}</span>
    </div>
    <nav class="lesson-outline" aria-label="章节练习目录">
      <button @click="jumpTo('boss-question')">题目</button>
      <button @click="jumpTo('boss-practice')">练习与提示</button>
      <button @click="jumpTo('boss-solution')">题解</button>
      <button @click="jumpTo('boss-complete')">登记完成</button>
    </nav>
    <section v-if="!ready" class="boss-section study-note" aria-label="章节练习预览">
      <h2>可以先预览和试做</h2>
      <p>
        还差
        {{
          missing.length
        }}
        个基础小节的阅读或练习记录。先试做下面的题也可以，草稿会保留；补齐基础记录后就能登记完成本章。
      </p>
      <div class="study-actions">
        <button v-for="l in missing" :key="l.id" @click="emit('navigate', lessonRoute(l.id))">
          {{ l.title }}
        </button>
      </div>
    </section>
    <section class="boss-section study-anchor" id="boss-question">
      <div class="section-bar">
        <h2>读懂题目</h2>
        <a :href="boss.url" target="_blank" rel="noopener">力扣原题 LC {{ boss.lc }} ↗</a>
      </div>
      <p>{{ boss.description }}</p>
      <div class="prerequisite-links">
        <strong>题目用到这些知识</strong
        ><button v-for="id in boss.review" :key="id" @click="emit('navigate', lessonRoute(id))">
          {{ findLesson(id)?.title }} →
        </button>
      </div>
      <ul>
        <li v-for="r in boss.relation" :key="r">{{ r }}</li>
      </ul>
    </section>
    <section class="boss-section study-anchor" id="boss-practice">
      <h2>自己走一遍</h2>
      <p>先手算，做完再对照题解。草稿与单题结果保存在此浏览器。</p>
      <div class="case-grid">
        <section v-for="(q, i) in cases" :key="i" class="study-case">
          <PracticeCard
            :question="q"
            :state="work.items[i]"
            :problem="boss.lc"
            :disabled="disabled"
            @attempt="attempted"
          />
        </section>
      </div>
      <PracticeCard
        :question="choice"
        :state="work.items[cases.length]"
        label="检查思路"
        :disabled="disabled"
        @attempt="attempted"
      />
    </section>
    <section class="boss-section solution study-anchor" id="boss-solution">
      <div class="section-bar">
        <h2>详细题解与完整答案</h2>
        <button :aria-expanded="work.solution" @click="work.solution = !work.solution">
          {{ work.solution ? '收起题解 ↑' : '展开题解 ↓' }}
        </button>
      </div>
      <p v-if="!work.solution" class="muted">先说说你会记住哪些数据、每次怎样更新。</p>
      <div v-else>
        <ol class="solution-steps">
          <li v-for="(s, i) in boss.approach" :key="s">
            <b>{{ i + 1 }}</b
            ><span>{{ s }}</span>
          </li>
        </ol>
        <p class="micro">下方实验直接读取作答区的情境数据。切换情境可以对照另一组输入。</p>
        <div class="study-actions" role="group" aria-label="选择实验情境">
          <button
            v-for="(_, i) in boss.cases"
            :key="i"
            :aria-pressed="work.exampleIndex === i"
            @click="work.exampleIndex = i"
          >
            情境 {{ i + 1 }}
          </button>
        </div>
        <pre class="study-code" aria-label="当前实验使用的情境数据">{{
          JSON.stringify(boss.cases[work.exampleIndex].input, null, 2)
        }}</pre>
        <TraceLab
          :key="work.exampleIndex"
          :mode="demo.mode"
          :variant="boss.codeKey === 'stairs' ? 'rolling' : ''"
          :initial="demo.initial"
          :plain="true"
          :topic="'boss-' + c.id + '-case-' + work.exampleIndex"
          :owner="owner"
          :code-available="codeReady"
          :allow-edit="false"
        />
        <h3>为什么这样做是对的？</h3>
        <p>{{ boss.proof }}</p>
        <h3>时间与空间</h3>
        <p>{{ boss.complexity }}</p>
        <h3>容易错的地方</h3>
        <ul>
          <li v-for="p in boss.pitfalls" :key="p">{{ p }}</li>
        </ul>
        <CodeReader
          v-if="codeReady"
          :guide-key="boss.codeKey"
          :program="codes[boss.codeKey]"
          :title="'力扣方法版 · LC ' + boss.lc"
        />
        <div v-else class="code-later">
          <p>这里先练累计的步骤。完成数组、循环、方法预备课后，再展开 Java 答案。</p>
          <button @click="emit('navigate', '/java')">去 Java 预备课 →</button>
        </div>
      </div>
    </section>
    <section class="clear-chapter study-anchor" id="boss-complete">
      <div>
        <h2>{{ completed ? '本章练习已完成' : '登记本章完成' }}</h2>
        <p>
          {{ ready ? '基础阅读与练习已齐。' : '先补齐基础阅读与练习。' }}
          {{ allCorrect ? '三道综合题已答对。' : '综合题可以分几次完成。' }}
        </p>
      </div>
      <button
        class="primary"
        :disabled="disabled || !ready || !allCorrect || completed"
        @click="emit('complete', c.id)"
      >
        {{ completed ? '已记录完成' : '记录本章完成' }}</button
      ><button v-if="application" @click="emit('navigate', '/review/' + application.id)">
        换个场景做阶段应用 →</button
      ><button v-if="c.id < chapters.length" @click="emit('navigate', '/learn/' + (c.id + 1) + '/0')">
        去下一章 →
      </button>
    </section>
  </article>
</template>
