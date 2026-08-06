import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function testSimHead() {
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

    const testAngle = 90;

    // Apply sim-head rotation centered at board center (250, 204)
    const childFrames = page.frames().filter(f => f.url().includes('sim'));
    for (const frame of childFrames) {
        await frame.evaluate((a) => {
            const head = document.querySelector('.sim-head');
            if (head) {
                head.setAttribute('transform', `translate(250, 204) rotate(${a}) translate(-250, -204)`);
            }
            const txt = document.querySelector('.sim-text');
            if (txt) {
                txt.textContent = `${a}°`;
            }
        }, testAngle);
    }

    // Send heading state to simulator
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
    }, testAngle);

    await page.waitForTimeout(1000);

    const testImgPath = path.join(__dirname, '..', 'screenshots', 'test_sim_head_centered_90.png');
    await page.screenshot({ path: testImgPath });

    await browser.close();
    console.log('Saved centered sim-head test screenshot to:', testImgPath);
}

testSimHead().catch(console.error);
