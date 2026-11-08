import { test, expect } from '@playwright/test';

const skin = (element) => {
  const s = getComputedStyle(element);
  return {
    background: s.backgroundColor,
    border: s.borderColor,
    width: s.borderWidth,
    outline: s.outlineStyle,
    duration: s.transitionDuration,
  };
};

test('lab buttons respond once, keep border width, and morph play into pause', async ({ page }) => {
  await page.goto('/#/learn/4/1?at=lesson-experiment&step=0&example=1');
  const next = page.getByRole('button', { name: '下一条', exact: true });
  const before = await next.evaluate(skin);
  const focusHex = await page
    .locator('html')
    .evaluate((el) => getComputedStyle(el).getPropertyValue('--selection-border').trim());
  const focusColor =
    'rgb(' +
    focusHex
      .slice(1)
      .match(/../g)
      .map((value) => parseInt(value, 16))
      .join(', ') +
    ')';
  await next.hover();
  await expect
    .poll(() => next.evaluate((el) => getComputedStyle(el).backgroundColor))
    .not.toBe(before.background);
  await next.click();
  await expect(page.locator('.trace-lab [type=range]')).toHaveValue('1');
  await expect(next.locator('.ui-ripple')).toHaveCount(1);
  await expect.poll(() => next.evaluate((el) => getComputedStyle(el).borderColor)).toBe(focusColor);
  expect((await next.evaluate(skin)).width).toBe(before.width);
  expect((await next.evaluate(skin)).outline).toBe('none');
  await page.getByRole('button', { name: '自动播放', exact: true }).click();
  await expect(page.getByRole('button', { name: '暂停', exact: true }).locator('svg')).toHaveAttribute(
    'data-icon',
    'pause',
  );
  await page.getByRole('button', { name: '暂停', exact: true }).click();
  await expect(
    page.getByRole('button', { name: '自动播放', exact: true }).locator('svg'),
  ).toHaveAttribute('data-icon', 'play');
});

test('segmented mode can be selected by keyboard and search clearing preserves focus', async ({
  page,
}) => {
  await page.goto('/#/learn/4/1');
  const modes = page.getByRole('group', { name: '实验推演模式' });
  await modes.getByRole('button', { name: '自由推演', exact: true }).press('ArrowRight');
  await expect(modes.getByRole('button', { name: '先预测再走', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('button', { name: '自动播放', exact: true })).toBeDisabled();
  await page.goto('/#/');
  const search = page.getByRole('searchbox', { name: '搜索课程与笔记' });
  await search.fill('二分');
  await page.getByRole('button', { name: '清空搜索课程与笔记', exact: true }).click();
  await expect(search).toHaveValue('');
  await expect(search).toBeFocused();
  await expect(page.locator('.course-path')).toBeVisible();
});

test('copy shows success only after the copy action and retains Java downloading', async ({ page }) => {
  await page.goto('/#/learn/5/2?at=lesson-code');
  const reader = page.locator('#lesson-code .code-reader');
  const copy = reader.getByRole('button', { name: '复制', exact: true });
  await expect(copy.locator('svg')).toHaveAttribute('data-icon', 'copy');
  await copy.click();
  await expect(copy.locator('svg')).toHaveAttribute('data-icon', 'check');
  await expect(reader.locator('.code-header-actions small').first()).toContainText('已复制');
  const downloadPromise = page.waitForEvent('download');
  await reader.getByRole('button', { name: '下载方法版', exact: true }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('Solution.java');
});

test('new controls fit a small screen and the project checkbox still persists', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/#/review/transfer-1');
  const checkbox = page.getByRole('checkbox', {
    name: '我已核对输入输出、解释选择理由，并尝试了一组不同数据。',
  });
  await checkbox.check();
  await page.reload();
  await expect(checkbox).toBeChecked();
  expect(await checkbox.evaluate((el) => el.getBoundingClientRect().width)).toBe(22);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/#/learn/9/2?at=lesson-experiment');
  await expect(page.getByRole('group', { name: '二叉树遍历顺序' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('reduced motion keeps all actions usable with static feedback', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#/learn/4/1?at=lesson-experiment&step=0&example=1');
  const next = page.getByRole('button', { name: '下一条', exact: true });
  await next.click();
  await expect(page.locator('.trace-lab [type=range]')).toHaveValue('1');
  expect(await next.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe('0s');
  await expect(next.locator('.ui-ripple')).not.toBeVisible();
  expect(
    await page
      .locator('.ui-segment-thumb')
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe('0s');
});
