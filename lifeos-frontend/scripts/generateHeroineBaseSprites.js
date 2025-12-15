/**
 * Heroine Base Evolution Sprite Generator
 * Generates 40 base female character sprites WITHOUT armor/weapons
 * For equipment overlay system
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

const BASE_CLOTHING = 'simple sleeveless brown tunic and cloth pants, leather belt, leather sandals';
const HEROINE_BASE = 'female warrior with long brown hair in ponytail and brown eyes';

const EVOLUTION_STAGES = [
  // ACT I: THE AWAKENING (1-10)
  { stage: 1, name: 'Dreamer', physique: 'young and slender', stance: 'humble standing pose with hands at sides', expression: 'hopeful eyes looking slightly upward', effects: '', details: 'clean unblemished skin, youthful face' },
  { stage: 2, name: 'Seeker', physique: 'lean and agile', stance: 'alert standing pose, weight on front foot', expression: 'curious determined gaze', effects: '', details: 'windswept hair, traveler weathering on skin' },
  { stage: 3, name: 'Recruit', physique: 'developing muscle tone', stance: 'disciplined military attention stance', expression: 'focused serious look', effects: '', details: 'fresh minor training bruises' },
  { stage: 4, name: 'Trainee', physique: 'athletic build forming', stance: 'combat-ready stance, fists raised', expression: 'intense concentration', effects: '', details: 'sweat on brow, training calluses on hands' },
  { stage: 5, name: 'Squire', physique: 'fit and toned', stance: 'respectful kneeling pose, head bowed slightly', expression: 'humble determination', effects: 'faint light from above', details: 'clean and groomed appearance' },
  { stage: 6, name: 'Initiate', physique: 'strong athletic build', stance: 'ceremonial salute pose, arm across chest', expression: 'solemn pride', effects: 'subtle divine light rays', details: 'blessed marking on forehead' },
  { stage: 7, name: 'Footman', physique: 'soldier build, broad shoulders', stance: 'firm planted stance, ready for battle', expression: 'steely resolve', effects: '', details: 'minor battle scars, weathered skin' },
  { stage: 8, name: 'Scout', physique: 'lean and wiry, built for speed', stance: 'crouched stealth pose, alert', expression: 'sharp watchful eyes', effects: 'faint forest energy wisps', details: 'camouflage paint marks on face' },
  { stage: 9, name: 'Warrior', physique: 'powerful athletic build', stance: 'battle stance, weight centered', expression: 'fierce warrior gaze', effects: 'subtle battle aura', details: 'battle scars on arms' },
  { stage: 10, name: 'Swordsman', physique: 'refined warrior physique', stance: 'sword form stance, hands positioned', expression: 'focused blade mastery', effects: 'faint blade energy', details: 'calloused hands, confident bearing' },

  // ACT II: THE TRIALS (11-20)
  { stage: 11, name: 'Duelist', physique: 'graceful athletic build', stance: 'fencing stance, poised', expression: 'calculated precision', effects: 'speed blur lines', details: 'elegant but deadly presence' },
  { stage: 12, name: 'Berserker', physique: 'raw powerful muscle', stance: 'aggressive forward stance', expression: 'controlled rage', effects: 'red battle fury aura', details: 'war paint, wild hair' },
  { stage: 13, name: 'Knight', physique: 'noble warrior build', stance: 'chivalric salute pose', expression: 'honor and duty', effects: 'golden honor glow', details: 'noble bearing, clean-cut' },
  { stage: 14, name: 'Ranger', physique: 'lean wilderness build', stance: 'hunter tracking pose', expression: 'nature communion', effects: 'green nature wisps', details: 'wilderness adapted, leaf patterns' },
  { stage: 15, name: 'Paladin', physique: 'powerful holy warrior build', stance: 'shield raised, divine light pose', expression: 'righteous determination', effects: 'divine golden aura, holy light rays', details: 'blessed markings on arms, radiant skin' },
  { stage: 16, name: 'Monk', physique: 'lean defined muscle, perfect form', stance: 'one-legged crane stance, arms balanced', expression: 'inner peace mastery', effects: 'chi energy flowing, leaves floating', details: 'prayer beads on wrist, meditation calm' },
  { stage: 17, name: 'Assassin', physique: 'shadow-lean deadly build', stance: 'silent killer crouch, hands ready', expression: 'cold calculating killer gaze', effects: 'shadow wisps, darkness gathering', details: 'hidden blade scars, dark tattoos' },
  { stage: 18, name: 'Battlemage', physique: 'warrior-mage hybrid build', stance: 'spell-sword hybrid stance, magic in hands', expression: 'arcane warrior focus', effects: 'fire and lightning crackling around hands', details: 'rune tattoos glowing, magic-scarred skin' },
  { stage: 19, name: 'Champion', physique: 'peak athletic perfection', stance: 'victory pose, arms triumphant', expression: 'unshakeable confidence', effects: 'crowd cheering energy, golden glow', details: 'medals of honor, winning aura' },
  { stage: 20, name: 'Veteran', physique: 'battle-hardened powerful build', stance: 'weary but unbroken stance', expression: 'thousand-yard stare wisdom', effects: 'spectral battle echoes', details: 'many scars, greying temples, weathered' },

  // ACT III: MASTERY (21-30)
  { stage: 21, name: 'Blade Master', physique: 'transcendent warrior physique', stance: 'perfect blade form stance, hands positioned', expression: 'blade saint enlightenment', effects: 'silver-blue energy trails, cherry blossoms', details: 'serene master appearance' },
  { stage: 22, name: 'War Chief', physique: 'commanding tribal leader build', stance: 'chieftain commanding pose', expression: 'ancestral power gaze', effects: 'spirit animals circling, ancestral ghosts', details: 'tribal markings glowing, feathers in hair' },
  { stage: 23, name: 'Dragon Knight', physique: 'dragon-touched powerful build', stance: 'dragonborn power stance', expression: 'dragon fire in eyes', effects: 'flames wreathing body, dragon spirit', details: 'scale patterns on skin, horns forming' },
  { stage: 24, name: 'Shadow Master', physique: 'ethereal shadow-infused form', stance: 'phasing between dimensions pose', expression: 'void walker gaze', effects: 'purple-black void portals, reality tears', details: 'body partially transparent, star patterns' },
  { stage: 25, name: 'Holy Crusader', physique: 'divine warrior radiant build', stance: 'crusader charge pose', expression: 'holy wrath determination', effects: 'blinding divine light, angel wings forming', details: 'glowing halo, divine markings' },
  { stage: 26, name: 'Arcane Warrior', physique: 'magic-infused warrior build', stance: 'spellblade combat stance', expression: 'arcane mastery focus', effects: 'rainbow magical energy, spell circles', details: 'crystalline patterns on skin, glowing eyes' },
  { stage: 27, name: 'Beast Master', physique: 'primal nature-bonded build', stance: 'communing with beasts pose', expression: 'wild nature harmony', effects: 'spectral animals manifesting, forest magic', details: 'antler crown forming, vine patterns' },
  { stage: 28, name: 'Demon Hunter', physique: 'demon-touched hunter build', stance: 'demon slayer stance', expression: 'burning third eye gaze', effects: 'holy-hellfire mix, demon souls swirling', details: 'blindfold with glowing eye, runic scars' },
  { stage: 29, name: 'Storm Lord', physique: 'tempest-infused powerful build', stance: 'storm summoning pose, arms raised', expression: 'tempest master command', effects: 'lightning crackling, storm clouds swirling', details: 'electricity in veins, wind-swept' },
  { stage: 30, name: 'Warlord', physique: 'supreme commander imposing build', stance: 'conqueror claiming pose', expression: 'absolute authority', effects: 'army phantoms behind, conquest energy', details: 'crown of power forming, regal bearing' },

  // ACT IV: LEGEND (31-40)
  { stage: 31, name: 'Sword Saint', physique: 'transcendent light-infused form', stance: 'achieving sword nirvana pose', expression: 'divine enlightenment', effects: 'phantom blades orbiting, reality splits', details: 'body becoming light, serene transcendence' },
  { stage: 32, name: 'Phoenix Knight', physique: 'immortal flame-infused build', stance: 'rising from ashes pose', expression: 'eternal rebirth determination', effects: 'phoenix fire wings, ash and embers', details: 'flame patterns on skin, burning eyes' },
  { stage: 33, name: 'Void Stalker', physique: 'void-merged ethereal form', stance: 'stepping between realities pose', expression: 'cosmic void gaze', effects: 'dark matter aura, existence fading', details: 'body phasing, galaxy patterns visible' },
  { stage: 34, name: 'Celestial Guardian', physique: 'angelic transcendent form', stance: 'six wings spread protecting pose', expression: 'heavenly protector serenity', effects: 'divine light explosion, feathers of light', details: 'multiple halos, celestial form' },
  { stage: 35, name: 'Titan Slayer', physique: 'colossal power condensed build', stance: 'lifting impossible weight pose', expression: 'giant slayer defiance', effects: 'ground shattering, titan spirits', details: 'size-defying presence, mythic bearing' },
  { stage: 36, name: 'Elemental Lord', physique: 'elemental fusion transcendent form', stance: 'commanding all elements pose', expression: 'primordial mastery', effects: 'fire water earth air orbiting harmony', details: 'body cycling through elements' },
  { stage: 37, name: 'Immortal Champion', physique: 'timeless eternal warrior form', stance: 'standing across all eras pose', expression: 'eternal champion wisdom', effects: 'time streams flowing, past future echoes', details: 'ageless appearance, temporal marks' },
  { stage: 38, name: 'Godslayer', physique: 'deicide power radiating build', stance: 'piercing heavens pose', expression: 'divine slayer determination', effects: 'stolen divinity crackling, shattered halos', details: 'god-blood marks, broken divine essence' },
  { stage: 39, name: 'Ascendant', physique: 'semi-transparent energy form', stance: 'levitating meditation pose', expression: 'transcendent being enlightenment', effects: 'rainbow cosmic energy, chakras blazing', details: 'mortal shell fading, pure energy visible' },
  { stage: 40, name: 'Avatar of Mastery', physique: 'perfect fusion ultimate form', stance: 'throne of achievement pose', expression: 'absolute perfection serenity', effects: 'all powers combined, universe bowing', details: 'golden completion light, reality acknowledging' },
];

function buildPrompt(stage) {
  return `epic pixel art of ${stage.physique} ${HEROINE_BASE} wearing ${BASE_CLOTHING}, ${stage.stance}, ${stage.expression}, ${stage.details}${stage.effects ? ', ' + stage.effects : ''}, arms and hands clearly visible for equipment overlay, fantasy RPG style, front-facing isometric view, highly detailed 128x128 pixel art, clean silhouette`;
}

const NEGATIVE_PROMPT = `blurry, smudged, muddy colors, low contrast, unclear silhouette, messy lines,
distorted anatomy, asymmetric, watermark, signature, text, jpeg artifacts, dull colors, flat shading,
bad proportions, deformed, ugly, cropped, low quality, armor, helmet, weapon, sword, shield,
metal armor, chainmail, plate armor, gauntlets, greaves, pauldrons, cape, cloak,
oversexualized, revealing outfit, covered arms, hidden hands, male`;

async function generateSprite(prompt, name, stage) {
  console.log(`\n🎨 Generating Stage ${stage}: ${name}`);
  console.log(`📝 Prompt: ${prompt.substring(0, 80)}...`);

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: prompt,
      negative_description: NEGATIVE_PROMPT,
      image_size: { width: 128, height: 128 },
      text_guidance_scale: 8.5,
      no_background: true,
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`💰 Cost: $${data.usage?.usd?.toFixed(4) || 'N/A'}`);
  return data.image.base64.replace(/^data:image\/png;base64,/, '');
}

function saveSprite(base64Data, filename) {
  const outputPath = path.join(__dirname, '..', 'public', 'assets', 'avatar', 'base-evolution', filename);
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outputPath, Buffer.from(base64Data, 'base64'));
  console.log(`✅ Saved: base-evolution/${filename}`);
}

async function generateAll() {
  console.log('🚀 HEROINE BASE EVOLUTION GENERATION');
  console.log('=====================================');
  console.log(`📊 Total: ${EVOLUTION_STAGES.length} stages`);
  console.log('⏳ Using 5s delay to avoid rate limiting\n');

  const results = { success: [], failed: [] };

  for (let i = 0; i < EVOLUTION_STAGES.length; i++) {
    const stage = EVOLUTION_STAGES[i];
    const prompt = buildPrompt(stage);
    const filename = `heroine_base_stage_${stage.stage}_${stage.name.toLowerCase().replace(/ /g, '_')}.png`;

    try {
      const imageData = await generateSprite(prompt, stage.name, stage.stage);
      saveSprite(imageData, filename);
      results.success.push(stage.name);
      console.log(`📈 Progress: ${i + 1}/${EVOLUTION_STAGES.length} (${Math.round((i + 1) / EVOLUTION_STAGES.length * 100)}%)`);

      if (i < EVOLUTION_STAGES.length - 1) {
        console.log('⏳ Waiting 5 seconds...');
        await new Promise(r => setTimeout(r, 5000));
      }
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
      results.failed.push({ name: stage.name, error: error.message });
      await new Promise(r => setTimeout(r, 10000));
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 HEROINE GENERATION COMPLETE');
  console.log(`✅ Success: ${results.success.length}/${EVOLUTION_STAGES.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  if (results.failed.length > 0) {
    console.log('\nFailed stages:');
    results.failed.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
  }
}

generateAll().catch(console.error);
