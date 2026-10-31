import {client} from './supabase.js';
const timeout=()=>AbortSignal.timeout(15000);
export function createCommentsService(connection=client){
 return {
  available:!!connection,
  async list(lesson,order,offset){
   const {data,error}=await connection.rpc('algo_quest_list_comments',{p_lesson:lesson,p_order:order,p_offset:offset}).abortSignal(timeout());
   if(error)throw error;return data;
  },
  async post(id,lesson,body){
   const {data,error}=await connection.rpc('algo_quest_post_comment',{p_id:id,p_lesson:lesson,p_body:body}).abortSignal(timeout());
   if(error)throw error;return data;
  },
  async withdraw(id){
   const {data,error}=await connection.rpc('algo_quest_withdraw_comment',{p_id:id}).abortSignal(timeout());
   if(error)throw error;return data;
  },
  subscribe(lesson,changed){
   if(!connection)return ()=>{};
   const channel=connection.channel('lesson-comments-'+lesson+'-'+Math.random().toString(36).slice(2))
    .on('postgres_changes',{event:'UPDATE',schema:'public',table:'algo_quest_comment_signals',filter:'lesson_id=eq.'+lesson},changed).subscribe();
   return ()=>connection.removeChannel(channel);
  }
 };
}
