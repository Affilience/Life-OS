import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Stages 21-40: Synthetic → Alien → Cosmic → Transcendent
const STAGES_TO_GENERATE = {
  21: {
    name: 'Synthetic Initiate',
    filename: 'stage_21_synthetic_initiate.png',
    prompt: `highly detailed pixel art character sprite, humanoid android with smooth white synthetic skin and glowing blue circuit patterns,
sleek robotic body with chrome joints, holographic visor, energy core visible in chest,
professional cel shading with hue-shifting, blue and white color scheme, clean metallic surfaces,
crisp pixels, futuristic sci-fi character, 128x128 resolution, front facing stance`,
    negative: `blurry, organic, flesh, messy, unclear, bad anatomy, distorted, pixelated edges`,
  },
  22: {
    name: 'Data Weaver',
    filename: 'stage_22_data_weaver.png',
    prompt: `highly detailed pixel art character sprite, advanced android with translucent data-stream body,
flowing digital information visible through semi-transparent torso, holographic limbs with code fragments,
cyan and teal energy flowing through circuits, matrix-style data rain effect integrated into body,
professional cel shading, crystalline surfaces, 128x128 resolution, front facing stance`,
    negative: `blurry, solid opaque, unclear, messy, bad anatomy, human features`,
  },
  23: {
    name: 'Quantum Processor',
    filename: 'stage_23_quantum_processor.png',
    prompt: `highly detailed pixel art character sprite, quantum computing android with prismatic shifting surfaces,
body made of quantum crystalline structures, multiple overlapping transparent layers,
purple and cyan energy pulses, geometric fractal patterns on limbs, glowing quantum nodes,
professional cel shading with rainbow hue-shifting, ethereal glow effect, 128x128 resolution`,
    negative: `blurry, simple, flat colors, unclear, bad anatomy, mechanical`,
  },
  24: {
    name: 'Nanoswarm Host',
    filename: 'stage_24_nanoswarm_host.png',
    prompt: `highly detailed pixel art character sprite, being made of billions of silver nanobots,
body constantly shifting and reforming, metallic particle swarm forming humanoid shape,
tiny glowing red sensor dots throughout body, fluid mercury-like movement suggested,
professional cel shading, silver and crimson color scheme, dynamic particle effect, 128x128 resolution`,
    negative: `blurry, solid, static, unclear, bad proportions, simple design`,
  },
  25: {
    name: 'Singularity Vessel',
    filename: 'stage_25_singularity_vessel.png',
    prompt: `highly detailed pixel art character sprite, reality-bending synthetic being,
body containing visible black hole core in chest, gravitational distortion effects around edges,
dark matter armor with stars visible inside, cosmic void aesthetic, purple and black with white stars,
professional cel shading, space distortion visual effects, 128x128 resolution, otherworldly presence`,
    negative: `blurry, simple, earth-based, mechanical, unclear, bad anatomy`,
  },
  27: {
    name: 'Xenomorph Hybrid',
    filename: 'stage_27_xenomorph_hybrid.png',
    prompt: `highly detailed pixel art character sprite, alien-human hybrid with biomechanical features,
chitinous exoskeleton with bioluminescent green patterns, multiple eyes glowing emerald,
organic alien tendrils mixed with tech implants, segmented alien armor plating,
professional cel shading, green and black color scheme, xenobiology aesthetic, 128x128 resolution`,
    negative: `blurry, fully human, purely mechanical, unclear, bad anatomy, messy`,
  },
  28: {
    name: 'Psionic Mutant',
    filename: 'stage_28_psionic_mutant.png',
    prompt: `highly detailed pixel art character sprite, psychic alien hybrid with enlarged cranium,
third eye glowing with magenta energy, psychic aura radiating from head, telekinetic energy visible,
elongated fingers with psionic sparks, graceful alien proportions, purple and magenta energy effects,
professional cel shading, mystical alien presence, 128x128 resolution, ethereal glow`,
    negative: `blurry, normal human proportions, no energy effects, unclear, messy`,
  },
  29: {
    name: 'Void Walker',
    filename: 'stage_29_void_walker.png',
    prompt: `highly detailed pixel art character sprite, interdimensional alien entity,
body phasing between realities, translucent with void space visible inside, multiple dimensional echoes,
dark purple and deep blue with rift effects, tentacle-like void appendages, reality tears around body,
professional cel shading, cosmic horror aesthetic, 128x128 resolution, unsettling presence`,
    negative: `blurry, solid, earthly, simple, unclear, bad anatomy`,
  },
  30: {
    name: 'Hive Mind Node',
    filename: 'stage_30_hive_mind_node.png',
    prompt: `highly detailed pixel art character sprite, collective consciousness alien form,
multiple faces emerging from central body, neural network connections visible as golden threads,
insectoid features with crystalline hive structures, amber and gold color scheme,
professional cel shading, organic collective aesthetic, 128x128 resolution, alien intelligence`,
    negative: `blurry, single being, mechanical, unclear, bad design, messy`,
  },
  31: {
    name: 'Stellar Symbiote',
    filename: 'stage_31_stellar_symbiote.png',
    prompt: `highly detailed pixel art character sprite, alien being bonded with living starlight,
body made of condensed plasma and cosmic energy, solar flares as hair, photosphere skin texture,
orange and yellow stellar energy, corona effect around silhouette, burning with inner fusion,
professional cel shading, star-being aesthetic, 128x128 resolution, radiant luminous`,
    negative: `blurry, dark, cold colors, earthly, unclear, bad anatomy`,
  },
  32: {
    name: 'Nebula Drifter',
    filename: 'stage_32_nebula_drifter.png',
    prompt: `highly detailed pixel art character sprite, cosmic entity made of interstellar gas and dust,
body is living nebula cloud with stars forming inside, swirling cosmic mists for limbs,
pink and purple nebula colors, twinkling star particles throughout, gaseous ethereal form,
professional cel shading, space cloud aesthetic, 128x128 resolution, majestic cosmic being`,
    negative: `blurry, solid, earthly, simple, unclear, bad proportions`,
  },
  33: {
    name: 'Gravity Shaper',
    filename: 'stage_33_gravity_shaper.png',
    prompt: `highly detailed pixel art character sprite, cosmic being controlling gravitational forces,
dark matter body with visible gravitational lensing effects, spacetime bending around form,
deep blue and purple with white gravitational waves, accretion disk forming halo,
professional cel shading, physics-defying presence, 128x128 resolution, reality-warping entity`,
    negative: `blurry, simple, normal physics, earthly, unclear, messy`,
  },
  34: {
    name: 'Supernova Heart',
    filename: 'stage_34_supernova_heart.png',
    prompt: `highly detailed pixel art character sprite, being at moment of stellar explosion,
body erupting with supernova energy, brilliant white core with rainbow shockwaves,
explosive particle jets from shoulders, blinding radiance, multicolored cosmic explosion,
professional cel shading, explosive energy aesthetic, 128x128 resolution, catastrophic beauty`,
    negative: `blurry, calm, dark, simple, unclear, bad anatomy`,
  },
  35: {
    name: 'Galactic Wanderer',
    filename: 'stage_35_galactic_wanderer.png',
    prompt: `highly detailed pixel art character sprite, entity containing entire galaxy within body,
spiral galaxy visible in torso, countless stars forming limbs, galactic arms as appendages,
deep space purple and cosmic blue with millions of tiny star pixels, majestic scale suggested,
professional cel shading, galaxy-being aesthetic, 128x128 resolution, vast cosmic presence`,
    negative: `blurry, small scale, earthly, simple, unclear, bad design`,
  },
  36: {
    name: 'Dimension Weaver',
    filename: 'stage_36_dimension_weaver.png',
    prompt: `highly detailed pixel art character sprite, multidimensional cosmic entity,
body existing in multiple dimensions simultaneously, geometric impossible shapes,
tesseract patterns, 4D object shadows, kaleidoscopic shifting colors, reality fabric manipulation,
professional cel shading, abstract geometry, 128x128 resolution, mind-bending presence`,
    negative: `blurry, 3D only, simple shapes, unclear, messy, normal geometry`,
  },
  37: {
    name: 'Universe Seed',
    filename: 'stage_37_universe_seed.png',
    prompt: `highly detailed pixel art character sprite, primordial cosmic entity containing nascent universe,
big bang energy contained within form, swirling creation forces, proto-matter and energy,
brilliant white center with all colors of spectrum radiating outward, genesis aura,
professional cel shading, creation deity aesthetic, 128x128 resolution, primordial power`,
    negative: `blurry, small, simple, earthly, unclear, bad design`,
  },
  38: {
    name: 'Eternal Observer',
    filename: 'stage_38_eternal_observer.png',
    prompt: `highly detailed pixel art character sprite, timeless transcendent being beyond physical form,
translucent crystalline body with infinite fractals inside, all of time visible within,
prismatic pure energy, geometric perfection, mandala patterns, rainbow holographic aura,
professional cel shading, divine geometry, 128x128 resolution, enlightened presence`,
    negative: `blurry, opaque, simple, earthly, unclear, messy`,
  },
  39: {
    name: 'Reality Architect',
    filename: 'stage_39_reality_architect.png',
    prompt: `highly detailed pixel art character sprite, god-like being that designs universes,
body made of pure creative force, golden divine energy with blueprint patterns,
reality code visible as glowing runes, cosmic architect tools integrated into form,
professional cel shading, creator deity aesthetic, gold and white with cosmic accents, 128x128 resolution`,
    negative: `blurry, simple, dark, earthly, unclear, bad proportions`,
  },
  40: {
    name: 'Transcendent Oversoul',
    filename: 'stage_40_transcendent_oversoul.png',
    prompt: `highly detailed pixel art character sprite, ultimate transcendent god form beyond comprehension,
being of pure consciousness and infinite potential, abstract divine perfection,
prismatic diamond body radiating all colors, infinite fractal patterns, mandala wings,
brilliant white core with rainbow aurora, peak of existence, absolute perfection,
professional cel shading, supreme deity aesthetic, every color in harmony, 128x128 resolution, ultimate power`,
    negative: `blurry, simple, earthly, mundane, unclear, bad design, messy`,
  },
};

