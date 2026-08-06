import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function testContinuousHook() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 750 } });

    await page.goto('https://makecode.microbit.org/#editor');
    await page.waitForTimeout(5000);

    const mainTsPath = path.join(__dirname, '..', 'main.ts');
    const codeText = fs.readFileSync(mainTsPath, 'utf-8');

    await page.evaluate(async (code) => {
        const jsBtn = document.querySelector('#command-javascript') ||
                      document.querySelector('.javascript-menuitem') ||
                      Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('JavaScript'));
        if (jsBtn) (jsBtn as HTMLElement).click();
        await new Promise(r => setTimeout(r, 800));

        if ((window as any).monaco && (window as any).monaco.editor) {
            const models = (window as any).monaco.editor.getModels();
            if (models && models.length > 0) {
                models[0].setValue(code);
            }
        }

        const blockBtn = document.querySelector('#command-blocks') ||
                         document.querySelector('.blocks-menuitem') ||
                         Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('ブロック'));
        if (blockBtn) (blockBtn as HTMLElement).click();

        const modals = document.querySelectorAll('.ui.dimmer, .ui.modal');
        modals.forEach(m => m.remove());
    }, codeText);

    await page.waitForTimeout(4000);

    // Setup continuous rAF hook inside sim child frame
    const childFrames = page.frames().filter(f => f.url().includes('sim'));
    const simFrame = childFrames[0];

    await simFrame.evaluate(() => {
        (window as any)._targetAngle = 0;
        function updateHead() {
            const head = document.querySelector('.sim-head');
            if (head) {
                const a = (window as any)._targetAngle || 0;
                head.setAttribute('transform', `translate(250, 204) rotate(${a}) translate(-250, -204)`);
            }
            const txt = document.querySelector('.sim-text');
            if (txt) {
                txt.textContent = `${Math.round((window as any)._targetAngle || 0)}°`;
            }
            requestAnimationFrame(updateHead);
        }
        requestAnimationFrame(updateHead);
    });

    const testAngles = [0, 45, 90, 135, 180, 225, 270, 315];
    for (const angle of testAngles) {
        // Set target angle in sim frame
        await simFrame.evaluate((a) => {
            (window as any)._targetAngle = a;
        }, angle);

        // Also post message for LEDs
        await page.evaluate((a) => {
            const iframes = Array.from(document.querySelectorAll('iframe'));
            iframes.forEach(iframe => {
                try {
                    iframe.contentWindow?.postMessage({
                        type: 'simulator',
                        action: 'setstate',
                        state: { compassHeading: a }
                    }, '*');
                } catch (e) {}
            });
        }, angle);

        await page.waitForTimeout(300);

        const shotPath = path.join(__dirname, '..', 'screenshots', `hook_deg_${angle}.png`);
        await page.screenshot({ path: shotPath });
        console.log(`Saved hook screenshot for ${angle} deg`);
    }

    await browser.close();
}

testContinuousHook().catch(console.error);
