import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 }
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
      activeCosmetics: { title: null, aura: null, frame: null }
    },
    version: 0
  }));

  localStorage.setItem('lifeos_owned_cosmetics', JSON.stringify(['aura_golden', 'aura_flame', 'aura_cosmic', 'aura_ice', 'aura_starlight', 'aura_dark', 'aura_electric']));
});

await page.reload();
await page.waitForTimeout(2000);

// Navigate to character page
await page.goto('http://localhost:5173/character');
await page.waitForTimeout(3000);

// Take screenshots of all auras
const auras = [
  { id: 'aura_flame', name: 'Phoenix Flame' },
  { id: 'aura_cosmic', name: 'Cosmic Energy' },
  { id: 'aura_electric', name: 'Lightning Surge' },
  { id: 'aura_golden', name: 'Golden Radiance' },
  { id: 'aura_ice', name: 'Ice Crystal' },
  { id: 'aura_starlight', name: 'Starlight Aura' },
  { id: 'aura_dark', name: 'Shadow Force' },
];

for (const aura of auras) {
  await page.evaluate((auraId) => {
    localStorage.setItem('lifeos_active_cosmetics', JSON.stringify({ title: null, aura: auraId, frame: null }));
  }, aura.id);

  await page.reload();
  await page.waitForTimeout(2000);

  await page.screenshot({ path: `/tmp/aura-${aura.id}.png` });
  console.log(`✓ ${aura.name} -> /tmp/aura-${aura.id}.png`);
}

console.log('\nAll aura screenshots saved!');
await browser.close();
