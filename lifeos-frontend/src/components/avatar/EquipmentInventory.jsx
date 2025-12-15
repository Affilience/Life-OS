import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGamificationStore } from '../../stores/gamificationStore';
import { supabase } from '../../lib/supabase';
import { EmptyState } from '../ui';
import { useGamificationModeStore, TERMINOLOGY } from '../../stores/gamificationModeStore';
import './EquipmentInventory.css';

// Rarity definitions
const EQUIPMENT_RARITY = {
  common: { name: 'Common', color: '#ffffff' },
  uncommon: { name: 'Uncommon', color: '#22c55e' },
  rare: { name: 'Rare', color: '#3b82f6' },
  epic: { name: 'Epic', color: '#a855f7' },
  legendary: { name: 'Legendary', color: '#f97316' },
};

// DEV MODE: Load all equipment directly from database
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

// Helper function to get sprite URL from item
const getItemSpriteUrl = (item) => {
  if (!item) return null;

  // Priority 1: Use image_path from database (preferred)
  if (item.image_path) return item.image_path;

  // Priority 2: Use sprite_url if available
  if (item.sprite_url) return item.sprite_url;

  // Priority 3: Fallback - construct URL from slug or name
  const slug = item.slug || item.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  const slotFolder = item.slot === 'chest' ? 'chests' : `${item.slot}s`;
  return `/assets/equipment/${slotFolder}/${slug}.png`;
};

