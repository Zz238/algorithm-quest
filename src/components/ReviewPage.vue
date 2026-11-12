<script setup>
import { computed } from 'vue';
import { dueReviews } from '../study-state.js';
import { findLesson, lessonRoute } from '../data/course.js';
import { JAVA_BY_ID, javaRoute } from '../data/java-starter.js';
import {
  TRANSFERS,
  TRANSFER_BY_ID,
  reviewVariant,
  transferScenario,
} from '../data/learning-practice.js';
import { useStudyDraft } from '../study-drafts.js';
import { answerState } from '../answering.js';
import VariantPractice from './VariantPractice.vue';
import PracticeCard from './PracticeCard.vue';
import ProjectWorkshop from './ProjectWorkshop.vue';
import CourseLink from './CourseLink.vue';
import LessonCoding from './LessonCoding.vue';
import { CODING_INDEX } from '../data/course-index.js';
import { attemptSummary } from '../learning-insights.js';
const patterns = computed(() => attemptSummary(props.progress.learning.attempts || []));
const props = defineProps({
  topic: String,
  owner: String,
  today: String,
  progress: Object,
  disabled: Boolean,
});
const emit = defineEmits(['navigate', 'complete', 'wrong']);
const base = TRANSFER_BY_ID[props.topic];
const work = base
  ? useStudyDraft(props.owner, base.id, 'transfer', (r) => {
      const seed =
        r?.day === props.today && Number.isInteger(r?.seed)
          ? Math.abs(r.seed) % 2
          : Number(props.today.slice(-2)) % 2;
      const t = transferScenario(base.id, seed);
      return {
        day: props.today,
        seed,
        seen: Array.isArray(r?.seen) ? r.seen.filter((x) => x === 0 || x === 1) : [],
        items: t.questions.map((q, i) => answerState(q, r?.day === props.today ? r?.items?.[i] : null)),
      };
    })
  : null;
