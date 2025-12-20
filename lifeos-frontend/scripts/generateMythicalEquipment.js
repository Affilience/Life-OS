import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Mythical Equipment - Epic and Legendary tier items
const MYTHICAL_EQUIPMENT = {
  // MYTHICAL CHEST PIECES - Face-on 2D view
  chests: [
    {
      id: 'void_platemail',
      name: 'Void Platemail',
      prompt: 'dark purple void chestplate armor, front facing view flat 2D, ethereal shadow wisps, glowing purple runes carved into dark metal, ornate gothic design, epic fantasy RPG armor piece, isolated item, transparent background, pixel art style, 64x64',
      negative: 'character, person, wearing, mannequin, full body, helmet, legs, arms, side view, back view, 3D, isometric, angled',
    },
    {
      id: 'crystal_aegis',
      name: 'Crystal Aegis Armor',
      prompt: 'crystalline ice armor chestplate, front facing view flat 2D, glowing cyan frost crystals embedded, silver metal with frozen patterns, elegant winter design, epic fantasy RPG armor piece, isolated item, transparent background, pixel art style, 64x64',
      negative: 'character, person, wearing, mannequin, full body, helmet, legs, side view, back view, 3D, isometric',
    },
    {
      id: 'celestial_raiment',
      name: 'Celestial Raiment',
      prompt: 'golden divine celestial chestplate armor, front facing view flat 2D, white angelic wing motifs, holy radiant golden glow, divine symbols, legendary fantasy RPG armor, isolated item, transparent background, pixel art style, 64x64',
      negative: 'character, person, wearing, mannequin, full body, helmet, legs, angel, side view, 3D, isometric',
    },
    {
      id: 'abyssal_cuirass',
      name: 'Abyssal Cuirass',
      prompt: 'deep sea dark blue armor chestplate, front facing view flat 2D, glowing teal bioluminescent patterns, eldritch tentacle ornaments, oceanic coral details, legendary fantasy RPG armor, isolated item, transparent background, pixel art style, 64x64',
      negative: 'character, person, wearing, mannequin, full body, helmet, legs, fish, creature, side view, 3D, isometric',
    },
    {
      id: 'stormforged_breastplate',
      name: 'Stormforged Breastplate',
      prompt: 'electrified steel chestplate armor, front facing view flat 2D, crackling blue lightning bolt patterns, storm cloud dark silver metal, glowing electric runes, epic fantasy RPG armor, isolated item, transparent background, pixel art style, 64x64',
      negative: 'character, person, wearing, mannequin, full body, helmet, legs, clouds, side view, 3D, isometric',
    },
    {
      id: 'infernal_harness',
      name: 'Infernal Harness',
      prompt: 'demonic fire chestplate armor, front facing view flat 2D, burning ember cracks, molten lava veins glowing orange, dark obsidian metal, hellfire design, legendary fantasy RPG armor, isolated item, transparent background, pixel art style, 64x64',
      negative: 'character, person, wearing, mannequin, full body, helmet, legs, demon, side view, 3D, isometric',
    },
  ],

  // MYTHICAL LEG ARMOR - Face-on 2D view
  legs: [
    {
      id: 'void_greaves',
      name: 'Void Greaves',
      prompt: 'dark purple void leg armor greaves, front facing view flat 2D, shadow tendrils, glowing purple runes on dark metal, gothic design, epic fantasy RPG leg armor piece, isolated item, transparent background, pixel art style, 64x64',
      negative: 'character, person, wearing, full body, torso, helmet, side view, back view, 3D, isometric, angled',
    },
    {
      id: 'crystal_legguards',
      name: 'Crystal Legguards',
      prompt: 'crystalline ice leg armor, front facing view flat 2D, embedded cyan frost crystals, silver frozen metal legguards, winter design, epic fantasy RPG armor, isolated item, transparent background, pixel art style, 64x64',
      negative: 'character, person, wearing, full body, torso, helmet, side view, 3D, isometric',
    },
    {
      id: 'celestial_tassets',
      name: 'Celestial Tassets',
      prompt: 'golden divine leg armor tassets, front facing view flat 2D, holy white light glow, angelic feather motifs, radiant golden metal, legendary fantasy RPG armor, isolated item, transparent background, pixel art style, 64x64',
      negative: 'character, person, wearing, full body, torso, helmet, angel, side view, 3D, isometric',
    },
    {
      id: 'abyssal_cuisses',
      name: 'Abyssal Cuisses',
      prompt: 'deep sea dark blue leg armor, front facing view flat 2D, glowing teal bioluminescent, oceanic tentacle patterns, coral decorations, legendary fantasy RPG armor, isolated item, transparent background, pixel art style, 64x64',
      negative: 'character, person, wearing, full body, torso, helmet, creature, side view, 3D, isometric',
    },
    {
      id: 'stormforged_greaves',
      name: 'Stormforged Greaves',
      prompt: 'electrified steel leg armor greaves, front facing view flat 2D, lightning bolt patterns, crackling blue electricity, storm silver metal, epic fantasy RPG armor, isolated item, transparent background, pixel art style, 64x64',
      negative: 'character, person, wearing, full body, torso, helmet, side view, 3D, isometric',
    },
    {
      id: 'infernal_legguards',
      name: 'Infernal Legguards',
      prompt: 'demonic fire leg armor, front facing view flat 2D, molten lava cracks glowing orange, dark obsidian metal, hellfire design, legendary fantasy RPG armor, isolated item, transparent background, pixel art style, 64x64',
      negative: 'character, person, wearing, full body, torso, helmet, demon, side view, 3D, isometric',
    },
  ],

  // MYTHICAL HELMETS - Face-on view
  helmets: [
    {
      id: 'void_crown',
      name: 'Void Crown',
      prompt: 'dark shadow crown helmet, front facing view flat 2D, void tendrils emanating, glowing purple eyes, ethereal dark purple metal crown, epic fantasy RPG helmet, isolated item, transparent background, pixel art style, 48x48',
      negative: 'character, person, wearing, full body, side view, 3D, isometric',
    },
    {
      id: 'crystal_diadem',
      name: 'Crystal Diadem',
      prompt: 'ice crystal crown helmet tiara, front facing view flat 2D, glowing cyan frost gems, silver frozen metal, elegant winter design, epic fantasy RPG helmet, isolated item, transparent background, pixel art style, 48x48',
      negative: 'character, person, wearing, full body, side view, 3D, isometric',
    },
    {
      id: 'celestial_halo_crown',
      name: 'Celestial Halo Crown',
      prompt: 'divine golden helmet with floating halo ring, front facing view flat 2D, radiant white holy light, angelic wing ornaments, legendary fantasy RPG helmet, isolated item, transparent background, pixel art style, 48x48',
      negative: 'character, person, wearing, full body, angel, side view, 3D, isometric',
    },
    {
      id: 'abyssal_visage',
      name: 'Abyssal Visage',
      prompt: 'deep sea eldritch helmet mask, front facing view flat 2D, glowing teal eyes, dark blue with tentacle decorations, oceanic horror design, legendary fantasy RPG helmet, isolated item, transparent background, pixel art style, 48x48',
      negative: 'character, person, wearing, full body, creature, side view, 3D, isometric',
    },
    {
      id: 'stormforged_helm',
      name: 'Stormforged Helm',
      prompt: 'lightning crowned steel helmet, front facing view flat 2D, crackling blue electricity, storm cloud silver metal, electric energy, epic fantasy RPG helmet, isolated item, transparent background, pixel art style, 48x48',
      negative: 'character, person, wearing, full body, side view, 3D, isometric',
    },
    {
      id: 'infernal_visage',
      name: 'Infernal Visage',
      prompt: 'demonic horned helmet, front facing view flat 2D, burning ember eyes, molten lava cracks, dark obsidian with fire, legendary fantasy RPG helmet, isolated item, transparent background, pixel art style, 48x48',
      negative: 'character, person, wearing, full body, demon, side view, 3D, isometric',
    },
  ],

  // MYTHICAL WEAPONS
  weapons: [
    {
      id: 'void_scythe',
      name: 'Void Scythe',
      prompt: 'dark purple void scythe weapon, front facing view flat 2D, shadow blade with purple glow, ethereal dark metal, glowing runes, legendary fantasy RPG weapon, isolated item, transparent background, pixel art style, 64x64',
      negative: 'character, person, holding, side view, 3D, isometric',
    },
    {
      id: 'frostbite_blade',
      name: 'Frostbite Blade',
      prompt: 'ice crystal sword, front facing view flat 2D, frozen blade with cyan glow, frost particles, silver and ice blue, epic fantasy RPG weapon, isolated item, transparent background, pixel art style, 64x64',
      negative: 'character, person, holding, side view, 3D, isometric',
    },
    {
      id: 'celestial_mace',
      name: 'Celestial Mace',
      prompt: 'divine golden mace weapon, front facing view flat 2D, radiant holy light, angelic wing designs, white and gold, legendary fantasy RPG weapon, isolated item, transparent background, pixel art style, 64x64',
      negative: 'character, person, holding, side view, 3D, isometric',
    },
    {
      id: 'abyssal_trident',
      name: 'Abyssal Trident',
      prompt: 'deep sea trident weapon, front facing view flat 2D, glowing teal bioluminescent, dark blue coral and bone, oceanic design, legendary fantasy RPG weapon, isolated item, transparent background, pixel art style, 64x64',
      negative: 'character, person, holding, side view, 3D, isometric',
    },
    {
      id: 'thunderstrike_axe',
      name: 'Thunderstrike Axe',
      prompt: 'lightning electrified battle axe, front facing view flat 2D, crackling blue electricity, storm metal with energy, epic fantasy RPG weapon, isolated item, transparent background, pixel art style, 64x64',
      negative: 'character, person, holding, side view, 3D, isometric',
    },
    {
      id: 'infernal_greatsword',
      name: 'Infernal Greatsword',
      prompt: 'demonic fire greatsword, front facing view flat 2D, molten lava blade glowing orange, dark obsidian hilt, hellfire design, legendary fantasy RPG weapon, isolated item, transparent background, pixel art style, 64x64',
      negative: 'character, person, holding, side view, 3D, isometric',
    },
  ],

  // MYTHICAL SHIELDS
  shields: [
    {
      id: 'void_bulwark',
      name: 'Void Bulwark',
      prompt: 'dark purple void tower shield, front facing view flat 2D, shadow tendrils around edges, glowing purple eye in center, gothic design, epic fantasy RPG shield, isolated item, transparent background, pixel art style, 64x64',
      negative: 'character, person, holding, side view, 3D, isometric',
    },
    {
      id: 'glacial_aegis',
      name: 'Glacial Aegis',
      prompt: 'ice crystal shield, front facing view flat 2D, frozen surface with cyan glow, frost spikes, silver and ice design, epic fantasy RPG shield, isolated item, transparent background, pixel art style, 64x64',
      negative: 'character, person, holding, side view, 3D, isometric',
    },
    {
      id: 'divine_barrier',
      name: 'Divine Barrier',
      prompt: 'golden divine kite shield, front facing view flat 2D, holy light radiating, angelic wings emblem, white and gold, legendary fantasy RPG shield, isolated item, transparent background, pixel art style, 64x64',
      negative: 'character, person, holding, side view, 3D, isometric',
    },
  ],

  // MYTHICAL CAPES
  capes: [
    {
      id: 'void_shroud',
      name: 'Void Shroud',
      prompt: 'dark purple void cloak cape, front facing view flat 2D, shadow wisps flowing, ethereal translucent fabric, glowing purple edges, epic fantasy RPG cape, isolated item, transparent background, pixel art style, 48x48',
      negative: 'character, person, wearing, side view, 3D, isometric',
    },
    {
      id: 'frostweave_mantle',
      name: 'Frostweave Mantle',
      prompt: 'ice blue frozen cape, front facing view flat 2D, frost crystals on edges, shimmering cold fabric, winter design, epic fantasy RPG cape, isolated item, transparent background, pixel art style, 48x48',
      negative: 'character, person, wearing, side view, 3D, isometric',
    },
    {
      id: 'celestial_wings_cape',
      name: 'Celestial Wings',
      prompt: 'golden divine wing-shaped cape, front facing view flat 2D, white feathered edges, holy radiant glow, angelic design, legendary fantasy RPG cape, isolated item, transparent background, pixel art style, 48x48',
      negative: 'character, person, wearing, side view, 3D, isometric',
    },
    {
      id: 'abyssal_tentacle_cloak',
      name: 'Abyssal Cloak',
      prompt: 'deep sea dark blue cape with tentacles, front facing view flat 2D, glowing teal bioluminescent edges, oceanic fabric, eldritch design, legendary fantasy RPG cape, isolated item, transparent background, pixel art style, 48x48',
      negative: 'character, person, wearing, side view, 3D, isometric',
    },
  ],
};

