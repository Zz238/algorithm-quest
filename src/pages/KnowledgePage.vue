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
  selected = ref('');
const canvas = ref(null),
  canvasWidth = ref(828);
let resizeObserver;
onMounted(() => {
  if (canvas.value.clientWidth) canvasWidth.value = canvas.value.clientWidth;
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
    path: '/java/' + j.id.slice(5),
    dependencies: [],
    done: props.progress.learning.prepared.includes(j.id),
  })),
  ...chapters.flatMap((c) =>
    c.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      group: '第 ' + c.id + ' 章',
      path: lessonRoute(l.id),
      dependencies: priorIds(l.id),
      done: props.progress.lessons.includes(l.id),
    })),
  ),
  ...ALGORITHM_TOPICS.map((t) => ({
    id: 'topic-' + t.id,
    title: t.title,
    group: '算法专题',
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
      (scope.value === 'all' || (scope.value === 'done' ? n.done : !n.done)),
  ),
);
const columns = computed(() => Math.max(1, Math.floor((canvasWidth.value - 24) / 245)));
const nodeWidth = computed(() => (canvasWidth.value - 48 - (columns.value - 1) * 35) / columns.value);
const positioned = computed(() =>
  visible.value.map((node, i) => ({
    ...node,
    x: 24 + (i % columns.value) * (nodeWidth.value + 35),
    y: 24 + Math.floor(i / columns.value) * 76,
  })),
);
const canvasHeight = computed(() =>
  Math.max(96, Math.ceil(visible.value.length / columns.value) * 76 + 24),
);
const links = computed(() => {
  const shown = new Map(positioned.value.map((n) => [n.id, n]));
  return positioned.value.flatMap((n) =>
    n.dependencies.filter((id) => shown.has(id)).map((id) => ({ from: shown.get(id), to: n })),
  );
});
function edgePath({ from, to }) {
  if (from.y === to.y) return `M${from.x + nodeWidth.value},${from.y + 26} H${to.x}`;
  const startX = from.x + nodeWidth.value / 2,
    endX = to.x + nodeWidth.value / 2,
    laneX = Math.min(from.x, to.x) - 14;
  return `M${startX},${from.y + 52} V${from.y + 64} H${laneX} V${to.y - 12} H${endX} V${to.y}`;
}
function titleLines(node) {
  const title = (node.done ? '已读 · ' : '') + node.title;
  const count = Math.max(10, Math.floor((nodeWidth.value - 20) / 12));
  return title.length > count
    ? [title.slice(0, count), title.slice(count, count * 2 - 1) + (title.length >= count * 2 ? '…' : '')]
    : [title];
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
    <h1>看见知识之间的连接</h1>
    <p>
      包含 {{ chapters.reduce((n, c) => n + c.lessons.length, 0) }} 节课程、{{ ALGORITHM_TOPICS.length }}
      篇专题及 Java 预备课。箭头从前置知识指向后续内容；亮色为已读，灰色为未读。完成阅读不等于已掌握。
    </p>
    <div class="practice-toolbar">
      <label>查找节点<input v-model="query" type="search" placeholder="递归、链表、背包…" /></label
      ><label
        >阅读状态<select v-model="scope">
          <option value="all">全部</option>
          <option value="done">已读</option>
          <option value="new">未读</option>
        </select></label
      ><button v-if="selected" @click="selected = ''">取消聚焦</button>
    </div>
    <p class="micro">
      图谱随页面完整展开；悬停或聚焦节点查看依赖，点击节点进入课程。键盘用户也可在下方节点列表中直接进入。
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
          :class="['knowledge-node', { done: n.done, dim: !related(n), selected: n.id === selected }]"
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
          <rect :width="nodeWidth" height="52" rx="6" />
          <text x="10" :y="titleLines(n).length === 1 ? 31 : 21">
            <tspan v-for="(line, i) in titleLines(n)" :key="i" x="10" :dy="i ? 18 : 0">{{ line }}</tspan>
          </text>
        </g>
      </svg>
    </div>
    <section v-if="active" class="study-note" aria-live="polite">
      <h2>{{ active.title }}</h2>
      <p>
        前置知识：{{
          active.dependencies.map((id) => byId[id]?.title || id).join('、') || '无额外前置要求'
        }}
      </p>
      <CourseLink :to="active.path" @navigate="emit('navigate', $event)">打开课程 →</CourseLink>
    </section>
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
