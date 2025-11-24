/**
 * Custom hook for stage-specific theming
 * Dynamically applies colors based on current cosmic stage
 */

import { useEffect } from 'react';
import { STAGE_THRESHOLDS } from '../constants/stageDefinitions';

export function useStageTheme(stage: number) {
  const stageData = STAGE_THRESHOLDS[stage - 1];

  useEffect(() => {
    if (!stageData) return;

    const { themeColors } = stageData;
    const root = document.documentElement;

    // Apply stage-specific colors to CSS variables
    root.style.setProperty('--stage-primary', themeColors.primary);
    root.style.setProperty('--stage-secondary', themeColors.secondary);
    root.style.setProperty('--stage-glow', themeColors.glow);

    // Update accent colors to match stage
    root.style.setProperty('--accent-main', themeColors.primary);
    root.style.setProperty('--accent-main-soft', `${themeColors.primary}28`);

    // Update glow effects
    root.style.setProperty('--glow-soft', `0 0 40px ${themeColors.glow}70`);
    root.style.setProperty('--glow-aux', `0 0 40px ${themeColors.secondary}60`);

    return () => {
      // Reset to default cosmic theme on unmount
      root.style.removeProperty('--stage-primary');
      root.style.removeProperty('--stage-secondary');
      root.style.removeProperty('--stage-glow');
    };
  }, [stage, stageData]);

  return stageData?.themeColors;
}
