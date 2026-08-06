import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function captureDemoFrames() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 750 } });

    console.log('Navigating to MakeCode editor for Compass 8-direction Demo GIF...');
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

    // 24 steps around 360 degrees (every 15 degrees)
    const angles: number[] = [];
    for (let deg = 0; deg < 360; deg += 15) {
        angles.push(deg);
    }

    const framesDir = path.join(__dirname, '..', 'screenshots', 'frames');
    if (!fs.existsSync(framesDir)) {
        fs.mkdirSync(framesDir, { recursive: true });
    }

    console.log(`Capturing ${angles.length} frames showing compass rotation and LED arrow changes...`);

    for (let i = 0; i < angles.length; i++) {
        const angle = angles[i];

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
            }, angle);
        }

        await page.waitForTimeout(300);

        const simElement = page.locator('#simframe, .simframe, iframe[src*="sim"]').first();
        const fileName = `frame_${String(i).padStart(2, '0')}.png`;
        if (await simElement.isVisible()) {
            await simElement.screenshot({ path: path.join(framesDir, fileName) });
        } else {
            await page.screenshot({ path: path.join(framesDir, fileName) });
        }
    }

    await browser.close();
    console.log('Successfully captured compass demo frames.');
}

captureDemoFrames().catch(console.error);
