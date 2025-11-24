import React, { useState } from 'react';
import { CosmicAvatar } from '../features/cosmic-evolution/components/CosmicAvatar';
import { ProgressBar } from '../features/cosmic-evolution/components/ProgressBar';
import { useEvolutionStore } from '../features/cosmic-evolution/stores/evolutionStore';
import { LevelSystem } from '../features/cosmic-evolution/engine/LevelSystem';

export default function CosmicEvolutionDemo() {
  const { addXP, reset, totalXP, currentLevel, currentStage, milestones } = useEvolutionStore();
  const [recentEvents, setRecentEvents] = useState<string[]>([]);

  const handleAddXP = (amount: number) => {
    addXP(amount);
    setRecentEvents(prev => [...prev, `+${amount} XP gained!`].slice(-5));
  };

  const handleEvolution = (newStage: number) => {
    console.log(`🎉 Evolved to stage ${newStage}!`);
    setRecentEvents(prev => [...prev, `🌟 EVOLVED TO STAGE ${newStage}!`].slice(-5));
  };

  const handleLevelUp = (newLevel: number) => {
    console.log(`📈 Level up to ${newLevel}!`);
    setRecentEvents(prev => [...prev, `📈 LEVEL ${newLevel} REACHED!`].slice(-5));
  };

  const handleMilestone = (milestone: string) => {
    console.log(`🏆 Milestone: ${milestone}`);
    setRecentEvents(prev => [...prev, `🏆 ${milestone} unlocked!`].slice(-5));
  };

  const levelData = LevelSystem.getLevelData(currentLevel);
  const stageInfo = LevelSystem.getStageFromLevel(currentLevel);

  return (
    <div style={{ padding: 40, maxWidth: 1400, margin: '0 auto', background: '#0a0e1a', minHeight: '100vh' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#FFF', marginBottom: 8 }}>
          Cosmic Evolution Leveling System
        </h1>
        <p style={{ color: '#9BA2AD', fontSize: 14 }}>
          160 unique levels across 15 scientifically accurate stages with progressive enhancements
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 }}>
        <div>
          <CosmicAvatar
            size={500}
            showProgress={true}
            showLevelInfo={true}
            onEvolution={handleEvolution}
            onLevelUp={handleLevelUp}
            onMilestone={handleMilestone}
          />
        </div>

        <div>
          <ProgressBar />

          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <div style={cardStyle}>
              <h3 style={headingStyle}>Current Level</h3>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#FFF' }}>{currentLevel}/160</div>
              <div style={{ fontSize: 13, color: '#9BA2AD', marginTop: 4 }}>
                Stage {currentStage} • Level {currentLevel - (stageInfo?.startLevel || 0) + 1}/{stageInfo?.count || 0}
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={headingStyle}>Total XP</h3>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#FFF' }}>{totalXP.toLocaleString()}</div>
              <div style={{ fontSize: 13, color: '#9BA2AD', marginTop: 4 }}>
                Next: {LevelSystem.getXPForLevel(currentLevel + 1).toLocaleString()} XP
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={headingStyle}>Particles</h3>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#FFF' }}>{levelData.particleCount}</div>
              <div style={{ fontSize: 13, color: '#9BA2AD', marginTop: 4 }}>
                Base + {Math.floor(levelData.particleCount * 0.2)} level bonus
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={headingStyle}>Effects Active</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {levelData.hasAura && <span style={effectBadge}>✨ Aura</span>}
                {levelData.hasPulse && <span style={effectBadge}>💫 Pulse</span>}
                {levelData.hasTrails && <span style={effectBadge}>🌠 Trails</span>}
                {levelData.hasSparkles && <span style={effectBadge}>⭐ Sparkles</span>}
                {!levelData.hasAura && !levelData.hasPulse && !levelData.hasTrails && !levelData.hasSparkles &&
                  <span style={{...effectBadge, opacity: 0.5}}>None yet</span>
                }
              </div>
            </div>
          </div>

          <div style={{ ...cardStyle, marginTop: 16 }}>
            <h3 style={headingStyle}>Milestones</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              <div style={getMilestoneStyle(milestones.level10)}>🏆 Level 10</div>
              <div style={getMilestoneStyle(milestones.level25)}>🏆 Level 25</div>
              <div style={getMilestoneStyle(milestones.level50)}>🏆 Level 50</div>
              <div style={getMilestoneStyle(milestones.level75)}>🏆 Level 75</div>
              <div style={getMilestoneStyle(milestones.level100)}>🏆 Level 100</div>
              <div style={getMilestoneStyle(milestones.level150)}>🏆 Level 150</div>
              <div style={getMilestoneStyle(milestones.maxLevel)}>👑 Max Level</div>
            </div>
          </div>

          <div style={{ ...cardStyle, marginTop: 16 }}>
            <h3 style={headingStyle}>Add Experience</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <button onClick={() => handleAddXP(10)} style={buttonStyle}>+10 XP</button>
              <button onClick={() => handleAddXP(50)} style={buttonStyle}>+50 XP</button>
              <button onClick={() => handleAddXP(100)} style={buttonStyle}>+100 XP</button>
              <button onClick={() => handleAddXP(500)} style={buttonStyle}>+500 XP</button>
              <button onClick={() => handleAddXP(1000)} style={{...buttonStyle, background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)'}}>+1000 XP</button>
              <button onClick={() => handleAddXP(5000)} style={{...buttonStyle, background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)'}}>+5000 XP</button>
            </div>
            <button onClick={reset} style={{ ...buttonStyle, width: '100%', marginTop: 12, background: '#444' }}>
              Reset Progress
            </button>
          </div>

          <div style={{ ...cardStyle, marginTop: 16 }}>
            <h3 style={headingStyle}>Recent Events</h3>
            <div style={{ fontSize: 13, color: '#9BA2AD', lineHeight: 2 }}>
              {recentEvents.length === 0 ? (
                <div style={{ opacity: 0.5 }}>No recent events</div>
              ) : (
                recentEvents.map((event, index) => (
                  <div key={index}>{event}</div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={headingStyle}>System Features</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, fontSize: 13, color: '#9BA2AD' }}>
          <div>
            <strong style={{ color: '#FFF', display: 'block', marginBottom: 4 }}>160 Unique Levels</strong>
            Each level provides progressive improvements in particles, size, opacity, and effects
          </div>
          <div>
            <strong style={{ color: '#FFF', display: 'block', marginBottom: 4 }}>Progressive Effects</strong>
            Unlock Aura (25%), Pulse (50%), Trails (75%), Sparkles (95%) within each stage
          </div>
          <div>
            <strong style={{ color: '#FFF', display: 'block', marginBottom: 4 }}>Milestone System</strong>
            Special celebrations at levels 10, 25, 50, 75, 100, 150, and 160
          </div>
          <div>
            <strong style={{ color: '#FFF', display: 'block', marginBottom: 4 }}>Visual Scaling</strong>
            Particle count increases 20%, size grows 15%, opacity improves 10% per stage
          </div>
        </div>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#1a1f35',
  border: '1px solid #2a3045',
  borderRadius: 12,
  padding: 20
};

const headingStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  color: '#FFF',
  marginBottom: 16
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 16px',
  background: 'linear-gradient(135deg, #7A5CFF 0%, #5CE1E6 100%)',
  border: 'none',
  borderRadius: 8,
  color: '#FFF',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'transform 0.1s',
};

const effectBadge: React.CSSProperties = {
  padding: '4px 8px',
  background: 'rgba(122, 92, 255, 0.2)',
  border: '1px solid rgba(122, 92, 255, 0.3)',
  borderRadius: 12,
  fontSize: 11,
  color: '#FFF'
};

function getMilestoneStyle(unlocked: boolean): React.CSSProperties {
  return {
    padding: 8,
    background: unlocked ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${unlocked ? 'rgba(255, 215, 0, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
    borderRadius: 8,
    fontSize: 13,
    color: unlocked ? '#FFD700' : '#666',
    textAlign: 'center',
    fontWeight: unlocked ? 600 : 400
  };
}
