<script setup>
import { computed, ref } from 'vue';
import { lessonIds } from '../course-route.js';
import { findLesson } from '../data/course.js';
import { describeBackup, mergeBackup, parseBackup, resetProgress } from '../progress-backup.js';
import { downloadText } from '../download.js';
import ConfirmAction from './ConfirmAction.vue';

const props = defineProps({ progress: Object, owner: String, disabled: Boolean, recoveries: Array });
const emit = defineEmits(['apply', 'reset']);
const incoming = ref(null),
  mode = ref('merge'),
  conflicts = ref('current'),
  error = ref(''),
  reset = ref(''),
  confirmation = ref(null);
const guest = computed(() => props.owner === 'guest');
const overview = computed(() =>
  incoming.value ? describeBackup(props.progress, incoming.value) : null,
);
const resetNames = { progress: '学习进度', notes: '私人笔记', all: '全部本机学习数据' };
const resetMessages = {
  progress: '清除已读、练习、独立挑战、打卡、复习安排和本机作答草稿。保留私人笔记和旧收藏。',
  notes: '清除当前存档里的私人笔记。课程进度、公开讨论和答题草稿都保留。',
  all: '清除游客的进度、私人笔记、旧收藏、打卡和本机练习草稿。不会修改账号存档和隐私设置。',
};
async function choose(event) {
  const file = event.target.files?.[0],
    owner = props.owner;
  event.target.value = '';
  incoming.value = null;
  error.value = '';
  mode.value = 'merge';
  conflicts.value = 'current';
  if (!file) return;
  try {
    if (file.size > 1_000_000) throw new Error('文件超过 1 MB，请选择本站导出的一份学习备份。');
    const text = await file.text();
    if (owner === props.owner) incoming.value = parseBackup(text, lessonIds);
  } catch (e) {
    error.value = e.message;
  }
}
function download() {
  downloadText(
    'algo-quest-progress.json',
    JSON.stringify({ ...props.progress, exportedAt: new Date().toISOString() }, null, 2),
    'application/json',
  );
}
function apply() {
  if (!incoming.value || props.disabled) return;
  const replace = guest.value && mode.value === 'replace';
  const value = replace
    ? incoming.value
    : mergeBackup(props.progress, incoming.value, lessonIds, conflicts.value);
  emit('apply', {
    value,
    replace,
    done: (ok) => {
      if (ok) incoming.value = null;
    },
  });
}
function requestReset(scope) {
  reset.value = scope;
  confirmation.value.open();
}
function confirmReset() {
  if (reset.value)
    emit('reset', { value: resetProgress(props.progress, reset.value), scope: reset.value });
}
</script>
<template>
  <section class="backup" id="study-backup">
    <h2>备份学习记录</h2>
    <p>
      {{
        guest
          ? '游客记录在此浏览器里。清理浏览器数据前，可以先导出一份。'
          : '账号记录会同步到云端。仍可以导出一份备份，或合并已保存的记录。'
      }}
    </p>
    <div class="backup-actions">
      <button type="button" @click="download">导出进度 JSON</button>
      <label class="file-button">
        导入学习备份
        <input type="file" accept=".json,application/json" :disabled="disabled" @change="choose" />
      </label>
    </div>
    <p v-if="error" class="backup-error" role="alert">{{ error }}</p>
    <div v-if="overview" class="backup-preview" aria-label="备份导入预览">
      <h3>导入预览</h3>
      <p>
        备份包含：{{ overview.reads }} 节已读、{{ overview.practice }} 节练习通过、{{
          overview.chapters
        }}
        章已完成、{{ overview.notes }} 条笔记和 {{ overview.checkins }} 天打卡。
      </p>
      <fieldset v-if="guest">
        <legend>导入方式</legend>
        <label><input v-model="mode" type="radio" value="merge" /> 合并：保留两边的学习记录</label>
        <label><input v-model="mode" type="radio" value="replace" /> 替换：用备份覆盖当前游客记录</label>
      </fieldset>
      <p v-if="mode === 'replace'" class="backup-error">
        当前游客记录（包括
        {{ overview.currentNotes }} 条笔记）及本机作答草稿会被替换或清除。确认前可以先导出当前记录。
      </p>
      <fieldset v-else-if="overview.conflicts.length">
        <legend>{{ overview.conflicts.length }} 条笔记有不同内容</legend>
        <ul>
          <li v-for="id in overview.conflicts" :key="id">{{ findLesson(id)?.title }}</li>
        </ul>
        <label><input v-model="conflicts" type="radio" value="current" /> 冲突时保留当前笔记</label>
        <label><input v-model="conflicts" type="radio" value="backup" /> 冲突时使用备份笔记</label>
      </fieldset>
      <div class="study-actions">
        <button
          type="button"
          :disabled="disabled"
          :class="mode === 'replace' ? 'danger-action' : 'primary'"
          @click="apply"
        >
          {{ mode === 'replace' ? '确认替换游客记录' : '确认合并' }}
        </button>
        <button type="button" @click="incoming = null">取消导入</button>
      </div>
    </div>
    <details v-if="recoveries?.length" class="study-details">
      <summary>下载发现的损坏存档原件（{{ recoveries.length }}）</summary>
      <p>原文可用于排查或手动恢复。它可能包含你的私人笔记。</p>
      <div class="study-actions">
        <button
          v-for="(item, i) in recoveries"
          :key="item.key"
          type="button"
          @click="downloadText('algo-quest-recovery-' + (i + 1) + '.txt', item.raw)"
        >
          下载原件 {{ i + 1 }}
        </button>
      </div>
    </details>
    <details class="study-details">
      <summary>重置学习数据</summary>
      <p>
        {{
          guest
            ? '只影响当前浏览器的游客存档。重置前建议先导出备份。'
            : '登录时可以清除私人笔记，此操作会同步。进度重置仅适用于游客本机存档。'
        }}
      </p>
      <div class="study-actions">
        <button v-if="guest" type="button" :disabled="disabled" @click="requestReset('progress')">
          仅重置进度
        </button>
        <button type="button" :disabled="disabled" @click="requestReset('notes')">仅清空笔记</button>
        <button v-if="guest" type="button" :disabled="disabled" @click="requestReset('all')">
          重置全部
        </button>
      </div>
    </details>
    <ConfirmAction
      ref="confirmation"
      :title="'重置' + (resetNames[reset] || '学习数据') + '？'"
      confirm-label="确认重置"
      @confirm="confirmReset"
    >
      <p>{{ resetMessages[reset] }}</p>
      <p v-if="!guest">联网后，这些笔记也会从账号的其他设备上移除。</p>
    </ConfirmAction>
  </section>
</template>
