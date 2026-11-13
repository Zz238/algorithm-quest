import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import JavaCodingTask from '../../src/components/JavaCodingTask.vue';
import JavaCodeEditor from '../../src/components/JavaCodeEditor.vue';
import JavaRunPanel from '../../src/components/JavaRunPanel.vue';
import CodingScaffold from '../../src/components/CodingScaffold.vue';
import { CODING_BY_ID } from '../../src/data/coding-catalog.js';
import {
  buildLearnerProgram,
  buildSourceJudgingProgram,
  restoreCodingSource,
} from '../../src/java/coding-program.js';
import { browserStorage, clearStudyDrafts, draftKey, writeDraft } from '../../src/study-drafts.js';

describe('complete Main.java coding files', () => {
  const task = CODING_BY_ID['code-greeting'];
  it('keeps the class, target method and executable main in the independent editor without a separate method heading', async () => {
    const wrapper = shallowMount(JavaCodingTask, {
      props: { task, owner: 'file-heading' },
      global: { renderStubDefaultSlot: true },
    });
    wrapper.findComponent(CodingScaffold).vm.$emit('mode', 'independent');
    await wrapper.vm.$nextTick();
    const editor = wrapper.findComponent(JavaCodeEditor);
    expect(editor.props('modelValue')).toContain('public class Main {');
    expect(editor.props('modelValue')).toContain('public static String greet(String name) {');
    expect(editor.props('modelValue')).toContain('public static void main(String[] args)');
    expect(wrapper.find('.coding-method-signature').exists()).toBe(false);
    const panel = wrapper.findComponent(JavaRunPanel);
    expect(panel.props('entryClass')).toBe('__QuestTests');
    expect(panel.props('sampleSource')).toBe(editor.props('modelValue'));
    expect(panel.props('sampleJudged')).toBe(false);
    wrapper.unmount();
  });
  it('migrates old method-body drafts once and preserves subsequent full-file edits separately per account', async () => {
    const owner = 'file-migration',
      other = 'file-other';
    clearStudyDrafts(owner);
    clearStudyDrafts(other);
    writeDraft(
      draftKey(owner, task.id, 'coding-write'),
      { body: 'return "旧草稿" + name;', hints: 1, reference: true },
      browserStorage(),
    );
    let wrapper = shallowMount(JavaCodingTask, {
      props: { task, owner },
      global: { renderStubDefaultSlot: true },
    });
    expect(wrapper.findComponent(JavaCodeEditor).props('modelValue')).toContain(
      'return "旧草稿" + name;',
    );
    expect(wrapper.find('ol.study-note').text()).toBe(task.hints[0]);
    const edited = buildLearnerProgram(task, 'return "新草稿" + name;').replace(
      'greet("小林")',
      'greet("同学")',
    );
    wrapper.findComponent(JavaCodeEditor).vm.$emit('update:modelValue', edited);
    await wrapper.vm.$nextTick();
    wrapper.unmount();
    wrapper = shallowMount(JavaCodingTask, {
      props: { task, owner },
      global: { renderStubDefaultSlot: true },
    });
    expect(wrapper.findComponent(JavaCodeEditor).props('modelValue')).toBe(edited);
    wrapper.unmount();
    wrapper = shallowMount(JavaCodingTask, {
      props: { task, owner: other },
      global: { renderStubDefaultSlot: true },
    });
    wrapper.findComponent(CodingScaffold).vm.$emit('mode', 'independent');
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent(JavaCodeEditor).props('modelValue')).not.toContain('旧草稿');
    expect(wrapper.findComponent(JavaCodeEditor).props('modelValue')).not.toContain('新草稿');
    wrapper.unmount();
    clearStudyDrafts(owner);
    clearStudyDrafts(other);
  });
  it('keeps the learner file intact when adding tests and does not put generated test helpers in the editor', () => {
    const source = buildLearnerProgram(task, task.solution).replace('"世界"', '"同学"');
    const judged = buildSourceJudgingProgram(task, source);
    expect(judged.source.startsWith(source + '\n\n')).toBe(true);
    expect(source).not.toContain('__aqCheck');
    expect(judged.source).toContain('class __QuestTests extends Main');
    expect(restoreCodingSource(task, { source: '' })).toBe('');
    expect(restoreCodingSource(task, { source }, { body: 'return "old";' })).toBe(source);
  });
});
