/**
 * Avatar 2D Demo - Interactive testing panel
 */

import React, { useState } from 'react';
import { SeedToCosmosAvatar } from '../SeedToCosmosAvatar';
import type { Season, Mood } from '../types';

export default function Avatar2DDemo() {
  const [level, setLevel] = useState(25);
  const [xp, setXp] = useState(1200);
  const [xpToNext, setXpToNext] = useState(2000);
  const [streakDays, setStreakDays] = useState(7);
  const [season, setSeason] = useState<Season>('discipline');
  const [mood, setMood] = useState<Mood>('calm');
  const [reducedMotion, setReducedMotion] = useState(false);

  const seasons: Season[] = ['discipline', 'ambition', 'focus', 'evolution', 'power'];
  const moods: Mood[] = ['calm', 'focused', 'stressed'];

  const addXP = () => {
    setXp(prev => prev + 50);
    // Trigger pulse animation
    (window as any).__avatarTimeline?.pulseXp();
  };

  const handleLevelUp = () => {
    setLevel(prev => prev + 1);
    setXp(0);
    // Trigger level up animation
    (window as any).__avatarTimeline?.levelUp();
  };

  const cycleSeason = () => {
    const currentIndex = seasons.indexOf(season);
    const nextSeason = seasons[(currentIndex + 1) % seasons.length];
    setSeason(nextSeason);
    (window as any).__avatarTimeline?.seasonChange(nextSeason);
  };

  const cycleMood = () => {
    const currentIndex = moods.indexOf(mood);
    setMood(moods[(currentIndex + 1) % moods.length]);
  };

  return (
    <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>
          Seed → Cosmos Avatar
        </h1>
        <p style={{ color: '#9BA2AD', fontSize: 14 }}>
          Interactive 2D avatar system with procedural visuals and particle effects
        </p>
      </div>

      {/* Avatar Display */}
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'center' }}>
        <SeedToCosmosAvatar
          level={level}
          xp={xp}
          xpToNext={xpToNext}
          streakDays={streakDays}
          season={season}
          mood={mood}
          reducedMotion={reducedMotion}
          onOpenCoach={() => alert('Coach opened!')}
          className="avatar-demo"
        />
      </div>

      {/* Controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24
      }}>
        {/* Level & XP */}
        <div style={cardStyle}>
          <h3 style={headingStyle}>Level & XP</h3>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Level: {level}</label>
            <input
              type="range"
              min="1"
              max="120"
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              style={sliderStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>XP: {xp} / {xpToNext}</label>
            <input
              type="range"
              min="0"
              max={xpToNext}
              value={xp}
              onChange={(e) => setXp(Number(e.target.value))}
              style={sliderStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>XP to Next: {xpToNext}</label>
            <input
              type="range"
              min="100"
              max="5000"
              step="100"
              value={xpToNext}
              onChange={(e) => setXpToNext(Number(e.target.value))}
              style={sliderStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addXP} style={buttonStyle}>
              Add XP (+50)
            </button>
            <button onClick={handleLevelUp} style={buttonStyle}>
              Level Up
            </button>
          </div>
        </div>

        {/* Streak & Season */}
        <div style={cardStyle}>
          <h3 style={headingStyle}>Streak & Season</h3>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Streak Days: {streakDays}</label>
            <input
              type="range"
              min="0"
              max="60"
              value={streakDays}
              onChange={(e) => setStreakDays(Number(e.target.value))}
              style={sliderStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Season: {season}</label>
            <button onClick={cycleSeason} style={buttonStyle}>
              Next Season ▶
            </button>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Mood: {mood}</label>
            <button onClick={cycleMood} style={buttonStyle}>
              Next Mood ▶
            </button>
          </div>
        </div>

        {/* Settings */}
        <div style={cardStyle}>
          <h3 style={headingStyle}>Settings</h3>

          <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              style={{ marginRight: 8 }}
            />
            Reduced Motion
          </label>

          <div style={{ marginTop: 16, fontSize: 12, color: '#9BA2AD' }}>
            <p><strong>Stages:</strong></p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li>Lv 1-10: Seed</li>
              <li>Lv 11-25: Sprout</li>
              <li>Lv 26-45: Sapling</li>
              <li>Lv 46-70: Young Tree</li>
              <li>Lv 71-100: Mythic Tree</li>
              <li>Lv 101+: Cosmos</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h3 style={headingStyle}>Feature Showcase</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, fontSize: 13, color: '#9BA2AD' }}>
          <div>
            <strong style={{ color: '#FFFFFF' }}>🌱 Procedural Drawing</strong>
            <p>No image assets - all visuals drawn with bezier curves and shapes</p>
          </div>
          <div>
            <strong style={{ color: '#FFFFFF' }}>✨ Particle Effects</strong>
            <p>Leaf drift, XP bursts, nebula stars using @pixi/particle-emitter</p>
          </div>
          <div>
            <strong style={{ color: '#FFFFFF' }}>🎨 Season Tinting</strong>
            <p>Dynamic color palette based on current season</p>
          </div>
          <div>
            <strong style={{ color: '#FFFFFF' }}>🎭 Mood Sway</strong>
            <p>Subtle idle animations that reflect emotional state</p>
          </div>
          <div>
            <strong style={{ color: '#FFFFFF' }}>🔥 Streak Aura</strong>
            <p>Aura intensity grows with streak consistency</p>
          </div>
          <div>
            <strong style={{ color: '#FFFFFF' }}>♿ Accessible</strong>
            <p>Keyboard navigation, reduced motion support</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #1a1f35 0%, #151a2e 100%)',
  border: '1px solid #2a3045',
  borderRadius: 12,
  padding: 20
};

const headingStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  color: '#FFFFFF',
  marginBottom: 16
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: '#9BA2AD',
  marginBottom: 8
};

const sliderStyle: React.CSSProperties = {
  width: '100%',
  height: 6,
  borderRadius: 3,
  outline: 'none',
  cursor: 'pointer'
};

const buttonStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px 16px',
  background: 'linear-gradient(135deg, #7A5CFF 0%, #5CE1E6 100%)',
  border: 'none',
  borderRadius: 8,
  color: '#FFFFFF',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'transform 0.2s',
};
