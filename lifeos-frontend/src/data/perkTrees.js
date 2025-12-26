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
    // WARRIOR/ATLAS CONSTELLATION - Dramatic humanoid figure with spread limbs
    // Shape: Crown at top, arms spread wide like wings, strong stance at base
    perks: [
      // === TIER 1: NOVICE (Base - Powerful Stance) ===
      {
        id: 'body_foundation',
        name: 'Physical Foundation',
        tier: 'novice',
        level: 1,
        type: 'passive',
        description: '+10% XP from all physical activities',
        effect: { xpMultiplier: 1.1 },
        prerequisites: [],
        position: { x: 400, y: 520 } // Center base (pelvis)
      },
      {
        id: 'body_endurance_1',
        name: 'Endurance I',
        tier: 'novice',
        level: 3,
        type: 'passive',
        description: 'Cardio workouts give +20% XP',
        effect: { cardioXpBonus: 0.2 },
        prerequisites: ['body_foundation'],
        position: { x: 260, y: 580 } // Left leg - spread wider
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
        position: { x: 540, y: 580 } // Right leg - spread wider
      },
      {
        id: 'body_nutrition_basics',
        name: 'Nutrition Awareness',
        tier: 'novice',
        level: 10,
        type: 'passive',
        description: 'Logging meals gives +25% bonus XP. Hit macro goals for +50 bonus XP',
        effect: { mealLogXpBonus: 0.25, macroGoalBonusXp: 50 },
        prerequisites: ['body_foundation'],
        position: { x: 400, y: 420 } // Core/torso center
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
        position: { x: 400, y: 330 } // Upper torso/chest
      },

      // === TIER 2: ADEPT (Arms spread like wings) ===
      {
        id: 'body_endurance_2',
        name: 'Endurance II',
        tier: 'adept',
        level: 25,
        type: 'passive',
        description: 'Cardio workouts give +40% XP total. +10 gold per cardio session',
        effect: { cardioXpBonus: 0.4, cardioGoldBonus: 10 },
        prerequisites: ['body_endurance_1', 'body_recovery_1'],
        position: { x: 100, y: 280 } // Left arm extended far
      },
      {
        id: 'body_strength_2',
        name: 'Strength Training II',
        tier: 'adept',
        level: 25,
        type: 'passive',
        description: 'Strength workouts give +40% XP total. +10 gold per strength session',
        effect: { strengthXpBonus: 0.4, strengthGoldBonus: 10 },
        prerequisites: ['body_strength_1', 'body_recovery_1'],
        position: { x: 700, y: 280 } // Right arm extended far
      },
      {
        id: 'body_synergy_mind',
        name: 'Mind-Body Connection',
        tier: 'adept',
        level: 30,
        type: 'synergy',
        description: 'Physical activities give +15% MIND XP. Yoga sessions give +50% XP',
        effect: { mindXpBonus: 0.15, yogaXpBonus: 0.5 },
        prerequisites: ['body_recovery_1'],
        position: { x: 400, y: 250 } // Heart center
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
        position: { x: 400, y: 180 } // Neck
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
        position: { x: 400, y: 120 } // Lower head
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
        position: { x: 400, y: 60 } // Head center
      },
      {
        id: 'body_nutrition_mastery',
        name: 'Nutrition Mastery',
        tier: 'expert',
        level: 55,
        type: 'passive',
        description: 'Perfect macro day gives +100 bonus XP and +25 gold. Unlock title: "Nutrition Master"',
        effect: { perfectMacroBonusXp: 100, perfectMacroGold: 25, unlockTitle: 'Nutrition Master' },
        prerequisites: ['body_peak_performance'],
        position: { x: 280, y: 30 } // Left temple - wider spread
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
        position: { x: 520, y: 30 } // Right temple - wider spread
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
        position: { x: 400, y: -30 } // Crown
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
        position: { x: 400, y: -100 } // Star above head - dramatic height
      },

      // === WEAPON ABILITY UNLOCKS (Physical) - Right wing branch ===
      {
        id: 'unlock_ability_power_slash',
        name: 'Power Slash',
        tier: 'novice',
        level: 7,
        type: 'unlock',
        description: 'UNLOCK: Power Slash ability - A powerful slashing attack',
        effect: { unlocksAbility: 'power_slash' },
        prerequisites: ['body_foundation'],
        position: { x: 580, y: 480 } // Right shoulder area
      },
      {
        id: 'unlock_ability_cleaving_blow',
        name: 'Cleaving Blow',
        tier: 'novice',
        level: 9,
        type: 'unlock',
        description: 'UNLOCK: Cleaving Blow ability - A wide sweeping attack',
        effect: { unlocksAbility: 'cleaving_blow' },
        prerequisites: ['unlock_ability_power_slash'],
        position: { x: 720, y: 420 } // Far right branch
      },
      {
        id: 'unlock_ability_blade_dance',
        name: 'Blade Dance',
        tier: 'novice',
        level: 10,
        type: 'unlock',
        description: 'UNLOCK: Blade Dance ability - A flurry of rapid blade strikes',
        effect: { unlocksAbility: 'blade_dance' },
        prerequisites: ['unlock_ability_cleaving_blow'],
        position: { x: 750, y: 340 } // Continue right branch - edge
      },
      {
        id: 'unlock_ability_earthshatter',
        name: 'Earthshatter',
        tier: 'novice',
        level: 15,
        type: 'unlock',
        description: 'UNLOCK: Earthshatter ability - Slam the ground with tremendous force',
        effect: { unlocksAbility: 'earthshatter' },
        prerequisites: ['unlock_ability_blade_dance'],
        position: { x: 720, y: 250 } // Upper right
      },
      {
        id: 'unlock_ability_thunderous_blow',
        name: 'Thunderous Blow',
        tier: 'adept',
        level: 20,
        type: 'unlock',
        description: 'UNLOCK: Thunderous Blow ability - A devastating strike that echoes like thunder',
        effect: { unlocksAbility: 'thunderous_blow' },
        prerequisites: ['unlock_ability_earthshatter'],
        position: { x: 660, y: 160 } // Upper right branch
      },
      {
        id: 'unlock_ability_berserker_rage',
        name: 'Berserker Rage',
        tier: 'adept',
        level: 30,
        type: 'unlock',
        description: 'UNLOCK: Berserker Rage ability - Enter a berserker state for massive damage',
        effect: { unlocksAbility: 'berserker_rage' },
        prerequisites: ['unlock_ability_thunderous_blow'],
        position: { x: 580, y: 80 } // Near crown right
      },
      {
        id: 'unlock_ability_shadow_strike',
        name: 'Shadow Strike',
        tier: 'novice',
        level: 10,
        type: 'unlock',
        description: 'UNLOCK: Shadow Strike ability - Strike from the shadows with lethal precision',
        effect: { unlocksAbility: 'shadow_strike' },
        prerequisites: ['body_endurance_1'],
        position: { x: 140, y: 520 } // Left side branch - further out
      },
      {
        id: 'unlock_ability_assassinate',
        name: 'Assassinate',
        tier: 'adept',
        level: 25,
        type: 'unlock',
        description: 'UNLOCK: Assassinate ability - A lethal assassination technique',
        effect: { unlocksAbility: 'assassinate' },
        prerequisites: ['unlock_ability_shadow_strike'],
        position: { x: 80, y: 400 } // Far left - edge of canvas
      }
    ]
  },

  mind: {
    name: 'MIND',
    color: '#7b68d9',
    // BRAIN/NEURAL NETWORK CONSTELLATION - Dramatic dendrite pattern spreading wide
    // Shape: Brain stem at base, wide spreading cortex branches reaching outward
    perks: [
      // === TIER 1: NOVICE (Brain stem) ===
      {
        id: 'mind_foundation',
        name: 'Cognitive Foundation',
        tier: 'novice',
        level: 1,
        type: 'passive',
        description: '+10% XP from all learning activities',
        effect: { xpMultiplier: 1.1 },
        prerequisites: [],
        position: { x: 400, y: 560 } // Brain stem base - lower
      },
      {
        id: 'mind_reader_1',
        name: 'Avid Reader I',
        tier: 'novice',
        level: 3,
        type: 'passive',
        description: 'Reading gives +25% XP. +5 gold per reading session',
        effect: { readingXpBonus: 0.25, readingGoldBonus: 5 },
        prerequisites: ['mind_foundation'],
        position: { x: 220, y: 480 } // Left branch start - wider
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
        position: { x: 580, y: 480 } // Right branch start - wider
      },
      {
        id: 'mind_note_taker',
        name: 'Note Taker',
        tier: 'novice',
        level: 10,
        type: 'passive',
        description: 'Creating notes gives +20 XP. Linking notes gives +10 bonus XP',
        effect: { noteXp: 20, noteLinkBonusXp: 10 },
        prerequisites: ['mind_reader_1', 'mind_focus_1'],
        position: { x: 400, y: 400 } // Central convergence
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
        position: { x: 400, y: 320 } // Upward stem
      },

      // === TIER 2: ADEPT (Spreading cortex dendrites) ===
      {
        id: 'mind_reader_2',
        name: 'Voracious Reader II',
        tier: 'adept',
        level: 25,
        type: 'passive',
        description: 'Reading gives +50% XP. Finishing books gives +200 bonus XP',
        effect: { readingXpBonus: 0.5, bookCompletionBonus: 200 },
        prerequisites: ['mind_reader_1', 'mind_curiosity'],
        position: { x: 80, y: 340 } // Far left branch - edge
      },
      {
        id: 'mind_focus_2',
        name: 'Flow State II',
        tier: 'adept',
        level: 25,
        type: 'passive',
        description: 'Deep work 2+ hours gives double XP. +20 gold per flow session',
        effect: { longSessionMultiplier: 2, flowSessionGold: 20 },
        prerequisites: ['mind_focus_1', 'mind_curiosity'],
        position: { x: 720, y: 340 } // Far right branch - edge
      },
      {
        id: 'mind_synthesizer',
        name: 'Knowledge Synthesizer',
        tier: 'adept',
        level: 30,
        type: 'passive',
        description: 'Connecting notes gives +30 XP. Knowledge graph bonuses +15% XP',
        effect: { linkNotesXp: 30, knowledgeGraphBonus: 0.15 },
        prerequisites: ['mind_note_taker'],
        position: { x: 400, y: 240 } // Central hub
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
        position: { x: 400, y: 170 } // Upper stem
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
        position: { x: 400, y: 100 } // Pre-cortex
      },

      // === TIER 3: EXPERT (Upper cortex lobes) ===
      {
        id: 'mind_genius',
        name: 'Genius',
        tier: 'expert',
        level: 50,
        type: 'keystone',
        description: 'KEYSTONE: +100% XP from learning, but lose 50 XP for each missed day',
        effect: { learningMultiplier: 2, missedDayPenalty: -50 },
        prerequisites: ['mind_teacher'],
        position: { x: 400, y: 40 } // Cortex center
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
        position: { x: 220, y: 20 } // Left lobe - wider spread
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
        position: { x: 580, y: 20 } // Right lobe - wider spread
      },
      {
        id: 'mind_master_learner',
        name: 'Master Learner',
        tier: 'expert',
        level: 70,
        type: 'passive',
        description: 'Learn any skill 2x faster. +50 gold per skill milestone. Title: "Scholar"',
        effect: { learningSpeedMultiplier: 2, skillMilestoneGold: 50, unlockTitle: 'Scholar' },
        prerequisites: ['mind_speed_reader', 'mind_hyperfocus'],
        position: { x: 400, y: -40 } // Upper cortex
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
        position: { x: 400, y: -110 } // Transcendence point - dramatic height
      },

      // === WEAPON ABILITY UNLOCKS (Magic) - Right neural branch ===
      {
        id: 'unlock_ability_chain_lightning',
        name: 'Chain Lightning',
        tier: 'novice',
        level: 7,
        type: 'unlock',
        description: 'UNLOCK: Chain Lightning ability - Lightning that arcs between enemies',
        effect: { unlocksAbility: 'chain_lightning' },
        prerequisites: ['mind_foundation'],
        position: { x: 620, y: 540 } // Right branch
      },
      {
        id: 'unlock_ability_arcane_blast',
        name: 'Arcane Blast',
        tier: 'novice',
        level: 9,
        type: 'unlock',
        description: 'UNLOCK: Arcane Blast ability - Fire a blast of pure arcane energy',
        effect: { unlocksAbility: 'arcane_blast' },
        prerequisites: ['unlock_ability_chain_lightning'],
        position: { x: 740, y: 470 } // Far right
      },
      {
        id: 'unlock_ability_frost_nova',
        name: 'Frost Nova',
        tier: 'novice',
        level: 10,
        type: 'unlock',
        description: 'UNLOCK: Frost Nova ability - Release an expanding wave of frost',
        effect: { unlocksAbility: 'frost_nova' },
        prerequisites: ['unlock_ability_arcane_blast'],
        position: { x: 760, y: 380 } // Far right branch - edge
      },
      {
        id: 'unlock_ability_arcane_beam',
        name: 'Arcane Beam',
        tier: 'novice',
        level: 15,
        type: 'unlock',
        description: 'UNLOCK: Arcane Beam ability - Fire a concentrated beam of arcane power',
        effect: { unlocksAbility: 'arcane_beam' },
        prerequisites: ['unlock_ability_frost_nova'],
        position: { x: 740, y: 290 } // Continue right
      },
      {
        id: 'unlock_ability_soul_drain',
        name: 'Soul Drain',
        tier: 'novice',
        level: 10,
        type: 'unlock',
        description: 'UNLOCK: Soul Drain ability - Drain the life force from your enemy',
        effect: { unlocksAbility: 'soul_drain' },
        prerequisites: ['mind_reader_1'],
        position: { x: 100, y: 520 } // Left branch - far out
      },
      {
        id: 'unlock_ability_dark_pulse',
        name: 'Dark Pulse',
        tier: 'adept',
        level: 20,
        type: 'unlock',
        description: 'UNLOCK: Dark Pulse ability - Emit a wave of corrupting darkness',
        effect: { unlocksAbility: 'dark_pulse' },
        prerequisites: ['unlock_ability_soul_drain'],
        position: { x: 60, y: 420 } // Far left - edge
      },
      {
        id: 'unlock_ability_meteor',
        name: 'Meteor',
        tier: 'adept',
        level: 25,
        type: 'unlock',
        description: 'UNLOCK: Meteor ability - Call down a devastating meteor from the sky',
        effect: { unlocksAbility: 'meteor' },
        prerequisites: ['unlock_ability_arcane_beam'],
        position: { x: 680, y: 200 } // Upper right
      },
      {
        id: 'unlock_ability_mystic_explosion',
        name: 'Mystic Explosion',
        tier: 'adept',
        level: 35,
        type: 'unlock',
        description: 'UNLOCK: Mystic Explosion ability - Detonate a massive arcane explosion',
        effect: { unlocksAbility: 'mystic_explosion' },
        prerequisites: ['unlock_ability_meteor', 'unlock_ability_dark_pulse'],
        position: { x: 120, y: 100 } // Upper left - far out
      }
    ]
  },

  spirit: {
    name: 'SPIRIT',
    color: '#57d9d4',
    // LOTUS/MANDALA CONSTELLATION - Dramatic circular expanding pattern
    // Shape: Central seed with wide expanding petals in all directions
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
        position: { x: 400, y: 320 } // Center of mandala
      },
      {
        id: 'spirit_meditation_1',
        name: 'Meditation I',
        tier: 'novice',
        level: 3,
        type: 'passive',
        description: 'Meditation gives +30% XP. +5 gold per session',
        effect: { meditationXpBonus: 0.3, meditationGoldBonus: 5 },
        prerequisites: ['spirit_foundation'],
        position: { x: 260, y: 260 } // Inner ring - upper left
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
        position: { x: 540, y: 260 } // Inner ring - upper right
      },
      {
        id: 'spirit_journal',
        name: 'Journaling',
        tier: 'novice',
        level: 10,
        type: 'passive',
        description: 'Journal entries give +50 XP. Daily journaling streak gives +10% bonus XP',
        effect: { journalXp: 50, journalStreakBonus: 0.1 },
        prerequisites: ['spirit_meditation_1', 'spirit_gratitude_1'],
        position: { x: 400, y: 180 } // Inner ring - top
      },
      {
        id: 'spirit_awareness',
        name: 'Self-Awareness',
        tier: 'novice',
        level: 15,
        type: 'passive',
        description: 'Mood tracking gives +15 XP. Emotional insights give +25 bonus XP',
        effect: { moodTrackingXp: 15, emotionalInsightXp: 25 },
        prerequisites: ['spirit_journal'],
        position: { x: 400, y: 440 } // Inner ring - bottom
      },

      // === TIER 2: ADEPT (Second petal ring - wide spread) ===
      {
        id: 'spirit_meditation_2',
        name: 'Deep Meditation II',
        tier: 'adept',
        level: 25,
        type: 'passive',
        description: '20+ min meditation gives double XP. +15 gold per deep session',
        effect: { longMeditationMultiplier: 2, deepMeditationGold: 15 },
        prerequisites: ['spirit_meditation_1', 'spirit_awareness'],
        position: { x: 100, y: 300 } // Second ring - far left
      },
      {
        id: 'spirit_gratitude_2',
        name: 'Gratitude Master II',
        tier: 'adept',
        level: 25,
        type: 'passive',
        description: '3 gratitudes per day gives +75 XP. Weekly gratitude streak gives +100 bonus XP',
        effect: { tripleGratitudeXp: 75, gratitudeStreakBonus: 100 },
        prerequisites: ['spirit_gratitude_1', 'spirit_awareness'],
        position: { x: 700, y: 300 } // Second ring - far right
      },
      {
        id: 'spirit_reflection',
        name: 'Deep Reflection',
        tier: 'adept',
        level: 30,
        type: 'passive',
        description: 'Weekly reflections give +150 XP. Monthly reviews give +500 bonus XP',
        effect: { weeklyReflectionXp: 150, monthlyReviewBonus: 500 },
        prerequisites: ['spirit_journal'],
        position: { x: 400, y: 80 } // Second ring - top
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
        position: { x: 400, y: 540 } // Second ring - bottom
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
        position: { x: 240, y: 140 } // Upper left convergence
      },

      // === TIER 3: EXPERT (Outer petals - dramatic spread) ===
      {
        id: 'spirit_enlightenment',
        name: 'Path to Enlightenment',
        tier: 'expert',
        level: 50,
        type: 'keystone',
        description: 'KEYSTONE: +75% XP from all SPIRIT activities. Reduce all stress by 50%',
        effect: { spiritXpBonus: 0.75, stressReduction: 0.5 },
        prerequisites: ['spirit_mindful_living'],
        position: { x: 400, y: 0 } // Top outer petal - higher
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
        position: { x: 160, y: 80 } // Outer left petal - far out
      },
      {
        id: 'spirit_life_purpose',
        name: 'Life Purpose',
        tier: 'expert',
        level: 60,
        type: 'passive',
        description: 'Activities aligned with values give +25% XP. Title: "Purpose-Driven"',
        effect: { purposeBonus: 0.25, unlockTitle: 'Purpose-Driven' },
        prerequisites: ['spirit_enlightenment'],
        position: { x: 640, y: 80 } // Outer right petal - far out
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
        position: { x: 400, y: 620 } // Outer bottom petal - lower
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
        position: { x: 400, y: -80 } // Crown above lotus - dramatic
      },

      // === WEAPON ABILITY UNLOCKS (Spirit) - Spiral pattern ===
      {
        id: 'unlock_ability_inner_light',
        name: 'Inner Light',
        tier: 'novice',
        level: 7,
        type: 'unlock',
        description: 'UNLOCK: Inner Light ability - Channel your inner light as an attack',
        effect: { unlocksAbility: 'inner_light' },
        prerequisites: ['spirit_foundation'],
        position: { x: 540, y: 400 } // Right of center
      },
      {
        id: 'unlock_ability_serenity_wave',
        name: 'Serenity Wave',
        tier: 'novice',
        level: 9,
        type: 'unlock',
        description: 'UNLOCK: Serenity Wave ability - Release a calming wave that damages enemies',
        effect: { unlocksAbility: 'serenity_wave' },
        prerequisites: ['unlock_ability_inner_light'],
        position: { x: 640, y: 360 } // Continue right-up
      },
      {
        id: 'unlock_ability_meditation_burst',
        name: 'Meditation Burst',
        tier: 'novice',
        level: 10,
        type: 'unlock',
        description: 'UNLOCK: Meditation Burst ability - Release stored meditative energy',
        effect: { unlocksAbility: 'meditation_burst' },
        prerequisites: ['unlock_ability_serenity_wave'],
        position: { x: 720, y: 280 } // Upper right outer
      },
      {
        id: 'unlock_ability_zen_strike',
        name: 'Zen Strike',
        tier: 'novice',
        level: 15,
        type: 'unlock',
        description: 'UNLOCK: Zen Strike ability - A perfectly balanced attack',
        effect: { unlocksAbility: 'zen_strike' },
        prerequisites: ['unlock_ability_meditation_burst'],
        position: { x: 680, y: 180 } // Continue spiraling
      },
      {
        id: 'unlock_ability_enlightened_blast',
        name: 'Enlightened Blast',
        tier: 'adept',
        level: 20,
        type: 'unlock',
        description: 'UNLOCK: Enlightened Blast ability - Channel enlightenment into a powerful blast',
        effect: { unlocksAbility: 'enlightened_blast' },
        prerequisites: ['unlock_ability_zen_strike'],
        position: { x: 580, y: 100 } // Near top right
      },
      {
        id: 'unlock_ability_transcendence_strike',
        name: 'Transcendence Strike',
        tier: 'adept',
        level: 30,
        type: 'unlock',
        description: 'UNLOCK: Transcendence ability - Transcend mortal limits for ultimate power',
        effect: { unlocksAbility: 'transcendence' },
        prerequisites: ['unlock_ability_enlightened_blast'],
        position: { x: 500, y: -20 } // Near crown
      }
    ]
  },

  wealth: {
    name: 'WEALTH',
    color: '#d9c157',
    // PYRAMID/ARROW CONSTELLATION - Dramatic upward pointing triangle
    // Shape: Very wide base narrowing to sharp golden peak
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
        position: { x: 400, y: 560 } // Center base - lower
      },
      {
        id: 'wealth_tracking',
        name: 'Income Tracker',
        tier: 'novice',
        level: 3,
        type: 'passive',
        description: 'Track all income sources. Earn 1 XP per $10 tracked. +5 gold per log',
        effect: { incomeXpRate: 0.1, incomeLogGold: 5 },
        prerequisites: ['wealth_foundation'],
        position: { x: 120, y: 540 } // Far left base - wider spread
      },
      {
        id: 'wealth_budgeting',
        name: 'Budget Master',
        tier: 'novice',
        level: 5,
        type: 'passive',
        description: 'Staying under budget gives +50 XP per week. +20 gold for budget adherence',
        effect: { budgetBonusXp: 50, budgetAdherenceGold: 20 },
        prerequisites: ['wealth_foundation'],
        position: { x: 680, y: 540 } // Far right base - wider spread
      },
      {
        id: 'wealth_saver',
        name: 'Consistent Saver',
        tier: 'novice',
        level: 10,
        type: 'passive',
        description: 'Every $100 saved gives +10 XP. Savings milestones give +50 gold',
        effect: { savingsXpPer100: 10, savingsMilestoneGold: 50 },
        prerequisites: ['wealth_tracking', 'wealth_budgeting'],
        position: { x: 400, y: 450 } // First convergence
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
        type: 'passive',
        description: 'Each investment gives +100 XP. Portfolio growth gives +25 gold monthly',
        effect: { investmentXp: 100, portfolioGrowthGold: 25 },
        prerequisites: ['wealth_emergency_fund'],
        position: { x: 220, y: 290 } // Left slope - steeper
      },
      {
        id: 'wealth_entrepreneur',
        name: 'Entrepreneur',
        tier: 'adept',
        level: 25,
        type: 'passive',
        description: 'Business profit gives double XP. Title: "Entrepreneur"',
        effect: { businessXpMultiplier: 2, unlockTitle: 'Entrepreneur' },
        prerequisites: ['wealth_emergency_fund'],
        position: { x: 580, y: 290 } // Right slope - steeper
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
        position: { x: 400, y: 270 } // Center spine
      },
      {
        id: 'wealth_passive_income',
        name: 'Passive Income',
        tier: 'adept',
        level: 35,
        type: 'passive',
        description: 'Passive income gives +50% more XP. +1 gem per passive income source',
        effect: { passiveIncomeBonus: 0.5, passiveIncomeGems: 1 },
        prerequisites: ['wealth_debt_free'],
        position: { x: 400, y: 190 } // Rising
      },
      {
        id: 'wealth_financially_literate',
        name: 'Financially Literate',
        tier: 'adept',
        level: 40,
        type: 'synergy',
        description: 'Reading finance books gives +30% MIND XP. Financial activities give +20% gold',
        effect: { mindXpBonus: 0.3, financialGoldBonus: 0.2 },
        prerequisites: ['wealth_investor', 'wealth_entrepreneur', 'wealth_passive_income'],
        position: { x: 400, y: 120 } // Pre-peak
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
        position: { x: 400, y: 60 } // Upper pyramid
      },
      {
        id: 'wealth_net_worth',
        name: 'Net Worth Warrior',
        tier: 'expert',
        level: 55,
        type: 'passive',
        description: 'Every $10k net worth gives +100 XP. Wealth milestones give +100 gold',
        effect: { netWorthXpPer10k: 100, wealthMilestoneGold: 100 },
        prerequisites: ['wealth_abundance'],
        position: { x: 280, y: 20 } // Left peak edge - wider
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
        position: { x: 520, y: 20 } // Right peak edge - wider
      },
      {
        id: 'wealth_millionaire_path',
        name: 'Millionaire Path',
        tier: 'expert',
        level: 70,
        type: 'passive',
        description: '$100k milestones give +5000 XP and +500 gold. Title: "Wealth Builder"',
        effect: { milestoneBonus: 5000, milestoneGold: 500, unlockTitle: 'Wealth Builder' },
        prerequisites: ['wealth_net_worth', 'wealth_portfolio_master'],
        position: { x: 400, y: -30 } // Near apex
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
        position: { x: 400, y: -100 } // Golden capstone - dramatic height
      },

      // === WEAPON ABILITY UNLOCKS (Fortune) - Left side cascade ===
      {
        id: 'unlock_ability_golden_strike',
        name: 'Golden Strike',
        tier: 'novice',
        level: 7,
        type: 'unlock',
        description: 'UNLOCK: Golden Strike ability - Strike with the power of gold',
        effect: { unlocksAbility: 'golden_strike' },
        prerequisites: ['wealth_foundation'],
        position: { x: 240, y: 600 } // Left of base
      },
      {
        id: 'unlock_ability_coin_barrage',
        name: 'Coin Barrage',
        tier: 'novice',
        level: 9,
        type: 'unlock',
        description: 'UNLOCK: Coin Barrage ability - Hurl a barrage of golden coins',
        effect: { unlocksAbility: 'coin_barrage' },
        prerequisites: ['unlock_ability_golden_strike'],
        position: { x: 80, y: 520 } // Far left - edge
      },
      {
        id: 'unlock_ability_lucky_strike',
        name: 'Lucky Strike',
        tier: 'novice',
        level: 10,
        type: 'unlock',
        description: 'UNLOCK: Lucky Strike ability - A strike blessed by fortune',
        effect: { unlocksAbility: 'lucky_strike' },
        prerequisites: ['unlock_ability_coin_barrage'],
        position: { x: 60, y: 420 } // Continue left up
      },
      {
        id: 'unlock_ability_wealth_explosion',
        name: 'Wealth Explosion',
        tier: 'novice',
        level: 15,
        type: 'unlock',
        description: 'UNLOCK: Wealth Explosion ability - Explode with the power of accumulated wealth',
        effect: { unlocksAbility: 'wealth_explosion' },
        prerequisites: ['unlock_ability_lucky_strike'],
        position: { x: 80, y: 320 } // Upper left
      },
      {
        id: 'unlock_ability_treasure_blast',
        name: 'Treasure Blast',
        tier: 'adept',
        level: 20,
        type: 'unlock',
        description: 'UNLOCK: Treasure Blast ability - Unleash the power of a treasure hoard',
        effect: { unlocksAbility: 'treasure_blast' },
        prerequisites: ['unlock_ability_wealth_explosion'],
        position: { x: 120, y: 220 } // Near top left
      },
      {
        id: 'unlock_ability_midas_touch',
        name: 'Midas Touch',
        tier: 'adept',
        level: 30,
        type: 'unlock',
        description: 'UNLOCK: Midas Touch ability - Turn your enemies to gold',
        effect: { unlocksAbility: 'midas_touch' },
        prerequisites: ['unlock_ability_treasure_blast'],
        position: { x: 180, y: 120 } // Near apex left
      }
    ]
  },

  social: {
    name: 'SOCIAL',
    color: '#57d98a',
    // WEB/NETWORK CONSTELLATION - Dramatic spider web with long spokes
    // Shape: Central hub with far-reaching spokes to outer connection nodes
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
        position: { x: 400, y: 340 } // Center hub
      },
      {
        id: 'social_conversationalist',
        name: 'Conversationalist I',
        tier: 'novice',
        level: 3,
        type: 'passive',
        description: 'Meaningful conversations give +25 XP. +5 gold per quality interaction',
        effect: { conversationXp: 25, conversationGold: 5 },
        prerequisites: ['social_foundation'],
        position: { x: 200, y: 260 } // Spoke upper-left - wider
      },
      {
        id: 'social_networker',
        name: 'Networker I',
        tier: 'novice',
        level: 5,
        type: 'passive',
        description: 'Meeting new people gives +50 XP. +10 gold per new connection',
        effect: { newConnectionXp: 50, newConnectionGold: 10 },
        prerequisites: ['social_foundation'],
        position: { x: 600, y: 260 } // Spoke upper-right - wider
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
        position: { x: 400, y: 200 } // Upper spoke
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
        position: { x: 400, y: 480 } // Lower spoke
      },

      // === TIER 2: ADEPT (Outer ring nodes - dramatic spread) ===
      {
        id: 'social_charismatic',
        name: 'Charismatic',
        tier: 'adept',
        level: 25,
        type: 'passive',
        description: 'Social interactions give +50% XP. Natural charm unlocked',
        effect: { socialXpBonus: 0.5, charismaUnlocked: true },
        prerequisites: ['social_event_goer'],
        position: { x: 80, y: 380 } // Far left node - edge
      },
      {
        id: 'social_public_speaker',
        name: 'Public Speaker I',
        tier: 'adept',
        level: 25,
        type: 'passive',
        description: 'Presentations give +150 XP. +30 gold per speaking event',
        effect: { presentationXp: 150, speakingGold: 30 },
        prerequisites: ['social_event_goer'],
        position: { x: 720, y: 380 } // Far right node - edge
      },
      {
        id: 'social_relationship_builder',
        name: 'Relationship Builder',
        tier: 'adept',
        level: 30,
        type: 'passive',
        description: 'Nurturing relationships gives +40 XP. Relationship milestones give +75 gold',
        effect: { relationshipXp: 40, relationshipMilestoneGold: 75 },
        prerequisites: ['social_active_listener'],
        position: { x: 400, y: 100 } // Top node - higher
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
        position: { x: 400, y: 580 } // Bottom node - lower
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
        position: { x: 400, y: 280 } // Above center hub
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
        position: { x: 400, y: 20 } // Top influence - high
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
        position: { x: 160, y: 100 } // Upper-left influence - far out
      },
      {
        id: 'social_community_builder',
        name: 'Community Builder',
        tier: 'expert',
        level: 60,
        type: 'passive',
        description: 'Building communities gives +300 XP and +75 gold. Create lasting impact',
        effect: { communityXp: 300, communityGold: 75 },
        prerequisites: ['social_influencer'],
        position: { x: 640, y: 100 } // Upper-right influence - far out
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
        position: { x: 400, y: 660 } // Bottom influence - dramatic low
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
        position: { x: 400, y: -60 } // Legendary status - above all
      },

      // === WEAPON ABILITY UNLOCKS (Charm) - Left web strand ===
      {
        id: 'unlock_ability_charm_strike',
        name: 'Charm Strike',
        tier: 'novice',
        level: 7,
        type: 'unlock',
        description: 'UNLOCK: Charm Strike ability - A charming attack that confuses enemies',
        effect: { unlocksAbility: 'charm_strike' },
        prerequisites: ['social_foundation'],
        position: { x: 280, y: 420 } // Left of center
      },
      {
        id: 'unlock_ability_inspiring_words',
        name: 'Inspiring Words',
        tier: 'novice',
        level: 9,
        type: 'unlock',
        description: 'UNLOCK: Inspiring Words ability - Words so inspiring they deal damage',
        effect: { unlocksAbility: 'inspiring_words' },
        prerequisites: ['unlock_ability_charm_strike'],
        position: { x: 160, y: 480 } // Continue left down
      },
      {
        id: 'unlock_ability_rally_cry',
        name: 'Rally Cry',
        tier: 'novice',
        level: 10,
        type: 'unlock',
        description: 'UNLOCK: Rally Cry ability - A rallying cry that empowers and damages',
        effect: { unlocksAbility: 'rally_cry' },
        prerequisites: ['unlock_ability_inspiring_words'],
        position: { x: 80, y: 540 } // Far left - edge
      },
      {
        id: 'unlock_ability_social_butterfly',
        name: 'Social Butterfly',
        tier: 'novice',
        level: 15,
        type: 'unlock',
        description: 'UNLOCK: Social Butterfly ability - Flutter around dealing multiple hits',
        effect: { unlocksAbility: 'social_butterfly' },
        prerequisites: ['unlock_ability_rally_cry'],
        position: { x: 60, y: 460 } // Far left up
      },
      {
        id: 'unlock_ability_influence_blast',
        name: 'Influence Blast',
        tier: 'adept',
        level: 20,
        type: 'unlock',
        description: 'UNLOCK: Influence Blast ability - Blast enemies with your social influence',
        effect: { unlocksAbility: 'influence_blast' },
        prerequisites: ['unlock_ability_social_butterfly'],
        position: { x: 80, y: 300 } // Upper left
      },
      {
        id: 'unlock_ability_viral_strike',
        name: 'Viral Strike',
        tier: 'adept',
        level: 30,
        type: 'unlock',
        description: 'UNLOCK: Viral Strike ability - An attack that goes viral, hitting everything',
        effect: { unlocksAbility: 'viral_strike' },
        prerequisites: ['unlock_ability_influence_blast'],
        position: { x: 120, y: 200 } // Near top left
      }
    ]
  },

  craft: {
    name: 'CRAFT',
    color: '#b8b8c8',
    // ANVIL/HAMMER CONSTELLATION - Dramatic tool shape with wide wings
    // Shape: Long handle at base, wide anvil body, sparks radiating from top
    perks: [
      // === TIER 1: NOVICE (Long handle/base) ===
      {
        id: 'craft_foundation',
        name: 'Skill Apprentice',
        tier: 'novice',
        level: 1,
        type: 'passive',
        description: '+10% XP from all skill practice',
        effect: { xpMultiplier: 1.1 },
        prerequisites: [],
        position: { x: 400, y: 600 } // Handle base - lower
      },
      {
        id: 'craft_practice',
        name: 'Deliberate Practice I',
        tier: 'novice',
        level: 3,
        type: 'passive',
        description: 'Focused practice gives +25% XP and +10 gold per hour logged',
        effect: { practiceXpBonus: 0.25, practiceGoldPerHour: 10 },
        prerequisites: ['craft_foundation'],
        position: { x: 400, y: 500 } // Handle middle
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
        position: { x: 400, y: 420 } // Handle top
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
        type: 'passive',
        description: 'Completed projects give +200 XP and +50 gold',
        effect: { projectXp: 200, projectGold: 50 },
        prerequisites: ['craft_consistency'],
        position: { x: 400, y: 260 } // Anvil center
      },

      // === TIER 2: ADEPT (Wide anvil wings) ===
      {
        id: 'craft_specialist',
        name: 'Specialist',
        tier: 'adept',
        level: 25,
        type: 'passive',
        description: 'Focusing on 1 skill gives +75% XP. Deep specialization',
        effect: { specializationBonus: 0.75, specializationMode: true },
        prerequisites: ['craft_portfolio'],
        position: { x: 120, y: 260 } // Anvil left wing - far out
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
        position: { x: 680, y: 260 } // Anvil right wing - far out
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
        position: { x: 400, y: 190 } // Anvil upper center
      },
      {
        id: 'craft_feedback',
        name: 'Feedback Seeker',
        tier: 'adept',
        level: 35,
        type: 'passive',
        description: 'Getting feedback gives +50 XP and +25 gold. Improve faster through critique',
        effect: { feedbackXp: 50, feedbackGold: 25 },
        prerequisites: ['craft_10000_hours'],
        position: { x: 400, y: 130 } // Rising to hammer face
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
        position: { x: 400, y: 80 } // Hammer face
      },

      // === TIER 3: EXPERT (Hammer head with sparks) ===
      {
        id: 'craft_expert',
        name: 'Expert Craftsman',
        tier: 'expert',
        level: 50,
        type: 'keystone',
        description: 'KEYSTONE: All practice gives +100% XP. Quality over quantity',
        effect: { craftXpMultiplier: 2, qualityFocus: true },
        prerequisites: ['craft_creative'],
        position: { x: 400, y: 20 } // Hammer top
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
        position: { x: 180, y: -20 } // Left spark - far spread
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
        position: { x: 620, y: -20 } // Right spark - far spread
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
        position: { x: 400, y: -50 } // Upper center convergence
      },

      // === TIER 4: MASTER (Masterwork crown) ===
      {
        id: 'craft_master',
        name: 'Grand Master',
        tier: 'master',
        level: 80,
        type: 'keystone',
        description: 'ULTIMATE: Triple craft XP. World-class skill. Leave a legacy',
        effect: { craftXpMultiplier: 3, worldClass: true, globalXpBonus: 0.15 },
        prerequisites: ['craft_professional'],
        position: { x: 400, y: -120 } // Masterwork crown - dramatic height
      },

      // === WEAPON ABILITY UNLOCKS (Tech) - Left tool rack ===
      {
        id: 'unlock_ability_gadget_throw',
        name: 'Gadget Throw',
        tier: 'novice',
        level: 7,
        type: 'unlock',
        description: 'UNLOCK: Gadget Throw ability - Throw a crafted gadget at your enemy',
        effect: { unlocksAbility: 'gadget_throw' },
        prerequisites: ['craft_foundation'],
        position: { x: 240, y: 580 } // Left of base
      },
      {
        id: 'unlock_ability_gear_grind',
        name: 'Gear Grind',
        tier: 'novice',
        level: 9,
        type: 'unlock',
        description: 'UNLOCK: Gear Grind ability - Grind enemies with mechanical gears',
        effect: { unlocksAbility: 'gear_grind' },
        prerequisites: ['unlock_ability_gadget_throw'],
        position: { x: 100, y: 520 } // Continue left - far
      },
      {
        id: 'unlock_ability_bomb_toss',
        name: 'Bomb Toss',
        tier: 'novice',
        level: 10,
        type: 'unlock',
        description: 'UNLOCK: Bomb Toss ability - Toss a crafted explosive',
        effect: { unlocksAbility: 'bomb_toss' },
        prerequisites: ['unlock_ability_gear_grind'],
        position: { x: 60, y: 440 } // Far left
      },
      {
        id: 'unlock_ability_turret_blast',
        name: 'Turret Blast',
        tier: 'novice',
        level: 15,
        type: 'unlock',
        description: 'UNLOCK: Turret Blast ability - Deploy a temporary turret that fires',
        effect: { unlocksAbility: 'turret_blast' },
        prerequisites: ['unlock_ability_bomb_toss'],
        position: { x: 80, y: 350 } // Upper left
      },
      {
        id: 'unlock_ability_mech_strike',
        name: 'Mech Strike',
        tier: 'adept',
        level: 20,
        type: 'unlock',
        description: 'UNLOCK: Mech Strike ability - Summon a mechanical arm to strike',
        effect: { unlocksAbility: 'mech_strike' },
        prerequisites: ['unlock_ability_turret_blast'],
        position: { x: 120, y: 180 } // Near anvil wing
      },
      {
        id: 'unlock_ability_invention_overload',
        name: 'Invention Overload',
        tier: 'adept',
        level: 30,
        type: 'unlock',
        description: 'UNLOCK: Invention Overload ability - Overload all inventions for massive damage',
        effect: { unlocksAbility: 'invention_overload' },
        prerequisites: ['unlock_ability_mech_strike'],
        position: { x: 180, y: 60 } // Near hammer sparks
      }
    ]
  }
};

/**
 * XP Awards by Activity Type
 * Based on Habitica's system with optimisations
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
