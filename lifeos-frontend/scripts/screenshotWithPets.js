import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 }
});
const page = await context.newPage();

// Set localStorage to bypass onboarding and set up pets
await page.goto('http://localhost:5173');
await page.evaluate(() => {
  // Bypass onboarding
  localStorage.setItem('lifeos-new-onboarding', JSON.stringify({
    state: {
      isOnboardingComplete: true,
      isOnboardingActive: false,
      currentStep: 'completed',
      stepIndex: 7
    },
    version: 0
  }));

  // Set up pet store with active pets
  localStorage.setItem('pet-storage', JSON.stringify({
    state: {
      ownedPets: ['common_kitsune_pup', 'common_fennec_fox', 'rare_thunder_wolf'],
      activePets: ['common_kitsune_pup', 'common_fennec_fox'],
      maxSlots: 3
    },
    version: 0
  }));

  // Set aura
  localStorage.setItem('lifeos_active_cosmetics', JSON.stringify({ title: null, aura: 'aura_flame', frame: null }));
  localStorage.setItem('lifeos_owned_cosmetics', JSON.stringify(['aura_flame']));
});

// Reload to apply localStorage
await page.reload();
await page.waitForTimeout(2000);

// Navigate to character page
await page.goto('http://localhost:5173/character');
await page.waitForTimeout(4000);

await page.screenshot({ path: '/tmp/character-with-pets.png' });
console.log('Screenshot saved to /tmp/character-with-pets.png');

await browser.close();
