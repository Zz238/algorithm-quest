<script setup>
import { computed, defineAsyncComponent } from 'vue';
import {
  ROADMAP_ITEMS,
  ROADMAP_STAGES,
  algorithmTopicRoute,
  roadmapItemRoute,
} from '../data/algorithm-roadmap.js';
import { TOPIC_TRACE_DEFAULTS, generateTopicTrace } from '../topic-traces.js';
import { topicPrerequisite } from '../topic-links.js';
import { useStudyDraft } from '../study-drafts.js';
import { answerState } from '../answering.js';
import { useCodingProgress } from '../coding-progress.js';
import CourseLink from './CourseLink.vue';
import PracticeCard from './PracticeCard.vue';
import TopicTrace from './TopicTrace.vue';
import UiButton from './ui/UiButton.vue';
const TopicCoding = defineAsyncComponent(() => import('./TopicCoding.vue'));
const props = defineProps({ topic: Object, target: Object, owner: String, disabled: Boolean });
const emit = defineEmits(['navigate']);
const service = useCodingProgress();
const stage = ROADMAP_STAGES.find((s) => s.id === props.topic.stage);
const siblings = ROADMAP_ITEMS.filter((t) => t.stage === props.topic.stage);
const prerequisites = props.topic.requires.map(topicPrerequisite).filter(Boolean);
const canEdit = !!TOPIC_TRACE_DEFAULTS[props.topic.id];
const draft = useStudyDraft(props.owner, 'topic-' + props.topic.id, 'topic-lesson', (raw) => {
  const defaults = TOPIC_TRACE_DEFAULTS[props.topic.id];
  const config = defaults
    ? Object.fromEntries(
        Object.entries(defaults).map(([key, value]) => [
          key,
          typeof raw?.config?.[key] === 'string' || typeof raw?.config?.[key] === 'number'
            ? String(raw.config[key]).slice(0, 200)
            : value,
        ]),
      )
    : null;
  let trace;
  if (config) {
    try {
      trace = generateTopicTrace(props.topic.id, config);
    } catch {
      Object.assign(config, defaults);
    }
  }
  const length = trace?.steps.length || props.topic.example.steps.length;
  return {
    config,
    step: Number.isInteger(raw?.step) ? Math.max(0, Math.min(length - 1, raw.step)) : 0,
    quiz: props.topic.checks.map((q, i) => answerState(q, raw?.quiz?.[i])),
  };
});
const read = computed(() => service?.progress.learning.topicsRead?.includes(props.topic.id));
const route = algorithmTopicRoute(props.topic.id);
const anchors = [
  ['topic-example', '跟例子走'],
  ['topic-definition', '概念与条件'],
  ['topic-check', '自检与变式'],
  ...(props.topic.coding ? [['topic-coding', '动手编程']] : []),
];
</script>
<template>
  <aside class="topic-sidebar">
    <CourseLink to="/topics" @navigate="emit('navigate', $event)">← 算法专题</CourseLink>
    <details class="topic-sibling-nav">
      <summary>{{ stage.title }}</summary>
      <nav aria-label="同阶段专题">
        <CourseLink
          v-for="t in siblings"
          :key="t.id"
          :to="roadmapItemRoute(t)"
          :aria-current="t.id === topic.id ? 'page' : undefined"
          @navigate="emit('navigate', $event)"
          >{{ t.title }}</CourseLink
        >
      </nav>
    </details>
    <nav class="topic-on-this-page" aria-label="本篇目录">
      <strong>本篇</strong
      ><CourseLink
        v-for="[id, label] in anchors"
        :key="id"
        :to="route + '?at=' + id"
        @navigate="emit('navigate', $event)"
        >{{ label }}</CourseLink
      >
    </nav>
  </aside>
  <article class="topic-article">
    <header>
      <span class="eyebrow"
        >{{ stage.title }} · {{ canEdit ? '可修改输入的推演' : '固定案例手算' }}</span
      >
      <h1>{{ topic.title }}</h1>
      <p class="topic-story">{{ topic.story }}</p>
      <nav class="topic-prerequisites" aria-label="本篇前置知识">
        <strong>先会这些：</strong
        ><CourseLink
          v-for="p in prerequisites"
          :key="p.path"
          :to="p.path"
          @navigate="emit('navigate', $event)"
          >{{ p.title }} →</CourseLink
        >
      </nav>
    </header>
    <section id="topic-example" data-study-section>
      <h2>先跟着一个例子走</h2>
      <TopicTrace :topic="topic" :draft="draft" :target="target" :disabled="disabled" />
    </section>
    <section id="topic-definition" data-study-section>
      <h2>这个办法叫什么，解决什么问题</h2>
      <p class="topic-definition">{{ topic.definition }}</p>
      <dl class="topic-terms">
        <template v-for="t in topic.terms" :key="t.term"
          ><dt>{{ t.term }}</dt>
          <dd>{{ t.meaning }}</dd></template
        >
      </dl>
      <section v-for="s in topic.sections" :key="s.title" class="topic-explanation">
        <h3>{{ s.title }}</h3>
        <p v-for="p in s.paragraphs" :key="p">{{ p }}</p>
      </section>
      <aside class="topic-cost">
        <h3>花多少时间、占多少空间</h3>
        <dl>
          <dt>时间</dt>
          <dd>{{ topic.cost.time }}</dd>
          <dt>空间</dt>
          <dd>{{ topic.cost.space }}</dd>
          <dt>适用条件</dt>
          <dd>{{ topic.cost.condition }}</dd>
        </dl>
      </aside>
      <aside class="topic-mistake">
        <h3>容易混淆的地方</h3>
        <p>{{ topic.mistake }}</p>
      </aside>
    </section>
    <section id="topic-check" data-study-section>
      <h2>合上讲解，自己走一遍</h2>
      <p>每题都给出了所需数据。先回答，再核对原因；作答、提示和推演位置会保存在当前账户的本机草稿中。</p>
      <PracticeCard
        v-for="(q, i) in topic.checks"
        :key="i"
        :question="q"
        :state="draft.quiz[i]"
        :label="'自检 ' + (i + 1)"
        :disabled="disabled"
      />
      <div class="topic-challenge">
        <h3>换一种情况想一想</h3>
        <p>{{ topic.challenge }}</p>
        <p class="micro">
          这是手算与讨论任务，页面不自动判定掌握程度。试着先在纸上写出状态，再回到对应步骤核对。
        </p>
      </div>
    </section>
    <section v-if="topic.coding" id="topic-coding" data-study-section>
      <h2>概念清楚后，再动手写 Java</h2>
      <p>题目测试会真实执行 Java 程序。先用上面的例子说清楚过程，再写方法体。</p>
      <TopicCoding :task-id="topic.coding" :owner="owner" :disabled="disabled" />
    </section>
    <footer class="topic-lesson-footer">
      <UiButton
        :disabled="disabled || read"
        :variant="read ? 'secondary' : 'primary'"
        :icon="read ? 'check' : undefined"
        @click="service?.topicRead(topic.id)"
        >{{ read ? '本篇已读' : '记录本篇已读' }}</UiButton
      >
      <p class="micro">已读不等于独立掌握。独立编程测试与复习记录在“编程练习”中查看。</p>
      <CourseLink :to="'/topics/stage/' + topic.stage" @navigate="emit('navigate', $event)"
        >返回{{ stage.title }}目录 →</CourseLink
      >
      <details class="topic-reference">
        <summary>参考资料与继续阅读</summary>
        <ul>
          <li v-for="source in topic.sources" :key="source.url">
            <a :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.name }} ↗</a>
          </li>
        </ul>
        <p>
          例子与练习为本站重新设计。进阶篇先建立概念与手算能力；没有提供在线编程题的专题，请按变式任务继续练习，再查阅原始资料深入实现。
        </p>
      </details>
    </footer>
  </article>
</template>
