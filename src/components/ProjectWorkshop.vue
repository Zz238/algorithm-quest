<script setup>
import { computed } from 'vue';
import { useStudyDraft } from '../study-drafts.js';
import { downloadText } from '../download.js';
import { PROJECT_TASKS, PROJECT_BOUNDARIES } from '../data/stage-projects.js';
import JavaWriteTask from './JavaWriteTask.vue';
import UiCheckbox from './ui/UiCheckbox.vue';
import UiButton from './ui/UiButton.vue';
const props = defineProps({ project: Object, owner: String, seed: Number });
const draft = useStudyDraft(props.owner, props.project.id, 'project-plan', (raw) => ({
  goal: typeof raw?.goal === 'string' ? raw.goal.slice(0, 1200) : '',
  plan: typeof raw?.plan === 'string' ? raw.plan.slice(0, 1800) : '',
  boundary: typeof raw?.boundary === 'string' ? raw.boundary.slice(0, 1200) : '',
  checked: raw?.checked === true,
}));
const task = computed(() => PROJECT_TASKS[props.project.id]);
function exportPlan() {
  downloadText(
    props.project.id + '-plan.md',
    '# ' +
      props.project.title +
      '\n\n当前情境：' +
      props.project.prompt +
      '\n\n## 输入和输出\n' +
      draft.goal +
      '\n\n## 我的处理办法\n' +
      draft.plan +
      '\n\n## 边界测试\n' +
      draft.boundary +
      '\n\n说明：作品清单由本人核对，不代表网站运行过 Java。',
  );
}
</script>
<template>
  <section class="project-worksheet" aria-label="阶段作品工作单">
    <h2>把这道题做成一个小作品</h2>
    <p>先完成上面的选方法与推演，再写下自己的处理过程。换情境后，检查工作单中的数据是否也需要调整。</p>
    <label class="mini-output"
      ><span>1. 我拿到什么，要交出什么？</span
      ><textarea
        v-model="draft.goal"
        maxlength="1200"
        rows="3"
        placeholder="写清当前输入和输出，不只写算法名称。"
      />
    </label>
    <label class="mini-output"
      ><span>2. 我为什么选这种办法？每一步做什么？</span
      ><textarea
        v-model="draft.plan"
        maxlength="1800"
        rows="4"
        placeholder="例如：只关心最后总额，所以保留一个总额变量即可。"
      />
    </label>
    <label class="mini-output"
      ><span>3. 换一组边界数据，还成立吗？</span
      ><textarea
        v-model="draft.boundary"
        maxlength="1200"
        rows="3"
        placeholder="给出一组边界输入，并写下预期结果。"
      />
    </label>
    <details>
      <summary>不知道怎样设计边界？看两条检查线索</summary>
      <ul>
        <li v-for="text in PROJECT_BOUNDARIES[project.id]" :key="text">{{ text }}</li>
      </ul>
    </details>
    <JavaWriteTask :task="task" :topic="project.id" :owner="owner" />
    <UiCheckbox v-model="draft.checked" class="project-self-check"
      >我已核对输入输出、解释选择理由，并尝试了一组不同数据。</UiCheckbox
    >
    <p v-if="draft.checked" role="status">
      已保存你的自评。本机编译运行的结果需要你自己核对，网站没有执行这段 Java。
    </p>
    <UiButton icon="download" @click="exportPlan">导出这份作品说明 Markdown</UiButton>
    <p class="micro">工作单和代码草稿仅保存在当前浏览器；与账号中的练习进度分别保存。</p>
  </section>
</template>
