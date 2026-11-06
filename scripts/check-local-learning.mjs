import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseRoute, lessonIds, routeTitle } from '../src/course-route.js';
import { COURSE_TERMS, searchCourse, termLessons } from '../src/course-search.js';
import { GUEST_DOCUMENT_KEY, GUEST_KEY, documentFromProgress } from '../src/cloud-progress.js';
import { freshProgress } from '../src/logic.js';
import { readLocalSave, encodeSnapshot, inspectSave } from '../src/local-saves.js';
import { describeBackup, mergeBackup, parseBackup, resetProgress } from '../src/progress-backup.js';
for (const url of [
  '/learn/4/no',
  '/learn/40/0',
  '/learn/4/6',
  '/learn/4',
  '/learn/4/0/fake',
  '/boss/0',
  '/boss/1/0',
  '/java/nothing',
  '/review/no',
  '/glossary/%AB',
  '/glossary/constructor',
]) {
  assert.equal(parseRoute(url, COURSE_TERMS).view, 'not-found', url);
}
assert.equal(parseRoute('/learn/6/0', COURSE_TERMS).lesson.id, '6-5');
assert.equal(parseRoute('/checkin', COURSE_TERMS).path, '/account');
assert.match(routeTitle(parseRoute('/java/print')), /第一次运行/);
assert.equal(parseRoute('/glossary/' + encodeURIComponent('下标'), COURSE_TERMS).topic, '下标');
const secret = 'only my private notebook 831';
const search = searchCourse('private notebook', { '4-5': secret });
assert.equal(search.find((g) => g.key === 'notes').items[0].path, '/learn/4/1');
assert(!searchCourse('private notebook').some((g) => g.key === 'notes'));
assert(
  searchCourse('1051')
    .find((g) => g.key === 'exercises')
    .items.some((x) => x.path === '/boss/5'),
);
assert(searchCourse('pivot').some((g) => g.key === 'code'));
assert(termLessons['下标'].length > 0);
const records = new Map();
const storage = {
  get length() {
    return records.size;
  },
  key: (i) => [...records.keys()][i] ?? null,
  getItem: (k) => records.get(k) ?? null,
  setItem: (k, v) => records.set(k, v),
};
const guest = freshProgress();
guest.notes['4-5'] = '本机笔记';
guest.lessons = ['4-5'];
storage.setItem(GUEST_KEY, JSON.stringify(guest));
storage.setItem(GUEST_DOCUMENT_KEY, 'broken save');
const loaded = readLocalSave(storage, 'guest', lessonIds, 'test');
assert.equal(loaded.status, 'corrupt');
assert.equal(loaded.document.progress.notes['4-5'], '本机笔记');
assert.equal(loaded.recoveries[0].raw, 'broken save');
assert.equal(
  storage.getItem(GUEST_DOCUMENT_KEY),
  'broken save',
  'Reading must not overwrite damaged bytes.',
);
assert.equal(storage.getItem(loaded.recoveries[0].key), 'broken save');
const restricted = {
  getItem: storage.getItem,
  setItem() {
    throw new Error('quota');
  },
};
assert(
  readLocalSave(restricted, 'guest', lessonIds, 'test').protectedKeys.includes(GUEST_DOCUMENT_KEY) ===
    false,
  'Existing recovery copy allows repair even if no new writes are possible.',
);
storage.setItem(GUEST_DOCUMENT_KEY, 'different damage');
assert(readLocalSave(restricted, 'guest', lessonIds, 'test').protectedKeys.includes(GUEST_DOCUMENT_KEY));
assert.equal(
  inspectSave(
    {
      getItem() {
        throw new Error('denied');
      },
    },
    GUEST_DOCUMENT_KEY,
    (x) => x,
  ).status,
  'unavailable',
);
const incoming = parseBackup(
  JSON.stringify({ ...freshProgress(), lessons: ['1-1'], notes: { '4-5': '备份笔记' } }),
  lessonIds,
);
assert.deepEqual(describeBackup(guest, incoming).conflicts, ['4-5']);
assert.equal(mergeBackup(guest, incoming, lessonIds).notes['4-5'], '本机笔记');
assert.equal(mergeBackup(guest, incoming, lessonIds, 'backup').notes['4-5'], '备份笔记');
assert.throws(() => parseBackup('{"version":1}', lessonIds));
assert.deepEqual(resetProgress(guest, 'progress').notes, guest.notes);
assert.deepEqual(resetProgress(guest, 'notes').lessons, guest.lessons);
assert.deepEqual(resetProgress(guest, 'all'), freshProgress());
storage.setItem(
  GUEST_DOCUMENT_KEY,
  encodeSnapshot(documentFromProgress(freshProgress(), lessonIds), 'reset-1', 'all'),
);
assert.deepEqual(
  readLocalSave(storage, 'guest', lessonIds, 'test').document.progress,
  freshProgress(),
  'An older compatibility key must never resurrect replaced progress.',
);
console.log('Route validation, private search, backup conflict modes and damaged-save recovery passed.');

const theme = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
const controls = readFileSync(new URL('../src/learning-ux.css', import.meta.url), 'utf8');
const color = (source, name) => new RegExp('--' + name + ':\\s*(#[a-f0-9]{6})', 'i').exec(source)?.[1];
function luminance(hex) {
  const [r, g, b] = hex
    .slice(1)
    .match(/../g)
    .map((pair) => parseInt(pair, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const ratio = (foreground, background) => {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};
for (const name of ['paper', 'background', 'subtle']) {
  assert(ratio(color(theme, 'muted'), color(theme, name)) >= 4.5, 'Small text contrast on ' + name);
  assert(
    ratio(color(controls, 'control-line'), color(theme, name)) >= 3,
    'Control boundary contrast on ' + name,
  );
}
console.log('Text and control-boundary contrast checked on all three reading surfaces.');
