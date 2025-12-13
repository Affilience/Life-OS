/**
 * Nova Guide Component
 *
 * The floating Nova avatar that guides users through onboarding.
 * Shows different poses/expressions based on context.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NOVA_STATES = {
  neutral: '/assets/nova/nova_spark.png',
  happy: '/assets/nova/nova_stellar.png',
  thinking: '/assets/nova/nova_cosmos.png',
  excited: '/assets/nova/nova_stellar.png',
  encouraging: '/assets/nova/nova_teen.png'
};

export default function NovaGuide({
  message,
  state = 'neutral',
  position = 'left', // left, right, center
  size = 'medium', // small, medium, large
  animate = true,
  className = ''
}) {
  const novaImage = NOVA_STATES[state] || NOVA_STATES.neutral;

  const sizeClasses = {
    small: 'nova-guide-small',
    medium: 'nova-guide-medium',
    large: 'nova-guide-large'
  };

  const positionClasses = {
    left: 'nova-position-left',
    right: 'nova-position-right',
    center: 'nova-position-center'
  };

  return (
    <motion.div
      className={`nova-guide ${sizeClasses[size]} ${positionClasses[position]} ${className}`}
      initial={animate ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="nova-avatar-wrapper"
        animate={animate ? {
          y: [0, -8, 0],
        } : undefined}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <img
          src={novaImage}
          alt="Nova"
          className="nova-avatar-img"
        />
        {state === 'excited' && (
          <motion.div
            className="nova-sparkles"
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            ✨
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message}
            className="nova-speech-bubble"
            initial={{ opacity: 0, scale: 0.9, x: position === 'right' ? 20 : -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <p>{message}</p>
            <div className={`bubble-tail ${position === 'right' ? 'tail-right' : 'tail-left'}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Nova Inline - For inline Nova messages within content
 */
export function NovaInline({ message, state = 'neutral' }) {
  const novaImage = NOVA_STATES[state] || NOVA_STATES.neutral;

  return (
    <div className="nova-inline">
      <img src={novaImage} alt="Nova" className="nova-inline-avatar" />
      <div className="nova-inline-message">
        <p>{message}</p>
      </div>
    </div>
  );
}

/**
 * Nova Hint - Small hint text with Nova icon
 */
export function NovaHint({ children }) {
  return (
    <div className="nova-hint">
      <img src={NOVA_STATES.neutral} alt="" className="nova-hint-icon" />
      <span>{children}</span>
    </div>
  );
}
