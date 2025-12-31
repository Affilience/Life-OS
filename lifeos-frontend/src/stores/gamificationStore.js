import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, getCurrentUserId } from '../lib/supabase';
import { calculateTotalStats, calculateStatBreakdown, getModuleXPMultiplier, SKILL_POINTS_PER_LEVEL } from '../utils/statsSystem';
import { useAvatarStore } from './avatarStore';
import { calculateXPForLevel, calculateLevelFromTotalXP } from '../data/avatarEvolution';
import { feedback, sounds } from '../services/microInteractions';
import { PERK_TREES } from '../data/perkTrees';

// Lazy import unlock service to avoid circular dependencies
let unlockServiceRef = null;
const getUnlockService = async () => {
  if (!unlockServiceRef) {
    const module = await import('../services/unlockService');
    unlockServiceRef = module.default;
  }
  return unlockServiceRef;
};

// Lazy import notification store to avoid circular dependencies
let notificationStoreRef = null;
const getNotificationStore = async () => {
  if (!notificationStoreRef) {
    const module = await import('./notificationStore');
    notificationStoreRef = module.useNotificationStore;
  }
  return notificationStoreRef;
};

// Lazy import skill points store
let skillPointsStoreRef = null;
const getSkillPointsStore = async () => {
  if (!skillPointsStoreRef) {
    const module = await import('./skillPointsStore');
    skillPointsStoreRef = module.useSkillPointsStore;
  }
  return skillPointsStoreRef;
};

// Lazy import social store for leaderboard sync
let socialStoreRef = null;
const getSocialStore = async () => {
  if (!socialStoreRef) {
    const module = await import('./socialStore');
    socialStoreRef = module.useSocialStore;
  }
  return socialStoreRef;
};

/**
 * Get perks that become newly available at a given level
 */
function getNewlyAvailablePerks(oldLevel, newLevel) {
  const newPerks = [];
  Object.entries(PERK_TREES).forEach(([treeId, tree]) => {
    tree.perks.forEach(perk => {
      if (perk.level > oldLevel && perk.level <= newLevel) {
        newPerks.push({
          id: perk.id,
          name: perk.name,
          tree: treeId,
          treeName: tree.name,
          treeColor: tree.color,
          level: perk.level,
          tier: perk.tier,
          description: perk.description,
        });
      }
    });
  });
  return newPerks.sort((a, b) => a.level - b.level || a.tree.localeCompare(b.tree));
}

// ============================================
// HELPER FUNCTIONS (must be defined before store)
// ============================================

/**
 * Process constellation data into summary format (simple version without joins)
 */
function processConstellationDataSimple(progressData, constellationName) {
  const progress = progressData.find(
    p => p.constellation_name === constellationName
  );

  if (!progress) {
    return { unlocked: 0, total: 10, stars: [], moduleXP: 0 };
  }

  return {
    unlocked: progress.unlocked_stars_count || 0,
    total: 10,
    stars: (progress.unlocked_star_ids || []).map((id, i) => ({
      id,
      number: i + 1,
    })),
    moduleXP: progress.module_xp || 0,
  };
}

