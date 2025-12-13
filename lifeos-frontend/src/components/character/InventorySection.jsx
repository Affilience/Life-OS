/**
 * InventorySection - Combined Inventory & Cosmetics Management
 * Displays consumables and cosmetics in a tabbed interface
 */

import React, { useState } from 'react';
import { Package, Zap, Shield, Star, Sparkles, AlertCircle, Crown, Frame, Check, X } from 'lucide-react';
import { useGamificationStore, getRarityColor } from '../../stores/gamificationStore';
import { useAvatarStore, COSMETIC_DEFINITIONS } from '../../stores/avatarStore';
import { useGamificationModeStore } from '../../stores/gamificationModeStore';

// Rarity colors for cosmetics
const RARITY_COLORS = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

export default function InventorySection() {
  const [activeTab, setActiveTab] = useState('consumables');
  const { inventory, useInventoryItem } = useGamificationStore();
  const { ownedCosmetics, activeCosmetics, setActiveCosmetic } = useAvatarStore();
  const { mode } = useGamificationModeStore();
  const [useConfirmItem, setUseConfirmItem] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Handle using consumable item
  const handleUseItem = (item) => {
    const result = useInventoryItem(item.itemId);
    if (result.success) {
      setUseConfirmItem(null);
      setSuccessMessage({
        item,
        effect: result.effect,
      });
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const getEffectDescription = (effect) => {
    if (!effect) return 'No effect';
    switch (effect.type) {
      case 'xp':
        return `+${effect.amount} XP`;
      case 'xp_multiplier':
        return `${effect.amount}x XP for ${effect.duration}h`;
      case 'shield':
        return `+${effect.amount} Streak Shield${effect.amount > 1 ? 's' : ''}`;
      default:
        return 'Special effect';
    }
  };

  const getEffectIcon = (effect) => {
    if (!effect) return Sparkles;
    switch (effect.type) {
      case 'xp':
        return Zap;
      case 'xp_multiplier':
        return Star;
      case 'shield':
        return Shield;
      default:
        return Sparkles;
    }
  };

  // Group cosmetics by type (excluding aura)
  const groupedCosmetics = React.useMemo(() => {
    const groups = {
      title: [],
      frame: [],
    };

    ownedCosmetics.forEach(id => {
      const def = COSMETIC_DEFINITIONS[id];
      if (def && def.type !== 'aura') {
        groups[def.type]?.push({ id, ...def });
      }
    });

    return groups;
  }, [ownedCosmetics]);

  const handleCosmeticToggle = (type, id) => {
    if (activeCosmetics[type] === id) {
      setActiveCosmetic(type, null);
    } else {
      setActiveCosmetic(type, id);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'title': return Crown;
      case 'frame': return Frame;
      default: return Sparkles;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'title': return 'Titles';
      case 'frame': return 'Frames';
      default: return type;
    }
  };

  // Check if user has any non-aura cosmetics
  const hasAnyCosmetics = ownedCosmetics.some(id => {
    const def = COSMETIC_DEFINITIONS[id];
    return def && def.type !== 'aura';
  });

  const hasConsumables = inventory.length > 0;
  const hasAnything = hasConsumables || hasAnyCosmetics;

  // Empty state for entire section
  if (!hasAnything) {
    return (
      <div className="bg-bg-1 border border-border rounded-2xl p-8 text-center">
        <Package className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-40" />
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Your inventory is empty
        </h3>
        <p className="text-text-muted text-sm max-w-md mx-auto">
          Purchase items and cosmetics from the {mode === 'cosmic' ? 'Bazaar' : 'Shop'} to add them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            Inventory & Cosmetics
          </h3>
          <p className="text-sm text-text-muted">
            {inventory.length} consumable{inventory.length !== 1 ? 's' : ''} • {groupedCosmetics.title.length + groupedCosmetics.frame.length} cosmetic{groupedCosmetics.title.length + groupedCosmetics.frame.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-1 bg-bg-0 p-1 rounded-lg border border-border">
          <button
            onClick={() => setActiveTab('consumables')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'consumables'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Consumables
          </button>
          <button
            onClick={() => setActiveTab('cosmetics')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'cosmetics'
                ? 'bg-purple-500/20 text-purple-400'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            Cosmetics
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-green-400 font-medium">Item used!</p>
            <p className="text-sm text-green-300/70">
              {successMessage.item.name}: {getEffectDescription(successMessage.effect)}
            </p>
          </div>
        </div>
      )}

      {/* Consumables Tab */}
      {activeTab === 'consumables' && (
        <>
          {!hasConsumables ? (
            <div className="bg-bg-1 border border-border rounded-xl p-6 text-center">
              <Zap className="w-12 h-12 mx-auto mb-3 text-text-muted opacity-40" />
              <p className="text-text-muted text-sm">
                No consumable items. Purchase some from the {mode === 'cosmic' ? 'Bazaar' : 'Shop'}!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {inventory.map((item) => {
                const rarityColor = getRarityColor(item.rarity);
                const EffectIcon = getEffectIcon(item.effect);

                return (
                  <div
                    key={item.id}
                    onClick={() => setUseConfirmItem(item)}
                    className="bg-bg-1 border border-border rounded-xl p-4 cursor-pointer hover:border-emerald-500/50 hover:bg-bg-2 transition-all group relative"
                  >
                    {/* Quantity Badge */}
                    {item.quantity > 1 && (
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        x{item.quantity}
                      </div>
                    )}

                    {/* Item Icon */}
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-3 mx-auto"
                      style={{ backgroundColor: `${rarityColor}20` }}
                    >
                      {item.sprite ? (
                        <img
                          src={item.sprite}
                          alt={item.name}
                          className="w-full h-full object-contain pixelated p-1"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      ) : (
                        <span className="text-2xl">{item.icon}</span>
                      )}
                    </div>

                    {/* Item Info */}
                    <h4 className="font-semibold text-text-primary text-sm text-center truncate">
                      {item.name}
                    </h4>
                    <p
                      className="text-xs text-center capitalize mb-2"
                      style={{ color: rarityColor }}
                    >
                      {item.rarity}
                    </p>

                    {/* Effect */}
                    <div className="flex items-center justify-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-1">
                      <EffectIcon className="w-3 h-3" />
                      <span>{getEffectDescription(item.effect)}</span>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 rounded-xl bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg">
                        Use Item
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Cosmetics Tab */}
      {activeTab === 'cosmetics' && (
        <>
          {!hasAnyCosmetics ? (
            <div className="bg-bg-1 border border-border rounded-xl p-6 text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-text-muted opacity-40" />
              <p className="text-text-muted text-sm">
                No cosmetics yet. Purchase titles and frames from the {mode === 'cosmic' ? 'Bazaar' : 'Shop'}!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {['title', 'frame'].map(type => {
                const items = groupedCosmetics[type];
                if (items.length === 0) return null;

                const TypeIcon = getTypeIcon(type);
                const activeId = activeCosmetics[type];

                return (
                  <div key={type} className="bg-bg-1 border border-border rounded-xl p-4">
                    <h4 className="font-semibold text-text-primary flex items-center gap-2 mb-3">
                      <TypeIcon className="w-4 h-4 text-purple-400" />
                      {getTypeLabel(type)}
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {items.map(item => {
                        const isActive = activeId === item.id;
                        const rarityColor = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;

                        return (
                          <button
                            key={item.id}
                            onClick={() => handleCosmeticToggle(type, item.id)}
                            className={`
                              relative p-3 rounded-xl text-left transition-all
                              ${isActive
                                ? 'bg-purple-500/20 border-2 border-purple-500'
                                : 'bg-bg-2 border border-border hover:border-purple-500/50'
                              }
                            `}
                          >
                            {/* Active Indicator */}
                            {isActive && (
                              <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}

                            {/* Item Name */}
                            <p className="font-semibold text-text-primary text-sm mb-1">
                              {item.name}
                            </p>

                            {/* Rarity */}
                            <p
                              className="text-xs capitalize"
                              style={{ color: rarityColor }}
                            >
                              {item.rarity}
                            </p>
                          </button>
                        );
                      })}
                    </div>

                    {/* Unequip button if something is active */}
                    {activeId && (
                      <button
                        onClick={() => setActiveCosmetic(type, null)}
                        className="mt-3 text-xs text-text-muted hover:text-red-400 flex items-center gap-1 transition-colors"
                      >
                        <X className="w-3 h-3" />
                        Unequip {getTypeLabel(type).slice(0, -1)}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Use Confirmation Modal */}
      {useConfirmItem && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setUseConfirmItem(null)}
        >
          <div
            className="bg-bg-0 border border-border rounded-2xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Item Display */}
            <div className="text-center mb-6">
              <div
                className="w-20 h-20 rounded-xl mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: `${getRarityColor(useConfirmItem.rarity)}20` }}
              >
                {useConfirmItem.sprite ? (
                  <img
                    src={useConfirmItem.sprite}
                    alt={useConfirmItem.name}
                    className="w-full h-full object-contain pixelated p-2"
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : (
                  <span className="text-4xl">{useConfirmItem.icon}</span>
                )}
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-1">
                {useConfirmItem.name}
              </h3>
              <p
                className="text-sm capitalize mb-3"
                style={{ color: getRarityColor(useConfirmItem.rarity) }}
              >
                {useConfirmItem.rarity}
              </p>
              <p className="text-text-muted text-sm mb-4">
                {useConfirmItem.description}
              </p>

              {/* Effect Preview */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-center gap-2 text-emerald-400">
                  {React.createElement(getEffectIcon(useConfirmItem.effect), { className: 'w-5 h-5' })}
                  <span className="font-medium">{getEffectDescription(useConfirmItem.effect)}</span>
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-center gap-2 text-yellow-400/80 text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>This item will be consumed immediately</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setUseConfirmItem(null)}
                className="flex-1 px-4 py-3 rounded-xl bg-bg-2 text-text-muted hover:text-text-primary hover:bg-bg-3 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUseItem(useConfirmItem)}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:opacity-90 transition-opacity"
              >
                Use Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
