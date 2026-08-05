import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function captureDemoFrames() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 750 } });

    console.log('Navigating to MakeCode editor for Compass Device Orientation Demo GIF...');
    await page.goto('https://makecode.microbit.org/#editor');
    await page.waitForTimeout(5000);

    // Inject 8-direction logic and switch to blocks view
    await page.evaluate(async () => {
        const jsBtn = document.querySelector('#command-javascript') ||
                      document.querySelector('.javascript-menuitem') ||
                      Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('JavaScript'));
        if (jsBtn) (jsBtn as HTMLElement).click();
        await new Promise(r => setTimeout(r, 800));

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

        const blockBtn = document.querySelector('#command-blocks') ||
                         document.querySelector('.blocks-menuitem') ||
                         Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('ブロック'));
        if (blockBtn) (blockBtn as HTMLElement).click();

        const modals = document.querySelectorAll('.ui.dimmer, .ui.modal');
        modals.forEach(m => m.remove());
    });

    await page.waitForTimeout(4000);

    const angles: number[] = [];
    for (let deg = 0; deg < 360; deg += 15) {
        angles.push(deg);
    }

    const framesDir = path.join(__dirname, '..', 'screenshots', 'frames');
    if (!fs.existsSync(framesDir)) {
        fs.mkdirSync(framesDir, { recursive: true });
    }

    console.log(`Capturing ${angles.length} frames showing micro:bit orientation changes for compass...`);

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

                try {
                    const doc = iframe.contentDocument || iframe.contentWindow?.document;
                    if (doc) {
                        const board = doc.querySelector('svg#board') || doc.querySelector('.sim-board') || doc.querySelector('svg');
                        if (board) {
                            (board as HTMLElement).style.transform = `rotate(${-a}deg)`;
                            (board as HTMLElement).style.transformOrigin = 'center 40%';
                            (board as HTMLElement).style.transition = 'transform 0.1s linear';
                        }
                    }
                } catch (e) {}
            });
        }, angle);

        await page.waitForTimeout(300);

        const fileName = `frame_${String(i).padStart(2, '0')}.png`;
        await page.screenshot({ path: path.join(framesDir, fileName) });
    }

    await browser.close();
    console.log('Successfully captured micro:bit orientation demo frames.');
}

captureDemoFrames().catch(console.error);
