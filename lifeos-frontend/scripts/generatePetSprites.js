/**
 * Pet Sprite Generator - PixelLab API
 * Generates mythological creature companions for LifeOS
 * Phase 1: 15 pets (3 per tier)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Base negative prompt for all pets
const BASE_NEGATIVE = `blurry, low quality, distorted, deformed, ugly, realistic photo,
modern objects, text, watermark, signature, multiple creatures, duplicate, human,
anthropomorphic, standing upright on two legs, clothing, accessories`;

const PETS = {
  // TIER 1: COMMON (3 pets)
  common_kitsune_pup: {
    name: 'Kitsune Pup',
    tier: 'Common',
    filename: 'pet_kitsune_pup.png',
    size: 48,
    prompt: `highly detailed pixel art cute baby fox spirit, single fluffy tail with white tip,
mystical glowing blue eyes with wisdom beyond years, soft orange and white fur,
small floating magical flames around body, playful innocent pose on all fours,
gentle aura particles, Japanese yokai aesthetic, chibi proportions,
professional cel shading with vibrant shadows, polished indie game quality,
front facing quadruped pose, clear silhouette, transparent background`,
  },

  common_imp: {
    name: 'Imp',
    tier: 'Common',
    filename: 'pet_imp.png',
    size: 48,
    prompt: `highly detailed pixel art small mischievous imp familiar, tiny demon with bat wings,
red skin with darker horns, glowing yellow eyes, impish grin showing tiny fangs,
curled tail with spade tip, crouched playful pose, small magical sparks,
medieval European folklore aesthetic, cute yet mischievous energy,
professional cel shading with vibrant hue-shifting shadows, chibi proportions,
front facing pose, clear silhouette, polished indie game quality, transparent background`,
  },

  common_scarab: {
    name: 'Scarab',
    tier: 'Common',
    filename: 'pet_scarab.png',
    size: 48,
    prompt: `highly detailed pixel art sacred Egyptian scarab beetle, glowing golden shell with hieroglyphic patterns,
mystical turquoise and gold coloring, gentle magical aura emanating from body,
small sun disk symbol above head, ancient divine insect aesthetic,
professional cel shading with vibrant metallic highlights, slightly stylized proportions,
front facing pose showing shell details, clear silhouette, polished indie game quality, transparent background`,
  },

  // TIER 2: UNCOMMON (3 pets)
  uncommon_griffin_chick: {
    name: 'Griffin Chick',
    tier: 'Uncommon',
    filename: 'pet_griffin_chick.png',
    size: 48,
    prompt: `highly detailed pixel art baby griffin, young eagle head with curious bright eyes,
golden lion body with eagle talons on front legs, tiny developing wings,
fluffy downy feathers mixed with soft fur, playful stance,
Greek mythology aesthetic, noble yet adorable appearance,
professional cel shading with vibrant gold and brown tones, chibi proportions,
front facing pose, clear silhouette, polished indie game quality, transparent background`,
  },

  uncommon_tanuki: {
    name: 'Tanuki',
    tier: 'Uncommon',
    filename: 'pet_tanuki.png',
    size: 48,
    prompt: `highly detailed pixel art Japanese tanuki raccoon dog, brown and tan striped fur,
cute round belly, leaf balanced on head (symbol of transformation magic),
mischievous friendly expression, fluffy ringed tail, sitting pose,
yokai folklore aesthetic with magical sparkles, shapeshifter charm,
professional cel shading with vibrant warm tones, chibi proportions,
front facing pose, clear silhouette, polished indie game quality, transparent background`,
  },

  uncommon_domovoi: {
    name: 'Domovoi',
    tier: 'Uncommon',
    filename: 'pet_domovoi.png',
    size: 48,
    prompt: `highly detailed pixel art elderly bearded domovoi household spirit, small gnome-like creature,
long flowing grey beard, wise ancient eyes, simple rustic clothing,
kind protective expression, tiny glowing hearth embers around body,
Slavic folklore aesthetic, grandfather energy, warm comforting presence,
professional cel shading with earthy tones, slightly hunched pose,
front facing, clear silhouette, polished indie game quality, transparent background`,
  },

  // TIER 3: RARE (3 pets)
  rare_azure_dragon: {
    name: 'Azure Dragon',
    tier: 'Rare',
    filename: 'pet_azure_dragon.png',
    size: 48,
    prompt: `highly detailed pixel art Chinese azure dragon, long serpentine Eastern dragon body,
brilliant cyan and turquoise scales with shimmer, flowing whiskers and mane,
four legs with sharp claws, glowing eyes, mystical cloud wisps around body,
divine celestial aesthetic representing spring and east direction,
professional cel shading with vibrant blue-green gradients, elegant proportions,
side profile S-curve pose, clear silhouette, polished indie game quality, transparent background`,
  },

  rare_pegasus: {
    name: 'Pegasus',
    tier: 'Rare',
    filename: 'pet_pegasus.png',
    size: 48,
    prompt: `highly detailed pixel art divine pegasus winged horse, pure white coat with ethereal glow,
large majestic feathered wings spread slightly, flowing mane and tail,
noble intelligent eyes, graceful standing pose, small sparkles and light particles,
Greek mythology aesthetic, divine purity and freedom symbolism,
professional cel shading with soft white and gold highlights, heroic proportions,
front three-quarter view, clear silhouette, polished indie game quality, transparent background`,
  },

  rare_anubis_jackal: {
    name: 'Anubis Jackal',
    tier: 'Rare',
    filename: 'pet_anubis_jackal.png',
    size: 48,
    prompt: `highly detailed pixel art divine Anubis jackal guide, sleek black fur with golden highlights,
mystical glowing golden eyes, Egyptian collar with hieroglyphic symbols,
regal sitting pose like Egyptian statues, subtle golden aura wisps,
ancient Egyptian deity aesthetic, guardian of the afterlife symbolism,
professional cel shading with deep blacks and rich golds, dignified proportions,
front facing pose, clear silhouette, polished indie game quality, transparent background`,
  },

  // TIER 4: EPIC (3 pets)
  epic_nine_tailed_kitsune: {
    name: 'Nine-Tailed Kitsune',
    tier: 'Epic',
    filename: 'pet_nine_tailed_kitsune.png',
    size: 48,
    prompt: `highly detailed pixel art ancient nine-tailed fox spirit, nine flowing tails spread majestically,
white and gold ethereal fur with mystical shimmer, wise glowing blue eyes,
floating magical flames and energy orbs around body, regal sitting pose,
powerful divine presence, Japanese mythology aesthetic, ancient wisdom embodied,
professional cel shading with vibrant white-gold-blue palette, elegant proportions,
front facing pose showing all tails, clear silhouette, polished indie game quality, transparent background`,
  },

  epic_phoenix: {
    name: 'Phoenix',
    tier: 'Epic',
    filename: 'pet_phoenix.png',
    size: 48,
    prompt: `highly detailed pixel art immortal phoenix bird, brilliant red orange and gold plumage,
flames emanating from wing tips and tail feathers, glowing eyes of ancient wisdom,
majestic wings spread mid-flight, trails of fire and embers,
Greek mythology aesthetic, eternal rebirth and renewal symbolism,
professional cel shading with vibrant fire gradients, heroic proportions,
front facing flight pose, clear silhouette, polished indie game quality, transparent background`,
  },

  epic_fenghuang: {
    name: 'Fenghuang',
    tier: 'Epic',
    filename: 'pet_fenghuang.png',
    size: 48,
    prompt: `highly detailed pixel art Chinese fenghuang phoenix empress, rainbow-colored plumage with iridescent shimmer,
peacock-like tail feathers with mystical patterns, phoenix head with elegant crest,
golden beak and talons, flowing ribbons of celestial energy,
divine feminine power aesthetic, harmony and prosperity symbolism,
professional cel shading with vibrant multi-colored gradients, regal proportions,
side profile perched pose, clear silhouette, polished indie game quality, transparent background`,
  },

  // TIER 5: MYTHIC (3 pets)
  mythic_fenrir_pup: {
    name: 'Fenrir Pup',
    tier: 'Mythic',
    filename: 'pet_fenrir_pup.png',
    size: 48,
    prompt: `highly detailed pixel art young Fenrir wolf of Norse mythology, massive pup with ancient eyes,
grey and black fur with mystical runic patterns glowing faintly, chains broken at paws,
powerful build even as youth, small wisps of chaos energy around body,
sitting pose with hint of future world-ending power, fierce yet controllable,
professional cel shading with dark tones and blue-white energy, imposing proportions,
front facing pose, clear silhouette, polished indie game quality, transparent background`,
  },

  mythic_jormungandr: {
    name: 'Jörmungandr',
    tier: 'Mythic',
    filename: 'pet_jormungandr.png',
    size: 48,
    prompt: `highly detailed pixel art world serpent Jörmungandr coiled, massive sea serpent with ocean-blue scales,
Norse rune patterns etched along body, glowing eyes with ancient knowledge,
serpentine coiled pose forming infinity symbol, water and mist effects,
cosmic ocean aesthetic, world-encircling symbolism, primordial chaos energy,
professional cel shading with deep blue-green gradients, epic proportions,
coiled circular pose, clear silhouette, polished indie game quality, transparent background`,
  },

  mythic_leviathan: {
    name: 'Leviathan',
    tier: 'Mythic',
    filename: 'pet_leviathan.png',
    size: 48,
    prompt: `highly detailed pixel art Leviathan primordial sea serpent, massive serpentine dragon body,
dark blue and purple scales with bioluminescent patterns, multiple fins and gills,
glowing eyes like abyssal depths, twisting S-curve pose, water vortex effects,
Hebrew mythology aesthetic, chaos of primordial oceans, ancient cosmic power,
professional cel shading with dark blue-purple gradients and glowing highlights, titanic proportions,
side coiled pose, clear silhouette, polished indie game quality, transparent background`,
  },
};

/**
 * Generate a single pet sprite
 */
