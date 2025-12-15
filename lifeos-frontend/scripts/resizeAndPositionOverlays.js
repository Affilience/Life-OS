/**
 * Resize and Reposition Equipment Overlays
 *
 * Takes existing 128x128 equipment sprites and:
 * 1. Scales them down to appropriate size
 * 2. Positions them correctly on a new 128x128 canvas
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIR = path.join(__dirname, '..', 'public', 'assets', 'equipment', 'overlays');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'assets', 'equipment', 'overlays-positioned');

/**
 * Position specifications for each equipment slot
 * Based on chibi character proportions in 128x128 canvas:
 * - Character is roughly 70-80px tall, centered
 * - Head top at ~y:20, bottom at ~y:45
 * - Torso from ~y:45 to ~y:75
 * - Legs from ~y:75 to ~y:105
 * - Feet at ~y:105-120
 */
const SLOT_POSITIONS = {
  helmets: {
    scale: 0.35,      // Helmet ~45px
    x: 42,            // Center on head
    y: 8,             // On top of head (not covering face)
  },
  chest: {
    scale: 0.35,      // Scale to ~45px
    x: 42,            // Center on torso
    y: 35,            // Torso area
  },
  legs: {
    scale: 0.30,      // Scale to ~38px
    x: 45,            // Center
    y: 65,            // Lower body
  },
  boots: {
    scale: 0.25,      // Scale to ~32px
    x: 48,            // Center
    y: 92,            // Feet area
  },
  weapons: {
    scale: 0.42,      // Weapons
    x: 78,            // Right hand position
    y: 30,            // Hand height
  },
  shields: {
    scale: 0.32,      // Shield size
    x: 15,            // Left hand position (character's left hand is ~x:30-45)
    y: 42,            // Hand height
  },
  capes: {
    scale: 0.50,      // Capes behind body
    x: 32,            // Centered behind
    y: 28,            // From shoulders down
  },
  gloves: {
    scale: 0.20,      // Small gloves
    x: 44,            // Near hands
    y: 52,
  },
};

async function processOverlay(inputPath, outputPath, slotConfig) {
  try {
    // Load the original image
    const img = await loadImage(inputPath);

    // Create new 128x128 canvas
    const canvas = createCanvas(128, 128);
    const ctx = canvas.getContext('2d');

    // Clear with transparency
    ctx.clearRect(0, 0, 128, 128);

    // Calculate new size
    const newSize = Math.round(128 * slotConfig.scale);

    // Draw scaled and positioned
    ctx.imageSmoothingEnabled = false; // Keep pixel art crisp
    ctx.drawImage(
      img,
      0, 0, 128, 128,           // Source: full original image
      slotConfig.x, slotConfig.y, // Destination position
      newSize, newSize           // Destination size
    );

    // Save
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    return { success: true, newSize };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🔧 RESIZE AND REPOSITION EQUIPMENT OVERLAYS');
  console.log('==========================================\n');

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let processed = 0;
  let failed = 0;

  // Process each slot category
  for (const [slot, config] of Object.entries(SLOT_POSITIONS)) {
    const slotInputDir = path.join(INPUT_DIR, slot);
    const slotOutputDir = path.join(OUTPUT_DIR, slot);

    // Skip if input directory doesn't exist
    if (!fs.existsSync(slotInputDir)) {
      console.log(`⏭️  Skipping ${slot} (no input directory)`);
      continue;
    }

    // Create output subdirectory
    if (!fs.existsSync(slotOutputDir)) {
      fs.mkdirSync(slotOutputDir, { recursive: true });
    }

    console.log(`\n📦 ${slot.toUpperCase()}`);
    console.log(`   Scale: ${(config.scale * 100).toFixed(0)}% | Position: (${config.x}, ${config.y})`);

    // Get all PNG files
    const files = fs.readdirSync(slotInputDir).filter(f => f.endsWith('.png'));

    for (const file of files) {
      const inputPath = path.join(slotInputDir, file);
      const outputPath = path.join(slotOutputDir, file);

      const result = await processOverlay(inputPath, outputPath, config);

      if (result.success) {
        console.log(`   ✅ ${file} → ${result.newSize}x${result.newSize}px`);
        processed++;
      } else {
        console.log(`   ❌ ${file}: ${result.error}`);
        failed++;
      }
    }
  }

  console.log('\n==========================================');
  console.log(`✨ Done! ${processed} processed, ${failed} failed`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);
