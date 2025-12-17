/**
 * Mobile Testing Script using Playwright
 *
 * Tests both the onboarding flow and website on multiple mobile devices
 * Captures screenshots for visual inspection
 */

import { chromium, devices } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mobile devices to test
const MOBILE_DEVICES = [
  'iPhone 12',
  'iPhone SE',
  'iPhone 14 Pro Max',
  'Pixel 5',
  'Galaxy S9+',
];

// URLs to test
const FRONTEND_URL = 'http://localhost:5173';
const WEBSITE_URL = 'http://localhost:3001';

// Create screenshots directory
const SCREENSHOTS_DIR = path.join(__dirname, '../mobile-screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testOnboarding(page, deviceName) {
  const safeName = deviceName.replace(/\s+/g, '_');
  console.log(`\n📱 Testing Onboarding on ${deviceName}...`);

  try {
    // First, go to the app to clear localStorage and reset onboarding state
    await page.goto(FRONTEND_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.evaluate(() => {
      // Clear the onboarding store from localStorage to force fresh onboarding
      localStorage.removeItem('new-onboarding-store');
      localStorage.removeItem('onboarding-store');
    });

    // Navigate to onboarding
    await page.goto(`${FRONTEND_URL}/onboarding`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(3000); // Wait for animations to play

    // Screenshot 1: Intro section
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `onboarding_1_intro_${safeName}.png`),
      fullPage: false
    });
    console.log(`  ✓ Intro section captured`);

    // Scroll to next section
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await sleep(1500);

    // Screenshot 2: Mode select
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `onboarding_2_mode_${safeName}.png`),
      fullPage: false
    });
    console.log(`  ✓ Mode select captured`);

    // Scroll to next section
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await sleep(1500);

    // Screenshot 3: Hero select
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `onboarding_3_hero_${safeName}.png`),
      fullPage: false
    });
    console.log(`  ✓ Hero select captured`);

    // Scroll to next section
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await sleep(1500);

    // Screenshot 4: Gamification
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `onboarding_4_gamification_${safeName}.png`),
      fullPage: false
    });
    console.log(`  ✓ Gamification captured`);

    // Scroll to next section
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await sleep(1500);

    // Screenshot 5: Identity
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `onboarding_5_identity_${safeName}.png`),
      fullPage: false
    });
    console.log(`  ✓ Identity captured`);

    // Scroll to next section
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await sleep(1500);

    // Screenshot 6: Goals
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `onboarding_6_goals_${safeName}.png`),
      fullPage: false
    });
    console.log(`  ✓ Goals captured`);

  } catch (error) {
    console.log(`  ⚠️ Onboarding test error: ${error.message}`);
  }
}

async function testWebsite(page, deviceName) {
  const safeName = deviceName.replace(/\s+/g, '_');
  console.log(`\n📱 Testing Website on ${deviceName}...`);

  try {
    // Navigate to website
    await page.goto(WEBSITE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(3000);

    // Screenshot 1: Hero section
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `website_1_hero_${safeName}.png`),
      fullPage: false
    });
    console.log(`  ✓ Hero section captured`);

    // Scroll to features
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await sleep(1500);

    // Screenshot 2: Features
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `website_2_features_${safeName}.png`),
      fullPage: false
    });
    console.log(`  ✓ Features captured`);

    // Scroll more
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await sleep(1500);

    // Screenshot 3: Modules
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `website_3_modules_${safeName}.png`),
      fullPage: false
    });
    console.log(`  ✓ Modules captured`);

    // Scroll more
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await sleep(1500);

    // Screenshot 4: Gamification
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `website_4_gamification_${safeName}.png`),
      fullPage: false
    });
    console.log(`  ✓ Gamification captured`);

    // Scroll more
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
    await sleep(1500);

    // Screenshot 5: Screenshots carousel
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `website_5_screenshots_${safeName}.png`),
      fullPage: false
    });
    console.log(`  ✓ Screenshots captured`);

    // Full page screenshot
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `website_full_${safeName}.png`),
      fullPage: true
    });
    console.log(`  ✓ Full page captured`);

  } catch (error) {
    console.log(`  ⚠️ Website test error: ${error.message}`);
  }
}

async function runMobileTests() {
  console.log('🚀 Starting Mobile View Tests\n');
  console.log('Screenshots will be saved to:', SCREENSHOTS_DIR);

  const browser = await chromium.launch({ headless: true });

  for (const deviceName of MOBILE_DEVICES) {
    const device = devices[deviceName];
    if (!device) {
      console.log(`⚠️ Device "${deviceName}" not found, skipping...`);
      continue;
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`Testing: ${deviceName} (${device.viewport.width}x${device.viewport.height})`);
    console.log('='.repeat(50));

    const context = await browser.newContext({
      ...device,
      colorScheme: 'dark',
    });

    const page = await context.newPage();

    // Test onboarding (frontend)
    await testOnboarding(page, deviceName);

    // Test website
    await testWebsite(page, deviceName);

    await context.close();
  }

  await browser.close();

  console.log('\n✅ Mobile testing complete!');
  console.log(`Screenshots saved to: ${SCREENSHOTS_DIR}`);
}

// Run the tests
runMobileTests().catch(console.error);
