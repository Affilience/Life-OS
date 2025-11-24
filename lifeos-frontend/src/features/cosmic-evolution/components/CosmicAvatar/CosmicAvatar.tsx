import React, { useEffect, useState, useMemo } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';
import { useEvolutionStore } from '../../stores/evolutionStore';
import { StageConfigs } from '../../engine/StageConfigs';
import { LevelVariations } from '../../engine/LevelVariations';
import { LevelSystem } from '../../engine/LevelSystem';
import { STAGE_THRESHOLDS } from '../../constants/stageDefinitions';
import { STAGE_RENDERER_CONFIG } from '../../config/StageRendererConfig';
import { getCurrentTitle } from '../../constants/achievementTitles';
import { useStageTheme } from '../../hooks/useStageTheme';
import { CanvasRenderer } from '../CanvasRenderer/CanvasRenderer';
import { CosmicCodex } from '../CosmicCodex';
import { CinematicTransition } from '../CinematicTransition';
import styles from './CosmicAvatar.module.css';

interface CosmicAvatarProps {
  size?: number;
  showProgress?: boolean;
  showLevelInfo?: boolean;
  onEvolution?: (newStage: number) => void;
  onLevelUp?: (newLevel: number) => void;
  onMilestone?: (milestone: string) => void;
}

