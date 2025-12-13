import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 }
});
const page = await context.newPage();

// Set localStorage to bypass onboarding and set equipped aura
await page.goto('http://localhost:5173');
await page.evaluate(() => {
  // Zustand persist format
  localStorage.setItem('lifeos-new-onboarding', JSON.stringify({
    state: {
      isOnboardingComplete: true,
      isOnboardingActive: false,
      currentStep: 'completed',
      stepIndex: 7
    },
    version: 0
  }));

  // Set avatar store with equipped aura - must include all partialized fields
  localStorage.setItem('avatar-storage', JSON.stringify({
    state: {
      level: 1,
      xp: 0,
      currentTier: 1,
      prestige: 0,
      totalLevelsEarned: 0,
      totalXPEarned: 0,
      characterGender: 'male',
      equipped: {},
      cosmetic: {},
      dyes: {},
      unlockedEquipment: [],
      stats: { strength: 0, vitality: 0, intelligence: 0, wisdom: 0, defense: 0 },
      moduleProgress: {},
      ownedCosmetics: ['aura_golden', 'aura_flame', 'aura_cosmic', 'aura_ice', 'aura_starlight', 'aura_dark', 'aura_electric'],
      activeCosmetics: {
        title: null,
        aura: 'aura_flame',
        frame: null
      }
    },
    version: 0
  }));

  // Also set the separate cosmetics localStorage keys that loadCosmetics() reads from
  localStorage.setItem('lifeos_owned_cosmetics', JSON.stringify(['aura_golden', 'aura_flame', 'aura_cosmic', 'aura_ice', 'aura_starlight', 'aura_dark', 'aura_electric']));
  localStorage.setItem('lifeos_active_cosmetics', JSON.stringify({ title: null, aura: 'aura_flame', frame: null }));
});

// Reload to apply localStorage
await page.reload();
await page.waitForTimeout(2000);

// Navigate to character page
await page.goto('http://localhost:5173/character');
await page.waitForTimeout(3000);

// Take screenshot of starlight aura
await page.evaluate(() => {
  localStorage.setItem('lifeos_active_cosmetics', JSON.stringify({ title: null, aura: 'aura_starlight', frame: null }));
});

await page.reload();
await page.waitForTimeout(2500);

await page.screenshot({ path: '/tmp/character-starlight-new.png' });
console.log('Screenshot saved to /tmp/character-starlight-new.png');

await browser.close();
