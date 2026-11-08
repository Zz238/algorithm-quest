<script setup>
import { computed } from 'vue';
import { accountProfile } from '../account-profile.js';
import UserAvatar from './UserAvatar.vue';
import GitHubIcon from './GitHubIcon.vue';
import CourseLink from './CourseLink.vue';
const props = defineProps({ user: Object, view: String });
const emit = defineEmits(['navigate']);
const profile = computed(() => accountProfile(props.user));
</script>
<template>
  <header class="header">
    <CourseLink
      class="brand"
      to="/"
      aria-label="算法之旅，回到课程目录"
      @navigate="emit('navigate', $event)"
    >
      <svg class="brand-symbol" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect width="32" height="32" rx="6" fill="currentColor" />
        <path
          d="m13 10-6 6 6 6m6-12 6 6-6 6"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        /></svg
      ><span>算法之旅<small>ALGO QUEST</small></span>
    </CourseLink>
    <nav aria-label="主导航">
      <CourseLink
        :class="{ active: ['home', 'learn', 'boss', 'java'].includes(view) }"
        :aria-current="['home', 'learn', 'boss', 'java'].includes(view) ? 'page' : undefined"
        :to="'/'"
        @navigate="emit('navigate', $event)"
      >
        课程目录
      </CourseLink>
      <CourseLink
        :class="{ active: view === 'search' }"
        :aria-current="view === 'search' ? 'page' : undefined"
        :to="'/search'"
        @navigate="emit('navigate', $event)"
      >
        搜索
      </CourseLink>
      <CourseLink
        :class="{ active: view === 'glossary' }"
        :aria-current="view === 'glossary' ? 'page' : undefined"
        :to="'/glossary'"
        @navigate="emit('navigate', $event)"
      >
        术语手册
      </CourseLink>
      <CourseLink
        :class="{ active: ['progress', 'review', 'trial', 'notes'].includes(view) }"
        :aria-current="['progress', 'review', 'trial', 'notes'].includes(view) ? 'page' : undefined"
        :to="'/progress'"
        @navigate="emit('navigate', $event)"
      >
        学习记录
      </CourseLink>
    </nav>
    <div class="header-actions">
      <a
        class="github-link"
        href="https://github.com/Zz238/algorithm-quest"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="向我们提建议"
        aria-describedby="github-suggestion-tip"
        title="向我们提建议"
        ><GitHubIcon /><span class="github-tooltip" id="github-suggestion-tip" role="tooltip"
          >向我们提建议</span
        ></a
      >
      <button
        v-if="user"
        class="account-trigger"
        :aria-current="['account', 'login'].includes(view) ? 'page' : undefined"
        :aria-label="profile.name + '，打开账号与云存档'"
        :title="profile.name + ' · 账号与云存档'"
        @click="emit('navigate', '/account')"
      >
        <UserAvatar :user="user" /><span class="account-name">{{ profile.name }}</span>
      </button>
      <button
        v-else
        class="login-trigger"
        :aria-current="view === 'login' ? 'page' : undefined"
        @click="emit('navigate', '/login')"
      >
        登录
      </button>
    </div>
  </header>
</template>
