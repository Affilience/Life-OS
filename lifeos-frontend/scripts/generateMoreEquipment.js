import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Equipment to generate - focusing on dragon chestplates and module-specific items
const EQUIPMENT_ITEMS = {
  // DRAGON CHESTPLATES - Regenerate to look like proper armor
  chests: [
    {
      id: 'dragon_scale_chestplate',
      name: 'Dragon Scale Chestplate',
      prompt: 'medieval fantasy dragon scale chestplate armor, front view, isolated armor piece, red and gold dragon scales arranged as protective plates, metallic gold trim, glowing orange runes, RPG equipment item, transparent background, pixel art style, 64x64',
      negative: 'character, person, wearing, mannequin, full body, helmet, legs, arms, side view, back view',
    },
    {
      id: 'dragon_bone_cuirass',
      name: 'Dragon Bone Cuirass',
      prompt: 'medieval fantasy dragon bone cuirass armor, front view, isolated armor piece, dark purple and black dragon bones fused into breastplate, glowing purple magical runes, legendary RPG equipment, transparent background, pixel art style, 64x64',
      negative: 'character, person, wearing, mannequin, full body, helmet, legs, arms, carcass, dead dragon',
    },
    {
      id: 'phoenix_battleplate',
      name: 'Phoenix Battleplate',
      prompt: 'medieval fantasy phoenix feather chestplate armor, front view, isolated armor piece, golden and orange feathers as armor plates, fiery glow, legendary RPG equipment, transparent background, pixel art style, 64x64',
      negative: 'character, person, wearing, mannequin, full body, helmet, legs, bird',
    },
  ],

  // KNOWLEDGE MODULE EQUIPMENT
  weapons_knowledge: [
    {
      id: 'scholars_tome',
      name: "Scholar's Tome",
      prompt: 'magical floating spell book weapon, open ancient tome with glowing blue pages, arcane symbols, golden corners, fantasy RPG weapon, transparent background, pixel art style, 48x48',
      negative: 'character, person, hand, holding, stand',
    },
    {
      id: 'quill_of_wisdom',
      name: 'Quill of Wisdom',
      prompt: 'magical golden feather quill pen, glowing ink dripping, enchanted writing tool, fantasy RPG weapon, transparent background, pixel art style, 48x48',
      negative: 'character, person, hand, inkwell, paper',
    },
    {
      id: 'crystal_wand',
      name: 'Crystal Wand',
      prompt: 'elegant crystal magic wand, purple amethyst crystal tip, silver handle with runes, magical aura, fantasy RPG weapon, transparent background, pixel art style, 48x48',
      negative: 'character, person, hand, staff',
    },
  ],

  // PRODUCTIVITY MODULE EQUIPMENT
  weapons_productivity: [
    {
      id: 'taskmaster_hammer',
      name: "Taskmaster's Hammer",
      prompt: 'golden war hammer with clock gears, steampunk style hammer weapon, bronze and gold, time-themed, fantasy RPG weapon, transparent background, pixel art style, 48x48',
      negative: 'character, person, hand, anvil',
    },
    {
      id: 'focus_blade',
      name: 'Focus Blade',
      prompt: 'sleek silver katana sword with blue energy edge, precision blade, sharp clean design, fantasy RPG weapon, transparent background, pixel art style, 48x48',
      negative: 'character, person, hand, sheath',
    },
  ],

  // HEALTH/FITNESS MODULE EQUIPMENT
  helmets_fitness: [
    {
      id: 'champions_helm',
      name: "Champion's Helm",
      prompt: 'golden spartan helmet with red plume, heroic warrior helmet, polished gold metal, fantasy RPG helmet, transparent background, pixel art style, 48x48',
      negative: 'character, person, body, full armor',
    },
    {
      id: 'iron_will_crown',
      name: 'Iron Will Crown',
      prompt: 'rugged iron crown with spikes, warrior king headpiece, dark metal with red gems, fantasy RPG helmet, transparent background, pixel art style, 48x48',
      negative: 'character, person, body, throne',
    },
  ],

  // FINANCIAL MODULE EQUIPMENT
  amulets_financial: [
    {
      id: 'merchants_medallion',
      name: "Merchant's Medallion",
      prompt: 'golden coin medallion amulet, wealthy merchant pendant, gold coins stacked design, emerald center gem, fantasy RPG amulet, transparent background, pixel art style, 48x48',
      negative: 'character, person, neck, chain only',
    },
    {
      id: 'prosperity_pendant',
      name: 'Prosperity Pendant',
      prompt: 'ornate jade and gold pendant, wealth symbol amulet, intricate golden filigree, green jade stone, fantasy RPG amulet, transparent background, pixel art style, 48x48',
      negative: 'character, person, neck',
    },
  ],

  // JOURNAL MODULE EQUIPMENT
  capes_journal: [
    {
      id: 'storyteller_cloak',
      name: "Storyteller's Cloak",
      prompt: 'magical purple cloak with constellation pattern, starry night cape, silver star embroidery, flowing fabric, fantasy RPG cape, transparent background, pixel art style, 48x48',
      negative: 'character, person, body, hood up',
    },
    {
      id: 'memory_mantle',
      name: 'Memory Mantle',
      prompt: 'ethereal blue translucent cloak, ghostly memory wisps, shimmering fabric with fading edges, fantasy RPG cape, transparent background, pixel art style, 48x48',
      negative: 'character, person, body',
    },
  ],

  // CALENDAR/TIME MODULE EQUIPMENT
  rings_calendar: [
    {
      id: 'timekeeper_ring',
      name: "Timekeeper's Ring",
      prompt: 'silver ring with tiny hourglass, time magic ring, glowing blue sand inside, intricate clockwork design, fantasy RPG ring, transparent background, pixel art style, 32x32',
      negative: 'character, person, finger, hand',
    },
    {
      id: 'schedule_signet',
      name: 'Schedule Signet',
      prompt: 'golden signet ring with sundial symbol, organized planner ring, sun and moon design, fantasy RPG ring, transparent background, pixel art style, 32x32',
      negative: 'character, person, finger, hand',
    },
  ],

  // LEGENDARY SET PIECES
  shields_legendary: [
    {
      id: 'aegis_of_mastery',
      name: 'Aegis of Mastery',
      prompt: 'legendary golden tower shield, ornate mastery shield with all-seeing eye, divine protection, glowing runes, fantasy RPG shield, transparent background, pixel art style, 64x64',
      negative: 'character, person, arm, holding',
    },
    {
      id: 'phoenix_wing_shield',
      name: 'Phoenix Wing Shield',
      prompt: 'legendary phoenix feather shield, burning orange and gold shield shaped like wing, fiery aura, fantasy RPG shield, transparent background, pixel art style, 64x64',
      negative: 'character, person, arm, bird',
    },
  ],
};