/**
 * Process constellation data into summary format (with joins - legacy)
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
      xpToNextLevel: 500, // Base XP for level 1 (exponential scaling from avatarEvolution.js)
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
      // CONSUMABLE INVENTORY
      // ============================================

      inventory: [], // Array of { id, itemId, name, effect, purchasedAt, quantity }
      activeBoosts: [], // Array of { type, amount, expiresAt } - active consumable boosts

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
       * ALWAYS fetches fresh data to ensure Supabase is source of truth
       */
      initialize: async (passedUserId = null) => {
        // Always fetch fresh data from Supabase - don't skip even for same user
        // This ensures data stays in sync across devices/sessions
        const userId = passedUserId || await getCurrentUserId();
        set({ isLoading: true, userId });

        // Master timeout - ensure loading is set to false even if queries hang
        const INIT_TIMEOUT_MS = 15000;
        let timedOut = false;
        const timeoutId = setTimeout(() => {
          timedOut = true;
          set({ isLoading: false, isInitialized: true });
        }, INIT_TIMEOUT_MS);

        // Helper to wrap queries with timeout
        const withTimeout = (promise, timeoutMs = 10000) => {
          return Promise.race([
            promise,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
            )
          ]).catch(() => ({ data: null, error: 'timeout' }));
        };

        try {
          // Fetch all user gamification data in parallel with timeouts
          const [
            progressData,
            creditsData,
            equipmentData,
            streaksData,
            missionsData,
            achievementsData,
            constellationsData,
            perksData,
            inventoryData,
            activeBoostsData,
            moduleMasteryData,
            recentEventsData,
          ] = await Promise.all([
            // 1. User progress (level, stage, XP, stats)
            withTimeout(supabase
              .from('user_module_progress')
              .select('*')
              .eq('user_id', userId)
              .eq('module_id', 'cosmic_evolution')
              .maybeSingle()),

            // 2. Cosmic credits
            withTimeout(supabase
              .from('user_cosmic_currency')
              .select('*')
              .eq('user_id', userId)
              .maybeSingle()),

            // 3. Equipment (owned + equipped)
            withTimeout(supabase
              .from('user_equipment')
              .select(`
                *,
                equipment_items (*)
              `)
              .eq('user_id', userId)),

            // 4. Streaks (active = current_streak > 0)
            withTimeout(supabase
              .from('momentum_chains')
              .select('*')
              .eq('user_id', userId)
              .gt('current_streak', 0)),

            // 5. Missions
            withTimeout(supabase
              .from('user_missions')
              .select('*, missions(*)')
              .eq('user_id', userId)
              .eq('status', 'active')),

            // 6. Achievements
            withTimeout(supabase
              .from('achievement_progress')
              .select(`
                *,
                discoveries (*)
              `)
              .eq('user_id', userId)),

            // 7. Constellations
            withTimeout(supabase
              .from('user_constellation_progress')
              .select('*')
              .eq('user_id', userId)),

            // 8. Unlocked perks (no join - perk definitions are in frontend)
            withTimeout(supabase
              .from('user_perks')
              .select('*')
              .eq('user_id', userId)),

            // 9. Inventory (consumable items)
            withTimeout(supabase
              .from('user_inventory')
              .select('*')
              .eq('user_id', userId)),

            // 10. Active boosts (cleanup expired first)
            withTimeout(supabase
              .from('user_active_boosts')
              .select('*')
              .eq('user_id', userId)
              .gt('expires_at', new Date().toISOString())),

            // 11. Module mastery (module XP)
            withTimeout(supabase
              .from('user_module_mastery')
              .select('*')
              .eq('user_id', userId)
              .maybeSingle()),

            // 12. Recent gamification events (for heatmap)
            withTimeout(supabase
              .from('gamification_events')
              .select('event_type, event_source, event_data, xp_awarded, credits_awarded, created_at')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(500)),
          ]);

          // Process user progress
          const progress = progressData.data;
          if (progress) {
            // Always recalculate level/currentXP/xpToNextLevel from totalXP
            // This ensures consistency even if DB fields are slightly stale
            const savedTotalXP = progress.total_xp_earned || progress.current_xp || 0;
            const calculated = calculateLevelFromTotalXP(savedTotalXP);

            set({
              level: calculated.level,
              currentStage: Math.min(40, calculated.level),
              totalXP: savedTotalXP,
              currentXP: calculated.currentXP,
              xpToNextLevel: calculated.xpToNextLevel,
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
            shieldsRemaining: globalStreak?.shields_available || 0,
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
            orion: processConstellationDataSimple(constellationProgress, 'orion'),
            phoenix: processConstellationDataSimple(constellationProgress, 'phoenix'),
            athena: processConstellationDataSimple(constellationProgress, 'athena'),
            chronos: processConstellationDataSimple(constellationProgress, 'chronos'),
            plutus: processConstellationDataSimple(constellationProgress, 'plutus'),
          };
          set({ constellations });

          // Process perks
          const perks = perksData.data || [];
          const activePerksList = perks.filter(p => p.is_active);
          set({
            unlockedPerks: perks,
            activePerks: activePerksList,
          });

          // Process inventory
          const inventoryItems = (inventoryData.data || []).map(item => ({
            id: `${item.item_id}_${new Date(item.created_at).getTime()}`,
            itemId: item.item_id,
            name: item.item_name,
            description: item.item_description,
            icon: item.item_icon,
            sprite: item.item_sprite,
            effect: item.effect,
            rarity: item.item_rarity,
            purchasedAt: item.purchased_at,
            quantity: item.quantity,
          }));
          set({ inventory: inventoryItems });

          // Process active boosts
          const boosts = (activeBoostsData.data || []).map(boost => ({
            type: boost.boost_type,
            amount: parseFloat(boost.amount),
            expiresAt: new Date(boost.expires_at).getTime(),
          }));
          set({ activeBoosts: boosts });

          // Also load shields from progress
          if (progress?.shields_remaining) {
            set({ shieldsRemaining: progress.shields_remaining });
          }

          // Process module mastery (module XP)
          const mastery = moduleMasteryData.data;
          if (mastery) {
            set({
              moduleXP: {
                productivity: Number(mastery.productivity_lifetime_xp) || 0,
                fitness: Number(mastery.health_lifetime_xp) || 0,
                health: Number(mastery.health_lifetime_xp) || 0,
                knowledge: Number(mastery.knowledge_lifetime_xp) || 0,
                journal: Number(mastery.journal_lifetime_xp) || 0,
                finance: Number(mastery.financial_lifetime_xp) || 0,
                financial: Number(mastery.financial_lifetime_xp) || 0,
                calendar: Number(mastery.productivity_lifetime_xp) || 0,
                skills: Number(mastery.skills_lifetime_xp) || 0,
              },
            });
          }

          // Process recent events (for heatmap)
          const events = recentEventsData.data || [];
          const formattedEvents = events.map(e => ({
            eventType: e.event_type,
            eventSource: e.event_source,
            eventData: e.event_data,
            xpAwarded: e.xp_awarded,
            creditsAwarded: e.credits_awarded,
            timestamp: e.created_at,
          }));
          set({ recentEvents: formattedEvents });

          set({
            isInitialized: true,
            isLoading: false,
            lastSyncedAt: new Date().toISOString(),
          });

          console.log('[GamificationStore] ✅ Initialized');
        } catch (error) {
          console.error('[GamificationStore] ❌ Error initializing:', error);
        } finally {
          clearTimeout(timeoutId);
          if (!timedOut) {
            set({ isLoading: false, isInitialized: true });
          }
        }
      },

      // ============================================
      // ACTIONS: COSMIC EVOLUTION
      // ============================================

      /**
       * Add XP and trigger level up if needed
       * Uses exponential XP scaling from avatarEvolution.js
       * Also syncs to avatarStore for equipment unlocks
       */
      addXP: async (amount, source = 'manual', options = {}) => {
        const { userId, totalXP, xpMultiplier, activeBoosts } = get();
        const { skipAvatarSync = false } = options;

        // Skip database sync if userId is null (store not initialized yet)
        const shouldSyncToDatabase = !!userId;

        // Calculate total multiplier including active boosts (like Double XP Scroll)
        let totalMultiplier = xpMultiplier;
        const now = Date.now();

        // Check for active XP multiplier boosts
        const validBoosts = activeBoosts.filter(
          boost => boost.type === 'xp_multiplier' && boost.expiresAt > now
        );

        // Apply all valid boost multipliers
        for (const boost of validBoosts) {
          totalMultiplier *= boost.amount;
        }

        // Apply multiplier
        const adjustedAmount = Math.floor(amount * totalMultiplier);

        // For immediate UI feedback, calculate locally first
        let newTotalXP = totalXP + adjustedAmount;
        let newLevel, newCurrentXP, newXPToNext;

        const oldLevel = get().level;
        const oldStage = get().currentStage;

        // Use ATOMIC database operation if userId is available
        // This prevents race conditions when multiple devices add XP simultaneously
        if (shouldSyncToDatabase) {
          try {
            // Step 1: Atomically add XP to database (uses DB's own value, not our local state)
            const { data: xpResult, error: xpError } = await supabase
              .rpc('add_xp_atomic', {
                p_user_id: userId,
                p_amount: adjustedAmount,
                p_source: source
              });

            if (xpError) {
              console.warn('[GamificationStore] Atomic XP add failed, using local:', xpError.message);
            } else if (xpResult?.success) {
              // Use the authoritative total from database
              newTotalXP = xpResult.new_total_xp;
              console.log(`[GamificationStore] Atomic XP: +${adjustedAmount} → ${newTotalXP} total`);
            }
          } catch (error) {
            console.warn('[GamificationStore] RPC error, using local calculation:', error.message);
          }
        }

        // Calculate level using exponential scaling (frontend formula is source of truth for levels)
        ({ level: newLevel, currentXP: newCurrentXP, xpToNextLevel: newXPToNext } = calculateLevelFromTotalXP(newTotalXP));

        const leveledUp = newLevel > oldLevel;
        const newStage = Math.min(40, newLevel);
        const stageTransition = newStage > oldStage;

        // Update local state
        set({
          level: newLevel,
          currentStage: newStage,
          totalXP: newTotalXP,
          currentXP: newCurrentXP,
          xpToNextLevel: newXPToNext,
        });

        // Also update avatarStore for equipment unlocks (unless skipped to avoid circular calls)
        if (!skipAvatarSync) {
          try {
            const avatarStore = useAvatarStore.getState();
            if (avatarStore.addXP) {
              avatarStore.addXP(amount);
            }
          } catch (e) {
            // Silently fail if avatarStore not available
          }
        }

        // Update level in database if it changed (atomic operation)
        if (shouldSyncToDatabase && leveledUp) {
          try {
            await supabase.rpc('update_level_atomic', {
              p_user_id: userId,
              p_new_level: newLevel,
              p_new_stage: newStage,
              p_current_xp: newCurrentXP,
              p_xp_to_next: newXPToNext
            });
          } catch (error) {
            console.warn('[GamificationStore] Failed to sync level to database:', error.message);
          }
        }

        // Sync XP to leaderboards (if user has opted in)
        if (shouldSyncToDatabase && adjustedAmount > 0) {
          try {
            const SocialStore = await getSocialStore();
            const socialStore = SocialStore.getState();
            // Only sync if user has opted into leaderboards
            if (socialStore.socialProfile?.show_on_leaderboards) {
              await socialStore.syncToLeaderboards(newTotalXP, adjustedAmount, 0);
            }
          } catch (error) {
            // Silently fail - leaderboard sync is not critical
          }
        }

        // Log event (only if userId is available - logEvent checks for this)
        get().logEvent('xp_gained', source, {
          amount: adjustedAmount,
          baseAmount: amount,
          multiplier: totalMultiplier,
          baseMultiplier: xpMultiplier,
          activeBoosts: validBoosts.length,
          new_level: newLevel,
          leveled_up: leveledUp,
          stage_transition: stageTransition,
        });

        // Play feedback for XP gain and level up (sound + haptics + celebrations)
        if (leveledUp) {
          feedback.levelUp();
        } else if (adjustedAmount >= 10) {
          // Only play XP feedback for meaningful gains (avoid spam)
          feedback.xpGain(adjustedAmount);
        }

        // Show XP and level up notifications
        (async () => {
          const NotificationStore = await getNotificationStore();
          const notifStore = NotificationStore.getState();

          // Show XP notification for meaningful gains
          if (adjustedAmount >= 5) {
            notifStore.addXPNotification(adjustedAmount, source);
          }

          // Show level up celebration
          if (leveledUp) {
            // Check if it's a tier up (every 10 levels)
            const tierUp = newLevel % 10 === 0;

            // Award skill points on level up
            let skillPointsAwarded = SKILL_POINTS_PER_LEVEL;
            try {
              const SkillPointsStore = await getSkillPointsStore();
              const result = await SkillPointsStore.getState().awardLevelUpPoints();
              skillPointsAwarded = result?.pointsAwarded || SKILL_POINTS_PER_LEVEL;
            } catch (e) {
              console.warn('[GamificationStore] Skill points award failed:', e);
            }

            // Get newly available perks
            const newlyAvailablePerks = getNewlyAvailablePerks(oldLevel, newLevel);

            notifStore.showLevelUp({
              newLevel,
              oldLevel,
              tierUp,
              stageTransition,
              newStage,
              oldStage,
              xpBeforeLevelUp: totalXP, // XP before this gain
              xpToNextLevel: newXPToNext,
              xpGained: adjustedAmount,
              skillPointsAwarded,
              newlyAvailablePerks,
            });
          }
        })();

        // Trigger unlock service if leveled up (check for new pet/equipment unlocks)
        if (leveledUp) {
          (async () => {
            const unlockService = await getUnlockService();
            await unlockService.onLevelUp(newLevel);
          })();
        }

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
        const { userId, moduleXP } = get();
        const current = moduleXP[module] || 0;
        const newAmount = current + amount;

        set({
          moduleXP: {
            ...moduleXP,
            [module]: newAmount,
          },
        });

        // Persist to user_module_mastery table
        // Map module names to column names
        const moduleColumnMap = {
          productivity: 'productivity_lifetime_xp',
          fitness: 'health_lifetime_xp',
          health: 'health_lifetime_xp',
          knowledge: 'knowledge_lifetime_xp',
          journal: 'journal_lifetime_xp',
          finance: 'financial_lifetime_xp',
          financial: 'financial_lifetime_xp',
          calendar: 'productivity_lifetime_xp', // Calendar counts as productivity
          skills: 'skills_lifetime_xp',
        };

        const columnName = moduleColumnMap[module];
        if (columnName && userId) {
          await supabase
            .from('user_module_mastery')
            .upsert({
              user_id: userId,
              [columnName]: newAmount,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
        }

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
          .maybeSingle();

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

        if (!userId) {
          console.warn('[Gamification] Cannot add credits - no userId');
          return { newCredits: cosmicCredits, earned: 0 };
        }

        // Use ATOMIC database operation to prevent race conditions
        // when multiple devices award credits simultaneously
        let newCredits = cosmicCredits + amount;
        let newLifetime = lifetimeCreditsEarned + amount;

        try {
          // award_cosmic_credits is already atomic (uses ON CONFLICT DO UPDATE SET credits = credits + amount)
          const { data: result, error } = await supabase
            .rpc('award_cosmic_credits', {
              p_user_id: userId,
              p_amount: amount,
              p_transaction_type: source,
              p_description: `Earned from ${source}`
            });

          if (error) {
            console.error('[Gamification] Atomic credit add failed:', error);
          } else if (result?.success) {
            // Use authoritative balance from database
            newCredits = result.new_balance;
            console.log(`[Gamification] Atomic credits: +${amount} → ${newCredits} total (source: ${source})`);
          }
        } catch (error) {
          console.warn('[Gamification] RPC error for credits, using local:', error.message);
        }

        // Update local state with authoritative value
        set({
          cosmicCredits: newCredits,
          lifetimeCreditsEarned: newLifetime,
        });

        get().logEvent('credits_earned', source, { amount });

        return { newCredits, earned: amount };
      },

      /**
       * Spend cosmic credits
       * Uses ATOMIC database operation to prevent race conditions and ensure balance check
       */
      spendCredits: async (amount, purpose = 'purchase') => {
        const { userId, cosmicCredits, lifetimeCreditsSpent } = get();

        if (!userId) {
          return { success: false, error: 'Not authenticated' };
        }

        // Quick local check (authoritative check happens in database)
        if (cosmicCredits < amount) {
          return { success: false, error: 'Insufficient credits' };
        }

        // Use ATOMIC database operation with row locking
        // This prevents race conditions where two devices spend simultaneously
        try {
          const { data: result, error } = await supabase
            .rpc('spend_credits_atomic', {
              p_user_id: userId,
              p_amount: amount,
              p_purpose: purpose,
              p_description: `Spent on ${purpose}`
            });

          if (error) {
            console.error('[Gamification] Atomic spend failed:', error);
            return { success: false, error: error.message };
          }

          if (!result?.success) {
            // Database rejected the spend (insufficient balance or user not found)
            console.warn('[Gamification] Spend rejected:', result?.error);
            return { success: false, error: result?.error || 'Spend failed' };
          }

          // Update local state with authoritative value from database
          const newCredits = result.new_balance;
          const newSpent = lifetimeCreditsSpent + amount;

          set({
            cosmicCredits: newCredits,
            lifetimeCreditsSpent: newSpent,
          });

          console.log(`[Gamification] Atomic spend: -${amount} → ${newCredits} remaining (purpose: ${purpose})`);
          get().logEvent('credits_spent', purpose, { amount });

          return { success: true, newCredits, spent: amount };
        } catch (error) {
          console.error('[Gamification] RPC error for spend:', error);
          return { success: false, error: error.message };
        }
      },

      // ============================================
      // ACTIONS: INVENTORY
      // ============================================

      /**
       * Add item to inventory
       */
      addToInventory: async (item) => {
        const { userId, inventory } = get();

        // Check if item already exists in inventory (stack consumables)
        const existingIndex = inventory.findIndex(i => i.itemId === item.id);

        if (existingIndex >= 0) {
          // Increment quantity
          const newInventory = [...inventory];
          newInventory[existingIndex] = {
            ...newInventory[existingIndex],
            quantity: newInventory[existingIndex].quantity + 1,
          };
          set({ inventory: newInventory });

          // Update database
          await supabase
            .from('user_inventory')
            .update({
              quantity: newInventory[existingIndex].quantity,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
            .eq('item_id', item.id);
        } else {
          // Add new item
          const inventoryItem = {
            id: `${item.id}_${Date.now()}`,
            itemId: item.id,
            name: item.name,
            description: item.description,
            icon: item.icon,
            sprite: item.sprite,
            effect: item.effect,
            rarity: item.rarity,
            purchasedAt: new Date().toISOString(),
            quantity: 1,
          };
          set({ inventory: [...inventory, inventoryItem] });

          // Insert into database
          await supabase
            .from('user_inventory')
            .upsert({
              user_id: userId,
              item_id: item.id,
              item_name: item.name,
              item_description: item.description,
              item_icon: item.icon,
              item_sprite: item.sprite,
              item_rarity: item.rarity,
              effect: item.effect,
              quantity: 1,
            }, { onConflict: 'user_id,item_id' });
        }

        return { success: true };
      },

      /**
       * Use item from inventory
       */
      useInventoryItem: async (itemId) => {
        const { userId, inventory, activeBoosts, shieldsRemaining } = get();

        const itemIndex = inventory.findIndex(i => i.itemId === itemId);
        if (itemIndex < 0) {
          return { success: false, error: 'Item not in inventory' };
        }

        const item = inventory[itemIndex];

        // Apply effect
        if (item.effect) {
          if (item.effect.type === 'xp') {
            get().addXP(item.effect.amount, 'consumable');
          } else if (item.effect.type === 'shield') {
            const newShields = shieldsRemaining + item.effect.amount;
            set({ shieldsRemaining: newShields });
            // Persist shields to database
            await supabase
              .from('user_module_progress')
              .update({ shields_remaining: newShields })
              .eq('user_id', userId)
              .eq('module_id', 'cosmic_evolution');
          } else if (item.effect.type === 'xp_multiplier') {
            // Store active boost with expiration in store state
            const boostExpiry = new Date(Date.now() + (item.effect.duration * 60 * 60 * 1000));
            const newActiveBoosts = [...activeBoosts, {
              type: 'xp_multiplier',
              amount: item.effect.amount,
              expiresAt: boostExpiry.getTime(),
            }];
            set({ activeBoosts: newActiveBoosts });
            // Persist boost to database
            await supabase
              .from('user_active_boosts')
              .insert({
                user_id: userId,
                boost_type: 'xp_multiplier',
                amount: item.effect.amount,
                expires_at: boostExpiry.toISOString(),
              });
          }
        }

        // Reduce quantity or remove item
        const newInventory = [...inventory];
        if (item.quantity > 1) {
          newInventory[itemIndex] = {
            ...item,
            quantity: item.quantity - 1,
          };
          // Update database
          await supabase
            .from('user_inventory')
            .update({ quantity: item.quantity - 1, updated_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('item_id', itemId);
        } else {
          newInventory.splice(itemIndex, 1);
          // Remove from database
          await supabase
            .from('user_inventory')
            .delete()
            .eq('user_id', userId)
            .eq('item_id', itemId);
        }

        set({ inventory: newInventory });

        return { success: true, effect: item.effect };
      },

      // ============================================
      // ACTIONS: STREAKS
      // ============================================

      /**
       * Update streak for a module
       */
      updateStreak: async (module, success = true) => {
        const { userId, streaks } = get();

        // Skip if userId is null (store not initialized)
        if (!userId) {
          console.warn('[GamificationStore] Skipping streak update - userId not initialized');
          return;
        }

        const streak = streaks.find(s => s.module_id === module);

        if (!streak) {
          // Create new streak
          try {
            const { data: newStreak } = await supabase
              .from('momentum_chains')
              .insert({
                user_id: userId,
                module_id: module,
                chain_type: module,
                current_streak: success ? 1 : 0,
                longest_streak: success ? 1 : 0,
                total_days_active: success ? 1 : 0,
                streak_started_at: success ? new Date().toISOString() : null,
                last_activity_at: new Date().toISOString(),
              })
              .select()
              .single();

            if (newStreak) {
              set({ streaks: [...streaks, newStreak] });
            }
          } catch (error) {
            console.warn('[GamificationStore] Failed to create streak:', error.message);
          }
        } else {
          // Update existing streak
          let newStreakCount = streak.current_streak;
          let shieldsUsed = 0;

          if (success) {
            newStreakCount = streak.current_streak + 1;
          } else {
            // Check for shield
            if (streak.shields_available > 0) {
              shieldsUsed = 1;
              // Streak protected by shield
            } else {
              newStreakCount = 0;
            }
          }

          try {
            await supabase
              .from('momentum_chains')
              .update({
                current_streak: newStreakCount,
                shields_available: Math.max(0, streak.shields_available - shieldsUsed),
                longest_streak: Math.max(streak.longest_streak, newStreakCount),
                updated_at: new Date().toISOString(),
              })
              .eq('id', streak.id);

            // Sync streak to leaderboards (if user has opted in and this is the global streak)
            if (streak.is_global) {
              try {
                const SocialStore = await getSocialStore();
                const socialStore = SocialStore.getState();
                if (socialStore.socialProfile?.show_on_leaderboards) {
                  await socialStore.syncToLeaderboards(get().totalXP, 0, newStreakCount);
                }
              } catch (e) {
                // Silently fail - leaderboard sync is not critical
              }
            }

            // Show streak celebration if global streak was extended (Duolingo-style)
            // Only celebrate the global/daily streak to avoid too many popups
            if (success && newStreakCount > streak.current_streak && streak.is_global) {
              try {
                const NotificationStore = await getNotificationStore();
                const notifStore = NotificationStore.getState();
                notifStore.showStreakCelebration({
                  previousStreak: streak.current_streak,
                  newStreak: newStreakCount,
                  streak: {
                    id: streak.id,
                    name: 'Daily',
                    module: streak.module_id,
                    isGlobal: true,
                  },
                });
              } catch (e) {
                // Silently fail - celebration is not critical
              }
            }

            // Refresh streaks
            get().refreshStreaks();
          } catch (error) {
            console.warn('[GamificationStore] Failed to update streak:', error.message);
          }
        }

        // Recalculate XP multiplier
        get().recalculateXPMultiplier();
      },

      /**
       * Refresh streaks from database
       */
      refreshStreaks: async () => {
        const { userId } = get();

        // Skip if userId is null
        if (!userId) return;

        // Get all streaks (including inactive ones for history)
        const { data: streaks } = await supabase
          .from('momentum_chains')
          .select('*')
          .eq('user_id', userId);

        if (streaks) {
          const globalStreak = streaks.find(s => s.is_global);
          const activeStreaks = streaks.filter(s => s.current_streak > 0);
          set({
            streaks: activeStreaks,
            globalStreak,
            shieldsRemaining: globalStreak?.shields_available || 0,
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
          .maybeSingle();

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
          .select('*')
          .eq('user_id', userId);

        if (progress) {
          const constellations = {
            orion: processConstellationDataSimple(progress, 'orion'),
            phoenix: processConstellationDataSimple(progress, 'phoenix'),
            athena: processConstellationDataSimple(progress, 'athena'),
            chronos: processConstellationDataSimple(progress, 'chronos'),
            plutus: processConstellationDataSimple(progress, 'plutus'),
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

        // Also clean up expired boosts
        get().cleanupExpiredBoosts();
      },

      /**
       * Get current total XP multiplier including active boosts
       */
      getTotalXPMultiplier: () => {
        const { xpMultiplier, activeBoosts } = get();
        const now = Date.now();

        let totalMultiplier = xpMultiplier;

        // Add active boost multipliers
        const validBoosts = activeBoosts.filter(
          boost => boost.type === 'xp_multiplier' && boost.expiresAt > now
        );

        for (const boost of validBoosts) {
          totalMultiplier *= boost.amount;
        }

        return totalMultiplier;
      },

      /**
       * Clean up expired boosts from state and database
       */
      cleanupExpiredBoosts: async () => {
        const { userId, activeBoosts } = get();
        const now = Date.now();

        // Filter out expired boosts
        const validBoosts = activeBoosts.filter(boost => boost.expiresAt > now);

        if (validBoosts.length !== activeBoosts.length) {
          set({ activeBoosts: validBoosts });

          // Also clean from database
          if (userId) {
            await supabase
              .from('user_active_boosts')
              .delete()
              .eq('user_id', userId)
              .lt('expires_at', new Date().toISOString());
          }
        }

        return validBoosts;
      },

      /**
       * Log a gamification event
       */
      logEvent: async (eventType, eventSource, eventData = {}) => {
        const { userId } = get();
        if (!userId) return;

        // Extract XP and credits from eventData for proper column storage
        let xpAwarded = 0;
        let creditsAwarded = 0;

        if (eventType === 'xp_gained' && eventData.amount) {
          xpAwarded = eventData.amount;
        }
        if (eventType === 'credits_earned' && eventData.amount) {
          creditsAwarded = eventData.amount;
        }

        try {
          const { error } = await supabase
            .from('gamification_events')
            .insert({
              user_id: userId,
              event_type: eventType,
              event_source: eventSource,
              event_data: eventData,
              xp_awarded: xpAwarded,
              credits_awarded: creditsAwarded,
              created_at: new Date().toISOString(),
            });

          // Silently ignore RLS errors (403) until migration is applied
          if (error && error.code !== '42501' && !error.message?.includes('policy')) {
            console.warn('[GamificationStore] Event log error:', error.message);
          }
        } catch (err) {
          // Silently fail - event logging is non-critical
        }

        // Update recent events locally regardless of DB success
        const recent = get().recentEvents;
        set({
          recentEvents: [
            { eventType, eventSource, eventData, xpAwarded, creditsAwarded, timestamp: new Date().toISOString() },
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
          xpToNextLevel: 500, // Base XP for level 1 (exponential scaling)
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
        // Persist inventory and active boosts locally (not in Supabase yet)
        inventory: state.inventory,
        activeBoosts: state.activeBoosts,
      }),
    }
  )
);

// ============================================
// EXPORTED HELPER FUNCTIONS
// ============================================

/**
 * Calculate XP needed for a level
 */
export function getXPForLevel(level) {
  return level * 150;
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

// Export initialization function for App.jsx
export const initializeGamificationStore = async (userId = null) => {
  const effectiveUserId = userId || await getCurrentUserId();
  if (!effectiveUserId) return;
  return useGamificationStore.getState().initialize(effectiveUserId);
};

export default useGamificationStore;
