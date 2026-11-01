<script setup>
import {computed} from 'vue';
import {accountProfile} from '../account-profile.js';
import UserAvatar from './UserAvatar.vue';
import GitHubIcon from './GitHubIcon.vue';
const props=defineProps({user:Object,view:String,chapterId:{type:Number,default:1}});
const emit=defineEmits(['navigate']);
const profile=computed(()=>accountProfile(props.user));
</script>
<template>
  <header class="header">
    <button class="brand" @click="emit('navigate','/')"><span class="pixel-icon" aria-hidden="true"></span>算法之旅<small>ALGO QUEST</small></button>
    <nav aria-label="主导航">
      <button :class="{active:view==='home'}" @click="emit('navigate','/')">世界地图</button>
      <button :class="{active:view==='boss'}" @click="emit('navigate','/boss/'+chapterId)">章末闯关</button>
      <button :class="{active:view==='glossary'}" @click="emit('navigate','/glossary')">生词本</button>
      <button :class="{active:view==='progress'}" @click="emit('navigate','/progress')">角色记录</button>
    </nav>
    <div class="header-actions">
      <a class="github-link" href="https://github.com/Zz238/algorithm-quest" target="_blank" rel="noopener noreferrer" aria-label="向我们提建议" aria-describedby="github-suggestion-tip" title="向我们提建议"><GitHubIcon/><span class="github-tooltip" id="github-suggestion-tip" role="tooltip">向我们提建议</span></a>
      <button v-if="user" class="account-trigger" :aria-current="['account','login'].includes(view)?'page':undefined" :aria-label="profile.name+'，打开账号与云存档'" :title="profile.name+' · 账号与云存档'" @click="emit('navigate','/account')"><UserAvatar :user="user"/><span class="account-name">{{profile.name}}</span></button>
      <button v-else class="login-trigger" @click="emit('navigate','/login')">登录</button>
    </div>
  </header>
</template>
