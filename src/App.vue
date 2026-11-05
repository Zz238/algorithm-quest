<script setup>
import {ref,computed,watch,onUnmounted,onMounted,nextTick} from 'vue';
import {chapters,codes,requiredLessons,findLesson,lessonRoute} from './data/course';import {TERMS} from './data/terms';import {cleanProgress,experience,localDateKey,recordLessonReading,recordCheckin} from './logic';
import Visualizer from './components/Visualizer.vue';import CodeReader from './components/CodeReader.vue';
import {createNavigation} from './navigation.js';
import {createTrafficTracker} from './analytics.js';
import PrivacyNotice from './components/PrivacyNotice.vue';
import SiteHeader from './components/SiteHeader.vue';import ChapterDrawer from './components/ChapterDrawer.vue';
import AccountPanel from './components/AccountPanel.vue';import {useCloudProgress} from './useCloudProgress';
import LessonComments from './components/LessonComments.vue';
import LessonNotes from './components/LessonNotes.vue';
import ChapterIntroduction from './components/ChapterIntroduction.vue';
import NodeAnatomy from './components/NodeAnatomy.vue';
import EverydayExample from './components/EverydayExample.vue';
import TraceLab from './components/TraceLab.vue';import LessonFoundation from './components/LessonFoundation.vue';import LessonPractice from './components/LessonPractice.vue';import {TRACE_TYPES} from './traces';
import {coreJava,JAVA_BY_ID,javaRoute} from './data/java-starter.js';
import {prerequisites,studyTime} from './data/learning-path.js';
import {JAVA_TASKS} from './data/learning-practice.js';
import {dailyGoal,dailyStudyCount,dueReviews,recordStudyActivity,queueReview,completeReview,mergeLearning,setDailyGoal} from './study-state.js';
import {browserStorage,draftKey,readDraft,writeDraft} from './study-drafts.js';
import JavaStarter from './components/JavaStarter.vue';
import JavaWriteTask from './components/JavaWriteTask.vue';
import ReviewPage from './components/ReviewPage.vue';
import BeginnerTrial from './components/BeginnerTrial.vue';
import VariantPractice from './components/VariantPractice.vue';
import PrerequisitePanel from './components/PrerequisitePanel.vue';
import ChapterExercise from './components/ChapterExercise.vue';
import NotesLibrary from './components/NotesLibrary.vue';
const allLessons=chapters.flatMap(c=>c.lessons),ids=allLessons.map(l=>l.id);
const props=defineProps({progressServices:Object,commentsService:Object});
function readRoute(){const path=location.hash.slice(1)||'/';if(path==='/checkin'){history.replaceState({},'',location.pathname+location.search+'#/account');return '/account';}return path;}
const route=ref(readRoute()),query=ref(''),notice=ref('');
const {progress,storageOK,cloud}=useCloudProgress(ids,props.progressServices);
const owner=computed(()=>cloud.state.user?.id||'guest');
const today=ref(localDateKey());
function refreshDay(){today.value=localDateKey();}
const clockTimer=setInterval(refreshDay,60000);document.addEventListener('visibilitychange',refreshDay);
onUnmounted(()=>{clearInterval(clockTimer);document.removeEventListener('visibilitychange',refreshDay)});
const parts=computed(()=>route.value.split('/').filter(Boolean)),view=computed(()=>parts.value[0]||'home');
let trafficStorage;try{trafficStorage=window.localStorage;}catch{trafficStorage={getItem:()=> 'off',removeItem:()=>{}};}
const trafficRoutes=new Set(['/', '/account', '/login', '/progress', '/glossary', '/privacy',...chapters.flatMap(c=>[...c.lessons.map((_,i)=>`/learn/${c.id}/${i}`),`/boss/${c.id}`])]);
const traffic=createTrafficTracker({routes:trafficRoutes,location:window.location,storage:trafficStorage,navigator:window.navigator,referrer:document.referrer});
onMounted(()=>traffic.visit(route.value));watch(route,path=>traffic.visit(path));
function updateTraffic(enabled){if(enabled)traffic.visit(route.value);else traffic.stop();}
function trafficPreferenceChanged(event){if(event.key==='algo-quest-traffic-choice-v1')updateTraffic(event.newValue!=='off');}
window.addEventListener('storage',trafficPreferenceChanged);
onUnmounted(()=>{traffic.cancel();window.removeEventListener('storage',trafficPreferenceChanged);});
const drawerOpen=ref(false),notesOpen=ref(false),notesModalOpen=ref(false),hasChapterMenu=computed(()=>['learn','boss'].includes(view.value));
watch([route,()=>cloud.state.user?.id],()=>{drawerOpen.value=false;notesOpen.value=false;notesModalOpen.value=false;});
const chapter=computed(()=>chapters.find(c=>c.id===Number(parts.value[1]))||chapters[0]);
const lessonIndex=computed(()=>{const index=Number(parts.value[2]||0);return Number.isInteger(index)?Math.max(0,Math.min(chapter.value.lessons.length-1,index)):0;});
const lesson=computed(()=>chapter.value.lessons[lessonIndex.value]);const boss=computed(()=>chapter.value.boss);

