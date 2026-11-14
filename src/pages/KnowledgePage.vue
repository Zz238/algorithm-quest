<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { chapters, JAVA_INDEX, lessonRoute } from '../data/course-index.js';
import { ALGORITHM_TOPICS } from '../data/algorithm-roadmap.js';
import { TOPIC_LESSONS } from '../data/algorithm-topics.js';
import { priorIds } from '../data/learning-path.js';
import CourseLink from '../components/CourseLink.vue';
const props = defineProps({ progress: Object });
const emit = defineEmits(['navigate']);
const query = ref(''),
  scope = ref('all'),
  category = ref('all'),
  selected = ref('');
const canvas = ref(null),
  canvasWidth = ref(828);
let resizeObserver;
onMounted(() => {
  if (canvas.value?.clientWidth) canvasWidth.value = canvas.value.clientWidth;
  if (typeof ResizeObserver === 'undefined') return;
  resizeObserver = new ResizeObserver(([entry]) => {
    canvasWidth.value = entry.contentRect.width;
  });
  resizeObserver.observe(canvas.value);
});
onUnmounted(() => resizeObserver?.disconnect());
const nodes = computed(() => [
  ...Object.values(JAVA_INDEX).map((j) => ({
    id: j.id,
    title: j.title,
    group: 'Java 预备课',
    kind: 'java',
    path: '/java/' + j.id.slice(5),
    dependencies: [],
    done: props.progress.learning.prepared.includes(j.id),
  })),
  ...chapters.flatMap((c) =>
    c.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      group: '第 ' + c.id + ' 章',
      kind: 'course',
      path: lessonRoute(l.id),
      dependencies: priorIds(l.id),
      done: props.progress.lessons.includes(l.id),
    })),
  ),
  ...ALGORITHM_TOPICS.map((t) => ({
    id: 'topic-' + t.id,
    title: t.title,
    group: '算法专题',
    kind: 'topic',
    path: '/topics/' + t.id,
    dependencies: (TOPIC_LESSONS.find((l) => l.id === t.id)?.requires || []).map((id) =>
      ALGORITHM_TOPICS.some((a) => a.id === id) ? 'topic-' + id : id,
    ),
    done: props.progress.learning.topicsRead.includes(t.id),
  })),
]);
const byId = computed(() => Object.fromEntries(nodes.value.map((n) => [n.id, n])));
const active = computed(() => byId.value[selected.value]);
const visible = computed(() =>
  nodes.value.filter(
    (n) =>
      (!query.value || (n.title + n.group).toLowerCase().includes(query.value.toLowerCase())) &&
      (category.value === 'all' || n.kind === category.value) &&
      (scope.value === 'all' || (scope.value === 'done' ? n.done : !n.done)),
  ),
);
const columns = computed(() => Math.max(1, Math.floor((canvasWidth.value - 24) / 245)));
const nodeWidth = computed(() => (canvasWidth.value - 48 - (columns.value - 1) * 35) / columns.value);
const positioned = computed(() =>
  visible.value.map((node, i) => ({
    ...node,
    x: 24 + (i % columns.value) * (nodeWidth.value + 35),
    y: 24 + Math.floor(i / columns.value) * 82,
  })),
);
const canvasHeight = computed(() =>
  Math.max(104, Math.ceil(visible.value.length / columns.value) * 82 + 24),
);
const links = computed(() => {
  const shown = new Map(positioned.value.map((n) => [n.id, n]));
  return positioned.value.flatMap((n) =>
    n.dependencies.filter((id) => shown.has(id)).map((id) => ({ from: shown.get(id), to: n })),
  );
});
function edgePath({ from, to }) {
  if (from.y === to.y) return `M${from.x + nodeWidth.value},${from.y + 30} H${to.x}`;
  const startX = from.x + nodeWidth.value / 2,
    endX = to.x + nodeWidth.value / 2,
    laneX = Math.min(from.x, to.x) - 14;
  return `M${startX},${from.y + 60} V${from.y + 70} H${laneX} V${to.y - 12} H${endX} V${to.y}`;
}
function shortTitle(node) {
  const count = Math.max(10, Math.floor((nodeWidth.value - 24) / 13));
  return node.title.length > count ? node.title.slice(0, count - 1) + '…' : node.title;
}
function related(n) {
  return (
    !selected.value ||
    n.id === selected.value ||
    active.value?.dependencies.includes(n.id) ||
    n.dependencies.includes(selected.value)
  );
}
</script>
<template>
  <main class="study-page knowledge-page">
    <CourseLink to="/" @navigate="emit('navigate', $event)">← 课程目录</CourseLink>
    <span class="eyebrow">前置关系 · 全局导览</span>
    <h1>看见知识之间的连接</h1>
    <p>
      涵盖 15 节 Java 预备课、{{ chapters.reduce((n, c) => n + c.lessons.length, 0) }} 节核心课程与
      {{ ALGORITHM_TOPICS.length }}
      篇进阶专题。悬停或聚焦任意节点即可高亮它的前置与后续脉络，点击节点直达对应课程。
    </p>
    <div class="practice-toolbar">
      <label>查找节点<input v-model="query" type="search" placeholder="递归、链表、背包…" /></label
      ><label
        >所属模块<select v-model="category">
          <option value="all">全部模块（128）</option>
          <option value="java">Java 预备课（15）</option>
          <option value="course">12 章核心课（72）</option>
          <option value="topic">算法专题（41）</option>
        </select></label
      ><label
        >阅读状态<select v-model="scope">
          <option value="all">全部</option>
          <option value="done">已读</option>
          <option value="new">未读</option>
        </select></label
      ><button v-if="selected" @click="selected = ''">取消聚焦</button>
    </div>
    <section v-if="active" class="study-note knowledge-active-card" aria-live="polite">
      <div>
        <span class="eyebrow">{{ active.group }} · {{ active.done ? '已读' : '未读' }}</span>
        <h2>{{ active.title }}</h2>
        <p>
          前置知识：{{
            active.dependencies.map((id) => byId[id]?.title || id).join('、') || '零基础可直接开始'
          }}
        </p>
      </div>
      <CourseLink :to="active.path" @navigate="emit('navigate', $event)">打开该节课程 →</CourseLink>
    </section>
    <p v-else class="micro">
      图谱随页面完整展开；悬停或聚焦节点查看依赖关系，点击节点进入课程。键盘用户也可在下方列表中直接跳转。
    </p>
    <div ref="canvas" class="knowledge-canvas" aria-label="完整知识依赖图">
      <svg
        :viewBox="`0 0 ${canvasWidth} ${canvasHeight}`"
        width="100%"
        :height="canvasHeight"
        role="group"
        aria-label="课程与专题的前置关系"
      >
        <defs>
          <marker
            id="knowledge-arrow"
            markerWidth="7"
            markerHeight="7"
            refX="7"
            refY="3.5"
            orient="auto"
          >
            <path d="M0,0 L7,3.5 L0,7" fill="var(--muted)" />
          </marker>
        </defs>
        <path
          v-for="edge in links"
          :key="edge.from.id + ':' + edge.to.id"
          :d="edgePath(edge)"
          fill="none"
          :class="['knowledge-edge', { focused: selected === edge.from.id || selected === edge.to.id }]"
          marker-end="url(#knowledge-arrow)"
        />
        <g
          v-for="n in positioned"
          :key="n.id"
          :transform="`translate(${n.x},${n.y})`"
          :class="[
            'knowledge-node',
            'kind-' + n.kind,
            { done: n.done, dim: !related(n), selected: n.id === selected },
          ]"
          role="button"
          tabindex="0"
          :aria-label="n.group + ' ' + n.title + (n.done ? ' 已读' : ' 未读')"
          @pointerenter="selected = n.id"
          @focus="selected = n.id"
          @click="emit('navigate', n.path)"
          @keydown.enter.prevent="emit('navigate', n.path)"
          @keydown.space.prevent="emit('navigate', n.path)"
        >
          <title>{{ n.group }} · {{ n.title }}</title>
          <rect :width="nodeWidth" height="60" rx="8" />
          <text x="12" y="22">
            <tspan class="node-meta" x="12" dy="0">{{ n.group }} · {{ n.done ? '已读' : '待学' }}</tspan>
            <tspan class="node-title" x="12" dy="22">{{ shortTitle(n) }}</tspan>
          </text>
        </g>
      </svg>
    </div>
    <details class="study-details">
      <summary>展开可访问的节点列表（{{ visible.length }}）</summary>
      <ul>
        <li v-for="n in visible" :key="n.id">
          <CourseLink :to="n.path" @navigate="emit('navigate', $event)"
            >{{ n.group }} · {{ n.title }} · {{ n.done ? '已读' : '未读' }}</CourseLink
          >
        </li>
      </ul>
    </details>
  </main>
</template>
