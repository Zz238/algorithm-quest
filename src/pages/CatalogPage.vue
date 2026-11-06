<script setup>
import { ref } from 'vue';
import { chapters, requiredLessons } from '../data/course.js';
import { courseStages } from '../useLearningProgress.js';
import { jumpTo } from '../useCourseNavigation.js';
import SearchResults from '../components/SearchResults.vue';
defineProps({
  summary: Object,
  notes: Object,
  hasStarted: Boolean,
  continuePath: String,
  continueLabel: String,
  resumeTitle: String,
  chapterRead: Function,
  navigating: Boolean,
});
const emit = defineEmits(['navigate']);
const navigate = (path) => emit('navigate', path);
const browseCatalog = () => jumpTo('course-catalog');
const query = ref('');
const courseGroups = [0, 1, 2, 3].map((index) => ({
  index,
  chapters: chapters.filter((c) => c.world === index),
}));
</script>
<template>
  <main class="home">
    <section class="hero" aria-labelledby="home-title">
      <div class="hero-intro">
        <span class="eyebrow">Java · 数据结构 · 算法</span>
        <h1 id="home-title">从基础开始，<br />读懂算法的<span>每一步。</span></h1>
        <p>
          一套面向零基础的学习路径。从第一个变量，<br
            class="desktop-break"
          />到独立推演、理解代码，再自己解决问题。
        </p>
        <button class="text-button" @click="browseCatalog">
          浏览课程目录 <span aria-hidden="true">↓</span>
        </button>
      </div>
      <aside class="hero-next" aria-labelledby="resume-title">
        <div class="resume-top">
          <span>{{ hasStarted ? '接着上次的进度' : '从这里开始' }}</span
          ><span class="resume-percentage">{{ summary.completion }}%</span>
        </div>
        <div
          class="reading-progress"
          role="progressbar"
          aria-label="基础阅读进度"
          :aria-valuenow="summary.reads"
          :aria-valuemin="0"
          :aria-valuemax="summary.core"
        >
          <i :style="{ width: summary.completion + '%' }"></i>
        </div>
        <h2 id="resume-title">{{ resumeTitle }}</h2>
        <p>
          {{
            continuePath.startsWith('/java/')
              ? '没有写过程序？先跟着做一个能看见结果的小例子。'
              : '先读讲解，再动手推演。可以按自己的节奏练习。'
          }}
        </p>
        <button class="primary start" :aria-busy="navigating" @click="navigate(continuePath)">
          {{ hasStarted ? continueLabel || '继续学习' : '开始学习' }}
          <span aria-hidden="true">→</span></button
        ><small
          >基础已读 {{ summary.reads }} / {{ summary.core }} · 选学 {{ summary.electiveReads }} /
          {{ summary.electives }}</small
        >
      </aside>
    </section>
    <div class="course-facts" aria-label="课程概况">
      <span><strong>12</strong> 章循序渐进</span><span><strong>72</strong> 节详细讲解</span
      ><span><strong>216</strong> 道配套练习</span
      ><span
        >逐条演示 <span aria-hidden="true">→</span> 逐行理解
        <span aria-hidden="true">→</span> 独立练习</span
      >
    </div>
    <section class="search-block" id="course-catalog">
      <div>
        <span class="eyebrow">学习路径</span>
        <h2>课程目录</h2>
        <p class="muted">按顺序打好基础，选学内容留到熟练后再看。</p>
      </div>
      <label class="search-field"
        ><svg
          viewBox="0 0 24 24"
          width="19"
          height="19"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          aria-hidden="true"
        >
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 4 4" /></svg
        ><span class="sr-only">搜索课程与笔记</span
        ><input v-model="query" type="search" placeholder="搜索课程、题号、术语或笔记"
      /></label>
    </section>
    <div class="study-home-links">
      <button @click="navigate('/java')">
        <strong>Java 零基础预备课</strong><span>12 节短课，从第一行打印开始 →</span></button
      ><button @click="navigate('/learn/1/0')">
        <strong>先用纸笔学算法</strong><span>从输入、输出和步骤开始 →</span></button
      ><button @click="navigate('/review')">
        <strong>复习与阶段练习</strong
        ><span>{{ summary.due ? summary.due + ' 项待复习' : '试一道换了场景的题' }} →</span></button
      ><button @click="navigate('/trial')">
        <strong>我该从哪一节开始？</strong><span>用三个小任务找到适合的起点 →</span>
      </button>
    </div>
    <SearchResults v-if="query.trim()" :query="query" :notes="notes" @navigate="navigate" />
    <div v-else class="course-path">
      <section v-for="w in courseGroups" :key="w.index" class="course-group">
        <header class="course-group-heading">
          <span class="stage-number">{{ String(w.index + 1).padStart(2, '0') }}</span>
          <div>
            <span class="eyebrow">阶段 {{ w.index + 1 }}</span>
            <h3>{{ courseStages[w.index] }}</h3>
            <p>第 {{ w.chapters[0].id }}–{{ w.chapters.at(-1).id }} 章</p>
          </div>
        </header>
        <div class="chapter-grid">
          <button
            v-for="c in w.chapters"
            :key="c.id"
            class="chapter-card"
            @click="navigate('/learn/' + c.id + '/0')"
          >
            <div class="chapter-card-top">
              <span>第 {{ String(c.id).padStart(2, '0') }} 章</span><span aria-hidden="true">↗</span>
            </div>
            <span class="chapter-card-title">{{ c.title }}</span>
            <p>{{ c.subtitle }}</p>
            <div class="chapter-card-bottom">
              <span>{{ chapterRead(c) }} / {{ requiredLessons(c).length }} 节基础已读</span
              ><span v-if="chapterRead(c) === requiredLessons(c).length" class="completed-label"
                >已读完</span
              >
            </div>
            <div class="chapter-progress" aria-hidden="true">
              <i :style="{ width: (chapterRead(c) / requiredLessons(c).length) * 100 + '%' }"></i>
            </div>
          </button>
        </div>
      </section>
    </div>
    <section class="howto">
      <div>
        <span class="eyebrow">学习建议</span>
        <h2>先看懂，再动手。</h2>
        <p>不必赶进度。能换一组数据说清每一步，比记住一个答案更有用。</p>
      </div>
      <ol>
        <li>
          <b>01</b>
          <div><strong>用例子理解概念</strong><span>从小输入开始，看清数据和目标。</span></div>
        </li>
        <li>
          <b>02</b>
          <div><strong>操作实验，追踪变化</strong><span>预测下一步，再观察变量和代码。</span></div>
        </li>
        <li>
          <b>03</b>
          <div><strong>独立练习，及时回顾</strong><span>答题后读反馈，用自己的话记一笔。</span></div>
        </li>
      </ol>
    </section>
  </main>
</template>
