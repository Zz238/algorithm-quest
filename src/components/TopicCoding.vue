<script setup>
import { CODING_BY_ID } from '../data/coding-catalog.js';
import JavaCodingTask from './JavaCodingTask.vue';
defineProps({ taskId: String, owner: String, disabled: Boolean });
</script>
<template>
  <JavaCodingTask
    :key="taskId + ':' + owner"
    :task="CODING_BY_ID[taskId]"
    :owner="owner"
    :disabled="disabled"
  />
</template>
