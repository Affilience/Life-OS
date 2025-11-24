import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 15000 });
    await page.screenshot({ path: 'dashboard-screenshot.png', fullPage: false });
    console.log('Screenshot saved to dashboard-screenshot.png');
  } catch (error) {
    console.error('Error taking screenshot:', error.message);
  }
  
  await browser.close();
})();
