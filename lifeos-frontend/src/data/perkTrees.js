/**
 * LifeOS Perk Trees
 * Research-based progression system inspired by Skyrim, Path of Exile, and Habitica
 *
 * Structure:
 * - 6 stats, each with 15-20 perks
 * - 4 tiers: Novice (1-25), Adept (26-50), Expert (51-75), Master (76-100)
 * - Requirements: stat level + prerequisite perks
 * - Types: Passive, Unlock, Synergy, Keystone
 *
 * CONSTELLATION SHAPES (all fit within 800x600 viewBox with padding):
 * - BODY: Warrior/Atlas figure - humanoid shape with spread arms and legs
 * - MIND: Brain/Neural network - branching dendrite pattern
 * - SPIRIT: Lotus/Mandala - circular expanding pattern
 * - WEALTH: Pyramid/Arrow - upward pointing triangle
 * - SOCIAL: Web/Network - interconnected nodes spreading outward
 * - CRAFT: Anvil/Hammer - tool shape with central mass
 *
 * Coordinate system: x: 100-700 (center 400), y: 60-540 (ensures padding)
 */

export const PERK_TREES = {
  body: {
    name: 'BODY',
    color: '#d97757',
    // WARRIOR/ATLAS CONSTELLATION - Humanoid figure standing strong
    // Shape: Head at top, arms spread wide, torso center, legs at base
    perks: [
      // === TIER 1: NOVICE (Base - Legs/Stance) ===
      {
        id: 'body_foundation',
        name: 'Physical Foundation',
        tier: 'novice',
        level: 1,
        type: 'passive',
        description: '+10% XP from all physical activities',
        effect: { xpMultiplier: 1.1 },
        prerequisites: [],
        position: { x: 400, y: 480 } // Center base (torso base)
      },
      {
        id: 'body_endurance_1',
        name: 'Endurance I',
        tier: 'novice',
        level: 5,
        type: 'passive',
        description: 'Cardio workouts give +20% XP',
        effect: { cardioXpBonus: 0.2 },
        prerequisites: ['body_foundation'],
        position: { x: 320, y: 530 } // Left leg
      },
      {
        id: 'body_strength_1',
        name: 'Strength Training I',
        tier: 'novice',
        level: 5,
        type: 'passive',
        description: 'Strength workouts give +20% XP',
        effect: { strengthXpBonus: 0.2 },
        prerequisites: ['body_foundation'],
        position: { x: 480, y: 530 } // Right leg
      },
      {
        id: 'body_nutrition_basics',
        name: 'Nutrition Awareness',
        tier: 'novice',
        level: 10,
        type: 'unlock',
        description: 'Unlock macro tracking and meal planning',
        effect: { unlockFeature: 'macroTracking' },
        prerequisites: ['body_foundation'],
        position: { x: 400, y: 410 } // Core/torso center
      },
      {
        id: 'body_recovery_1',
        name: 'Recovery Protocol',
        tier: 'novice',
        level: 15,
        type: 'passive',
        description: 'Sleep tracking gives +50% XP. Log 8hr sleep for +20 bonus XP',
        effect: { sleepXpBonus: 0.5, sleepBonusXp: 20 },
        prerequisites: ['body_nutrition_basics'],
        position: { x: 400, y: 340 } // Upper torso
      },

      // === TIER 2: ADEPT (Arms spread wide) ===
      {
        id: 'body_endurance_2',
        name: 'Endurance II',
        tier: 'adept',
        level: 25,
        type: 'passive',
        description: 'Cardio workouts give +40% XP total. Unlock HIIT tracking',
        effect: { cardioXpBonus: 0.4, unlockFeature: 'hiitTracking' },
        prerequisites: ['body_endurance_1', 'body_recovery_1'],
        position: { x: 180, y: 310 } // Left arm extended
      },
      {
        id: 'body_strength_2',
        name: 'Strength Training II',
        tier: 'adept',
        level: 25,
        type: 'passive',
        description: 'Strength workouts give +40% XP total. Unlock progressive overload tracking',
        effect: { strengthXpBonus: 0.4, unlockFeature: 'progressiveOverload' },
        prerequisites: ['body_strength_1', 'body_recovery_1'],
        position: { x: 620, y: 310 } // Right arm extended
      },
      {
        id: 'body_synergy_mind',
        name: 'Mind-Body Connection',
        tier: 'adept',
        level: 30,
        type: 'synergy',
        description: 'Physical activities give +15% MIND XP. Unlock yoga/meditation tracking',
        effect: { mindXpBonus: 0.15, unlockFeature: 'yogaTracking' },
        prerequisites: ['body_recovery_1'],
        position: { x: 400, y: 270 } // Heart center
      },
      {
        id: 'body_consistency',
        name: 'Consistency Bonus',
        tier: 'adept',
        level: 35,
        type: 'passive',
        description: '+5% XP per day of workout streak (max 50%)',
        effect: { streakBonusPerDay: 0.05, streakBonusMax: 0.5 },
        prerequisites: ['body_synergy_mind'],
        position: { x: 400, y: 220 } // Neck
      },
      {
        id: 'body_athlete',
        name: 'Natural Athlete',
        tier: 'adept',
        level: 40,
        type: 'passive',
        description: 'All workouts give +25% XP. Reduce recovery time needed',
        effect: { allWorkoutsBonus: 0.25, recoveryReduction: 0.2 },
        prerequisites: ['body_endurance_2', 'body_strength_2', 'body_consistency'],
        position: { x: 400, y: 175 } // Lower head
      },

      // === TIER 3: EXPERT (Head/Crown) ===
      {
        id: 'body_peak_performance',
        name: 'Peak Performance',
        tier: 'expert',
        level: 50,
        type: 'keystone',
        description: 'KEYSTONE: +50% XP from all activities, but must workout 5x per week',
        effect: { globalXpBonus: 0.5, requirement: 'workout5xWeek' },
        prerequisites: ['body_athlete'],
        position: { x: 400, y: 130 } // Head center
      },
      {
        id: 'body_nutrition_mastery',
        name: 'Nutrition Mastery',
        tier: 'expert',
        level: 55,
        type: 'unlock',
        description: 'Perfect macro day gives +100 bonus XP. Unlock meal prep planner',
        effect: { perfectMacroBonusXp: 100, unlockFeature: 'mealPrepPlanner' },
        prerequisites: ['body_peak_performance'],
        position: { x: 320, y: 100 } // Left temple
      },
      {
        id: 'body_beast_mode',
        name: 'Beast Mode',
        tier: 'expert',
        level: 60,
        type: 'passive',
        description: 'Intense workouts (>45min) give double XP',
        effect: { intenseWorkoutMultiplier: 2 },
        prerequisites: ['body_peak_performance'],
        position: { x: 480, y: 100 } // Right temple
      },
      {
        id: 'body_iron_will',
        name: 'Iron Will',
        tier: 'expert',
        level: 70,
        type: 'synergy',
        description: 'Physical challenges give +25% SPIRIT XP. Never give up',
        effect: { spiritXpBonus: 0.25 },
        prerequisites: ['body_nutrition_mastery', 'body_beast_mode'],
        position: { x: 400, y: 70 } // Crown
      },

      // === TIER 4: MASTER (Star above head) ===
      {
        id: 'body_superhuman',
        name: 'Superhuman',
        tier: 'master',
        level: 80,
        type: 'keystone',
        description: 'ULTIMATE: All BODY activities give triple XP. Inspire others (+10% SOCIAL XP)',
        effect: { bodyXpMultiplier: 3, socialXpBonus: 0.1 },
        prerequisites: ['body_iron_will'],
        position: { x: 400, y: 60 } // Star above head (moved up slightly from crown)
      }
    ]
  },

  mind: {
    name: 'MIND',
    color: '#7b68d9',
    // BRAIN/NEURAL NETWORK CONSTELLATION - Branching dendrite pattern
    // Shape: Central node with multiple branches spreading outward like neurons
    perks: [
      // === TIER 1: NOVICE (Central stem) ===
      {
        id: 'mind_foundation',
        name: 'Cognitive Foundation',
        tier: 'novice',
        level: 1,
        type: 'passive',
        description: '+10% XP from all learning activities',
        effect: { xpMultiplier: 1.1 },
        prerequisites: [],
        position: { x: 400, y: 500 } // Brain stem base
      },
      {
        id: 'mind_reader_1',
        name: 'Avid Reader I',
        tier: 'novice',
        level: 5,
        type: 'passive',
        description: 'Reading gives +25% XP. Track books and pages',
        effect: { readingXpBonus: 0.25, unlockFeature: 'bookTracking' },
        prerequisites: ['mind_foundation'],
        position: { x: 280, y: 450 } // Left branch start
      },
      {
        id: 'mind_focus_1',
        name: 'Deep Focus I',
        tier: 'novice',
        level: 5,
        type: 'passive',
        description: 'Deep work sessions give +25% XP',
        effect: { deepWorkXpBonus: 0.25 },
        prerequisites: ['mind_foundation'],
        position: { x: 520, y: 450 } // Right branch start
      },
      {
        id: 'mind_note_taker',
        name: 'Note Taker',
        tier: 'novice',
        level: 10,
        type: 'unlock',
        description: 'Creating notes gives +20 XP. Unlock Zettelkasten system',
        effect: { noteXp: 20, unlockFeature: 'zettelkasten' },
        prerequisites: ['mind_reader_1', 'mind_focus_1'],
        position: { x: 400, y: 390 } // Central convergence
      },
      {
        id: 'mind_curiosity',
        name: 'Insatiable Curiosity',
        tier: 'novice',
        level: 15,
        type: 'passive',
        description: 'Learning new topics gives +50% XP for first 3 sessions',
        effect: { newTopicBonus: 0.5, newTopicSessions: 3 },
        prerequisites: ['mind_note_taker'],
        position: { x: 400, y: 330 } // Upward stem
      },

      // === TIER 2: ADEPT (Branching dendrites) ===
      {
        id: 'mind_reader_2',
        name: 'Voracious Reader II',
        tier: 'adept',
        level: 25,
        type: 'passive',
        description: 'Reading gives +50% XP. Finishing books gives +200 bonus XP',
        effect: { readingXpBonus: 0.5, bookCompletionBonus: 200 },
        prerequisites: ['mind_reader_1', 'mind_curiosity'],
        position: { x: 160, y: 340 } // Far left branch
      },
      {
        id: 'mind_focus_2',
        name: 'Flow State II',
        tier: 'adept',
        level: 25,
        type: 'passive',
        description: 'Deep work 2+ hours gives double XP. Unlock Pomodoro timer',
        effect: { longSessionMultiplier: 2, unlockFeature: 'pomodoroTimer' },
        prerequisites: ['mind_focus_1', 'mind_curiosity'],
        position: { x: 640, y: 340 } // Far right branch
      },
      {
        id: 'mind_synthesizer',
        name: 'Knowledge Synthesizer',
        tier: 'adept',
        level: 30,
        type: 'unlock',
        description: 'Connecting notes gives +30 XP. Unlock mind map visualization',
        effect: { linkNotesXp: 30, unlockFeature: 'mindMaps' },
        prerequisites: ['mind_note_taker'],
        position: { x: 400, y: 270 } // Central hub
      },
      {
        id: 'mind_polymath',
        name: 'Polymath',
        tier: 'adept',
        level: 35,
        type: 'passive',
        description: 'Learning 5+ different topics gives +30% XP to all',
        effect: { diversityBonus: 0.3, diversityRequirement: 5 },
        prerequisites: ['mind_synthesizer'],
        position: { x: 400, y: 210 } // Upper stem
      },
      {
        id: 'mind_teacher',
        name: 'Teacher',
        tier: 'adept',
        level: 40,
        type: 'synergy',
        description: 'Explaining concepts gives MIND XP. +15% SOCIAL XP when teaching',
        effect: { teachingXp: 50, socialXpBonus: 0.15 },
        prerequisites: ['mind_reader_2', 'mind_focus_2', 'mind_polymath'],
        position: { x: 400, y: 160 } // Pre-cortex
      },

      // === TIER 3: EXPERT (Cortex branches) ===
      {
        id: 'mind_genius',
        name: 'Genius',
        tier: 'expert',
        level: 50,
        type: 'keystone',
        description: 'KEYSTONE: +100% XP from learning, but lose 50 XP for each missed day',
        effect: { learningMultiplier: 2, missedDayPenalty: -50 },
        prerequisites: ['mind_teacher'],
        position: { x: 400, y: 115 } // Cortex center
      },
      {
        id: 'mind_speed_reader',
        name: 'Speed Reader',
        tier: 'expert',
        level: 55,
        type: 'passive',
        description: 'Reading speed increases 50%. Complete 2 books per week for +500 XP',
        effect: { readingSpeedBonus: 0.5, weeklyBookBonus: 500 },
        prerequisites: ['mind_genius'],
        position: { x: 270, y: 100 } // Left lobe
      },
      {
        id: 'mind_hyperfocus',
        name: 'Hyperfocus',
        tier: 'expert',
        level: 60,
        type: 'passive',
        description: 'Deep work 4+ hours gives triple XP. Enter flow instantly',
        effect: { marathonMultiplier: 3, flowBonus: true },
        prerequisites: ['mind_genius'],
        position: { x: 530, y: 100 } // Right lobe
      },
      {
        id: 'mind_master_learner',
        name: 'Master Learner',
        tier: 'expert',
        level: 70,
        type: 'unlock',
        description: 'Can learn any skill 2x faster. Unlock spaced repetition system',
        effect: { learningSpeedMultiplier: 2, unlockFeature: 'spacedRepetition' },
        prerequisites: ['mind_speed_reader', 'mind_hyperfocus'],
        position: { x: 400, y: 70 } // Upper cortex
      },

      // === TIER 4: MASTER (Crown of consciousness) ===
      {
        id: 'mind_infinite',
        name: 'Infinite Mind',
        tier: 'master',
        level: 80,
        type: 'keystone',
        description: 'ULTIMATE: Triple XP from all learning. All other stats gain +10% XP',
        effect: { mindXpMultiplier: 3, globalXpBonus: 0.1 },
        prerequisites: ['mind_master_learner'],
        position: { x: 400, y: 60 } // Transcendence point
      }
    ]
  },

  spirit: {
    name: 'SPIRIT',
    color: '#57d9d4',
    // LOTUS/MANDALA CONSTELLATION - Circular expanding pattern
    // Shape: Central seed expanding outward in concentric rings like lotus petals
    perks: [
      // === TIER 1: NOVICE (Inner seed/core) ===
      {
        id: 'spirit_foundation',
        name: 'Inner Journey',
        tier: 'novice',
        level: 1,
        type: 'passive',
        description: '+10% XP from all mindfulness activities',
        effect: { xpMultiplier: 1.1 },
        prerequisites: [],
        position: { x: 400, y: 300 } // Center of mandala
      },
      {
        id: 'spirit_meditation_1',
        name: 'Meditation I',
        tier: 'novice',
        level: 5,
        type: 'passive',
        description: 'Meditation gives +30% XP. Track sessions and duration',
        effect: { meditationXpBonus: 0.3, unlockFeature: 'meditationTimer' },
        prerequisites: ['spirit_foundation'],
        position: { x: 310, y: 250 } // Inner ring - left
      },
      {
        id: 'spirit_gratitude_1',
        name: 'Gratitude Practice I',
        tier: 'novice',
        level: 5,
        type: 'passive',
        description: 'Daily gratitude log gives +25 XP. Streak bonus active',
        effect: { gratitudeXp: 25, streakBonus: true },
        prerequisites: ['spirit_foundation'],
        position: { x: 490, y: 250 } // Inner ring - right
      },
      {
        id: 'spirit_journal',
        name: 'Journaling',
        tier: 'novice',
        level: 10,
        type: 'unlock',
        description: 'Journal entries give +50 XP. Unlock reflection prompts',
        effect: { journalXp: 50, unlockFeature: 'reflectionPrompts' },
        prerequisites: ['spirit_meditation_1', 'spirit_gratitude_1'],
        position: { x: 400, y: 200 } // Inner ring - top
      },
      {
        id: 'spirit_awareness',
        name: 'Self-Awareness',
        tier: 'novice',
        level: 15,
        type: 'passive',
        description: 'Mood tracking gives +15 XP. Unlock emotion wheel',
        effect: { moodTrackingXp: 15, unlockFeature: 'emotionWheel' },
        prerequisites: ['spirit_journal'],
        position: { x: 400, y: 370 } // Inner ring - bottom
      },

      // === TIER 2: ADEPT (Second petal ring) ===
      {
        id: 'spirit_meditation_2',
        name: 'Deep Meditation II',
        tier: 'adept',
        level: 25,
        type: 'passive',
        description: '20+ min meditation gives double XP. Unlock guided meditations',
        effect: { longMeditationMultiplier: 2, unlockFeature: 'guidedMeditations' },
        prerequisites: ['spirit_meditation_1', 'spirit_awareness'],
        position: { x: 200, y: 280 } // Second ring - far left
      },
      {
        id: 'spirit_gratitude_2',
        name: 'Gratitude Master II',
        tier: 'adept',
        level: 25,
        type: 'passive',
        description: '3 gratitudes per day gives +75 XP. Unlock gratitude challenges',
        effect: { tripleGratitudeXp: 75, unlockFeature: 'gratitudeChallenges' },
        prerequisites: ['spirit_gratitude_1', 'spirit_awareness'],
        position: { x: 600, y: 280 } // Second ring - far right
      },
      {
        id: 'spirit_reflection',
        name: 'Deep Reflection',
        tier: 'adept',
        level: 30,
        type: 'unlock',
        description: 'Weekly reflections give +150 XP. Unlock life review system',
        effect: { weeklyReflectionXp: 150, unlockFeature: 'lifeReview' },
        prerequisites: ['spirit_journal'],
        position: { x: 400, y: 140 } // Second ring - top
      },
      {
        id: 'spirit_emotional_intelligence',
        name: 'Emotional Intelligence',
        tier: 'adept',
        level: 35,
        type: 'synergy',
        description: 'Understanding emotions gives +20% SOCIAL XP',
        effect: { socialXpBonus: 0.2 },
        prerequisites: ['spirit_reflection'],
        position: { x: 400, y: 450 } // Second ring - bottom
      },
      {
        id: 'spirit_mindful_living',
        name: 'Mindful Living',
        tier: 'adept',
        level: 40,
        type: 'passive',
        description: 'All daily activities give +15% SPIRIT XP when done mindfully',
        effect: { mindfulnessBonus: 0.15 },
        prerequisites: ['spirit_meditation_2', 'spirit_gratitude_2', 'spirit_emotional_intelligence'],
        position: { x: 400, y: 300 } // Returns to center (convergence)
      },

      // === TIER 3: EXPERT (Outer petals) ===
      {
        id: 'spirit_enlightenment',
        name: 'Path to Enlightenment',
        tier: 'expert',
        level: 50,
        type: 'keystone',
        description: 'KEYSTONE: +75% XP from all SPIRIT activities. Reduce all stress by 50%',
        effect: { spiritXpBonus: 0.75, stressReduction: 0.5 },
        prerequisites: ['spirit_mindful_living'],
        position: { x: 400, y: 90 } // Top outer petal
      },
      {
        id: 'spirit_zen_master',
        name: 'Zen Master',
        tier: 'expert',
        level: 55,
        type: 'passive',
        description: '1 hour meditation gives 500 XP. Can enter deep states instantly',
        effect: { zenMeditationXp: 500, instantZen: true },
        prerequisites: ['spirit_enlightenment'],
        position: { x: 250, y: 140 } // Outer left petal
      },
      {
        id: 'spirit_life_purpose',
        name: 'Life Purpose',
        tier: 'expert',
        level: 60,
        type: 'unlock',
        description: 'Define life purpose. All activities aligned with purpose give +25% XP',
        effect: { purposeBonus: 0.25, unlockFeature: 'purposeDefinition' },
        prerequisites: ['spirit_enlightenment'],
        position: { x: 550, y: 140 } // Outer right petal
      },
      {
        id: 'spirit_inner_peace',
        name: 'Unshakeable Inner Peace',
        tier: 'expert',
        level: 70,
        type: 'passive',
        description: 'Maintain 30-day meditation streak for +1000 XP. Cannot be shaken',
        effect: { peaceStreakBonus: 1000, unshakeableBonus: true },
        prerequisites: ['spirit_zen_master', 'spirit_life_purpose'],
        position: { x: 400, y: 520 } // Outer bottom petal
      },

      // === TIER 4: MASTER (Crown/halo) ===
      {
        id: 'spirit_transcendence',
        name: 'Transcendence',
        tier: 'master',
        level: 80,
        type: 'keystone',
        description: 'ULTIMATE: Triple SPIRIT XP. All stats benefit from inner peace (+15% XP)',
        effect: { spiritXpMultiplier: 3, globalXpBonus: 0.15 },
        prerequisites: ['spirit_inner_peace'],
        position: { x: 400, y: 60 } // Crown above lotus
      }
    ]
  },

  wealth: {
    name: 'WEALTH',
    color: '#d9c157',
    // PYRAMID/ARROW CONSTELLATION - Upward pointing triangle
    // Shape: Wide base narrowing to peak like a wealth pyramid or upward arrow
    perks: [
      // === TIER 1: NOVICE (Wide pyramid base) ===
      {
        id: 'wealth_foundation',
        name: 'Financial Awareness',
        tier: 'novice',
        level: 1,
        type: 'passive',
        description: '+10% XP from all financial activities',
        effect: { xpMultiplier: 1.1 },
        prerequisites: [],
        position: { x: 400, y: 500 } // Center base
      },
      {
        id: 'wealth_tracking',
        name: 'Income Tracker',
        tier: 'novice',
        level: 5,
        type: 'unlock',
        description: 'Track all income sources. Earn 1 XP per $10 tracked',
        effect: { incomeXpRate: 0.1, unlockFeature: 'incomeTracking' },
        prerequisites: ['wealth_foundation'],
        position: { x: 200, y: 490 } // Far left base
      },
      {
        id: 'wealth_budgeting',
        name: 'Budget Master',
        tier: 'novice',
        level: 5,
        type: 'unlock',
        description: 'Create budgets. Staying under budget gives +50 XP per week',
        effect: { budgetBonusXp: 50, unlockFeature: 'budgetPlanning' },
        prerequisites: ['wealth_foundation'],
        position: { x: 600, y: 490 } // Far right base
      },
      {
        id: 'wealth_saver',
        name: 'Consistent Saver',
        tier: 'novice',
        level: 10,
        type: 'passive',
        description: 'Every $100 saved gives +10 XP. Unlock savings goals',
        effect: { savingsXpPer100: 10, unlockFeature: 'savingsGoals' },
        prerequisites: ['wealth_tracking', 'wealth_budgeting'],
        position: { x: 400, y: 420 } // First convergence
      },
      {
        id: 'wealth_emergency_fund',
        name: 'Emergency Fund',
        tier: 'novice',
        level: 15,
        type: 'passive',
        description: 'Reaching $1000 emergency fund gives +500 XP. Reduces stress',
        effect: { emergencyFundBonus: 500, stressReduction: 0.2 },
        prerequisites: ['wealth_saver'],
        position: { x: 400, y: 360 } // Rising point
      },

      // === TIER 2: ADEPT (Narrowing middle) ===
      {
        id: 'wealth_investor',
        name: 'First Investor',
        tier: 'adept',
        level: 25,
        type: 'unlock',
        description: 'Start investing. Each investment gives +100 XP. Track portfolio',
        effect: { investmentXp: 100, unlockFeature: 'portfolioTracking' },
        prerequisites: ['wealth_emergency_fund'],
        position: { x: 280, y: 310 } // Left slope
      },
      {
        id: 'wealth_entrepreneur',
        name: 'Entrepreneur',
        tier: 'adept',
        level: 25,
        type: 'unlock',
        description: 'Track business income. Business profit gives double XP',
        effect: { businessXpMultiplier: 2, unlockFeature: 'businessTracking' },
        prerequisites: ['wealth_emergency_fund'],
        position: { x: 520, y: 310 } // Right slope
      },
      {
        id: 'wealth_debt_free',
        name: 'Debt Destroyer',
        tier: 'adept',
        level: 30,
        type: 'passive',
        description: 'Paying off debt gives +200 XP per $1000. Debt-free gives +2000 XP',
        effect: { debtPaymentXp: 0.2, debtFreeBonus: 2000 },
        prerequisites: ['wealth_saver'],
        position: { x: 400, y: 290 } // Center spine
      },
      {
        id: 'wealth_passive_income',
        name: 'Passive Income',
        tier: 'adept',
        level: 35,
        type: 'passive',
        description: 'Passive income gives +50% more XP. Unlock income stream tracker',
        effect: { passiveIncomeBonus: 0.5, unlockFeature: 'incomeStreams' },
        prerequisites: ['wealth_debt_free'],
        position: { x: 400, y: 230 } // Rising
      },
      {
        id: 'wealth_financially_literate',
        name: 'Financially Literate',
        tier: 'adept',
        level: 40,
        type: 'synergy',
        description: 'Reading finance books gives +30% MIND XP. Make informed decisions',
        effect: { mindXpBonus: 0.3, unlockFeature: 'financialEducation' },
        prerequisites: ['wealth_investor', 'wealth_entrepreneur', 'wealth_passive_income'],
        position: { x: 400, y: 175 } // Pre-peak
      },

      // === TIER 3: EXPERT (Near peak) ===
      {
        id: 'wealth_abundance',
        name: 'Abundance Mindset',
        tier: 'expert',
        level: 50,
        type: 'keystone',
        description: 'KEYSTONE: All income gives +100% XP. Generate wealth effortlessly',
        effect: { incomeXpMultiplier: 2, abundanceMode: true },
        prerequisites: ['wealth_financially_literate'],
        position: { x: 400, y: 130 } // Upper pyramid
      },
      {
        id: 'wealth_net_worth',
        name: 'Net Worth Warrior',
        tier: 'expert',
        level: 55,
        type: 'passive',
        description: 'Every $10k net worth gives +100 XP. Track wealth growth',
        effect: { netWorthXpPer10k: 100, unlockFeature: 'netWorthTracking' },
        prerequisites: ['wealth_abundance'],
        position: { x: 330, y: 100 } // Left peak edge
      },
      {
        id: 'wealth_portfolio_master',
        name: 'Portfolio Master',
        tier: 'expert',
        level: 60,
        type: 'passive',
        description: 'Diversified portfolio (5+ investments) gives +200 XP per month',
        effect: { diversificationBonus: 200, diversificationMin: 5 },
        prerequisites: ['wealth_abundance'],
        position: { x: 470, y: 100 } // Right peak edge
      },
      {
        id: 'wealth_millionaire_path',
        name: 'Millionaire Path',
        tier: 'expert',
        level: 70,
        type: 'unlock',
        description: 'Unlock millionaire roadmap. $100k milestones give +5000 XP',
        effect: { milestoneBonus: 5000, unlockFeature: 'millionaireRoadmap' },
        prerequisites: ['wealth_net_worth', 'wealth_portfolio_master'],
        position: { x: 400, y: 70 } // Near apex
      },

      // === TIER 4: MASTER (Pyramid capstone) ===
      {
        id: 'wealth_financial_freedom',
        name: 'Financial Freedom',
        tier: 'master',
        level: 80,
        type: 'keystone',
        description: 'ULTIMATE: Triple wealth XP. Passive income exceeds expenses. True freedom',
        effect: { wealthXpMultiplier: 3, financialFreedom: true, globalXpBonus: 0.1 },
        prerequisites: ['wealth_millionaire_path'],
        position: { x: 400, y: 60 } // Golden capstone
      }
    ]
  },

  social: {
    name: 'SOCIAL',
    color: '#57d98a',
    // WEB/NETWORK CONSTELLATION - Interconnected nodes spreading outward
    // Shape: Central hub with spokes radiating to outer nodes like a social network
    perks: [
      // === TIER 1: NOVICE (Central hub) ===
      {
        id: 'social_foundation',
        name: 'Social Presence',
        tier: 'novice',
        level: 1,
        type: 'passive',
        description: '+10% XP from all social activities',
        effect: { xpMultiplier: 1.1 },
        prerequisites: [],
        position: { x: 400, y: 320 } // Center hub
      },
      {
        id: 'social_conversationalist',
        name: 'Conversationalist I',
        tier: 'novice',
        level: 5,
        type: 'passive',
        description: 'Meaningful conversations give +25 XP. Track social interactions',
        effect: { conversationXp: 25, unlockFeature: 'interactionTracking' },
        prerequisites: ['social_foundation'],
        position: { x: 260, y: 270 } // Spoke upper-left
      },
      {
        id: 'social_networker',
        name: 'Networker I',
        tier: 'novice',
        level: 5,
        type: 'passive',
        description: 'Meeting new people gives +50 XP. Build your network',
        effect: { newConnectionXp: 50, unlockFeature: 'networkMap' },
        prerequisites: ['social_foundation'],
        position: { x: 540, y: 270 } // Spoke upper-right
      },
      {
        id: 'social_active_listener',
        name: 'Active Listener',
        tier: 'novice',
        level: 10,
        type: 'passive',
        description: 'Deep listening gives +35 XP. People feel heard and valued',
        effect: { listeningXp: 35, charismaBonus: 0.1 },
        prerequisites: ['social_conversationalist', 'social_networker'],
        position: { x: 400, y: 220 } // Upper spoke
      },
      {
        id: 'social_event_goer',
        name: 'Event Attendee',
        tier: 'novice',
        level: 15,
        type: 'passive',
        description: 'Attending events gives +75 XP. Step outside comfort zone',
        effect: { eventXp: 75, confidenceBonus: 0.1 },
        prerequisites: ['social_active_listener'],
        position: { x: 400, y: 420 } // Lower spoke
      },

      // === TIER 2: ADEPT (Outer ring nodes) ===
      {
        id: 'social_charismatic',
        name: 'Charismatic',
        tier: 'adept',
        level: 25,
        type: 'passive',
        description: 'Social interactions give +50% XP. Natural charm unlocked',
        effect: { socialXpBonus: 0.5, charismaUnlocked: true },
        prerequisites: ['social_event_goer'],
        position: { x: 180, y: 360 } // Far left node
      },
      {
        id: 'social_public_speaker',
        name: 'Public Speaker I',
        tier: 'adept',
        level: 25,
        type: 'unlock',
        description: 'Presentations give +150 XP. Unlock speech tracking',
        effect: { presentationXp: 150, unlockFeature: 'speechTracking' },
        prerequisites: ['social_event_goer'],
        position: { x: 620, y: 360 } // Far right node
      },
      {
        id: 'social_relationship_builder',
        name: 'Relationship Builder',
        tier: 'adept',
        level: 30,
        type: 'unlock',
        description: 'Nurturing relationships gives +40 XP. Track relationship health',
        effect: { relationshipXp: 40, unlockFeature: 'relationshipCRM' },
        prerequisites: ['social_active_listener'],
        position: { x: 400, y: 150 } // Top node
      },
      {
        id: 'social_collaborator',
        name: 'Master Collaborator',
        tier: 'adept',
        level: 35,
        type: 'synergy',
        description: 'Group projects give +20% CRAFT XP. Teamwork makes the dream work',
        effect: { craftXpBonus: 0.2, teamworkBonus: true },
        prerequisites: ['social_relationship_builder'],
        position: { x: 400, y: 490 } // Bottom node
      },
      {
        id: 'social_connector',
        name: 'Super Connector',
        tier: 'adept',
        level: 40,
        type: 'passive',
        description: 'Introducing people gives +60 XP. Your network becomes exponential',
        effect: { connectionXp: 60, networkEffect: 1.5 },
        prerequisites: ['social_charismatic', 'social_public_speaker', 'social_collaborator'],
        position: { x: 400, y: 320 } // Returns to center (super hub)
      },

      // === TIER 3: EXPERT (Outer influence nodes) ===
      {
        id: 'social_influencer',
        name: 'Social Influencer',
        tier: 'expert',
        level: 50,
        type: 'keystone',
        description: 'KEYSTONE: Double social XP. Your words carry weight and inspire action',
        effect: { socialXpMultiplier: 2, influenceUnlocked: true },
        prerequisites: ['social_connector'],
        position: { x: 400, y: 100 } // Top influence
      },
      {
        id: 'social_thought_leader',
        name: 'Thought Leader',
        tier: 'expert',
        level: 55,
        type: 'synergy',
        description: 'Sharing knowledge gives +25% MIND XP. Teach and inspire others',
        effect: { mindXpBonus: 0.25, thoughtLeadership: true },
        prerequisites: ['social_influencer'],
        position: { x: 240, y: 180 } // Upper-left influence
      },
      {
        id: 'social_community_builder',
        name: 'Community Builder',
        tier: 'expert',
        level: 60,
        type: 'unlock',
        description: 'Building communities gives +300 XP. Create lasting impact',
        effect: { communityXp: 300, unlockFeature: 'communityTracking' },
        prerequisites: ['social_influencer'],
        position: { x: 560, y: 180 } // Upper-right influence
      },
      {
        id: 'social_mentor',
        name: 'Mentor',
        tier: 'expert',
        level: 70,
        type: 'passive',
        description: 'Mentoring others gives +100 XP per session. Legacy builder',
        effect: { mentoringXp: 100, legacyBonus: true },
        prerequisites: ['social_thought_leader', 'social_community_builder'],
        position: { x: 400, y: 530 } // Bottom influence
      },

      // === TIER 4: MASTER (Crown node) ===
      {
        id: 'social_legendary',
        name: 'Legendary Networker',
        tier: 'master',
        level: 80,
        type: 'keystone',
        description: 'ULTIMATE: Triple social XP. Open any door. Connect with anyone. Limitless',
        effect: { socialXpMultiplier: 3, limitlessNetworking: true, globalXpBonus: 0.1 },
        prerequisites: ['social_mentor'],
        position: { x: 400, y: 60 } // Legendary status
      }
    ]
  },

  craft: {
    name: 'CRAFT',
    color: '#b8b8c8',
    // ANVIL/HAMMER CONSTELLATION - Tool shape with central mass
    // Shape: Heavy central body (anvil) with handle extending down, tools radiating
    perks: [
      // === TIER 1: NOVICE (Handle/base) ===
      {
        id: 'craft_foundation',
        name: 'Skill Apprentice',
        tier: 'novice',
        level: 1,
        type: 'passive',
        description: '+10% XP from all skill practice',
        effect: { xpMultiplier: 1.1 },
        prerequisites: [],
        position: { x: 400, y: 530 } // Handle base
      },
      {
        id: 'craft_practice',
        name: 'Deliberate Practice I',
        tier: 'novice',
        level: 5,
        type: 'passive',
        description: 'Focused practice gives +25% XP. Track practice hours',
        effect: { practiceXpBonus: 0.25, unlockFeature: 'practiceLog' },
        prerequisites: ['craft_foundation'],
        position: { x: 400, y: 460 } // Handle middle
      },
      {
        id: 'craft_learning',
        name: 'Fast Learner I',
        tier: 'novice',
        level: 5,
        type: 'synergy',
        description: 'Learning new skills gives +20% MIND XP. Absorb knowledge quickly',
        effect: { mindXpBonus: 0.2, learningSpeedBonus: 0.1 },
        prerequisites: ['craft_foundation'],
        position: { x: 400, y: 400 } // Handle top
      },
      {
        id: 'craft_consistency',
        name: 'Consistent Crafter',
        tier: 'novice',
        level: 10,
        type: 'passive',
        description: 'Daily practice gives +5% XP per streak day (max 50%)',
        effect: { streakBonusPerDay: 0.05, streakBonusMax: 0.5 },
        prerequisites: ['craft_practice', 'craft_learning'],
        position: { x: 400, y: 340 } // Anvil base
      },
      {
        id: 'craft_portfolio',
        name: 'Portfolio Builder',
        tier: 'novice',
        level: 15,
        type: 'unlock',
        description: 'Track projects. Completed projects give +200 XP',
        effect: { projectXp: 200, unlockFeature: 'portfolioTracking' },
        prerequisites: ['craft_consistency'],
        position: { x: 400, y: 280 } // Anvil center
      },

      // === TIER 2: ADEPT (Anvil body - wide and solid) ===
      {
        id: 'craft_specialist',
        name: 'Specialist',
        tier: 'adept',
        level: 25,
        type: 'passive',
        description: 'Focusing on 1 skill gives +75% XP. Deep specialization',
        effect: { specializationBonus: 0.75, specializationMode: true },
        prerequisites: ['craft_portfolio'],
        position: { x: 220, y: 270 } // Anvil left wing
      },
      {
        id: 'craft_polymath',
        name: 'Multi-Skilled',
        tier: 'adept',
        level: 25,
        type: 'passive',
        description: 'Learning 3+ skills gives +30% XP to all. Renaissance person',
        effect: { multiskillBonus: 0.3, minSkills: 3 },
        prerequisites: ['craft_portfolio'],
        position: { x: 580, y: 270 } // Anvil right wing
      },
      {
        id: 'craft_10000_hours',
        name: '10,000 Hours',
        tier: 'adept',
        level: 30,
        type: 'passive',
        description: 'Every 100 hours gives +500 XP. Track path to mastery',
        effect: { hourMilestoneXp: 500, hourMilestone: 100 },
        prerequisites: ['craft_consistency'],
        position: { x: 400, y: 220 } // Anvil upper center
      },
      {
        id: 'craft_feedback',
        name: 'Feedback Seeker',
        tier: 'adept',
        level: 35,
        type: 'unlock',
        description: 'Getting feedback gives +50 XP. Improve faster through critique',
        effect: { feedbackXp: 50, unlockFeature: 'feedbackTracking' },
        prerequisites: ['craft_10000_hours'],
        position: { x: 400, y: 170 } // Rising to face
      },
      {
        id: 'craft_creative',
        name: 'Creative Flow',
        tier: 'adept',
        level: 40,
        type: 'passive',
        description: '2+ hour sessions give double XP. Enter creative flow state',
        effect: { flowMultiplier: 2, flowUnlocked: true },
        prerequisites: ['craft_specialist', 'craft_polymath', 'craft_feedback'],
        position: { x: 400, y: 130 } // Hammer face
      },

      // === TIER 3: EXPERT (Hammer head) ===
      {
        id: 'craft_expert',
        name: 'Expert Craftsman',
        tier: 'expert',
        level: 50,
        type: 'keystone',
        description: 'KEYSTONE: All practice gives +100% XP. Quality over quantity',
        effect: { craftXpMultiplier: 2, qualityFocus: true },
        prerequisites: ['craft_creative'],
        position: { x: 400, y: 90 } // Hammer top
      },
      {
        id: 'craft_teaching',
        name: 'Teaching Mastery',
        tier: 'expert',
        level: 55,
        type: 'synergy',
        description: 'Teaching your craft gives +30% SOCIAL XP. Best way to learn',
        effect: { socialXpBonus: 0.3, teachingMode: true },
        prerequisites: ['craft_expert'],
        position: { x: 280, y: 80 } // Left spark
      },
      {
        id: 'craft_innovation',
        name: 'Innovator',
        tier: 'expert',
        level: 60,
        type: 'passive',
        description: 'Creating original work gives +300 XP. Push boundaries',
        effect: { innovationXp: 300, innovationMode: true },
        prerequisites: ['craft_expert'],
        position: { x: 520, y: 80 } // Right spark
      },
      {
        id: 'craft_professional',
        name: 'Professional',
        tier: 'expert',
        level: 70,
        type: 'synergy',
        description: 'Monetizing your craft gives +25% WEALTH XP. Turn passion into profit',
        effect: { wealthXpBonus: 0.25, professionalMode: true },
        prerequisites: ['craft_teaching', 'craft_innovation'],
        position: { x: 400, y: 120 } // Upper center convergence
      },

      // === TIER 4: MASTER (Crown/masterwork) ===
      {
        id: 'craft_master',
        name: 'Grand Master',
        tier: 'master',
        level: 80,
        type: 'keystone',
        description: 'ULTIMATE: Triple craft XP. World-class skill. Leave a legacy',
        effect: { craftXpMultiplier: 3, worldClass: true, globalXpBonus: 0.15 },
        prerequisites: ['craft_professional'],
        position: { x: 400, y: 60 } // Masterwork crown
      }
    ]
  }
};

/**
 * XP Awards by Activity Type
 * Based on Habitica's system with optimizations
 */
export const XP_AWARDS = {
  // BODY Activities
  workout_short: 50,        // < 30 min
  workout_medium: 100,      // 30-60 min
  workout_long: 150,        // > 60 min
  meal_logged: 10,
  perfect_macros: 100,
  sleep_8hrs: 40,
  steps_10k: 25,

  // MIND Activities
  reading_30min: 60,
  book_finished: 200,
  course_lesson: 80,
  course_completed: 500,
  deep_work_hour: 60,
  note_created: 15,
  note_linked: 30,

  // SPIRIT Activities
  journal_entry: 50,
  meditation_10min: 30,
  meditation_30min: 90,
  gratitude_log: 20,
  weekly_reflection: 150,

  // WEALTH Activities
  income_per_10: 1,         // 1 XP per $10 earned
  savings_milestone: 100,
  investment_made: 150,
  budget_followed: 50,

  // SOCIAL Activities
  conversation: 25,
  event_attended: 75,
  networking: 50,
  presentation: 150,

  // CRAFT Activities
  practice_hour: 60,
  project_milestone: 200,
  skill_mastered: 500,
  portfolio_piece: 300
};
