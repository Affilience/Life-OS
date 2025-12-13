import React, { useState, useEffect } from 'react';
import { useAvatarStore } from '../../stores/avatarStore';
import { useGamificationStore } from '../../stores/gamificationStore';
import { MediumAvatarWithPets } from '../avatar/AvatarWithCompanions';
import AvatarCustomization from '../avatar/AvatarCustomization';
import { getStageByLevel, EVOLUTION_STAGES, calculateXPForLevel } from '../../data/avatarEvolution';
import { Zap, TrendingUp, Award, Settings, Sparkles, BarChart2, User } from 'lucide-react';
import { useGamificationModeStore, TERMINOLOGY, VISIBILITY } from '../../stores/gamificationModeStore';
import { usePetStore } from '../../stores/petStore';
import { generateSpriteByLevel } from '../../utils/spriteGenerator';
import './AvatarDashboardSection.css';

// Mode-specific stat labels
const getStatLabels = (mode) => {
  if (mode === 'professional') {
    return {
      defense: 'Resilience',
      strength: 'Physical',
      vitality: 'Energy',
      intelligence: 'Learning',
      wisdom: 'Focus',
      total: 'Overall Score',
    };
  }
  if (mode === 'minimal') {
    return {
      defense: 'Consistency',
      strength: 'Physical',
      vitality: 'Energy',
      intelligence: 'Mental',
      wisdom: 'Focus',
      total: 'Total',
    };
  }
  // Cosmic (default)
  return {
    defense: 'Defense',
    strength: 'Strength',
    vitality: 'Vitality',
    intelligence: 'Intelligence',
    wisdom: 'Wisdom',
    total: 'Total Power',
  };
};

