<script setup>
import { ref, useId } from 'vue';
const props = defineProps({ title: String, confirmLabel: { type: String, default: '确认删除' } });
const emit = defineEmits(['confirm']);
const dialog = ref(null),
  heading = useId();
function open() {
  if (!dialog.value.open) dialog.value.showModal();
}
function close() {
  dialog.value?.close();
}
function confirm() {
  close();
  emit('confirm');
}
defineExpose({ open, close });
</script>
<template>
  <dialog ref="dialog" class="confirm-action" :aria-labelledby="heading" @click.self="close">
    <div class="confirm-action-body">
      <h2 :id="heading">{{ props.title }}</h2>
      <slot />
      <div class="study-actions">
        <button type="button" autofocus @click="close">取消</button>
        <button type="button" class="danger-action" @click="confirm">{{ props.confirmLabel }}</button>
      </div>
    </div>
  </dialog>
</template>
