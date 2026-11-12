<script setup>
import { computed, ref } from 'vue';
import { CODING_TASKS, CODING_BY_ID } from '../data/coding-catalog.js';
import { codingReviewTask } from '../data/coding-review.js';
import { chapters, lessonRoute } from '../data/course.js';
import { JAVA_BY_ID, javaRoute } from '../data/java-starter.js';
import { useCodingProgress } from '../coding-progress.js';
import { localDateKey } from '../study-state.js';
import JavaCodingTask from '../components/JavaCodingTask.vue';
import CourseLink from '../components/CourseLink.vue';
import UiSearchField from '../components/ui/UiSearchField.vue';
import UiCheckbox from '../components/ui/UiCheckbox.vue';
import { ALGORITHM_TOPIC_BY_ID } from '../data/algorithm-roadmap.js';
import { adaptiveLevel, recommendTasks } from '../learning-insights.js';
const props = defineProps({ taskId: String, owner: String, review: Boolean, disabled: Boolean });
const emit = defineEmits(['navigate']);
const coding = useCodingProgress();
const task = computed(() => {
  const base = CODING_BY_ID[props.taskId];
  return base && props.review ? codingReviewTask(base) : base;
});
const query = ref(''),
  filter = ref(props.review ? 'due' : 'all');
const today = localDateKey();
const records = computed(() => coding?.progress.learning.coding || {});
const adaptive = ref(true);
const recommendedLevel = computed(() => adaptiveLevel(coding?.progress.learning.attempts || []));
const orderedTasks = computed(() =>
  adaptive.value
    ? recommendTasks(CODING_TASKS, records.value, coding?.progress.learning.attempts || [])
    : CODING_TASKS,
);
const tasks = computed(() =>
  orderedTasks.value.filter(
    (t) =>
      (!query.value ||
        (t.title + ' ' + t.task + ' ' + t.level).toLowerCase().includes(query.value.toLowerCase())) &&
      (filter.value === 'all' ||
        (filter.value === 'due' && records.value[t.id]?.due <= today) ||
        (filter.value === 'new' && !records.value[t.id]?.passedAt) ||
        (filter.value === 'passed' && records.value[t.id]?.passedAt)),
  ),
);
const related = computed(() => {
  const t = task.value;
  if (!t) return null;
  const topicId = t.topic.startsWith('topic-') ? t.topic.slice(6) : null;
  if (ALGORITHM_TOPIC_BY_ID[topicId])
    return { path: '/topics/' + topicId, title: ALGORITHM_TOPIC_BY_ID[topicId].title };
  if (JAVA_BY_ID[t.topic]) return { path: javaRoute(t.topic), title: JAVA_BY_ID[t.topic].title };
  const lesson = chapters.flatMap((c) => c.lessons).find((l) => l.id === t.topic);
  return lesson
    ? { path: lessonRoute(lesson.id), title: lesson.title }
    : { path: '/review/' + t.topic, title: '对应阶段应用' };
});
</script>
<template>
  <main class="study-page coding-page">
    <template v-if="task"
      ><CourseLink :to="review ? '/practice/review' : '/practice'" @navigate="emit('navigate', $event)"
        >← {{ review ? '编程复习清单' : '编程练习库' }}</CourseLink
      >
      <h1>{{ task.title }}</h1>
      <p v-if="related">
        需要回顾？<CourseLink :to="related.path" @navigate="emit('navigate', $event)">{{
          related.title
        }}</CourseLink>
      </p>
      <JavaCodingTask
        :key="task.id + review"
        :task="task"
        :owner="owner"
        :disabled="disabled"
        :review="review"
    /></template>
    <template v-else
      ><span class="eyebrow">{{ review ? '编程复习' : '编程练习' }}</span>
      <h1>{{ review ? '隔几天，再独立写出来' : '把看懂的知识写成程序' }}</h1>
      <p>
        {{ CODING_TASKS.length }}
        项独立任务。从修改一个返回值，到完成数据结构和阶段作品。先通过对应讲解，再选任务；“工程基础”和“进阶衔接”有单独的补充说明。
      </p>
      <div class="practice-toolbar coding-filters">
        <UiSearchField
          v-model="query"
          label="搜索编程任务"
          placeholder="循环、链表、计数、异常…"
        /><label
          >显示<select v-model="filter">
            <option value="all">全部任务</option>
            <option value="due">今天待复习</option>
            <option value="new">尚未通过</option>
            <option value="passed">曾经通过</option>
          </select></label
        >
      </div>
      <UiCheckbox v-model="adaptive" class="adaptive-toggle">自适应推荐</UiCheckbox>
      <p class="micro">
        <span v-if="adaptive"
          >根据最近 12 次有效答题的正确率和耗时推荐，当前建议：{{
            ['起步巩固', '基础应用', '综合挑战'][recommendedLevel - 1]
          }}。记录不足时从起步任务开始；可随时关闭推荐。</span
        >
        复习先隐藏参考答案，重新编写；独立通过后按1、3、7、14、30天逐步安排。当天重复通过不会反复延长间隔。
      </p>
      <p v-if="!tasks.length" class="study-note">没有符合条件的任务。可以更换筛选，或清空搜索内容。</p>
      <ol class="coding-task-list">
        <li v-for="t in tasks" :key="t.id">
          <CourseLink
            :to="(review ? '/practice/review/' : '/practice/') + t.id"
            @navigate="emit('navigate', $event)"
            ><span
              ><strong>{{ t.title }}</strong
              ><small>{{ t.level }} · {{ t.cases.length }} 组测试</small></span
            ><span
              >{{
                records[t.id]?.due <= today
                  ? '待复习'
                  : records[t.id]?.independentAt
                    ? '曾独立通过'
                    : records[t.id]?.passedAt
                      ? '参考后通过'
                      : '开始编写'
              }}
              →</span
            ></CourseLink
          >
        </li>
      </ol></template
    >
  </main>
</template>
