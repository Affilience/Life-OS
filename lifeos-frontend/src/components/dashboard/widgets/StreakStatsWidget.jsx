import React from 'react';
import { Flame, Coins, ChevronRight, TrendingUp, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGamificationStore } from '../../../stores/gamificationStore';
import { useGamificationModeStore, TERMINOLOGY, VISIBILITY } from '../../../stores/gamificationModeStore';
import CosmicFlame from '../../../features/streaks/components/CosmicFlame';

export default function StreakStatsWidget() {
  const navigate = useNavigate();
  const { streak = 0, credits = 0 } = useGamificationStore();

  // Get gamification mode and terminology
  const mode = useGamificationModeStore((state) => state.mode);
  const terms = TERMINOLOGY[mode] || TERMINOLOGY.cosmic;
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;

  // Mode-aware settings
  const showFlame = visibility.showStreakFlame;
  const linkLabel = mode === 'cosmic' ? 'View Character' : 'View Profile';

  // Mode-specific streak display
  const renderStreakDisplay = () => {
    if (mode === 'cosmic' && showFlame) {
      return (
        <div className="flex items-center gap-2">
          <CosmicFlame streak={streak} size="sm" />
          <span className="text-sm font-bold text-text-primary">{streak}</span>
          <span className="text-xs text-text-muted">day {terms.streak.toLowerCase()}</span>
        </div>
      );
    } else if (mode === 'professional') {
      return (
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-400" />
          <span className="text-sm font-bold text-text-primary">{streak}</span>
          <span className="text-xs text-text-muted">day {terms.streak.toLowerCase()}</span>
        </div>
      );
    } else {
      // Minimal mode
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-text-primary">{streak}</span>
          <span className="text-xs text-text-muted">day streak</span>
        </div>
      );
    }
  };

  // Mode-specific credits display
  const renderCreditsDisplay = () => {
    if (mode === 'cosmic') {
      return (
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-warning" />
          <span className="text-sm font-bold text-text-primary">{credits}</span>
          <span className="text-xs text-text-muted">{terms.credits.toLowerCase()}</span>
        </div>
      );
    } else if (mode === 'professional') {
      return (
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-success" />
          <span className="text-sm font-bold text-text-primary">{credits}</span>
          <span className="text-xs text-text-muted">{terms.credits.toLowerCase()}</span>
        </div>
      );
    } else {
      // Minimal mode
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-text-primary">{credits}</span>
          <span className="text-xs text-text-muted">pts</span>
        </div>
      );
    }
  };

  // Mode-specific styling
  const containerStyle = mode === 'cosmic'
    ? 'bg-gradient-to-r from-bg-1 to-bg-2 border-primary-500/20'
    : mode === 'professional'
      ? 'bg-bg-1 border-primary-500/20'
      : 'bg-bg-1 border-border';

  return (
    <div className={`h-full ${containerStyle} border rounded-xl p-4 flex items-center justify-between`}>
      <div className="flex items-center gap-6">
        {renderStreakDisplay()}
        {renderCreditsDisplay()}
      </div>
      <button
        onClick={() => navigate('/character')}
        className={`text-xs flex items-center gap-1 transition-colors ${
          mode === 'cosmic'
            ? 'text-primary-400 hover:text-primary-300'
            : mode === 'professional'
              ? 'text-primary-400 hover:text-primary-300'
              : 'text-text-muted hover:text-text-primary'
        }`}
      >
        {linkLabel}
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}
