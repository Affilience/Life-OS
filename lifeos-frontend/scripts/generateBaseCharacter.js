/**
 * Base Character Generator for Equipment Overlay System
 * Generates a neutral base character sprite without equipment
 * Equipment will be layered on top of this base sprite
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Base character - neutral pose, simple clothing for equipment overlay
const BASE_CHARACTERS = [
  {
    id: 'hero_base',
    name: 'Hero Base',
    description: `epic pixel art of athletic male warrior with short brown hair and brown eyes wearing simple sleeveless brown tunic and basic cloth pants, bare arms and hands visible, leather sandals, standing in neutral idle pose facing forward with arms slightly away from body ready for equipment, simple peasant villager base character, fantasy RPG style, front-facing isometric view, highly detailed 128x128 pixel art, clean silhouette for armor overlay`,
  },
  {
    id: 'heroine_base',
    name: 'Heroine Base',
    description: `epic pixel art of athletic female heroine with short brown hair and brown eyes wearing simple sleeveless brown tunic and basic cloth pants, bare arms and hands visible, leather sandals, standing in neutral idle pose facing forward with arms slightly away from body ready for equipment, simple peasant villager base character, fantasy RPG style, front-facing isometric view, highly detailed 128x128 pixel art, clean silhouette for armor overlay`,
  },
];

// Generation parameters
const GENERATION_PARAMS = {
  width: 128,
  height: 128,
  text_guidance_scale: 8.5,
  no_background: true,
};

// Negative prompt - exclude any armor/weapons, ensure base character
const NEGATIVE_PROMPT = `blurry, smudged, muddy colors, low contrast, unclear silhouette, messy lines,
distorted anatomy, asymmetric, watermark, signature, text, jpeg artifacts, dull colors, flat shading,
bad proportions, deformed, ugly, cropped, low quality, normal quality, worst quality,
armor, helmet, weapon, sword, shield, cape, gloves, gauntlets, boots, metal armor, chainmail, plate armor,
oversexualized, revealing outfit`;

// PixelLab API call function
async function generateSprite(description, name) {
  console.log(`\n🎨 Generating: ${name}`);
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

    console.log(`💰 Cost: $${data.usage?.usd?.toFixed(4) || 'N/A'}`);

    // Extract base64 image data
    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');

    return base64Data;
  } catch (error) {
    console.error(`❌ Failed to generate ${name}:`, error.message);
    throw error;
  }
}

// Save sprite to file
function saveSprite(base64Data, filename) {
  const outputPath = path.join(__dirname, '..', 'public', 'assets', 'avatar', 'base', filename);

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Saved: ${filename}`);
}

// Main generation function
async function generateBaseCharacters() {
  console.log('🚀 Starting Base Character Generation for Equipment Overlay System');
  console.log(`📊 Total characters to generate: ${BASE_CHARACTERS.length}`);
  console.log('⏳ Estimated time: ~1 minute\n');

  const results = {
    success: [],
    failed: []
  };

  for (let i = 0; i < BASE_CHARACTERS.length; i++) {
    const character = BASE_CHARACTERS[i];
    const filename = `${character.id}.png`;

    try {
      const imageData = await generateSprite(character.description, character.name);
      saveSprite(imageData, filename);
      results.success.push(character.name);

      // Progress update
      console.log(`📈 Progress: ${i + 1}/${BASE_CHARACTERS.length} (${Math.round((i + 1) / BASE_CHARACTERS.length * 100)}%)`);

      // Small delay to avoid rate limits
      if (i < BASE_CHARACTERS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ Failed: ${character.name}`, error.message);
      results.failed.push({ name: character.name, error: error.message });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 GENERATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${results.success.length}/${BASE_CHARACTERS.length}`);
  console.log(`❌ Failed: ${results.failed.length}/${BASE_CHARACTERS.length}`);

  if (results.failed.length > 0) {
    console.log('\n❌ Failed characters:');
    results.failed.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
  }

  console.log('\n💾 Sprites saved to: public/assets/avatar/base/');
  console.log('🎉 Base character generation complete!\n');
}

// Run generation
generateBaseCharacters().catch(console.error);
