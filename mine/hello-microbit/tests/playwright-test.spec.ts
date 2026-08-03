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

// 親ページにマウスカーソル要素を確実に配置するヘルパー
async function ensureMousePointer(page: any) {
  await page.evaluate(() => {
    let box = document.querySelector('playwright-mouse-pointer') as HTMLElement;
    if (!box) {
      box = document.createElement('playwright-mouse-pointer');
      const styleElement = document.createElement('style');
      styleElement.innerHTML = `
        playwright-mouse-pointer {
          pointer-events: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 24px;
          height: 24px;
          background: rgba(0, 150, 255, 0.4);
          border: 2px solid rgba(0, 150, 255, 0.8);
          border-radius: 12px;
          margin: -12px 0 0 -12px;
          padding: 0;
          transition: background 0.1s, border-color 0.1s, transform 0.1s, left 0.8s ease-in-out, top 0.8s ease-in-out;
          z-index: 2147483647;
          display: none;
        }
        playwright-mouse-pointer.mousedown {
          background: rgba(255, 0, 0, 0.7);
          border-color: rgba(255, 0, 0, 1);
          transform: scale(0.8);
        }
      `;
      document.head.appendChild(styleElement);
      document.body.appendChild(box);
    }
  });
}

// マウスカーソル要素を指定の位置（ビューポート基準）に移動する
async function moveMousePointer(page: any, x: number, y: number) {
  await page.evaluate(([x, y]) => {
    const box = document.querySelector('playwright-mouse-pointer') as HTMLElement;
    if (box) {
      box.style.display = 'block';
      box.style.left = x + 'px';
      box.style.top = y + 'px';
    }
  }, [x, y]);
}

// マウスカーソル要素のクリック状態（赤色表示）を変更する
async function setMousePointerClickState(page: any, isDown: boolean) {
  await page.evaluate((isDown) => {
    const box = document.querySelector('playwright-mouse-pointer');
    if (box) {
      if (isDown) {
        box.classList.add('mousedown');
      } else {
        box.classList.remove('mousedown');
      }
    }
  }, isDown);
}

// メインページ、および iframe 内の要素に対する視覚的クリックヘルパー
async function clickWithVisualHelper(page: any, locator: any) {
  await ensureMousePointer(page);
  await expect(locator).toBeVisible();

  // 要素をスクロールして表示し、Playwrightでホバーする
  await locator.hover();
  await page.waitForTimeout(100);

  // 要素の絶対座標（親ページ基準）を取得する
  const box = await locator.boundingBox();
  if (box) {
    const pageX = box.x + box.width / 2;
    const pageY = box.y + box.height / 2;

    // 現在のスクロール量を取得してビューポート座標を計算する
    const scroll = await page.evaluate(() => ({
      x: window.scrollX,
      y: window.scrollY
    }));

    const clientX = pageX - scroll.x;
    const clientY = pageY - scroll.y;

    // 1. カーソルを要素の位置へスライドさせる
    await moveMousePointer(page, clientX, clientY);
    await page.waitForTimeout(900); // 移動の軌跡を動画に残すためのディレイ (0.8sのtransitionに合わせる)

    // 2. マウスクリック開始（赤丸へ変化）
    await setMousePointerClickState(page, true);
    await page.waitForTimeout(150); // クリックの瞬間を見せる

    // 3. 実際のクリックを実行
    await locator.click();

    // 4. マウスクリック終了（青丸へ復帰）
    await page.waitForTimeout(150);
    await setMousePointerClickState(page, false);
    await page.waitForTimeout(200); // 余韻
  } else {
    // 座標が取得できなかった場合は通常のクリックを実行
    await locator.click();
  }
}

test('MakeCode micro:bit simulator test', async ({ page }) => {
  // マウスヘルパーを登録
  await ensureMousePointer(page);

  // テスト全体のタイムアウトを伸ばす
  test.setTimeout(90000);

  // 1. MakeCode エディタを開く
  console.log('Navigating to MakeCode micro:bit editor...');
  await page.goto('https://makecode.microbit.org/?noscript=1');
  await page.waitForTimeout(5000);

  // 2. 「読み込む」(Import) ボタンをクリック
  console.log('Opening import dialog...');
  const importButton = page.getByRole('button', { name: /Import|読み込む/i }).last();
  await clickWithVisualHelper(page, importButton);

  // 3. 「Import File...」(ファイルを読み込む) カードをクリック
  console.log('Clicking "Import File..." card...');
  const importFileCard = page.getByText(/Import File|ファイルを読み込む/i).first();
  await clickWithVisualHelper(page, importFileCard);

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
  await clickWithVisualHelper(page, continueButton);

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
  await clickWithVisualHelper(page, simFrame.locator('g[aria-label="A"]').first());
  await expectLedPattern(simFrame, HAPPY_LEDS);

  // シナリオ 3: Bボタン押下時の表示 (悲しい顔)
  console.log('Scenario 3: Pressing Button B for sad icon...');
  await clickWithVisualHelper(page, simFrame.locator('g[aria-label="B"]').first());
  await expectLedPattern(simFrame, SAD_LEDS);

  // シナリオ 4: A+Bボタン押下時の表示 ("Hello!" スクロール -> ハートに戻る)
  console.log('Scenario 4: Pressing Button A+B for Hello! text...');
  await clickWithVisualHelper(page, simFrame.locator('g[aria-label="A+B"]').first());
  
  // 文字列スクロールが終わると、main.ts の実装によりハートアイコンに戻る
  // スクロールにかかる時間を考慮し、タイムアウトを長めに設定 (15秒)
  console.log('Waiting for "Hello!" scroll to complete and return to heart...');
  await expectLedPattern(simFrame, HEART_LEDS, 15000);

  // シナリオ 5: Shake時の表示 (1〜6の数字表示 -> 1秒後に消去)
  console.log('Scenario 5: Simulating Shake gesture...');
  await clickWithVisualHelper(page, simFrame.locator('.sim-shake, [aria-label="Shake"]').first());
  
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
