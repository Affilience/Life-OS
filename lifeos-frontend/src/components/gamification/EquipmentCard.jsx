import React from 'react';
import { motion } from 'framer-motion';
import { getRarityColor } from '../../stores/gamificationStore';
import { useGamificationModeStore } from '../../stores/gamificationModeStore';
import {
  ShieldCheckIcon,
  BoltIcon,
  HeartIcon,
  AcademicCapIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

/**
 * Equipment Card - Display for equipment items
 *
 * Supports gamification modes:
 * - Cosmic: Full RPG-style display with rarities and effects
 * - Professional: Clean "Booster" display with percentages
 * - Minimal: Hidden (bonuses still apply)
 */
export default function EquipmentCard({ equipment, isEquipped = false, onEquip, onUnequip }) {
  const item = equipment.equipment_items || equipment;

  // Get gamification mode settings
  const { mode, getTerm, isVisible, getEquipmentName, getRarityName } = useGamificationModeStore();
  const showEquipment = isVisible('showEquipment');
  const showEffects = isVisible('showEquipmentEffects');
  const showRarityGlow = isVisible('showRarityGlow');

  const rarityColor = getRarityColor(item.rarity);

  // Get mode-appropriate display values
  const displayName = mode === 'cosmic' ? item.name : getEquipmentName(item.id) || item.name;
  const rarityLabel = getRarityName(item.rarity);
  const equipLabel = getTerm('equip');
  const unequipLabel = getTerm('unequip');
  const statsLabel = getTerm('stats');

  // Get mode-appropriate stat labels
  const statLabels = {
    defense: getTerm('defense'),
    strength: getTerm('strength'),
    vitality: getTerm('vitality'),
    intelligence: getTerm('intelligence'),
    wisdom: getTerm('wisdom'),
  };

  const stats = [
    { icon: ShieldCheckIcon, label: statLabels.defense, value: item.defense, color: 'text-blue-400' },
    { icon: BoltIcon, label: statLabels.strength, value: item.strength, color: 'text-red-400' },
    { icon: HeartIcon, label: statLabels.vitality, value: item.vitality, color: 'text-green-400' },
    { icon: AcademicCapIcon, label: statLabels.intelligence, value: item.intelligence, color: 'text-purple-400' },
    { icon: SparklesIcon, label: statLabels.wisdom, value: item.wisdom, color: 'text-amber-400' },
  ].filter(stat => stat.value > 0);

  const slotIcons = {
    helmet: '⛑️',
    chest: '🛡️',
    weapon: '⚔️',
    shield: '🛡️',
    cape: '🧥',
    ring: '💍',
    amulet: '📿',
  };

  // Professional mode: simpler slot labels
  const professionalSlotLabels = {
    helmet: 'Focus',
    chest: 'Core',
    weapon: 'Tool',
    shield: 'Guard',
    cape: 'Boost',
    ring: 'Trait',
    amulet: 'Trait',
  };

  const slotLabel = mode === 'cosmic' ? item.slot : professionalSlotLabels[item.slot] || item.slot;

  // Use mode-appropriate border color
  const borderColor = showRarityGlow ? rarityColor : 'rgba(255, 255, 255, 0.2)';

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      className="bg-[#1a1724]/50 backdrop-blur-sm rounded-xl border-2 p-4 relative overflow-hidden cursor-pointer"
      style={{ borderColor }}
      onClick={isEquipped ? onUnequip : onEquip}
    >
      {/* Background glow - only in cosmic mode with effects enabled */}
      {showEffects && (
        <div
          className="absolute inset-0 opacity-5 blur-2xl"
          style={{ backgroundColor: rarityColor }}
        />
      )}

      {/* Equipped badge */}
      {isEquipped && (
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
          EQUIPPED
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Item image */}
        <div className="w-full aspect-square rounded-lg bg-[#12101a]/50 mb-3 flex items-center justify-center overflow-hidden border border-white/15/50">
          {item.image_path ? (
            <img
              src={item.image_path}
              alt={item.name}
              className="w-full h-full object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <span className="text-6xl">{slotIcons[item.slot] || '❓'}</span>
          )}
        </div>

        {/* Item name & slot */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <h3
              className="font-bold text-lg leading-tight"
              style={{ color: showRarityGlow ? rarityColor : 'rgba(255, 255, 255, 0.87)' }}
            >
              {displayName}
            </h3>
            <span className="text-xs text-white/60 uppercase">
              {slotLabel}
            </span>
          </div>

          {/* Rarity/Tier */}
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded text-xs font-semibold uppercase"
              style={{
                backgroundColor: showRarityGlow ? `${rarityColor}20` : 'rgba(59, 130, 246, 0.2)',
                color: showRarityGlow ? rarityColor : '#60a5fa',
                border: showRarityGlow ? `1px solid ${rarityColor}40` : '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              {rarityLabel}
            </span>
            {item.required_level > 1 && (
              <span className="text-xs text-white/60">
                Req. {getTerm('level')} {item.required_level}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-white/60 mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Stats */}
        {stats.length > 0 && (
          <div className="space-y-2 mb-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-sm text-gray-300">{stat.label}</span>
                  </div>
                  <span className={`text-sm font-semibold ${stat.color}`}>
                    +{stat.value}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Set bonus info */}
        {item.set_name && (
          <div className="pt-3 border-t border-white/15/50">
            <p className="text-xs text-amber-400 font-semibold mb-1">
              ✨ {item.set_name} Set
            </p>
            {item.set_bonus_3pc && (
              <p className="text-xs text-white/60">
                (3) {item.set_bonus_3pc}
              </p>
            )}
            {item.set_bonus_5pc && (
              <p className="text-xs text-white/60">
                (5) {item.set_bonus_5pc}
              </p>
            )}
          </div>
        )}

        {/* Lore text */}
        {item.lore_text && (
          <div className="mt-3 pt-3 border-t border-white/15/50">
            <p className="text-xs text-white/50 italic">
              "{item.lore_text}"
            </p>
          </div>
        )}

        {/* Action button */}
        <button
          className={`w-full mt-3 py-2 rounded-lg font-semibold text-sm transition-all ${
            isEquipped
              ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (isEquipped) {
              onUnequip?.();
            } else {
              onEquip?.();
            }
          }}
        >
          {isEquipped ? unequipLabel : equipLabel}
        </button>
      </div>
    </motion.div>
  );
}

/**
 * Equipment Grid - Display multiple equipment items
 *
 * Supports gamification modes - returns null in minimal mode
 */
export function EquipmentGrid({ equipment = [], equippedIds = [], onEquip, onUnequip, columns = 3 }) {
  const { mode, getTerm, isVisible } = useGamificationModeStore();
  const showEquipment = isVisible('showEquipment');

  // In minimal mode, don't show equipment grid (bonuses still apply)
  if (!showEquipment) {
    return null;
  }

  const equipmentLabel = getTerm('equipment');

  if (!equipment || equipment.length === 0) {
    return (
      <div className="text-center py-12 text-white/60">
        <div className="text-6xl mb-3">{mode === 'cosmic' ? '📦' : '📊'}</div>
        <p className="text-lg">No {equipmentLabel.toLowerCase()} yet</p>
        <p className="text-sm mt-1">
          {mode === 'cosmic'
            ? 'Unlock equipment by leveling up and completing achievements!'
            : 'Unlock boosters by reaching milestones and completing goals!'}
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(240px, 1fr))` }}
    >
      {equipment.map((item) => {
        const itemId = item.equipment_id || item.id;
        const isEquipped = equippedIds.includes(itemId);

        return (
          <EquipmentCard
            key={itemId}
            equipment={item}
            isEquipped={isEquipped}
            onEquip={() => onEquip?.(itemId)}
            onUnequip={() => onUnequip?.(itemId)}
          />
        );
      })}
    </div>
  );
}
