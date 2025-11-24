/**
 * Constellation configurations for each module
 * Based on authentic astronomical patterns from real night sky constellations
 * Each design mirrors the shape and essence of its celestial inspiration
 */

import type { ModuleConstellation, ModuleId } from './constellations.types';

/**
 * Module accent colors in cosmic palette
 */
export const MODULE_COLORS: Record<ModuleId, string> = {
  journal: '#A78BFF',      // Soft violet - introspection
  knowledge: '#5ECFFF',    // Bright cyan - clarity
  health: '#FF6B9D',       // Vibrant pink - vitality
  finance: '#FFD700',      // Golden - prosperity
  productivity: '#7FFF7F'  // Fresh green - growth
};

/**
 * JOURNAL CONSTELLATION: "Scorpius Animae" (Soul's Scorpion)
 * Inspired by: Scorpius - the curved scorpion with distinctive tail
 * Shape: Classic S-curve with claws and curved tail
 * 14 stars forming the scorpion's body, claws, and stinger
 *
 * Represents: The journey inward through reflection - from surface observations
 * (the claws) through the body of experience, curving into deep self-knowledge (the stinger)
 */
const JOURNAL_CONSTELLATION: ModuleConstellation = {
  module: 'journal',
  displayName: 'Scorpius Animae',
  description: 'The Soul\'s Scorpion - curve inward through reflection, from surface to depths',
  maxXp: 14000,
  stars: [
    // Head and claws (starting point)
    { id: 'j1', x: 0.25, y: 0.15, label: 'First Words', requirementXp: 0, importance: 'core' },
    { id: 'j2', x: 0.18, y: 0.22, requirementXp: 200, importance: 'minor' },
    { id: 'j3', x: 0.32, y: 0.22, requirementXp: 200, importance: 'minor' },

    // Body (upper curve)
    { id: 'j4', x: 0.25, y: 0.3, label: 'Observer', requirementXp: 600, importance: 'core' },
    { id: 'j5', x: 0.3, y: 0.38, requirementXp: 1200, importance: 'minor' },
    { id: 'j6', x: 0.38, y: 0.45, requirementXp: 2000, importance: 'minor' },

    // Heart (turning point)
    { id: 'j7', x: 0.48, y: 0.5, label: 'Heart Truth', requirementXp: 3500, importance: 'core' },
    { id: 'j8', x: 0.58, y: 0.52, requirementXp: 5000, importance: 'minor' },

    // Tail (descent into depths)
    { id: 'j9', x: 0.68, y: 0.56, label: 'Shadow Walker', requirementXp: 6500, importance: 'core' },
    { id: 'j10', x: 0.75, y: 0.62, requirementXp: 8000, importance: 'minor' },
    { id: 'j11', x: 0.8, y: 0.7, requirementXp: 9500, importance: 'minor' },

    // Stinger (deepest truth)
    { id: 'j12', x: 0.83, y: 0.78, label: 'Truth Seer', requirementXp: 11000, importance: 'core' },
    { id: 'j13', x: 0.85, y: 0.86, requirementXp: 12500, importance: 'minor' },
    { id: 'j14', x: 0.88, y: 0.92, label: 'Inner Knowing', requirementXp: 14000, importance: 'core' }
  ],
  links: [
    // Head to body
    { from: 'j1', to: 'j2' }, { from: 'j1', to: 'j3' },
    { from: 'j2', to: 'j4' }, { from: 'j3', to: 'j4' },
    // Body curve
    { from: 'j4', to: 'j5' }, { from: 'j5', to: 'j6' },
    { from: 'j6', to: 'j7' }, { from: 'j7', to: 'j8' },
    // Tail descent
    { from: 'j8', to: 'j9' }, { from: 'j9', to: 'j10' },
    { from: 'j10', to: 'j11' }, { from: 'j11', to: 'j12' },
    // Stinger
    { from: 'j12', to: 'j13' }, { from: 'j13', to: 'j14' }
  ]
};

/**
 * KNOWLEDGE CONSTELLATION: "Cassiopeia Mentis" (Mind's Queen)
 * Inspired by: Cassiopeia - the distinctive W/M shape
 * Shape: Five-point W pattern with extensions forming neural web
 * 13 stars forming the W with neural connections
 *
 * Represents: The throne of knowledge - a foundation of core insights (the W)
 * with branching neural pathways connecting to wisdom
 */
