import React, { useState, useMemo, useEffect } from 'react';
import {
  ShoppingBag,
  Sword,
  Sparkles,
  Gift,
  Zap,
  Lock,
  Check,
  Coins,
  Package,
  Search,
  PawPrint,
  Wand2,
} from 'lucide-react';
import { useGamificationStore, getRarityColor } from '../../stores/gamificationStore';
import { useGamificationModeStore, TERMINOLOGY, VISIBILITY } from '../../stores/gamificationModeStore';
import { useAvatarStore } from '../../stores/avatarStore';
import { usePetStore, PET_DATABASE, TIER_INFO } from '../../stores/petStore';
import useElementalAbilityStore from '../../stores/elementalAbilityStore';
import { EQUIPMENT_DATABASE } from '../../data/equipmentDatabase';
import { getBazaarAbilities } from '../../data/elementalAbilities';
import { ABILITY_TYPES } from '../../data/weaponAbilities';
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
  // For abilities, use iconPath
  if (item.iconPath) return item.iconPath;
  if (item.sprite?.path) return item.sprite.path;
  if (typeof item.sprite === 'string') return item.sprite;
  return null;
};

// ============================================
// SHOP ITEM DEFINITIONS
// ============================================

// Equipment items are now loaded dynamically from equipmentDatabase via getPurchasableEquipment()
// This avoids duplicates between hardcoded and database items
const EQUIPMENT_ITEMS = [];

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
  { id: 'gear', label: 'Gear', icon: Sword },
  { id: 'abilities', label: 'Abilities', icon: Wand2 },
  { id: 'companions', label: 'Companions', icon: PawPrint },
  { id: 'consumable', label: 'Consumables', icon: Zap },
  { id: 'cosmetic', label: 'Cosmetics', icon: Sparkles },
  { id: 'irl_reward', label: 'IRL Rewards', icon: Gift },
];

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

// ============================================
// SUB-COMPONENTS
// ============================================

// Rarity-based visual styles for showcase cards
const RARITY_STYLES = {
  common: {
    border: 'border-gray-500/50',
    bg: 'from-gray-500/20 to-gray-600/10',
    glow: 'shadow-gray-500/20',
    text: 'text-gray-400',
    badge: 'bg-gray-500/30 text-gray-300',
  },
  uncommon: {
    border: 'border-green-500/50',
    bg: 'from-green-500/20 to-green-600/10',
    glow: 'shadow-green-500/20',
    text: 'text-green-400',
    badge: 'bg-green-500/30 text-green-300',
  },
  rare: {
    border: 'border-blue-500/50',
    bg: 'from-blue-500/20 to-blue-600/10',
    glow: 'shadow-blue-500/30',
    text: 'text-blue-400',
    badge: 'bg-blue-500/30 text-blue-300',
  },
  epic: {
    border: 'border-purple-500/50',
    bg: 'from-purple-500/20 to-purple-600/10',
    glow: 'shadow-purple-500/30',
    text: 'text-purple-400',
    badge: 'bg-purple-500/30 text-purple-300',
  },
  legendary: {
    border: 'border-yellow-500/50',
    bg: 'from-yellow-500/20 to-amber-600/10',
    glow: 'shadow-yellow-500/40',
    text: 'text-yellow-400',
    badge: 'bg-yellow-500/30 text-yellow-200',
  },
  mythic: {
    border: 'border-pink-500/50',
    bg: 'from-pink-500/20 to-rose-600/10',
    glow: 'shadow-pink-500/40',
    text: 'text-pink-400',
    badge: 'bg-pink-500/30 text-pink-200',
  },
};

