import React from 'react';
import { STAGE_THRESHOLDS } from '../../constants/stageDefinitions';
import styles from './CinematicTransition.module.css';

interface CinematicTransitionProps {
  isActive: boolean;
  stage: number;
  progress: number;
}

export const CinematicTransition: React.FC<CinematicTransitionProps> = ({
  isActive,
  stage,
  progress
}) => {
  if (!isActive) return null;

  const stageData = STAGE_THRESHOLDS[stage - 1];
  if (!stageData) return null;

  const { name, subtitle, themeColors, cosmicAge } = stageData;

  return (
    <div className={styles.cinematicOverlay}>
      {/* Flash of Light (Big Bang moment) */}
      <div
        className={styles.lightBurst}
        style={{
          background: `radial-gradient(circle, ${themeColors.primary} 0%, ${themeColors.secondary} 30%, transparent 70%)`
        }}
      />

      {/* Expanding Energy Rings */}
      <div className={styles.energyRings}>
        <div
          className={styles.energyRing}
          style={{ borderColor: themeColors.primary }}
        />
        <div
          className={styles.energyRing}
          style={{ borderColor: themeColors.secondary, animationDelay: '0.2s' }}
        />
        <div
          className={styles.energyRing}
          style={{ borderColor: themeColors.glow, animationDelay: '0.4s' }}
        />
      </div>

      {/* Particle Explosion */}
      <div className={styles.particleExplosion}>
        {Array.from({ length: 30 }).map((_, i) => {
          const angle = (i / 30) * 360;
          const distance = 100 + Math.random() * 200;
          return (
            <div
              key={i}
              className={styles.explosionParticle}
              style={{
                '--angle': `${angle}deg`,
                '--distance': `${distance}px`,
                '--delay': `${Math.random() * 0.5}s`,
                background: i % 3 === 0 ? themeColors.primary : i % 3 === 1 ? themeColors.secondary : themeColors.glow
              } as React.CSSProperties}
            />
          );
        })}
      </div>

      {/* Cosmic Voiceover Text */}
      <div className={styles.cosmicText}>
        <div className={styles.cosmicAgeLabel}>COSMIC AGE</div>
        <div className={styles.cosmicAge}>{cosmicAge}</div>

        <div className={styles.evolutionDivider}>
          <div
            className={styles.evolutionLine}
            style={{ background: `linear-gradient(90deg, transparent, ${themeColors.glow}, transparent)` }}
          />
          <div className={styles.evolutionIcon}>⚡</div>
          <div
            className={styles.evolutionLine}
            style={{ background: `linear-gradient(90deg, transparent, ${themeColors.glow}, transparent)` }}
          />
        </div>

        <div
          className={styles.stageName}
          style={{
            textShadow: `0 0 40px ${themeColors.glow}, 0 0 80px ${themeColors.primary}`
          }}
        >
          {name}
        </div>

        <div
          className={styles.stageSubtitle}
          style={{ color: themeColors.secondary }}
        >
          {subtitle}
        </div>

        <div className={styles.evolutionProgress}>
          <div
            className={styles.evolutionProgressBar}
            style={{
              width: `${progress * 100}%`,
              background: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.secondary})`
            }}
          />
        </div>

        <div className={styles.philosophyQuote}>
          "{stageData.codex.philosophy}"
        </div>
      </div>

      {/* Camera Zoom Effect Overlay */}
      <div className={styles.zoomOverlay} />

      {/* Vignette Effect */}
      <div className={styles.vignette} />
    </div>
  );
};