async function generateEquipmentSprite(category, item) {
  console.log(`\n🎨 Generating ${item.name}...`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

    // Determine size based on category
    let size = 64;
    if (category === 'helmets' || category === 'capes') size = 48;

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
    console.log(`✅ Generated ${item.name}`);
    console.log(`💰 Cost: $${data.usage?.usd?.toFixed(4) || 'N/A'}`);

    // Determine output directory
    const outputDir = path.join(__dirname, `../public/assets/equipment/${category}`);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const outputPath = path.join(outputDir, `${item.id}.png`);

    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`💾 Saved: public/assets/equipment/${category}/${item.id}.png`);

    return { success: true, cost: data.usage?.usd || 0, item };
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`⏱️  Timeout for ${item.name}, skipping...`);
      return { success: false, cost: 0, item };
    }
    console.error(`❌ Failed ${item.name}:`, error.message);
    return { success: false, cost: 0, item };
  }
}

async function generateAllMythicalEquipment() {
  console.log('═'.repeat(60));
  console.log('⚔️  MYTHICAL EQUIPMENT GENERATOR');
  console.log('═'.repeat(60));
  console.log('Generating epic and legendary tier equipment...\n');

  let totalCost = 0;
  let successCount = 0;
  let failCount = 0;
  const results = [];

  for (const [category, items] of Object.entries(MYTHICAL_EQUIPMENT)) {
    console.log(`\n📦 Category: ${category.toUpperCase()}`);
    console.log('─'.repeat(40));

    for (const item of items) {
      const result = await generateEquipmentSprite(category, item);
      results.push(result);

      if (result.success) {
        successCount++;
        totalCost += result.cost;
      } else {
        failCount++;
      }

      // Delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('✨ GENERATION COMPLETE!');
  console.log('═'.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);
  console.log('═'.repeat(60));

  // Output database entries for successful items
  if (successCount > 0) {
    console.log('\n📝 DATABASE ENTRIES (add to equipmentDatabase.js):');
    console.log('─'.repeat(60));

    results.filter(r => r.success).forEach(r => {
      const item = r.item;
      const slot = getSlotForCategory(item.id);
      const stats = getStatsForItem(item);
      const rarity = item.prompt.includes('legendary') ? 'legendary' : 'epic';
      const level = rarity === 'legendary' ? 35 : 25;

      console.log(`
  ${item.id}: {
    id: '${item.id}',
    name: '${item.name}',
    slot: '${slot}',
    rarity: '${rarity}',
    description: '${getDescription(item)}',
    stats: ${JSON.stringify(stats)},
    levelRequired: ${level},
    sprite: { path: '/assets/equipment/${getCategory(item.id)}/${item.id}.png' },${rarity === 'legendary' ? `
    effects: [{ type: 'particle', name: '${getEffectName(item.id)}', color: '${getEffectColor(item.id)}' }],` : ''}
    unlockMethod: 'default',
    unlockDescription: 'Available at level ${level}',
  },`);
    });
  }
}

function getSlotForCategory(id) {
  if (id.includes('greaves') || id.includes('legguards') || id.includes('cuisses') || id.includes('tassets')) return 'legs';
  if (id.includes('crown') || id.includes('diadem') || id.includes('halo') || id.includes('visage') || id.includes('helm')) return 'helmet';
  if (id.includes('scythe') || id.includes('blade') || id.includes('mace') || id.includes('trident') || id.includes('axe') || id.includes('greatsword')) return 'mainHand';
  if (id.includes('bulwark') || id.includes('aegis') || id.includes('barrier')) return 'offHand';
  if (id.includes('shroud') || id.includes('mantle') || id.includes('wings') || id.includes('cloak')) return 'cape';
  return 'chest';
}

function getCategory(id) {
  if (id.includes('greaves') || id.includes('legguards') || id.includes('cuisses') || id.includes('tassets')) return 'legs';
  if (id.includes('crown') || id.includes('diadem') || id.includes('halo') || id.includes('visage') || id.includes('helm')) return 'helmets';
  if (id.includes('scythe') || id.includes('blade') || id.includes('mace') || id.includes('trident') || id.includes('axe') || id.includes('greatsword')) return 'weapons';
  if (id.includes('bulwark') || id.includes('aegis') || id.includes('barrier')) return 'shields';
  if (id.includes('shroud') || id.includes('mantle') || id.includes('wings') || id.includes('cloak')) return 'capes';
  return 'chests';
}

function getStatsForItem(item) {
  const id = item.id;
  const isLegendary = item.prompt.includes('legendary');
  const mult = isLegendary ? 1.5 : 1.2;

  // Base stats by type
  if (id.includes('greaves') || id.includes('legguards') || id.includes('cuisses') || id.includes('tassets')) {
    return { defense: Math.round(8 * mult), vitality: Math.round(5 * mult) };
  }
  if (id.includes('crown') || id.includes('diadem') || id.includes('halo') || id.includes('visage') || id.includes('helm')) {
    return { defense: Math.round(6 * mult), wisdom: Math.round(4 * mult) };
  }
  if (id.includes('scythe') || id.includes('blade') || id.includes('mace') || id.includes('trident') || id.includes('axe') || id.includes('greatsword')) {
    return { strength: Math.round(12 * mult), vitality: Math.round(3 * mult) };
  }
  if (id.includes('bulwark') || id.includes('aegis') || id.includes('barrier')) {
    return { defense: Math.round(10 * mult), vitality: Math.round(5 * mult) };
  }
  if (id.includes('shroud') || id.includes('mantle') || id.includes('wings') || id.includes('cloak')) {
    return { wisdom: Math.round(6 * mult), intelligence: Math.round(4 * mult) };
  }
  // Chest default
  return { defense: Math.round(14 * mult), vitality: Math.round(7 * mult) };
}

function getDescription(item) {
  const id = item.id;
  if (id.includes('void')) return 'Armor forged from the essence of the void';
  if (id.includes('crystal') || id.includes('frost') || id.includes('glacial')) return 'Frozen armor infused with eternal ice';
  if (id.includes('celestial') || id.includes('divine')) return 'Divine armor blessed by the heavens';
  if (id.includes('abyssal')) return 'Armor from the depths of the abyss';
  if (id.includes('storm') || id.includes('thunder')) return 'Storm-forged armor crackling with lightning';
  if (id.includes('infernal')) return 'Demonic armor burning with hellfire';
  return 'Mythical armor of immense power';
}

function getEffectName(id) {
  if (id.includes('void')) return 'shadow_aura';
  if (id.includes('crystal') || id.includes('frost') || id.includes('glacial')) return 'frost_aura';
  if (id.includes('celestial') || id.includes('divine')) return 'divine_aura';
  if (id.includes('abyssal')) return 'eldritch_aura';
  if (id.includes('storm') || id.includes('thunder')) return 'lightning_aura';
  if (id.includes('infernal')) return 'flame_aura';
  return 'magic_aura';
}

function getEffectColor(id) {
  if (id.includes('void')) return '#8800ff';
  if (id.includes('crystal') || id.includes('frost') || id.includes('glacial')) return '#00ccff';
  if (id.includes('celestial') || id.includes('divine')) return '#ffd700';
  if (id.includes('abyssal')) return '#00ffaa';
  if (id.includes('storm') || id.includes('thunder')) return '#00aaff';
  if (id.includes('infernal')) return '#ff4400';
  return '#aa00ff';
}

// Run generation
generateAllMythicalEquipment().catch(console.error);
