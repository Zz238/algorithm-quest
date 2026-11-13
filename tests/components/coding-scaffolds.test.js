import { afterEach, describe, expect, it, vi } from 'vitest';
import { reactive, ref } from 'vue';
import { mount, shallowMount } from '@vue/test-utils';
import CodingScaffold from '../../src/components/CodingScaffold.vue';
import JavaCodingTask from '../../src/components/JavaCodingTask.vue';
import JavaCodeEditor from '../../src/components/JavaCodeEditor.vue';
import JavaRunPanel from '../../src/components/JavaRunPanel.vue';
import { CODING_BY_ID } from '../../src/data/coding-catalog.js';
import { createCodingScaffold } from '../../src/java/coding-scaffolds.js';
import { buildLearnerProgram } from '../../src/java/coding-program.js';
import { browserStorage, clearStudyDrafts, draftKey, writeDraft } from '../../src/study-drafts.js';
import { CODING_SERVICE } from '../../src/coding-progress.js';
import { freshProgress } from '../../src/logic.js';

const task = CODING_BY_ID['code-sum-to'];
const owners = [];
const mounted = [];
afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount());
  owners.splice(0).forEach((owner) => clearStudyDrafts(owner));
});
function mountTask(name, props = {}, service) {
  const owner = 'scaffold-' + name;
  owners.push(owner);
  const wrapper = shallowMount(JavaCodingTask, {
    props: { task, owner, ...props },
    global: {
      stubs: { CodingScaffold: false },
      renderStubDefaultSlot: true,
      provide: service ? { [CODING_SERVICE]: service } : {},
    },
  });
  mounted.push(wrapper);
  return wrapper;
}
async function mode(wrapper, index) {
  await wrapper.findAll('.coding-mode-tabs button')[index].trigger('click');
}

describe('progressive code practice', () => {
  it('starts with one blank and assembles the real learner file for both blank stages', async () => {
    const wrapper = mountTask('blanks');
    const scaffold = createCodingScaffold(task);
    expect(wrapper.findComponent(CodingScaffold).props('state').mode).toBe('one');
    expect(wrapper.findComponent(JavaCodeEditor).exists()).toBe(false);
    expect(wrapper.findAll('.coding-blank-code textarea')).toHaveLength(1);
    await wrapper.find('.coding-blank-code textarea').setValue(scaffold.one.answers[0]);
    expect(wrapper.findComponent(JavaRunPanel).props('sampleSource')).toBe(scaffold.fullSource);
    await mode(wrapper, 1);
    const fields = wrapper.findAll('.coding-blank-code textarea');
    expect(fields).toHaveLength(3);
    for (let i = 0; i < fields.length; i++) await fields[i].setValue(scaffold.three.answers[i]);
    expect(wrapper.findComponent(JavaRunPanel).props('sampleSource')).toBe(scaffold.fullSource);
    expect(wrapper.findComponent(JavaRunPanel).props('source')).toContain(
      'class __QuestTests extends Main',
    );
  });

  it('keeps saved independent, blank and typing drafts separate across mode changes and remounts', async () => {
    const owner = 'scaffold-isolation';
    const source = buildLearnerProgram(task, 'return 123;');
    writeDraft(draftKey(owner, task.id, 'coding-write'), { source }, browserStorage());
    let wrapper = mountTask('isolation');
    expect(wrapper.findComponent(CodingScaffold).props('state').mode).toBe('independent');
    expect(wrapper.findComponent(JavaCodeEditor).props('modelValue')).toBe(source);
    await mode(wrapper, 0);
    await wrapper.find('.coding-blank-code textarea').setValue('saved blank');
    await mode(wrapper, 4);
    await wrapper.find('.coding-typing textarea').setValue('saved typing');
    await mode(wrapper, 2);
    expect(wrapper.findComponent(JavaCodeEditor).props('modelValue')).toBe(source);
    wrapper.unmount();
    mounted.splice(mounted.indexOf(wrapper), 1);
    wrapper = mountTask('isolation');
    expect(wrapper.findComponent(JavaCodeEditor).props('modelValue')).toBe(source);
    await mode(wrapper, 0);
    expect(wrapper.find('.coding-blank-code textarea').element.value).toBe('saved blank');
    await mode(wrapper, 4);
    expect(wrapper.find('.coding-typing textarea').element.value).toBe('saved typing');
    const other = mountTask('other-account');
    expect(other.find('.coding-blank-code textarea').element.value).toBe('');
  });

  it('records assisted completion locally and only records independent submissions in coding progress', async () => {
    const owner = ref('scaffold-progress');
    const record = vi.fn();
    const wrapper = mountTask(
      'progress',
      {},
      { owner, record, progress: freshProgress(), disabled: ref(false) },
    );
    const result = { all: true, state: 'finished', cases: task.cases.map(() => ({ ok: true })) };
    wrapper.findComponent(JavaRunPanel).vm.$emit('result', result);
    await wrapper.vm.$nextTick();
    expect(record).not.toHaveBeenCalled();
    expect(wrapper.findComponent(CodingScaffold).props('state').completed.one).toBe('tested');
    await mode(wrapper, 2);
    wrapper.findComponent(JavaRunPanel).vm.$emit('result', result);
    expect(record).toHaveBeenCalledWith(task.id, { passed: true, assisted: false }, task.topic);
  });

  it('starts review in the independent Chinese step skeleton without exposing the reference', () => {
    const wrapper = mountTask('review', { review: true });
    const source = wrapper.findComponent(JavaCodeEditor).props('modelValue');
    expect(wrapper.findComponent(CodingScaffold).props('state').mode).toBe('independent');
    expect(source).toContain('// TODO:');
    expect(source).not.toBe(createCodingScaffold(task).fullSource);
    expect(wrapper.find('.coding-blank-code').exists()).toBe(false);
  });
});

