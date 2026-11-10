import { expect } from '@playwright/test';
import { buildLearnerProgram } from '../../src/java/coding-program.js';
import { CODING_BY_ID } from '../../src/data/coding-catalog.js';
export async function editJavaCode(page, label, source) {
  const editor = page
    .locator('.java-code-editor')
    .filter({ has: page.getByText(label, { exact: true }) });
  await editor.scrollIntoViewIfNeeded();
  await expect(editor).toHaveAttribute('data-editor-mode', 'monaco', { timeout: 20000 });
  const input = editor.locator('textarea.inputarea');
  await input.click();
  // Input.insertText is treated as typing by Monaco and can add a closing brace
  // to a complete multiline program. Paste as a user would, then verify the file.
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.evaluate((text) => navigator.clipboard.writeText(text), source);
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Control+v');
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Control+c');
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(source);
  await page.keyboard.press('ArrowRight');
  return editor;
}
export function editCodingBody(page, label, id, body) {
  return editJavaCode(page, label, buildLearnerProgram(CODING_BY_ID[id], body));
}
