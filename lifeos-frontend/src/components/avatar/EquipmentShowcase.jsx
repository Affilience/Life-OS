/**
 * Equipment Showcase - Paper Doll Layout
 * Uses avatarStore for equipment management
 */

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAvatarStore } from '../../stores/avatarStore';
import { useGamificationStore } from '../../stores/gamificationStore';
import { useStats } from '../../hooks/useStats';
import { usePetStore, PET_DATABASE } from '../../stores/petStore';
import { EQUIPMENT_DATABASE, EQUIPMENT_RARITY, EQUIPMENT_SLOTS } from '../../data/equipmentDatabase';
import { useGamificationModeStore, VISIBILITY } from '../../stores/gamificationModeStore';
import { getStageByLevel } from '../../data/avatarEvolution';
import AvatarRenderer from './AvatarRenderer';
import {
  Shield,
  Sword,
  Sparkles,
  Crown,
  Heart,
  Zap,
  Brain,
  TrendingUp,
  Lock,
  X,
  Clock,
  Target,
  Flame
} from 'lucide-react';
import { WEAPON_ATTACKS } from '../../data/weaponAttacks';

// Slot definitions for paper doll layout
const PAPERDOLL_SLOTS = {
  helmet: {
    name: 'Helmet',
    icon: '/assets/equipment/slots/slot_helmet.png',
    fallbackIcon: '⛑️',
    storeSlot: 'helmet',
  },
  legs: {
    name: 'Legs',
    icon: '/assets/equipment/slots/slot_legs.png',
    fallbackIcon: '👖',
    storeSlot: 'legs',
  },
  cape: {
    name: 'Cape',
    icon: '/assets/equipment/slots/slot_cape.png',
    fallbackIcon: '🧥',
    storeSlot: 'cape',
  },
  mainHand: {
    name: 'Weapon',
    icon: '/assets/equipment/slots/slot_weapon.png',
    fallbackIcon: '⚔️',
    storeSlot: 'mainHand',
  },
  chest: {
    name: 'Chest',
    icon: '/assets/equipment/slots/slot_chest.png',
    fallbackIcon: '🦺',
    storeSlot: 'chest',
  },
  offHand: {
    name: 'Shield',
    icon: '/assets/equipment/slots/slot_shield.png',
    fallbackIcon: '🛡️',
    storeSlot: 'offHand',
  },
  ring1: {
    name: 'Ring 1',
    icon: '/assets/equipment/slots/slot_ring.png',
    fallbackIcon: '💍',
    storeSlot: 'ring1',
  },
  ring2: {
    name: 'Ring 2',
    icon: '/assets/equipment/slots/slot_ring.png',
    fallbackIcon: '💍',
    storeSlot: 'ring2',
  },
  amulet: {
    name: 'Amulet',
    icon: '/assets/equipment/slots/slot_amulet.png',
    fallbackIcon: '📿',
    storeSlot: 'amulet',
  },
};

