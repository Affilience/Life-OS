import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, BarChart2, Sparkles } from 'lucide-react';
import { useGamificationStore } from '../../../stores/gamificationStore';
import { useAvatarStore } from '../../../stores/avatarStore';
import { usePetStore, PET_DATABASE } from '../../../stores/petStore';
import { getStageByLevel } from '../../../data/avatarEvolution';
import { useGamificationModeStore, TERMINOLOGY, VISIBILITY } from '../../../stores/gamificationModeStore';
import AvatarRenderer from '../../avatar/AvatarRenderer';

const HeroSectionWidget = memo(function HeroSectionWidget() {
  const navigate = useNavigate();
  const { level, currentXP, xpToNextLevel } = useGamificationStore();
  const { prestige = 0, getHeroSpritePath } = useAvatarStore();
  const { activePets } = usePetStore();

  // Get gamification mode and terminology
  const mode = useGamificationModeStore((state) => state.mode);
  const getAvatarStageName = useGamificationModeStore((state) => state.getAvatarStageName);
  const terms = TERMINOLOGY[mode] || TERMINOLOGY.cosmic;
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;

  const xpPercentage = xpToNextLevel > 0 ? (currentXP / xpToNextLevel) * 100 : 0;
  const evolutionStage = getStageByLevel(level, prestige);

  // Get all active pets data
  const activePetsData = visibility.showPets && visibility.showPetSprites && activePets.length > 0
    ? activePets.map(petId => PET_DATABASE[petId]).filter(Boolean).slice(0, 6) // Max 6 pets in widget
    : [];

  // Use same sprite path as Character page for consistency
  const avatarSpritePath = evolutionStage
    ? getHeroSpritePath(evolutionStage.levelRequired, evolutionStage.name)
    : '/assets/avatar/evolution/hero_v3_stage_1_dreamer.png';

  // Get stage name based on mode
  const stageName = mode === 'cosmic'
    ? (evolutionStage?.name || 'Swordsman')
    : getAvatarStageName(evolutionStage?.levelRequired ? evolutionStage.levelRequired - 1 : 9);

  // Mode-specific container styling - uses theme CSS variables
  const containerStyle = mode === 'cosmic'
    ? 'bg-gradient-to-br from-primary-500/10 to-secondary/10 border-primary-500/20'
    : mode === 'professional'
      ? 'bg-gradient-to-br from-primary-500/10 to-secondary/10 border-primary-500/20'
      : 'bg-bg-2 border-border';

  // Mode-specific progress bar styling
  const progressBarStyle = mode === 'cosmic'
    ? 'from-primary-500 to-secondary'
    : mode === 'professional'
      ? 'from-primary-500 to-secondary'
      : 'from-text-muted to-text-secondary';

  // Mode-specific border color
  const borderStyle = mode === 'cosmic'
    ? 'border-primary-500/20'
    : mode === 'professional'
      ? 'border-primary-500/20'
      : 'border-border';

  // Pet position calculations for displaying around avatar
  const getPetPositions = (index, total) => {
    // Position pets around the avatar - supports up to 6 pets
    const positions = [
      { bottom: '-4px', right: '-4px' },   // bottom-right
      { bottom: '-4px', left: '-4px' },    // bottom-left
      { top: '-4px', right: '-4px' },      // top-right
      { top: '-4px', left: '-4px' },       // top-left
      { top: '50%', right: '-12px', transform: 'translateY(-50%)' },   // middle-right
      { top: '50%', left: '-12px', transform: 'translateY(-50%)' },    // middle-left
    ];
    return positions[index] || positions[0];
  };

  // Render the avatar/profile section based on mode
  const renderAvatarSection = () => {
    if (mode === 'cosmic' && visibility.showAvatar) {
      // Full pixel art avatar for Cosmic mode with all pets - no box, just the avatar
      return (
        <div
          className="flex-shrink-0 cursor-pointer hover:scale-105 transition-transform relative group"
          onClick={() => navigate('/character')}
        >
          {/* Subtle glow effect on hover */}
          <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity scale-75" />

          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Use AvatarRenderer to show equipped items */}
            <div className="relative z-10">
              <AvatarRenderer size={144} animate={true} showStats={false} />
            </div>

            {/* Show all active pets positioned around the avatar */}
            {activePetsData.map((pet, index) => (
              <div
                key={pet.id || index}
                className="absolute z-20 transition-transform hover:scale-110"
                style={getPetPositions(index, activePetsData.length)}
              >
                <img
                  src={pet.sprite}
                  alt={pet.name}
                  className="w-10 h-10 pixelated drop-shadow-lg"
                  style={{ imageRendering: 'pixelated' }}
                  title={pet.name}
                />
              </div>
            ))}

            {prestige > 0 && visibility.showAvatarEffects && (
              <div className="absolute -top-1 -right-1 z-30 bg-gradient-to-r from-primary-500 to-secondary rounded-full px-1.5 py-0.5 text-[10px] font-bold shadow-lg flex items-center gap-0.5 border border-white/20">
                <Sparkles className="w-2.5 h-2.5" />
                {prestige}
              </div>
            )}
          </div>
        </div>
      );
    } else if (mode === 'professional') {
      // Clean icon-based display for Professional mode
      return (
        <div
          className="flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
          onClick={() => navigate('/character')}
        >
          <div className="relative w-20 h-20 bg-gradient-to-br from-primary-500/20 to-secondary/20 border border-primary-500/30 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-primary-400" />
            <div className="absolute -bottom-1 -right-1 bg-primary-500 rounded-full px-2 py-0.5 text-xs font-bold text-text-primary">
              {level}
            </div>
          </div>
        </div>
      );
    } else {
      // Minimal display
      return (
        <div
          className="flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
          onClick={() => navigate('/character')}
        >
          <div className="relative w-16 h-16 bg-bg-2 border border-border rounded-xl flex items-center justify-center">
            <BarChart2 className="w-8 h-8 text-text-secondary" />
          </div>
        </div>
      );
    }
  };

  // Render level/milestone info based on mode
  const renderLevelInfo = () => {
    if (mode === 'cosmic') {
      return (
        <>
          <div className="flex items-baseline gap-2 mb-1">
            <h2 className="text-lg font-bold text-text-primary truncate">{stageName}</h2>
            <span className="text-sm text-primary-400 font-semibold">Lv.{level}</span>
          </div>
          <p className="text-xs text-text-secondary mb-2 truncate">
            {evolutionStage?.category || 'The Awakening'}
            {activePetsData.length > 0 && (
              <span className="ml-1 text-primary-400">
                • {activePetsData.length === 1
                  ? activePetsData[0].name
                  : `${activePetsData.length} companions`}
              </span>
            )}
          </p>
        </>
      );
    } else if (mode === 'professional') {
      return (
        <>
          <div className="flex items-baseline gap-2 mb-1">
            <h2 className="text-lg font-bold text-text-primary truncate">{terms.level} {level}</h2>
            <span className="text-sm text-primary-400 font-semibold">{stageName}</span>
          </div>
          <p className="text-xs text-text-secondary mb-2 truncate">
            Progress toward next milestone
          </p>
        </>
      );
    } else {
      // Minimal
      return (
        <>
          <div className="flex items-baseline gap-2 mb-1">
            <h2 className="text-lg font-bold text-text-primary truncate">Level {level}</h2>
          </div>
          <p className="text-xs text-text-secondary mb-2 truncate">
            {currentXP} / {xpToNextLevel} points
          </p>
        </>
      );
    }
  };

  return (
    <div className={`h-full ${containerStyle} border rounded-xl p-4 overflow-hidden`}>
      <div className="flex items-center gap-4 h-full">
        {/* Avatar/Profile Section */}
        {renderAvatarSection()}

        {/* Level & XP */}
        <div className="flex-1 min-w-0">
          {renderLevelInfo()}

          {/* XP Bar */}
          <div>
            <div className="flex justify-between text-xs text-text-secondary mb-1">
              <span>{currentXP} {terms.xp}</span>
              <span>
                {xpToNextLevel - currentXP} to {mode === 'cosmic' ? `Lv.${level + 1}` : `${terms.level} ${level + 1}`}
              </span>
            </div>
            <div className={`h-2 bg-bg-0 rounded-full overflow-hidden border ${borderStyle}`}>
              <div
                className={`h-full bg-gradient-to-r ${progressBarStyle} transition-all duration-500 relative overflow-hidden`}
                style={{ width: `${xpPercentage}%` }}
              >
                {mode === 'cosmic' && visibility.showParticleEffects && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default HeroSectionWidget;
