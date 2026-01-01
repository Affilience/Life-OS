/**
 * Pets Section - Mythological Companion Collection
 * Displays active pets, collection progress, and pet codex
 *
 * Supports gamification modes:
 * - Cosmic: Full pixel art pets with mythological names
 * - Professional: "Focus Boosters" with icons and percentages
 * - Minimal: Hidden (bonuses still apply silently)
 */

import React, { useState, useMemo } from 'react';
import { usePetStore, PET_DATABASE, TIER_INFO } from '../../stores/petStore';
import { Lock, Star, Sparkles, Crown, BookOpen, X, Zap, TrendingUp, Trophy, Coins, Sword, Heart, Brain, Eye, Shield } from 'lucide-react';
import Card from '../ui/Card';
import { useGamificationModeStore } from '../../stores/gamificationModeStore';
import UnlockBadge from '../shared/UnlockBadge';
import { PET_STAT_MAPPING } from '../../utils/statsSystem';

// Stat display config - shared across components
const STAT_CONFIG = {
  strength: { icon: Sword, color: '#EF4444', label: 'STR' },
  vitality: { icon: Heart, color: '#10B981', label: 'VIT' },
  intelligence: { icon: Brain, color: '#8B5CF6', label: 'INT' },
  wisdom: { icon: Eye, color: '#F59E0B', label: 'WIS' },
  defense: { icon: Shield, color: '#3B82F6', label: 'DEF' },
};

// Helper function to calculate stat contribution for a single pet
const getPetStatContribution = (pet) => {
  if (!pet) return {};
  const contributions = {};
  const petBonus = pet.bonusAmount || 0;
  const mapping = PET_STAT_MAPPING[pet.bonusType] || PET_STAT_MAPPING.universal;

  Object.entries(mapping).forEach(([stat, multiplier]) => {
    const value = Math.floor(petBonus * multiplier);
    if (value > 0) {
      contributions[stat] = value;
    }
  });

  return contributions;
};

