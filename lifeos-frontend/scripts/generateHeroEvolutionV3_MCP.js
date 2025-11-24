/**
 * Hero Evolution Sprite Generator V3 - USING MCP (NOT DIRECT API)
 *
 * NOTE: This script is a REFERENCE for what to generate
 * You'll need to use the MCP pixellab tools directly from Claude Code
 *
 * Run the generations manually using:
 * mcp__pixellab__create_character()
 */

export const HERO_EVOLUTION_V3_SPECS = [
  // ACT I: THE AWAKENING (1-10)
  {
    level: 1,
    name: 'Dreamer',
    description: 'athletic male hero wearing worn brown peasant tunic and simple cloth pants, barefoot, standing with hands clasped in humble hopeful pose, wistful expression looking upward, soft morning light aesthetic, fantasy villager',
    n_directions: 4,
    view: 'high top-down',
    size: 48,
    detail: 'high detail',
    shading: 'detailed shading',
    outline: 'single color black outline'
  },
  {
    level: 2,
    name: 'Seeker',
    description: 'athletic male hero wearing traveler leather vest over white shirt, brown cloth pants, weathered backpack with bedroll, ornate wooden walking staff glowing with destiny magic, confident striding pose, adventurer cloak billowing, determined expression',
    n_directions: 4,
    view: 'high top-down',
    size: 48,
    detail: 'high detail',
    shading: 'detailed shading',
    outline: 'single color black outline'
  },
  {
    level: 3,
    name: 'Recruit',
    description: 'athletic male hero wearing basic militia training armor with padded cloth chest piece and iron studs, leather bracers, simple iron training sword at hip, wooden shield on back, military cadet stance at attention, disciplined posture',
    n_directions: 4,
    view: 'high top-down',
    size: 48,
    detail: 'high detail',
    shading: 'detailed shading',
    outline: 'single color black outline'
  },
  // Add remaining 37 stages...
  // [Full specs would continue here]
];

console.log('Hero Evolution V3 Specifications Ready');
console.log(`Total stages: ${HERO_EVOLUTION_V3_SPECS.length}`);
console.log('\nTo generate, use the MCP pixellab tools manually with these specifications.');
