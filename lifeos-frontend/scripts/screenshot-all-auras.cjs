const { chromium } = require('playwright');

const AURAS = ['aura_flame', 'aura_starlight', 'aura_cosmic', 'aura_ice', 'aura_golden'];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  for (const aura of AURAS) {
    // Set localStorage on the main domain
    await page.goto('http://localhost:5173');
    await page.evaluate((auraType) => {
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

      // Add cosmetics - set this specific aura as active
      localStorage.setItem('lifeos_owned_cosmetics', JSON.stringify([
        'aura_starlight', 'aura_flame', 'aura_cosmic', 'aura_ice', 'aura_golden'
      ]));
      localStorage.setItem('lifeos_active_cosmetics', JSON.stringify({
        title: null,
        aura: auraType,
        frame: null
      }));
    }, aura);

    // Navigate to character page
    await page.goto('http://localhost:5173/character');
    await page.waitForTimeout(2500);

    const filename = `/tmp/aura-${aura.replace('aura_', '')}.png`;
    await page.screenshot({ path: filename, fullPage: false });
    console.log(`Screenshot saved: ${filename}`);
  }

  await browser.close();
  console.log('All aura screenshots complete!');
})();
