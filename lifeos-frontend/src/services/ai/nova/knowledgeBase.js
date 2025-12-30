/**
 * Nova Knowledge Base
 *
 * Comprehensive system knowledge that Nova uses to understand Ascynt.
 * This enables Nova to answer questions about features, mechanics,
 * unlocks, troubleshooting, and navigation with accuracy.
 */

// ============================================================================
// NAVIGATION & ROUTES
// ============================================================================

export const ROUTES = {
  dashboard: {
    path: '/',
    name: 'Dashboard',
    description: 'Main overview with customizable widgets, quick stats, and daily summary',
    features: ['Widget customisation', 'Quick actions', 'Daily overview', 'Progress at a glance'],
  },
  modules: {
    path: '/modules',
    name: 'Modules',
    description: 'Grid view of all available modules - your command center',
    features: ['Module grid', 'Quick access', 'Status indicators'],
  },
  productivity: {
    path: '/productivity',
    name: 'Productivity',
    description: 'Tasks, projects, deep work sessions, and focus tracking',
    features: ['Daily tasks', 'Projects management', 'Pomodoro timer', 'Work sessions', 'Focus tracking'],
    subRoutes: {
      tasks: 'Daily task management with priorities and categories',
      projects: 'Long-term project tracking with progress',
      sessions: 'Deep work session logging',
    },
  },
  health: {
    path: '/health',
    name: 'Health',
    description: 'Nutrition tracking, meal logging, sleep, and wellness metrics',
    features: ['Meal logging', 'Calorie tracking', 'Macro breakdown', 'Sleep tracking', 'Weight tracking', 'Supplements'],
    subRoutes: {
      nutrition: 'Log meals and track macros (calories, protein, carbs, fat)',
      sleep: 'Track sleep duration and quality',
      weight: 'Monitor weight changes over time',
    },
  },
  fitness: {
    path: '/health',
    name: 'Fitness/Workouts',
    description: 'Strength training, cardio, workout templates, and personal records',
    features: ['Workout logging', 'Exercise library', 'Personal records', 'Cardio tracking', 'Templates'],
  },
  knowledge: {
    path: '/knowledge',
    name: 'Knowledge',
    description: 'Books, notes, ideas, learning logs, and quotes',
    features: ['Book tracking', 'Note-taking', 'Idea capture', 'Quote collection', 'Learning logs'],
  },
  journal: {
    path: '/journal',
    name: 'Journal',
    description: 'Daily journaling, mood tracking, and reflection prompts',
    features: ['Daily entries', 'Mood tracking', 'Reflection prompts', 'Book-style interface'],
  },
  calendar: {
    path: '/calendar',
    name: 'Calendar',
    description: 'Time blocking, scheduling, and energy mapping',
    features: ['Time blocks', 'Day/Week/Month views', 'Event scheduling', 'Drag and drop'],
  },
  skills: {
    path: '/skills',
    name: 'Skills',
    description: 'Skill tracking, practice logs, and perk trees',
    features: ['Skill cards', 'Practice logging', 'XP per skill', 'Perk trees', 'Milestones'],
  },
  financial: {
    path: '/financial',
    name: 'Financial',
    description: 'Budget envelopes, expense tracking, savings goals, and net worth',
    features: ['Budget envelopes', 'Transaction logging', 'Savings goals (sinking funds)', 'Net worth tracking', 'Income tracking'],
  },
  character: {
    path: '/character',
    name: 'Character',
    description: 'Avatar customisation, equipment, RPG stats, and evolution',
    features: ['Avatar display', 'Equipment slots', 'RPG stats', 'Cosmetics', 'Prestige system'],
  },
  quests: {
    path: '/quests',
    name: 'Quests',
    description: 'Daily quests, weekly challenges, achievements, and boss battles',
    features: ['Daily quests', 'Weekly quests', 'Achievements', 'Boss battles', 'Quest chains'],
  },
  social: {
    path: '/social',
    name: 'Social',
    description: 'Friends, guilds, leaderboards, and challenges',
    features: ['Friend system', 'Guilds', 'Leaderboards', 'PvP challenges', 'Activity feed'],
  },
  settings: {
    path: '/settings',
    name: 'Settings',
    description: 'App preferences, theme, notifications, and data export',
    features: ['Theme selection', 'Notification preferences', 'Data export', 'Account settings'],
  },
  resolutions: {
    path: '/resolutions',
    name: 'Resolutions',
    description: 'New Year resolutions and yearly goal tracking',
    features: ['Resolution tracking', 'Check-ins', 'Milestone achievements'],
  },
};

