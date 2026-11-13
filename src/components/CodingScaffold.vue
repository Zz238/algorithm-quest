<script setup>
import { computed, ref } from 'vue';
import UiButton from './ui/UiButton.vue';
const props = defineProps({
  task: Object,
  scaffold: Object,
  state: Object,
  disabled: Boolean,
  reading: Boolean,
});
const emit = defineEmits(['mode', 'checked', 'update']);
const modes = [
  ['one', '第一关 · 填 1 空'],
  ['three', '第二关 · 填 3 空'],
  ['independent', '第三关 · 独立编写'],
  ['parsons', '代码积木'],
  ['typing', '代码跟打'],
];
const feedback = ref(''),
  dragged = ref(null);
const blanks = computed(() =>
  ['one', 'three'].includes(props.state.mode) ? props.scaffold[props.state.mode] : null,
);
const blocks = computed(() =>
  props.state.order.map((id) => props.scaffold.blocks.find((b) => b.id === id)),
);
const prefix = computed(() => {
  let i = 0;
  while (i < props.state.typing.length && props.state.typing[i] === props.scaffold.typing[i]) i++;
  return i;
});
const typingRows = computed(
  () => Math.max(props.scaffold.typing.split('\n').length, props.state.typing.split('\n').length, 6) + 1,
);
function changeMode(mode) {
  feedback.value = '';
  emit('mode', mode);
}
function move(id, delta) {
  if (props.disabled) return;
  const order = [...props.state.order],
    index = order.indexOf(id),
    target = index + delta;
  if (target < 0 || target >= order.length) return;
  [order[index], order[target]] = [order[target], order[index]];
  emit('update', { order });
  feedback.value = '';
}
function drop(id) {
  if (props.disabled || !dragged.value || dragged.value === id) return;
  const target = props.state.order.indexOf(id);
  const order = props.state.order.filter((x) => x !== dragged.value);
  order.splice(target, 0, dragged.value);
  emit('update', { order });
  dragged.value = null;
  feedback.value = '';
}
function check() {
  let ok = false;
  if (blanks.value) {
    const count = blanks.value.answers.filter(
      (answer, i) => props.state[props.state.mode][i].trim() === answer.trim(),
    ).length;
    ok = count === blanks.value.answers.length;
    feedback.value = ok
      ? '所有空都与参考写法一致。想一想每个空为什么这样写，再进入下一关。'
      : '已有 ' +
        count +
        ' / ' +
        blanks.value.answers.length +
        ' 个空与参考写法一致，请再检查条件、变量和符号。';
  } else if (props.state.mode === 'parsons') {
    const index = props.scaffold.blocks.findIndex(
      (b, i) => blocks.value[i].code !== b.code || props.state.indents[blocks.value[i].id] !== b.indent,
    );
    ok = index < 0;
    feedback.value = ok
      ? '顺序与缩进都和参考一致。请读一遍程序的执行过程。'
      : '从第 ' + (index + 1) + ' 块开始检查顺序或缩进；先准备状态，再执行操作，最后返回结果。';
  } else {
    ok = props.state.typing === props.scaffold.typing;
    feedback.value = ok
      ? '完整跟打完成。下一次试着收起参考，独立写一遍。'
      : '已连续匹配 ' + prefix.value + ' 个字符。请从下一处灰字继续，留意空格和换行。';
  }
  if (ok) emit('checked', props.state.mode);
}
function typeTab(event) {
  const target = event.target,
    start = target.selectionStart,
    end = target.selectionEnd;
  emit('update', {
    typing: props.state.typing.slice(0, start) + '    ' + props.state.typing.slice(end),
  });
  requestAnimationFrame(() => target.setSelectionRange(start + 4, start + 4));
}
function fillBlank(index, value) {
  const answers = [...props.state[props.state.mode]];
  answers[index] = value;
  emit('update', { [props.state.mode]: answers });
  feedback.value = '';
}
function indent(id, delta) {
  emit('update', { indents: { ...props.state.indents, [id]: props.state.indents[id] + delta } });
  feedback.value = '';
}
</script>
<template>
  <div class="coding-scaffold">
    <nav class="coding-mode-tabs" aria-label="选择代码练习模式">
      <button
        v-for="[id, label] in modes"
        :key="id"
        type="button"
        :aria-pressed="state.mode === id"
        :disabled="disabled"
        @click="changeMode(id)"
      >
        {{ label
        }}<span v-if="state.completed[id]" class="coding-mode-done">{{
          state.completed[id] === 'tested' ? '已通过测试' : '已核对'
        }}</span>
      </button>
    </nav>
    <div class="coding-mode-intro">
      <template v-if="state.mode === 'one'"
        ><h3>只补最关键的一处</h3>
        <p>其余代码已准备好。读懂上下文，再把这一处补完整；不必急着背下整段代码。</p></template
      >
      <template v-else-if="state.mode === 'three'"
        ><h3>把关键步骤连起来</h3>
        <p>这次补三处，观察准备状态、处理过程与返回结果怎样连接。可以随时回到第一关。</p></template
      >
      <template v-else-if="state.mode === 'independent'"
        ><h3>顺着中文步骤，独立写出 Java</h3>
        <p>把每条中文步骤翻译成代码。这里保存自己的 Main.java，不会被其他模式的答案覆盖。</p></template
      >
      <template v-else-if="state.mode === 'parsons'"
        ><h3>先排清楚，再写流畅</h3>
        <p>
          拖动代码块调整顺序，用缩进按钮表达层次。也可用上移、下移完成排序。短题按实际代码行数练习。
        </p></template
      >
      <template v-else
        ><h3>照着灰字，亲手敲一遍</h3>
        <p>
          灰字是参考方法体。从第一行开始输入，留意括号、分号和换行；Tab 输入四个空格，Shift + Tab
          离开输入区。
        </p></template
      >
    </div>
    <template v-if="state.mode === 'one' || state.mode === 'three'">
      <p class="coding-file-context">{{ task.signature }} {</p>
      <div class="coding-blank-code" aria-label="待填空的方法体">
        <template v-for="(part, i) in blanks.parts" :key="i"
          ><code>{{ part }}</code
          ><textarea
            v-if="i < blanks.answers.length"
            :class="{
              'is-multiline': blanks.answers[i].includes('\n') || state[state.mode][i].includes('\n'),
            }"
            :style="{
              width:
                Math.max(
                  17,
                  Math.min(50, Math.max(blanks.answers[i].length, state[state.mode][i].length) + 2),
                ) + 'ch',
            }"
            :value="state[state.mode][i]"
            :aria-label="'第 ' + (i + 1) + ' 个空'"
            :rows="Math.max(1, state[state.mode][i].split('\n').length)"
            maxlength="1000"
            :disabled="disabled"
            spellcheck="false"
            autocapitalize="off"
            autocomplete="off"
            :placeholder="'在这里补第 ' + (i + 1) + ' 个空'"
            @input="fillBlank(i, $event.target.value)"
          ></textarea>
        </template>
      </div>
      <p class="coding-file-context">}</p>
    </template>
    <slot v-else-if="state.mode === 'independent'" />
    <ol v-else-if="state.mode === 'parsons'" class="coding-blocks" aria-label="待排序的代码块">
      <li
        v-for="(block, i) in blocks"
        :key="block.id"
        :draggable="!disabled"
        :class="{ 'is-dragging': dragged === block.id }"
        @dragstart="
          dragged = block.id;
          $event.dataTransfer.setData('text/plain', block.id);
        "
        @dragend="dragged = null"
        @dragover.prevent
        @drop.prevent="drop(block.id)"
      >
        <div class="coding-block-line">
          <span class="coding-block-index">{{ i + 1 }}</span
          ><code :style="{ paddingInlineStart: state.indents[block.id] * 1.3 + 'em' }">{{
            block.code
          }}</code>
        </div>
        <div class="coding-block-actions">
          <button
            type="button"
            :disabled="disabled || i === 0"
            :aria-label="'上移第 ' + (i + 1) + ' 块'"
            @click="move(block.id, -1)"
          >
            上移</button
          ><button
            type="button"
            :disabled="disabled || i === blocks.length - 1"
            :aria-label="'下移第 ' + (i + 1) + ' 块'"
            @click="move(block.id, 1)"
          >
            下移</button
          ><button
            type="button"
            :disabled="disabled || state.indents[block.id] === 0"
            :aria-label="'减少第 ' + (i + 1) + ' 块缩进'"
            @click="indent(block.id, -1)"
          >
            减缩进</button
          ><button
            type="button"
            :disabled="disabled || state.indents[block.id] >= 6"
            :aria-label="'增加第 ' + (i + 1) + ' 块缩进'"
            @click="indent(block.id, 1)"
          >
            加缩进
          </button>
        </div>
      </li>
    </ol>
    <div v-else class="coding-typing">
      <p class="micro">
        连续匹配 {{ prefix }} / {{ scaffold.typing.length }} 字符<span
          v-if="state.typing.length > prefix"
        >
          · 下一处输入与参考不同</span
        >
      </p>
      <div class="coding-typing-surface">
        <pre aria-hidden="true" class="coding-typing-ghost"
          >{{ scaffold.typing }}
 </pre
        >
        <textarea
          :value="state.typing"
          :rows="typingRows"
          aria-label="照着灰字输入 Java 方法体"
          :disabled="disabled"
          maxlength="12000"
          spellcheck="false"
          autocapitalize="off"
          autocomplete="off"
          @keydown.tab.exact.prevent="typeTab"
          @input="
            emit('update', { typing: $event.target.value });
            feedback = '';
          "
        ></textarea>
      </div>
      <details>
        <summary>用纯文本阅读参考代码</summary>
        <pre class="study-code"><code>{{ scaffold.typing }}</code></pre>
      </details>
    </div>
    <template v-if="state.mode !== 'independent'">
      <div class="coding-scaffold-actions">
        <UiButton :disabled="disabled" @click="check">按参考写法核对</UiButton
        ><UiButton
          v-if="state.mode === 'one'"
          variant="ghost"
          :disabled="disabled"
          @click="changeMode('three')"
          >进入填 3 空</UiButton
        ><UiButton
          v-else-if="state.mode === 'three'"
          variant="ghost"
          :disabled="disabled"
          @click="changeMode('independent')"
          >尝试独立编写</UiButton
        >
      </div>
      <p v-if="feedback" class="coding-feedback" role="status">{{ feedback }}</p>
      <p class="micro">
        参考核对只比较本题参考写法，不代表 Java 已编译或通过测试。{{
          reading
            ? '手机端可继续填空、排序和跟打；请在电脑端提交真实测试。'
            : '也可以在下方提交全部测试，检验拼出的真实 Java 代码。'
        }}辅助模式完成会单独记录，不计为独立通过。
      </p>
    </template>
    <details class="coding-learning-guide">
      <summary>从看懂到写出：给第一次练代码的你</summary>
      <ol>
        <li>
          <strong>可以先临摹。</strong
          >先读参考，收起它复述步骤，再照着敲一遍。临摹是练习的起点，之后再用独立编写检验自己。
        </li>
        <li>
          <strong>画图 → 中文伪代码 → Java。</strong
          >先画出数据变化，写三四句大白话，再把每句话翻译成代码。
        </li>
        <li>
          <strong>记骨架，再改细节。</strong
          >逐步熟悉二分查找、双指针、快慢指针、哈希查找和遍历累积这五类常用写法；每题仍要检查适用条件和边界。
        </li>
      </ol>
    </details>
  </div>
</template>
