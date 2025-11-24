/**
 * Nova AI Companion Sprite Generator - Mythological Advisor Theme
 * Generates 4 evolution stages as a mystical advisor/oracle companion
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Nova mythological advisor evolution stages
const NOVA_STAGES = {
  spark: {
    name: 'Spark (Wisp)',
    filename: 'nova_spark.png',
    size: 80,
    prompt: `highly detailed pixel art mystical floating wisp spirit, small ethereal ghostly advisor form,
glowing gentle blue and purple magical aura, cute friendly wise eyes with ancient knowledge,
simple hooded cloak made of magical mist, small floating orb companion,
soft magical particles and sparkles around body, innocent yet wise appearance,
professional cel shading with vibrant hue-shifting shadows, chibi proportions,
front facing floating pose, clear silhouette, polished indie game quality, transparent background`,

    negative_prompt: `blurry, smudged, unclear shape, messy particles, dull colors, flat shading,
distorted features, asymmetric, muddy colors, low saturation, unclear edges, artifacts, noise`,

    colors: ['#667eea', '#764ba2', '#a855f7', '#e0e7ff']
  },

  teen: {
    name: 'Nova (Young Oracle)',
    filename: 'nova_teen.png',
    size: 80,
    prompt: `highly detailed pixel art young mystical oracle advisor character, friendly wise humanoid form,
flowing hooded robe with magical constellation patterns, glowing blue and purple ethereal fabric,
kind wise eyes with gentle expression, floating mystical tome or scroll nearby,
magical staff with glowing crystal top, soft aura of wisdom and guidance,
professional cel shading with saturated hue-shifted purple to blue shadows, chibi proportions,
ancient symbols floating around character, front facing mentor pose,
clear character silhouette, premium indie game quality, transparent background`,

    negative_prompt: `blurry, unclear anatomy, messy details, dull colors, flat appearance, muddy purple,
low contrast, bad proportions, distorted limbs, unclear magical effects, artifacts, pixelated blur`,

    colors: ['#667eea', '#3b82f6', '#8b5cf6', '#c7d2fe']
  },

  stellar: {
    name: 'Stellar (Sage)',
    filename: 'nova_stellar.png',
    size: 96,
    prompt: `highly detailed pixel art wise mystical sage advisor character, mature oracle with deep wisdom,
elegant flowing robes with intricate constellation and runic patterns, purple blue and silver gradient,
ancient mystical staff with floating crystalline orb, wise serene expression with third eye mark,
flowing magical energy and stardust particles, ornate hood with celestial symbols,
professional cel shading with rainbow hue-shifting purple to blue to silver shadows, balanced proportions,
magical tome floating beside character, glowing ancient runes in air, aurora-like energy wisps,
front facing wise mentor stance, strong clear silhouette, AAA indie game quality, transparent background`,

    negative_prompt: `blurry, smudged, muddy colors, low saturation, flat appearance, unclear details,
messy energy, bad anatomy, dull purple, unclear patterns, flat shading, artifacts, noise`,

    colors: ['#8b5cf6', '#3b82f6', '#e0e7ff', '#a855f7']
  },

  cosmos: {
    name: 'Cosmos (Ancient One)',
    filename: 'nova_cosmos.png',
    size: 96,
    prompt: `highly detailed pixel art ancient mystical deity advisor character, legendary oracle of cosmos,
majestic flowing robes woven from galaxy nebula and stardust, radiant golden and purple celestial aura,
ornate crown of golden stars and cosmic crystals, wise all-knowing serene expression,
powerful mystical staff with multiple floating orbs of power, ancient divine presence,
professional cel shading with rainbow hue-shifting gold to purple to blue shadows, maximum saturation,
magical constellation map floating around character, ethereal energy field, divine light rays,
third eye glowing with cosmic wisdom, intricate mythological patterns on robes,
front facing divine sage pose, legendary presence and silhouette, AAA+ premium game quality, transparent background`,

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
  console.log(`\n✨ Generating ${config.name}...`);
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
  console.log('🔮 Generating Nova - Mythological Advisor Sprites');
  console.log('=' .repeat(60));
  console.log('Theme: Wise mystical oracle/sage companion');
  console.log('Evolution: Wisp → Young Oracle → Sage → Ancient One');
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
  console.log('✅ Nova mythological advisor sprites generated!');
  console.log('\n📁 Sprites saved to: public/assets/nova/');
  console.log('\n🎨 Refresh your browser to see Nova\'s new mystical form!');
}

main().catch(console.error);