// ============================================================================
// GAMEPLAY MECHANICS
// ============================================================================

export const GAMEPLAY_MECHANICS = {
  xp: {
    name: 'Experience Points (XP)',
    description: 'XP is earned by completing activities across all modules. It contributes to your level.',
    sources: {
      task_completion: { amount: '10-50 XP', description: 'Based on task priority (low: 10, medium: 25, high: 50)' },
      workout_completion: { amount: '50-100 XP', description: 'Based on workout duration and intensity' },
      meal_logging: { amount: '10 XP', description: 'Per meal logged' },
      journal_entry: { amount: '25 XP', description: 'Per journal entry' },
      book_completion: { amount: '100 XP', description: 'Per book finished' },
      skill_practice: { amount: '5 XP per 10 min', description: 'Based on practice duration' },
      expense_logging: { amount: '5 XP', description: 'Per transaction logged' },
      quest_completion: { amount: '50-500 XP', description: 'Based on quest difficulty' },
      achievement_unlock: { amount: '100-1000 XP', description: 'Based on achievement rarity' },
    },
    multipliers: {
      streak: 'Longer streaks increase XP multiplier (up to 2x at 30+ days)',
      prestige: 'Prestige 1 gives 1.5x, Prestige 2 gives 2x XP',
      wisdom_stat: 'Each point of Wisdom adds 1% XP gain',
      pet_bonuses: 'Some pets provide XP bonuses',
    },
  },

  levels: {
    name: 'Leveling System',
    description: 'Your level represents overall progress. Each level requires more XP than the last.',
    formula: 'XP needed = 100 * level * 1.15^level (approximately)',
    milestones: {
      1: 'Beginner - Just starting out',
      10: 'Apprentice - Building habits',
      25: 'Adept - Consistency is key',
      50: 'Master - High achiever',
      100: 'Legend - Top tier user',
    },
  },

  streaks: {
    name: 'Streak System',
    description: 'Consecutive days of activity. Breaking a streak resets it to 0.',
    types: {
      global: 'Any activity on Ascynt counts',
      module: 'Specific to each module (fitness, journal, etc.)',
      custom: 'User-defined habits to track',
    },
    protection: {
      shields: 'Streak shields protect against one missed day',
      defense_stat: 'Defense stat provides chance to save streaks',
    },
    bonuses: {
      '7_days': 'XP multiplier bonus starts',
      '30_days': 'Significant XP boost, achievement unlock',
      '100_days': 'Major milestone, rare achievement',
      '365_days': 'Legendary status',
    },
  },

  cosmicCredits: {
    name: 'Cosmic Credits',
    description: 'In-app currency earned through gameplay',
    earning: [
      'Completing quests',
      'Unlocking achievements',
      'Leveling up',
      'Boss battle victories',
    ],
    spending: [
      'Cosmetic items',
      'Streak shields',
      'Pet unlocks',
      'Equipment upgrades',
    ],
  },

  prestige: {
    name: 'Prestige System',
    description: 'Reset your level for permanent bonuses and new content',
    levels: {
      0: { name: 'Mortal Realm', bonus: 'None' },
      1: { name: 'Cosmic Ascension', bonus: '1.5x XP multiplier' },
      2: { name: 'Transcendent', bonus: '2x XP multiplier' },
    },
    requirements: 'Reach level 100 to prestige',
    benefits: 'Higher XP gains, exclusive cosmetics, new equipment tiers',
  },
};

// ============================================================================
// RPG STATS
// ============================================================================

