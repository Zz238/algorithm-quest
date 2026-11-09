<script setup>
import {computed,ref,onUnmounted} from 'vue';
import {TRAFFIC_CHOICE_KEY,TRAFFIC_VISITOR_KEY,trafficAllowed} from '../analytics.js';
import {TRAFFIC_ENABLED} from '../config/cloud.js';
const emit=defineEmits(['change']);
const version=ref(0),message=ref('');
let storage;try{storage=window.localStorage;}catch{storage={getItem:()=> 'off',setItem:()=>{throw Error('unavailable');},removeItem:()=>{}};}
const browserPreference=navigator.globalPrivacyControl===true||navigator.doNotTrack==='1';
const enabled=computed(()=>{version.value;return trafficAllowed(storage,navigator);});
function refreshChoice(event){if(event.key===TRAFFIC_CHOICE_KEY)version.value++;}
window.addEventListener('storage',refreshChoice);onUnmounted(()=>window.removeEventListener('storage',refreshChoice));
function toggle(){
  try{storage.setItem(TRAFFIC_CHOICE_KEY,enabled.value?'off':'on');storage.removeItem(TRAFFIC_VISITOR_KEY);version.value++;message.value=enabled.value?'已开启本浏览器的客流统计。':'已停止本浏览器后续的客流统计。';emit('change',enabled.value);}catch{message.value='浏览器不允许保存此设置，当前不会发送客流统计。';}
}
</script>
<template>
<main class="privacy-page record-page">
  <span class="eyebrow">隐私与数据</span><h1>隐私说明</h1><p class="page-lead">客流统计仅用于了解网站的访问人数、常读章节和访问来源，帮助维护课程。</p>
  <p v-if="!TRAFFIC_ENABLED" class="privacy-deployment-status" role="status">客流统计暂未启用，云端配置完成后才会开始记录。下方说明为启用后的采集规则；你的浏览器统计偏好现在就可以设置。</p>
  <section><h2>客流统计记录什么？</h2><p>记录访问时间、正在浏览的页面或课程小节、网络出口 IP 地址，以及浏览器允许提供的来源网站域名。来源只保留域名，不保留链接中的搜索词、参数或片段。IP 由 Supabase 服务端读取，不调用第三方 IP 查询服务。</p><p>为估算每日访问人数，浏览器会在本地保存一个随机编号，每天按北京时间更换。服务端只保留按天处理的摘要，不把它关联到 GitHub 账号、学习进度或笔记，也不使用浏览器指纹。</p></section>
  <section><h2>只用作统计网站客流量</h2><p>这些数据仅用于本站客流统计，不用于广告投放、个人画像或出售。统计不会读取你填写的答案、私人笔记、评论正文、GitHub 账号资料或密码。</p><p>每日人数是同一浏览器当天去重后的估算值，不等于实际自然人数；不同设备、清理本地数据、拦截统计请求等都会影响结果。IP 可能是共享网络、代理或 VPN 的出口，不能据此确认个人身份。</p></section>
  <section><h2>保存多久，谁能查看？</h2><p>统计数据通过 HTTPS 保存至本网站使用的 Supabase 项目。包含完整 IP 的访问明细保留 30 天；不含完整 IP 的每日人数、页面和章节汇总保留 365 天，到期自动清理。</p><p>统计后台只监听管理员电脑的本机地址，且必须用指定管理员的 GitHub 账号登录才能读取数据。公开网站不提供访问明细或后台入口。</p></section>
  <section class="privacy-choice"><h2>你可以停止本浏览器的统计</h2><p>当前状态：<strong>{{enabled?'允许客流统计':'不发送客流统计'}}</strong>。停止统计不影响阅读、练习、登录和云存档，也不会删除已经生成的历史汇总。</p><p v-if="browserPreference">检测到浏览器的“不跟踪”或全局隐私控制信号，本站会遵循该设置。</p><button v-else @click="toggle">{{enabled?'停止本浏览器的客流统计':'允许本浏览器的客流统计'}}</button><p role="status" class="micro">{{message}}</p></section>
  <section><h2>学习记录与公开笔记</h2><p>游客的进度和私人学习笔记保存在当前浏览器；GitHub 登录后，可按你的选择同步到账号。课程讨论区发送的笔记对所有读者可见，并显示 GitHub 用户名；自己的公开笔记可以撤回。这些功能的数据与客流统计分开保存。</p><p>有关数据的疑问，可通过网站右上角的 GitHub 链接联系仓库维护者。请勿在公开 Issue 中提交密码、完整 IP 等私人信息。</p></section>
  <section><h2>在线 Java 与职业实践</h2><p>点击运行后，浏览器从 CheerpJ 官方 CDN 加载 Java 运行资源。Java 源代码在本浏览器的隔离线程中编译和执行，不发送到远程判题服务器。运行资源的下载会向该 CDN 提供正常网络连接所需的信息，例如网络出口 IP。</p><p>代码、示例改写、Notebook实践说明和职业阶段工作单草稿保存在当前浏览器并按账号隔离。编程任务的测试通过情况、提示使用分类、复习日期、职业方向和阶段自评随既有 Supabase 账号存档同步；不会加入客流统计。浏览器判题用于学习自测，不是防作弊考试。</p></section>
  <p class="micro">更新日期：2026 年 11 月 8 日 · 统计日期按北京时间（UTC+8）计算。</p>
</main>
</template>
