import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_LEVELS = [
  { level: 1, name: 'Ordinary Human' },
  { level: 3, name: 'Trainee' },
  { level: 5, name: 'Recruit' },
  { level: 9, name: 'Cadet' },
  { level: 11, name: 'Junior Astronaut' },
  { level: 15, name: 'Elite Astronaut' },
  { level: 18, name: 'Tech Specialist' },
  { level: 26, name: 'Heavy Cyborg' },
  { level: 51, name: 'Ascended Cyborg' },
];

async function testEvolutionStage(level, stageName) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to the page
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });

    // Modify localStorage to set the level
    await page.evaluate((testLevel) => {
      const storageKey = 'avatar-store';
      const currentData = JSON.parse(localStorage.getItem(storageKey) || '{}');

      // Update level and XP
      currentData.state = {
        ...currentData.state,
        level: testLevel,
        xp: 0,
        // Update tier based on level
        currentTier: testLevel >= 51 ? 4 : testLevel >= 26 ? 3 : testLevel >= 11 ? 2 : 1,
      };

      localStorage.setItem(storageKey, JSON.stringify(currentData));
    }, level);

    // Reload the page to apply changes
    await page.reload({ waitUntil: 'networkidle0' });

    // Wait a bit for rendering
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot
    const filename = `test-evolution-level-${level}-${stageName.toLowerCase().replace(/\s+/g, '-')}.png`;
    const filepath = path.join(__dirname, '..', filename);
    await page.screenshot({ path: filepath });

    console.log(`✅ Level ${level} (${stageName}): ${filename}`);

  } catch (error) {
    console.error(`❌ Error testing level ${level}:`, error.message);
  } finally {
    await browser.close();
  }
}

async function runTests() {
  console.log('🧪 Testing Evolution Progression System\n');
  console.log(`Testing ${TEST_LEVELS.length} evolution stages...\n`);

  for (const { level, name } of TEST_LEVELS) {
    await testEvolutionStage(level, name);
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n✨ All progression tests complete!');
}

runTests().catch(console.error);
