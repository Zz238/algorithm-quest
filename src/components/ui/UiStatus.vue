<script setup>
import UiIcon from './UiIcon.vue';
defineProps({ loading: Boolean, kind: { type: String, default: 'saved' } });
</script>
<template>
  <span class="ui-status" :data-kind="kind"
    ><UiIcon
      :name="loading ? 'loader' : kind === 'saved' ? 'check' : 'info'"
      :size="15"
      :class="{ 'ui-spin': loading }" /><span><slot /></span
  ></span>
</template>
