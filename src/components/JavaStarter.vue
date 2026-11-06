<script setup>
import { computed } from 'vue';
import { JAVA_BY_ID, JAVA_SOURCES, coreJava, bridgeJava, javaRoute } from '../data/java-starter.js';
import { answerState } from '../answering.js';
import { useStudyDraft } from '../study-drafts.js';
import RunnableJava from './RunnableJava.vue';
import PracticeCard from './PracticeCard.vue';
const props = defineProps({ unitId: String, progress: Object, owner: String, disabled: Boolean });
const emit = defineEmits(['navigate', 'prepared', 'wrong']);
const unit = JAVA_BY_ID[props.unitId];
const completed = computed(
  () => coreJava.filter((u) => props.progress.learning.prepared.includes(u.id)).length,
);
const nextCore = computed(() => coreJava.find((u) => !props.progress.learning.prepared.includes(u.id)));
const sequence = coreJava.findIndex((u) => u.id === unit?.id);
const next = sequence >= 0 ? coreJava[sequence + 1] : null;
const links = {
  'java-call-stack': '/learn/8/0',
  'java-two-loops': '/learn/5/2',
  'java-last-step': '/learn/11/1',
};
const draft = unit
  ? useStudyDraft(props.owner, unit.id, 'starter', (r) => ({
      step: Math.max(0, Math.min(unit.steps.length - 1, Number(r?.step) || 0)),
      answer: answerState(unit.practice, r?.answer),
    }))
  : null;
function attempted(r) {
  if (r.ok) emit('prepared', unit.id);
  else emit('wrong', unit.id);
}
</script>
<template>
  <main class="study-page java-starter">
    <div class="study-topline">
      <button class="text-button" @click="emit('navigate', unit ? '/java' : '/')">
        ← {{ unit ? 'Java 起步目录' : '课程目录' }}</button
      ><span>Java 起步 · {{ completed }} / {{ coreJava.length }} 节练过</span>
    </div>
    <template v-if="!unit">
      <div class="study-page-lead">
        <span class="eyebrow">给第一次写程序的人</span>
        <h1>先学会读一行 Java</h1>
        <p>从一句打印开始。每节只练一种操作：先用生活里的事理解，再跟着走一遍，最后动手做一道题。</p>
        <div class="study-actions">
          <button
            class="primary"
            @click="emit('navigate', nextCore ? javaRoute(nextCore.id) : '/learn/1/0')"
          >
            {{ nextCore ? '开始或继续 Java 预备课' : '进入算法课程' }} →</button
          ><button @click="emit('navigate', '/learn/1/0')">先用纸笔学算法</button
          ><button @click="emit('navigate', '/trial')">不确定从哪开始？先试三组小题</button>
        </div>
      </div>
      <h2>12 节 Java 预备课</h2>
      <ol class="study-route-list">
        <li v-for="(u, i) in coreJava" :key="u.id">
          <button @click="emit('navigate', javaRoute(u.id))">
            <span
              ><b>{{ i + 1 }}.</b> {{ u.title }}</span
            ><small
              >{{
                progress.learning.prepared.includes(u.id) ? '已练过' : u.minutes + ' 分钟左右'
              }}
              →</small
            >
          </button>
        </li>
      </ol>
      <h2>学到后面再回来看</h2>
      <p>这些短课分别接到冒泡、递归和动态规划。课程会在用到之前提醒你。</p>
      <ul class="study-route-list">
        <li v-for="u in bridgeJava" :key="u.id">
          <button @click="emit('navigate', javaRoute(u.id))">
            <span>{{ u.title }}</span
            ><small>{{ u.minutes }} 分钟左右 →</small>
          </button>
        </li>
      </ul>
      <details class="study-details">
        <summary>编写这套入门课时参考了哪些资料？</summary>
        <p>本课程的生活例子、数据、练习及图示均独立编写。参考资料用于核对 Java 语法和安排先后顺序。</p>
        <ul>
          <li v-for="[name, url] in JAVA_SOURCES" :key="url">
            <a :href="url" target="_blank" rel="noopener">{{ name }} ↗</a>
          </li>
        </ul>
      </details>
    </template>
    <template v-else>
      <div class="study-page-lead">
        <span class="eyebrow"
          >{{ sequence >= 0 ? '第 ' + (sequence + 1) + ' 节' : '衔接小课' }} · 约
          {{ unit.minutes }} 分钟</span
        >
        <h1>{{ unit.title }}</h1>
        <p>{{ unit.story }}</p>
      </div>
      <section class="study-core">
        <h2>把例子换成程序里的意思</h2>
        <p>{{ unit.idea }}</p>
      </section>
      <section class="study-step-box" aria-label="Java 小步实验">
        <div class="study-block-head">
          <h2>一步一步看</h2>
          <small>{{ draft.step + 1 }} / {{ unit.steps.length }}</small>
        </div>
        <div class="study-step-state" aria-live="polite">
          <strong>{{ unit.steps[draft.step][0] }}</strong>
          <p>{{ unit.steps[draft.step][1] }}</p>
        </div>
        <div class="study-actions">
          <button :disabled="draft.step === 0" @click="draft.step--">上一步</button
          ><button
            class="primary"
            :disabled="draft.step === unit.steps.length - 1"
            @click="draft.step++"
          >
            下一条 →
          </button>
        </div>
      </section>
      <PracticeCard
        :question="unit.practice"
        :state="draft.answer"
        :disabled="disabled"
        label="先确认自己理解了"
        @attempt="attempted"
      />
      <details class="study-details">
        <summary>看 Java 写法，并在电脑上试一次</summary>
        <pre class="study-code"><code>{{unit.example.source}}</code></pre>
        <RunnableJava
          :source="unit.example.source"
          :expected="unit.example.expected"
          :show-source="false"
        />
      </details>
      <p class="study-next-use">{{ unit.nextUse }}</p>
      <p v-if="unit.sources.length" class="micro">
        参考：<a
          v-for="i in unit.sources"
          :key="i"
          :href="JAVA_SOURCES[i][1]"
          target="_blank"
          rel="noopener"
          >{{ JAVA_SOURCES[i][0] }} ↗
        </a>
      </p>
      <div class="study-actions">
        <button v-if="sequence > 0" @click="emit('navigate', javaRoute(coreJava[sequence - 1].id))">
          ← 上一节</button
        ><button
          class="primary"
          @click="emit('navigate', next ? javaRoute(next.id) : links[unit.id] || '/learn/1/0')"
        >
          {{ next ? '下一节预备课' : '进入对应算法小节' }} →</button
        ><button @click="emit('navigate', '/review/' + unit.id)">做一道变式</button>
      </div>
    </template>
  </main>
</template>
