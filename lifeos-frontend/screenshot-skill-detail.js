import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // Navigate to the skill tree page
    await page.goto('http://localhost:5178/skill-tree', {
      waitUntil: 'networkidle0',
      timeout: 10000
    });

    // Wait for animations to settle
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Click on the first constellation card (BODY)
    await page.click('.group');

    // Wait for the perk tree to appear
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot of the detailed perk tree
    await page.screenshot({
      path: 'constellation-detail-screenshot.png',
      fullPage: false
    });

    console.log('Detail screenshot saved to constellation-detail-screenshot.png');
  } catch (error) {
    console.error('Error taking screenshot:', error);
  } finally {
    await browser.close();
  }
})();
