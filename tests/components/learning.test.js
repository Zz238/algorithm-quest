import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import CodeReader from '../../src/components/CodeReader.vue';
import GlossaryPage from '../../src/pages/GlossaryPage.vue';
import TraceLab from '../../src/components/TraceLab.vue';
import CourseLink from '../../src/components/CourseLink.vue';
import PracticeCard from '../../src/components/PracticeCard.vue';
import { answerState } from '../../src/answering.js';
import { draftKey, readDraft } from '../../src/study-drafts.js';
import { GUEST_DOCUMENT_KEY, GUEST_KEY } from '../../src/cloud-progress.js';
import { freshProgress } from '../../src/logic.js';
import { useCloudProgress } from '../../src/useCloudProgress.js';

const mounted = [];
const render = (...args) => {
  const wrapper = mount(...args);
  mounted.push(wrapper);
  return wrapper;
};
afterEach(() => {
  for (const wrapper of mounted.splice(0)) wrapper.unmount();
  vi.useRealTimers();
  localStorage.clear();
  document.body.innerHTML = '';
});

describe('learning components', () => {
  it('preserves native modified links while normal activation uses the course transition', async () => {
    const wrapper = render(CourseLink, {
      props: { to: '/learn/6/0' },
      slots: { default: '对象与引用' },
    });
    expect(wrapper.get('a').attributes('href')).toBe('#/learn/6/0');
    await wrapper.get('a').trigger('click', { button: 0, ctrlKey: true });
    expect(wrapper.emitted('navigate')).toBeUndefined();
    await wrapper.get('a').trigger('click', { button: 0 });
    expect(wrapper.emitted('navigate')).toEqual([['/learn/6/0']]);
  });

  it('does not turn unverified Java expressions into recorded mistakes', async () => {
    const question = {
      kind: 'code',
      question: '数组冒泡一轮，填写右侧边界。',
      template: 'i ___ end',
      answer: 'i < end',
      explanation: '右侧比较访问 i+1。',
    };
    const state = answerState(question);
    const wrapper = render(PracticeCard, { props: { question, state } });
    await wrapper.get('input').setValue('!(i >= end)');
    await wrapper.get('.mini-actions .primary').trigger('click');
    expect(state.issue).toBe('unverified');
    expect(state.attempts).toBe(0);
    expect(state.errors).toEqual({});
    expect(wrapper.emitted('attempt')).toBeUndefined();
    expect(wrapper.get('.mini-feedback').classes()).not.toContain('error');
  });

  it('persists a reference target on first entry without requiring a further slider move', async () => {
    const wrapper = render(TraceLab, {
      props: {
        mode: 'index',
        topic: '4-2',
        owner: 'target-test',
        initial: { array: '1,2,3', i: 0 },
        location: { section: 'lesson-experiment', step: 4, input: { array: '7,8,9', i: 0 } },
      },
    });
    expect(wrapper.get('.trace-output').text()).toContain('8');
    const saved = readDraft(draftKey('target-test', '4-2', 'trace'), localStorage);
    expect(saved.step).toBe(4);
    expect(saved.applied.array).toBe('7,8,9');
  });

  it('keeps one tab stop for the Java lines and moves the explanation with the arrow key', async () => {
    const wrapper = render(CodeReader, {
      attachTo: document.body,
      props: { program: { lines: ['int a=3;', 'return a;'], notes: ['保存整数。', '交回这个数。'] } },
    });
    expect(wrapper.findAll('.code-line button[tabindex="0"]')).toHaveLength(1);
    expect(wrapper.findAll('.code-line code button')).toHaveLength(0);
    await wrapper.get('[data-line-button="0"]').trigger('keydown', { key: 'ArrowDown' });
    expect(wrapper.get('.code-explain').text()).toContain('交回这个数');
    expect(document.activeElement.getAttribute('data-line-button')).toBe('1');
    await wrapper.get('.code-term-select select').setValue('return');
    expect(wrapper.get('.term-card').text()).toContain('return');
  });

  it('replaces a stale glossary detail when the search result changes', async () => {
    const wrapper = render(GlossaryPage, { props: { initialTerm: 'int' } });
    expect(wrapper.get('.glossary-inline h2').text()).toBe('int');
    await wrapper.get('#glossary-search').setValue('哈希碰撞');
    expect(wrapper.get('.glossary-inline h2').text()).not.toBe('int');
    await wrapper.get('#glossary-search').setValue('xxyy-no-result-743');
    expect(wrapper.find('.glossary-inline').exists()).toBe(false);
    expect(wrapper.get('.empty-state').text()).toContain('没有找到');
  });

  it('locates a printed example after a custom trace was applied', async () => {
    const wrapper = render(TraceLab, {
      props: {
        mode: 'index',
        topic: 'figure-lab-test',
        owner: 'tester',
        initial: { array: '1,2,3', i: 0 },
      },
    });
    await wrapper.get('[aria-label="实验数组a"]').setValue('7,8,9');
    await wrapper.get('form').trigger('submit');
    expect(wrapper.get('.trace-picture').attributes('aria-label')).toContain('下标 0：7');
    wrapper.vm.showExampleStep(4);
    await nextTick();
    expect(wrapper.get('.trace-output').text()).toContain('2');
    expect(wrapper.get('.trace-picture').attributes('aria-label')).toContain('下标 0：1');
  });

  it('keeps corrupted bytes and batches note writes until an idle pause or page exit', async () => {
    vi.useFakeTimers();
    const existing = freshProgress();
    existing.notes['1-1'] = '迁移前的私人笔记';
    localStorage.setItem(GUEST_KEY, JSON.stringify(existing));
    localStorage.setItem(GUEST_DOCUMENT_KEY, '{unreadable');
    let store;
    render({
      setup() {
        store = useCloudProgress(['1-1'], { client: null });
        return () => null;
      },
    });
    expect(store.storageIssue.value).toBe('corrupt');
    expect(store.recoveries.value[0].raw).toBe('{unreadable');
    expect(store.progress.notes['1-1']).toBe('迁移前的私人笔记');
    const saved = localStorage.getItem(GUEST_DOCUMENT_KEY);
    for (let i = 0; i < 12; i++) store.progress.notes['1-1'] = '新笔记 ' + i;
    expect(store.localPending.value).toBe(true);
    expect(localStorage.getItem(GUEST_DOCUMENT_KEY)).toBe(saved);
    window.dispatchEvent(new Event('pagehide'));
    expect(JSON.parse(localStorage.getItem(GUEST_DOCUMENT_KEY)).progress.notes['1-1']).toBe('新笔记 11');
    expect(localStorage.getItem(store.recoveries.value[0].key)).toBe('{unreadable');
  });

  it('does not resurrect guest notes in another tab after a local replacement', () => {
    let first, second;
    render({
      setup() {
        first = useCloudProgress(['1-1'], { client: null });
        return () => null;
      },
    });
    render({
      setup() {
        second = useCloudProgress(['1-1'], { client: null });
        return () => null;
      },
    });
    second.progress.notes['1-1'] = 'This tab was editing the old save';
    expect(first.cloud.replaceGuest(freshProgress(), 'all')).toBe(true);
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: GUEST_DOCUMENT_KEY,
        newValue: localStorage.getItem(GUEST_DOCUMENT_KEY),
      }),
    );
    window.dispatchEvent(new Event('pagehide'));
    expect(second.progress.notes['1-1']).toBeUndefined();
    expect(JSON.parse(localStorage.getItem(GUEST_DOCUMENT_KEY)).progress.notes).toEqual({});
  });
});
