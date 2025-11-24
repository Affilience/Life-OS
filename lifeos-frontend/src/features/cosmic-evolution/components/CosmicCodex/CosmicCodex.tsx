import React from 'react';
import { STAGE_THRESHOLDS } from '../../constants/stageDefinitions';
import styles from './CosmicCodex.module.css';

interface CosmicCodexProps {
  stage: number;
  isOpen: boolean;
  onClose: () => void;
}

export const CosmicCodex: React.FC<CosmicCodexProps> = ({ stage, isOpen, onClose }) => {
  if (!isOpen) return null;

  const stageData = STAGE_THRESHOLDS[stage - 1];
  if (!stageData) return null;

  const { name, subtitle, codex, cosmicAge, comparison, themeColors } = stageData;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        style={{
          borderColor: themeColors.glow,
          boxShadow: `0 0 60px ${themeColors.glow}80, 0 0 100px ${themeColors.glow}40`
        }}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.stageNumber}>STAGE {stage}</div>
          <div className={styles.stageName} style={{ color: themeColors.primary }}>
            {name}
          </div>
          <div className={styles.subtitle} style={{ color: themeColors.secondary }}>
            {subtitle}
          </div>
          <div className={styles.cosmicAge}>{cosmicAge}</div>
        </div>

        {/* Cosmic Comparison */}
        <div
          className={styles.comparison}
          style={{
            background: `linear-gradient(135deg, ${themeColors.primary}15, ${themeColors.secondary}15)`,
            borderLeftColor: themeColors.glow
          }}
        >
          <div className={styles.comparisonIcon}>✨</div>
          <div className={styles.comparisonText}>{comparison}</div>
        </div>

        {/* Codex Entries */}
        <div className={styles.codexEntries}>
          {/* Scientific */}
          <div className={styles.codexEntry}>
            <div className={styles.entryLabel}>
              <span className={styles.entryIcon}>🔬</span>
              COSMIC SCIENCE
            </div>
            <div className={styles.entryContent}>{codex.scientific}</div>
          </div>

          {/* Philosophy */}
          <div className={styles.codexEntry}>
            <div className={styles.entryLabel}>
              <span className={styles.entryIcon}>💭</span>
              PHILOSOPHY
            </div>
            <div className={styles.entryContent}>"{codex.philosophy}"</div>
          </div>

          {/* Your Journey */}
          <div className={styles.codexEntry}>
            <div className={styles.entryLabel}>
              <span className={styles.entryIcon}>🚀</span>
              YOUR JOURNEY
            </div>
            <div className={styles.entryContent}>{codex.yourJourney}</div>
          </div>

          {/* Fun Fact */}
          <div className={styles.codexEntry}>
            <div className={styles.entryLabel}>
              <span className={styles.entryIcon}>🌟</span>
              COSMIC FACT
            </div>
            <div className={styles.entryContent}>{codex.funFact}</div>
          </div>
        </div>

        {/* Close Button */}
        <button
          className={styles.closeButton}
          onClick={onClose}
          style={{
            background: `linear-gradient(135deg, ${themeColors.primary}30, ${themeColors.secondary}30)`,
            borderColor: themeColors.glow
          }}
        >
          Close Codex
        </button>
      </div>
    </div>
  );
};
