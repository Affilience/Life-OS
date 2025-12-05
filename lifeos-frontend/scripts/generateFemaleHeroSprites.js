import fs from 'fs';
import path from 'path';

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

const OUTPUT_DIR = './public/assets/avatar/evolution';

// Base character description - CONSISTENT across all stages
// Female hero with auburn/brown hair and green eyes (matching male hero's coloring)
const BASE_CHARACTER = `young woman, female hero, auburn brown hair in ponytail, green eyes, determined expression, athletic build`;

const BASE_NEGATIVE = `male, man, boy, beard, mustache, facial hair,
blurry, low quality, distorted, deformed, ugly, realistic photo,
text, watermark, signature, duplicate, too detailed, cluttered, messy,
photorealistic, 3D render, gradients, anti-aliasing artifacts,
background, solid background, colored background,
different hair color, blonde, black hair, white hair, blue hair, pink hair,
different eye color, blue eyes, brown eyes, red eyes`;

// All 40 stages with their outfit/equipment descriptions
const STAGES = [
  { stage: 1, name: 'dreamer', outfit: 'simple peasant clothes, barefoot, rolled up sleeves, brown pants, green shirt, hopeful pose' },
  { stage: 2, name: 'seeker', outfit: 'traveler clothes, simple leather boots, cloth bag, walking staff, adventurer starting out' },
  { stage: 3, name: 'recruit', outfit: 'basic training outfit, cloth armor, simple wooden practice sword, determined stance' },
  { stage: 4, name: 'trainee', outfit: 'padded training armor, practice sword, leather gloves, focused expression' },
  { stage: 5, name: 'squire', outfit: 'light leather armor, small shield, iron sword, squire tabard, ready stance' },
  { stage: 6, name: 'initiate', outfit: 'chainmail vest, iron sword, wooden shield with emblem, leather bracers' },
  { stage: 7, name: 'footman', outfit: 'full chainmail armor, steel sword, kite shield, military stance' },
  { stage: 8, name: 'scout', outfit: 'light leather armor, hooded cloak, bow and arrows, agile pose, forest scout' },
  { stage: 9, name: 'warrior', outfit: 'steel plate armor, longsword, round shield, battle-ready stance' },
  { stage: 10, name: 'swordsman', outfit: 'ornate plate armor, dual swords with lightning effects, red cape, heroic pose' },
  { stage: 11, name: 'duelist', outfit: 'elegant fencing armor, rapier, buckler shield, graceful combat stance' },
  { stage: 12, name: 'berserker', outfit: 'fur-lined heavy armor, massive two-handed axe, war paint, fierce expression' },
  { stage: 13, name: 'knight', outfit: 'full plate armor, knight helm, longsword, tower shield, noble crest, red cape' },
  { stage: 14, name: 'ranger', outfit: 'green leather armor, longbow, quiver of arrows, hooded cloak, forest protector' },
  { stage: 15, name: 'paladin', outfit: 'golden plate armor, holy sword with divine glow, tower shield with holy symbol' },
  { stage: 16, name: 'monk', outfit: 'martial arts robes, bandaged hands, prayer beads, serene combat stance' },
  { stage: 17, name: 'assassin', outfit: 'dark leather armor, hood and mask, dual daggers, shadow cloak, stealth pose' },
  { stage: 18, name: 'battlemage', outfit: 'enchanted armor with runes, magic staff, spell effects, arcane energy aura' },
  { stage: 19, name: 'champion', outfit: 'decorated plate armor, champion sword, victory banner, triumphant pose' },
  { stage: 20, name: 'veteran', outfit: 'battle-scarred heavy armor, greatsword, red cape, weathered warrior look' },
  { stage: 21, name: 'blade_master', outfit: 'masterwork samurai-style armor, katana, focused stance, wind effects' },
  { stage: 22, name: 'war_chief', outfit: 'tribal war armor with bones and fur, war hammer, feathered helm, commanding presence' },
  { stage: 23, name: 'dragon_knight', outfit: 'dragon scale armor, dragon helm, flaming sword, dragon wings, fire effects' },
  { stage: 24, name: 'shadow_master', outfit: 'dark ethereal armor, shadow blades, darkness aura, glowing eyes' },
  { stage: 25, name: 'holy_crusader', outfit: 'white and gold holy armor, blessed greatsword, divine halo, angelic wings' },
  { stage: 26, name: 'arcane_warrior', outfit: 'magical plate armor with floating runes, enchanted blade, arcane symbols' },
  { stage: 27, name: 'beast_master', outfit: 'primal armor with animal motifs, spirit animal companion, nature magic effects' },
  { stage: 28, name: 'demon_hunter', outfit: 'dark red armor with demon bones, crossbow, demon-slaying weapons, hellfire' },
  { stage: 29, name: 'storm_lord', outfit: 'storm-infused armor, lightning weapons, thunder effects, storm clouds' },
  { stage: 30, name: 'warlord', outfit: 'commander plate armor, war banner, legendary sword, army leader presence' },
  { stage: 31, name: 'sword_saint', outfit: 'ascetic robes over light armor, holy katana, spiritual energy aura' },
  { stage: 32, name: 'phoenix_knight', outfit: 'golden phoenix armor, fire wings, blazing sword, rebirth flames' },
  { stage: 33, name: 'void_stalker', outfit: 'void-touched armor, reality-warping blades, cosmic void effects' },
  { stage: 34, name: 'celestial_guardian', outfit: 'starlight armor, cosmic shield, stellar weapon, constellation patterns' },
  { stage: 35, name: 'titan_slayer', outfit: 'titan-forged armor, massive legendary blade, giant-slaying trophies' },
  { stage: 36, name: 'elemental_lord', outfit: 'elemental fusion armor, controlling fire water earth air, elemental weapons' },
  { stage: 37, name: 'immortal_champion', outfit: 'eternal golden armor, immortal aura, legendary artifacts, divine blessing' },
  { stage: 38, name: 'godslayer', outfit: 'god-killing armor, divine weapons, cosmic power, transcendent form' },
  { stage: 39, name: 'ascendant', outfit: 'ethereal glowing armor, ascended form, reality-bending power, divine light' },
  { stage: 40, name: 'avatar_of_mastery', outfit: 'ultimate transcendent armor, throne of power, mastery of all elements, cosmic sovereign, elemental orbs floating around' },
];

