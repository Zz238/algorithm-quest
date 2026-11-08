<script setup>
import { computed } from 'vue';
import GlossedText from './GlossedText.vue';
import InlineCheck from './InlineCheck.vue';
import StudyFigures from './StudyFigures.vue';
import { figurePlacement } from '../data/figure-placement.js';
const props = defineProps({ unit: Object, lesson: Object });
const emit = defineEmits(['inspect', 'note']);
const placement = computed(() => figurePlacement(props.lesson));
</script>
<template>
  <section
    id="lesson-concepts"
    class="study-anchor foundation-concepts"
    data-outline="lesson-concepts"
    data-study-section
    data-study-label="概念与图解"
  >
    <h2>把图里的变化说清楚</h2>
    <details class="foundation-terms study-details" data-study-place="terms">
      <summary>本节词语速查 · {{ unit.terms.map((t) => t.term).join('、') }}</summary>
      <div class="terms-table">
        <table>
          <thead>
            <tr>
              <th>术语</th>
              <th>通俗解释</th>
              <th>具体例子</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="term in unit.terms" :key="term.term">
              <th>{{ term.term }}</th>
              <td data-label="解释">{{ term.meaning }}</td>
              <td data-label="例子">{{ term.example }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
    <span id="lesson-figures" class="study-anchor"></span>
    <section
      v-for="(section, i) in unit.sections"
      :id="'lesson-concept-' + i"
      :key="section.title"
      class="foundation-section study-anchor"
      data-study-section
      :data-study-label="section.title"
      data-outline="lesson-concepts"
    >
      <div class="concept-heading">
        <div>
          <span class="eyebrow">理解 {{ String(i + 1).padStart(2, '0') }}</span>
          <h2>{{ section.title }}</h2>
        </div>
        <button
          class="text-button"
          type="button"
          @click="emit('note', { section: 'lesson-concept-' + i, label: section.title })"
        >
          记下这一段
        </button>
      </div>
      <StudyFigures
        v-if="placement.includes(i)"
        :lesson="lesson"
        :positions="
          placement.map((section, index) => (section === i ? index : -1)).filter((index) => index >= 0)
        "
        @inspect="emit('inspect', $event)"
        @note="emit('note', $event)"
      />
      <p v-for="paragraph in section.paragraphs" :key="paragraph">
        <GlossedText :text="paragraph" :terms="unit.terms" />
      </p>
      <InlineCheck
        v-if="i < 2"
        :question="unit.practice[i]"
        :label="i === 0 ? '停一下，确认这个概念' : '动手推演一次'"
      />
    </section>
  </section>
  <details class="worked-case study-details" data-study-place="worked-case">
    <summary>完整案例与逐步复盘</summary>
    <p class="case-setup">{{ unit.example.setup }}</p>
    <ol>
      <li v-for="(step, i) in unit.example.steps" :key="i">
        <b>{{ String(i + 1).padStart(2, '0') }}</b
        ><span>{{ step }}</span>
      </li>
    </ol>
    <p class="case-conclusion"><strong>因此：</strong>{{ unit.example.conclusion }}</p>
  </details>
  <details v-if="unit.title.startsWith('快慢怎么比较')" class="study-details">
    <summary>进阶：O(1) 和 O(n) 是什么？</summary>
    <p>
      已知下标时，格子再多也只定位一次，可记为 O(1)。从头找最后一格时，每格看一次，n 格就看 n 次，可记为
      O(n)。这里只描述数据增多后操作次数怎样增长，不是计时。
    </p>
  </details>
  <section v-if="unit.comparison" class="foundation-compare">
    <h2>回顾与对比</h2>
    <table>
      <tbody>
        <tr v-for="(row, i) in unit.comparison" :key="i">
          <th>{{ row[0] }}</th>
          <td>{{ row[1] }}</td>
          <td>{{ row[2] }}</td>
        </tr>
      </tbody>
    </table>
  </section>
  <details class="misconceptions study-details" data-study-place="misconceptions">
    <summary>容易混淆的 {{ unit.mistakes.length }} 件事</summary>
    <article v-for="mistake in unit.mistakes" :key="mistake.wrong">
      <p><strong>常见误解：</strong>{{ mistake.wrong }}</p>
      <p><strong>正确理解：</strong>{{ mistake.right }}</p>
    </article>
  </details>
</template>