export const CosmicAvatar: React.FC<CosmicAvatarProps> = ({
  size = 400,
  showProgress = true,
  showLevelInfo = true,
  onEvolution,
  onLevelUp,
  onMilestone
}) => {
  const {
    currentStage,
    currentLevel,
    previousLevel,
    isTransitioning,
    isLevelingUp,
    totalXP,
    milestones,
    completeTransition,
    completeLevelUp
  } = useEvolutionStore();

  const [init, setInit] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [showLevelUpEffect, setShowLevelUpEffect] = useState(false);
  const [showMilestoneEffect, setShowMilestoneEffect] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [showCodex, setShowCodex] = useState(false);
  const [codexStage, setCodexStage] = useState(1);

  // Apply stage-specific theming
  useStageTheme(currentStage);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Initialize tsParticles engine
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  // Get level data
  const levelData = useMemo(() =>
    LevelSystem.getLevelData(currentLevel),
    [currentLevel]
  );

  // Handle stage evolution animation
  useEffect(() => {
    if (isTransitioning) {
      let startTime: number | null = null;
      const duration = 2000;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        setAnimationProgress(progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          completeTransition();
          setAnimationProgress(0);
          if (onEvolution) onEvolution(currentStage);

          // Show Cosmic Codex after evolution
          setCodexStage(currentStage);
          setTimeout(() => setShowCodex(true), 500);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isTransitioning, currentStage, completeTransition, onEvolution]);

  // Handle level up animation
  useEffect(() => {
    if (isLevelingUp) {
      setShowLevelUpEffect(true);

      const timer = setTimeout(() => {
        setShowLevelUpEffect(false);
        completeLevelUp();
        if (onLevelUp) onLevelUp(currentLevel);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isLevelingUp, currentLevel, completeLevelUp, onLevelUp]);

  // Check for milestone animations
  useEffect(() => {
    const checkMilestones = () => {
      if (currentLevel === 10 && milestones.level10 && !showMilestoneEffect) {
        triggerMilestone('Level 10 Pioneer');
      } else if (currentLevel === 25 && milestones.level25 && !showMilestoneEffect) {
        triggerMilestone('Quarter Century');
      } else if (currentLevel === 50 && milestones.level50 && !showMilestoneEffect) {
        triggerMilestone('Halfway There');
      } else if (currentLevel === 100 && milestones.level100 && !showMilestoneEffect) {
        triggerMilestone('Centurion');
      } else if (currentLevel === 160 && milestones.maxLevel && !showMilestoneEffect) {
        triggerMilestone('Master of the Cosmos');
      }
    };

    checkMilestones();
  }, [currentLevel, milestones, showMilestoneEffect]);

  const triggerMilestone = (milestoneName: string) => {
    setShowMilestoneEffect(milestoneName);
    if (onMilestone) onMilestone(milestoneName);

    setTimeout(() => {
      setShowMilestoneEffect(null);
    }, 3000);
  };

  // Get particle configuration with level variations
  const particleConfig: ISourceOptions = useMemo(() => {
    const baseConfig = StageConfigs[currentStage] || StageConfigs[1];
    const config = LevelVariations.applyLevelVariations(baseConfig, currentLevel);

    // Reduce animation if user prefers reduced motion
    if (prefersReducedMotion) {
      return {
        ...config,
        fpsLimit: 30, // Lower FPS for reduced motion
        particles: {
          ...config.particles,
          move: {
            ...config.particles?.move,
            enable: false // Disable particle movement
          }
        },
        detectRetina: true
      };
    }

    return {
      ...config,
      fpsLimit: 60,
      detectRetina: true
    };
  }, [currentStage, currentLevel, prefersReducedMotion]);

  // Calculate XP progress for current level
  const levelXPProgress = useMemo(() => {
    const currentLevelXP = LevelSystem.getXPForLevel(currentLevel);
    const nextLevelXP = LevelSystem.getXPForLevel(currentLevel + 1);
    const xpInLevel = totalXP - currentLevelXP;
    const xpNeeded = nextLevelXP - currentLevelXP;
    return Math.min(Math.max(xpInLevel / xpNeeded, 0), 1);
  }, [totalXP, currentLevel]);

  // Get stage rendering configuration
  const stageConfig = STAGE_RENDERER_CONFIG[currentStage] || STAGE_RENDERER_CONFIG[1];

  if (!init) {
    return <div className={styles.avatarContainer} style={{ width: size, height: size }} />;
  }

  return (
    <div className={styles.avatarContainer} style={{
      width: size,
      height: size,
      filter: `brightness(${stageConfig.bloomIntensity || 1})`
    }}>
      {/* Conditional rendering: Canvas or Particles based on stage */}
      {stageConfig.type === 'canvas' && stageConfig.canvasRenderer ? (
        <CanvasRenderer
          width={size}
          height={size}
          renderer={stageConfig.canvasRenderer}
          levelData={levelData}
          className={styles.particleCanvas}
        />
      ) : (
        <Particles
          id={`cosmic-avatar-${currentLevel}`}
          options={particleConfig}
          className={styles.particleCanvas}
          style={{
            filter: `
              blur(${isTransitioning ? 2 : 0}px)
              brightness(${1 + levelData.glowIntensity * 0.3})
              contrast(${1 + levelData.stageProgress * 0.2})
              saturate(${1 + levelData.stageProgress * 0.3})
            `
          }}
        />
      )}

      {/* Aura effect for higher levels within stage */}
      {levelData.hasAura && (
        <div
          className={styles.auraEffect}
          style={{
            boxShadow: `
              0 0 ${20 + levelData.glowIntensity * 30}px ${LevelVariations.getAuraColor(levelData.stage)}80,
              inset 0 0 ${10 + levelData.glowIntensity * 20}px ${LevelVariations.getAuraColor(levelData.stage)}40
            `
          }}
        />
      )}

      {/* Progress Display */}
      {showProgress && (
        <div className={styles.progressOverlay}>
          <div className={styles.levelHeader}>
            <div className={styles.levelBadge}>
              <span className={styles.levelNumber}>Lv.{currentLevel}</span>
              {levelData.stageProgress > 0 && (
                <span className={styles.levelStars}>
                  {levelData.stageProgress >= 0.25 && '⭐'}
                  {levelData.stageProgress >= 0.5 && '⭐'}
                  {levelData.stageProgress >= 0.75 && '⭐'}
                  {levelData.stageProgress >= 0.95 && '⭐'}
                </span>
              )}
            </div>
            <div className={styles.stageInfo}>
              <div className={styles.stageName}>
                {STAGE_THRESHOLDS[currentStage - 1]?.name || "Unknown"}
              </div>
              <div className={styles.stageSubtitle}>
                {STAGE_THRESHOLDS[currentStage - 1]?.subtitle || ""}
              </div>
              <div className={styles.stageSubtext}>
                Stage {currentStage}/15 • {Math.floor(levelData.stageProgress * 100)}% Complete
              </div>
              {getCurrentTitle(currentLevel) && (
                <div className={styles.achievementTitle}>
                  {getCurrentTitle(currentLevel)?.icon} {getCurrentTitle(currentLevel)?.title}
                </div>
              )}
            </div>
          </div>

          <div className={styles.xpBarContainer}>
            <div className={styles.xpBar}>
              <div
                className={styles.xpBarFill}
                style={{
                  width: `${levelXPProgress * 100}%`,
                  background: `linear-gradient(90deg, ${getProgressColor(currentStage, 0)}, ${getProgressColor(currentStage, levelData.stageProgress)})`
                }}
              />
              {levelData.hasSparkles && (
                <div className={styles.xpBarSparkles} />
              )}
            </div>
            <div className={styles.xpText}>
              {Math.floor(totalXP)} XP
            </div>
          </div>

          {/* Level-specific enhancements indicator */}
          {showLevelInfo && (
            <div className={styles.enhancementsRow}>
              <span className={styles.enhancement}>
                {levelData.particleCount} particles
              </span>
              {levelData.hasAura && <span className={styles.enhancement}>✨ Aura</span>}
              {levelData.hasPulse && <span className={styles.enhancement}>💫 Pulse</span>}
              {levelData.hasTrails && <span className={styles.enhancement}>🌠 Trails</span>}
              {levelData.hasSparkles && <span className={styles.enhancement}>⭐ Sparkles</span>}
            </div>
          )}
        </div>
      )}

      {/* Level Up Effect */}
      {showLevelUpEffect && (
        <div className={styles.levelUpOverlay}>
          <div className={styles.levelUpFlash} />
          <div className={styles.levelUpText}>
            <div className={styles.levelUpMain}>LEVEL UP!</div>
            <div className={styles.levelUpSub}>
              Level {previousLevel} → {currentLevel}
            </div>
          </div>
        </div>
      )}

      {/* Cinematic Stage Evolution Effect */}
      <CinematicTransition
        isActive={isTransitioning}
        stage={currentStage}
        progress={animationProgress}
      />

      {/* Milestone Effect */}
      {showMilestoneEffect && (
        <div className={styles.milestoneOverlay}>
          <div className={styles.milestoneText}>
            <div className={styles.milestoneTrophy}>🏆</div>
            <div className={styles.milestoneTitle}>MILESTONE ACHIEVED</div>
            <div className={styles.milestoneName}>{showMilestoneEffect}</div>
          </div>
        </div>
      )}

      {/* Cosmic Codex Modal */}
      <CosmicCodex
        stage={codexStage}
        isOpen={showCodex}
        onClose={() => setShowCodex(false)}
      />
    </div>
  );
};

// Helper function for progress bar colors
function getProgressColor(stage: number, progress: number): string {
  const stageColors: Record<number, [string, string]> = {
    1: ['#9BB0FF', '#CAD7FF'],
    2: ['#FFF4EA', '#FFD2A1'],
    3: ['#FFD2A1', '#9BB0FF'],
    4: ['#FFFFFF', '#808080'],
    5: ['#8B4513', '#D2691E'],
    6: ['#1A1A1A', '#FF8C00'],
    7: ['#696969', '#A9A9A9'],
    8: ['#808080', '#FF7F50'],
    9: ['#4682B4', '#8B7355'],
    10: ['#CD5C5C', '#FFA500'],
    11: ['#FFD700', '#FFC700'],
    12: ['#FFD2A1', '#FFD700'],
    13: ['#AABfFF', '#FFE4B5'],
    14: ['#FF0040', '#00FFB2'],
    15: ['#AABfFF', '#FF3366']
  };

  const colors = stageColors[stage] || stageColors[1];
  return lerpColor(colors[0], colors[1], progress);
}

function lerpColor(start: string, end: string, progress: number): string {
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const startRgb = hexToRgb(start);
  const endRgb = hexToRgb(end);

  const r = Math.round(startRgb.r + (endRgb.r - startRgb.r) * progress);
  const g = Math.round(startRgb.g + (endRgb.g - startRgb.g) * progress);
  const b = Math.round(startRgb.b + (endRgb.b - startRgb.b) * progress);

  return `rgb(${r}, ${g}, ${b})`;
}
