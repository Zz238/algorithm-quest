import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
test('knowledge dependencies, execution scopes, comparisons and dark reading work in a browser', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/#/knowledge');
  await expect(page.locator('.knowledge-node')).toHaveCount(128);
  await page
    .locator('.knowledge-node')
    .filter({ has: page.locator('title', { hasText: '第 1 章' }) })
    .first()
    .click();
  await expect(page).toHaveURL(/#\/learn\/1\/0$/);
  await page.goto('/#/execution');
  await page.getByRole('button', { name: '下一步', exact: true }).click();
  await expect(page.locator('.execution-stack')).toContainText('sum(3)');
  await page.getByRole('combobox', { name: '示例', exact: true }).selectOption('linked');
  await expect(page.locator('.heap-nodes > div')).toHaveCount(3);
  const timeline = page.getByRole('slider');
  await timeline.fill(await timeline.getAttribute('max'));
  await expect(page.locator('.reference-row')).toContainText('head → N2');
  await page.goto('/#/compare');
  await page.getByRole('combobox', { name: '对比主题' }).selectOption('sorting');
  await expect(page.locator('.comparison-grid')).toContainText('归并');
  await page.getByRole('button', { name: '同步下一步' }).click();
  await expect(page.locator('.comparison-grid')).toContainText('基准');
  await page.getByRole('combobox', { name: '阅读主题', exact: true }).selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
  mkdirSync('.impeccable/review', { recursive: true });
  await page.screenshot({ path: '.impeccable/review/desktop.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('valid answers feed persisted error analysis and chapter challenges have both difficulties', async ({
  page,
}) => {
  await page.goto('/#/complexity');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('时间');
  await page.getByText('O(1) / O(1)', { exact: true }).click();
  await page
    .getByRole('button', { name: /检查|提交/ })
    .first()
    .click();
  await expect(page.locator('.mini-question')).toHaveClass(/passed/);
  await page.goto('/#/review');
  await expect(page.locator('.error-patterns')).toContainText('0 / 1');
  await page.reload();
  await expect(page.locator('.error-patterns')).toContainText('0 / 1');
  for (const id of [7, 8, 9]) {
    await page.goto('/#/boss/' + id);
    const pair = page.locator('.challenge-pair-list');
    await expect(pair).toContainText('Easy');
    await expect(pair).toContainText('Medium');
  }
});

test('guest encrypted transfer previews before merging and reports a wrong password', async ({
  page,
}) => {
  await page.goto('/#/progress');
  await page.getByText('备份、恢复与重置', { exact: true }).click();
  await page.locator('.encrypted-transfer summary').click();
  await page.locator('.encrypted-transfer input').fill('temporary-password');
  await page.getByRole('button', { name: '生成加密数据串', exact: true }).click();
  await expect(page.locator('.encrypted-transfer textarea')).toHaveValue(/^AQ1\./);
  await page.locator('.encrypted-transfer input').fill('wrong-password');
  await page.getByRole('button', { name: '解密并预览导入', exact: true }).click();
  await expect(page.locator('.backup-error')).toContainText('口令');
  await page.locator('.encrypted-transfer input').fill('temporary-password');
  await page.getByRole('button', { name: '解密并预览导入', exact: true }).click();
  await expect(page.locator('.backup-preview')).toBeVisible();
  await page.getByRole('button', { name: '确认合并', exact: true }).click();
  await expect(page.locator('.backup-preview')).toHaveCount(0);
});

test('touch devices get highlighted readonly code and hand calculation without runtime requests', async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:4173',
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const requests = [],
    errors = [];
  page.on('request', (r) => {
    if (/cjrtnc|monaco-java|editor\.worker/.test(r.url())) requests.push(r.url());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/#/practice/code-greeting');
  await expect(page.locator('.readonly-java')).toBeVisible();
  await page.locator('.readonly-java summary').click();
  await expect(page.locator('.syntax-keyword').first()).toBeVisible();
  await expect(page.locator('.java-run-panel')).toHaveCount(0);
  await expect(page.locator('.mini-question')).toBeVisible();
  await page.getByRole('combobox', { name: '阅读主题', exact: true }).selectOption('dark');
  await page.evaluate(() => {
    document.activeElement?.blur();
    window.scrollTo(0, 0);
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
  mkdirSync('.impeccable/review', { recursive: true });
  await page.screenshot({ path: '.impeccable/review/mobile.png', fullPage: true });
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
  await context.close();
});