async function generatePetSprite(petKey, config) {
  console.log(`\n🎨 Generating ${config.name} (${config.tier})...`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: config.prompt,
        negative_description: BASE_NEGATIVE,
        image_size: {
          width: config.size,
          height: config.size
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

    // Save sprite
    const outputDir = path.join(__dirname, '..', 'public', 'assets', 'pets');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, config.filename);
    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    fs.writeFileSync(outputPath, imageBuffer);

    console.log(`✅ ${config.name} saved to ${config.filename}`);
    console.log(`   Cost: $${data.cost.toFixed(4)}`);

    return data.cost;
  } catch (error) {
    console.error(`❌ Failed to generate ${config.name}:`, error.message);
    return 0;
  }
}

/**
 * Generate all pets by tier
 */
async function generateAllPets() {
  console.log('🚀 Starting Pet Sprite Generation (Phase 1: 15 pets)\n');
  console.log('━'.repeat(60));

  let totalCost = 0;
  const tiers = {
    Common: [],
    Uncommon: [],
    Rare: [],
    Epic: [],
    Mythic: []
  };

  // Group pets by tier
  for (const [key, config] of Object.entries(PETS)) {
    tiers[config.tier].push({ key, config });
  }

  // Generate by tier
  for (const [tier, pets] of Object.entries(tiers)) {
    if (pets.length === 0) continue;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`  TIER: ${tier.toUpperCase()} (${pets.length} pets)`);
    console.log(`${'='.repeat(60)}`);

    for (const { key, config } of pets) {
      const cost = await generatePetSprite(key, config);
      totalCost += cost;

      // Rate limiting: wait 2 seconds between requests
      if (pets.indexOf({ key, config }) < pets.length - 1) {
        console.log('   ⏳ Waiting 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  console.log('\n' + '━'.repeat(60));
  console.log(`\n✨ Generation Complete!`);
  console.log(`   Total Sprites: ${Object.keys(PETS).length}`);
  console.log(`   Total Cost: $${totalCost.toFixed(4)}`);
  console.log(`   Saved to: public/assets/pets/\n`);
}

// Run generation
generateAllPets().catch(console.error);
