const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  // Set localStorage
  await page.goto('http://localhost:5173');
  await page.evaluate(() => {
    localStorage.setItem('lifeos_onboarding_complete', 'true');
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('nova_onboarding_completed', 'true');
    localStorage.setItem('lifeos-new-onboarding', JSON.stringify({
      state: { isOnboardingComplete: true, currentStep: 100, hasSeenWelcome: true },
      version: 0
    }));
    localStorage.setItem('lifeos_owned_cosmetics', JSON.stringify(['aura_flame']));
    localStorage.setItem('lifeos_active_cosmetics', JSON.stringify({
      title: null,
      aura: 'aura_flame',
      frame: null
    }));
  });

  await page.goto('http://localhost:5173/character');
  await page.waitForTimeout(2500);

  await page.screenshot({ path: '/tmp/flame-v2.png', fullPage: false });
  console.log('Screenshot saved to /tmp/flame-v2.png');

  await browser.close();
})();
