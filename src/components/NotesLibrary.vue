<script setup>
import { computed, ref } from 'vue';
import { findLesson, lessonRoute } from '../data/course.js';
import { downloadText } from '../download.js';
import ConfirmAction from './ConfirmAction.vue';
import { noteReferences } from '../study-target.js';
import CourseLink from './CourseLink.vue';
const props = defineProps({ notes: Object, saveStatus: String, disabled: Boolean });
const emit = defineEmits(['navigate', 'remove']);
const query = ref(''),
  pending = ref(null),
  dialog = ref(null);
const notes = computed(() =>
  Object.entries(props.notes || {})
    .filter(([id, value]) => value.trim() && findLesson(id))
    .map(([id, body]) => ({ id, body, title: findLesson(id).title, references: noteReferences(body) })),
);
const items = computed(() => {
  const word = query.value.trim().toLowerCase();
  return notes.value.filter((i) => !word || (i.title + ' ' + i.body).toLowerCase().includes(word));
});
function confirm(item) {
  pending.value = item;
  dialog.value.open();
}
function exportNotes() {
  const body = notes.value.map((i) => '## ' + i.title + '\n\n' + i.body + '\n').join('\n');
  downloadText('algo-quest-notes.md', '# 算法之旅 · 我的笔记\n\n' + body);
}
</script>
<template>
  <section class="notes-library" id="private-notes" aria-labelledby="notes-library-title">
    <div class="study-block-head">
      <div>
        <h2 id="notes-library-title">我的笔记</h2>
        <p>仅当前存档可见。打开原小节即可继续在右侧编辑。</p>
      </div>
      <button v-if="notes.length" type="button" @click="exportNotes">导出全部笔记 Markdown</button>
    </div>
    <p v-if="saveStatus" class="micro" role="status">{{ saveStatus }}</p>
    <label class="mini-output"
      ><span>搜索笔记</span><input type="search" v-model="query" placeholder="搜索课程标题或笔记内容"
    /></label>
    <p v-if="!items.length" role="status">
      {{ query.trim() ? '没有匹配的笔记。' : '还没有私人笔记。学习时可以在右侧记下自己的理解。' }}
    </p>
    <article v-for="item in items" :key="item.id" class="note-library-item">
      <h3>{{ item.title }}</h3>
      <p>{{ item.body }}</p>
      <div v-if="item.references.length" class="note-reference-list">
        <CourseLink
          v-for="(link, i) in item.references"
          :key="i"
          :to="link.path"
          @navigate="emit('navigate', $event)"
          >{{ link.label }} →</CourseLink
        >
      </div>
      <div class="study-actions">
        <CourseLink class="text-button" :to="lessonRoute(item.id)" @navigate="emit('navigate', $event)">
          回小节编辑 →
        </CourseLink>
        <button
          type="button"
          :disabled="disabled"
          :aria-label="'删除笔记：' + item.title"
          @click="confirm(item)"
        >
          删除
        </button>
      </div>
    </article>
    <ConfirmAction
      ref="dialog"
      title="删除这条私人笔记？"
      @confirm="pending && emit('remove', pending.id)"
    >
      <p>「{{ pending?.title }}」的笔记会被删除，其他学习记录不受影响。</p>
    </ConfirmAction>
  </section>
</template>
