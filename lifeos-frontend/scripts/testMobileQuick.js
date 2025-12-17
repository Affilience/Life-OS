/**
 * Quick Mobile Test - Single Device
 */

import { chromium, devices } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRONTEND_URL = 'http://localhost:5173';
const SCREENSHOTS_DIR = path.join(__dirname, '../mobile-screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runQuickTest() {
  console.log('🚀 Quick Mobile Test - iPhone 12\n');

  const browser = await chromium.launch({ headless: true });
  const device = devices['iPhone 12'];

  const context = await browser.newContext({
    ...device,
    colorScheme: 'dark',
  });

  const page = await context.newPage();

  try {
    // Clear localStorage first
    await page.goto(FRONTEND_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.evaluate(() => {
      localStorage.removeItem('new-onboarding-store');
      localStorage.removeItem('onboarding-store');
      localStorage.clear();
    });
    console.log('✓ Cleared localStorage');

    // Navigate to onboarding
    await page.goto(`${FRONTEND_URL}/onboarding`, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('✓ Navigated to /onboarding');

    await sleep(3000);

    // Take screenshot
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'quick_test_intro.png'),
      fullPage: false
    });
    console.log('✓ Screenshot captured');

    // Scroll to see more sections
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await sleep(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'quick_test_section2.png'),
      fullPage: false
    });
    console.log('✓ Section 2 captured');

    // Scroll more
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await sleep(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'quick_test_section3.png'),
      fullPage: false
    });
    console.log('✓ Section 3 captured');

    // Full page
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(1000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'quick_test_full.png'),
      fullPage: true
    });
    console.log('✓ Full page captured');

  } catch (error) {
    console.error('Error:', error.message);
  }

  await context.close();
  await browser.close();

  console.log('\n✅ Done! Check mobile-screenshots/quick_test_*.png');
}

runQuickTest().catch(console.error);
