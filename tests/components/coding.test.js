import { describe, it, expect, vi } from 'vitest';
import { ref } from 'vue';
import { shallowMount } from '@vue/test-utils';
import { freshProgress } from '../../src/logic.js';
import { CODING_SERVICE, recordCoding } from '../../src/coding-progress.js';
import JavaCodingTask from '../../src/components/JavaCodingTask.vue';
import JavaRunPanel from '../../src/components/JavaRunPanel.vue';
import CodingScaffold from '../../src/components/CodingScaffold.vue';
import { cleanLearning, mergeLearning } from '../../src/study-state.js';
import { parseRoute } from '../../src/course-route.js';
import { COURSE_TERMS } from '../../src/data/course-index.js';
import { CODING_BY_ID } from '../../src/data/coding-catalog.js';
import { explainJavaError, parseCaseOutput } from '../../src/java/feedback.js';

describe('coding practice and learning state', () => {
  it('ignores a completed run after its account has changed', async () => {
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
    wrapper.findComponent(CodingScaffold).vm.$emit('mode', 'independent');
    await wrapper.vm.$nextTick();
    const result = { all: true, state: 'finished', cases: task.cases.map(() => ({ ok: true })) };
    owner.value = 'second-account';
    wrapper.findComponent(JavaRunPanel).vm.$emit('result', result);
    expect(record).not.toHaveBeenCalled();
    owner.value = 'first-account';
    wrapper.findComponent(JavaRunPanel).vm.$emit('result', result);
    expect(record).toHaveBeenCalledWith(task.id, { passed: true, assisted: false }, task.topic);
    wrapper.unmount();
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
    const a = cleanLearning(p.learning, new Set()),
      b = cleanLearning(q.learning, new Set());
    expect(mergeLearning(a, b)).toEqual(mergeLearning(b, a));
    expect(mergeLearning(a, b).coding['code-even']).toMatchObject({
      passed: false,
      passedAt: 100,
      independentAt: 100,
      due: '2026-11-09',
    });
    expect(
      cleanLearning(
        { coding: { 'bad/key': { at: 1 } }, routeChoice: { id: 'untrusted', at: 1 } },
        new Set(),
      ).coding,
    ).toEqual({});
  });

  it('validates practice routes and rejects invalid routes', () => {
    expect(parseRoute('/practice/code-core-3-2', COURSE_TERMS).view).toBe('practice');
    expect(parseRoute('/practice/review/code-core-3-2', COURSE_TERMS).view).toBe('practice-review');
    for (const invalid of ['/careers', '/practice/code-not-real', '/catalog/99'])
      expect(parseRoute(invalid, COURSE_TERMS).view).toBe('not-found');
  });

  it('separates structured case feedback from ordinary program output', () => {
    expect(parseCaseOutput('debug\n@@AQ@@{"id":1,"ok":false,"actual":2,"expected":3}\n').cases).toEqual([
      { id: 1, ok: false, actual: 2, expected: 3 },
    ]);
    expect(parseCaseOutput('hello').output).toBe('hello');
    expect(explainJavaError('ArrayIndexOutOfBoundsException')).toContain('合法下标');
  });
});
