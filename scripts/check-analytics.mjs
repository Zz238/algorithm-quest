import assert from 'node:assert/strict';
import fs from 'node:fs';
import {randomUUID,createHash} from 'node:crypto';
import http from 'node:http';
import {PGlite} from '@electric-sql/pglite';
import {createTrafficTracker,TRAFFIC_VISITOR_KEY,TRAFFIC_CHOICE_KEY,trafficDay,externalSource,trafficAllowed} from '../src/analytics.js';
import {createAdminServer,ADMIN_HOST} from '../admin/server.mjs';
import {chapters} from '../src/data/course.js';

// Browser collection: SPA navigation, deduplication, privacy choices, per-day identity.
const memory=new Map(),storage={getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value),removeItem:key=>memory.delete(key)};
let timer,today=new Date('2026-11-03T15:59:00Z'),sent=[];
const tracker=createTrafficTracker({enabled:true,routes:new Set(['/','/learn/1/0','/learn/2/0']),location:{origin:'https://zz238.github.io',pathname:'/algorithm-quest/'},storage,navigator:{},referrer:'https://example.com/search?private=secret#answer',now:()=>today,setTimer:fn=>(timer=fn,1),clearTimer:()=>timer=undefined,fetch:async(url,options)=>sent.push({url,options,body:JSON.parse(options.body)})});
const flush=async()=>{const fn=timer;timer=undefined;fn?.();await Promise.resolve();await Promise.resolve();};
tracker.visit('/');tracker.visit('/learn/1/0');await flush();assert.equal(sent.length,1);assert.equal(sent[0].body.p_path,'/learn/1/0');assert.equal(sent[0].body.p_source,'https://example.com');assert.deepEqual(Object.keys(sent[0].body).sort(),['p_event','p_path','p_source','p_visitor']);assert.equal(sent[0].options.credentials,'omit');assert.equal(sent[0].options.referrerPolicy,'no-referrer');
tracker.visit('/learn/1/0');await flush();assert.equal(sent.length,1);
tracker.visit('/learn/2/0');await flush();assert.equal(sent[0].body.p_visitor,sent[1].body.p_visitor);assert.notEqual(sent[0].body.p_event,sent[1].body.p_event);
today=new Date('2026-11-03T16:01:00Z');tracker.visit('/');await flush();assert.notEqual(sent[0].body.p_visitor,sent[2].body.p_visitor);assert.equal(trafficDay(today),'2026-11-04');
tracker.visit('/learn/1/0');storage.setItem(TRAFFIC_CHOICE_KEY,'off');await flush();assert.equal(sent.length,3);tracker.stop();assert(!storage.getItem(TRAFFIC_VISITOR_KEY));
assert(!trafficAllowed(storage,{}));storage.setItem(TRAFFIC_CHOICE_KEY,'on');assert(!trafficAllowed(storage,{doNotTrack:'1'}));assert(!trafficAllowed(storage,{globalPrivacyControl:true}));assert.equal(externalSource('https://zz238.github.io/algorithm-quest/#/learn/1/0'),'');assert.equal(externalSource('javascript:alert(1)'),'');
for(const path of ['/account?token=secret','/learn/90/0']){tracker.visit(path);await flush();}assert.equal(sent.length,3);
let devCalled=false;const dev=createTrafficTracker({routes:new Set(['/']),location:{origin:'http://127.0.0.1:4173',pathname:'/'},storage,navigator:{},fetch:()=>devCalled=true,setTimer:fn=>{fn();return 1;}});dev.visit('/');assert(!devCalled);
const disabled=createTrafficTracker({enabled:false,routes:new Set(['/']),location:{origin:'https://zz238.github.io',pathname:'/algorithm-quest/'},storage,navigator:{},setTimer:()=>{throw Error('Disabled collection must not schedule a request.');}});disabled.visit('/');

