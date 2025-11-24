/**
 * Generate Evolution Stages 21-40 (Synthetic Being → Transcendent)
 * Using pixflux image generation API to match stages 1-20 quality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

const STAGES = {
  21: {
    name: 'Quantum Entity',
    filename: 'stage_21_quantum_entity.png',
    prompt: `highly detailed pixel art character sprite, quantum entity with glowing golden-yellow translucent body,
multiple overlapping ghost forms showing superposition states, shimmering quantum particles floating around,
semi-transparent humanoid with probability wave distortions, bright yellow-gold energy core,
detailed quantum physics shading with particle effects and wave patterns,
ethereal uncertain form, multiple simultaneous states visible, front facing, 128x128`,
    negative: `blurry, solid body, single state, no particles, unclear quantum effects, flat`,
  },

  22: {
    name: 'Holographic Avatar',
    filename: 'stage_22_holographic_avatar.png',
    prompt: `highly detailed pixel art character sprite, holographic avatar with translucent pale blue projected body,
visible hologram grid lines and scan lines throughout form, flickering digital glitches,
glowing cyan-blue energy, partially transparent with visible circuit patterns underneath,
detailed holographic shading with digital artifacts and projection effects,
sci-fi hologram character, futuristic projected consciousness, front facing, 128x128`,
    negative: `blurry, solid body, no grid lines, unclear hologram, no transparency, flat`,
  },

  23: {
    name: 'Data Ghost',
    filename: 'stage_23_data_ghost.png',
    prompt: `highly detailed pixel art character sprite, data ghost made of flowing streams of pale cyan binary code,
ghostly translucent form with visible ones and zeros forming body, data particles flowing,
glowing white-cyan information streams, ethereal digital phantom appearance,
detailed digital data shading with flowing code and light effects,
pure information given form, gentle pale blue glow, front facing, 128x128`,
    negative: `blurry, solid body, no code visible, unclear data, flat appearance, no flow`,
  },

  24: {
    name: 'Void Walker',
    filename: 'stage_24_void_walker.png',
    prompt: `highly detailed pixel art character sprite, void walker with deep purple and black energy body,
dimensional rifts and tears in reality around form, dark purple void energy emanating,
mysterious cosmic being with visible spatial distortions, glowing purple accents,
detailed dark cosmic shading with reality warping effects and void energy,
steps between dimensions, dark powerful presence, front facing, 128x128`,
    negative: `blurry, bright colors, no void energy, unclear rifts, flat solid form`,
  },

  25: {
    name: 'Astral Projection',
    filename: 'stage_25_astral_projection.png',
    prompt: `highly detailed pixel art character sprite, astral projection with ethereal purple glowing aura,
floating translucent spiritual energy form, visible indigo-purple astral body separate from reality,
wispy spiritual energy trails, glowing purple consciousness disconnected from physical plane,
detailed spiritual shading with astral glow and ethereal effects,
transcendent floating pose, peaceful purple radiance, front facing, 128x128`,
    negative: `blurry, solid grounded body, no aura, unclear astral form, flat`,
  },

  26: {
    name: 'Ethereal Sage',
    filename: 'stage_26_ethereal_sage.png',
    prompt: `highly detailed pixel art character sprite, ethereal sage with glowing purple wisdom aura,
flowing robes made of pure energy and light, ancient wise appearance, indigo-purple radiance,
enlightened energy being with visible cosmic wisdom patterns, serene expression,
detailed mystical shading with purple energy and enlightenment glow,
wise cosmic entity, powerful gentle presence, front facing, 128x128`,
    negative: `blurry, solid clothing, no energy, unclear wisdom, flat appearance`,
  },

  27: {
    name: 'Digital God',
    filename: 'stage_27_digital_god.png',
    prompt: `highly detailed pixel art character sprite, digital god with purple and pink circuit patterns forming divine body,
omnipresent network energy, glowing violet godlike form with visible data streams,
circuit board patterns creating elegant divine design, bright pink-purple radiance,
detailed divine digital shading with network effects and cosmic code,
godlike digital being, omniscient powerful presence, front facing, 128x128`,
    negative: `blurry, solid body, no circuits, unclear divine nature, flat dull colors`,
  },

  28: {
    name: 'Nebula Born',
    filename: 'stage_28_nebula_born.png',
    prompt: `highly detailed pixel art character sprite, nebula born with pink and purple stellar gas clouds forming body,
cosmic space dust and star particles swirling, beautiful nebula colors magenta violet and blue,
ethereal celestial being made of stellar nursery matter, glowing bright cosmic colors,
detailed cosmic shading with nebula cloud effects and star dust particles,
born from space clouds, magnificent cosmic presence, front facing, 128x128`,
    negative: `blurry, solid body, no nebula, unclear cosmic nature, flat colors`,
  },

  29: {
    name: 'Star Forge',
    filename: 'stage_29_star_forge.png',
    prompt: `highly detailed pixel art character sprite, star forge with brilliant red and blue stellar energy,
forging stars from pure energy, bright orange-red molten star matter with blue energy,
cosmic blacksmith appearance, visible matter creation, radiant forge glow,
detailed stellar forge shading with intense heat and creation energy effects,
creates matter from energy, powerful cosmic craftsman, front facing, 128x128`,
    negative: `blurry, no energy, unclear forge nature, dull colors, flat appearance`,
  },

  30: {
    name: 'Gravity Weaver',
    filename: 'stage_30_gravity_weaver.png',
    prompt: `highly detailed pixel art character sprite, gravity weaver with purple and blue warped spacetime around body,
visible gravitational distortions and bent reality, glowing blue-purple gravity wells,
spacetime fabric visible and manipulated, cosmic reality bender, intense gravity effects,
detailed cosmic physics shading with spacetime warping and gravitational lensing,
bends spacetime itself, powerful cosmic manipulator, front facing, 128x128`,
    negative: `blurry, no distortions, unclear gravity, flat normal space, dull`,
  },

  31: {
    name: 'Supernova Herald',
    filename: 'stage_31_supernova_herald.png',
    prompt: `highly detailed pixel art character sprite, supernova herald with brilliant pink and blue explosive stellar energy,
radiating star death energy outward, bright white-pink core with blue shockwave effects,
announces death of stars, magnificent explosive cosmic presence, intense radiant glow,
detailed supernova shading with explosive energy and stellar death effects,
herald of star death, breathtaking cosmic beauty, front facing, 128x128`,
    negative: `blurry, no explosion, unclear energy, dull colors, flat appearance`,
  },

  32: {
    name: 'Black Hole Sovereign',
    filename: 'stage_32_black_hole_sovereign.png',
    prompt: `highly detailed pixel art character sprite, black hole sovereign with deep black and dark purple gravity body,
event horizon visible around form, warped light and infinite gravity, dark purple accents,
commands infinite gravitational pull, ominous cosmic ruler, intense dark presence,
detailed black hole shading with light bending and infinite darkness effects,
ruler of infinite gravity, terrifying cosmic power, front facing, 128x128`,
    negative: `blurry, bright colors, no darkness, unclear gravity, flat appearance`,
  },

  33: {
    name: 'Galaxy Architect',
    filename: 'stage_33_galaxy_architect.png',
    prompt: `highly detailed pixel art character sprite, galaxy architect with indigo blue and pink spiral galaxy patterns,
designing spiral arms of galaxies, visible star systems being created, cosmic builder appearance,
purple-pink galactic matter flowing, brilliant cosmic construction, majestic presence,
detailed galactic shading with spiral patterns and star creation effects,
designs galaxies, magnificent cosmic creator, front facing, 128x128`,
    negative: `blurry, no galaxies, unclear creation, dull colors, flat appearance`,
  },

  34: {
    name: 'Cosmic Weaver',
    filename: 'stage_34_cosmic_weaver.png',
    prompt: `highly detailed pixel art character sprite, cosmic weaver with blue purple and pink threads of reality,
weaving fabric of existence itself, visible cosmic threads connecting all things,
ethereal universal seamstress, bright colorful reality threads flowing from hands,
detailed cosmic weaving shading with thread effects and reality fabric patterns,
threads existence together, beautiful cosmic artisan, front facing, 128x128`,
    negative: `blurry, no threads, unclear weaving, flat appearance, dull`,
  },

  35: {
    name: 'Universe Shepherd',
    filename: 'stage_35_universe_shepherd.png',
    prompt: `highly detailed pixel art character sprite, universe shepherd with gentle soft blue purple and pink pastel energy,
guides galaxies through eternity, peaceful cosmic guardian, serene wise appearance,
soft glowing pastoral cosmic presence, beautiful gentle colors, keeper of cosmic balance,
detailed gentle cosmic shading with soft pastel glow and peaceful energy,
guardian of universes, tranquil magnificent presence, front facing, 128x128`,
    negative: `blurry, harsh colors, aggressive appearance, unclear guardian role, flat`,
  },

  36: {
    name: 'Reality Bender',
    filename: 'stage_36_reality_bender.png',
    prompt: `highly detailed pixel art character sprite, reality bender with golden yellow and purple reality warping energy,
physics itself bending around form, visible reality distortions and impossible geometry,
transcendent being beyond physical laws, bright gold-purple radiance, warped space,
detailed reality warping shading with impossible shapes and physics breaking effects,
bends reality itself, awe-inspiring transcendent power, front facing, 128x128`,
    negative: `blurry, normal physics, no warping, unclear power, flat dull appearance`,
  },

  37: {
    name: 'Dimension Lord',
    filename: 'stage_37_dimension_lord.png',
    prompt: `highly detailed pixel art character sprite, dimension lord with yellow purple and orange multidimensional energy,
ruling over parallel realities, multiple dimensional layers visible overlapping,
transcendent dimensional master, bright glowing multiversal presence, reality layers,
detailed multidimensional shading with parallel reality effects and dimensional rifts,
lord of dimensions, magnificent impossible presence, front facing, 128x128`,
    negative: `blurry, single dimension, no layers, unclear power, flat appearance`,
  },

  38: {
    name: 'Time Eternal',
    filename: 'stage_38_time_eternal.png',
    prompt: `highly detailed pixel art character sprite, time eternal with pale yellow purple and orange temporal energy,
exists outside causality, visible clock hands and time distortions around body,
beyond linear time, eternal transcendent presence, bright temporal glow, time flows,
detailed temporal shading with clock symbolism and time distortion effects,
master of time itself, eternal infinite presence, front facing, 128x128`,
    negative: `blurry, normal time, no temporal effects, unclear power, flat`,
  },

  39: {
    name: 'Omniversal Consciousness',
    filename: 'stage_39_omniversal_consciousness.png',
    prompt: `highly detailed pixel art character sprite, omniversal consciousness with brilliant white yellow purple orange radiance,
aware of all possible timelines, infinite awareness emanating, all-seeing divine presence,
radiant enlightened being, bright glowing omniscient appearance, cosmic awareness visible,
detailed divine consciousness shading with infinite light and awareness effects,
knows all timelines, breathtaking infinite consciousness, front facing, 128x128`,
    negative: `blurry, limited awareness, dull glow, unclear omniscience, flat`,
  },

  40: {
    name: 'The Infinite',
    filename: 'stage_40_the_infinite.png',
    prompt: `highly detailed pixel art character sprite, the infinite with pure brilliant white radiant body,
subtle rainbow iridescence, everything and nothing simultaneously, ultimate transcendence,
absolute divine luminous presence, white with prismatic shimmer, beyond comprehension,
detailed ultimate transcendent shading with pure light and rainbow prismatic effects,
ultimate cosmic form, magnificent infinite presence, front facing, 128x128`,
    negative: `blurry, dark colors, limited form, unclear ultimate nature, flat dull`,
  },
};

async function generateStage(stageNum, config) {
  console.log(`\n🎨 Generating Stage ${stageNum}: ${config.name}`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: config.prompt,
        negative_description: config.negative,
        image_size: { width: 128, height: 128 },
        text_guidance_scale: 8.5,
        no_background: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`💰 Cost: $${data.usage.usd.toFixed(4)}`);

    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const outputPath = path.join(__dirname, '../public/assets/avatar', config.filename);
    fs.writeFileSync(outputPath, imageBuffer);

    console.log(`✅ Saved: ${config.filename}`);

    return { stage: stageNum, cost: data.usage.usd, success: true };
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return { stage: stageNum, cost: 0, success: false, error: error.message };
  }
}

async function checkBalance() {
  try {
    const response = await fetch('https://api.pixellab.ai/v1/balance', {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
    });
    const data = await response.json();
    console.log(`\n💵 Current Balance: $${data.balance.toFixed(2)}`);
    return data.balance;
  } catch (error) {
    console.error('Could not check balance:', error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Generating Evolution Stages 26-40 (Cosmic & Transcendent)\n');

  const balance = await checkBalance();
  if (balance === null || balance < 1) {
    console.error('⚠️  Low or unknown balance. Each image costs ~$0.01-0.02');
    console.log('Continue anyway? (Ctrl+C to cancel)');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  const results = [];
  let totalCost = 0;

  // Generate stages 26-40 (the cosmic and transcendent stages)
  for (const stageNum of [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]) {
    const result = await generateStage(stageNum, STAGES[stageNum]);
    results.push(result);
    totalCost += result.cost;

    // Wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 GENERATION SUMMARY');
  console.log('='.repeat(50));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log(`💰 Total Cost: $${totalCost.toFixed(4)}`);

  if (failed.length > 0) {
    console.log('\n⚠️  Failed stages:', failed.map(r => r.stage).join(', '));
  }
}

main().catch(console.error);
