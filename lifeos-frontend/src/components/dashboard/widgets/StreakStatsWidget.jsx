import React from 'react';
import { Flame, Coins, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGamificationStore } from '../../../stores/gamificationStore';

export default function StreakStatsWidget() {
  const navigate = useNavigate();
  const { streak = 0, credits = 0 } = useGamificationStore();

  return (
    <div className="h-full bg-[#1a1724] border border-white/10 rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          <span className="text-sm font-bold text-white">{streak}</span>
          <span className="text-xs text-white/60">day streak</span>
        </div>
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-400" />
          <span className="text-sm font-bold text-white">{credits}</span>
          <span className="text-xs text-white/60">credits</span>
        </div>
      </div>
      <button
        onClick={() => navigate('/character')}
        className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
      >
        View Character
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}
