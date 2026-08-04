import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test('Import Python code to MakeCode', async ({ page }) => {
  // Read the Python code from the hello-microbit-python project
  const pythonCodePath = path.resolve(__dirname, '../../hello-microbit-python/main.py');
  const pythonCode = fs.readFileSync(pythonCodePath, 'utf8');

  console.log('Navigating to MakeCode micro:bit editor...');
  // Set viewport size to ensure elements are visible
  await page.setViewportSize({ width: 1280, height: 800 });
  // Use allowPython=1 query parameter to ensure Python editor is enabled
  await page.goto('https://makecode.microbit.org/?allowPython=1', { timeout: 60000 });
  await page.waitForLoadState('domcontentloaded');

  console.log('Clicking New Project button...');
  // Handle Japanese and English button texts
  const newProjectButton = page.locator('text=新しいプロジェクト').or(page.locator('text=New Project')).first();
  await newProjectButton.waitFor({ timeout: 15000 });
  // Click via JS inside the browser to bypass viewport constraints
  await newProjectButton.evaluate((el) => {
    const card = el.closest('.card') || el;
    (card as HTMLElement).click();
  });

  console.log('Entering project name...');
  const nameInput = page.locator('input[type="text"]:visible').first();
  await nameInput.waitFor({ timeout: 5000 });
  await nameInput.fill('hello-microbit-python-imported');

  console.log('Creating project...');
  // Click create button
  const createButton = page.locator('button:has-text("作成"):visible, button:has-text("Create"):visible, button.approve:visible').first();
  await createButton.click();

  // Wait for the workspace/editor URL to load
  console.log('Waiting for editor workspace...');
  await page.waitForURL(/#editor/, { timeout: 30000 });
  await page.waitForTimeout(5000); // Allow editor assets to settle

  // Close and surgically remove any welcome tutorial popovers or teaching bubbles that block clicks
  console.log('Removing welcome tutorials or bubbles...');
  await page.evaluate(() => {
    const overlays = document.querySelectorAll('.common-focus-trap, .teaching-bubble-container, .ui.popover, .popover, [role="dialog"]');
    overlays.forEach(el => el.remove());
  });
  await page.waitForTimeout(1000);

  console.log('Switching editor language to Python...');
  // Click JavaScript dropdown menu to reveal Python option using JS click to bypass pointer interceptors
  const jsDropdown = page.locator('#editordropdown, button:has-text("JavaScript"), div.dropdown:has-text("JavaScript")').first();
  await jsDropdown.waitFor({ timeout: 10000 });
  await jsDropdown.evaluate(el => (el as HTMLElement).click());
  await page.waitForTimeout(1000);

  // Select Python from the menu items using JS click
  const pythonOption = page.locator('.menu .item:has-text("Python"), [role="option"]:has-text("Python"), a.item:has-text("Python")').first();
  await pythonOption.waitFor({ timeout: 5000 });
  await pythonOption.evaluate(el => (el as HTMLElement).click());
  await page.waitForTimeout(3000);

  console.log('Injecting Python code into Monaco editor...');
  await page.evaluate((code) => {
    // Access global monaco instance inside MakeCode window to set code
    const anyWin = window as any;
    if (anyWin.monaco && anyWin.monaco.editor) {
      const models = anyWin.monaco.editor.getModels();
      if (models.length > 0) {
        models[0].setValue(code);
        return 'Injected via monaco model';
      }
    }
    // Fallback: Write directly to textarea input area if monaco is not directly accessible
    const textarea = document.querySelector('textarea.inputarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
      textarea.value = code;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      return 'Injected via textarea fallback';
    }
    throw new Error('Failed to find Monaco editor or textarea');
  }, pythonCode);

  console.log('Waiting for compiler to parse the code and load simulator...');
  await page.waitForTimeout(10000);

  // Take a full-page screenshot of the loaded editor with our python code
  const screenshotPath = path.resolve(__dirname, '../built/python-imported.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`Screenshot saved successfully to ${screenshotPath}`);
});