async function generateEquipmentSprite(category, item) {
  console.log(`\n🎨 Generating ${item.name} (${category})...`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    // Determine size based on item type
    let size = 48;
    if (category.includes('rings')) size = 32;
    if (category.includes('chests') || category.includes('shields_legendary')) size = 64;

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
          width: size,
          height: size,
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

    // Determine output directory based on category
    let outputCategory = category.split('_')[0]; // Get base category (chests, weapons, etc.)
    const outputDir = path.join(__dirname, `../public/assets/equipment/${outputCategory}`);

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
      console.error(`⏱️  Timeout: ${item.name} took too long (>60s), skipping...`);
      return { success: false, cost: 0 };
    }
    console.error(`❌ Failed to generate ${item.name}:`, error.message);
    return { success: false, cost: 0 };
  }
}

async function generateAllEquipment() {
  console.log('🚀 EQUIPMENT SPRITE GENERATION - Extended Collection');
  console.log('====================================================');
  console.log('Generating dragon chestplates and module-specific equipment...\n');

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
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n====================================================');
  console.log('✨ GENERATION COMPLETE!');
  console.log(`✅ Successfully generated: ${successCount}`);
  console.log(`❌ Failed/Skipped: ${failCount}`);
  console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);
  console.log('📁 Sprites saved to: public/assets/equipment/');
  console.log('====================================================\n');
}

// Run generation
generateAllEquipment().catch(console.error);
