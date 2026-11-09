<script setup>
import {
  computed,
  defineAsyncComponent,
  onErrorCaptured,
  onMounted,
  onUnmounted,
  provide,
  ref,
  watch,
} from 'vue';
import { chapters, lessonRoute } from './data/course-index.js';
import { COURSE_TERMS } from './data/course-index.js';
import { lessonIds, parseRoute, routeTitle } from './course-route.js';
import { localDateKey, recordCheckin } from './logic.js';
import { createTrafficTracker } from './analytics.js';
import { jumpTo, useCourseNavigation } from './useCourseNavigation.js';
import { useLearningProgress } from './useLearningProgress.js';
import { useCloudProgress } from './useCloudProgress.js';
import { useReadingPreferences } from './reading-preferences.js';
import { referenceText } from './study-target.js';
import PageLoading from './components/PageLoading.vue';
import PageLoadError from './components/PageLoadError.vue';
import SiteBreadcrumbs from './components/SiteBreadcrumbs.vue';
import { CODING_SERVICE, recordCoding } from './coding-progress.js';
import { recordStudyActivity } from './study-state.js';
import { ALGORITHM_TOPIC_BY_ID } from './data/algorithm-roadmap.js';
const lazy = (loader) =>
  defineAsyncComponent({
    loader,
    loadingComponent: PageLoading,
    errorComponent: PageLoadError,
    delay: 100,
  });
const CareerPage = lazy(() => import('./pages/CareerPage.vue'));
const PracticePage = lazy(() => import('./pages/PracticePage.vue'));
const AlgorithmTopics = lazy(() => import('./pages/AlgorithmTopics.vue'));
const AccountPanel = lazy(() => import('./components/AccountPanel.vue'));
const BeginnerTrial = lazy(() => import('./components/BeginnerTrial.vue'));
const ChapterDrawer = lazy(() => import('./components/ChapterDrawer.vue'));
const ChapterExercise = lazy(() => import('./components/ChapterExercise.vue'));
const ChapterShell = lazy(() => import('./components/ChapterShell.vue'));
const JavaStarter = lazy(() => import('./components/JavaStarter.vue'));
const LessonNotes = lazy(() => import('./components/LessonNotes.vue'));
const PrivacyNotice = lazy(() => import('./components/PrivacyNotice.vue'));
const ReviewPage = lazy(() => import('./components/ReviewPage.vue'));
import SiteHeader from './components/SiteHeader.vue';
const CatalogPage = lazy(() => import('./pages/CatalogPage.vue'));
const GlossaryPage = lazy(() => import('./pages/GlossaryPage.vue'));
const LessonPage = lazy(() => import('./pages/LessonPage.vue'));
const NotesPage = lazy(() => import('./pages/NotesPage.vue'));
const RecordPage = lazy(() => import('./pages/RecordPage.vue'));
const SearchPage = lazy(() => import('./pages/SearchPage.vue'));
import UiIcon from './components/ui/UiIcon.vue';
const JavaPlayground = lazy(() => import('./pages/JavaPlayground.vue'));

const props = defineProps({ progressServices: Object, commentsService: Object });
const renderError = ref('');
const development = import.meta.env.DEV;
onErrorCaptured((error) => {
  renderError.value = error.message;
  return false;
});
function reloadPage() {
  window.location.reload();
}
const { progress, storageOK, storageIssue, recoveries, localPending, localVersion, cloud } =
  useCloudProgress(lessonIds, props.progressServices);
