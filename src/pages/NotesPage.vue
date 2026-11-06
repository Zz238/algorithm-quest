<script setup>
import NotesLibrary from '../components/NotesLibrary.vue';
defineProps({ notes: Object, saveStatus: String, disabled: Boolean });
const emit = defineEmits(['navigate', 'remove']);
</script>
<template>
  <main class="record-page">
    <button class="text-button" @click="emit('navigate', '/progress')">← 回到学习记录</button>
    <h1>私人学习笔记</h1>
    <NotesLibrary
      :notes="notes"
      :save-status="saveStatus"
      :disabled="disabled"
      @navigate="emit('navigate', $event)"
      @remove="emit('remove', $event)"
    />
  </main>
</template>
