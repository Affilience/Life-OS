/**
 * Hero Evolution Sprite Generator V2 - WITH CHARACTER CONTINUITY
 * Generates 40 character sprites with CONSISTENT appearance
 *
 * CORE CHARACTER TRAITS (never change):
 * - Male character
 * - Short brown hair
 * - Determined facial expression
 * - Athletic build
 * - Fair/light skin tone
 * - Brown eyes
 *
 * WHAT CHANGES: Equipment, armor, weapons, posture, magical effects, power auras
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Character continuity string - ALWAYS included in every prompt
const CHARACTER_BASE = `male character with short brown hair, determined facial expression, athletic build, fair skin tone, brown eyes`;

// 40 Stage Hero's Journey WITH CHARACTER CONTINUITY
const EVOLUTION_STAGES = [
  // ACT I: THE AWAKENING (1-10) - Civilian to Warrior
  {
    level: 1,
    name: 'Dreamer',
    description: `highly detailed pixel art ${CHARACTER_BASE}, casual brown tunic and simple pants, slouched relaxed posture standing with hands in pockets, hopeful demeanor, everyday civilian clothes, isometric game character, 128x128`,
    tier: 'awakening',
    colors: ['#8B7355', '#A0826D', '#D4C5B9']
  },
  {
    level: 2,
    name: 'Seeker',
    description: `highly detailed pixel art ${CHARACTER_BASE}, simple traveler clothes with leather satchel across chest, wooden walking stick in right hand, standing tall with determined upright posture, earth tone clothing, isometric game character, 128x128`,
    tier: 'awakening',
    colors: ['#8B7355', '#6B5D4F', '#A0826D']
  },
  {
    level: 3,
    name: 'Recruit',
    description: `highly detailed pixel art ${CHARACTER_BASE}, basic training cloth outfit, wooden practice sword held at side in right hand, beginner fighter stance, brown and tan training clothes, isometric game character, 128x128`,
    tier: 'awakening',
    colors: ['#A0826D', '#8B7355', '#D4C5B9']
  },
  {
    level: 4,
    name: 'Trainee',
    description: `highly detailed pixel art ${CHARACTER_BASE}, light cloth armor tunic with basic leather belt, wooden practice staff held in both hands, more confident warrior stance, beige and light brown armor, isometric game character, 128x128`,
    tier: 'awakening',
    colors: ['#D4C5B9', '#A0826D', '#8B7355']
  },
  {
    level: 5,
    name: 'Squire',
    description: `highly detailed pixel art ${CHARACTER_BASE}, leather chest armor, iron short sword sheathed at hip, small wooden buckler shield on left arm, proper warrior ready stance, brown leather with iron metal, isometric game character, 128x128`,
    tier: 'awakening',
    colors: ['#8B7355', '#6B5D4F', '#C0C0C0']
  },
  {
    level: 6,
    name: 'Initiate',
    description: `highly detailed pixel art ${CHARACTER_BASE}, light chainmail shirt over cloth, round wooden shield with iron boss in left hand, basic iron sword drawn in right hand, combat ready pose, silver chainmail, isometric game character, 128x128`,
    tier: 'awakening',
    colors: ['#C0C0C0', '#8B7355', '#A8A8A8']
  },
  {
    level: 7,
    name: 'Footman',
    description: `highly detailed pixel art ${CHARACTER_BASE}, full leather armor with metal studs, iron-tipped spear in right hand, medium round shield in left, helmet with nose guard on head, soldier stance, dark brown leather with iron, isometric game character, 128x128`,
    tier: 'awakening',
    colors: ['#6B5D4F', '#C0C0C0', '#8B7355']
  },
  {
    level: 8,
    name: 'Scout',
    description: `highly detailed pixel art ${CHARACTER_BASE}, hooded forest green leather armor with cloak, longbow held in left hand with arrow nocked, quiver of arrows on back, light boots, agile crouched stance, forest green and brown, isometric game character, 128x128`,
    tier: 'awakening',
    colors: ['#4A7C59', '#8B7355', '#6B5D4F']
  },
  {
    level: 9,
    name: 'Warrior',
    description: `highly detailed pixel art ${CHARACTER_BASE}, iron plate chest armor over leather, iron longsword raised in right hand ready to strike, aggressive battle stance, leather pants and boots, battle-worn appearance, dark iron and leather, isometric game character, 128x128`,
    tier: 'awakening',
    colors: ['#6B6B6B', '#8B7355', '#4A4A4A']
  },
  {
    level: 10,
    name: 'Swordsman',
    description: `highly detailed pixel art ${CHARACTER_BASE}, polished steel chest armor with steel pauldrons on shoulders, dual wielding iron swords in both hands, confident combat ready stance, shining steel armor, isometric game character, 128x128`,
    tier: 'awakening',
    colors: ['#C0C0C0', '#8B7355', '#E8E8E8']
  },

  // ACT II: THE TRIALS (11-20) - Specialist Evolution
  {
    level: 11,
    name: 'Duelist',
    description: `highly detailed pixel art ${CHARACTER_BASE}, elegant light blue armor with decorative silver trim, rapier in right hand and dagger in left, agile fencing stance, feathered cavalier hat on head, deep blue and silver, isometric game character, 128x128`,
    tier: 'trials',
    colors: ['#1E3A8A', '#C0C0C0', '#3B82F6']
  },
  {
    level: 12,
    name: 'Berserker',
    description: `highly detailed pixel art ${CHARACTER_BASE}, fur-trimmed barbarian armor with tribal patterns, massive two-handed battle axe raised high, fierce aggressive wild stance, brown fur and dark iron armor, isometric game character, 128x128`,
    tier: 'trials',
    colors: ['#8B4513', '#6B5D4F', '#4A4A4A']
  },
  {
    level: 13,
    name: 'Knight',
    description: `highly detailed pixel art ${CHARACTER_BASE}, full polished plate armor with engraved details, large kite shield with red heraldic crest in left hand, longsword in right, noble upright honorable stance, shining silver with red crest, isometric game character, 128x128`,
    tier: 'trials',
    colors: ['#E8E8E8', '#DC2626', '#C0C0C0']
  },
  {
    level: 14,
    name: 'Ranger',
    description: `highly detailed pixel art ${CHARACTER_BASE}, forest green hooded cloak and leather armor, ornate longbow drawn with arrow nocked ready to fire, quiver full of feathered arrows on back, forest ranger stance, deep green and brown, isometric game character, 128x128`,
    tier: 'trials',
    colors: ['#166534', '#8B7355', '#4A7C59']
  },
  {
    level: 15,
    name: 'Paladin',
    description: `highly detailed pixel art ${CHARACTER_BASE}, silver holy armor with golden cross symbols engraved, glowing blessed sword radiating soft light in right hand, small ornate shield in left, righteous warrior pose, white silver and gold with holy glow, isometric game character, 128x128`,
    tier: 'trials',
    colors: ['#F3F4F6', '#FCD34D', '#E8E8E8']
  },
  {
    level: 16,
    name: 'Monk',
    description: `highly detailed pixel art ${CHARACTER_BASE}, flowing orange martial arts robes with white sash belt, wooden bo staff held in combat ready stance, prayer beads around neck, disciplined meditation warrior pose, orange and white robes, isometric game character, 128x128`,
    tier: 'trials',
    colors: ['#EA580C', '#F3F4F6', '#DC2626']
  },
  {
    level: 17,
    name: 'Assassin',
    description: `highly detailed pixel art ${CHARACTER_BASE}, dark hooded black cloak covering head and shoulders, black leather armor with straps, dual curved daggers in hands, stealth crouch combat pose, face partially masked, pure black with dark purple, isometric game character, 128x128`,
    tier: 'trials',
    colors: ['#1F1F1F', '#6B21A8', '#4A4A4A']
  },
  {
    level: 18,
    name: 'Battlemage',
    description: `highly detailed pixel art ${CHARACTER_BASE}, purple wizard robes with light silver armor plates on shoulders and chest, wooden staff with glowing purple crystal at top, purple arcane energy crackling around hands, spellcaster battle stance, purple and silver, isometric game character, 128x128`,
    tier: 'trials',
    colors: ['#7C3AED', '#C0C0C0', '#A855F7']
  },
  {
    level: 19,
    name: 'Champion',
    description: `highly detailed pixel art ${CHARACTER_BASE}, ornate gold and blue tournament plate armor with engravings, jousting lance held high in right hand, champion banner with crest on back, victorious proud pose, polished gold and royal blue, isometric game character, 128x128`,
    tier: 'trials',
    colors: ['#FCD34D', '#1E3A8A', '#F59E0B']
  },
  {
    level: 20,
    name: 'Veteran',
    description: `highly detailed pixel art ${CHARACTER_BASE}, battle-worn dark plate armor with visible dents and scratches, multiple weapons sheathed on back and belt, scarred weathered appearance, weary but strong battle-hardened stance, dark iron and steel, isometric game character, 128x128`,
    tier: 'trials',
    colors: ['#4A4A4A', '#6B6B6B', '#8B7355']
  },

  // ACT III: MASTERY (21-30) - Master Class
  {
    level: 21,
    name: 'Blade Master',
    description: `highly detailed pixel art ${CHARACTER_BASE}, masterwork silver armor with intricate patterns, enchanted katana glowing bright blue in right hand, perfect battle ready stance, flowing cape billowing behind, blue magical aura around body, silver with blue energy, isometric game character, 128x128`,
    tier: 'mastery',
    colors: ['#C0C0C0', '#3B82F6', '#60A5FA']
  },
  {
    level: 22,
    name: 'War Chief',
    description: `highly detailed pixel art ${CHARACTER_BASE}, tribal chieftain armor with bone decorations and animal pelts, red war paint markings on face and arms, massive ornate war hammer in hands, commanding leadership pose, brown bone and red paint, isometric game character, 128x128`,
    tier: 'mastery',
    colors: ['#8B4513', '#DC2626', '#F3F4F6']
  },
  {
    level: 23,
    name: 'Dragon Knight',
    description: `highly detailed pixel art ${CHARACTER_BASE}, armor made of crimson dragon scales with gold trim, dragon-horned helmet on head, dragon-slayer greatsword in hands, powerful dragon-slaying stance, crimson dragon scales with gold, isometric game character, 128x128`,
    tier: 'mastery',
    colors: ['#DC2626', '#FCD34D', '#991B1B']
  },
  {
    level: 24,
    name: 'Shadow Master',
    description: `highly detailed pixel art ${CHARACTER_BASE}, shadowy dark armor with ethereal cloak billowing with darkness, twin daggers with purple smoke trail effects in hands, purple smoke wisps swirling around body, shadow stance, black with purple effects, isometric game character, 128x128`,
    tier: 'mastery',
    colors: ['#1F1F1F', '#7C3AED', '#4A4A4A']
  },
  {
    level: 25,
    name: 'Holy Crusader',
    description: `highly detailed pixel art ${CHARACTER_BASE}, divine golden armor with angel wing motif engraved on chest, holy sword radiating bright light in right hand, golden halo glow above head, righteous crusader pose, brilliant gold and white divine light, isometric game character, 128x128`,
    tier: 'mastery',
    colors: ['#FCD34D', '#F3F4F6', '#F59E0B']
  },
  {
    level: 26,
    name: 'Arcane Warrior',
    description: `highly detailed pixel art ${CHARACTER_BASE}, silver armor covered in glowing purple magical runes, floating purple spell tome beside character, staff crackling with purple arcane power in right hand, purple arcane energy swirling, silver with purple runes, isometric game character, 128x128`,
    tier: 'mastery',
    colors: ['#C0C0C0', '#7C3AED', '#A855F7']
  },
  {
    level: 27,
    name: 'Beast Master',
    description: `highly detailed pixel art ${CHARACTER_BASE}, wild leather armor with animal pelts, spectral green wolf companion at side, eagle perched on left shoulder, nature staff with green crystal in right hand, primal nature stance, brown leather with green magic, isometric game character, 128x128`,
    tier: 'mastery',
    colors: ['#8B7355', '#10B981', '#4A7C59']
  },
  {
    level: 28,
    name: 'Demon Hunter',
    description: `highly detailed pixel art ${CHARACTER_BASE}, black armor decorated with demon skulls, glowing red runic tattoos visible on arms and face, heavy crossbow in hands, demon-slaying sword on back, aggressive hunter pose, black armor with red runes, isometric game character, 128x128`,
    tier: 'mastery',
    colors: ['#1F1F1F', '#DC2626', '#991B1B']
  },
  {
    level: 29,
    name: 'Storm Lord',
    description: `highly detailed pixel art ${CHARACTER_BASE}, lightning-themed blue armor with electricity effects, white lightning bolts crackling around entire body, storm hammer glowing with electric power, commanding storm pose, electric blue with white lightning, isometric game character, 128x128`,
    tier: 'mastery',
    colors: ['#3B82F6', '#F3F4F6', '#1E3A8A']
  },
  {
    level: 30,
    name: 'Warlord',
    description: `highly detailed pixel art ${CHARACTER_BASE}, ornate ruby red commanding general armor with gold medals, war banner with insignia on back, decorated gold greatsword in hands, supreme general commanding pose, ruby red and gold royal armor, isometric game character, 128x128`,
    tier: 'mastery',
    colors: ['#DC2626', '#FCD34D', '#991B1B']
  },

  // ACT IV: LEGEND (31-40) - Mythic Transformation
  {
    level: 31,
    name: 'Sword Saint',
    description: `highly detailed pixel art ${CHARACTER_BASE}, transcendent white robes with light silver armor plates, legendary katana radiating pure white energy in hands, enlightened master stance, white and silver with pure light aura, isometric game character, 128x128`,
    tier: 'legend',
    colors: ['#F3F4F6', '#E8E8E8', '#60A5FA']
  },
  {
    level: 32,
    name: 'Phoenix Knight',
    description: `highly detailed pixel art ${CHARACTER_BASE}, armor wreathed in eternal orange flames, phoenix-themed helmet with fire crest on head, flaming sword burning bright in hands, fire wings spread from back, orange flames and gold, isometric game character, 128x128`,
    tier: 'legend',
    colors: ['#EA580C', '#FCD34D', '#F59E0B']
  },
  {
    level: 33,
    name: 'Void Stalker',
    description: `highly detailed pixel art ${CHARACTER_BASE}, reality-warping dark purple armor with void effects, purple void energy swirling like black holes around body, ethereal blades made of purple darkness in hands, space distortion effects, deep purple void with stars, isometric game character, 128x128`,
    tier: 'legend',
    colors: ['#4C1D95', '#7C3AED', '#1F1F1F']
  },
  {
    level: 34,
    name: 'Celestial Guardian',
    description: `highly detailed pixel art ${CHARACTER_BASE}, angelic golden armor with wing engravings, divine radiant golden energy wings spread wide from back, holy lance glowing in hands, protective guardian stance, radiant gold and white, isometric game character, 128x128`,
    tier: 'legend',
    colors: ['#FCD34D', '#F3F4F6', '#F59E0B']
  },
  {
    level: 35,
    name: 'Titan Slayer',
    description: `highly detailed pixel art ${CHARACTER_BASE}, massive heavy dark steel plate armor, colossal two-handed sword larger than character held in hands, giant-slaying trophies on armor, powerful grounded titan-killer stance, dark steel with red, isometric game character, 128x128`,
    tier: 'legend',
    colors: ['#4A4A4A', '#DC2626', '#6B6B6B']
  },
  {
    level: 36,
    name: 'Elemental Lord',
    description: `highly detailed pixel art ${CHARACTER_BASE}, armor with all four elements swirling around body (fire water earth air orbiting), prismatic rainbow energy weapon in hands, elements in perfect harmony around character, multi-colored elemental power, isometric game character, 128x128`,
    tier: 'legend',
    colors: ['#DC2626', '#3B82F6', '#10B981', '#F59E0B']
  },
  {
    level: 37,
    name: 'Immortal Champion',
    description: `highly detailed pixel art ${CHARACTER_BASE}, timeless ancient platinum armor with eternal blue runes glowing, ageless perfect form, legendary floating artifacts orbiting body, transcendent immortal stance, platinum with eternal blue glow, isometric game character, 128x128`,
    tier: 'legend',
    colors: ['#E8E8E8', '#3B82F6', '#C0C0C0']
  },
  {
    level: 38,
    name: 'Godslayer',
    description: `highly detailed pixel art ${CHARACTER_BASE}, armor forged from cosmic divine metal with purple and gold patterns, cosmic weapon of ultimate power crackling in hands, reality-breaking purple aura surrounding entire body, supreme godkiller stance, cosmic purple and gold, isometric game character, 128x128`,
    tier: 'legend',
    colors: ['#7C3AED', '#FCD34D', '#4C1D95']
  },
  {
    level: 39,
    name: 'Ascendant',
    description: `highly detailed pixel art ${CHARACTER_BASE}, semi-divine transcendent form glowing with pure energy, radiant rainbow prismatic energy flowing around body, perfect enlightened posture, reality transcending rainbow aura, pure white and rainbow energy, isometric game character, 128x128`,
    tier: 'legend',
    colors: ['#F3F4F6', '#A855F7', '#60A5FA', '#10B981']
  },
  {
    level: 40,
    name: 'Avatar of Mastery',
    description: `highly detailed pixel art ${CHARACTER_BASE}, perfect peak form with ultimate balanced armor, legendary aura of ultimate achievement with all colors swirling, transcendent peaceful power pose, harmonious blend of ALL elements (gold purple blue red green) in perfect balance, isometric game character, 128x128`,
    tier: 'legend',
    colors: ['#F3F4F6', '#FCD34D', '#7C3AED', '#DC2626', '#10B981']
  },
];

// Generation parameters
const GENERATION_PARAMS = {
  width: 128,
  height: 128,
  text_guidance_scale: 8.5,
  no_background: true,
};

const NEGATIVE_PROMPT = `blurry, smudged, muddy colors, low contrast, unclear silhouette, messy lines,
distorted anatomy, asymmetric, watermark, signature, text, jpeg artifacts, dull colors, flat shading,
bad proportions, deformed, ugly, cropped, low quality, normal quality, worst quality,
different person, female, woman, girl, long hair, blonde hair, red hair, black hair, different hair color, different face, different character`;

async function generateStage(stage) {
  console.log(`\n🎨 Generating Level ${stage.level}: ${stage.name} (${stage.tier})`);
  console.log(`📝 Color palette: ${stage.colors.join(', ')}`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: stage.description,
        negative_description: NEGATIVE_PROMPT,
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

    // Decode base64 image
    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Save to assets folder (v2 folder for continuity version)
    const filename = `hero_v2_stage_${stage.level}_${stage.name.toLowerCase().replace(/ /g, '_')}.png`;
    const outputPath = path.join(__dirname, '../public/assets/avatar/evolution', filename);

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, imageBuffer);

    console.log(`✅ Saved: ${filename}`);

    return {
      level: stage.level,
      name: stage.name,
      tier: stage.tier,
      filename: filename,
      cost: data.usage.usd,
      success: true,
    };

  } catch (error) {
    console.error(`❌ Error generating Level ${stage.level}:`, error.message);
    return {
      level: stage.level,
      name: stage.name,
      tier: stage.tier,
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
  console.log('🚀 Hero Evolution Sprite Generator V2 - WITH CHARACTER CONTINUITY');
  console.log('=' .repeat(70));
  console.log('\n🎭 CONSISTENT CHARACTER TRAITS:');
  console.log('  - Male with short brown hair');
  console.log('  - Determined facial features');
  console.log('  - Athletic build, fair skin');
  console.log('  - Brown eyes');
  console.log('\n  ✨ ONLY equipment, posture, and powers change!\n');
  console.log('=' .repeat(70));

  // Check initial balance
  const initialBalance = await checkBalance();
  if (initialBalance === null) {
    console.error('❌ Failed to check API balance');
    process.exit(1);
  }

  console.log(`\n💵 Initial Balance: $${initialBalance.toFixed(2)}`);

  // Estimate cost
  const estimatedCost = EVOLUTION_STAGES.length * 0.01;
  console.log(`📊 Estimated Cost: $${estimatedCost.toFixed(2)} (40 sprites)`);

  if (initialBalance < estimatedCost) {
    console.error(`❌ Insufficient balance. Need at least $${estimatedCost.toFixed(2)}`);
    process.exit(1);
  }

  console.log('\n📊 Generating 40 hero evolution stages...');
  console.log('🎭 ACT I: THE AWAKENING (1-10) - Civilian to Warrior');
  console.log('⚔️  ACT II: THE TRIALS (11-20) - Specialist Evolution');
  console.log('🏆 ACT III: MASTERY (21-30) - Master Class');
  console.log('✨ ACT IV: LEGEND (31-40) - Mythic Transformation\n');

  const results = [];

  // Generate each stage sequentially
  for (let i = 0; i < EVOLUTION_STAGES.length; i++) {
    const stage = EVOLUTION_STAGES[i];
    const result = await generateStage(stage);
    results.push(result);

    // Progress indicator
    const progress = ((i + 1) / EVOLUTION_STAGES.length * 100).toFixed(1);
    console.log(`📈 Progress: ${i + 1}/${EVOLUTION_STAGES.length} (${progress}%)`);

    // Delay between requests to avoid rate limiting
    if (i < EVOLUTION_STAGES.length - 1) {
      console.log('⏳ Waiting 12 seconds before next generation...');
      await new Promise(resolve => setTimeout(resolve, 12000));
    }
  }

  // Check final balance
  const finalBalance = await checkBalance();

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 GENERATION SUMMARY');
  console.log('='.repeat(70));

  const successCount = results.filter(r => r.success).length;
  const totalCost = results.reduce((sum, r) => sum + r.cost, 0);

  console.log(`\n✅ Successful: ${successCount}/40`);
  console.log(`💰 Total Cost: $${totalCost.toFixed(4)}`);
  console.log(`💵 Remaining Balance: $${finalBalance ? finalBalance.toFixed(2) : 'N/A'}`);

  // Act breakdown
  const acts = {
    awakening: results.filter(r => r.tier === 'awakening' && r.success).length,
    trials: results.filter(r => r.tier === 'trials' && r.success).length,
    mastery: results.filter(r => r.tier === 'mastery' && r.success).length,
    legend: results.filter(r => r.tier === 'legend' && r.success).length,
  };

  console.log('\n📊 Success by Act:');
  console.log(`  🎭 ACT I - Awakening: ${acts.awakening}/10`);
  console.log(`  ⚔️  ACT II - Trials: ${acts.trials}/10`);
  console.log(`  🏆 ACT III - Mastery: ${acts.mastery}/10`);
  console.log(`  ✨ ACT IV - Legend: ${acts.legend}/10`);

  // Save metadata
  const metadata = {
    version: 2,
    characterContinuity: true,
    baseCharacter: 'male with short brown hair, determined features, athletic build, fair skin, brown eyes',
    generatedAt: new Date().toISOString(),
    totalStages: EVOLUTION_STAGES.length,
    successCount,
    totalCost,
    stages: results.map(r => ({
      level: r.level,
      name: r.name,
      tier: r.tier,
      filename: r.filename,
      success: r.success,
    }))
  };

  const metadataPath = path.join(__dirname, '../data/heroEvolutionV2Metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`\n📁 Metadata saved: ${metadataPath}`);

  if (successCount === 40) {
    console.log('\n🎉 All 40 stages generated successfully with CHARACTER CONTINUITY!');
    console.log('📝 Same person throughout the entire journey!');
  } else {
    console.log(`\n⚠️  ${40 - successCount} stages failed. Check errors above.`);
  }
}

// Run the generator
main().catch(console.error);
