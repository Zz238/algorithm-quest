<script setup>
import {ref,computed,watch,nextTick} from 'vue';
import {localDateKey,shiftDateKey,checkinStats,readingCount,readingLevel,DAILY_READING_TARGET} from '../logic.js';
const props=defineProps({progress:{type:Object,required:true},user:Object,today:{type:String,default:()=>localDateKey()}});
const emit=defineEmits(['continue']);
const selectedDate=ref(props.today),calendarScroll=ref(null);
const count=computed(()=>props.user?readingCount(props.progress,props.today):0);
const signedToday=computed(()=>props.progress.checkins.includes(props.today));
const completedCount=computed(()=>signedToday.value?DAILY_READING_TARGET:Math.min(count.value,DAILY_READING_TARGET));
const stats=computed(()=>checkinStats(props.progress.checkins,props.today));
const days=computed(()=>{
  const [y,m,d]=props.today.split('-').map(Number),offset=(new Date(y,m-1,d,12).getDay()+6)%7;
  const start=shiftDateKey(props.today,-(364+offset)),marked=new Set(props.progress.checkins);
  return Array.from({length:365+offset},(_,i)=>{const date=shiftDateKey(start,i),read=readingCount(props.progress,date);return {date,read,marked:marked.has(date),level:readingLevel(read,marked.has(date))};});
});
const months=computed(()=>{
  const labels=[];let previous='';
  for(let i=0;i<days.value.length;i+=7){const month=days.value[i].date.slice(0,7);if(month!==previous){labels.push({month,label:`${Number(month.slice(5))}月`,column:i/7+1});previous=month;}}
  return labels.filter((label,i)=>i!==0||!labels[i+1]||labels[i+1].column-label.column>=3);
});
const selected=computed(()=>days.value.find(day=>day.date===selectedDate.value));
const description=day=>`${day.date} · ${day.marked?'已打卡':'未打卡'}${day.read?' · 完成'+day.read+'个小节':''}`;
watch(()=>props.today,(day,previous)=>{if(selectedDate.value===previous)selectedDate.value=day;});
watch(()=>props.user?.id,()=>{selectedDate.value=props.today;});
watch(()=>props.today,async()=>{await nextTick();if(calendarScroll.value)calendarScroll.value.scrollLeft=calendarScroll.value.scrollWidth;},{immediate:true});
function calendarKey(event,index){
  const step={ArrowLeft:-7,ArrowRight:7,ArrowUp:-1,ArrowDown:1}[event.key];if(!step)return;
  event.preventDefault();const day=days.value[Math.max(0,Math.min(days.value.length-1,index+step))];selectedDate.value=day.date;
  nextTick(()=>document.getElementById(`calendar-${day.date}`)?.focus());
}
</script>
<template>
  <section class="reading-activity" aria-labelledby="reading-activity-title">
    <div class="activity-heading"><span class="eyebrow">每天完成4个不同小节</span><h2 id="reading-activity-title">阅读打卡</h2><p>登录后，每天累计完成 {{DAILY_READING_TARGET}} 个不同小节，自动点亮当天的格子。</p></div>
    <section class="today-card" aria-labelledby="today-title">
      <div class="today-copy"><span class="eyebrow">{{today}}</span><h3 id="today-title">{{signedToday?'今日已打卡':user?'今日进度':'登录后启用自动打卡'}}</h3>
        <p v-if="user">今日已完成 <strong>{{count}}</strong> 个不同小节 · {{signedToday?'今日已打卡 ✓':`还差 ${Math.max(0,DAILY_READING_TARGET-count)} 个小节`}}</p><p v-else>游客可以继续学习；登录后完成的小节会计入账号的每日打卡。</p>
        <div class="reading-progress" role="progressbar" aria-label="今日自动打卡进度" :aria-valuemin="0" :aria-valuemax="DAILY_READING_TARGET" :aria-valuenow="completedCount" :aria-valuetext="signedToday?'今日已打卡':`${count} / ${DAILY_READING_TARGET} 个小节`"><i :style="{width:(completedCount/DAILY_READING_TARGET*100)+'%'}"></i></div>
        <p class="micro">通过本节练习后，点击页面底部的“学完”记录完成。可跨章节累计，同一小节当天只计一次。</p>
        <div class="today-actions"><button @click="emit('continue')">{{user?'继续学习 →':'继续游客学习 →'}}</button><span v-if="signedToday" class="activity-complete">✓ 今天已打卡，无需手动操作</span></div>
      </div><div class="today-pixel" aria-hidden="true"><span>{{signedToday?'✓':Math.min(count,DAILY_READING_TARGET)+' / '+DAILY_READING_TARGET}}</span></div>
    </section>
    <section class="checkin-stats" aria-label="打卡统计"><article><strong>{{stats.current}}</strong><span>当前连续天数</span></article><article><strong>{{stats.total}}</strong><span>累计打卡天数</span></article><article><strong>{{stats.longest}}</strong><span>最长连续天数</span></article></section>
    <section class="calendar-card" aria-labelledby="calendar-title">
      <div class="calendar-title"><div><span class="eyebrow">最近一年</span><h3 id="calendar-title">最近一年的学习足迹</h3><p>每个格子代表一天。完成 4 个小节自动点亮；完成 8、12、16 个小节时，绿色逐渐加深。</p></div></div>
      <div class="calendar-layout"><div class="calendar-weekdays" aria-hidden="true"><span>一</span><span></span><span>三</span><span></span><span>五</span><span></span><span></span></div><div class="calendar-scroll" ref="calendarScroll"><div class="calendar-chart">
        <div class="calendar-months" aria-hidden="true"><span v-for="month in months" :key="month.month" :class="{'month-at-end':month.column>51}" :style="{gridColumn:`${month.column} / span ${Math.min(4,54-month.column)}`}">{{month.label}}</span></div>
        <div class="calendar-grid" role="grid" aria-label="最近一年的每日打卡，使用方向键切换日期"><button v-for="(day,i) in days" :id="`calendar-${day.date}`" :key="day.date" role="gridcell" :data-level="day.level" :class="{marked:day.marked,chosen:selectedDate===day.date,today:day.date===today}" :aria-selected="selectedDate===day.date" :aria-label="description(day)" :title="description(day)" :tabindex="selectedDate===day.date?0:-1" @click="selectedDate=day.date" @keydown="calendarKey($event,i)"></button></div>
      </div></div></div>
      <div class="calendar-legend" aria-label="未打卡、完成4个、8个、12个、16个及以上小节"><span>少</span><i v-for="level in [0,1,2,3,4]" :key="level" :data-level="level" :title="level===0?'未打卡':`完成 ${level*DAILY_READING_TARGET}${level===4?' 个及以上':' 个'}小节`"></i><span>多</span></div>
      <div class="calendar-detail" aria-live="polite"><strong>{{selectedDate}}</strong><span>{{selected?.marked?'已打卡 ✓':'未打卡'}}</span><span v-if="selected?.read">完成 {{selected.read}} 个小节</span><span v-if="selectedDate===today">今天</span></div>
      <p class="calendar-help">点击格子查看日期。每天只打卡一次，重复登录不会清空当天进度；今天尚未打卡时，连续天数按截至昨天计算。{{user?'打卡随当前账号自动保存与同步。':'历史游客记录仍保留在本机。'}}旧版打卡历史继续保留，可在角色记录中导出备份。</p>
    </section>
  </section>
</template>