const KNOWLEDGE_CONSTELLATION: ModuleConstellation = {
  module: 'knowledge',
  displayName: 'Cassiopeia Mentis',
  description: 'The Mind\'s Queen - a crown of knowledge, where wisdom sits enthroned',
  maxXp: 13000,
  stars: [
    // The classic W/M shape (5 primary stars)
    { id: 'k1', x: 0.15, y: 0.45, label: 'First Insight', requirementXp: 0, importance: 'core' },
    { id: 'k2', x: 0.3, y: 0.25, requirementXp: 500, importance: 'core' },
    { id: 'k3', x: 0.5, y: 0.4, label: 'Nexus', requirementXp: 1500, importance: 'core' },
    { id: 'k4', x: 0.7, y: 0.25, requirementXp: 3000, importance: 'core' },
    { id: 'k5', x: 0.85, y: 0.45, label: 'Connector', requirementXp: 5000, importance: 'core' },

    // Neural extensions (top)
    { id: 'k6', x: 0.3, y: 0.12, requirementXp: 2000, importance: 'minor' },
    { id: 'k7', x: 0.7, y: 0.12, requirementXp: 4000, importance: 'minor' },

    // Neural extensions (middle depth)
    { id: 'k8', x: 0.5, y: 0.55, label: 'Synthesizer', requirementXp: 6500, importance: 'core' },
    { id: 'k9', x: 0.35, y: 0.6, requirementXp: 7500, importance: 'minor' },
    { id: 'k10', x: 0.65, y: 0.6, requirementXp: 8500, importance: 'minor' },

    // Deep wisdom (bottom)
    { id: 'k11', x: 0.5, y: 0.75, label: 'Sage Mind', requirementXp: 10000, importance: 'core' },
    { id: 'k12', x: 0.38, y: 0.85, requirementXp: 11500, importance: 'minor' },
    { id: 'k13', x: 0.62, y: 0.85, label: 'Enlightened', requirementXp: 13000, importance: 'core' }
  ],
  links: [
    // The W/M shape
    { from: 'k1', to: 'k2' }, { from: 'k2', to: 'k3' },
    { from: 'k3', to: 'k4' }, { from: 'k4', to: 'k5' },
    // Top extensions
    { from: 'k2', to: 'k6' }, { from: 'k4', to: 'k7' },
    // Neural connections
    { from: 'k3', to: 'k8' }, { from: 'k1', to: 'k9' }, { from: 'k5', to: 'k10' },
    { from: 'k8', to: 'k9' }, { from: 'k8', to: 'k10' },
    // Deep wisdom
    { from: 'k8', to: 'k11' }, { from: 'k9', to: 'k12' },
    { from: 'k10', to: 'k13' }, { from: 'k11', to: 'k12' }, { from: 'k11', to: 'k13' }
  ]
};

/**
 * HEALTH CONSTELLATION: "Orion Vitalis" (Life's Hunter)
 * Inspired by: Orion - the hunter with belt, shoulders, and club
 * Shape: Distinctive hourglass with belt, shoulders, and raised arm
 * 12 stars forming the hunter's powerful stance
 *
 * Represents: The hunter of vitality - strong shoulders (strength),
 * centered belt (core), and raised arm (reaching for peak health)
 */
