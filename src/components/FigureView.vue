<script setup>
import { ref, useId } from 'vue';
import TracePicture from './TracePicture.vue';
import UiButton from './ui/UiButton.vue';
defineProps({ frame: Object, mode: String, title: String });
const dialog = ref(null),
  shown = ref(false),
  scale = ref(1),
  heading = useId();
function open() {
  shown.value = true;
  scale.value = 1.5;
  dialog.value.showModal();
}
function close() {
  dialog.value.close();
}
</script>
<template>
  <div class="figure-graphic"><TracePicture :frame="frame" :mode="mode" /></div>
  <div class="figure-legend">
    <span>蓝色框：当前关注</span><span v-if="frame.detached">虚线框：尚未接入的新节点</span
    ><span v-else-if="frame.outside">虚线框：不可访问的位置</span
    ><span v-if="['tree', 'graph', 'linked'].includes(frame.kind) || mode === 'reference'"
      >连线表示关系，箭头表示方向</span
    >
  </div>
  <UiButton
    class="figure-zoom"
    variant="ghost"
    icon="expand"
    :aria-label="'放大图解：' + title"
    @click="open"
    >放大查看</UiButton
  >
  <dialog
    ref="dialog"
    class="figure-dialog"
    :aria-labelledby="heading"
    @close="shown = false"
    @click.self="close"
  >
    <header>
      <h2 :id="heading">{{ title }}</h2>
      <UiButton icon="close" autofocus @click="close">关闭图解</UiButton>
    </header>
    <div class="study-actions">
      <label
        >图解大小
        <select v-model.number="scale">
          <option :value="1">100%</option>
          <option :value="1.5">150%</option>
          <option :value="2">200%</option>
        </select></label
      ><span>可左右滑动，按 Esc 关闭</span>
    </div>
    <div class="figure-dialog-scroll">
      <div :style="{ zoom: scale }"><TracePicture v-if="shown" :frame="frame" :mode="mode" /></div>
    </div>
    <p>{{ frame.why }}</p>
  </dialog>
</template>
