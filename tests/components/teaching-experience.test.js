import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { webcrypto } from 'node:crypto';
import { recursionTrace, linkedTrace } from '../../src/execution-traces.js';
import { comparisonTrace } from '../../src/comparison-traces.js';
import {
  adaptiveLevel,
  cleanAttempts,
  mergeAttempts,
  questionCategory,
  attemptSummary,
} from '../../src/learning-insights.js';
import { encryptBackup, decryptBackup } from '../../src/encrypted-backup.js';
import { freshProgress, cleanProgress } from '../../src/logic.js';
import { mergeLearning } from '../../src/study-state.js';
import { lessonIds, parseRoute } from '../../src/course-route.js';
import { searchCourse } from '../../src/course-search.js';
import { CHAPTER_CHALLENGES } from '../../src/data/chapter-challenges.js';
import { chapters } from '../../src/data/course.js';
import ReadonlyJava from '../../src/components/ReadonlyJava.vue';
import JavaRunPanel from '../../src/components/JavaRunPanel.vue';
import { runtimeConsent } from '../../src/java/device-policy.js';
import KnowledgePage from '../../src/pages/KnowledgePage.vue';
afterEach(() => {
  vi.unstubAllGlobals();
  runtimeConsent.accepted = false;
});
const attempt = (overrides = {}) => ({
  id: 'attempt-1',
  key: 'sum',
  topic: '8-1',
  ok: true,
  at: Date.now(),
  elapsed: 20000,
  category: 'concept',
  difficulty: 1,
  ...overrides,
});
describe('教学体验真实数据和边界', () => {
  it('递归帧独立且正确返回，链表反转保留对象标识并处理空链表', () => {
    const steps = recursionTrace(3);
    expect(steps.at(-1).result).toBe(6);
    expect(steps.some((s) => s.frames.length === 4)).toBe(true);
    expect(steps.find((s) => s.frames.length === 4).frames.map((f) => f.locals.n)).toEqual([3, 2, 1, 0]);
    expect(recursionTrace(0).at(-1).result).toBe(0);
    expect(() => recursionTrace(9)).toThrow();
    const reversed = linkedTrace([1, 2, 3]).at(-1);
    expect(reversed.refs.head).toBe('N2');
    expect(reversed.heap.map((n) => n.next)).toEqual([null, 'N0', 'N1']);
    expect(linkedTrace([]).at(-1).refs.head).toBeNull();
  });
  it('共享输入的对比产生不同顺序与一致排序结果', () => {
    expect(comparisonTrace('containers', '1,2,3').left.at(-1).extra).toContain('3 → 2 → 1');
    expect(comparisonTrace('containers', '1,2,3').right.at(-1).extra).toContain('1 → 2 → 3');
    const graph = comparisonTrace('traversal', '1,2,3,4,5,6,7');
    expect(graph.left.at(-1).values).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(graph.right.at(-1).values).toEqual([1, 2, 4, 5, 3, 6, 7]);
    for (const input of ['4,1,3,2', '2,2,1', '-2,0,-1']) {
      const pair = comparisonTrace('sorting', input);
      expect(pair.left.at(-1).values).toEqual(
        input
          .split(',')
          .map(Number)
          .sort((a, b) => a - b),
      );
      expect(pair.right.at(-1).values).toEqual(pair.left.at(-1).values);
    }
  });
  it('正确率和耗时共同决定推荐，错误分类与合并记录经过清洗', () => {
    expect(adaptiveLevel([])).toBe(1);
    const correct = Array.from({ length: 6 }, (_, i) => attempt({ id: String(i) }));
    expect(adaptiveLevel(correct)).toBe(3);
    expect(adaptiveLevel(correct.map((a) => ({ ...a, elapsed: 180000 })))).toBe(2);
    expect(adaptiveLevel(correct.map((a) => ({ ...a, ok: false })))).toBe(1);
    expect(questionCategory({ question: '这段代码的时间复杂度是多少？' })).toBe('complexity');
    expect(questionCategory({ question: '空数组和最后一个下标' })).toBe('boundary');
    expect(cleanAttempts([attempt(), attempt({ elapsed: -1 })])).toHaveLength(1);
    expect(mergeAttempts(correct, correct)).toHaveLength(6);
    const p = freshProgress();
    p.learning.attempts = correct;
    expect(cleanProgress(p, lessonIds).learning.attempts).toHaveLength(6);
    expect(mergeLearning(p.learning, p.learning).attempts).toHaveLength(6);
    expect(attemptSummary([attempt({ ok: false })])[0]).toMatchObject({
      category: 'concept',
      wrong: 1,
      rate: 1,
    });
  });
  it('图谱覆盖全部课程和专题，前置可跳转；每章 Easy/Medium 成对', () => {
    const wrapper = mount(KnowledgePage, { props: { progress: freshProgress() } });
    expect(wrapper.findAll('.knowledge-node')).toHaveLength(72 + 41 + 15);
    expect(wrapper.findAll('.knowledge-edge').length).toBeGreaterThan(100);
    for (const route of ['/knowledge', '/execution', '/compare', '/complexity'])
      expect(parseRoute(route).view).not.toBe('not-found');
    for (const chapter of chapters)
      expect(
        new Set([chapter.id === 8 ? 'Medium' : 'Easy', CHAPTER_CHALLENGES[chapter.id].difficulty]).size,
      ).toBe(2);
    wrapper.unmount();
  });
  it('只读高亮完整保留代码并着色，不执行代码或注释内容', () => {
    const code = 'public class Main {\n  String s = "<script>"; // hello\n  int n = 42;\n}';
    const wrapper = mount(ReadonlyJava, { props: { source: code } });
    expect(wrapper.findAll('.syntax-keyword').length).toBeGreaterThan(2);
    expect(wrapper.find('.syntax-comment').text()).toBe('// hello');
    expect(wrapper.find('.syntax-number').text()).toBe('42');
    expect(
      wrapper
        .findAll('.readonly-line')
        .map((line) => line.element.children[1].textContent)
        .join('\n'),
    ).toBe(code);
    expect(wrapper.find('script').exists()).toBe(false);
    wrapper.unmount();
  });
  it('触屏隐藏运行入口且 execute 不启动沙盒', async () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const wrapper = mount(JavaRunPanel, { props: { source: 'class Main {}' } });
    runtimeConsent.accepted = true;
    await wrapper.vm.execute();
    expect(wrapper.find('.java-run-panel').exists()).toBe(false);
    expect(wrapper.find('button').exists()).toBe(false);
    expect(wrapper.text()).toContain('不加载 Java 运行环境');
    wrapper.unmount();
  });
  it('模糊搜索容忍英文错字，并仅搜索传入存档的私人笔记', () => {
    expect(
      searchCourse('Dijsktra')
        .flatMap((g) => g.items)
        .some((i) => i.title.includes('Dijkstra')),
    ).toBe(true);
    expect(searchCourse('私人测试内容', { '1-1': '私人测试内容' }).some((g) => g.key === 'notes')).toBe(
      true,
    );
    expect(searchCourse('私人测试内容').some((g) => g.key === 'notes')).toBe(false);
  });
  it('加密可往返，错口令、篡改、过期均拒绝，不把 Base64 当加密', async () => {
    vi.stubGlobal('crypto', webcrypto);
    const p = freshProgress();
    p.notes['1-1'] = '私密笔记';
    const now = Date.now(),
      code = await encryptBackup(p, 'temporary-password', now);
    expect(code).toMatch(/^AQ1\./);
    expect(JSON.parse(await decryptBackup(code, 'temporary-password', now))).toEqual(p);
    await expect(decryptBackup(code, 'wrong-password', now)).rejects.toThrow('口令');
    await expect(decryptBackup(code, 'temporary-password', now + 86400001)).rejects.toThrow('24 小时');
    const bundle = JSON.parse(atob(code.slice(4)));
    bundle.expires++;
    await expect(
      decryptBackup('AQ1.' + btoa(JSON.stringify(bundle)), 'temporary-password', now),
    ).rejects.toThrow('损坏');
  });
});
