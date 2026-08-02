import { test, expect, FrameLocator } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

// LEDのインデックス定義 (5x5 グリッド, 0-24)
const HEART_LEDS = [1, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 22];
const HAPPY_LEDS = [6, 8, 15, 19, 21, 22, 23];
const SAD_LEDS = [6, 8, 16, 17, 18, 20, 24];

// LEDの点灯状態を取得するヘルパー関数
async function getLedStates(simFrame: FrameLocator): Promise<boolean[]> {
  const leds = await simFrame.locator('rect.sim-led').all();
  const ledStates: boolean[] = [];
  for (const led of leds) {
    const style = await led.getAttribute('style') || '';
    const opacityMatch = style.match(/opacity:\s*([\d.]+)/);
    const opacity = opacityMatch ? parseFloat(opacityMatch[1]) : 0;
    ledStates.push(opacity > 0.5);
  }
  return ledStates;
}

// 期待するLEDパターンになっているかアサートするヘルパー
async function expectLedPattern(simFrame: FrameLocator, expectedIndices: number[], timeoutMs = 5000) {
  const expected = Array(25).fill(false);
  for (const idx of expectedIndices) {
    expected[idx] = true;
  }
  
  await expect.poll(async () => {
    const states = await getLedStates(simFrame);
    if (states.length !== 25) {
      console.log(`Warning: Found ${states.length} LEDs, expected 25.`);
      return Array(25).fill(false);
    }
    return states;
  }, {
    message: 'LED pattern did not match expected',
    timeout: timeoutMs,
  }).toEqual(expected);
}

test('MakeCode micro:bit simulator test', async ({ page }) => {
  // テスト全体のタイムアウトを伸ばす
  test.setTimeout(90000);

  // 1. MakeCode エディタを開く
  console.log('Navigating to MakeCode micro:bit editor...');
  await page.goto('https://makecode.microbit.org/?noscript=1');
  await page.waitForTimeout(5000);

  // 2. 「読み込む」(Import) ボタンをクリック
  console.log('Opening import dialog...');
  const importButton = page.getByRole('button', { name: /Import|読み込む/i }).last();
  await expect(importButton).toBeVisible({ timeout: 15000 });
  await importButton.click();

  // 3. 「Import File...」(ファイルを読み込む) カードをクリック
  console.log('Clicking "Import File..." card...');
  const importFileCard = page.getByText(/Import File|ファイルを読み込む/i).first();
  await expect(importFileCard).toBeVisible({ timeout: 10000 });
  await importFileCard.click();

  // 4. hex ファイルをアップロード
  const fileInput = page.locator('input[type="file"]');
  await expect(fileInput).toBeAttached({ timeout: 10000 });
  const hexPath = path.resolve(__dirname, '../built/binary.hex');
  
  if (!fs.existsSync(hexPath)) {
    throw new Error(`Compiled hex file not found at ${hexPath}. Please run "npx pxt build" first.`);
  }
  
  console.log(`Uploading hex file from: ${hexPath}`);
  await fileInput.setInputFiles(hexPath);

  // 5. 「つづける」をクリック
  const continueButton = page.getByRole('button', { name: /Go ahead|Continue|つづける/i });
  await expect(continueButton).toBeVisible();
  await continueButton.click();

  // 6. エディタ画面のロード完了を待つ (URLに #editor が含まれる)
  console.log('Waiting for editor to load...');
  await page.waitForURL(/#editor/, { timeout: 30000 });
  await page.waitForTimeout(10000); // シミュレータの起動を十分に待つ

  // 7. シミュレータの iframe を取得
  console.log('Locating simulator iframe...');
  const iframeSelector = 'iframe#simframe, iframe[name="simframe"], iframe[src*="simulator"]';
  const iframeElement = page.locator(iframeSelector).first();
  await expect(iframeElement).toBeVisible({ timeout: 20000 });

  const simFrame = page.frameLocator(iframeSelector);

  // --- テストシナリオ実行 ---

  // シナリオ 1: 起動時の表示 (ハート)
  console.log('Scenario 1: Verifying startup heart icon...');
  await expectLedPattern(simFrame, HEART_LEDS);

  // シナリオ 2: Aボタン押下時の表示 (笑顔)
  console.log('Scenario 2: Pressing Button A for happy icon...');
  const buttonA = simFrame.locator('g[aria-label="A"]').first();
  await expect(buttonA).toBeVisible({ timeout: 5000 });
  await buttonA.click();
  await expectLedPattern(simFrame, HAPPY_LEDS);

  // シナリオ 3: Bボタン押下時の表示 (悲しい顔)
  console.log('Scenario 3: Pressing Button B for sad icon...');
  const buttonB = simFrame.locator('g[aria-label="B"]').first();
  await expect(buttonB).toBeVisible({ timeout: 5000 });
  await buttonB.click();
  await expectLedPattern(simFrame, SAD_LEDS);

  // シナリオ 4: A+Bボタン押下時の表示 ("Hello!" スクロール -> ハートに戻る)
  console.log('Scenario 4: Pressing Button A+B for Hello! text...');
  const buttonAB = simFrame.locator('g[aria-label="A+B"]').first();
  await expect(buttonAB).toBeVisible({ timeout: 5000 });
  await buttonAB.click();
  
  // 文字列スクロールが終わると、main.ts の実装によりハートアイコンに戻る
  // スクロールにかかる時間を考慮し、タイムアウトを長めに設定 (15秒)
  console.log('Waiting for "Hello!" scroll to complete and return to heart...');
  await expectLedPattern(simFrame, HEART_LEDS, 15000);

  // シナリオ 5: Shake時の表示 (1〜6の数字表示 -> 1秒後に消去)
  console.log('Scenario 5: Simulating Shake gesture...');
  const shakeButton = simFrame.locator('.sim-shake, [aria-label="Shake"]').first();
  await expect(shakeButton).toBeVisible({ timeout: 5000 });
  await shakeButton.click();
  
  // シェイクされるとランダムな数字が表示される。
  // そのため、何かしらのLEDが点灯しているはず (全消灯ではない状態)
  await expect.poll(async () => {
    const states = await getLedStates(simFrame);
    const litCount = states.filter(x => x).length;
    return litCount > 0;
  }, {
    message: 'No LEDs turned on after shake',
    timeout: 5000,
  }).toBe(true);

  // 1秒間の表示時間のあと、basic.clearScreen() が走り、全消灯する
  console.log('Waiting for dice display to clear...');
  await expectLedPattern(simFrame, [], 5000); // 空配列 = 全消灯

  console.log('All E2E scenarios passed successfully!');
});