export const RPG_STATS = {
  strength: {
    name: 'Strength',
    icon: '💪',
    description: 'Physical power and workout effectiveness',
    benefits: [
      'Increases XP from workouts',
      'Boosts workout-related achievements',
      'Unlocks strength-based equipment',
    ],
    sources: ['Completing workouts', 'Hitting PRs', 'Consistency in fitness'],
  },
  vitality: {
    name: 'Vitality',
    icon: '❤️',
    description: 'Health, endurance, and recovery',
    benefits: [
      'Increases health module XP',
      'Better streak protection',
      'Unlocks health-focused items',
    ],
    sources: ['Logging meals', 'Good sleep', 'Meeting nutrition goals'],
  },
  intelligence: {
    name: 'Intelligence',
    icon: '🧠',
    description: 'Learning speed and knowledge retention',
    benefits: [
      'Bonus XP from knowledge activities',
      'Faster skill progression',
      'Unlocks knowledge-based items',
    ],
    sources: ['Reading books', 'Taking notes', 'Skill practice'],
  },
  wisdom: {
    name: 'Wisdom',
    icon: '✨',
    description: 'XP gain bonus and decision quality',
    benefits: [
      '+1% XP gain per point',
      'Better quest rewards',
      'Unlocks wisdom-based items',
    ],
    sources: ['Journaling', 'Reflection', 'Long-term consistency'],
  },
  defense: {
    name: 'Defense',
    icon: '🛡️',
    description: 'Streak protection and resilience',
    benefits: [
      'Chance to save broken streaks',
      'Reduced XP loss from failures',
      'Unlocks defensive equipment',
    ],
    sources: ['Maintaining streaks', 'Daily consistency', 'Completing daily tasks'],
  },
};

// ============================================================================
// EQUIPMENT SYSTEM
// ============================================================================

export const EQUIPMENT_SYSTEM = {
  slots: ['helmet', 'chest', 'legs', 'weapon', 'shield', 'cape', 'amulet', 'ring'],

  tiers: {
    common: { color: 'gray', statMultiplier: 1 },
    uncommon: { color: 'green', statMultiplier: 1.25 },
    rare: { color: 'blue', statMultiplier: 1.5 },
    epic: { color: 'purple', statMultiplier: 2 },
    legendary: { color: 'orange', statMultiplier: 3 },
    mythical: { color: 'red', statMultiplier: 5 },
  },

  unlockMethods: {
    level: 'Reach a specific level',
    achievement: 'Unlock a specific achievement',
    streak: 'Maintain a streak for X days',
    boss: 'Defeat a boss battle',
    purchase: 'Buy with cosmic credits',
    quest: 'Complete a quest chain',
    special: 'Seasonal or event-exclusive',
  },

  setBonus: 'Wearing items from the same set provides additional bonuses',
};

// ============================================================================
// PET/COMPANION SYSTEM
// ============================================================================

export const PET_SYSTEM = {
  description: 'Companions that provide passive bonuses',

  tiers: {
    common: { maxBonus: '5%', examples: ['Starling', 'Moon Rabbit'] },
    rare: { maxBonus: '10%', examples: ['Phoenix Chick', 'Crystal Golem'] },
    epic: { maxBonus: '15%', examples: ['Thunder Drake', 'Frost Wyrm'] },
    legendary: { maxBonus: '25%', examples: ['Celestial Dragon', 'Void Walker'] },
  },

  bonusTypes: {
    xp_boost: 'Increases XP gain',
    streak_protection: 'Helps protect streaks',
    module_bonus: 'Boosts specific module XP (fitness, knowledge, etc.)',
    cosmic_credits: 'Bonus cosmic credits earning',
  },

  slots: 'Pet slots unlock as you level up. Start with 1, max 5.',

  unlocking: 'Pets are unlocked through achievements, quests, and boss battles',
};

// ============================================================================
// QUEST SYSTEM
// ============================================================================

export const QUEST_SYSTEM = {
  types: {
    daily: {
      description: 'Reset at midnight, 3-5 quests per day',
      rewards: '50-100 XP, cosmic credits',
      examples: ['Complete 3 tasks', 'Log a meal', 'Do a workout'],
    },
    weekly: {
      description: 'Reset on Monday, longer-term goals',
      rewards: '200-500 XP, larger rewards',
      examples: ['Complete 20 tasks', 'Work out 4 times', 'Read for 2 hours'],
    },
    monthly: {
      description: 'Epic challenges for the dedicated',
      rewards: '1000+ XP, rare items',
      examples: ['30-day streak', 'Complete a book', 'Hit a PR'],
    },
    chains: {
      description: 'Multi-step quest lines with story',
      rewards: 'Progressive rewards, exclusive items at completion',
    },
  },

  bossBattles: {
    description: 'Special challenges against AI bosses',
    mechanics: 'Complete real-life tasks to deal damage to the boss',
    rewards: 'Rare equipment, pets, large XP bonuses',
  },
};

