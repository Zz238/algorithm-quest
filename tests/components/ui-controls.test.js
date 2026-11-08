import { afterEach, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import UiButton from '../../src/components/ui/UiButton.vue';
import UiSegments from '../../src/components/ui/UiSegments.vue';
import UiSearchField from '../../src/components/ui/UiSearchField.vue';
import UiCheckbox from '../../src/components/ui/UiCheckbox.vue';

const mounted = [];
function render(component, options = {}) {
  const wrapper = mount(component, { attachTo: document.body, ...options });
  mounted.push(wrapper);
  return wrapper;
}
afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount());
  vi.useRealTimers();
  document.body.innerHTML = '';
});

it('locks a busy action, emits one enabled action, and clears its short-lived feedback', async () => {
  vi.useFakeTimers();
  const wrapper = render(UiButton, { props: { loading: true }, slots: { default: '保存' } });
  expect(wrapper.get('button').element.disabled).toBe(true);
  await wrapper.get('button').trigger('click');
  expect(wrapper.emitted('click')).toBeUndefined();
  await wrapper.setProps({ loading: false });
  await wrapper.get('button').trigger('click');
  expect(wrapper.emitted('click')).toHaveLength(1);
  expect(wrapper.find('.ui-ripple').exists()).toBe(true);
  await vi.advanceTimersByTimeAsync(500);
  expect(wrapper.find('.ui-ripple').exists()).toBe(false);
});

it('keeps native submit behavior explicit instead of submitting on an auxiliary action', async () => {
  const submitted = vi.fn();
  const wrapper = render({
    components: { UiButton },
    setup: () => ({ submitted }),
    template:
      '<form @submit.prevent="submitted"><UiButton>辅助操作</UiButton><UiButton type="submit">提交</UiButton></form>',
  });
  wrapper.findAll('button')[0].element.click();
  expect(submitted).not.toHaveBeenCalled();
  wrapper.findAll('button')[1].element.click();
  expect(submitted).toHaveBeenCalledOnce();
});

it('moves a segmented selection with the keyboard and skips unavailable choices', async () => {
  const wrapper = render({
    components: { UiSegments },
    setup() {
      return { selected: ref('read') };
    },
    template:
      "<UiSegments v-model=\"selected\" label=\"模式\" :options=\"[{ value: 'read', label: '阅读' }, { value: 'disabled', label: '不可用', disabled: true }, { value: 'practice', label: '练习' }]\" />",
  });
  await wrapper.findAll('button')[0].trigger('keydown', { key: 'ArrowRight' });
  expect(wrapper.findAll('button')[2].attributes('aria-pressed')).toBe('true');
  expect(document.activeElement.textContent).toBe('练习');
  await wrapper.findAll('button')[2].trigger('keydown', { key: 'Home' });
  expect(wrapper.findAll('button')[0].attributes('aria-pressed')).toBe('true');
});

it('clears the controlled search and leaves focus in its labelled input', async () => {
  const wrapper = render({
    components: { UiSearchField },
    setup() {
      return { query: ref('下标') };
    },
    template: '<UiSearchField id="ui-search-test" v-model="query" label="搜索术语" maxlength="100" />',
  });
  expect(wrapper.get('label').attributes('for')).toBe('ui-search-test');
  expect(wrapper.get('input').attributes('maxlength')).toBe('100');
  await wrapper.get('button').trigger('click');
  expect(wrapper.get('input').element.value).toBe('');
  expect(document.activeElement).toBe(wrapper.get('input').element);
  expect(wrapper.find('button').exists()).toBe(false);
});

it('uses a real labelled checkbox and keeps its checked state in the parent model', async () => {
  const wrapper = render({
    components: { UiCheckbox },
    setup() {
      return { checked: ref(false) };
    },
    template: '<UiCheckbox v-model="checked" class="project-self-check">我已经核对边界</UiCheckbox>',
  });
  const input = wrapper.get('input[type=checkbox]');
  expect(wrapper.get('label').attributes('for')).toBe(input.attributes('id'));
  expect(wrapper.get('label').classes()).toContain('project-self-check');
  expect(input.classes()).not.toContain('project-self-check');
  await input.setChecked(true);
  expect(input.element.checked).toBe(true);
  expect(wrapper.vm.checked).toBe(true);
  expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true');
});