const HEALTH_CONSTELLATION: ModuleConstellation = {
  module: 'health',
  displayName: 'Orion Vitalis',
  description: 'Life\'s Hunter - stand strong with shoulders wide, core centered, reaching high',
  maxXp: 12000,
  stars: [
    // Left shoulder (Betelgeuse position)
    { id: 'h1', x: 0.25, y: 0.25, label: 'Foundation', requirementXp: 0, importance: 'core' },

    // Right shoulder (Bellatrix position)
    { id: 'h2', x: 0.75, y: 0.25, label: 'Strength', requirementXp: 800, importance: 'core' },

    // The Belt (Alnitak, Alnilam, Mintaka)
    { id: 'h3', x: 0.38, y: 0.5, requirementXp: 1200, importance: 'minor' },
    { id: 'h4', x: 0.5, y: 0.5, label: 'Core Power', requirementXp: 2000, importance: 'core' },
    { id: 'h5', x: 0.62, y: 0.5, requirementXp: 2800, importance: 'minor' },

    // Left leg (Saiph position)
    { id: 'h6', x: 0.3, y: 0.75, requirementXp: 3600, importance: 'minor' },

    // Right leg (Rigel position)
    { id: 'h7', x: 0.7, y: 0.75, label: 'Endurance', requirementXp: 5000, importance: 'core' },

    // Raised arm/club (reaching upward)
    { id: 'h8', x: 0.2, y: 0.15, requirementXp: 6000, importance: 'minor' },
    { id: 'h9', x: 0.15, y: 0.08, label: 'Peak Form', requirementXp: 7500, importance: 'core' },

    // Head
    { id: 'h10', x: 0.5, y: 0.12, label: 'Vitality', requirementXp: 9000, importance: 'core' },

    // Sword/lower extension
    { id: 'h11', x: 0.5, y: 0.65, requirementXp: 10500, importance: 'minor' },
    { id: 'h12', x: 0.5, y: 0.88, label: 'Complete', requirementXp: 12000, importance: 'core' }
  ],
  links: [
    // Shoulders to belt
    { from: 'h1', to: 'h3' }, { from: 'h2', to: 'h5' },
    // Belt
    { from: 'h3', to: 'h4' }, { from: 'h4', to: 'h5' },
    // Belt to legs
    { from: 'h3', to: 'h6' }, { from: 'h5', to: 'h7' },
    // Shoulders
    { from: 'h1', to: 'h2' },
    // Raised arm
    { from: 'h1', to: 'h8' }, { from: 'h8', to: 'h9' },
    // Head
    { from: 'h1', to: 'h10' }, { from: 'h2', to: 'h10' },
    // Sword
    { from: 'h4', to: 'h11' }, { from: 'h11', to: 'h12' }
  ]
};

/**
 * FINANCE CONSTELLATION: "Taurus Aureus" (Golden Bull)
 * Inspired by: Taurus - the V-shaped horns with Pleiades cluster
 * Shape: V-shaped bull's head with Hyades and Pleiades star clusters
 * 13 stars forming the bull's face, horns, and wealth clusters
 *
 * Represents: The bull of prosperity - strong horns reaching upward (growth),
 * the eye of Aldebaran (watchful wealth), and Pleiades (abundance)
 */
const FINANCE_CONSTELLATION: ModuleConstellation = {
  module: 'finance',
  displayName: 'Taurus Aureus',
  description: 'The Golden Bull - horns rise toward prosperity, eyes watch wealth multiply',
  maxXp: 13000,
  stars: [
    // The Eye - Aldebaran (brightest star)
    { id: 'f1', x: 0.5, y: 0.6, label: 'First Coin', requirementXp: 0, importance: 'core' },

    // Face/Hyades cluster (V-shape)
    { id: 'f2', x: 0.42, y: 0.5, requirementXp: 400, importance: 'minor' },
    { id: 'f3', x: 0.58, y: 0.5, requirementXp: 400, importance: 'minor' },
    { id: 'f4', x: 0.38, y: 0.42, requirementXp: 1000, importance: 'minor' },
    { id: 'f5', x: 0.62, y: 0.42, requirementXp: 1000, importance: 'minor' },

    // Left horn (rising)
    { id: 'f6', x: 0.3, y: 0.32, label: 'Builder', requirementXp: 2000, importance: 'core' },
    { id: 'f7', x: 0.22, y: 0.2, requirementXp: 3500, importance: 'minor' },
    { id: 'f8', x: 0.18, y: 0.1, label: 'Accumulator', requirementXp: 5500, importance: 'core' },

    // Right horn (rising)
    { id: 'f9', x: 0.7, y: 0.32, label: 'Investor', requirementXp: 2500, importance: 'core' },
    { id: 'f10', x: 0.78, y: 0.2, requirementXp: 4500, importance: 'minor' },
    { id: 'f11', x: 0.82, y: 0.1, label: 'Prosperous', requirementXp: 7000, importance: 'core' },

    // Pleiades cluster (seven sisters - abundance)
    { id: 'f12', x: 0.75, y: 0.65, requirementXp: 9500, importance: 'minor' },
    { id: 'f13', x: 0.82, y: 0.68, label: 'Abundant', requirementXp: 13000, importance: 'core' }
  ],
  links: [
    // Face V-shape
    { from: 'f1', to: 'f2' }, { from: 'f1', to: 'f3' },
    { from: 'f2', to: 'f4' }, { from: 'f3', to: 'f5' },
    // Left horn
    { from: 'f4', to: 'f6' }, { from: 'f6', to: 'f7' }, { from: 'f7', to: 'f8' },
    // Right horn
    { from: 'f5', to: 'f9' }, { from: 'f9', to: 'f10' }, { from: 'f10', to: 'f11' },
    // Pleiades connection
    { from: 'f1', to: 'f12' }, { from: 'f12', to: 'f13' }
  ]
};

