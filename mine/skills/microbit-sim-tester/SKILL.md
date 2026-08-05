---
name: microbit-sim-tester
description: Playwright を活用し MakeCode micro:bit シミュレータの操作（ボタンA/B/A+B押下、加速度/シェイク/傾きセンサー等のイベント発火）をエミュレートし、5x5 LED マトリクス表示結果をスクリーンショット撮影して検証するスキル。
---

# Micro:bit Simulator Tester Skill

## Overview

This skill enables AI agents to automatically test micro:bit applications using the Playwright browser automation framework on the Microsoft MakeCode web simulator. 

Without needing physical micro:bit hardware, agents can:
- Emulate hardware button presses (Button A, Button B, and Button A+B).
- Trigger motion and sensor events (Shake, Logo Touch, Tilt, Pin Touches).
- Inspect and capture the 5x5 LED display status via automated screenshots.

---

## When to Use

- After importing a project or code via `microbit-build-and-open` or `microbit-import-python`.
- When verifying program interaction, button responses, and LED matrix animations.
- When performing automated visual regression testing or self-checking simulator behavior without physical hardware.

---

## Prompt Examples (起動プロンプト例)

- 「MakeCode シミュレータでボタン A を押したときの表示をテストしてスクリーンショットを撮影して」
- 「micro:bit の Shake (シェイク) イベントを発火させて 5x5 LED マトリクスの表示結果を検証して」
- 「シミュレータ上でボタン A+B やロゴタッチ操作を行って、正しくイベントハンドラが動作するか動作確認して」

---

## Simulator UI Structure & Elements

MakeCode's simulator is embedded inside an `iframe` or rendered as an SVG element on `https://makecode.microbit.org/`.

### Key Selectors & Controls

| Target Action | Selector / Locator Strategy | Description |
|---|---|---|
| **Simulator Iframe** | `iframe.sim-embed`, `iframe[title*="Simulator"]` | The iframe housing the interactive micro:bit board |
| **Button A** | `button#press-a`, `svg #btnA`, `.sim-button-a` | Emulates pressing Button A |
| **Button B** | `button#press-b`, `svg #btnB`, `.sim-button-b` | Emulates pressing Button B |
| **Button A+B** | `button#press-ab`, `text=A+B` | Emulates pressing both buttons simultaneously |
| **Logo Touch** | `button#press-logo`, `svg #logo` | Emulates touching the logo pin (micro:bit v2) |
| **Shake Event** | `button#press-shake`, `text=SHAKE`, `button:has-text("SHAKE")` | Triggers the accelerometer shake event |
| **5x5 LED Matrix** | `svg.sim-leds`, `rect.sim-led` | The 25 LED elements representing screen pixels |

---

## Automated Testing Protocol (Playwright)

### Step 1: Ensure Simulator is Loaded

After opening MakeCode in Playwright, wait for the simulator SVG/iframe to initialize:

```javascript
async (page) => {
  // Wait for simulator iframe or SVG element to appear
  const simElement = page.frameLocator('iframe[title*="Simulator"]').locator('svg').first();
  await simElement.waitFor({ state: 'visible', timeout: 15000 });
  return "Simulator loaded";
}
```

---

### Step 2: Emulate Button Actions & Sensor Triggers

#### Pressing Button A / Button B
```javascript
async (page) => {
  const frame = page.frameLocator('iframe[title*="Simulator"]');
  
  // Click Button A
  const btnA = frame.locator('button#press-a, svg #btnA, text=A').first();
  await btnA.click();
  await page.waitForTimeout(1000); // Allow animation to update
  
  return "Pressed Button A";
}
```

#### Triggering Shake Event
```javascript
async (page) => {
  const frame = page.frameLocator('iframe[title*="Simulator"]');
  
  // Click SHAKE button on simulator control panel
  const shakeBtn = frame.locator('button#press-shake, button:has-text("SHAKE"), text=SHAKE').first();
  await shakeBtn.click();
  await page.waitForTimeout(1500);
  
  return "Triggered Shake event";
}
```

---

### Step 3: Capture Display Screenshots & Inspect LEDs

#### Taking Simulator Component Screenshot
```javascript
async (page) => {
  // Locate simulator container
  const simContainer = page.locator('.sim-embed, #board-container, iframe[title*="Simulator"]').first();
  
  // Take screenshot of simulator
  await simContainer.screenshot({ path: 'simulator_state.png' });
  
  return "Saved simulator screenshot to simulator_state.png";
}
```

#### Inspecting 5x5 LED States Programmatically
```javascript
async (page) => {
  const frame = page.frameLocator('iframe[title*="Simulator"]');
  
  // Count active (lit) LEDs based on opacity/fill
  const litLeds = await frame.locator('rect.sim-led[fill="#ff0000"], rect.sim-led[style*="opacity: 1"]').count();
  
  return `Number of lit LEDs: ${litLeds}`;
}
```

---

## Verification Checklist

- [ ] MakeCode simulator loaded successfully.
- [ ] Button A / B / A+B actions trigger the expected event handlers.
- [ ] Sensor events (Shake / Logo Touch) respond as defined in code.
- [ ] 5x5 LED matrix updates correctly after interaction.
- [ ] Screenshot captured for visual inspection.
