import { test, expect } from '@playwright/test';

test.describe('MakeCode Compass32 E2E Test', () => {
    test('loads MakeCode editor and checks simulator element', async ({ page }) => {
        await page.goto('https://makecode.microbit.org/#editor');
        await expect(page).toHaveTitle(/Microsoft MakeCode for micro:bit/);

        const appContainer = page.locator('#root, .full-abs');
        await expect(appContainer.first()).toBeVisible({ timeout: 15000 });
    });
});
