import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import {
  javaDeclarations,
  javaSuggestions,
  javaEditorDiagnostics,
} from '../../src/java/editor-support.js';
import JavaRunPanel from '../../src/components/JavaRunPanel.vue';
const sandbox = vi.hoisted(() => ({ run: vi.fn(), stop: vi.fn(), dispose: vi.fn() }));
vi.mock('../../src/java/sandbox.js', () => ({ createJavaSandbox: () => sandbox }));

describe('Java editor teaching support and real compiler diagnostics', () => {
  it('uses declared array/string/collection types for bounded member hints and ignores comments', () => {
    const source =
      '// String fake;\nint[] a = {1,2};\nString s="int ghost;";\nMap<String,Integer> counts;';
    const declarations = javaDeclarations(source);
    expect(javaDeclarations('static int sum(int n) { return n; }').has('sum')).toBe(false);
    expect(declarations.get('a')).toBe('array');
    expect(declarations.has('fake')).toBe(false);
    expect(declarations.has('ghost')).toBe(false);
    expect(javaSuggestions(source, 'a.').map((s) => s.insertText)).toEqual(['length']);
    expect(javaSuggestions(source, 's.').some((s) => s.insertText === 'length()')).toBe(true);
    expect(javaSuggestions(source, 'counts.').some((s) => s.label === 'getOrDefault')).toBe(true);
    expect(javaSuggestions('', 'a.', 'static int sum(int[] a)')).toEqual(
      expect.arrayContaining([expect.objectContaining({ label: 'length' })]),
    );
    expect(javaSuggestions(source, 'unknown.')).toEqual([]);
  });
  it('provides editable snippet tab stops and common method hints without claiming full Java analysis', () => {
    const suggestions = javaSuggestions('int total=0;', 'fo');
    expect(suggestions.find((s) => s.label === 'fori').insertText).toContain('${2:a}.length');
    expect(suggestions.find((s) => s.label === 'total').kind).toBe('variable');
    expect(javaSuggestions('', 'Math.').find((s) => s.label === 'max').insertText).toBe(
      'max(${1:a}, ${2:b})',
    );
    expect(javaSuggestions('', 'System.out.').map((s) => s.label)).toEqual(['println', 'print']);
  });
  it('maps only real source errors into the editable fragment and bounds invalid columns', () => {
    const diagnostics = [
      { kind: 'ERROR', line: 5, column: 200, message: "';' expected" },
      { kind: 'ERROR', line: 3, column: 1, message: 'wrapper problem' },
      { kind: 'ERROR', line: 7, column: 1, message: 'framework footer problem' },
      { kind: 'NOTE', line: 5, column: 1, message: 'note' },
      { kind: 'ERROR', line: -1, column: -1, message: 'unknown position' },
    ];
    expect(javaEditorDiagnostics(diagnostics, 'int n=2;\nreturn n;', 4)).toEqual([
      { line: 1, column: 9, message: "';' expected", severity: 'error' },
    ]);
    expect(
      javaEditorDiagnostics(
        [{ kind: 'ERROR', line: 7, column: 1, message: 'missing return statement' }],
        'int n=2;\nn++;',
        4,
      )[0].line,
    ).toBe(2);
    expect(
      javaEditorDiagnostics(
        [{ kind: 'WARNING', line: 1, column: -1, message: 'warning' }],
        'int a=0;',
      )[0],
    ).toMatchObject({ column: 1, severity: 'warning' });
  });
  it('emits current compilation markers and clears them immediately after a code change', async () => {
    const diagnostics = [{ kind: 'ERROR', line: 2, column: 5, message: "';' expected" }];
    sandbox.run.mockResolvedValueOnce({ state: 'compile-error', diagnostics, stdout: '' });
    const wrapper = shallowMount(JavaRunPanel, { props: { source: 'class Main {}' } });
    await wrapper.vm.execute();
    expect(wrapper.emitted('diagnostics').at(-1)).toEqual([diagnostics]);
    await wrapper.setProps({ source: 'class Main { int n; }' });
    expect(wrapper.emitted('diagnostics').at(-1)).toEqual([[]]);
    wrapper.unmount();
  });
  it('discards diagnostics produced for code that changed during compilation', async () => {
    let finish;
    sandbox.run.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const wrapper = shallowMount(JavaRunPanel, { props: { source: 'class Main {}' } });
    const pending = wrapper.vm.execute();
    await vi.waitFor(() => expect(finish).toBeTypeOf('function'));
    await wrapper.setProps({ source: 'class Main { int n; }' });
    finish({
      state: 'compile-error',
      diagnostics: [{ kind: 'ERROR', line: 1, column: 2, message: 'old error' }],
      stdout: '',
    });
    await pending;
    expect(wrapper.emitted('diagnostics').every(([items]) => items.length === 0)).toBe(true);
    expect(wrapper.text()).toContain('本次结果未计入');
    wrapper.unmount();
  });
});
