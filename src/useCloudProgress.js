import {ref,reactive,watch,onMounted,onUnmounted} from 'vue';
import {GUEST_KEY,GUEST_DOCUMENT_KEY,accountKey,emptyDocument,cleanDocument,readGuest,updateDocument,mergeDocuments,mergeGuestDocument,storageRead,hasProgress,fingerprint,stableStringify,synchronize} from './cloud-progress.js';
import {client,oauthRedirect,githubProviderEnabled,saveAdapter} from './supabase.js';

export function useCloudProgress(ids,services={client,oauthRedirect,githubProviderEnabled,saveAdapter}){
 const {client,oauthRedirect,githubProviderEnabled,saveAdapter}=services;
 let storage;const storageOK=ref(true);try{storage=window.localStorage;}catch{storageOK.value=false;}
 const deviceKey='algo-quest-device-v1';let device;try{device=storage?.getItem(deviceKey);}catch{storageOK.value=false;}
 if(!device){device=crypto.randomUUID?.()||Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('');try{storage?.setItem(deviceKey,device);}catch{storageOK.value=false;}}
 let document=readGuest(storage,ids,device),owner='guest',epoch=0,applying=false,disposed=false,timer,poll,stopAuth,activeRequest=null,again=false;
 const progress=reactive(structuredClone(document.progress));
 const state=reactive({user:null,initializing:true,loggingIn:false,providerLoading:true,providerEnabled:false,syncStatus:'guest',error:'',lastSyncedAt:null,mergePrompt:false,guestSummary:null,revision:null});
 const localKey=()=>owner==='guest'?GUEST_DOCUMENT_KEY:accountKey(owner);
 function persist(){try{storage?.setItem(localKey(),JSON.stringify(document));if(owner==='guest')storage?.setItem(GUEST_KEY,JSON.stringify(document.progress));}catch{storageOK.value=false;}}
 function apply(next){document=cleanDocument(next,ids);applying=true;Object.assign(progress,structuredClone(document.progress));applying=false;persist();}
 watch(progress,()=>{if(applying)return;document=updateDocument(document,progress,ids,device);persist();if(owner!=='guest'){state.syncStatus=navigator.onLine?'pending':'offline';schedule();}},{deep:true,flush:'sync'});
 function message(error){if(!navigator.onLine)return '当前离线，修改已保存在本机，联网后会继续同步。';if(['42P01','PGRST205'].includes(error?.code))return '云端存档服务尚未准备好，本机记录仍已保存。';if(error?.status===401||error?.code==='PGRST301')return '登录已过期，请重新登录；未同步的记录仍保留在本机。';return error?.message?.includes('其他设备')?error.message:'暂时没有同步成功，修改已保存在本机，可以稍后重试。';}
 function schedule(){clearTimeout(timer);timer=setTimeout(()=>sync(),900);}
 async function sync(){
  clearTimeout(timer);if(disposed||owner==='guest'||!client||state.initializing)return;
  if(activeRequest){again=true;return activeRequest;}
  if(!navigator.onLine){state.syncStatus='offline';return;}
  const generation=epoch,userId=owner;state.syncStatus='syncing';state.error='';
  const job=(async()=>{try{
   const result=await synchronize(saveAdapter(userId),{ids,getCurrent:()=>document,apply,isActive:()=>epoch===generation&&owner===userId});
   if(result.cancelled||epoch!==generation)return;
   state.lastSyncedAt=result.updatedAt||new Date().toISOString();state.revision=result.revision;state.syncStatus='synced';
  }catch(error){if(epoch===generation){state.error=message(error);state.syncStatus=navigator.onLine?'error':'offline';}}
  finally{if(activeRequest===job)activeRequest=null;if(epoch===generation&&again){again=false;schedule();}}})();
  activeRequest=job;return job;
 }
 function guestDetails(){const guest=readGuest(storage,ids,device).progress;state.guestSummary={lessons:guest.lessons.length,mastery:guest.mastery.length,bosses:guest.bosses.length,notes:Object.values(guest.notes).filter(Boolean).length,checkins:guest.checkins.length};return guest;}
 function decisionKey(){return 'algo-quest-guest-choice-v1:'+owner;}
 async function switchSession(session){
  if(disposed)return;
  const nextOwner=session?.user?.id||'guest';if(nextOwner===owner&&!state.initializing){state.user=session?.user||null;return;}
  persist();clearTimeout(timer);epoch++;activeRequest=null;again=false;owner=nextOwner;state.user=session?.user||null;state.error='';state.lastSyncedAt=null;state.revision=null;state.mergePrompt=false;
  let next;
  if(owner==='guest')next=readGuest(storage,ids,device);else{try{next=cleanDocument(storageRead(storage,accountKey(owner),null),ids);}catch{next=emptyDocument();}}
  apply(next);state.initializing=false;state.syncStatus=owner==='guest'?'guest':'pending';
  const guest=guestDetails();if(owner!=='guest'){
   const choice=storageRead(storage,decisionKey(),null);state.mergePrompt=hasProgress(guest)&&choice?.fingerprint!==fingerprint(guest);
   await sync();
  }
 }
 function rememberChoice(guest,action){try{storage?.setItem(decisionKey(),JSON.stringify({fingerprint:fingerprint(guest),action}));}catch{storageOK.value=false;}state.mergePrompt=false;}
 async function mergeGuest(){if(owner==='guest'||disposed)return;const generation=epoch;await sync();if(disposed||generation!==epoch||owner==='guest')return;if(state.syncStatus!=='synced'){state.error='合并前需要先加载账号的云端存档，请联网后重试。游客记录仍保留在本机。';return;}const guest=guestDetails();apply(mergeGuestDocument(document,guest,ids,device));rememberChoice(guest,'merged');state.syncStatus='pending';await sync();}
 function skipGuest(){rememberChoice(guestDetails(),'skipped');}
 async function checkProvider(){state.providerLoading=true;try{state.providerEnabled=await githubProviderEnabled();}catch{state.providerEnabled=false;}finally{state.providerLoading=false;}}
 async function signIn(){
  state.error='';state.loggingIn=true;
  try{await checkProvider();if(!state.providerEnabled)throw Error('GitHub 登录尚未启用，暂时可以继续游客学习。');persist();sessionStorage.setItem('algo-quest-return-route',location.hash||'#/account');
   const {data,error}=await client.auth.signInWithOAuth({provider:'github',options:{redirectTo:oauthRedirect(),scopes:'read:user user:email',skipBrowserRedirect:true}});
   if(error)throw error;window.location.assign(data.url);
  }catch(error){state.error=error.message||'没有完成登录，请稍后重试。';state.loggingIn=false;}
 }
 async function signOut(){
  if(owner==='guest'||disposed)return;const generation=epoch;persist();await sync();if(disposed||generation!==epoch)return;
  const {error}=await client.auth.signOut({scope:'local'});
  if(disposed||generation!==epoch)return;
  if(error){state.error='退出暂未完成，请稍后重试。';return;}
  await switchSession(null);
 }
 async function initialize(){
  if(!client){state.initializing=false;state.providerLoading=false;return;}
  const {data:listener}=client.auth.onAuthStateChange((_event,session)=>{setTimeout(()=>switchSession(session),0);});stopAuth=()=>listener.subscription.unsubscribe();
  const url=new URL(window.location.href),code=url.searchParams.get('code'),authError=url.searchParams.get('error_description')||url.searchParams.get('error');
  try{
   if(code){const flowId=url.searchParams.get('sb_flow_id');const {error}=await client.auth.exchangeCodeForSession(code,flowId?{flowId}:undefined);if(error)throw error;}
   else if(authError)throw Error('本次 GitHub 授权没有完成，可以重新登录。');
   const {data,error}=await client.auth.getSession();if(error)throw error;await switchSession(data.session);
  }catch(error){state.initializing=false;state.error='登录没有完成，请重新尝试。原有本机进度未被修改。';state.syncStatus=owner==='guest'?'guest':'error';}
  finally{
   if(code||authError){for(const key of ['code','sb_flow_id','error','error_description','error_code'])url.searchParams.delete(key);url.hash='/account';window.history.replaceState({},'',url.pathname+url.search+url.hash);window.dispatchEvent(new HashChangeEvent('hashchange'));sessionStorage.removeItem('algo-quest-return-route');}
   state.initializing=false;checkProvider();
  }
 }
 function focus(){if(owner!=='guest')sync();}
 function online(){if(owner!=='guest')sync();checkProvider();}
 function storageChanged(event){if(event.key!==localKey())return;try{const other=cleanDocument(JSON.parse(event.newValue),ids),merged=mergeDocuments(document,other,ids);if(stableStringify(merged)===stableStringify(document))return;apply(merged);if(owner!=='guest')schedule();}catch{}}
 function visibility(){if(documentVisibility())focus();}
 function documentVisibility(){return window.document.visibilityState==='visible';}
 onMounted(()=>{initialize();poll=setInterval(focus,30000);window.addEventListener('focus',focus);window.addEventListener('online',online);window.addEventListener('storage',storageChanged);window.document.addEventListener('visibilitychange',visibility);});
 onUnmounted(()=>{disposed=true;clearTimeout(timer);clearInterval(poll);stopAuth?.();epoch++;window.removeEventListener('focus',focus);window.removeEventListener('online',online);window.removeEventListener('storage',storageChanged);window.document.removeEventListener('visibilitychange',visibility);});
 return {progress,storageOK,cloud:{state,signIn,signOut,sync,mergeGuest,skipGuest,checkProvider}};
}
