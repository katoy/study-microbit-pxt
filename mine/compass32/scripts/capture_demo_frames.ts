import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function captureCompass32DemoFrames() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 750 } });

    console.log('Navigating to MakeCode editor for Compass32 Device Orientation Demo GIF...');
    await page.goto('https://makecode.microbit.org/#editor');
    await page.waitForTimeout(5000);

    const mainTsPath = path.join(__dirname, '..', 'main.ts');
    const codeText = fs.readFileSync(mainTsPath, 'utf-8');

    // Switch to JavaScript editor, inject code and convert to blocks
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

    // 36 steps (every 10 degrees) for smooth rotation of the micro:bit device
    const angles: number[] = [];
    for (let deg = 0; deg < 360; deg += 10) {
        angles.push(deg);
    }

    const framesDir = path.join(__dirname, '..', 'screenshots', 'frames');
    if (!fs.existsSync(framesDir)) {
        fs.mkdirSync(framesDir, { recursive: true });
    }

    console.log(`Capturing ${angles.length} frames showing micro:bit device orientation changes...`);

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

captureCompass32DemoFrames().catch(console.error);
