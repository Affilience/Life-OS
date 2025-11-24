/**
 * Type definitions for the cosmic evolution system
 */

export interface CosmicAvatarProps {
  size?: number; // Width/height in pixels
  showProgress?: boolean;
  onEvolution?: (newStage: number) => void;
}

export interface EvolutionState {
  // State
  totalXP: number;
  currentStage: number;
  isTransitioning: boolean;

  // Actions
  addXP: (amount: number) => void;
  setXP: (amount: number) => void;
  reset: () => void;
  completeTransition: () => void;
}