const xp=computed(()=>experience(progress));
const courseGroups=computed(()=>[0,1,2,3].map(i=>({index:i,chapters:chapters.filter(c=>c.world===i)})));
const filtered=computed(()=>query.value.trim()?allLessons.filter(l=>(l.title+l.concept+l.trap).toLowerCase().includes(query.value.trim().toLowerCase())):[]);
function clearedBoss(c){return progress.bosses.includes(c.id)&&(c.id!==5||progress.bossTasks[5]===1051);}
const clearedCount=computed(()=>chapters.filter(clearedBoss).length);
const core=allLessons.filter(l=>!l.optional),electives=allLessons.filter(l=>l.optional);
const coreRead=computed(()=>core.filter(l=>progress.lessons.includes(l.id)).length);
const electiveRead=computed(()=>electives.filter(l=>progress.lessons.includes(l.id)).length);
const firstUnprepared=computed(()=>coreJava.find(u=>!progress.learning.prepared.includes(u.id)));
const continuePath=computed(()=>{
 if(!progress.lessons.length&&!progress.mastery.length&&firstUnprepared.value)return javaRoute(firstUnprepared.value.id);
 const next=core.find(l=>!progress.lessons.includes(l.id));
 return next?lessonRoute(next.id):dueCount.value?'/review':'/progress';
});
const resumeTitle=computed(()=>{
 const [page,id,index]=continuePath.value.split('/').filter(Boolean);
 if(page==='java')return JAVA_BY_ID['java-'+id]?.title;
 return page==='learn'?chapters.find(c=>c.id===Number(id))?.lessons[Number(index)]?.title:page==='review'?'做一道到期的复习题':'基础阅读已完成';
});
const lessonMastered=computed(()=>progress.mastery.includes(lesson.value.id));
const lessonIndependent=computed(()=>progress.learning.independent.includes(lesson.value.id));
const canShowMethod=computed(()=>lesson.value.showCode&&(lesson.value.id!=='2-3'||progress.learning.prepared.includes('java-method')||progress.mastery.includes('2-4')));
const prior=computed(()=>prerequisites(lesson.value,findLesson,lessonRoute));
const dueCount=computed(()=>dueReviews(progress,today.value).length);
const todayCount=computed(()=>dailyStudyCount(progress,today.value)),goal=computed(()=>dailyGoal(progress));
const signedToday=computed(()=>progress.checkins.includes(today.value));
function markWrong(id){if(!cloud.state.initializing){refreshDay();queueReview(progress,id,today.value,true);}}
function markMastered(id){
 if(cloud.state.initializing||progress.mastery.includes(id))return;
 progress.mastery.push(id);refreshDay();queueReview(progress,id,today.value);
 toast('基础练习已通过。明天可以换一道题复习。');
}
function markPrepared(id){
 if(cloud.state.initializing)return;
 refreshDay();if(!progress.learning.prepared.includes(id))progress.learning.prepared.push(id);
 queueReview(progress,id,today.value);recordStudyActivity(progress,id,today.value);
 toast(recordCheckin(progress,today.value,!!cloud.state.user)?'今天的学习目标已达到，已自动打卡。':'这一节 Java 练习已保存。');
}
function finishedVariant({id,assisted}){
 if(cloud.state.initializing)return;
 assisted=assisted!==false;
 refreshDay();completeReview(progress,id,today.value,assisted);
 if(!assisted&&!progress.learning.independent.includes(id))progress.learning.independent.push(id);
 const checked=recordCheckin(progress,today.value,!!cloud.state.user);
 toast((assisted?'已记录参考后完成，下次换题再试。':'已记录独立完成。')+(checked?' 今天已自动打卡。':''));
}
function changeGoal(count){
 if(cloud.state.initializing||!setDailyGoal(progress,count))return;
 refreshDay();toast(recordCheckin(progress,today.value,!!cloud.state.user)?'目标已更新，今天已自动打卡。':'每日目标已保存。');
}
const navigating=ref(false),pageContent=ref(null);
const reducedMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function alignLessonNavigation(){
 const nav=document.querySelector('.lesson-nav'),selected=nav?.querySelector('[aria-current="page"]');
 if(!nav||!selected||nav.scrollWidth<=nav.clientWidth)return;
 const left=selected.getBoundingClientRect().left-nav.getBoundingClientRect().left+nav.scrollLeft-(nav.clientWidth-selected.clientWidth)/2;
 nav.scrollTo({left,behavior:reducedMotion()?'instant':'smooth'});
}
const positionStorage=browserStorage();
// Vue renders the hash target after the browser's own history restoration. One
// owner restores position so back/forward cannot clamp it against the old page.
const nativeRestoration=window.history.scrollRestoration;
if(nativeRestoration)window.history.scrollRestoration='manual';
const placeKey=(path,account)=>draftKey(account,path,'reading-position');
const remembers=path=>/^\/(learn|java|boss)\//.test(path);
function capturePlace(path=route.value,y=window.scrollY){
 if(!remembers(path))return null;
 const disclosures=Object.fromEntries(Array.from(pageContent.value?.querySelectorAll('details[data-study-place]')||[],e=>[e.dataset.studyPlace,e.open]));
 return {y:Math.max(0,Math.round(y)),disclosures};
}
function savePlace(path=route.value,account=owner.value){
 const place=capturePlace(path);if(place)writeDraft(placeKey(path,account),place,positionStorage);
}
let scrollSave;
function onScroll(){
 const path=route.value,account=owner.value;
 if(!remembers(path))return;
 clearTimeout(scrollSave);scrollSave=setTimeout(()=>{if(path===route.value&&account===owner.value)savePlace(path,account);},180);
}
function onHide(){savePlace();}
window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('pagehide',onHide);
async function focusPage(){
 clearTimeout(scrollSave);
 const path=route.value,account=owner.value;
 const saved=remembers(path)?readDraft(placeKey(path,account),positionStorage):null;
 const y=saved?.y;
 await nextTick();
 await new Promise(requestAnimationFrame);
 if(path!==route.value||account!==owner.value)return;
 for(const el of pageContent.value?.querySelectorAll('details[data-study-place]')||[]){const open=saved?.disclosures?.[el.dataset.studyPlace];if(typeof open==='boolean')el.open=open;}
 window.scrollTo({top:Number.isFinite(y)?y:0,behavior:'instant'});
 pageContent.value?.focus({preventScroll:true});alignLessonNavigation();
}
onMounted(focusPage);
watch(owner,(_current,previous)=>{savePlace(route.value,previous);focusPage();});
const navigation=createNavigation({current:()=>route.value,reducedMotion,pending:value=>navigating.value=value,commit:path=>{
 savePlace();route.value=path;location.hash=path;query.value='';focusPage();
}});
function go(path){navigation.request(path==='/checkin'?'/account':path);}
function onHash(){const path=readRoute();if(path===route.value)return;navigation.cancel();savePlace();route.value=path;query.value='';focusPage();}
window.addEventListener('hashchange',onHash);
onUnmounted(()=>{savePlace();if(nativeRestoration)window.history.scrollRestoration=nativeRestoration;clearTimeout(scrollSave);navigation.cancel();window.removeEventListener('hashchange',onHash);window.removeEventListener('scroll',onScroll);window.removeEventListener('pagehide',onHide);});
function jumpTo(id){const el=document.getElementById(id);if(el){if(el.tagName==='DETAILS')el.open=true;el.scrollIntoView({block:'start',behavior:reducedMotion()?'instant':'smooth'});}}
function browseCatalog(){document.getElementById('course-catalog')?.scrollIntoView({behavior:reducedMotion()?'instant':'smooth',block:'start'});}
const completion=computed(()=>Math.round(coreRead.value/core.length*100));
const chapterRead=c=>requiredLessons(c).filter(l=>progress.lessons.includes(l.id)).length;
const courseStages=['建立编程基础','掌握数据结构','理解常用思路','练习独立解题'];
let toastTimer;
function toast(s){notice.value=s;clearTimeout(toastTimer);toastTimer=setTimeout(()=>notice.value='',3500);}
onUnmounted(()=>clearTimeout(toastTimer));
const nextReadingPath=computed(()=>{
 const next=chapter.value.lessons[lessonIndex.value+1];
 if(next&&!next.optional)return '/learn/'+chapter.value.id+'/'+(lessonIndex.value+1);
 return '/boss/'+chapter.value.id;
});
function complete(advance){
 if(cloud.state.initializing)return;
 refreshDay();const id=lesson.value.id,loggedIn=!!cloud.state.user;
 const result=recordLessonReading(progress,id,today.value,loggedIn);
 if(!loggedIn)recordStudyActivity(progress,id,today.value);
 toast(result.checkedIn?'今天的学习目标已达到，已自动打卡。':'阅读已保存。还没做的练习可以稍后回来。');
 if(advance)go(nextReadingPath.value);
}
watch(()=>cloud.state.user?.id,id=>{if(id&&view.value==='login')go('/account');});
const note=computed({get:()=>progress.notes[lesson.value.id]||'',set:v=>progress.notes[lesson.value.id]=v.slice(0,5000)});
function claim(id){
 if(cloud.state.initializing||id!==chapter.value.id||clearedBoss(chapter.value))return;
 if(!progress.bosses.includes(id))progress.bosses.push(id);
 progress.bossTasks[id]=boss.value.lc;toast('本章练习已完成，记录已保存。');
}

