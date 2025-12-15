import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Items to regenerate with proper prompts
const ITEMS_TO_REGENERATE = [
  // HELMETS
  {
    folder: 'helmets',
    filename: 'basic.png',
    description: 'simple leather adventurer cap, basic starter helmet, front facing view, fantasy RPG headgear, pixel art style, transparent background',
  },
  {
    folder: 'helmets',
    filename: 'iron.png',
    description: 'iron medieval knight helmet with visor, front facing view, fantasy RPG armor, dark metal helmet, pixel art style, transparent background',
  },
  {
    folder: 'helmets',
    filename: 'mindguard_helmet.png',
    description: 'purple psychic protection helmet with glowing runes, front facing view, magical headgear, fantasy RPG helmet, pixel art style, transparent background',
  },
  {
    folder: 'helmets',
    filename: 'reinforced_coif.png',
    description: 'chainmail coif hood helmet covering head and neck, front facing view, medieval armor headpiece, fantasy RPG helmet, pixel art style, transparent background',
  },

  // CHESTPLATES
  {
    folder: 'chests',
    filename: 'aegis_titan.png',
    description: 'golden titan chestplate armor, front view torso only, ornate shoulder pauldrons, no arms no head no legs, fantasy RPG chest armor piece, pixel art style, transparent background',
  },
  {
    folder: 'chests',
    filename: 'dragon_cuirass.png',
    description: 'red dragon scale cuirass chest armor, front view torso only, dragon themed breastplate, no arms no head no legs, fantasy RPG chest armor piece, pixel art style, transparent background',
  },
  {
    folder: 'chests',
    filename: 'paladin_chestguard.png',
    description: 'golden paladin holy chestplate with sun emblem, front view torso only, white and gold armor, no arms no head no legs, fantasy RPG chest armor piece, pixel art style, transparent background',
  },
  {
    folder: 'chests',
    filename: 'steel_plate.png',
    description: 'steel plate armor chestpiece, front view torso only, polished metal breastplate, no arms no head no legs, fantasy RPG chest armor piece, pixel art style, transparent background',
  },
  {
    folder: 'chests',
    filename: 'titanium_platemail.png',
    description: 'titanium platemail chest armor, front view torso only, silver blue metal breastplate, no arms no head no legs, fantasy RPG chest armor piece, pixel art style, transparent background',
  },

  // LEGS
  {
    folder: 'legs',
    filename: 'dragon_legguards.png',
    description: 'red dragon scale leg armor greaves, front view legs only, dragon themed legguards covering thighs and shins, no torso no feet, fantasy RPG leg armor piece, pixel art style, transparent background',
  },
  {
    folder: 'legs',
    filename: 'phoenix_legguards.png',
    description: 'golden phoenix feather leg armor, front view legs only, fiery orange and gold legguards, no torso no feet, fantasy RPG leg armor piece, pixel art style, transparent background',
  },

  // SHIELDS
  {
    folder: 'shields',
    filename: 'fortress_shield.png',
    description: 'large fortress tower shield, rectangular defensive shield with castle battlements design, stone texture, front facing view, fantasy RPG shield, pixel art style, transparent background',
  },

  // CAPES
  {
    folder: 'capes',
    filename: 'basic.png',
    description: 'simple brown traveler cape cloak, back view showing cape fabric flowing, no person visible, just the cape garment, fantasy RPG equipment, pixel art style, transparent background',
  },
  {
    folder: 'capes',
    filename: 'mystic_robe.png',
    description: 'purple mystic flowing robe cape, back view showing magical robes, no person visible, just the robe garment with arcane patterns, fantasy RPG equipment, pixel art style, transparent background',
  },
  {
    folder: 'capes',
    filename: 'shadow.png',
    description: 'dark shadow cloak cape with wispy edges, back view showing dark flowing fabric, no person visible, just the shadowy cape garment, fantasy RPG equipment, pixel art style, transparent background',
  },
  {
    folder: 'capes',
    filename: 'traveler_cloak.png',
    description: 'brown hooded traveler cloak cape, back view showing hood and flowing cape, no person visible, just the cloak garment, fantasy RPG equipment, pixel art style, transparent background',
  },
];

async function generateItem(item) {
  console.log(`\n🎨 Generating ${item.folder}/${item.filename}...`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: item.description,
        negative_description: 'full body, character, person, face, holding, worn, equipped, multiple items',
        image_size: { width: 64, height: 64 },
        text_guidance_scale: 8.5,
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
    console.error(`❌ Failed ${item.folder}/${item.filename}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🔧 Equipment Regeneration Script');
  console.log(`📦 ${ITEMS_TO_REGENERATE.length} items to regenerate\n`);

  let totalCost = 0;
  let successCount = 0;
  let failCount = 0;

  for (const item of ITEMS_TO_REGENERATE) {
    const result = await generateItem(item);
    if (result.success) {
      totalCost += result.cost;
      successCount++;
    } else {
      failCount++;
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✨ Complete!`);
  console.log(`   Success: ${successCount}/${ITEMS_TO_REGENERATE.length}`);
  console.log(`   Failed: ${failCount}`);
  console.log(`   Total Cost: $${totalCost.toFixed(4)}`);
}

main();
