/**
 * Generate Missing Evolution Stage Sprites
 * Priority: Stages 1-20 for complete Human → Cyborg → Synthetic progression
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Stages to generate (excluding already generated: 4, 6, 10, 19)
const STAGES_TO_GENERATE = {
  1: {
    name: 'Ordinary Human',
    filename: 'stage_01_civilian.png',
    prompt: `highly detailed pixel art character sprite, young human explorer in casual civilian clothes blue jeans and black t-shirt,
small backpack, determined confident expression, front facing heroic stance,
professional cel shading with hue-shifting, realistic human proportions, defined facial features,
clean lines crisp pixels, isometric game character style, 128x128 resolution`,
    negative: `blurry, smudged, space suit, armor, robot, alien, unclear face, bad anatomy, distorted`,
  },
  2: {
    name: 'Trainee',
    filename: 'stage_02_trainee.png',
    prompt: `highly detailed pixel art character sprite, athletic human trainee in gray sporty training gear,
fitness tracker watch on wrist, running shoes, toned physique visible, confident athletic stance,
vibrant cel shading with saturated shadows, defined muscles, front facing,
crisp clean pixel art, isometric game character, 128x128`,
    negative: `blurry, weak body, space suit, robot, unclear details, bad proportions, messy`,
  },
  3: {
    name: 'Recruit',
    filename: 'stage_03_recruit.png',
    prompt: `highly detailed pixel art character sprite, space program recruit in navy blue training jumpsuit,
orange mission patches and badges, utility belt with basic tools, professional military posture,
detailed cel shading with hue-shifting blues, academy insignia on chest and shoulders,
crisp pixel art with clean lines, front facing, 128x128`,
    negative: `blurry, civilian clothes, full space suit, robot, unclear patches, sloppy uniform`,
  },

  5: {
    name: 'Junior Astronaut',
    filename: 'stage_05_junior_astronaut.png',
    prompt: `highly detailed pixel art character sprite, junior astronaut in dark gray reinforced space suit,
upgraded helmet with bright cyan HUD visor glow, armored chest panel with tech details,
tool belt with equipment, combat boots, determined stance,
professional game-quality cel shading with vibrant cyan lights, armored shoulder pads visible,
crisp clean pixels, front facing, 128x128`,
    negative: `blurry, basic suit, white suit, robot body, unclear armor, flat colors`,
  },

  7: {
    name: 'Elite Astronaut',
    filename: 'stage_07_elite_astronaut.png',
    prompt: `highly detailed pixel art character sprite, elite astronaut in white and cobalt blue heavy combat space suit,
reinforced armor plating, glowing blue energy lines coursing through suit, advanced multi-visor helmet,
armored gauntlets with built-in weapons, powered exoskeleton visible, heroic combat stance,
professional AAA game shading with bright saturated blue glows, battle-ready appearance,
crisp detailed pixels, front facing, 128x128`,
    negative: `blurry, basic suit, no armor, robot, flat design, unclear details, muddy colors`,
  },

  8: {
    name: 'Tech Specialist',
    filename: 'stage_08_tech_specialist.png',
    prompt: `highly detailed pixel art character sprite, tech specialist in sleek silver nanoweave space suit,
holographic blue displays floating near arms, visible glowing tech implants on neck and temples,
enhanced visor with cyan data streams, silver-blue gradient suit with circuitry patterns,
compact energy pack on back, one hand showing early cybernetic enhancement,
vibrant sci-fi cel shading with electric blue glows, front facing, 128x128`,
    negative: `blurry, full robot, heavy armor, no implants, unclear tech, flat appearance`,
  },

  9: {
    name: 'Augmented Explorer',
    filename: 'stage_09_augmented_explorer.png',
    prompt: `highly detailed pixel art character sprite, augmented explorer with one full cybernetic robotic arm,
white advanced space suit with exposed chrome mechanical left arm, glowing blue joints and energy circuits,
visible tech spine implants through suit back, enhanced helmet with blue HUD,
right arm still human in suit, heroic determined pose showing off cyborg arm,
professional shading with bright blue energy flowing through mechanical parts,
crisp clean pixels mixing organic and machine, front facing, 128x128`,
    negative: `blurry, both arms robotic, full robot, no human parts visible, unclear cyborg arm`,
  },
};

// Continue with cyborg stages...
const CYBORG_STAGES = {
  11: {
    name: 'Heavy Cyborg',
    filename: 'stage_11_heavy_cyborg.png',
    prompt: `highly detailed pixel art character sprite, heavy cyborg warrior with both arms and both legs fully mechanical,
deep purple combat armor with bright orange energy core glowing in chest, mechanical chrome limbs,
shoulder-mounted weapon systems, glowing orange power lines through mechanical parts,
human torso and head with cybernetic enhancements, menacing battle stance,
vibrant cel shading with saturated purple armor and blazing orange energy,
detailed hydraulic joints visible, front facing, 128x128`,
    negative: `blurry, mostly human, weak weapons, unclear mechanical parts, flat design`,
  },

  12: {
    name: 'Battle Mech',
    filename: 'stage_12_battle_mech.png',
    prompt: `highly detailed pixel art character sprite, battle mech cyborg 80 percent mechanical body,
heavy purple and gunmetal armor plating, large orange glowing reactor in chest, energy weapon integrated into arm,
visible hydraulic joints and pistons, only upper torso and head partially human,
thick armored plating with battle damage scratches, powerful imposing stance,
professional mech shading with bright orange energy veins, mechanical details,
crisp detailed pixels, front facing, 128x128`,
    negative: `blurry, mostly human, no weapons, unclear armor, weak energy effects`,
  },

  13: {
    name: 'War Machine',
    filename: 'stage_13_war_machine.png',
    prompt: `highly detailed pixel art character sprite, war machine cyborg with full mechanical body only human head remains,
dark purple heavy mechanized armor, blazing orange energy veins throughout entire body,
dual energy weapons on arms, massive shoulder cannons, glowing orange power core,
human head with cybernetic eye implants, menacing expression, imposing war machine stance,
detailed mechanical cel shading with electric orange plasma effects,
crisp detailed mechanical parts, front facing, 128x128`,
    negative: `blurry, human body visible, weak weapons, unclear machine parts, flat appearance`,
  },

  14: {
    name: 'Combat Android',
    filename: 'stage_14_combat_android.png',
    prompt: `highly detailed pixel art character sprite, sleek combat android with synthetic humanoid face,
purple streamlined armored body with orange energy patterns, holographic blue eyes,
elegant robot design with graceful proportions, energy blade extending from one arm,
smooth synthetic face with defined features, agile ready stance,
professional android shading with glowing orange circuits and blue holographic effects,
polished metal finish, crisp clean pixels, front facing, 128x128`,
    negative: `blurry, human face, bulky armor, no energy blade, unclear features, clunky design`,
  },

  15: {
    name: 'Nanotech Knight',
    filename: 'stage_15_nanotech_knight.png',
    prompt: `highly detailed pixel art character sprite, nanotech knight with living purple metal armor,
shifting orange nanobot patterns flowing across body like liquid metal, glowing energy shield in hand,
armor appears alive and morphing, particle effects around body, heroic knight pose,
vibrant shading with purple-orange color gradient constantly shifting,
detailed nanotech surface texture, flowing cape made of nanobots,
crisp detailed pixels with motion blur effects, front facing, 128x128`,
    negative: `blurry, static armor, no particles, unclear nanotech, flat solid metal`,
  },

  16: {
    name: 'Plasma Warrior',
    filename: 'stage_16_plasma_warrior.png',
    prompt: `highly detailed pixel art character sprite, plasma warrior with purple mechanical body coursing with orange plasma energy,
partially transparent armor showing crackling plasma underneath, electric arcs between armor plates,
white energy sparks, glowing plasma weapon in hand, energy radiating from entire body,
highly saturated electric shading with bright orange-white plasma effects,
visible energy flowing through transparent sections, powerful energized stance,
crisp pixels with glow effects, front facing, 128x128`,
    negative: `blurry, solid armor, no energy, unclear plasma, flat appearance, dull colors`,
  },

  17: {
    name: 'Exo-Form',
    filename: 'stage_17_exo_form.png',
    prompt: `highly detailed pixel art character sprite, exo-form bio-mechanical hybrid alien-human fusion,
organic purple tissue merged with orange mechanical tech parts, green bio-circuits glowing,
tentacle cables extending from back, alien features emerging - extra eyes starting to appear,
biomech fusion with visible organic muscle and metal plating mixed together,
detailed organic-tech fusion shading with pulsing green bio-energy,
evolving alien form, unsettling beauty, front facing, 128x128`,
    negative: `blurry, fully mechanical, fully organic, unclear fusion, no alien features`,
  },

  18: {
    name: 'Ascended Cyborg',
    filename: 'stage_18_ascended_cyborg.png',
    prompt: `highly detailed pixel art character sprite, ascended cyborg with perfected elegant purple and gold mechanical body,
radiant orange-gold energy core pulsing with divine light, flawless proportions,
refined graceful robot design with gold trim and purple armor, transcendent glow around entire form,
premium AAA game shading with divine golden radiance, purple energy aura,
symmetrical perfect form, enlightened peaceful yet powerful pose,
crisp detailed pixels, front facing, 128x128`,
    negative: `blurry, crude design, no glow, unclear perfection, dull colors, asymmetric`,
  },

  20: {
    name: 'Photon Being',
    filename: 'stage_20_photon_being.png',
    prompt: `highly detailed pixel art character sprite, photon being with translucent golden glowing body,
semi-transparent form with visible purple energy patterns flowing inside, light rays emanating outward,
prismatic rainbow edge glow effects, barely solid appearance, energy-based humanoid,
highly detailed light-based shading with rainbow prismatic refractions,
ethereal floating pose, radiant golden-white core, purple energy streams,
crisp pixels with transparency and glow effects, front facing, 128x128`,
    negative: `blurry, solid body, no transparency, unclear light, flat appearance, dull`,
  },
};

const ALL_STAGES = { ...STAGES_TO_GENERATE, ...CYBORG_STAGES };

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
      throw new Error(`API error: ${response.status}`);
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
  const response = await fetch('https://api.pixellab.ai/v1/balance', {
    headers: { 'Authorization': `Bearer ${API_KEY}` },
  });
  const data = await response.json();
  return data.usd;
}

async function main() {
  console.log('🚀 Evolution Stage Generator');
  console.log('='

.repeat(50));

  const balance = await checkBalance();
  console.log(`\n💵 Balance: $${balance.toFixed(2)}`);

  console.log(`\n📊 Generating ${Object.keys(ALL_STAGES).length} missing stages...\n`);

  const results = [];
  for (const [stageNum, config] of Object.entries(ALL_STAGES)) {
    const result = await generateStage(parseInt(stageNum), config);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const finalBalance = await checkBalance();
  const successCount = results.filter(r => r.success).length;
  const totalCost = results.reduce((sum, r) => sum + r.cost, 0);

  console.log('\n' + '='.repeat(50));
  console.log(`\n✅ Success: ${successCount}/${results.length}`);
  console.log(`💰 Total Cost: $${totalCost.toFixed(4)}`);
  console.log(`💵 Remaining: $${finalBalance.toFixed(2)}`);
  console.log('\n🎉 Stage generation complete!');
}

main().catch(console.error);
