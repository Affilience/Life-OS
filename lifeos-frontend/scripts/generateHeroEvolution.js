import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 40 Stage Hero's Journey Character Evolution
const EVOLUTION_STAGES = [
  // ACT I: THE AWAKENING (1-10) - Civilian to Warrior
  { level: 1, name: 'Dreamer', description: 'young person in casual tunic and pants, slouched relaxed posture, hopeful expression, simple cloth clothes in brown tones', tier: 'awakening' },
  { level: 2, name: 'Seeker', description: 'same person now standing tall with determined expression, simple traveler clothes, leather satchel, walking stick, earth tone colors', tier: 'awakening' },
  { level: 3, name: 'Recruit', description: 'basic training outfit, simple cloth shirt and pants, wooden practice sword held at side, beginner fighter stance, brown and tan colors', tier: 'awakening' },
  { level: 4, name: 'Trainee', description: 'light cloth armor tunic, practice wooden staff in hands, basic belt, more confident stance, beige and light brown', tier: 'awakening' },
  { level: 5, name: 'Squire', description: 'leather armor chest piece, iron short sword at hip, small wooden buckler, proper warrior stance, brown leather with iron accents', tier: 'awakening' },
  { level: 6, name: 'Initiate', description: 'light chainmail shirt over cloth, round wooden shield, basic iron sword drawn, warrior ready pose, silver chainmail with brown', tier: 'awakening' },
  { level: 7, name: 'Footman', description: 'full leather armor, spear and medium shield, helmet with nose guard, soldier stance, dark brown leather with iron trim', tier: 'awakening' },
  { level: 8, name: 'Scout', description: 'hooded leather armor, longbow in hand, quiver on back, light boots, agile stance, forest green and brown leather', tier: 'awakening' },
  { level: 9, name: 'Warrior', description: 'iron plate chest armor, iron longsword raised, battle ready stance, leather pants, battle-tested look, dark iron and leather', tier: 'awakening' },
  { level: 10, name: 'Swordsman', description: 'polished steel chest armor, dual wielding iron swords, confident combat pose, steel pauldrons, shining steel and dark leather', tier: 'awakening' },

  // ACT II: THE TRIALS (11-20) - Specialist Evolution
  { level: 11, name: 'Duelist', description: 'elegant light armor, rapier in right hand, dagger in left, agile fencing stance, feathered cavalier hat, deep blue and silver', tier: 'trials' },
  { level: 12, name: 'Berserker', description: 'fur-trimmed barbarian armor, massive two-handed battle axe, wild unkempt hair, fierce aggressive stance, brown fur and dark iron', tier: 'trials' },
  { level: 13, name: 'Knight', description: 'full polished plate armor, large kite shield with heraldic crest, longsword, noble upright stance, shining silver with red crest', tier: 'trials' },
  { level: 14, name: 'Ranger', description: 'forest green hooded cloak, leather armor, ornate longbow drawn, arrow nocked, quiver full of arrows, deep green and brown', tier: 'trials' },
  { level: 15, name: 'Paladin', description: 'silver holy armor with golden cross symbols, glowing blessed sword, small shield, righteous pose, white silver and gold holy light', tier: 'trials' },
  { level: 16, name: 'Monk', description: 'flowing martial arts robes with sash, wooden bo staff, prayer beads, meditation pose ready for combat, orange and white robes', tier: 'trials' },
  { level: 17, name: 'Assassin', description: 'dark hooded cloak, black leather armor, dual curved daggers, stealth crouch pose, face mask, pure black with dark purple', tier: 'trials' },
  { level: 18, name: 'Battlemage', description: 'wizard robes with light armor plates, wooden staff with glowing crystal top, arcane energy crackling, purple robes with silver armor', tier: 'trials' },
  { level: 19, name: 'Champion', description: 'ornate tournament plate armor, jousting lance, champion banner on back, victorious pose, polished gold and royal blue', tier: 'trials' },
  { level: 20, name: 'Veteran', description: 'battle-worn plate armor with dents, multiple weapons sheathed, scarred battle-hardened face, weary but strong stance, dark iron and steel', tier: 'trials' },

  // ACT III: MASTERY (21-30) - Master Class
  { level: 21, name: 'Blade Master', description: 'masterwork armor, enchanted katana glowing blue, perfect battle stance, flowing cape, blue magical aura, silver armor with blue energy', tier: 'mastery' },
  { level: 22, name: 'War Chief', description: 'tribal chieftain armor with bone decorations, war paint on face, massive ornate war hammer, commanding pose, brown bone and red paint', tier: 'mastery' },
  { level: 23, name: 'Dragon Knight', description: 'armor made of dragon scales, dragon-horned helmet, dragon-slayer greatsword, powerful stance, crimson dragon scales with gold', tier: 'mastery' },
  { level: 24, name: 'Shadow Master', description: 'shadowy ethereal cloak billowing, dark armor, twin daggers with smoke trail, smoke wisps around body, black with purple shadow effects', tier: 'mastery' },
  { level: 25, name: 'Holy Crusader', description: 'divine golden armor with angel wing motif, holy sword radiating light, golden halo effect, righteous pose, brilliant gold and white light', tier: 'mastery' },
  { level: 26, name: 'Arcane Warrior', description: 'armor covered in glowing magical runes, floating spell tome beside them, staff crackling with power, purple arcane energy, silver with purple runes', tier: 'mastery' },
  { level: 27, name: 'Beast Master', description: 'wild leather armor, accompanied by spectral wolf, eagle on shoulder, nature staff, primal stance, brown leather with green nature magic', tier: 'mastery' },
  { level: 28, name: 'Demon Hunter', description: 'demon-skull decorated armor, runic tattoos glowing, heavy crossbow, demon-slaying sword, aggressive pose, black armor with red runes', tier: 'mastery' },
  { level: 29, name: 'Storm Lord', description: 'lightning-themed blue armor, electricity crackling around body, storm hammer, commanding sky pose, electric blue with white lightning', tier: 'mastery' },
  { level: 30, name: 'Warlord', description: 'ornate commanding armor, war banner on back, decorated greatsword, general commanding pose, ruby red and gold royal armor', tier: 'mastery' },

  // ACT IV: LEGEND (31-40) - Mythic Transformation
  { level: 31, name: 'Sword Saint', description: 'transcendent white robes with light armor, legendary katana radiating pure energy, master stance, white and silver with pure light aura', tier: 'legend' },
  { level: 32, name: 'Phoenix Knight', description: 'armor wreathed in eternal flames, phoenix-themed helmet, flaming sword, fire wings spread, orange flames and golden armor', tier: 'legend' },
  { level: 33, name: 'Void Stalker', description: 'reality-warping dark armor, void energy swirling, ethereal blades, space distortion effects, deep purple void with star effects', tier: 'legend' },
  { level: 34, name: 'Celestial Guardian', description: 'angelic golden armor, divine energy wings, holy lance, protective stance, radiant gold and white divine light', tier: 'legend' },
  { level: 35, name: 'Titan Slayer', description: 'massive heavy armor, colossal two-handed sword, giant-slaying gear, powerful grounded stance, dark steel with red accents', tier: 'legend' },
  { level: 36, name: 'Elemental Lord', description: 'armor with all four elements swirling, fire water earth air orbiting, prismatic rainbow weapon, elements in harmony, multi-colored elemental energy', tier: 'legend' },
  { level: 37, name: 'Immortal Champion', description: 'timeless ancient armor with eternal runes, ageless perfect form, legendary artifacts, transcendent stance, platinum with eternal blue glow', tier: 'legend' },
  { level: 38, name: 'Godslayer', description: 'armor forged from divine metal, cosmic weapon of ultimate power, reality-breaking aura, supreme stance, cosmic purple and gold divinity', tier: 'legend' },
  { level: 39, name: 'Ascendant', description: 'semi-divine transcendent form, radiant energy body, perfect enlightened posture, reality transcending, pure white and rainbow prismatic energy', tier: 'legend' },
  { level: 40, name: 'Avatar of Mastery', description: 'perfect peak human form, balanced fusion of all paths and elements, legendary aura of ultimate achievement, transcendent peaceful power, harmonious blend of all colors in perfect balance', tier: 'legend' },
];

