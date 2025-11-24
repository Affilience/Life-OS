/**
 * ConstellationsDemo - Interactive demo page for constellation progression system
 * Allows testing all 5 module constellations with XP slider
 */

import React, { useState } from 'react';
import { ConstellationModulePanel } from '../ConstellationModulePanel';
import { useModuleConstellationWithXP } from '../hooks/useModuleConstellation';
import type { ModuleId } from '../constellations.types';

const MODULES: { id: ModuleId; name: string; description: string }[] = [
  { id: 'journal', name: 'Journal', description: 'Track your thoughts and reflections' },
  { id: 'knowledge', name: 'Knowledge', description: 'Build your personal library' },
  { id: 'health', name: 'Health', description: 'Optimize your vitality' },
  { id: 'finance', name: 'Finance', description: 'Grow your prosperity' },
  { id: 'productivity', name: 'Productivity', description: 'Master your workflow' }
];

export const ConstellationsDemo: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<ModuleId>('journal');
  const [xpValue, setXpValue] = useState(0);

  // Get constellation data with manual XP override
  const { constellation, state, currentXp } = useModuleConstellationWithXP(
    selectedModule,
    xpValue
  );

  const maxXp = constellation.maxXp;

  return (
    <div className="min-h-screen bg-bg-0 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-text-high">
            Constellation Progression System
          </h1>
          <p className="text-text-med text-lg">
            Interactive demo of module-based constellation progression
          </p>
        </div>

        {/* Controls */}
        <div className="bg-bg-2 rounded-xl border border-white/10 p-6 space-y-6">
          {/* Module Selector */}
          <div className="space-y-3">
            <label className="block text-text-high font-semibold">
              Select Module
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {MODULES.map((module) => (
                <button
                  key={module.id}
                  onClick={() => setSelectedModule(module.id)}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${selectedModule === module.id
                      ? 'border-white/30 bg-white/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }
                  `}
                >
                  <div className="font-semibold text-text-high">{module.name}</div>
                  <div className="text-xs text-text-dim mt-1">{module.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* XP Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-text-high font-semibold">
                XP Amount
              </label>
              <div className="text-text-med font-mono">
                {xpValue.toLocaleString()} / {maxXp.toLocaleString()} XP
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={maxXp}
              step={100}
              value={xpValue}
              onChange={(e) => setXpValue(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-accent
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-accent
                [&::-moz-range-thumb]:border-0
                [&::-moz-range-thumb]:cursor-pointer"
            />
          </div>

          {/* Quick XP Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setXpValue(0)}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-high text-sm transition-colors"
            >
              0 XP
            </button>
            <button
              onClick={() => setXpValue(Math.floor(maxXp * 0.25))}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-high text-sm transition-colors"
            >
              25%
            </button>
            <button
              onClick={() => setXpValue(Math.floor(maxXp * 0.5))}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-high text-sm transition-colors"
            >
              50%
            </button>
            <button
              onClick={() => setXpValue(Math.floor(maxXp * 0.75))}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-high text-sm transition-colors"
            >
              75%
            </button>
            <button
              onClick={() => setXpValue(maxXp)}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-high text-sm transition-colors"
            >
              100%
            </button>
          </div>
        </div>

        {/* Constellation Display */}
        <ConstellationModulePanel
          constellation={constellation}
          state={state}
          currentXp={currentXp}
        />

        {/* Constellation Details */}
        <div className="bg-bg-2 rounded-xl border border-white/10 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-text-high">
            Constellation Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-text-dim text-sm">Display Name</div>
              <div className="text-text-high font-medium">{constellation.displayName}</div>
            </div>
            <div className="space-y-1">
              <div className="text-text-dim text-sm">Total Stars</div>
              <div className="text-text-high font-medium">{constellation.stars.length}</div>
            </div>
            <div className="space-y-1">
              <div className="text-text-dim text-sm">Stars Unlocked</div>
              <div className="text-text-high font-medium">{state.unlockedStars.length}</div>
            </div>
            <div className="space-y-1">
              <div className="text-text-dim text-sm">Total Links</div>
              <div className="text-text-high font-medium">{constellation.links.length}</div>
            </div>
            <div className="space-y-1">
              <div className="text-text-dim text-sm">Progress</div>
              <div className="text-text-high font-medium">{Math.round(state.progress * 100)}%</div>
            </div>
            <div className="space-y-1">
              <div className="text-text-dim text-sm">Max XP</div>
              <div className="text-text-high font-medium">{maxXp.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Star List */}
        <div className="bg-bg-2 rounded-xl border border-white/10 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-text-high">
            Star Progression
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {constellation.stars.map((star) => {
              const isUnlocked = state.unlockedStars.includes(star.id);
              return (
                <div
                  key={star.id}
                  className={`
                    p-4 rounded-lg border transition-all
                    ${isUnlocked
                      ? 'border-accent/30 bg-accent/10'
                      : 'border-white/10 bg-white/5'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`
                          w-2 h-2 rounded-full
                          ${isUnlocked ? 'bg-accent' : 'bg-white/20'}
                        `} />
                        <span className={`
                          font-medium
                          ${isUnlocked ? 'text-text-high' : 'text-text-dim'}
                        `}>
                          {star.label || star.id}
                        </span>
                        {star.importance === 'core' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                            Core
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-text-dim mt-1">
                        {star.requirementXp.toLocaleString()} XP required
                      </div>
                    </div>
                    {isUnlocked && (
                      <div className="text-accent">✓</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
