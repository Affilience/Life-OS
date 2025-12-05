import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const PAGES = [
  { path: '/health', name: 'health-reference' },
  { path: '/calendar', name: 'calendar-compare' },
  { path: '/financial', name: 'financial-compare' },
  { path: '/purpose', name: 'purpose-compare' },
];

const SCREENSHOT_DIR = './screenshots/compare';

async function takeScreenshots() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  console.log('Taking comparison screenshots...\n');

  for (const route of PAGES) {
    const url = `http://localhost:5174${route.path}`;
    const filename = `${route.name}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);

    try {
      console.log(`Capturing: ${route.name} (${route.path})`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: filepath,
        fullPage: false
      });
      console.log(`  ✓ Saved: ${filename}`);
    } catch (error) {
      console.log(`  ✗ Failed: ${filename} - ${error.message}`);
    }
  }

  await browser.close();
  console.log('\nDone! Screenshots in:', SCREENSHOT_DIR);
}

takeScreenshots().catch(console.error);