const transfer = computed(() => (base ? transferScenario(base.id, work.seed) : null));
function changeCase() {
  work.seed = 1 - work.seed;
  work.items = transfer.value.questions.map((q) => answerState(q));
}
function trackHelp() {
  if (!work.seen.includes(work.seed)) work.seen.push(work.seed);
}
const title = (id) => findLesson(id)?.title || JAVA_BY_ID[id]?.title || TRANSFER_BY_ID[id]?.title || '';
const path = (id) => (JAVA_BY_ID[id] ? javaRoute(id) : lessonRoute(id));
const due = computed(() => dueReviews(props.progress, props.today).filter(([id]) => title(id)));
const scheduled = computed(() =>
  Object.entries(props.progress.learning.review)
    .filter(([id, r]) => title(id) && r.due > props.today)
    .sort((a, b) => a[1].due.localeCompare(b[1].due)),
);
const codingDue = computed(() =>
  Object.entries(props.progress.learning.coding || {}).filter(
    ([id, r]) => CODING_INDEX[id] && r.due <= props.today,
  ),
);
const isQuestion = !!props.topic && !transfer.value && !!reviewVariant(props.topic);
const related = computed(() => (transfer.value ? findLesson(transfer.value.source) : null));
function transferAttempt(r) {
  if (!r.ok) {
    emit('wrong', transfer.value.id);
    return;
  }
  if (work.items.every((s) => s.passed))
    emit('complete', {
      id: transfer.value.id,
      assisted: work.seen.includes(work.seed) || work.items.some((s) => s.helped),
    });
}
</script>
<template>
  <main class="study-page review-page">
    <button class="text-button" @click="emit('navigate', topic ? '/review' : '/progress')">
      ← {{ topic ? '复习清单' : '学习记录' }}
    </button>
    <template v-if="transfer">
      <div class="study-page-lead">
        <span class="eyebrow">阶段应用</span>
        <h1>{{ transfer.title }}</h1>
        <p>先选择一种处理办法，再自己推演结果。</p>
        <button @click="changeCase">换一组数据</button>
      </div>
      <p v-if="!progress.mastery.includes(transfer.after)" class="study-note">
        可以先试。若还没学到这里，<button
          class="text-button"
          @click="emit('navigate', lessonRoute(transfer.after))"
        >
          去看这一阶段的收尾小节</button
        >。
      </p>
      <PracticeCard
        v-for="(q, i) in transfer.questions"
        :key="work.seed + ':' + i"
        :question="q"
        :state="work.items[i]"
        :prior-help="work.seen.includes(work.seed)"
        @help="trackHelp"
        :label="i === 0 ? '选择处理方法' : '推演实际结果'"
        :disabled="disabled"
        @attempt="transferAttempt"
      />
      <p v-if="progress.learning.independent.includes(transfer.id)" role="status">已记录独立完成。</p>
      <ProjectWorkshop :project="transfer" :owner="owner" :seed="work.seed" />
      <details class="study-details">
        <summary>卡住时，可以回顾这一小节</summary>
        <p>{{ related?.foundation.terms[0].meaning }}</p>
        <button @click="emit('navigate', path(transfer.source))">打开 {{ related?.title }} →</button>
      </details>
    </template>
    <template v-else-if="isQuestion">
      <div class="study-page-lead">
        <span class="eyebrow">复习 · {{ today }}</span>
        <h1>{{ title(topic) }}</h1>
        <p v-if="progress.learning.review[topic]">安排日期：{{ progress.learning.review[topic].due }}</p>
      </div>
      <VariantPractice
        :key="topic + '-' + today"
        :topic="topic"
        :owner="owner"
        :day="today"
        mode="review"
        :disabled="disabled"
        @complete="emit('complete', { id: topic, assisted: $event.assisted })"
        @wrong="emit('wrong', $event)"
      />
      <LessonCoding
        :topic="topic"
        :owner="owner"
        :disabled="disabled"
        review
        @navigate="emit('navigate', $event)"
      />
      <div class="study-actions">
        <button @click="emit('navigate', path(topic))">回到讲解</button
        ><button @click="emit('navigate', '/review')">回到复习清单</button>
      </div>
    </template>
    <template v-else>
      <div class="study-page-lead">
        <span class="eyebrow">先回忆，再核对</span>
        <h1>复习与阶段练习</h1>
        <p>
          答错的知识点当天可以重做。答对后先隔一天，再逐步拉长间隔。每次先用一道题试试能否自己想起来。
        </p>
      </div>
      <section class="coding-review-summary">
        <h2>错误模式分析</h2>
        <p v-if="!patterns.some((p) => p.total)">
          完成概念、边界和复杂度练习后，这里会按实际答题记录给出建议。
        </p>
        <ul class="error-patterns">
          <li v-for="p in patterns" :key="p.category">
            <strong
              >{{ p.title }}：{{ p.wrong }} / {{ p.total }} 次答错<span v-if="p.total"
                >（{{ Math.round(p.rate * 100) }}%）</span
              ></strong
            >
            <p>{{ p.advice }}</p>
            <CourseLink :to="p.path" @navigate="emit('navigate', $event)">去针对性练习 →</CourseLink>
          </li>
        </ul>
        <h2>今天要重新写的代码 · {{ codingDue.length }}</h2>
        <p>先独立写，再运行和修正。编程任务按实际测试结果安排下一次复习。</p>
        <CourseLink to="/practice/review" @navigate="emit('navigate', $event)"
          >打开编程复习清单 →</CourseLink
        >
        <ul v-if="codingDue.length">
          <li v-for="[id] in codingDue.slice(0, 5)" :key="id">
            <CourseLink :to="'/practice/review/' + id" @navigate="emit('navigate', $event)"
              >{{ CODING_INDEX[id].title }} →</CourseLink
            >
          </li>
        </ul>
      </section>
      <h2>概念与推演复习 · {{ due.length }}</h2>
      <p v-if="!due.length" class="study-note">
        今天没有到期的题。做过小节练习后，题目会自动排到这里。你也可以直接做下面的阶段应用。
      </p>
      <ul v-else class="study-route-list">
        <li v-for="[id, r] in due" :key="id">
          <button @click="emit('navigate', '/review/' + id)">
            <span>{{ title(id) }}</span
            ><small>{{ r.needsWork ? '有错题要重做' : '到期 ' + r.due }} →</small>
          </button>
        </li>
      </ul>
      <details v-if="scheduled.length" class="study-details">
        <summary>之后安排的 {{ scheduled.length }} 项复习</summary>
        <ul class="study-route-list">
          <li v-for="[id, r] in scheduled" :key="id">
            <button @click="emit('navigate', '/review/' + id)">
              <span>{{ title(id) }}</span
              ><small>{{ r.due }} →</small>
            </button>
          </li>
        </ul>
      </details>
      <h2>阶段作品：自己判断、写出过程、验证边界</h2>
      <ul class="study-route-list">
        <li v-for="(t, i) in TRANSFERS" :key="t.id">
          <CourseLink :to="'/review/' + t.id" @navigate="emit('navigate', $event)">
            <span>阶段 {{ i + 1 }} · {{ t.title }}</span
            ><small
              >{{ progress.learning.independent.includes(t.id) ? '已独立完成' : '开始尝试' }} →</small
            >
          </CourseLink>
        </li>
      </ul>
      <p class="micro">
        复习设计参考
        <a href="https://ies.ed.gov/ncee/wwc/practiceguide/1" target="_blank" rel="noopener"
          >IES 关于间隔学习与主动回忆的指南 ↗</a
        >。页面的复习间隔可以按你的节奏使用，提前做也可以。
      </p>
    </template>
  </main>
</template>
