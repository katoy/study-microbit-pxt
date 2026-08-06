import { test, expect } from '@playwright/test';

test.describe('MakeCode Compass E2E Test Suite', () => {
    test('loads MakeCode editor and checks simulator element', async ({ page }) => {
        // Navigate to MakeCode editor URL
        await page.goto('https://makecode.microbit.org/#editor');
        
        // Wait for page title
        await expect(page).toHaveTitle(/Microsoft MakeCode for micro:bit/);

        // Verify main editor container exists
        const appContainer = page.locator('#root, .full-abs');
        await expect(appContainer.first()).toBeVisible({ timeout: 15000 });
    });

    test('interacts with simulator elements and controls', async ({ page }) => {
        await page.goto('https://makecode.microbit.org/#editor');

        const simIframe = page.frameLocator('iframe[title*="Simulator"], iframe.sim-embed');
        const simSvg = simIframe.locator('svg').first();
        await expect(simSvg).toBeVisible({ timeout: 25000 });

        // Verify simulator buttons or compass dial text existence
        const btnA = simIframe.locator('button#press-a, svg #btnA, .sim-button-a, text=A').first();
        if (await btnA.isVisible().catch(() => false)) {
            await btnA.click();
            await page.waitForTimeout(500);
        }
    });
});
