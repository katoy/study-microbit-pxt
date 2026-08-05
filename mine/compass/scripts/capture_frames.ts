import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function captureDemoFrames() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    
    await page.goto('https://makecode.microbit.org/#editor');
    await page.waitForTimeout(3000);

    // Inject 8-direction logic and switch to blocks view
    await page.evaluate(async () => {
        const jsBtn = document.querySelector('#command-javascript') || document.querySelector('.javascript-menuitem') || Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('JavaScript'));
        if (jsBtn) (jsBtn as HTMLElement).click();
        await new Promise(r => setTimeout(r, 600));

        if ((window as any).monaco && (window as any).monaco.editor) {
            const models = (window as any).monaco.editor.getModels();
            if (models && models.length > 0) {
                const codeText = `basic.forever(function () {
    let degrees = input.compassHeading()
    if (degrees < 23 || degrees >= 338) {
        basic.showArrow(ArrowNames.North)
    } else if (degrees < 68) {
        basic.showArrow(ArrowNames.NorthEast)
    } else if (degrees < 113) {
        basic.showArrow(ArrowNames.East)
    } else if (degrees < 158) {
        basic.showArrow(ArrowNames.SouthEast)
    } else if (degrees < 203) {
        basic.showArrow(ArrowNames.South)
    } else if (degrees < 248) {
        basic.showArrow(ArrowNames.SouthWest)
    } else if (degrees < 293) {
        basic.showArrow(ArrowNames.West)
    } else {
        basic.showArrow(ArrowNames.NorthWest)
    }
})`;
                models[0].setValue(codeText);
            }
        }

        const blockBtn = document.querySelector('#command-blocks') || document.querySelector('.blocks-menuitem') || Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('ブロック'));
        if (blockBtn) (blockBtn as HTMLElement).click();

        // Dismiss tour modal if exists
        const modals = document.querySelectorAll('.ui.dimmer, .ui.modal');
        modals.forEach(m => m.remove());
    });

    await page.waitForTimeout(2000);

    const angles = [0, 45, 90, 135, 180, 225, 270, 315];
    const framesDir = path.join(process.cwd(), 'screenshots', 'frames');
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

        await page.waitForTimeout(600);
        const fileName = `frame_${String(i).padStart(2, '0')}.png`;
        await page.screenshot({ path: path.join(framesDir, fileName) });
    }

    await browser.close();
    console.log('Successfully captured 8 frames for demo GIF.');
}

captureDemoFrames().catch(console.error);
