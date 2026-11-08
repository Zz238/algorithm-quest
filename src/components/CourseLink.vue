<script setup>
defineProps({ to: { type: String, required: true } });
const emit = defineEmits(['navigate']);
function follow(event, to) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.defaultPrevented
  )
    return;
  event.preventDefault();
  emit('navigate', to);
}
</script>
<template>
  <a class="course-link" :href="'#' + to" @click="follow($event, to)"><slot /></a>
</template>
