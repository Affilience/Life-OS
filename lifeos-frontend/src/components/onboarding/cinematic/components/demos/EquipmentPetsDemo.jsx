/**
 * Equipment & Pets Demo
 *
 * Interactive demo showcasing equipment system and companion pets.
 * Features:
 * - Equipment slots with hover effects
 * - Pet companion with idle animation
 * - Stat boost visualisation
 */

import React, { useState, useCallback } from 'react';
import { animate } from 'animejs';

const EQUIPMENT_SLOTS = [
  { id: 'weapon', name: 'Weapon', icon: '⚔️', stat: '+15 Focus', equipped: '/assets/equipment/weapons/sword_crystal.png' },
  { id: 'armor', name: 'Armor', icon: '🛡️', stat: '+20 Vitality', equipped: '/assets/equipment/chests/armor_leather.png' },
  { id: 'accessory', name: 'Ring', icon: '💍', stat: '+10 Wisdom', equipped: '/assets/equipment/rings/ring_focus.png' },
];

const PETS = [
  { id: 'fox', name: 'Ember Fox', bonus: '+5% XP', sprite: '🦊' },
  { id: 'owl', name: 'Sage Owl', bonus: '+5% Wisdom', sprite: '🦉' },
  { id: 'dragon', name: 'Baby Dragon', bonus: '+5% All Stats', sprite: '🐲' },
];

export default function EquipmentPetsDemo({ isActive, onInteract }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedPet, setSelectedPet] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);

  // Handle equipment slot click
  const handleSlotClick = useCallback((slot, el) => {
    onInteract?.();
    setSelectedSlot(slot.id);
    setStatsVisible(true);

    // Animate the slot
    if (el) {
      animate(el, {
        scale: [1, 1.15, 1.05],
        duration: 400,
        ease: 'outBack',
      });
    }

    // Hide stats after delay
    setTimeout(() => setStatsVisible(false), 2000);
  }, [onInteract]);

  // Handle pet selection
  const handlePetClick = useCallback((index, el) => {
    onInteract?.();
    setSelectedPet(index);

    if (el) {
      animate(el, {
        scale: [1, 1.3, 1.1],
        rotate: [0, -10, 10, 0],
        duration: 500,
        ease: 'outElastic(1, 0.5)',
      });
    }
  }, [onInteract]);

  return (
    <div className="equipment-pets-demo">
      {/* Equipment Section */}
      <div className="demo-section">
        <h4 className="demo-section-title">Equipment</h4>
        <div className="equipment-slots">
          {EQUIPMENT_SLOTS.map((slot) => (
            <div
              key={slot.id}
              className={`equipment-slot ${selectedSlot === slot.id ? 'selected' : ''}`}
              onClick={(e) => handleSlotClick(slot, e.currentTarget)}
            >
              <div className="slot-icon">{slot.icon}</div>
              <div className="slot-name">{slot.name}</div>
              {selectedSlot === slot.id && statsVisible && (
                <div className="slot-stat">{slot.stat}</div>
              )}
              <div className="slot-glow" />
            </div>
          ))}
        </div>
      </div>

      {/* Pets Section */}
      <div className="demo-section">
        <h4 className="demo-section-title">Companion Pets</h4>
        <div className="pets-row">
          {PETS.map((pet, index) => (
            <div
              key={pet.id}
              className={`pet-card ${selectedPet === index ? 'selected' : ''}`}
              onClick={(e) => handlePetClick(index, e.currentTarget)}
            >
              <div className="pet-sprite">{pet.sprite}</div>
              <div className="pet-name">{pet.name}</div>
              <div className="pet-bonus">{pet.bonus}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Bonuses */}
      <div className="active-bonuses">
        <span className="bonus-label">Active Bonuses:</span>
        <span className="bonus-value">+45 Stats</span>
        <span className="bonus-pet">{PETS[selectedPet].bonus}</span>
      </div>

      <style>{`
        .equipment-pets-demo {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          height: 100%;
        }

        .demo-section {
          flex: 1;
        }

        .demo-section-title {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 0.75rem;
          font-weight: 600;
        }

        .equipment-slots {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
        }

        .equipment-slot {
          position: relative;
          width: 80px;
          height: 80px;
          background: rgba(139, 92, 246, 0.1);
          border: 2px solid rgba(139, 92, 246, 0.3);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .equipment-slot:hover {
          border-color: rgba(139, 92, 246, 0.6);
          background: rgba(139, 92, 246, 0.15);
        }

        .equipment-slot.selected {
          border-color: rgba(139, 92, 246, 0.8);
          background: rgba(139, 92, 246, 0.2);
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
        }

        .slot-icon {
          font-size: 1.75rem;
          margin-bottom: 0.25rem;
        }

        .slot-name {
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 500;
        }

        .slot-stat {
          position: absolute;
          top: -8px;
          right: -8px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          font-size: 0.6rem;
          font-weight: 700;
          padding: 0.2rem 0.4rem;
          border-radius: 8px;
          animation: popIn 0.3s ease;
          white-space: nowrap;
        }

        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .slot-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(139, 92, 246, 0.3) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .equipment-slot:hover .slot-glow,
        .equipment-slot.selected .slot-glow {
          opacity: 1;
        }

        .pets-row {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
        }

        .pet-card {
          position: relative;
          width: 85px;
          padding: 0.75rem 0.5rem;
          background: rgba(236, 72, 153, 0.1);
          border: 2px solid rgba(236, 72, 153, 0.2);
          border-radius: 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pet-card:hover {
          border-color: rgba(236, 72, 153, 0.5);
          background: rgba(236, 72, 153, 0.15);
        }

        .pet-card.selected {
          border-color: rgba(236, 72, 153, 0.8);
          background: rgba(236, 72, 153, 0.2);
          box-shadow: 0 0 20px rgba(236, 72, 153, 0.3);
        }

        .pet-sprite {
          font-size: 2rem;
          margin-bottom: 0.25rem;
          animation: petBounce 2s ease-in-out infinite;
        }

        .pet-card.selected .pet-sprite {
          animation: petBounce 1s ease-in-out infinite;
        }

        @keyframes petBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .pet-name {
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 600;
          margin-bottom: 0.15rem;
        }

        .pet-bonus {
          font-size: 0.6rem;
          color: rgba(236, 72, 153, 0.8);
          font-weight: 500;
        }

        .active-bonuses {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .bonus-label {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .bonus-value {
          font-size: 0.8rem;
          font-weight: 700;
          color: #a855f7;
        }

        .bonus-pet {
          font-size: 0.75rem;
          font-weight: 600;
          color: #ec4899;
          padding: 0.2rem 0.5rem;
          background: rgba(236, 72, 153, 0.15);
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}
