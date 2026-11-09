import { computed, onMounted, onUnmounted, ref } from 'vue';
import { chapters, lessonRoute, requiredLessons } from './data/course-index.js';
import { JAVA_INDEX } from './data/course-index.js';
const coreJava = Object.values(JAVA_INDEX).filter(
  (u) => !['java-call-stack', 'java-two-loops', 'java-last-step'].includes(u.id),
);
const javaRoute = (id) => '/java/' + id.replace(/^java-/, '');
import { JAVA_START } from './data/reading-guide.js';
import { allLessons } from './course-route.js';
import { LEVELS, experience, localDateKey, recordCheckin, recordLessonReading } from './logic.js';
import {
  dailyGoal,
  dailyStudyCount,
  dueReviews,
  recordStudyActivity,
  queueReview,
  completeReview,
  setDailyGoal,
} from './study-state.js';

const core = allLessons.filter((l) => !l.optional);
const electives = allLessons.filter((l) => l.optional);
export const courseStages = ['建立编程基础', '掌握数据结构', '理解常用思路', '练习独立解题'];
export function useLearningProgress(progress, cloud, toast) {
  const today = ref(localDateKey());
  const refresh = () => {
    today.value = localDateKey();
  };
  let clock;
  onMounted(() => {
    clock = setInterval(refresh, 60000);
    document.addEventListener('visibilitychange', refresh);
  });
  onUnmounted(() => {
    clearInterval(clock);
    document.removeEventListener('visibilitychange', refresh);
  });
  const reads = computed(() => core.filter((l) => progress.lessons.includes(l.id)).length);
  const electiveReads = computed(() => electives.filter((l) => progress.lessons.includes(l.id)).length);
  const due = computed(
    () =>
      dueReviews(progress, today.value).length +
      Object.values(progress.learning.coding || {}).filter((r) => r.due <= today.value).length,
  );
  const cleared = (c) =>
    progress.bosses.includes(c.id) && (c.id !== 5 || progress.bossTasks[5] === 1051);
  const clearedCount = computed(() => chapters.filter(cleared).length);
  const countToday = computed(() => dailyStudyCount(progress, today.value));
  const goal = computed(() => dailyGoal(progress));
  const signedToday = computed(() => progress.checkins.includes(today.value));
  const continuePath = computed(() => {
    const java = coreJava.find(
      (u) => JAVA_START.includes(u.id) && !progress.learning.prepared.includes(u.id),
    );
    if (!progress.lessons.length && !progress.mastery.length && java) return javaRoute(java.id);
    const next = core.find((l) => !progress.lessons.includes(l.id));
    return next ? lessonRoute(next.id) : due.value ? '/review' : '/progress';
  });
  const chapterReads = (c) => requiredLessons(c).filter((l) => progress.lessons.includes(l.id)).length;
  const summary = computed(() => {
    const independent = allLessons.filter((l) => progress.learning.independent.includes(l.id)).length;
    const practicePoints = 30 * progress.mastery.length + 20 * independent + 150 * clearedCount.value;
    const next = LEVELS.find((level) => level.min > practicePoints);
    return {
      core: core.length,
      electives: electives.length,
      reads: reads.value,
      electiveReads: electiveReads.value,
      completion: Math.round((reads.value / core.length) * 100),
      due: due.value,
      independent,
      cleared: clearedCount.value,
      legacyPoints: experience(progress),
      practicePoints,
      nextLevel: next?.name || null,
      toNext: next ? next.min - practicePoints : 0,
    };
  });
  function markWrong(id) {
    if (cloud.state.initializing) return;
    refresh();
    queueReview(progress, id, today.value, true);
  }
  function markMastered(id) {
    if (cloud.state.initializing || progress.mastery.includes(id)) return;
    progress.mastery.push(id);
    refresh();
    queueReview(progress, id, today.value);
    toast('基础练习已通过。明天可以换一道题复习。');
  }
  function markPrepared(id) {
    if (cloud.state.initializing) return;
    refresh();
    if (!progress.learning.prepared.includes(id)) progress.learning.prepared.push(id);
    queueReview(progress, id, today.value);
    recordStudyActivity(progress, id, today.value);
    toast(
      recordCheckin(progress, today.value, !!cloud.state.user)
        ? '今天的学习目标已达到，已自动打卡。'
        : '这一节 Java 练习已保存。',
    );
  }
  function finishedVariant({ id, assisted }) {
    if (cloud.state.initializing) return;
    assisted = assisted !== false;
    refresh();
    completeReview(progress, id, today.value, assisted);
    if (!assisted && !progress.learning.independent.includes(id)) progress.learning.independent.push(id);
    const checked = recordCheckin(progress, today.value, !!cloud.state.user);
    toast(
      (assisted ? '已记录参考后完成，下次换题再试。' : '已记录独立完成。') +
        (checked ? ' 今天已自动打卡。' : ''),
    );
  }
  function changeGoal(count) {
    if (cloud.state.initializing || !setDailyGoal(progress, count)) return;
    refresh();
    toast(
      recordCheckin(progress, today.value, !!cloud.state.user)
        ? '目标已更新，今天已自动打卡。'
        : '每日目标已保存。',
    );
  }
  function markRead(id) {
    if (cloud.state.initializing) return false;
    refresh();
    const loggedIn = !!cloud.state.user;
    const result = recordLessonReading(progress, id, today.value, loggedIn);
    if (!loggedIn) recordStudyActivity(progress, id, today.value);
    toast(
      result.checkedIn ? '今天的学习目标已达到，已自动打卡。' : '阅读已保存。还没做的练习可以稍后回来。',
    );
    return true;
  }
  function claim(chapter) {
    if (cloud.state.initializing || cleared(chapter)) return;
    if (!progress.bosses.includes(chapter.id)) progress.bosses.push(chapter.id);
    progress.bossTasks[chapter.id] = chapter.boss.lc;
    toast('本章练习已完成，记录已保存。');
  }
  return {
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
  };
}
