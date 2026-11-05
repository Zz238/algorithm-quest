import {JAVA_BY_ID,javaRoute} from './java-starter.js';

// Links name the capabilities used here, rather than just the preceding page.
const needs={
 '1-1':[], '1-2':['1-1'], '1-5':['1-1','1-2'], '1-3':['1-2','1-5'], '1-4':['1-5'], '1-6':['1-4'],
 '2-1':['java-print','1-5'], '2-2':['java-variable','1-5'], '2-3':['2-2','java-condition'], '2-4':['java-method','2-2'], '2-5':['1-2','java-array'], '2-6':['2-4','2-2'],
 '3-1':['2-3','java-condition'], '3-2':['2-5','java-for','1-4'], '3-3':['3-1','java-while'], '3-5':['3-2','2-5'], '3-4':['3-3','1-5'], '3-6':['3-1','3-4'],
 '4-1':['2-5','3-2'], '4-5':['3-5','4-1'], '4-6':['4-1','java-reference'], '4-2':['java-string','3-3','4-5'], '4-3':['4-1','3-2','2-4'], '4-4':['4-3','3-3'],
 '5-5':['4-6','1-6'], '5-6':['4-6','2-2'], '5-1':['5-6','3-5','java-two-loops'], '5-2':['4-6','5-5','3-3'], '5-3':['5-1','5-2'], '5-4':['4-6','5-1'],
 '6-5':['java-reference','4-6'], '6-1':['java-object','6-5'], '6-2':['6-1','4-6'], '6-3':['java-list','1-5'], '6-4':['6-3','java-list'], '6-6':['6-3','java-string','3-2'],
 '7-1':['java-list','4-3'], '7-2':['7-1','1-4','3-2'], '7-5':['7-1','4-3'], '7-3':['7-1','4-3','3-2'], '7-4':['7-1','4-3'], '7-6':['7-3','1-6'],
 '8-1':['2-4','java-call-stack','3-3'], '8-5':['8-1','6-3'], '8-2':['8-1','5-5','4-6'], '8-3':['8-5','java-list','6-5'], '8-4':['8-3','3-2'], '8-6':['8-1','5-6','4-2'],
 '9-5':['6-1','6-5'], '9-1':['9-5','8-1'], '9-2':['9-5','8-5'], '9-6':['9-5','6-4','3-2'], '9-3':['9-5','4-4'], '9-4':['9-5','6-4'],
 '10-1':['9-5','6-1'], '10-5':['10-1','java-grid'], '10-2':['10-5','6-4','7-5'], '10-6':['10-5','8-5','7-5'], '10-3':['10-2','java-grid'], '10-4':['10-5','9-4','4-1'],
 '11-1':['1-6','3-6'], '11-2':['java-last-step','4-1','3-2'], '11-3':['11-2','8-1','7-2'], '11-5':['11-2','5-6'], '11-6':['11-2','11-3','11-5'], '11-4':['11-2','3-2','4-6'],
 '12-1':['1-1','1-6'], '12-5':['12-1','java-two-loops'], '12-2':['12-5','1-4'], '12-3':['12-2','1-6'], '12-4':['12-2','12-3','2-6'], '12-6':['12-4','7-3','11-6']
};
export const priorIds=id=>needs[id]||[];
export function prerequisites(lesson,findLesson,lessonRoute){
 return priorIds(lesson.id).map(id=>{
  const j=JAVA_BY_ID[id],previous=findLesson(id);
  if(j)return {id,title:j.title,summary:j.idea,question:j.practice,path:javaRoute(id)};
  if(previous)return {id,title:previous.title,summary:previous.foundation.terms[0].meaning,question:previous.foundation.practice[0],path:lessonRoute(id)};
  return null;
 }).filter(Boolean);
}
export function studyTime(l){
 const depth=l.foundation.sections.length;
 if(l.optional)return '选学 · 约 15–25 分钟，可分两次';
 if(['5-1','6-2','8-1','8-2','8-3','9-6','10-2','11-2','12-4'].includes(l.id))return '分段学 · 每次先做一个小任务';
 return l.showCode||depth>2?'建议先用 10–15 分钟推演，再练习':'建议先用 6–10 分钟读例子并试一题';
}
