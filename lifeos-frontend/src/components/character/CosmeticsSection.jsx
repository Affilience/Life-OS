/**
 * CosmeticsSection - Manage owned cosmetics (titles, frames)
 * Allows users to view and equip/unequip cosmetic items
 */

import React from 'react';
import { Crown, Sparkles, Frame, Check, X } from 'lucide-react';
import { useAvatarStore, COSMETIC_DEFINITIONS } from '../../stores/avatarStore';
import { useGamificationModeStore } from '../../stores/gamificationModeStore';

// Rarity colors
const RARITY_COLORS = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

export default function CosmeticsSection() {
  const { ownedCosmetics, activeCosmetics, setActiveCosmetic } = useAvatarStore();
  const { mode } = useGamificationModeStore();

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

  const handleToggle = (type, id) => {
    if (activeCosmetics[type] === id) {
      // Unequip
      setActiveCosmetic(type, null);
    } else {
      // Equip
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

  if (!hasAnyCosmetics) {
    return (
      <div className="bg-bg-1 border border-border rounded-2xl p-8 text-center">
        <Sparkles className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-40" />
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          No Cosmetics Yet
        </h3>
        <p className="text-text-muted text-sm max-w-md mx-auto">
          Purchase titles and frames from the {mode === 'cosmic' ? 'Bazaar' : 'Shop'} to customize your character's appearance!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Cosmetics
        </h3>
        <p className="text-sm text-text-muted">
          Equip cosmetics to customize your character
        </p>
      </div>

      {/* Cosmetic Categories */}
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
                    onClick={() => handleToggle(type, item.id)}
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
  );
}
