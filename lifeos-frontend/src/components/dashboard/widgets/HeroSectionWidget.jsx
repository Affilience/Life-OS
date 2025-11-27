import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGamificationStore } from '../../../stores/gamificationStore';
import { useAvatarStore } from '../../../stores/avatarStore';
import { usePetStore, PET_DATABASE } from '../../../stores/petStore';
import { getStageByLevel } from '../../../data/avatarEvolution';

export default function HeroSectionWidget() {
  const navigate = useNavigate();
  const { level, currentXP, xpToNextLevel } = useGamificationStore();
  const { prestige = 0 } = useAvatarStore();
  const { activePets } = usePetStore();

  const xpPercentage = xpToNextLevel > 0 ? (currentXP / xpToNextLevel) * 100 : 0;
  const evolutionStage = getStageByLevel(level, prestige);
  const activePet = activePets.length > 0 ? PET_DATABASE[activePets[0]] : null;

  return (
    <div className="h-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 overflow-hidden">
      <div className="flex items-center gap-4 h-full">
        {/* Avatar with Pet */}
        <div
          className="flex-shrink-0 cursor-pointer hover:scale-105 transition-transform relative"
          onClick={() => navigate('/character')}
        >
          <div className="relative w-28 h-28 bg-[#0c0a10] rounded-xl flex items-center justify-center p-2">
            <img
              src="/assets/avatar/evolution/hero_v3_stage_10_swordsman.png"
              alt="Avatar"
              className="w-24 h-24 pixelated"
              style={{ imageRendering: 'pixelated' }}
            />

            {activePet && (
              <div className="absolute bottom-1 right-1">
                <img
                  src={activePet.sprite}
                  alt={activePet.name}
                  className="w-10 h-10 pixelated"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            )}

            {prestige > 0 && (
              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-1.5 py-0.5 text-xs font-bold shadow-lg">
                ✨ {prestige}
              </div>
            )}
          </div>
        </div>

        {/* Level & XP */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <h2 className="text-lg font-bold text-white truncate">Swordsman</h2>
            <span className="text-sm text-purple-400 font-semibold">Lv.{level}</span>
          </div>

          <p className="text-xs text-white/60 mb-2 truncate">
            Stage {evolutionStage?.stage || 10} • Warrior Path
            {activePet && <span className="ml-1 text-purple-400">• {activePet.name}</span>}
          </p>

          {/* XP Bar */}
          <div>
            <div className="flex justify-between text-xs text-white/60 mb-1">
              <span>{currentXP} XP</span>
              <span>{xpToNextLevel} to Lv.{level + 1}</span>
            </div>
            <div className="h-2 bg-[#0c0a10] rounded-full overflow-hidden border border-purple-500/20">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 relative overflow-hidden"
                style={{ width: `${xpPercentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
