/**
 * useModuleConstellation - Hook to fetch constellation state for a module
 * Reads from existing module stores and calculates XP based on activity
 *
 * NOTE: This hook does NOT modify any existing store state.
 * It only reads data and calculates XP based on user activity.
 */

import { useMemo } from 'react';
import type { ModuleId, ConstellationState } from '../constellations.types';
import { getConstellation } from '../constellations.config';
import { getUnlockedStars } from '../constellations.state';

// Import module stores
import { useJournalStore } from '../../journal/journal.store';
import { useKnowledgeStore } from '../../../stores/knowledgeStore';
import { useHealthStore } from '../../../stores/healthStore';
import { useFinancialStore } from '../../../stores/financialStore';

/**
 * Calculate XP for each module based on current activity
 * These are temporary calculations until proper XP tracking is implemented
 */
function calculateModuleXP(moduleId: ModuleId): number {
  switch (moduleId) {
    case 'journal': {
      const entries = useJournalStore.getState().entries;
      // 50 XP per entry
      return entries.length * 50;
    }

    case 'knowledge': {
      const state = useKnowledgeStore.getState();
      // 30 XP per note, 100 XP per book, 20 XP per media
      return (
        state.notes.length * 30 +
        state.books.length * 100 +
        state.media.length * 20
      );
    }

    case 'health': {
      const meals = useHealthStore.getState().meals;
      // 25 XP per meal logged
      return meals.length * 25;
    }

    case 'finance': {
      const transactions = useFinancialStore.getState().transactions;
      // 15 XP per transaction tracked
      return transactions.length * 15;
    }

    case 'productivity': {
      // Mock XP for productivity (no store exists yet)
      // This can be replaced when productivity store is implemented
      return 0;
    }

    default:
      return 0;
  }
}

interface UseModuleConstellationResult {
  constellation: ReturnType<typeof getConstellation>;
  state: ConstellationState;
  currentXp: number;
}

/**
 * Main hook - Returns constellation config, state, and current XP
 * @param moduleId - The module to get constellation for
 * @returns Constellation configuration, current state, and XP
 */
export function useModuleConstellation(moduleId: ModuleId): UseModuleConstellationResult {
  // Get constellation configuration
  const constellation = useMemo(() => getConstellation(moduleId), [moduleId]);

  // Calculate current XP based on module activity
  const currentXp = useMemo(() => calculateModuleXP(moduleId), [moduleId]);

  // Calculate which stars are unlocked
  const state = useMemo(() => {
    return getUnlockedStars(constellation, currentXp);
  }, [constellation, currentXp]);

  return {
    constellation,
    state,
    currentXp
  };
}

/**
 * Hook variant that accepts manual XP override (for demos/testing)
 * @param moduleId - The module to get constellation for
 * @param overrideXp - Manual XP value to use instead of calculated
 */
export function useModuleConstellationWithXP(
  moduleId: ModuleId,
  overrideXp?: number
): UseModuleConstellationResult {
  const constellation = useMemo(() => getConstellation(moduleId), [moduleId]);

  const currentXp = useMemo(() => {
    return overrideXp !== undefined ? overrideXp : calculateModuleXP(moduleId);
  }, [moduleId, overrideXp]);

  const state = useMemo(() => {
    return getUnlockedStars(constellation, currentXp);
  }, [constellation, currentXp]);

  return {
    constellation,
    state,
    currentXp
  };
}
