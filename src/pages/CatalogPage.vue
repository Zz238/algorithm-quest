<script setup>
import { computed, defineAsyncComponent, ref } from 'vue';
import { chapters, requiredLessons } from '../data/course-index.js';
import { courseStages } from '../useLearningProgress.js';
import { jumpTo } from '../useCourseNavigation.js';
const SearchResults = defineAsyncComponent(() => import('../components/SearchResults.vue'));
import CourseLink from '../components/CourseLink.vue';
import UiIcon from '../components/ui/UiIcon.vue';
import UiSearchField from '../components/ui/UiSearchField.vue';
const props = defineProps({
  summary: Object,
  notes: Object,
  hasStarted: Boolean,
  continuePath: String,
  orderedPath: String,
  resume: Object,
  preparedCount: Number,
  continueLabel: String,
  resumeTitle: String,
  chapterRead: Function,
  navigating: Boolean,
  selectedChapter: Number,
});
const selected = computed(() => chapters.find((c) => c.id === props.selectedChapter));
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
    <nav class="learning-tools" aria-label="学习工具">
      <CourseLink to="/knowledge" @navigate="navigate">知识图谱</CourseLink
      ><CourseLink to="/execution" @navigate="navigate">逐行执行</CourseLink
      ><CourseLink to="/compare" @navigate="navigate">对比辨析</CourseLink
      ><CourseLink to="/complexity" @navigate="navigate">复杂度训练</CourseLink>
    </nav>
    <section v-if="selected" :id="'catalog-chapter-' + selected.id" class="chapter-directory study-page">
      <CourseLink to="/" @navigate="navigate">← 全部基础教学</CourseLink
      ><span class="eyebrow">第 {{ selected.id }} 章 · 小节目录</span>
      <h1>{{ selected.title }}</h1>
      <p>{{ selected.subtitle }}</p>
      <p v-if="resume?.path?.startsWith('/learn/' + selected.id + '/')">
        上次学习：{{ resume.title }} · {{ resume.label }}
        <CourseLink :to="resume.path" @navigate="navigate">返回原位置 →</CourseLink>
      </p>
      <ol class="study-route-list">
        <li v-for="(l, i) in selected.lessons" :key="l.id">
          <CourseLink :to="'/learn/' + selected.id + '/' + i" @navigate="navigate"
            ><span>{{ i + 1 }}. {{ l.title }}</span
            ><small>{{ l.optional ? '选学' : '基础小节' }} →</small></CourseLink
          >
        </li>
        <li>
          <CourseLink :to="'/boss/' + selected.id" @navigate="navigate"
            >章节练习 · {{ selected.boss.title }} →</CourseLink
          >
        </li>
      </ol>
    </section>
    <template v-else>
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
            <span>{{ resume ? '回到上次的任务' : '零基础推荐起点' }}</span
            ><span class="resume-percentage">{{
              continuePath.startsWith('/java/') ? preparedCount + '/12' : summary.completion + '%'
            }}</span>
          </div>
          <div
            class="reading-progress"
            role="progressbar"
            :aria-label="continuePath.startsWith('/java/') ? 'Java 起步进度' : '基础阅读进度'"
            :aria-valuenow="continuePath.startsWith('/java/') ? preparedCount : summary.reads"
            :aria-valuemin="0"
            :aria-valuemax="continuePath.startsWith('/java/') ? 12 : summary.core"
          >
            <i
              :style="{
                width:
                  (continuePath.startsWith('/java/') ? (preparedCount / 12) * 100 : summary.completion) +
                  '%',
              }"
            ></i>
          </div>
          <h2 id="resume-title">{{ resumeTitle }}</h2>
          <p v-if="resume" class="resume-place">上次停在：{{ resume.label }} · 本机记录</p>
          <p v-else>
            {{
              continuePath.startsWith('/java/')
                ? '没有写过程序？先跟着做一个能看见结果的小例子。'
                : '先读讲解，再动手推演。可以按自己的节奏练习。'
            }}
          </p>
          <CourseLink
            class="primary start ui-action-link"
            :aria-busy="navigating"
            :to="continuePath"
            @navigate="navigate"
          >
            {{ hasStarted ? continueLabel || '继续学习' : '开始学习' }}
            <span class="ui-action-arrow" aria-hidden="true"><UiIcon name="next" /></span></CourseLink
          ><small
            >基础已读 {{ summary.reads }} / {{ summary.core }} · 选学 {{ summary.electiveReads }} /
            {{ summary.electives }}</small
          >
          <CourseLink
            v-if="resume && orderedPath !== continuePath"
            class="text-button ordered-next"
            :to="orderedPath"
            @navigate="navigate"
            >按课程顺序继续 →</CourseLink
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
        <UiSearchField
          v-model="query"
          label="搜索课程与笔记"
          hide-label
          placeholder="搜索课程、题号、术语或笔记"
          maxlength="100"
        />
      </section>
      <aside class="curriculum-entry">
        <div>
          <strong>基础课之外，按需要补一个知识点</strong>
          <p>前缀和、滑动窗口、单调结构和 DP 进阶分别讲解。先看依赖，再跟一个完整例子。</p>
        </div>
        <CourseLink to="/topics" @navigate="navigate">查看四阶段算法专题 →</CourseLink>
      </aside>
      <section class="starting-route" aria-label="入门路线">
        <h3>第一次写程序，按这条路线开始</h3>
        <ol>
          <li>
            <CourseLink to="/java/print" @navigate="navigate">先学打印、变量和判断</CourseLink
            ><span>先完成 3 节起步课，做出看得见的小结果。</span>
          </li>
          <li>
            <CourseLink to="/learn/1/0" @navigate="navigate">再用纸笔理解算法</CourseLink
            ><span>从输入、输出和状态开始，接上下面的主线。</span>
          </li>
          <li>
            <CourseLink to="/java" @navigate="navigate">其余 Java 短课按需补</CourseLink
            ><span>循环、引用、二维数组会在用到前提醒；已练过可先做题确认。</span>
          </li>
        </ol>
        <div class="study-actions">
          <CourseLink to="/trial" @navigate="navigate">已经学过一些？用 3 个任务判断起点 →</CourseLink
          ><CourseLink v-if="hasStarted" to="/review" @navigate="navigate"
            >复习与阶段作品{{ summary.due ? ' · ' + summary.due + ' 项待做' : '' }} →</CourseLink
          >
        </div>
      </section>
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
            <CourseLink
              v-for="c in w.chapters"
              :key="c.id"
              class="chapter-card"
              :id="'catalog-chapter-' + c.id"
              :class="{ 'is-last-studied': resume?.path?.startsWith('/learn/' + c.id + '/') }"
              :to="
                resume?.path?.startsWith('/learn/' + c.id + '/') ? resume.path : '/learn/' + c.id + '/0'
              "
              @navigate="navigate"
            >
              <div class="chapter-card-top">
                <span
                  >第 {{ String(c.id).padStart(2, '0') }} 章
                  <small v-if="resume?.path?.startsWith('/learn/' + c.id + '/')">· 上次学习</small></span
                ><span aria-hidden="true">→</span>
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
            </CourseLink>
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
    </template>
  </main>
</template>
