import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Equipment to generate
const EQUIPMENT_ITEMS = {
  // HELMETS
  helmets: [
    {
      id: 'helmet_basic',
      name: 'Training Helmet',
      prompt: 'simple gray space helmet overlay sprite, front view, basic astronaut helmet, transparent background, pixel art, 128x128, equipment layer, designed to fit on astronaut character head',
      negative: 'body, torso, full character, legs, arms, multiple views, side view',
    },
    {
      id: 'helmet_iron',
      name: 'Iron Helmet',
      prompt: 'sturdy iron space helmet overlay sprite, front view, reinforced metallic gray helmet with vents, transparent background, pixel art, 128x128, equipment layer',
      negative: 'body, torso, full character, legs, arms, multiple views',
    },
    {
      id: 'helmet_dragon',
      name: 'Dragon Helm',
      prompt: 'legendary dragon helmet overlay sprite, front view, red dragon scales, glowing orange accents, horns, fierce design, transparent background, pixel art, 128x128, equipment layer',
      negative: 'body, torso, full character, legs, arms, multiple views',
    },
  ],

  // CHEST ARMOR
  chest: [
    {
      id: 'chest_basic',
      name: 'Training Vest',
      prompt: 'simple gray protective vest overlay sprite, front view, basic space suit torso armor, transparent background, pixel art, 128x128, equipment layer, chest piece only',
      negative: 'full body, helmet, legs, arms, multiple views, side view',
    },
    {
      id: 'chest_iron',
      name: 'Iron Chestplate',
      prompt: 'heavy iron chestplate overlay sprite, front view, reinforced metallic gray armor plating, transparent background, pixel art, 128x128, equipment layer, torso only',
      negative: 'full body, helmet, legs, arms, multiple views',
    },
    {
      id: 'chest_dragon',
      name: 'Dragon Scale Armor',
      prompt: 'legendary dragon scale armor overlay sprite, front view, red dragon scales covering torso, glowing orange accents, transparent background, pixel art, 128x128, equipment layer',
      negative: 'full body, helmet, legs, arms, multiple views',
    },
  ],

  // WEAPONS
  weapons: [
    {
      id: 'weapon_basic_sword',
      name: 'Training Sword',
      prompt: 'simple gray sword held in right hand, front view, basic blade, space-themed weapon, transparent background, pixel art, 128x128, equipment layer, weapon overlay',
      negative: 'full character, body, legs, multiple views, floating weapon',
    },
    {
      id: 'weapon_iron_sword',
      name: 'Iron Sword',
      prompt: 'iron sword held in right hand, front view, metallic gray blade with silver edge, transparent background, pixel art, 128x128, equipment layer, weapon overlay',
      negative: 'full character, body, legs, multiple views',
    },
    {
      id: 'weapon_dragon_blade',
      name: 'Dragon Blade',
      prompt: 'legendary dragon blade held in right hand, front view, red glowing blade with orange flame effects, dragon motif, transparent background, pixel art, 128x128, equipment layer',
      negative: 'full character, body, legs, multiple views',
    },
  ],

  // SHIELDS
  shields: [
    {
      id: 'shield_basic',
      name: 'Wooden Shield',
      prompt: 'simple wooden shield held in left hand, front view, basic round shield, brown wood, transparent background, pixel art, 128x128, equipment layer, shield overlay',
      negative: 'full character, body, legs, multiple views',
    },
    {
      id: 'shield_iron',
      name: 'Iron Shield',
      prompt: 'iron shield held in left hand, front view, metallic gray round shield with reinforced edges, transparent background, pixel art, 128x128, equipment layer',
      negative: 'full character, body, legs, multiple views',
    },
  ],

  // CAPES
  capes: [
    {
      id: 'cape_basic',
      name: "Traveler's Cloak",
      prompt: 'simple brown cape overlay sprite, front view, flowing cloak behind character, transparent background, pixel art, 128x128, equipment layer, back layer',
      negative: 'full character, body, legs, multiple views, hood',
    },
    {
      id: 'cape_shadow',
      name: 'Shadow Cloak',
      prompt: 'mysterious dark purple cape overlay sprite, front view, shadowy flowing cloak with magical aura, transparent background, pixel art, 128x128, equipment layer',
      negative: 'full character, body, legs, multiple views',
    },
  ],

  // RINGS (just icons, not overlays)
  rings: [
    {
      id: 'ring_strength',
      name: 'Ring of Strength',
      prompt: 'golden ring with red gem icon, top-down view, strength symbol, transparent background, pixel art, 32x32, item icon',
      negative: 'character, body, 3d, realistic',
    },
    {
      id: 'ring_intelligence',
      name: 'Ring of Intellect',
      prompt: 'silver ring with blue gem icon, top-down view, intelligence symbol, transparent background, pixel art, 32x32, item icon',
      negative: 'character, body, 3d, realistic',
    },
  ],

  // AMULETS (just icons)
  amulets: [
    {
      id: 'amulet_vitality',
      name: 'Amulet of Life',
      prompt: 'golden amulet with green heart gem, front view, life symbol, transparent background, pixel art, 32x32, item icon',
      negative: 'character, body, 3d, realistic',
    },
  ],
};

async function generateEquipmentSprite(category, item) {
  console.log(`\n🎨 Generating ${item.name} (${category})...`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(API_URL, {
      signal: controller.signal,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: item.prompt,
        negative_description: item.negative,
        image_size: {
          width: category === 'rings' || category === 'amulets' ? 32 : 128,
          height: category === 'rings' || category === 'amulets' ? 32 : 128,
        },
        text_guidance_scale: 8.5,
        no_background: true,
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Generated successfully`);
    console.log(`💰 Cost: $${data.usage.usd.toFixed(4)}`);

    // Save sprite
    const outputDir = path.join(__dirname, `../public/assets/equipment/${category}`);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const outputPath = path.join(outputDir, `${item.id.replace(`${category.slice(0, -1)}_`, '')}.png`);

    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`💾 Saved: ${outputPath}`);

    return { success: true, cost: data.usage.usd };
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`⏱️  Timeout: ${item.name} took too long (>30s), skipping...`);
      return { success: false, cost: 0 };
    }
    console.error(`❌ Failed to generate ${item.name}:`, error.message);
    return { success: false, cost: 0 };
  }
}

async function generateAllEquipment() {
  console.log('🚀 EQUIPMENT SPRITE GENERATION');
  console.log('========================================');

  let totalCost = 0;
  let successCount = 0;
  let failCount = 0;

  for (const [category, items] of Object.entries(EQUIPMENT_ITEMS)) {
    console.log(`\n📦 Generating ${category}...`);

    for (const item of items) {
      const result = await generateEquipmentSprite(category, item);

      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
      totalCost += result.cost;

      // Delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n========================================');
  console.log('✨ GENERATION COMPLETE!');
  console.log(`✅ Successfully generated: ${successCount}`);
  console.log(`❌ Failed/Skipped: ${failCount}`);
  console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);
  console.log('📁 Sprites saved to: public/assets/equipment/');
  console.log('========================================\n');
}

// Run generation
generateAllEquipment().catch(console.error);