export default function EquipmentInventory() {
  const navigate = useNavigate();
  const {
    equippedItems: storeEquippedItems,
    ownedEquipment,
    stats: storeStats,
    equipItem,
    unequipItem,
  } = useGamificationStore();

  // Get gamification mode
  const mode = useGamificationModeStore((state) => state.mode);
  const terms = TERMINOLOGY[mode] || TERMINOLOGY.cosmic;

  const [devEquipment, setDevEquipment] = useState([]);
  const [devEquippedItems, setDevEquippedItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // DEV MODE: Load all equipment from database
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

  // Use dev equipment if in dev mode, otherwise use owned equipment
  const availableEquipment = DEV_MODE ? devEquipment : ownedEquipment;
  const equippedItems = DEV_MODE ? devEquippedItems : storeEquippedItems;

  // Calculate stats from equipped items (DEV MODE)
  const devStats = DEV_MODE ? devEquippedItems.reduce((acc, item) => ({
    defense: acc.defense + (item.defense || 0),
    strength: acc.strength + (item.strength || 0),
    vitality: acc.vitality + (item.vitality || 0),
    intelligence: acc.intelligence + (item.intelligence || 0),
    wisdom: acc.wisdom + (item.wisdom || 0),
  }), { defense: 0, strength: 0, vitality: 0, intelligence: 0, wisdom: 0 }) : storeStats;

  const stats = DEV_MODE ? devStats : storeStats;

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [filterRarity, setFilterRarity] = useState('all');

  const slots = [
    { id: 'helmet', name: 'Helmet', icon: '⛑️' },
    { id: 'chest', name: 'Chest', icon: '🦺' },
    { id: 'legs', name: 'Legs', icon: '👖' },
    { id: 'weapon', name: 'Weapon', icon: '⚔️' },
    { id: 'shield', name: 'Shield', icon: '🛡️' },
    { id: 'cape', name: 'Cape', icon: '🧥' },
    { id: 'ring', name: 'Rings', icon: '💍' },
    { id: 'amulet', name: 'Amulet', icon: '📿' },
  ];

  // Get all available items for selected slot
  const getAvailableItems = (slot) => {
    return availableEquipment
      .filter(item => item.slot === slot)
      .filter(item => filterRarity === 'all' || item.rarity === filterRarity);
  };

  // Handle equip/unequip
  const handleEquip = async (itemId) => {
    if (DEV_MODE) {
      // DEV MODE: Handle locally with state
      const item = availableEquipment.find(e => e.id === itemId);
      if (!item) {
        console.warn('Item not found:', itemId);
        return;
      }

      const isEquipped = devEquippedItems.some(e => e.id === itemId);

      if (isEquipped) {
        // Unequip
        setDevEquippedItems(devEquippedItems.filter(e => e.id !== itemId));
      } else {
        // Unequip any item in the same slot first
        const filtered = devEquippedItems.filter(e => e.slot !== item.slot);
        // Equip new item
        setDevEquippedItems([...filtered, item]);
      }
    } else {
      // PRODUCTION: Use store functions
      const item = availableEquipment.find(e => e.equipment_id === itemId);
      if (!item) {
        console.warn('Item not found:', itemId);
        return;
      }

      const isEquipped = equippedItems.some(e => e.equipment_id === itemId);

      if (isEquipped) {
        await unequipItem(itemId);
      } else {
        await equipItem(itemId);
      }
    }
  };

  // Get equipped item for a slot
  const getEquippedForSlot = (slot) => {
    if (DEV_MODE) {
      // In dev mode, items are stored directly with slot property
      return equippedItems.find(item => item.slot === slot);
    } else {
      // In production, items have equipment_items nested object
      return equippedItems.find(item => item.equipment_items?.slot === slot);
    }
  };

  return (
    <div className="equipment-inventory">
      {/* Header */}
      <div className="inventory-header">
        <button
          onClick={() => navigate('/progress')}
          className="back-button"
          title="Back to Progress"
        >
          ← Back
        </button>
        <h2>{mode === 'cosmic' ? '⚔️ Equipment & Arsenal' : `📊 ${terms.equipment}`}</h2>
        <p className="subtitle">{mode === 'cosmic' ? 'Equip items to boost your stats' : `${terms.equip} items to boost your ${terms.stats.toLowerCase()}`}</p>
      </div>

      {/* Main Content */}
      <div className="inventory-content">
        {/* Top: Equipment Slots */}
        <div className="equipment-slots-panel">
          <h3>{mode === 'cosmic' ? 'Equipped Items' : `Active ${terms.equipment}`}</h3>

          <div className="slots-grid">
            {slots.map(slot => {
              const equippedItem = getEquippedForSlot(slot.id);
              const isSelected = selectedSlot === slot.id;

              return (
                <div
                  key={slot.id}
                  className={`equipment-slot ${isSelected ? 'selected' : ''} ${equippedItem ? 'filled' : 'empty'}`}
                  onClick={() => setSelectedSlot(slot.id)}
                >
                  <div className="slot-header">
                    <span className="slot-icon">{slot.icon}</span>
                    <span className="slot-name">{slot.name}</span>
                  </div>

                  {equippedItem ? (
                    <div
                      className="item-preview"
                      style={{
                        borderColor: EQUIPMENT_RARITY[equippedItem.rarity]?.color || '#fff',
                      }}
                    >
                      <div className="item-icon" style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <img
                          src={getItemSpriteUrl(equippedItem)}
                          alt={equippedItem.name}
                          style={{ width: '100%', height: '100%', imageRendering: 'pixelated', objectFit: 'contain' }}
                          onError={(e) => {
                            console.error(`Failed to load sprite for: ${equippedItem.name}`, getItemSpriteUrl(equippedItem));
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div style={{
                          display: 'none',
                          width: '100%',
                          height: '100%',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2rem',
                          fontWeight: 'bold'
                        }}>{equippedItem.name[0]}</div>
                      </div>
                      <div className="item-name">{equippedItem.name}</div>
                    </div>
                  ) : (
                    <div className="empty-slot-icon">{slot.icon}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Stats Display */}
          <div className="stats-display">
            <h4>Total {terms.stats}</h4>
            <div className="stats-grid">
              {Object.entries(stats).map(([stat, value]) => (
                value > 0 && (
                  <div key={stat} className="stat-item">
                    <span className="stat-icon">
                      {stat === 'defense' ? '🛡️' :
                       stat === 'strength' ? '💪' :
                       stat === 'vitality' ? '❤️' :
                       stat === 'intelligence' ? '🧠' : '✨'}
                    </span>
                    <span className="stat-name">{stat}</span>
                    <span className="stat-value">+{value}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: Available Items */}
        <div className="available-items-panel">
          <div className="panel-header">
            <h3>
              {selectedSlot
                ? `Available ${slots.find(s => s.id === selectedSlot)?.name || 'Items'}`
                : 'Select a slot'}
            </h3>

            {selectedSlot && (
              <select
                className="rarity-filter"
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
            )}
          </div>

          {selectedSlot ? (
            <div className="items-grid">
              {getAvailableItems(selectedSlot).length > 0 ? (
                getAvailableItems(selectedSlot).map(item => {
                  const rarityData = EQUIPMENT_RARITY[item.rarity];
                  const isEquipped = DEV_MODE
                    ? equippedItems.some(e => e.id === item.id)
                    : equippedItems.some(e => e.equipment_id === item.equipment_id);
                  const glowSize = item.rarity === 'legendary' ? '20px' :
                                   item.rarity === 'epic' ? '15px' :
                                   item.rarity === 'rare' ? '10px' : '0px';

                  return (
                    <div
                      key={item.id}
                      className={`item-card ${isEquipped ? 'equipped' : ''} rarity-${item.rarity}`}
                      style={{
                        borderColor: rarityData.color,
                        boxShadow: glowSize !== '0px' ? `0 0 ${glowSize} ${rarityData.color}` : 'none',
                      }}
                      onClick={() => handleEquip(item.id)}
                    >
                      <div className="item-card-icon" style={{ position: 'relative', minHeight: '64px' }}>
                        <img
                          src={getItemSpriteUrl(item)}
                          alt={item.name}
                          style={{ width: '64px', height: '64px', imageRendering: 'pixelated', margin: '0 auto', display: 'block', objectFit: 'contain' }}
                          onError={(e) => {
                            console.error(`Failed to load sprite for: ${item.name}`, getItemSpriteUrl(item));
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div style={{ display: 'none', fontSize: '2rem', textAlign: 'center' }}>{item.name[0]}</div>
                      </div>
                      <div className="item-card-name" style={{ color: rarityData.color }}>
                        {item.name}
                      </div>
                      <div className="item-card-rarity">{rarityData.name}</div>

                      <div className="item-card-stats">
                        {item.defense > 0 && <div className="stat-line">+{item.defense} defense</div>}
                        {item.strength > 0 && <div className="stat-line">+{item.strength} strength</div>}
                        {item.vitality > 0 && <div className="stat-line">+{item.vitality} vitality</div>}
                        {item.intelligence > 0 && <div className="stat-line">+{item.intelligence} intelligence</div>}
                        {item.wisdom > 0 && <div className="stat-line">+{item.wisdom} wisdom</div>}
                      </div>

                      {isEquipped && (
                        <div className="equipped-badge">✓ {mode === 'cosmic' ? 'Equipped' : 'Active'}</div>
                      )}
                    </div>
                  );
                })
              ) : (
                <EmptyState
                  type="equipment"
                  title={`No ${terms.equipment.toLowerCase()} available for this slot`}
                  description={mode === 'cosmic'
                    ? `Complete quests, reach milestones, and unlock achievements to earn new equipment!`
                    : `Complete tasks, reach milestones, and unlock ${terms.achievement.toLowerCase()}s to earn new ${terms.equipment.toLowerCase()}!`}
                  variant="pink"
                  size="sm"
                />
              )}
            </div>
          ) : (
            <EmptyState
              type="equipment"
              title={`Select ${mode === 'cosmic' ? 'an equipment slot' : 'a slot'}`}
              description={mode === 'cosmic'
                ? 'Choose a slot from your character to view and equip available items'
                : `Choose a slot to view and ${terms.equip.toLowerCase()} available ${terms.equipment.toLowerCase()}`}
              variant="violet"
              size="sm"
            />
          )}
        </div>
      </div>
    </div>
  );
}