function mountExercise(mode) {
  const scaffold = {
    one: { parts: ['return ', ';'], answers: ['1'] },
    three: { parts: ['', ' ', ' ', ';'], answers: ['return', '1', '+ 0'] },
    blocks: [
      { id: 'first', code: 'int n = 1;', indent: 0 },
      { id: 'second', code: 'return n;', indent: 1 },
    ],
    typing: 'int n = 1;\nreturn n;',
  };
  const state = reactive({
    mode,
    one: [''],
    three: ['', '', ''],
    order: ['second', 'first'],
    indents: { first: 0, second: 0 },
    typing: '',
    completed: {},
  });
  const wrapper = mount(CodingScaffold, {
    props: { task, scaffold, state, onUpdate: (patch) => Object.assign(state, patch) },
    global: { stubs: { UiIcon: true } },
  });
  mounted.push(wrapper);
  return { wrapper, scaffold, state };
}

describe('lightweight assisted practice interactions', () => {
  it('requires correct blank answers before emitting reference completion', async () => {
    const { wrapper } = mountExercise('one');
    await wrapper.find('.coding-scaffold-actions button').trigger('click');
    expect(wrapper.emitted('checked')).toBeUndefined();
    await wrapper.find('.coding-blank-code textarea').setValue('1');
    await wrapper.find('.coding-scaffold-actions button').trigger('click');
    expect(wrapper.emitted('checked')).toEqual([['one']]);
  });

  it('supports keyboard-accessible reorder and indentation buttons, then checks the assembled flow', async () => {
    const { wrapper, state } = mountExercise('parsons');
    await wrapper.findAll('.coding-block-actions')[1].findAll('button')[0].trigger('click');
    expect(state.order).toEqual(['first', 'second']);
    await wrapper.find('.coding-scaffold-actions button').trigger('click');
    expect(wrapper.emitted('checked')).toBeUndefined();
    await wrapper.findAll('.coding-block-actions')[1].findAll('button')[3].trigger('click');
    expect(state.indents.second).toBe(1);
    await wrapper.find('.coding-scaffold-actions button').trigger('click');
    expect(wrapper.emitted('checked')).toEqual([['parsons']]);
  });

  it('compares the complete typed body including newlines without marking partial input complete', async () => {
    const { wrapper, scaffold } = mountExercise('typing');
    await wrapper.find('.coding-typing textarea').setValue('int n = 1;');
    await wrapper.find('.coding-scaffold-actions button').trigger('click');
    expect(wrapper.emitted('checked')).toBeUndefined();
    await wrapper.find('.coding-typing textarea').setValue(scaffold.typing);
    await wrapper.find('.coding-scaffold-actions button').trigger('click');
    expect(wrapper.emitted('checked')).toEqual([['typing']]);
  });
});
