import { describe, it, expect, vi } from 'vitest';
import { ref } from 'vue';
import { shallowMount } from '@vue/test-utils';
import { freshProgress } from '../../src/logic.js';
import { CODING_SERVICE, recordCoding } from '../../src/coding-progress.js';
import JavaCodingTask from '../../src/components/JavaCodingTask.vue';
import JavaRunPanel from '../../src/components/JavaRunPanel.vue';
import { cleanLearning, mergeLearning } from '../../src/study-state.js';
import { parseRoute } from '../../src/course-route.js';
import { COURSE_TERMS } from '../../src/data/course-index.js';
import { CAREER_ROUTES } from '../../src/data/career-index.js';
import { CAREER_LESSONS } from '../../src/data/career-lessons.js';
import { CODING_BY_ID } from '../../src/data/coding-catalog.js';
import { explainJavaError, parseCaseOutput } from '../../src/java/feedback.js';
import { careerProjectFiles, zipFiles } from '../../src/project-export.js';
describe('coding practice and career learning', () => {
  it('ignores a completed run after its account has changed', () => {
    const task = CODING_BY_ID['code-core-3-2'];
    const owner = ref('first-account');
    const record = vi.fn();
    const wrapper = shallowMount(JavaCodingTask, {
      props: { task, owner: 'first-account' },
      global: {
        provide: {
          [CODING_SERVICE]: { progress: freshProgress(), owner, disabled: ref(false), record },
        },
      },
    });
    const result = { all: true, state: 'finished', cases: task.cases.map(() => ({ ok: true })) };
    owner.value = 'second-account';
    wrapper.findComponent(JavaRunPanel).vm.$emit('result', result);
    expect(record).not.toHaveBeenCalled();
    owner.value = 'first-account';
    wrapper.findComponent(JavaRunPanel).vm.$emit('result', result);
    expect(record).toHaveBeenCalledWith(task.id, { passed: true, assisted: false }, task.topic);
    wrapper.unmount();
  });
  it('exports editable starters, complete references and a real ZIP container', async () => {
    const backend = careerProjectFiles('backend'),
      algorithm = careerProjectFiles('algorithm');
    expect(backend['starter/src/main/java/quest/LearningService.java']).toContain(
      'UnsupportedOperationException',
    );
    expect(backend['reference/src/main/java/quest/LearningService.java']).toContain('ConcurrentHashMap');
    expect(algorithm['starter/exercises.py']).toContain('NotImplementedError');
    expect(algorithm['reference/exercises.py']).toContain('def fit_line');
    expect(algorithm['reference/serve.py']).toContain('127.0.0.1');
    expect(algorithm['reference/courses.json']).toContain('arrays');
    expect(JSON.parse(algorithm['starter/practice.ipynb']).nbformat).toBe(4);
    const blob = zipFiles({ 'example.txt': '你好，Java' });
    const buffer = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsArrayBuffer(blob);
    });
    const view = new DataView(buffer);
    expect(view.getUint32(0, true)).toBe(0x04034b50);
    expect(view.getUint32(buffer.byteLength - 22, true)).toBe(0x06054b50);
  });
  it('schedules independent practice without advancing repeatedly on the same day', () => {
    const p = freshProgress();
    recordCoding(p, 'code-sum-to', { passed: true, assisted: false }, 100, '2026-11-08');
    expect(p.learning.coding['code-sum-to'].due).toBe('2026-11-09');
    recordCoding(p, 'code-sum-to', { passed: true, assisted: false }, 101, '2026-11-08');
    expect(p.learning.coding['code-sum-to'].due).toBe('2026-11-09');
    recordCoding(p, 'code-sum-to', { passed: true, assisted: false }, 102, '2026-11-09');
    expect(p.learning.coding['code-sum-to'].due).toBe('2026-11-12');
    recordCoding(p, 'code-sum-to', { passed: true, assisted: false }, 103, '2026-11-10');
    expect(p.learning.coding['code-sum-to'].due).toBe('2026-11-12');
    recordCoding(p, 'code-sum-to', { passed: false, assisted: false }, 104, '2026-11-10');
    expect(p.learning.coding['code-sum-to']).toMatchObject({
      due: '2026-11-10',
      passed: false,
      box: 0,
      independentAt: 103,
      failures: 1,
    });
  });
  it('preserves new records through cleaning and convergent cloud merges', () => {
    const p = freshProgress(),
      q = freshProgress();
    recordCoding(p, 'code-even', { passed: true, assisted: false }, 100, '2026-11-08');
    recordCoding(q, 'code-even', { passed: false, assisted: true }, 200, '2026-11-09');
    p.learning.career['backend-http'] = { checked: true, at: 100 };
    q.learning.career['backend-http'] = { checked: false, at: 200 };
    p.learning.routeChoice = { id: 'algorithm', at: 100 };
    const a = cleanLearning(p.learning, new Set()),
      b = cleanLearning(q.learning, new Set());
    expect(mergeLearning(a, b)).toEqual(mergeLearning(b, a));
    expect(mergeLearning(a, b).coding['code-even']).toMatchObject({
      passed: false,
      passedAt: 100,
      independentAt: 100,
      due: '2026-11-09',
    });
    expect(mergeLearning(a, b).career['backend-http'].checked).toBe(false);
    expect(
      cleanLearning(
        { coding: { 'bad/key': { at: 1 } }, routeChoice: { id: 'untrusted', at: 1 } },
        new Set(),
      ).coding,
    ).toEqual({});
  });
  it('validates every career stage, related task and nested route', () => {
    for (const route of CAREER_ROUTES)
      for (const [id] of route.stages) {
        const l = CAREER_LESSONS[route.id + '-' + id];
        expect(l.concepts.length).toBeGreaterThanOrEqual(3);
        expect(l.questions).toHaveLength(2);
        expect(l.deliverables).toHaveLength(3);
        for (const task of l.tasks) expect(CODING_BY_ID[task]).toBeTruthy();
        expect(parseRoute('/careers/' + route.id + '/' + id, COURSE_TERMS).view).toBe('careers');
      }
    for (const invalid of ['/careers/backend/not-real', '/practice/code-not-real', '/catalog/99'])
      expect(parseRoute(invalid, COURSE_TERMS).view).toBe('not-found');
    expect(parseRoute('/careers/backend/http?at=career-practice', COURSE_TERMS).target.section).toBe(
      'career-practice',
    );
  });
  it('separates structured case feedback from ordinary program output', () => {
    expect(parseCaseOutput('debug\n@@AQ@@{"id":1,"ok":false,"actual":2,"expected":3}\n').cases).toEqual([
      { id: 1, ok: false, actual: 2, expected: 3 },
    ]);
    expect(parseCaseOutput('hello').output).toBe('hello');
    expect(explainJavaError('ArrayIndexOutOfBoundsException')).toContain('合法下标');
  });
});
