import React, { useState, useMemo, useEffect } from 'react';
import {
  ShoppingBag,
  Sword,
  Sparkles,
  Gift,
  Zap,
  Star,
  Shield,
  Crown,
  Heart,
  Brain,
  Lock,
  Check,
  ChevronRight,
  Coins,
  Package,
  Filter,
  Search,
  PawPrint,
  HardHat,
} from 'lucide-react';
import { useGamificationStore, getRarityColor } from '../../stores/gamificationStore';
import { useGamificationModeStore, TERMINOLOGY, VISIBILITY } from '../../stores/gamificationModeStore';
import { useAvatarStore } from '../../stores/avatarStore';
import { usePetStore, PET_DATABASE, TIER_INFO } from '../../stores/petStore';
import { EQUIPMENT_DATABASE } from '../../data/equipmentDatabase';
import unlockService from '../../services/unlockService';

// ============================================
// SPRITE PATH HELPER
// ============================================

const getSpritePath = (category, id) => {
  const categoryMap = {
    'equipment': (id) => {
      if (id.startsWith('sword_')) return `/assets/bazaar/weapons/${id}.png`;
      if (id.startsWith('armor_')) return `/assets/bazaar/armor/${id}.png`;
      if (id.startsWith('ring_')) return `/assets/equipment/rings/${id}.png`;
      if (id.startsWith('amulet_')) return `/assets/equipment/amulets/${id}.png`;
      if (id.startsWith('legs_')) return `/assets/equipment/legs/${id}.png`;
      if (id.startsWith('cloak_')) return `/assets/bazaar/accessories/${id}.png`;
      return null;
    },
    'consumable': (id) => `/assets/bazaar/consumables/${id}.png`,
    'cosmetic': (id) => `/assets/bazaar/cosmetics/${id}.png`,
  };

  const pathFn = categoryMap[category];
  return pathFn ? pathFn(id) : null;
};

// Helper to get sprite from item (handles object { path: '...' } or string formats)
const getItemSprite = (item) => {
  if (!item) return null;
  if (item.sprite?.path) return item.sprite.path;
  if (typeof item.sprite === 'string') return item.sprite;
  return null;
};

// ============================================
// SHOP ITEM DEFINITIONS
// ============================================

