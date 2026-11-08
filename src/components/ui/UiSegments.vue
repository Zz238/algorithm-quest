<script setup>
import { computed, ref } from 'vue';
const props = defineProps({
  modelValue: [String, Boolean, Number],
  options: { type: Array, required: true },
  label: { type: String, required: true },
  disabled: Boolean,
});
const emit = defineEmits(['update:modelValue']);
const root = ref(null);
const selected = computed(() =>
  Math.max(
    0,
    props.options.findIndex((o) => o.value === props.modelValue),
  ),
);
function choose(index) {
  if (!props.disabled && !props.options[index].disabled)
    emit('update:modelValue', props.options[index].value);
}
function keydown(event, index) {
  if (props.disabled) return;
  const direction = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
  if (!direction && !['Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const count = props.options.length;
  let next =
    event.key === 'Home' ? 0 : event.key === 'End' ? count - 1 : (index + direction + count) % count;
  for (let i = 0; i < count; i++) {
    if (!props.options[next].disabled) {
      choose(next);
      root.value?.querySelectorAll('button')[next]?.focus();
      return;
    }
    next = (next + (direction || 1) + count) % count;
  }
}
</script>
<template>
  <div
    ref="root"
    class="ui-segments"
    role="group"
    :aria-label="label"
    :style="{ '--segment-count': options.length, '--segment-index': selected }"
  >
    <span class="ui-segment-thumb" aria-hidden="true"></span>
    <button
      v-for="(option, i) in options"
      :key="String(option.value)"
      type="button"
      :aria-pressed="modelValue === option.value"
      :disabled="disabled || option.disabled"
      @click="choose(i)"
      @keydown="keydown($event, i)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