// Execute the real migration and privilege-sensitive queries on isolated PostgreSQL.
const db=new PGlite();
await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.identities(user_id uuid,provider text,provider_id text);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;`);
await db.exec(fs.readFileSync(new URL('../supabase/migrations/202611030001_traffic_analytics.sql',import.meta.url),'utf8'));
const one=async(sql,params=[])=>(await db.query(sql,params)).rows[0];
const scalar=async(sql,params=[])=>Object.values(await one(sql,params))[0];
const adminId=randomUUID(),otherId=randomUUID(),browserId=randomUUID();
await db.query(`insert into auth.identities values($1,'github','123933729'),($2,'github','42')`,[adminId,otherId]);
async function headers(override={},method='POST'){await db.query(`select set_config('request.headers',$1,false),set_config('request.method',$2,false)`,[JSON.stringify({origin:'https://zz238.github.io','cf-connecting-ip':'198.51.100.2','user-agent':'Mozilla/5.0',...override}),method]);}
async function as(role,id,fn){await db.query(`select set_config('request.jwt.claim.sub',$1,false)`,[id||'']);await db.exec('set role '+role);try{return await fn();}finally{await db.exec('reset role');}}
const collect=(id=randomUUID(),visitor=browserId,path='/learn/1/0',source='')=>scalar('select public.algo_quest_collect_visit($1,$2,$3,$4)',[id,visitor,path,source]);
await headers();const event=randomUUID();assert.equal(await as('anon',null,()=>collect(event)),true);assert.equal(await collect(event),true);assert.equal(await collect(randomUUID(),browserId,'/learn/1/1'),true);assert.equal(await collect(randomUUID(),browserId,'/learn/2/0'),true);assert.equal(await collect(randomUUID(),randomUUID(),'/'),true);
const day=await scalar(`select (clock_timestamp() at time zone 'Asia/Shanghai')::date::text`);
assert.deepEqual(await one('select pv::integer,uv::integer from algo_quest_analytics.daily where day=$1',[day]),{pv:4,uv:2});
assert.deepEqual(await one('select pv::integer,uv::integer from algo_quest_analytics.chapter_daily where chapter=1'),{pv:2,uv:1});
assert.equal(await scalar('select count(*)::integer from algo_quest_analytics.visits'),4);
for(const override of [{origin:'https://evil.example'},{'cf-connecting-ip':'','x-forwarded-for':'1.2.3.4'},{'cf-connecting-ip':'invalid'},{'cf-connecting-ip':'2001:db8::/32'},{'user-agent':'Googlebot'}]){await headers(override);assert.equal(await collect(),false);}
await headers({},'GET');assert.equal(await collect(),false);await headers();
assert.equal(await collect(randomUUID(),browserId,'/learn/1/0?secret=private'),false);assert.equal(await collect(randomUUID(),browserId,'/','https://example.org/private?q=secret'),false);assert.equal(await collect(null),false);
await assert.rejects(as('anon',null,()=>db.query('select * from algo_quest_analytics.visits')),/permission denied/);
await assert.rejects(as('authenticated',otherId,()=>db.query('select * from algo_quest_analytics.visits')),/permission denied/);
const report=(from=day,to=day,chapter=null,before=null,beforeId=null)=>scalar('select public.algo_quest_traffic_report($1,$2,$3,$4,$5)',[from,to,chapter,before,beforeId]);
await assert.rejects(as('anon',null,()=>report()),/permission denied/);
await assert.rejects(as('authenticated',otherId,()=>report()),/只有指定管理员/);
assert.equal(await as('authenticated',otherId,()=>scalar('select public.algo_quest_traffic_is_admin()')),false);
assert.equal(await as('authenticated',adminId,()=>scalar('select public.algo_quest_traffic_is_admin()')),true);
let result=await as('authenticated',adminId,()=>report());assert.equal(result.totals.pv,4);assert.equal(result.totals.visitor_days,2);assert.equal(result.visits[0].ip,'198.51.100.2');assert.equal(result.timezone,'Asia/Shanghai');assert.equal(result.chapters[0].chapter,1);
const yesterday=await scalar('select ($1::date-1)::text',[day]);const twoDays=await as('authenticated',adminId,()=>report(yesterday,day));assert.deepEqual(twoDays.daily[0],{day:yesterday,pv:0,uv:0});assert.equal(twoDays.daily.length,2);
await headers({'cf-connecting-ip':'2001:db8::10'});assert.equal(await collect(randomUUID(),randomUUID(),'/'),true);
await headers({'cf-connecting-ip':'198.51.100.3'});const limitedBrowser=randomUUID();for(let i=0;i<30;i++)assert.equal(await collect(randomUUID(),limitedBrowser),true);assert.equal(await collect(randomUUID(),limitedBrowser),false);
await headers({'cf-connecting-ip':'198.51.100.4'});for(let i=0;i<120;i++)assert.equal(await collect(randomUUID(),randomUUID()),true);assert.equal(await collect(randomUUID(),randomUUID()),false);
result=await as('authenticated',adminId,()=>report());assert.equal(result.visits.length,50);assert.equal(result.has_more,true);const last=result.visits.at(-1);const next=await as('authenticated',adminId,()=>report(day,day,null,last.visited_at,last.id));assert(next.visits.every(v=>!result.visits.some(r=>r.id===v.id)),'Cursor pagination must not repeat rows.');assert.equal((await as('authenticated',adminId,()=>report(day,day,2))).visits.length,1);
await assert.rejects(as('authenticated',adminId,()=>report('2000-01-01',day)),/365/);
const catalog=await db.query('select path from algo_quest_analytics.pages');for(const c of chapters)for(let i=0;i<c.lessons.length;i++)assert(catalog.rows.some(r=>r.path===`/learn/${c.id}/${i}`));
await db.exec(`insert into algo_quest_analytics.visits(id,visited_at,day,path,ip) values(gen_random_uuid(),clock_timestamp()-interval '31 days',current_date-31,'/','203.0.113.9');insert into algo_quest_analytics.daily(day,pv,uv) values(current_date-366,10,5),(current_date-100,20,8);update algo_quest_analytics.settings set last_cleanup='-infinity';select algo_quest_analytics.cleanup();`);
assert.equal(await scalar(`select count(*)::integer from algo_quest_analytics.visits where ip='203.0.113.9'`),0);assert.equal(await scalar(`select count(*)::integer from algo_quest_analytics.daily where day=current_date-366`),0);assert.equal(await scalar(`select pv::integer from algo_quest_analytics.daily where day=current_date-100`),20);
assert.equal(await scalar(`select count(*)::integer from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='algo_quest_analytics' and c.relkind='r' and not c.relrowsecurity`),0);
await db.close();

// Real HTTP server: loopback binding, DNS-rebinding/CSRF protections, PKCE and admin session.
const port=4789,origin='http://127.0.0.1:'+port,cloudCalls=[];let allowAdmin=true;
const mockFetch=async(url,options)=>{
 const body=options.body?JSON.parse(options.body):undefined;cloudCalls.push({url,options,body});
 if(url.includes('grant_type=pkce'))return Response.json({access_token:'test-jwt',refresh_token:'test-refresh',expires_in:3600,user:{id:adminId}});
 if(url.endsWith('algo_quest_traffic_is_admin'))return Response.json(allowAdmin);
 if(url.endsWith('algo_quest_traffic_report'))return Response.json({daily:[],chapters:[],visits:[],totals:{pv:0,visitor_days:0,days:1},has_more:false});
 throw Error('Unexpected cloud call');
};
const server=createAdminServer({port,fetch:mockFetch});await new Promise(resolve=>server.listen(port,ADMIN_HOST,resolve));
try{
 assert.equal(server.address().address,'127.0.0.1');let response=await fetch(origin+'/');assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');assert(response.headers.get('content-security-policy').includes("frame-ancestors 'none'"));assert(!response.headers.has('access-control-allow-origin'));
 const rawStatus=headers=>new Promise((resolve,reject)=>{const r=http.get(origin+'/',{headers},response=>{response.resume();response.on('end',()=>resolve(response.statusCode));});r.on('error',reject);});
 assert.equal(await rawStatus({host:'evil.example'}),403);
 assert.equal((await fetch(origin+'/api/session',{headers:{origin:'https://evil.example'}})).status,403);
 assert.equal((await fetch(origin+'/api/session',{headers:{'sec-fetch-site':'cross-site'}})).status,403);
 assert.equal((await fetch(origin+'/api/auth/start',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,403);
 assert.equal((await fetch(origin+'/api/report?from='+day+'&to='+day)).status,401);
 assert.equal((await fetch(origin+'/server.mjs')).status,404);
 response=await fetch(origin+'/api/auth/start',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:'{}'});const auth=await response.json();const flowCookie=response.headers.get('set-cookie').split(';')[0];const authorize=new URL(auth.url);assert.equal(authorize.searchParams.get('redirect_to'),origin+'/auth/callback');assert.equal(authorize.searchParams.get('provider'),'github');assert.equal(authorize.searchParams.get('code_challenge').length,43);assert.equal(authorize.searchParams.get('code_challenge_method'),'s256');
 response=await fetch(origin+'/auth/callback?code=test-code',{headers:{cookie:flowCookie},redirect:'manual'});assert.equal(response.status,303);const cookie=response.headers.get('set-cookie').split(';')[0];assert.notEqual(cookie,flowCookie);assert(response.headers.get('set-cookie').includes('HttpOnly'));const exchange=cloudCalls.find(c=>c.url.includes('grant_type=pkce'));assert.equal(createHash('sha256').update(exchange.body.code_verifier).digest('base64url'),authorize.searchParams.get('code_challenge'));
 assert.equal((await fetch(origin+'/auth/callback?code=test-code',{headers:{cookie:flowCookie},redirect:'manual'})).status,400);
 response=await fetch(origin+'/api/session',{headers:{cookie}});const session=await response.json();assert.equal(session.authenticated,true);assert(!JSON.stringify(session).includes('test-jwt'));
 response=await fetch(origin+'/api/report?from='+day+'&to='+day,{headers:{cookie}});assert.equal(response.status,200);assert.equal(cloudCalls.at(-1).options.headers.Authorization,'Bearer test-jwt');
 response=await fetch(origin+'/api/logout',{method:'POST',headers:{origin,cookie,'Content-Type':'application/json'},body:'{}'});assert.equal(response.status,200);assert.equal((await (await fetch(origin+'/api/session',{headers:{cookie}})).json()).authenticated,false);
 allowAdmin=false;response=await fetch(origin+'/api/auth/start',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:'{}'});const otherCookie=response.headers.get('set-cookie').split(';')[0];response=await fetch(origin+'/auth/callback?code=other',{headers:{cookie:otherCookie},redirect:'manual'});assert.equal(response.status,403);
}finally{await new Promise(resolve=>server.close(resolve));}
console.log('Analytics checks passed: production-only SPA tracking, daily identity/opt-out, real PostgreSQL migration + UV/PV deduplication + rate limits + admin isolation + cursor pagination + retention, and loopback HTTP/CSRF/PKCE/session checks. No production data was changed.');
