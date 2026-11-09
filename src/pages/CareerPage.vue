<script setup>
import { computed, ref } from 'vue';
import { CAREER_ROUTES, CAREER_BY_ID, careerStageRoute } from '../data/career-index.js';
import { CAREER_LESSONS } from '../data/career-lessons.js';
import { useStudyDraft } from '../study-drafts.js';
import { answerState } from '../answering.js';
import { useCodingProgress } from '../coding-progress.js';
import CourseLink from '../components/CourseLink.vue';
import PracticeCard from '../components/PracticeCard.vue';
import UiCheckbox from '../components/ui/UiCheckbox.vue';
import UiButton from '../components/ui/UiButton.vue';
const props = defineProps({ routeId: String, stageId: String, owner: String, disabled: Boolean });
const emit = defineEmits(['navigate']);
const service = useCodingProgress();
const route = computed(() => CAREER_BY_ID[props.routeId]);
const stage = computed(() => route.value?.stages.find(([id]) => id === props.stageId));
const key = props.routeId + '-' + props.stageId;
const lesson = CAREER_LESSONS[key];
const draft = lesson
  ? useStudyDraft(props.owner, key, 'career-worksheet', (raw) => ({
      checked: lesson.deliverables.map((_, i) => raw?.checked?.[i] === true),
      evidence: typeof raw?.evidence === 'string' ? raw.evidence.slice(0, 2000) : '',
      quiz: lesson.questions.map((q, i) => answerState(q, raw?.quiz?.[i])),
    }))
  : null;
const ready = computed(
  () =>
    draft?.checked.every(Boolean) &&
    draft.quiz.every((q) => q.passed) &&
    draft.evidence.trim().length >= 10,
);
const checked = computed(() => service?.progress.learning.career[key]?.checked === true);
const downloadBusy = ref(false),
  error = ref('');
