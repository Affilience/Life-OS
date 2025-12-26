import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAvatarStore } from '../../stores/avatarStore';
import { useGamificationStore } from '../../stores/gamificationStore';
import { EQUIPMENT_DATABASE, EQUIPMENT_SLOTS, getEquipmentBySlot, EQUIPMENT_RARITY } from '../../data/equipmentDatabase';
import { calculateXPForLevel } from '../../data/avatarEvolution';
import AvatarRenderer from './AvatarRenderer';
import { X, Lock, Check, Star, TrendingUp } from 'lucide-react';
import UnlockBadge from '../shared/UnlockBadge';
import './AvatarCustomisation.css';

export default function AvatarCustomisation({ onClose }) {
  const [selectedSlot, setSelectedSlot] = useState('helmet');

  const {
    level,
    xp,
    currentTier,
    equipped,
    getEffectiveUnlockedEquipment,
    stats,
    equipItem,
    unequipItem,
    getCurrentTierData,
  } = useAvatarStore();

  // Get effective unlocked equipment (all items in dev mode)
  const effectiveUnlocked = getEffectiveUnlockedEquipment();

  // Get XP info from gamification store (uses exponential scaling)
  const { currentXP, xpToNextLevel } = useGamificationStore();

  const tierData = getCurrentTierData();
  const slotEquipment = getEquipmentBySlot(selectedSlot);

  // Calculate XP to next level (exponential scaling)
  const xpNeeded = xpToNextLevel || calculateXPForLevel(level);
  const xpProgress = (currentXP / xpNeeded) * 100;

  const handleEquip = (itemId) => {
    equipItem(selectedSlot, itemId);
  };

  const handleUnequip = () => {
    unequipItem(selectedSlot);
  };

  return createPortal(
    <div className="avatar-customisation-overlay" onClick={onClose}>
      <div className="avatar-customisation-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="customisation-header">
          <div className="header-content">
            <h2 className="modal-title">Avatar Customisation</h2>
            <p className="modal-subtitle">Equip gear and track your progression</p>
          </div>
          <button onClick={onClose} className="close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="customisation-body">
          {/* Left Panel - Avatar Preview & Stats */}
          <div className="preview-panel">
            {/* Avatar Display */}
            <div className="avatar-display">
              <AvatarRenderer size={192} animate={true} showStats={false} />
            </div>

            {/* Level & XP */}
            <div className="level-section">
              <div className="level-header">
                <span className="level-label">Level {level}</span>
                <span className="tier-badge" style={{ borderColor: tierData.colors.secondary }}>
                  {tierData.name}
                </span>
              </div>
              <div className="xp-bar">
                <div className="xp-fill" style={{ width: `${xpProgress}%` }} />
              </div>
              <div className="xp-text">
                {xp} / {xpNeeded} XP
              </div>
            </div>

            {/* Stats Summary */}
            <div className="stats-summary">
              <h3 className="stats-title">Current Stats</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon-large">🛡️</div>
                  <div className="stat-content">
                    <div className="stat-value-large">{stats.defense}</div>
                    <div className="stat-label">Defense</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-large">💪</div>
                  <div className="stat-content">
                    <div className="stat-value-large">{stats.strength}</div>
                    <div className="stat-label">Strength</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-large">❤️</div>
                  <div className="stat-content">
                    <div className="stat-value-large">{stats.vitality}</div>
                    <div className="stat-label">Vitality</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-large">🧠</div>
                  <div className="stat-content">
                    <div className="stat-value-large">{stats.intelligence}</div>
                    <div className="stat-label">Intelligence</div>
                  </div>
                </div>
                {stats.wisdom > 0 && (
                  <div className="stat-card">
                    <div className="stat-icon-large">✨</div>
                    <div className="stat-content">
                      <div className="stat-value-large">{stats.wisdom}</div>
                      <div className="stat-label">Wisdom</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Equipment Selection */}
          <div className="equipment-panel">
            {/* Slot Selector */}
            <div className="slot-selector">
              {EQUIPMENT_SLOTS.map(slot => {
                const isEquipped = equipped[slot.id];
                const equippedItem = isEquipped ? EQUIPMENT_DATABASE[equipped[slot.id]] : null;

                return (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot.id)}
                    className={`slot-btn ${selectedSlot === slot.id ? 'active' : ''} ${isEquipped ? 'equipped' : ''}`}
                  >
                    <span className="slot-icon">{slot.icon}</span>
                    <span className="slot-name">{slot.name}</span>
                    {isEquipped && (
                      <div
                        className="equipped-indicator"
                        style={{ background: EQUIPMENT_RARITY[equippedItem.rarity].color }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Equipment List for Selected Slot */}
            <div className="equipment-list">
              <div className="equipment-list-header">
                <h3 className="list-title">
                  {EQUIPMENT_SLOTS.find(s => s.id === selectedSlot)?.icon}{' '}
                  {EQUIPMENT_SLOTS.find(s => s.id === selectedSlot)?.name}
                </h3>
                {equipped[selectedSlot] && (
                  <button onClick={handleUnequip} className="unequip-btn">
                    Remove
                  </button>
                )}
              </div>

              <div className="equipment-items">
                {slotEquipment.map(item => {
                  const isUnlocked = effectiveUnlocked.includes(item.id);
                  const isEquipped = equipped[selectedSlot] === item.id;
                  const rarityData = EQUIPMENT_RARITY[item.rarity];

                  return (
                    <div
                      key={item.id}
                      onClick={() => isUnlocked && handleEquip(item.id)}
                      className={`equipment-item ${isUnlocked ? '' : 'locked'} ${isEquipped ? 'equipped' : ''}`}
                      style={{
                        borderColor: isUnlocked ? rarityData.borderColor : 'rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      {/* Equipment Icon/Preview */}
                      <div className="item-icon">
                        {isUnlocked ? (
                          <span style={{ color: rarityData.color }}>{EQUIPMENT_SLOTS.find(s => s.id === selectedSlot)?.icon}</span>
                        ) : (
                          <Lock className="w-6 h-6" style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                        )}
                      </div>

                      {/* Equipment Info */}
                      <div className="item-info">
                        <div className="item-header">
                          <h4 className="item-name" style={{ color: isUnlocked ? rarityData.color : 'rgba(255, 255, 255, 0.5)' }}>
                            {item.name}
                          </h4>
                          {isEquipped && (
                            <div className="equipped-badge">
                              <Check className="w-3 h-3" />
                              Equipped
                            </div>
                          )}
                        </div>
                        <p className="item-description">{item.description}</p>

                        {/* Stats */}
                        {item.stats && (
                          <div className="item-stats">
                            {Object.entries(item.stats).map(([stat, value]) => (
                              <div key={stat} className="item-stat">
                                <TrendingUp className="w-3 h-3" />
                                <span className="stat-name">{stat}</span>
                                <span className="stat-plus">+{value}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Rarity & Tier */}
                        <div className="item-meta">
                          <span className="rarity-badge" style={{ color: rarityData.color }}>
                            <Star className="w-3 h-3" fill="currentColor" />
                            {rarityData.name}
                          </span>
                          <span className="tier-badge-small">Tier {item.tier}</span>
                        </div>

                        {/* Unlock Condition */}
                        {!isUnlocked && item.unlockMethod !== 'default' && (
                          <div className="unlock-condition">
                            <UnlockBadge
                              method={item.unlockMethod}
                              description={item.unlockDescription}
                              requirement={item.unlockRequirement}
                              size="sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

