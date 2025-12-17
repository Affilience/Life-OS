/**
 * Bazaar Demo
 *
 * Interactive cosmic bazaar preview.
 * - Welcome bonus animation
 * - Click to purchase items
 * - Credit counter
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { animate, stagger } from 'animejs';
import { feedback } from '../../../../../services/microInteractions';

const BAZAAR_ITEMS = [
  {
    id: 'sword_novice',
    name: 'Novice Blade',
    price: 50,
    icon: '/assets/equipment/weapons/sword_novice.png',
    emoji: '⚔️',
    rarity: 'common',
    color: '#9ca3af',
  },
  {
    id: 'shield_basic',
    name: 'Basic Shield',
    price: 75,
    icon: '/assets/equipment/shields/shield_basic.png',
    emoji: '🛡️',
    rarity: 'uncommon',
    color: '#22c55e',
  },
  {
    id: 'potion_health',
    name: 'Health Potion',
    price: 25,
    icon: '/assets/bazaar/consumables/potion_health.png',
    emoji: '🧪',
    rarity: 'common',
    color: '#9ca3af',
  },
];

const WELCOME_BONUS = 100;

export default function BazaarDemo({ isActive, onInteract }) {
  const [credits, setCredits] = useState(0);
  const [displayCredits, setDisplayCredits] = useState(0);
  const [purchased, setPurchased] = useState(new Set());
  const [showBonus, setShowBonus] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [flyingItem, setFlyingItem] = useState(null);

  const containerRef = useRef(null);
  const creditsRef = useRef(null);
  const itemsRef = useRef([]);

  // Initial animation
  useEffect(() => {
    if (!isActive || hasAnimated) return;

    const container = containerRef.current;
    if (!container) return;

    // Show welcome bonus
    setTimeout(() => {
      setShowBonus(true);

      // Animate bonus banner
      animate(container.querySelector('.bazaar-bonus'), {
        opacity: [0, 1],
        y: [-20, 0],
        scale: [0.9, 1],
        duration: 600,
        ease: 'outBack',
      });

      // Animate credits counter
      setTimeout(() => {
        const startTime = Date.now();
        const duration = 1500;

        const updateCredits = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(WELCOME_BONUS * easeOut);

          setDisplayCredits(current);

          if (progress < 1) {
            requestAnimationFrame(updateCredits);
          } else {
            setCredits(WELCOME_BONUS);
          }
        };

        requestAnimationFrame(updateCredits);
        feedback.taskComplete();
      }, 600);
    }, 300);

    // Animate item cards
    animate(itemsRef.current, {
      opacity: [0, 1],
      y: [30, 0],
      scale: [0.9, 1],
      duration: 500,
      delay: stagger(100, { start: 1200 }),
      ease: 'outBack',
    });

    setHasAnimated(true);
  }, [isActive, hasAnimated]);

  // Handle purchase
  const handlePurchase = useCallback((item, index) => {
    if (purchased.has(item.id) || credits < item.price) return;

    onInteract?.();
    feedback.buttonPress();

    // Start flying animation
    setFlyingItem({ ...item, index });

    // Animate the card
    const card = itemsRef.current[index];
    if (card) {
      animate(card, {
        scale: [1, 1.1, 1],
        duration: 300,
        ease: 'outBack',
      });
    }

    // Update credits with animation
    setTimeout(() => {
      const newCredits = credits - item.price;
      setCredits(newCredits);

      const startTime = Date.now();
      const duration = 500;
      const startVal = displayCredits;

      const updateCredits = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.round(startVal + (newCredits - startVal) * progress);

        setDisplayCredits(current);

        if (progress < 1) {
          requestAnimationFrame(updateCredits);
        }
      };

      requestAnimationFrame(updateCredits);
      setPurchased((prev) => new Set([...prev, item.id]));
      setFlyingItem(null);

      feedback.taskComplete();
    }, 400);
  }, [credits, displayCredits, purchased, onInteract]);

  const canAfford = (price) => credits >= price && !purchased.has;

  return (
    <div ref={containerRef} className="bazaar-demo">
      {/* Welcome bonus banner */}
      {showBonus && (
        <div className="bazaar-bonus" style={{ opacity: 0 }}>
          <span className="bazaar-bonus-icon">✨</span>
          <span className="bazaar-bonus-text">+{WELCOME_BONUS} WELCOME BONUS!</span>
          <span className="bazaar-bonus-icon">✨</span>
        </div>
      )}

      {/* Credits display */}
      <div className="bazaar-credits">
        <span className="bazaar-credits-label">Your Credits</span>
        <span ref={creditsRef} className="bazaar-credits-value">
          ✧ {displayCredits}
        </span>
      </div>

      {/* Item cards */}
      <div className="bazaar-items">
        {BAZAAR_ITEMS.map((item, index) => {
          const isPurchased = purchased.has(item.id);
          const affordable = credits >= item.price && !isPurchased;

          return (
            <div
              key={item.id}
              ref={(el) => (itemsRef.current[index] = el)}
              className={`bazaar-item ${affordable ? 'affordable' : ''} ${isPurchased ? 'purchased' : ''}`}
              onClick={() => handlePurchase(item, index)}
              style={{ opacity: 0, borderColor: affordable ? item.color : undefined }}
            >
              {/* Item icon */}
              <div className="bazaar-item-icon">
                <span className="bazaar-item-emoji">{item.emoji}</span>
              </div>

              {/* Item info */}
              <div className="bazaar-item-name">{item.name}</div>
              <div
                className="bazaar-item-price"
                style={{ color: affordable ? '#10b981' : isPurchased ? '#6b7280' : '#ef4444' }}
              >
                {isPurchased ? '✓ Owned' : `${item.price} ✧`}
              </div>

              {/* Action button */}
              {!isPurchased && (
                <button
                  className={`bazaar-item-btn ${affordable ? 'can-buy' : 'locked'}`}
                  disabled={!affordable}
                >
                  {affordable ? 'BUY' : 'LOCKED'}
                </button>
              )}

              {/* Purchased overlay */}
              {isPurchased && (
                <div className="bazaar-item-owned">
                  <span>✓</span>
                </div>
              )}

              {/* Rarity indicator */}
              <div
                className="bazaar-item-rarity"
                style={{ background: item.color }}
              />
            </div>
          );
        })}
      </div>

      {/* Floating purchase animation */}
      {flyingItem && (
        <div
          className="bazaar-flying-item"
          style={{
            left: `${25 + flyingItem.index * 33}%`,
          }}
        >
          {flyingItem.emoji}
        </div>
      )}

      {/* Hint */}
      <p className="bazaar-hint">
        {purchased.size > 0
          ? `${purchased.size}/${BAZAAR_ITEMS.length} items purchased!`
          : 'Tap an item to purchase'}
      </p>

      <style>{`
        .bazaar-demo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 0;
          position: relative;
          height: 100%;
          justify-content: flex-start;
        }

        .bazaar-bonus {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.75rem;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05));
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 10px;
        }

        .bazaar-bonus-icon {
          font-size: 0.85rem;
        }

        .bazaar-bonus-text {
          font-size: 0.8rem;
          font-weight: 700;
          color: #10b981;
        }

        .bazaar-credits {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .bazaar-credits-label {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .bazaar-credits-value {
          font-size: 1.25rem;
          font-weight: 800;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .bazaar-items {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          width: 100%;
          flex: 1;
        }

        .bazaar-item {
          position: relative;
          flex: 1;
          max-width: 100px;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .bazaar-item:hover:not(.purchased) {
          transform: translateY(-4px);
        }

        .bazaar-item.affordable {
          border-color: rgba(16, 185, 129, 0.4);
          background: rgba(16, 185, 129, 0.05);
        }

        .bazaar-item.purchased {
          opacity: 0.6;
          cursor: default;
        }

        .bazaar-item-icon {
          width: 36px;
          height: 36px;
          margin: 0 auto 0.35rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        .bazaar-item-emoji {
          font-size: 1.4rem;
        }

        .bazaar-item-name {
          font-size: 0.65rem;
          font-weight: 600;
          color: white;
          margin-bottom: 0.15rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bazaar-item-price {
          font-size: 0.75rem;
          font-weight: 700;
          margin-bottom: 0.35rem;
        }

        .bazaar-item-btn {
          width: 100%;
          padding: 0.25rem 0.4rem;
          font-size: 0.6rem;
          font-weight: 700;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .bazaar-item-btn.can-buy {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .bazaar-item-btn.can-buy:hover {
          transform: scale(1.05);
        }

        .bazaar-item-btn.locked {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.4);
          cursor: not-allowed;
        }

        .bazaar-item-owned {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 20px;
          height: 20px;
          background: #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          color: white;
        }

        .bazaar-item-rarity {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          border-radius: 16px 16px 0 0;
        }

        .bazaar-flying-item {
          position: absolute;
          font-size: 2rem;
          animation: flyToInventory 0.5s ease-in forwards;
          pointer-events: none;
          z-index: 10;
        }

        @keyframes flyToInventory {
          0% {
            top: 50%;
            transform: translate(-50%, 0) scale(1);
            opacity: 1;
          }
          100% {
            top: 0;
            transform: translate(-50%, -100%) scale(0.5) rotate(15deg);
            opacity: 0;
          }
        }

        .bazaar-hint {
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.4);
          font-style: italic;
          margin: 0;
        }

        @media (max-width: 400px) {
          .bazaar-item {
            padding: 0.5rem;
            max-width: 90px;
          }

          .bazaar-item-icon {
            width: 40px;
            height: 40px;
          }

          .bazaar-item-emoji {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
