const $=id=>document.getElementById(id);
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const count=value=>Number(value||0).toLocaleString('zh-CN');
export function shanghaiDay(date=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);}
function earlier(day,days){const date=new Date(day+'T00:00:00Z');date.setUTCDate(date.getUTCDate()-days);return date.toISOString().slice(0,10);}
function time(value){return new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date(value));}
export function renderChart(rows,metric='uv'){
 const width=1100,height=240,left=46,right=20,top=18,bottom=34,chartWidth=width-left-right,chartHeight=height-top-bottom;
 const max=Math.max(1,...rows.map(r=>Number(r[metric]))),ceiling=Math.max(1,Math.ceil(max/4)*4);
 const x=i=>left+(rows.length===1?chartWidth/2:i*chartWidth/Math.max(1,rows.length-1));
 const y=value=>top+chartHeight-Number(value)*chartHeight/ceiling;
 const points=rows.map((r,i)=>[x(i),y(r[metric])]),line=points.map(([a,b],i)=>(i?'L':'M')+a.toFixed(2)+' '+b.toFixed(2)).join(' ');
 const grid=[0,1,2,3,4].map(i=>{const val=ceiling*i/4,pos=y(val);return `<line class="grid" x1="${left}" y1="${pos}" x2="${width-right}" y2="${pos}"/><text x="${left-10}" y="${pos+4}" text-anchor="end">${count(val)}</text>`;}).join('');
 const step=Math.max(1,Math.ceil(rows.length/7));
 const labels=rows.map((r,i)=>i%step===0||i===rows.length-1?`<text x="${x(i)}" y="${height-5}" text-anchor="middle">${escape(r.day.slice(5).replace('-','/'))}</text>`:'').join('');
 const dots=rows.map((r,i)=>`<g class="point" tabindex="${i===0?0:-1}" role="button" aria-label="${escape(r.day)}：${count(r.uv)}人，${count(r.pv)}次浏览" data-index="${i}"><title>${escape(r.day)} · 人数 ${count(r.uv)} · 浏览 ${count(r.pv)}</title><rect class="hit" x="${x(i)-Math.min(22,chartWidth/Math.max(rows.length,1)/2)}" y="${top}" width="${Math.min(44,chartWidth/Math.max(rows.length,1))}" height="${chartHeight}"/><circle class="dot" cx="${x(i)}" cy="${y(r[metric])}" r="${rows.length>90?1.5:3.5}"/></g>`).join('');
 return `<svg viewBox="0 0 ${width} ${height}" aria-hidden="false">${grid}${line?`<path class="trend-area" d="${line} L ${x(rows.length-1)} ${top+chartHeight} L ${x(0)} ${top+chartHeight} Z"/><path class="trend-line" d="${line}"/>`:''}${labels}${dots}</svg>`;
}
export async function startDashboard({fetch:request=globalThis.fetch,now=()=>new Date()}={}){
 let report,metric='uv',cursors=[null],page=0,version=0,loading=false;
 const today=shanghaiDay(now());
 async function api(path,options){const response=await request(path,options);const value=await response.json();if(!response.ok){const error=Error(value.error||'暂时无法读取统计。');error.status=response.status;throw error;}return value;}
 function status(message,error=false){$('status').textContent=message;$('status').classList.toggle('error',error);}
 function showLogin(){version++;$('login').hidden=false;$('dashboard').hidden=true;$('logout').hidden=true;$('account').textContent='';}
 function showChart(){
  $('chart').innerHTML=renderChart(report.daily,metric);
  $('chart').setAttribute('aria-label',`${$('from').value}至${$('to').value}的每日${metric==='uv'?'人数':'浏览量'}趋势，详细值可在下方数据表查看`);
  function detail(target){const row=report.daily[Number(target.closest('[data-index]')?.dataset.index)];if(row)$('chart-detail').textContent=`${row.day} · 当日人数 ${count(row.uv)} · 页面浏览 ${count(row.pv)}`;}
  $('chart').onclick=event=>detail(event.target);$('chart').onfocusin=event=>detail(event.target);
  $('chart').onkeydown=event=>{
   const point=event.target.closest('[data-index]');if(!point)return;
   if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){
    event.preventDefault();const current=Number(point.dataset.index),index=event.key==='Home'?0:event.key==='End'?report.daily.length-1:Math.max(0,Math.min(report.daily.length-1,current+(event.key==='ArrowRight'?1:-1)));
    point.setAttribute('tabindex','-1');const next=$('chart').querySelector(`[data-index="${index}"]`);next?.setAttribute('tabindex','0');next?.focus();if(next)detail(next);
   }else if(event.key==='Enter'||event.key===' '){event.preventDefault();detail(event.target);}
  };
 }
 function paint(){
  $('visitor-label').textContent=report.totals.days===1?'当日访问人数 · UV':'访客人次 · 按天去重';
  $('visitors').textContent=count(report.totals.visitor_days);$('views').textContent=count(report.totals.pv);
  $('average').textContent=(report.totals.visitor_days/Math.max(1,report.totals.days)).toLocaleString('zh-CN',{maximumFractionDigits:1});
  $('updated').textContent='最近刷新 '+time(report.generated_at);
  showChart();$('daily-rows').innerHTML=report.daily.map(r=>`<tr><td>${escape(r.day)}</td><td>${count(r.uv)}</td><td>${count(r.pv)}</td></tr>`).join('');
  const max=Math.max(1,...report.chapters.map(c=>Number(c.pv)));
  $('chapters').innerHTML=report.chapters.length?report.chapters.map((c,i)=>`<article class="chapter-row"><span class="rank">${String(i+1).padStart(2,'0')}</span><div><div class="chapter-name">${escape(c.chapter)}. ${escape(c.title)}</div><svg class="chapter-track" width="100%" height="4" viewBox="0 0 500 4" preserveAspectRatio="none" aria-hidden="true"><rect width="500" height="4" fill="#edf1f8"/><rect width="${Math.max(2,Number(c.pv)/max*500)}" height="4" fill="#325bd8"/></svg></div><div class="chapter-numbers">${count(c.pv)}<small>${count(c.visitor_days)} 人次</small></div></article>`).join(''):'<p class="empty">这个日期范围内还没有章节访问记录。</p>';
  $('visit-rows').innerHTML=report.visits.length?report.visits.map(v=>`<tr><td>${escape(time(v.visited_at))}<small>${escape(v.day)}</small></td><td>${escape(v.title)}<small>${escape(v.chapter_title||'网站页面')} · ${escape(v.path)}</small></td><td>${escape(v.ip||'未提供')}</td><td>${escape(v.source||'直接访问 / 浏览器未提供')}</td></tr>`).join(''):'<tr><td colspan="4" class="empty">没有访问明细。仅保留最近30天的记录，较早日期仍可查看汇总。</td></tr>';
  $('page-info').textContent=`第 ${page+1} 页 · 本页 ${report.visits.length} 条`;
  $('previous').disabled=page===0;$('next').disabled=!report.has_more;
 }
 async function load(reset=true){
  const own=++version;if(reset){cursors=[null];page=0;}
  const from=$('from').value,to=$('to').value;
  if(!from||!to||from>to||to>today||from<earlier(today,364)){status('请选择最近365天内的有效日期范围。',true);return;}
  loading=true;$('refresh').disabled=true;$('next').disabled=true;$('previous').disabled=true;status('正在读取统计…');
  const query=new URLSearchParams({from,to});if($('chapter').value)query.set('chapter',$('chapter').value);
  const cursor=cursors[page];if(cursor){query.set('before',cursor.visited_at);query.set('before_id',cursor.id);}
  try{const result=await api('/api/report?'+query);if(own!==version)return;report=result;paint();status(result.totals.pv?'':'暂时还没有访问数据。统计启用后开始记录，不补记历史访问。');}
  catch(e){if(own!==version)return;if(e.status===401||e.status===403)showLogin();status(e.message,true);}
  finally{if(own===version){loading=false;$('refresh').disabled=false;}}
 }
 function range(days){$('from').value=earlier(today,days-1);$('to').value=today;document.querySelectorAll('[data-days]').forEach(b=>b.classList.toggle('active',Number(b.dataset.days)===days));}
 $('from').max=today;$('to').max=today;$('from').min=earlier(today,364);$('to').min=earlier(today,364);range(30);
 $('filters').onsubmit=event=>{event.preventDefault();document.querySelectorAll('[data-days]').forEach(b=>b.classList.remove('active'));load();};
 document.querySelectorAll('[data-days]').forEach(button=>button.onclick=()=>{range(Number(button.dataset.days));load();});
 document.querySelectorAll('[data-metric]').forEach(button=>button.onclick=()=>{metric=button.dataset.metric;document.querySelectorAll('[data-metric]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});if(report)showChart();});
 $('chapter').onchange=()=>load();
 $('next').onclick=()=>{if(loading||!report?.has_more)return;cursors[++page]=report.visits.at(-1);load(false);};
 $('previous').onclick=()=>{if(loading||page===0)return;page--;load(false);};
 $('sign-in').onclick=async()=>{$('sign-in').disabled=true;try{const result=await api('/api/auth/start',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});location.assign(result.url);}catch(e){status(e.message,true);$('sign-in').disabled=false;}};
 $('logout').onclick=async()=>{try{await api('/api/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});showLogin();status('已退出本机统计后台。');}catch(e){status(e.message,true);}};
 try{
  const session=await api('/api/session');
  if(!session.authenticated){showLogin();status('');return {load};}
  $('login').hidden=true;$('dashboard').hidden=false;$('logout').hidden=false;$('account').textContent=session.name;
  const catalog=await api('/api/catalog');for(const chapter of catalog){const option=document.createElement('option');option.value=chapter.id;option.textContent=`${chapter.id}. ${chapter.title}`;$('chapter').append(option);}
  await load();
 }catch(e){showLogin();status(e.message,true);}
 return {load};
}
if(document.documentElement.dataset.mode!=='preview')startDashboard();
