<script setup>
import { computed, useId } from 'vue';
import { edgeGeometry, pictureFor, pictureTextSize } from '../trace-picture.js';
const props = defineProps({ frame: { type: Object, required: true }, mode: String });
const marker = useId() + '-arrow';
const picture = computed(() => pictureFor(props.frame, props.mode));
const lines = computed(() =>
  picture.value.edges.map((edge) => ({ ...edge, ...edgeGeometry(edge, picture.value.cells) })),
);
</script>

<template>
  <svg
    class="trace-picture"
    :class="'picture-' + (frame.kind || mode || 'state')"
    :width="picture.width"
    :height="picture.height"
    :viewBox="'0 0 ' + picture.width + ' ' + picture.height"
    role="img"
    :aria-label="picture.description"
  >
    <defs>
      <marker
        :id="marker"
        markerWidth="7"
        markerHeight="7"
        refX="7"
        refY="3.5"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <path d="M0 0 7 3.5 0 7z" class="picture-arrow" />
      </marker>
    </defs>
    <g v-for="(line, i) in lines" :key="'edge-' + i" :class="'picture-edge ' + line.tone">
      <line
        :x1="line.x1"
        :y1="line.y1"
        :x2="line.x2"
        :y2="line.y2"
        :marker-end="line.arrow ? 'url(#' + marker + ')' : undefined"
      />
      <text v-if="line.label" :x="line.labelX" :y="line.labelY">{{ line.label }}</text>
    </g>
    <g
      v-for="(cell, i) in picture.cells"
      :key="i"
      class="picture-cell"
      :class="[
        cell.kind,
        {
          active: cell.active,
          outside: cell.outside,
          'group-left': cell.group === 0,
          'group-right': cell.group === 1,
        },
      ]"
    >
      <rect
        :x="cell.x - cell.width / 2"
        :y="cell.y - cell.height / 2"
        :width="cell.width"
        :height="cell.height"
        rx="6"
      />
      <text
        class="picture-value"
        :x="cell.x"
        :y="cell.y + 1"
        :font-size="pictureTextSize(cell.value, cell.width)"
      >
        {{ cell.value }}
      </text>
      <text
        v-if="cell.label"
        class="picture-label"
        :x="cell.x"
        :y="cell.y + cell.height / 2 + 15"
        :font-size="pictureTextSize(cell.label, cell.width + 5, 14)"
      >
        {{ cell.label }}
      </text>
      <text
        v-if="cell.side"
        class="picture-label"
        :x="cell.x + cell.width / 2 + 21"
        :y="cell.y + 4"
        font-size="14"
      >
        {{ cell.side }}
      </text>
    </g>
  </svg>
</template>
