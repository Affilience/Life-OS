import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = './screenshots/onboarding';

async function takeOnboardingScreenshots() {
  // Create screenshots directory
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: false }); // headless: false to see what's happening
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });

  // Clear onboarding state from localStorage
  const page = await context.newPage();

  // First, go to any page and clear the onboarding state
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 30000 });

  // Clear the onboarding localStorage to reset
  await page.evaluate(() => {
    localStorage.removeItem('lifeos-onboarding');
  });

  console.log('Starting onboarding screenshot capture...\n');

  // 1. Welcome Step
  console.log('1. Capturing Welcome Step...');
  await page.goto('http://localhost:5173/onboarding', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-welcome.png'), fullPage: true });
  console.log('  ✓ Saved: 01-welcome.png');

  // Click "Let's Get Started" to go to Goals
  try {
    await page.click('button:has-text("Get Started")');
    await page.waitForTimeout(1500);
  } catch (e) {
    console.log('  Note: Could not find Get Started button, trying to continue...');
  }

  // 2. Goals Step
  console.log('2. Capturing Goals Step (empty)...');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-goals-empty.png'), fullPage: true });
  console.log('  ✓ Saved: 02-goals-empty.png');

  // Select some goals
  console.log('3. Selecting goals...');
  try {
    // Click on first 3 goal cards
    const goalCards = await page.locator('.goal-card').all();
    if (goalCards.length >= 3) {
      await goalCards[0].click();
      await page.waitForTimeout(300);
      await goalCards[1].click();
      await page.waitForTimeout(300);
      await goalCards[2].click();
      await page.waitForTimeout(500);
    }
  } catch (e) {
    console.log('  Note: Could not click goal cards');
  }

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-goals-selected.png'), fullPage: true });
  console.log('  ✓ Saved: 03-goals-selected.png');

  // Click Continue to go to Quick Win
  try {
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(1500);
  } catch (e) {
    console.log('  Note: Could not find Continue button');
  }

  // 3. Quick Win Step
  console.log('4. Capturing Quick Win Step...');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-quick-win.png'), fullPage: true });
  console.log('  ✓ Saved: 04-quick-win.png');

  // Try to complete a quick win
  try {
    const quickWinCards = await page.locator('.quick-win-card').all();
    if (quickWinCards.length > 0) {
      await quickWinCards[0].click();
      await page.waitForTimeout(500);
    }

    // Try clicking continue
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(1500);
  } catch (e) {
    console.log('  Note: Could not complete quick win');
  }

  // 4. Module Setup Step
  console.log('5. Capturing Module Setup Step...');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-module-setup.png'), fullPage: true });
  console.log('  ✓ Saved: 05-module-setup.png');

  // Try to skip through module setup
  try {
    for (let i = 0; i < 5; i++) {
      const skipBtn = await page.locator('button:has-text("Skip")').first();
      if (await skipBtn.isVisible()) {
        await skipBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `06-module-setup-${i + 2}.png`),
          fullPage: true
        });
        console.log(`  ✓ Saved: 06-module-setup-${i + 2}.png`);
      } else {
        break;
      }
    }
  } catch (e) {
    console.log('  Note: Module setup navigation ended');
  }

  // 5. Dashboard Reveal
  console.log('6. Capturing Dashboard Reveal...');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-dashboard-reveal.png'), fullPage: true });
  console.log('  ✓ Saved: 07-dashboard-reveal.png');

  await browser.close();
  console.log('\nOnboarding screenshot capture complete!');
  console.log(`Screenshots saved to: ${SCREENSHOT_DIR}/`);
}

takeOnboardingScreenshots().catch(console.error);
