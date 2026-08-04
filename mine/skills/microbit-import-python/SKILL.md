---
name: microbit-import-python
description: Imports a Python file (such as main.py) into the Microsoft MakeCode for micro:bit editor and switches to block view. It utilizes Playwright browser automation.
---

# Micro:bit Import Python Skill

## Overview

This skill guides the agent in importing a Python code file (e.g., `main.py`) into the Microsoft MakeCode for micro:bit browser editor, ensuring it compiles and switches to the visual block editor successfully.

Since MakeCode does not support direct upload of `.py` files via the import UI (which only accepts `.mkcd` or `.hex`), we must create a new project, switch to Python mode, inject the code into the Monaco Editor model, and then switch back to the blocks view.

## When to Use

- When you have a local `main.py` micro:bit file and want to open it in MakeCode.
- When you want to visualize a Python script as MakeCode blocks.
- When verifying compatibility between MicroPython scripts and MakeCode Python APIs.

---

## Steps

### Step 1: Open MakeCode in Browser
Use the `browser_navigate` tool to open:
`https://makecode.microbit.org/`

### Step 2: Create a New Project
1. Click the "New Project" (新しいプロジェクト) card:
   ```javascript
   async (page) => {
     await page.locator('.ui.card:has-text("新しいプロジェクト")').click();
   }
   ```
2. In the project creation modal:
   - Fill the project name input (ID: `projectNameInput`).
   - Click the "Create" (作成) button.
   ```javascript
   async (page) => {
     await page.locator('input#projectNameInput').fill('hello-microbit-python');
     await page.getByRole('button', { name: '作成' }).click();
   }
   ```

### Step 3: Switch to Python Mode
Click the language dropdown and select "Python":
```javascript
async (page) => {
  try {
    // Attempt direct click on python menu item
    await page.locator('.python-menuitem').click({ timeout: 2000 });
  } catch (e) {
    // If not visible, open the language dropdown first
    await page.locator('#editordropdown').click();
    await page.waitForTimeout(500);
    await page.locator('.python-menuitem').click();
  }
}
```

### Step 4: Inject the Python Code into Monaco Editor
Retrieve the content of your local Python file and inject it into the active Monaco Editor model using Playwright's `page.evaluate()`:
```javascript
async (page) => {
  const pythonCode = `YOUR_PYTHON_CODE_HERE`;

  await page.evaluate((codeText) => {
    const models = window.monaco.editor.getModels();
    if (models && models.length > 0) {
      models[0].setValue(codeText);
    }
  }, pythonCode);
  
  await page.waitForTimeout(2000); // Wait for AST changes to register
}
```

### Step 5: Convert to Blocks (Optional/Recommended)
If you want to view the injected Python code as visual blocks:
1. Click the "Blocks" (ブロック) conversion button.
2. Wait a few seconds for compile and layout.
```javascript
async (page) => {
  await page.getByRole('button', { name: 'プログラムをブロックに変換する。' }).click();
  await page.waitForTimeout(3000);
}
```

### Step 6: Verify
Take a screenshot to verify that:
- The code load is complete.
- The simulator is active.
- There are no compilation error tooltips.

---

## Verification Checklist

- [ ] A new project is successfully created in the MakeCode editor.
- [ ] Editor language switches to Python mode.
- [ ] The local Python code is set inside Monaco Editor.
- [ ] No compilation errors occur (or code is adapted to MakeCode Python).
- [ ] Visual blocks are rendered properly when switched back to Blocks view.
