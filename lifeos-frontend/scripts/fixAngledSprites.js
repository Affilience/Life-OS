import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Items that need regeneration - perfectly front facing, symmetrical
const ITEMS_TO_FIX = [
  // CHESTPLATES - angled issues
  {
    folder: 'chests',
    filename: 'armor_cosmic.png',
    description: 'cosmic purple space armor breastplate, PERFECTLY FRONT FACING symmetrical view, glowing stars and galaxy pattern, no neck hole, chest armor only, fantasy RPG equipment icon, pixel art, transparent background, 64x64',
  },
  {
    folder: 'chests',
    filename: 'armor_plate.png',
    description: 'steel plate armor breastplate, PERFECTLY FRONT FACING symmetrical view, polished metal chestpiece with rivets, no neck hole, chest armor only, fantasy RPG equipment icon, pixel art, transparent background, 64x64',
  },
  {
    folder: 'chests',
    filename: 'leather_vest.png',
    description: 'brown leather armor vest, PERFECTLY FRONT FACING symmetrical view, buckled leather chestpiece with straps, no neck hole, chest armor only, fantasy RPG equipment icon, pixel art, transparent background, 64x64',
  },
  {
    folder: 'chests',
    filename: 'reinforced_breastplate.png',
    description: 'reinforced dark steel breastplate, PERFECTLY FRONT FACING symmetrical view, heavy metal armor with rivets and plates, no neck hole, chest armor only, fantasy RPG equipment icon, pixel art, transparent background, 64x64',
  },

  // HELMETS - angled issues
  {
    folder: 'helmets',
    filename: 'leather_hood.png',
    description: 'brown leather hood helmet, PERFECTLY FRONT FACING symmetrical view, rogues leather cowl covering head, fantasy RPG headgear, pixel art, transparent background, 64x64',
  },
  {
    folder: 'helmets',
    filename: 'training_helmet.png',
    description: 'simple brown training helmet, PERFECTLY FRONT FACING symmetrical view, basic padded leather practice helmet, fantasy RPG headgear, pixel art, transparent background, 64x64',
  },
  {
    folder: 'helmets',
    filename: 'cloth_cap.png',
    description: 'green cloth peasant cap, PERFECTLY FRONT FACING symmetrical view, simple fabric hat with visible color, fantasy RPG headgear, pixel art, transparent background, 64x64',
  },
];

async function generateItem(item) {
  console.log(`\n🎨 Fixing ${item.folder}/${item.filename}...`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: item.description,
        negative_description: 'angled, tilted, side view, three quarter view, rotated, asymmetrical, profile, turned',
        image_size: { width: 64, height: 64 },
        text_guidance_scale: 9,
        no_background: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Generated - Cost: $${data.usage.usd.toFixed(4)}`);

    const outputDir = path.join(__dirname, `../public/assets/equipment/${item.folder}`);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const outputPath = path.join(outputDir, item.filename);

    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`💾 Saved: ${outputPath}`);

    return { success: true, cost: data.usage.usd };
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🔧 Fixing Angled Sprites');
  console.log(`📦 ${ITEMS_TO_FIX.length} items to regenerate\n`);

  let totalCost = 0;
  let successCount = 0;

  for (const item of ITEMS_TO_FIX) {
    const result = await generateItem(item);
    if (result.success) {
      totalCost += result.cost;
      successCount++;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✨ Complete! ${successCount}/${ITEMS_TO_FIX.length} fixed`);
  console.log(`💰 Total Cost: $${totalCost.toFixed(4)}`);
}

main();