const PetsSection = ({ forceShow = false }) => {
  const {
    ownedPets,
    activePets,
    maxSlots,
    equipPet,
    getCollectionStats,
    getActiveBonuses,
    isPetUnlocked,
    isPetActive,
  } = usePetStore();

  // Get gamification mode settings
  const { mode, getTerm, isVisible } = useGamificationModeStore();
  // If forceShow is true (e.g., on dedicated Pets page), always show full UI
  const showPets = forceShow || isVisible('showPets');
  const showPetSprites = forceShow || isVisible('showPetSprites');

  const [showCodex, setShowCodex] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [filterTier, setFilterTier] = useState('all');

  const stats = getCollectionStats();
  const activeBonuses = getActiveBonuses();

  // Calculate stat contributions from active pets
  const petStatContributions = useMemo(() => {
    const contributions = {
      strength: 0,
      vitality: 0,
      intelligence: 0,
      wisdom: 0,
      defense: 0,
    };

    activePets.forEach(petId => {
      const pet = PET_DATABASE[petId];
      if (!pet) return;

      const petBonus = pet.bonusAmount || 0;
      const mapping = PET_STAT_MAPPING[pet.bonusType] || PET_STAT_MAPPING.universal;

      Object.entries(mapping).forEach(([stat, multiplier]) => {
        contributions[stat] += Math.floor(petBonus * multiplier);
      });
    });

    return contributions;
  }, [activePets]);

  // Check if pets contribute any stats
  const hasStatContributions = Object.values(petStatContributions).some(v => v > 0);

  // Get active pet slots
  const activeSlots = Array.from({ length: maxSlots }, (_, i) => activePets[i] || null);
  const lockedSlots = Array.from({ length: 6 - maxSlots }, () => 'locked');

  // Get mode-appropriate terminology
  const companionsLabel = getTerm('activeCompanions');
  const codexLabel = getTerm('petCodex');

  // Don't render in minimal mode (bonuses still apply via store)
  if (!showPets) {
    // Show a minimal summary of active bonuses instead
    if (Object.keys(activeBonuses).length > 0) {
      return (
        <Card padding="sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
              Active Bonuses
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeBonuses).map(([type, amount]) => (
              <div
                key={type}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  color: '#4ade80',
                }}
              >
                +{amount}% {type.charAt(0).toUpperCase() + type.slice(1)}
              </div>
            ))}
          </div>
        </Card>
      );
    }
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Active Companions Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
            {mode === 'cosmic' ? (
              <Sparkles className="w-5 h-5 text-purple-400" />
            ) : (
              <Zap className="w-5 h-5 text-blue-400" />
            )}
            {companionsLabel}
          </h3>
          <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
            {activePets.length}/{maxSlots} {mode === 'cosmic' ? 'slots' : 'active'} • {stats.owned}/{stats.total} {mode === 'cosmic' ? 'collected' : 'unlocked'} ({stats.percentage}%)
          </p>
        </div>
        <button
          onClick={() => setShowCodex(true)}
          className="px-4 py-2 rounded-lg flex items-center gap-2"
          style={{
            background: mode === 'cosmic' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
            border: mode === 'cosmic' ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
            color: mode === 'cosmic' ? '#a78bfa' : '#60a5fa',
          }}
        >
          <BookOpen className="w-4 h-4" />
          {codexLabel}
        </button>
      </div>

      {/* Active Pet Slots */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {activeSlots.map((petId, index) => (
          <PetSlot
            key={`active-${index}`}
            petId={petId}
            slotNumber={index + 1}
            onSelect={setSelectedPet}
            onOpenCodex={() => setShowCodex(true)}
            forceShowSprites={forceShow}
          />
        ))}
        {lockedSlots.map((_, index) => (
          <LockedSlot key={`locked-${index}`} slotNumber={maxSlots + index + 1} />
        ))}
      </div>

      {/* Active Bonuses & Stat Contributions */}
      {(Object.keys(activeBonuses).length > 0 || hasStatContributions) && (
        <Card padding="sm">
          {/* XP Bonuses */}
          {Object.keys(activeBonuses).length > 0 && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
                  XP Bonuses
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {Object.entries(activeBonuses).map(([type, amount]) => (
                  <div
                    key={type}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      color: '#a78bfa',
                    }}
                  >
                    +{amount}% {type.charAt(0).toUpperCase() + type.slice(1)} XP
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Stat Contributions */}
          {hasStatContributions && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
                  Stat Bonuses from Companions
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(petStatContributions)
                  .filter(([_, value]) => value > 0)
                  .map(([stat, value]) => {
                    const config = STAT_CONFIG[stat];
                    const Icon = config.icon;
                    return (
                      <div
                        key={stat}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
                        style={{
                          background: `${config.color}15`,
                          border: `1px solid ${config.color}40`,
                          color: config.color,
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>+{value} {config.label}</span>
                      </div>
                    );
                  })}
              </div>
            </>
          )}
        </Card>
      )}

      {/* Pet Codex Modal */}
      {showCodex && (
        <PetCodexModal
          onClose={() => setShowCodex(false)}
          filterTier={filterTier}
          setFilterTier={setFilterTier}
          forceShowSprites={forceShow}
          selectedPet={selectedPet}
          setSelectedPet={setSelectedPet}
        />
      )}

      {/* Pet Detail Modal */}
      {selectedPet && !showCodex && (
        <PetDetailModal pet={selectedPet} onClose={() => setSelectedPet(null)} />
      )}
    </div>
  );
};

