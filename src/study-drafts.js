import {reactive,watch} from 'vue';

const memory=new Map();
const prefix='algo-quest-study-draft-v1:';
export const draftKey=(owner,topic,kind)=>prefix+JSON.stringify([owner||'guest',topic,kind]);
export function readDraft(key,storage){
 try{
  const raw=storage?.getItem(key)||memory.get(key);
  return raw&&raw.length<=24000?JSON.parse(raw):null;
 }catch{return null;}
}
export function writeDraft(key,value,storage){
 try{
  const raw=JSON.stringify(value);
  if(raw.length>24000)return false;
  memory.set(key,raw);
  storage?.setItem(key,raw);
  return true;
 }catch{return false;}
}
export function browserStorage(){try{return window.localStorage;}catch{return null;}}
// Callers remount by topic and owner. The captured key cannot change during an account switch.
export function useStudyDraft(owner,topic,kind,restore){
 const key=draftKey(owner,topic,kind),storage=browserStorage();
 const state=reactive(restore(readDraft(key,storage)));
 watch(state,()=>writeDraft(key,state,storage),{deep:true,flush:'sync'});
 return state;
}
