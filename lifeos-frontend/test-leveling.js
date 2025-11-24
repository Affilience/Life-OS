const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/cosmic-evolution');
  await page.waitForTimeout(8000);
  
  await page.screenshot({ path: '/tmp/level-start.png' });
  console.log('Initial screenshot');
  
  // Add 2500 XP (5 clicks of +500)
  for (let i = 0; i < 5; i++) {
    await page.click('button:has-text("+500 XP")');
    await page.waitForTimeout(1500);
  }
  
  await page.screenshot({ path: '/tmp/level-after.png' });
  console.log('After XP screenshot');
  
  await browser.close();
})();
