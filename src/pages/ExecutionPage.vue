<script setup>
import { computed, ref, onUnmounted, watch } from 'vue';
import { EXECUTION_EXAMPLES, recursionTrace, linkedTrace } from '../execution-traces.js';
import CourseLink from '../components/CourseLink.vue';
const emit = defineEmits(['navigate']);
const back = () => emit('navigate', '/');
const mode = ref('recursion'),
  input = ref('3'),
  step = ref(0),
  frames = ref(recursionTrace(3)),
  issue = ref(''),
  playing = ref(false);
const example = computed(() => EXECUTION_EXAMPLES[mode.value]);
const state = computed(() => frames.value[step.value]);
let timer;
function stop() {
  clearInterval(timer);
  playing.value = false;
}
function build() {
  stop();
  try {
    frames.value =
      mode.value === 'recursion'
        ? recursionTrace(Number(input.value))
        : linkedTrace(input.value.trim() ? input.value.split(/[,，\s]+/).map(Number) : []);
    step.value = 0;
    issue.value = '';
  } catch (e) {
    issue.value = e.message;
  }
}
function play() {
  if (playing.value) return stop();
  if (step.value === frames.value.length - 1) step.value = 0;
  playing.value = true;
  timer = setInterval(() => {
    if (step.value < frames.value.length - 1) step.value++;
    else stop();
  }, 1100);
}
watch(mode, () => {
  input.value = mode.value === 'recursion' ? '3' : '1,2,3';
  build();
});
onUnmounted(stop);
</script>
<template>
  <main class="study-page">
    <CourseLink to="/" @navigate="back">← 课程目录</CourseLink>
    <h1>让代码一行一行走</h1>
    <p>
      观察调用栈中的独立作用域，以及多个引用如何指向堆中的同一个对象。这里是所示 Java
      示例的教学推演，无需下载运行环境。
    </p>
    <div class="practice-toolbar">
      <label
        >示例<select v-model="mode">
          <option value="recursion">递归与调用栈</option>
          <option value="linked">链表与引用</option>
        </select></label
      ><label
        >{{ mode === 'recursion' ? 'n（0～6）' : '链表元素（逗号分隔）'
        }}<input v-model="input" @keydown.enter="build" /></label
      ><button @click="build">重新推演</button>
    </div>
    <p v-if="issue" role="alert">{{ issue }}</p>
    <div class="study-actions">
      <button
        :disabled="step === 0"
        @click="
          stop();
          step--;
        "
      >
        上一步</button
      ><button @click="play">{{ playing ? '暂停' : '自动播放' }}</button
      ><button
        :disabled="step === frames.length - 1"
        @click="
          stop();
          step++;
        "
      >
        下一步</button
      ><label
        >步骤 {{ step + 1 }} / {{ frames.length
        }}<input v-model.number="step" type="range" :min="0" :max="frames.length - 1" @input="stop"
      /></label>
    </div>
    <p class="study-note" aria-live="polite">{{ state.message }}</p>
    <div class="execution-layout">
      <section>
        <h2>{{ example.title }}</h2>
        <ol class="execution-code">
          <li
            v-for="(line, i) in example.code"
            :key="i"
            :class="{ current: state.line === i + 1 }"
            :aria-current="state.line === i + 1 ? 'step' : undefined"
          >
            <code>{{ line.replace('INPUT', input) }}</code>
          </li>
        </ol>
      </section>
      <section>
        <h2>调用栈 · 栈顶在上</h2>
        <p v-if="!state.frames.length" class="micro">当前方法已返回，没有活动的方法帧。</p>
        <ol class="execution-stack">
          <li v-for="(frame, i) in [...state.frames].reverse()" :key="i">
            <strong>{{ frame.name }}</strong>
            <dl>
              <template v-for="(value, name) in frame.locals" :key="name"
                ><dt>{{ name }}</dt>
                <dd>{{ value === null ? 'null' : value }}</dd></template
              >
            </dl>
          </li>
        </ol>
        <p v-if="state.result !== null && state.result !== undefined">
          返回值：<strong>{{ state.result }}</strong>
        </p>
      </section>
    </div>
    <section v-if="mode === 'linked'">
      <h2>堆对象与引用</h2>
      <p class="micro">N0、N1 是对象标识。箭头中的标识相同，表示指向同一个节点。</p>
      <div class="reference-row">
        <code v-for="(value, key) in state.refs" :key="key">{{ key }} → {{ value || 'null' }}</code>
      </div>
      <div class="heap-nodes">
        <div v-for="node in state.heap" :key="node.id">
          <strong>{{ node.id }} · value={{ node.value }}</strong
          ><code>next → {{ node.next || 'null' }}</code>
        </div>
        <p v-if="!state.heap.length">空链表没有节点对象。</p>
      </div>
    </section>
  </main>
</template>
