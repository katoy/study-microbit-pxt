---
name: microbit-build-and-open
description: Builds a MakeCode/micro:bit project locally and loads the resulting .hex file into the MakeCode editor. It supports opening via the local MakeCode desktop application directly or simulating a drag-and-drop file drop event in Playwright.
---

# Micro:bit Build and Open Skill

## Overview

This skill guides the agent in building a Micro:bit MakeCode project locally and importing the resulting `.hex` file into the MakeCode editor. It supports two options:
- **Option A (Local Desktop App)**: Opening the hex file directly using the installed MakeCode desktop application.
- **Option B (Browser Simulation)**: Simulating a drag-and-drop file drop event in Playwright to import the hex file into the browser-based editor.

## When to Use

- When modifying TypeScript/Blocks code in a MakeCode project.
- When verifying that a local build passes.
- When validating that the generated `.hex` file can be successfully imported and run.

---

## Prompt Examples (起動プロンプト例)

- 「Micro:bit プロジェクトをビルドして MakeCode エディタで開いて」
- 「ローカルで `npx pxt build` を実行して、生成された hex ファイルをブラウザの MakeCode に読み込んで」
- 「ビルドした `built/binary.hex` を MakeCode デスクトップアプリで開いて検証して」

---

## Steps

### Step 1: Build the Project Locally
Run the compile command in the project directory (where `pxt.json` is located):
```bash
npx pxt build
```
Verify that `built/binary.hex` is successfully generated.

---

### Option A: Open via MakeCode Desktop Application (Recommended if installed)
If the user's system has the MakeCode desktop application installed, you can open the compiled hex file directly.

**On macOS:**
Run the following command to open the hex file with the desktop application:
```bash
open -a "MakeCode for microbit" built/binary.hex
```

**On Windows:**
Open the hex file using the associated MakeCode application:
```bash
start "" "built/binary.hex"
```

---

### Option B: Open via Playwright File Import (Recommended for Browser)
If the desktop application is not available, use Playwright to navigate to the browser editor and import the `.hex` file via the file input element.

1. **Open MakeCode in Browser**
   Use the `browser_navigate` tool to open:
   `https://makecode.microbit.org/`

2. **Open the Import Modal**
   Execute a Playwright script to click the "Import" (読み込む) button:
   ```javascript
   async (page) => {
     // Click the last "Import" (読み込む) button in the UI
     const locator = page.locator('text=読み込む');
     await locator.last().click();
     return "Opened import modal";
   }
   ```

3. **Upload the Hex File**
   Directly select the `.hex` file using the hidden file input:
   ```javascript
   async (page) => {
     // Resolve the absolute path of the built binary.hex relative to the current workspace
     const filePath = `${process.cwd()}/built/binary.hex`;
     await page.setInputFiles('input[type="file"]', filePath);
     return `Selected file: ${filePath}`;
   }
   ```

4. **Confirm Loading**
   Click the green "Continue" (つづける) button to load the project:
   ```javascript
   async (page) => {
     await page.click('text=つづける');
     await page.waitForTimeout(5000); // Wait for the editor to load
     return "Imported project successfully";
   }
   ```

5. **Verify the Loading**
   Verify that the Page URL updates to include `#editor`, showing the loaded workspace, and take a screenshot using `browser_take_screenshot`.

---

## Verification Checklist

- [ ] `built/binary.hex` exists.
- [ ] For Option A: Desktop application opens and loads the hex file.
- [ ] For Option B: Browser URL updates to include `#editor`, showing the loaded workspace.
