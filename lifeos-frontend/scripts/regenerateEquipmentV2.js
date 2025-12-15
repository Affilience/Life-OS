/**
 * Regenerate equipment sprites to fix:
 * 1. Chest armor - open U-shaped neck (no black bit at top)
 * 2. Boots - feet spaced apart like stage 10 avatar
 * 3. Legs - facing forward, spaced apart, NO boots
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

const BASE_DIR = path.join(__dirname, '../public/assets/equipment');

// Chest pieces that need open U-shaped neck (like armor_leather)
const CHEST_PIECES = [
  {
    filename: 'aegis_titan.png',
    prompt: 'pixel art bronze and gold chestplate vest, torso armor only with wide open U-shaped neck opening showing skin, ancient greek ornate design, no collar no closed neck no black area at top, isolated chest armor piece, RPG icon style, 64x64',
  },
  {
    filename: 'armor_cosmic.png',
    prompt: 'pixel art cosmic magical chestplate vest, torso armor only with wide open U-shaped neck opening showing skin, glowing purple and blue ethereal energy with stars, no collar no closed neck no black area at top, isolated chest armor piece, RPG icon style, 64x64',
  },
  {
    filename: 'armor_plate.png',
    prompt: 'pixel art steel plate chestplate vest, torso armor only with wide open U-shaped neck opening showing skin, polished silver metal plate armor, no collar no closed neck no black area at top, isolated chest armor piece, RPG icon style, 64x64',
  },
  {
    filename: 'dragon_bone_cuirass.png',
    prompt: 'pixel art dragon bone chestplate vest, torso armor only with wide open U-shaped neck opening showing skin, white bone plates arranged as armor, no collar no closed neck no black area at top, isolated chest armor piece, RPG icon style, 64x64',
  },
  {
    filename: 'cloth_tunic.png',
    prompt: 'pixel art simple cloth tunic vest, torso clothing only with wide open U-shaped neck opening showing skin, brown fabric basic starter gear, no collar no closed neck no black area at top, isolated chest piece, RPG icon style, 64x64',
  },
  {
    filename: 'reinforced_breastplate.png',
    prompt: 'pixel art reinforced steel breastplate vest, torso armor only with wide open U-shaped neck opening showing skin, metal plates with rivets, no collar no closed neck no black area at top, isolated chest armor piece, RPG icon style, 64x64',
  },
  {
    filename: 'leather_vest.png',
    prompt: 'pixel art leather vest armor, torso only with wide open U-shaped neck opening showing skin, brown leather with straps, no collar no closed neck no black area at top, isolated chest piece, RPG icon style, 64x64',
  },
  {
    filename: 'padded_armor.png',
    prompt: 'pixel art padded cloth armor vest, torso only with wide open U-shaped neck opening showing skin, quilted fabric padding, no collar no closed neck no black area at top, isolated chest piece, RPG icon style, 64x64',
  },
];

// Boots that need feet spaced apart (matching stage 10 avatar stance)
const BOOTS_PIECES = [
  {
    filename: 'leather_boots.png',
    prompt: 'pixel art pair of leather boots, two separate boots spaced far apart in wide stance position, brown leather adventurer boots, front facing view, feet pointing slightly outward, isolated equipment, RPG icon style, 64x64',
  },
  {
    filename: 'iron_boots.png',
    prompt: 'pixel art pair of iron armored boots, two separate boots spaced far apart in wide stance position, grey metal plated boots, front facing view, feet pointing slightly outward, isolated equipment, RPG icon style, 64x64',
  },
  {
    filename: 'cloth_shoes.png',
    prompt: 'pixel art pair of cloth shoes, two separate shoes spaced far apart in wide stance position, simple brown fabric shoes, front facing view, feet pointing slightly outward, isolated equipment, RPG icon style, 64x64',
  },
  {
    filename: 'steel_greaves_boots.png',
    prompt: 'pixel art pair of steel greaves boots, two separate armored boots spaced far apart in wide stance position, shiny metal knight boots, front facing view, feet pointing slightly outward, isolated equipment, RPG icon style, 64x64',
  },
  {
    filename: 'phoenix_boots.png',
    prompt: 'pixel art pair of phoenix flame boots, two separate golden boots spaced far apart in wide stance position, ornate fiery orange and gold boots, front facing view, feet pointing slightly outward, isolated equipment, RPG icon style, 64x64',
  },
];

// Legs that need to be facing forward, spaced apart, NO boots
const LEGS_PIECES = [
  {
    filename: 'leather_leggings.png',
    prompt: 'pixel art leather leggings pants only, two legs spaced far apart in wide stance, brown leather pants ending at ankles with NO boots NO feet NO shoes, front facing view, isolated leg armor, RPG icon style, 64x64',
  },
  {
    filename: 'cloth_pants.png',
    prompt: 'pixel art cloth pants only, two legs spaced far apart in wide stance, simple brown fabric trousers ending at ankles with NO boots NO feet NO shoes, front facing view, isolated leg clothing, RPG icon style, 64x64',
  },
  {
    filename: 'chainmail_leggings.png',
    prompt: 'pixel art chainmail leggings only, two legs spaced far apart in wide stance, silver chain mail pants ending at ankles with NO boots NO feet NO shoes, front facing view, isolated leg armor, RPG icon style, 64x64',
  },
  {
    filename: 'iron_legguards.png',
    prompt: 'pixel art iron leg guards only, two legs spaced far apart in wide stance, grey metal plated leg armor ending at ankles with NO boots NO feet NO shoes, front facing view, isolated leg armor, RPG icon style, 64x64',
  },
  {
    filename: 'dragon_legguards.png',
    prompt: 'pixel art dragon scale leg guards only, two legs spaced far apart in wide stance, red and orange scale leg armor ending at ankles with NO boots NO feet NO shoes, front facing view, isolated leg armor, RPG icon style, 64x64',
  },
  {
    filename: 'phoenix_legguards.png',
    prompt: 'pixel art phoenix flame leg guards only, two legs spaced far apart in wide stance, golden fiery leg armor ending at ankles with NO boots NO feet NO shoes, front facing view, isolated leg armor, RPG icon style, 64x64',
  },
];

async function generatePiece(piece, folder) {
  console.log(`\n🎨 Generating ${folder}/${piece.filename}...`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: piece.prompt,
        negative_description: 'full body, character, person, head, face, helmet, realistic, 3d, blurry, low quality, standing figure, complete armor set, closed collar, turtleneck, black neck area',
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
    console.log(`✅ Generated successfully`);
    console.log(`💰 Cost: $${data.usage?.usd?.toFixed(4) || 'N/A'}`);

    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const outputPath = path.join(BASE_DIR, folder, piece.filename);

    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`💾 Saved: ${outputPath}`);

    return { success: true, cost: data.usage?.usd || 0 };
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    return { success: false, cost: 0 };
  }
}

async function main() {
  console.log('🔧 REGENERATING EQUIPMENT SPRITES');
  console.log('==================================');
  console.log('Fixing: chest necks, boot spacing, leg orientation\n');

  let totalCost = 0;
  let successCount = 0;
  let totalItems = CHEST_PIECES.length + BOOTS_PIECES.length + LEGS_PIECES.length;

  // Generate chest pieces
  console.log('\n📦 CHEST ARMOR (open U-neck)');
  console.log('----------------------------');
  for (const piece of CHEST_PIECES) {
    const result = await generatePiece(piece, 'chests');
    if (result.success) {
      successCount++;
      totalCost += result.cost;
    }
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Generate boots
  console.log('\n👢 BOOTS (spaced apart)');
  console.log('------------------------');
  for (const piece of BOOTS_PIECES) {
    const result = await generatePiece(piece, 'boots');
    if (result.success) {
      successCount++;
      totalCost += result.cost;
    }
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Generate legs
  console.log('\n🦵 LEGS (forward, no boots)');
  console.log('----------------------------');
  for (const piece of LEGS_PIECES) {
    const result = await generatePiece(piece, 'legs');
    if (result.success) {
      successCount++;
      totalCost += result.cost;
    }
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log('\n==================================');
  console.log(`✨ Complete! ${successCount}/${totalItems} regenerated`);
  console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);
}

main().catch(console.error);
