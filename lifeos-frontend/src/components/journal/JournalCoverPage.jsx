import React from 'react';
import {
  BookOpen,
  Feather,
  Heart,
  Star,
  Moon,
  Sun,
  Sparkles,
  PenTool,
  Leaf,
  Coffee,
  Music,
  Camera,
  Compass
} from 'lucide-react';
import './JournalCoverPage.css';

// Icon mapping
const ICONS = {
  book: BookOpen,
  feather: Feather,
  heart: Heart,
  star: Star,
  moon: Moon,
  sun: Sun,
  sparkles: Sparkles,
  pen: PenTool,
  leaf: Leaf,
  coffee: Coffee,
  music: Music,
  camera: Camera,
  compass: Compass,
};

// Color themes
const COLORS = {
  leather: { primary: '#2d1810', secondary: '#1a0e08', accent: '#daa520' },
  midnight: { primary: '#1a1a2e', secondary: '#16213e', accent: '#4f46e5' },
  forest: { primary: '#1a2e1a', secondary: '#0e1a0e', accent: '#22c55e' },
  burgundy: { primary: '#2e1a1a', secondary: '#1a0e0e', accent: '#dc2626' },
  ocean: { primary: '#1a2e2e', secondary: '#0e1a1a', accent: '#0ea5e9' },
  lavender: { primary: '#2e1a2e', secondary: '#1a0e1a', accent: '#a855f7' },
  charcoal: { primary: '#1f1f1f', secondary: '#141414', accent: '#f5f5f5' },
  rose: { primary: '#2e1a1f', secondary: '#1a0e12', accent: '#f472b6' },
  cosmic: { primary: '#1e1b2e', secondary: '#13101f', accent: '#8b5cf6' },
  sunset: { primary: '#2e1f1a', secondary: '#1a120e', accent: '#f97316' },
};

// Texture opacities
const TEXTURES = {
  leather: 0.6,
  canvas: 0.4,
  linen: 0.3,
  smooth: 0.1,
  none: 0,
};

function JournalCoverPage({ title, subtitle, coverSettings }) {
  // Get settings or defaults
  const colorTheme = coverSettings?.colorTheme || 'leather';
  const iconId = coverSettings?.icon || 'book';
  const texture = coverSettings?.texture || 'leather';
  const showBorder = coverSettings?.showBorder !== false;
  const showDecoration = coverSettings?.showDecoration !== false;

  // Get the actual values
  const colors = COLORS[colorTheme] || COLORS.leather;
  const IconComponent = ICONS[iconId] || BookOpen;
  const textureOpacity = TEXTURES[texture] ?? 0.6;

  return (
    <div
      className="journal-cover"
      style={{
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.secondary} 100%)`,
        '--accent-color': colors.accent,
      }}
    >
      {/* Texture overlay */}
      <div className="cover-texture" style={{ opacity: textureOpacity }} />

      {/* Border decoration */}
      {showBorder && <div className="cover-border" />}

      <div className="cover-content">
        <div className="cover-icon">
          <IconComponent size={64} />
        </div>
        <h1 className="cover-title">{title}</h1>
        {subtitle && <p className="cover-subtitle">{subtitle}</p>}

        {showDecoration && (
          <div className="cover-decoration">
            <div className="decoration-line" />
          </div>
        )}
      </div>
    </div>
  );
}

export default JournalCoverPage;