export default function EquipmentShowcase() {
  const { mode } = useGamificationModeStore();
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;

  // Use avatarStore for equipment
  const {
    equipped,
    getEffectiveUnlockedEquipment,
    equipItem,
    unequipItem,
    level,
    prestige,
    getHeroSpritePath,
  } = useAvatarStore();

  // Get effective unlocked equipment (all items in dev mode)
  const effectiveUnlocked = getEffectiveUnlockedEquipment();

  // Get level from gamification store (main source of truth for level)
  const { level: gamificationLevel } = useGamificationStore();
  const effectiveLevel = gamificationLevel || level || 1;

  // Hide equipment showcase in minimal mode
  if (!visibility.showEquipment) {
    return null;
  }

  // Use unified stats system
  const { stats, statBreakdown } = useStats();

  // Get active/equipped pets
  const { activePets } = usePetStore();

  // Get current evolution stage and avatar sprite (same as Character page)
  const currentStage = getStageByLevel(effectiveLevel, prestige || 0);
  const avatarSpritePath = getHeroSpritePath(currentStage.levelRequired, currentStage.name);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [filterRarity, setFilterRarity] = useState('all');
  const [showInventory, setShowInventory] = useState(false);

  // Get all available equipment from EQUIPMENT_DATABASE
  // Only filter by unlocked status - once unlocked, items are always available
  const availableEquipment = useMemo(() => {
    return Object.values(EQUIPMENT_DATABASE).filter(item => {
      // Only show items that are in the unlocked list
      const isUnlocked = effectiveUnlocked.includes(item.id);
      return isUnlocked;
    });
  }, [effectiveUnlocked]);

  // Get equipped item for a slot
  const getEquippedForSlot = (slotId) => {
    const itemId = equipped[slotId];
    if (!itemId) return null;
    return EQUIPMENT_DATABASE[itemId] || null;
  };

  // Get sprite URL for inventory display
  const getItemSpriteUrl = (item) => {
    if (!item) return null;
    // Use sprite path for inventory icons (not overlay)
    return item.sprite?.path || null;
  };

  // Handle equip/unequip
  const handleEquip = async (itemId) => {
    const item = EQUIPMENT_DATABASE[itemId];
    if (!item) return;

    // For rings, use the selectedSlot (ring1 or ring2) instead of item.slot (ring)
    const targetSlot = (item.slot === 'ring' && selectedSlot) ? selectedSlot : item.slot;
    const currentEquipped = equipped[targetSlot];

    if (currentEquipped === itemId) {
      // Unequip if clicking on already equipped item
      await unequipItem(targetSlot);
    } else {
      // Equip the new item
      await equipItem(targetSlot, itemId);
    }

    setShowInventory(false);
  };

  // Rarity order for sorting (common first, legendary last)
  const RARITY_ORDER = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5,
  };

  // Get available items for selected slot, sorted by rarity
  const getAvailableItems = (slotId) => {
    const slot = PAPERDOLL_SLOTS[slotId];
    if (!slot) return [];

    const storeSlot = slot.storeSlot;

    return availableEquipment
      .filter(item => {
        // Map store slots to equipment slots
        if (storeSlot === 'legs') {
          return item.slot === 'legs';
        }
        // Ring slots can use any ring
        if (storeSlot === 'ring1' || storeSlot === 'ring2') {
          return item.slot === 'ring';
        }
        return item.slot === storeSlot;
      })
      .filter(item => filterRarity === 'all' || item.rarity === filterRarity)
      .sort((a, b) => {
        // Sort by rarity (common -> legendary)
        const rarityA = RARITY_ORDER[a.rarity] || 0;
        const rarityB = RARITY_ORDER[b.rarity] || 0;
        if (rarityA !== rarityB) return rarityA - rarityB;
        // Secondary sort by name
        return a.name.localeCompare(b.name);
      });
  };

  return (
    <div className="space-y-6">
      {/* Paper Doll Equipment Display */}
      <div className="bg-gradient-to-br from-[#1a1a1a] via-[#1a1a1a] to-[#0f0f0f] border border-white/10 rounded-2xl p-4 sm:p-6 md:p-8 relative overflow-hidden">
        {/* Background Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-orange-500/5 pointer-events-none" />

        {/* Paper Doll Grid - 2 columns layout, responsive */}
        <div className="relative flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 max-w-5xl mx-auto py-4 md:py-8">
          {/* Left Column - Equipment Slots */}
          <div className="flex flex-row md:flex-col gap-3 md:gap-6 order-1 md:order-1">
            <PaperdollSlot
              slotId="helmet"
              slot={PAPERDOLL_SLOTS.helmet}
              equippedItem={getEquippedForSlot('helmet')}
              onSelect={() => {
                setSelectedSlot('helmet');
                setShowInventory(true);
              }}
              getItemSpriteUrl={getItemSpriteUrl}
            />
            <PaperdollSlot
              slotId="mainHand"
              slot={PAPERDOLL_SLOTS.mainHand}
              equippedItem={getEquippedForSlot('mainHand')}
              onSelect={() => {
                setSelectedSlot('mainHand');
                setShowInventory(true);
              }}
              getItemSpriteUrl={getItemSpriteUrl}
            />
            <PaperdollSlot
              slotId="legs"
              slot={PAPERDOLL_SLOTS.legs}
              equippedItem={getEquippedForSlot('legs')}
              onSelect={() => {
                setSelectedSlot('legs');
                setShowInventory(true);
              }}
              getItemSpriteUrl={getItemSpriteUrl}
            />
          </div>

          {/* Center: Character Avatar with Pets in Orbital Arrangement */}
          <div className="flex flex-col items-center justify-center order-first md:order-2">
            <div className="relative" style={{ width: '320px', height: '320px' }}>
              {/* Main Avatar with Equipment - Uses AvatarRenderer for equipment overlay */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <AvatarRenderer size={256} animate={true} />
              </div>

              {/* Pets in orbital arrangement around avatar - rendered AFTER so they appear on top */}
              <PetOrbital pets={activePets} />
            </div>
          </div>

          {/* Right Column - Equipment Slots */}
          <div className="flex flex-row md:flex-col gap-3 md:gap-6 order-2 md:order-3 flex-wrap justify-center">
            <PaperdollSlot
              slotId="cape"
              slot={PAPERDOLL_SLOTS.cape}
              equippedItem={getEquippedForSlot('cape')}
              onSelect={() => {
                setSelectedSlot('cape');
                setShowInventory(true);
              }}
              getItemSpriteUrl={getItemSpriteUrl}
            />
            <PaperdollSlot
              slotId="chest"
              slot={PAPERDOLL_SLOTS.chest}
              equippedItem={getEquippedForSlot('chest')}
              onSelect={() => {
                setSelectedSlot('chest');
                setShowInventory(true);
              }}
              getItemSpriteUrl={getItemSpriteUrl}
            />
            <PaperdollSlot
              slotId="offHand"
              slot={PAPERDOLL_SLOTS.offHand}
              equippedItem={getEquippedForSlot('offHand')}
              onSelect={() => {
                setSelectedSlot('offHand');
                setShowInventory(true);
              }}
              getItemSpriteUrl={getItemSpriteUrl}
            />
          </div>
        </div>

        {/* Accessories Row - Rings and Amulet */}
        <div className="flex justify-center gap-4 mt-4">
          <PaperdollSlot
            slotId="ring1"
            slot={PAPERDOLL_SLOTS.ring1}
            equippedItem={getEquippedForSlot('ring1')}
            onSelect={() => {
              setSelectedSlot('ring1');
              setShowInventory(true);
            }}
            getItemSpriteUrl={getItemSpriteUrl}
          />
          <PaperdollSlot
            slotId="amulet"
            slot={PAPERDOLL_SLOTS.amulet}
            equippedItem={getEquippedForSlot('amulet')}
            onSelect={() => {
              setSelectedSlot('amulet');
              setShowInventory(true);
            }}
            getItemSpriteUrl={getItemSpriteUrl}
          />
          <PaperdollSlot
            slotId="ring2"
            slot={PAPERDOLL_SLOTS.ring2}
            equippedItem={getEquippedForSlot('ring2')}
            onSelect={() => {
              setSelectedSlot('ring2');
              setShowInventory(true);
            }}
            getItemSpriteUrl={getItemSpriteUrl}
          />
        </div>
      </div>

      {/* Stats Display */}
      <StatsDisplay stats={stats} statBreakdown={statBreakdown} />

      {/* Inventory Modal */}
      {showInventory && selectedSlot && (
        <InventoryModal
          slotId={selectedSlot}
          slotName={PAPERDOLL_SLOTS[selectedSlot]?.name || selectedSlot}
          items={getAvailableItems(selectedSlot)}
          equipped={equipped}
          selectedSlot={selectedSlot}
          filterRarity={filterRarity}
          setFilterRarity={setFilterRarity}
          onClose={() => setShowInventory(false)}
          onEquip={handleEquip}
          getItemSpriteUrl={getItemSpriteUrl}
        />
      )}
    </div>
  );
}

