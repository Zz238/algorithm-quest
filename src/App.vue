<script setup>
import {ref,reactive,computed,watch,onUnmounted,onMounted,nextTick} from 'vue';
import {chapters,codes,requiredLessons,findLesson,lessonRoute} from './data/course';import {TERMS} from './data/terms';import {cleanProgress,experience,equalOutput,localDateKey,readingCount,completeLesson,DAILY_READING_TARGET} from './logic';
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
const allLessons=chapters.flatMap(c=>c.lessons),ids=allLessons.map(l=>l.id);
const props=defineProps({progressServices:Object,commentsService:Object});
function readRoute(){const path=location.hash.slice(1)||'/';if(path==='/checkin'){history.replaceState({},'',location.pathname+location.search+'#/account');return '/account';}return path;}
const route=ref(readRoute()),query=ref(''),notice=ref('');
const {progress,storageOK,cloud}=useCloudProgress(ids,props.progressServices);
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
const bossDemo=computed(()=>({1480:'prefix',2235:'function',1342:'reduce',704:'binary',1051:'bubble',20:'stack',1:'twoSum',78:'backtrack',104:'treeBfs',733:'flood',70:'dp',121:'stock'}[boss.value.lc]));
const xp=computed(()=>experience(progress));
const courseGroups=computed(()=>[0,1,2,3].map(i=>({index:i,chapters:chapters.filter(c=>c.world===i)})));
const filtered=computed(()=>query.value.trim()?allLessons.filter(l=>(l.title+l.concept+l.trap).toLowerCase().includes(query.value.trim().toLowerCase())):[]);
function clearedBoss(c){return progress.bosses.includes(c.id)&&(c.id!==5||progress.bossTasks[5]===1051);}
const clearedCount=computed(()=>chapters.filter(clearedBoss).length);
const continuePath=computed(()=>{const nextLesson=allLessons.find(l=>!l.optional&&(!progress.mastery.includes(l.id)||!progress.lessons.includes(l.id)));if(nextLesson)return lessonRoute(nextLesson.id);return '/progress';});
const resumeTitle=computed(()=>{const [page,id,index]=continuePath.value.split('/').filter(Boolean),c=chapters.find(c=>c.id===Number(id));return page==='learn'?c?.lessons[Number(index)]?.title:'基础路线已完成，回顾你的学习记录。';});
const lessonMastered=computed(()=>progress.mastery.includes(lesson.value.id));
const codeReady=computed(()=>!boss.value.codePrerequisiteChapters||boss.value.codePrerequisiteChapters.every(id=>requiredLessons(chapters.find(c=>c.id===id)).every(l=>progress.mastery.includes(l.id))));
function markMastered(id){if(!progress.mastery.includes(id)){progress.mastery.push(id);toast('本节三道练习已通过，可以记录学习并继续。');}}
function chapterReady(c){return requiredLessons(c).every(l=>progress.lessons.includes(l.id)&&progress.mastery.includes(l.id));}

