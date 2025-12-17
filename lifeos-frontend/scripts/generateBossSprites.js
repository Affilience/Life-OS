/**
 * Generate Boss Sprites using PixelLab API
 * Creates 10 level-tiered boss monsters for the PvE combat system
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';
const OUTPUT_DIR = path.join(__dirname, '../public/assets/bosses');

// Boss definitions - 10 bosses for level tiers
const BOSSES = [
  {
    id: 'shadow_slime',
    name: 'Shadow Slime',
    levelRange: [1, 5],
    difficulty: 'easy',
    description: 'evil dark purple slime monster, gelatinous blob with glowing red angry eyes, shadowy aura, dripping ooze, menacing expression',
    health: 200,
    damage: 5,
    xpReward: 100,
    creditsReward: 50,
  },
  {
    id: 'goblin_chief',
    name: 'Goblin Chief',
    levelRange: [6, 10],
    difficulty: 'easy',
    description: 'goblin king boss, green skinned goblin chief with small crown, tribal bone armor, holding crude spiked wooden club, fierce expression',
    health: 400,
    damage: 8,
    xpReward: 200,
    creditsReward: 100,
  },
  {
    id: 'skeleton_knight',
    name: 'Skeleton Knight',
    levelRange: [11, 15],
    difficulty: 'normal',
    description: 'undead skeleton warrior boss, ancient rusted iron armor, glowing blue flames in eye sockets, wielding cursed jagged sword, tattered red cape',
    health: 600,
    damage: 12,
    xpReward: 350,
    creditsReward: 175,
  },
  {
    id: 'forest_troll',
    name: 'Forest Troll',
    levelRange: [16, 20],
    difficulty: 'normal',
    description: 'massive forest troll boss, dark green mossy skin with tree bark patches, hulking muscular body, glowing yellow eyes, wielding uprooted tree as club',
    health: 900,
    damage: 15,
    xpReward: 500,
    creditsReward: 250,
  },
  {
    id: 'stone_golem',
    name: 'Stone Golem',
    levelRange: [21, 25],
    difficulty: 'hard',
    description: 'ancient stone golem boss, massive rock elemental creature, glowing orange magical runes carved into grey stone body, crystal core in chest, rocky fists',
    health: 1200,
    damage: 18,
    xpReward: 700,
    creditsReward: 350,
  },
  {
    id: 'flame_demon',
    name: 'Flame Demon',
    levelRange: [26, 30],
    difficulty: 'hard',
    description: 'fire demon boss, crimson red demon with flames engulfing body, curved black horns, molten lava cracks on skin, burning wings, holding flaming trident',
    health: 1600,
    damage: 22,
    xpReward: 900,
    creditsReward: 450,
  },
  {
    id: 'ice_drake',
    name: 'Ice Drake',
    levelRange: [31, 35],
    difficulty: 'epic',
    description: 'frost dragon boss, icy blue dragon with crystalline ice scales, frozen breath mist, sharp icicle spines along back, glowing white eyes, frost aura',
    health: 2000,
    damage: 26,
    xpReward: 1200,
    creditsReward: 600,
  },
  {
    id: 'dark_wizard',
    name: 'Dark Wizard',
    levelRange: [36, 40],
    difficulty: 'epic',
    description: 'evil dark sorcerer boss, hooded dark mage with glowing purple eyes, black flowing robes with arcane symbols, holding corrupted staff with skull, dark magic swirling',
    health: 2400,
    damage: 30,
    xpReward: 1500,
    creditsReward: 750,
  },
  {
    id: 'void_watcher',
    name: 'Void Watcher',
    levelRange: [41, 45],
    difficulty: 'legendary',
    description: 'cosmic horror boss, floating eldritch eye creature from the void, multiple smaller eyes orbiting, tentacles of pure darkness, purple-black cosmic energy, reality warping aura',
    health: 3000,
    damage: 35,
    xpReward: 2000,
    creditsReward: 1000,
  },
  {
    id: 'dragon_lord',
    name: 'Dragon Lord',
    levelRange: [46, 50],
    difficulty: 'legendary',
    description: 'ultimate dragon boss, massive ancient dragon with golden and red scales, crown of horns, four wings, breathing golden fire, royal dragon armor plates, glowing amber eyes',
    health: 4000,
    damage: 40,
    xpReward: 3000,
    creditsReward: 1500,
  },
];

async function generateBossSprite(boss) {
  console.log(`\n🐲 Generating ${boss.name} (Lv ${boss.levelRange[0]}-${boss.levelRange[1]})...`);

  // Check if already exists
  const filename = `boss_${boss.id}.png`;
  const finalPath = path.join(OUTPUT_DIR, filename);
  if (fs.existsSync(finalPath)) {
    console.log(`  ⏭️  Already exists, skipping...`);
    return { success: true, path: finalPath, boss, cost: 0, skipped: true };
  }

  const prompt = `pixel art RPG boss monster, ${boss.description}, game enemy sprite, detailed shading, fantasy game asset, menacing powerful creature, 64x64 sprite, front facing`;
  const negativePrompt = '3d, realistic, photo, blurry, low quality, ugly, deformed, background, scenery, cute, friendly, multiple characters';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

    const response = await fetch(API_URL, {
      signal: controller.signal,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: prompt,
        negative_description: negativePrompt,
        image_size: { width: 64, height: 64 },
        text_guidance_scale: 9.0,
        no_background: true,
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`  ✅ Generated successfully`);
    console.log(`  💰 Cost: $${data.usage?.usd?.toFixed(4) || 'N/A'}`);

    // Extract base64 data
    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    fs.writeFileSync(finalPath, imageBuffer);
    console.log(`  💾 Saved: ${filename}`);
    return { success: true, path: finalPath, boss, cost: data.usage?.usd || 0 };
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`  ⏱️  Timeout: ${boss.name} took too long (>90s), skipping...`);
      return { success: false, error: 'Timeout', boss, cost: 0 };
    }
    console.error(`  ❌ Failed: ${error.message}`);
    return { success: false, error: error.message, boss, cost: 0 };
  }
}

async function generateAllBosses() {
  console.log('🚀 BOSS SPRITE GENERATION - PvE Combat System');
  console.log('==============================================');
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`🐲 Total bosses to generate: ${BOSSES.length}\n`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let totalCost = 0;
  const results = {
    success: [],
    failed: [],
  };

  // Generate bosses sequentially to avoid rate limits
  for (const boss of BOSSES) {
    const result = await generateBossSprite(boss);
    if (result.success) {
      results.success.push(result);
      totalCost += result.cost;
    } else {
      results.failed.push(result);
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n==============================================');
  console.log('✨ GENERATION COMPLETE!');
  console.log(`✅ Successfully generated: ${results.success.length}/${BOSSES.length}`);
  console.log(`❌ Failed/Skipped: ${results.failed.length}/${BOSSES.length}`);
  console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);

  if (results.failed.length > 0) {
    console.log('\n⚠️  Failed bosses:');
    results.failed.forEach(r => console.log(`  - ${r.boss.name}: ${r.error}`));
  }

  // Output the boss database entries
  console.log('\n📋 Boss Database Entries (for bossDatabase.js):\n');
  console.log('export const BOSS_DATABASE = {');
  results.success.forEach(r => {
    const boss = r.boss;
    console.log(`  ${boss.id}: {
    id: '${boss.id}',
    name: '${boss.name}',
    levelRange: [${boss.levelRange[0]}, ${boss.levelRange[1]}],
    difficulty: '${boss.difficulty}',
    health: ${boss.health},
    damage: ${boss.damage},
    xpReward: ${boss.xpReward},
    creditsReward: ${boss.creditsReward},
    sprite: '/assets/bosses/boss_${boss.id}.png',
    description: '${boss.description.split(',')[0]}',
  },`);
  });
  console.log('};');
  console.log('\n==============================================');
}

generateAllBosses().catch(console.error);