provide(CODING_SERVICE, {
  progress,
  navigate: (path) => go(path),
  owner: computed(() => cloud.state.user?.id || 'guest'),
  disabled: computed(() => cloud.state.initializing),
  record(id, result, topic) {
    if (cloud.state.initializing) return;
    recordCoding(progress, id, result);
    if (result.passed && topic) recordStudyActivity(progress, topic, localDateKey());
    recordCheckin(progress, localDateKey(), !!cloud.state.user);
  },
  career(id, checked) {
    if (!cloud.state.initializing)
      progress.learning.career[id] = {
        checked,
        at: Math.max(Date.now(), (progress.learning.career[id]?.at || 0) + 1),
      };
  },
  choose(id) {
    if (!cloud.state.initializing)
      progress.learning.routeChoice = {
        id,
        at: Math.max(Date.now(), (progress.learning.routeChoice?.at || 0) + 1),
      };
  },
  topicRead(id) {
    if (cloud.state.initializing || !ALGORITHM_TOPIC_BY_ID[id]) return;
    if (!progress.learning.topicsRead.includes(id)) progress.learning.topicsRead.push(id);
    recordStudyActivity(progress, 'topic-' + id, localDateKey());
    recordCheckin(progress, localDateKey(), !!cloud.state.user);
  },
});
const owner = computed(() => cloud.state.user?.id || 'guest');
const { path, current, go, navigating, pageContent, resume, refreshResume } = useCourseNavigation(
  owner,
  COURSE_TERMS,
);
const readingPrefs = useReadingPreferences();
const notesWide = ref(false);
const view = computed(() => current.value.view);
const chapter = computed(() => current.value.chapter);
const lesson = computed(() => current.value.lesson);
const lessonIndex = computed(() => current.value.index);
const drawerOpen = ref(false),
  notesOpen = ref(false),
  notesModalOpen = ref(false);
const hasChapterMenu = computed(() => !!chapter.value);
const notice = ref('');
let toastTimer;
function dismissNotice() {
  clearTimeout(toastTimer);
  notice.value = '';
}
function toast(message) {
  notice.value = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    notice.value = '';
  }, 3500);
}
onUnmounted(() => clearTimeout(toastTimer));
const {
  today,
  summary,
  countToday,
  goal,
  signedToday,
  continuePath,
  chapterReads,
  cleared,
  markWrong,
  markMastered,
  markPrepared,
  finishedVariant,
  changeGoal,
  markRead,
  claim,
} = useLearningProgress(progress, cloud, toast);
const resumePath = computed(() => resume.value?.path || continuePath.value);
const resumeTitle = computed(
  () => resume.value?.title || routeTitle(parseRoute(continuePath.value)).replace(' · 算法之旅', ''),
);
const continueLabel = computed(() => {
  if (resume.value) return '回到上次学习';
  const next = parseRoute(continuePath.value);
  return next.view === 'learn'
    ? '继续：第 ' + next.chapter.id + ' 章第 ' + (next.index + 1) + ' 节'
    : next.view === 'java'
      ? '继续 Java 预备课'
      : next.view === 'review'
        ? '开始复习'
        : '查看学习记录';
});
const hasStarted = computed(
  () => !!(resume.value || progress.lessons.length || progress.learning.prepared.length),
);
const note = computed({
  get: () => progress.notes[lesson.value?.id] || '',
  set: (value) => {
    if (lesson.value && !cloud.state.initializing)
      progress.notes[lesson.value.id] = value.slice(0, 5000);
  },
});
function addNote({ section, step, example, input, label, prompt }) {
  if (!lesson.value || cloud.state.initializing) return;
  const link = referenceText(lesson.value.title, lessonRoute(lesson.value.id), section, {
    step,
    example,
    input,
    label,
  });
  const extra = link + '\n' + (prompt || '我的理解：');
  if (note.value.length + extra.length + 2 > 5000) {
    toast('笔记已接近 5000 字，请先整理内容。');
    return;
  }
  note.value = (note.value ? note.value + '\n\n' : '') + extra;
  drawerOpen.value = false;
  notesOpen.value = true;
}
watch(drawerOpen, (value) => {
  if (value) notesOpen.value = false;
});
watch(notesOpen, (value) => {
  if (value) drawerOpen.value = false;
});
const saveStatus = computed(() => {
  if (cloud.state.initializing) return '正在加载当前存档…';
  if (!storageOK.value) return '本机保存暂不可用，可以先导出。';
  if (localPending.value) return '正在保存到本机…';
  if (!cloud.state.user) return '已保存在本机';
  return (
    {
      pending: '已保存在本机，待同步',
      syncing: '正在同步到账号…',
      synced: '已同步到账号',
      offline: '离线 · 已保存在本机',
      error: '已保存在本机，云端待重试',
    }[cloud.state.syncStatus] || '已保存在本机'
  );
});
watch([path, owner], () => {
  renderError.value = '';
  drawerOpen.value = false;
  notesOpen.value = false;
  notesModalOpen.value = false;
});
watch(owner, (account) => {
  if (account !== 'guest' && view.value === 'login') go('/account');
});

