import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 }
});
const page = await context.newPage();

// Set localStorage to bypass onboarding
await page.goto('http://localhost:5173');
await page.evaluate(() => {
  localStorage.setItem('lifeos-new-onboarding', JSON.stringify({
    state: {
      isOnboardingComplete: true,
      isOnboardingActive: false,
      currentStep: 'completed',
      stepIndex: 7
    },
    version: 0
  }));
});

await page.reload();
await page.waitForTimeout(2000);

// Navigate to character page
await page.goto('http://localhost:5173/character');
await page.waitForTimeout(3000);

// Click on Bazaar tab using locator
await page.locator('button', { hasText: 'Bazaar' }).click();
await page.waitForTimeout(2000);

// Take first screenshot showing the bazaar
await page.screenshot({ path: '/tmp/bazaar-all.png' });
console.log('Screenshot 1 saved to /tmp/bazaar-all.png');

// Try to click cosmetics filter
try {
  // Look for filter buttons in the bazaar content area
  await page.locator('button:has-text("Cosmetics")').nth(1).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/bazaar-cosmetics.png' });
  console.log('Screenshot 2 saved to /tmp/bazaar-cosmetics.png');
} catch (e) {
  console.log('Could not click cosmetics filter:', e.message);
}

await browser.close();
