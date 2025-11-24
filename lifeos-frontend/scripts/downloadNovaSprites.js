/**
 * Script to download Nova sprites from PixelLab
 * Run with: node scripts/downloadNovaSprites.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = path.join(__dirname, '..', 'public', 'assets', 'nova');
const IDS_FILE = path.join(ASSETS_DIR, 'character_ids.json');

// PixelLab user ID (from the avatar script)
const USER_ID = 'e823ea4f-74d5-45b8-a0fc-3e48ba202181';

async function downloadNovaStage(stageName, characterId) {
  const stageDir = path.join(ASSETS_DIR, stageName);

  // Create directory if it doesn't exist
  if (!fs.existsSync(stageDir)) {
    fs.mkdirSync(stageDir, { recursive: true });
  }

  const directions = ['south', 'west', 'east', 'north'];

  console.log(`\n📥 Downloading ${stageName} form...`);

  // Add timestamp to bypass cache
  const timestamp = Date.now();

  for (const direction of directions) {
    const url = `https://backblaze.pixellab.ai/file/pixellab-characters/${USER_ID}/${characterId}/rotations/${direction}.png?t=${timestamp}`;
    const filepath = path.join(stageDir, `${direction}.png`);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`  ✗ ${direction}: HTTP ${response.status}`);
        continue;
      }

      const buffer = await response.arrayBuffer();
      fs.writeFileSync(filepath, Buffer.from(buffer));
      console.log(`  ✓ ${direction}.png`);
    } catch (error) {
      console.error(`  ✗ ${direction}: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🌟 Downloading Nova AI Companion Sprites...');
  console.log('==========================================');

  // Check if character IDs file exists
  if (!fs.existsSync(IDS_FILE)) {
    console.error('\n❌ Error: character_ids.json not found!');
    console.error('Please run: node scripts/generateNovaSprites.js first\n');
    process.exit(1);
  }

  // Read character IDs
  const ids = JSON.parse(fs.readFileSync(IDS_FILE, 'utf8'));

  // Download each stage
  for (const [stageName, characterId] of Object.entries(ids)) {
    await downloadNovaStage(stageName, characterId);
    // Wait 500ms between downloads
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n==========================================');
  console.log('✅ Download complete!');
  console.log(`\nSprites saved to: ${ASSETS_DIR}/`);
  console.log('\nFolder structure:');
  console.log(`${ASSETS_DIR}/`);
  console.log('  ├── spark/');
  console.log('  │   ├── south.png');
  console.log('  │   ├── west.png');
  console.log('  │   ├── east.png');
  console.log('  │   └── north.png');
  console.log('  ├── teen/');
  console.log('  ├── stellar/');
  console.log('  └── cosmos/');
  console.log('');
}

main().catch(console.error);
