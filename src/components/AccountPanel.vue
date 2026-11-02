<script setup>
import {computed} from 'vue';
import {accountProfile} from '../account-profile.js';
import {localDateKey} from '../logic.js';
import UserAvatar from './UserAvatar.vue';
import GitHubIcon from './GitHubIcon.vue';
import ReadingActivity from './ReadingActivity.vue';
const props=defineProps({cloud:Object,progress:Object,today:{type:String,default:()=>localDateKey()}});const emit=defineEmits(['continue']);
const state=computed(()=>props.cloud.state),user=computed(()=>state.value.user),name=computed(()=>accountProfile(user.value).name);
const status=computed(()=>({guest:'游客存档 · 保存在本机',pending:'有修改等待同步',syncing:'正在同步云端存档',synced:'已同步到云端',offline:'离线 · 已保存到本机',error:'未同步 · 本机记录已保留'}[state.value.syncStatus]));
const lastSaved=computed(()=>state.value.lastSyncedAt?new Intl.DateTimeFormat('zh-CN',{dateStyle:'medium',timeStyle:'short'}).format(new Date(state.value.lastSyncedAt)):null);
const busy=computed(()=>state.value.initializing||state.value.loggingIn||state.value.syncStatus==='syncing');
</script>
<template>
<section class="account-page">
  <div class="account-heading"><span class="eyebrow">个人账号</span><h1>{{user?'账号与云存档':'登录'}}</h1><p class="account-lead">{{user?'阅读、练习、笔记、收藏和打卡，都会随当前账号保存。':'目前支持 GitHub 登录。游客也可以继续学习，登录后可选择合并本机进度。'}}</p></div>
  <section class="account-card" aria-labelledby="identity-title">
    <div class="account-identity"><UserAvatar class="account-avatar" :user="user"/><div><h2 id="identity-title">{{user?name:'使用 GitHub 登录'}}</h2><p>{{user?'已使用 GitHub 登录，当前显示此账号的学习记录。':'当前记录保存在这个浏览器，登录不会自动覆盖它。'}}</p></div></div>
    <p class="cloud-status" role="status" :data-status="state.syncStatus">{{state.initializing?'正在检查登录状态…':status}}<span v-if="lastSaved"> · {{lastSaved}}</span></p>
    <p v-if="state.error" class="account-error" role="alert">{{state.error}}</p>
    <div v-if="!user" class="account-actions"><button class="primary github-login" @click="cloud.signIn" :disabled="busy||state.providerLoading||!state.providerEnabled"><GitHubIcon/>{{state.loggingIn?'正在前往 GitHub…':state.providerLoading?'正在连接登录服务…':'使用 GitHub 登录'}}</button><button @click="emit('continue')">继续游客学习 →</button></div>
    <div v-else class="account-actions"><button class="primary" @click="cloud.sync" :disabled="busy">{{state.syncStatus==='syncing'?'正在同步…':'立即同步'}}</button><button @click="cloud.signOut" :disabled="busy">退出当前账号</button></div>
    <div v-if="!user&&!state.providerLoading&&!state.providerEnabled" class="login-setup"><p>GitHub 登录暂未启用。你可以继续学习，本机进度会保留，启用后再合并到账号。</p><button @click="cloud.checkProvider" :disabled="state.providerLoading">重新检查登录服务</button></div>
    <p class="micro" v-if="!user">登录将在 GitHub 授权页面完成。本站不需要你的 GitHub 密码，也不申请代码仓库权限。</p>
  </section>
  <section v-if="user&&state.mergePrompt" class="guest-merge" aria-labelledby="guest-title"><span class="eyebrow">本机存档</span><h2 id="guest-title">发现这台设备上的游客存档</h2><p>已读 {{state.guestSummary.lessons}} 节、练习通过 {{state.guestSummary.mastery}} 节、打卡 {{state.guestSummary.checkins}} 天、{{state.guestSummary.notes}} 篇笔记。</p><p>选择合并后，完成记录会去重加入此账号；同一小节已有账号笔记时保留账号里的内容。游客原存档仍然保留。</p><div class="account-actions"><button class="primary" @click="cloud.mergeGuest" :disabled="busy">合并到当前账号</button><button @click="cloud.skipGuest" :disabled="busy">本次不合并</button></div></section>
  <div class="account-summary"><article><strong>{{progress.lessons.length}}</strong><span>已读小节</span></article><article><strong>{{progress.mastery.length}}</strong><span>练习通过</span></article><article><strong>{{progress.checkins.length}}</strong><span>打卡天数</span></article></div>
  <ReadingActivity :progress="progress" :user="user" :today="today" @continue="emit('continue')"/>
  <section class="account-help"><h2>存档会怎样保存？</h2><ul><li>登录后会先加载这个账号的存档，之后在学习和编辑时自动保存。</li><li>暂时断网时，修改先留在本机；恢复联网或回到网页时会继续同步。</li><li>换设备后登录同一账号即可继续；切换到其他账号，会显示该账号独立的进度。</li><li>多设备编辑同一笔记时，按记录的修改时间合并。学习记录里的 JSON 导出仍可作为额外备份。</li><li>退出账号会回到游客存档；未同步的账号修改留在此设备，重新登录同一账号后继续同步。</li></ul><details v-if="user&&state.guestSummary"><summary>重新合并这台设备的游客记录</summary><p>确认这些记录属于你，再加入当前账号。</p><button @click="cloud.mergeGuest" :disabled="busy">合并游客存档</button></details></section>
</section>
</template>
