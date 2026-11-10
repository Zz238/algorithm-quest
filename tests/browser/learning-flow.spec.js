import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

async function header(page, name) {
  const link = page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name, exact: true });
  const box = await link.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

test('home returns to the interrupted lesson and its real lab step, separately from the ordered route', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#/learn/6/0?at=lesson-experiment&step=2&example=1');
  await expect(page.locator('.trace-lab [type=range]')).toHaveValue('2');
  await expect(page.locator('.trace-current')).toContainText('通过 b 修改');
  const y = await page.evaluate(() => scrollY);
  await header(page, '基础教学');
  await expect(page.locator('.hero-next')).toContainText('上次停在：逐步实验 · 第 3 步');
  await expect(page.getByRole('link', { name: '按课程顺序继续' })).toHaveAttribute(
    'href',
    '#/java/print',
  );
  await page.getByRole('link', { name: '回到上次学习' }).click();
  await expect(page.locator('.trace-lab [type=range]')).toHaveValue('2');
  await expect.poll(async () => Math.abs((await page.evaluate(() => scrollY)) - y)).toBeLessThan(35);
  await page.reload();
  await expect(page.locator('.trace-current')).toContainText('通过 b 修改');
});

test('a note reference restores the exact custom input and step after visiting the notebook', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const input = encodeURIComponent(JSON.stringify({ array: '7,8,9', i: 0 }));
  await page.goto('/#/learn/4/1?at=lesson-experiment&step=4&input=' + input);
  await expect(page.locator('.trace-output')).toContainText('8');
  await page.getByRole('button', { name: '记下当前这一步', exact: true }).click();
  await expect(page.getByLabel('本节私人笔记')).toHaveValue(/step=4/);
  await page.getByRole('button', { name: '打开全部笔记' }).click();
  await expect(page.getByRole('heading', { name: '私人学习笔记' })).toBeVisible();
  await page.locator('.note-reference-list').getByRole('link').first().click();
  await expect(page.locator('.trace-lab [type=range]')).toHaveValue('4');
  await expect(page.getByLabel('实验数组a')).toHaveValue('7,8,9');
  await expect(page.locator('.trace-output')).toContainText('8');
});

test('pin and font preferences survive reload and small screens keep only one panel open', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto('/#/learn/6/0');
  await page.getByLabel('正文字号').selectOption('20');
  await page.getByRole('button', { name: '打开学习笔记' }).click();
  await page.getByRole('button', { name: '固定展开', exact: true }).click();
  await page.getByLabel('本节私人笔记').fill('偏好与笔记保留');
  await page.reload();
  await expect(page.getByLabel('正文字号')).toHaveValue('20');
  await expect(page.getByLabel('本节私人笔记')).toBeVisible();
  await expect(page.getByLabel('本节私人笔记')).toHaveValue('偏好与笔记保留');
  await page.getByRole('button', { name: '取消固定', exact: true }).click();
  await expect(page.getByRole('button', { name: '打开学习笔记' })).toBeFocused();
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole('button', { name: '打开学习笔记' }).click();
  await expect(page.getByRole('dialog', { name: '学习笔记', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: '打开学习笔记' })).toBeFocused();
  await page.getByRole('button', { name: '跳转到其他章节' }).click();
  await expect(page.getByRole('dialog', { name: '跳转到其他章节', exact: true })).toBeVisible();
  await expect(page.getByRole('dialog', { name: '学习笔记', exact: true })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: '跳转到其他章节' })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('diagrams zoom in an accessible dialog and Escape returns focus to the opener', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/#/learn/6/0');
  const opener = page.getByRole('button', { name: '放大图解：创建一份数组 A=[1,2]', exact: true });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: '创建一份数组 A=[1,2]', exact: true });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('combobox').selectOption('2');
  await expect(dialog.locator('svg[role=img]')).toHaveAttribute('aria-label', /a 引用数组 \[1,2\]/);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('merge exposes real phase stops, retains speed, and rebuilds a chosen input', async ({ page }) => {
  await page.goto('/#/learn/8/2');
  const phase = page.getByLabel('实验阶段定位');
  const option = phase.locator('option').filter({ hasText: '逐格写回' });
  await phase.selectOption(await option.getAttribute('value'));
  await expect(page.locator('.trace-current')).toContainText('逐格写回');
  await page.getByLabel('实验播放速度').selectOption('2');
  const start = await page.locator('.trace-lab [type=range]').inputValue();
  await page.getByRole('button', { name: '自动播放', exact: true }).click();
  await expect.poll(() => page.locator('.trace-lab [type=range]').inputValue()).not.toBe(start);
  await page.getByRole('button', { name: '暂停', exact: true }).click();
  await page.getByRole('button', { name: '逆序', exact: true }).click();
  await expect(page.getByLabel('实验数组a')).toHaveValue('3,2,1');
  await expect(page.locator('.trace-lab [type=range]')).toHaveValue('0');
  await expect(page.getByLabel('实验播放速度')).toHaveValue('2');
  await expect(page.locator('.trace-error')).toHaveCount(0);
});

