/**
 * PixelLab Avatar Tier Generator
 * Generates 4 visually stunning astronaut tiers for the avatar progression system
 *
 * Research-based optimizations:
 * - Hue-shifting for depth and visual interest
 * - High saturation in shadows for "pop"
 * - Strong silhouettes with clear readability
 * - Complementary color schemes per tier
 * - Proper contrast and luminosity
 * - Professional shading techniques
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Tier configurations with research-optimized prompts
const TIER_CONFIGS = {
  1: {
    name: 'Cadet',
    filename: 'astronaut_tier1_cadet.png',
    // Color theory: Cool grays with cyan accent (complementary to warm skin tone)
    // High contrast, clear silhouette, simple but professional
    prompt: `highly detailed pixel art astronaut sprite, clean gray space suit with bright cyan visor and accent lights,
front facing stance, strong clear silhouette, professional cel shading with hue-shifted shadows,
saturated shadows for depth, crisp clean lines, white helmet with defined shape,
chest control panel details, articulated limb joints visible,
isometric game character style, 128x128 resolution, polished indie game quality`,

    negative_prompt: `blurry, smudged, muddy colors, low contrast, unclear silhouette, messy lines,
distorted anatomy, asymmetric, watermark, signature, text, jpeg artifacts, dull colors, flat shading`,

    colors: ['#8B9BA8', '#D4DBE2', '#00D4FF', '#FFFFFF'],
  },

  2: {
    name: 'Explorer',
    filename: 'astronaut_tier2_explorer.png',
    // Color theory: Cool blue harmony with warm white highlights (temperature contrast)
    // Enhanced detail, visible tech upgrades, professional shading
    prompt: `highly detailed pixel art astronaut sprite, advanced white and electric blue space suit with glowing elements,
front facing heroic stance, enhanced armor plating with depth, professional cel shading with vibrant hue-shifted shadows,
bright blue glowing visor and tech accents, saturated blue shadows creating pop effect,
crisp defined edges, upgraded helmet with tech details, advanced chest panel with lights,
armored shoulder pads, reinforced joints, tech attachment points visible,
isometric game character style, 128x128 resolution, AAA indie game quality`,

    negative_prompt: `blurry, smudged, muddy colors, low contrast, flat design, unclear details,
messy lines, bad anatomy, dull blues, gray blues, flat shading, pixelated blur, artifacts`,

    colors: ['#FFFFFF', '#3B82F6', '#1E40AF', '#60A5FA'],
  },

  3: {
    name: 'Veteran',
    filename: 'astronaut_tier3_veteran.png',
    // Color theory: Purple-orange complementary scheme (maximum visual interest)
    // Battle-worn details, enhanced contrast, professional highlights
    prompt: `highly detailed pixel art astronaut sprite, purple and blue combat space suit with glowing orange energy accents,
battle-tested veteran appearance, front facing combat stance, heavy armor plating with scratches and wear,
professional cel shading with strong hue-shifting purple to blue shadows, vibrant saturated shadows,
glowing purple visor with HUD details, orange energy lines and power indicators,
weapon attachment hardpoints visible, armored chest piece with battle damage,
reinforced shoulder armor, combat-ready posture, defined muscles in suit,
isometric game character style, 128x128 resolution, premium indie game quality`,

    negative_prompt: `blurry, smudged, muddy purple, low saturation, flat appearance, unclear armor,
messy details, bad proportions, dull colors, flat shading, unclear glow, artifacts, noise`,

    colors: ['#8B5CF6', '#3B82F6', '#F59E0B', '#A855F7'],
  },

  4: {
    name: 'Cosmic Elite',
    filename: 'astronaut_tier4_elite.png',
    // Color theory: Triadic gold-purple-green (legendary status, maximum visual impact)
    // Ornate details, energy effects, professional polish
    prompt: `highly detailed pixel art astronaut sprite, legendary golden space suit with purple energy core and green power accents,
cosmic elite commander presence, front facing heroic stance, ornate armor with intricate details and engravings,
professional cel shading with rainbow hue-shifting in shadows gold to purple to green, extremely saturated shadows for maximum pop,
glowing golden helmet with purple energy visor and HUD overlay, green energy aura emanating from suit,
gold filigree patterns on armor, purple energy core visible in chest, green power lines coursing through suit,
elite shoulder pauldrons with engravings, energy field shimmer effect, legendary presence,
isometric game character style, 128x128 resolution, AAA+ premium game quality`,

    negative_prompt: `blurry, smudged, muddy gold, dull colors, low saturation, flat appearance,
messy lines, unclear details, bad anatomy, basic design, flat shading, unclear aura, artifacts, noisy`,

    colors: ['#F59E0B', '#8B5CF6', '#10B981', '#FCD34D'],
  },
};

// Generation parameters optimized for visual quality
const GENERATION_PARAMS = {
  width: 128,
  height: 128,
  text_guidance_scale: 8.5, // Slightly higher for more accurate prompt following
  no_background: true, // Transparent PNG
};

async function generateTier(tierNumber, config) {
  console.log(`\n🎨 Generating Tier ${tierNumber}: ${config.name}`);
  console.log(`📝 Color palette: ${config.colors.join(', ')}`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: config.prompt,
        negative_description: config.negative_prompt,
        image_size: {
          width: GENERATION_PARAMS.width,
          height: GENERATION_PARAMS.height
        },
        text_guidance_scale: GENERATION_PARAMS.text_guidance_scale,
        no_background: GENERATION_PARAMS.no_background,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    console.log(`💰 Cost: $${data.usage.usd.toFixed(4)}`);

    // Decode base64 image (remove data:image/png;base64, prefix if present)
    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Save to assets folder
    const outputPath = path.join(__dirname, '../public/assets/avatar', config.filename);
    fs.writeFileSync(outputPath, imageBuffer);

    console.log(`✅ Saved: ${config.filename}`);
    console.log(`📍 Path: ${outputPath}`);

    return {
      tier: tierNumber,
      filename: config.filename,
      cost: data.usage.usd,
      success: true,
    };

  } catch (error) {
    console.error(`❌ Error generating Tier ${tierNumber}:`, error.message);
    return {
      tier: tierNumber,
      filename: config.filename,
      cost: 0,
      success: false,
      error: error.message,
    };
  }
}

async function checkBalance() {
  try {
    const response = await fetch('https://api.pixellab.ai/v1/balance', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    const data = await response.json();
    return data.usd;
  } catch (error) {
    console.error('Error checking balance:', error);
    return null;
  }
}

async function main() {
  console.log('🚀 PixelLab Avatar Tier Generator');
  console.log('=' .repeat(50));

  // Check initial balance
  const initialBalance = await checkBalance();
  if (initialBalance === null) {
    console.error('❌ Failed to check API balance');
    process.exit(1);
  }

  console.log(`\n💵 Initial Balance: $${initialBalance.toFixed(2)}`);

  if (initialBalance < 0.05) {
    console.error('❌ Insufficient balance. Need at least $0.05');
    process.exit(1);
  }

  console.log('\n📊 Generating 4 avatar tiers with research-optimized prompts...');
  console.log('🎨 Applying: Hue-shifting, saturated shadows, complementary colors, strong silhouettes\n');

  const results = [];

  // Generate each tier sequentially
  for (const [tierNumber, config] of Object.entries(TIER_CONFIGS)) {
    const result = await generateTier(parseInt(tierNumber), config);
    results.push(result);

    // Small delay between requests
    if (tierNumber < 4) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Check final balance
  const finalBalance = await checkBalance();

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 GENERATION SUMMARY');
  console.log('='.repeat(50));

  const successCount = results.filter(r => r.success).length;
  const totalCost = results.reduce((sum, r) => sum + r.cost, 0);

  console.log(`\n✅ Successful: ${successCount}/4`);
  console.log(`💰 Total Cost: $${totalCost.toFixed(4)}`);
  console.log(`💵 Remaining Balance: $${finalBalance ? finalBalance.toFixed(2) : 'N/A'}`);

  console.log('\n📁 Generated Files:');
  results.forEach(r => {
    const status = r.success ? '✅' : '❌';
    console.log(`  ${status} Tier ${r.tier}: ${r.filename}`);
  });

  if (successCount === 4) {
    console.log('\n🎉 All tiers generated successfully!');
    console.log('📝 Next step: Update spriteGenerator.js to use the new sprites');
  } else {
    console.log('\n⚠️  Some tiers failed. Check errors above.');
  }
}

// Run the generator
main().catch(console.error);
