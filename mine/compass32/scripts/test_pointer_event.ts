import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function testPointerEvent() {
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

    // Initial heading to make compass visible
    await page.evaluate(() => {
        const iframes = Array.from(document.querySelectorAll('iframe'));
        iframes.forEach(iframe => {
            try {
                iframe.contentWindow?.postMessage({
                    type: 'simulator',
                    action: 'setstate',
                    state: { compassHeading: 0 }
                }, '*');
            } catch (e) {}
        });
    });

    await page.waitForTimeout(1000);

    const childFrames = page.frames().filter(f => f.url().includes('sim'));
    const frame = childFrames[0];

    const angles = [0, 45, 90, 135, 180, 225, 270, 315];
    for (const deg of angles) {
        // Dispatch pointer events inside iframe SVG
        const res = await frame.evaluate((angle) => {
            const svg = document.querySelector('svg.sim');
            if (!svg) return 'svg.sim not found';

            const rect = svg.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height * 0.48;
            const radius = rect.width * 0.35;

            const rad = (angle * Math.PI) / 180;
            const x = cx + radius * Math.sin(rad);
            const y = cy - radius * Math.cos(rad);

            const downEvt = new PointerEvent('pointerdown', { clientX: x, clientY: y, bubbles: true, buttons: 1 });
            const moveEvt = new PointerEvent('pointermove', { clientX: x, clientY: y, bubbles: true, buttons: 1 });
            const upEvt = new PointerEvent('pointerup', { clientX: x, clientY: y, bubbles: true });

            svg.dispatchEvent(downEvt);
            svg.dispatchEvent(moveEvt);
            svg.dispatchEvent(upEvt);

            return { cx, cy, x, y };
        }, deg);

        console.log(`Pointer event for ${deg} deg:`, res);
        await page.waitForTimeout(300);

        const shotPath = path.join(__dirname, '..', 'screenshots', `pointer_deg_${deg}.png`);
        await page.screenshot({ path: shotPath });
    }

    await browser.close();
}

testPointerEvent().catch(console.error);
