import { test, expect } from '@playwright/test';
import { editJavaCode } from './editor-helpers.js';

test('Monaco highlights Java, completes declared members, indents and keeps undo and drafts', async ({
  page,
}) => {
  const editorRequests = [];
  page.on('request', (request) => {
    if (/monaco-java|editor\.worker/.test(request.url())) editorRequests.push(request.url());
  });
  await page.goto('/#/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(editorRequests).toEqual([]);
  await page.goto('/#/playground');
  const editor = await editJavaCode(page, 'Java 完整程序', 'int[] a = {1, 2};\na.');
  expect(editorRequests.length).toBeGreaterThan(0);
  await page.keyboard.press('Control+Space');
  await expect(editor.locator('.suggest-widget.visible')).toContainText('length');
  await page.keyboard.press('Enter');
  await expect(editor.locator('.view-lines')).toContainText('a.length');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Control+z');
  await expect(editor.locator('.view-lines')).not.toContainText('a.length');
  await page.keyboard.press('Control+a');
  await page.keyboard.insertText('int total = 7;');
  await page.keyboard.press('Home');
  await page.keyboard.press('Tab');
  await expect(editor.locator('.view-lines')).toContainText('int total = 7;');
  const tokens = await editor
    .locator('.view-line span')
    .evaluateAll((nodes) => new Set(nodes.map((n) => getComputedStyle(n).color)).size);
  expect(tokens).toBeGreaterThan(1);
  await page.reload();
  await expect(page.locator('.java-code-editor')).toHaveAttribute('data-editor-mode', 'monaco');
  await expect(page.locator('.java-code-editor .view-lines')).toContainText('int total = 7;');
});

test('real Java compilation errors become clickable editor markers, then clear after edits', async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.goto('/#/practice/code-core-3-2');
  const editor = await editJavaCode(page, '自己写一个循环累计代码', 'return unknownVariable;');
  await page.getByRole('button', { name: '运行示例', exact: true }).click();
  await expect(page.locator('.coding-result')).toContainText('编译未通过', { timeout: 150000 });
  await expect(page.locator('.diagnostic-location')).toContainText('编辑区第 1 行');
  await expect(editor.locator('.squiggly-error').first()).toBeVisible();
  await page.locator('.diagnostic-location').first().click();
  await expect(editor.locator('textarea.inputarea')).toBeFocused();
  await editJavaCode(page, '自己写一个循环累计代码', 'return 0;');
  await expect(editor.locator('.squiggly-error')).toHaveCount(0);
});

test('phones keep a usable editor and switching modes preserves code and layout', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 850 });
  await page.goto('/#/playground');
  const editor = page.locator('.java-code-editor');
  await expect(editor).toHaveAttribute('data-editor-mode', 'simple');
  await editor.getByRole('textbox', { name: 'Java 完整程序', exact: true }).fill('class Main { }');
  await editor.getByRole('button', { name: '启用专业编辑', exact: true }).click();
  await expect(editor).toHaveAttribute('data-editor-mode', 'monaco', { timeout: 20000 });
  await expect(editor.locator('.view-lines')).toContainText('class Main { }');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await editor.getByRole('button', { name: '简易编辑', exact: true }).click();
  await expect(editor.getByRole('textbox', { name: 'Java 完整程序', exact: true })).toHaveValue(
    'class Main { }',
  );
});
