<script setup>
import { ref, computed, toRef } from 'vue';
import { useLessonComments } from '../useLessonComments.js';
import { COMMENT_LIMIT, commentLength, isSendKey } from '../comments.js';
import UiSegments from './ui/UiSegments.vue';
import UiButton from './ui/UiButton.vue';
import UiStatus from './ui/UiStatus.vue';
const props = defineProps({ lessonId: { type: String, required: true }, user: Object, service: Object });
const emit = defineEmits(['login']);
const model = useLessonComments(toRef(props, 'lessonId'), toRef(props, 'user'), props.service);
const {
  draft,
  items,
  total,
  order,
  page,
  pageCount,
  loading,
  sending,
  loadError,
  sendError,
  status,
  withdrawing,
  canSend,
  refresh,
  send,
  withdraw,
  available,
} = model;
const preview = ref(false),
  composing = ref(false);
const composerOpen = ref(false);
let compositionEnded = -Infinity;
const length = computed(() => commentLength(draft.value));
function keydown(event) {
  if (isSendKey(event, composing.value, performance.now() - compositionEnded < 50)) {
    event.preventDefault();
    if (!event.repeat) send();
  }
}
function compositionEnd() {
  composing.value = false;
  compositionEnded = performance.now();
}
function formatTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? '刚刚'
    : new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}
function sort(value) {
  page.value = 0;
  order.value = value;
}
</script>
<template>
  <section class="lesson-comments" aria-labelledby="discussion-title">
    <div class="discussion-intro">
      <span class="eyebrow">本节交流</span>
      <h2 id="discussion-title">本节讨论</h2>
      <p>写下本节的问题、解法或阅读补充。</p>
    </div>
    <div class="discussion-heading">
      <h3>
        <strong>{{ total }}</strong> 条公开评论
      </h3>
      <UiSegments
        class="comment-sort"
        :model-value="order"
        label="评论排序"
        :options="[
          { value: 'oldest', label: '最早' },
          { value: 'newest', label: '最新' },
        ]"
        :disabled="loading"
        @update:model-value="sort"
      />
    </div>
    <button v-if="!composerOpen" type="button" class="text-button" @click="composerOpen = true">
      {{ total ? '参与本节讨论' : '本节还没有讨论，写下问题或补充' }} →
    </button>
    <form v-if="composerOpen" class="comment-composer" @submit.prevent="send">
      <div class="composer-tabs" aria-label="讨论编辑模式">
        <UiSegments
          v-model="preview"
          label="写评论或预览"
          :options="[
            { value: false, label: '写评论' },
            { value: true, label: '预览' },
          ]"
        /><span class="composer-label">公开 · 本节交流</span>
        <button type="button" @click="composerOpen = false">收起输入区</button>
      </div>
      <div v-if="!preview" class="comment-input-wrap">
        <label :for="'comment-input-' + lessonId" class="sr-only">本节公开评论</label
        ><textarea
          :id="'comment-input-' + lessonId"
          v-model="draft"
          :disabled="!user || !available"
          :maxlength="COMMENT_LIMIT * 2"
          :placeholder="
            user
              ? '你是怎样理解这一步的？也可以留下疑问或改进建议…'
              : '使用 GitHub 登录后，参与公开讨论…'
          "
          @keydown="keydown"
          @compositionstart="composing = true"
          @compositionend="compositionEnd"
          :aria-describedby="'comment-help-' + lessonId"
        ></textarea>
      </div>
      <div v-else class="comment-preview">
        <p v-if="draft" class="comment-body">{{ draft }}</p>
        <p v-else class="muted">写下一点内容，就能在这里预览。</p>
      </div>
      <div class="composer-bottom">
        <div>
          <p :id="'comment-help-' + lessonId">Enter 发送 · Shift + Enter 换行</p>
          <p class="comment-privacy">公开评论所有访客可见；私人学习笔记仅自己可见。</p>
        </div>
        <span class="comment-length" :class="{ exceeded: length > COMMENT_LIMIT }"
          >{{ length }} / {{ COMMENT_LIMIT }}</span
        ><UiButton
          v-if="user"
          variant="primary"
          icon="send"
          class="send-comment"
          type="submit"
          :loading="sending"
          :disabled="!canSend"
        >
          {{ sending ? '发送中…' : '发送评论' }}</UiButton
        >
        <UiButton v-else variant="primary" class="send-comment" @click="emit('login')"
          >使用 GitHub 登录</UiButton
        >
      </div>
      <p v-if="!available" class="comment-notice">
        离线版可使用私人学习笔记，公开评论请在正式网站使用。
      </p>
    </form>
    <p v-if="sendError" class="comment-error" role="alert">{{ sendError }}</p>
    <p class="comment-feedback" role="status">{{ status }}</p>
    <div v-if="loadError" class="comment-load-error" role="status">
      <p>{{ loadError }}</p>
      <button @click="refresh" :disabled="loading">重新加载评论</button>
    </div>
    <p v-if="loading && !items.length" class="comment-empty">
      <UiStatus loading>正在加载本节评论…</UiStatus>
    </p>
    <p v-else-if="!items.length && !loadError" class="comment-empty">
      还没有评论。可以留下你的问题，或公开分享这一节的解题思路。
    </p>
    <ol
      class="comment-list"
      aria-label="本节公开评论列表"
      aria-live="polite"
      aria-relevant="additions removals"
    >
      <li v-for="item in items" :key="item.id" class="comment-card">
        <div class="comment-card-heading">
          <span class="comment-avatar" aria-hidden="true">{{
            item.author_name.trim().slice(0, 1).toUpperCase()
          }}</span>
          <div class="comment-author">
            <strong>{{ item.author_name }}</strong
            ><span v-if="user && item.is_mine" class="comment-mine">我</span
            ><time :datetime="item.created_at">{{ formatTime(item.created_at) }}</time>
          </div>
          <span class="comment-floor" aria-hidden="true">#{{ item.id.slice(0, 4) }}</span>
        </div>
        <p class="comment-body">{{ item.body }}</p>
        <div v-if="user && item.is_mine" class="comment-card-actions">
          <button @click="withdraw(item)" :disabled="withdrawing === item.id">
            {{ withdrawing === item.id ? '撤回中…' : '撤回我的评论' }}
          </button>
        </div>
      </li>
    </ol>
    <div v-if="pageCount > 1" class="comment-pagination">
      <button @click="page--" :disabled="page === 0 || loading">← 上一页</button
      ><span>{{ page + 1 }} / {{ pageCount }} 页</span
      ><button @click="page++" :disabled="page + 1 >= pageCount || loading">下一页 →</button>
    </div>
  </section>
</template>
