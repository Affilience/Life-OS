import React, { useState } from 'react';
import { Shield, Swords, Save, Plus, Trash2, Star, Zap, Heart } from 'lucide-react';
import usePvpStore from '../../stores/pvpStore';
import { calculatePowerRating, calculateEquipmentTotals, calculateMaxHP } from '../../utils/pvpCalculations';
import { useAvatarStore } from '../../stores/avatarStore';

export default function LoadoutManager({ userId }) {
  const { loadouts, activeLoadout, saveLoadout, updateLoadout, deleteLoadout, setActiveLoadout } = usePvpStore();
  const { equippedItems, characterStats } = useAvatarStore();
  const [loadoutName, setLoadoutName] = useState('');
  const [saving, setSaving] = useState(false);

  // Calculate current stats from avatar store
  const currentEquipment = equippedItems || {};
  const currentStats = characterStats || { strength: 10, intelligence: 10, defense: 10, vitality: 10 };
  const equipTotals = calculateEquipmentTotals(currentEquipment);
  const level = characterStats?.level || 1;

  const currentPower = calculatePowerRating({
    stats: currentStats,
    equipment: currentEquipment,
    pet: null,
    level,
  });

  const currentMaxHP = calculateMaxHP(currentStats.vitality + equipTotals.vitality, level);
  const totalAttack = (currentStats.strength * 2) + equipTotals.attack;
  const totalDefense = currentStats.defense + equipTotals.defense;

  const handleSaveCurrentLoadout = async () => {
    if (!loadoutName.trim()) return;
    setSaving(true);
    try {
      await saveLoadout(userId, {
        name: loadoutName,
        helmet_id: currentEquipment.helmet?.id,
        chest_id: currentEquipment.chest?.id,
        legs_id: currentEquipment.legs?.id,
        weapon_id: currentEquipment.weapon?.id || currentEquipment.mainHand?.id,
        shield_id: currentEquipment.shield?.id || currentEquipment.offHand?.id,
        cape_id: currentEquipment.cape?.id,
        ring1_id: currentEquipment.ring1?.id,
        ring2_id: currentEquipment.ring2?.id,
        amulet_id: currentEquipment.amulet?.id,
        stats: currentStats,
        equipment: currentEquipment,
        level,
        total_attack: totalAttack,
        total_defense: totalDefense,
        total_hp: currentMaxHP,
      });
      setLoadoutName('');
    } catch (error) {
      console.error('Failed to save loadout:', error);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Current Build */}
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            Current Build
          </h3>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 rounded-lg">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-purple-400">{currentPower}</span>
            <span className="text-xs text-white/60">Power</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <Swords className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{totalAttack}</p>
            <p className="text-xs text-white/50">Attack</p>
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <Shield className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{totalDefense}</p>
            <p className="text-xs text-white/50">Defense</p>
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <Heart className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{currentMaxHP.toLocaleString()}</p>
            <p className="text-xs text-white/50">Max HP</p>
          </div>
        </div>

        {/* Equipment Slots */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {['helmet', 'chest', 'weapon', 'shield', 'cape', 'legs', 'ring1', 'ring2', 'amulet'].map((slot) => {
            const item = currentEquipment[slot] || currentEquipment[slot === 'weapon' ? 'mainHand' : slot === 'shield' ? 'offHand' : slot];
            return (
              <div
                key={slot}
                className={`p-2 rounded-lg border text-center ${
                  item ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5 border-white/10'
                }`}
              >
                <p className="text-xs text-white/50 capitalize mb-1">{slot}</p>
                <p className="text-sm text-white truncate">{item?.name || '-'}</p>
              </div>
            );
          })}
        </div>

        {/* Save Loadout */}
        <div className="flex gap-3">
          <input
            type="text"
            value={loadoutName}
            onChange={(e) => setLoadoutName(e.target.value)}
            placeholder="Loadout name..."
            className="flex-1 px-4 py-2.5 bg-black/20 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50"
          />
          <button
            onClick={handleSaveCurrentLoadout}
            disabled={!loadoutName.trim() || saving}
            className="px-4 py-2.5 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      {/* Saved Loadouts */}
      <div>
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          Saved Loadouts ({loadouts.length})
        </h3>

        {loadouts.length === 0 ? (
          <div className="bg-[#1a1724] border border-white/10 rounded-xl p-8 text-center">
            <Shield className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/60">No saved loadouts yet</p>
            <p className="text-sm text-white/40">Save your current build above to use in battles</p>
          </div>
        ) : (
          <div className="space-y-3">
            {loadouts.map((loadout) => (
              <div
                key={loadout.id}
                className={`p-4 rounded-xl border transition-all ${
                  activeLoadout?.id === loadout.id
                    ? 'bg-purple-500/20 border-purple-500/50'
                    : 'bg-[#1a1724] border-white/10 hover:border-purple-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveLoadout(loadout)}
                      className={`w-5 h-5 rounded-full border-2 transition-all ${
                        activeLoadout?.id === loadout.id
                          ? 'bg-purple-500 border-purple-500'
                          : 'border-white/30 hover:border-purple-500'
                      }`}
                    />
                    <div>
                      <p className="font-medium text-white">{loadout.name}</p>
                      <div className="flex items-center gap-3 text-sm text-white/60">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-purple-400" />
                          {loadout.power_rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <Swords className="w-3 h-3 text-red-400" />
                          {loadout.total_attack}
                        </span>
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3 text-blue-400" />
                          {loadout.total_defense}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteLoadout(loadout.id)}
                    className="p-2 text-white/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-[#1a1724] border border-white/10 rounded-xl p-4">
        <h4 className="text-sm font-medium text-white mb-2">How PvP Stats Work</h4>
        <ul className="text-sm text-white/60 space-y-1">
          <li>- <span className="text-red-400">Attack</span> = (Strength x 2) + Equipment Bonus</li>
          <li>- <span className="text-blue-400">Defense</span> reduces incoming damage</li>
          <li>- <span className="text-green-400">HP</span> = 1000 + (Vitality x 50) + (Level x 10)</li>
          <li>- Equipment rarity increases stat effectiveness</li>
        </ul>
      </div>
    </div>
  );
}
