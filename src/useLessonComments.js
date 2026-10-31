import {ref,computed,watch,onMounted,onUnmounted} from 'vue';
import {createCommentsService} from './comments-service.js';
import {COMMENT_PAGE_SIZE,commentError,validateComment} from './comments.js';
export function useLessonComments(lesson,user,service=createCommentsService()){
 const draft=ref(''),items=ref([]),total=ref(0),order=ref('newest'),page=ref(0),loading=ref(false),sending=ref(false),loadError=ref(''),sendError=ref(''),status=ref(''),withdrawing=ref(null);
 let epoch=0,request=0,disposed=false,stopSubscription,poll,refreshTimer,attempt=null;
 const owner=()=>user.value?.id||'guest';
 const draftKey=()=> 'algo-quest-comment-draft-v1:'+owner()+':'+lesson.value;
 const canSend=computed(()=>!!user.value&&service.available&&!sending.value&&!validateComment(draft.value));
 const pageCount=computed(()=>Math.max(1,Math.ceil(total.value/COMMENT_PAGE_SIZE)));
 function saveDraft(){try{if(user.value)sessionStorage.setItem(draftKey(),draft.value);}catch{}}
 watch(draft,saveDraft,{flush:'sync'});
 function restoreDraft(){try{draft.value=user.value?(sessionStorage.getItem(draftKey())||''):'';}catch{draft.value='';}}
 async function refresh(){
  if(disposed||!service.available)return;
  const generation=epoch,serial=++request;loading.value=true;loadError.value='';
  try{
   const result=await service.list(lesson.value,order.value,page.value*COMMENT_PAGE_SIZE);
   if(disposed||generation!==epoch||serial!==request)return;
   total.value=Number(result.total)||0;
   if(page.value>=pageCount.value){page.value=pageCount.value-1;return;}
   items.value=result.items||[];
  }catch{if(generation===epoch&&serial===request)loadError.value='评论暂时没有加载成功，可以点击重试。';}
  finally{if(generation===epoch&&serial===request)loading.value=false;}
 }
 function changed(){clearTimeout(refreshTimer);refreshTimer=setTimeout(refresh,200);}
 async function send(){
  if(sending.value||disposed)return;
  sendError.value='';status.value='';
  if(!user.value){sendError.value='请先使用 GitHub 登录。';return;}
  const invalid=validateComment(draft.value);if(invalid){sendError.value=invalid;return;}
  if(!service.available){sendError.value='离线版可使用上方私人笔记，公开评论请到正式网站发送。';return;}
  const generation=epoch,raw=draft.value,body=raw.trim(),author=owner(),topic=lesson.value;
  if(!attempt||attempt.raw!==raw||attempt.author!==author||attempt.topic!==topic)attempt={id:crypto.randomUUID?.()||Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/,'$1-$2-$3-$4-$5'),raw,author,topic};
  const id=attempt.id;sending.value=true;
  try{
   const saved=await service.post(id,topic,body);
   if(disposed||generation!==epoch)return;
   if(draft.value===raw)draft.value='';
   attempt=null;order.value='newest';page.value=0;
   const existing=items.value.some(c=>c.id===saved.id);
   items.value=[saved,...items.value.filter(c=>c.id!==saved.id)].slice(0,COMMENT_PAGE_SIZE);if(!existing)total.value++;
   status.value='笔记已发送，已显示在最新评论中。';
   await refresh();
  }catch(error){if(generation===epoch)sendError.value=commentError(error);}
  finally{if(generation===epoch)sending.value=false;}
 }
 async function withdraw(item){
  if(withdrawing.value||!user.value||!item.is_mine||disposed)return;
  const generation=epoch;withdrawing.value=item.id;sendError.value='';
  try{await service.withdraw(item.id);if(disposed||generation!==epoch)return;items.value=items.value.filter(c=>c.id!==item.id);total.value=Math.max(0,total.value-1);status.value='你的笔记已撤回。';await refresh();}
  catch{if(generation===epoch)sendError.value='撤回没有完成，请稍后重试。';}
  finally{if(generation===epoch)withdrawing.value=null;}
 }
 function focus(){if(window.document.visibilityState==='visible')refresh();}
 watch([lesson,()=>user.value?.id],()=>{
  epoch++;request++;stopSubscription?.();clearTimeout(refreshTimer);attempt=null;items.value=[];total.value=0;page.value=0;sending.value=false;withdrawing.value=null;status.value='';sendError.value='';loadError.value='';loading.value=false;restoreDraft();
  if(!disposed){stopSubscription=service.subscribe(lesson.value,changed);refresh();}
 },{immediate:true});
 watch([order,page],refresh);
 onMounted(()=>{poll=setInterval(focus,20000);window.addEventListener('online',focus);window.addEventListener('focus',focus);window.document.addEventListener('visibilitychange',focus);});
 onUnmounted(()=>{disposed=true;epoch++;clearInterval(poll);clearTimeout(refreshTimer);stopSubscription?.();window.removeEventListener('online',focus);window.removeEventListener('focus',focus);window.document.removeEventListener('visibilitychange',focus);});
 return {draft,items,total,order,page,pageCount,loading,sending,loadError,sendError,status,withdrawing,canSend,refresh,send,withdraw,available:service.available};
}
