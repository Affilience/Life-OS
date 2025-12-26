/**
 * ThemeSelector Component
 *
 * A visual theme picker that displays all available themes with live previews.
 * Allows users to switch between 10 color themes.
 */

import React, { useState } from 'react';
import { Check, Clock, Sun, Moon, ChevronRight, Sparkles } from 'lucide-react';
import useThemeStore from '../../stores/themeStore';
import { THEMES, getThemeIds } from '../../lib/themes';

// Theme card component
function ThemeCard({ theme, isActive, onClick }) {
  const { colors, preview } = theme;

  return (
    <button
      onClick={onClick}
      className={`
        relative p-4 rounded-xl text-left transition-all duration-200 group
        ${isActive
          ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-0)]'
          : 'hover:scale-[1.02]'
        }
        border-2
      `}
      style={{
        backgroundColor: preview.background,
        borderColor: isActive ? preview.primary : 'rgba(255,255,255,0.1)',
        ringColor: preview.primary,
      }}
    >
      {/* Active indicator */}
      {isActive && (
        <div
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: preview.primary }}
        >
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Color preview circles */}
      <div className="flex gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-full shadow-lg"
          style={{ backgroundColor: preview.primary }}
        />
        <div
          className="w-8 h-8 rounded-full shadow-lg"
          style={{ backgroundColor: preview.secondary }}
        />
        <div
          className="w-8 h-8 rounded-full border border-white/20"
          style={{ backgroundColor: colors.bg2 }}
        />
      </div>

      {/* Theme info */}
      <h3 className="text-white font-semibold text-sm mb-1">{theme.name}</h3>
      <p className="text-white/60 text-xs leading-relaxed line-clamp-2">
        {theme.description}
      </p>

      {/* Hover indicator */}
      <div
        className={`
          absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity
          pointer-events-none
        `}
        style={{
          boxShadow: `0 0 30px ${preview.primary}30`,
        }}
      />
    </button>
  );
}

// Auto-switch settings panel
function AutoSwitchSettings({ preferences, updatePreferences, toggleAutoSwitch }) {
  const themeOptions = getThemeIds().map((id) => ({
    value: id,
    label: THEMES[id].name,
  }));

  return (
    <div className="bg-[var(--bg-1)] border border-[var(--border)] rounded-xl overflow-hidden mt-6">
      <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-white font-semibold">Auto-Switch Themes</h4>
            <p className="text-xs text-white/50">
              Automatically change theme based on time of day
            </p>
          </div>
        </div>
        <button
          onClick={toggleAutoSwitch}
          className={`
            relative w-12 h-6 rounded-full transition-colors
            ${preferences.autoSwitch ? 'bg-[var(--primary-500)]' : 'bg-gray-600'}
          `}
        >
          <div
            className={`
              absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform
              ${preferences.autoSwitch ? 'translate-x-6' : 'translate-x-0.5'}
            `}
          />
        </button>
      </div>

      {preferences.autoSwitch && (
        <div className="p-5 space-y-4">
          {/* Day Theme */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-yellow-400" />
              <span className="text-white">Day Theme</span>
            </div>
            <select
              value={preferences.dayTheme}
              onChange={(e) => updatePreferences({ dayTheme: e.target.value })}
              className="bg-[var(--bg-0)] border border-[var(--border)] rounded-lg px-3 py-2 text-white text-sm"
            >
              {themeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Night Theme */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-blue-400" />
              <span className="text-white">Night Theme</span>
            </div>
            <select
              value={preferences.nightTheme}
              onChange={(e) => updatePreferences({ nightTheme: e.target.value })}
              className="bg-[var(--bg-0)] border border-[var(--border)] rounded-lg px-3 py-2 text-white text-sm"
            >
              {themeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Schedule */}
          <div className="flex items-center justify-between">
            <span className="text-white">Schedule</span>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-white/60">Day starts at</span>
              <select
                value={preferences.dayStartHour}
                onChange={(e) =>
                  updatePreferences({ dayStartHour: parseInt(e.target.value) })
                }
                className="bg-[var(--bg-0)] border border-[var(--border)] rounded px-2 py-1 text-white"
              >
                {Array.from({ length: 12 }, (_, i) => i + 5).map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}:00
                  </option>
                ))}
              </select>
              <span className="text-white/60">Night at</span>
              <select
                value={preferences.nightStartHour}
                onChange={(e) =>
                  updatePreferences({ nightStartHour: parseInt(e.target.value) })
                }
                className="bg-[var(--bg-0)] border border-[var(--border)] rounded px-2 py-1 text-white"
              >
                {Array.from({ length: 12 }, (_, i) => i + 17).map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}:00
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main ThemeSelector component
export default function ThemeSelector() {
  const {
    currentTheme,
    setTheme,
    preferences,
    updatePreferences,
    toggleAutoSwitch,
  } = useThemeStore();

  const [showAll, setShowAll] = useState(false);
  const themeIds = getThemeIds();

  // Show first 6 themes or all
  const visibleThemes = showAll ? themeIds : themeIds.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Theme header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--primary-500)]" />
          <h3 className="text-white font-semibold">Colour Theme</h3>
        </div>
        <span className="text-xs text-white/50 bg-white/5 px-2 py-1 rounded">
          {themeIds.length} themes
        </span>
      </div>

      {/* Theme grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {visibleThemes.map((themeId) => (
          <ThemeCard
            key={themeId}
            theme={THEMES[themeId]}
            isActive={currentTheme === themeId}
            onClick={() => setTheme(themeId)}
          />
        ))}
      </div>

      {/* Show more/less button */}
      {themeIds.length > 6 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-2 text-sm text-[var(--primary-500)] hover:text-[var(--primary-400)] transition-colors"
        >
          <ChevronRight
            className={`w-4 h-4 transition-transform ${showAll ? 'rotate-90' : ''}`}
          />
          {showAll ? 'Show fewer themes' : `Show all ${themeIds.length} themes`}
        </button>
      )}

      {/* Auto-switch settings */}
      <AutoSwitchSettings
        preferences={preferences}
        updatePreferences={updatePreferences}
        toggleAutoSwitch={toggleAutoSwitch}
      />

      {/* Theme tips */}
      <div className="bg-[var(--bg-1)] border border-[var(--border)] rounded-xl p-4">
        <h4 className="text-white/80 font-medium text-sm mb-2">Theme Tips</h4>
        <ul className="text-xs text-white/50 space-y-1">
          <li>• Cosmic Violet is optimised for productivity and focus</li>
          <li>• Emerald Zen and Ocean Depths are great for reducing eye strain</li>
          <li>• Neon Synthwave and Solar Orange provide high energy for motivation</li>
          <li>• Slate Minimal offers maximum readability for long sessions</li>
        </ul>
      </div>
    </div>
  );
}
