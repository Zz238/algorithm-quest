<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue';
import UiIcon from './ui/UiIcon.vue';
import CourseLink from './CourseLink.vue';
const props = defineProps({
  open: Boolean,
  chapters: { type: Array, required: true },
  chapterId: Number,
  progress: Object,
});
const emit = defineEmits(['update:open', 'navigate']);
const trigger = ref(null),
  panel = ref(null),
  closeButton = ref(null);

let previousOverflow,
  locked = false;
function setOpen(value) {
  emit('update:open', value);
}
function restoreScroll() {
  if (locked) {
    document.body.style.overflow = previousOverflow;
    locked = false;
  }
}
watch(
  () => props.open,
  async (open) => {
    if (open) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      locked = true;
    } else restoreScroll();
    await nextTick();
    if (open) closeButton.value?.focus();
    else trigger.value?.focus({ preventScroll: true });
  },
);
function keydown(event) {
  if (!props.open) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    setOpen(false);
    return;
  }
  if (event.key !== 'Tab') return;
  const controls = Array.from(
    panel.value?.querySelectorAll('button:not(:disabled),a[href],[tabindex="0"]') || [],
  );
  const first = controls[0],
    last = controls.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
}
onUnmounted(restoreScroll);
</script>
<template>
  <div class="chapter-drawer" :data-open="open" @keydown="keydown">
    <button
      ref="trigger"
      class="chapter-trigger"
      :aria-label="open ? '收起章节导航' : '跳转到其他章节'"
      :aria-expanded="open"
      aria-controls="chapter-panel"
      @click="setOpen(!open)"
    >
      <UiIcon :name="open ? 'close' : 'menu'" :size="21" /><span>{{ open ? '收起' : '章节' }}</span>
    </button>
    <Transition name="chapter-backdrop"
      ><div v-if="open" class="chapter-backdrop" aria-hidden="true" @click="setOpen(false)"></div
    ></Transition>
    <Transition name="chapter-panel">
      <aside
        v-show="open"
        ref="panel"
        class="chapter-panel"
        id="chapter-panel"
        role="dialog"
        aria-modal="true"
        :aria-hidden="!open"
        :inert="!open"
        aria-labelledby="chapter-panel-title"
        tabindex="-1"
      >
        <div class="chapter-panel-heading">
          <div>
            <span class="eyebrow">课程目录</span>
            <h2 id="chapter-panel-title">跳转到其他章节</h2>
          </div>
          <button
            ref="closeButton"
            class="chapter-close"
            aria-label="关闭章节导航"
            @click="setOpen(false)"
          >
            <UiIcon name="close" :size="20" />
          </button>
        </div>
        <ol class="chapter-panel-list">
          <li v-for="chapter in chapters" :key="chapter.id">
            <CourseLink
              :to="`/learn/${chapter.id}/0`"
              :aria-current="chapter.id === chapterId ? 'page' : undefined"
              @navigate="
                setOpen(false);
                emit('navigate', $event);
              "
              ><span class="chapter-menu-number">{{ String(chapter.id).padStart(2, '0') }}</span
              ><span
                ><strong>{{ chapter.title }}</strong
                ><small
                  >已读 {{ chapter.lessons.filter((l) => progress.lessons.includes(l.id)).length }} /
                  {{ chapter.lessons.length }} 小节</small
                ></span
              ><span v-if="chapter.id === chapterId" class="current-chapter">当前</span></CourseLink
            >
          </li>
        </ol>
        <p class="chapter-panel-help">选择章节进入第一节。按 Esc 或点击外侧空白处关闭。</p>
      </aside>
    </Transition>
  </div>
</template>
