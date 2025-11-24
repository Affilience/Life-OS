/**
 * Hero Evolution Sprite Generator V3 - Stages 18-40 Only
 * Generates remaining 23 HIGHLY DETAILED character sprites
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Character continuity - ALWAYS included
const CHARACTER_BASE = `athletic male hero with short brown hair and brown eyes`;

// Stages 18-40 Only
const EVOLUTION_STAGES = [
  {
    level: 18,
    name: 'Battlemage',
    description: `epic pixel art of ${CHARACTER_BASE} wearing arcane battle armor - steel plates with glowing purple rune circuits, enchanted sword blazing with elemental fire in right hand, left hand casting lightning spell with magical circle, mage-knight helmet with crystal visor, spellblade combat pose - sword and magic combined, battle wizard aesthetic, multiple elemental auras swirling, magical runes floating, isometric view, highly detailed 128x128 pixel art`,
    style: { detail: 'highly detailed', shading: 'detailed shading', outline: 'single color outline' }
  },
  {
    level: 19,
    name: 'Champion',
    description: `epic pixel art of ${CHARACTER_BASE} wearing legendary tournament armor - golden steel with diamond embellishments, champion's greatsword with victory ribbons, ornate tower shield with tournament crests, golden laurel crown, victorious champion pose - sword raised in triumph, tournament victor aesthetic, golden confetti falling, crowd cheers energy, victory aura blazing, isometric view, highly detailed 128x128 pixel art`,
    style: { detail: 'highly detailed', shading: 'detailed shading', outline: 'single color outline' }
  },
  {
    level: 20,
    name: 'Veteran',
    description: `epic pixel art of ${CHARACTER_BASE} wearing war-scarred plate armor covered in battle damage and repair marks, legendary notched greatsword with blood groove, cracked shield with hundred battle marks, helmet with broken horn, grizzled veteran pose - sword resting on shoulder, battle-worn aesthetic, scars glowing with earned power, spectral echoes of past battles, isometric view, highly detailed 128x128 pixel art`,
    style: { detail: 'highly detailed', shading: 'detailed shading', outline: 'single color outline' }
  },
  {
    level: 21,
    name: 'Blade Master',
    description: `epic pixel art of ${CHARACTER_BASE} wearing transcendent silver armor flowing like liquid metal, legendary katana with blade made of pure light energy, second blade sheathed glowing, master's meditation stance - blade drawn in perfect form, blade saint aesthetic, silver-blue energy blade trails, reality-cutting sword aura, cherry blossoms of light, isometric view, highly detailed 128x128 pixel art`,
    style: { detail: 'highly detailed', shading: 'detailed shading', outline: 'single color outline' }
  },
  {
    level: 22,
    name: 'War Chief',
    description: `epic pixel art of ${CHARACTER_BASE} wearing tribal warlord armor - dragon bone pauldrons with skulls, massive totem staff crackling with ancestral spirits, war paint glowing with tribal magic, chieftain's headdress with feathers and horns, commanding pose - staff planted rallying warriors, tribal commander aesthetic, spirit animals circling, war drums energy, ancestral ghosts rising, isometric view, highly detailed 128x128 pixel art`,
    style: { detail: 'highly detailed', shading: 'detailed shading', outline: 'single color outline' }
  },
  {
    level: 23,
    name: 'Dragon Knight',
    description: `epic pixel art of ${CHARACTER_BASE} wearing armor forged from red dragon scales with molten veins, dragonbone greatsword wreathed in eternal flames, dragon skull pauldrons breathing fire, horned dragon helm with fire in eye sockets, dragon slayer pose - sword thrust skyward, dragonborn aesthetic, dragon spirit coiling around body, flames and scales falling, dragon roar energy, isometric view, highly detailed 128x128 pixel art`,
    style: { detail: 'highly detailed', shading: 'detailed shading', outline: 'single color outline' }
  },
  {
    level: 24,
    name: 'Shadow Master',
    description: `epic pixel art of ${CHARACTER_BASE} wearing ethereal shadow armor that phases between dimensions, twin void blades made of solidified darkness, dark matter cloak billowing with galaxies, shadowy crown with dark stars, interdimensional stance - half-phased between realities, void walker aesthetic, purple-black shadow portals opening, reality tears around form, darkness bleeding from edges, isometric view, highly detailed 128x128 pixel art`,
    style: { detail: 'highly detailed', shading: 'detailed shading', outline: 'single color outline' }
  },
  {
    level: 25,
    name: 'Holy Crusader',
    description: `epic pixel art of ${CHARACTER_BASE} wearing blindingly radiant golden-white plate armor with angel wing motifs, divine flaming sword of judgment, massive shield with seraphim face, golden halo with multiple rings, crusader pose - leading divine charge, holy champion aesthetic, divine explosion of light, angelic wings manifesting, heavenly trumpets energy, holy fire consuming darkness, isometric view, highly detailed 128x128 pixel art`,
    style: { detail: 'highly detailed', shading: 'detailed shading', outline: 'single color outline' }
  },
  {
    level: 26,
    name: 'Arcane Warrior',
    description: `epic pixel art of ${CHARACTER_BASE} wearing crystalline arcane armor covered in constantly shifting rune patterns, spellblade sword with elemental orb in pommel cycling through elements, floating arcane tomes orbiting body, wizard's crown with star gems, spellsword stance - casting while striking, arcane knight aesthetic, rainbow magical energy spiraling, spell circles layered, reality bending with power, isometric view, highly detailed 128x128 pixel art`,
    style: { detail: 'highly detailed', shading: 'detailed shading', outline: 'single color outline' }
  },
  {
    level: 27,
    name: 'Beast Master',
    description: `epic pixel art of ${CHARACTER_BASE} wearing primal nature armor made of living wood and vines, staff crowned with glowing nature crystal, spectral animal companions (wolf, bear, eagle) manifested around body, druidic crown of antlers with flowers, primal harmony pose - communing with beasts, nature lord aesthetic, animals made of green energy, forest magic swirling, life energy blooming, isometric view, highly detailed 128x128 pixel art`,
    style: { detail: 'highly detailed', shading: 'detailed shading', outline: 'single color outline' }
  },
  {
    level: 28,
    name: 'Demon Hunter',
    description: `epic pixel art of ${CHARACTER_BASE} wearing demon-forged black and red armor with demonic trophies, twin runic demon-slaying swords burning with holy-hellfire, chains with rune seals wrapped around arms, blind-fold with glowing third eye, demon slayer pose - blades crossed ready, hell hunter aesthetic, green fel flames and holy fire mixing, demon souls trapped in weapons, runes blazing, isometric view, highly detailed 128x128 pixel art`,
    style: { detail: 'highly detailed', shading: 'detailed shading', outline: 'single color outline' }
  },
  {
    level: 29,
    name: 'Storm Lord',
    description: `epic pixel art of ${CHARACTER_BASE} wearing armor made of living lightning and storm clouds, thunder hammer crackling with constant electricity, storm crystal embedded in chest piece channeling tempest, crown of lightning bolts, storm caller pose - hammer raised summoning tornado, tempest master aesthetic, lightning bolts striking ground, storm clouds swirling, wind and rain spiraling, thunder energy radiating, isometric view, highly detailed 128x128 pixel art`,
    style: { detail: 'highly detailed', shading: 'detailed shading', outline: 'single color outline' }
  },
  {
    level: 30,
    name: 'Warlord',
    description: `epic pixel art of ${CHARACTER_BASE} wearing supreme commander's blood-red plate armor with golden war banners, legendary war banner staff with realm flags, crown of conquest with multiple kingdom symbols, cape made of defeated kingdom banners, conqueror pose - banner planted claiming territory, supreme commander aesthetic, army phantoms behind rallying, war drums thunder, conquest energy, kingdom banners flying, isometric view, highly detailed 128x128 pixel art`,
    style: { detail: 'highly detailed', shading: 'detailed shading', outline: 'single color outline' }
  },
  {
    level: 31,
    name: 'Sword Saint',
    description: `epic pixel art of ${CHARACTER_BASE} transcending into divine sword master wearing radiant white-gold armor made of solidified light, blade of pure cosmic energy that cuts through dimensions, multiple phantom blades orbiting, enlightened master pose - achieving sword nirvana, transcendent blade master aesthetic, light rays piercing heavens, sword made of condensed starlight, reality splits with blade movements, isometric view, highly detailed 128x128 pixel art`,
    style: { detail: 'highly detailed', shading: 'detailed shading', outline: 'single color outline' }
  },
  {
    level: 32,
    name: 'Phoenix Knight',
    description: `epic pixel art of ${CHARACTER_BASE} wearing living flame armor with phoenix feather patterns, immortal fire blade eternally burning, wings of pure phoenix fire manifesting, crown of eternal flames, rebirth pose - rising from ashes, phoenix warrior aesthetic, orange-red flames never dying, phoenix spirit form overhead, ash and embers swirling, resurrection energy, isometric view, highly detailed 128x128 pixel art`,
    style: { detail: 'highly detailed', shading: 'detailed shading', outline: 'single color outline' }
  },
  {
    level: 33,
    name: 'Void Stalker',
    description: `epic pixel art of ${CHARACTER_BASE} becoming one with the void wearing armor made of dark matter and anti-light, void blade that absorbs reality, half-body phasing into nothingness, void crown with black hole center, dimensional walker pose - stepping between realities, void entity aesthetic, purple-black void energy consuming surroundings, pocket dimensions opening, existence fading, gravity distorting, isometric view, highly detailed 128x128 pixel art`,
    style: { detail: 'highly detailed', shading: 'detailed shading', outline: 'single color outline' }
  },
  {
    level: 34,
    name: 'Celestial Guardian',
    description: `epic pixel art of ${CHARACTER_BASE} ascending to angel warrior wearing gleaming celestial armor with six radiant wings of light, divine sword and shield made of condensed starlight, halo of multiple golden rings, guardian angel pose - wings spread protecting, heavenly protector aesthetic, divine light explosion, angelic feathers of pure light falling, protective barrier shields manifesting, celestial realm opening above, isometric view, highly detailed 128x128 pixel art`,
    style: { detail: 'highly detailed', shading: 'detailed shading', outline: 'single color outline' }
  },
  {
    level: 35,
    name: 'Titan Slayer',
    description: `epic pixel art of ${CHARACTER_BASE} wielding titan-killer power wearing colossal armor made from slain titan's bones, impossibly massive sword larger than self glowing with giant-slaying runes, titan skull pauldrons, god-killer stance - lifting impossible weapon overhead, giant slayer aesthetic, size-defying weapon aura, ground shattering beneath weight, titan spirits chained to blade, reality cracking, isometric view, highly detailed 128x128 pixel art`,
    style: { detail: 'highly detailed', shading: 'detailed shading', outline: 'single color outline' }
  },
  {
    level: 36,
    name: 'Elemental Lord',
    description: `epic pixel art of ${CHARACTER_BASE} commanding all elements wearing armor that cycles through fire, water, earth, and air, staff channeling all four elements simultaneously creating primordial chaos, crown with four elemental gems, elemental fusion pose - all elements spiraling, primordial master aesthetic, fire water earth air orbiting in perfect harmony, elemental chaos and order, natural disasters converging, isometric view, highly detailed 128x128 pixel art`,
    style: { detail: 'highly detailed', shading: 'detailed shading', outline: 'single color outline' }
  },
  {
    level: 37,
    name: 'Immortal Champion',
    description: `epic pixel art of ${CHARACTER_BASE} achieving eternal warrior state wearing timeless armor covered in glowing eternal runes that never fade, ageless sword that exists in all time periods simultaneously, time crystal embedded in chest, eternal crown, timeless warrior pose - standing across all eras, immortal champion aesthetic, time streams flowing around body, past and future selves as echoes, clock faces and hourglasses floating, temporal energy, isometric view, highly detailed 128x128 pixel art`,
    style: { detail: 'highly detailed', shading: 'detailed shading', outline: 'single color outline' }
  },
  {
    level: 38,
    name: 'Godslayer',
    description: `epic pixel art of ${CHARACTER_BASE} wielding deicide power wearing armor forged from slain gods' divine essence, godkiller blade crackling with stolen divinity, fragments of shattered halos orbiting, broken divine crown repurposed, god-killing stance - blade piercing heavens, divine slayer aesthetic, divine blood dripping from weapon, shattered god essences swirling, divine thunder and destruction, pantheon-ending energy, isometric view, highly detailed 128x128 pixel art`,
    style: { detail: 'highly detailed', shading: 'detailed shading', outline: 'single color outline' }
  },
  {
    level: 39,
    name: 'Ascendant',
    description: `epic pixel art of ${CHARACTER_BASE} transcending physical form - body becoming semi-transparent energy, armor made of pure condensed essence and cosmos, weapon is a manifestation of will itself shifting forms, multiple arms of light holding different aspects of power, enlightenment pose - levitating in meditation, transcendent being aesthetic, body dissolving into rainbow cosmic energy, chakras fully opened blazing, astral projection, mortal shell fading, isometric view, highly detailed 128x128 pixel art`,
    style: { detail: 'highly detailed', shading: 'detailed shading', outline: 'single color outline' }
  },
  {
    level: 40,
    name: 'Avatar of Mastery',
    description: `epic pixel art of ${CHARACTER_BASE} achieving ultimate perfection - wearing armor that is the perfect fusion of every path traveled, wielding a weapon of absolute balance containing all elements and powers, surrounded by manifestations of every mastered ability, multiple energy auras in perfect harmony, ultimate master pose - sitting in throne of achievement, absolute perfection aesthetic, golden divine light of completion, rainbow cosmic energy of all powers combined, reality bowing in acknowledgment, universe-ending and universe-creating power in balance, isometric view, highly detailed 128x128 pixel art`,
    style: { detail: 'highly detailed', shading: 'detailed shading', outline: 'single color outline' }
  },
];

// Generation parameters
const GENERATION_PARAMS = {
  width: 128,
  height: 128,
  text_guidance_scale: 8.5,
  no_background: true,
};

// Negative prompt
const NEGATIVE_PROMPT = `blurry, smudged, muddy colors, low contrast, unclear silhouette, messy lines,
distorted anatomy, asymmetric, watermark, signature, text, jpeg artifacts, dull colors, flat shading,
bad proportions, deformed, ugly, cropped, low quality, normal quality, worst quality,
different person, female, woman, girl, long hair, blonde hair, red hair, black hair, different hair color, different face, different character`;

// PixelLab API call function
async function generateSprite(description, styleName, level) {
  console.log(`\n🎨 Generating Stage ${level}: ${styleName}`);
  console.log(`📝 Prompt: ${description.substring(0, 100)}...`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: description,
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

    console.log(`💰 Cost: $${data.usage.usd.toFixed(4)}`);

    // Extract base64 image data
    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');

    return base64Data;
  } catch (error) {
    console.error(`❌ Failed to generate ${styleName}:`, error.message);
    throw error;
  }
}

// Save sprite to file
function saveSprite(base64Data, filename) {
  const buffer = Buffer.from(base64Data, 'base64');
  const outputPath = path.join(__dirname, '..', 'dist', 'assets', 'avatar', 'evolution', filename);

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, buffer);

  // Also copy to public directory
  const publicPath = path.join(__dirname, '..', 'public', 'assets', 'avatar', 'evolution', filename);
  const publicDir = path.dirname(publicPath);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(publicPath, buffer);

  console.log(`✅ Saved: ${filename}`);
}

// Main generation function
async function generateAllStages() {
  console.log('🚀 Starting Hero Evolution V3 Generation - Stages 18-40');
  console.log(`📊 Total stages to generate: ${EVOLUTION_STAGES.length}`);
  console.log('⏳ Estimated time: ~8-10 minutes\n');

  const results = {
    success: [],
    failed: []
  };

  for (let i = 0; i < EVOLUTION_STAGES.length; i++) {
    const stage = EVOLUTION_STAGES[i];
    const filename = `hero_v3_stage_${stage.level}_${stage.name.toLowerCase().replace(/\s+/g, '_')}.png`;

    try {
      const imageData = await generateSprite(stage.description, stage.name, stage.level);
      saveSprite(imageData, filename);
      results.success.push(stage.name);

      // Progress update
      console.log(`📈 Progress: ${i + 1}/${EVOLUTION_STAGES.length} (${Math.round((i + 1) / EVOLUTION_STAGES.length * 100)}%)`);

      // Small delay to avoid rate limits
      if (i < EVOLUTION_STAGES.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ Failed: ${stage.name}`, error.message);
      results.failed.push({ name: stage.name, error: error.message });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 GENERATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${results.success.length}/${EVOLUTION_STAGES.length}`);
  console.log(`❌ Failed: ${results.failed.length}/${EVOLUTION_STAGES.length}`);

  if (results.failed.length > 0) {
    console.log('\n❌ Failed stages:');
    results.failed.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
  }

  console.log('\n💾 Sprites saved to: dist/assets/avatar/evolution/ and public/assets/avatar/evolution/');
  console.log('🎉 Stages 18-40 generation complete!\n');
}

// Run generation
generateAllStages().catch(console.error);
