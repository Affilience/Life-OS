/**
 * Equipment Showcase - Paper Doll Layout
 * Impressive equipment display with character in center
 * Inspired by classic RPG character sheets
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGamificationStore } from '../../stores/gamificationStore';
import { useStats } from '../../hooks/useStats';
import { supabase } from '../../lib/supabase';
import {
  Shield,
  Sword,
  Sparkles,
  Crown,
  Heart,
  Zap,
  Brain,
  TrendingUp,
  Lock
} from 'lucide-react';

// Rarity definitions with enhanced visual effects
const EQUIPMENT_RARITY = {
  common: {
    name: 'Common',
    color: '#9CA3AF',
    glow: 'rgba(156, 163, 175, 0.2)',
    shine: 'rgba(156, 163, 175, 0.5)'
  },
  uncommon: {
    name: 'Uncommon',
    color: '#10B981',
    glow: 'rgba(16, 185, 129, 0.3)',
    shine: 'rgba(16, 185, 129, 0.6)'
  },
  rare: {
    name: 'Rare',
    color: '#3B82F6',
    glow: 'rgba(59, 130, 246, 0.4)',
    shine: 'rgba(59, 130, 246, 0.7)'
  },
  epic: {
    name: 'Epic',
    color: '#A855F7',
    glow: 'rgba(168, 85, 247, 0.5)',
    shine: 'rgba(168, 85, 247, 0.8)'
  },
  legendary: {
    name: 'Legendary',
    color: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.6)',
    shine: 'rgba(245, 158, 11, 0.9)',
    pulse: true
  },
};

// Equipment slots with positioning for paper doll layout
const EQUIPMENT_SLOTS = {
  helmet: {
    name: 'Helmet',
    position: 'top-center',
    icon: '/assets/equipment/slots/slot_helmet.png',
    fallbackIcon: '⛑️'
  },
  amulet: {
    name: 'Amulet',
    position: 'top-left',
    icon: '/assets/equipment/slots/slot_amulet.png',
    fallbackIcon: '📿'
  },
  cape: {
    name: 'Cape',
    position: 'top-right',
    icon: '/assets/equipment/slots/slot_cape.png',
    fallbackIcon: '🧥'
  },
  weapon: {
    name: 'Weapon',
    position: 'middle-left',
    icon: '/assets/equipment/slots/slot_weapon.png',
    fallbackIcon: '⚔️'
  },
  chest: {
    name: 'Chest',
    position: 'middle-center',
    icon: '/assets/equipment/slots/slot_chest.png',
    fallbackIcon: '🦺'
  },
  shield: {
    name: 'Shield',
    position: 'middle-right',
    icon: '/assets/equipment/slots/slot_shield.png',
    fallbackIcon: '🛡️'
  },
  ring: {
    name: 'Ring',
    position: 'bottom-center',
    icon: '/assets/equipment/slots/slot_ring.png',
    fallbackIcon: '💍'
  },
};

// DEV MODE flag
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

export default function EquipmentShowcase() {
  const {
    equippedItems: storeEquippedItems,
    ownedEquipment,
    equipItem,
    unequipItem,
  } = useGamificationStore();

  // Use unified stats system
  const { stats, statBreakdown, totalPower, synergies } = useStats();

  const [devEquipment, setDevEquipment] = useState([]);
  const [devEquippedItems, setDevEquippedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [filterRarity, setFilterRarity] = useState('all');
  const [showInventory, setShowInventory] = useState(false);

  // Load all equipment from database in dev mode
  useEffect(() => {
    if (DEV_MODE) {
      loadAllEquipment();
    }
  }, []);

  const loadAllEquipment = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('equipment_items')
      .select('*')
      .order('required_level', { ascending: true });

    if (!error && data) {
      setDevEquipment(data);
    }
    setLoading(false);
  };

  // Use dev or store data
  const availableEquipment = DEV_MODE ? devEquipment : ownedEquipment;
  const equippedItems = DEV_MODE ? devEquippedItems : storeEquippedItems;

  // Stats are now calculated by useStats hook - no need for manual calculation

  // Get equipped item for a slot
  const getEquippedForSlot = (slotId) => {
    if (DEV_MODE) {
      return equippedItems.find(item => item.slot === slotId);
    } else {
      return equippedItems.find(item => item.equipment_items?.slot === slotId);
    }
  };

  // Get sprite URL
  const getItemSpriteUrl = (item) => {
    if (!item) return null;
    if (item.image_path) return item.image_path;
    if (item.sprite_url) return item.sprite_url;

    const slug = item.slug || item.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const slotFolder = item.slot === 'chest' ? 'chests' : `${item.slot}s`;
    return `/assets/equipment/${slotFolder}/${slug}.png`;
  };

  // Handle equip/unequip
  const handleEquip = async (itemId) => {
    if (DEV_MODE) {
      const item = availableEquipment.find(e => e.id === itemId);
      if (!item) return;

      const isEquipped = devEquippedItems.some(e => e.id === itemId);

      if (isEquipped) {
        setDevEquippedItems(devEquippedItems.filter(e => e.id !== itemId));
      } else {
        const filtered = devEquippedItems.filter(e => e.slot !== item.slot);
        setDevEquippedItems([...filtered, item]);
      }
    } else {
      const item = availableEquipment.find(e => e.equipment_id === itemId);
      if (!item) return;

      const isEquipped = equippedItems.some(e => e.equipment_id === itemId);

      if (isEquipped) {
        await unequipItem(itemId);
      } else {
        await equipItem(itemId);
      }
    }

    // Close inventory after equipping
    setShowInventory(false);
  };

  // Get available items for selected slot
  const getAvailableItems = (slot) => {
    return availableEquipment
      .filter(item => item.slot === slot)
      .filter(item => filterRarity === 'all' || item.rarity === filterRarity);
  };

  return (
    <div className="min-h-screen bg-[#0c0a10] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0c0a10]/95 backdrop-blur-md border-b border-white/5">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sword className="w-6 h-6 text-orange-400" />
            Equipment Arsenal
          </h1>
          <p className="text-sm text-white/60 mt-1">
            Equip legendary gear to enhance your abilities
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Paper Doll Equipment Display */}
        <div className="bg-gradient-to-br from-[#1a1a1a] via-[#1a1a1a] to-[#0f0f0f] border border-white/10 rounded-2xl p-8 relative overflow-hidden">
          {/* Background Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-orange-500/5 pointer-events-none" />

          {/* Paper Doll Grid - 2 columns layout */}
          <div className="relative flex items-center justify-center gap-8 max-w-5xl mx-auto py-8">
            {/* Left Column - Equipment Slots */}
            <div className="flex flex-col gap-8">
              <PaperdollSlot
                slotId="helmet"
                slot={EQUIPMENT_SLOTS.helmet}
                equippedItem={getEquippedForSlot('helmet')}
                onSelect={() => {
                  setSelectedSlot('helmet');
                  setShowInventory(true);
                }}
                getItemSpriteUrl={getItemSpriteUrl}
              />
              <PaperdollSlot
                slotId="weapon"
                slot={EQUIPMENT_SLOTS.weapon}
                equippedItem={getEquippedForSlot('weapon')}
                onSelect={() => {
                  setSelectedSlot('weapon');
                  setShowInventory(true);
                }}
                getItemSpriteUrl={getItemSpriteUrl}
              />
              <PaperdollSlot
                slotId="amulet"
                slot={EQUIPMENT_SLOTS.amulet}
                equippedItem={getEquippedForSlot('amulet')}
                onSelect={() => {
                  setSelectedSlot('amulet');
                  setShowInventory(true);
                }}
                getItemSpriteUrl={getItemSpriteUrl}
              />
            </div>

            {/* Center: Character Avatar */}
            <div className="w-64 h-64 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-xl" />
              <img
                src="/assets/avatar/evolution/hero_v3_stage_10_swordsman.png"
                alt="Character"
                className="w-48 h-48 pixelated relative z-10"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            {/* Right Column - Equipment Slots */}
            <div className="flex flex-col gap-8">
              <PaperdollSlot
                slotId="cape"
                slot={EQUIPMENT_SLOTS.cape}
                equippedItem={getEquippedForSlot('cape')}
                onSelect={() => {
                  setSelectedSlot('cape');
                  setShowInventory(true);
                }}
                getItemSpriteUrl={getItemSpriteUrl}
              />
              <PaperdollSlot
                slotId="chest"
                slot={EQUIPMENT_SLOTS.chest}
                equippedItem={getEquippedForSlot('chest')}
                onSelect={() => {
                  setSelectedSlot('chest');
                  setShowInventory(true);
                }}
                getItemSpriteUrl={getItemSpriteUrl}
              />
              <PaperdollSlot
                slotId="shield"
                slot={EQUIPMENT_SLOTS.shield}
                equippedItem={getEquippedForSlot('shield')}
                onSelect={() => {
                  setSelectedSlot('shield');
                  setShowInventory(true);
                }}
                getItemSpriteUrl={getItemSpriteUrl}
              />
              <PaperdollSlot
                slotId="ring"
                slot={EQUIPMENT_SLOTS.ring}
                equippedItem={getEquippedForSlot('ring')}
                onSelect={() => {
                  setSelectedSlot('ring');
                  setShowInventory(true);
                }}
                getItemSpriteUrl={getItemSpriteUrl}
              />
            </div>
          </div>
        </div>

        {/* Stats Display */}
        <StatsDisplay stats={stats} />
      </div>

      {/* Inventory Modal */}
      {showInventory && selectedSlot && (
        <InventoryModal
          slotId={selectedSlot}
          slotName={EQUIPMENT_SLOTS[selectedSlot].name}
          items={getAvailableItems(selectedSlot)}
          equippedItems={equippedItems}
          filterRarity={filterRarity}
          setFilterRarity={setFilterRarity}
          onClose={() => setShowInventory(false)}
          onEquip={handleEquip}
          getItemSpriteUrl={getItemSpriteUrl}
          devMode={DEV_MODE}
        />
      )}
    </div>
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

      {/* Slot Box */}
      <div
        className="w-32 h-32 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:border-purple-500/50 relative group"
        style={{
          borderColor: rarity ? rarity.color : 'rgba(255, 255, 255, 0.1)',
          background: rarity
            ? `radial-gradient(circle at center, ${rarity.glow}, rgba(26, 26, 26, 0.8))`
            : 'rgba(26, 26, 26, 0.6)',
          boxShadow: rarity && rarity.pulse
            ? `0 0 20px ${rarity.glow}, 0 0 40px ${rarity.glow}`
            : rarity
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
                  e.target.nextSibling.style.display = 'flex';
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
                className="w-16 h-16 object-contain pixelated opacity-50"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
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
        <div className="mt-2 text-center px-2 max-w-[128px]">
          <div
            className="text-xs font-bold truncate"
            style={{
              color: rarity.color,
              textShadow: `0 0 8px ${rarity.glow}`,
            }}
          >
            {equippedItem.name}
          </div>
        </div>
      )}
    </div>
  );
}

