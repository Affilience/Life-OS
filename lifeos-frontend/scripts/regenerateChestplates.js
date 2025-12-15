import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// ALL chestplates - regenerate as breastplate style (no neck hole)
const CHESTPLATES = [
  {
    filename: 'aegis_titan.png',
    description: 'golden titan breastplate armor, front view, ornate golden chestpiece with shoulder guards, no neck hole, stops at collarbone, fantasy RPG equipment icon, pixel art, transparent background, 64x64',
  },
  {
    filename: 'armor_chainmail.png',
    description: 'chainmail shirt armor, front view, silver chain links covering torso, no neck hole, sleeveless vest style, fantasy RPG equipment icon, pixel art, transparent background, 64x64',
  },
  {
    filename: 'armor_cosmic.png',
    description: 'cosmic purple space armor breastplate, front view, glowing stars and nebula pattern, no neck hole, stops at collarbone, fantasy RPG equipment icon, pixel art, transparent background, 64x64',
  },
  {
    filename: 'armor_leather.png',
    description: 'brown leather armor vest, front view, simple leather chestpiece with straps, no neck hole, sleeveless style, fantasy RPG equipment icon, pixel art, transparent background, 64x64',
  },
  {
    filename: 'armor_plate.png',
    description: 'steel plate armor breastplate, front view, polished metal chestpiece, no neck hole, stops at collarbone, fantasy RPG equipment icon, pixel art, transparent background, 64x64',
  },
  {
    filename: 'chainmail_shirt.png',
    description: 'chainmail hauberk vest, front view, interlocked metal rings, no neck hole, sleeveless chainmail, fantasy RPG equipment icon, pixel art, transparent background, 64x64',
  },
  {
    filename: 'cloth_tunic.png',
    description: 'simple cloth tunic vest, front view, beige fabric with belt, no neck hole, sleeveless peasant shirt, fantasy RPG equipment icon, pixel art, transparent background, 64x64',
  },
  {
    filename: 'dragon_bone_cuirass.png',
    description: 'dark purple dragon bone cuirass, front view, skeletal dragon bones forming armor, no neck hole, stops at collarbone, fantasy RPG equipment icon, pixel art, transparent background, 64x64',
  },
  {
    filename: 'dragon_cuirass.png',
    description: 'red dragon scale cuirass breastplate, front view, overlapping red scales, no neck hole, stops at collarbone, fantasy RPG equipment icon, pixel art, transparent background, 64x64',
  },
  {
    filename: 'dragon_scale_chestplate.png',
    description: 'fiery dragon scale chestplate, front view, red and orange dragon scales with gold trim, no neck hole, breastplate style, fantasy RPG equipment icon, pixel art, transparent background, 64x64',
  },
  {
    filename: 'leather_vest.png',
    description: 'brown leather vest armor, front view, buckled leather chestpiece, no neck hole, open vest style, fantasy RPG equipment icon, pixel art, transparent background, 64x64',
  },
  {
    filename: 'padded_armor.png',
    description: 'quilted padded armor vest, front view, tan quilted fabric gambeson, no neck hole, sleeveless style, fantasy RPG equipment icon, pixel art, transparent background, 64x64',
  },
  {
    filename: 'paladin_chestguard.png',
    description: 'golden paladin breastplate with holy sun emblem, front view, white and gold sacred armor, no neck hole, stops at collarbone, fantasy RPG equipment icon, pixel art, transparent background, 64x64',
  },
  {
    filename: 'phoenix_battleplate.png',
    description: 'fiery phoenix battleplate armor, front view, orange and gold flames design, no neck hole, ornate breastplate, fantasy RPG equipment icon, pixel art, transparent background, 64x64',
  },
  {
    filename: 'reinforced_breastplate.png',
    description: 'reinforced steel breastplate, front view, dark metal with rivets, no neck hole, heavy armor chestpiece, fantasy RPG equipment icon, pixel art, transparent background, 64x64',
  },
  {
    filename: 'steel_plate.png',
    description: 'polished steel plate breastplate, front view, shiny metal armor, no neck hole, stops at collarbone, fantasy RPG equipment icon, pixel art, transparent background, 64x64',
  },
  {
    filename: 'titanium_platemail.png',
    description: 'titanium platemail breastplate, front view, silver-blue futuristic metal, no neck hole, sleek armor design, fantasy RPG equipment icon, pixel art, transparent background, 64x64',
  },
];

async function generateItem(item) {
  console.log(`\n🎨 Generating chests/${item.filename}...`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: item.description,
        negative_description: 'neck hole, collar, full body, character, person, head, face, arms, legs, holding, worn, equipped',
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

    const outputDir = path.join(__dirname, '../public/assets/equipment/chests');
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
  console.log('🛡️  Chestplate Regeneration Script');
  console.log('   Style: Breastplate (no neck hole, stops at collarbone)');
  console.log(`📦 ${CHESTPLATES.length} chestplates to regenerate\n`);

  let totalCost = 0;
  let successCount = 0;

  for (const item of CHESTPLATES) {
    const result = await generateItem(item);
    if (result.success) {
      totalCost += result.cost;
      successCount++;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✨ Complete! ${successCount}/${CHESTPLATES.length} generated`);
  console.log(`💰 Total Cost: $${totalCost.toFixed(4)}`);
}

main();
