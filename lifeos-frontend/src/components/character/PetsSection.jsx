/**
 * Pets Section - Mythological Companion Collection
 * Displays active pets, collection progress, and pet codex
 */

import React, { useState } from 'react';
import { usePetStore, PET_DATABASE, TIER_INFO } from '../../stores/petStore';
import { Lock, Star, Sparkles, Crown, BookOpen, X } from 'lucide-react';
import Card from '../ui/Card';

const PetsSection = () => {
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

  const [showCodex, setShowCodex] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [filterTier, setFilterTier] = useState('all');

  const stats = getCollectionStats();
  const activeBonuses = getActiveBonuses();

  // Get active pet slots
  const activeSlots = Array.from({ length: maxSlots }, (_, i) => activePets[i] || null);
  const lockedSlots = Array.from({ length: 6 - maxSlots }, () => 'locked');

  return (
    <div className="space-y-4">
      {/* Active Companions Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
            <Sparkles className="w-5 h-5 text-purple-400" />
            Active Companions
          </h3>
          <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
            {activePets.length}/{maxSlots} slots • {stats.owned}/{stats.total} collected ({stats.percentage}%)
          </p>
        </div>
        <button
          onClick={() => setShowCodex(true)}
          className="px-4 py-2 rounded-lg flex items-center gap-2"
          style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            color: '#a78bfa',
          }}
        >
          <BookOpen className="w-4 h-4" />
          Pet Codex
        </button>
      </div>

      {/* Active Pet Slots */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {activeSlots.map((petId, index) => (
          <PetSlot
            key={`active-${index}`}
            petId={petId}
            slotNumber={index + 1}
            onSelect={setSelectedPet}
            onOpenCodex={() => setShowCodex(true)}
          />
        ))}
        {lockedSlots.map((_, index) => (
          <LockedSlot key={`locked-${index}`} slotNumber={maxSlots + index + 1} />
        ))}
      </div>

      {/* Active Bonuses */}
      {Object.keys(activeBonuses).length > 0 && (
        <Card padding="sm">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-yellow-400" />
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
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  color: '#a78bfa',
                }}
              >
                +{amount}% {type.charAt(0).toUpperCase() + type.slice(1)} XP
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Pet Codex Modal */}
      {showCodex && (
        <PetCodexModal
          onClose={() => setShowCodex(false)}
          filterTier={filterTier}
          setFilterTier={setFilterTier}
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
function PetSlot({ petId, slotNumber, onSelect, onOpenCodex }) {
  const { equipPet, isPetActive } = usePetStore();

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
            Empty
          </div>
        </div>
      </div>
    );
  }

  const pet = PET_DATABASE[petId];
  if (!pet) return null;

  const tierColor = TIER_INFO[pet.tier].color;

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
          Unequip
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

// Pet Codex Modal
function PetCodexModal({ onClose, filterTier, setFilterTier, selectedPet, setSelectedPet }) {
  const { isPetUnlocked, equipPet, isPetActive } = usePetStore();

  // Get all pets grouped by tier
  const petsByTier = Object.values(PET_DATABASE).reduce((acc, pet) => {
    if (!acc[pet.tier]) acc[pet.tier] = [];
    acc[pet.tier].push(pet);
    return acc;
  }, {});

  const displayPets =
    filterTier === 'all'
      ? Object.values(PET_DATABASE)
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
      className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
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
function PetCard({ pet, unlocked, active, onClick, onEquip }) {
  const tierColor = TIER_INFO[pet.tier].color;

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
      {/* Pet Image */}
      <div className="aspect-square p-4 relative">
        {unlocked ? (
          <img
            src={pet.sprite}
            alt={pet.name}
            className="w-full h-full object-contain pixelated"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Lock className="w-12 h-12" style={{ color: 'rgba(255, 255, 255, 0.2)' }} />
          </div>
        )}

        {active && (
          <div className="absolute top-2 right-2">
            <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          </div>
        )}
      </div>

      {/* Pet Info */}
      <div className="p-3 border-t" style={{ borderColor: `${tierColor}40` }}>
        <div className="text-sm font-semibold mb-1" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
          {unlocked ? pet.name : '???'}
        </div>
        <div className="text-xs mb-2" style={{ color: 'rgba(255, 255, 255, 0.38)' }}>
          {pet.culture} • {TIER_INFO[pet.tier].name}
        </div>
        {unlocked && (
          <div className="text-xs font-medium" style={{ color: tierColor }}>
            {pet.bonusDescription}
          </div>
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
            Equip
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

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl overflow-hidden"
        style={{
          background: 'rgba(24, 24, 27, 0.98)',
          border: `2px solid ${tierColor}`,
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image */}
          <div className="flex justify-center">
            <div
              className="w-48 h-48 rounded-xl flex items-center justify-center"
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
                <Lock className="w-24 h-24" style={{ color: 'rgba(255, 255, 255, 0.2)' }} />
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
                <p style={{ color: 'rgba(255, 255, 255, 0.87)' }}>{pet.description}</p>
              </div>

              {/* Lore */}
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
                  Lore
                </h3>
                <p className="italic" style={{ color: 'rgba(255, 255, 255, 0.70)' }}>
                  {pet.lore}
                </p>
              </div>

              {/* Bonus */}
              <div
                className="p-4 rounded-lg"
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
                <p className="font-bold" style={{ color: tierColor }}>
                  {pet.bonusDescription}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => equipPet(pet.id)}
                  className="flex-1 px-6 py-3 rounded-lg font-semibold"
                  style={{
                    background: active ? 'rgba(239, 68, 68, 0.2)' : tierColor,
                    color: active ? '#ef4444' : '#fff',
                    border: active ? '1px solid #ef4444' : 'none',
                  }}
                >
                  {active ? 'Unequip' : 'Equip Companion'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Lock className="w-16 h-16 mx-auto mb-4" style={{ color: 'rgba(255, 255, 255, 0.2)' }} />
              <h3 className="text-lg font-bold mb-2" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
                Locked
              </h3>
              <p className="mb-4" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
                {pet.unlockDescription}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PetsSection;