// Stats Display Component
function StatsDisplay({ stats }) {
  const statConfig = {
    defense: { icon: Shield, color: '#3B82F6', label: 'Defense' },
    strength: { icon: Sword, color: '#EF4444', label: 'Strength' },
    vitality: { icon: Heart, color: '#10B981', label: 'Vitality' },
    intelligence: { icon: Brain, color: '#8B5CF6', label: 'Intelligence' },
    wisdom: { icon: Sparkles, color: '#F59E0B', label: 'Wisdom' },
  };

  const totalStats = Object.values(stats).reduce((sum, val) => sum + val, 0);

  return (
    <div className="bg-[#1a1724] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Equipment Stats
        </h3>
        <div className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
          <span className="text-sm text-purple-300">Total: +{totalStats}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(stats).map(([statKey, value]) => {
          const config = statConfig[statKey];
          const Icon = config.icon;

          return (
            <div
              key={statKey}
              className="bg-[#12101a] rounded-xl p-4 border border-white/5"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: config.color }} />
                <span className="text-xs text-white/60">{config.label}</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: value > 0 ? config.color : '#6B7280' }}>
                +{value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Inventory Modal Component
function InventoryModal({
  slotId,
  slotName,
  items,
  equippedItems,
  filterRarity,
  setFilterRarity,
  onClose,
  onEquip,
  getItemSpriteUrl,
  devMode
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
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
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">{slotName} Equipment</h2>
            <p className="text-sm text-white/60 mt-1">{items.length} items available</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              className="px-4 py-2 rounded-lg bg-[#1a1724] border border-white/10 text-white text-sm"
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
              <span className="text-2xl text-white">×</span>
            </button>
          </div>
        </div>

        {/* Items Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(item => {
              const rarity = EQUIPMENT_RARITY[item.rarity];
              const isEquipped = devMode
                ? equippedItems.some(e => e.id === item.id)
                : equippedItems.some(e => e.equipment_id === item.equipment_id);

              return (
                <div
                  key={item.id}
                  className="rounded-xl overflow-hidden cursor-pointer group relative transition-all duration-200 hover:scale-105"
                  style={{
                    background: `radial-gradient(circle at top, ${rarity.glow}, rgba(39, 39, 42, 0.6))`,
                    border: `2px solid ${rarity.color}`,
                    boxShadow: rarity.pulse
                      ? `0 0 20px ${rarity.glow}`
                      : `0 0 10px ${rarity.glow}`,
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
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="hidden text-4xl font-bold" style={{ color: rarity.color }}>
                      {item.name[0]}
                    </div>
                  </div>

                  {/* Item Info */}
                  <div className="p-3 bg-black/60 backdrop-blur-sm">
                    <div className="text-sm font-bold mb-1" style={{ color: rarity.color }}>
                      {item.name}
                    </div>
                    <div className="text-xs text-white/60 mb-2">{rarity.name}</div>

                    {/* Stats */}
                    <div className="space-y-1">
                      {item.defense > 0 && <div className="text-xs text-blue-400">+{item.defense} DEF</div>}
                      {item.strength > 0 && <div className="text-xs text-red-400">+{item.strength} STR</div>}
                      {item.vitality > 0 && <div className="text-xs text-green-400">+{item.vitality} VIT</div>}
                      {item.intelligence > 0 && <div className="text-xs text-purple-400">+{item.intelligence} INT</div>}
                      {item.wisdom > 0 && <div className="text-xs text-yellow-400">+{item.wisdom} WIS</div>}
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
    </div>
  );
}