async function generateCharacterSprite(stage) {
  console.log(`\n🎨 Generating ${stage.name} (Level ${stage.level})...`);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      tools: [
        {
          name: 'mcp__pixellab__create_character',
          description: 'Create a character with multiple directional views',
          input_schema: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              name: { type: 'string' },
              n_directions: { type: 'integer', enum: [4, 8] },
              size: { type: 'integer', minimum: 16, maximum: 128 },
              view: { type: 'string', enum: ['low top-down', 'high top-down', 'side'] },
              detail: { type: 'string', enum: ['low detail', 'medium detail', 'high detail'] },
              outline: { type: 'string', enum: ['single color black outline', 'single color outline', 'selective outline', 'lineless'] },
              shading: { type: 'string', enum: ['flat shading', 'basic shading', 'medium shading', 'detailed shading'] },
              ai_freedom: { type: 'number', minimum: 100, maximum: 999 }
            },
            required: ['description']
          }
        }
      ],
      messages: [{
        role: 'user',
        content: `Create a pixel art character for level ${stage.level} named "${stage.name}". Description: ${stage.description}. Use 8 directions, high top-down view, 48px size, high detail, single color black outline, detailed shading.`
      }]
    });

    // Check if tool was used
    const toolUse = message.content.find(block => block.type === 'tool_use');
    if (toolUse) {
      console.log(`✓ Character "${stage.name}" queued for generation`);
      console.log(`  Job ID: ${toolUse.input?.character_id || 'pending'}`);
      return {
        level: stage.level,
        name: stage.name,
        tier: stage.tier,
        jobId: toolUse.input?.character_id,
        description: stage.description
      };
    }

    return null;
  } catch (error) {
    console.error(`✗ Failed to generate ${stage.name}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting Hero Evolution Character Generation\n');
  console.log(`📊 Total stages: ${EVOLUTION_STAGES.length}`);

  const results = [];

  // Generate characters in batches to avoid rate limits
  for (let i = 0; i < EVOLUTION_STAGES.length; i++) {
    const stage = EVOLUTION_STAGES[i];
    const result = await generateCharacterSprite(stage);

    if (result) {
      results.push(result);
    }

    // Small delay between requests
    if (i < EVOLUTION_STAGES.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Save results to file
  const outputPath = path.join(__dirname, '..', 'data', 'heroEvolutionJobs.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log(`\n✅ Generation complete!`);
  console.log(`📁 Results saved to: ${outputPath}`);
  console.log(`\n📊 Summary:`);
  console.log(`  - Total stages: ${EVOLUTION_STAGES.length}`);
  console.log(`  - Successful: ${results.length}`);
  console.log(`  - Failed: ${EVOLUTION_STAGES.length - results.length}`);
  console.log(`\n⏳ Characters are being generated asynchronously.`);
  console.log(`   Check status with PixelLab API after a few minutes.`);
}

main().catch(console.error);