function readLesson(advance) {
  if (!lesson.value || !markRead(lesson.value.id) || !advance) return;
  const next = chapter.value.lessons[lessonIndex.value + 1];
  go(next && !next.optional ? lessonRoute(next.id) : '/boss/' + chapter.value.id);
}
function deleteNote(id) {
  if (cloud.state.initializing) return;
  delete progress.notes[id];
  toast('已删除这条私人笔记。');
}
function applyBackup({ value, replace, done }) {
  if (cloud.state.initializing) {
    done(false);
    return;
  }
  if (replace) {
    if (!cloud.replaceGuest(value, 'all')) {
      toast('替换未完成：本机存储不可用，当前记录保留。');
      done(false);
      return;
    }
  } else {
    Object.assign(progress, value);
    recordCheckin(progress, localDateKey(), owner.value !== 'guest');
  }
  done(true);
  if (replace) refreshResume();
  toast(replace ? '已替换当前浏览器的游客记录。' : '已按预览中的规则合并备份。');
}
function resetData({ value, scope }) {
  if (cloud.state.initializing) return;
  if (owner.value === 'guest') {
    if (!cloud.replaceGuest(value, scope)) {
      toast('重置未完成：本机存储不可用，当前记录保留。');
      return;
    }
  } else if (scope === 'notes') {
    progress.notes = {};
  } else return;
  if (scope !== 'notes') refreshResume();
  toast(scope === 'notes' ? '已清空当前存档的私人笔记。' : '已重置选定的本机学习数据。');
}

let trafficStorage;
try {
  trafficStorage = window.localStorage;
} catch {
  trafficStorage = { getItem: () => 'off', removeItem: () => {} };
}
const trafficRoutes = new Set([
  '/',
  '/account',
  '/login',
  '/progress',
  '/glossary',
  '/privacy',
  ...chapters.flatMap((c) => [...c.lessons.map((_, i) => '/learn/' + c.id + '/' + i), '/boss/' + c.id]),
]);
const traffic = createTrafficTracker({
  routes: trafficRoutes,
  location: window.location,
  storage: trafficStorage,
  navigator: window.navigator,
  referrer: document.referrer,
});
function updateTraffic(enabled) {
  if (enabled) traffic.visit(current.value.path);
  else traffic.stop();
}
function trafficPreferenceChanged(event) {
  if (event.key === 'algo-quest-traffic-choice-v1') updateTraffic(event.newValue !== 'off');
}
onMounted(() => {
  traffic.visit(current.value.path);
  window.addEventListener('storage', trafficPreferenceChanged);
});
watch(path, () => traffic.visit(current.value.path));
onUnmounted(() => {
  traffic.cancel();
  window.removeEventListener('storage', trafficPreferenceChanged);
});
</script>