// Pet Orbital Component - Arranges pets in a semicircle around the avatar
function PetOrbital({ pets }) {
  if (!pets || pets.length === 0) return null;

  // Position pets in a semicircle below and around the avatar
  // CSS coordinates: Y increases downward, so we use angles where sin() is positive for bottom
  const getOrbitalPosition = (index, total) => {
    const radius = 140; // Distance from center
    // In CSS coordinates: 90° = bottom, 0° = right, 180° = left
    // Arc from bottom-left (135°) to bottom-right (45°)
    const startAngle = 135; // Bottom-left
    const endAngle = 45; // Bottom-right

    let angle;
    if (total === 1) {
      angle = 90; // Center bottom
    } else if (total === 2) {
      angle = index === 0 ? 120 : 60; // Left and right of bottom
    } else {
      // Spread evenly across the arc
      const angleStep = (startAngle - endAngle) / (total - 1);
      angle = startAngle - angleStep * index;
    }

    // Convert to radians and calculate position
    const rad = (angle * Math.PI) / 180;
    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius * 0.6; // Flatten the arc a bit for perspective

    return {
      x: 160 + x - 24, // Center offset + position - half pet width
      y: 160 + y - 24, // Center offset + position - half pet height
      scale: 1 - (index * 0.05), // Slight scale variation for depth
      zIndex: 100 + (total - index), // Ensure pets are above avatar
    };
  };

  return (
    <>
      {pets.map((petId, index) => {
        const pet = PET_DATABASE[petId];
        if (!pet) return null;

        const pos = getOrbitalPosition(index, pets.length);

        return (
          <div
            key={petId}
            className="absolute transition-all duration-300 hover:scale-110 group"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              zIndex: pos.zIndex,
              transform: `scale(${pos.scale})`,
            }}
          >
            {/* Pet glow effect */}
            <div
              className="absolute inset-0 rounded-full blur-md opacity-50 group-hover:opacity-80 transition-opacity"
              style={{
                background: `radial-gradient(circle, ${pet.rarity === 'legendary' ? '#f59e0b' : pet.rarity === 'epic' ? '#a855f7' : '#8b5cf6'} 0%, transparent 70%)`,
                transform: 'scale(1.5)',
              }}
            />
            {/* Pet sprite */}
            <img
              src={pet.sprite}
              alt={pet.name}
              className="w-12 h-12 md:w-14 md:h-14 pixelated relative z-10 drop-shadow-lg"
              style={{ imageRendering: 'pixelated' }}
              title={pet.name}
            />
            {/* Pet name tooltip on hover */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-white/80 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 px-2 py-0.5 rounded">
              {pet.name}
            </div>
          </div>
        );
      })}
    </>
  );
}

