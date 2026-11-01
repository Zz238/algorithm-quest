<script setup>
import {computed,ref,watch} from 'vue';
import {accountProfile} from '../account-profile.js';
const props=defineProps({user:Object});
const profile=computed(()=>accountProfile(props.user)),failed=ref(false);
watch(()=>profile.value.avatarUrl,()=>{failed.value=false;});
</script>
<template>
  <span class="profile-avatar" aria-hidden="true">
    <img v-if="profile.avatarUrl&&!failed" :src="profile.avatarUrl" alt="" referrerpolicy="no-referrer" decoding="async" @error="failed=true"/>
    <span v-else>{{user?profile.initial:'▦'}}</span>
  </span>
</template>
