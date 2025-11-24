/**
 * Generate Equipment Slot Icons using PixelLab API
 * Creates 48x48 pixel art icons for each equipment slot
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

const BASE_NEGATIVE = 'blurry, low quality, distorted, noisy, bad anatomy, oversaturated, realistic, 3d render, photograph';

const SLOT_ICONS = {
  helmet: {
    name: 'Helmet Slot',
    filename: 'slot_helmet.png',
    size: 48,
    prompt: `pixel art fantasy medieval helmet icon, steel helmet with horns, centered, game UI icon style, dark fantasy RPG, high detail pixel art, 48x48, icon view, symmetrical, item icon`,
  },
  chest: {
    name: 'Chest Armor Slot',
    filename: 'slot_chest.png',
    size: 48,
    prompt: `pixel art fantasy medieval chest armor icon, plate armor with shoulder guards, centered, game UI icon style, dark fantasy RPG, high detail pixel art, 48x48, icon view, symmetrical, item icon`,
  },
  weapon: {
    name: 'Weapon Slot',
    filename: 'slot_weapon.png',
    size: 48,
    prompt: `pixel art fantasy medieval sword icon, legendary longsword with glowing blade, centered, game UI icon style, dark fantasy RPG, high detail pixel art, 48x48, icon view, diagonal pose, item icon`,
  },
  shield: {
    name: 'Shield Slot',
    filename: 'slot_shield.png',
    size: 48,
    prompt: `pixel art fantasy medieval shield icon, kite shield with emblem, centered, game UI icon style, dark fantasy RPG, high detail pixel art, 48x48, icon view, symmetrical, item icon`,
  },
  cape: {
    name: 'Cape Slot',
    filename: 'slot_cape.png',
    size: 48,
    prompt: `pixel art fantasy medieval cape icon, flowing red cape with gold trim, centered, game UI icon style, dark fantasy RPG, high detail pixel art, 48x48, icon view, symmetrical, item icon`,
  },
  ring: {
    name: 'Ring Slot',
    filename: 'slot_ring.png',
    size: 48,
    prompt: `pixel art fantasy magical ring icon, gold ring with glowing gemstone, centered, game UI icon style, dark fantasy RPG, high detail pixel art, 48x48, icon view, symmetrical, item icon`,
  },
  amulet: {
    name: 'Amulet Slot',
    filename: 'slot_amulet.png',
    size: 48,
    prompt: `pixel art fantasy magical amulet icon, ornate pendant with mystical gem, centered, game UI icon style, dark fantasy RPG, high detail pixel art, 48x48, icon view, symmetrical, item icon`,
  },
  empty_slot: {
    name: 'Empty Slot Background',
    filename: 'slot_empty.png',
    size: 48,
    prompt: `pixel art empty equipment slot icon, ornate frame border, medieval stone texture, centered, game UI icon style, dark fantasy RPG, high detail pixel art, 48x48, icon view, symmetrical`,
  },
};

async function generateSlotIcon(slotKey, config) {
  console.log(`\n🎨 Generating ${config.name}...`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: config.prompt,
        negative_description: BASE_NEGATIVE,
        image_size: {
          width: config.size,
          height: config.size,
        },
        text_guidance_scale: 8.5,
        no_background: false, // Keep background for slot icons
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.image || !data.image.base64) {
      throw new Error('No image data in response');
    }

    // Extract base64 data
    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Save to public/assets/equipment/slots/
    const outputDir = path.join(__dirname, '../public/assets/equipment/slots');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, config.filename);
    fs.writeFileSync(outputPath, buffer);

    console.log(`✅ Saved: ${config.filename}`);
    console.log(`   Cost: $${data.cost?.toFixed(4) || 'N/A'}`);

    return {
      success: true,
      filename: config.filename,
      path: outputPath,
    };

  } catch (error) {
    console.error(`❌ Failed to generate ${config.name}:`, error.message);
    return {
      success: false,
      filename: config.filename,
      error: error.message,
    };
  }
}

async function generateAllSlotIcons() {
  console.log('🎮 Equipment Slot Icon Generator');
  console.log('================================\n');
  console.log(`Generating ${Object.keys(SLOT_ICONS).length} slot icons...`);

  const results = [];

  for (const [slotKey, config] of Object.entries(SLOT_ICONS)) {
    const result = await generateSlotIcon(slotKey, config);
    results.push(result);

    // Wait 2 seconds between requests to avoid rate limiting
    if (slotKey !== Object.keys(SLOT_ICONS)[Object.keys(SLOT_ICONS).length - 1]) {
      console.log('⏳ Waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Summary
  console.log('\n\n📊 Generation Summary');
  console.log('=====================');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);

  if (failed > 0) {
    console.log('\n❌ Failed icons:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.filename}: ${r.error}`);
    });
  }

  console.log('\n✨ All slot icons generated!');
  console.log(`📁 Location: public/assets/equipment/slots/`);
}

// Run the generator
generateAllSlotIcons().catch(console.error);
