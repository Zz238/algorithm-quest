import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { reactive, nextTick } from 'vue';
import TopicArticle from '../../src/components/TopicArticle.vue';
import TopicTrace from '../../src/components/TopicTrace.vue';
import { TOPIC_LESSON_BY_ID } from '../../src/data/algorithm-topics.js';
import { TOPIC_TRACE_DEFAULTS } from '../../src/topic-traces.js';
import { freshProgress } from '../../src/logic.js';
import { cleanLearning, mergeLearning } from '../../src/study-state.js';
import { CODING_SERVICE } from '../../src/coding-progress.js';
import { clearStudyDrafts } from '../../src/study-drafts.js';
import { parseRoute } from '../../src/course-route.js';
import { searchCourse } from '../../src/course-search.js';

describe('roadmap learning and real topic traces', () => {
  it('recalculates custom input, keeps history immutable and preserves the last valid input after an error', async () => {
    const draft = reactive({ config: { ...TOPIC_TRACE_DEFAULTS['prefix-sum'] }, step: 0 });
    const wrapper = mount(TopicTrace, { props: { topic: TOPIC_LESSON_BY_ID['prefix-sum'], draft } });
    const inputs = wrapper.findAll('form input');
    await inputs[0].setValue('5,-2,7');
    await inputs[1].setValue(0);
    await inputs[2].setValue(2);
    await wrapper.find('form').trigger('submit');
    await wrapper.get('input[type=range]').setValue(4);
    expect(wrapper.get('.topic-state').text()).toContain('=10');
    expect(draft.config.array).toBe('5,-2,7');
    await wrapper.get('input[type=range]').setValue(0);
    expect(wrapper.get('.topic-state').text()).toBe('prefix=[0]');
    await inputs[0].setValue('no');
    await wrapper.find('form').trigger('submit');
    expect(wrapper.get('[role=alert]').text()).toContain('整数');
    expect(draft.config.array).toBe('5,-2,7');
    expect(wrapper.get('.topic-given').text()).toContain('5,-2,7');
    wrapper.unmount();
  });
  it('restores quiz answers and hints for the same owner but never for a different account', async () => {
    const owner = 'topic-test-first',
      other = 'topic-test-other';
    clearStudyDrafts(owner);
    clearStudyDrafts(other);
    const topic = TOPIC_LESSON_BY_ID['prefix-sum'];
    let wrapper = mount(TopicArticle, {
      props: { topic, owner },
      global: { stubs: { TopicCoding: true } },
    });
    await wrapper.get('.mini-output input').setValue('8');
    await wrapper
      .findAll('.study-question')[0]
      .findAll('button')
      .find((b) => b.text().includes('检查答案'))
      .trigger('click');
    expect(wrapper.findAll('.study-question')[0].text()).toContain('答对了');
    await wrapper
      .findAll('.study-question')[1]
      .findAll('button')
      .find((b) => b.text().includes('给我一点提示'))
      .trigger('click');
    wrapper.unmount();
    wrapper = mount(TopicArticle, { props: { topic, owner }, global: { stubs: { TopicCoding: true } } });
    expect(wrapper.get('.mini-output input').element.value).toBe('8');
    expect(wrapper.findAll('.study-question')[0].text()).toContain('答对了');
    expect(wrapper.findAll('.study-question')[1].text()).toContain('已看 1 层提示');
    wrapper.unmount();
    wrapper = mount(TopicArticle, {
      props: { topic, owner: other },
      global: { stubs: { TopicCoding: true } },
    });
    expect(wrapper.get('.mini-output input').element.value).toBe('');
    expect(wrapper.text()).not.toContain('已看 1 层提示');
    wrapper.unmount();
    clearStudyDrafts(owner);
    clearStudyDrafts(other);
  });
  it('separates read markers from mastery and merges optional topic history without losing old saves', async () => {
    const p = freshProgress(),
      q = freshProgress();
    p.learning.topicsRead = ['prefix-sum'];
    q.learning.topicsRead = ['linear-dp'];
    const merged = mergeLearning(
      cleanLearning(p.learning, new Set()),
      cleanLearning(q.learning, new Set()),
    );
    expect(merged.topicsRead).toEqual(['linear-dp', 'prefix-sum']);
    expect(merged.independent).toEqual([]);
    expect(cleanLearning({ topicsRead: ['not-a-topic'], activity: {} }, new Set()).topicsRead).toEqual(
      [],
    );
    const topicRead = vi.fn();
    const wrapper = mount(TopicArticle, {
      props: { topic: TOPIC_LESSON_BY_ID['prefix-sum'], owner: 'topic-read-test', disabled: true },
      global: {
        stubs: { TopicCoding: true },
        provide: { [CODING_SERVICE]: { progress: p, topicRead } },
      },
    });
    expect(
      wrapper
        .findAll('button')
        .find((b) => b.text() === '本篇已读')
        .attributes('disabled'),
    ).toBeDefined();
    await nextTick();
    expect(topicRead).not.toHaveBeenCalled();
    wrapper.unmount();
  });
  it('deep-links to the actual trace step and indexes advanced terms without changing lesson routes', () => {
    const draft = reactive({ config: { ...TOPIC_TRACE_DEFAULTS['prefix-sum'] }, step: 0 });
    const wrapper = mount(TopicTrace, {
      props: {
        topic: TOPIC_LESSON_BY_ID['prefix-sum'],
        draft,
        target: { section: 'topic-example', step: 3 },
      },
    });
    expect(wrapper.get('input[type=range]').element.value).toBe('3');
    expect(wrapper.get('.topic-state').text()).toContain('prefix[3]');
    wrapper.unmount();
    expect(parseRoute('/topics/prefix-sum?at=topic-example&step=3').view).toBe('topics');
    expect(parseRoute('/topics/stage/advanced-algorithms').topicStage).toBe('advanced-algorithms');
    expect(parseRoute('/topics/not-real').view).toBe('not-found');
    expect(parseRoute('/learn/6/0').lesson.id).toBe('6-5');
    expect(
      searchCourse('lowbit')
        .find((g) => g.key === 'topics')
        .items.some((t) => t.path === '/topics/fenwick-tree'),
    ).toBe(true);
  });
});
