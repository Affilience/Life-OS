/**
 * Boss Battle Store
 * Manages PvE boss battle state and Supabase sync
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { DEV_USER_ID, isDevMode } from '../lib/dev-auth';
import { BOSS_DATABASE, calculatePlayerStats, getBossForLevel } from '../data/bossDatabase';
import { EQUIPMENT_DATABASE } from '../data/equipmentDatabase';
import { getWeaponAttack, calculateAttackDamage, rollCritical, WEAPON_ATTACKS } from '../data/weaponAttacks';
import { triggerGamification } from '../hooks/useGamification';
import { useGamificationStore } from './gamificationStore';
import { feedback, haptics, sounds } from '../services/microInteractions';

// Helper to get current user ID - checks store first, then falls back to auth with timeout
const getCurrentUserId = async (timeoutMs = 3000) => {
  if (isDevMode()) {
    return DEV_USER_ID;
  }

  // Check if userId is already stored (set during initialization)
  const storedUserId = useBossStore.getState().currentUserId;
  if (storedUserId) {
    return storedUserId;
  }

  try {
    // Fallback: fetch from auth with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Auth timeout')), timeoutMs)
    );
    const authPromise = supabase.auth.getUser();
    const { data: { user } } = await Promise.race([authPromise, timeoutPromise]);
    return user?.id || null;
  } catch (error) {
    console.warn('[BossStore] getCurrentUserId error:', error.message);
    return null;
  }
};

const initialState = {
  // Current user ID (cached to avoid auth calls)
  currentUserId: null,

  // Current battle state
  currentBattle: null,
  isBattleActive: false,
  isEndingBattle: false, // Prevents race conditions during battle end

  // Weapon attack state
  weaponAttack: null, // Current weapon attack data
  lastAttackTime: 0, // Timestamp of last attack for cooldown
  attackCooldownRemaining: 0, // Ms remaining until can attack again
  lastAttackResult: null, // { damage, isCrit, attackName } for UI display

  // Battle history
  recentBattles: [],

  // Player stats for current battle
  playerStats: null,

  // Aggregated stats
  battleStats: {
    totalBattles: 0,
    victories: 0,
    defeats: 0,
    totalDamageDealt: 0,
    totalTaps: 0,
    totalCrits: 0,
    bossVictories: {},
    fastestVictory: null,
    highestDamage: 0,
    highestSingleHit: 0,
  },

  // UI state
  isLoading: false,
  error: null,

  // Battle timer
  battleStartTime: null,
  lastDamageTime: null,
};

export const useBossStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // INITIALIZATION
      // ============================================

      initializeFromSupabase: async (passedUserId = null) => {
        // Use passed userId if available, otherwise try to fetch
        const userId = passedUserId || await getCurrentUserId();
        if (!userId) {
          console.log('[BossStore] No user ID, skipping initialization');
          return;
        }

        // Store userId so sub-functions can use it without calling auth
        set({ currentUserId: userId, isLoading: true });

        // Master timeout - ensure loading is set to false even if queries hang
        const INIT_TIMEOUT_MS = 15000;
        let timedOut = false;
        const timeoutId = setTimeout(() => {
          timedOut = true;
          set({ isLoading: false });
        }, INIT_TIMEOUT_MS);

        // Helper to wrap queries with timeout
        const withTimeout = async (queryFn, timeoutMs = 10000) => {
          try {
            return await Promise.race([
              queryFn(),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('timeout')), timeoutMs)
              )
            ]);
          } catch (e) {
            return { data: null, error: e.message };
          }
        };

        try {
          // Run all queries in parallel
          const [
            { data: stats },
            { data: activeBattle },
            { data: recentBattles }
          ] = await Promise.all([
            withTimeout(() => supabase
              .from('boss_battle_stats')
              .select('*')
              .eq('user_id', userId)
              .maybeSingle()),
            withTimeout(() => supabase
              .from('boss_battles')
              .select('*')
              .eq('user_id', userId)
              .eq('status', 'active')
              .maybeSingle()),
            withTimeout(() => supabase
              .from('boss_battles')
              .select('*')
              .eq('user_id', userId)
              .neq('status', 'active')
              .order('ended_at', { ascending: false })
              .limit(10))
          ]);

          if (stats) {
            set({
              battleStats: {
                totalBattles: stats.total_battles || 0,
                victories: stats.victories || 0,
                defeats: stats.defeats || 0,
                totalDamageDealt: stats.total_damage_dealt || 0,
                totalTaps: stats.total_taps || 0,
                totalCrits: stats.total_crits || 0,
                bossVictories: stats.boss_victories || {},
                fastestVictory: stats.fastest_victory_seconds,
                highestDamage: stats.highest_damage_single_battle || 0,
                highestCombo: stats.highest_combo || 0,
              },
            });
          }

          if (activeBattle) {
            const boss = BOSS_DATABASE[activeBattle.boss_id];
            set({
              currentBattle: {
                id: activeBattle.id,
                boss,
                bossCurrentHealth: activeBattle.boss_current_health,
                bossMaxHealth: activeBattle.boss_max_health,
                playerCurrentHealth: activeBattle.player_current_health,
                playerMaxHealth: activeBattle.player_max_health,
                playerDamage: activeBattle.player_damage,
                totalDamageDealt: activeBattle.total_damage_dealt,
                totalDamageTaken: activeBattle.total_damage_taken,
                tapCount: activeBattle.tap_count,
                startedAt: activeBattle.started_at,
              },
              isBattleActive: true,
              battleStartTime: new Date(activeBattle.started_at).getTime(),
            });
          }

          if (recentBattles) {
            set({
              recentBattles: recentBattles.map(b => ({
                ...b,
                boss: BOSS_DATABASE[b.boss_id],
              })),
            });
          }

          console.log('[BossStore] ✅ Initialized');
        } catch (error) {
          console.error('Error loading boss battle data:', error);
          set({ error: error.message });
        } finally {
          clearTimeout(timeoutId);
          // Always set loading to false (unless timeout already did it)
          if (!timedOut) {
            set({ isLoading: false });
          }
        }
      },

      // ============================================
      // START BATTLE
      // ============================================

      startBattle: async (bossId, playerLevel, equippedItems = {}, activePet = null) => {
        const userId = await getCurrentUserId();
        if (!userId) return { error: 'Not authenticated' };

        const { isBattleActive } = get();
        if (isBattleActive) return { error: 'Battle already in progress' };

        const boss = BOSS_DATABASE[bossId];
        if (!boss) return { error: 'Invalid boss' };

        // Calculate player stats
        const playerStats = calculatePlayerStats(playerLevel, equippedItems, activePet, EQUIPMENT_DATABASE);

        // Get weapon attack data based on equipped weapon
        const equippedWeapon = equippedItems.mainHand;
        const weaponAttack = getWeaponAttack(equippedWeapon, EQUIPMENT_DATABASE);

        // Apply boss difficulty scaling
        const { BOSS_DIFFICULTY } = await import('../data/bossDatabase');
        const difficultyMultiplier = BOSS_DIFFICULTY[boss.difficulty]?.multiplier || 1.0;
        const scaledHealth = Math.floor(boss.health * difficultyMultiplier);
        const scaledDamage = Math.floor(boss.damage * difficultyMultiplier);

        const battleData = {
          user_id: userId,
          boss_id: boss.id,
          boss_name: boss.name,
          boss_level_min: boss.levelRange[0],
          boss_level_max: boss.levelRange[1],
          boss_max_health: scaledHealth,
          boss_current_health: scaledHealth,
          boss_damage: scaledDamage,
          player_max_health: playerStats.maxHealth,
          player_current_health: playerStats.maxHealth,
          player_damage: playerStats.damage,
          status: 'active',
        };

        try {
          const { data, error } = await supabase
            .from('boss_battles')
            .insert(battleData)
            .select()
            .single();

          if (error) throw error;

          const battleStartTime = Date.now();

          set({
            currentBattle: {
              id: data.id,
              boss,
              bossCurrentHealth: scaledHealth,
              bossMaxHealth: scaledHealth,
              bossDamage: scaledDamage,
              playerCurrentHealth: playerStats.maxHealth,
              playerMaxHealth: playerStats.maxHealth,
              playerDamage: playerStats.damage,
              totalDamageDealt: 0,
              totalDamageTaken: 0,
              tapCount: 0,
              critCount: 0,
              startedAt: data.started_at,
            },
            playerStats,
            weaponAttack, // Store weapon attack data for cooldowns
            lastAttackTime: 0, // Reset attack cooldown
            attackCooldownRemaining: 0,
            lastAttackResult: null,
            isBattleActive: true,
            battleStartTime,
            lastDamageTime: battleStartTime,
          });

          // Play battle start sound
          sounds.battleStart();
          haptics.notification('success');

          return { success: true, battle: data, weaponAttack };
        } catch (error) {
          console.error('Error starting battle:', error);
          return { error: error.message };
        }
      },

      // ============================================
      // PLAYER ATTACK (TAP)
      // ============================================

      playerAttack: () => {
        const { currentBattle, isBattleActive, weaponAttack, lastAttackTime, playerStats } = get();
        if (!isBattleActive || !currentBattle) return { blocked: true, reason: 'no_battle' };

        const now = Date.now();
        const weapon = weaponAttack || WEAPON_ATTACKS.unarmed;

        // Apply cooldown reduction from Intelligence
        const cooldownReduction = playerStats?.cooldownReduction || 0;
        const effectiveCooldown = Math.floor(weapon.cooldown * (1 - cooldownReduction));
        const cooldownRemaining = Math.max(0, (lastAttackTime + effectiveCooldown) - now);

        // Check cooldown
        if (cooldownRemaining > 0) {
          return { blocked: true, reason: 'cooldown', remaining: cooldownRemaining };
        }

        // Roll for critical hit (add player's crit bonus from Intelligence)
        const playerCritBonus = playerStats?.critChance ? (playerStats.critChance - 0.05) : 0; // Subtract base 5%
        const isCrit = rollCritical(weapon, playerCritBonus);

        // Calculate damage with weapon multiplier
        const baseDamage = currentBattle.playerDamage;
        const damage = calculateAttackDamage(baseDamage, weapon, isCrit);
        const newBossHealth = Math.max(0, currentBattle.bossCurrentHealth - damage);

        // Play appropriate sound based on weapon and crit
        if (isCrit) {
          haptics.notification('success');
          sounds.criticalHit();
        } else {
          haptics.impact(weapon.damageMultiplier > 1.5 ? 'heavy' : 'light');
          sounds.attackHit();
        }

        set(state => ({
          currentBattle: {
            ...state.currentBattle,
            bossCurrentHealth: newBossHealth,
            totalDamageDealt: state.currentBattle.totalDamageDealt + damage,
            tapCount: state.currentBattle.tapCount + 1,
            critCount: (state.currentBattle.critCount || 0) + (isCrit ? 1 : 0),
          },
          lastAttackTime: now,
          attackCooldownRemaining: weapon.cooldown,
          lastAttackResult: {
            damage,
            isCrit,
            attackName: weapon.attackName,
            animation: weapon.animation,
            color: weapon.color,
            trailColor: weapon.trailColor,
          },
        }));

        // Note: endBattle is called by the BossBattleArena component
        // when it detects health <= 0 to avoid race conditions
        return { success: true, damage, isCrit, weapon };
      },

      // Check if player can attack (cooldown ready)
      canAttack: () => {
        const { weaponAttack, lastAttackTime, isBattleActive, playerStats } = get();
        if (!isBattleActive) return false;
        const weapon = weaponAttack || WEAPON_ATTACKS.unarmed;
        const cooldownReduction = playerStats?.cooldownReduction || 0;
        const effectiveCooldown = Math.floor(weapon.cooldown * (1 - cooldownReduction));
        return Date.now() >= lastAttackTime + effectiveCooldown;
      },

      // Get current cooldown progress (0-1)
      getCooldownProgress: () => {
        const { weaponAttack, lastAttackTime, playerStats } = get();
        const weapon = weaponAttack || WEAPON_ATTACKS.unarmed;
        const cooldownReduction = playerStats?.cooldownReduction || 0;
        const effectiveCooldown = Math.floor(weapon.cooldown * (1 - cooldownReduction));
        const elapsed = Date.now() - lastAttackTime;
        return Math.min(1, elapsed / effectiveCooldown);
      },

      // ============================================
      // BOSS ATTACK (Called periodically)
      // ============================================

      bossAttack: () => {
        const { currentBattle, isBattleActive } = get();
        if (!isBattleActive || !currentBattle) return;

        const damage = currentBattle.boss.damage;
        const newPlayerHealth = Math.max(0, currentBattle.playerCurrentHealth - damage);

        set(state => ({
          currentBattle: {
            ...state.currentBattle,
            playerCurrentHealth: newPlayerHealth,
            totalDamageTaken: state.currentBattle.totalDamageTaken + damage,
          },
          lastDamageTime: Date.now(),
        }));

        // Note: endBattle is called by the BossBattleArena component
        // when it detects health <= 0 to avoid race conditions
      },

      // ============================================
      // END BATTLE
      // ============================================

      endBattle: async (status) => {
        const { currentBattle, battleStartTime, battleStats, isEndingBattle, playerStats } = get();

        // Prevent concurrent calls - if already ending, return early
        if (isEndingBattle || !currentBattle) {
          console.log('endBattle: Already ending or no battle, skipping');
          return { alreadyEnding: true };
        }

        // Mark as ending immediately to prevent race conditions
        set({ isEndingBattle: true });

        const userId = await getCurrentUserId();
        if (!userId) {
          set({ isEndingBattle: false });
          return { error: 'No user' };
        }

        const battleDuration = Math.floor((Date.now() - battleStartTime) / 1000);
        const isVictory = status === 'victory';

        // Update battle in Supabase
        try {
          await supabase
            .from('boss_battles')
            .update({
              status,
              boss_current_health: currentBattle.bossCurrentHealth,
              player_current_health: currentBattle.playerCurrentHealth,
              total_damage_dealt: currentBattle.totalDamageDealt,
              total_damage_taken: currentBattle.totalDamageTaken,
              tap_count: currentBattle.tapCount,
              xp_reward: isVictory ? currentBattle.boss.xpReward : 0,
              credits_reward: isVictory ? currentBattle.boss.creditsReward : 0,
              ended_at: new Date().toISOString(),
            })
            .eq('id', currentBattle.id);

          // Update battle stats
          const newBossVictories = { ...battleStats.bossVictories };
          if (isVictory) {
            newBossVictories[currentBattle.boss.id] = (newBossVictories[currentBattle.boss.id] || 0) + 1;
          }

          const newStats = {
            totalBattles: battleStats.totalBattles + 1,
            victories: battleStats.victories + (isVictory ? 1 : 0),
            defeats: battleStats.defeats + (isVictory ? 0 : 1),
            totalDamageDealt: battleStats.totalDamageDealt + currentBattle.totalDamageDealt,
            totalTaps: battleStats.totalTaps + currentBattle.tapCount,
            totalCrits: (battleStats.totalCrits || 0) + (currentBattle.critCount || 0),
            bossVictories: newBossVictories,
            fastestVictory: isVictory
              ? (battleStats.fastestVictory
                ? Math.min(battleStats.fastestVictory, battleDuration)
                : battleDuration)
              : battleStats.fastestVictory,
            highestDamage: Math.max(battleStats.highestDamage, currentBattle.totalDamageDealt),
          };

          // Upsert stats to Supabase
          const { error: statsError } = await supabase
            .from('boss_battle_stats')
            .upsert({
              user_id: userId,
              total_battles: newStats.totalBattles,
              victories: newStats.victories,
              defeats: newStats.defeats,
              total_damage_dealt: newStats.totalDamageDealt,
              total_taps: newStats.totalTaps,
              boss_victories: newStats.bossVictories,
              fastest_victory_seconds: newStats.fastestVictory,
              highest_damage_single_battle: newStats.highestDamage,
              last_battle_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id',
            });

          if (statsError) {
            console.error('Error upserting battle stats:', statsError);
          }

          // Award XP and credits on victory
          if (isVictory) {
            feedback.levelUp();
            // Apply Wisdom XP multiplier from playerStats
            const xpMultiplier = playerStats?.xpMultiplier || 1;
            const baseXp = currentBattle.boss.xpReward;
            const bonusXp = Math.floor(baseXp * (xpMultiplier - 1));
            const totalXp = baseXp + bonusXp;

            // Award XP via gamification system
            triggerGamification('bossDefeated', {
              xpOverride: totalXp,
              module: 'productivity',
              questName: `Defeated ${currentBattle.boss.name}`,
              creditsReward: currentBattle.boss.creditsReward,
            });

            // Award cosmic credits
            const creditsReward = currentBattle.boss.creditsReward;
            if (creditsReward > 0) {
              const gamificationStore = useGamificationStore.getState();
              await gamificationStore.addCredits(creditsReward, 'boss_defeat');
              console.log(`[BossStore] Awarded ${creditsReward} cosmic credits for defeating ${currentBattle.boss.name}`);
            }
          }

          // Add to recent battles
          const xpMultiplier = playerStats?.xpMultiplier || 1;
          const finalXpReward = Math.floor(currentBattle.boss.xpReward * xpMultiplier);

          const completedBattle = {
            ...currentBattle,
            status,
            battleDuration,
            endedAt: new Date().toISOString(),
            xpMultiplier, // Store for display
          };

          set({
            currentBattle: null,
            isBattleActive: false,
            isEndingBattle: false,
            battleStats: newStats,
            battleStartTime: null,
            lastDamageTime: null,
            recentBattles: [completedBattle, ...get().recentBattles].slice(0, 10),
          });

          return { success: true, isVictory, rewards: isVictory ? {
            xp: finalXpReward,
            baseXp: currentBattle.boss.xpReward,
            xpMultiplier,
            credits: currentBattle.boss.creditsReward,
          } : null };
        } catch (error) {
          console.error('Error ending battle:', error);
          // Reset the ending flag on error so user can retry
          set({ isEndingBattle: false });
          return { error: error.message };
        }
      },

      // ============================================
      // ABANDON BATTLE
      // ============================================

      abandonBattle: async () => {
        const { currentBattle } = get();
        if (!currentBattle) {
          // Still reset flags even if no battle to ensure clean state
          set({ isBattleActive: false, isEndingBattle: false });
          return { success: true, noBattle: true };
        }

        try {
          await supabase
            .from('boss_battles')
            .update({
              status: 'abandoned',
              ended_at: new Date().toISOString(),
            })
            .eq('id', currentBattle.id);

          set({
            currentBattle: null,
            isBattleActive: false,
            isEndingBattle: false,
            battleStartTime: null,
            lastDamageTime: null,
          });

          return { success: true };
        } catch (error) {
          console.error('Error abandoning battle:', error);
          // Reset flags even on error to prevent stuck state
          set({ isBattleActive: false, isEndingBattle: false });
          return { error: error.message };
        }
      },

      // ============================================
      // UTILITIES
      // ============================================

      getRecommendedBoss: (playerLevel) => {
        return getBossForLevel(playerLevel);
      },

      getBossById: (bossId) => {
        return BOSS_DATABASE[bossId];
      },

      getAllBosses: () => {
        return Object.values(BOSS_DATABASE);
      },

      getDefeatedBosses: () => {
        const { battleStats } = get();
        return Object.keys(battleStats.bossVictories);
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'lifeos-boss-battles',
      partialize: (state) => ({
        battleStats: state.battleStats,
        recentBattles: state.recentBattles,
      }),
    }
  )
);

// Initialize function for app startup - accepts userId to avoid race conditions
export const initializeBossStore = async (userId = null) => {
  await useBossStore.getState().initializeFromSupabase(userId);
};

export default useBossStore;
