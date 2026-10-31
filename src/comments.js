export const COMMENT_LIMIT=2000;
export const COMMENT_PAGE_SIZE=20;
export const commentLength=value=>Array.from(value).length;
export function commentError(error){
 if(error?.message?.includes('发送太快'))return '发送太快了，请稍后再试。草稿已保留。';
 if(error?.code==='42501'||error?.status===401)return '请重新登录后发送，草稿已保留。';
 if(['PGRST202','42P01'].includes(error?.code))return '评论服务正在准备中，请稍后重试。草稿已保留。';
 return '暂时没有发送成功，请联网后重试。草稿已保留，再次发送不会重复记录。';
}
export function isSendKey(event,composing=false,recentComposition=false){
 return event.key==='Enter'&&!event.shiftKey&&!event.ctrlKey&&!event.altKey&&!event.metaKey&&!event.isComposing&&event.keyCode!==229&&!composing&&!recentComposition;
}
export function validateComment(value){
 const body=value.trim();
 if(!body)return '写下一点内容，再发送吧。';
 if(commentLength(body)>COMMENT_LIMIT)return '笔记最多2000个字符，请精简后再发送。';
 return '';
}
export function pixelAvatar(name){
 let seed=2166136261;for(const c of name){seed^=c.charCodeAt(0);seed=Math.imul(seed,16777619);}
 const grid=[];for(let y=0;y<5;y++)for(let x=0;x<5;x++)grid.push(((seed>>>(y*3+Math.min(x,4-x)))&1)===1);
 return grid;
}
