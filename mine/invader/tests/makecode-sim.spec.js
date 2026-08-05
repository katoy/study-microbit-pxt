const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

// Helper to inspect 5x5 LED matrix state
async function getLedStates(simFrame) {
    const leds = await simFrame.locator('rect.sim-led').all();
    const ledStates = [];
    for (const led of leds) {
        const style = await led.getAttribute('style') || '';
        const opacityMatch = style.match(/opacity:\s*([\d.]+)/);
        const opacity = opacityMatch ? parseFloat(opacityMatch[1]) : 0;
        const fill = await led.getAttribute('fill') || '';
        const isLit = opacity > 0.3 || (fill !== '#000000' && fill !== 'black' && fill !== '' && fill !== 'none');
        ledStates.push(isLit);
    }
    return ledStates;
}

test('MakeCode micro:bit Simulator E2E Test for Invader', async ({ page }) => {
    test.setTimeout(90000);

    const jsCodePath = path.resolve(__dirname, '../main_makecode.js');
    const jsCode = fs.readFileSync(jsCodePath, 'utf8');

    console.log('[1/7] Navigating to MakeCode micro:bit editor...');
    await page.goto('https://makecode.microbit.org/', { timeout: 60000 });
    await page.waitForLoadState('domcontentloaded');

    console.log('[2/7] Opening New Project modal...');
    const newProjectButton = page.locator('text=新しいプロジェクト').or(page.locator('text=New Project')).first();
    await newProjectButton.waitFor({ timeout: 20000 });
    await newProjectButton.evaluate((el) => {
        const card = el.closest('.card') || el;
        (card).click();
    });

    const nameInput = page.locator('input[type="text"]:visible').first();
    await nameInput.waitFor({ timeout: 5000 });
    await nameInput.fill('invader-makecode-test');

    const createButton = page.locator('button:has-text("作成"):visible, button:has-text("Create"):visible, button.approve:visible').first();
    await createButton.click();

    console.log('[3/7] Waiting for MakeCode editor workspace...');
    await page.waitForURL(/#editor/, { timeout: 30000 });
    await page.waitForTimeout(4000);

    // Remove welcome overlays or popovers if present
    await page.evaluate(() => {
        const overlays = document.querySelectorAll('.common-focus-trap, .teaching-bubble-container, .ui.popover, .popover, [role="dialog"]');
        overlays.forEach(el => el.remove());
    });

    console.log('[4/7] Switching editor language to JavaScript via dropdown...');
    const langDropdown = page.locator('#editordropdown, div.dropdown:has-text("ブロック"), div.dropdown:has-text("Blocks"), div.dropdown:has-text("JavaScript"), button:has-text("JavaScript")').first();
    if (await langDropdown.isVisible({ timeout: 10000 }).catch(() => false)) {
        await langDropdown.evaluate(el => el.click());
        await page.waitForTimeout(1000);
        const jsOption = page.locator('.menu .item:has-text("JavaScript"), [role="option"]:has-text("JavaScript"), a.item:has-text("JavaScript")').first();
        if (await jsOption.isVisible({ timeout: 5000 }).catch(() => false)) {
            await jsOption.evaluate(el => el.click());
            await page.waitForTimeout(4000);
        }
    }

    console.log('Waiting for Monaco editor instance...');
    await page.waitForFunction(() => {
        const anyWin = window;
        return (anyWin.monaco && anyWin.monaco.editor && anyWin.monaco.editor.getModels().length > 0) || !!document.querySelector('textarea.inputarea');
    }, { timeout: 25000 }).catch(() => null);

    console.log('Injecting main_makecode.js into editor...');
    await page.evaluate((code) => {
        const anyWin = window;
        if (anyWin.monaco && anyWin.monaco.editor) {
            const models = anyWin.monaco.editor.getModels();
            if (models.length > 0) {
                models[0].setValue(code);
                return 'Injected via monaco model';
            }
        }
        const textarea = document.querySelector('textarea.inputarea');
        if (textarea) {
            textarea.focus();
            textarea.value = code;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            return 'Injected via textarea fallback';
        }
        throw new Error('Failed to find Monaco editor');
    }, jsCode);

    console.log('[5/7] Waiting for MakeCode simulator to load and start...');
    await page.waitForTimeout(10000);

    const iframeSelector = 'iframe#simframe, iframe[name="simframe"], iframe[src*="simulator"]';
    const iframeElement = page.locator(iframeSelector).first();
    await expect(iframeElement).toBeVisible({ timeout: 20000 });
    const simFrame = page.frameLocator(iframeSelector);

    console.log('[6/7] Interacting with MakeCode Simulator controls...');
    
    // Verify 5x5 LED matrix elements exist
    await expect.poll(async () => {
        const states = await getLedStates(simFrame);
        return states.length;
    }, { message: 'Checking 5x5 LED grid presence', timeout: 15000 }).toBe(25);

    // Resume simulator if stopped or covered by play overlay
    const playBtn = simFrame.locator('.sim-play, button#press-play, i.videoplay').first();
    if (await playBtn.isVisible().catch(() => false)) {
        console.log(' - Resuming simulator execution...');
        await playBtn.click({ force: true }).catch(() => null);
        await page.waitForTimeout(2000);
    }

    // Test Button A press (move left)
    const btnA = simFrame.locator('g[aria-label="A"]').or(simFrame.locator('button#press-a')).first();
    if (await btnA.isVisible().catch(() => false)) {
        console.log(' - Pressing Button A...');
        await btnA.click({ force: true });
        await page.waitForTimeout(1000);
    }

    // Test Button B press (move right)
    const btnB = simFrame.locator('g[aria-label="B"]').or(simFrame.locator('button#press-b')).first();
    if (await btnB.isVisible().catch(() => false)) {
        console.log(' - Pressing Button B...');
        await btnB.click({ force: true });
        await page.waitForTimeout(1000);
    }

    // Test Shake gesture (reload ammo)
    const shakeBtn = simFrame.locator('.sim-shake').or(simFrame.locator('[aria-label="Shake"]')).or(simFrame.locator('button#press-shake')).first();
    if (await shakeBtn.isVisible().catch(() => false)) {
        console.log(' - Triggering Shake gesture...');
        await shakeBtn.click({ force: true });
        await page.waitForTimeout(2000);
    }

    console.log('[7/7] Capturing MakeCode simulator screenshot...');
    const outputDir = path.resolve(__dirname, '../built');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    const screenshotPath = path.join(outputDir, 'invader-simulator.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`E2E Simulator test passed! Screenshot saved to: ${screenshotPath}`);
});
