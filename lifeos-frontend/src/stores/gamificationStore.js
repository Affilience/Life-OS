import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { calculateTotalStats, calculateStatBreakdown, getModuleXPMultiplier } from '../utils/statsSystem';

/**
 * Unified Gamification Store - Single Source of Truth
 *
 * Integrates all gamification systems:
 * - Cosmic Evolution (Level, Stage, XP)
 * - Equipment System (Stats, Bonuses) - USES UNIFIED STATS SYSTEM
 * - Streaks & Shields (Momentum Chains)
 * - Missions (Daily/Weekly/Monthly/Seasonal)
 * - Achievements & Discoveries
 * - Constellations & Stars
 * - Perk Trees
 * - Cosmic Credits (Currency)
 * - Central Event Pipeline
 */

export const useGamificationStore = create(
  persist(
    (set, get) => ({
      // ============================================
      // CORE USER STATE
      // ============================================

      userId: null,
      isInitialized: false,
      isLoading: false,
      lastSyncedAt: null,

      // ============================================
      // COSMIC EVOLUTION (Level & Stage)
      // ============================================

      level: 1,
      currentStage: 1, // Visual avatar stage (1-40+)
      totalXP: 0,
      currentXP: 0, // XP in current level
      xpToNextLevel: 100,
      xpMultiplier: 1.0, // From equipment, perks, streaks

      // ============================================
      // EQUIPMENT & STATS
      // ============================================

      equippedItems: [], // Array of equipped equipment with full data
      ownedEquipment: [], // Array of all owned equipment

      stats: {
        defense: 0,
        strength: 0,
        vitality: 0,
        intelligence: 0,
        wisdom: 0,
      },

      totalDefense: 0,
      totalStrength: 0,
      totalVitality: 0,
      totalIntelligence: 0,
      totalWisdom: 0,

      // ============================================
      // COSMIC CREDITS (Currency)
      // ============================================

      cosmicCredits: 0,
      lifetimeCreditsEarned: 0,
      lifetimeCreditsSpent: 0,

      // ============================================
      // STREAKS & SHIELDS (Momentum Chains)
      // ============================================

      streaks: [], // All active streaks
      globalStreak: null, // Main streak for XP multiplier
      shieldsRemaining: 0,

      // ============================================
      // MISSIONS
      // ============================================

      missions: {
        daily: [],
        weekly: [],
        monthly: [],
        seasonal: [],
      },

      missionProgress: {}, // Map of mission_id -> progress

      // ============================================
      // ACHIEVEMENTS & DISCOVERIES
      // ============================================

      achievements: [], // All achievements with progress
      unlockedAchievements: [], // Completed achievements
      recentAchievements: [], // Last 5 unlocked

      // ============================================
      // CONSTELLATIONS & STARS
      // ============================================

      constellations: {
        orion: { unlocked: 0, total: 10, stars: [] },      // Productivity
        phoenix: { unlocked: 0, total: 10, stars: [] },     // Fitness
        athena: { unlocked: 0, total: 10, stars: [] },      // Knowledge
        chronos: { unlocked: 0, total: 10, stars: [] },     // Time Management
        plutus: { unlocked: 0, total: 10, stars: [] },      // Finance
      },

      // ============================================
      // PERK TREES
      // ============================================

      unlockedPerks: [], // Array of unlocked perk IDs
      activePerks: [], // Array of active perk effects

      // ============================================
      // MODULE XP (For Constellations)
      // ============================================

      moduleXP: {
        productivity: 0,
        fitness: 0,
        knowledge: 0,
        journal: 0,
        finance: 0,
        calendar: 0,
        skills: 0,
      },

      // ============================================
      // GAMIFICATION EVENTS (History)
      // ============================================

      recentEvents: [], // Last 20 events
      pendingRewards: [], // Rewards to display

      // ============================================
      // ACTIONS: INITIALIZATION
      // ============================================

      /**
       * Initialize store with user data from Supabase
       */
      initialize: async (userId) => {
        if (get().isInitialized && get().userId === userId) {
          return; // Already initialized
        }

        set({ isLoading: true, userId });

        try {
          // Fetch all user gamification data in parallel
          const [
            progressData,
            creditsData,
            equipmentData,
            streaksData,
            missionsData,
            achievementsData,
            constellationsData,
            perksData,
          ] = await Promise.all([
            // 1. User progress (level, stage, XP, stats)
            supabase
              .from('user_module_progress')
              .select('*')
              .eq('user_id', userId)
              .eq('module_id', 'cosmic_evolution')
              .single(),

            // 2. Cosmic credits
            supabase
              .from('user_cosmic_currency')
              .select('*')
              .eq('user_id', userId)
              .single(),

            // 3. Equipment (owned + equipped)
            supabase
              .from('user_equipment')
              .select(`
                *,
                equipment_items (*)
              `)
              .eq('user_id', userId),

            // 4. Streaks
            supabase
              .from('momentum_chains')
              .select('*')
              .eq('user_id', userId)
              .eq('is_active', true),

            // 5. Missions
            supabase
              .from('user_missions')
              .select('*')
              .eq('user_id', userId)
              .in('status', ['active', 'in_progress']),

            // 6. Achievements
            supabase
              .from('achievement_progress')
              .select(`
                *,
                discoveries (*)
              `)
              .eq('user_id', userId),

            // 7. Constellations
            supabase
              .from('user_constellation_progress')
              .select(`
                *,
                constellation_stars (*)
              `)
              .eq('user_id', userId),

            // 8. Unlocked perks
            supabase
              .from('user_perks')
              .select(`
                *,
                perks (*)
              `)
              .eq('user_id', userId),
          ]);

          // Process user progress
          const progress = progressData.data;
          if (progress) {
            set({
              level: progress.level,
              currentStage: progress.current_stage,
              totalXP: progress.xp,
              currentXP: progress.xp % (progress.level * 100),
              xpToNextLevel: progress.level * 100,
              xpMultiplier: progress.xp_multiplier || 1.0,
              totalDefense: progress.total_defense || 0,
              totalStrength: progress.total_strength || 0,
              totalVitality: progress.total_vitality || 0,
              totalIntelligence: progress.total_intelligence || 0,
              totalWisdom: progress.total_wisdom || 0,
            });
          }

          // Process cosmic credits
          const credits = creditsData.data;
          if (credits) {
            set({
              cosmicCredits: credits.cosmic_credits,
              lifetimeCreditsEarned: credits.lifetime_credits_earned,
              lifetimeCreditsSpent: credits.lifetime_credits_spent,
            });
          }

          // Process equipment
          const equipment = equipmentData.data || [];
          const equipped = equipment.filter(e => e.is_equipped);
          set({
            equippedItems: equipped,
            ownedEquipment: equipment,
          });

          // Process streaks
          const streaks = streaksData.data || [];
          const globalStreak = streaks.find(s => s.is_global);
          set({
            streaks,
            globalStreak,
            shieldsRemaining: globalStreak?.shield_count || 0,
          });

          // Process missions
          const missions = missionsData.data || [];
          const groupedMissions = {
            daily: missions.filter(m => m.frequency === 'daily'),
            weekly: missions.filter(m => m.frequency === 'weekly'),
            monthly: missions.filter(m => m.frequency === 'monthly'),
            seasonal: missions.filter(m => m.frequency === 'seasonal'),
          };
          set({ missions: groupedMissions });

          // Process achievements
          const achievements = achievementsData.data || [];
          const unlocked = achievements.filter(a => a.is_unlocked);
          const recent = unlocked
            .sort((a, b) => new Date(b.unlocked_at) - new Date(a.unlocked_at))
            .slice(0, 5);
          set({
            achievements,
            unlockedAchievements: unlocked,
            recentAchievements: recent,
          });

          // Process constellations
          const constellationProgress = constellationsData.data || [];
          const constellations = {
            orion: processConstellationData(constellationProgress, 'orion'),
            phoenix: processConstellationData(constellationProgress, 'phoenix'),
            athena: processConstellationData(constellationProgress, 'athena'),
            chronos: processConstellationData(constellationProgress, 'chronos'),
            plutus: processConstellationData(constellationProgress, 'plutus'),
          };
          set({ constellations });

          // Process perks
          const perks = perksData.data || [];
          const activePerks = perks.filter(p => p.is_active);
          set({
            unlockedPerks: perks,
            activePerks,
          });

          set({
            isInitialized: true,
            isLoading: false,
            lastSyncedAt: new Date().toISOString(),
          });

          console.log('✅ Gamification store initialized');
        } catch (error) {
          console.error('❌ Error initializing gamification store:', error);
          set({ isLoading: false });
        }
      },

      // ============================================
      // ACTIONS: COSMIC EVOLUTION
      // ============================================

      /**
       * Add XP and trigger level up if needed
       */
      addXP: async (amount, source = 'manual') => {
        const { userId, level, totalXP, xpMultiplier } = get();

        // Apply multiplier
        const adjustedAmount = Math.floor(amount * xpMultiplier);
        const newTotalXP = totalXP + adjustedAmount;
        const xpNeeded = level * 100;
        const newCurrentXP = newTotalXP % xpNeeded;

        // Check for level up
        let newLevel = level;
        let leveledUp = false;
        let stageTransition = false;

        if (newTotalXP >= (level * 100)) {
          newLevel = Math.floor(newTotalXP / 100) + 1;
          leveledUp = true;

          // Check for stage transition (every 10 levels)
          const oldStage = get().currentStage;
          const newStage = Math.min(40, Math.floor(newLevel / 2.5) + 1);
          stageTransition = newStage > oldStage;

          set({
            level: newLevel,
            currentStage: newStage,
          });
        }

        set({
          totalXP: newTotalXP,
          currentXP: newCurrentXP,
          xpToNextLevel: newLevel * 100,
        });

        // Update database
        await supabase
          .from('user_module_progress')
          .update({
            level: newLevel,
            xp: newTotalXP,
            current_stage: get().currentStage,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('module_id', 'cosmic_evolution');

        // Log event
        get().logEvent('xp_gained', source, {
          amount: adjustedAmount,
          multiplier: xpMultiplier,
          new_level: newLevel,
          leveled_up: leveledUp,
          stage_transition: stageTransition,
        });

        return {
          xpGained: adjustedAmount,
          leveledUp,
          newLevel,
          stageTransition,
          newStage: get().currentStage,
        };
      },

      /**
       * Add module-specific XP (for constellations)
       */
      addModuleXP: async (module, amount) => {
        const current = get().moduleXP[module] || 0;
        const newAmount = current + amount;

        set({
          moduleXP: {
            ...get().moduleXP,
            [module]: newAmount,
          },
        });

        // Check for constellation star unlocks
        get().checkConstellationProgress(module);

        // Also add to total XP
        return get().addXP(amount, module);
      },

      // ============================================
      // ACTIONS: EQUIPMENT
      // ============================================

      /**
       * Equip an item
       */
      equipItem: async (equipmentId) => {
        const { userId, ownedEquipment } = get();

        const item = ownedEquipment.find(e => e.equipment_id === equipmentId);
        if (!item) return { success: false, error: 'Item not owned' };

        // Get item details
        const { data: itemData } = await supabase
          .from('equipment_items')
          .select('*')
          .eq('id', equipmentId)
          .single();

        if (!itemData) return { success: false, error: 'Item not found' };

        // Unequip any item in the same slot
        const existingInSlot = get().equippedItems.find(
          e => e.equipment_items.slot === itemData.slot
        );

        if (existingInSlot) {
          await supabase
            .from('user_equipment')
            .update({ is_equipped: false })
            .eq('user_id', userId)
            .eq('equipment_id', existingInSlot.equipment_id);
        }

        // Equip new item
        await supabase
          .from('user_equipment')
          .update({ is_equipped: true })
          .eq('user_id', userId)
          .eq('equipment_id', equipmentId);

        // Refresh equipment
        get().refreshEquipment();

        return { success: true };
      },

      /**
       * Unequip an item
       */
      unequipItem: async (equipmentId) => {
        const { userId } = get();

        await supabase
          .from('user_equipment')
          .update({ is_equipped: false })
          .eq('user_id', userId)
          .eq('equipment_id', equipmentId);

        get().refreshEquipment();
        return { success: true };
      },

      /**
       * Refresh equipment and stats from database
       * NOW USES UNIFIED STATS SYSTEM
       */
      refreshEquipment: async () => {
        const { userId, level, unlockedAchievements } = get();

        const { data: equipment } = await supabase
          .from('user_equipment')
          .select(`
            *,
            equipment_items (*)
          `)
          .eq('user_id', userId);

        if (equipment) {
          const equipped = equipment.filter(e => e.is_equipped);

          // Convert to format expected by stats system
          const equipmentItems = equipped.map(e => e.equipment_items);

          // Calculate level bonus
          const levelBonus = Math.floor(level / 5) * 2; // +2 every 5 levels

          // Calculate achievement bonus
          const achievementBonus = unlockedAchievements?.length || 0;

          // Use unified stats system
          const stats = calculateTotalStats({
            equipment: equipmentItems,
            pets: [], // Pets will be added via usePetStore
            achievements: achievementBonus,
            levelBonus,
          });

          set({
            equippedItems: equipped,
            ownedEquipment: equipment,
            stats,
            totalDefense: stats.defense,
            totalStrength: stats.strength,
            totalVitality: stats.vitality,
            totalIntelligence: stats.intelligence,
            totalWisdom: stats.wisdom,
          });
        }
      },

      // ============================================
      // ACTIONS: COSMIC CREDITS
      // ============================================

      /**
       * Add cosmic credits
       */
      addCredits: async (amount, source = 'reward') => {
        const { userId, cosmicCredits, lifetimeCreditsEarned } = get();

        const newCredits = cosmicCredits + amount;
        const newLifetime = lifetimeCreditsEarned + amount;

        set({
          cosmicCredits: newCredits,
          lifetimeCreditsEarned: newLifetime,
        });

        // Update database
        await supabase
          .from('user_cosmic_currency')
          .update({
            cosmic_credits: newCredits,
            lifetime_credits_earned: newLifetime,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        get().logEvent('credits_earned', source, { amount });

        return { newCredits, earned: amount };
      },

      /**
       * Spend cosmic credits
       */
      spendCredits: async (amount, purpose = 'purchase') => {
        const { userId, cosmicCredits, lifetimeCreditsSpent } = get();

        if (cosmicCredits < amount) {
          return { success: false, error: 'Insufficient credits' };
        }

        const newCredits = cosmicCredits - amount;
        const newSpent = lifetimeCreditsSpent + amount;

        set({
          cosmicCredits: newCredits,
          lifetimeCreditsSpent: newSpent,
        });

        // Update database
        await supabase
          .from('user_cosmic_currency')
          .update({
            cosmic_credits: newCredits,
            lifetime_credits_spent: newSpent,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        get().logEvent('credits_spent', purpose, { amount });

        return { success: true, newCredits, spent: amount };
      },

      // ============================================
      // ACTIONS: STREAKS
      // ============================================

      /**
       * Update streak for a module
       */
      updateStreak: async (module, success = true) => {
        const { userId, streaks } = get();

        const streak = streaks.find(s => s.module_id === module);

        if (!streak) {
          // Create new streak
          const { data: newStreak } = await supabase
            .from('momentum_chains')
            .insert({
              user_id: userId,
              module_id: module,
              current_streak: success ? 1 : 0,
              is_active: success,
            })
            .select()
            .single();

          if (newStreak) {
            set({ streaks: [...streaks, newStreak] });
          }
        } else {
          // Update existing streak
          let newStreakCount = streak.current_streak;
          let shieldsUsed = 0;

          if (success) {
            newStreakCount = streak.current_streak + 1;
          } else {
            // Check for shield
            if (streak.shield_count > 0) {
              shieldsUsed = 1;
              // Streak protected by shield
            } else {
              newStreakCount = 0;
            }
          }

          await supabase
            .from('momentum_chains')
            .update({
              current_streak: newStreakCount,
              shield_count: Math.max(0, streak.shield_count - shieldsUsed),
              longest_streak: Math.max(streak.longest_streak, newStreakCount),
              updated_at: new Date().toISOString(),
            })
            .eq('id', streak.id);

          // Refresh streaks
          get().refreshStreaks();
        }

        // Recalculate XP multiplier
        get().recalculateXPMultiplier();
      },

      /**
       * Refresh streaks from database
       */
      refreshStreaks: async () => {
        const { userId } = get();

        const { data: streaks } = await supabase
          .from('momentum_chains')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true);

        if (streaks) {
          const globalStreak = streaks.find(s => s.is_global);
          set({
            streaks,
            globalStreak,
            shieldsRemaining: globalStreak?.shield_count || 0,
          });
        }
      },

      // ============================================
      // ACTIONS: MISSIONS
      // ============================================

      /**
       * Complete a mission
       */
      completeMission: async (missionId) => {
        const { userId } = get();

        // Update mission status
        const { data: mission } = await supabase
          .from('user_missions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', missionId)
          .eq('user_id', userId)
          .select()
          .single();

        if (mission) {
          // Award XP and credits
          await get().addXP(mission.xp_reward, 'mission');
          await get().addCredits(mission.credit_reward, 'mission');

          // Refresh missions
          get().refreshMissions();

          return { success: true, mission };
        }

        return { success: false };
      },

      /**
       * Refresh missions from database
       */
      refreshMissions: async () => {
        const { userId } = get();

        const { data: missions } = await supabase
          .from('user_missions')
          .select('*')
          .eq('user_id', userId)
          .in('status', ['active', 'in_progress']);

        if (missions) {
          const grouped = {
            daily: missions.filter(m => m.frequency === 'daily'),
            weekly: missions.filter(m => m.frequency === 'weekly'),
            monthly: missions.filter(m => m.frequency === 'monthly'),
            seasonal: missions.filter(m => m.frequency === 'seasonal'),
          };
          set({ missions: grouped });
        }
      },

      // ============================================
      // ACTIONS: CONSTELLATIONS
      // ============================================

      /**
       * Check and unlock constellation stars
       */
      checkConstellationProgress: async (module) => {
        const { userId, moduleXP } = get();

        const constellationMap = {
          productivity: 'orion',
          fitness: 'phoenix',
          knowledge: 'athena',
          calendar: 'chronos',
          finance: 'plutus',
        };

        const constellation = constellationMap[module];
        if (!constellation) return;

        const currentXP = moduleXP[module];

        // Get available stars for this constellation
        const { data: stars } = await supabase
          .from('constellation_stars')
          .select('*')
          .eq('constellation_name', constellation)
          .order('star_number', { ascending: true });

        if (!stars) return;

        // Get user's progress
        const { data: progress } = await supabase
          .from('user_constellation_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('constellation_name', constellation);

        const unlockedStarNumbers = new Set(
          progress?.map(p => p.star_number) || []
        );

        // Check which stars should be unlocked
        for (const star of stars) {
          if (unlockedStarNumbers.has(star.star_number)) continue;

          if (currentXP >= star.required_module_xp) {
            // Unlock star
            await supabase
              .from('user_constellation_progress')
              .insert({
                user_id: userId,
                constellation_name: constellation,
                star_number: star.star_number,
                unlocked_at: new Date().toISOString(),
              });

            // Award rewards
            if (star.xp_reward) await get().addXP(star.xp_reward, 'constellation');
            if (star.credit_reward) await get().addCredits(star.credit_reward, 'constellation');

            get().logEvent('constellation_star_unlocked', constellation, {
              star_number: star.star_number,
              star_name: star.star_name,
            });
          }
        }

        // Refresh constellations
        get().refreshConstellations();
      },

      /**
       * Refresh constellations from database
       */
      refreshConstellations: async () => {
        const { userId } = get();

        const { data: progress } = await supabase
          .from('user_constellation_progress')
          .select(`
            *,
            constellation_stars (*)
          `)
          .eq('user_id', userId);

        if (progress) {
          const constellations = {
            orion: processConstellationData(progress, 'orion'),
            phoenix: processConstellationData(progress, 'phoenix'),
            athena: processConstellationData(progress, 'athena'),
            chronos: processConstellationData(progress, 'chronos'),
            plutus: processConstellationData(progress, 'plutus'),
          };
          set({ constellations });
        }
      },

      // ============================================
      // ACTIONS: UTILITIES
      // ============================================

      /**
       * Recalculate XP multiplier from streaks, perks, equipment
       */
      recalculateXPMultiplier: async () => {
        const { userId } = get();

        // Call database function
        const { data } = await supabase
          .rpc('calculate_xp_multiplier', { p_user_id: userId });

        if (data !== null) {
          set({ xpMultiplier: data });

          // Update in database
          await supabase
            .from('user_module_progress')
            .update({ xp_multiplier: data })
            .eq('user_id', userId)
            .eq('module_id', 'cosmic_evolution');
        }
      },

      /**
       * Log a gamification event
       */
      logEvent: async (eventType, eventSource, eventData = {}) => {
        const { userId } = get();

        await supabase
          .from('gamification_events')
          .insert({
            user_id: userId,
            event_type: eventType,
            event_source: eventSource,
            event_data: eventData,
            created_at: new Date().toISOString(),
          });

        // Update recent events
        const recent = get().recentEvents;
        set({
          recentEvents: [
            { eventType, eventSource, eventData, timestamp: new Date().toISOString() },
            ...recent,
          ].slice(0, 20),
        });
      },

      /**
       * Full sync - refresh all data
       */
      syncAll: async () => {
        const { userId } = get();
        if (!userId) return;

        set({ isLoading: true });

        await Promise.all([
          get().refreshEquipment(),
          get().refreshStreaks(),
          get().refreshMissions(),
          get().refreshConstellations(),
          get().recalculateXPMultiplier(),
        ]);

        set({
          isLoading: false,
          lastSyncedAt: new Date().toISOString(),
        });
      },

      /**
       * Reset store (for logout)
       */
      reset: () => {
        set({
          userId: null,
          isInitialized: false,
          level: 1,
          currentStage: 1,
          totalXP: 0,
          currentXP: 0,
          xpToNextLevel: 100,
          xpMultiplier: 1.0,
          equippedItems: [],
          ownedEquipment: [],
          stats: { defense: 0, strength: 0, vitality: 0, intelligence: 0, wisdom: 0 },
          cosmicCredits: 0,
          streaks: [],
          missions: { daily: [], weekly: [], monthly: [], seasonal: [] },
          achievements: [],
          constellations: {
            orion: { unlocked: 0, total: 10, stars: [] },
            phoenix: { unlocked: 0, total: 10, stars: [] },
            athena: { unlocked: 0, total: 10, stars: [] },
            chronos: { unlocked: 0, total: 10, stars: [] },
            plutus: { unlocked: 0, total: 10, stars: [] },
          },
          unlockedPerks: [],
          activePerks: [],
          moduleXP: {
            productivity: 0,
            fitness: 0,
            knowledge: 0,
            journal: 0,
            finance: 0,
            calendar: 0,
            skills: 0,
          },
          recentEvents: [],
        });
      },
    }),
    {
      name: 'gamification-storage',
      partialize: (state) => ({
        // Only persist minimal data - fetch rest from Supabase
        userId: state.userId,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Process constellation data into summary format
 */
function processConstellationData(progressData, constellationName) {
  const stars = progressData.filter(
    p => p.constellation_name === constellationName
  );

  return {
    unlocked: stars.length,
    total: 10,
    stars: stars.map(s => ({
      number: s.star_number,
      name: s.constellation_stars?.star_name,
      unlockedAt: s.unlocked_at,
    })),
  };
}

/**
 * Calculate XP needed for a level
 */
export function getXPForLevel(level) {
  return level * 100;
}

/**
 * Calculate total XP needed to reach a level
 */
export function getTotalXPForLevel(level) {
  return (level * (level - 1) * 100) / 2;
}

/**
 * Get stage for a level
 */
export function getStageForLevel(level) {
  return Math.min(40, Math.floor(level / 2.5) + 1);
}

/**
 * Get rarity color
 */
export function getRarityColor(rarity) {
  const colors = {
    common: '#9CA3AF',
    uncommon: '#10B981',
    rare: '#3B82F6',
    epic: '#A855F7',
    legendary: '#F59E0B',
  };
  return colors[rarity] || colors.common;
}

/**
 * Format XP number
 */
export function formatXP(xp) {
  if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
  return xp.toString();
}

export default useGamificationStore;
