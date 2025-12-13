import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Bazaar items to generate
const BAZAAR_ITEMS = {
  // WEAPONS
  weapons: [
    {
      id: 'sword_novice',
      name: 'Novice Blade',
      prompt: 'pixel art simple iron training sword, basic blade weapon, fantasy RPG item icon, transparent background, 48x48',
      size: 48,
    },
    {
      id: 'sword_iron',
      name: 'Iron Longsword',
      prompt: 'pixel art iron longsword with crossguard, sturdy medieval blade, fantasy RPG weapon icon, transparent background, 48x48',
      size: 48,
    },
    {
      id: 'sword_crystal',
      name: 'Crystal Saber',
      prompt: 'pixel art glowing blue crystal sword, magical saber with light effects, fantasy RPG rare weapon icon, transparent background, 48x48',
      size: 48,
    },
    {
      id: 'sword_void',
      name: 'Voidbringer',
      prompt: 'pixel art dark purple void sword with swirling energy, epic magical blade, dark fantasy weapon icon, transparent background, 48x48',
      size: 48,
    },
    {
      id: 'sword_celestial',
      name: 'Celestial Excalibur',
      prompt: 'pixel art legendary golden holy sword with divine light aura, celestial blade weapon, epic fantasy icon, transparent background, 48x48',
      size: 48,
    },
  ],

  // ARMOR
  armor: [
    {
      id: 'armor_leather',
      name: 'Leather Vest',
      prompt: 'pixel art brown leather armor vest, simple RPG chest armor icon, transparent background, 48x48',
      size: 48,
    },
    {
      id: 'armor_chainmail',
      name: 'Chainmail Hauberk',
      prompt: 'pixel art silver chainmail armor, metallic links chest armor, RPG equipment icon, transparent background, 48x48',
      size: 48,
    },
    {
      id: 'armor_plate',
      name: 'Plate Armor',
      prompt: 'pixel art heavy steel plate armor, medieval knight chest piece, RPG equipment icon, transparent background, 48x48',
      size: 48,
    },
    {
      id: 'armor_cosmic',
      name: 'Cosmic Guardian Plate',
      prompt: 'pixel art cosmic purple armor with glowing star patterns, epic space-themed chest armor, RPG icon, transparent background, 48x48',
      size: 48,
    },
  ],

  // ACCESSORIES
  accessories: [
    {
      id: 'ring_focus',
      name: 'Ring of Focus',
      prompt: 'pixel art golden ring with glowing blue gem, magical intelligence ring, RPG accessory icon, transparent background, 32x32',
      size: 32,
    },
    {
      id: 'amulet_vitality',
      name: 'Amulet of Vitality',
      prompt: 'pixel art golden amulet necklace with green gem, life energy pendant, RPG accessory icon, transparent background, 32x32',
      size: 32,
    },
    {
      id: 'cloak_shadows',
      name: 'Cloak of Shadows',
      prompt: 'pixel art dark purple shadowy cloak with hood, mysterious magical cape, RPG accessory icon, transparent background, 48x48',
      size: 48,
    },
  ],

  // CONSUMABLES
  consumables: [
    {
      id: 'potion_xp_small',
      name: 'XP Elixir Small',
      prompt: 'pixel art small blue glowing potion bottle, experience elixir, RPG consumable icon, transparent background, 32x32',
      size: 32,
    },
    {
      id: 'potion_xp_medium',
      name: 'XP Elixir Medium',
      prompt: 'pixel art medium purple glowing potion bottle, experience elixir, RPG consumable icon, transparent background, 32x32',
      size: 32,
    },
    {
      id: 'potion_xp_large',
      name: 'XP Elixir Large',
      prompt: 'pixel art large golden glowing potion bottle with sparkles, rare experience elixir, RPG consumable icon, transparent background, 32x32',
      size: 32,
    },
    {
      id: 'boost_xp_2x',
      name: 'Double XP Scroll',
      prompt: 'pixel art glowing magical scroll with golden aura, experience boost scroll, RPG consumable icon, transparent background, 32x32',
      size: 32,
    },
    {
      id: 'shield_streak',
      name: 'Streak Shield',
      prompt: 'pixel art glowing blue protective shield icon, magical barrier item, RPG consumable icon, transparent background, 32x32',
      size: 32,
    },
  ],

  // COSMETICS
  cosmetics: [
    {
      id: 'aura_starlight',
      name: 'Starlight Aura',
      prompt: 'pixel art swirling starlight particles effect, cosmic sparkles aura, RPG cosmetic icon, transparent background, 48x48',
      size: 48,
    },
    {
      id: 'aura_flame',
      name: 'Phoenix Flame',
      prompt: 'pixel art orange red fire flame aura effect, phoenix ember particles, RPG cosmetic icon, transparent background, 48x48',
      size: 48,
    },
    {
      id: 'frame_golden',
      name: 'Golden Frame',
      prompt: 'pixel art ornate golden picture frame, prestigious border decoration, RPG cosmetic icon, transparent background, 48x48',
      size: 48,
    },
  ],
};

async function generateBazaarSprite(category, item) {
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
        negative_description: 'character, body, person, realistic, 3d, blurry, low quality',
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

    // Save sprite
    const outputDir = path.join(__dirname, `../public/assets/bazaar/${category}`);
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
      console.error(`⏱️  Timeout: ${item.name} took too long (>30s), skipping...`);
      return { success: false, cost: 0 };
    }
    console.error(`❌ Failed to generate ${item.name}:`, error.message);
    return { success: false, cost: 0 };
  }
}

async function generateAllBazaarItems() {
  console.log('🛒 BAZAAR ITEM SPRITE GENERATION');
  console.log('========================================');

  let totalCost = 0;
  let successCount = 0;
  let failCount = 0;

  for (const [category, items] of Object.entries(BAZAAR_ITEMS)) {
    console.log(`\n📦 Generating ${category}...`);

    for (const item of items) {
      const result = await generateBazaarSprite(category, item);

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

  console.log('\n========================================');
  console.log('✨ GENERATION COMPLETE!');
  console.log(`✅ Successfully generated: ${successCount}`);
  console.log(`❌ Failed/Skipped: ${failCount}`);
  console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);
  console.log('📁 Sprites saved to: public/assets/bazaar/');
  console.log('========================================\n');
}

// Run generation
generateAllBazaarItems().catch(console.error);
