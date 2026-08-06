---
name: microbit-pxt-sync
description: Syncs micro:bit TypeScript source files (src/*) into main.ts, generates main.blocks via Playwright automation, and builds binary.hex.
---

# Micro:bit PXT Sync Skill

## Overview

This skill automates the synchronization process for local micro:bit repositories that follow a "Single Source of Truth" structure (`src/*` as primary logic).

Since MakeCode compiles TypeScript to visual blocks inside the browser runtime and stores workspace states in IndexedDB, we automate project creation, code injection, block compilation, and XML extraction via Playwright.

---

## When to Use

- When `src/*` (or `src/compass.ts`, etc.) is updated, and the changes need to be propagated to `main.ts`, `main.blocks`, and `built/binary.hex`.
- Before running unit tests or E2E tests.
- After pull/checkout operations to make sure the build artifacts are up to date.

---

## How to Execute

Run the global synchronization tool located within this skill directory using `tsx` or `npm run` (if defined in `package.json`):

```bash
# General invocation using npx and the global skill path:
npx tsx ~/.gemini/config/skills/microbit-pxt-sync/scripts/sync-tool.ts
```

Note: If the project already defines npm scripts (e.g. `npm run sync` referencing the local script), you may use them, but this skill's `sync-tool.ts` can be used to synchronize any compliant project dynamically.

---

## Project Structure Conventions

To use this skill, the target project should adhere to the following file layout:

```text
project-root/
├── pxt.json             <-- Micro:bit project configuration
├── src/
│   ├── app.ts           <-- Entry point script containing execution loops (e.g. basic.forever)
│   └── *.ts             <-- Core module/logical scripts (e.g. compass.ts)
└── sync-config.json     <-- (Optional) Custom configuration
```

### Optional Configuration (`sync-config.json`)

You can place a `sync-config.json` at the root of the project to customize the sync process:

```json
{
  "entry": "src/app.ts",
  "excludePatterns": [
    "enum\\s+ArrowNames\\s*\\{[\\s\\S]*?\\}"
  ]
}
```

- `entry`: Specifies the path to the application entry script relative to the project root. (Defaults to `src/app.ts`)
- `excludePatterns`: A list of regex strings to remove from compiled module files before generating `main.ts` (useful to strip mocked types/enums that conflict with standard micro:bit APIs).

---

## Verification Checklist

- [ ] `main.ts` is generated correctly by combining the modules and the entry code.
- [ ] MakeCode editor receives the code in Monaco, processes it, and generates the `main.blocks` XML.
- [ ] `binary.hex` is successfully built via `pxt build`.
