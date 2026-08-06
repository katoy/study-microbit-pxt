import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface SyncConfig {
    entry?: string;
    excludePatterns?: string[];
}

async function run() {
    const projectDir = process.cwd();
    const pxtJsonPath = path.join(projectDir, 'pxt.json');
    if (!fs.existsSync(pxtJsonPath)) {
        console.error('❌ Error: pxt.json not found in the current directory. This skill must be run inside a micro:bit PXT project.');
        process.exit(1);
    }

    const srcDir = path.join(projectDir, 'src');
    if (!fs.existsSync(srcDir)) {
        console.error('❌ Error: src/ directory not found.');
        process.exit(1);
    }

    // Load config if exists
    let config: SyncConfig = {};
    const configPath = path.join(projectDir, 'sync-config.json');
    if (fs.existsSync(configPath)) {
        try {
            config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        } catch (e) {
            console.warn('⚠️ Warning: Failed to parse sync-config.json, using default settings.');
        }
    }

    const entryFile = config.entry ? path.join(projectDir, config.entry) : path.join(srcDir, 'app.ts');
    const excludePatterns = config.excludePatterns || [];

    // Get all TS files in src/
    const files = fs.readdirSync(srcDir)
        .filter(f => f.endsWith('.ts'))
        .map(f => path.join(srcDir, f));

    let modulesContent = '';
    let entryContent = '';

    for (const file of files) {
        let content = fs.readFileSync(file, 'utf-8');
        if (file === entryFile) {
            entryContent = content;
        } else {
            // Process module file
            // 1. Remove 'export '
            content = content.replace(/\bexport\s+/g, '');
            // 2. Apply exclude patterns
            for (const pattern of excludePatterns) {
                const regex = new RegExp(pattern, 'g');
                content = content.replace(regex, '');
            }
            modulesContent += content.trim() + '\n\n';
        }
    }

    const mainTsContent = `// Automatically generated. Do not edit directly.
${modulesContent.trim()}

${entryContent.trim()}
`;

    const mainTsPath = path.join(projectDir, 'main.ts');
    const mainBlocksPath = path.join(projectDir, 'main.blocks');

    const currentMainTs = fs.existsSync(mainTsPath) ? fs.readFileSync(mainTsPath, 'utf-8') : '';
    if (mainTsContent.trim() === currentMainTs.trim()) {
        console.log('✨ main.ts is up to date.');
        return;
    }

    console.log('🔄 Difference detected. Updating main.ts...');
    fs.writeFileSync(mainTsPath, mainTsContent, 'utf-8');
    console.log('✅ main.ts updated.');

    // Update main.blocks using Playwright
    await updateMainBlocks(mainTsPath, mainBlocksPath);

    // Rebuild binary.hex
    console.log('📦 Rebuilding binary.hex with pxt build...');
    try {
        execSync('npx pxt build', { cwd: projectDir, stdio: 'inherit' });
        console.log('✅ binary.hex rebuilt.');
    } catch (e) {
        console.error('❌ pxt build failed:', (e as Error).message);
    }
}

async function updateMainBlocks(mainTsPath: string, mainBlocksPath: string) {
    console.log('🔄 Updating main.blocks using Playwright MakeCode editor...');
    try {
        const projectDir = process.cwd();
        const playwrightPath = require.resolve('@playwright/test', { paths: [projectDir] });
        const { chromium } = require(playwrightPath);
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

        // Extract main.blocks XML from IndexedDB
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

run().catch(console.error);