const EQUIPMENT_ITEMS = [
  // Weapons
  {
    id: 'sword_novice',
    name: 'Novice Blade',
    description: 'A simple training sword for beginners',
    category: 'equipment',
    slot: 'weapon',
    rarity: 'common',
    price: 50,
    icon: '🗡️',
    sprite: '/assets/bazaar/weapons/sword_novice.png',
    stats: { strength: 3 },
    levelRequired: 1,
  },
  {
    id: 'sword_iron',
    name: 'Iron Longsword',
    description: 'A sturdy iron blade forged by skilled hands',
    category: 'equipment',
    slot: 'weapon',
    rarity: 'uncommon',
    price: 150,
    icon: '⚔️',
    sprite: '/assets/bazaar/weapons/sword_iron.png',
    stats: { strength: 8, vitality: 2 },
    levelRequired: 5,
  },
  {
    id: 'sword_crystal',
    name: 'Crystal Saber',
    description: 'Infused with crystalline energy',
    category: 'equipment',
    slot: 'weapon',
    rarity: 'rare',
    price: 400,
    icon: '💎',
    sprite: '/assets/bazaar/weapons/sword_crystal.png',
    stats: { strength: 15, intelligence: 5 },
    levelRequired: 10,
  },
  {
    id: 'sword_void',
    name: 'Voidbringer',
    description: 'A blade that cuts through reality itself',
    category: 'equipment',
    slot: 'weapon',
    rarity: 'epic',
    price: 1000,
    icon: '🌑',
    sprite: '/assets/bazaar/weapons/sword_void.png',
    stats: { strength: 25, wisdom: 10, intelligence: 8 },
    levelRequired: 20,
  },
  {
    id: 'sword_celestial',
    name: 'Celestial Excalibur',
    description: 'Forged from a fallen star',
    category: 'equipment',
    slot: 'weapon',
    rarity: 'legendary',
    price: 2500,
    icon: '✨',
    sprite: '/assets/bazaar/weapons/sword_celestial.png',
    stats: { strength: 40, vitality: 15, wisdom: 15, intelligence: 15 },
    levelRequired: 30,
  },
  // Armor
  {
    id: 'armor_leather',
    name: 'Leather Vest',
    description: 'Basic protection for new adventurers',
    category: 'equipment',
    slot: 'armor',
    rarity: 'common',
    price: 40,
    icon: '🥋',
    sprite: '/assets/bazaar/armor/armor_leather.png',
    stats: { defense: 3 },
    levelRequired: 1,
  },
  {
    id: 'armor_chainmail',
    name: 'Chainmail Hauberk',
    description: 'Linked rings of steel provide solid defense',
    category: 'equipment',
    slot: 'armor',
    rarity: 'uncommon',
    price: 180,
    icon: '🛡️',
    sprite: '/assets/bazaar/armor/armor_chainmail.png',
    stats: { defense: 10, vitality: 3 },
    levelRequired: 5,
  },
  {
    id: 'armor_plate',
    name: 'Plate Armor',
    description: 'Heavy but nearly impenetrable',
    category: 'equipment',
    slot: 'armor',
    rarity: 'rare',
    price: 450,
    icon: '🏰',
    sprite: '/assets/bazaar/armor/armor_plate.png',
    stats: { defense: 20, vitality: 8 },
    levelRequired: 12,
  },
  {
    id: 'armor_cosmic',
    name: 'Cosmic Guardian Plate',
    description: 'Armor blessed by the stars themselves',
    category: 'equipment',
    slot: 'armor',
    rarity: 'epic',
    price: 1200,
    icon: '🌌',
    sprite: '/assets/bazaar/armor/armor_cosmic.png',
    stats: { defense: 35, vitality: 15, wisdom: 5 },
    levelRequired: 22,
  },
  // Leg Armor & Accessories
  {
    id: 'ring_vitality',
    name: 'Ring of Vitality',
    description: 'A ring pulsing with life energy',
    category: 'equipment',
    slot: 'ring',
    rarity: 'rare',
    price: 250,
    icon: '💍',
    sprite: '/assets/equipment/rings/vitality_ring.png',
    stats: { vitality: 6, defense: 3 },
    levelRequired: 15,
  },
  {
    id: 'amulet_guardian',
    name: 'Guardian Pendant',
    description: 'Protection of the guardians',
    category: 'equipment',
    slot: 'amulet',
    rarity: 'rare',
    price: 300,
    icon: '📿',
    sprite: '/assets/equipment/amulets/guardian_pendant.png',
    stats: { defense: 6, vitality: 5 },
    levelRequired: 15,
  },
  {
    id: 'legs_chainmail',
    name: 'Chainmail Leggings',
    description: 'Interlocking metal rings protect your legs',
    category: 'equipment',
    slot: 'legs',
    rarity: 'rare',
    price: 350,
    icon: '👖',
    sprite: '/assets/equipment/legs/chainmail_leggings.png',
    stats: { defense: 4, vitality: 2 },
    levelRequired: 8,
  },
  {
    id: 'cloak_shadows',
    name: 'Cloak of Shadows',
    description: 'Wraps you in protective darkness',
    category: 'equipment',
    slot: 'accessory',
    rarity: 'epic',
    price: 800,
    icon: '🧥',
    sprite: '/assets/bazaar/accessories/cloak_shadows.png',
    stats: { wisdom: 20, intelligence: 10, defense: 5 },
    levelRequired: 18,
  },
];

