import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function testMouseDrag() {
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

    // Initial heading trigger so pointer dial is visible
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

    // Find bounding box of simframe / board to calculate exact drag coordinates
    const simBox = await page.locator('#simframe, .simframe, iframe[src*="sim"]').first().boundingBox();
    console.log('Simulator bounding box:', simBox);

    if (simBox) {
        // Board center point
        const cx = simBox.x + simBox.width / 2;
        const cy = simBox.y + simBox.height * 0.48;
        const radius = simBox.width * 0.38;

        console.log(`Board center: (${cx}, ${cy}), radius: ${radius}`);

        // Start drag at North (0 deg)
        const startX = cx;
        const startY = cy - radius;

        await page.mouse.move(startX, startY);
        await page.mouse.down();

        // Drag to East (90 deg)
        const angles = [0, 30, 60, 90, 120, 150, 180];
        for (const deg of angles) {
            const rad = (deg * Math.PI) / 180;
            const px = cx + radius * Math.sin(rad);
            const py = cy - radius * Math.cos(rad);
            await page.mouse.move(px, py, { steps: 5 });
            await page.waitForTimeout(200);

            const shotPath = path.join(__dirname, '..', 'screenshots', `drag_deg_${deg}.png`);
            await page.screenshot({ path: shotPath });
            console.log(`Saved screenshot for drag at ${deg} deg`);
        }

        await page.mouse.up();
    }

    await browser.close();
}

testMouseDrag().catch(console.error);
