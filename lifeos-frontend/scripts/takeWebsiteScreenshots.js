/**
 * Take screenshots for the website
 * - Waits for actual content to load
 * - Sets up localStorage to bypass onboarding
 * - Takes high-quality screenshots
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const PAGES = [
  { path: '/', name: 'dashboard', waitFor: '.dashboard, [class*="dashboard"], main' },
  { path: '/modules', name: 'modules', waitFor: '.modules, [class*="module"], main' },
  { path: '/character', name: 'character', waitFor: '.character, [class*="character"], canvas, main' },
  { path: '/productivity', name: 'productivity', waitFor: '.productivity, [class*="productivity"], main' },
  { path: '/health', name: 'health', waitFor: '.health, [class*="health"], main' },
  { path: '/journal', name: 'journal', waitFor: '.journal, [class*="journal"], main' },
  { path: '/skills', name: 'skills', waitFor: '.skills, [class*="skill"], main' },
  { path: '/quests', name: 'quests', waitFor: '.quests, [class*="quest"], main' },
  { path: '/rewards', name: 'rewards', waitFor: '.rewards, [class*="reward"], main' },
  { path: '/avatar', name: 'avatar-equipment', waitFor: 'canvas, .avatar, [class*="avatar"], main' },
  { path: '/calendar', name: 'calendar', waitFor: '.calendar, [class*="calendar"], main' },
  { path: '/financial', name: 'financial', waitFor: '.financial, [class*="financial"], main' },
];

const SCREENSHOT_DIR = './screenshots-website';

// LocalStorage setup to bypass onboarding and all tours
const LOCALSTORAGE_SETUP = {
  'lifeos-onboarding': JSON.stringify({
    state: {
      isOnboardingComplete: true,
      isOnboardingActive: false,
      gamificationMode: 'cosmic',
      profile: { username: 'Explorer', gender: 'male' },
      lifeGoals: ['productivity', 'health', 'learning'],
    },
    version: 0,
  }),
  'lifeos-gamification': JSON.stringify({
    state: {
      xp: 2500,
      level: 15,
      streakDays: 7,
      totalXPEarned: 5000,
    },
    version: 0,
  }),
  'lifeos-avatar': JSON.stringify({
    state: {
      characterGender: 'male',
      evolutionStage: 10,
      equipped: {},
    },
    version: 0,
  }),
  // Disable all page tours
  'lifeos-tour-dashboard': 'completed',
  'lifeos-tour-character': 'completed',
  'lifeos-tour-productivity': 'completed',
  'lifeos-tour-health': 'completed',
  'lifeos-tour-journal': 'completed',
  'lifeos-tour-skills': 'completed',
  'lifeos-tour-quests': 'completed',
  'lifeos-tour-rewards': 'completed',
  'lifeos-tour-avatar': 'completed',
  'lifeos-tour-calendar': 'completed',
  'lifeos-tour-financial': 'completed',
  'lifeos-tour-modules': 'completed',
  'tour-dismissed-dashboard': 'true',
  'tour-dismissed-character': 'true',
  'tour-dismissed-productivity': 'true',
  'tour-dismissed-all': 'true',
};

async function takeScreenshots() {
  // Create screenshots directory
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-web-security', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2, // High DPI for crisp screenshots
  });

  const page = await context.newPage();

  // Set up localStorage before navigating
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 10000 });

  // Set localStorage
  for (const [key, value] of Object.entries(LOCALSTORAGE_SETUP)) {
    await page.evaluate(([k, v]) => localStorage.setItem(k, v), [key, value]);
  }

  console.log('✅ LocalStorage configured');
  console.log('📸 Starting screenshot capture...\n');

  for (const route of PAGES) {
    const url = `http://localhost:5173${route.path}`;
    const filename = `${route.name}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);

    try {
      console.log(`📷 Capturing: ${route.name} (${route.path})`);

      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait for content to appear (try multiple selectors)
      try {
        await page.waitForSelector(route.waitFor, { timeout: 8000 });
      } catch {
        console.log(`   ⚠️ Primary selector not found, waiting for any content...`);
      }

      // Wait for loading screens to disappear
      await page.waitForTimeout(2000);

      // Click any dismiss/skip buttons for tour modals
      try {
        const dismissButtons = await page.$$('button:has-text("Skip"), button:has-text("Don\'t Show"), button:has-text("Close"), [aria-label="Close"]');
        for (const btn of dismissButtons) {
          await btn.click().catch(() => {});
        }
      } catch {}

      // Hide any modals, loading overlays, and tour elements
      await page.evaluate(() => {
        // Hide loading elements
        const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="loader"]');
        loadingElements.forEach(el => el.style.display = 'none');

        // Hide tour modals
        const modals = document.querySelectorAll('[class*="modal"], [class*="tour"], [class*="overlay"], [role="dialog"]');
        modals.forEach(el => el.style.display = 'none');

        // Remove any backdrop/overlay
        const backdrops = document.querySelectorAll('[class*="backdrop"], [class*="Backdrop"]');
        backdrops.forEach(el => el.style.display = 'none');
      });

      // Additional wait for animations
      await page.waitForTimeout(1000);

      // Take screenshot
      await page.screenshot({
        path: filepath,
        fullPage: false, // Just viewport for cleaner shots
      });

      console.log(`   ✅ Saved: ${filename}`);
    } catch (error) {
      console.log(`   ❌ Failed: ${filename} - ${error.message}`);
    }
  }

  await browser.close();
  console.log('\n✨ Screenshot capture complete!');
  console.log(`📁 Screenshots saved to: ${SCREENSHOT_DIR}/`);
}

takeScreenshots().catch(console.error);