// Pet Slot Component
function PetSlot({ petId, slotNumber, onSelect, onOpenCodex, forceShowSprites = false }) {
  const { equipPet, isPetActive } = usePetStore();
  const { mode, isVisible, getTerm } = useGamificationModeStore();
  const showSprites = forceShowSprites || isVisible('showPetSprites');

  if (!petId) {
    return (
      <div
        className="aspect-square rounded-lg flex items-center justify-center border-2 border-dashed cursor-pointer hover:border-purple-500/50 transition-all"
        style={{
          background: 'rgba(39, 39, 42, 0.4)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
        onClick={onOpenCodex}
      >
        <div className="text-center">
          <div className="text-2xl mb-1">+</div>
          <div className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.38)' }}>
            {mode === 'cosmic' ? 'Empty' : 'Add'}
          </div>
        </div>
      </div>
    );
  }

  const pet = PET_DATABASE[petId];
  if (!pet) return null;

  const tierColor = TIER_INFO[pet.tier].color;
  const displayName = pet.name; // Use pet name directly from database
  const unequipLabel = getTerm('unequip');

  // Professional mode: show as icon-based booster card
  if (!showSprites) {
    return (
      <div
        className="aspect-square rounded-lg overflow-hidden cursor-pointer group relative flex flex-col items-center justify-center p-2"
        style={{
          background: 'rgba(39, 39, 42, 0.6)',
          border: `2px solid ${tierColor}40`,
        }}
        onClick={() => onSelect(pet)}
      >
        {/* Icon instead of sprite */}
        <Zap className="w-8 h-8 mb-1" style={{ color: tierColor }} />

        {/* Bonus text */}
        <div className="text-xs font-medium text-center" style={{ color: tierColor }}>
          {pet.bonusDescription.replace('+', '').replace(' XP', '')}
        </div>

        {/* Slot number */}
        <div
          className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-xs font-bold"
          style={{
            background: 'rgba(59, 130, 246, 0.2)',
            color: '#60a5fa',
          }}
        >
          {slotNumber}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              equipPet(petId);
            }}
            className="px-3 py-1 rounded bg-red-500 text-white text-xs font-medium"
          >
            {unequipLabel}
          </button>
        </div>
      </div>
    );
  }

  // Cosmic mode: full pixel art display
  return (
    <div
      className="aspect-square rounded-lg overflow-hidden cursor-pointer group relative"
      style={{
        background: 'rgba(39, 39, 42, 0.6)',
        border: `2px solid ${tierColor}40`,
      }}
      onClick={() => onSelect(pet)}
    >
      {/* Pet Image */}
      <img
        src={pet.sprite}
        alt={pet.name}
        className="w-full h-full object-contain pixelated p-2"
      />

      {/* Tier Badge */}
      <div
        className="absolute top-1 right-1 px-2 py-0.5 rounded text-xs font-bold"
        style={{
          background: tierColor,
          color: '#fff',
        }}
      >
        {slotNumber}
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            equipPet(petId);
          }}
          className="px-3 py-1 rounded bg-red-500 text-white text-xs font-medium"
        >
          {unequipLabel}
        </button>
      </div>
    </div>
  );
}

// Locked Slot Component
function LockedSlot({ slotNumber }) {
  return (
    <div
      className="aspect-square rounded-lg flex flex-col items-center justify-center border-2"
      style={{
        background: 'rgba(39, 39, 42, 0.2)',
        borderColor: 'rgba(255, 255, 255, 0.05)',
      }}
    >
      <Lock className="w-6 h-6 mb-1" style={{ color: 'rgba(255, 255, 255, 0.2)' }} />
      <div className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.2)' }}>
        Lvl {slotNumber * 15}
      </div>
    </div>
  );
}

// Tier order for sorting (common first, mythic last)
const TIER_ORDER = ['common', 'uncommon', 'rare', 'epic', 'mythic'];

// Pet Codex Modal
function PetCodexModal({ onClose, filterTier, setFilterTier, selectedPet, setSelectedPet, forceShowSprites = false }) {
  const { isPetUnlocked, equipPet, isPetActive } = usePetStore();

  // Get all pets sorted by tier (rarity order)
  const allPetsSorted = Object.values(PET_DATABASE).sort((a, b) => {
    const tierAIndex = TIER_ORDER.indexOf(a.tier);
    const tierBIndex = TIER_ORDER.indexOf(b.tier);
    if (tierAIndex !== tierBIndex) return tierAIndex - tierBIndex;
    // Within same tier, sort alphabetically by name
    return a.name.localeCompare(b.name);
  });

  // Get all pets grouped by tier (also sorted)
  const petsByTier = allPetsSorted.reduce((acc, pet) => {
    if (!acc[pet.tier]) acc[pet.tier] = [];
    acc[pet.tier].push(pet);
    return acc;
  }, {});

  const displayPets =
    filterTier === 'all'
      ? allPetsSorted
      : petsByTier[filterTier] || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[90vh] rounded-xl overflow-hidden"
        style={{
          background: 'rgba(24, 24, 27, 0.95)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6"
          style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.3)' }}
        >
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
              <BookOpen className="w-6 h-6 text-purple-400" />
              Pet Codex
            </h2>
            <p className="text-sm mt-1" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
              Mythological companions from cultures worldwide
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tier Filter */}
        <div className="flex gap-2 p-4 overflow-x-auto" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
          <FilterButton
            active={filterTier === 'all'}
            onClick={() => setFilterTier('all')}
            label="All"
          />
          {Object.entries(TIER_INFO).map(([tier, info]) => (
            <FilterButton
              key={tier}
              active={filterTier === tier}
              onClick={() => setFilterTier(tier)}
              label={info.name}
              color={info.color}
            />
          ))}
        </div>

        {/* Pet Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {displayPets.map(pet => (
              <PetCard
                key={pet.id}
                pet={pet}
                unlocked={isPetUnlocked(pet.id)}
                active={isPetActive(pet.id)}
                onClick={() => setSelectedPet(pet)}
                onEquip={equipPet}
                forceShowSprites={forceShowSprites}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Pet Detail Overlay */}
      {selectedPet && (
        <PetDetailModal pet={selectedPet} onClose={() => setSelectedPet(null)} />
      )}
    </div>
  );
}

