/**
 * Zustand store for cosmic evolution state management
 * Enhanced with level tracking and milestones
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { XPSystem, type StageProgress } from '../utils/xpCalculations';
import { LevelSystem } from '../engine/LevelSystem';
import type { MilestoneState } from '../types/level.types';

interface EvolutionState {
  // XP and Stage tracking
  totalXP: number;
  currentStage: number;
  currentLevel: number;
  previousLevel: number;

  // Animation states
  isTransitioning: boolean;
  isLevelingUp: boolean;

  // Milestone tracking
  milestones: MilestoneState;

  // Computed (derived state)
  stageProgress: StageProgress;

  // Actions
  addXP: (amount: number) => void;
  setXP: (amount: number) => void;
  reset: () => void;
  completeTransition: () => void;
  completeLevelUp: () => void;
  unlockMilestone: (milestone: keyof MilestoneState) => void;
}

export const useEvolutionStore = create<EvolutionState>()(
  persist(
    (set, get) => ({
      // Initial state
      totalXP: 0,
      currentStage: 1,
      currentLevel: 1,
      previousLevel: 1,
      isTransitioning: false,
      isLevelingUp: false,

      milestones: {
        level10: false,
        level25: false,
        level50: false,
        level75: false,
        level100: false,
        level150: false,
        maxLevel: false
      },

      // Computed property
      get stageProgress() {
        return XPSystem.getStageFromXP(get().totalXP);
      },

      // Actions
      addXP: (amount: number) => {
        const state = get();
        const newXP = state.totalXP + amount;

        // Calculate new level and stage
        const newLevel = LevelSystem.getLevelFromXP(newXP);
        const newStageInfo = LevelSystem.getStageFromLevel(newLevel);
        const newStage = newStageInfo?.stage || 1;

        // Check for level up
        const didLevelUp = newLevel > state.currentLevel;
        const didEvolve = newStage > state.currentStage;

        // Check for milestones
        const milestoneUpdates: Partial<MilestoneState> = {};
        if (newLevel >= 10 && !state.milestones.level10) milestoneUpdates.level10 = true;
        if (newLevel >= 25 && !state.milestones.level25) milestoneUpdates.level25 = true;
        if (newLevel >= 50 && !state.milestones.level50) milestoneUpdates.level50 = true;
        if (newLevel >= 75 && !state.milestones.level75) milestoneUpdates.level75 = true;
        if (newLevel >= 100 && !state.milestones.level100) milestoneUpdates.level100 = true;
        if (newLevel >= 150 && !state.milestones.level150) milestoneUpdates.level150 = true;
        if (newLevel >= 160 && !state.milestones.maxLevel) milestoneUpdates.maxLevel = true;

        set({
          totalXP: newXP,
          currentLevel: newLevel,
          previousLevel: state.currentLevel,
          currentStage: newStage,
          isLevelingUp: didLevelUp,
          isTransitioning: didEvolve,
          milestones: { ...state.milestones, ...milestoneUpdates }
        });

        // Log achievements
        if (didLevelUp) {
          console.log(`📈 LEVEL UP! Level ${newLevel} reached!`);
        }
        if (didEvolve) {
          console.log(`🌟 EVOLUTION! Stage ${newStage} unlocked!`);
        }
        Object.keys(milestoneUpdates).forEach(milestone => {
          console.log(`🏆 MILESTONE UNLOCKED: ${milestone}!`);
        });
      },

      setXP: (amount: number) => {
        const newLevel = LevelSystem.getLevelFromXP(amount);
        const newStageInfo = LevelSystem.getStageFromLevel(newLevel);

        set({
          totalXP: amount,
          currentLevel: newLevel,
          currentStage: newStageInfo?.stage || 1,
          isTransitioning: false,
          isLevelingUp: false
        });
      },

      reset: () => {
        set({
          totalXP: 0,
          currentStage: 1,
          currentLevel: 1,
          previousLevel: 1,
          isTransitioning: false,
          isLevelingUp: false,
          milestones: {
            level10: false,
            level25: false,
            level50: false,
            level75: false,
            level100: false,
            level150: false,
            maxLevel: false
          }
        });
      },

      completeTransition: () => set({ isTransitioning: false }),
      completeLevelUp: () => set({ isLevelingUp: false }),

      unlockMilestone: (milestone: keyof MilestoneState) => {
        set(state => ({
          milestones: { ...state.milestones, [milestone]: true }
        }));
      }
    }),
    {
      name: 'cosmic-evolution-enhanced-storage',
      partialize: (state) => ({
        totalXP: state.totalXP,
        currentStage: state.currentStage,
        currentLevel: state.currentLevel,
        milestones: state.milestones
      })
    }
  )
);