const todayReadCount=computed(()=>cloud.state.user?readingCount(progress,today.value):0);
const signedToday=computed(()=>progress.checkins.includes(today.value));
const navigating=ref(false),pageContent=ref(null);
const reducedMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function alignLessonNavigation(){
 const nav=document.querySelector('.lesson-nav'),selected=nav?.querySelector('[aria-current="page"]');
 if(!nav||!selected||nav.scrollWidth<=nav.clientWidth)return;
 const left=selected.getBoundingClientRect().left-nav.getBoundingClientRect().left+nav.scrollLeft-(nav.clientWidth-selected.clientWidth)/2;
 nav.scrollTo({left,behavior:reducedMotion()?'instant':'smooth'});
}
onMounted(()=>nextTick(alignLessonNavigation));
async function focusPage(){
 window.scrollTo({top:0,behavior:'instant'});
 await nextTick();pageContent.value?.focus({preventScroll:true});alignLessonNavigation();
}
const navigation=createNavigation({current:()=>route.value,reducedMotion,pending:value=>navigating.value=value,commit:path=>{
 route.value=path;location.hash=path;query.value='';focusPage();
}});
function go(path){navigation.request(path==='/checkin'?'/account':path);}
function onHash(){const path=readRoute();if(path===route.value)return;navigation.cancel();route.value=path;query.value='';focusPage();}
window.addEventListener('hashchange',onHash);
onUnmounted(()=>{navigation.cancel();window.removeEventListener('hashchange',onHash);});
function browseCatalog(){document.getElementById('course-catalog')?.scrollIntoView({behavior:reducedMotion()?'instant':'smooth',block:'start'});}
const completion=computed(()=>Math.round(progress.lessons.length/allLessons.length*100));
const chapterRead=c=>c.lessons.filter(l=>progress.lessons.includes(l.id)).length;
const courseStages=['建立编程基础','掌握数据结构','理解常用思路','练习独立解题'];
function toast(s){notice.value=s;setTimeout(()=>notice.value='',3500)}
function complete(){
 if(cloud.state.initializing)return;
 refreshDay();const result=completeLesson(progress,lesson.value.id,today.value,!!cloud.state.user);
 if(!result.ok){toast('先通过本节的三道练习，再记录学完。');return;}
 if(result.checkedIn)toast('今日已完成4个不同小节，自动打卡成功！');
 else if(cloud.state.user)toast(result.newReading?`${result.isNew?'小节已学完。':'已记录今日阅读。'}今日已完成 ${result.count} 个小节${signedToday.value?'，继续加深今天的绿色。':`，再完成 ${Math.max(0,DAILY_READING_TARGET-result.count)} 个自动打卡。`}`:'本节今天已经记录过，不重复计数。');
 else toast(result.isNew?'小节已学完，进度已保存。登录后可开启每日自动打卡。':'学习记录已保存在本机。登录后可开启每日自动打卡。');
 const next=chapter.value.lessons[lessonIndex.value+1];if(next&&!next.optional)go(`/learn/${chapter.value.id}/${lessonIndex.value+1}`);else go(`/boss/${chapter.value.id}`);
}
watch(()=>cloud.state.user?.id,id=>{if(id&&view.value==='login')go('/account');});

const note=computed({get:()=>progress.notes[lesson.value.id]||'',set:v=>progress.notes[lesson.value.id]=v.slice(0,5000)});
const practice=reactive({answers:['',''],checked:[false,false],feedback:['',''],pick:-1,pickChecked:false,hints:0,solution:false});
watch([()=>chapter.value.id,()=>cloud.state.user?.id],()=>{Object.assign(practice,{answers:['',''],checked:[false,false],feedback:['',''],pick:-1,pickChecked:false,hints:0,solution:false})});
const learnedChapter=computed(()=>chapterReady(chapter.value));
const battleReady=computed(()=>learnedChapter.value&&practice.checked.every(Boolean)&&practice.pickChecked);
function checkCase(i){let output;try{output=JSON.parse(practice.answers[i]);}catch{practice.feedback[i]='请用 JSON 格式：数字直接写，真假写 true/false，数组用方括号。';practice.checked[i]=false;return;}
 const ok=equalOutput(output,boss.value.cases[i].output,boss.value.lc);practice.checked[i]=ok;practice.feedback[i]=ok?'正确。再说一说你是怎样一步步得到它的。':'还没对上。把中间状态写出来，或展开下一层提示再试。';}
function checkChoice(){practice.pickChecked=practice.pick===boss.value.correct;toast(practice.pickChecked?'思路检查通过。':'再想想关键状态和更新顺序，可以回看本章对应小节。');}
function claim(){if(!battleReady.value||clearedBoss(chapter.value))return;const rewarded=progress.bosses.includes(chapter.value.id);if(!rewarded)progress.bosses.push(chapter.value.id);progress.bossTasks[chapter.value.id]=boss.value.lc;toast(rewarded?'章节练习已通过，完成记录已保存。':`第 ${chapter.value.id} 章练习已完成，进度已保存。`);}

