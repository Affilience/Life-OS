import React, { useState } from 'react';
import {
  X,
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
import './JournalCoverCustomizer.css';

// Available cover colors/themes
const COVER_COLORS = [
  { id: 'leather', name: 'Classic Leather', primary: '#2d1810', secondary: '#1a0e08', accent: '#daa520' },
  { id: 'midnight', name: 'Midnight Blue', primary: '#1a1a2e', secondary: '#16213e', accent: '#4f46e5' },
  { id: 'forest', name: 'Forest Green', primary: '#1a2e1a', secondary: '#0e1a0e', accent: '#22c55e' },
  { id: 'burgundy', name: 'Burgundy', primary: '#2e1a1a', secondary: '#1a0e0e', accent: '#dc2626' },
  { id: 'ocean', name: 'Ocean Deep', primary: '#1a2e2e', secondary: '#0e1a1a', accent: '#0ea5e9' },
  { id: 'lavender', name: 'Lavender Dream', primary: '#2e1a2e', secondary: '#1a0e1a', accent: '#a855f7' },
  { id: 'charcoal', name: 'Charcoal', primary: '#1f1f1f', secondary: '#141414', accent: '#f5f5f5' },
  { id: 'rose', name: 'Rose Gold', primary: '#2e1a1f', secondary: '#1a0e12', accent: '#f472b6' },
  { id: 'cosmic', name: 'Cosmic Purple', primary: '#1e1b2e', secondary: '#13101f', accent: '#8b5cf6' },
  { id: 'sunset', name: 'Sunset Orange', primary: '#2e1f1a', secondary: '#1a120e', accent: '#f97316' },
];

// Available icons
const COVER_ICONS = [
  { id: 'book', icon: BookOpen, name: 'Book' },
  { id: 'feather', icon: Feather, name: 'Feather' },
  { id: 'heart', icon: Heart, name: 'Heart' },
  { id: 'star', icon: Star, name: 'Star' },
  { id: 'moon', icon: Moon, name: 'Moon' },
  { id: 'sun', icon: Sun, name: 'Sun' },
  { id: 'sparkles', icon: Sparkles, name: 'Sparkles' },
  { id: 'pen', icon: PenTool, name: 'Pen' },
  { id: 'leaf', icon: Leaf, name: 'Leaf' },
  { id: 'coffee', icon: Coffee, name: 'Coffee' },
  { id: 'music', icon: Music, name: 'Music' },
  { id: 'camera', icon: Camera, name: 'Camera' },
  { id: 'compass', icon: Compass, name: 'Compass' },
];

// Available textures
const COVER_TEXTURES = [
  { id: 'leather', name: 'Leather', opacity: 0.6 },
  { id: 'canvas', name: 'Canvas', opacity: 0.4 },
  { id: 'linen', name: 'Linen', opacity: 0.3 },
  { id: 'smooth', name: 'Smooth', opacity: 0.1 },
  { id: 'none', name: 'None', opacity: 0 },
];

// Default settings
const DEFAULT_SETTINGS = {
  title: 'My Journal',
  colorTheme: 'leather',
  icon: 'book',
  texture: 'leather',
  showBorder: true,
  showDecoration: true,
};

export default function JournalCoverCustomizer({ currentSettings, onSave, onClose }) {
  const [settings, setSettings] = useState({
    ...DEFAULT_SETTINGS,
    ...currentSettings,
  });

  const selectedColor = COVER_COLORS.find(c => c.id === settings.colorTheme) || COVER_COLORS[0];
  const SelectedIcon = COVER_ICONS.find(i => i.id === settings.icon)?.icon || BookOpen;

  const handleSave = () => {
    onSave(settings);
  };

  return (
    <div className="cover-customizer-overlay" onClick={onClose}>
      <div className="cover-customizer" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="customizer-header">
          <h2>Customize Journal Cover</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="customizer-content">
          {/* Preview */}
          <div className="cover-preview-section">
            <h3>Preview</h3>
            <div
              className="cover-preview"
              style={{
                background: `linear-gradient(135deg, ${selectedColor.primary} 0%, ${selectedColor.secondary} 50%, ${selectedColor.secondary} 100%)`,
                '--accent-color': selectedColor.accent,
              }}
            >
              <div
                className="preview-texture"
                style={{ opacity: COVER_TEXTURES.find(t => t.id === settings.texture)?.opacity || 0 }}
              />
              {settings.showBorder && <div className="preview-border" />}
              <div className="preview-content">
                <div className="preview-icon">
                  <SelectedIcon size={48} />
                </div>
                <h4 className="preview-title">{settings.title || 'My Journal'}</h4>
                {settings.showDecoration && (
                  <div className="preview-decoration">
                    <div className="decoration-line" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="cover-settings-section">
            {/* Title */}
            <div className="setting-group">
              <label>Journal Title</label>
              <input
                type="text"
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                placeholder="My Journal"
                maxLength={30}
              />
            </div>

            {/* Color Theme */}
            <div className="setting-group">
              <label>Cover Color</label>
              <div className="color-grid">
                {COVER_COLORS.map(color => (
                  <button
                    key={color.id}
                    className={`color-option ${settings.colorTheme === color.id ? 'selected' : ''}`}
                    style={{
                      background: `linear-gradient(135deg, ${color.primary}, ${color.secondary})`,
                      borderColor: color.accent,
                    }}
                    onClick={() => setSettings({ ...settings, colorTheme: color.id })}
                    title={color.name}
                  >
                    {settings.colorTheme === color.id && (
                      <span className="color-check" style={{ color: color.accent }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon */}
            <div className="setting-group">
              <label>Cover Icon</label>
              <div className="icon-grid">
                {COVER_ICONS.map(({ id, icon: IconComponent, name }) => (
                  <button
                    key={id}
                    className={`icon-option ${settings.icon === id ? 'selected' : ''}`}
                    onClick={() => setSettings({ ...settings, icon: id })}
                    title={name}
                  >
                    <IconComponent size={20} />
                  </button>
                ))}
              </div>
            </div>

            {/* Texture */}
            <div className="setting-group">
              <label>Texture</label>
              <div className="texture-options">
                {COVER_TEXTURES.map(texture => (
                  <button
                    key={texture.id}
                    className={`texture-option ${settings.texture === texture.id ? 'selected' : ''}`}
                    onClick={() => setSettings({ ...settings, texture: texture.id })}
                  >
                    {texture.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="setting-group toggles">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={settings.showBorder}
                  onChange={(e) => setSettings({ ...settings, showBorder: e.target.checked })}
                />
                <span>Show decorative border</span>
              </label>
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={settings.showDecoration}
                  onChange={(e) => setSettings({ ...settings, showDecoration: e.target.checked })}
                />
                <span>Show decoration line</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="customizer-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="save-btn" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// Export the color and icon data for use in JournalCoverPage
export { COVER_COLORS, COVER_ICONS, COVER_TEXTURES, DEFAULT_SETTINGS };
