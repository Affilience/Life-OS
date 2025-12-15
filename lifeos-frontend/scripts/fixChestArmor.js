/**
 * Fix problematic chest armor pieces that show full body instead of just chestplate
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Only the problematic chest pieces that need regeneration
const CHEST_PIECES = [
  {
    filename: 'steel_plate.png',
    prompt: 'pixel art steel plate chestplate armor only, torso armor with V-neck collar opening, polished silver metal, no helmet no legs no arms, isolated chest armor piece only, RPG equipment icon, 64x64',
  },
  {
    filename: 'titanium_platemail.png',
    prompt: 'pixel art futuristic titanium chestplate only, torso armor with V-neck opening, blue-silver metallic sheen, no helmet no legs no full body, isolated chest armor piece only, RPG equipment icon, 64x64',
  },
  {
    filename: 'aegis_titan.png',
    prompt: 'pixel art legendary bronze and gold chestplate only, massive torso armor with V-neck opening, ancient greek heroic style, no helmet no legs no full body, isolated chest armor piece only, RPG equipment icon, 64x64',
  },
  {
    filename: 'phoenix_battleplate.png',
    prompt: 'pixel art ornate golden phoenix chestplate only, torso armor with V-neck collar opening, fiery orange and gold colors, small phoenix wing motifs on shoulders, no helmet no legs no full body, isolated chest armor piece only, legendary quality, RPG equipment icon, 64x64',
  },
];

const OUTPUT_DIR = path.join(__dirname, '../public/assets/equipment/chests');

async function generateChestPiece(piece) {
  console.log(`\n🎨 Regenerating ${piece.filename}...`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: piece.prompt,
        negative_description: 'full body, character, person, head, face, helmet, legs, feet, arms, hands, realistic, 3d, blurry, low quality, standing figure, complete armor set',
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
    const outputPath = path.join(OUTPUT_DIR, piece.filename);

    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`💾 Saved: ${outputPath}`);

    return { success: true, cost: data.usage?.usd || 0 };
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    return { success: false, cost: 0 };
  }
}

async function main() {
  console.log('🔧 FIXING PROBLEMATIC CHEST ARMOR PIECES');
  console.log('========================================\n');

  let totalCost = 0;
  let successCount = 0;

  for (const piece of CHEST_PIECES) {
    const result = await generateChestPiece(piece);
    if (result.success) {
      successCount++;
      totalCost += result.cost;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n========================================');
  console.log(`✨ Complete! ${successCount}/${CHEST_PIECES.length} regenerated`);
  console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);
}

main().catch(console.error);
