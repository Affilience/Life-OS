/**
 * Retry Missing Hero Base Evolution Sprites
 * Generates only the missing stages: 15-30 and 38-40
 * Uses longer delays to avoid rate limiting
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Base clothing description (consistent across all stages)
const BASE_CLOTHING = 'simple sleeveless brown tunic and cloth pants, leather belt, leather sandals';
const HERO_BASE = 'male warrior with short brown hair and brown eyes';

// Only the MISSING stages (15-30 and 38-40)
const MISSING_STAGES = [
  // ACT II continued
  {
    stage: 15,
    name: 'Paladin',
    physique: 'powerful holy warrior build',
    stance: 'shield raised, divine light pose',
    expression: 'righteous determination',
    effects: 'divine golden aura, holy light rays',
    details: 'blessed markings on arms, radiant skin'
  },
  {
    stage: 16,
    name: 'Monk',
    physique: 'lean defined muscle, perfect form',
    stance: 'one-legged crane stance, arms balanced',
    expression: 'inner peace mastery',
    effects: 'chi energy flowing, leaves floating',
    details: 'prayer beads on wrist, meditation calm'
  },
  {
    stage: 17,
    name: 'Assassin',
    physique: 'shadow-lean deadly build',
    stance: 'silent killer crouch, hands ready',
    expression: 'cold calculating killer gaze',
    effects: 'shadow wisps, darkness gathering',
    details: 'hidden blade scars, dark tattoos'
  },
  {
    stage: 18,
    name: 'Battlemage',
    physique: 'warrior-mage hybrid build',
    stance: 'spell-sword hybrid stance, magic in hands',
    expression: 'arcane warrior focus',
    effects: 'fire and lightning crackling around hands',
    details: 'rune tattoos glowing, magic-scarred skin'
  },
  {
    stage: 19,
    name: 'Champion',
    physique: 'peak athletic perfection',
    stance: 'victory pose, arms triumphant',
    expression: 'unshakeable confidence',
    effects: 'crowd cheering energy, golden glow',
    details: 'medals of honor, winning aura'
  },
  {
    stage: 20,
    name: 'Veteran',
    physique: 'battle-hardened powerful build',
    stance: 'weary but unbroken stance',
    expression: 'thousand-yard stare wisdom',
    effects: 'spectral battle echoes',
    details: 'many scars, greying temples, weathered'
  },
  // ACT III: MASTERY (21-30)
  {
    stage: 21,
    name: 'Blade Master',
    physique: 'transcendent warrior physique',
    stance: 'perfect blade form stance, hands positioned',
    expression: 'blade saint enlightenment',
    effects: 'silver-blue energy trails, cherry blossoms',
    details: 'serene master appearance'
  },
  {
    stage: 22,
    name: 'War Chief',
    physique: 'commanding tribal leader build',
    stance: 'chieftain commanding pose',
    expression: 'ancestral power gaze',
    effects: 'spirit animals circling, ancestral ghosts',
    details: 'tribal markings glowing, feathers in hair'
  },
  {
    stage: 23,
    name: 'Dragon Knight',
    physique: 'dragon-touched powerful build',
    stance: 'dragonborn power stance',
    expression: 'dragon fire in eyes',
    effects: 'flames wreathing body, dragon spirit',
    details: 'scale patterns on skin, horns forming'
  },
  {
    stage: 24,
    name: 'Shadow Master',
    physique: 'ethereal shadow-infused form',
    stance: 'phasing between dimensions pose',
    expression: 'void walker gaze',
    effects: 'purple-black void portals, reality tears',
    details: 'body partially transparent, star patterns'
  },
  {
    stage: 25,
    name: 'Holy Crusader',
    physique: 'divine warrior radiant build',
    stance: 'crusader charge pose',
    expression: 'holy wrath determination',
    effects: 'blinding divine light, angel wings forming',
    details: 'glowing halo, divine markings'
  },
  {
    stage: 26,
    name: 'Arcane Warrior',
    physique: 'magic-infused warrior build',
    stance: 'spellblade combat stance',
    expression: 'arcane mastery focus',
    effects: 'rainbow magical energy, spell circles',
    details: 'crystalline patterns on skin, glowing eyes'
  },
  {
    stage: 27,
    name: 'Beast Master',
    physique: 'primal nature-bonded build',
    stance: 'communing with beasts pose',
    expression: 'wild nature harmony',
    effects: 'spectral animals manifesting, forest magic',
    details: 'antler crown forming, vine patterns'
  },
  {
    stage: 28,
    name: 'Demon Hunter',
    physique: 'demon-touched hunter build',
    stance: 'demon slayer stance',
    expression: 'burning third eye gaze',
    effects: 'holy-hellfire mix, demon souls swirling',
    details: 'blindfold with glowing eye, runic scars'
  },
  {
    stage: 29,
    name: 'Storm Lord',
    physique: 'tempest-infused powerful build',
    stance: 'storm summoning pose, arms raised',
    expression: 'tempest master command',
    effects: 'lightning crackling, storm clouds swirling',
    details: 'electricity in veins, wind-swept'
  },
  {
    stage: 30,
    name: 'Warlord',
    physique: 'supreme commander imposing build',
    stance: 'conqueror claiming pose',
    expression: 'absolute authority',
    effects: 'army phantoms behind, conquest energy',
    details: 'crown of power forming, regal bearing'
  },
  // ACT IV continued (38-40)
  {
    stage: 38,
    name: 'Godslayer',
    physique: 'deicide power radiating build',
    stance: 'piercing heavens pose',
    expression: 'divine slayer determination',
    effects: 'stolen divinity crackling, shattered halos',
    details: 'god-blood marks, broken divine essence'
  },
  {
    stage: 39,
    name: 'Ascendant',
    physique: 'semi-transparent energy form',
    stance: 'levitating meditation pose',
    expression: 'transcendent being enlightenment',
    effects: 'rainbow cosmic energy, chakras blazing',
    details: 'mortal shell fading, pure energy visible'
  },
  {
    stage: 40,
    name: 'Avatar of Mastery',
    physique: 'perfect fusion ultimate form',
    stance: 'throne of achievement pose',
    expression: 'absolute perfection serenity',
    effects: 'all powers combined, universe bowing',
    details: 'golden completion light, reality acknowledging'
  },
];

const GENERATION_PARAMS = {
  width: 128,
  height: 128,
  text_guidance_scale: 8.5,
  no_background: true,
};

function buildPrompt(stage) {
  return `epic pixel art of ${stage.physique} ${HERO_BASE} wearing ${BASE_CLOTHING}, ${stage.stance}, ${stage.expression}, ${stage.details}${stage.effects ? ', ' + stage.effects : ''}, arms and hands clearly visible for equipment overlay, fantasy RPG style, front-facing isometric view, highly detailed 128x128 pixel art, clean silhouette`;
}

const NEGATIVE_PROMPT = `blurry, smudged, muddy colors, low contrast, unclear silhouette, messy lines,
distorted anatomy, asymmetric, watermark, signature, text, jpeg artifacts, dull colors, flat shading,
bad proportions, deformed, ugly, cropped, low quality, armor, helmet, weapon, sword, shield,
metal armor, chainmail, plate armor, gauntlets, greaves, pauldrons, cape, cloak,
oversexualized, revealing outfit, covered arms, hidden hands`;

async function generateSprite(prompt, name, stage) {
  console.log(`\n🎨 Generating Stage ${stage}: ${name}`);
  console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: prompt,
        negative_description: NEGATIVE_PROMPT,
        image_size: {
          width: GENERATION_PARAMS.width,
          height: GENERATION_PARAMS.height
        },
        text_guidance_scale: GENERATION_PARAMS.text_guidance_scale,
        no_background: GENERATION_PARAMS.no_background,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`💰 Cost: $${data.usage?.usd?.toFixed(4) || 'N/A'}`);

    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    return base64Data;
  } catch (error) {
    console.error(`❌ Failed to generate ${name}:`, error.message);
    throw error;
  }
}

function saveSprite(base64Data, filename, subdir) {
  const outputPath = path.join(__dirname, '..', 'public', 'assets', 'avatar', subdir, filename);

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Saved: ${subdir}/${filename}`);
}

async function retryMissingStages() {
  const subdir = 'base-evolution';

  console.log('🔄 RETRYING MISSING HERO BASE EVOLUTION SPRITES');
  console.log('================================================');
  console.log(`📊 Missing stages to generate: ${MISSING_STAGES.length}`);
  console.log(`⏳ Using 5s delay between requests to avoid rate limiting\n`);

  const results = { success: [], failed: [] };

  for (let i = 0; i < MISSING_STAGES.length; i++) {
    const stage = MISSING_STAGES[i];
    const prompt = buildPrompt(stage);
    const filename = `hero_base_stage_${stage.stage}_${stage.name.toLowerCase().replace(/ /g, '_')}.png`;

    try {
      const imageData = await generateSprite(prompt, stage.name, stage.stage);
      saveSprite(imageData, filename, subdir);
      results.success.push(stage.name);

      console.log(`📈 Progress: ${i + 1}/${MISSING_STAGES.length} (${Math.round((i + 1) / MISSING_STAGES.length * 100)}%)`);

      // Longer delay (5 seconds) to avoid rate limits
      if (i < MISSING_STAGES.length - 1) {
        console.log('⏳ Waiting 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      results.failed.push({ name: stage.name, error: error.message });
      // Wait even longer after an error
      console.log('⏳ Error occurred, waiting 10 seconds...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 RETRY COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${results.success.length}/${MISSING_STAGES.length}`);
  console.log(`❌ Failed: ${results.failed.length}/${MISSING_STAGES.length}`);

  if (results.failed.length > 0) {
    console.log('\n❌ Still failed:');
    results.failed.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
  }

  return results;
}

// Run
retryMissingStages().catch(console.error);
