/**
 * Fix ALL chest armor pieces to match armor_leather style:
 * - U-shaped neck opening (rounded, not V or closed)
 * - Torso/vest only (no helmet, legs, arms, or extending pieces)
 * - Clean isolated chestplate
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// All chest pieces that need to match armor_leather style
const CHEST_PIECES = [
  {
    filename: 'phoenix_battleplate.png',
    prompt: 'pixel art golden phoenix chestplate vest, torso armor only with rounded U-shaped neck opening like a vest, fiery orange and gold metal, small phoenix emblem on chest, simple shoulder straps, no wings no helmet no legs, isolated chest armor, RPG icon style, 64x64',
  },
  {
    filename: 'steel_plate.png',
    prompt: 'pixel art polished steel chestplate vest, torso armor only with rounded U-shaped neck opening, shiny silver metal plate, simple design, no helmet no legs no arms, isolated chest armor piece, RPG icon style, 64x64',
  },
  {
    filename: 'titanium_platemail.png',
    prompt: 'pixel art futuristic titanium chestplate vest, torso armor only with rounded U-shaped neck opening, blue-silver metallic sheen, sleek design, no helmet no legs, isolated chest armor piece, RPG icon style, 64x64',
  },
  {
    filename: 'aegis_titan.png',
    prompt: 'pixel art legendary bronze and gold chestplate vest, torso armor only with rounded U-shaped neck opening, ornate ancient greek design, no helmet no legs no cape, isolated chest armor piece, RPG icon style, 64x64',
  },
  {
    filename: 'armor_cosmic.png',
    prompt: 'pixel art cosmic magical chestplate vest, torso armor only with rounded U-shaped neck opening, glowing purple and blue ethereal energy, starry pattern, no helmet no closed collar, isolated chest armor piece, RPG icon style, 64x64',
  },
  {
    filename: 'dragon_scale_chestplate.png',
    prompt: 'pixel art dragon scale chestplate vest, torso armor only with rounded U-shaped neck opening, red and orange overlapping scales, no extending wings no shoulder spikes, isolated chest armor piece, RPG icon style, 64x64',
  },
  {
    filename: 'dragon_bone_cuirass.png',
    prompt: 'pixel art bone armor chestplate vest, torso armor only with rounded U-shaped neck opening, white dragon bones arranged as plates, no extending bone spikes upward, isolated chest armor piece, RPG icon style, 64x64',
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
        negative_description: 'full body, character, person, head, face, helmet, legs, feet, arms, hands, wings, spikes, extending pieces, closed collar, V-neck, turtleneck, standing figure, complete armor set, shoulder pads extending up',
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
  console.log('🔧 FIXING ALL CHEST ARMOR TO MATCH LEATHER STYLE');
  console.log('=================================================');
  console.log('Target: U-shaped neck opening, vest/torso only\n');

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

  console.log('\n=================================================');
  console.log(`✨ Complete! ${successCount}/${CHEST_PIECES.length} regenerated`);
  console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);
}

main().catch(console.error);
