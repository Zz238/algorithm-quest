<script setup>
import { chapters, requiredLessons, findLesson, lessonRoute } from '../data/course.js';
import { coreJava } from '../data/java-starter.js';
import { jumpTo } from '../useCourseNavigation.js';
import NotesLibrary from '../components/NotesLibrary.vue';
import BackupPanel from '../components/BackupPanel.vue';
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
});
const emit = defineEmits(['navigate', 'remove-note', 'apply-backup', 'reset-data']);
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
      <button class="primary" @click="emit('navigate', '/review')">
        复习与阶段练习{{ summary.due ? ' · ' + summary.due + ' 项待做' : '' }} →
      </button>
      <button @click="jumpTo('private-notes')">我的笔记</button>
      <button @click="jumpTo('study-backup')">备份与恢复</button>
      <button @click="emit('navigate', '/trial')">零基础试学</button>
    </div>
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
    <section class="record-skill">
      <h2>练习积分</h2>
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
    </section>
    <section class="chapter-record">
      <div class="section-heading">
        <h2>逐章进度</h2>
        <button class="text-button" @click="emit('navigate', continuePath)">继续学习 →</button>
      </div>
      <button v-for="c in chapters" :key="c.id" @click="emit('navigate', '/learn/' + c.id + '/0')">
        <span
          ><b>{{ String(c.id).padStart(2, '0') }}</b
          >{{ c.title }}</span
        >
        <small
          >{{ chapterRead(c) }} / {{ requiredLessons(c).length }} 节基础已读 · {{ status(c) }}
          <span aria-hidden="true">→</span></small
        >
      </button>
    </section>
    <NotesLibrary
      :notes="progress.notes"
      :save-status="saveStatus"
      :disabled="disabled"
      @navigate="emit('navigate', $event)"
      @remove="emit('remove-note', $event)"
    />
    <section v-if="progress.bookmarks.length">
      <h2>以前收藏的知识点</h2>
      <div class="saved-lessons">
        <button v-for="id in progress.bookmarks" :key="id" @click="emit('navigate', lessonRoute(id))">
          {{ findLesson(id)?.title }} <span aria-hidden="true">↗</span>
        </button>
      </div>
    </section>
    <BackupPanel
      :progress="progress"
      :owner="owner"
      :disabled="disabled"
      :recoveries="recoveries"
      @apply="emit('apply-backup', $event)"
      @reset="emit('reset-data', $event)"
    />
  </main>
</template>
