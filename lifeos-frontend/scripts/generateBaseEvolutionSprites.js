/**
 * Base Evolution Sprite Generator
 * Generates 40 base character sprites WITH progression differentiation
 * but WITHOUT armor/weapons (for equipment overlay system)
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

// Character base for both genders
const HERO_BASE = 'male warrior with short brown hair and brown eyes';
const HEROINE_BASE = 'female warrior with short brown hair and brown eyes';

// 40 Stage Evolution - CHARACTER progression without equipment
const EVOLUTION_STAGES = [
  // ========== ACT I: THE AWAKENING (1-10) ==========
  {
    stage: 1,
    name: 'Dreamer',
    physique: 'young and slender',
    stance: 'humble standing pose with hands at sides',
    expression: 'hopeful eyes looking slightly upward',
    effects: '',
    details: 'clean unblemished skin, youthful face'
  },
  {
    stage: 2,
    name: 'Seeker',
    physique: 'lean and agile',
    stance: 'alert standing pose, weight on front foot',
    expression: 'curious determined gaze',
    effects: '',
    details: 'windswept hair, traveler weathering on skin'
  },
  {
    stage: 3,
    name: 'Recruit',
    physique: 'developing muscle tone',
    stance: 'disciplined military attention stance',
    expression: 'focused serious look',
    effects: '',
    details: 'fresh minor training bruises'
  },
  {
    stage: 4,
    name: 'Trainee',
    physique: 'athletic build forming',
    stance: 'combat-ready stance, fists raised',
    expression: 'intense concentration',
    effects: '',
    details: 'sweat on brow, training calluses on hands'
  },
  {
    stage: 5,
    name: 'Squire',
    physique: 'fit and toned',
    stance: 'respectful kneeling pose, head bowed slightly',
    expression: 'humble determination',
    effects: 'faint light from above',
    details: 'clean and groomed appearance'
  },
  {
    stage: 6,
    name: 'Initiate',
    physique: 'strong athletic build',
    stance: 'ceremonial salute pose, arm across chest',
    expression: 'solemn pride',
    effects: 'subtle divine light rays',
    details: 'blessed marking on forehead'
  },
  {
    stage: 7,
    name: 'Footman',
    physique: 'soldier build, broad shoulders',
    stance: 'firm planted stance, ready for battle',
    expression: 'steely resolve',
    effects: '',
    details: 'minor battle scars, weathered skin'
  },
  {
    stage: 8,
    name: 'Scout',
    physique: 'lean and wiry, built for speed',
    stance: 'crouched stealth pose, alert',
    expression: 'sharp watchful eyes',
    effects: 'faint forest energy wisps',
    details: 'camouflage paint marks on face'
  },
  {
    stage: 9,
    name: 'Warrior',
    physique: 'powerful muscular build',
    stance: 'aggressive battle stance, fists clenched',
    expression: 'fierce battle fury',
    effects: 'red battle aura emanating',
    details: 'battle scars on arms, war paint'
  },
  {
    stage: 10,
    name: 'Swordsman',
    physique: 'perfectly balanced athletic build',
    stance: 'masterful combat stance, arms ready',
    expression: 'calm deadly focus',
    effects: 'subtle blue energy around hands',
    details: 'disciplined posture, multiple small scars'
  },

  // ========== ACT II: THE TRIALS (11-20) ==========
  {
    stage: 11,
    name: 'Duelist',
    physique: 'elegant lean muscle',
    stance: 'graceful fencing stance, one arm back',
    expression: 'aristocratic confidence',
    effects: 'faint magical sparkles',
    details: 'refined features, noble bearing'
  },
  {
    stage: 12,
    name: 'Berserker',
    physique: 'massive barbaric muscle',
    stance: 'primal rage pose, muscles tensed',
    expression: 'wild berserker fury',
    effects: 'red rage aura, ground cracking',
    details: 'tribal war paint, wild hair'
  },
  {
    stage: 13,
    name: 'Knight',
    physique: 'noble warrior build',
    stance: 'heroic pose, chest out, chin up',
    expression: 'righteous determination',
    effects: 'golden holy light aura',
    details: 'noble features, blessed marking'
  },
  {
    stage: 14,
    name: 'Ranger',
    physique: 'lithe hunter build',
    stance: 'archer stance, arms positioned for bow',
    expression: 'one with nature focus',
    effects: 'green nature energy swirling',
    details: 'leaf patterns on skin, wild appearance'
  },
  {
    stage: 15,
    name: 'Paladin',
    physique: 'powerful holy warrior build',
    stance: 'divine judgment pose, arms raised',
    expression: 'radiant righteousness',
    effects: 'blazing white-gold divine aura',
    details: 'glowing eyes, holy symbols on skin'
  },
  {
    stage: 16,
    name: 'Monk',
    physique: 'lean defined muscle, perfect form',
    stance: 'martial arts crane stance, one leg raised',
    expression: 'inner peace serenity',
    effects: 'golden chi aura spiraling',
    details: 'meditation calm, floating lotus petals'
  },
  {
    stage: 17,
    name: 'Assassin',
    physique: 'shadow-lean deadly build',
    stance: 'crouched strike-ready pose',
    expression: 'cold calculating eyes',
    effects: 'purple shadow wisps, darkness swirling',
    details: 'face partially in shadow, glowing eyes'
  },
  {
    stage: 18,
    name: 'Battlemage',
    physique: 'warrior-mage hybrid build',
    stance: 'spellcasting combat pose, hands glowing',
    expression: 'arcane power focus',
    effects: 'multiple elemental auras, runes floating',
    details: 'glowing rune tattoos on arms'
  },
  {
    stage: 19,
    name: 'Champion',
    physique: 'peak athletic perfection',
    stance: 'victorious champion pose, arm raised',
    expression: 'triumphant glory',
    effects: 'golden victory aura, confetti energy',
    details: 'laurel marks on brow, champion bearing'
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

  // ========== ACT III: MASTERY (21-30) ==========
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

  // ========== ACT IV: LEGEND (31-40) ==========
  {
    stage: 31,
    name: 'Sword Saint',
    physique: 'transcendent light-infused form',
    stance: 'achieving sword nirvana pose',
    expression: 'divine enlightenment',
    effects: 'phantom blades orbiting, reality splits',
    details: 'body becoming light, serene transcendence'
  },
  {
    stage: 32,
    name: 'Phoenix Knight',
    physique: 'immortal flame-infused build',
    stance: 'rising from ashes pose',
    expression: 'eternal rebirth determination',
    effects: 'phoenix fire wings, ash and embers',
    details: 'flame patterns on skin, burning eyes'
  },
  {
    stage: 33,
    name: 'Void Stalker',
    physique: 'void-merged ethereal form',
    stance: 'stepping between realities pose',
    expression: 'cosmic void gaze',
    effects: 'dark matter aura, existence fading',
    details: 'body phasing, galaxy patterns visible'
  },
  {
    stage: 34,
    name: 'Celestial Guardian',
    physique: 'angelic transcendent form',
    stance: 'six wings spread protecting pose',
    expression: 'heavenly protector serenity',
    effects: 'divine light explosion, feathers of light',
    details: 'multiple halos, celestial form'
  },
  {
    stage: 35,
    name: 'Titan Slayer',
    physique: 'colossal power condensed build',
    stance: 'lifting impossible weight pose',
    expression: 'giant slayer defiance',
    effects: 'ground shattering, titan spirits',
    details: 'size-defying presence, mythic bearing'
  },
  {
    stage: 36,
    name: 'Elemental Lord',
    physique: 'elemental fusion transcendent form',
    stance: 'commanding all elements pose',
    expression: 'primordial mastery',
    effects: 'fire water earth air orbiting harmony',
    details: 'body cycling through elements'
  },
  {
    stage: 37,
    name: 'Immortal Champion',
    physique: 'timeless eternal warrior form',
    stance: 'standing across all eras pose',
    expression: 'eternal champion wisdom',
    effects: 'time streams flowing, past future echoes',
    details: 'ageless appearance, temporal marks'
  },
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

// Generation parameters
const GENERATION_PARAMS = {
  width: 128,
  height: 128,
  text_guidance_scale: 8.5,
  no_background: true,
};

// Build the prompt for each stage
function buildPrompt(stage, gender) {
  const charBase = gender === 'female' ? HEROINE_BASE : HERO_BASE;

  return `epic pixel art of ${stage.physique} ${charBase} wearing ${BASE_CLOTHING}, ${stage.stance}, ${stage.expression}, ${stage.details}${stage.effects ? ', ' + stage.effects : ''}, arms and hands clearly visible for equipment overlay, fantasy RPG style, front-facing isometric view, highly detailed 128x128 pixel art, clean silhouette`;
}

// Negative prompt
const NEGATIVE_PROMPT = `blurry, smudged, muddy colors, low contrast, unclear silhouette, messy lines,
distorted anatomy, asymmetric, watermark, signature, text, jpeg artifacts, dull colors, flat shading,
bad proportions, deformed, ugly, cropped, low quality, armor, helmet, weapon, sword, shield,
metal armor, chainmail, plate armor, gauntlets, greaves, pauldrons, cape, cloak,
oversexualized, revealing outfit, covered arms, hidden hands`;

// PixelLab API call function
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

// Save sprite to file
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

// Main generation function
async function generateAllStages(gender = 'male') {
  const prefix = gender === 'female' ? 'heroine' : 'hero';
  const subdir = 'base-evolution';

  console.log(`🚀 Starting ${prefix.toUpperCase()} Base Evolution Generation`);
  console.log(`📊 Total stages to generate: ${EVOLUTION_STAGES.length}`);
  console.log(`⏳ Estimated time: ~${EVOLUTION_STAGES.length * 0.5} minutes\n`);

  const results = { success: [], failed: [] };

  for (let i = 0; i < EVOLUTION_STAGES.length; i++) {
    const stage = EVOLUTION_STAGES[i];
    const prompt = buildPrompt(stage, gender);
    const filename = `${prefix}_base_stage_${stage.stage}_${stage.name.toLowerCase().replace(/ /g, '_')}.png`;

    try {
      const imageData = await generateSprite(prompt, stage.name, stage.stage);
      saveSprite(imageData, filename, subdir);
      results.success.push(stage.name);

      console.log(`📈 Progress: ${i + 1}/${EVOLUTION_STAGES.length} (${Math.round((i + 1) / EVOLUTION_STAGES.length * 100)}%)`);

      // Delay to avoid rate limits
      if (i < EVOLUTION_STAGES.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      results.failed.push({ name: stage.name, error: error.message });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`📊 ${prefix.toUpperCase()} BASE EVOLUTION COMPLETE`);
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${results.success.length}/${EVOLUTION_STAGES.length}`);
  console.log(`❌ Failed: ${results.failed.length}/${EVOLUTION_STAGES.length}`);

  if (results.failed.length > 0) {
    console.log('\n❌ Failed stages:');
    results.failed.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
  }

  return results;
}

// Parse command line args
const args = process.argv.slice(2);
const gender = args.includes('--female') ? 'female' : 'male';
const startStage = args.find(a => a.startsWith('--start='))?.split('=')[1];

// Run generation
if (startStage) {
  console.log(`Starting from stage ${startStage}...`);
  // Could implement resume functionality here
}

generateAllStages(gender).catch(console.error);
