import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const PAGES = [
  { path: '/', name: '01-dashboard' },
  { path: '/modules', name: '02-modules' },
  { path: '/character', name: '03-character' },
  { path: '/social', name: '04-social' },
  { path: '/quests', name: '05-quests-missions' },
  { path: '/settings', name: '06-settings' },
  { path: '/productivity', name: '07-productivity' },
  { path: '/health', name: '08-health' },
  { path: '/knowledge', name: '09-knowledge' },
  { path: '/journal', name: '10-journal' },
  { path: '/calendar', name: '11-calendar' },
  { path: '/purpose', name: '12-purpose-values' },
  { path: '/financial', name: '13-financial' },
  { path: '/rewards', name: '14-rewards' },
  { path: '/streaks', name: '15-streaks' },
  { path: '/resolutions', name: '16-resolutions' },
  { path: '/discoveries', name: '17-discoveries' },
  { path: '/learn', name: '16-learn' },
  { path: '/skills', name: '17-skills' },
  { path: '/avatar', name: '18-avatar-equipment' },
  { path: '/ai', name: '19-ai-companion' },
];

const SCREENSHOT_DIR = './screenshots';

async function takeScreenshots() {
  // Create screenshots directory
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  console.log('Starting screenshot capture...\n');

  for (const route of PAGES) {
    const url = `http://localhost:5173${route.path}`;
    const filename = `${route.name}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);

    try {
      console.log(`Capturing: ${route.name} (${route.path})`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait for animations to settle
      await page.waitForTimeout(1500);

      // Take full page screenshot
      await page.screenshot({
        path: filepath,
        fullPage: true
      });

      console.log(`  ✓ Saved: ${filename}`);
    } catch (error) {
      console.log(`  ✗ Failed: ${filename} - ${error.message}`);
    }
  }

  await browser.close();
  console.log('\nScreenshot capture complete!');
  console.log(`Screenshots saved to: ${SCREENSHOT_DIR}/`);
}

takeScreenshots().catch(console.error);
