import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

/**
 * FOCUSED: Generate only missing boots and legs overlays
 */

const STYLE_BASE = 'pixel art, 128x128, highly detailed, front-facing view, fantasy RPG style, transparent background';
const OVERLAY_KEYWORDS = 'equipment overlay layer, designed to fit on character, isolated piece';
const NEGATIVE_BASE = 'full character, full body, face, head, arms, torso, background, multiple items, blurry, low quality, text, watermark';

const MISSING_OVERLAYS = {
  boots: [
    {
      id: 'boots_cloth_shoes',
      name: 'Cloth Shoes',
      rarity: 'common',
      prompt: `simple brown cloth shoes feet overlay positioned at bottom of sprite, peasant wrapped footwear, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
    },
    {
      id: 'boots_steel_greaves',
      name: 'Steel Greaves',
      rarity: 'rare',
      prompt: `polished steel greaves boots overlay positioned at bottom of sprite, knight armored boots with ornate engravings, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
    },
    {
      id: 'boots_mage_slippers',
      name: 'Mage Slippers',
      rarity: 'rare',
      prompt: `purple enchanted mage slippers feet overlay positioned at bottom of sprite, wizard footwear with glowing runes, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
    },
    {
      id: 'boots_dragon',
      name: 'Dragon Scale Boots',
      rarity: 'legendary',
      prompt: `LEGENDARY dragon scale boots feet overlay positioned at bottom of sprite, crimson dragon scales with fiery glow, clawed toes, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}, epic legendary quality`,
    },
    {
      id: 'boots_phoenix',
      name: 'Phoenix Flame Boots',
      rarity: 'legendary',
      prompt: `LEGENDARY phoenix feather boots feet overlay positioned at bottom of sprite, golden boots with flame effects, divine radiance, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}, epic legendary quality`,
    },
  ],
  legs: [
    {
      id: 'legs_cloth_pants',
      name: 'Cloth Pants',
      rarity: 'common',
      prompt: `simple brown cloth pants leg overlay positioned at lower body, peasant trousers thigh to knee, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
    },
    {
      id: 'legs_leather_leggings',
      name: 'Leather Leggings',
      rarity: 'common',
      prompt: `brown leather leggings leg overlay positioned at lower body, reinforced thigh guards, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
    },
    {
      id: 'legs_chainmail',
      name: 'Chainmail Leggings',
      rarity: 'uncommon',
      prompt: `silver chainmail leggings leg overlay positioned at lower body, interlocking metal rings, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
    },
    {
      id: 'legs_iron_legguards',
      name: 'Iron Legguards',
      rarity: 'rare',
      prompt: `iron plate legguards leg overlay positioned at lower body, heavy thigh and knee armor, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
    },
    {
      id: 'legs_steel_legplates',
      name: 'Steel Legplates',
      rarity: 'rare',
      prompt: `polished steel legplates leg overlay positioned at lower body, ornate knight leg armor, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
    },
    {
      id: 'legs_mage_robes',
      name: 'Arcane Legwraps',
      rarity: 'epic',
      prompt: `purple arcane legwraps leg overlay positioned at lower body, flowing wizard cloth with glowing runes, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}, purple magical glow`,
    },
    {
      id: 'legs_dragon',
      name: 'Dragon Scale Legguards',
      rarity: 'legendary',
      prompt: `LEGENDARY dragon scale legguards leg overlay positioned at lower body, crimson scales with glowing veins, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}, epic legendary quality`,
    },
    {
      id: 'legs_phoenix',
      name: 'Phoenix Flame Legguards',
      rarity: 'legendary',
      prompt: `LEGENDARY phoenix feather legguards leg overlay positioned at lower body, golden with flame effects, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}, epic legendary quality`,
    },
  ],
};

async function generateOverlay(slot, item) {
  const outputDir = path.join(__dirname, '..', 'public', 'assets', 'equipment', 'overlays', slot);
  const outputPath = path.join(outputDir, `${item.id}.png`);

  if (fs.existsSync(outputPath)) {
    console.log(`⏭️  Skipping ${item.name} (exists)`);
    return { success: true, skipped: true };
  }

  console.log(`\n🎨 Generating: ${item.name} (${item.rarity})`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: item.prompt,
        negative_description: NEGATIVE_BASE,
        image_size: { width: 128, height: 128 },
        text_guidance_scale: item.rarity === 'legendary' ? 9.0 : 8.5,
        no_background: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error ${response.status}`);
    }

    const data = await response.json();
    console.log(`💰 Cost: $${data.usage?.usd?.toFixed(4) || 'N/A'}`);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(outputPath, Buffer.from(base64Data, 'base64'));
    console.log(`✅ Saved: ${item.id}.png`);

    return { success: true, cost: data.usage?.usd || 0 };
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    return { success: false };
  }
}

async function main() {
  console.log('🎯 BOOTS & LEGS OVERLAY GENERATION');
  console.log('===================================\n');

  let total = 0, success = 0;

  for (const [slot, items] of Object.entries(MISSING_OVERLAYS)) {
    console.log(`\n📦 ${slot.toUpperCase()}`);
    for (const item of items) {
      total++;
      const result = await generateOverlay(slot, item);
      if (result.success) success++;
      if (!result.skipped) await new Promise(r => setTimeout(r, 1500));
    }
  }

  console.log(`\n✨ Done! ${success}/${total} generated`);
}

main().catch(console.error);
