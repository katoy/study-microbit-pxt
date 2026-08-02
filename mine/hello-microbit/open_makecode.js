const { chromium } = require('playwright');

(async () => {
  console.log("Launching headed browser...");
  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Navigating to MakeCode...");
  await page.goto('https://makecode.microbit.org/');

  console.log("Opening import modal...");
  const locator = page.locator('text=読み込む');
  await locator.last().click();

  console.log("Clicking local file import card...");
  await page.locator('[aria-label="パソコン上のファイルを開く"]').click();

  console.log("Selecting hex file...");
  const filePath = '/Users/katoy/github/study-microbit-pxt/mine/hello-microbit/built/binary.hex';
  await page.setInputFiles('input[type="file"]', filePath);

  console.log("Confirming load...");
  await page.click('text=つづける');

  console.log("Waiting for editor to load...");
  await page.waitForNavigation({ url: /.*#editor.*/ }).catch(() => {});
  
  console.log("Project loaded. Keeping the browser open. Press Ctrl+C in terminal to exit.");
  // Keep the script running to prevent browser from closing
  await new Promise(() => {});
})().catch(err => {
  console.error("Error occurred:", err);
  process.exit(1);
});
