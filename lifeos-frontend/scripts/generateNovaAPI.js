/**
 * Nova AI Companion Sprite Generator
 * Generates 4 evolution stages using PixelLab API for highest visual quality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Nova evolution stage configurations
const NOVA_STAGES = {
  spark: {
    name: 'Spark',
    filename: 'nova_spark.png',
    size: 80,
    prompt: `highly detailed pixel art cute glowing cosmic spirit orb creature, baby form with large expressive happy eyes,
friendly cheerful expression, ethereal magical glow effect, soft floating pose, purple and blue gradient colors with sparkles,
smooth round orb shape with defined edges, professional cel shading with vibrant hue-shifting shadows,
magical particle effects around body, chibi proportions, innocent appearance,
front facing view, clean silhouette, polished indie game quality, transparent background`,

    negative_prompt: `blurry, smudged, unclear shape, messy particles, dull colors, flat shading,
distorted eyes, asymmetric, muddy purple, low saturation, unclear edges, artifacts, noise`,

    colors: ['#667eea', '#764ba2', '#a855f7', '#c084fc']
  },

  teen: {
    name: 'Nova',
    filename: 'nova_teen.png',
    size: 80,
    prompt: `highly detailed pixel art small cute humanoid cosmic sprite creature with star-shaped head,
friendly cheerful expression with bright eyes, glowing purple and blue ethereal translucent body,
floating magical companion with sparkle effects, chibi proportions with defined limbs,
professional cel shading with saturated hue-shifted purple to blue shadows, soft glow aura,
visible galaxy pattern swirls in body, animated appearance, magical energy wisps,
front facing heroic pose, clear character silhouette, premium indie game quality, transparent background`,

    negative_prompt: `blurry, unclear anatomy, messy details, dull colors, flat appearance, muddy purple,
low contrast, bad proportions, distorted limbs, unclear glow, artifacts, pixelated blur`,

    colors: ['#667eea', '#3b82f6', '#8b5cf6', '#a855f7']
  },

  stellar: {
    name: 'Stellar',
    filename: 'nova_stellar.png',
    size: 96,
    prompt: `highly detailed pixel art elegant cosmic humanoid life coach character with wise friendly expression,
detailed galaxy nebula pattern flowing through semi-transparent body, purple blue and pink gradient cosmic colors,
flowing ethereal energy trails and stardust particles, mature balanced proportions, confident wise pose,
professional cel shading with rainbow hue-shifting purple to blue to pink shadows, extremely saturated shadows for depth,
glowing cosmic eyes with wisdom, ornate flowing robe-like energy form, constellation patterns visible in body,
front facing mentor stance, strong clear silhouette, AAA indie game quality, transparent background`,

    negative_prompt: `blurry, smudged, muddy colors, low saturation, flat appearance, unclear details,
messy energy, bad anatomy, dull purple, unclear patterns, flat shading, artifacts, noise, pixelated`,

    colors: ['#8b5cf6', '#3b82f6', '#ec4899', '#a855f7']
  },

  cosmos: {
    name: 'Cosmos',
    filename: 'nova_cosmos.png',
    size: 96,
    prompt: `highly detailed pixel art majestic cosmic entity with wise serene expression,
flowing robes made of stardust nebula and galaxy patterns, radiant glowing aura with energy particles,
ornate crown of golden stars and cosmic symbols, purple blue and gold gradient legendary colors,
dignified wise mentor appearance with cosmic wisdom emanating, mature proportions with ethereal presence,
professional cel shading with rainbow hue-shifting gold to purple to blue shadows, maximum saturation for visual pop,
glowing cosmic third eye, intricate constellation patterns on robes, energy field shimmer effect,
front facing divine pose, legendary silhouette presence, AAA+ premium game quality, transparent background`,

    negative_prompt: `blurry, smudged, muddy gold, dull colors, low saturation, flat appearance,
messy details, unclear robes, bad anatomy, basic design, flat shading, unclear aura, artifacts, noise`,

    colors: ['#f59e0b', '#8b5cf6', '#3b82f6', '#fcd34d']
  }
};

const GENERATION_PARAMS = {
  text_guidance_scale: 8.5,
  no_background: true,
};

async function generateNovaStage(stageName, config) {
  console.log(`\n✨ Generating ${config.name} form...`);
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
          width: config.size,
          height: config.size
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

    // Decode base64 image
    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Save to nova assets folder
    const outputDir = path.join(__dirname, '../public/assets/nova');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, config.filename);
    fs.writeFileSync(outputPath, imageBuffer);

    console.log(`✅ Saved: ${config.filename}`);
    console.log(`📍 Path: ${outputPath}`);

    return {
      success: true,
      cost: data.usage.usd
    };

  } catch (error) {
    console.error(`❌ Error generating ${config.name}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

async function main() {
  console.log('🌟 Generating Nova AI Companion Sprites via PixelLab API');
  console.log('=' .repeat(60));

  let totalCost = 0;
  const results = [];

  for (const [stageName, config] of Object.entries(NOVA_STAGES)) {
    const result = await generateNovaStage(stageName, config);
    results.push({ stage: stageName, ...result });

    if (result.success) {
      totalCost += result.cost;
    }

    // Wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Generation Summary:');
  console.log('='.repeat(60));

  results.forEach(r => {
    const status = r.success ? '✅' : '❌';
    const cost = r.success ? `$${r.cost.toFixed(4)}` : r.error;
    console.log(`${status} ${r.stage.padEnd(10)} - ${cost}`);
  });

  console.log('='.repeat(60));
  console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);
  console.log('✅ Nova sprites generated successfully!');
  console.log('\n📁 Output directory: public/assets/nova/');
  console.log('\n🎨 Next steps:');
  console.log('1. Check the generated sprites in public/assets/nova/');
  console.log('2. Update NovaWidget.jsx to use new single-file sprites');
  console.log('3. Refresh your browser to see the new sprites!');
}

main().catch(console.error);