// Paper Doll Slot Component
function PaperdollSlot({ slotId, slot, equippedItem, onSelect, getItemSpriteUrl }) {
  const rarity = equippedItem ? EQUIPMENT_RARITY[equippedItem.rarity] : null;

  return (
    <div className="flex flex-col items-center">
      {/* Slot Label */}
      <div className="mb-2 text-center">
        <span className="text-xs font-semibold text-white/60">{slot.name}</span>
      </div>

      {/* Slot Box - responsive sizing */}
      <div
        className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:border-purple-500/50 relative group"
        style={{
          borderColor: rarity ? rarity.color : 'rgba(255, 255, 255, 0.1)',
          background: rarity
            ? `radial-gradient(circle at center, ${rarity.glow || 'rgba(255,255,255,0.1)'}, rgba(26, 26, 26, 0.8))`
            : 'rgba(26, 26, 26, 0.6)',
          boxShadow: rarity && rarity.hasParticles
            ? `0 0 20px ${rarity.glow}, 0 0 40px ${rarity.glow}`
            : rarity?.glow
            ? `0 0 15px ${rarity.glow}`
            : 'none',
        }}
        onClick={onSelect}
      >
        {/* Item Display */}
        <div className="w-full h-full flex items-center justify-center p-3">
          {equippedItem ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={getItemSpriteUrl(equippedItem)}
                alt={equippedItem.name}
                className="max-w-full max-h-full object-contain pixelated"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full h-full items-center justify-center text-4xl font-bold" style={{ color: rarity?.color }}>
                {equippedItem.name[0]}
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity">
              <img
                src={slot.icon}
                alt={`${slot.name} Slot`}
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 object-contain pixelated opacity-50"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                }}
              />
              <span className="hidden text-4xl">{slot.fallbackIcon}</span>
            </div>
          )}
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/0 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
      </div>

      {/* Item Name Below (only when equipped) */}
      {equippedItem && (
        <div className="mt-2 text-center px-1 max-w-[80px] sm:max-w-[96px] md:max-w-[112px] lg:max-w-[128px]">
          <div
            className="text-xs font-bold truncate"
            style={{
              color: rarity?.color || '#fff',
              textShadow: rarity?.glow ? `0 0 8px ${rarity.glow}` : 'none',
            }}
          >
            {equippedItem.name}
          </div>
        </div>
      )}
    </div>
  );
}

