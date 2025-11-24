/**
 * PixelLab Avatar Generation Service
 * Integrates with PixelLab MCP to generate pixel art avatars for evolution stages
 */

import { getStageByLevel } from '../data/avatarEvolution';

/**
 * Generate a character using PixelLab MCP
 * This is called from the backend - frontend just displays the results
 */
export async function generateAvatarForStage(stageName, level, prestige = 0) {
  // This would call your backend API which uses the PixelLab MCP
  // For now, return the local sprite path
  const stage = getStageByLevel(level, prestige);
  return {
    spriteUrl: `/assets/avatar/${stage.sprite}`,
    stageName: stage.name,
    level,
  };
}

/**
 * Character descriptions for each evolution stage
 * These will be used with PixelLab to generate consistent characters
 */
export const STAGE_DESCRIPTIONS = {
  'Ordinary Human': {
    description: 'young person in casual modern clothes, t-shirt and jeans',
    detail: 'medium detail',
    shading: 'basic shading',
    outline: 'single color black outline',
    view: 'high top-down',
    size: 128,
    proportions: JSON.stringify({ type: 'preset', name: 'default' }),
  },
  'Awakened': {
    description: 'person with faint cosmic glow around body, determined expression, athletic casual wear',
    detail: 'medium detail',
    shading: 'medium shading',
    outline: 'single color black outline',
    view: 'high top-down',
    size: 128,
    proportions: JSON.stringify({ type: 'preset', name: 'default' }),
  },
  'Atom Ascendant': {
    description: 'person radiating blue-purple energy, particles floating around, futuristic athletic outfit',
    detail: 'high detail',
    shading: 'medium shading',
    outline: 'single color outline',
    view: 'high top-down',
    size: 128,
    proportions: JSON.stringify({ type: 'preset', name: 'default' }),
  },
  'Nebula Walker': {
    description: 'cosmic being with swirling nebula patterns, purple-blue energy aura, sleek cosmic armor',
    detail: 'high detail',
    shading: 'detailed shading',
    outline: 'selective outline',
    view: 'high top-down',
    size: 128,
    proportions: JSON.stringify({ type: 'preset', name: 'heroic' }),
  },
  'Stellar Guardian': {
    description: 'radiant cosmic warrior with star-like energy, flowing cosmic cape, ornate stellar armor',
    detail: 'high detail',
    shading: 'detailed shading',
    outline: 'selective outline',
    view: 'high top-down',
    size: 128,
    proportions: JSON.stringify({ type: 'preset', name: 'heroic' }),
  },
  'Galaxy Keeper': {
    description: 'majestic cosmic entity with galaxy swirling within, ethereal cosmic robes, crown of stars',
    detail: 'high detail',
    shading: 'detailed shading',
    outline: 'selective outline',
    view: 'high top-down',
    size: 128,
    proportions: JSON.stringify({ type: 'preset', name: 'heroic' }),
  },
  'Universe Architect': {
    description: 'transcendent cosmic being made of pure cosmic energy, reality-bending aura, divine cosmic attire',
    detail: 'high detail',
    shading: 'detailed shading',
    outline: 'lineless',
    view: 'high top-down',
    size: 128,
    proportions: JSON.stringify({ type: 'preset', name: 'heroic' }),
  },
  'Cosmos': {
    description: 'ultimate cosmic entity embodying the entire universe, infinite cosmic power radiating, transcendent form',
    detail: 'high detail',
    shading: 'detailed shading',
    outline: 'lineless',
    view: 'high top-down',
    size: 128,
    proportions: JSON.stringify({ type: 'preset', name: 'heroic' }),
  },
};

/**
 * Animation templates for different actions
 */
export const ANIMATION_TEMPLATES = {
  idle: 'breathing-idle',
  walk: 'walking-8-frames',
  run: 'running-6-frames',
  celebrate: 'jumping-1',
  power_up: 'fireball',
};

/**
 * Helper to get PixelLab character creation params for a stage
 */
export function getPixelLabParamsForStage(stageName) {
  const config = STAGE_DESCRIPTIONS[stageName];
  if (!config) {
    console.warn(`No PixelLab config for stage: ${stageName}`);
    return STAGE_DESCRIPTIONS['Ordinary Human'];
  }
  return config;
}

/**
 * Equipment overlay generation params
 */
export const EQUIPMENT_PIXELLAB_CONFIGS = {
  helmet: {
    'Common Iron Helmet': {
      description: 'simple iron medieval helmet with basic design',
      view: 'high top-down',
      size: 128,
      detail: 'low detail',
    },
    'Uncommon Steel Helmet': {
      description: 'polished steel helmet with decorative trim',
      view: 'high top-down',
      size: 128,
      detail: 'medium detail',
    },
    'Rare Cosmic Helm': {
      description: 'cosmic helmet with glowing purple energy patterns',
      view: 'high top-down',
      size: 128,
      detail: 'high detail',
    },
  },
  suit: {
    'Common Leather Armor': {
      description: 'basic brown leather chest armor',
      view: 'high top-down',
      size: 128,
      detail: 'low detail',
    },
    'Uncommon Chain Mail': {
      description: 'silver chainmail armor with metallic shine',
      view: 'high top-down',
      size: 128,
      detail: 'medium detail',
    },
    'Rare Cosmic Suit': {
      description: 'futuristic cosmic suit with energy core in chest',
      view: 'high top-down',
      size: 128,
      detail: 'high detail',
    },
  },
  backpack: {
    'Common Backpack': {
      description: 'simple brown leather backpack',
      view: 'high top-down',
      size: 128,
      detail: 'low detail',
    },
    'Uncommon Explorer Pack': {
      description: 'tactical backpack with multiple pockets and straps',
      view: 'high top-down',
      size: 128,
      detail: 'medium detail',
    },
    'Rare Void Pack': {
      description: 'cosmic backpack with swirling void energy inside',
      view: 'high top-down',
      size: 128,
      detail: 'high detail',
    },
  },
  tool: {
    'Common Pickaxe': {
      description: 'basic wooden pickaxe tool',
      view: 'high top-down',
      size: 128,
      detail: 'low detail',
    },
    'Uncommon Steel Wrench': {
      description: 'polished steel wrench tool',
      view: 'high top-down',
      size: 128,
      detail: 'medium detail',
    },
    'Rare Cosmic Staff': {
      description: 'glowing cosmic staff with energy crystal on top',
      view: 'high top-down',
      size: 128,
      detail: 'high detail',
    },
  },
};