let totalCost = 0;

async function generateStage(stageNum, config) {
  console.log(`\n🎨 Generating Stage ${stageNum}: ${config.name}...`);

  try {
    // Create abort controller for 30 second timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(API_URL, {
      signal: controller.signal,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: config.prompt,
        negative_description: config.negative,
        image_size: {
          width: 128,
          height: 128,
        },
        text_guidance_scale: 8.5,
        no_background: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    clearTimeout(timeout);

    const data = await response.json();

    // Extract base64 image (remove data URL prefix if present)
    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Save to public/assets/avatar/
    const outputPath = path.join(__dirname, '..', 'public', 'assets', 'avatar', config.filename);
    fs.writeFileSync(outputPath, imageBuffer);

    // Track cost
    const cost = data.usage.usd;
    totalCost += cost;

    console.log(`✅ ${config.name} saved to ${config.filename}`);
    console.log(`   💰 Cost: $${cost.toFixed(4)} | Total: $${totalCost.toFixed(4)}`);

    return true;

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`⏱️  Timeout: ${config.name} took too long (>30s), skipping...`);
    } else {
      console.error(`❌ Failed to generate ${config.name}:`, error.message);
    }
    return false;
  }
}

async function generateAllStages() {
  console.log('🚀 ADVANCED EVOLUTION STAGES GENERATION');
  console.log('========================================');
  console.log(`Generating ${Object.keys(STAGES_TO_GENERATE).length} advanced stages (21-40)...\n`);

  const stageNumbers = Object.keys(STAGES_TO_GENERATE).map(Number).sort((a, b) => a - b);
  let successCount = 0;
  let failCount = 0;

  for (const stageNum of stageNumbers) {
    const config = STAGES_TO_GENERATE[stageNum];
    const success = await generateStage(stageNum, config);

    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // Small delay between requests to be respectful to API
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log('\n========================================');
  console.log('✨ GENERATION COMPLETE!');
  console.log(`✅ Successfully generated: ${successCount}`);
  console.log(`❌ Failed/Skipped: ${failCount}`);
  console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);
  console.log(`📁 Sprites saved to: public/assets/avatar/`);
  console.log('========================================\n');
}

generateAllStages().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
