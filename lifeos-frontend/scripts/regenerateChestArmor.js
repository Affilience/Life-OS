/**
 * Regenerate chest armor pieces with proper V-neck openings
 * Uses PixelLab API to create equipment sprites
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Chest pieces to regenerate (excluding armor_leather which is good)
const CHEST_PIECES = [
  {
    filename: 'armor_plate.png',
    prompt: 'pixel art medieval steel plate armor chestpiece with V-neck collar opening for head, silver metal with rivets, battle-worn, front view, RPG equipment icon, 64x64',
  },
  {
    filename: 'armor_chainmail.png',
    prompt: 'pixel art chainmail armor vest with open V-neck collar for head, interlocking silver metal rings, medieval style, front view, RPG equipment icon, 64x64',
  },
  {
    filename: 'armor_cosmic.png',
    prompt: 'pixel art cosmic magical armor chestpiece with V-neck opening for head, glowing purple and blue ethereal energy, starry galaxy pattern, mystical, front view, RPG equipment icon, 64x64',
  },
  {
    filename: 'phoenix_battleplate.png',
    prompt: 'pixel art ornate golden phoenix battleplate armor with V-neck collar opening for head, fiery orange and gold colors, phoenix wing decorations, legendary quality, front view, RPG equipment icon, 64x64',
  },
  {
    filename: 'dragon_scale_chestplate.png',
    prompt: 'pixel art dragon scale armor chestpiece with V-neck opening for head, red and orange overlapping reptile scales, draconic design, front view, RPG equipment icon, 64x64',
  },
  {
    filename: 'dragon_bone_cuirass.png',
    prompt: 'pixel art bone armor cuirass made from dragon bones with V-neck collar opening for head, white and cream colored bones, tribal mystical design, front view, RPG equipment icon, 64x64',
  },
  {
    filename: 'cloth_tunic.png',
    prompt: 'pixel art simple brown cloth tunic with V-neck opening, basic adventurer starting clothing, front view, RPG equipment icon, 64x64',
  },
  {
    filename: 'padded_armor.png',
    prompt: 'pixel art quilted padded armor vest with V-neck collar, tan leather and cloth, stitched diamond pattern, front view, RPG equipment icon, 64x64',
  },
  {
    filename: 'steel_plate.png',
    prompt: 'pixel art polished steel plate armor with V-neck collar opening, shiny silver metal, reinforced edges, knight armor, front view, RPG equipment icon, 64x64',
  },
  {
    filename: 'titanium_platemail.png',
    prompt: 'pixel art futuristic titanium platemail with V-neck opening, blue-silver metallic sheen, advanced technology design, front view, RPG equipment icon, 64x64',
  },
  {
    filename: 'paladin_chestguard.png',
    prompt: 'pixel art holy paladin chestguard with V-neck collar opening, white and gold holy colors, divine cross symbol, radiant glow, front view, RPG equipment icon, 64x64',
  },
  {
    filename: 'aegis_titan.png',
    prompt: 'pixel art legendary aegis titan armor with V-neck opening, massive bronze and gold plates, ancient greek heroic style, front view, RPG equipment icon, 64x64',
  },
  {
    filename: 'chainmail_shirt.png',
    prompt: 'pixel art chainmail shirt with open V-neck collar, silver interlocking rings, simple medieval design, front view, RPG equipment icon, 64x64',
  },
  {
    filename: 'leather_vest.png',
    prompt: 'pixel art brown leather vest with V-neck opening, simple stitching, rogue thief style, front view, RPG equipment icon, 64x64',
  },
  {
    filename: 'reinforced_breastplate.png',
    prompt: 'pixel art reinforced metal breastplate with V-neck collar opening, extra metal bands for protection, battle-ready warrior armor, front view, RPG equipment icon, 64x64',
  },
  {
    filename: 'dragon_cuirass.png',
    prompt: 'pixel art dragon themed cuirass armor with V-neck opening, green dragon scales pattern, mystical emerald glow, front view, RPG equipment icon, 64x64',
  },
];

const OUTPUT_DIR = path.join(__dirname, '../public/assets/equipment/chests');

async function generateChestPiece(piece) {
  console.log(`\n🎨 Generating ${piece.filename}...`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(API_URL, {
      signal: controller.signal,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: piece.prompt,
        negative_description: 'character, body, person, head, face, realistic, 3d, blurry, low quality, closed neck, full coverage neck, turtleneck',
        image_size: {
          width: 64,
          height: 64,
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
    console.log(`💰 Cost: $${data.usage?.usd?.toFixed(4) || 'N/A'}`);

    // Save sprite
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const outputPath = path.join(OUTPUT_DIR, piece.filename);

    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`💾 Saved: ${outputPath}`);

    return { success: true, cost: data.usage?.usd || 0 };
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`⏱️  Timeout: ${piece.filename} took too long (>60s), skipping...`);
      return { success: false, cost: 0 };
    }
    console.error(`❌ Failed to generate ${piece.filename}:`, error.message);
    return { success: false, cost: 0 };
  }
}

async function main() {
  console.log('🛡️  CHEST ARMOR REGENERATION WITH V-NECK OPENINGS');
  console.log('================================================\n');

  let totalCost = 0;
  let successCount = 0;

  for (const piece of CHEST_PIECES) {
    const result = await generateChestPiece(piece);
    if (result.success) {
      successCount++;
      totalCost += result.cost;
    }

    // Small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n================================================');
  console.log(`✨ Complete! ${successCount}/${CHEST_PIECES.length} generated`);
  console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);
}

main().catch(console.error);
