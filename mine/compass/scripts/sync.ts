import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

function generateMainTsContent(): string {
    const rootDir = path.join(__dirname, '..');
    const srcPath = path.join(rootDir, 'src', 'compass.ts');
    let content = fs.readFileSync(srcPath, 'utf-8');

    // Remove 'export ' keywords
    content = content.replace(/\bexport\s+/g, '');

    // Remove 'enum ArrowNames { ... }' definition to avoid duplicate identifier errors in PXT
    content = content.replace(/enum\s+ArrowNames\s*\{[\s\S]*?\}/g, '');

    const foreverBlock = `
basic.forever(function () {
    let degrees = input.compassHeading()
    basic.showArrow(getDirection(degrees))
})
`;

    return `// 8-direction compass for micro:bit
// Automatically generated from src/compass.ts. Do not edit directly.

${content.trim()}

${foreverBlock.trim()}
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

    const expectedMainTs = generateMainTsContent();
    const currentMainTs = fs.existsSync(mainTsPath) ? fs.readFileSync(mainTsPath, 'utf-8') : '';

    const isMainTsDifferent = expectedMainTs.trim() !== currentMainTs.trim();

    if (!isMainTsDifferent) {
        console.log('✨ main.ts is up to date with src/compass.ts.');
        return;
    }

    console.log('🔄 Difference detected in src/compass.ts. Updating main.ts...');
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
