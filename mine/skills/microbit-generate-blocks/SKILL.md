---
name: microbit-generate-blocks
description: Generates a MakeCode main.blocks XML file from a TypeScript main.ts file by using Playwright browser automation with Microsoft MakeCode for micro:bit and extracting from IndexedDB.
---

# Micro:bit Generate Blocks Skill

## Overview

This skill guides the agent in converting a local TypeScript `main.ts` file for micro:bit into a MakeCode Blockly XML file (`main.blocks`).

Since MakeCode compiles TypeScript to visual blocks inside the browser runtime and stores workspace states in IndexedDB, we automate project creation, code injection, block compilation, and XML extraction via Playwright.

---

## When to Use

- When you have a local `main.ts` micro:bit TypeScript file and need to generate its corresponding `main.blocks` file.
- When creating a complete MakeCode project repository with both code and visual block definitions.
- When updating `main.blocks` after modifying `main.ts`.

---

## Prompt Examples (起動プロンプト例)

- 「`main.ts` から `main.blocks` XML ファイルを生成して」
- 「TypeScript コードを編集したので、MakeCode の IndexedDB 経由でビジュアルブロック定義 (`main.blocks`) を抽出し更新して」
- 「ローカルの `main.ts` を MakeCode に読み込ませて `main.blocks` と `pxt.json` を最新状態にして」

---

## Pre-check (Skip Generation Logic)

Before proceeding with generation, verify whether `main.blocks` needs to be updated:
1. Check if `main.blocks` exists.
2. Compare the file modification times (`mtime`) of `main.ts` and `main.blocks`.
3. **If `main.blocks` exists and `main.blocks` mtime >= `main.ts` mtime**:
   - `main.blocks` is already up to date. Skip the generation process.
4. **Otherwise** (if `main.blocks` does not exist or `main.ts` is newer than `main.blocks`):
   - Proceed with the generation steps below.

---

## Steps

### Step 1: Open MakeCode Editor
Navigate to the MakeCode micro:bit editor using Playwright:
```javascript
// URL: https://makecode.microbit.org/
```

### Step 2: Create a New Project & Inject TypeScript Code
In the browser context via `browser_evaluate` or Playwright script:
1. Click the **New Project** (新しいプロジェクト) card and specify a project name.
2. Switch to **JavaScript (TypeScript)** mode.
3. Inject the `main.ts` code into Monaco Editor:
   ```javascript
   const codeText = `...YOUR_MAIN_TS_CODE...`;
   const models = window.monaco.editor.getModels();
   if (models && models.length > 0) {
     models[0].setValue(codeText);
   }
   ```

### Step 3: Switch to Blocks View
Click the **Blocks** (ブロック) view button to trigger reverse compilation (TypeScript -> Blocks):
```javascript
const blockBtn = document.querySelector('.blocks-menuitem') || document.querySelector('#command-blocks');
if (blockBtn) blockBtn.click();
// Wait 4-5 seconds for block rendering and IndexedDB sync
```

### Step 4: Extract `main.blocks` XML from IndexedDB
Fetch the generated `main.blocks` XML string directly from MakeCode's IndexedDB (`__pxt_idb_workspace_microbit_v9` -> `texts` store):
```javascript
async () => {
  return new Promise((resolve) => {
    const req = indexedDB.open("__pxt_idb_workspace_microbit_v9");
    req.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction("texts", "readonly");
      const store = tx.objectStore("texts");
      const getAllReq = store.getAll();
      getAllReq.onsuccess = () => {
        const texts = getAllReq.result;
        const target = texts.find(t => t && t.files && t.files["main.blocks"]);
        resolve(target ? target.files["main.blocks"] : null);
      };
    };
  });
}
```

### Step 5: Save `main.blocks` & Update `pxt.json`
1. Write the extracted XML string into `main.blocks` in the project directory.
2. Add `"main.blocks"` to the `"files"` array in `pxt.json` if not already present.

---

## Verification Checklist

- [ ] A new project is created in MakeCode for micro:bit.
- [ ] TypeScript code is injected and converted to blocks without syntax errors.
- [ ] `main.blocks` XML is extracted from IndexedDB and saved to the project directory.
- [ ] `pxt.json` includes `"main.blocks"` under `"files"`.
- [ ] `npx pxt build` completes successfully.
