import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { DIRECTION_POINTS } from '../src/compass32';

const UPPER_BOUNDS = [
    7.018, 20.301, 31.718, 40.935, 49.065, 58.282, 69.699, 82.982,
    97.018, 110.301, 121.718, 130.935, 139.065, 148.282, 159.699, 172.982,
    187.018, 200.301, 211.718, 220.935, 229.065, 238.282, 250.699, 262.982,
    277.018, 290.301, 301.718, 310.935, 319.065, 328.282, 339.699, 352.982
];

function generateMainTsContent(): string {
    let indexIfElse = '';
    for (let i = 0; i < 32; i++) {
        const boundInt = Math.round(UPPER_BOUNDS[i]);
        if (i === 0) {
            indexIfElse += `    if (norm >= 353 || norm < 7) {\n        return 0\n`;
        } else if (i === 31) {
            indexIfElse += `    } else if (norm < 353) {\n        return 31\n    } else {\n        return 0\n    }`;
        } else {
            indexIfElse += `    } else if (norm < ${boundInt}) {\n        return ${i}\n`;
        }
    }

    let foreverIfElse = '';
    const BRIGHTNESS = [255, 170, 110, 60, 25];
    for (let i = 0; i < 32; i++) {
        const points = DIRECTION_POINTS[i];
        const plotStr = points.map((p, idx) => `led.plotBrightness(${p.x}, ${p.y}, ${BRIGHTNESS[idx]})`).join('; ');

        if (i === 0) {
            foreverIfElse += `    if (idx == 0) {\n        ${plotStr}\n`;
        } else if (i === 31) {
            foreverIfElse += `    } else {\n        ${plotStr}\n    }`;
        } else {
            foreverIfElse += `    } else if (idx == ${i}) {\n        ${plotStr}\n`;
        }
    }

    return `// 32-direction compass for micro:bit
// 360 degrees divided into 32 distinct direction lines

function getDirectionIndex(degrees: number): number {
    let norm = degrees % 360
    if (norm < 0) {
        norm += 360
    }
${indexIfElse}
}

basic.forever(function () {
    let degrees = input.compassHeading()
    let idx = getDirectionIndex(degrees)
    basic.clearScreen()

${foreverIfElse}
})
`;
}

async function updateMainBlocks(mainTsPath: string, mainBlocksPath: string) {
    console.log('🔄 Updating main.blocks using Playwright MakeCode editor...');
    try {
        const { chromium } = await import('@playwright/test');
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto('https://makecode.microbit.org/#editor');
        await page.waitForTimeout(4000);

        const codeText = fs.readFileSync(mainTsPath, 'utf-8');

        // Switch to JavaScript editor and update code
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
        }, codeText);

        await page.waitForTimeout(4000);

        // Extract main.blocks XML from IndexedDB / PXT workspace if available
        const xml = await page.evaluate(async () => {
            return new Promise<string>((resolve) => {
                const dbNames = ['__pxt_idb_workspace_microbit_v9', 'pxt-microbit'];
                let tried = 0;
                for (const dbName of dbNames) {
                    const req = indexedDB.open(dbName);
                    req.onsuccess = (event: any) => {
                        const db = event.target.result;
                        if (db && db.objectStoreNames.contains('texts')) {
                            const tx = db.transaction(['texts'], 'readonly');
                            const store = tx.objectStore('texts');
                            const getAllReq = store.getAll();
                            getAllReq.onsuccess = () => {
                                const items = getAllReq.result || [];
                                for (const item of items) {
                                    if (item && item.files && item.files['main.blocks']) {
                                        resolve(item.files['main.blocks']);
                                        return;
                                    }
                                }
                                tried++;
                                if (tried === dbNames.length) resolve('');
                            };
                            getAllReq.onerror = () => { tried++; if (tried === dbNames.length) resolve(''); };
                        } else if (db && db.objectStoreNames.contains('headerstoheader')) {
                            const tx = db.transaction(['headerstoheader'], 'readonly');
                            const store = tx.objectStore('headerstoheader');
                            const getAllReq = store.getAll();
                            getAllReq.onsuccess = () => {
                                const items = getAllReq.result || [];
                                for (const item of items) {
                                    if (item && item.blob && item.blob['main.blocks']) {
                                        resolve(item.blob['main.blocks']);
                                        return;
                                    }
                                }
                                tried++;
                                if (tried === dbNames.length) resolve('');
                            };
                            getAllReq.onerror = () => { tried++; if (tried === dbNames.length) resolve(''); };
                        } else {
                            tried++;
                            if (tried === dbNames.length) resolve('');
                        }
                    };
                    req.onerror = () => { tried++; if (tried === dbNames.length) resolve(''); };
                }
            });
        });

        await browser.close();

        if (xml && xml.trim().length > 0) {
            fs.writeFileSync(mainBlocksPath, xml, 'utf-8');
            console.log('✅ main.blocks updated successfully.');
        } else {
            console.log('⚠️ Could not extract main.blocks XML automatically from browser.');
        }
    } catch (e) {
        console.warn('⚠️ main.blocks auto-generation encountered an issue:', (e as Error).message);
    }
}

async function sync() {
    const rootDir = path.join(__dirname, '..');
    const mainTsPath = path.join(rootDir, 'main.ts');
    const mainBlocksPath = path.join(rootDir, 'main.blocks');
    const hexPath = path.join(rootDir, 'built', 'binary.hex');

    const expectedMainTs = generateMainTsContent();
    const currentMainTs = fs.existsSync(mainTsPath) ? fs.readFileSync(mainTsPath, 'utf-8') : '';

    const isMainTsDifferent = expectedMainTs.trim() !== currentMainTs.trim();

    if (!isMainTsDifferent) {
        console.log('✨ main.ts is up to date with src/compass32.ts.');
        return;
    }

    console.log('🔄 Difference detected in src/compass32.ts. Updating main.ts...');
    fs.writeFileSync(mainTsPath, expectedMainTs, 'utf-8');
    console.log('✅ main.ts updated.');

    // main.ts changed: update main.blocks if needed
    await updateMainBlocks(mainTsPath, mainBlocksPath);

    // Rebuild binary.hex
    console.log('📦 Rebuilding binary.hex with pxt build...');
    try {
        execSync('npx pxt build', { cwd: rootDir, stdio: 'inherit' });
        console.log('✅ binary.hex rebuilt.');
    } catch (e) {
        console.error('❌ pxt build failed:', (e as Error).message);
    }
}

sync().catch(console.error);