<template>
  <div
    class="app-layout"
    :class="{
      'has-chapter-menu': hasChapterMenu,
      'chapter-menu-open': drawerOpen,
      'has-lesson-notes': view === 'learn' && notesWide,
    }"
    :style="{ '--lesson-font-size': readingPrefs.fontSize + 'px' }"
  >
    <div class="app-surface" :inert="drawerOpen || notesModalOpen">
      <a class="skip-content" href="#main-content" @click.prevent="jumpTo('main-content')">跳到正文</a>
      <SiteHeader
        :user="cloud.state.user"
        :view="view"
        :course-path="['home', 'learn', 'boss', 'java'].includes(view) ? '/' : resumePath"
        @navigate="go"
      />
      <SiteBreadcrumbs :route="current" @navigate="go" />
      <div v-if="storageIssue === 'corrupt' || !storageOK" class="storage-warning" role="status">
        <template v-if="storageIssue === 'corrupt'"
          >发现无法读取的本机存档。可在学习记录下载原件。{{
            !storageOK ? '原件保留在原位置，本机新修改暂不能写入。' : ''
          }}</template
        >
        <template v-else>浏览器暂时无法保存。可以继续学习，关闭前请先导出进度。</template>
        <button class="text-button" @click="go('/progress')">打开学习记录</button>
      </div>
      <Transition name="ui-toast"
        ><div v-if="notice" class="toast ui-toast" role="status">
          <UiIcon name="info" /><span>{{ notice }}</span
          ><button type="button" aria-label="关闭提示" @click="dismissNotice">
            <UiIcon name="close" :size="16" />
          </button></div
      ></Transition>
      <div
        id="main-content"
        :key="path + ':' + owner + ':' + localVersion"
        ref="pageContent"
        class="page-content"
        :class="{ 'is-navigating': navigating }"
        tabindex="-1"
      >
        <main v-if="renderError" class="study-page">
          <h1>这一页暂时没有打开</h1>
          <p>草稿仍保存在本机。可以重新加载，或回到课程目录继续学习。</p>
          <p v-if="development" role="alert">{{ renderError }}</p>
          <button @click="reloadPage">重新加载</button><button @click="go('/')">回到课程目录</button>
        </main>
        <CatalogPage
          v-else-if="view === 'home'"
          :summary="summary"
          :notes="progress.notes"
          :has-started="hasStarted"
          :continue-path="resumePath"
          :ordered-path="continuePath"
          :resume="resume"
          :selected-chapter="current.selectedChapter"
          :prepared-count="
            progress.learning.prepared.filter(
              (id) => !['java-call-stack', 'java-two-loops', 'java-last-step'].includes(id),
            ).length
          "
          :continue-label="continueLabel"
          :resume-title="resumeTitle"
          :chapter-read="chapterReads"
          :navigating="navigating"
          @navigate="go"
        />
        <JavaStarter
          v-else-if="view === 'java'"
          :unit-id="current.topic"
          :progress="progress"
          :owner="owner"
          :disabled="cloud.state.initializing"
          @navigate="go"
          @prepared="markPrepared"
          @wrong="markWrong"
        />
        <ReviewPage
          v-else-if="view === 'review'"
          :topic="current.topic"
          :owner="owner"
          :today="today"
          :progress="progress"
          :disabled="cloud.state.initializing"
          @navigate="go"
          @complete="finishedVariant"
          @wrong="markWrong"
        />
        <BeginnerTrial v-else-if="view === 'trial'" :owner="owner" @navigate="go" />
        <JavaPlayground v-else-if="view === 'playground'" :owner="owner" />
        <AlgorithmTopics
          v-else-if="view === 'topics'"
          :topic-id="current.topic"
          :stage-id="current.topicStage"
          :target="current.target"
          :owner="owner"
          :disabled="cloud.state.initializing"
          @navigate="go"
        />
        <CareerPage
          v-else-if="view === 'careers'"
          :route-id="current.routeId"
          :stage-id="current.stageId"
          :owner="owner"
          :disabled="cloud.state.initializing"
          @navigate="go"
        />
        <PracticePage
          v-else-if="view === 'practice' || view === 'practice-review'"
          :task-id="current.topic"
          :review="view === 'practice-review'"
          :owner="owner"
          :disabled="cloud.state.initializing"
          @navigate="go"
        />
        <ChapterShell
          v-else-if="hasChapterMenu"
          :view="view"
          :chapter="chapter"
          :lesson-index="lessonIndex"
          :progress="progress"
          @navigate="go"
        >
          <LessonPage
            v-if="lesson"
            :lesson="lesson"
            :chapter="chapter"
            :lesson-index="lessonIndex"
            :owner="owner"
            :progress="progress"
            :today="today"
            :today-count="countToday"
            :goal="goal"
            :signed-today="signedToday"
            :disabled="cloud.state.initializing"
            :user="cloud.state.user"
            :comments-service="props.commentsService"
            :location="current.target"
            :font-size="readingPrefs.fontSize"
            @font="readingPrefs.fontSize = $event"
            @note="addNote"
            @navigate="go"
            @read="readLesson"
            @mastered="markMastered"
            @wrong="markWrong"
            @variant="finishedVariant"
            @login="cloud.signIn"
          />
          <ChapterExercise
            v-else
            :chapter="chapter"
            :progress="progress"
            :owner="owner"
            :completed="cleared(chapter)"
            :disabled="cloud.state.initializing"
            @navigate="go"
            @complete="claim(chapter)"
            @wrong="markWrong"
          />
        </ChapterShell>
        <main v-else-if="view === 'account' || view === 'login'" class="account-main">
          <AccountPanel
            :cloud="cloud"
            :progress="progress"
            :today="today"
            @continue="go(resumePath)"
            @goal="changeGoal"
          />
        </main>
        <RecordPage
          v-else-if="view === 'progress'"
          :progress="progress"
          :summary="summary"
          :chapter-read="chapterReads"
          :chapter-cleared="cleared"
          :continue-path="resumePath"
          :resume="resume"
          :owner="owner"
          :save-status="saveStatus"
          :disabled="cloud.state.initializing"
          :recoveries="recoveries"
          @navigate="go"
          @remove-note="deleteNote"
          @apply-backup="applyBackup"
          @reset-data="resetData"
        />
        <NotesPage
          v-else-if="view === 'notes'"
          :notes="progress.notes"
          :save-status="saveStatus"
          :disabled="cloud.state.initializing"
          @navigate="go"
          @remove="deleteNote"
        />
        <SearchPage v-else-if="view === 'search'" :notes="progress.notes" @navigate="go" />
        <GlossaryPage v-else-if="view === 'glossary'" :initial-term="current.topic" @navigate="go" />
        <PrivacyNotice v-else-if="view === 'privacy'" @change="updateTraffic" />
        <main v-else class="record-page">
          <span class="eyebrow">404 · 链接无效</span>
          <h1>没有找到这个页面</h1>
          <p class="page-lead">可能是章节号或小节编号不正确。回到目录，就能找到正确的位置。</p>
          <div class="study-actions">
            <button class="primary" @click="go('/')">回到课程目录</button
            ><button @click="go(continuePath)">继续学习</button>
          </div>
        </main>
      </div>
      <footer class="footer">
        <div class="footer-about">
          <span>算法之旅 / ALGO QUEST · Java 基础、算法讲解与配套练习。</span>
          <p>
            仅为网站客流统计记录访问情况。<button class="footer-privacy" @click="go('/privacy')">
              隐私说明与统计设置
            </button>
          </p>
        </div>
        <details>
          <summary>课程参考与使用说明</summary>
          <p>
            课程组织参考
            <a href="https://www.hello-algo.com/" target="_blank" rel="noopener">Hello 算法</a>、
            <a href="https://algo.itcharge.cn/" target="_blank" rel="noopener">算法通关手册</a>、
            <a href="https://visualgo.net/en/sorting/" target="_blank" rel="noopener">VisuAlgo</a> 与
            <a href="https://opendsa.cs.vt.edu/" target="_blank" rel="noopener">OpenDSA</a>，语法参考
            <a href="https://dev.java/learn/" target="_blank" rel="noopener">Java 官方教程</a>。
            本站讲解、题目与交互均独立编写。网页演示内置算法步骤；编程任务使用 CheerpJ
            在浏览器隔离环境中编译运行，也可下载到本机继续。
            游客进度保存在当前浏览器，登录后可同步到账号。
          </p>
        </details>
      </footer>
    </div>
    <LessonNotes
      v-if="lesson"
      :key="'notes-' + owner + '-' + lesson.id"
      v-model="note"
      v-model:open="notesOpen"
      :pinned="readingPrefs.notesPinned"
      :lesson-title="lesson.title"
      :context-label="'第 ' + chapter.id + ' 章 · 小节 ' + (lessonIndex + 1)"
      :user="cloud.state.user"
      :sync-status="cloud.state.syncStatus"
      :storage-o-k="storageOK"
      :local-pending="localPending"
      :initializing="cloud.state.initializing"
      :inert="drawerOpen"
      @modal-change="notesModalOpen = $event"
      @wide-change="notesWide = $event"
      @pin="readingPrefs.notesPinned = $event"
      @navigate="go"
      @library="go('/notes')"
    />
    <ChapterDrawer
      v-if="hasChapterMenu"
      v-model:open="drawerOpen"
      :inert="notesModalOpen"
      :chapters="chapters"
      :chapter-id="chapter.id"
      :progress="progress"
      @navigate="go"
    />
  </div>
</template>
