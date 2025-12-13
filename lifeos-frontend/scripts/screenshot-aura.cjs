const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  // First set localStorage on the main domain
  await page.goto('http://localhost:5173');
  await page.evaluate(() => {
    // Skip ALL onboarding systems
    localStorage.setItem('lifeos_onboarding_complete', 'true');
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('nova_onboarding_completed', 'true');

    // Set Zustand persist store for new onboarding
    localStorage.setItem('lifeos-new-onboarding', JSON.stringify({
      state: {
        isOnboardingComplete: true,
        currentStep: 100,
        hasSeenWelcome: true
      },
      version: 0
    }));

    // Add cosmetics - user owns and has flame aura active
    localStorage.setItem('lifeos_owned_cosmetics', JSON.stringify([
      'aura_starlight', 'aura_flame', 'aura_cosmic'
    ]));
    localStorage.setItem('lifeos_active_cosmetics', JSON.stringify({
      title: null,
      aura: 'aura_flame',
      frame: null
    }));
  });

  // Reload to apply the localStorage
  await page.reload();
  await page.waitForTimeout(1500);

  // Now navigate to character page
  await page.goto('http://localhost:5173/character');
  await page.waitForTimeout(3000);

  await page.screenshot({ path: '/tmp/character-aura-v2.png', fullPage: false });
  console.log('Screenshot saved to /tmp/character-aura-v2.png');

  await browser.close();
})();
