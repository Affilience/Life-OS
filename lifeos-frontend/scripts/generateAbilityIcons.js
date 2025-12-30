/**
 * Generate Elemental Ability Icons using PixelLab API
 * Creates pixel art icons for all combat abilities
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// All abilities organized by element with detailed prompts
const ABILITIES = [
  // === FIRE ===
  { id: 'fireball', element: 'fire', color: '#ff6600', prompt: 'pixel art game icon, blazing fireball spell, orange and red flames swirling into a ball, fire magic, glowing hot center' },
  { id: 'meteor', element: 'fire', color: '#ff6600', prompt: 'pixel art game icon, flaming meteor falling from sky, burning rock with fire trail, impact crater, devastating spell' },
  { id: 'inferno', element: 'fire', color: '#ff6600', prompt: 'pixel art game icon, raging inferno flames, intense fire tornado, burning embers rising, hellfire' },
  { id: 'flame_burst', element: 'fire', color: '#ff6600', prompt: 'pixel art game icon, explosive burst of flames, fire explosion, radial flame blast, combustion' },
  { id: 'blazing_combo', element: 'fire', color: '#ff6600', prompt: 'pixel art game icon, multiple fire strikes, rapid flame attacks, combo fire slashes, burning streaks' },

  // === ICE ===
  { id: 'ice_spike', element: 'ice', color: '#00d4ff', prompt: 'pixel art game icon, sharp ice spike crystal, frozen shard, blue ice spear, frost magic' },
  { id: 'blizzard', element: 'ice', color: '#00d4ff', prompt: 'pixel art game icon, swirling blizzard storm, snowflakes and ice shards, freezing wind, winter storm' },
  { id: 'frost_nova', element: 'ice', color: '#00d4ff', prompt: 'pixel art game icon, expanding ice nova ring, frozen explosion, circular frost wave, cold burst' },
  { id: 'ice_beam', element: 'ice', color: '#00d4ff', prompt: 'pixel art game icon, concentrated ice beam, frozen ray of energy, blue crystal laser, freezing stream' },

  // === LIGHTNING ===
  { id: 'lightning_strike', element: 'lightning', color: '#ffee00', prompt: 'pixel art game icon, powerful lightning bolt striking down, electric thunder, yellow electricity, storm strike' },
  { id: 'chain_lightning', element: 'lightning', color: '#ffee00', prompt: 'pixel art game icon, branching chain lightning, multiple electric arcs, connected bolts, spreading electricity' },
  { id: 'thunder_storm', element: 'lightning', color: '#ffee00', prompt: 'pixel art game icon, massive thunderstorm cloud, multiple lightning bolts, storm cell, electric tempest' },
  { id: 'static_shock', element: 'lightning', color: '#ffee00', prompt: 'pixel art game icon, quick static electricity spark, small electric discharge, yellow spark burst, shock' },

  // === DARK ===
  { id: 'shadow_burst', element: 'dark', color: '#6600cc', prompt: 'pixel art game icon, dark shadow explosion, purple and black energy burst, void magic, dark matter' },
  { id: 'black_hole', element: 'dark', color: '#6600cc', prompt: 'pixel art game icon, swirling black hole vortex, gravity well, purple event horizon, cosmic void consuming light' },
  { id: 'soul_drain', element: 'dark', color: '#6600cc', prompt: 'pixel art game icon, ghostly soul being drained, wispy spirits, life force extraction, necrotic magic' },
  { id: 'void_rift', element: 'dark', color: '#6600cc', prompt: 'pixel art game icon, tearing void rift portal, dimensional crack, purple cosmic tear, space rip' },
  { id: 'dark_tendrils', element: 'dark', color: '#6600cc', prompt: 'pixel art game icon, shadowy tendrils reaching out, dark appendages, grabbing shadows, eldritch tentacles' },

  // === HOLY ===
  { id: 'holy_light', element: 'holy', color: '#ffdd44', prompt: 'pixel art game icon, radiant holy light beam, divine glow, golden rays, sacred brilliance' },
  { id: 'divine_judgment', element: 'holy', color: '#ffdd44', prompt: 'pixel art game icon, divine judgment from heaven, golden angel hand pointing down, holy wrath, celestial decree' },
  { id: 'smite', element: 'holy', color: '#ffdd44', prompt: 'pixel art game icon, smiting holy bolt, golden lightning from above, divine punishment, sacred strike' },
  { id: 'radiant_burst', element: 'holy', color: '#ffdd44', prompt: 'pixel art game icon, radiant golden burst explosion, holy nova, divine light explosion, sacred blast' },
  { id: 'consecrate', element: 'holy', color: '#ffdd44', prompt: 'pixel art game icon, consecrated ground glowing, holy circle on ground, sacred runes, blessed area' },
  { id: 'angels_wrath', element: 'holy', color: '#ffdd44', prompt: 'pixel art game icon, angelic wrath descending, golden wings and sword, divine fury, heavenly retribution' },

  // === EARTH ===
  { id: 'earthquake', element: 'earth', color: '#aa6600', prompt: 'pixel art game icon, ground cracking earthquake, seismic waves, earth splitting, tectonic devastation' },
  { id: 'rock_throw', element: 'earth', color: '#aa6600', prompt: 'pixel art game icon, large boulder being thrown, flying rock, stone projectile, earth magic' },
  { id: 'stone_spike', element: 'earth', color: '#aa6600', prompt: 'pixel art game icon, sharp stone spike erupting from ground, rock spear, earth impalement, stalagmite' },
  { id: 'landslide', element: 'earth', color: '#aa6600', prompt: 'pixel art game icon, massive landslide of rocks, avalanche of boulders, falling earth, mountain collapse' },

  // === WIND ===
  { id: 'wind_slash', element: 'wind', color: '#00ddaa', prompt: 'pixel art game icon, sharp wind slash blade, air cutting arc, green wind streak, razor gust' },
  { id: 'tornado', element: 'wind', color: '#00ddaa', prompt: 'pixel art game icon, powerful tornado funnel, swirling cyclone, devastating twister, wind vortex' },
  { id: 'gale_force', element: 'wind', color: '#00ddaa', prompt: 'pixel art game icon, powerful gale force winds, horizontal wind streams, strong gusts, air blast' },
  { id: 'air_cutter', element: 'wind', color: '#00ddaa', prompt: 'pixel art game icon, razor sharp air blades, multiple wind cuts, slicing gusts, aerial assault' },

  // === WATER ===
  { id: 'water_blast', element: 'water', color: '#0088ff', prompt: 'pixel art game icon, high pressure water blast, hydro cannon, blue water jet, aqua attack' },
  { id: 'tidal_wave', element: 'water', color: '#0088ff', prompt: 'pixel art game icon, massive tidal wave crashing, ocean tsunami, giant water wall, flood wave' },
  { id: 'hydro_pump', element: 'water', color: '#0088ff', prompt: 'pixel art game icon, concentrated hydro pump beam, powerful water stream, pressurized jet, water cannon' },
  { id: 'bubble_storm', element: 'water', color: '#0088ff', prompt: 'pixel art game icon, storm of explosive bubbles, floating water orbs, bubble barrage, aqua spheres' },

  // === POISON ===
  { id: 'poison_cloud', element: 'poison', color: '#88ff00', prompt: 'pixel art game icon, toxic poison gas cloud, green noxious fumes, deadly mist, venomous haze' },
  { id: 'toxic_spit', element: 'poison', color: '#88ff00', prompt: 'pixel art game icon, corrosive acid spit projectile, green toxic glob, venom spray, acid attack' },
  { id: 'venom_spray', element: 'poison', color: '#88ff00', prompt: 'pixel art game icon, snake-like venom spray, poison fangs dripping, toxic stream, deadly venom' },
  { id: 'plague', element: 'poison', color: '#88ff00', prompt: 'pixel art game icon, spreading plague disease, green infection, viral outbreak, pestilence symbol' },

  // === ARCANE ===
  { id: 'arcane_blast', element: 'arcane', color: '#ff44ff', prompt: 'pixel art game icon, pure arcane energy blast, pink and purple magic burst, raw magical power' },
  { id: 'magic_missile', element: 'arcane', color: '#ff44ff', prompt: 'pixel art game icon, homing magic missiles, glowing pink projectiles, seeking arcane bolts' },
  { id: 'arcane_beam', element: 'arcane', color: '#ff44ff', prompt: 'pixel art game icon, concentrated arcane beam, purple laser ray, magical stream, power beam' },
  { id: 'mystic_explosion', element: 'arcane', color: '#ff44ff', prompt: 'pixel art game icon, massive mystic explosion, arcane detonation, purple pink magic nova, spell burst' },

  // === SUPPORT ===
  { id: 'curse', element: 'support', color: '#00ff88', prompt: 'pixel art game icon, dark curse symbol, hex mark, evil eye, debuff rune, weakening spell' },

  // === ULTIMATE ===
  { id: 'supernova', element: 'ultimate', color: '#ff00ff', prompt: 'pixel art game icon, exploding supernova star, cosmic explosion, stellar burst, rainbow nova, ultimate power' },
  { id: 'absolute_zero', element: 'ultimate', color: '#ff00ff', prompt: 'pixel art game icon, absolute zero freeze, complete crystalline ice, frozen in time, ultimate cold' },
  { id: 'divine_storm', element: 'ultimate', color: '#ff00ff', prompt: 'pixel art game icon, divine lightning storm, holy thunder, celestial tempest, godly wrath' },
  { id: 'void_collapse', element: 'ultimate', color: '#ff00ff', prompt: 'pixel art game icon, collapsing void reality, imploding space, dimensional destruction, ultimate void' },
  { id: 'elemental_fury', element: 'ultimate', color: '#ff00ff', prompt: 'pixel art game icon, all elements combined fury, fire ice lightning earth swirling together, ultimate elemental power' },

  // === PHYSICAL ===
  { id: 'power_slash', element: 'physical', color: '#d97757', prompt: 'pixel art game icon, powerful sword slash arc, red energy blade swing, warrior strike' },
  { id: 'cleaving_blow', element: 'physical', color: '#d97757', prompt: 'pixel art game icon, wide cleaving axe swing, horizontal slash, warrior attack arc' },
  { id: 'blade_dance', element: 'physical', color: '#d97757', prompt: 'pixel art game icon, rapid blade dance, multiple sword swings, spinning attack' },
  { id: 'earthshatter', element: 'physical', color: '#d97757', prompt: 'pixel art game icon, ground shattering slam, fist hitting earth, impact crater, seismic punch' },
  { id: 'thunderous_blow', element: 'physical', color: '#d97757', prompt: 'pixel art game icon, thunderous hammer blow, massive strike, shockwave impact' },
  { id: 'berserker_rage', element: 'physical', color: '#d97757', prompt: 'pixel art game icon, berserker rage aura, red fury energy, angry warrior, bloodlust' },
  { id: 'shadow_strike', element: 'physical', color: '#d97757', prompt: 'pixel art game icon, shadow assassin strike, dark dagger attack, stealth hit' },
  { id: 'assassinate', element: 'physical', color: '#d97757', prompt: 'pixel art game icon, lethal assassinate, critical backstab, death strike, instant kill' },

  // === SPIRIT ===
  { id: 'inner_light', element: 'spirit', color: '#57d9d4', prompt: 'pixel art game icon, glowing inner light, soul energy, teal spiritual glow, inner peace' },
  { id: 'serenity_wave', element: 'spirit', color: '#57d9d4', prompt: 'pixel art game icon, calming serenity wave, peaceful energy ripple, teal aura spread' },
  { id: 'meditation_burst', element: 'spirit', color: '#57d9d4', prompt: 'pixel art game icon, meditation energy burst, zen explosion, spiritual release' },
  { id: 'zen_strike', element: 'spirit', color: '#57d9d4', prompt: 'pixel art game icon, balanced zen strike, yin yang attack, perfect harmony hit' },
  { id: 'enlightened_blast', element: 'spirit', color: '#57d9d4', prompt: 'pixel art game icon, enlightenment blast, wisdom explosion, teal cosmic knowledge burst' },
  { id: 'transcendence', element: 'spirit', color: '#57d9d4', prompt: 'pixel art game icon, transcendent form, ascending spirit, ultimate enlightenment, divine transformation' },

  // === FORTUNE ===
  { id: 'golden_strike', element: 'fortune', color: '#d9c157', prompt: 'pixel art game icon, golden strike attack, gold coin impact, wealth damage, gilded hit' },
  { id: 'coin_barrage', element: 'fortune', color: '#d9c157', prompt: 'pixel art game icon, barrage of flying coins, gold coin projectiles, money storm' },
  { id: 'wealth_explosion', element: 'fortune', color: '#d9c157', prompt: 'pixel art game icon, explosion of wealth, gold coins and gems bursting, treasure blast' },
  { id: 'lucky_strike', element: 'fortune', color: '#d9c157', prompt: 'pixel art game icon, lucky four leaf clover strike, fortune attack, lucky hit' },
  { id: 'treasure_blast', element: 'fortune', color: '#d9c157', prompt: 'pixel art game icon, treasure chest exploding, gold diamonds rubies bursting, loot explosion' },
  { id: 'midas_touch', element: 'fortune', color: '#d9c157', prompt: 'pixel art game icon, midas golden touch hand, everything turns to gold, gilded magic' },

  // === CHARM ===
  { id: 'charm_strike', element: 'charm', color: '#e85da1', prompt: 'pixel art game icon, charming heart strike, pink love attack, charm spell' },
  { id: 'inspiring_words', element: 'charm', color: '#e85da1', prompt: 'pixel art game icon, inspiring speech bubble, motivational words, charisma boost' },
  { id: 'rally_cry', element: 'charm', color: '#e85da1', prompt: 'pixel art game icon, rallying battle cry, inspiring shout, pink energy waves' },
  { id: 'social_butterfly', element: 'charm', color: '#e85da1', prompt: 'pixel art game icon, magical pink butterfly, social charm, fluttering spell' },
  { id: 'influence_blast', element: 'charm', color: '#e85da1', prompt: 'pixel art game icon, influence wave blast, social power explosion, charm nova' },
  { id: 'viral_strike', element: 'charm', color: '#e85da1', prompt: 'pixel art game icon, viral spreading attack, social media icon going viral, influence strike' },

  // === TECH ===
  { id: 'gadget_throw', element: 'tech', color: '#7088e8', prompt: 'pixel art game icon, thrown mechanical gadget, gear device projectile, tech throw' },
  { id: 'gear_grind', element: 'tech', color: '#7088e8', prompt: 'pixel art game icon, grinding mechanical gears, cogwheels spinning, industrial attack' },
  { id: 'bomb_toss', element: 'tech', color: '#7088e8', prompt: 'pixel art game icon, thrown bomb explosive, round bomb with fuse, demolition' },
  { id: 'turret_blast', element: 'tech', color: '#7088e8', prompt: 'pixel art game icon, mechanical turret firing, automated gun, tech defense' },
  { id: 'mech_strike', element: 'tech', color: '#7088e8', prompt: 'pixel art game icon, mechanical robot arm punch, mech fist, technological strike' },
  { id: 'invention_overload', element: 'tech', color: '#7088e8', prompt: 'pixel art game icon, overloading inventions exploding, tech overcharge, mechanical chaos' },
];

async function generate(prompt, color) {
  const fullPrompt = `${prompt}, 64x64 game ability icon, detailed pixel art, glowing ${color} color theme, transparent background`;

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: fullPrompt,
      negative_description: 'blurry, low quality, text, watermark, logo, realistic, photo',
      image_size: { width: 64, height: 64 },
      text_guidance_scale: 10,
      no_background: true,
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err}`);
  }

  const data = await res.json();
  return {
    image: data.image.base64.replace(/^data:image\/png;base64,/, ''),
    cost: data.usage?.usd || 0
  };
}

async function main() {
  console.log('═'.repeat(50));
  console.log('  GENERATING ELEMENTAL ABILITY ICONS');
  console.log(`  Total abilities: ${ABILITIES.length}`);
  console.log('═'.repeat(50));
  console.log('');

  const outputDir = path.join(__dirname, '../public/assets/abilities');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let totalCost = 0;
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < ABILITIES.length; i++) {
    const ability = ABILITIES[i];
    const filename = `${ability.id}.png`;
    const outputPath = path.join(outputDir, filename);

    // Skip if already exists
    if (fs.existsSync(outputPath)) {
      console.log(`[${i + 1}/${ABILITIES.length}] ⏭️  Skipping ${ability.id} (already exists)`);
      continue;
    }

    console.log(`[${i + 1}/${ABILITIES.length}] 🎨 Generating ${ability.id} (${ability.element})...`);

    try {
      const result = await generate(ability.prompt, ability.color);
      fs.writeFileSync(outputPath, Buffer.from(result.image, 'base64'));
      totalCost += result.cost;
      successCount++;
      console.log(`   ✅ Saved: ${filename} ($${result.cost.toFixed(4)})`);

      // Rate limit - wait between requests
      await new Promise(r => setTimeout(r, 1500));
    } catch (e) {
      failCount++;
      console.log(`   ❌ Error: ${e.message}`);
      // Continue with next ability even if one fails
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log('');
  console.log('═'.repeat(50));
  console.log('  GENERATION COMPLETE!');
  console.log(`  Success: ${successCount} | Failed: ${failCount}`);
  console.log(`  Total cost: $${totalCost.toFixed(4)}`);
  console.log('═'.repeat(50));
}

main();
