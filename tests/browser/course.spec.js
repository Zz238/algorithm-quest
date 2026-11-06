import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { chapters } from '../../src/data/course.js';

test('all 72 course routes load their own pictures and every chapter has an illustrated introduction', async ({
  page,
}) => {
  test.setTimeout(140_000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const c of chapters) {
    for (const [i, l] of c.lessons.entries()) {
      await page.goto('/#/learn/' + c.id + '/' + i);
      await expect(page.getByRole('heading', { name: l.title, exact: true, level: 1 })).toBeVisible();
      await expect(page.locator('.study-figures figure').first()).toBeVisible();
      if (i === 0) await expect(page.locator('.chapter-figures svg[role="img"]')).toHaveCount(3);
    }
  }
  expect(errors).toEqual([]);
});

test('chapter scenario switches its input and diagram together, and restores exercise hints', async ({
  page,
}) => {
  await page.goto('/#/boss/10');
  const first = page.locator('.study-case .study-question').first();
  await first.getByRole('button', { name: '给我一点提示' }).click();
  await page.getByRole('button', { name: '展开题解' }).click();
  await page.getByRole('button', { name: '情境 2', exact: true }).click();
  await expect(page.getByRole('button', { name: '情境 2', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  const inputs = chapters[9].boss.cases[1].input;
  expect(JSON.parse(await page.getByLabel('当前实验使用的情境数据').textContent())).toEqual(inputs);
  await expect(page.locator('.trace-lab svg[role="img"]')).toHaveAttribute('aria-label', /网格各行/);
  await page.reload();
  await expect(first.getByLabel('分层提示')).toBeVisible();
  await expect(page.getByRole('button', { name: '情境 2', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('notes are searchable and back/forward restores reading position with focus on the heading', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#/learn/6/2');
  const note = page.getByLabel('本节私人笔记');
  await note.fill('周日复习专用 879：先接住后半段');
  await expect(page.getByText('已保存在本机', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '图解', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
  await expect
    .poll(() => page.locator('#lesson-figures').evaluate((e) => e.getBoundingClientRect().top))
    .toBeLessThan(240);
  const y = await page.evaluate(() => window.scrollY);
  await page
    .getByRole('navigation', { name: '主导航' })
    .getByRole('button', { name: '搜索', exact: true })
    .click();
  await page.getByRole('searchbox').fill('专用 879');
  await expect(page.locator('.result-group').getByRole('heading', { name: /私人笔记/ })).toBeVisible();
  await page.goBack();
  await expect(page.locator('main h1')).toBeFocused();
  await expect
    .poll(async () => Math.abs((await page.evaluate(() => window.scrollY)) - y))
    .toBeLessThan(30);
  await expect(note).toHaveValue('周日复习专用 879：先接住后半段');
  await page.goto('/#/learn/6/no');
  await expect(page.getByRole('heading', { name: '没有找到这个页面' })).toBeFocused();
});

test('import preview does not change data until confirmed, and notes reset leaves study progress', async ({
  page,
}) => {
  await page.goto('/#/progress');
  const payload = {
    name: 'guest.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ version: 1, lessons: ['1-1'], notes: { '1-1': '旧笔记' } })),
  };
  await page.locator('input[type="file"]').setInputFiles(payload);
  await expect(page.getByRole('heading', { name: '导入预览' })).toBeVisible();
  await expect(page.getByText('旧笔记', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '确认合并' }).click();
  await expect(page.getByText('旧笔记', { exact: true })).toBeVisible();
  await page.getByText('重置学习数据', { exact: true }).click();
  await page.getByRole('button', { name: '仅清空笔记' }).click();
  await page.getByRole('button', { name: '确认重置' }).click();
  await expect(page.getByText('旧笔记', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('progressbar', { name: '基础阅读完成度' })).toHaveAttribute(
    'aria-valuenow',
    '1',
  );
});

for (const [width, height] of [
  [320, 800],
  [375, 812],
  [768, 1024],
  [1024, 768],
  [1440, 900],
  [812, 375],
  [720, 450],
]) {
  test(
    'layout at ' + width + '×' + height + ' has no page overflow and the lab controls remain usable',
    async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/#/learn/4/1');
      await page.getByRole('button', { name: '图解', exact: true }).click();
      await page.getByRole('button', { name: '用本节示例查看实验第 5 步' }).click();
      await expect(page.locator('.trace-output')).toHaveText(/本次结果\s*2/);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
      ).toBe(true);
      if (width <= 720) {
        const height = await page
          .getByRole('button', { name: '上一条', exact: false })
          .evaluate((el) => el.getBoundingClientRect().height);
        expect(height).toBeGreaterThanOrEqual(44);
      }
    },
  );
}

test('downloaded HTML works as file:// without network and can save a note and download a Java example', async ({
  page,
}) => {
  const remote = [];
  page.on('request', (request) => {
    if (/^https?:/.test(request.url())) remote.push(request.url());
  });
  await page.goto(pathToFileURL(path.resolve('offline.html')).href + '#/learn/6/2');
  await expect(page.locator('.study-figures figure')).toHaveCount(3);
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.getByLabel('本节私人笔记').fill('离线笔记');
  await page.reload();
  await expect(page.getByLabel('本节私人笔记')).toHaveValue('离线笔记');
  await page.getByRole('button', { name: '打开全部笔记' }).click();
  await expect(page.getByRole('heading', { name: '私人学习笔记' })).toBeVisible();
  await page.getByRole('button', { name: '回小节编辑' }).click();
  await page.locator('details.code-stage > summary').click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载方法版', exact: true }).click();
  expect((await download).suggestedFilename()).toBe('Solution.java');
  expect(remote).toEqual([]);
});
