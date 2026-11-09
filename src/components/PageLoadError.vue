<template>
  <main class="study-page">
    <h1>这一页暂时没有加载完成</h1>
    <p>可能是网络中断，或网站更新后旧资源已经过期。你的本机草稿仍会保留。</p>
    <button @click="reload">重新加载当前页</button>
  </main>
</template>
<script setup>
function reload() {
  window.location.reload();
}
</script>
