import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {randomBytes,createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from '../src/config/cloud.js';

export const ADMIN_HOST='127.0.0.1';
export const ADMIN_PORT=4780;
const ROOT=new URL('./public/',import.meta.url);
const cookieName='algo_quest_local_admin';
const random=()=>randomBytes(32).toString('base64url');
const safeHeaders={
 'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff',
 'X-Frame-Options':'DENY','Cross-Origin-Resource-Policy':'same-origin',
 'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"
};
export function createAdminServer({port=ADMIN_PORT,fetch:request=globalThis.fetch,now=()=>Date.now()}={}) {
 const origin=`http://${ADMIN_HOST}:${port}`,sessions=new Map(),flows=new Map();
 function respond(res,status,body,type='application/json; charset=utf-8',extra={}) {
  res.writeHead(status,{...safeHeaders,'Content-Type':type,...extra});res.end(type.startsWith('application/json')?JSON.stringify(body):body);
 }
 function setCookie(id,maxAge=28800){return `${cookieName}=${id}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}`;}
 function sessionId(req){return (req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName+'='))?.slice(cookieName.length+1);}
 async function api(path,{token,body}={}) {
  const response=await request(SUPABASE_URL+path,{
   method:body===undefined?'GET':'POST',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,...(token?{Authorization:'Bearer '+token}:{}),'Content-Type':'application/json'},
   ...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(15000)
  });
  const data=await response.json().catch(()=>null);
  if(!response.ok){const e=Error('云端服务暂时不可用。');e.status=response.status;e.code=data?.code;throw e;}
  return data;
 }
 async function admin(token){return await api('/rest/v1/rpc/algo_quest_traffic_is_admin',{token,body:{}})===true;}
 async function getSession(req) {
  const id=sessionId(req),session=sessions.get(id);
  if(!session||session.until<now()){sessions.delete(id);return null;}
  if(session.tokens.expires_at*1000<now()+60000){
   // Serialize refreshes so concurrent requests cannot race refresh-token rotation.
   session.refreshing??=api('/auth/v1/token?grant_type=refresh_token',{body:{refresh_token:session.tokens.refresh_token}})
    .then(tokens=>{session.tokens={...tokens,expires_at:tokens.expires_at||Math.floor(now()/1000)+tokens.expires_in};})
    .finally(()=>{session.refreshing=undefined;});
   try{await session.refreshing;}catch{sessions.delete(id);return null;}
  }
  return session;
 }
 const server=http.createServer(async(req,res)=>{
  try{
   if(req.headers.host!==`${ADMIN_HOST}:${port}`||!['127.0.0.1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress))return respond(res,403,{error:'只允许通过本机地址访问。'});
   if(req.headers.origin&&req.headers.origin!==origin)return respond(res,403,{error:'不接受跨站请求。'});
   if(req.headers['sec-fetch-site']==='cross-site'&&!req.url.startsWith('/auth/callback'))return respond(res,403,{error:'不接受跨站请求。'});
   if(req.method==='POST'&&(req.headers.origin!==origin||!req.headers['content-type']?.startsWith('application/json')))return respond(res,403,{error:'请求来源不正确。'});
   const url=new URL(req.url,origin);
   for(const [id,s] of sessions)if(s.until<now())sessions.delete(id);
   for(const [id,f] of flows)if(f.until<now())flows.delete(id);
   if(req.method==='GET'&&url.pathname==='/api/session'){
    const s=await getSession(req);return respond(res,200,{authenticated:!!s,name:s?.name||null});
   }
   if(req.method==='POST'&&url.pathname==='/api/auth/start'){
    if(flows.size>=20)return respond(res,429,{error:'登录尝试较多，请稍后再试。'});
    const id=random(),verifier=random();
    flows.set(id,{verifier,until:now()+600000});
    const authorize=new URL(SUPABASE_URL+'/auth/v1/authorize');
    authorize.search=new URLSearchParams({provider:'github',redirect_to:origin+'/auth/callback',code_challenge:createHash('sha256').update(verifier).digest('base64url'),code_challenge_method:'s256'}).toString();
    return respond(res,200,{url:authorize.href},undefined,{'Set-Cookie':setCookie(id,600)});
   }
   if(req.method==='GET'&&url.pathname==='/auth/callback'){
    const id=sessionId(req),flow=flows.get(id);flows.delete(id);
    if(!flow||flow.until<now()||!url.searchParams.get('code'))return respond(res,400,'登录未完成或已过期。请回到 http://127.0.0.1:4780/ 重新登录。','text/plain; charset=utf-8');
    const tokens=await api('/auth/v1/token?grant_type=pkce',{body:{auth_code:url.searchParams.get('code'),code_verifier:flow.verifier}});
    if(!tokens?.access_token||!await admin(tokens.access_token))return respond(res,403,'此 GitHub 账号没有统计查看权限。请回到本机后台，使用 Zz238 登录。','text/plain; charset=utf-8',{'Set-Cookie':setCookie('',0)});
    const session=random();
    sessions.set(session,{tokens:{...tokens,expires_at:tokens.expires_at||Math.floor(now()/1000)+tokens.expires_in},until:now()+28800000,name:'Zz238'});
    res.writeHead(303,{...safeHeaders,Location:'/', 'Set-Cookie':setCookie(session)});return res.end();
   }
   if(req.method==='POST'&&url.pathname==='/api/logout'){
    const id=sessionId(req);sessions.delete(id);flows.delete(id);
    return respond(res,200,{ok:true},undefined,{'Set-Cookie':setCookie('',0)});
   }
   if(req.method==='GET'&&url.pathname==='/api/report'){
    const session=await getSession(req);if(!session)return respond(res,401,{error:'请先使用管理员 GitHub 账号登录。'});
    const from=url.searchParams.get('from'),to=url.searchParams.get('to'),chapter=url.searchParams.get('chapter');
    const before=url.searchParams.get('before'),beforeId=url.searchParams.get('before_id');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(from||'')||!/^\d{4}-\d{2}-\d{2}$/.test(to||'')||(chapter&&!/^(?:[1-9]|1[0-2])$/.test(chapter))||!!before!==!!beforeId
    ||(beforeId&&!/^[0-9a-f-]{36}$/i.test(beforeId))||(before&&!Number.isFinite(Date.parse(before))))return respond(res,400,{error:'日期或分页参数不正确。'});
    try{
     const report=await api('/rest/v1/rpc/algo_quest_traffic_report',{token:session.tokens.access_token,body:{p_from:from,p_to:to,p_chapter:chapter?Number(chapter):null,p_before:before||null,p_before_id:beforeId||null}});
     return respond(res,200,report);
    }catch(e){if(e.status===401||e.status===403){sessions.delete(sessionId(req));return respond(res,403,{error:'当前账号无权查看统计，请重新登录。'});}if(e.code==='PGRST202')return respond(res,503,{error:'统计数据库尚未安装。请按 admin/README.md 完成一次性配置。'});if(e.code==='22023')return respond(res,400,{error:'请选择最近365天内的有效日期。'});throw e;}
   }
   if(req.method==='GET'&&['/','/app.js','/style.css'].includes(url.pathname)){
    const name=url.pathname==='/'?'index.html':url.pathname.slice(1);
    return respond(res,200,await readFile(new URL(name,ROOT)),name.endsWith('.html')?'text/html; charset=utf-8':name.endsWith('.css')?'text/css; charset=utf-8':'text/javascript; charset=utf-8');
   }
   if(req.method==='GET'&&url.pathname==='/api/catalog')return respond(res,200,JSON.parse(await readFile(new URL('./catalog.json',import.meta.url),'utf8')));
   return respond(res,404,{error:'没有这个页面。'});
  }catch(e){return respond(res,502,{error:e.code==='PGRST202'?'统计数据库尚未安装，请先完成 admin/README.md 中的配置。':'暂时无法连接统计服务，请检查网络后重试。'});}
 });
 server.requestTimeout=20000;server.headersTimeout=10000;server.maxHeadersCount=50;
 server.on('close',()=>{sessions.clear();flows.clear();});
 return server;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 const server=createAdminServer();
 server.on('error',error=>{console.error(error.code==='EADDRINUSE'?'端口4780已被占用。若后台已经运行，请打开 http://127.0.0.1:4780/ 。':'本机后台未能启动：'+error.message);process.exitCode=1;});
 server.listen(ADMIN_PORT,ADMIN_HOST,()=>{
  const url=`http://${ADMIN_HOST}:${ADMIN_PORT}/`;
  console.log(`算法之旅 · 本机访问统计\n${url}\n仅监听127.0.0.1，局域网与公网无法访问。\n关闭此窗口或按Ctrl+C停止服务。`);
  if(process.argv.includes('--open')){
   const cmd=process.platform==='win32'?['cmd',['/c','start','',url]]:process.platform==='darwin'?['open',[url]]:['xdg-open',[url]];
   const child=spawn(cmd[0],cmd[1],{stdio:'ignore',detached:true});child.on('error',()=>{});child.unref();
  }
 });
 process.once('SIGINT',()=>server.close());process.once('SIGTERM',()=>server.close());
}