// Filter Button
function FilterButton({ active, onClick, label, color }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0"
      style={{
        background: active ? (color ? `${color}20` : 'rgba(139, 92, 246, 0.2)') : 'rgba(39, 39, 42, 0.4)',
        border: active
          ? `1px solid ${color || '#8b5cf6'}`
          : '1px solid rgba(255, 255, 255, 0.04)',
        color: active ? (color || '#a78bfa') : 'rgba(255, 255, 255, 0.60)',
      }}
    >
      {label}
    </button>
  );
}

// Pet Card in Codex
function PetCard({ pet, unlocked, active, onClick, onEquip, forceShowSprites = false }) {
  const tierColor = TIER_INFO[pet.tier].color;
  const { mode, isVisible, getTerm } = useGamificationModeStore();
  const showSprites = forceShowSprites || isVisible('showPetSprites');

  const displayName = pet.name; // Use pet name directly from database
  const equipLabel = getTerm('equip');

  // Calculate stat contributions for this pet
  const statContributions = getPetStatContribution(pet);
  const hasStats = Object.keys(statContributions).length > 0;

  // Professional tier labels
  const professionalTierNames = {
    common: 'Basic',
    uncommon: 'Standard',
    rare: 'Advanced',
    epic: 'Premium',
    mythic: 'Elite',
  };

  const tierLabel = mode === 'cosmic' ? TIER_INFO[pet.tier].name : professionalTierNames[pet.tier];

  return (
    <div
      className="rounded-lg overflow-hidden cursor-pointer group relative"
      style={{
        background: 'rgba(39, 39, 42, 0.6)',
        border: `2px solid ${tierColor}40`,
        opacity: unlocked ? 1 : 0.5,
      }}
      onClick={onClick}
    >
      {/* Pet Image/Icon */}
      <div className="aspect-square p-4 relative">
        {unlocked ? (
          showSprites ? (
            <img
              src={pet.sprite}
              alt={pet.name}
              className="w-full h-full object-contain pixelated"
            />
          ) : (
            /* Professional mode: show icon */
            <div className="w-full h-full flex flex-col items-center justify-center">
              <Zap className="w-12 h-12 mb-2" style={{ color: tierColor }} />
              <div className="text-sm font-bold" style={{ color: tierColor }}>
                {pet.bonusDescription.split(' ')[0]}
              </div>
            </div>
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Lock className="w-12 h-12" style={{ color: 'rgba(255, 255, 255, 0.2)' }} />
          </div>
        )}

        {active && (
          <div className="absolute top-2 right-2">
            {mode === 'cosmic' ? (
              <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            ) : (
              <div className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400 font-medium">
                Active
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pet Info */}
      <div className="p-3 border-t" style={{ borderColor: `${tierColor}40` }}>
        <div className="text-sm font-semibold mb-1" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
          {unlocked ? displayName : '???'}
        </div>
        <div className="text-xs mb-2" style={{ color: 'rgba(255, 255, 255, 0.38)' }}>
          {mode === 'cosmic' && `${pet.culture} • `}{tierLabel}
        </div>
        {unlocked ? (
          <>
            <div className="text-xs font-medium" style={{ color: tierColor }}>
              {pet.bonusDescription}
            </div>
            {/* Stat Contributions */}
            {hasStats && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {Object.entries(statContributions).map(([stat, value]) => {
                  const config = STAT_CONFIG[stat];
                  const Icon = config.icon;
                  return (
                    <div
                      key={stat}
                      className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium"
                      style={{
                        background: `${config.color}15`,
                        color: config.color,
                      }}
                      title={`+${value} ${stat.charAt(0).toUpperCase() + stat.slice(1)}`}
                    >
                      <Icon className="w-2.5 h-2.5" />
                      <span>+{value}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <UnlockBadge
            method={pet.unlockMethod}
            description={pet.unlockDescription}
            requirement={pet.unlockRequirement}
            size="sm"
          />
        )}
      </div>

      {/* Equip Button on Hover */}
      {unlocked && !active && (
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEquip(pet.id);
            }}
            className="px-4 py-2 rounded-lg font-medium"
            style={{
              background: tierColor,
              color: '#fff',
            }}
          >
            {equipLabel}
          </button>
        </div>
      )}
    </div>
  );
}

// Pet Detail Modal
function PetDetailModal({ pet, onClose }) {
  const { equipPet, isPetActive, isPetUnlocked } = usePetStore();
  const tierColor = TIER_INFO[pet.tier].color;
  const unlocked = isPetUnlocked(pet.id);
  const active = isPetActive(pet.id);

  // Calculate stat contributions for this pet
  const statContributions = getPetStatContribution(pet);
  const hasStats = Object.keys(statContributions).length > 0;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-4 pt-16 sm:p-4"
      style={{ background: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl max-h-[75vh] sm:max-h-[90vh] rounded-2xl sm:rounded-xl overflow-hidden flex flex-col"
        style={{
          background: 'rgba(24, 24, 27, 0.98)',
          border: `2px solid ${tierColor}`,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-6"
          style={{
            background: `linear-gradient(to bottom, ${tierColor}20, transparent)`,
            borderBottom: `1px solid ${tierColor}40`,
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold" style={{ color: tierColor }}>
                  {unlocked ? pet.name : '???'}
                </h2>
                {active && <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400" />}
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
                <span>{pet.culture} Mythology</span>
                <span>•</span>
                <span style={{ color: tierColor }}>{TIER_INFO[pet.tier].name} Tier</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Image */}
          <div className="flex justify-center">
            <div
              className="w-32 h-32 sm:w-48 sm:h-48 rounded-xl flex items-center justify-center"
              style={{
                background: `${tierColor}10`,
                border: `2px solid ${tierColor}40`,
              }}
            >
              {unlocked ? (
                <img
                  src={pet.sprite}
                  alt={pet.name}
                  className="w-full h-full object-contain pixelated p-4"
                />
              ) : (
                <Lock className="w-16 h-16 sm:w-24 sm:h-24" style={{ color: 'rgba(255, 255, 255, 0.2)' }} />
              )}
            </div>
          </div>

          {unlocked ? (
            <>
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
                  Description
                </h3>
                <p className="text-sm sm:text-base" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>{pet.description}</p>
              </div>

              {/* Lore */}
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
                  Lore
                </h3>
                <p className="italic text-sm sm:text-base" style={{ color: 'rgba(255, 255, 255, 0.70)' }}>
                  {pet.lore}
                </p>
              </div>

              {/* Bonus */}
              <div
                className="p-3 sm:p-4 rounded-lg"
                style={{
                  background: `${tierColor}10`,
                  border: `1px solid ${tierColor}40`,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4" style={{ color: tierColor }} />
                  <span className="text-sm font-semibold" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
                    Companion Bonus
                  </span>
                </div>
                <p className="font-bold text-sm sm:text-base" style={{ color: tierColor }}>
                  {pet.bonusDescription}
                </p>
              </div>

              {/* Stat Contributions */}
              {hasStats && (
                <div
                  className="p-3 sm:p-4 rounded-lg"
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
                      Stat Contributions
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(statContributions).map(([stat, value]) => {
                      const config = STAT_CONFIG[stat];
                      const Icon = config.icon;
                      return (
                        <div
                          key={stat}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
                          style={{
                            background: `${config.color}20`,
                            border: `1px solid ${config.color}40`,
                            color: config.color,
                          }}
                        >
                          <Icon className="w-4 h-4" />
                          <span>+{value} {stat.charAt(0).toUpperCase() + stat.slice(1)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4 sm:py-8 pb-8">
              <Lock className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: 'rgba(255, 255, 255, 0.2)' }} />
              <h3 className="text-lg font-bold mb-2" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
                Locked
              </h3>
              <div className="flex justify-center pb-6">
                <UnlockBadge
                  method={pet.unlockMethod}
                  description={pet.unlockDescription}
                  requirement={pet.unlockRequirement}
                  size="md"
                  showLabel={true}
                />
              </div>
            </div>
          )}
        </div>

        {/* Fixed Actions Footer - Always visible */}
        {unlocked && (
          <div
            className="flex-shrink-0 p-4 pb-6 sm:p-6 border-t"
            style={{ borderColor: `${tierColor}40`, background: 'rgba(24, 24, 27, 0.98)' }}
          >
            <button
              onClick={() => equipPet(pet.id)}
              className="w-full px-6 py-3 sm:py-4 rounded-lg font-semibold text-sm sm:text-base"
              style={{
                background: active ? 'rgba(239, 68, 68, 0.2)' : tierColor,
                color: active ? '#ef4444' : '#fff',
                border: active ? '1px solid #ef4444' : 'none',
              }}
            >
              {active ? 'Unequip' : 'Equip Companion'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PetsSection;