/**
 * PRODUCTIVITY CONSTELLATION: "Ursa Efficiens" (Efficient Bear)
 * Inspired by: Ursa Major / Big Dipper - bowl and handle pattern
 * Shape: Classic dipper - bowl (container of work) and handle (tool for action)
 * 11 stars forming the iconic dipper shape
 *
 * Represents: The great dipper of productivity - bowl holds tasks (capacity),
 * handle extends for action (execution), pointing to the north star (true direction)
 */
const PRODUCTIVITY_CONSTELLATION: ModuleConstellation = {
  module: 'productivity',
  displayName: 'Ursa Efficiens',
  description: 'The Efficient Bear - dip deep into work, handle extends toward mastery',
  maxXp: 11000,
  stars: [
    // Bowl (4 stars forming square)
    { id: 'p1', x: 0.3, y: 0.5, label: 'First Task', requirementXp: 0, importance: 'core' },      // Dubhe
    { id: 'p2', x: 0.3, y: 0.7, requirementXp: 600, importance: 'core' },                        // Merak
    { id: 'p3', x: 0.48, y: 0.68, label: 'Systems', requirementXp: 1500, importance: 'core' },   // Phecda
    { id: 'p4', x: 0.48, y: 0.48, requirementXp: 2500, importance: 'core' },                      // Megrez

    // Handle (3 stars curving upward)
    { id: 'p5', x: 0.58, y: 0.45, label: 'Flow State', requirementXp: 3800, importance: 'core' }, // Alioth
    { id: 'p6', x: 0.68, y: 0.38, requirementXp: 5500, importance: 'core' },                      // Mizar
    { id: 'p7', x: 0.78, y: 0.3, label: 'Excellence', requirementXp: 7500, importance: 'core' },  // Alkaid

    // Supporting stars (Bear's body)
    { id: 'p8', x: 0.4, y: 0.35, requirementXp: 4200, importance: 'minor' },
    { id: 'p9', x: 0.22, y: 0.6, label: 'Discipline', requirementXp: 6000, importance: 'core' },

    // Extension to Polaris (north star / true direction)
    { id: 'p10', x: 0.25, y: 0.25, requirementXp: 8500, importance: 'minor' },
    { id: 'p11', x: 0.2, y: 0.1, label: 'Mastery', requirementXp: 11000, importance: 'core' }
  ],
  links: [
    // Bowl square
    { from: 'p1', to: 'p2' }, { from: 'p2', to: 'p3' },
    { from: 'p3', to: 'p4' }, { from: 'p4', to: 'p1' },
    // Handle
    { from: 'p4', to: 'p5' }, { from: 'p5', to: 'p6' }, { from: 'p6', to: 'p7' },
    // Bear's body
    { from: 'p1', to: 'p8' }, { from: 'p4', to: 'p8' },
    { from: 'p1', to: 'p9' }, { from: 'p2', to: 'p9' },
    // Pointer to Polaris (Dubhe to Polaris)
    { from: 'p1', to: 'p10' }, { from: 'p10', to: 'p11' }
  ]
};

/**
 * Export all constellations
 */
export const CONSTELLATIONS: ModuleConstellation[] = [
  JOURNAL_CONSTELLATION,
  KNOWLEDGE_CONSTELLATION,
  HEALTH_CONSTELLATION,
  FINANCE_CONSTELLATION,
  PRODUCTIVITY_CONSTELLATION
];

/**
 * Helper to get constellation by module ID
 */
export function getConstellation(moduleId: ModuleId): ModuleConstellation {
  const constellation = CONSTELLATIONS.find(c => c.module === moduleId);
  if (!constellation) {
    throw new Error(`Constellation not found for module: ${moduleId}`);
  }
  return constellation;
}
