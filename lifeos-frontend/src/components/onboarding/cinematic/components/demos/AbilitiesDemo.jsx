/**
 * Combat Abilities Demo
 * Showcases elemental abilities for boss battles and PvP
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAbilityById, ELEMENT_COLORS } from '../../../../../data/elementalAbilities';
import AbilityIcon from '../../../../ui/AbilityIcon';

// Use actual abilities from the database
const DEMO_ABILITY_IDS = ['fireball', 'ice_spike', 'lightning_strike', 'shadow_burst'];
const ABILITIES = DEMO_ABILITY_IDS.map(id => {
  const ability = getAbilityById(id);
  if (!ability) return null;
  return {
    ...ability,
    color: ELEMENT_COLORS[ability.element] || '#8888ff',
    damage: Math.round(ability.damage * 30), // Display damage as visible number
  };
}).filter(Boolean);

export default function AbilitiesDemo({ isActive, onInteract }) {
  const [selectedAbility, setSelectedAbility] = useState(null);
  const [cooldowns, setCooldowns] = useState({});
  const [damageNumber, setDamageNumber] = useState(null);

  // Cooldown timer effect
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setCooldowns(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (updated[key] > 0) {
            updated[key] = Math.max(0, updated[key] - 0.1);
          }
        });
        return updated;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isActive]);

  const handleUseAbility = (ability) => {
    if (cooldowns[ability.id] > 0) return;

    // Set cooldown
    setCooldowns(prev => ({ ...prev, [ability.id]: ability.cooldown }));
    setSelectedAbility(ability);
    onInteract?.();

    // Show damage number
    const damage = Math.floor(ability.damage * (0.9 + Math.random() * 0.3));
    setDamageNumber({ value: damage, color: ability.color, id: Date.now() });
    setTimeout(() => setDamageNumber(null), 800);
  };

  return (
    <div className="abilities-demo">
      {/* Battle preview */}
      <div className="battle-preview">
        {/* Enemy target */}
        <div className="enemy-target">
          <span className="enemy-icon">👹</span>
        </div>

        {/* Damage number */}
        <AnimatePresence>
          {damageNumber && (
            <motion.div
              key={damageNumber.id}
              className="damage-number"
              style={{ color: damageNumber.color, textShadow: `0 0 10px ${damageNumber.color}` }}
              initial={{ opacity: 1, y: 20, scale: 0.5 }}
              animate={{ opacity: 0, y: -20, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              -{damageNumber.value}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ability effect */}
        <AnimatePresence>
          {selectedAbility && (
            <motion.div
              key={selectedAbility.id + Date.now()}
              className="ability-effect"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                background: `radial-gradient(circle at center, ${selectedAbility.color}40 0%, transparent 70%)`,
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Ability slots label */}
      <p className="slots-label">Equip 2 abilities for battle</p>

      {/* Ability buttons */}
      <div className="abilities-grid">
        {ABILITIES.map(ability => {
          const onCooldown = cooldowns[ability.id] > 0;
          const cooldownPercent = onCooldown ? (cooldowns[ability.id] / ability.cooldown) * 100 : 0;

          return (
            <motion.button
              key={ability.id}
              onClick={() => handleUseAbility(ability)}
              disabled={onCooldown}
              className={`ability-btn ${onCooldown ? 'on-cooldown' : ''}`}
              style={{
                '--ability-color': ability.color,
                background: onCooldown ? undefined : `linear-gradient(135deg, ${ability.color}20, ${ability.color}10)`,
                boxShadow: onCooldown ? undefined : `0 0 20px ${ability.color}20`,
              }}
              whileHover={!onCooldown ? { scale: 1.03 } : {}}
              whileTap={!onCooldown ? { scale: 0.97 } : {}}
            >
              {/* Cooldown overlay */}
              {onCooldown && (
                <div
                  className="cooldown-overlay"
                  style={{
                    clipPath: `inset(${100 - cooldownPercent}% 0 0 0)`,
                  }}
                />
              )}

              <div className="ability-content">
                <span className="ability-icon">
                  <AbilityIcon ability={ability} size="md" />
                </span>
                <div className="ability-info">
                  <p className="ability-name">{ability.name}</p>
                  <p className="ability-stat">
                    {onCooldown ? `${cooldowns[ability.id].toFixed(1)}s` : `${ability.damage} DMG`}
                  </p>
                </div>
              </div>

              {/* Element indicator */}
              <div className="element-dot" style={{ backgroundColor: ability.color }} />
            </motion.button>
          );
        })}
      </div>

      {/* Battle info */}
      <div className="battle-modes">
        <div className="mode">
          <p className="mode-label">Use in</p>
          <p className="mode-name boss">Boss Battles</p>
        </div>
        <div className="mode-divider" />
        <div className="mode">
          <p className="mode-label">And in</p>
          <p className="mode-name pvp">PvP Arena</p>
        </div>
      </div>

      <style>{`
        .abilities-demo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          height: 100%;
        }

        .battle-preview {
          position: relative;
          width: 100%;
          height: 80px;
          background: linear-gradient(to bottom, rgba(88, 28, 135, 0.3), transparent);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .enemy-target {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(185, 28, 28, 0.2));
          border: 2px solid rgba(239, 68, 68, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .enemy-icon {
          font-size: 1.75rem;
        }

        .damage-number {
          position: absolute;
          top: 8px;
          font-weight: 900;
          font-size: 1.25rem;
        }

        .ability-effect {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .slots-label {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
        }

        .abilities-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
          width: 100%;
        }

        .ability-btn {
          position: relative;
          padding: 0.5rem;
          border-radius: 12px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          background: transparent;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .ability-btn:hover:not(:disabled) {
          border-color: rgba(255, 255, 255, 0.4);
        }

        .ability-btn.on-cooldown {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
          cursor: not-allowed;
        }

        .cooldown-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
        }

        .ability-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          position: relative;
          z-index: 1;
        }

        .ability-icon {
          font-size: 1.25rem;
        }

        .ability-info {
          flex: 1;
          text-align: left;
        }

        .ability-name {
          font-size: 0.7rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .on-cooldown .ability-name {
          color: rgba(255, 255, 255, 0.4);
        }

        .ability-stat {
          font-size: 0.6rem;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
        }

        .element-dot {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .battle-modes {
          display: flex;
          justify-content: center;
          gap: 1rem;
          text-align: center;
          margin-top: auto;
        }

        .mode-label {
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.4);
          margin: 0;
        }

        .mode-name {
          font-size: 0.75rem;
          font-weight: 700;
          margin: 0;
        }

        .mode-name.boss {
          color: #f97316;
        }

        .mode-name.pvp {
          color: #22d3ee;
        }

        .mode-divider {
          width: 1px;
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
