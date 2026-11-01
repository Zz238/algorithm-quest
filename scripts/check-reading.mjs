import assert from 'node:assert/strict';
import {chapters} from '../src/data/course.js';
import {freshProgress,cleanProgress,completeLesson,recordCheckin,readingCount,readingLevel,checkinStats,shiftDateKey} from '../src/logic.js';
import {accountProfile} from '../src/account-profile.js';

const ids=chapters.flatMap(c=>c.lessons).map(l=>l.id),day='2026-11-01';
const four=['1-1','2-1','4-1','8-6']; // Across chapters; an optional lesson also counts once.
const p=freshProgress();p.mastery=[...ids];
for(const id of four.slice(0,3))assert(completeLesson(p,id,day,true).ok);
assert.equal(readingCount(p,day),3);assert.deepEqual(p.checkins,[],'Three lessons must not check in.');
assert(!completeLesson(p,four[0],day,true).newReading);assert.equal(readingCount(p,day),3,'Repeating a lesson must not advance the daily counter.');
// The fourth lesson works after JSON persistence/relogin; the counter is not session-local.
const restored=cleanProgress(JSON.parse(JSON.stringify(p)),ids);
assert(completeLesson(restored,four[3],day,true).checkedIn);assert.deepEqual(restored.checkins,[day]);
assert(!completeLesson(restored,four[3],day,true).checkedIn);assert(!recordCheckin(restored,day,true));assert.deepEqual(restored.checkins,[day]);
assert.equal(restored.lessons.length,4,'Re-reading must not grant another lesson reward.');
const blocked=freshProgress();assert(!completeLesson(blocked,'1-1',day,true).ok);assert.deepEqual(blocked.lessons,[],'Exercises remain a prerequisite for completing a lesson.');
const guest=freshProgress();guest.mastery=[...four];
for(const id of four)assert(completeLesson(guest,id,day,false).ok);
assert.equal(guest.lessons.length,4);assert.equal(readingCount(guest,day),0);assert.deepEqual(guest.checkins,[]);
guest.dailyRead[day]=four;assert(!recordCheckin(guest,day,false),'A guest cannot check in even with old reading records.');
assert(!completeLesson(restored,'1-1','2026-02-29',true).ok);assert(!recordCheckin(restored,'invalid',true));
const tomorrow=shiftDateKey(day,1);
assert(!restored.checkins.includes(tomorrow));assert.equal(readingCount(restored,tomorrow),0);
for(const id of four)completeLesson(restored,id,tomorrow,true);
assert.deepEqual(checkinStats(restored.checkins,tomorrow),{total:2,current:2,longest:2});
assert.equal(readingLevel(3,false),0);assert.equal(readingLevel(4,true),1);assert.equal(readingLevel(8,true),2);assert.equal(readingLevel(12,true),3);assert.equal(readingLevel(16,true),4);assert.equal(readingLevel(72,true),4);assert.equal(readingLevel(0,true),1,'Historical dates without a reading ledger stay green.');
const legacy=cleanProgress({version:1,checkins:['2026-10-28','2026-10-28'],dailyRead:{[day]:['1-1','1-1','bad']}},ids);
assert.deepEqual(legacy.checkins,['2026-10-28']);assert.equal(readingCount(legacy,day),1);
const profile=accountProfile({user_metadata:{user_name:'Zz238',name:'display name',avatar_url:'https://avatars.githubusercontent.com/u/9919?v=4'}});
assert.equal(profile.name,'Zz238');assert.equal(profile.avatarUrl,'https://avatars.githubusercontent.com/u/9919?v=4');assert.equal(profile.initial,'Z');
assert.equal(accountProfile({identities:[{provider:'github',identity_data:{user_name:'fallback',avatar_url:'https://avatars.githubusercontent.com/u/1'}}]}).name,'fallback');
assert.equal(accountProfile({user_metadata:{user_name:'  ',avatar_url:'javascript:alert(1)'}}).avatarUrl,'');
assert.equal(accountProfile({user_metadata:{avatar_url:'https://example.com/private.png'}}).avatarUrl,'');
assert.equal(accountProfile({user_metadata:{name:'学习者'}}).initial,'学');
console.log('Reading/account checks passed: four distinct lessons, exercise prerequisite, guest exclusion, repeat/relogin deduplication, day rollover, heat levels, legacy history and GitHub profile fallbacks.');