export function AvatarDashboardSection() {
  const [showCustomization, setShowCustomization] = useState(false);
  const [avatarSprite, setAvatarSprite] = useState(null);

  // Get gamification mode and terminology
  const mode = useGamificationModeStore((state) => state.mode);
  const terms = TERMINOLOGY[mode] || TERMINOLOGY.cosmic;
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;
  const statLabels = getStatLabels(mode);

  const {
    level,
    xp,
    currentTier,
    prestige,
    stats,
    getCurrentTierData,
  } = useAvatarStore();

  // Get active pets from pet store
  const { activePets } = usePetStore();

  // Get XP info from gamification store (uses exponential scaling)
  const { currentXP, xpToNextLevel } = useGamificationStore();

  const tierData = getCurrentTierData();
  const evolutionStage = getStageByLevel(level, prestige || 0);
  const xpNeeded = xpToNextLevel || calculateXPForLevel(level);
  const xpProgress = (currentXP / xpNeeded) * 100;

  // Calculate total stats
  const totalStats = Object.values(stats).reduce((sum, stat) => sum + stat, 0);

  // Generate avatar sprite
  useEffect(() => {
    generateSpriteByLevel(level, prestige || 0).then(sprite => {
      setAvatarSprite(sprite);
    });
  }, [level, prestige]);

  return (
    <>
      <section className="avatar-dashboard-section">
        <div className="avatar-dashboard-container">
          {/* Left: Avatar Display with Pets */}
          <div className="avatar-display-area">
            <div className="avatar-wrapper">
              {avatarSprite && (
                <MediumAvatarWithPets
                  avatarSrc={avatarSprite}
                  avatarAlt="Your Avatar"
                  activePets={activePets || []}
                  size={280}
                />
              )}

              {/* Customize Button */}
              {visibility.showAvatar && (
                <button
                  onClick={() => setShowCustomization(true)}
                  className="customize-avatar-btn"
                >
                  <Settings className="w-4 h-4" />
                  <span>{mode === 'cosmic' ? 'Customize Avatar' : 'Edit Profile'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Stats and Progress */}
          <div className="avatar-stats-area">
            {/* Level & XP Progress */}
            <div className="avatar-level-section">
              <div className="level-header">
                <div className="level-info">
                  <h3 className="level-title">
                    {mode === 'cosmic' ? evolutionStage.name : `${terms.level} ${level}`}
                  </h3>
                  {mode === 'cosmic' && (
                    <p className="evolution-category" style={{ color: evolutionStage.colors.accent }}>
                      {evolutionStage.category}
                    </p>
                  )}
                  <div className="level-badge-container">
                    <div
                      className="tier-badge-large"
                      style={{
                        background: `linear-gradient(135deg, ${evolutionStage.colors.primary}, ${evolutionStage.colors.secondary})`,
                        boxShadow: `0 4px 16px ${evolutionStage.colors.secondary}40`,
                      }}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{mode === 'cosmic' ? tierData.name : terms.tier}</span>
                    </div>
                    {mode === 'cosmic' && (
                      <div className="level-number">
                        <Award className="w-4 h-4" />
                        <span>Level {level}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* XP Progress Bar */}
              <div className="xp-progress-container">
                <div className="xp-bar">
                  <div
                    className="xp-fill"
                    style={{
                      width: `${xpProgress}%`,
                      background: `linear-gradient(90deg, ${tierData.colors.secondary}, ${tierData.colors.primary})`,
                    }}
                  >
                    <div className="xp-shimmer" />
                  </div>
                </div>
                <div className="xp-text">
                  <span className="xp-current">{xp}</span>
                  <span className="xp-separator">/</span>
                  <span className="xp-needed">{xpNeeded} {terms.xp}</span>
                  <span className="xp-percent">({Math.round(xpProgress)}%)</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="avatar-stats-grid">
              {/* Defense/Consistency/Resilience */}
              <div className="stat-card">
                <div className="stat-icon-wrapper defense">
                  <span className="stat-icon">{mode === 'cosmic' ? '🛡️' : '📊'}</span>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats.defense}</div>
                  <div className="stat-label">{statLabels.defense}</div>
                </div>
              </div>

              {/* Strength/Physical */}
              <div className="stat-card">
                <div className="stat-icon-wrapper strength">
                  <span className="stat-icon">💪</span>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats.strength}</div>
                  <div className="stat-label">{statLabels.strength}</div>
                </div>
              </div>

              {/* Vitality/Energy */}
              <div className="stat-card">
                <div className="stat-icon-wrapper vitality">
                  <span className="stat-icon">{mode === 'cosmic' ? '❤️' : '⚡'}</span>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats.vitality}</div>
                  <div className="stat-label">{statLabels.vitality}</div>
                </div>
              </div>

              {/* Intelligence/Learning/Mental */}
              <div className="stat-card">
                <div className="stat-icon-wrapper intelligence">
                  <span className="stat-icon">🧠</span>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats.intelligence}</div>
                  <div className="stat-label">{statLabels.intelligence}</div>
                </div>
              </div>

              {/* Wisdom/Focus (if > 0) */}
              {stats.wisdom > 0 && (
                <div className="stat-card">
                  <div className="stat-icon-wrapper wisdom">
                    <span className="stat-icon">{mode === 'cosmic' ? '✨' : '🎯'}</span>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{stats.wisdom}</div>
                    <div className="stat-label">{statLabels.wisdom}</div>
                  </div>
                </div>
              )}

              {/* Total Stats Summary */}
              <div className="stat-card total-stats">
                <div className="stat-icon-wrapper total">
                  {mode === 'cosmic' ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : mode === 'professional' ? (
                    <BarChart2 className="w-5 h-5" />
                  ) : (
                    <BarChart2 className="w-5 h-5" />
                  )}
                </div>
                <div className="stat-content">
                  <div className="stat-value">{totalStats}</div>
                  <div className="stat-label">{statLabels.total}</div>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="avatar-quick-info">
              {mode === 'cosmic' ? (
                <>
                  <div className="quick-info-item">
                    <span className="info-label">Current Stage:</span>
                    <span className="info-value" style={{ color: evolutionStage.colors.secondary }}>
                      {evolutionStage.description}
                    </span>
                  </div>
                  <div className="quick-info-item">
                    <span className="info-label">Next Evolution:</span>
                    <span className="info-value">
                      {(() => {
                        // Find the next stage after current level
                        const allStages = Object.values(EVOLUTION_STAGES)
                          .filter(s => s.prestige === (prestige || 0))
                          .sort((a, b) => a.levelRequired - b.levelRequired);

                        const nextStage = allStages.find(s => s.levelRequired > level);
                        return nextStage ? `${nextStage.name} (Level ${nextStage.levelRequired})` : 'Max Stage!';
                      })()}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="quick-info-item">
                    <span className="info-label">Current {terms.level}:</span>
                    <span className="info-value" style={{ color: evolutionStage.colors.secondary }}>
                      {level}
                    </span>
                  </div>
                  <div className="quick-info-item">
                    <span className="info-label">Next {terms.level}:</span>
                    <span className="info-value">
                      {xpNeeded - xp} {terms.xp} to go
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Customization Modal */}
      {showCustomization && (
        <AvatarCustomization onClose={() => setShowCustomization(false)} />
      )}
    </>
  );
}

export default AvatarDashboardSection;
