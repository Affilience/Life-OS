/**
 * ConstellationsTestPage - Visual test page for all 5 constellations
 * Displays all constellations simultaneously with synchronized XP controls
 */

import React, { useState } from 'react';
import { ConstellationCanvas } from '../ConstellationCanvas';
import { CONSTELLATIONS, MODULE_COLORS } from '../constellations.config';
import { getUnlockedStars } from '../constellations.state';
import type { ModuleId } from '../constellations.types';

interface ModuleXP {
  journal: number;
  knowledge: number;
  health: number;
  finance: number;
  productivity: number;
}

export const ConstellationsTestPage: React.FC = () => {
  const [xpValues, setXpValues] = useState<ModuleXP>({
    journal: 0,
    knowledge: 0,
    health: 0,
    finance: 0,
    productivity: 0
  });

  const updateModuleXP = (moduleId: ModuleId, value: number) => {
    setXpValues(prev => ({ ...prev, [moduleId]: value }));
  };

  const setAllXP = (percentage: number) => {
    const newValues: Partial<ModuleXP> = {};
    CONSTELLATIONS.forEach(constellation => {
      newValues[constellation.module] = Math.floor(constellation.maxXp * percentage);
    });
    setXpValues(newValues as ModuleXP);
  };

  return (
    <div className="min-h-screen bg-bg-0 p-8">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl font-bold text-text-high">
            Constellation System Test
          </h1>
          <p className="text-text-med text-lg">
            Authentic astronomical patterns based on real night sky constellations
          </p>
          <div className="flex items-center justify-center gap-3 text-sm text-text-dim">
            <span>Scorpius</span>
            <span>•</span>
            <span>Cassiopeia</span>
            <span>•</span>
            <span>Orion</span>
            <span>•</span>
            <span>Taurus</span>
            <span>•</span>
            <span>Ursa Major</span>
          </div>
        </div>

        {/* Global Controls */}
        <div className="cosmic-panel cosmic-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-high">
              Global XP Controls
            </h2>
            <div className="text-text-dim text-sm">
              Set all modules simultaneously
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setAllXP(0)}
              className="cosmic-button cosmic-glow px-6 py-3 rounded-lg text-text-high font-medium"
            >
              0% - Fresh Start
            </button>
            <button
              onClick={() => setAllXP(0.25)}
              className="cosmic-button cosmic-glow px-6 py-3 rounded-lg text-text-high font-medium"
            >
              25% - Early Progress
            </button>
            <button
              onClick={() => setAllXP(0.5)}
              className="cosmic-button cosmic-glow px-6 py-3 rounded-lg text-text-high font-medium"
            >
              50% - Halfway
            </button>
            <button
              onClick={() => setAllXP(0.75)}
              className="cosmic-button cosmic-glow px-6 py-3 rounded-lg text-text-high font-medium"
            >
              75% - Advanced
            </button>
            <button
              onClick={() => setAllXP(1)}
              className="cosmic-button cosmic-glow px-6 py-3 rounded-lg text-text-high font-medium"
            >
              100% - Complete
            </button>
          </div>
        </div>

        {/* Constellations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
          {CONSTELLATIONS.map((constellation) => {
            const currentXp = xpValues[constellation.module];
            const state = getUnlockedStars(constellation, currentXp);
            const accentColor = MODULE_COLORS[constellation.module];
            const progressPercent = Math.round(state.progress * 100);

            return (
              <div
                key={constellation.module}
                className="cosmic-card cosmic-border cosmic-lift rounded-xl overflow-hidden"
                style={{
                  boxShadow: `0 0 40px ${accentColor}15`
                }}
              >
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3
                        className="text-2xl font-bold mb-1"
                        style={{ color: accentColor }}
                      >
                        {constellation.displayName}
                      </h3>
                      <p className="text-sm text-text-dim italic">
                        {constellation.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold" style={{ color: accentColor }}>
                        {progressPercent}%
                      </div>
                      <div className="text-xs text-text-dim">
                        {state.unlockedStars.length}/{state.totalStars} stars
                      </div>
                    </div>
                  </div>

                  {/* Module badge */}
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-text-high capitalize">
                    {constellation.module}
                  </div>
                </div>

                {/* Constellation Canvas */}
                <div className="p-6 flex items-center justify-center">
                  <ConstellationCanvas
                    constellation={constellation}
                    unlockedStars={state.unlockedStars}
                    width={500}
                    height={400}
                  />
                </div>

                {/* XP Controls */}
                <div className="p-6 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-high">
                      XP Amount
                    </span>
                    <span className="text-sm font-mono text-text-med">
                      {currentXp.toLocaleString()} / {constellation.maxXp.toLocaleString()}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={constellation.maxXp}
                    step={50}
                    value={currentXp}
                    onChange={(e) => updateModuleXP(constellation.module, Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-moz-range-thumb]:w-4
                      [&::-moz-range-thumb]:h-4
                      [&::-moz-range-thumb]:rounded-full
                      [&::-moz-range-thumb]:border-0
                      [&::-moz-range-thumb]:cursor-pointer"
                    style={{
                      background: `linear-gradient(90deg, ${accentColor} ${progressPercent}%, rgba(255,255,255,0.1) ${progressPercent}%)`,
                      ['--tw-slider-thumb' as any]: accentColor
                    }}
                  />

                  {/* Quick buttons */}
                  <div className="grid grid-cols-5 gap-2">
                    {[0, 0.25, 0.5, 0.75, 1].map((percentage) => (
                      <button
                        key={percentage}
                        onClick={() => updateModuleXP(constellation.module, Math.floor(constellation.maxXp * percentage))}
                        className="cosmic-button px-3 py-2 rounded text-xs font-medium text-text-high"
                        style={{
                          borderLeft: `3px solid ${accentColor}${Math.floor(percentage * 100).toString(16).padStart(2, '0')}`
                        }}
                      >
                        {Math.floor(percentage * 100)}%
                      </button>
                    ))}
                  </div>

                  {/* Star progression info */}
                  <div className="pt-3 border-t border-white/10">
                    <div className="text-xs text-text-dim mb-2">Star Progression:</div>
                    <div className="flex flex-wrap gap-1">
                      {constellation.stars.map((star) => {
                        const isUnlocked = state.unlockedStars.includes(star.id);
                        return (
                          <div
                            key={star.id}
                            className={`
                              px-2 py-1 rounded text-xs font-mono
                              ${isUnlocked
                                ? 'bg-white/15 text-white'
                                : 'bg-white/5 text-text-dim'
                              }
                            `}
                            title={`${star.label || star.id} - ${star.requirementXp} XP`}
                            style={isUnlocked ? {
                              boxShadow: `0 0 8px ${accentColor}40`
                            } : {}}
                          >
                            {star.label || star.id}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Statistics Summary */}
        <div className="cosmic-panel cosmic-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-text-high mb-4">
            System Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {CONSTELLATIONS.map((constellation) => {
              const currentXp = xpValues[constellation.module];
              const state = getUnlockedStars(constellation, currentXp);
              const accentColor = MODULE_COLORS[constellation.module];

              return (
                <div
                  key={constellation.module}
                  className="p-4 rounded-lg border border-white/10 bg-white/5"
                >
                  <div className="text-xs text-text-dim uppercase tracking-wide mb-2">
                    {constellation.module}
                  </div>
                  <div className="text-2xl font-bold mb-1" style={{ color: accentColor }}>
                    {state.unlockedStars.length}/{state.totalStars}
                  </div>
                  <div className="text-xs text-text-med">
                    {constellation.stars.length} total stars
                  </div>
                  <div className="text-xs text-text-dim mt-2">
                    {constellation.links.length} connections
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Constellation Details */}
        <div className="cosmic-panel cosmic-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-text-high mb-4">
            Astronomical Inspiration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-white/5">
              <div className="font-semibold text-white mb-2">📖 Journal - Scorpius Animae</div>
              <div className="text-sm text-text-dim">
                Based on Scorpius, the scorpion constellation. S-curved path from claws to stinger represents introspective journey.
              </div>
            </div>
            <div className="p-4 rounded-lg bg-white/5">
              <div className="font-semibold text-white mb-2">🧠 Knowledge - Cassiopeia Mentis</div>
              <div className="text-sm text-text-dim">
                Based on Cassiopeia's iconic W/M shape. The crown of the queen represents the throne of wisdom.
              </div>
            </div>
            <div className="p-4 rounded-lg bg-white/5">
              <div className="font-semibold text-white mb-2">💪 Health - Orion Vitalis</div>
              <div className="text-sm text-text-dim">
                Based on Orion the Hunter with his famous belt, shoulders, and raised club. Represents peak physical form.
              </div>
            </div>
            <div className="p-4 rounded-lg bg-white/5">
              <div className="font-semibold text-white mb-2">💰 Finance - Taurus Aureus</div>
              <div className="text-sm text-text-dim">
                Based on Taurus the Bull. V-shaped horns rise upward, includes Aldebaran eye and Pleiades cluster.
              </div>
            </div>
            <div className="p-4 rounded-lg bg-white/5">
              <div className="font-semibold text-white mb-2">⚡ Productivity - Ursa Efficiens</div>
              <div className="text-sm text-text-dim">
                Based on Ursa Major's Big Dipper. Bowl holds tasks, handle extends to action, points to north star.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConstellationsTestPage;
