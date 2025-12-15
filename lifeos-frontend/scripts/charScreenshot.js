import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  // Set localStorage to skip onboarding
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 });
  await page.evaluate(() => {
    // Set onboarding as completed (zustand persist format)
    localStorage.setItem('lifeos-onboarding', JSON.stringify({
      state: { state: 'completed' },
      version: 0
    }));
    // Also set new onboarding as completed
    localStorage.setItem('lifeos-new-onboarding', JSON.stringify({
      state: {
        currentStep: 'completed',
        isOnboardingComplete: true,
        isOnboardingActive: false,
        gamificationMode: 'cosmic'
      },
      version: 1
    }));
    localStorage.setItem('lifeos-gamification-mode', JSON.stringify({
      state: { mode: 'cosmic' },
      version: 0
    }));
    localStorage.setItem('lifeos-dashboard', JSON.stringify({
      state: { hasCompletedOnboardingSetup: true },
      version: 0
    }));
  });

  // Reload to apply
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Now go to equipment test page
  await page.goto('http://localhost:5173/equipment-test', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/equipment-test.png' });
  console.log('Equipment test screenshot saved');

  // Then go to character page
  await page.goto('http://localhost:5173/character', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  // Try to dismiss any modals
  try { await page.click('text=Skip This One', { timeout: 1000 }); } catch (e) {}
  try { await page.click("text=Don't Show Again", { timeout: 1000 }); } catch (e) {}

  await page.waitForTimeout(500);

  // Click on Equipment tab
  try {
    await page.click('text=Equipment', { timeout: 3000 });
  } catch (e) {
    console.log('Could not click Equipment tab:', e.message);
  }

  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/character-page.png' });
  console.log('Character page screenshot saved');

  await browser.close();
})();