function ItemCard({ item, owned, canAfford, onPurchase, level, mode }) {
  const isLocked = item.levelRequired && level < item.levelRequired;
  const rarityColor = getRarityColor(item.rarity);
  const style = RARITY_STYLES[item.rarity] || RARITY_STYLES.common;
  const isAbility = item.itemType === 'ability';
  const isPet = item.itemType === 'pet';

  return (
    <button
      onClick={() => !owned && canAfford && !isLocked && onPurchase(item)}
      disabled={owned || !canAfford || isLocked}
      className={`
        relative rounded-xl border overflow-hidden text-left w-full
        bg-gradient-to-br ${style.bg} ${style.border}
        shadow-lg ${style.glow}
        transition-all duration-200
        ${!owned && canAfford && !isLocked ? 'hover:scale-[1.03] hover:shadow-xl cursor-pointer' : ''}
        ${owned ? 'ring-2 ring-green-500/50' : ''}
        ${isLocked ? 'opacity-50' : ''}
      `}
    >
      {/* Top badges row */}
      <div className="absolute top-1.5 left-1.5 right-1.5 z-10 flex justify-between items-start">
        {/* Rarity badge */}
        <span className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold uppercase ${style.badge}`}>
          {isAbility ? 'Skill' : isPet ? 'Pet' : item.rarity?.charAt(0)}
        </span>

        {/* Status badges */}
        <div className="flex gap-1">
          {owned && (
            <span className="bg-green-500 text-white text-[8px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Check className="w-2.5 h-2.5" />
            </span>
          )}
          {isLocked && (
            <span className="bg-red-500/80 text-white text-[8px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Lock className="w-2.5 h-2.5" />
              {item.levelRequired}
            </span>
          )}
          {item.rarity === 'legendary' && (
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
          )}
          {isAbility && (
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          )}
        </div>
      </div>

      {/* Item sprite - larger and centered */}
      <div className="flex items-center justify-center p-3 pt-7 sm:p-4 sm:pt-8">
        {getItemSprite(item) ? (
          <img
            src={getItemSprite(item)}
            alt={item.name}
            className="w-12 h-12 sm:w-16 sm:h-16 object-contain drop-shadow-lg"
            style={{ imageRendering: 'pixelated' }}
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        {/* Fallback emoji */}
        <span
          className="text-3xl sm:text-4xl items-center justify-center"
          style={{ display: getItemSprite(item) ? 'none' : 'flex' }}
        >
          {item.icon}
        </span>
      </div>

      {/* Item info */}
      <div className="px-2 pb-2 sm:px-3 sm:pb-3 text-center">
        <h4 className={`text-[11px] sm:text-sm font-bold truncate ${style.text}`}>
          {item.name}
        </h4>

        {/* Stats preview or description */}
        {item.stats ? (
          <p className="text-[9px] sm:text-[10px] text-white/50 truncate mt-0.5">
            {Object.entries(item.stats).slice(0, 2).map(([stat, val]) => `+${val} ${stat.slice(0, 3).toUpperCase()}`).join(' ')}
          </p>
        ) : isAbility ? (
          <p className="text-[9px] sm:text-[10px] text-white/50 truncate mt-0.5">
            {item.element} • {item.damage}x DMG
          </p>
        ) : (
          <p className="text-[9px] sm:text-[10px] text-white/50 truncate mt-0.5 line-clamp-1">
            {item.description?.slice(0, 30)}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-center gap-1 mt-1.5">
          <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400" />
          <span className={`text-[11px] sm:text-xs font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
            {item.price?.toLocaleString()}
          </span>
        </div>
      </div>
    </button>
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

        {/* Ability Info */}
        {item.itemType === 'ability' && (
          <div className="bg-[#0c0a10] rounded-xl p-4 mb-6">
            <div className="text-xs text-white/50 mb-2">ABILITY STATS</div>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-1 text-purple-400 capitalize">
                {item.element} Element
              </span>
              <span className="text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1 text-red-400">
                {item.damage}x Damage
              </span>
              <span className="text-sm bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-1 text-blue-400">
                {(item.cooldown / 1000).toFixed(0)}s Cooldown
              </span>
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
  const [purchasableAbilities, setPurchasableAbilities] = useState([]);

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
  const { isAbilityUnlocked, unlockFromBazaar } = useElementalAbilityStore();

  const { mode } = useGamificationModeStore();
  const terms = TERMINOLOGY[mode] || TERMINOLOGY.cosmic;
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;

  // Fetch purchasable pets, gear, and abilities
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
          ability: item.ability, // Include weapon ability for display
          weaponType: item.weaponType, // Include weapon type
        };
      }));

      // Get purchasable abilities from elementalAbilities
      const abilities = getBazaarAbilities();
      setPurchasableAbilities(abilities.map(ability => ({
        id: ability.id,
        name: ability.name,
        description: ability.description,
        category: 'abilities',
        rarity: ability.rarity,
        price: ability.price,
        icon: ability.icon,
        iconPath: ability.iconPath,
        element: ability.element,
        damage: ability.damage,
        cooldown: ability.cooldown,
        tier: ability.tier,
        itemType: 'ability',
      })));
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
    // Add owned abilities
    purchasableAbilities.forEach(ability => {
      if (isAbilityUnlocked(ability.id)) {
        ids.add(ability.id);
      }
    });
    // Also check localStorage for non-equipment items (legacy)
    try {
      const owned = JSON.parse(localStorage.getItem('owned_shop_items') || '[]');
      owned.forEach(id => ids.add(id));
    } catch (e) {}
    return ids;
  }, [ownedEquipment, ownedCosmetics, ownedPets, unlockedEquipment, purchasableAbilities, isAbilityUnlocked]);

  // Combine all items including dynamic pets, gear, and abilities
  const allItemsWithDynamic = useMemo(() => {
    return [...ALL_ITEMS, ...purchasablePets, ...purchasableGear, ...purchasableAbilities];
  }, [purchasablePets, purchasableGear, purchasableAbilities]);

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

    // Handle ability purchases
    if (item.itemType === 'ability') {
      const result = await unlockService.purchaseAbility(item.id);
      if (result.success) {
        setPurchaseItem(null);
        setSuccessItem({
          ...item,
          purchaseResult: result,
        });
      } else {
        console.error('Failed to purchase ability:', result.error);
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
    <div className="space-y-3 sm:space-y-4">
      {/* Header with Currency - compact */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-bold text-white">{terms.bazaar}</h2>
            <p className="text-[10px] sm:text-xs text-white/50">Equipment & Abilities</p>
          </div>
        </div>

        {/* Currency Display */}
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1">
          <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
          <span className="text-sm sm:text-base font-bold text-yellow-400">{cosmicCredits?.toLocaleString()}</span>
        </div>
      </div>

      {/* Search & Filters - compact row */}
      <div className="flex gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#1a1724] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Rarity Filter */}
        <select
          value={rarityFilter}
          onChange={(e) => setRarityFilter(e.target.value)}
          className="px-2 py-1.5 bg-[#1a1724] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500/50"
        >
          <option value="all">All</option>
          {RARITY_ORDER.map(rarity => (
            <option key={rarity} value={rarity}>
              {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Category Tabs - compact pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide w-full">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          // Count items including dynamic pets, gear, and abilities
          const count = cat.id === 'all'
            ? allItemsWithDynamic.length
            : cat.id === 'companions'
              ? purchasablePets.length
              : cat.id === 'gear'
                ? purchasableGear.length
                : cat.id === 'abilities'
                  ? purchasableAbilities.length
                  : ALL_ITEMS.filter(i => i.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`
                flex items-center gap-1 px-2.5 py-1.5 rounded-full font-medium text-[10px] sm:text-xs
                whitespace-nowrap transition-all duration-200 flex-shrink-0
                ${isActive
                  ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                  : 'bg-white/5 text-white/50 border border-white/10 hover:text-white/80'
                }
              `}
            >
              <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">{cat.label}</span>
              <span className="sm:hidden">{cat.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Items Grid - 3 cols mobile, 4 cols tablet, 5 cols desktop */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
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
