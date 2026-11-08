<script setup>
import { ref, onUnmounted } from 'vue';
import UiIcon from './UiIcon.vue';
const props = defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'secondary' },
  icon: String,
  trailingIcon: String,
  disabled: Boolean,
  loading: Boolean,
});
const emit = defineEmits(['click']);
const pulse = ref(null);
let timer,
  sequence = 0;
function activate(event) {
  if (props.disabled || props.loading) return;
  const rect = event.currentTarget.getBoundingClientRect();
  pulse.value = {
    id: ++sequence,
    x: event.detail ? event.clientX - rect.left : rect.width / 2,
    y: event.detail ? event.clientY - rect.top : rect.height / 2,
    size: Math.max(rect.width, rect.height) * 2,
  };
  clearTimeout(timer);
  timer = setTimeout(() => {
    pulse.value = null;
  }, 480);
  emit('click', event);
}
onUnmounted(() => clearTimeout(timer));
</script>
<template>
  <button
    :type="type"
    class="ui-button"
    :class="['ui-button--' + variant, { primary: variant === 'primary' }]"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    @click="activate"
  >
    <span class="ui-button-ink" aria-hidden="true"
      ><span
        v-if="pulse"
        :key="pulse.id"
        class="ui-ripple"
        :style="{
          left: pulse.x + 'px',
          top: pulse.y + 'px',
          width: pulse.size + 'px',
          height: pulse.size + 'px',
        }"
      ></span
    ></span>
    <UiIcon v-if="icon || loading" :name="loading ? 'loader' : icon" :class="{ 'ui-spin': loading }" />
    <span class="ui-button-label"><slot /></span>
    <UiIcon v-if="trailingIcon" :name="trailingIcon" class="ui-button-arrow" />
  </button>
</template>
