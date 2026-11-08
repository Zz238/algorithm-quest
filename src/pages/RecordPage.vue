<script setup>
import { computed } from 'vue';
import { chapters, requiredLessons, findLesson, lessonRoute } from '../data/course.js';
import { coreJava } from '../data/java-starter.js';
import { jumpTo } from '../useCourseNavigation.js';
import BackupPanel from '../components/BackupPanel.vue';
import CourseLink from '../components/CourseLink.vue';
import { localLearningGaps } from '../misconceptions.js';
import { studyTarget } from '../study-target.js';
const props = defineProps({
  progress: Object,
  summary: Object,
  chapterRead: Function,
  chapterCleared: Function,
  continuePath: String,
  owner: String,
  disabled: Boolean,
  saveStatus: String,
  recoveries: Array,
  resume: Object,
});
const emit = defineEmits(['navigate', 'remove-note', 'apply-backup', 'reset-data']);
const lessons = chapters.flatMap((c) => c.lessons);
const pending = computed(() =>
  lessons.filter((l) => props.progress.lessons.includes(l.id) && !props.progress.mastery.includes(l.id)),
);
const gaps = computed(() => localLearningGaps(props.owner, lessons, props.progress));
const noteCount = computed(
  () => Object.values(props.progress.notes).filter((value) => value.trim()).length,
);
function status(chapter) {
  if (props.chapterCleared(chapter)) return '已完成';
  const started = chapter.lessons.some(
    (l) => props.progress.lessons.includes(l.id) || props.progress.mastery.includes(l.id),
  );
  return started ? '学习中' : '未开始';
}
</script>
<template>
  <main class="record-page">
    <span class="eyebrow">你的学习</span>
    <h1>学习记录</h1>
    <p class="page-lead">阅读、基础练习和独立挑战分别记录。记下疑问后，可以从这里回到原小节。</p>
    <div class="study-actions record-shortcuts">
      <CourseLink to="/notes" @navigate="emit('navigate', $event)">我的笔记</CourseLink>
      <button @click="jumpTo('study-backup')">备份与恢复</button>
      <button @click="emit('navigate', '/trial')">零基础试学</button>
    </div>
    <section class="next-learning" aria-label="接下来做什么">
      <article>
        <h2>{{ resume ? '继续上次的任务' : '开始学习' }}</h2>
        <p>{{ resume?.title || '从推荐起点开始，不必先学完整个 Java。' }}</p>
        <p v-if="resume">{{ resume.label }} · 本机记录</p>
        <CourseLink class="primary" :to="continuePath" @navigate="emit('navigate', $event)"
          >{{ resume ? '回到上次学习' : '前往起点' }} →</CourseLink
        >
      </article>
      <article>
        <h2>今天复习</h2>
        <p>
          {{
            summary.due
              ? summary.due + ' 个知识点到期，先试一道变式再核对。'
              : '今天没有到期的复习，可以选择一道阶段作品。'
          }}
        </p>
        <CourseLink to="/review" @navigate="emit('navigate', $event)">打开复习与阶段作品 →</CourseLink>
      </article>
      <article>
        <h2>读过，还没练完</h2>
        <p>
          {{
            pending.length
              ? pending.length + ' 节的基础练习待完成。'
              : '阅读、基础练习和变式会分别记录。'
          }}
        </p>
        <CourseLink
          v-if="pending.length"
          :to="studyTarget(lessonRoute(pending[0].id), 'lesson-practice')"
          @navigate="emit('navigate', $event)"
          >继续 {{ pending[0].title.split('：')[0] }} 的练习 →</CourseLink
        >
      </article>
    </section>
    <section v-if="gaps.length" class="learning-gaps">
      <h2>需要再确认的概念</h2>
      <p>根据待重试记录列出回顾方向；这不等同于对错误原因的自动诊断。</p>
      <ul class="study-route-list">
        <li v-for="gap in gaps" :key="gap.id">
          <CourseLink
            :to="studyTarget(lessonRoute(gap.id), gap.focus.section)"
            @navigate="emit('navigate', $event)"
            ><span>{{ gap.focus.label }} · {{ gap.title.split('：')[0] }}</span
            ><small>回到概念与图解 →</small></CourseLink
          >
        </li>
      </ul>
    </section>
    <div class="record-summary">
      <div>
        <span class="eyebrow">基础阅读完成度</span
        ><strong>{{ summary.completion }}<small>%</small></strong>
        <p>
          基础 {{ summary.reads }} / {{ summary.core }} 节 · 选学 {{ summary.electiveReads }} /
          {{ summary.electives }} 节
        </p>
        <div
          class="reading-progress"
          role="progressbar"
          aria-label="基础阅读完成度"
          :aria-valuenow="summary.reads"
          :aria-valuemax="summary.core"
        >
          <i :style="{ width: summary.completion + '%' }"></i>
        </div>
      </div>
      <div class="record-metrics">
        <p>
          <strong>{{ progress.mastery.length }}</strong
          ><span>小节练习通过</span>
        </p>
        <p>
          <strong>{{ summary.independent }}</strong
          ><span>变式独立完成</span>
        </p>
        <p>
          <strong
            >{{ coreJava.filter((u) => progress.learning.prepared.includes(u.id)).length }} /
            {{ coreJava.length }}</strong
          ><span>Java 预备课已练</span>
        </p>
      </div>
    </div>
    <details class="record-skill study-details">
      <summary>练习积分与历史记录</summary>
      <p>
        <strong>{{ summary.practicePoints }}</strong> 分 ·
        {{
          summary.nextLevel
            ? '距「' + summary.nextLevel + '」还差 ' + summary.toNext + ' 分'
            : '已达到最高等级'
        }}
      </p>
      <p class="micro">
        基础练习通过、独立答对变式、完成章末题时分别加分。历史积分
        {{ summary.legacyPoints }} 分继续保留。
      </p>
    </details>
    <section class="chapter-record">
      <div class="section-heading">
        <h2>逐章进度</h2>
        <button class="text-button" @click="emit('navigate', continuePath)">继续学习 →</button>
      </div>
      <CourseLink
        v-for="c in chapters"
        :key="c.id"
        :to="'/learn/' + c.id + '/0'"
        @navigate="emit('navigate', $event)"
      >
        <span
          ><b>{{ String(c.id).padStart(2, '0') }}</b
          >{{ c.title }}</span
        >
        <small
          >{{ chapterRead(c) }} / {{ requiredLessons(c).length }} 节基础已读 · {{ status(c) }}
          <span aria-hidden="true">→</span></small
        >
      </CourseLink>
    </section>
    <section class="record-notes-summary">
      <h2>我的笔记 · {{ noteCount }}</h2>
      <p>{{ saveStatus }}</p>
      <CourseLink to="/notes" @navigate="emit('navigate', $event)"
        >搜索、整理或导出全部笔记 →</CourseLink
      >
    </section>
    <section v-if="progress.bookmarks.length">
      <h2>以前收藏的知识点</h2>
      <div class="saved-lessons">
        <button v-for="id in progress.bookmarks" :key="id" @click="emit('navigate', lessonRoute(id))">
          {{ findLesson(id)?.title }} <span aria-hidden="true">↗</span>
        </button>
      </div>
    </section>
    <details class="study-details">
      <summary>备份、恢复与重置</summary>
      <BackupPanel
        :progress="progress"
        :owner="owner"
        :disabled="disabled"
        :recoveries="recoveries"
        @apply="emit('apply-backup', $event)"
        @reset="emit('reset-data', $event)"
      />
    </details>
  </main>
</template>