// Stats Display Component - Shows total stats from ALL sources
function StatsDisplay({ stats, statBreakdown }) {
  const statConfig = {
    strength: { icon: Sword, color: '#EF4444', label: 'Strength' },
    vitality: { icon: Heart, color: '#10B981', label: 'Vitality' },
    intelligence: { icon: Brain, color: '#8B5CF6', label: 'Intelligence' },
    wisdom: { icon: Sparkles, color: '#F59E0B', label: 'Wisdom' },
    defense: { icon: Shield, color: '#3B82F6', label: 'Defense' },
  };

  const totalStats = Object.values(stats).reduce((sum, val) => sum + (val || 0), 0);

  return (
    <div className="bg-[#1a1724] border border-white/10 rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
          Character Stats
        </h3>
        <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
          <span className="text-xs sm:text-sm text-purple-300">Total Power: {totalStats}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
        {Object.entries(statConfig).map(([statKey, config]) => {
          const value = stats[statKey] || 0;
          const Icon = config.icon;
          const breakdown = statBreakdown?.[statKey] || {};

          return (
            <div
              key={statKey}
              className="bg-[#12101a] rounded-xl p-3 sm:p-4 border border-white/5 group relative"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: config.color }} />
                <span className="text-[10px] sm:text-xs text-white/60">{config.label}</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold" style={{ color: value > 0 ? config.color : '#6B7280' }}>
                {value}
              </div>

              {/* Breakdown Tooltip on Hover */}
              <div className="absolute left-0 bottom-full mb-2 w-48 bg-[#0f0d14] border border-white/10 rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 shadow-xl pointer-events-none">
                <div className="text-xs font-semibold text-white/80 mb-2">Stat Sources</div>
                <div className="space-y-1 text-[10px]">
                  {breakdown.base > 0 && <div className="flex justify-between"><span className="text-white/50">Base</span><span className="text-white/70">+{breakdown.base}</span></div>}
                  {breakdown.allocated > 0 && <div className="flex justify-between"><span className="text-white/50">Allocated</span><span className="text-blue-400">+{breakdown.allocated}</span></div>}
                  {breakdown.equipment > 0 && <div className="flex justify-between"><span className="text-white/50">Equipment</span><span className="text-purple-400">+{breakdown.equipment}</span></div>}
                  {breakdown.pets > 0 && <div className="flex justify-between"><span className="text-white/50">Pets</span><span className="text-pink-400">+{breakdown.pets}</span></div>}
                  {breakdown.perks > 0 && <div className="flex justify-between"><span className="text-white/50">Perks</span><span className="text-yellow-400">+{breakdown.perks}</span></div>}
                  {breakdown.achievements > 0 && <div className="flex justify-between"><span className="text-white/50">Achievements</span><span className="text-green-400">+{breakdown.achievements}</span></div>}
                  {breakdown.mastery > 0 && <div className="flex justify-between"><span className="text-white/50">Mastery</span><span className="text-orange-400">+{breakdown.mastery}</span></div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Inventory Modal Component - Uses Portal to render at document body level
function InventoryModal({
  slotId,
  slotName,
  items,
  equipped,
  selectedSlot,
  filterRarity,
  setFilterRarity,
  onClose,
  onEquip,
  getItemSpriteUrl,
}) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[80vh] rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(24, 24, 27, 0.95)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-white/10 gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">{slotName} Equipment</h2>
            <p className="text-xs sm:text-sm text-white/60 mt-1">{items.length} items available</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <select
              className="px-3 sm:px-4 py-2 rounded-lg bg-[#1a1724] border border-white/10 text-white text-xs sm:text-sm flex-1 sm:flex-none"
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
            >
              <option value="all">All Rarities</option>
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Items Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {items.map(item => {
              const rarity = EQUIPMENT_RARITY[item.rarity];
              // For rings, check the actual selected slot (ring1 or ring2), not item.slot
              const isEquipped = (item.slot === 'ring')
                ? equipped[selectedSlot] === item.id
                : equipped[item.slot] === item.id;

              return (
                <div
                  key={item.id}
                  className="rounded-xl overflow-hidden cursor-pointer group relative transition-all duration-200 hover:scale-105"
                  style={{
                    background: `radial-gradient(circle at top, ${rarity?.glow || 'rgba(255,255,255,0.1)'}, rgba(39, 39, 42, 0.6))`,
                    border: `2px solid ${rarity?.color || '#fff'}`,
                    boxShadow: rarity?.hasParticles
                      ? `0 0 20px ${rarity.glow}`
                      : `0 0 10px ${rarity?.glow || 'transparent'}`,
                  }}
                  onClick={() => onEquip(item.id)}
                >
                  {/* Item Image */}
                  <div className="aspect-square p-4 flex items-center justify-center">
                    <img
                      src={getItemSpriteUrl(item)}
                      alt={item.name}
                      className="w-full h-full object-contain pixelated"
                      style={{ imageRendering: 'pixelated' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="hidden text-4xl font-bold" style={{ color: rarity?.color }}>
                      {item.name[0]}
                    </div>
                  </div>

                  {/* Item Info */}
                  <div className="p-3 bg-black/60 backdrop-blur-sm">
                    <div className="text-sm font-bold mb-1" style={{ color: rarity?.color || '#fff' }}>
                      {item.name}
                    </div>
                    <div className="text-xs text-white/60 mb-2">{rarity?.name || 'Unknown'}</div>

                    {/* Weapon Attack Stats */}
                    {item.slot === 'mainHand' && item.weaponType && WEAPON_ATTACKS[item.weaponType] && (
                      <div className="mb-2 p-2 rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30">
                        <div className="flex items-center gap-1 mb-1">
                          <Flame className="w-3 h-3 text-orange-400" />
                          <span className="text-[10px] font-bold text-orange-400">
                            {WEAPON_ATTACKS[item.weaponType].attackName}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[9px]">
                          <div className="flex items-center gap-1 text-white/70">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{WEAPON_ATTACKS[item.weaponType].cooldown}ms</span>
                          </div>
                          <div className="flex items-center gap-1 text-white/70">
                            <Sword className="w-2.5 h-2.5" />
                            <span>×{WEAPON_ATTACKS[item.weaponType].damageMultiplier}</span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Target className="w-2.5 h-2.5" />
                            <span>{Math.round(WEAPON_ATTACKS[item.weaponType].critChance * 100)}% crit</span>
                          </div>
                          <div className="flex items-center gap-1 text-orange-300">
                            <Zap className="w-2.5 h-2.5" />
                            <span>×{WEAPON_ATTACKS[item.weaponType].critMultiplier} crit dmg</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Stats from item.stats object */}
                    <div className="space-y-1">
                      {item.stats?.defense > 0 && <div className="text-xs text-blue-400">+{item.stats.defense} DEF</div>}
                      {item.stats?.strength > 0 && <div className="text-xs text-red-400">+{item.stats.strength} STR</div>}
                      {item.stats?.vitality > 0 && <div className="text-xs text-green-400">+{item.stats.vitality} VIT</div>}
                      {item.stats?.intelligence > 0 && <div className="text-xs text-purple-400">+{item.stats.intelligence} INT</div>}
                      {item.stats?.wisdom > 0 && <div className="text-xs text-yellow-400">+{item.stats.wisdom} WIS</div>}
                    </div>
                  </div>

                  {/* Equipped Badge */}
                  {isEquipped && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded bg-green-500 text-white text-xs font-bold">
                      EQUIPPED
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {items.length === 0 && (
            <div className="text-center py-12">
              <Lock className="w-12 h-12 mx-auto mb-4 text-white/40" />
              <p className="text-white/60">No {slotName.toLowerCase()} equipment available</p>
              <p className="text-sm text-white/40 mt-2">Complete challenges to unlock equipment</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
