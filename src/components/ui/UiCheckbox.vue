<script setup>
import { useId, useAttrs } from 'vue';
defineOptions({ inheritAttrs: false });
defineProps({ modelValue: Boolean, disabled: Boolean });
const emit = defineEmits(['update:modelValue']);
const id = useId();
const attrs = useAttrs();
const inputAttrs = () =>
  Object.fromEntries(Object.entries(attrs).filter(([key]) => !['class', 'style'].includes(key)));
</script>
<template>
  <label
    class="ui-checkbox"
    :for="id"
    :class="[$attrs.class, { 'is-disabled': disabled }]"
    :style="$attrs.style"
  >
    <span class="ui-checkbox-control"
      ><input
        v-bind="inputAttrs()"
        :id="id"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        @change="emit('update:modelValue', $event.target.checked)" /><svg
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="m4 10 4 4 8-9" /></svg
    ></span>
    <span class="ui-checkbox-label"><slot /></span>
  </label>
</template>
