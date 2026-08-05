import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test.describe('MakeCode Compass E2E Test Suite', () => {
    test('loads MakeCode editor and checks simulator element', async ({ page }) => {
        // Navigate to MakeCode editor URL
        await page.goto('https://makecode.microbit.org/#editor');
        
        // Wait for page title and simulator iframe / canvas to load
        await expect(page).toHaveTitle(/Microsoft MakeCode for micro:bit/);

        // Verify editor buttons or simulator container exist
        const appContainer = page.locator('#root, .full-abs');
        await expect(appContainer.first()).toBeVisible({ timeout: 15000 });
    });

    test('imports binary.hex and verifies compass simulator elements', async ({ page }) => {
        const hexPath = path.resolve(process.cwd(), 'built/binary.hex');
        expect(fs.existsSync(hexPath)).toBe(true);

        // Navigate to MakeCode home page
        await page.goto('https://makecode.microbit.org/');
        
        // Click main import button on home page
        const importBtn = page.locator('button, div, a').filter({ hasText: /^(Import|読み込む)$/i }).last();
        await expect(importBtn).toBeVisible({ timeout: 15000 });
        await importBtn.click();

        // Click 'Import File...' card/option in the import dialog if visible
        const importFileOption = page.locator('.ui.modal, .dialog, div.card, button, a')
            .filter({ hasText: /(Import File|ファイルを読み込む|Import File\.\.\.)/i })
            .first();
        if (await importFileOption.isVisible({ timeout: 5000 }).catch(() => false)) {
            await importFileOption.click();
        }

        // Set input files on file input element (attached or detached/hidden)
        const fileInput = page.locator('input[type="file"]');
        await fileInput.first().setInputFiles(hexPath);

        // Click confirmation button (e.g. 'Go Ahead', 'つづける', 'Continue', 'Open')
        const continueBtn = page.locator('.modal button, .dialog button, button, div.button')
            .filter({ hasText: /(Continue|つづける|開く|Open|Go Ahead|Import File)/i })
            .first();
        if (await continueBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await continueBtn.click();
        }


        // Locate simulator iframe directly
        const simIframe = page.frameLocator('iframe[title*="Simulator"], iframe.sim-embed');
        const simSvg = simIframe.locator('svg').first();
        await expect(simSvg).toBeVisible({ timeout: 30000 });

        // Check simulator 5x5 LED matrix pixels existence
        const leds = simIframe.locator('rect.sim-led, svg.sim-leds rect');
        await expect(leds.first()).toBeVisible({ timeout: 15000 });
        const ledCount = await leds.count();
        expect(ledCount).toBeGreaterThanOrEqual(25);
    });


    test('interacts with simulator buttons and controls', async ({ page }) => {
        await page.goto('https://makecode.microbit.org/#editor');

        const simIframe = page.frameLocator('iframe[title*="Simulator"], iframe.sim-embed');
        const simSvg = simIframe.locator('svg').first();
        await expect(simSvg).toBeVisible({ timeout: 25000 });

        // Locate Button A or Button B in simulator
        const btnA = simIframe.locator('button#press-a, svg #btnA, .sim-button-a, text=A').first();
        if (await btnA.isVisible().catch(() => false)) {
            await btnA.click();
            await page.waitForTimeout(500);
        }
    });
});


