/**
 * Website Mobile Test
 */

import { chromium, devices } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WEBSITE_URL = 'http://localhost:3003';
const SCREENSHOTS_DIR = path.join(__dirname, '../mobile-screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runWebsiteTest() {
  console.log('🌐 Website Mobile Test - iPhone 12\n');

  const browser = await chromium.launch({ headless: true });
  const device = devices['iPhone 12'];

  const context = await browser.newContext({
    ...device,
    colorScheme: 'dark',
  });

  const page = await context.newPage();

  try {
    await page.goto(WEBSITE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('✓ Navigated to website');

    await sleep(3000); // Wait for animations

    // Hero section
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'website_1_hero.png'),
      fullPage: false
    });
    console.log('✓ Hero section captured');

    // Scroll to Features
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await sleep(1500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'website_2_features.png'),
      fullPage: false
    });
    console.log('✓ Features captured');

    // Scroll to Modules
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await sleep(1500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'website_3_modules.png'),
      fullPage: false
    });
    console.log('✓ Modules captured');

    // Scroll to Gamification
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await sleep(1500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'website_4_gamification.png'),
      fullPage: false
    });
    console.log('✓ Gamification captured');

    // Scroll more
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await sleep(1500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'website_5_more.png'),
      fullPage: false
    });
    console.log('✓ More content captured');

    // Full page
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(1000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'website_full.png'),
      fullPage: true
    });
    console.log('✓ Full page captured');

  } catch (error) {
    console.error('Error:', error.message);
  }

  await context.close();
  await browser.close();

  console.log('\n✅ Done! Check mobile-screenshots/website_*.png');
}

runWebsiteTest().catch(console.error);
