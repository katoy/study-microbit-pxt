import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function captureCompassScreenshots() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    
    console.log('Navigating to MakeCode editor for Compass 8-direction screenshots...');
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

    await page.waitForTimeout(5000);

    const targets = [
        { index: 0, angle: 0, label: '00_north_0deg' },
        { index: 1, angle: 45, label: '01_northeast_45deg' },
        { index: 2, angle: 90, label: '02_east_90deg' },
        { index: 3, angle: 135, label: '03_southeast_135deg' },
        { index: 4, angle: 180, label: '04_south_180deg' },
        { index: 5, angle: 225, label: '05_southwest_225deg' },
        { index: 6, angle: 270, label: '06_west_270deg' },
        { index: 7, angle: 315, label: '07_northwest_315deg' }
    ];

    const outputDir = path.join(__dirname, '..', 'screenshots');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const t of targets) {
        const childFrame = page.frames().find(f => f.url().includes('simulator'));
        if (childFrame) {
            await childFrame.evaluate((a) => {
                const win = window as any;
                if (win.pxsim && win.pxsim.board()) {
                    const board = win.pxsim.board();
                    if (board.compassState) {
                        board.compassState.heading = a;
                    }
                    if (typeof board.updateView === 'function') {
                        board.updateView();
                    }
                }
                const head = document.querySelector('.sim-head');
                if (head) {
                    head.setAttribute('transform', `translate(251, 75) rotate(${a}) translate(-251, -75)`);
                }
                const txt = document.querySelector('.sim-text');
                if (txt) {
                    txt.textContent = `${a}°`;
                }
            }, t.angle);
        }

        await page.waitForTimeout(1000);

        const simElement = page.locator('#simframe, .simframe, iframe[src*="sim"]').first();
        if (await simElement.isVisible()) {
            await simElement.screenshot({ path: path.join(outputDir, `${t.label}.png`) });
        } else {
            await page.screenshot({ path: path.join(outputDir, `${t.label}.png`) });
        }
        console.log(`Captured screenshot for ${t.label} (${t.angle}°)...`);
    }

    await browser.close();
    console.log('All 8-direction screenshots captured successfully.');
}

captureCompassScreenshots().catch(console.error);
