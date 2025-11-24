/**
 * Hero Evolution Sprite Generator
 * Generates 40 dramatically different character sprites for the hero progression system
 *
 * ACT I: THE AWAKENING (1-10) - Civilian to Warrior
 * ACT II: THE TRIALS (11-20) - Specialist Evolution
 * ACT III: MASTERY (21-30) - Master Class
 * ACT IV: LEGEND (31-40) - Mythic Transformation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// 40 Stage Hero's Journey Character Evolution
const EVOLUTION_STAGES = [
  // ACT I: THE AWAKENING (1-10) - Civilian to Warrior
  {
    level: 1,
    name: 'Dreamer',
    description: 'highly detailed pixel art young person in casual tunic and pants, slouched relaxed posture, hopeful expression, simple cloth clothes in brown tones, hands in pockets, everyday civilian, isometric character, 128x128',
    tier: 'awakening',
    colors: ['#8B7355', '#A0826D', '#D4C5B9']
  },
  {
    level: 2,
    name: 'Seeker',
    description: 'highly detailed pixel art young traveler standing tall with determined expression, simple traveler clothes, leather satchel across chest, wooden walking stick in hand, earth tone colors, confident posture, isometric character, 128x128',
    tier: 'awakening',
    colors: ['#8B7355', '#6B5D4F', '#A0826D']
  },
  {
    level: 3,
    name: 'Recruit',
    description: 'highly detailed pixel art basic training outfit, simple cloth shirt and pants, wooden practice sword held at side, beginner fighter stance, brown and tan colors, young warrior trainee, isometric character, 128x128',
    tier: 'awakening',
    colors: ['#A0826D', '#8B7355', '#D4C5B9']
  },
  {
    level: 4,
    name: 'Trainee',
    description: 'highly detailed pixel art light cloth armor tunic, practice wooden staff held in both hands, basic leather belt, more confident warrior stance, beige and light brown armor, training warrior, isometric character, 128x128',
    tier: 'awakening',
    colors: ['#D4C5B9', '#A0826D', '#8B7355']
  },
  {
    level: 5,
    name: 'Squire',
    description: 'highly detailed pixel art leather armor chest piece, iron short sword at hip in sheath, small wooden buckler shield on arm, proper warrior stance, brown leather with iron metal accents, young fighter, isometric character, 128x128',
    tier: 'awakening',
    colors: ['#8B7355', '#6B5D4F', '#C0C0C0']
  },
  {
    level: 6,
    name: 'Initiate',
    description: 'highly detailed pixel art light chainmail shirt over cloth, round wooden shield with iron boss, basic iron sword drawn and ready, warrior ready combat pose, silver chainmail with brown leather, isometric character, 128x128',
    tier: 'awakening',
    colors: ['#C0C0C0', '#8B7355', '#A8A8A8']
  },
  {
    level: 7,
    name: 'Footman',
    description: 'highly detailed pixel art full leather armor with metal studs, iron-tipped spear and medium round shield, helmet with nose guard, soldier stance, dark brown leather with iron trim details, isometric character, 128x128',
    tier: 'awakening',
    colors: ['#6B5D4F', '#C0C0C0', '#8B7355']
  },
  {
    level: 8,
    name: 'Scout',
    description: 'highly detailed pixel art hooded leather armor with forest cloak, longbow in hand with arrow nocked, quiver full of arrows on back, light boots, agile stance, forest green and brown leather, isometric character, 128x128',
    tier: 'awakening',
    colors: ['#4A7C59', '#8B7355', '#6B5D4F']
  },
  {
    level: 9,
    name: 'Warrior',
    description: 'highly detailed pixel art iron plate chest armor over leather, iron longsword raised in battle stance, battle ready aggressive pose, leather pants and boots, battle-tested look with scratches, dark iron and brown leather, isometric character, 128x128',
    tier: 'awakening',
    colors: ['#6B6B6B', '#8B7355', '#4A4A4A']
  },
  {
    level: 10,
    name: 'Swordsman',
    description: 'highly detailed pixel art polished steel chest armor and pauldrons, dual wielding iron swords in combat pose, confident battle stance, steel shoulder armor, shining steel and dark leather, skilled warrior, isometric character, 128x128',
    tier: 'awakening',
    colors: ['#C0C0C0', '#8B7355', '#E8E8E8']
  },

  // ACT II: THE TRIALS (11-20) - Specialist Evolution
  {
    level: 11,
    name: 'Duelist',
    description: 'highly detailed pixel art elegant light armor with decorative details, rapier in right hand and dagger in left, agile fencing stance, feathered cavalier hat, deep blue and silver colors, swashbuckler style, isometric character, 128x128',
    tier: 'trials',
    colors: ['#1E3A8A', '#C0C0C0', '#3B82F6']
  },
  {
    level: 12,
    name: 'Berserker',
    description: 'highly detailed pixel art fur-trimmed barbarian armor with tribal patterns, massive two-handed battle axe held high, wild unkempt hair and beard, fierce aggressive battle stance, brown fur and dark iron, rage warrior, isometric character, 128x128',
    tier: 'trials',
    colors: ['#8B4513', '#6B5D4F', '#4A4A4A']
  },
  {
    level: 13,
    name: 'Knight',
    description: 'highly detailed pixel art full polished plate armor with engravings, large kite shield with red heraldic crest, longsword at ready, noble upright honorable stance, shining silver armor with red crest detail, isometric character, 128x128',
    tier: 'trials',
    colors: ['#E8E8E8', '#DC2626', '#C0C0C0']
  },
  {
    level: 14,
    name: 'Ranger',
    description: 'highly detailed pixel art forest green hooded cloak and leather armor, ornate longbow drawn with arrow nocked, quiver full of feathered arrows, forest stance, deep green and brown earth tones, master archer, isometric character, 128x128',
    tier: 'trials',
    colors: ['#166534', '#8B7355', '#4A7C59']
  },
  {
    level: 15,
    name: 'Paladin',
    description: 'highly detailed pixel art silver holy armor with golden cross symbols engraved, glowing blessed sword radiating light, small ornate shield, righteous pose, white silver and gold with holy light glow, divine warrior, isometric character, 128x128',
    tier: 'trials',
    colors: ['#F3F4F6', '#FCD34D', '#E8E8E8']
  },
  {
    level: 16,
    name: 'Monk',
    description: 'highly detailed pixel art flowing martial arts robes with sash belt, wooden bo staff held in combat stance, prayer beads around neck, meditation pose ready for combat, orange and white robes, martial artist, isometric character, 128x128',
    tier: 'trials',
    colors: ['#EA580C', '#F3F4F6', '#DC2626']
  },
  {
    level: 17,
    name: 'Assassin',
    description: 'highly detailed pixel art dark hooded cloak with shadows, black leather armor with straps, dual curved daggers in hands, stealth crouch combat pose, face mask covering lower face, pure black with dark purple accents, shadow warrior, isometric character, 128x128',
    tier: 'trials',
    colors: ['#1F1F1F', '#6B21A8', '#4A4A4A']
  },
  {
    level: 18,
    name: 'Battlemage',
    description: 'highly detailed pixel art wizard robes with light armor plates, wooden staff with glowing purple crystal at top, arcane energy crackling around hands, spellcaster stance, purple robes with silver armor plates, magic warrior, isometric character, 128x128',
    tier: 'trials',
    colors: ['#7C3AED', '#C0C0C0', '#A855F7']
  },
  {
    level: 19,
    name: 'Champion',
    description: 'highly detailed pixel art ornate tournament plate armor with engravings, jousting lance held high, champion banner on back with crest, victorious pose, polished gold and royal blue armor, tournament victor, isometric character, 128x128',
    tier: 'trials',
    colors: ['#FCD34D', '#1E3A8A', '#F59E0B']
  },
  {
    level: 20,
    name: 'Veteran',
    description: 'highly detailed pixel art battle-worn plate armor with dents and scratches, multiple weapons sheathed on back and belt, scarred battle-hardened weathered face, weary but strong stance, dark iron and steel, war survivor, isometric character, 128x128',
    tier: 'trials',
    colors: ['#4A4A4A', '#6B6B6B', '#8B7355']
  },

  // ACT III: MASTERY (21-30) - Master Class
  {
    level: 21,
    name: 'Blade Master',
    description: 'highly detailed pixel art masterwork armor with intricate patterns, enchanted katana glowing bright blue in hand, perfect battle stance, flowing cape billowing, blue magical aura surrounding body, silver armor with blue energy glow, isometric character, 128x128',
    tier: 'mastery',
    colors: ['#C0C0C0', '#3B82F6', '#60A5FA']
  },
  {
    level: 22,
    name: 'War Chief',
    description: 'highly detailed pixel art tribal chieftain armor with bone decorations and pelts, war paint on face, massive ornate war hammer, commanding leadership pose, brown bone and red war paint, tribal leader, isometric character, 128x128',
    tier: 'mastery',
    colors: ['#8B4513', '#DC2626', '#F3F4F6']
  },
  {
    level: 23,
    name: 'Dragon Knight',
    description: 'highly detailed pixel art armor made of crimson dragon scales, dragon-horned helmet with fierce design, dragon-slayer greatsword, powerful stance, crimson dragon scales with gold accents, dragonslayer, isometric character, 128x128',
    tier: 'mastery',
    colors: ['#DC2626', '#FCD34D', '#991B1B']
  },
  {
    level: 24,
    name: 'Shadow Master',
    description: 'highly detailed pixel art shadowy ethereal cloak billowing with darkness, dark armor with smoke effects, twin daggers with smoke trail effects, smoke wisps swirling around body, black with purple shadow effects, shadow warrior, isometric character, 128x128',
    tier: 'mastery',
    colors: ['#1F1F1F', '#7C3AED', '#4A4A4A']
  },
  {
    level: 25,
    name: 'Holy Crusader',
    description: 'highly detailed pixel art divine golden armor with angel wing motif engraved, holy sword radiating bright light, golden halo effect above head, righteous powerful pose, brilliant gold and white divine light, holy champion, isometric character, 128x128',
    tier: 'mastery',
    colors: ['#FCD34D', '#F3F4F6', '#F59E0B']
  },
  {
    level: 26,
    name: 'Arcane Warrior',
    description: 'highly detailed pixel art armor covered in glowing purple magical runes, floating spell tome beside character, staff crackling with arcane power, purple arcane energy swirling, silver armor with bright purple rune glow, spellblade, isometric character, 128x128',
    tier: 'mastery',
    colors: ['#C0C0C0', '#7C3AED', '#A855F7']
  },
  {
    level: 27,
    name: 'Beast Master',
    description: 'highly detailed pixel art wild leather armor with animal pelts, accompanied by spectral wolf familiar at side, eagle perched on shoulder, nature staff with crystal, primal stance, brown leather with green nature magic aura, nature warrior, isometric character, 128x128',
    tier: 'mastery',
    colors: ['#8B7355', '#10B981', '#4A7C59']
  },
  {
    level: 28,
    name: 'Demon Hunter',
    description: 'highly detailed pixel art demon-skull decorated armor with horns, glowing red runic tattoos on exposed arms, heavy crossbow and demon-slaying sword, aggressive hunter pose, black armor with red rune glow, demon slayer, isometric character, 128x128',
    tier: 'mastery',
    colors: ['#1F1F1F', '#DC2626', '#991B1B']
  },
  {
    level: 29,
    name: 'Storm Lord',
    description: 'highly detailed pixel art lightning-themed blue armor with electricity crackling, electricity bolts surrounding body, storm hammer with lightning, commanding sky pose, electric blue with white lightning bolts, storm warrior, isometric character, 128x128',
    tier: 'mastery',
    colors: ['#3B82F6', '#F3F4F6', '#1E3A8A']
  },
  {
    level: 30,
    name: 'Warlord',
    description: 'highly detailed pixel art ornate commanding general armor with medals, war banner on back with insignia, decorated greatsword, general commanding leadership pose, ruby red and gold royal armor, supreme commander, isometric character, 128x128',
    tier: 'mastery',
    colors: ['#DC2626', '#FCD34D', '#991B1B']
  },

  // ACT IV: LEGEND (31-40) - Mythic Transformation
  {
    level: 31,
    name: 'Sword Saint',
    description: 'highly detailed pixel art transcendent white robes with light armor plates, legendary katana radiating pure white energy, master enlightened stance, white and silver with pure light aura emanating, enlightened master, isometric character, 128x128',
    tier: 'legend',
    colors: ['#F3F4F6', '#E8E8E8', '#60A5FA']
  },
  {
    level: 32,
    name: 'Phoenix Knight',
    description: 'highly detailed pixel art armor wreathed in eternal orange flames, phoenix-themed helmet with fire crest, flaming sword burning bright, fire wings spread from back, orange flames and golden armor, immortal flame warrior, isometric character, 128x128',
    tier: 'legend',
    colors: ['#EA580C', '#FCD34D', '#F59E0B']
  },
  {
    level: 33,
    name: 'Void Stalker',
    description: 'highly detailed pixel art reality-warping dark armor with void effects, void energy swirling like black holes, ethereal blades made of darkness, space distortion effects around body, deep purple void with star particle effects, reality bender, isometric character, 128x128',
    tier: 'legend',
    colors: ['#4C1D95', '#7C3AED', '#1F1F1F']
  },
  {
    level: 34,
    name: 'Celestial Guardian',
    description: 'highly detailed pixel art angelic golden armor with wing engravings, divine radiant energy wings spread wide, holy lance glowing, protective guardian stance, radiant gold and white divine light emanating, angel warrior, isometric character, 128x128',
    tier: 'legend',
    colors: ['#FCD34D', '#F3F4F6', '#F59E0B']
  },
  {
    level: 35,
    name: 'Titan Slayer',
    description: 'highly detailed pixel art massive heavy armor with giant plates, colossal two-handed sword larger than character, giant-slaying gear and trophies, powerful grounded stance, dark steel with red battle accents, giant killer, isometric character, 128x128',
    tier: 'legend',
    colors: ['#4A4A4A', '#DC2626', '#6B6B6B']
  },
  {
    level: 36,
    name: 'Elemental Lord',
    description: 'highly detailed pixel art armor with all four elements swirling around body, fire water earth air orbiting character, prismatic rainbow energy weapon, elements in perfect harmony, multi-colored elemental energy flowing, elemental master, isometric character, 128x128',
    tier: 'legend',
    colors: ['#DC2626', '#3B82F6', '#10B981', '#F59E0B']
  },
  {
    level: 37,
    name: 'Immortal Champion',
    description: 'highly detailed pixel art timeless ancient armor with eternal glowing runes, ageless perfect form, legendary artifacts floating around, transcendent powerful stance, platinum armor with eternal blue glow, timeless warrior, isometric character, 128x128',
    tier: 'legend',
    colors: ['#E8E8E8', '#3B82F6', '#C0C0C0']
  },
  {
    level: 38,
    name: 'Godslayer',
    description: 'highly detailed pixel art armor forged from divine cosmic metal, cosmic weapon of ultimate power crackling, reality-breaking aura surrounding, supreme powerful stance, cosmic purple and gold divinity energy, god killer, isometric character, 128x128',
    tier: 'legend',
    colors: ['#7C3AED', '#FCD34D', '#4C1D95']
  },
  {
    level: 39,
    name: 'Ascendant',
    description: 'highly detailed pixel art semi-divine transcendent form glowing, radiant energy body with ethereal appearance, perfect enlightened posture, reality transcending aura, pure white and rainbow prismatic energy flowing, ascended being, isometric character, 128x128',
    tier: 'legend',
    colors: ['#F3F4F6', '#A855F7', '#60A5FA', '#10B981']
  },
  {
    level: 40,
    name: 'Avatar of Mastery',
    description: 'highly detailed pixel art perfect peak human form with ultimate balance, balanced fusion of all paths and elements swirling, legendary aura of ultimate achievement, transcendent peaceful power pose, harmonious blend of all colors in perfect balance, ultimate master, isometric character, 128x128',
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
bad proportions, deformed, ugly, cropped, low quality, normal quality, worst quality`;

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

    // Save to assets folder
    const filename = `hero_stage_${stage.level}_${stage.name.toLowerCase().replace(/ /g, '_')}.png`;
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
  console.log('🚀 Hero Evolution Sprite Generator');
  console.log('=' .repeat(60));

  // Check initial balance
  const initialBalance = await checkBalance();
  if (initialBalance === null) {
    console.error('❌ Failed to check API balance');
    process.exit(1);
  }

  console.log(`\n💵 Initial Balance: $${initialBalance.toFixed(2)}`);

  // Estimate cost (approximately $0.01 per image)
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

    // Delay between requests to avoid rate limiting (PixelLab requires ~10 seconds)
    if (i < EVOLUTION_STAGES.length - 1) {
      console.log('⏳ Waiting 12 seconds before next generation...');
      await new Promise(resolve => setTimeout(resolve, 12000));
    }
  }

  // Check final balance
  const finalBalance = await checkBalance();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 GENERATION SUMMARY');
  console.log('='.repeat(60));

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

  const metadataPath = path.join(__dirname, '../data/heroEvolutionMetadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`\n📁 Metadata saved: ${metadataPath}`);

  if (successCount === 40) {
    console.log('\n🎉 All 40 stages generated successfully!');
    console.log('📝 Next step: Update avatar evolution data to use the new sprites');
  } else {
    console.log(`\n⚠️  ${40 - successCount} stages failed. Check errors above.`);
  }
}

// Run the generator
main().catch(console.error);