function exportProgress(){download('algo-quest-progress.json',JSON.stringify({...progress,exportedAt:new Date().toISOString()},null,2),'application/json')}
function download(name,text,type='text/plain'){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
async function importProgress(e){const file=e.target.files?.[0];if(!file)return;try{if(file.size>1000000)throw Error('文件过大');const targetAccount=cloud.state.user?.id||'guest',text=await file.text();if(targetAccount!==(cloud.state.user?.id||'guest')){toast('账号已切换，请在当前账号重新选择备份。');e.target.value='';return;}const p=cleanProgress(JSON.parse(text),ids);progress.lessons=[...new Set([...progress.lessons,...p.lessons])];progress.mastery=[...new Set([...progress.mastery,...p.mastery])];for(const [id,lc] of Object.entries(p.bossTasks))if(!progress.bossTasks[id]||lc===chapters.find(c=>c.id===Number(id))?.boss.lc)progress.bossTasks[id]=lc;progress.bosses=[...new Set([...progress.bosses,...p.bosses])];progress.bookmarks=[...new Set([...progress.bookmarks,...p.bookmarks])];progress.notes={...p.notes,...progress.notes};progress.checkins=[...new Set([...progress.checkins,...p.checkins])].sort();for(const [day,items] of Object.entries(p.dailyRead))progress.dailyRead[day]=[...new Set([...(progress.dailyRead[day]||[]),...items])];progress.learning=mergeLearning(progress.learning,p.learning);recordCheckin(progress,localDateKey(),!!cloud.state.user);toast('已合并备份，保留当前进度、笔记和打卡记录。')}catch{toast('未导入：请使用本站导出的有效进度 JSON。')}e.target.value='';}
const COURSE_TERMS={...TERMS};for(const l of allLessons)for(const t of l.foundation.terms)if(!COURSE_TERMS[t.term])COURSE_TERMS[t.term]=['课程术语',t.meaning,t.example];
const glossaryQuery=ref(''),term=ref('int');const glossaryItems=computed(()=>Object.entries(COURSE_TERMS).filter(([k,v])=>(k+' '+v[1]).toLowerCase().includes(glossaryQuery.value.toLowerCase())));
const termInfo=computed(()=>COURSE_TERMS[term.value]);
const dayText='Java 基础、算法讲解与配套练习。';
</script>
<template>
<div class="app-layout" :class="{'has-chapter-menu':hasChapterMenu,'chapter-menu-open':drawerOpen,'has-lesson-notes':view==='learn'}"><div class="app-surface" :inert="drawerOpen||notesModalOpen">
<SiteHeader :user="cloud.state.user" :view="view" :chapter-id="chapter.id" @navigate="go"/>
<div v-if="!storageOK" class="storage-warning">当前浏览器保存功能不可用。可以继续学习，离开前请到学习记录里导出进度。</div>
<div v-if="notice" class="toast" role="status">{{notice}}</div>
<div :key="route+':'+owner" ref="pageContent" class="page-content" :class="{'is-navigating':navigating}" tabindex="-1">
<main v-if="view==='home'" class="home">
<section class="hero" aria-labelledby="home-title">
  <div class="hero-intro"><span class="eyebrow">Java · 数据结构 · 算法</span><h1 id="home-title">从基础开始，<br>读懂算法的<span>每一步。</span></h1><p>一套面向零基础的学习路径。从第一个变量，<br class="desktop-break">到独立推演、理解代码，再自己解决问题。</p><button class="text-button" @click="browseCatalog">浏览全部课程 <span aria-hidden="true">↓</span></button></div>
  <aside class="hero-next" aria-labelledby="resume-title"><div class="resume-top"><span>{{progress.lessons.length?'接着上次的进度':'从这里开始'}}</span><span class="resume-percentage">{{completion}}%</span></div><div class="reading-progress" role="progressbar" aria-label="基础阅读进度" :aria-valuenow="coreRead" :aria-valuemin="0" :aria-valuemax="core.length"><i :style="{width:completion+'%'}"></i></div><h2 id="resume-title">{{resumeTitle}}</h2><p>{{continuePath.startsWith('/java/')?'没有写过程序？先跟着做一个能看见结果的小例子。':'先读讲解，再动手推演。可以按自己的节奏练习。'}}</p><button class="primary start" :aria-busy="navigating" @click="go(continuePath)">{{progress.lessons.length?'继续学习':'开始学习'}} <span aria-hidden="true">→</span></button><small>基础已读 {{coreRead}} / {{core.length}} · 选学 {{electiveRead}} / {{electives.length}}</small></aside>
</section>
<div class="course-facts" aria-label="课程概况"><span><strong>12</strong> 章循序渐进</span><span><strong>72</strong> 节详细讲解</span><span><strong>216</strong> 道配套练习</span><span>逐条演示 <span aria-hidden="true">→</span> 逐行理解 <span aria-hidden="true">→</span> 独立练习</span></div>
<section class="search-block" id="course-catalog"><div><span class="eyebrow">学习路径</span><h2>课程目录</h2><p class="muted">按顺序打好基础，选学内容留到熟练后再看。</p></div><label class="search-field"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg><span class="sr-only">搜索知识点</span><input v-model="query" type="search" placeholder="搜索知识点，如：数组、二分"/></label></section>
<div class="study-home-links"><button @click="go('/java')"><strong>Java 零基础预备课</strong><span>12 节短课，从第一行打印开始 →</span></button><button @click="go('/learn/1/0')"><strong>先用纸笔学算法</strong><span>从输入、输出和步骤开始 →</span></button><button @click="go('/review')"><strong>复习与阶段练习</strong><span>{{dueCount?dueCount+' 项待复习':'试一道换了场景的题'}} →</span></button></div>
<div v-if="query.trim()" class="search-results" role="region" aria-label="课程搜索结果"><p class="search-count" role="status">{{filtered.length?`找到 ${filtered.length} 个相关小节`:'没有找到相关小节，试试更短的词。'}}</p><button v-for="l in filtered" :key="l.id" @click="go(lessonRoute(l.id))"><strong>{{l.title}}</strong><span>{{l.concept}}</span><span class="search-arrow" aria-hidden="true">→</span></button></div>
<div v-else class="course-path"><section v-for="w in courseGroups" :key="w.index" class="course-group"><header class="course-group-heading"><span class="stage-number">{{String(w.index+1).padStart(2,'0')}}</span><div><span class="eyebrow">阶段 {{w.index+1}}</span><h3>{{courseStages[w.index]}}</h3><p>第 {{w.chapters[0].id}}–{{w.chapters.at(-1).id}} 章</p></div></header><div class="chapter-grid"><button v-for="c in w.chapters" :key="c.id" class="chapter-card" @click="go('/learn/'+c.id+'/0')"><div class="chapter-card-top"><span>第 {{String(c.id).padStart(2,'0')}} 章</span><span aria-hidden="true">↗</span></div><span class="chapter-card-title">{{c.title}}</span><p>{{c.subtitle}}</p><div class="chapter-card-bottom"><span>{{chapterRead(c)}} / {{requiredLessons(c).length}} 节基础已读</span><span v-if="chapterRead(c)===requiredLessons(c).length" class="completed-label">已读完</span></div><div class="chapter-progress" aria-hidden="true"><i :style="{width:chapterRead(c)/requiredLessons(c).length*100+'%'}"></i></div></button></div></section></div>
<section class="howto"><div><span class="eyebrow">学习建议</span><h2>先看懂，再动手。</h2><p>不必赶进度。能换一组数据说清每一步，比记住一个答案更有用。</p></div><ol><li><b>01</b><div><strong>用例子理解概念</strong><span>从小输入开始，看清数据和目标。</span></div></li><li><b>02</b><div><strong>操作实验，追踪变化</strong><span>预测下一步，再观察变量和代码。</span></div></li><li><b>03</b><div><strong>独立练习，及时回顾</strong><span>答题后读反馈，用自己的话记一笔。</span></div></li></ol></section>
</main>
<JavaStarter v-else-if="view==='java'" :unit-id="'java-'+(parts[1]||'')" :progress="progress" :owner="owner" :disabled="cloud.state.initializing" @navigate="go" @prepared="markPrepared" @wrong="markWrong"/>
<ReviewPage v-else-if="view==='review'" :topic="parts[1]" :owner="owner" :today="today" :progress="progress" :disabled="cloud.state.initializing" @navigate="go" @complete="finishedVariant" @wrong="markWrong"/>
<BeginnerTrial v-else-if="view==='trial'" :owner="owner" @navigate="go"/>
<main v-else-if="view==='learn'||view==='boss'" class="learning-shell"><aside class="course-sidebar"><button class="back-map" @click="go('/')">← 回到课程目录</button><span class="eyebrow">第 {{String(chapter.id).padStart(2,'0')}} 章</span><h2>{{chapter.title}}</h2><p>{{chapter.subtitle}}</p><div class="lesson-nav"><button v-for="(l,i) in chapter.lessons" :key="l.id" :class="{selected:view==='learn'&&lessonIndex===i}" :aria-current="view==='learn'&&lessonIndex===i?'page':undefined" @click="go('/learn/'+chapter.id+'/'+i)"><b>{{progress.mastery.includes(l.id)?'✓':i+1}}</b><span>{{l.title}}<small v-if="l.optional">选学 · 不影响基础学习</small></span></button><button :class="{selected:view==='boss'}" :aria-current="view==='boss'?'page':undefined" @click="go('/boss/'+chapter.id)"><b>练</b><span>章节练习<br><small>{{chapter.boss.title}}</small></span></button></div><div class="side-tip"><strong>本章学习</strong><p>遇到不熟悉的词，可以在术语手册里查找。</p><button @click="go('/glossary')">打开术语手册 ↗</button></div></aside>
<article v-if="view==='learn'" class="lesson-content" :key="lesson.id" :data-lesson="lesson.id">
  <div class="breadcrumb">{{courseStages[chapter.world]}} / 第 {{chapter.id}} 章 / 小节 {{lessonIndex+1}} <span v-if="lesson.optional">· 选学</span></div>
  <div class="lesson-title"><div><span class="eyebrow">{{studyTime(lesson)}}</span><h1>{{lesson.title}}</h1></div></div>
  <div class="study-status" aria-label="本节学习状态"><span :class="{done:progress.lessons.includes(lesson.id)}">{{progress.lessons.includes(lesson.id)?'已阅读':'未记录阅读'}}</span><span :class="{done:lessonMastered}">{{lessonMastered?'基础练习通过':'待练习'}}</span><span :class="{done:lessonIndependent}">{{lessonIndependent?'变式已独立完成':'可挑战一道新题'}}</span></div>
  <nav class="lesson-outline" aria-label="本节目录"><button @click="jumpTo('lesson-story')">生活例子</button><button @click="jumpTo('lesson-concepts')">概念</button><button @click="jumpTo('lesson-experiment')">逐步实验</button><button @click="jumpTo('lesson-practice')">练习</button><button @click="jumpTo('lesson-challenge')">独立挑战</button></nav>
  <PrerequisitePanel :items="prior" :progress="progress" @navigate="go"/>
  <p v-if="lesson.optional" class="optional-note">这是进阶选学。先完成本章基础内容和练习也能闯关，熟练后可再回来学习。</p>
  <ChapterIntroduction :key="'intro-'+lesson.id" :intro="chapter.introduction" :chapter-id="chapter.id" :first="lessonIndex===0"/>
  <div id="lesson-story" class="study-anchor"><EverydayExample :example="lesson.learning.life"/></div>
  <LessonFoundation :unit="lesson.foundation"/>
  <NodeAnatomy v-if="lesson.id==='6-1'"/>
  <p id="lesson-experiment" class="experiment-bridge study-anchor"><strong>接下来在实验里看什么：</strong>{{lesson.learning.demo.explanation}}</p>
  <TraceLab v-if="TRACE_TYPES.includes(lesson.learning.demo.mode)" :key="lesson.id" :mode="lesson.learning.demo.mode" :initial="lesson.learning.demo.initial" :variant="lesson.learning.variant||''" :plain="true" :topic="lesson.id" :owner="owner" :code-available="canShowMethod"/>
  <Visualizer v-else :key="lesson.id" :type="lesson.learning.demo.mode" :topic="lesson.id" :owner="owner"/>
  <aside v-if="lesson.showCode||chapter.id===6" class="cost-note"><strong>时间和空间怎么数</strong><p>{{lesson.complexity}}</p></aside>
  <details v-if="canShowMethod" class="code-stage" data-study-place="code"><summary>{{lesson.learning.codeLabel||'理解了例子，再看 Java 实现'}} <span aria-hidden="true">⌄</span></summary><p class="code-bridge">{{lesson.learning.codeExplanation}}</p><CodeReader :guide-key="lesson.codeKey" :program="lesson.code" :filename="lesson.codeKey==='entry'?'Main.java':'Solution.java'"/></details>
  <details v-else-if="lesson.id==='2-3'" class="study-details"><summary>只看本节学过的比较写法</summary><pre class="study-code"><code>int a = 3;
int b = 5;
boolean equal = (a == b);</code></pre><p>先比较 a 与 b，得到 false，再把这个结果写给 equal。完整方法版在学过“方法与返回值”之后显示。</p><button @click="go(lessonRoute('2-4'))">学习方法与返回值 →</button></details>
  <p v-else class="code-later">{{lesson.learning.codeExplanation}}</p>
  <section v-if="lesson.foundation.links" class="related-problems"><h2>对应的力扣练习</h2><article v-for="link in lesson.foundation.links" :key="link.lc"><a :href="link.url" target="_blank" rel="noopener">LC {{link.lc}} · {{link.name}} ↗</a><p>{{link.focus}}</p><details v-if="link.lc===912"><summary>本节已学方法的完整答案</summary><CodeReader guide-key="merge" :program="codes.merge" title="LC 912 · 归并排序完整答案"/></details></article></section>
  <LessonPractice :key="owner+'-'+lesson.id" :owner="owner" :lesson="lesson" :mastered="lessonMastered" :disabled="cloud.state.initializing" @mastered="markMastered" @wrong="markWrong"/>
  <JavaWriteTask v-if="JAVA_TASKS[lesson.id]" :task="JAVA_TASKS[lesson.id]" :owner="owner" :topic="lesson.id"/>
  <details id="lesson-challenge" class="study-details study-anchor" data-study-place="challenge"><summary>独立小挑战 · 换一道题试试</summary><VariantPractice :topic="lesson.id" :owner="owner" :day="today" :disabled="cloud.state.initializing" @complete="finishedVariant({id:lesson.id,assisted:$event.assisted})" @wrong="markWrong"/></details>
  <div class="daily-lesson"><span>今天已记录 {{todayCount}} / {{goal}} 个学习任务{{signedToday?' · 已打卡':''}}</span><p>读完可以直接记录，练习稍后补做。预备课和复习也可以计入每日目标；同一小节当天只计一次。<button type="button" class="text-button" @click="go('/account')">查看或调整目标</button></p></div>
  <div class="lesson-actions"><button @click="go('/learn/'+chapter.id+'/'+Math.max(0,lessonIndex-1))" :disabled="lessonIndex===0">← 上一节</button><button @click="complete(false)" :disabled="cloud.state.initializing">只记录已读</button><button class="primary" @click="complete(true)" :disabled="cloud.state.initializing">记录阅读并继续 →</button></div>
  <LessonComments :lesson-id="lesson.id" :user="cloud.state.user" :service="props.commentsService" @login="cloud.signIn"/>
</article>
<ChapterExercise v-else :chapter="chapter" :progress="progress" :owner="owner" :completed="clearedBoss(chapter)" :disabled="cloud.state.initializing" @navigate="go" @complete="claim" @wrong="markWrong"/>
</main>
<main v-else-if="view==='account'||view==='login'" class="account-main"><AccountPanel :cloud="cloud" :progress="progress" :today="today" @continue="go(continuePath)" @goal="changeGoal"/></main>
<main v-else-if="view==='progress'" class="record-page"><span class="eyebrow">你的学习</span><h1>学习记录</h1><p class="page-lead">阅读、练习、独立挑战和私人笔记，都能在这里回看。</p><div class="study-actions record-shortcuts"><button class="primary" @click="go('/review')">复习与阶段练习{{dueCount?' · '+dueCount+' 项待做':''}} →</button><button @click="go('/java')">Java 预备课</button><button @click="go('/trial')">自愿参加零基础试学</button></div>
<div class="record-summary"><div><span class="eyebrow">基础阅读进度</span><strong>{{completion}}<small>%</small></strong><p>基础 {{coreRead}} / {{core.length}} 节 · 选学 {{electiveRead}} / {{electives.length}} 节</p><div class="reading-progress"><i :style="{width:completion+'%'}"></i></div></div><div class="record-metrics"><p><strong>{{progress.mastery.length}}</strong><span>小节练习通过</span></p><p><strong>{{allLessons.filter(l=>progress.learning.independent.includes(l.id)).length}}</strong><span>变式独立完成</span></p><p><strong>{{coreJava.filter(u=>progress.learning.prepared.includes(u.id)).length}} / {{coreJava.length}}</strong><span>Java 预备课已练</span></p></div></div>
<section class="chapter-record"><div class="section-heading"><h2>逐章进度</h2><button class="text-button" @click="go(continuePath)">继续学习 →</button></div><button v-for="c in chapters" :key="c.id" @click="go('/learn/'+c.id+'/0')"><span><b>{{String(c.id).padStart(2,'0')}}</b>{{c.title}}</span><small>{{chapterRead(c)}} / {{requiredLessons(c).length}} 节基础已读 · {{clearedBoss(c)?'章节练习已通过':'章节练习未完成'}} <span aria-hidden="true">→</span></small></button><p class="micro">历史完成记录和学习积分继续保留。当前 {{xp}} 积分，已完成 {{clearedCount}} / {{chapters.length}} 章综合练习。</p></section>
<NotesLibrary :notes="progress.notes" @navigate="go"/>
<section v-if="progress.bookmarks.length"><h2>以前收藏的知识点</h2><div class="saved-lessons"><button v-for="id in progress.bookmarks" :key="id" @click="go(lessonRoute(id))">{{findLesson(id)?.title}} <span aria-hidden="true">↗</span></button></div></section>
<section class="backup"><h2>备份学习记录</h2><p>{{cloud.state.user?'账号进度会自动同步到云端，也可以导出 JSON 作为额外备份。':'游客进度保存在当前浏览器。可以登录开启云端存档，或导出 JSON 备份。'}}</p><div class="backup-actions"><button @click="exportProgress">导出进度 JSON</button><label class="file-button">导入备份<input type="file" accept=".json,application/json" @change="importProgress"/></label></div></section></main>
<main v-else-if="view==='glossary'" class="glossary-page"><span class="eyebrow">术语查询</span><h1>术语手册</h1><p class="page-lead">遇到不熟悉的词，查一查含义，再用例子理解它。</p><label class="sr-only" for="glossary-search">搜索术语</label><input id="glossary-search" v-model="glossaryQuery" placeholder="搜索 int、返回值、队列……" type="search"/><div class="glossary-layout"><div class="term-list"><p v-if="!glossaryItems.length" class="empty-state" role="status">没有找到相关术语，试试更短的关键词。</p><button v-for="[k,t] in glossaryItems" :key="k" @click="term=k" :class="{selected:term===k}"><code>{{k}}</code><small>{{t[0]}}</small></button></div><aside v-if="termInfo" class="explanation-panel"><h2>{{term}}</h2><span class="eyebrow">{{termInfo[0]}}</span><p>{{termInfo[1]}}</p><pre>{{termInfo[2]}}</pre><p class="micro">具体变量名的用途，还要结合所在语句和题目一起看。</p></aside></div></main>
<PrivacyNotice v-else-if="view==='privacy'" @change="updateTraffic"/>
<main v-else class="record-page"><h1>没有找到这个页面</h1><p class="page-lead">可以回到课程目录，重新选择要学习的内容。</p><button @click="go('/')">回到课程目录</button></main>
</div>
<footer class="footer"><div class="footer-about"><span>算法之旅 / ALGO QUEST · {{dayText}}</span><p>仅为网站客流统计记录访问情况。<button class="footer-privacy" @click="go('/privacy')">隐私说明与统计设置</button></p></div><details><summary>课程参考与使用说明</summary><p>独立编写的入门讲解、图解和答案，知识组织参考 <a href="https://www.hello-algo.com/" target="_blank" rel="noopener">Hello 算法</a> 与 <a href="https://algo.itcharge.cn/" target="_blank" rel="noopener">算法通关手册</a>，语法参考 <a href="https://dev.java/learn/" target="_blank" rel="noopener">Java 官方教程</a>，可视化与即时练习的组织参考 <a href="https://visualgo.net/en/sorting/" target="_blank" rel="noopener">VisuAlgo</a> 与 <a href="https://opendsa.cs.vt.edu/" target="_blank" rel="noopener">OpenDSA</a>。本站讲解、题目与交互均重新编写。章末题保留力扣原题链接。图解为内置概念演示，网页不编译任意 Java。游客进度保存在当前浏览器；登录后可同步到账号。下载项目后也可以离线学习。</p></details></footer>
</div><LessonNotes v-if="view==='learn'" :key="'notes-'+(cloud.state.user?.id||'guest')+'-'+lesson.id" v-model="note" v-model:open="notesOpen" :lesson-title="lesson.title" :context-label="`第 ${chapter.id} 章 · 小节 ${lessonIndex+1}`" :user="cloud.state.user" :sync-status="cloud.state.syncStatus" :storage-o-k="storageOK" :initializing="cloud.state.initializing" :inert="drawerOpen" @modal-change="notesModalOpen=$event"/><ChapterDrawer v-if="hasChapterMenu" v-model:open="drawerOpen" :inert="notesModalOpen" :chapters="chapters" :chapter-id="chapter.id" :progress="progress" @navigate="go"/></div>
</template>
