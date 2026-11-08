<script setup>
import { computed } from 'vue';
import { MorphIcon } from 'morphicons/vue';
import { UI_ICONS } from '../../ui-icons.js';
const props = defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: 18 },
});
const path = computed(() => UI_ICONS[props.name] || UI_ICONS.info);
</script>
<template>
  <MorphIcon
    class="ui-icon"
    :data-icon="name"
    :icon="path"
    :size="size"
    :stroke-width="1.8"
    spring="smooth"
    reduced-motion="user"
  />
</template>
