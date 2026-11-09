<script setup>
import { ref } from 'vue';
import ChapterFigures from './ChapterFigures.vue';
import { ROADMAP_ITEMS, roadmapItemRoute } from '../data/algorithm-roadmap.js';
import CourseLink from './CourseLink.vue';
const topic = (id) => ROADMAP_ITEMS.find((t) => t.id === id);
const emit = defineEmits(['navigate']);
defineProps({ intro: Object, chapterId: Number, first: Boolean });
const chosen = ref(-1),
  checked = ref(false);
</script>
<template>
  <details class="chapter-introduction" data-study-place="intro" :open="first">
    <summary>
      <span
        ><span class="eyebrow">本章导读 · 第 {{ chapterId }} 章</span
        ><strong>{{ intro.heading }}</strong></span
      ><span class="intro-expand" aria-hidden="true">⌄</span>
    </summary>
    <div class="chapter-intro-body">
      <p v-for="paragraph in intro.why" :key="paragraph">{{ paragraph }}</p>
      <section class="chapter-definition">
        <h3>它是什么？</h3>
        <p>{{ intro.definition }}</p>
      </section>
      <ChapterFigures v-if="first" :chapter-id="chapterId" @navigate="emit('navigate', $event)" />
      <details class="study-details" data-study-place="intro-more">
        <summary>继续看本章词语、例子和自检</summary>
        <h3>先把这些词换成大白话</h3>
        <dl class="intro-concepts">
          <div v-for="concept in intro.concepts" :key="concept.name">
            <dt>{{ concept.name }}</dt>
            <dd>
              <p>{{ concept.meaning }}</p>
              <small>{{ concept.example }}</small>
            </dd>
          </div>
        </dl>
        <section class="intro-example">
          <h3>拿一件具体的事走一遍</h3>
          <p>{{ intro.example.setup }}</p>
          <ol>
            <li v-for="step in intro.example.steps" :key="step">{{ step }}</li>
          </ol>
          <p class="intro-takeaway">{{ intro.example.conclusion }}</p>
        </section>
        <section v-if="intro.boundaries">
          <h3>这个类比能说明什么，又不能说明什么？</h3>
          <ul>
            <li v-for="item in intro.boundaries" :key="item">{{ item }}</li>
          </ul>
        </section>
        <section>
          <h3>这一章会按什么顺序学？</h3>
          <ol>
            <li v-for="item in intro.path" :key="item">{{ item }}</li>
          </ol>
        </section>
        <section class="intro-check" aria-label="章前理解自检">
          <h3>先确认一个小问题</h3>
          <p>{{ intro.check.question }}</p>
          <div class="intro-options">
            <button
              v-for="(option, index) in intro.check.options"
              :key="option"
              :aria-pressed="chosen === index"
              :class="{ selected: chosen === index }"
              @click="
                chosen = index;
                checked = false;
              "
            >
              <span>{{ 'ABC'[index] }}</span
              >{{ option }}
            </button>
          </div>
          <button :disabled="chosen < 0" @click="checked = true">检查理解</button>
          <p v-if="checked" class="intro-feedback" role="status">
            <strong>{{ chosen === intro.check.answer ? '理解正确。' : '再想一想。' }}</strong
            >{{ intro.check.explanation }}
          </p>
        </section>
      </details>
      <details class="intro-further">
        <summary>基础理解后，再看一点进阶</summary>
        <ul>
          <li v-for="item in intro.further" :key="item">{{ item }}</li>
        </ul>
      </details>
      <details v-if="intro.curriculum" class="study-details" data-study-place="intro-operations">
        <summary>这章的操作成本、使用场景与后续专题</summary>
        <p>{{ intro.curriculum.focus }}</p>
        <div class="terms-table">
          <table>
            <thead>
              <tr>
                <th>动作</th>
                <th>成本</th>
                <th>成立前提</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in intro.curriculum.operations" :key="row[0]">
                <th>{{ row[0] }}</th>
                <td data-label="成本">{{ row[1] }}</td>
                <td data-label="前提">{{ row[2] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul>
          <li v-for="text in intro.curriculum.applications" :key="text">{{ text }}</li>
        </ul>
        <nav class="topic-related" aria-label="本章后续专题">
          <CourseLink
            v-for="id in intro.curriculum.topics"
            :key="id"
            :to="roadmapItemRoute(topic(id))"
            @navigate="emit('navigate', $event)"
            >{{ topic(id).title }} →</CourseLink
          >
        </nav>
      </details>
      <p v-if="intro.sources" class="intro-sources">
        参考与延伸阅读：<a
          v-for="source in intro.sources"
          :key="source.url"
          :href="source.url"
          target="_blank"
          rel="noopener"
          >{{ source.name }} ↗</a
        >
      </p>
    </div>
  </details>
</template>
