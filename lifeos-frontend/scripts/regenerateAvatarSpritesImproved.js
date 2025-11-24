import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// First 10 stages - Human Explorer (Levels 1-25)
const STAGES_BATCH_1 = [
  {
    id: 1,
    name: 'Ordinary Human',
    filename: 'stage_01_civilian.png',
    prompt: 'pixel art character sprite, ordinary human civilian, casual clothes, brown jacket, front facing view, 128x128, transparent background, simple design, realistic proportions',
    negative: 'armor, weapons, mechanical parts, space suit, helmet, multiple views',
  },
  {
    id: 2,
    name: 'Trainee',
    filename: 'stage_02_trainee.png',
    prompt: 'pixel art character sprite, athletic human in gray training outfit, fitness gear, front facing view, 128x128, transparent background, fit body, simple athletic wear',
    negative: 'armor, weapons, mechanical parts, space suit, helmet, multiple views',
  },
  {
    id: 3,
    name: 'Recruit',
    filename: 'stage_03_recruit.png',
    prompt: 'pixel art character sprite, space program recruit, blue and orange flight suit, front facing view, 128x128, transparent background, professional uniform',
    negative: 'full armor, heavy weapons, mechanical limbs, helmet on, multiple views',
  },
  {
    id: 5,
    name: 'Junior Astronaut',
    filename: 'stage_05_junior_astronaut.png',
    prompt: 'pixel art character sprite, junior astronaut in gray space suit with blue accents, armored panels, front facing view, 128x128, transparent background, sleek design',
    negative: 'helmet covering face, mechanical limbs, weapons, multiple views',
  },
  {
    id: 7,
    name: 'Elite Astronaut',
    filename: 'stage_07_elite_astronaut.png',
    prompt: 'pixel art character sprite, elite astronaut in white and blue combat space suit, armored plating, front facing view, 128x128, transparent background, tactical design',
    negative: 'helmet covering face, mechanical limbs, heavy weapons, multiple views',
  },
  {
    id: 8,
    name: 'Tech Specialist',
    filename: 'stage_08_tech_specialist.png',
    prompt: 'pixel art character sprite, tech specialist astronaut with visible tech implants, blue glowing circuits on suit, front facing view, 128x128, transparent background, cybernetic hints',
    negative: 'full robot, helmet covering face, heavy mechanical limbs, multiple views',
  },
  {
    id: 9,
    name: 'Augmented Explorer',
    filename: 'stage_09_augmented_explorer.png',
    prompt: 'pixel art character sprite, augmented astronaut with one cybernetic arm visible, white suit with gray mechanical arm, front facing view, 128x128, transparent background, partial cyborg',
    negative: 'full robot, helmet covering face, both arms mechanical, multiple views',
  },
];

// Cyborg stages (11-20)
const STAGES_BATCH_2 = [
  {
    id: 11,
    name: 'Heavy Cyborg',
    filename: 'stage_11_heavy_cyborg.png',
    prompt: 'pixel art character sprite, heavy cyborg warrior, purple and orange color scheme, both arms fully mechanical with weapons, front facing view, 128x128, transparent background, 60% robot',
    negative: 'fully human, helmet, full robot body, multiple views',
  },
  {
    id: 12,
    name: 'Battle Mech',
    filename: 'stage_12_battle_mech.png',
    prompt: 'pixel art character sprite, battle mech humanoid, 80% mechanical purple body with orange accents, only head human, front facing view, 128x128, transparent background, heavily armored',
    negative: 'fully human, helmet covering face, complete robot, multiple views',
  },
  {
    id: 13,
    name: 'War Machine',
    filename: 'stage_13_war_machine.png',
    prompt: 'pixel art character sprite, war machine cyborg, dark purple mechanical body, only human head visible, orange weapon systems, front facing view, 128x128, transparent background, 95% machine',
    negative: 'human body, helmet, full face robot, multiple views',
  },
  {
    id: 14,
    name: 'Combat Android',
    filename: 'stage_14_combat_android.png',
    prompt: 'pixel art character sprite, combat android, sleek purple and blue robot body, synthetic human-like face, graceful design, front facing view, 128x128, transparent background, elegant robot',
    negative: 'human body parts, bulky armor, multiple views',
  },
  {
    id: 15,
    name: 'Advanced AI Unit',
    filename: 'stage_15_advanced_ai.png',
    prompt: 'pixel art character sprite, advanced AI unit, smooth purple and cyan robot, glowing blue eyes, streamlined humanoid form, front facing view, 128x128, transparent background, futuristic android',
    negative: 'human features, heavy armor, multiple views',
  },
  {
    id: 16,
    name: 'Prototype Synth',
    filename: 'stage_16_prototype_synth.png',
    prompt: 'pixel art character sprite, prototype synthetic being, white and blue sleek robot body, advanced tech, front facing view, 128x128, transparent background, next-gen android',
    negative: 'human skin, bulky design, multiple views',
  },
  {
    id: 17,
    name: 'Neural Construct',
    filename: 'stage_17_neural_construct.png',
    prompt: 'pixel art character sprite, neural construct entity, transparent blue holographic body, digital humanoid form, glowing circuits, front facing view, 128x128, transparent background, digital being',
    negative: 'solid body, human features, mechanical parts, multiple views',
  },
  {
    id: 18,
    name: 'Digital Ascendant',
    filename: 'stage_18_digital_ascendant.png',
    prompt: 'pixel art character sprite, digital ascendant being, glowing cyan and white energy form, humanoid shape made of light, front facing view, 128x128, transparent background, pure energy',
    negative: 'solid body, mechanical parts, human features, multiple views',
  },
];

async function generateStage(stage) {
  console.log(`\n🎨 Generating Stage ${stage.id}: ${stage.name}...`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 40000); // 40 second timeout

    const response = await fetch(API_URL, {
      signal: controller.signal,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: stage.prompt,
        negative_description: stage.negative,
        image_size: { width: 128, height: 128 },
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
    const outputDir = path.join(__dirname, '../public/assets/avatar');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const outputPath = path.join(outputDir, stage.filename);

    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`💾 Saved: ${outputPath}`);

    return { success: true, cost: data.usage.usd };
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`⏱️  Timeout: ${stage.name} took too long (>40s), skipping...`);
      return { success: false, cost: 0 };
    }
    console.error(`❌ Failed to generate ${stage.name}:`, error.message);
    return { success: false, cost: 0 };
  }
}

async function main() {
  console.log('🚀 AVATAR EVOLUTION SPRITE REGENERATION');
  console.log('========================================');
  console.log('Using improved prompts optimized for character sprites\n');

  let totalCost = 0;
  let successCount = 0;
  let failCount = 0;

  // Choose which batch to generate
  const BATCH = process.argv[2] === '2' ? STAGES_BATCH_2 : STAGES_BATCH_1;
  console.log(`\n📦 Generating ${BATCH === STAGES_BATCH_1 ? 'Batch 1 (Human Stages)' : 'Batch 2 (Cyborg Stages)'}...\n`);

  for (const stage of BATCH) {
    const result = await generateStage(stage);

    if (result.success) {
      successCount++;
    } else {
      failCount++;
    }
    totalCost += result.cost;

    // Delay between requests
    await new Promise(resolve => setTimeout(resolve, 2500));
  }

  console.log('\n========================================');
  console.log('✨ GENERATION COMPLETE!');
  console.log(`✅ Successfully generated: ${successCount}`);
  console.log(`❌ Failed/Skipped: ${failCount}`);
  console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);
  console.log('📁 Sprites saved to: public/assets/avatar/');
  console.log('========================================\n');
}

main().catch(console.error);