async function generateSprite(stageConfig) {
  const { stage, name, outfit } = stageConfig;
  const paddedStage = String(stage).padStart(2, '0');
  const filename = `heroine_v3_stage_${stage}_${name}.png`;
  const outputPath = path.join(OUTPUT_DIR, filename);

  // Check if file already exists
  if (fs.existsSync(outputPath)) {
    console.log(`Skipping stage ${stage} (${name}) - already exists`);
    return { stage, name, skipped: true };
  }

  const prompt = `highly detailed pixel art RPG character sprite,
${BASE_CHARACTER},
${outfit},
full body front-facing view, standing pose,
single color black outline, detailed shading, vibrant colors,
professional pixel art, JRPG style, 128x128 pixels,
transparent background, no background`;

  console.log(`Generating stage ${stage}: ${name}...`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: prompt,
        negative_description: BASE_NEGATIVE,
        image_size: {
          width: 128,
          height: 128
        },
        text_guidance_scale: 8.5,
        no_background: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    fs.writeFileSync(outputPath, imageBuffer);

    console.log(`  ✅ Stage ${stage} (${name}) saved! Cost: $${(data.cost || 0).toFixed(4)}`);
    return { stage, name, success: true, cost: data.cost || 0 };
  } catch (error) {
    console.error(`  ❌ Stage ${stage} (${name}) failed: ${error.message}`);
    return { stage, name, success: false, error: error.message };
  }
}

async function generateAllSprites() {
  console.log('='.repeat(60));
  console.log('Female Hero Sprite Generator - V3 Series');
  console.log('='.repeat(60));
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Total stages: ${STAGES.length}`);
  console.log('');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const results = [];
  let totalCost = 0;

  // Process stages sequentially to avoid rate limits
  for (const stage of STAGES) {
    const result = await generateSprite(stage);
    results.push(result);

    if (result.cost) {
      totalCost += result.cost;
    }

    // Small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('');
  console.log('='.repeat(60));
  console.log('GENERATION COMPLETE');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success).length;
  const skipped = results.filter(r => r.skipped).length;
  const failed = results.filter(r => !r.success && !r.skipped).length;

  console.log(`Successful: ${successful}`);
  console.log(`Skipped (existing): ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total cost: $${totalCost.toFixed(4)}`);

  if (failed > 0) {
    console.log('');
    console.log('Failed stages:');
    results.filter(r => !r.success && !r.skipped).forEach(r => {
      console.log(`  - Stage ${r.stage} (${r.name}): ${r.error}`);
    });
  }
}

// Run the generator
generateAllSprites().catch(console.error);
