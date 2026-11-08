<script setup>
import { computed, ref } from 'vue';
import { useStudyDraft } from '../study-drafts.js';
const props = defineProps({ lesson: Object, path: String, owner: String });
const draft = useStudyDraft(props.owner, props.lesson.id, 'content-feedback', (raw) => ({
  area: ['概念讲解', '图解与实验', 'Java 代码', '练习题'].includes(raw?.area) ? raw.area : '概念讲解',
  detail: typeof raw?.detail === 'string' ? raw.detail.slice(0, 800) : '',
}));
const status = ref('');
const body = computed(
  () =>
    '小节：' +
    props.lesson.id +
    ' · ' +
    props.lesson.title +
    '\n位置：' +
    props.path +
    '\n内容：' +
    draft.area +
    '\n\n遇到的问题：\n' +
    draft.detail,
);
const link = computed(
  () =>
    'https://github.com/Zz238/algorithm-quest/issues/new?' +
    new URLSearchParams({ title: '课程反馈：' + props.lesson.title, body: body.value }),
);
async function copy() {
  try {
    await navigator.clipboard.writeText(body.value);
    status.value = '已复制反馈草稿。';
  } catch {
    status.value = '复制暂不可用，可以直接选择下方草稿复制。';
  }
}
</script>
<template>
  <details class="content-feedback study-details">
    <summary>这段没看懂／内容可能有误</summary>
    <p>先生成一份反馈草稿。这里只附小节和你填写的说明，不会附上私人笔记，也不会自动发布。</p>
    <label
      >问题位置
      <select v-model="draft.area">
        <option>概念讲解</option>
        <option>图解与实验</option>
        <option>Java 代码</option>
        <option>练习题</option>
      </select></label
    >
    <label class="mini-output"
      ><span>哪一句或哪一步让你卡住了？</span
      ><textarea
        v-model="draft.detail"
        rows="3"
        maxlength="800"
        placeholder="例如：我看不出第二张图中 b 的箭头为什么也指向同一份数组。"
      />
    </label>
    <details>
      <summary>查看将要带上的反馈草稿</summary>
      <pre class="study-code">{{ body }}</pre>
    </details>
    <div class="study-actions">
      <button type="button" @click="copy">复制反馈草稿</button
      ><a :href="link" target="_blank" rel="noopener noreferrer">到 GitHub 核对并提交 ↗</a>
    </div>
    <p role="status">{{ status }}</p>
  </details>
</template>