const CONSUMABLE_ITEMS = [
  {
    id: 'potion_xp_small',
    name: 'XP Elixir (Small)',
    description: '+50 XP instantly',
    category: 'consumable',
    type: 'instant',
    rarity: 'common',
    price: 25,
    icon: '🧪',
    sprite: '/assets/bazaar/consumables/potion_xp_small.png',
    effect: { type: 'xp', amount: 50 },
  },
  {
    id: 'potion_xp_medium',
    name: 'XP Elixir (Medium)',
    description: '+200 XP instantly',
    category: 'consumable',
    type: 'instant',
    rarity: 'uncommon',
    price: 80,
    icon: '🧪',
    sprite: '/assets/bazaar/consumables/potion_xp_medium.png',
    effect: { type: 'xp', amount: 200 },
  },
  {
    id: 'potion_xp_large',
    name: 'XP Elixir (Large)',
    description: '+500 XP instantly',
    category: 'consumable',
    type: 'instant',
    rarity: 'rare',
    price: 175,
    icon: '🧪',
    sprite: '/assets/bazaar/consumables/potion_xp_large.png',
    effect: { type: 'xp', amount: 500 },
  },
  {
    id: 'boost_xp_2x',
    name: 'Double XP Scroll',
    description: '2x XP for 24 hours',
    category: 'consumable',
    type: 'boost',
    rarity: 'rare',
    price: 300,
    icon: '📜',
    sprite: '/assets/bazaar/consumables/boost_xp_2x.png',
    effect: { type: 'xp_multiplier', amount: 2, duration: 24 },
  },
  {
    id: 'shield_streak',
    name: 'Streak Shield',
    description: 'Protects one streak from breaking',
    category: 'consumable',
    type: 'protection',
    rarity: 'uncommon',
    price: 100,
    icon: '🛡️',
    sprite: '/assets/bazaar/consumables/shield_streak.png',
    effect: { type: 'shield', amount: 1 },
  },
  {
    id: 'shield_streak_pack',
    name: 'Shield Pack (3)',
    description: 'Three Streak Shields at a discount',
    category: 'consumable',
    type: 'protection',
    rarity: 'rare',
    price: 250,
    icon: '🛡️',
    sprite: '/assets/bazaar/consumables/shield_streak.png',
    effect: { type: 'shield', amount: 3 },
  },
];

const COSMETIC_ITEMS = [
  {
    id: 'title_pioneer',
    name: 'Pioneer Title',
    description: 'Display "Pioneer" above your name',
    category: 'cosmetic',
    type: 'title',
    rarity: 'uncommon',
    price: 200,
    icon: '🏷️',
  },
  {
    id: 'title_cosmic_warrior',
    name: 'Cosmic Warrior Title',
    description: 'Display "Cosmic Warrior" above your name',
    category: 'cosmetic',
    type: 'title',
    rarity: 'rare',
    price: 400,
    icon: '🏷️',
  },
  {
    id: 'title_legend',
    name: 'Legend Title',
    description: 'Display "Legend" above your name',
    category: 'cosmetic',
    type: 'title',
    rarity: 'epic',
    price: 800,
    icon: '🏷️',
  },
  {
    id: 'frame_golden',
    name: 'Golden Frame',
    description: 'A prestigious golden avatar border',
    sprite: '/assets/bazaar/cosmetics/frame_golden.png',
    category: 'cosmetic',
    type: 'frame',
    rarity: 'legendary',
    price: 1500,
    icon: '🖼️',
  },
];

const IRL_REWARDS = [
  {
    id: 'irl_coffee',
    name: 'Coffee Break',
    description: 'Treat yourself to a nice coffee',
    category: 'irl_reward',
    rarity: 'common',
    price: 50,
    icon: '☕',
    suggestion: 'Go get your favourite coffee!',
  },
  {
    id: 'irl_snack',
    name: 'Snack Time',
    description: 'Enjoy a favourite snack guilt-free',
    category: 'irl_reward',
    rarity: 'common',
    price: 75,
    icon: '🍫',
    suggestion: 'Grab that snack you\'ve been craving!',
  },
  {
    id: 'irl_gaming',
    name: 'Gaming Hour',
    description: '1 hour of guilt-free gaming',
    category: 'irl_reward',
    rarity: 'uncommon',
    price: 150,
    icon: '🎮',
    suggestion: 'Fire up your favourite game!',
  },
  {
    id: 'irl_movie',
    name: 'Movie Night',
    description: 'Watch a movie without guilt',
    category: 'irl_reward',
    rarity: 'uncommon',
    price: 200,
    icon: '🎬',
    suggestion: 'Pick a movie and relax!',
  },
  {
    id: 'irl_restaurant',
    name: 'Restaurant Treat',
    description: 'Go out for a nice meal',
    category: 'irl_reward',
    rarity: 'rare',
    price: 400,
    icon: '🍽️',
    suggestion: 'Book a table at your favourite restaurant!',
  },
  {
    id: 'irl_spa',
    name: 'Self-Care Day',
    description: 'A full day of relaxation',
    category: 'irl_reward',
    rarity: 'epic',
    price: 800,
    icon: '🧖',
    suggestion: 'Take the day off and pamper yourself!',
  },
  {
    id: 'irl_shopping',
    name: 'Shopping Spree',
    description: 'Buy yourself something special',
    category: 'irl_reward',
    rarity: 'epic',
    price: 1000,
    icon: '🛍️',
    suggestion: 'Go get that thing you\'ve been wanting!',
  },
  {
    id: 'irl_vacation',
    name: 'Mini Vacation',
    description: 'Plan a weekend getaway',
    category: 'irl_reward',
    rarity: 'legendary',
    price: 2000,
    icon: '✈️',
    suggestion: 'Book that trip you\'ve been dreaming of!',
  },
];

