import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,PRODUCTION_SITE,TRAFFIC_ENABLED} from './config/cloud.js';

export const TRAFFIC_CHOICE_KEY='algo-quest-traffic-choice-v1';
export const TRAFFIC_VISITOR_KEY='algo-quest-traffic-visitor-v1';
export function trafficDay(now=new Date()) {
  return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
}
export function trafficAllowed(storage,navigator={}) {
  if(navigator.globalPrivacyControl===true||navigator.doNotTrack==='1')return false;
  try{return storage.getItem(TRAFFIC_CHOICE_KEY)!=='off';}catch{return false;}
}
export function externalSource(referrer,site=PRODUCTION_SITE) {
  try{const url=new URL(referrer);return ['https:','http:'].includes(url.protocol)&&url.origin!==new URL(site).origin?url.origin:'';}catch{return '';}
}
// Only known routes on the production site are counted. No account, answer or URL query is sent.
export function createTrafficTracker({routes,location,storage,navigator,enabled=TRAFFIC_ENABLED,fetch=globalThis.fetch,crypto=globalThis.crypto,now=()=>new Date(),setTimer=setTimeout,clearTimer=clearTimeout,referrer='',delay=800}) {
  let timer,lastPath='',dailyVisitor;
  const production=new URL(PRODUCTION_SITE);
  function visitor() {
    const day=trafficDay(now());
    if(dailyVisitor?.day===day)return dailyVisitor.id;
    try{const saved=JSON.parse(storage.getItem(TRAFFIC_VISITOR_KEY)||'null');if(saved?.day===day&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(saved.id))dailyVisitor=saved;}catch{}
    if(dailyVisitor?.day!==day){dailyVisitor={day,id:crypto.randomUUID()};try{storage.setItem(TRAFFIC_VISITOR_KEY,JSON.stringify(dailyVisitor));}catch{}}
    return dailyVisitor.id;
  }
  function cancel(){if(timer!==undefined)clearTimer(timer);timer=undefined;}
  function visit(path) {
    cancel();
    if(!enabled||location.origin!==production.origin||location.pathname!==production.pathname||!routes.has(path)||!trafficAllowed(storage,navigator)||navigator.webdriver)return;
    if(path===lastPath)return;
    timer=setTimer(()=>{
      timer=undefined;if(!trafficAllowed(storage,navigator))return;
      lastPath=path;
      const body={p_event:crypto.randomUUID(),p_visitor:visitor(),p_path:path,p_source:externalSource(referrer)};
      Promise.resolve().then(()=>fetch(SUPABASE_URL+'/rest/v1/rpc/algo_quest_collect_visit',{
        method:'POST',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json'},
        body:JSON.stringify(body),credentials:'omit',referrerPolicy:'no-referrer',keepalive:true,signal:AbortSignal.timeout(6000)
      })).catch(()=>{}); // Statistics must never interrupt learning or retry in a loop.
    },delay);
  }
  function stop(){cancel();lastPath='';dailyVisitor=undefined;try{storage.removeItem(TRAFFIC_VISITOR_KEY);}catch{}}
  return {visit,cancel,stop};
}
