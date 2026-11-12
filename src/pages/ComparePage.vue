<script setup>
import { computed, ref, watch } from 'vue';
import { COMPARISONS, comparisonTrace } from '../comparison-traces.js';
import CourseLink from '../components/CourseLink.vue';
const emit = defineEmits(['navigate']);
const back = () => emit('navigate', '/');
const mode = ref('containers'),
  input = ref(COMPARISONS.containers.input),
  step = ref(0),
  issue = ref('');
const traces = ref(comparisonTrace(mode.value, input.value));
const spec = computed(() => COMPARISONS[mode.value]);
const max = computed(() => Math.max(traces.value.left.length, traces.value.right.length) - 1);
function build() {
  try {
    traces.value = comparisonTrace(mode.value, input.value);
    step.value = 0;
    issue.value = '';
  } catch (e) {
    issue.value = e.message;
  }
}
watch(mode, () => {
  input.value = spec.value.input;
  build();
});
</script>
<template>
  <main class="study-page">
    <CourseLink to="/" @navigate="back">← 课程目录</CourseLink>
    <h1>相同输入，看清两种思路</h1>
    <p>
      左右使用同一组数据。同步前进一步表示各自的一次教学操作，不表示操作耗时相等；较早完成的一侧会停在最终结果。
    </p>
    <div class="practice-toolbar">
      <label
        >对比主题<select v-model="mode">
          <option v-for="(c, key) in COMPARISONS" :key="key" :value="key">{{ c.title }}</option>
        </select></label
      ><label>共同输入<input v-model="input" @keydown.enter="build" /></label
      ><button @click="build">重置共同输入</button>
    </div>
    <p v-if="issue" role="alert">{{ issue }}</p>
    <p v-if="mode === 'traversal'" class="study-note">
      输入按层存入完全二叉树；下标 i 的左、右孩子分别是 2i+1、2i+2。没有相应下标时，不存在该孩子。
    </p>
    <div class="study-actions">
      <button :disabled="step === 0" @click="step--">上一步</button
      ><button :disabled="step === max" @click="step++">同步下一步</button
      ><span>{{ step + 1 }} / {{ max + 1 }}</span>
    </div>
    <div class="comparison-grid">
      <section v-for="side in ['left', 'right']" :key="side">
        <h2>{{ spec[side] }}</h2>
        <p aria-live="polite">{{ traces[side][Math.min(step, traces[side].length - 1)].message }}</p>
        <div class="reference-row">
          <code
            v-for="(value, i) in traces[side][Math.min(step, traces[side].length - 1)].values"
            :key="i"
            >{{ value }}</code
          ><span v-if="!traces[side][Math.min(step, traces[side].length - 1)].values.length">空</span>
        </div>
        <p>{{ traces[side][Math.min(step, traces[side].length - 1)].extra }}</p>
      </section>
    </div>
    <h2>区别在哪里？</h2>
    <p>{{ spec.difference }}</p>
  </main>
</template>
