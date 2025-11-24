import React, { useState } from 'react';
import { useAvatarStore } from '../../stores/avatarStore';
import AvatarRenderer from '../avatar/AvatarRenderer';
import AvatarCustomization from '../avatar/AvatarCustomization';
import { getStageByLevel, EVOLUTION_STAGES } from '../../data/avatarEvolution';
import { Zap, TrendingUp, Award, Settings, Sparkles } from 'lucide-react';
import './AvatarDashboardSection.css';

export function AvatarDashboardSection() {
  const [showCustomization, setShowCustomization] = useState(false);

  const {
    level,
    xp,
    currentTier,
    prestige,
    stats,
    getCurrentTierData,
  } = useAvatarStore();

  // Debug logging
  console.log('AvatarDashboardSection render:', { level, xp, currentTier, stats });

  const tierData = getCurrentTierData();
  const evolutionStage = getStageByLevel(level, prestige || 0);
  const xpNeeded = level * 100;
  const xpProgress = (xp / xpNeeded) * 100;

  // Calculate total stats
  const totalStats = Object.values(stats).reduce((sum, stat) => sum + stat, 0);

  return (
    <>
      <section className="avatar-dashboard-section">
        <div className="avatar-dashboard-container">
          {/* Left: Avatar Display */}
          <div className="avatar-display-area">
            <div className="avatar-wrapper">
              <AvatarRenderer size={400} animate={true} showStats={false} />

              {/* Customize Button */}
              <button
                onClick={() => setShowCustomization(true)}
                className="customize-avatar-btn"
              >
                <Settings className="w-4 h-4" />
                <span>Customize Avatar</span>
              </button>
            </div>
          </div>

          {/* Right: Stats and Progress */}
          <div className="avatar-stats-area">
            {/* Level & XP Progress */}
            <div className="avatar-level-section">
              <div className="level-header">
                <div className="level-info">
                  <h3 className="level-title">{evolutionStage.name}</h3>
                  <p className="evolution-category" style={{ color: evolutionStage.colors.accent }}>
                    {evolutionStage.category}
                  </p>
                  <div className="level-badge-container">
                    <div
                      className="tier-badge-large"
                      style={{
                        background: `linear-gradient(135deg, ${evolutionStage.colors.primary}, ${evolutionStage.colors.secondary})`,
                        boxShadow: `0 4px 16px ${evolutionStage.colors.secondary}40`,
                      }}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{tierData.name}</span>
                    </div>
                    <div className="level-number">
                      <Award className="w-4 h-4" />
                      <span>Level {level}</span>
                    </div>
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
                  <span className="xp-needed">{xpNeeded} XP</span>
                  <span className="xp-percent">({Math.round(xpProgress)}%)</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="avatar-stats-grid">
              {/* Defense */}
              <div className="stat-card">
                <div className="stat-icon-wrapper defense">
                  <span className="stat-icon">🛡️</span>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats.defense}</div>
                  <div className="stat-label">Defense</div>
                </div>
              </div>

              {/* Strength */}
              <div className="stat-card">
                <div className="stat-icon-wrapper strength">
                  <span className="stat-icon">💪</span>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats.strength}</div>
                  <div className="stat-label">Strength</div>
                </div>
              </div>

              {/* Vitality */}
              <div className="stat-card">
                <div className="stat-icon-wrapper vitality">
                  <span className="stat-icon">❤️</span>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats.vitality}</div>
                  <div className="stat-label">Vitality</div>
                </div>
              </div>

              {/* Intelligence */}
              <div className="stat-card">
                <div className="stat-icon-wrapper intelligence">
                  <span className="stat-icon">🧠</span>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats.intelligence}</div>
                  <div className="stat-label">Intelligence</div>
                </div>
              </div>

              {/* Wisdom (if > 0) */}
              {stats.wisdom > 0 && (
                <div className="stat-card">
                  <div className="stat-icon-wrapper wisdom">
                    <span className="stat-icon">✨</span>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{stats.wisdom}</div>
                    <div className="stat-label">Wisdom</div>
                  </div>
                </div>
              )}

              {/* Total Stats Summary */}
              <div className="stat-card total-stats">
                <div className="stat-icon-wrapper total">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{totalStats}</div>
                  <div className="stat-label">Total Power</div>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="avatar-quick-info">
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
