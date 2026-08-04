---
name: microbit-block-reviewer
description: MakeCode micro:bit 用の Python/TypeScript コードをレビューし、MakeCode ブロックエディタへの正常変換性・表示崩れ・非対応構文・エラーの検出と最適化提案を行います。
---

# Micro:bit Block Reviewer Skill

## Overview

This skill guides the agent in reviewing Python (Static Python) and TypeScript code for micro:bit to ensure full compatibility with the Microsoft MakeCode visual block editor.

When writing Python code for MakeCode, using unsupported Python syntax or standard MicroPython methods (like `import microbit` or `time.sleep()`) will result in compilation errors or "grey blocks" (fallback TypeScript blocks that cannot be visually edited as standard MakeCode blocks). This skill provides both static review guidelines and automated Playwright verification procedures.

---

## When to Use

- Before importing or writing Python/TypeScript code for MakeCode micro:bit.
- When Python code fails to render as clean MakeCode visual blocks.
- When reviewing MakeCode compatibility and suggesting refactoring from standard MicroPython to MakeCode Python APIs.

---

## Static Review Guidelines

### 1. API Mapping Check (MicroPython vs. MakeCode Python)

MakeCode uses **Static Python** with its own API module hierarchy instead of the standard MicroPython `microbit` module.

| Standard MicroPython (`import microbit`) | MakeCode Python API | Notes |
|---|---|---|
| `from microbit import *` | *(Do not import `microbit`)* | MakeCode exposes global modules (`basic`, `input`, `led`, `music`, `radio`, etc.) |
| `display.show(Image.HAPPY)` | `basic.show_icon(IconNames.HAPPY)` | Use `basic.show_icon` or `basic.show_leds(...)` |
| `display.scroll("Hello")` | `basic.show_string("Hello")` | Use `basic.show_string` |
| `sleep(1000)` / `time.sleep(1)` | `basic.pause(1000)` | Duration is in milliseconds |
| `button_a.is_pressed()` | `input.button_is_pressed(Button.A)` | Event-based `input.on_button_pressed()` is preferred in blocks |
| `pin0.read_analog()` | `pins.analog_read_pin(AnalogPin.P0)` | Pin APIs live in `pins` module |

### 2. Block Conversion Constraints

To ensure MakeCode can represent the Python code as standard visual blocks:

- **Avoid Complex Python Syntax**:
  - Do NOT use `*args`, `**kwargs`, lambda functions, or custom class inheritance (`class MyDevice(Base):`).
  - Avoid list comprehensions (`[x*2 for x in items]`) — use explicit `for` loops instead.
  - Avoid `try / except` blocks — MakeCode block editor does not have exception handling blocks.
  - Avoid unsupported standard libraries (`import sys`, `import math`, `import random`). Use MakeCode modules like `Math` or `randint()` instead.

- **Event Handlers & Program Structure**:
  - Prefer event handlers for inputs:
    ```python
    def on_button_pressed_a():
        basic.show_icon(IconNames.HAPPY)
    input.on_button_pressed(Button.A, on_button_pressed_a)
    ```
  - For continuous loops, prefer `basic.forever()` or a simple `while True:` loop inside top-level code.

---

## Automated Verification Protocol (Playwright)

To verify whether a given Python file converts cleanly to blocks in MakeCode:

### Step 1: Inject Code into MakeCode
Follow the `microbit-import-python` skill to:
1. Open `https://makecode.microbit.org/`
2. Create a temporary project.
3. Switch to **Python** mode.
4. Set Monaco editor content to the target Python code.

### Step 2: Switch to Block View & Capture Status
Click the "Convert to Blocks" (プログラムをブロックに変換する) button:
```javascript
async (page) => {
  await page.getByRole('button', { name: 'プログラムをブロックに変換する。' }).click();
  await page.waitForTimeout(3000);
}
```

### Step 3: Check for Conversion Warnings/Errors
Inspect the DOM for block conversion failures:
```javascript
async (page) => {
  // Check for error modal / dialogs
  const errorDialog = await page.locator('.ui.modal.error, .compilation-error-widget').count();
  
  // Check for grey fallback blocks in workspace
  const greyBlocks = await page.locator('g.blocklyDraggable.blocklyDisabled, g.ui-grey-block').count();
  
  return {
    hasErrorDialog: errorDialog > 0,
    greyBlockCount: greyBlocks
  };
}
```

---

## Review Output Format

When reviewing code, structure your feedback as follows:

1. **Compatibility Status**: PASS / WARNING / FAIL
2. **Detected Issues**: List specific lines with non-convertible syntax or MicroPython API mismatches.
3. **Refactored Code**: Provide a fully compatible MakeCode Python snippet that cleanly renders as blocks.
