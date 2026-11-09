import { test, expect } from '@playwright/test';

test('roadmap directories, stage breadcrumbs and prerequisite links lead to real lessons', async ({
  page,
}) => {
  await page.goto('/#/topics');
  await expect(page.locator('.topic-route-list li')).toHaveCount(67);
  await page.getByRole('searchbox', { name: '按专题名称筛选' }).fill('树状数组');
  await expect(page.locator('.topic-route-list li:visible')).toHaveCount(1);
  await page.locator('.topic-route-list li:visible a').click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('树状数组');
  await page
    .locator('.topic-prerequisites')
    .getByRole('link', { name: /二进制/ })
    .click();
  await expect(page).toHaveURL(/#\/topics\/bit-operations$/);
  await page
    .getByRole('navigation', { name: '面包屑' })
    .getByRole('link', { name: '进阶数据结构' })
    .click();
  await expect(page).toHaveURL(/#\/topics\/stage\/advanced-structures$/);
  await page
    .locator('.topic-route-list')
    .getByRole('link', { name: /二叉堆与优先队列/ })
    .click();
  await expect(page.locator('[data-lesson]')).toHaveAttribute('data-lesson', '9-4');
});

test('a custom trace, self-check and read marker survive reload without loading Java runtime', async ({
  page,
}) => {
  const runtime = [];
  page.on('request', (r) => {
    if (r.url().includes('cjrtnc.leaningtech.com')) runtime.push(r.url());
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#/topics/prefix-sum');
  await page.getByLabel('数组 a', { exact: true }).fill('5,-2,7');
  await page.getByLabel('左下标 l（含）', { exact: true }).fill('0');
  await page.getByLabel('右下标 r（含）', { exact: true }).fill('2');
  await page.getByRole('button', { name: '应用输入，从头推演' }).click();
  await page.getByRole('slider', { name: '定位步骤' }).focus();
  await page.getByRole('slider', { name: '定位步骤' }).press('End');
  await expect(page.locator('.topic-state')).toContainText('=10');
  const question = page.locator('.study-question').first();
  await question.getByRole('textbox').fill('8');
  await question.getByRole('button', { name: '检查答案' }).click();
  await expect(question.locator('[role=status]')).toContainText('答对了');
  await page.getByRole('button', { name: '记录本篇已读', exact: true }).click();
  await expect(page.getByRole('button', { name: '本篇已读', exact: true })).toBeDisabled();
  await page.reload();
  await expect(page.getByRole('slider', { name: '定位步骤' })).toHaveValue('4');
  await expect(page.getByLabel('数组 a', { exact: true })).toHaveValue('5,-2,7');
  await expect(question.locator('[role=status]')).toContainText('答对了');
  await expect(page.getByRole('button', { name: '本篇已读', exact: true })).toBeDisabled();
  expect(runtime).toEqual([]);
  await page.goto('/#/practice/code-topic-fenwick');
  await page.getByRole('link', { name: /树状数组：让累计表支持更新/ }).click();
  await expect(page).toHaveURL(/#\/topics\/fenwick-tree$/);
});

test('topic content stays readable at phone, tablet and desktop widths', async ({ page }) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    await page.goto('/#/topics/monotonic-queue');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('单调队列');
    const restart = page.getByRole('button', { name: '从头推演', exact: true });
    if (await restart.isEnabled()) await restart.click();
    await page.getByRole('button', { name: '下一条 →', exact: true }).click();
    await expect(page.locator('.topic-trace figcaption')).toContainText('2 /');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const trace = await page.locator('.topic-trace').boundingBox();
    expect(trace.x).toBeGreaterThanOrEqual(0);
    expect(trace.x + trace.width).toBeLessThanOrEqual(width + 1);
  }
  await page.goto('/#/topics/strongly-connected');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('强连通');
  await expect(page.locator('.topic-trace')).toContainText('固定数据');
  await expect(page.locator('.topic-trace form')).toHaveCount(0);
});
