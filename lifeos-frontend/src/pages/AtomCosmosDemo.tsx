import React, { useState } from 'react';
import { DashboardAvatarSection } from '../features/dashboard/DashboardAvatarSection';
import { emitAvatarEvent } from '../features/avatar/avatar.events';
import type { UserStats, Season, Mood } from '../features/avatar/types';

export default function AtomCosmosDemo() {
  const [user, setUser] = useState<UserStats>({
    level: 25,
    xp: 1200,
    xpToNext: 2000,
    streakDays: 14,
    season: 'discipline',
    mood: 'calm'
  });

  const addXP = (amount: number) => {
    setUser(prev => {
      const newXp = prev.xp + amount;
      if (newXp >= prev.xpToNext) {
        const newLevel = prev.level + 1;
        emitAvatarEvent({ type: 'level:up', level: newLevel });
        return { ...prev, level: newLevel, xp: newXp - prev.xpToNext };
      }
      emitAvatarEvent({ type: 'xp:claimed', amount });
      return { ...prev, xp: newXp };
    });
  };

  const cycleSeason = () => {
    const seasons: Season[] = ['discipline', 'ambition', 'focus', 'evolution', 'power'];
    const idx = seasons.indexOf(user.season);
    setUser(prev => ({ ...prev, season: seasons[(idx + 1) % seasons.length] }));
  };

  const cycleMood = () => {
    const moods: Mood[] = ['calm', 'focused', 'stressed'];
    const idx = moods.indexOf(user.mood);
    setUser(prev => ({ ...prev, mood: moods[(idx + 1) % moods.length] }));
  };

  return (
    <div style={{ padding: 40, maxWidth: 1400, margin: '0 auto', background: '#0a0e1a', minHeight: '100vh' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#FFF', marginBottom: 8 }}>
          Atom → Cosmos Avatar System
        </h1>
        <p style={{ color: '#9BA2AD', fontSize: 14 }}>
          Production-ready avatar with Lottie celebrations and tsparticles background
        </p>
      </div>

      <DashboardAvatarSection user={user} />

      <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        <div style={cardStyle}>
          <h3 style={headingStyle}>Level & XP</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Level: {user.level}</label>
            <input type="range" min="1" max="120" value={user.level} onChange={(e) => setUser(prev => ({ ...prev, level: Number(e.target.value) }))} style={sliderStyle} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>XP: {user.xp} / {user.xpToNext}</label>
            <input type="range" min="0" max={user.xpToNext} value={user.xp} onChange={(e) => setUser(prev => ({ ...prev, xp: Number(e.target.value) }))} style={sliderStyle} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => addXP(50)} style={buttonStyle}>+50 XP</button>
            <button onClick={() => addXP(500)} style={buttonStyle}>+500 XP</button>
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={headingStyle}>Streak & Attributes</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Streak Days: {user.streakDays}</label>
            <input type="range" min="0" max="100" value={user.streakDays} onChange={(e) => setUser(prev => ({ ...prev, streakDays: Number(e.target.value) }))} style={sliderStyle} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button onClick={cycleSeason} style={buttonStyle}>Season: {user.season}</button>
            <button onClick={cycleMood} style={buttonStyle}>Mood: {user.mood}</button>
          </div>
          <button onClick={() => emitAvatarEvent({ type: 'streak:milestone', days: user.streakDays })} style={{...buttonStyle, width: '100%'}}>
            🔥 Trigger Streak Milestone
          </button>
        </div>

        <div style={cardStyle}>
          <h3 style={headingStyle}>Stages</h3>
          <div style={{ fontSize: 12, color: '#9BA2AD', lineHeight: 1.6 }}>
            <p><strong>Lv 1-10:</strong> Atom (single glowing point)</p>
            <p><strong>Lv 11-25:</strong> Orbit (electron orbits)</p>
            <p><strong>Lv 26-45:</strong> Molecule (cluster)</p>
            <p><strong>Lv 46-70:</strong> Proto-star (star birth)</p>
            <p><strong>Lv 71-100:</strong> Solar (planets)</p>
            <p><strong>Lv 101+:</strong> Galaxy (cosmos)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = { background: '#1a1f35', border: '1px solid #2a3045', borderRadius: 12, padding: 20 };
const headingStyle: React.CSSProperties = { fontSize: 16, fontWeight: 600, color: '#FFF', marginBottom: 16 };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, color: '#9BA2AD', marginBottom: 8 };
const sliderStyle: React.CSSProperties = { width: '100%', height: 6, borderRadius: 3, outline: 'none', cursor: 'pointer' };
const buttonStyle: React.CSSProperties = { flex: 1, padding: '8px 16px', background: 'linear-gradient(135deg, #7A5CFF 0%, #5CE1E6 100%)', border: 'none', borderRadius: 8, color: '#FFF', fontSize: 13, fontWeight: 600, cursor: 'pointer' };
