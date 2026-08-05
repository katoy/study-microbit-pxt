import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function captureCompass32DemoFrames() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

    console.log('Navigating to MakeCode editor for Compass32 Demo GIF...');
    await page.goto('https://makecode.microbit.org/#editor');
    await page.waitForTimeout(4000);

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

    await page.waitForTimeout(3000);

    const angles = [
        0, 14, 27, 37, 45, 53, 63, 76,
        90, 104, 117, 127, 135, 143, 153, 166,
        180, 194, 207, 217, 225, 233, 243, 256,
        270, 284, 297, 307, 315, 323, 333, 346
    ];

    const framesDir = path.join(__dirname, '..', 'screenshots', 'frames');
    if (!fs.existsSync(framesDir)) {
        fs.mkdirSync(framesDir, { recursive: true });
    }

    for (let i = 0; i < angles.length; i++) {
        const angle = angles[i];
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

        await page.waitForTimeout(400);

        const fileName = `frame_${String(i).padStart(2, '0')}.png`;
        const simElement = page.locator('#simframe, .simframe, iframe[src*="sim"]').first();
        if (await simElement.isVisible()) {
            await simElement.screenshot({ path: path.join(framesDir, fileName) });
        } else {
            await page.screenshot({ path: path.join(framesDir, fileName) });
        }
    }

    await browser.close();
    console.log('Captured 32 frames for compass32 demo GIF.');
}

captureCompass32DemoFrames().catch(console.error);
