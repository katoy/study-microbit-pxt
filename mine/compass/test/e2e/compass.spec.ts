import { test, expect } from '@playwright/test';

test.describe('MakeCode Compass E2E Test', () => {
    test('loads MakeCode editor and checks simulator element', async ({ page }) => {
        // Navigate to MakeCode editor URL
        await page.goto('https://makecode.microbit.org/#editor');
        
        // Wait for page title and simulator iframe / canvas to load
        await expect(page).toHaveTitle(/Microsoft MakeCode for micro:bit/);

        // Verify editor buttons or simulator container exist
        const appContainer = page.locator('#root, .full-abs');
        await expect(appContainer.first()).toBeVisible({ timeout: 15000 });
    });
});
