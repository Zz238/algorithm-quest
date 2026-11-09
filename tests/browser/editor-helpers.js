import { expect } from '@playwright/test';
export async function editJavaCode(page, label, source) {
  const editor = page
    .locator('.java-code-editor')
    .filter({ has: page.getByText(label, { exact: true }) });
  await editor.scrollIntoViewIfNeeded();
  await expect(editor).toHaveAttribute('data-editor-mode', 'monaco', { timeout: 20000 });
  await editor.locator('.monaco-editor').click();
  await page.keyboard.press('Control+a');
  await page.keyboard.insertText(source);
  return editor;
}