function exportProgress(){download('algo-quest-progress.json',JSON.stringify({...progress,exportedAt:new Date().toISOString()},null,2),'application/json')}
function download(name,text,type='text/plain'){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
async function importProgress(e){const file=e.target.files?.[0];if(!file)return;try{if(file.size>1000000)throw Error('文件过大');const targetAccount=cloud.state.user?.id||'guest',text=await file.text();if(targetAccount!==(cloud.state.user?.id||'guest')){toast('账号已切换，请在当前账号重新选择备份。');e.target.value='';return;}const p=cleanProgress(JSON.parse(text),ids);progress.lessons=[...new Set([...progress.lessons,...p.lessons])];progress.mastery=[...new Set([...progress.mastery,...p.mastery])];for(const [id,lc] of Object.entries(p.bossTasks))if(!progress.bossTasks[id]||lc===chapters.find(c=>c.id===Number(id))?.boss.lc)progress.bossTasks[id]=lc;progress.bosses=[...new Set([...progress.bosses,...p.bosses])];progress.bookmarks=[...new Set([...progress.bookmarks,...p.bookmarks])];progress.notes={...p.notes,...progress.notes};progress.checkins=[...new Set([...progress.checkins,...p.checkins])].sort();for(const [day,items] of Object.entries(p.dailyRead))progress.dailyRead[day]=[...new Set([...(progress.dailyRead[day]||[]),...items])];toast('已合并备份，保留当前进度、笔记和打卡记录。')}catch{toast('未导入：请使用本站导出的有效进度 JSON。')}e.target.value='';}
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
<div :key="route" ref="pageContent" class="page-content" :class="{'is-navigating':navigating}" tabindex="-1">
<main v-if="view==='home'" class="home">
<section class="hero" aria-labelledby="home-title">
  <div class="hero-intro"><span class="eyebrow">Java · 数据结构 · 算法</span><h1 id="home-title">从基础开始，<br>读懂算法的<span>每一步。</span></h1><p>一套面向零基础的学习路径。从第一个变量，<br class="desktop-break">到独立推演、理解代码，再自己解决问题。</p><button class="text-button" @click="browseCatalog">浏览全部课程 <span aria-hidden="true">↓</span></button></div>
  <aside class="hero-next" aria-labelledby="resume-title"><div class="resume-top"><span>{{progress.lessons.length?'接着上次的进度':'开始第一节课'}}</span><span class="resume-percentage">{{completion}}%</span></div><div class="reading-progress" role="progressbar" aria-label="课程阅读进度" :aria-valuenow="progress.lessons.length" :aria-valuemin="0" :aria-valuemax="allLessons.length"><i :style="{width:completion+'%'}"></i></div><h2 id="resume-title">{{resumeTitle}}</h2><p>先读讲解，再动手推演。每节约 12–20 分钟，可以按自己的节奏学习。</p><button class="primary start" :aria-busy="navigating" @click="go(continuePath)">{{progress.lessons.length?'继续学习':'开始学习'}} <span aria-hidden="true">→</span></button><small>已读 {{progress.lessons.length}} / {{allLessons.length}} 节 · 练习通过 {{progress.mastery.length}} 节</small></aside>
</section>
<div class="course-facts" aria-label="课程概况"><span><strong>12</strong> 章循序渐进</span><span><strong>72</strong> 节详细讲解</span><span><strong>216</strong> 道配套练习</span><span>逐条演示 <span aria-hidden="true">→</span> 逐行理解 <span aria-hidden="true">→</span> 独立练习</span></div>
<section class="search-block" id="course-catalog"><div><span class="eyebrow">学习路径</span><h2>课程目录</h2><p class="muted">按顺序打好基础，选学内容留到熟练后再看。</p></div><label class="search-field"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg><span class="sr-only">搜索知识点</span><input v-model="query" type="search" placeholder="搜索知识点，如：数组、二分"/></label></section>
<div v-if="query.trim()" class="search-results" role="region" aria-label="课程搜索结果"><p class="search-count" role="status">{{filtered.length?`找到 ${filtered.length} 个相关小节`:'没有找到相关小节，试试更短的词。'}}</p><button v-for="l in filtered" :key="l.id" @click="go(lessonRoute(l.id))"><strong>{{l.title}}</strong><span>{{l.concept}}</span><span class="search-arrow" aria-hidden="true">→</span></button></div>
<div v-else class="course-path"><section v-for="w in courseGroups" :key="w.index" class="course-group"><header class="course-group-heading"><span class="stage-number">{{String(w.index+1).padStart(2,'0')}}</span><div><span class="eyebrow">阶段 {{w.index+1}}</span><h3>{{courseStages[w.index]}}</h3><p>第 {{w.chapters[0].id}}–{{w.chapters.at(-1).id}} 章</p></div></header><div class="chapter-grid"><button v-for="c in w.chapters" :key="c.id" class="chapter-card" @click="go('/learn/'+c.id+'/0')"><div class="chapter-card-top"><span>第 {{String(c.id).padStart(2,'0')}} 章</span><span aria-hidden="true">↗</span></div><span class="chapter-card-title">{{c.title}}</span><p>{{c.subtitle}}</p><div class="chapter-card-bottom"><span>{{chapterRead(c)}} / {{c.lessons.length}} 小节已读</span><span v-if="chapterRead(c)===c.lessons.length" class="completed-label">已读完</span></div><div class="chapter-progress" aria-hidden="true"><i :style="{width:chapterRead(c)/c.lessons.length*100+'%'}"></i></div></button></div></section></div>
<section class="howto"><div><span class="eyebrow">学习建议</span><h2>先看懂，再动手。</h2><p>不必赶进度。能换一组数据说清每一步，比记住一个答案更有用。</p></div><ol><li><b>01</b><div><strong>用例子理解概念</strong><span>从小输入开始，看清数据和目标。</span></div></li><li><b>02</b><div><strong>操作实验，追踪变化</strong><span>预测下一步，再观察变量和代码。</span></div></li><li><b>03</b><div><strong>独立练习，及时回顾</strong><span>答题后读反馈，用自己的话记一笔。</span></div></li></ol></section>
</main>
<main v-else-if="view==='learn'||view==='boss'" class="learning-shell"><aside class="course-sidebar"><button class="back-map" @click="go('/')">← 回到课程目录</button><span class="eyebrow">第 {{String(chapter.id).padStart(2,'0')}} 章</span><h2>{{chapter.title}}</h2><p>{{chapter.subtitle}}</p><div class="lesson-nav"><button v-for="(l,i) in chapter.lessons" :key="l.id" :class="{selected:view==='learn'&&lessonIndex===i}" :aria-current="view==='learn'&&lessonIndex===i?'page':undefined" @click="go('/learn/'+chapter.id+'/'+i)"><b>{{progress.mastery.includes(l.id)?'✓':i+1}}</b><span>{{l.title}}<small v-if="l.optional">选学 · 不影响基础学习</small></span></button><button :class="{selected:view==='boss'}" :aria-current="view==='boss'?'page':undefined" @click="go('/boss/'+chapter.id)"><b>练</b><span>章节练习<br><small>{{chapter.boss.title}}</small></span></button></div><div class="side-tip"><strong>本章学习</strong><p>遇到不熟悉的词，可以在术语手册里查找。</p><button @click="go('/glossary')">打开术语手册 ↗</button></div></aside>
<article v-if="view==='learn'" class="lesson-content" :key="lesson.id" :data-lesson="lesson.id">
  <div class="breadcrumb">{{courseStages[chapter.world]}} / 第 {{chapter.id}} 章 / 小节 {{lessonIndex+1}} <span v-if="lesson.optional">· 选学</span></div>
  <div class="lesson-title"><div><span class="eyebrow">建议 12～20 分钟</span><h1>{{lesson.title}}</h1></div></div>
  <div v-if="lesson.prerequisiteIds.length" class="prerequisite-links"><strong>先回顾</strong><button v-for="id in lesson.prerequisiteIds" :key="id" @click="go(lessonRoute(id))">{{findLesson(id)?.title}} ↗</button></div>
  <p v-if="lesson.optional" class="optional-note">这是进阶选学。先完成本章基础内容和练习也能闯关，熟练后可再回来学习。</p>
  <ChapterIntroduction :key="'intro-'+lesson.id" :intro="chapter.introduction" :chapter-id="chapter.id" :first="lessonIndex===0"/>
  <EverydayExample :example="lesson.learning.life"/>
  <LessonFoundation :unit="lesson.foundation"/>
  <NodeAnatomy v-if="lesson.id==='6-1'"/>
  <p class="experiment-bridge"><strong>接下来在实验里看什么：</strong>{{lesson.learning.demo.explanation}}</p>
  <TraceLab v-if="TRACE_TYPES.includes(lesson.learning.demo.mode)" :key="lesson.id" :mode="lesson.learning.demo.mode" :initial="lesson.learning.demo.initial" :variant="lesson.learning.variant||''" :plain="true"/>
  <Visualizer v-else :key="lesson.id" :type="lesson.learning.demo.mode"/>
  <aside v-if="lesson.showCode||chapter.id===6" class="cost-note"><strong>时间和空间怎么数</strong><p>{{lesson.complexity}}</p></aside>
  <details v-if="lesson.showCode" class="code-stage"><summary>{{lesson.learning.codeLabel||'理解了例子，再看 Java 实现'}} <span aria-hidden="true">⌄</span></summary><p class="code-bridge">{{lesson.learning.codeExplanation}}</p><CodeReader :guide-key="lesson.codeKey" :program="lesson.code" :filename="lesson.codeKey==='entry'?'Main.java':'Solution.java'"/></details>
  <p v-else class="code-later">{{lesson.learning.codeExplanation}}</p>
  <section v-if="lesson.foundation.links" class="related-problems"><h2>对应的力扣练习</h2><article v-for="link in lesson.foundation.links" :key="link.lc"><a :href="link.url" target="_blank" rel="noopener">LC {{link.lc}} · {{link.name}} ↗</a><p>{{link.focus}}</p><details v-if="link.lc===912"><summary>本节已学方法的完整答案</summary><CodeReader guide-key="merge" :program="codes.merge" title="LC 912 · 归并排序完整答案"/></details></article></section>
  <LessonPractice :key="'practice-'+(cloud.state.user?.id||'guest')+'-'+lesson.id" :lesson="lesson" :mastered="lessonMastered" @mastered="markMastered"/>
  <div class="daily-lesson"><span>{{cloud.state.user?`今日阅读 · ${todayReadCount} 个小节${signedToday?' · 已打卡 ✓':` / ${DAILY_READING_TARGET} 个自动打卡`}`:'登录后，每天完成4个不同小节可自动打卡'}}</span><p>{{lessonMastered?'本节练习已通过，点击下方按钮记录学完。':'请先通过上面的三道练习，再点击学完。'}}{{cloud.state.user?'可跨章节累计，同一小节当天只计一次。':'游客学习记录仍保存在当前浏览器。'}}</p></div>
  <div class="lesson-actions"><button @click="go('/learn/'+chapter.id+'/'+Math.max(0,lessonIndex-1))" :disabled="lessonIndex===0">← 上一节</button><button class="primary" @click="complete" :disabled="!lessonMastered||cloud.state.initializing">{{progress.lessons.includes(lesson.id)?'记录今日阅读并继续':'记录学完'}} {{chapter.lessons[lessonIndex+1]&&!chapter.lessons[lessonIndex+1].optional?'→ 下一节':'→ 章节练习'}}</button></div>
  <LessonComments :lesson-id="lesson.id" :user="cloud.state.user" :service="props.commentsService" @login="cloud.signIn"/>
</article>
<article v-else-if="!learnedChapter" class="boss-content"><div class="breadcrumb">{{courseStages[chapter.world]}} / 第 {{chapter.id}} 章 / 章节综合练习</div><section class="boss-section"><span class="eyebrow">完成基础学习后解锁</span><h1>章节练习尚未解锁</h1><p>完成本章基础小节及其配套练习后，即可挑战「{{boss.title}}」。</p><p>基础练习通过：{{requiredLessons(chapter).filter(l=>progress.mastery.includes(l.id)).length}} / {{requiredLessons(chapter).length}} 小节</p><button class="primary" @click="go('/learn/'+chapter.id+'/'+Math.max(0,chapter.lessons.findIndex(l=>!l.optional&&(!progress.lessons.includes(l.id)||!progress.mastery.includes(l.id)))))">继续本章学习 →</button></section></article>
<article v-else class="boss-content" :key="chapter.id" :data-chapter="chapter.id"><div class="breadcrumb">{{courseStages[chapter.world]}} / 第 {{chapter.id}} 章 / 章节综合练习</div><div class="boss-heading"><div><span class="eyebrow">章节练习 · LC {{boss.lc}}</span><h1>{{boss.title}}</h1><p>{{clearedBoss(chapter)?'这一章的练习已经完成，可以随时回来复习。':'用这一章学到的知识，试着独立解决一次。'}}</p></div><span class="reward">{{boss.difficulty}}</span></div>
<div v-if="cloud.state.user&&signedToday" class="daily-ready"><div><strong>今日已打卡</strong><p>继续学习可以加深今天的绿色，同一天不会重复打卡。</p></div><button @click="go('/account')">查看学习足迹 →</button></div>
<section class="boss-section"><div class="section-bar"><h2>01 / 读懂题目</h2><a :href="boss.url" target="_blank" rel="noopener">力扣原题 LC {{boss.lc}} ↗</a></div><p>{{boss.description}}</p><p class="micro">以下是重新编写的中文学习说明，原题要求以链接为准。</p><div class="prerequisite-links"><strong>本题已学前置</strong><button v-for="id in boss.review" :key="id" @click="go(lessonRoute(id))">{{findLesson(id)?.title}} ↗</button></div><div class="relation"><h3>它与这一章有什么关系？</h3><ul><li v-for="r in boss.relation">{{r}}</li></ul></div></section>
<section class="boss-section"><h2>02 / 自己走一遍</h2><p>先不用写一整段程序。根据输入，算出输出，再回答思路问题。这里检查你的结果与理解；网页不会编译 Java。</p><div class="case-grid"><article v-for="(c,i) in boss.cases" :key="i" class="test-case"><h3>情境 {{i+1}}</h3><pre>{{JSON.stringify(c.input,null,2)}}</pre><label>你的输出（JSON）<textarea v-model="practice.answers[i]" @input="practice.checked[i]=false" :placeholder="typeof c.output==='number'?'例如：3':typeof c.output==='boolean'?'例如：true':'例如：[1,2,3]'" :aria-label="`情境 ${i+1} 输出`"></textarea></label><button @click="checkCase(i)">{{practice.checked[i]?'✓ 已答对':'检查结果'}}</button><p class="case-feedback" aria-live="polite">{{practice.feedback[i]}}</p></article></div><div class="choice-question"><h3>{{boss.question}}</h3><div><button v-for="(o,i) in boss.options" :key="o" :aria-pressed="practice.pick===i" :class="{selected:practice.pick===i}" @click="practice.pick=i;practice.pickChecked=false"><b>{{'ABC'[i]}}</b>{{o}}</button></div><button @click="checkChoice" :disabled="practice.pick<0">{{practice.pickChecked?'✓ 思路检查通过':'检查思路'}}</button></div>
<div class="hint-box"><button @click="practice.hints=Math.min(boss.hints.length,practice.hints+1)" :disabled="practice.hints===boss.hints.length">{{practice.hints===boss.hints.length?'提示已全部展开':'卡住了，给我下一层提示'}} {{practice.hints}} / {{boss.hints.length}}</button><p v-for="(h,i) in boss.hints.slice(0,practice.hints)"><b>提示 {{i+1}}</b> {{h}}</p></div></section>
<section class="boss-section solution"><div class="section-bar"><h2>03 / 详细题解与完整答案</h2><button @click="practice.solution=!practice.solution">{{practice.solution?'收起题解 ↑':'展开题解 ↓'}}</button></div><p v-if="!practice.solution" class="muted">先试着说说你会保留什么状态、每次怎样改变。想清楚再来核对。</p><div v-else><h3>按这几步做</h3><ol class="solution-steps"><li v-for="(s,i) in boss.approach"><b>{{String(i+1).padStart(2,'0')}}</b><span>{{s}}</span></li></ol><TraceLab v-if="TRACE_TYPES.includes(bossDemo)" :key="'boss-'+boss.lc" :mode="bossDemo" :variant="boss.codeKey==='stairs'?'rolling':''" :plain="chapter.id===1"/><Visualizer v-else :type="bossDemo"/><h3>为什么这样做是对的？</h3><p>{{boss.proof}}</p><h3>复杂度</h3><p>{{boss.complexity}}</p><h3>这几处要特别留意</h3><ul><li v-for="p in boss.pitfalls">{{p}}</li></ul><div class="case-answer"><h3>情境的完整答案</h3><div v-for="(c,i) in boss.cases"><b>{{i+1}}.</b><code>{{JSON.stringify(c.output)}}</code></div></div><CodeReader v-if="codeReady" :guide-key="boss.codeKey" :program="boss.code" :title="'完整 Java 答案 · LC '+boss.lc"/><div v-if="!codeReady" class="code-later"><p>这一章先练自然语言步骤与累计结果。完整Java答案将在通过第2、3章基础练习后显示，避免提前要求你理解数组循环语法。</p><button @click="go(lessonRoute('2-1'))">去第2章学习Java基础 →</button></div><p class="micro">可复制到力扣对应题目的 Java 编辑区提交。Solution 是平台调用的类；树题的 TreeNode 由平台提供。本项目也附有可独立编译的答案验证文件。</p></div></section>
<section class="clear-chapter"><div><h2>{{clearedBoss(chapter)?'本章练习已完成 ✓':'完成本章综合练习'}}</h2><p>学完 {{requiredLessons(chapter).length}} 节基础学习及练习、答对 2 个输出、通过 1 个思路问题，即可保存本章完成记录。</p><div class="checklist"><span>{{learnedChapter?'✓':'○'}} {{requiredLessons(chapter).length}} 节基础学习与练习</span><span>{{practice.checked.every(Boolean)?'✓':'○'}} 两个输出</span><span>{{practice.pickChecked?'✓':'○'}} 思路检查</span></div></div><button class="primary" @click="claim" :disabled="!battleReady||clearedBoss(chapter)">{{clearedBoss(chapter)?'已记录完成':'记录本章完成'}}</button><button v-if="!learnedChapter" @click="go('/learn/'+chapter.id+'/0')">返回本章学习</button><button v-if="clearedBoss(chapter)&&chapter.id<chapters.length" @click="go('/learn/'+(chapter.id+1)+'/0')">去下一章 →</button></section>
</article></main>
<main v-else-if="view==='account'||view==='login'" class="account-main"><AccountPanel :cloud="cloud" :progress="progress" :today="today" @continue="go(continuePath)"/></main>
<main v-else-if="view==='progress'" class="record-page"><span class="eyebrow">你的学习</span><h1>学习记录</h1><p class="page-lead">把读过的内容、完成的练习和想再看的知识点留在这里。</p>
<div class="record-summary"><div><span class="eyebrow">课程完成度</span><strong>{{completion}}<small>%</small></strong><p>已读 {{progress.lessons.length}} / {{allLessons.length}} 节</p><div class="reading-progress"><i :style="{width:completion+'%'}"></i></div></div><div class="record-metrics"><p><strong>{{progress.mastery.length}}</strong><span>小节练习通过</span></p><p><strong>{{progress.bookmarks.length}}</strong><span>收藏的知识点</span></p><p><strong>{{Object.values(progress.notes).filter(n=>n.trim()).length}}</strong><span>篇学习笔记</span></p></div></div>
<section class="chapter-record"><div class="section-heading"><h2>逐章进度</h2><button class="text-button" @click="go(continuePath)">继续学习 →</button></div><button v-for="c in chapters" :key="c.id" @click="go('/learn/'+c.id+'/0')"><span><b>{{String(c.id).padStart(2,'0')}}</b>{{c.title}}</span><small>{{chapterRead(c)}} / {{c.lessons.length}} 节已读 · {{clearedBoss(c)?'章节练习已通过':'章节练习未完成'}} <span aria-hidden="true">→</span></small></button><p class="micro">历史完成记录和学习积分继续保留。当前 {{xp}} 积分，已完成 {{clearedCount}} / {{chapters.length}} 章综合练习。</p></section>
<section><h2>收藏的知识点</h2><p v-if="!progress.bookmarks.length" class="empty-state">暂无收藏的知识点。</p><div class="saved-lessons"><button v-for="id in progress.bookmarks" :key="id" @click="go(lessonRoute(id))">{{findLesson(id)?.title}} <span aria-hidden="true">↗</span></button></div></section>
<section class="backup"><h2>备份学习记录</h2><p>{{cloud.state.user?'账号进度会自动同步到云端，也可以导出 JSON 作为额外备份。':'游客进度保存在当前浏览器。可以登录开启云端存档，或导出 JSON 备份。'}}</p><div class="backup-actions"><button @click="exportProgress">导出进度 JSON</button><label class="file-button">导入备份<input type="file" accept=".json,application/json" @change="importProgress"/></label></div></section></main>
<main v-else-if="view==='glossary'" class="glossary-page"><span class="eyebrow">术语查询</span><h1>术语手册</h1><p class="page-lead">遇到不熟悉的词，查一查含义，再用例子理解它。</p><label class="sr-only" for="glossary-search">搜索术语</label><input id="glossary-search" v-model="glossaryQuery" placeholder="搜索 int、返回值、队列……" type="search"/><div class="glossary-layout"><div class="term-list"><p v-if="!glossaryItems.length" class="empty-state" role="status">没有找到相关术语，试试更短的关键词。</p><button v-for="[k,t] in glossaryItems" :key="k" @click="term=k" :class="{selected:term===k}"><code>{{k}}</code><small>{{t[0]}}</small></button></div><aside v-if="termInfo" class="explanation-panel"><h2>{{term}}</h2><span class="eyebrow">{{termInfo[0]}}</span><p>{{termInfo[1]}}</p><pre>{{termInfo[2]}}</pre><p class="micro">具体变量名的用途，还要结合所在语句和题目一起看。</p></aside></div></main>
<PrivacyNotice v-else-if="view==='privacy'" @change="updateTraffic"/>
<main v-else class="record-page"><h1>没有找到这个页面</h1><p class="page-lead">可以回到课程目录，重新选择要学习的内容。</p><button @click="go('/')">回到课程目录</button></main>
</div>
<footer class="footer"><div class="footer-about"><span>算法之旅 / ALGO QUEST · {{dayText}}</span><p>仅为网站客流统计记录访问情况。<button class="footer-privacy" @click="go('/privacy')">隐私说明与统计设置</button></p></div><details><summary>课程参考与使用说明</summary><p>独立编写的入门讲解、图解和答案，知识组织参考 <a href="https://www.hello-algo.com/" target="_blank" rel="noopener">Hello 算法</a> 与 <a href="https://algo.itcharge.cn/" target="_blank" rel="noopener">算法通关手册</a>，语法参考 <a href="https://dev.java/learn/" target="_blank" rel="noopener">Java 官方教程</a>，可视化与即时练习的组织参考 <a href="https://visualgo.net/en/sorting/" target="_blank" rel="noopener">VisuAlgo</a> 与 <a href="https://opendsa.cs.vt.edu/" target="_blank" rel="noopener">OpenDSA</a>。本站讲解、题目与交互均重新编写。章末题保留力扣原题链接。图解为内置概念演示，网页不编译任意 Java。游客进度保存在当前浏览器；登录后可同步到账号。下载项目后也可以离线学习。</p></details></footer>
</div><LessonNotes v-if="view==='learn'" :key="'notes-'+(cloud.state.user?.id||'guest')+'-'+lesson.id" v-model="note" v-model:open="notesOpen" :lesson-title="lesson.title" :context-label="`第 ${chapter.id} 章 · 小节 ${lessonIndex+1}`" :user="cloud.state.user" :sync-status="cloud.state.syncStatus" :storage-o-k="storageOK" :initializing="cloud.state.initializing" :inert="drawerOpen" @modal-change="notesModalOpen=$event"/><ChapterDrawer v-if="hasChapterMenu" v-model:open="drawerOpen" :inert="notesModalOpen" :chapters="chapters" :chapter-id="chapter.id" :progress="progress" @navigate="go"/></div>
</template>
