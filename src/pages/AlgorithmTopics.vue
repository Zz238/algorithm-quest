<script setup>
import { computed, ref, shallowRef, watch } from 'vue';
import {
  ALGORITHM_TOPICS,
  ROADMAP_ITEMS,
  ROADMAP_STAGES,
  ROADMAP_SOURCE,
  roadmapItemRoute,
} from '../data/algorithm-roadmap.js';
import { loadAlgorithmTopic } from '../data/topic-loader.js';
import { useCodingProgress } from '../coding-progress.js';
import CourseLink from '../components/CourseLink.vue';
import TopicArticle from '../components/TopicArticle.vue';
import UiSearchField from '../components/ui/UiSearchField.vue';
const props = defineProps({
  topicId: String,
  stageId: String,
  target: Object,
  owner: String,
  disabled: Boolean,
});
const emit = defineEmits(['navigate']);
const service = useCodingProgress();
const query = ref('');
const topic = shallowRef(null),
  issue = ref(''),
  loading = ref(false);
let request = 0;
async function load(id) {
  const current = ++request;
  topic.value = null;
  issue.value = '';
  loading.value = !!id;
  if (!id) return;
  try {
    const result = await loadAlgorithmTopic(id);
    if (current === request) topic.value = result;
  } catch {
    if (current === request) issue.value = '这一篇暂时未能加载，请重试。';
  } finally {
    if (current === request) loading.value = false;
  }
}
watch(() => props.topicId, load, { immediate: true });
const stages = computed(() => ROADMAP_STAGES.filter((s) => !props.stageId || s.id === props.stageId));
const normalize = (text) => text.normalize('NFKC').toLocaleLowerCase('zh-CN');
function items(stage) {
  return [...ROADMAP_ITEMS, ...ALGORITHM_TOPICS.filter((t) => !t.sourceSection)].filter(
    (t) => t.stage === stage && normalize(t.title).includes(normalize(query.value.trim())),
  );
}
const count = computed(() => stages.value.reduce((sum, s) => sum + items(s.id).length, 0));
const readTopics = computed(() => new Set(service?.progress.learning.topicsRead || []));
const readCount = computed(() => ALGORITHM_TOPICS.filter((t) => readTopics.value.has(t.id)).length);
</script>
<template>
  <main class="topics-page" :class="{ 'topic-detail': topicId }">
    <template v-if="!topicId">
      <header class="topics-lead">
        <span class="eyebrow">基础课之后，也可以按需要回来查</span>
        <h1>{{ ROADMAP_STAGES.find((s) => s.id === stageId)?.title || '算法专题与进阶路线' }}</h1>
        <p>
          从数据怎样存，到怎样少做重复工作。每篇先用生活里的例子说清问题，再看状态变化、概念与适用条件，最后练习。
        </p>
        <p class="micro">
          参考路线的 66 个知识点已连接到主线课程或新专题，另补二进制预备篇。新专题已读 {{ readCount }} /
          {{ ALGORITHM_TOPICS.length }} 篇；已读与独立编程通过分别记录。
        </p>
        <div class="study-actions">
          <CourseLink to="/" @navigate="emit('navigate', $event)">回基础课程目录 →</CourseLink
          ><CourseLink to="/practice" @navigate="emit('navigate', $event)">去动手编程 →</CourseLink>
        </div>
      </header>
      <aside class="study-note">
        <strong>第一次接触算法，从哪里开始？</strong>
        <p>
          先学 Java
          起步和主线的数组、循环，再挑对应专题。进阶篇是选学内容，不必全部学完才继续基础课。篇首的“先会这些”可以直接回到前置讲解。
        </p>
        <CourseLink to="/java" @navigate="emit('navigate', $event)">打开 Java 起步 →</CourseLink>
      </aside>
      <nav class="topic-stage-nav" aria-label="专题阶段">
        <CourseLink
          to="/topics"
          :aria-current="!stageId ? 'page' : undefined"
          @navigate="emit('navigate', $event)"
          >全部阶段</CourseLink
        ><CourseLink
          v-for="s in ROADMAP_STAGES"
          :key="s.id"
          :to="'/topics/stage/' + s.id"
          :aria-current="stageId === s.id ? 'page' : undefined"
          @navigate="emit('navigate', $event)"
          >{{ s.title }}</CourseLink
        >
      </nav>
      <UiSearchField
        v-model="query"
        label="按专题名称筛选"
        placeholder="例如：前缀和、并查集、背包"
        maxlength="100"
      />
      <p v-if="!count" class="empty-state" role="status">
        没有匹配的专题。试试缩短关键词，或切换到“全部阶段”。
      </p>
      <section v-for="s in stages" v-show="items(s.id).length" :key="s.id" class="topic-stage-section">
        <h2>{{ s.title }}</h2>
        <p>{{ s.description }}</p>
        <ol class="topic-route-list">
          <li v-for="t in items(s.id)" :key="t.id">
            <CourseLink :to="roadmapItemRoute(t)" @navigate="emit('navigate', $event)"
              ><span
                ><strong>{{ t.title }}</strong
                ><small>{{
                  t.lesson ? '主线课程 · 回顾基础' : '专题 · 生活例子、逐步推理与两道自检'
                }}</small></span
              ><span class="topic-route-status"
                >{{ t.lesson ? '回主线' : readTopics.has(t.id) ? '已读' : '打开' }} →</span
              ></CourseLink
            >
          </li>
        </ol>
      </section>
      <footer class="topic-reference">
        <p>
          路线编排参考
          <a :href="ROADMAP_SOURCE.url" target="_blank" rel="noopener noreferrer"
            >{{ ROADMAP_SOURCE.name }} ↗</a
          >。讲解、数据和练习为本站重新设计；复杂度与限制按本文具体实现说明。
        </p>
      </footer>
    </template>
    <template v-else>
      <p v-if="loading" class="page-loading" role="status">正在加载专题…</p>
      <div v-else-if="issue" class="empty-state" role="alert">
        <p>{{ issue }}</p>
        <button @click="load(topicId)">重新加载</button>
      </div>
      <TopicArticle
        v-else-if="topic"
        :key="topic.id + ':' + owner"
        :topic="topic"
        :target="target"
        :owner="owner"
        :disabled="disabled"
        @navigate="emit('navigate', $event)"
      />
    </template>
  </main>
</template>
