/**
 * Generate new mythological pet sprites using PixelLab API
 * Following the existing pet theme - cute mythological companions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';
const OUTPUT_DIR = path.join(__dirname, '../public/assets/pets');

// New pets to generate - following mythological theme
const NEW_PETS = [
  // COMMON TIER - Cute, simple creatures
  {
    id: 'common_pixie',
    name: 'Pixie',
    culture: 'Celtic',
    description: 'tiny glowing fairy sprite with butterfly wings, blue magical aura, cute chibi style',
    tier: 'common',
  },
  {
    id: 'common_foo_pup',
    name: 'Foo Dog Pup',
    culture: 'Chinese',
    description: 'baby chinese guardian lion dog, fluffy golden mane, cute round face, red collar with bell',
    tier: 'common',
  },
  {
    id: 'common_will_o_wisp',
    name: "Will-o'-Wisp",
    culture: 'Celtic',
    description: 'floating ghostly flame spirit, pale blue-green ethereal fire, cute face in flames',
    tier: 'common',
  },

  // UNCOMMON TIER - More detailed mythological creatures
  {
    id: 'uncommon_thunderbird',
    name: 'Thunderbird Chick',
    culture: 'Native American',
    description: 'baby thunderbird eagle with lightning patterns on feathers, yellow electric sparks, majestic but cute',
    tier: 'uncommon',
  },
  {
    id: 'uncommon_selkie',
    name: 'Selkie Pup',
    culture: 'Scottish',
    description: 'adorable seal pup with magical shimmer, half-transformed with human-like eyes, silvery fur',
    tier: 'uncommon',
  },
  {
    id: 'uncommon_carbuncle',
    name: 'Carbuncle',
    culture: 'Latin American',
    description: 'small blue rabbit-like creature with large red gemstone on forehead, glowing jewel, cute fluffy',
    tier: 'uncommon',
  },

  // RARE TIER - Majestic mythological beings
  {
    id: 'rare_qilin',
    name: 'Qilin',
    culture: 'Chinese',
    description: 'young qilin unicorn dragon hybrid, golden scales, deer antlers, flames around hooves, gentle expression',
    tier: 'rare',
  },
  {
    id: 'rare_basilisk',
    name: 'Basilisk Hatchling',
    culture: 'European',
    description: 'baby basilisk serpent king, emerald green scales, small crown-like crest, hypnotic golden eyes',
    tier: 'rare',
  },
  {
    id: 'rare_baku',
    name: 'Baku',
    culture: 'Japanese',
    description: 'dream-eating tapir spirit, elephant trunk, tiger paws, purple dreamlike mist surrounding it',
    tier: 'rare',
  },

  // EPIC TIER - Powerful legendary creatures
  {
    id: 'epic_chimera',
    name: 'Chimera Cub',
    culture: 'Greek',
    description: 'baby chimera with lion head, small goat head on back, snake tail, fire breathing, fierce but cute',
    tier: 'epic',
  },
  {
    id: 'epic_garuda',
    name: 'Garuda',
    culture: 'Hindu',
    description: 'divine eagle-human hybrid, golden feathers, royal crown, wings spread majestically, sun behind',
    tier: 'epic',
  },
  {
    id: 'epic_sleipnir',
    name: 'Sleipnir Foal',
    culture: 'Norse',
    description: "young eight-legged horse, silver-grey coat, cosmic mane with stars, Odin's steed as a foal",
    tier: 'epic',
  },

  // MYTHIC TIER - Ultimate legendary beings
  {
    id: 'mythic_quetzalcoatl',
    name: 'Quetzalcoatl',
    culture: 'Aztec',
    description: 'feathered serpent god, rainbow iridescent feathers, emerald scales, divine golden glow',
    tier: 'mythic',
  },
  {
    id: 'mythic_raiju',
    name: 'Raijū',
    culture: 'Japanese',
    description: 'lightning beast wolf-cat hybrid, pure white fur crackling with blue electricity, storm clouds',
    tier: 'mythic',
  },
];

async function generatePetSprite(pet) {
  console.log(`\n🐾 Generating ${pet.name} (${pet.tier})...`);

  const prompt = `pixel art mythological pet companion, ${pet.description}, RPG game style, cute chibi proportions, fantasy game asset, 64x64 sprite, detailed shading`;
  const negativePrompt = '3d, realistic, photo, blurry, low quality, ugly, deformed, background, scenery';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

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
        text_guidance_scale: 8.5,
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

    // Ensure the filename matches the pattern pet_xxx.png
    const filename = `pet_${pet.id.replace(/^(common|uncommon|rare|epic|mythic)_/, '')}.png`;
    const finalPath = path.join(OUTPUT_DIR, filename);

    fs.writeFileSync(finalPath, imageBuffer);
    console.log(`  💾 Saved: ${filename}`);
    return { success: true, path: finalPath, pet, cost: data.usage?.usd || 0 };
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`  ⏱️  Timeout: ${pet.name} took too long (>60s), skipping...`);
      return { success: false, error: 'Timeout', pet, cost: 0 };
    }
    console.error(`  ❌ Failed: ${error.message}`);
    return { success: false, error: error.message, pet, cost: 0 };
  }
}

async function generateAllPets() {
  console.log('🚀 PET SPRITE GENERATION - New Mythological Companions');
  console.log('======================================================');
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`🐾 Total pets to generate: ${NEW_PETS.length}\n`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let totalCost = 0;
  const results = {
    success: [],
    failed: [],
  };

  // Generate pets sequentially to avoid rate limits
  for (const pet of NEW_PETS) {
    const result = await generatePetSprite(pet);
    if (result.success) {
      results.success.push(result);
      totalCost += result.cost;
    } else {
      results.failed.push(result);
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n======================================================');
  console.log('✨ GENERATION COMPLETE!');
  console.log(`✅ Successfully generated: ${results.success.length}/${NEW_PETS.length}`);
  console.log(`❌ Failed/Skipped: ${results.failed.length}/${NEW_PETS.length}`);
  console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);

  if (results.failed.length > 0) {
    console.log('\n⚠️  Failed pets:');
    results.failed.forEach(r => console.log(`  - ${r.pet.name}: ${r.error}`));
  }

  // Output the pet database entries
  console.log('\n📋 Pet Database Entries (copy to petStore.js):\n');
  results.success.forEach(r => {
    const pet = r.pet;
    const spriteName = `pet_${pet.id.replace(/^(common|uncommon|rare|epic|mythic)_/, '')}.png`;
    console.log(`  ${pet.id.replace(/^(common|uncommon|rare|epic|mythic)_/, '')}: {
    id: '${pet.id.replace(/^(common|uncommon|rare|epic|mythic)_/, '')}',
    name: '${pet.name}',
    tier: '${pet.tier}',
    culture: '${pet.culture}',
    sprite: '/assets/pets/${spriteName}',
    description: '${pet.description.split(',')[0]}',
    lore: 'A ${pet.culture} mythological companion.',
    bonusType: 'xp',
    bonusAmount: ${pet.tier === 'common' ? 3 : pet.tier === 'uncommon' ? 5 : pet.tier === 'rare' ? 8 : pet.tier === 'epic' ? 12 : 15},
    unlockMethod: 'achievement',
    unlockRequirement: null, // TODO: Map to achievement
  },`);
  });
  console.log('\n======================================================');
}

// Run the generator
generateAllPets().catch(console.error);
