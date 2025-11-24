import React from 'react';
import { useEvolutionStore } from '../../stores/evolutionStore';
import { STAGE_THRESHOLDS } from '../../constants/stageDefinitions';
import styles from './ProgressBar.module.css';

export const ProgressBar: React.FC = () => {
  const { stageProgress, totalXP } = useEvolutionStore();
  const currentStageData = STAGE_THRESHOLDS[stageProgress.stage - 1];
  const nextStageData = STAGE_THRESHOLDS[stageProgress.stage];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.currentStage}>{currentStageData?.name}</span>
        {nextStageData && (
          <>
            <span className={styles.arrow}>→</span>
            <span className={styles.nextStage}>{nextStageData.name}</span>
          </>
        )}
      </div>

      <div className={styles.progressBarOuter}>
        <div
          className={styles.progressBarInner}
          style={{
            width: `${stageProgress.progress * 100}%`,
            boxShadow: `0 0 ${10 + stageProgress.progress * 20}px rgba(100, 150, 255, ${stageProgress.progress})`
          }}
        />
      </div>

      <div className={styles.footer}>
        <span>{stageProgress.xpInStage} / {stageProgress.xpNeeded} XP</span>
        <span>Total: {totalXP} XP</span>
      </div>
    </div>
  );
};