// ============================================================================
// ACHIEVEMENT CATEGORIES
// ============================================================================

export const ACHIEVEMENT_CATEGORIES = {
  streak: {
    name: 'Streak Achievements',
    examples: ['7-day streak', '30-day streak', '100-day streak', '365-day streak'],
  },
  fitness: {
    name: 'Fitness Achievements',
    examples: ['First workout', '100 workouts', 'PR champion', 'Cardio king'],
  },
  productivity: {
    name: 'Productivity Achievements',
    examples: ['Task master', 'Deep work warrior', 'Project complete'],
  },
  knowledge: {
    name: 'Knowledge Achievements',
    examples: ['Bookworm', 'Note taker', 'Idea machine'],
  },
  social: {
    name: 'Social Achievements',
    examples: ['First friend', 'Guild member', 'Challenge winner'],
  },
  special: {
    name: 'Special Achievements',
    examples: ['Early adopter', 'Beta tester', 'Holiday events'],
  },
};

// ============================================================================
// TROUBLESHOOTING
// ============================================================================

export const TROUBLESHOOTING = {
  sync_issues: {
    problem: 'Data not syncing across devices',
    solutions: [
      'Check your internet connection',
      'Try refreshing the page',
      'Log out and log back in',
      'Clear browser cache and reload',
    ],
  },
  streak_lost: {
    problem: 'Streak was reset unexpectedly',
    solutions: [
      'Streaks reset at midnight in your timezone',
      'Check if you had a streak shield active',
      'Some activities need to be explicitly logged',
    ],
  },
  xp_not_updating: {
    problem: 'XP not increasing after activity',
    solutions: [
      'Make sure the activity was saved/completed',
      'Refresh the page to sync',
      'Some XP updates may be delayed',
    ],
  },
  login_issues: {
    problem: 'Cannot log in',
    solutions: [
      'Check your email and password',
      'Try password reset',
      'Clear cookies and try again',
      'Try a different browser',
    ],
  },
  missing_data: {
    problem: 'Previous entries not showing',
    solutions: [
      'Check if you are logged into the correct account',
      'Data may take a moment to load',
      'Try refreshing the page',
    ],
  },
};

// ============================================================================
// TIPS & BEST PRACTICES
// ============================================================================

