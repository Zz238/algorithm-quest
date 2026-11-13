import { expect } from '@playwright/test';
import { buildLearnerProgram } from '../../src/java/coding-program.js';
import { CODING_BY_ID } from '../../src/data/coding-catalog.js';
export async function editJavaCode(page, label, source) {
  await page.locator('.java-code-editor, .coding-scaffold').first().waitFor();
  const independent = page.getByRole('button', { name: '第三关 · 独立编写', exact: true });
  if (await independent.count()) await independent.click();
  const editor = page
    .locator('.java-code-editor')
    .filter({ has: page.getByText(label, { exact: true }) });
  await editor.scrollIntoViewIfNeeded();
  await expect(editor).toHaveAttribute('data-editor-mode', 'monaco', { timeout: 20000 });
  const input = editor.locator('textarea.inputarea');
  // Monaco keeps its textarea behind the visible surface (z-index: -10).
  // Click the surface to focus it rather than waiting to click that hidden layer.
  await editor.locator('.monaco-editor').click({ timeout: 10000 });
  await expect(input).toBeFocused();
  // Input.insertText is treated as typing by Monaco and can add a closing brace
  // to a complete multiline program. Paste as a user would, then verify the file.
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.evaluate((text) => navigator.clipboard.writeText(text), source);
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Control+v');
  await page.keyboard.press('Control+a');
  await page.evaluate(() => navigator.clipboard.writeText('Awaiting copied editor file'));
  await page.keyboard.press('Control+c');
  // Browser clipboard text uses CRLF; Java and Monaco accept either line ending.
  await expect
    .poll(async () => (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n'))
    .toBe(source.replace(/\r\n/g, '\n'));
  await page.keyboard.press('ArrowRight');
  return editor;
}
export function editCodingBody(page, label, id, body) {
  return editJavaCode(page, label, buildLearnerProgram(CODING_BY_ID[id], body));
}