// Combine all items
const ALL_ITEMS = [...EQUIPMENT_ITEMS, ...CONSUMABLE_ITEMS, ...COSMETIC_ITEMS, ...IRL_REWARDS];

// ============================================
// CATEGORY CONFIGURATION
// ============================================

const CATEGORIES = [
  { id: 'all', label: 'All Items', icon: Package },
  { id: 'companions', label: 'Companions', icon: PawPrint },
  { id: 'gear', label: 'Gear', icon: HardHat },
  { id: 'equipment', label: 'Equipment', icon: Sword },
  { id: 'consumable', label: 'Consumables', icon: Zap },
  { id: 'cosmetic', label: 'Cosmetics', icon: Sparkles },
  { id: 'irl_reward', label: 'IRL Rewards', icon: Gift },
];

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

// ============================================
// SUB-COMPONENTS
// ============================================

function ItemCard({ item, owned, canAfford, onPurchase, level, mode }) {
  const isLocked = item.levelRequired && level < item.levelRequired;
  const rarityColor = getRarityColor(item.rarity);

  return (
    <div
      className={`
        relative bg-[#1a1724] border rounded-xl overflow-hidden
        transition-all duration-200 hover:scale-[1.02]
        ${owned ? 'border-green-500/30 bg-green-500/5' : `border-white/10 hover:border-[${rarityColor}]/50`}
        ${isLocked ? 'opacity-60' : ''}
      `}
      style={{ borderColor: owned ? 'rgba(34, 197, 94, 0.3)' : undefined }}
    >
      {/* Rarity Indicator */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: rarityColor }}
      />

      {/* Owned Badge */}
      {owned && (
        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
          <Check className="w-3 h-3" />
          Owned
        </div>
      )}

      {/* Locked Badge */}
      {isLocked && (
        <div className="absolute top-3 right-3 bg-red-500/80 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
          <Lock className="w-3 h-3" />
          Lv {item.levelRequired}
        </div>
      )}

      <div className="p-4">
        {/* Item Icon & Name */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-12 h-12 p-1 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${rarityColor}20` }}
          >
            {getItemSprite(item) ? (
              <img
                src={getItemSprite(item)}
                alt={item.name}
                className="w-full h-full object-contain pixelated"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            {/* Fallback: Use pixel art slot icon for gear, or emoji for other items */}
            {item.slotIcon ? (
              <img
                src={item.slotIcon}
                alt={item.slot || 'item'}
                className="w-full h-full object-contain"
                style={{
                  imageRendering: 'pixelated',
                  display: getItemSprite(item) ? 'none' : 'block'
                }}
              />
            ) : (
              <span
                className="text-2xl items-center justify-center"
                style={{ display: getItemSprite(item) ? 'none' : 'flex' }}
              >
                {item.icon}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white truncate">{item.name}</h4>
            <p
              className="text-xs font-medium capitalize"
              style={{ color: rarityColor }}
            >
              {item.rarity}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-white/60 mb-3 line-clamp-2">
          {item.description}
        </p>

        {/* Stats (for equipment) */}
        {item.stats && (
          <div className="flex flex-wrap gap-1 mb-3">
            {Object.entries(item.stats).map(([stat, value]) => (
              <span
                key={stat}
                className="text-xs bg-white/5 border border-white/10 rounded px-2 py-0.5 text-white/80"
              >
                +{value} {stat.charAt(0).toUpperCase() + stat.slice(1)}
              </span>
            ))}
          </div>
        )}

        {/* Effect (for consumables) */}
        {item.effect && (
          <div className="text-xs text-purple-400 bg-purple-500/10 rounded px-2 py-1 mb-3">
            {item.effect.type === 'xp' && `+${item.effect.amount} XP`}
            {item.effect.type === 'xp_multiplier' && `${item.effect.amount}x XP for ${item.effect.duration}h`}
            {item.effect.type === 'shield' && `+${item.effect.amount} Shield${item.effect.amount > 1 ? 's' : ''}`}
          </div>
        )}

        {/* Pet Bonus (for companions) */}
        {item.bonusDescription && (
          <div className="text-xs text-cyan-400 bg-cyan-500/10 rounded px-2 py-1 mb-3 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {item.bonusDescription}
          </div>
        )}

        {/* Price & Purchase */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-1">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className={`font-bold ${canAfford ? 'text-white' : 'text-red-400'}`}>
              {item.price}
            </span>
          </div>

          <button
            onClick={() => onPurchase(item)}
            disabled={owned || !canAfford || isLocked}
            className={`
              px-4 py-1.5 rounded-lg text-sm font-medium transition-all
              ${owned
                ? 'bg-green-500/20 text-green-400 cursor-default'
                : isLocked
                  ? 'bg-white/5 text-white/30 cursor-not-allowed'
                  : canAfford
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'
                    : 'bg-white/5 text-white/30 cursor-not-allowed'
              }
            `}
          >
            {owned ? 'Owned' : isLocked ? 'Locked' : 'Buy'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PurchaseModal({ item, onConfirm, onCancel, credits }) {
  const rarityColor = getRarityColor(item.rarity);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1724] border border-white/10 rounded-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="w-20 h-20 p-3 rounded-xl inline-flex items-center justify-center mb-3"
            style={{ backgroundColor: `${rarityColor}20` }}
          >
            {getItemSprite(item) ? (
              <img
                src={getItemSprite(item)}
                alt={item.name}
                className="w-full h-full object-contain"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            {/* Fallback: Use pixel art slot icon for gear, or emoji for other items */}
            {item.slotIcon ? (
              <img
                src={item.slotIcon}
                alt={item.slot || 'item'}
                className="w-full h-full object-contain"
                style={{
                  imageRendering: 'pixelated',
                  display: getItemSprite(item) ? 'none' : 'block'
                }}
              />
            ) : (
              <span
                className="text-5xl items-center justify-center"
                style={{ display: getItemSprite(item) ? 'none' : 'flex' }}
              >
                {item.icon}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
          <p
            className="text-sm font-medium capitalize"
            style={{ color: rarityColor }}
          >
            {item.rarity} {item.category === 'equipment' ? item.slot : item.category.replace('_', ' ')}
          </p>
        </div>

        {/* Description */}
        <p className="text-white/70 text-center mb-6">{item.description}</p>

        {/* IRL Reward Suggestion */}
        {item.suggestion && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
            <p className="text-yellow-400 text-sm text-center">
              <Gift className="w-4 h-4 inline mr-1" />
              {item.suggestion}
            </p>
          </div>
        )}

        {/* Stats */}
        {item.stats && (
          <div className="bg-[#0c0a10] rounded-xl p-4 mb-6">
            <div className="text-xs text-white/50 mb-2">STAT BONUSES</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(item.stats).map(([stat, value]) => (
                <span
                  key={stat}
                  className="text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-white"
                >
                  +{value} {stat.charAt(0).toUpperCase() + stat.slice(1)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Price Summary */}
        <div className="bg-[#0c0a10] rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60">Price</span>
            <div className="flex items-center gap-1">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="font-bold text-white">{item.price}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60">Your Balance</span>
            <span className="text-white">{credits}</span>
          </div>
          <div className="border-t border-white/10 mt-2 pt-2 flex items-center justify-between">
            <span className="text-white/60">After Purchase</span>
            <span className={credits - item.price >= 0 ? 'text-green-400' : 'text-red-400'}>
              {credits - item.price}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(item)}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white rounded-xl font-medium transition-opacity"
          >
            Purchase
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessModal({ item, onClose }) {
  const rarityColor = getRarityColor(item.rarity);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1724] border border-white/10 rounded-2xl max-w-md w-full p-6 text-center">
        {/* Success Animation */}
        <div className="relative inline-block mb-4">
          <div
            className="w-24 h-24 p-4 rounded-2xl animate-bounce flex items-center justify-center"
            style={{ backgroundColor: `${rarityColor}20` }}
          >
            {getItemSprite(item) ? (
              <img
                src={getItemSprite(item)}
                alt={item.name}
                className="w-full h-full object-contain"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            {/* Fallback: Use pixel art slot icon for gear, or emoji for other items */}
            {item.slotIcon ? (
              <img
                src={item.slotIcon}
                alt={item.slot || 'item'}
                className="w-full h-full object-contain"
                style={{
                  imageRendering: 'pixelated',
                  display: getItemSprite(item) ? 'none' : 'block'
                }}
              />
            ) : (
              <span
                className="text-6xl items-center justify-center"
                style={{ display: getItemSprite(item) ? 'none' : 'flex' }}
              >
                {item.icon}
              </span>
            )}
          </div>
          <div className="absolute -top-2 -right-2 bg-green-500 text-white p-2 rounded-full">
            <Check className="w-5 h-5" />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-white mb-2">Purchase Complete!</h3>
        <p className="text-white/60 mb-6">
          {item.category === 'irl_reward'
            ? `You've earned ${item.name}! Go enjoy it!`
            : `${item.name} has been added to your inventory.`}
        </p>

        {/* IRL Reward CTA */}
        {item.suggestion && (
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
            <p className="text-green-400 font-medium">
              {item.suggestion}
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white rounded-xl font-medium transition-opacity"
        >
          {item.category === 'irl_reward' ? 'Claim Reward' : 'Continue Shopping'}
        </button>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function BazaarMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [purchaseItem, setPurchaseItem] = useState(null);
  const [successItem, setSuccessItem] = useState(null);
  const [purchasablePets, setPurchasablePets] = useState([]);
  const [purchasableGear, setPurchasableGear] = useState([]);

  // Get store data
  const {
    cosmicCredits,
    level,
    ownedEquipment,
    spendCredits,
    addXP,
    addToInventory,
  } = useGamificationStore();

  const { addOwnedCosmetic, ownedCosmetics, unlockedEquipment, getPurchasableEquipment, unlockEquipment } = useAvatarStore();
  const { ownedPets, getPurchasablePets } = usePetStore();

  const { mode } = useGamificationModeStore();
  const terms = TERMINOLOGY[mode] || TERMINOLOGY.cosmic;
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;

  // Fetch purchasable pets and gear
  useEffect(() => {
    const fetchPurchasables = () => {
      // Get purchasable pets from pet store
      const pets = getPurchasablePets();
      setPurchasablePets(pets.map(pet => ({
        id: pet.id,
        name: pet.name,
        description: pet.description,
        category: 'companions',
        rarity: pet.tier, // Map tier to rarity for display
        price: pet.price || 0, // Price comes directly from getPurchasablePets
        icon: '🐾',
        sprite: pet.sprite,
        bonusDescription: pet.bonusDescription,
        culture: pet.culture,
        lore: pet.lore,
        itemType: 'pet',
      })));

      // Get purchasable gear from avatar store
      const gear = getPurchasableEquipment();
      setPurchasableGear(gear.map(item => {
        // Slot icon paths using PixelLab-generated pixel art icons
        const slotIconPaths = {
          helmet: '/assets/equipment/slots/slot_helmet.png',
          chest: '/assets/equipment/slots/slot_chest.png',
          suit: '/assets/equipment/slots/slot_chest.png',
          legs: '/assets/equipment/slots/slot_boots.png',
          mainHand: '/assets/equipment/slots/slot_weapon.png',
          offHand: '/assets/equipment/slots/slot_shield.png',
          cape: '/assets/equipment/slots/slot_cape.png',
          ring: '/assets/equipment/slots/slot_ring.png',
          amulet: '/assets/equipment/slots/slot_amulet.png',
          tool: '/assets/equipment/slots/slot_weapon.png',
        };
        // Handle sprite path - can be object { path: '...' } or string
        const spritePath = item.sprite?.path || item.sprite || `/assets/equipment/${item.slot}s/${item.id}.png`;
        return {
          id: item.id,
          name: item.name,
          description: item.description,
          category: 'gear',
          slot: item.slot,
          rarity: item.rarity,
          price: item.price || 0, // Price comes directly from getPurchasableEquipment
          slotIcon: slotIconPaths[item.slot] || '/assets/equipment/slots/slot_empty.png',
          sprite: spritePath,
          stats: item.stats,
          itemType: 'gear',
        };
      }));
    };

    fetchPurchasables();
  }, [ownedPets, unlockedEquipment]);

  // Hide bazaar in minimal mode
  if (!visibility.showBazaar) {
    return null;
  }

  // Get owned item IDs
  const ownedItemIds = useMemo(() => {
    const ids = new Set();
    ownedEquipment.forEach(e => {
      if (e.equipment_items?.shop_id) {
        ids.add(e.equipment_items.shop_id);
      }
    });
    // Add owned cosmetics from avatar store
    ownedCosmetics.forEach(id => ids.add(id));
    // Add owned pets
    ownedPets.forEach(id => ids.add(id));
    // Add unlocked gear
    unlockedEquipment.forEach(id => ids.add(id));
    // Also check localStorage for non-equipment items (legacy)
    try {
      const owned = JSON.parse(localStorage.getItem('owned_shop_items') || '[]');
      owned.forEach(id => ids.add(id));
    } catch (e) {}
    return ids;
  }, [ownedEquipment, ownedCosmetics, ownedPets, unlockedEquipment]);

  // Combine all items including dynamic pets and gear
  const allItemsWithDynamic = useMemo(() => {
    return [...ALL_ITEMS, ...purchasablePets, ...purchasableGear];
  }, [purchasablePets, purchasableGear]);

  // Filter items
  const filteredItems = useMemo(() => {
    return allItemsWithDynamic.filter(item => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Rarity filter - handle pet tiers as rarity
      const itemRarity = item.rarity || item.tier;
      if (rarityFilter !== 'all') {
        // Map pet tiers to rarity for filtering
        const normalizedRarity = itemRarity === 'mythic' ? 'legendary' : itemRarity;
        if (normalizedRarity !== rarityFilter) {
          return false;
        }
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          (item.bonusDescription && item.bonusDescription.toLowerCase().includes(query))
        );
      }

      return true;
    }).sort((a, b) => {
      // Sort by rarity, then by price
      const aRarity = a.rarity === 'mythic' ? 'legendary' : a.rarity;
      const bRarity = b.rarity === 'mythic' ? 'legendary' : b.rarity;
      const rarityDiff = RARITY_ORDER.indexOf(aRarity) - RARITY_ORDER.indexOf(bRarity);
      if (rarityDiff !== 0) return rarityDiff;
      return a.price - b.price;
    });
  }, [selectedCategory, rarityFilter, searchQuery, allItemsWithDynamic]);

  // Handle purchase
  const handlePurchase = async (item) => {
    try {
      console.log('[Bazaar] Attempting purchase:', item.id, item.category, item.itemType);

      // Handle pet purchases through unlock service
      if (item.itemType === 'pet') {
      const result = await unlockService.purchasePet(item.id);
      if (result.success) {
        setPurchaseItem(null);
        setSuccessItem({
          ...item,
          purchaseResult: result,
        });
      } else {
        console.error('Failed to purchase pet:', result.error);
        alert(`Purchase failed: ${result.error || 'Unknown error'}`);
        setPurchaseItem(null);
      }
      return;
    }

    // Handle gear purchases through unlock service
    if (item.itemType === 'gear') {
      const result = await unlockService.purchaseEquipment(item.id);
      if (result.success) {
        setPurchaseItem(null);
        setSuccessItem({
          ...item,
          purchaseResult: result,
        });
      } else {
        console.error('Failed to purchase gear:', result.error);
        alert(`Purchase failed: ${result.error || 'Unknown error'}`);
        setPurchaseItem(null);
      }
      return;
    }

    // Original purchase flow for other items
    const result = await spendCredits(item.price, 'purchase');

    if (!result.success) {
      console.error('Failed to purchase item:', result.error);
      alert(`Purchase failed: ${result.error || 'Unknown error'}`);
      setPurchaseItem(null);
      return;
    }

    // Handle different item types
    if (item.category === 'consumable') {
      // Add consumables to inventory for later use
      addToInventory(item);
    } else if (item.category === 'cosmetic') {
      // Add cosmetics to avatar store
      addOwnedCosmetic(item.id);
    } else if (item.category === 'equipment') {
      // Add equipment directly (credits already spent above)
      await unlockEquipment(item.id);
    } else if (item.category === 'irl_reward') {
      // Add IRL rewards to inventory for proper tracking
      addToInventory({
        ...item,
        effect: {
          type: 'irl_reward',
          suggestion: item.suggestion,
        },
      });
      // Also keep localStorage for backwards compatibility
      try {
        const owned = JSON.parse(localStorage.getItem('owned_shop_items') || '[]');
        owned.push(item.id);
        localStorage.setItem('owned_shop_items', JSON.stringify(owned));
      } catch (e) {}
    } else {
      // Track other owned items in localStorage
      try {
        const owned = JSON.parse(localStorage.getItem('owned_shop_items') || '[]');
        owned.push(item.id);
        localStorage.setItem('owned_shop_items', JSON.stringify(owned));
      } catch (e) {}
    }

    setPurchaseItem(null);
    setSuccessItem(item);
    } catch (error) {
      console.error('[Bazaar] Purchase error:', error);
      alert(`Purchase failed: ${error.message || 'Unknown error'}`);
      setPurchaseItem(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Currency */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            {terms.bazaar}
          </h2>
          <p className="text-white/60 text-xs sm:text-sm mt-1">
            Spend your hard-earned {terms.credits.toLowerCase()} on rewards
          </p>
        </div>

        {/* Currency Display */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl px-3 sm:px-4 py-2 flex items-center gap-2 self-start sm:self-auto">
          <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
          <span className="text-lg sm:text-xl font-bold text-white">{cosmicCredits}</span>
          <span className="text-white/60 text-xs sm:text-sm">{terms.credits.toLowerCase()}</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1a1724] border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Rarity Filter */}
        <select
          value={rarityFilter}
          onChange={(e) => setRarityFilter(e.target.value)}
          className="px-4 py-2 bg-[#1a1724] border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
        >
          <option value="all">All Rarities</option>
          {RARITY_ORDER.map(rarity => (
            <option key={rarity} value={rarity}>
              {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide w-full">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          // Count items including dynamic pets and gear
          const count = cat.id === 'all'
            ? allItemsWithDynamic.length
            : cat.id === 'companions'
              ? purchasablePets.length
              : cat.id === 'gear'
                ? purchasableGear.length
                : ALL_ITEMS.filter(i => i.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`
                flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm
                whitespace-nowrap transition-all duration-200 flex-shrink-0
                ${isActive
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                  : 'bg-[#1a1724] text-white/60 hover:text-white hover:bg-[#221e2e] border border-white/10'
                }
              `}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{cat.label}</span>
              <span className={`text-xs ${isActive ? 'text-white/70' : 'text-white/40'}`}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              owned={ownedItemIds.has(item.id)}
              canAfford={cosmicCredits >= item.price}
              onPurchase={() => setPurchaseItem(item)}
              level={level}
              mode={mode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/40">No items found</p>
        </div>
      )}

      {/* Purchase Confirmation Modal */}
      {purchaseItem && (
        <PurchaseModal
          item={purchaseItem}
          credits={cosmicCredits}
          onConfirm={handlePurchase}
          onCancel={() => setPurchaseItem(null)}
        />
      )}

      {/* Success Modal */}
      {successItem && (
        <SuccessModal
          item={successItem}
          onClose={() => setSuccessItem(null)}
        />
      )}
    </div>
  );
}
