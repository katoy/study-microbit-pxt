import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function inspectCompassUI() {
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

    // Set heading to 90
    await page.evaluate(() => {
        const iframes = Array.from(document.querySelectorAll('iframe'));
        iframes.forEach(iframe => {
            try {
                iframe.contentWindow?.postMessage({
                    type: 'simulator',
                    action: 'setstate',
                    state: { compassHeading: 90 }
                }, '*');
            } catch (e) {}
        });
    });

    await page.waitForTimeout(1000);

    const childFrames = page.frames().filter(f => f.url().includes('sim'));

    for (const frame of childFrames) {
        const svgElements = await frame.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('g, path, polygon, circle, text'));
            return elements.map(el => ({
                tagName: el.tagName,
                id: el.id,
                className: typeof (el as any).className === 'string' ? (el as any).className : (el as any).className?.baseVal || '',
                transform: el.getAttribute('transform'),
                fill: el.getAttribute('fill'),
                stroke: el.getAttribute('stroke'),
                title: el.querySelector('title')?.textContent || ''
            })).filter(e => e.id || e.className || e.transform || e.title);
        });

        console.log('SVG Elements with id/class/transform:', JSON.stringify(svgElements, null, 2));
    }

    await browser.close();
}

inspectCompassUI().catch(console.error);