export const TIPS = {
  getting_started: [
    'Start with one module you want to focus on',
    'Set up daily tasks first - they drive consistency',
    'Log something every day to build streaks',
    'Check your quests for guidance on what to do',
  ],
  maximizing_xp: [
    'Maintain streaks - they multiply your XP',
    'Complete daily quests before they reset',
    'High priority tasks give more XP',
    'Equip items that boost XP gain',
    'Level up Wisdom stat for permanent XP boost',
  ],
  staying_consistent: [
    'Use the dashboard as your daily starting point',
    'Set up recurring tasks for regular habits',
    'Time block your most important activities',
    'Review your journal to reflect on progress',
  ],
  advanced: [
    'Work toward prestige for permanent bonuses',
    'Join a guild for social accountability',
    'Challenge friends to stay motivated',
    'Focus on unlocking legendary equipment',
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get route information by path or name
 */
export function getRouteInfo(query) {
  const queryLower = query.toLowerCase();

  for (const [key, route] of Object.entries(ROUTES)) {
    if (
      key.toLowerCase().includes(queryLower) ||
      route.name.toLowerCase().includes(queryLower) ||
      route.path.toLowerCase() === queryLower
    ) {
      return route;
    }
  }

  return null;
}

/**
 * Find relevant troubleshooting for an issue
 */
export function findTroubleshooting(issue) {
  const issueLower = issue.toLowerCase();

  for (const [key, troubleshoot] of Object.entries(TROUBLESHOOTING)) {
    if (
      key.includes(issueLower) ||
      troubleshoot.problem.toLowerCase().includes(issueLower)
    ) {
      return troubleshoot;
    }
  }

  return null;
}

/**
 * Get XP source information
 */
export function getXPInfo(source) {
  const sourceLower = source.toLowerCase();
  const sources = GAMEPLAY_MECHANICS.xp.sources;

  for (const [key, info] of Object.entries(sources)) {
    if (key.includes(sourceLower) || info.description.toLowerCase().includes(sourceLower)) {
      return { source: key, ...info };
    }
  }

  return null;
}

/**
 * Build context string for Nova's system prompt
 */
export function buildKnowledgeContext(query) {
  const sections = [];
  const queryLower = query.toLowerCase();

  // Always include navigation for "where" questions
  if (/where|find|go to|navigate|how do i get|page|section/i.test(query)) {
    const routes = Object.entries(ROUTES)
      .map(([key, r]) => `- ${r.name}: ${r.path} - ${r.description}`)
      .join('\n');
    sections.push(`NAVIGATION:\n${routes}`);
  }

  // Include XP info for XP-related questions
  if (/xp|experience|points|earn|level/i.test(query)) {
    const xpSources = Object.entries(GAMEPLAY_MECHANICS.xp.sources)
      .map(([key, s]) => `- ${key.replace(/_/g, ' ')}: ${s.amount} - ${s.description}`)
      .join('\n');
    sections.push(`XP SOURCES:\n${xpSources}`);
  }

  // Include streak info
  if (/streak|consecutive|daily|maintain/i.test(query)) {
    sections.push(`STREAKS:\n${GAMEPLAY_MECHANICS.streaks.description}\nBonuses: ${Object.entries(GAMEPLAY_MECHANICS.streaks.bonuses).map(([k, v]) => `${k}: ${v}`).join(', ')}`);
  }

  // Include stat info
  if (/stat|strength|vitality|intelligence|wisdom|defense|rpg/i.test(query)) {
    const stats = Object.entries(RPG_STATS)
      .map(([key, s]) => `- ${s.name} ${s.icon}: ${s.description}`)
      .join('\n');
    sections.push(`RPG STATS:\n${stats}`);
  }

  // Include equipment info
  if (/equipment|gear|item|slot|tier|unlock|weapon|armor|helmet/i.test(query)) {
    sections.push(`EQUIPMENT:\nSlots: ${EQUIPMENT_SYSTEM.slots.join(', ')}\nTiers: ${Object.keys(EQUIPMENT_SYSTEM.tiers).join(', ')}\nUnlock methods: ${Object.entries(EQUIPMENT_SYSTEM.unlockMethods).map(([k, v]) => `${k}: ${v}`).join('; ')}`);
  }

  // Include pet info
  if (/pet|companion|bonus/i.test(query)) {
    sections.push(`PETS:\n${PET_SYSTEM.description}\nTiers: ${Object.entries(PET_SYSTEM.tiers).map(([k, v]) => `${k} (${v.maxBonus})`).join(', ')}\nBonus types: ${Object.keys(PET_SYSTEM.bonusTypes).join(', ')}`);
  }

  // Include quest info
  if (/quest|daily|weekly|boss|challenge/i.test(query)) {
    const quests = Object.entries(QUEST_SYSTEM.types)
      .map(([key, q]) => `- ${key}: ${q.description}`)
      .join('\n');
    sections.push(`QUESTS:\n${quests}`);
  }

  // Include troubleshooting for problems
  if (/problem|issue|not working|help|error|bug|broken|lost|missing/i.test(query)) {
    const troubleshooting = Object.entries(TROUBLESHOOTING)
      .map(([key, t]) => `${t.problem}: ${t.solutions[0]}`)
      .join('\n');
    sections.push(`TROUBLESHOOTING:\n${troubleshooting}`);
  }

  return sections.join('\n\n');
}

// ============================================================================
// EXPORTS
// ============================================================================

export const novaKnowledgeBase = {
  ROUTES,
  GAMEPLAY_MECHANICS,
  RPG_STATS,
  EQUIPMENT_SYSTEM,
  PET_SYSTEM,
  QUEST_SYSTEM,
  ACHIEVEMENT_CATEGORIES,
  TROUBLESHOOTING,
  TIPS,
  getRouteInfo,
  findTroubleshooting,
  getXPInfo,
  buildKnowledgeContext,
};

export default novaKnowledgeBase;
