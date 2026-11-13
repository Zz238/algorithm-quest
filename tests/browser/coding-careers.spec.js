import { test, expect } from '@playwright/test';
import { editCodingBody, editJavaCode } from './editor-helpers.js';
import { buildLearnerProgram } from '../../src/java/coding-program.js';
import { CODING_BY_ID } from '../../src/data/coding-catalog.js';

test('career routes, breadcrumbs and prerequisite-aware content remain separate from basic lessons', async ({
  page,
}) => {
  await page.goto('/#/careers');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('从会写程序，到完成一份岗位作品');
  await page.getByRole('link', { name: '查看路线与实践 →' }).first().click();
  await expect(page).toHaveURL(/#\/careers\/backend$/);
  await page
    .locator('.career-sidebar')
    .getByRole('link', { name: '4. HTTP 与 Spring Boot 接口' })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('HTTP 与 Spring Boot 接口');
  await page
    .getByRole('navigation', { name: '面包屑' })
    .getByRole('link', { name: 'Java 后端' })
    .click();
  await expect(page).toHaveURL(/#\/careers\/backend$/);
  await page.goto('/#/careers/algorithm/data');
  await expect(page.locator('.career-content')).toContainText('先划分，再拟合预处理参数');
});

test('practice search, daily review and drafts work before loading Java resources', async ({ page }) => {
  const runtime = [];
  page.on('request', (r) => {
    if (r.url().includes('cjrtnc.leaningtech.com')) runtime.push(r.url());
  });
  await page.goto('/#/practice');
  await expect(page.locator('.coding-task-list li')).toHaveCount(73);
  await page.getByRole('searchbox', { name: '搜索编程任务' }).fill('链表');
  await expect(page.locator('.coding-task-list')).toContainText('沿next数完一条链');
  await page.goto('/#/practice/code-core-3-2');
  const editor = await editCodingBody(
    page,
    '自己写一个循环累计代码',
    'code-core-3-2',
    'int total = 7;\nreturn total;',
  );
  await page.reload();
  await editor.scrollIntoViewIfNeeded();
  await expect(editor).toHaveAttribute('data-editor-mode', 'monaco');
  await expect(editor).toContainText('int total = 7;');
  await page.goto('/#/practice/review/code-core-3-2');
  await expect(page.locator('.coding-task')).toContainText('累计每项的平方');
  await expect(page.locator('.java-code-editor')).not.toContainText('int total = 7;');
  expect(runtime).toEqual([]);
});

test('a glossary tab returns to the previous lesson and its reading position', async ({
  page,
  context,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#/learn/6/2');
  await page.getByRole('button', { name: '动手编程', exact: true }).click();
  await page.waitForTimeout(250);
  const y = await page.evaluate(() => scrollY);
  const glossary = await context.newPage();
  await glossary.goto('/#/glossary/next');
  await expect(
    glossary.locator('.header').getByRole('link', { name: '基础教学', exact: true }),
  ).toHaveAttribute('href', '#/learn/6/2');
  await glossary.locator('.header').getByRole('link', { name: '基础教学', exact: true }).click();
  await expect(glossary.locator('[data-lesson="6-2"]')).toBeVisible();
  await expect.poll(() => glossary.evaluate(() => scrollY)).toBeGreaterThan(Math.max(100, y - 250));
});

test('documentation search shortcut includes career and programming material', async ({ page }) => {
  await page.goto('/#/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.keyboard.press('Control+k');
  const field = page.getByRole('searchbox', { name: '搜索课程、题目、术语、代码和笔记' });
  await expect(field).toBeFocused();
  await field.fill('均方误差');
  await expect(
    page.locator('.result-group').filter({ has: page.getByRole('heading', { name: /职业路线/ }) }),
  ).toBeVisible();
});

for (const width of [320, 390, 768, 1024, 1440])
  test('career and coding layout at ' + width + 'px', async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/careers', '/careers/backend/http', '/practice/code-core-3-2']) {
      await page.goto('/#' + path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
      ).toBe(true);
    }
  });

test('real browser Java compiles and reports all course test cases', async ({ page }) => {
  test.setTimeout(180000);
  await page.goto('/#/practice/code-core-3-2');
  await editCodingBody(
    page,
    '自己写一个循环累计代码',
    'code-core-3-2',
    'int sum=0;\nfor(int x:a)sum+=x;\nreturn sum;',
  );
  await page.getByRole('button', { name: '提交全部测试', exact: true }).click();
  await expect(page.locator('.runtime-consent')).toBeVisible();
  await page.locator('.runtime-consent .primary').click();
  await expect(page.locator('.coding-result')).toContainText('测试通过 3 / 3', { timeout: 150000 });
  await expect(page.locator('.coding-badge')).toHaveText('曾独立通过');
  await page.reload();
  await expect(page.locator('.coding-badge')).toHaveText('曾独立通过');
});
test('a task keeps its complete Main file and runs the edited main separately from judged tests', async ({
  page,
}) => {
  test.setTimeout(180000);
  const task = CODING_BY_ID['code-greeting'];
  await page.goto('/#/practice/' + task.id);
  const source = buildLearnerProgram(task, 'return "你好，" + name;').replace(
    task.cases[0][0],
    'greet("新同学")',
  );
  const editor = await editJavaCode(page, task.title + '代码', source);
  await expect(page.locator('.coding-method-signature')).toHaveCount(0);
  await expect(editor.locator('.view-lines')).toContainText('public class Main');
  await expect(editor.locator('.view-lines')).toContainText('public static String greet');
  await expect(editor.locator('.view-lines')).toContainText('public static void main');
  await page.getByRole('button', { name: '运行示例', exact: true }).click();
  await expect(page.locator('.runtime-consent')).toBeVisible();
  await page.locator('.runtime-consent .primary').click();
  await expect(page.locator('.coding-result')).toContainText('程序已执行完成', { timeout: 150000 });
  await expect(page.locator('.coding-result')).toContainText('你好，新同学');
  await expect(page.locator('.coding-badge')).toHaveCount(0);
  await page.getByRole('button', { name: '提交全部测试', exact: true }).click();
  await expect(page.locator('.coding-result')).toContainText(
    `测试通过 ${task.cases.length} / ${task.cases.length}`,
    { timeout: 150000 },
  );
  await page.reload();
  await editor.scrollIntoViewIfNeeded();
  await expect(editor).toHaveAttribute('data-editor-mode', 'monaco');
  await expect(page.locator('.java-code-editor')).toContainText('新同学');
});