async function download() {
  downloadBusy.value = true;
  error.value = '';
  try {
    const { downloadCareerProject } = await import('../project-export.js');
    downloadCareerProject(props.routeId);
  } catch {
    error.value = '项目包暂时未能下载，请重试。';
  } finally {
    downloadBusy.value = false;
  }
}
const selected = computed(() => service?.progress.learning.routeChoice?.id);
function mark(value) {
  if (props.disabled || (!ready.value && value)) return;
  service?.career(key, value);
}
</script>
<template>
  <main class="career-page" :class="{ 'has-career-stage': stage }">
    <template v-if="!route"
      ><div class="career-lead">
        <span class="eyebrow">职业路线 · 独立于基础教学</span>
        <h1>从会写程序，到完成一份岗位作品</h1>
        <p>
          先建立共同的编程与算法基础，再按目标岗位补齐工程或建模能力。两条路线可以切换，学习记录分别保存。
        </p>
        <CourseLink to="/" @navigate="emit('navigate', $event)"
          >还没学过编程？先进入基础教学 →</CourseLink
        >
      </div>
      <div class="career-route-grid">
        <article v-for="r in CAREER_ROUTES" :key="r.id">
          <span class="eyebrow">{{ r.stages.length }} 个阶段</span>
          <h2>{{ r.title }}</h2>
          <p>{{ r.summary }}</p>
          <h3>开始前建议具备</h3>
          <ul>
            <li v-for="item in r.prerequisites" :key="item">{{ item }}</li>
          </ul>
          <CourseLink :to="'/careers/' + r.id" @navigate="emit('navigate', $event)"
            >查看路线与实践 →</CourseLink
          >
        </article>
      </div>
      <aside class="study-note">
        <strong>如何认定完成</strong>
        <p>
          基础编程任务可在浏览器真实执行。职业阶段另外包含概念小测、项目工作单和自评证据；“阶段自评完成”不等同于平台验证了完整工程，也不保证就业。
        </p>
      </aside></template
    >
    <template v-else
      ><aside class="career-sidebar">
        <CourseLink to="/careers" @navigate="emit('navigate', $event)">← 职业路线</CourseLink>
        <h2>{{ route.title }}</h2>
        <nav aria-label="职业路线阶段">
          <CourseLink
            v-for="([id, title], i) in route.stages"
            :key="id"
            :to="careerStageRoute(route.id, id)"
            :aria-current="stageId === id ? 'page' : undefined"
            @navigate="emit('navigate', $event)"
            ><span
              >{{ service?.progress.learning.career[route.id + '-' + id]?.checked ? '✓' : i + 1 }}.
              {{ title }}</span
            ></CourseLink
          >
        </nav>
        <CourseLink to="/practice" @navigate="emit('navigate', $event)">编程练习库 →</CourseLink>
      </aside>
      <article class="career-content">
        <template v-if="!stage"
          ><span class="eyebrow">职业路线</span>
          <h1>{{ route.title }}</h1>
          <p>{{ route.summary }}</p>
          <p>
            这是岗位能力的起步训练。阶段之间按前置关系推进；已有基础可以先做本阶段小测和实践，再判断是否跳过详细说明。
          </p>
          <h2>开始前检查</h2>
          <ul>
            <li v-for="p in route.prerequisites" :key="p">{{ p }}</li>
          </ul>
          <div class="study-actions">
            <UiButton
              variant="primary"
              icon="next"
              @click="emit('navigate', careerStageRoute(route.id, route.stages[0][0]))"
              >从第一阶段开始</UiButton
            ><UiButton
              :icon="selected === route.id ? 'check' : 'pin'"
              :disabled="disabled"
              @click="service?.choose(route.id)"
              >{{ selected === route.id ? '已选择这条路线' : '设为我的学习方向' }}</UiButton
            >
          </div>
          <h2>阶段安排与交付</h2>
          <ol class="career-stage-list">
            <li v-for="([id, title], i) in route.stages" :key="id">
              <CourseLink :to="careerStageRoute(route.id, id)" @navigate="emit('navigate', $event)"
                ><strong>{{ i + 1 }}. {{ title }}</strong></CourseLink
              >
              <p>{{ CAREER_LESSONS[route.id + '-' + id].assignment }}</p>
            </li>
          </ol></template
        ><template v-else
          ><span class="eyebrow"
            >{{ route.title }} · 阶段 {{ route.stages.findIndex(([id]) => id === stageId) + 1 }}</span
          >
          <h1>{{ stage[1] }}</h1>
          <p class="career-story">{{ lesson.story }}</p>
          <nav class="career-on-this-page" aria-label="本阶段目录">
            <CourseLink
              v-for="[id, label] in [
                ['career-concepts', '理解概念'],
                ['career-steps', '跟着操作'],
                ['career-practice', '动手任务'],
                ['career-check', '自检与交付'],
              ]"
              :key="id"
              :to="careerStageRoute(route.id, stageId) + '?at=' + id"
              @navigate="emit('navigate', $event)"
              >{{ label }}</CourseLink
            >
          </nav>
          <section id="career-concepts">
            <h2>先把概念说清楚</h2>
            <div v-for="[term, text] in lesson.concepts" :key="term" class="career-concept">
              <h3>{{ term }}</h3>
              <p>{{ text }}</p>
            </div>
          </section>
          <section id="career-steps">
            <h2>跟着一个例子走</h2>
            <ol class="career-walkthrough">
              <li v-for="stepText in lesson.steps" :key="stepText">{{ stepText }}</li>
            </ol>
            <div v-if="lesson.example">
              <p>上面的过程对应这段小例子。先预测结果，再核对注释。</p>
              <pre class="study-code"><code>{{ lesson.example.code }}</code></pre>
            </div>
          </section>
          <section id="career-practice">
            <h2>动手任务</h2>
            <p>{{ lesson.assignment }}</p>
            <ul v-if="lesson.tasks.length" class="study-route-list">
              <li v-for="id in lesson.tasks" :key="id">
                <CourseLink :to="'/practice/' + id" @navigate="emit('navigate', $event)"
                  >打开配套 Java 编程任务 · {{ id.replace('code-', '') }} →</CourseLink
                >
              </li>
            </ul>
            <UiButton icon="download" :loading="downloadBusy" @click="download">{{
              route.id === 'backend' ? '下载后端项目与 SQL 工作单' : '下载 Python、Notebook 与推荐实验'
            }}</UiButton>
            <p class="micro">
              项目包同时含 starter 与 reference；先完成
              starter，再打开参考实现。后端项目在本机使用Java/Maven；Python与Notebook在自己的Python环境运行。
            </p>
            <p v-if="error" role="alert">{{ error }}</p>
          </section>
          <section id="career-check">
            <h2>自检与交付</h2>
            <PracticeCard
              v-for="(q, i) in lesson.questions"
              :key="i"
              :question="q"
              :state="draft.quiz[i]"
              :label="'概念自检 ' + (i + 1)"
              :disabled="disabled"
            />
            <div class="career-deliverables">
              <UiCheckbox
                v-for="(text, i) in lesson.deliverables"
                :key="text"
                v-model="draft.checked[i]"
                :disabled="disabled"
                >{{ text }}</UiCheckbox
              >
            </div>
            <label class="mini-output"
              >留下实践证据与复盘<textarea
                v-model="draft.evidence"
                maxlength="2000"
                rows="4"
                placeholder="记录运行命令、实际结果、一次失败与修正。可填自己的项目链接；不要填写密码、令牌或个人敏感信息。"
              /></label
            ><UiButton
              :icon="checked ? 'check' : 'next'"
              :disabled="disabled || (!checked && !ready)"
              @click="mark(!checked)"
              >{{ checked ? '撤销本阶段自评完成' : '记录本阶段自评完成' }}</UiButton
            >
            <p class="micro">
              先通过两道自检、核对全部交付项并填写至少10字实践记录。草稿留在本机；路线选择和阶段自评随既有账号存档同步。
            </p>
          </section>
          <section class="career-resources">
            <h2>继续查阅官方资料</h2>
            <ul>
              <li v-for="[title, url] in lesson.resources" :key="url">
                <a :href="url" target="_blank" rel="noopener">{{ title }} ↗</a>
              </li>
            </ul>
            <p class="micro">本站用独立编写的例子串联基础概念；参考资料用于核对语法、方法与实践安排。</p>
          </section>
          <div class="study-actions">
            <CourseLink :to="'/careers/' + route.id" @navigate="emit('navigate', $event)"
              >返回路线总览 →</CourseLink
            ><CourseLink
              v-if="route.stages.findIndex(([id]) => id === stageId) < route.stages.length - 1"
              :to="
                careerStageRoute(
                  route.id,
                  route.stages[route.stages.findIndex(([id]) => id === stageId) + 1][0],
                )
              "
              @navigate="emit('navigate', $event)"
              >下一阶段 →</CourseLink
            >
          </div></template
        >
      </article></template
    >
  </main>
</template>
