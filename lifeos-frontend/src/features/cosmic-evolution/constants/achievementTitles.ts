/**
 * Achievement Titles System
 * Prestigious titles earned at milestone levels
 */

export interface AchievementTitle {
  level: number;
  title: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  icon: string;
}

export const ACHIEVEMENT_TITLES: AchievementTitle[] = [
  {
    level: 1,
    title: "Spark of Potential",
    description: "The first step into cosmic evolution",
    rarity: 'common',
    icon: "✨"
  },
  {
    level: 10,
    title: "Pioneer of the Void",
    description: "Ventured into the quantum realm and emerged transformed",
    rarity: 'rare',
    icon: "🌟"
  },
  {
    level: 25,
    title: "Elemental Architect",
    description: "Master of atomic bonds and molecular structures",
    rarity: 'rare',
    icon: "⚛️"
  },
  {
    level: 50,
    title: "Planetary Sculptor",
    description: "Shaped worlds from cosmic dust and fire",
    rarity: 'epic',
    icon: "🌍"
  },
  {
    level: 75,
    title: "Stellar Kindler",
    description: "Ignited the flames of nuclear fusion",
    rarity: 'epic',
    icon: "⭐"
  },
  {
    level: 100,
    title: "Cosmic Centurion",
    description: "One hundred levels of unwavering evolution",
    rarity: 'legendary',
    icon: "💫"
  },
  {
    level: 125,
    title: "Galactic Overseer",
    description: "Commands the dance of countless star systems",
    rarity: 'legendary',
    icon: "🌌"
  },
  {
    level: 150,
    title: "Universal Architect",
    description: "Builds galaxies from the fabric of spacetime itself",
    rarity: 'mythic',
    icon: "🌠"
  },
  {
    level: 160,
    title: "Master of Spacetime",
    description: "Transcended all stages. Touched infinity. Became legend.",
    rarity: 'mythic',
    icon: "👑"
  }
];

/**
 * Get the highest title the user has earned based on current level
 */
export function getCurrentTitle(level: number): AchievementTitle | null {
  const earnedTitles = ACHIEVEMENT_TITLES.filter(t => level >= t.level);
  if (earnedTitles.length === 0) return null;
  return earnedTitles[earnedTitles.length - 1];
}

/**
 * Get the next title to unlock
 */
export function getNextTitle(level: number): AchievementTitle | null {
  return ACHIEVEMENT_TITLES.find(t => level < t.level) || null;
}

/**
 * Get all titles the user has earned
 */
export function getAllEarnedTitles(level: number): AchievementTitle[] {
  return ACHIEVEMENT_TITLES.filter(t => level >= t.level);
}

/**
 * Get rarity color for UI display
 */
export function getRarityColor(rarity: AchievementTitle['rarity']): string {
  const colors = {
    common: '#B0B0B0',
    rare: '#4A9EFF',
    epic: '#A335EE',
    legendary: '#FF8000',
    mythic: '#E6CC80'
  };
  return colors[rarity];
}

/**
 * Get rarity glow color for effects
 */
export function getRarityGlow(rarity: AchievementTitle['rarity']): string {
  const glows = {
    common: 'rgba(176, 176, 176, 0.3)',
    rare: 'rgba(74, 158, 255, 0.5)',
    epic: 'rgba(163, 53, 238, 0.6)',
    legendary: 'rgba(255, 128, 0, 0.7)',
    mythic: 'rgba(230, 204, 128, 0.8)'
  };
  return glows[rarity];
}
