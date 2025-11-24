import React from 'react';
import { motion } from 'framer-motion';
import { getRarityColor } from '../../stores/gamificationStore';
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
 * Shows item stats, rarity, and equip status
 */
export default function EquipmentCard({ equipment, isEquipped = false, onEquip, onUnequip }) {
  const item = equipment.equipment_items || equipment;

  const rarityColor = getRarityColor(item.rarity);

  const stats = [
    { icon: ShieldCheckIcon, label: 'Defense', value: item.defense, color: 'text-blue-400' },
    { icon: BoltIcon, label: 'Strength', value: item.strength, color: 'text-red-400' },
    { icon: HeartIcon, label: 'Vitality', value: item.vitality, color: 'text-green-400' },
    { icon: AcademicCapIcon, label: 'Intelligence', value: item.intelligence, color: 'text-purple-400' },
    { icon: SparklesIcon, label: 'Wisdom', value: item.wisdom, color: 'text-amber-400' },
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

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border-2 p-4 relative overflow-hidden cursor-pointer"
      style={{ borderColor: rarityColor }}
      onClick={isEquipped ? onUnequip : onEquip}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-5 blur-2xl"
        style={{ backgroundColor: rarityColor }}
      />

      {/* Equipped badge */}
      {isEquipped && (
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
          EQUIPPED
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Item image */}
        <div className="w-full aspect-square rounded-lg bg-gray-900/50 mb-3 flex items-center justify-center overflow-hidden border border-gray-700/50">
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
              style={{ color: rarityColor }}
            >
              {item.name}
            </h3>
            <span className="text-xs text-gray-400 uppercase">
              {item.slot}
            </span>
          </div>

          {/* Rarity */}
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded text-xs font-semibold uppercase"
              style={{
                backgroundColor: `${rarityColor}20`,
                color: rarityColor,
                border: `1px solid ${rarityColor}40`,
              }}
            >
              {item.rarity}
            </span>
            {item.required_level > 1 && (
              <span className="text-xs text-gray-400">
                Req. Level {item.required_level}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
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
          <div className="pt-3 border-t border-gray-700/50">
            <p className="text-xs text-amber-400 font-semibold mb-1">
              ✨ {item.set_name} Set
            </p>
            {item.set_bonus_3pc && (
              <p className="text-xs text-gray-400">
                (3) {item.set_bonus_3pc}
              </p>
            )}
            {item.set_bonus_5pc && (
              <p className="text-xs text-gray-400">
                (5) {item.set_bonus_5pc}
              </p>
            )}
          </div>
        )}

        {/* Lore text */}
        {item.lore_text && (
          <div className="mt-3 pt-3 border-t border-gray-700/50">
            <p className="text-xs text-gray-500 italic">
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
          {isEquipped ? 'Unequip' : 'Equip'}
        </button>
      </div>
    </motion.div>
  );
}

/**
 * Equipment Grid - Display multiple equipment items
 */
export function EquipmentGrid({ equipment = [], equippedIds = [], onEquip, onUnequip, columns = 3 }) {
  if (!equipment || equipment.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="text-6xl mb-3">📦</div>
        <p className="text-lg">No equipment yet</p>
        <p className="text-sm mt-1">Unlock equipment by leveling up and completing achievements!</p>
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
