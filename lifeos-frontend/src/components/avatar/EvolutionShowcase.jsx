import React, { useState } from 'react';
import { ArrowLeft, Crown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './EvolutionShowcase.css';

// V3 Evolution stages data
const V3_STAGES = [
  { stage: 1, name: 'Dreamer', level: 1 },
  { stage: 2, name: 'Seeker', level: 3 },
  { stage: 3, name: 'Recruit', level: 5 },
  { stage: 4, name: 'Trainee', level: 7 },
  { stage: 5, name: 'Squire', level: 9 },
  { stage: 6, name: 'Initiate', level: 11 },
  { stage: 7, name: 'Footman', level: 13 },
  { stage: 8, name: 'Scout', level: 15 },
  { stage: 9, name: 'Warrior', level: 17 },
  { stage: 10, name: 'Swordsman', level: 19 },
  { stage: 11, name: 'Duelist', level: 21 },
  { stage: 12, name: 'Berserker', level: 23 },
  { stage: 13, name: 'Knight', level: 25 },
  { stage: 14, name: 'Ranger', level: 27 },
  { stage: 15, name: 'Paladin', level: 29 },
  { stage: 16, name: 'Monk', level: 31 },
  { stage: 17, name: 'Assassin', level: 33 },
  { stage: 18, name: 'Battlemage', level: 35 },
  { stage: 19, name: 'Champion', level: 37 },
  { stage: 20, name: 'Veteran', level: 39 },
  { stage: 21, name: 'Blade Master', level: 41 },
  { stage: 22, name: 'War Chief', level: 43 },
  { stage: 23, name: 'Dragon Knight', level: 45 },
  { stage: 24, name: 'Shadow Master', level: 47 },
  { stage: 25, name: 'Holy Crusader', level: 49 },
  { stage: 26, name: 'Arcane Warrior', level: 51 },
  { stage: 27, name: 'Beast Master', level: 53 },
  { stage: 28, name: 'Demon Hunter', level: 55 },
  { stage: 29, name: 'Storm Lord', level: 57 },
  { stage: 30, name: 'Warlord', level: 59 },
  { stage: 31, name: 'Sword Saint', level: 61 },
  { stage: 32, name: 'Phoenix Knight', level: 63 },
  { stage: 33, name: 'Void Stalker', level: 65 },
  { stage: 34, name: 'Celestial Guardian', level: 67 },
  { stage: 35, name: 'Titan Slayer', level: 69 },
  { stage: 36, name: 'Elemental Lord', level: 71 },
  { stage: 37, name: 'Immortal Champion', level: 73 },
  { stage: 38, name: 'Godslayer', level: 75 },
  { stage: 39, name: 'Ascendant', level: 77 },
  { stage: 40, name: 'Avatar of Mastery', level: 80 },
];

export default function EvolutionShowcase() {
  const navigate = useNavigate();
  const [selectedStage, setSelectedStage] = useState(null);
  const currentLevel = 12; // Mock current level

  const getSpritePath = (stage) => {
    const stageName = stage.name.toLowerCase().replace(/ /g, '_');
    return `/assets/avatar/evolution/hero_v3_stage_${stage.stage}_${stageName}.png`;
  };

  const isUnlocked = (requiredLevel) => currentLevel >= requiredLevel;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="px-6 py-4">
          <button
            onClick={() => navigate('/character')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Character</span>
          </button>

          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Crown className="w-6 h-6 text-purple-400" />
            Evolution Gallery
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            All 40 evolution stages • Current: Stage 10 (Swordsman)
          </p>
        </div>

        {/* Level Progress */}
        <div className="px-6 pb-4">
          <div className="bg-[#1a1a1a] border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Your Progress</span>
              <span className="text-sm font-semibold text-white">Level {currentLevel}</span>
            </div>
            <div className="h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                style={{ width: `${(currentLevel / 80) * 100}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {V3_STAGES.filter(s => isUnlocked(s.level)).length} / {V3_STAGES.length} stages unlocked
            </div>
          </div>
        </div>
      </div>

      {/* Evolution Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {V3_STAGES.map((stage) => {
            const unlocked = isUnlocked(stage.level);
            const isSelected = selectedStage?.stage === stage.stage;

            return (
              <div
                key={stage.stage}
                onClick={() => setSelectedStage(stage)}
                className={`
                  bg-[#1a1a1a] border rounded-2xl p-4 cursor-pointer transition-all
                  hover:transform hover:-translate-y-1
                  ${isSelected
                    ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                    : 'border-white/20 hover:border-purple-500/50'
                  }
                `}
              >
                {/* Stage Number */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-purple-400">
                    Stage {stage.stage}
                  </span>
                  {stage.stage === 10 && (
                    <div className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-500/30">
                      Current
                    </div>
                  )}
                  {stage.stage === 40 && (
                    <Crown className="w-4 h-4 text-yellow-400" />
                  )}
                </div>

                {/* Avatar Sprite */}
                <div className="aspect-square bg-[#0a0a0a] rounded-xl mb-3 flex items-center justify-center overflow-hidden relative">
                  <img
                    src={getSpritePath(stage)}
                    alt={stage.name}
                    className="w-full h-full object-contain"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div style={{ display: 'none' }} className="w-full h-full items-center justify-center text-4xl">
                    ❓
                  </div>
                </div>

                {/* Stage Name */}
                <h3 className="text-sm font-semibold mb-1 text-white">
                  {stage.name}
                </h3>

                {/* Level Requirement */}
                <div className="flex items-center gap-1 text-xs">
                  <Zap className="w-3 h-3 text-purple-400" />
                  <span className="text-gray-400">
                    Level {stage.level}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Modal */}
      {selectedStage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedStage(null)}
        >
          <div
            className="bg-[#1a1a1a] border border-purple-500/30 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Large Avatar */}
            <div className="aspect-square bg-[#0a0a0a] rounded-xl mb-4 flex items-center justify-center overflow-hidden">
              <img
                src={getSpritePath(selectedStage)}
                alt={selectedStage.name}
                className="w-full h-full object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            {/* Stage Info */}
            <div className="text-center">
              <div className="text-sm text-purple-400 font-semibold mb-1">
                Stage {selectedStage.stage} of 40
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedStage.name}
              </h2>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-4">
                <Zap className="w-4 h-4 text-purple-400" />
                <span>Unlocks at Level {selectedStage.level}</span>
              </div>

              {/* Status */}
              <div className="bg-green-500/20 text-green-400 text-sm px-4 py-2 rounded-lg border border-green-500/30">
                ✓ Unlocked
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedStage(null)}
                className="mt-4 w-full px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
