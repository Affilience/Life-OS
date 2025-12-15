import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Equipment to generate - Boots and Leg Armor (bazaar style prompts)
const EQUIPMENT_ITEMS = {
  // BOOTS - Various rarities
  boots: [
    {
      id: 'cloth_shoes',
      name: 'Cloth Shoes',
      prompt: 'pixel art simple brown cloth shoes, basic peasant footwear, RPG boots item icon, transparent background, 48x48',
      size: 48,
    },
    {
      id: 'leather_boots',
      name: 'Leather Boots',
      prompt: 'pixel art brown leather adventurer boots, sturdy traveling footwear, RPG boots item icon, transparent background, 48x48',
      size: 48,
    },
    {
      id: 'iron_boots',
      name: 'Iron Boots',
      prompt: 'pixel art heavy iron plated boots with rivets, armored metal footwear, RPG boots item icon, transparent background, 48x48',
      size: 48,
    },
    {
      id: 'steel_greaves_boots',
      name: 'Steel Greaves',
      prompt: 'pixel art polished steel armored boots, knight greaves with ankle guards, RPG boots item icon, transparent background, 48x48',
      size: 48,
    },
    {
      id: 'mage_slippers',
      name: 'Mage Slippers',
      prompt: 'pixel art purple magical slippers with gold trim and glowing runes, wizard footwear, RPG boots item icon, transparent background, 48x48',
      size: 48,
    },
    {
      id: 'dragon_boots',
      name: 'Dragon Scale Boots',
      prompt: 'pixel art legendary red dragon scale boots with golden trim and fiery glow, epic RPG boots item icon, transparent background, 48x48',
      size: 48,
    },
    {
      id: 'phoenix_boots',
      name: 'Phoenix Flame Boots',
      prompt: 'pixel art legendary orange and gold phoenix feather boots with fiery flames, epic RPG boots item icon, transparent background, 48x48',
      size: 48,
    },
  ],

  // LEG ARMOR - Various rarities
  legs: [
    {
      id: 'cloth_pants',
      name: 'Cloth Pants',
      prompt: 'pixel art simple brown cloth pants, peasant trousers, RPG leg armor item icon, transparent background, 48x48',
      size: 48,
    },
    {
      id: 'leather_leggings',
      name: 'Leather Leggings',
      prompt: 'pixel art brown leather leg armor with straps, reinforced leather pants, RPG leg armor item icon, transparent background, 48x48',
      size: 48,
    },
    {
      id: 'chainmail_leggings',
      name: 'Chainmail Leggings',
      prompt: 'pixel art silver chainmail leg armor, interlocking metal rings pants, RPG leg armor item icon, transparent background, 48x48',
      size: 48,
    },
    {
      id: 'iron_legguards',
      name: 'Iron Legguards',
      prompt: 'pixel art heavy iron plate leg armor, metal greaves with knee guards, RPG leg armor item icon, transparent background, 48x48',
      size: 48,
    },
    {
      id: 'steel_legplates',
      name: 'Steel Legplates',
      prompt: 'pixel art polished steel plate leg armor, knight leg protection, RPG leg armor item icon, transparent background, 48x48',
      size: 48,
    },
    {
      id: 'mage_robes_legs',
      name: 'Arcane Legwraps',
      prompt: 'pixel art purple magical leg wraps with gold runes and glowing symbols, wizard leg armor, RPG leg armor item icon, transparent background, 48x48',
      size: 48,
    },
    {
      id: 'dragon_legguards',
      name: 'Dragon Scale Legguards',
      prompt: 'pixel art legendary red dragon scale leg armor with golden trim and fiery glow, epic RPG leg armor item icon, transparent background, 48x48',
      size: 48,
    },
    {
      id: 'phoenix_legguards',
      name: 'Phoenix Flame Legguards',
      prompt: 'pixel art legendary orange and gold phoenix feather leg armor with fiery flames, epic RPG leg armor item icon, transparent background, 48x48',
      size: 48,
    },
  ],
};

async function generateEquipmentSprite(category, item) {
  console.log(`\n🎨 Generating ${item.name} (${category})...`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000); // 90 second timeout

    const response = await fetch(API_URL, {
      signal: controller.signal,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: item.prompt,
        negative_description: 'character, body, person, realistic, 3d, blurry, low quality, wearing, full body',
        image_size: {
          width: item.size,
          height: item.size,
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

    // Determine output directory
    const outputDir = path.join(__dirname, `../public/assets/equipment/${category}`);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const outputPath = path.join(outputDir, `${item.id}.png`);

    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`💾 Saved: ${outputPath}`);

    return { success: true, cost: data.usage.usd };
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`⏱️  Timeout: ${item.name} took too long (>90s), skipping...`);
      return { success: false, cost: 0 };
    }
    console.error(`❌ Failed to generate ${item.name}:`, error.message);
    return { success: false, cost: 0 };
  }
}

async function generateAllEquipment() {
  console.log('🚀 BOOTS & LEG ARMOR SPRITE GENERATION');
  console.log('======================================');
  console.log('Generating boots and leg armor sprites...\n');

  let totalCost = 0;
  let successCount = 0;
  let failCount = 0;

  for (const [category, items] of Object.entries(EQUIPMENT_ITEMS)) {
    console.log(`\n📦 Category: ${category}`);
    console.log('─'.repeat(40));

    for (const item of items) {
      const result = await generateEquipmentSprite(category, item);

      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
      totalCost += result.cost;

      // Delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }

  console.log('\n======================================');
  console.log('✨ GENERATION COMPLETE!');
  console.log(`✅ Successfully generated: ${successCount}`);
  console.log(`❌ Failed/Skipped: ${failCount}`);
  console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);
  console.log('======================================\n');
}

// Run generation
generateAllEquipment().catch(console.error);
