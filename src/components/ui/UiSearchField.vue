<script setup>
import { ref, nextTick, useId, useAttrs } from 'vue';
import UiIcon from './UiIcon.vue';
defineOptions({ inheritAttrs: false });
defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, required: true },
  placeholder: String,
  id: String,
  hideLabel: Boolean,
});
const emit = defineEmits(['update:modelValue']);
const generatedId = useId(),
  input = ref(null);
const attrs = useAttrs();
const inputAttrs = () =>
  Object.fromEntries(Object.entries(attrs).filter(([key]) => !['class', 'style'].includes(key)));
async function clear() {
  emit('update:modelValue', '');
  await nextTick();
  input.value?.focus();
}
</script>
<template>
  <div class="ui-search-group" :class="$attrs.class" :style="$attrs.style">
    <label :for="id || generatedId" :class="{ 'sr-only': hideLabel }">{{ label }}</label>
    <div class="ui-search-field">
      <UiIcon name="search" :size="19" />
      <input
        v-bind="inputAttrs()"
        :id="id || generatedId"
        ref="input"
        type="search"
        :value="modelValue"
        :placeholder="placeholder"
        @input="emit('update:modelValue', $event.target.value)"
      />
      <button
        v-if="modelValue"
        type="button"
        class="ui-search-clear"
        :aria-label="'清空' + label"
        @click="clear"
      >
        <UiIcon name="close" :size="16" />
      </button>
    </div>
  </div>
</template>
