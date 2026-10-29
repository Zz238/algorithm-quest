import {createClient} from '@supabase/supabase-js';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,PRODUCTION_SITE} from './config/cloud.js';
const offlineFile=typeof window!=='undefined'&&window.location.protocol==='file:';
export const client=SUPABASE_PUBLISHABLE_KEY&&!offlineFile?createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{flowType:'pkce',detectSessionInUrl:false,persistSession:true,autoRefreshToken:true,storageKey:'algo-quest-auth-v1'}}):null;
export function oauthRedirect(){
 const here=new URL(window.location.href),production=new URL(PRODUCTION_SITE);
 if(here.origin!==production.origin||here.pathname!==production.pathname)throw Error('云端登录请在正式网站 zz238.github.io/algorithm-quest/ 完成；本机版本仍可使用游客存档。');
 return PRODUCTION_SITE;
}
export async function githubProviderEnabled(){
 if(!client)return false;
 const response=await fetch(SUPABASE_URL+'/auth/v1/settings',{headers:{apikey:SUPABASE_PUBLISHABLE_KEY},signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw Error('暂时无法连接登录服务，请稍后重试。');
 const settings=await response.json();return settings.external?.github===true;
}
export function saveAdapter(userId){return {
 async read(){const {data,error}=await client.from('algo_quest_saves').select('document,revision,updated_at').eq('user_id',userId).abortSignal(AbortSignal.timeout(15000)).maybeSingle();if(error)throw error;return data;},
 async write(document,revision){
  const request=revision===null?client.from('algo_quest_saves').insert({user_id:userId,document}):client.from('algo_quest_saves').update({document}).eq('user_id',userId).eq('revision',revision);
  const {data,error}=await request.select('revision,updated_at').abortSignal(AbortSignal.timeout(15000)).maybeSingle();
  if(error?.code==='23505')return null;if(error)throw error;return data;
 }
};}
