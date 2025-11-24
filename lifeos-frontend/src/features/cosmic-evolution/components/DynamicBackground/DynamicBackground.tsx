import React, { useMemo } from 'react';
import { STAGE_THRESHOLDS } from '../../constants/stageDefinitions';
import styles from './DynamicBackground.module.css';

interface DynamicBackgroundProps {
  stage: number;
  level: number;
}

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ stage, level }) => {
  const backgroundData = useMemo(() => {
    const stageData = STAGE_THRESHOLDS[stage - 1];
    if (!stageData) return null;

    // Different background layers based on stage progression
    const getBackgroundType = () => {
      if (stage <= 3) return 'quantum-void';      // Stages 1-3: Primordial quantum foam
      if (stage <= 6) return 'distant-stars';      // Stages 4-6: Stars emerge
      if (stage <= 9) return 'nebula-clouds';      // Stages 7-9: Nebular formation
      if (stage <= 12) return 'dense-starfield';   // Stages 10-12: Stellar density
      return 'cosmic-tapestry';                    // Stages 13-15: Full galactic glory
    };

    return {
      type: getBackgroundType(),
      colors: stageData.themeColors,
      stage,
      level
    };
  }, [stage, level]);

  if (!backgroundData) return null;

  const { type, colors } = backgroundData;

  return (
    <div className={styles.backgroundContainer}>
      {/* Quantum Void (Stages 1-3) */}
      {type === 'quantum-void' && (
        <div className={styles.quantumVoid}>
          <div
            className={styles.quantumFoam}
            style={{
              background: `radial-gradient(circle at 20% 30%, ${colors.primary}20, transparent 40%),
                           radial-gradient(circle at 80% 70%, ${colors.secondary}15, transparent 40%),
                           #000000`
            }}
          />
          <div className={styles.quantumFluctuations} />
        </div>
      )}

      {/* Distant Stars (Stages 4-6) */}
      {type === 'distant-stars' && (
        <div className={styles.distantStars}>
          <div
            className={styles.deepSpace}
            style={{
              background: `radial-gradient(ellipse at 30% 20%, ${colors.primary}10, transparent 60%),
                           radial-gradient(ellipse at 70% 80%, ${colors.glow}08, transparent 60%),
                           #000510`
            }}
          />
          <div className={styles.starField}>
            {Array.from({ length: 100 }).map((_, i) => (
              <div
                key={i}
                className={styles.star}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  opacity: Math.random() * 0.5 + 0.3
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Nebula Clouds (Stages 7-9) */}
      {type === 'nebula-clouds' && (
        <div className={styles.nebulaClouds}>
          <div
            className={styles.nebulaBase}
            style={{
              background: `radial-gradient(ellipse at 40% 40%, ${colors.primary}25, transparent 70%),
                           radial-gradient(ellipse at 60% 60%, ${colors.secondary}20, transparent 70%),
                           radial-gradient(circle at 20% 80%, ${colors.glow}15, transparent 60%),
                           #000818`
            }}
          />
          <div className={styles.nebulaCloudsLayer} style={{ '--nebula-color': colors.primary } as React.CSSProperties} />
          <div className={styles.nebulaCloudsLayer} style={{ '--nebula-color': colors.secondary, animationDelay: '-5s' } as React.CSSProperties} />
        </div>
      )}

      {/* Dense Starfield (Stages 10-12) */}
      {type === 'dense-starfield' && (
        <div className={styles.denseStarfield}>
          <div
            className={styles.stellarBackground}
            style={{
              background: `radial-gradient(circle at 50% 50%, ${colors.primary}30, transparent 70%),
                           radial-gradient(ellipse at 20% 30%, ${colors.secondary}20, transparent 60%),
                           radial-gradient(ellipse at 80% 70%, ${colors.glow}25, transparent 60%),
                           #0a0820`
            }}
          />
          <div className={styles.denseStars}>
            {Array.from({ length: 200 }).map((_, i) => (
              <div
                key={i}
                className={styles.denseStar}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 4}s`,
                  fontSize: `${Math.random() * 2 + 1}px`
                }}
              />
            ))}
          </div>
          {/* Distant galaxies */}
          <div className={styles.distantGalaxies}>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={styles.distantGalaxy}
                style={{
                  left: `${Math.random() * 80 + 10}%`,
                  top: `${Math.random() * 80 + 10}%`,
                  opacity: Math.random() * 0.3 + 0.1
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Cosmic Tapestry (Stages 13-15) */}
      {type === 'cosmic-tapestry' && (
        <div className={styles.cosmicTapestry}>
          <div
            className={styles.universalBackground}
            style={{
              background: `radial-gradient(circle at 50% 50%, ${colors.primary}35, transparent 65%),
                           radial-gradient(ellipse at 25% 25%, ${colors.secondary}25, transparent 55%),
                           radial-gradient(ellipse at 75% 75%, ${colors.glow}30, transparent 60%),
                           radial-gradient(circle at 10% 90%, ${colors.primary}20, transparent 50%),
                           #0d0a28`
            }}
          />
          <div className={styles.galaxyField}>
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className={styles.galaxySpiral}
                style={{
                  left: `${Math.random() * 90 + 5}%`,
                  top: `${Math.random() * 90 + 5}%`,
                  transform: `rotate(${Math.random() * 360}deg) scale(${Math.random() * 0.5 + 0.8})`,
                  animationDelay: `${Math.random() * 10}s`,
                  opacity: Math.random() * 0.4 + 0.2
                }}
              />
            ))}
          </div>
          <div className={styles.cosmicWisps} />
        </div>
      )}

      {/* Ambient cosmic particles (all stages) */}
      <div className={styles.ambientParticles}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={styles.cosmicParticle}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 20 + 15}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};
