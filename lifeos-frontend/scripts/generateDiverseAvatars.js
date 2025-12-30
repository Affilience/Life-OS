/**
 * Diverse Avatar Generator
 * Creates diverse skin tone and hair color variants for Stage 10 (Swordsman)
 * CRITICAL: Maintains EXACT same stance, build, and pose as original avatars
 *
 * Uses PixelLab API v1/generate-image-pixflux endpoint
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// ============================================================================
// DIVERSITY DEFINITIONS
// ============================================================================

// Skin tones with VERY explicit color descriptions for pixel art
// Using specific color references to ensure distinct results
const SKIN_TONES = [
  { id: 'pale', name: 'Pale', desc: 'very pale white skin like porcelain, pink undertones, European complexion' },
  { id: 'light', name: 'Light', desc: 'light peachy beige skin, Caucasian complexion' },
  { id: 'olive', name: 'Olive', desc: 'olive Mediterranean skin, golden-tan complexion like Greek or Italian' },
  { id: 'tan', name: 'Tan', desc: 'warm tan brown skin, Latino or Middle Eastern complexion' },
  { id: 'brown', name: 'Brown', desc: 'medium brown skin, South Asian or Indian complexion' },
  { id: 'dark_brown', name: 'Dark Brown', desc: 'dark brown skin, African complexion' },
  { id: 'deep', name: 'Deep', desc: 'very dark brown almost black skin, deep African complexion' },
  { id: 'ebony', name: 'Ebony', desc: 'rich dark ebony black skin, darkest complexion' },
];

// Hair colors
const HAIR_COLORS = [
  { id: 'black', name: 'Black', desc: 'jet black hair' },
  { id: 'dark_brown', name: 'Dark Brown', desc: 'dark brown hair' },
  { id: 'brown', name: 'Brown', desc: 'medium brown hair' },
  { id: 'auburn', name: 'Auburn', desc: 'auburn reddish-brown hair' },
  { id: 'red', name: 'Red', desc: 'red hair, ginger' },
  { id: 'blonde', name: 'Blonde', desc: 'blonde hair' },
  { id: 'platinum', name: 'Platinum', desc: 'platinum white-blonde hair' },
  { id: 'silver', name: 'Silver', desc: 'silver grey hair' },
];

// ============================================================================
// BASE CLOTHING - EXACTLY SAME AS ORIGINAL
// ============================================================================
const BASE_CLOTHING = 'simple sleeveless brown tunic and cloth pants, leather belt, leather sandals';

// ============================================================================
// STAGE 10 SWORDSMAN DEFINITIONS - EXACT SAME STANCE/BUILD
// ============================================================================

// Hero Stage 10 - EXACT same as original sprite
const HERO_STAGE_10 = {
  gender: 'male',
  physique: 'perfectly balanced athletic build, muscular arms',
  stance: 'masterful combat stance with feet shoulder-width apart, arms at sides ready position',
  expression: 'calm deadly focus, confident gaze',
  effects: '',
  details: 'disciplined posture, standing tall, strong shoulders',
  // Critical: No sword/weapon - base sprite only
};

// Heroine Stage 10 - EXACT same as original sprite
const HEROINE_STAGE_10 = {
  gender: 'female',
  physique: 'refined athletic warrior physique, toned arms',
  stance: 'confident warrior stance with feet apart, arms at sides ready position',
  expression: 'focused blade mastery, determined gaze',
  effects: '',
  details: 'confident bearing, athletic posture, strong but feminine build',
  // Critical: No sword/weapon - base sprite only
};

// ============================================================================
// PROMPT BUILDING
// ============================================================================

function buildPrompt(config, skinTone, hairColor) {
  const hairStyle = config.gender === 'male'
    ? 'short cropped hair'
    : 'long hair tied in practical ponytail';

  const genderWord = config.gender === 'male' ? 'man' : 'woman';

  // CRITICAL: Skin color mentioned prominently and multiple times
  return `pixel art RPG character, ${skinTone.desc} ${genderWord}, ${hairColor.desc} ${hairStyle}, ${config.physique}, SKIN COLOR: ${skinTone.name.toLowerCase()} complexion clearly visible on face and arms, wearing ${BASE_CLOTHING}, ${config.stance}, ${config.expression}, front-facing view, centered, 128x128 pixel art sprite, no background`;
}

// Negative prompt - critical for consistency
const NEGATIVE_PROMPT = `blurry, smudged, muddy colors, low contrast, unclear silhouette, messy lines,
distorted anatomy, asymmetric, watermark, signature, text, jpeg artifacts, dull colors,
bad proportions, deformed, ugly, cropped, low quality, armor, helmet, weapon, sword, shield,
metal armor, chainmail, plate armor, gauntlets, greaves, pauldrons, cape, cloak,
covered arms, hidden hands, multiple characters, background elements, scenery,
different pose, different stance, action pose, walking, running, jumping`;

// ============================================================================
// API CALL
// ============================================================================

async function generateSprite(prompt, label) {
  console.log(`\n🎨 Generating: ${label}`);
  console.log(`📝 Prompt: ${prompt.substring(0, 120)}...`);

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

// ============================================================================
// SAVE SPRITE
// ============================================================================

function saveSprite(base64Data, filename) {
  const outputPath = path.join(__dirname, '..', 'public', 'assets', 'avatar', 'diverse', filename);
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, Buffer.from(base64Data, 'base64'));
  console.log(`✅ Saved: diverse/${filename}`);
}

// ============================================================================
// MAIN GENERATION
// ============================================================================

async function generateDiverseAvatars() {
  console.log('🚀 DIVERSE AVATAR GENERATION');
  console.log('═'.repeat(60));
  console.log('');
  console.log('📋 Configuration:');
  console.log(`   Skin Tones: ${SKIN_TONES.length}`);
  console.log(`   Hair Colors: ${HAIR_COLORS.length}`);
  console.log('');

  // Parse command line args
  const args = process.argv.slice(2);
  const heroOnly = args.includes('--hero');
  const heroineOnly = args.includes('--heroine');
  const limitSkins = args.find(a => a.startsWith('--skins='));
  const limitHairs = args.find(a => a.startsWith('--hairs='));

  let skinTones = SKIN_TONES;
  let hairColors = HAIR_COLORS;

  if (limitSkins) {
    const count = parseInt(limitSkins.split('=')[1]);
    skinTones = SKIN_TONES.slice(0, count);
    console.log(`   [Limited to ${count} skin tones]`);
  }

  if (limitHairs) {
    const count = parseInt(limitHairs.split('=')[1]);
    hairColors = HAIR_COLORS.slice(0, count);
    console.log(`   [Limited to ${count} hair colors]`);
  }

  const genders = [];
  if (!heroineOnly) genders.push({ config: HERO_STAGE_10, prefix: 'hero', name: 'Hero' });
  if (!heroOnly) genders.push({ config: HEROINE_STAGE_10, prefix: 'heroine', name: 'Heroine' });

  const totalCombinations = genders.length * skinTones.length * hairColors.length;
  console.log(`   Total sprites to generate: ${totalCombinations}`);
  console.log('');

  const results = { success: [], failed: [] };
  let generated = 0;

  for (const gender of genders) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`👤 ${gender.name.toUpperCase()} VARIANTS`);
    console.log('─'.repeat(60));

    for (const skinTone of skinTones) {
      for (const hairColor of hairColors) {
        const prompt = buildPrompt(gender.config, skinTone, hairColor);
        const filename = `${gender.prefix}_stage_10_${skinTone.id}_${hairColor.id}.png`;
        const label = `${gender.name} - ${skinTone.name} skin, ${hairColor.name} hair`;

        try {
          const imageData = await generateSprite(prompt, label);
          saveSprite(imageData, filename);
          results.success.push(label);
          generated++;

          console.log(`📈 Progress: ${generated}/${totalCombinations} (${Math.round(generated / totalCombinations * 100)}%)`);

          // Rate limit delay
          if (generated < totalCombinations) {
            console.log('⏳ Waiting 3 seconds...');
            await new Promise(r => setTimeout(r, 3000));
          }
        } catch (error) {
          console.error(`❌ Failed: ${error.message}`);
          results.failed.push({ name: label, error: error.message });
          await new Promise(r => setTimeout(r, 5000));
        }
      }
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 DIVERSE AVATAR GENERATION COMPLETE');
  console.log('═'.repeat(60));
  console.log(`✅ Success: ${results.success.length}/${totalCombinations}`);
  console.log(`❌ Failed: ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('\n❌ Failed sprites:');
    results.failed.forEach(f => console.log(`   - ${f.name}: ${f.error}`));
  }

  console.log('\n📁 Output directory: public/assets/avatar/diverse/');
  console.log('\n💡 Usage examples:');
  console.log('   node scripts/generateDiverseAvatars.js --hero --skins=3 --hairs=3');
  console.log('   node scripts/generateDiverseAvatars.js --heroine');
  console.log('   node scripts/generateDiverseAvatars.js');
}

generateDiverseAvatars().catch(console.error);