test('specific boundary feedback links back to teaching, while an unrecognized equivalent code is unverified', async ({
  page,
}) => {
  await page.goto('/#/learn/3/3');
  const question = page.locator('.lesson-practice .study-question').first();
  await question.getByRole('button', { name: /能，因为i合法/ }).click();
  await question.getByRole('button', { name: '检查答案', exact: true }).click();
  await expect(question.locator('.mini-feedback')).toContainText('i+1=3');
  await question.getByRole('button', { name: '回到对应概念与图解' }).click();
  await expect(page.getByRole('heading', { name: '先判是否存在下一格', exact: true })).toBeFocused();
  await page.goto('/#/learn/5/2');
  const code = page.locator('.lesson-practice .study-question').last();
  await code.getByRole('textbox').fill('!(i >= end)');
  await code.getByRole('button', { name: '检查答案', exact: true }).click();
  await expect(code.locator('.mini-feedback')).toContainText('需要运行验证');
  await expect(code.locator('.mini-feedback')).not.toHaveClass(/error/);
});

test('all four stage projects preserve a private worksheet and produce runnable Java downloads', async ({
  page,
}) => {
  for (let i = 1; i <= 4; i++) {
    await page.goto('/#/review/transfer-' + i);
    await page.getByLabel('1. 我拿到什么，要交出什么？').fill('项目' + i + '的输入输出');
    await page.getByLabel('2. 我为什么选这种办法？每一步做什么？').fill('我的选择理由');
    await page.reload();
    await expect(page.getByLabel('1. 我拿到什么，要交出什么？')).toHaveValue('项目' + i + '的输入输出');
    await page.locator('.java-write-task > summary').click();
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: '下载自己的 Main.java', exact: true }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('Main.java');
    const source = await readFile(await download.path(), 'utf8');
    expect(source).toContain('public class Main');
    expect(source).toContain('public static void main(String[] args)');
    await expect(page.locator('.project-worksheet')).toContainText('与账号中的练习进度分别保存');
  }
});

test('feedback is a reviewable draft and does not auto-publish or include private notes', async ({
  page,
}) => {
  const outgoing = [];
  page.on('request', (r) => {
    if (/github\.com/.test(r.url())) outgoing.push(r.url());
  });
  await page.goto('/#/learn/6/0');
  await page.getByRole('button', { name: '打开学习笔记' }).click();
  await page.getByLabel('本节私人笔记').fill('private-note-853-not-for-feedback');
  await page.getByRole('button', { name: '关闭学习笔记' }).click();
  await page.locator('.content-feedback > summary').click();
  await page.getByLabel('哪一句或哪一步让你卡住了？').fill('看不出 b 的箭头为什么这样连');
  const url = await page.getByRole('link', { name: '到 GitHub 核对并提交' }).getAttribute('href');
  const body = new URL(url).searchParams.get('body');
  expect(body).toContain('6-5');
  expect(body).toContain('b 的箭头');
  expect(body).not.toContain('private-note-853');
  expect(outgoing).toEqual([]);
});
