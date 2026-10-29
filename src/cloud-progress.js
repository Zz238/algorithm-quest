import {cleanProgress,freshProgress} from './logic.js';

export const GUEST_KEY='algo-quest-course-v1';
export const GUEST_DOCUMENT_KEY='algo-quest-guest-v2';
export const accountKey=id=>'algo-quest-account-v2:'+id;
const stampPattern=/^\d{16}:[a-zA-Z0-9-]{1,64}$/;
const zeroStamp='0000000000000000:legacy';
const clone=x=>JSON.parse(JSON.stringify(x));
const sortedUnion=(a=[],b=[])=>[...new Set([...a,...b])].sort((x,y)=>typeof x==='number'?x-y:String(x).localeCompare(String(y)));
export function stableStringify(value){if(Array.isArray(value))return '['+value.map(stableStringify).join(',')+']';if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stableStringify(value[k])).join(',')+'}';return JSON.stringify(value);}
export function emptyDocument(){return {schema:1,progress:freshProgress(),clocks:{notes:{},bookmarks:{}}};}
export function cleanDocument(value,ids){
 const doc=emptyDocument();
 if(!value||value.schema!==1)throw Error('不支持的云端存档格式。');
 doc.progress=cleanProgress(value.progress,ids);
 const known=new Set(ids);
 for(const type of ['notes','bookmarks'])for(const [id,stamp] of Object.entries(value.clocks?.[type]||{}))if(known.has(id)&&typeof stamp==='string'&&stampPattern.test(stamp))doc.clocks[type][id]=stamp;
 return doc;
}
function newestStamp(doc){return Math.max(0,...Object.values(doc.clocks.notes).concat(Object.values(doc.clocks.bookmarks)).map(s=>Number(s.slice(0,16))));}
function nextStamp(doc,device,now){return String(Math.max(Number(now)||0,newestStamp(doc)+1)).padStart(16,'0')+':'+device;}
export function updateDocument(document,progress,ids,device='device',now=Date.now()){
 const before=cleanDocument(document,ids),after=clone(before),next=cleanProgress(progress,ids);
 for(const id of ids){
  if((before.progress.notes[id]||'')!==(next.notes[id]||''))after.clocks.notes[id]=nextStamp(after,device,now);
  if(before.progress.bookmarks.includes(id)!==next.bookmarks.includes(id))after.clocks.bookmarks[id]=nextStamp(after,device,now);
 }
 after.progress=next;return after;
}
export function documentFromProgress(progress,ids,device='legacy',now=Date.now()){return updateDocument(emptyDocument(),progress,ids,device,now);}
export function mergeDocuments(left,right,ids){
 const a=cleanDocument(left,ids),b=cleanDocument(right,ids),out=emptyDocument();
 for(const field of ['lessons','mastery','bosses','checkins'])out.progress[field]=sortedUnion(a.progress[field],b.progress[field]);
 for(const id of sortedUnion(Object.keys(a.progress.bossTasks),Object.keys(b.progress.bossTasks))){const x=a.progress.bossTasks[id],y=b.progress.bossTasks[id];out.progress.bossTasks[id]=Number(id)===5&&(x===1051||y===1051)?1051:y??x;}
 for(const day of sortedUnion(Object.keys(a.progress.dailyRead),Object.keys(b.progress.dailyRead)))out.progress.dailyRead[day]=sortedUnion(a.progress.dailyRead[day],b.progress.dailyRead[day]);
 for(const id of ids)for(const kind of ['notes','bookmarks']){
  const sa=a.clocks[kind][id]||zeroStamp,sb=b.clocks[kind][id]||zeroStamp;
  let winner=sa>sb?a:sb>sa?b:null;
  // Equal legacy stamps have no causal order. Resolve deterministically so retries converge.
  if(!winner){const va=kind==='notes'?(a.progress.notes[id]||''):a.progress.bookmarks.includes(id),vb=kind==='notes'?(b.progress.notes[id]||''):b.progress.bookmarks.includes(id);winner=stableStringify(va)>=stableStringify(vb)?a:b;}
  const stamp=winner.clocks[kind][id];if(stamp)out.clocks[kind][id]=stamp;
  if(kind==='notes'){if(id in winner.progress.notes||stamp)out.progress.notes[id]=winner.progress.notes[id]||'';}
  else if(winner.progress.bookmarks.includes(id))out.progress.bookmarks.push(id);
 }
 out.progress=cleanProgress(out.progress,ids);return out;
}
export function mergeGuestDocument(account,guest,ids,device='device',now=Date.now()){
 const current=cleanDocument(account,ids),local=cleanProgress(guest,ids);
 const merged=mergeDocuments(current,documentFromProgress(local,ids,'guest',0),ids).progress;
 // Importing a guest save fills absent notes; an existing account note is kept.
 merged.notes={...local.notes,...current.progress.notes};merged.bookmarks=sortedUnion(current.progress.bookmarks,local.bookmarks);
 return updateDocument(current,merged,ids,device,now);
}
export function hasProgress(progress){return !!(progress.lessons.length||progress.mastery.length||progress.bosses.length||progress.checkins.length||progress.bookmarks.length||Object.values(progress.notes).some(Boolean)||Object.keys(progress.dailyRead).length);}
export function storageRead(storage,key,fallback){try{const text=storage?.getItem(key);return text?JSON.parse(text):fallback;}catch{return fallback;}}
export function readGuest(storage,ids,device){
 const raw=storageRead(storage,GUEST_KEY,freshProgress());let progress;try{progress=cleanProgress(raw,ids);}catch{progress=freshProgress();}
 const saved=storageRead(storage,GUEST_DOCUMENT_KEY,null);let doc;
 try{doc=cleanDocument(saved,ids);}catch{doc=documentFromProgress(progress,ids,device);}
 if(stableStringify(doc.progress)!==stableStringify(progress))doc=updateDocument(doc,progress,ids,device);
 return doc;
}
export function fingerprint(progress){let hash=2166136261;for(const c of stableStringify(progress)){hash^=c.charCodeAt(0);hash=Math.imul(hash,16777619);}return (hash>>>0).toString(36);}

// Optimistic revision checks protect edits made by another device between read and write.
export async function synchronize(adapter,{ids,getCurrent,apply,isActive,maxAttempts=5}){
 for(let attempt=0;attempt<maxAttempts;attempt++){
  if(!isActive())return {cancelled:true};
  const remote=await adapter.read();if(!isActive())return {cancelled:true};
  const merged=remote?mergeDocuments(getCurrent(),remote.document,ids):cleanDocument(getCurrent(),ids);
  apply(merged);const sent=clone(getCurrent());
  if(remote&&stableStringify(sent)===stableStringify(cleanDocument(remote.document,ids)))return {document:sent,revision:remote.revision,updatedAt:remote.updated_at};
  const result=await adapter.write(sent,remote?.revision??null);if(!isActive())return {cancelled:true};
  if(!result)continue;
  // Local typing during the request stays in getCurrent() and is retried before claiming success.
  if(stableStringify(getCurrent())!==stableStringify(sent))continue;
  return {document:sent,revision:result.revision,updatedAt:result.updated_at};
 }
 throw Error('其他设备也在保存，当前修改已留在本机，请稍后重试同步。');
}
