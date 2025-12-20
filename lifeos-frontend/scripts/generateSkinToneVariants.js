/**
 * Skin Tone Variant Generator
 * Creates skin color variants for Stage 10 (Hero) and Stage 20 (Heroine)
 * Uses identical prompts to original sprites, only adding skin tone specification
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Skin tone definitions
const SKIN_TONES = [
  { id: 'light', name: 'Light', desc: 'pale fair skin' },
  { id: 'medium', name: 'Medium', desc: 'medium tan skin' },
  { id: 'olive', name: 'Olive', desc: 'olive skin tone' },
  { id: 'brown', name: 'Brown', desc: 'brown skin' },
  { id: 'dark', name: 'Dark', desc: 'dark brown skin' },
];

// Base clothing (same as original)
const BASE_CLOTHING = 'simple sleeveless brown tunic and cloth pants, leather belt, leather sandals';

// Original Stage 10 Swordsman (Hero) - from generateBaseEvolutionSprites.js
const HERO_STAGE_10 = {
  stage: 10,
  name: 'Swordsman',
  baseChar: 'male warrior with short brown hair and brown eyes',
  physique: 'perfectly balanced athletic build',
  stance: 'masterful combat stance, arms ready',
  expression: 'calm deadly focus',
  effects: 'subtle blue energy around hands',
  details: 'disciplined posture, multiple small scars'
};

// Original Stage 20 Veteran (Heroine) - from generateHeroineBaseSprites.js
const HEROINE_STAGE_20 = {
  stage: 20,
  name: 'Veteran',
  baseChar: 'female warrior with long brown hair in ponytail and brown eyes',
  physique: 'battle-hardened powerful build',
  stance: 'weary but unbroken stance',
  expression: 'thousand-yard stare wisdom',
  effects: 'spectral battle echoes',
  details: 'many scars, greying temples, weathered'
};

// Build prompt with skin tone - maintains exact structure of original prompts
function buildPrompt(config, skinTone) {
  // Insert skin tone into the base character description
  const charWithSkin = config.baseChar.replace(
    /(male|female) warrior/,
    `$1 warrior with ${skinTone.desc}`
  );

  return `epic pixel art of ${config.physique} ${charWithSkin} wearing ${BASE_CLOTHING}, ${config.stance}, ${config.expression}, ${config.details}${config.effects ? ', ' + config.effects : ''}, arms and hands clearly visible for equipment overlay, fantasy RPG style, front-facing isometric view, highly detailed 128x128 pixel art, clean silhouette`;
}

// Negative prompts (same as originals)
const NEGATIVE_PROMPT_HERO = `blurry, smudged, muddy colors, low contrast, unclear silhouette, messy lines,
distorted anatomy, asymmetric, watermark, signature, text, jpeg artifacts, dull colors, flat shading,
bad proportions, deformed, ugly, cropped, low quality, armor, helmet, weapon, sword, shield,
metal armor, chainmail, plate armor, gauntlets, greaves, pauldrons, cape, cloak,
oversexualized, revealing outfit, covered arms, hidden hands`;

const NEGATIVE_PROMPT_HEROINE = `blurry, smudged, muddy colors, low contrast, unclear silhouette, messy lines,
distorted anatomy, asymmetric, watermark, signature, text, jpeg artifacts, dull colors, flat shading,
bad proportions, deformed, ugly, cropped, low quality, armor, helmet, weapon, sword, shield,
metal armor, chainmail, plate armor, gauntlets, greaves, pauldrons, cape, cloak,
oversexualized, revealing outfit, covered arms, hidden hands, male`;

// API call - same parameters as original scripts
async function generateSprite(prompt, negativePrompt, label) {
  console.log(`\n🎨 Generating: ${label}`);
  console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: prompt,
      negative_description: negativePrompt,
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

// Save sprite
function saveSprite(base64Data, filename) {
  const outputPath = path.join(__dirname, '..', 'public', 'assets', 'avatar', 'skin-tones', filename);
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, Buffer.from(base64Data, 'base64'));
  console.log(`✅ Saved: skin-tones/${filename}`);
}

// Main generation
async function generateAllVariants() {
  console.log('🚀 SKIN TONE VARIANT GENERATION');
  console.log('================================');
  console.log(`📊 Generating ${SKIN_TONES.length} variants each for Hero and Heroine`);
  console.log(`📊 Total sprites: ${SKIN_TONES.length * 2}`);
  console.log('');

  const results = { success: [], failed: [] };

  // Generate Hero Stage 10 variants
  console.log('\n👤 HERO STAGE 10 (Swordsman) VARIANTS');
  console.log('─'.repeat(40));

  for (const skinTone of SKIN_TONES) {
    const prompt = buildPrompt(HERO_STAGE_10, skinTone);
    const filename = `hero_base_stage_10_swordsman_${skinTone.id}.png`;
    const label = `Hero ${skinTone.name} Skin`;

    try {
      const imageData = await generateSprite(prompt, NEGATIVE_PROMPT_HERO, label);
      saveSprite(imageData, filename);
      results.success.push(label);

      // Rate limit delay
      console.log('⏳ Waiting 3 seconds...');
      await new Promise(r => setTimeout(r, 3000));
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
      results.failed.push({ name: label, error: error.message });
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  // Generate Heroine Stage 20 variants
  console.log('\n👩 HEROINE STAGE 20 (Veteran) VARIANTS');
  console.log('─'.repeat(40));

  for (const skinTone of SKIN_TONES) {
    const prompt = buildPrompt(HEROINE_STAGE_20, skinTone);
    const filename = `heroine_base_stage_20_veteran_${skinTone.id}.png`;
    const label = `Heroine ${skinTone.name} Skin`;

    try {
      const imageData = await generateSprite(prompt, NEGATIVE_PROMPT_HEROINE, label);
      saveSprite(imageData, filename);
      results.success.push(label);

      // Rate limit delay (skip on last)
      if (skinTone !== SKIN_TONES[SKIN_TONES.length - 1]) {
        console.log('⏳ Waiting 3 seconds...');
        await new Promise(r => setTimeout(r, 3000));
      }
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
      results.failed.push({ name: label, error: error.message });
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('📊 SKIN TONE GENERATION COMPLETE');
  console.log('═'.repeat(50));
  console.log(`✅ Success: ${results.success.length}/${SKIN_TONES.length * 2}`);
  console.log(`❌ Failed: ${results.failed.length}`);

  if (results.success.length > 0) {
    console.log('\n✅ Generated sprites:');
    results.success.forEach(s => console.log(`   - ${s}`));
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Failed sprites:');
    results.failed.forEach(f => console.log(`   - ${f.name}: ${f.error}`));
  }

  console.log('\n📁 Output directory: public/assets/avatar/skin-tones/');
  console.log('\n🎯 Next steps:');
  console.log('   1. Review generated sprites for quality');
  console.log('   2. Add skin tone selector to avatar customization UI');
  console.log('   3. Update AvatarRenderer to use selected skin tone');
}

generateAllVariants().catch(console.error);
