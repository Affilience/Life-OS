/**
 * Welcome Step - Nova Introduction
 *
 * The first step where Nova introduces herself and sets the tone.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function WelcomeStep({ onContinue }) {
  const [showButton, setShowButton] = useState(false);
  const [novaAnimated, setNovaAnimated] = useState(false);

  // Delay button appearance for dramatic effect
  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Nova animation sequence
  useEffect(() => {
    const timer = setTimeout(() => setNovaAnimated(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="welcome-step">
      {/* Nova Character Animation */}
      <motion.div
        className="nova-intro-character"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: novaAnimated ? 1 : 0,
          opacity: novaAnimated ? 1 : 0
        }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15
        }}
      >
        <div className="nova-glow" />
        <img
          src="/assets/nova/nova_spark.png"
          alt="Nova"
          className="nova-sprite pixelated"
        />
        <motion.div
          className="sparkle-burst"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.5, 0] }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Sparkles className="sparkle" />
        </motion.div>
      </motion.div>

      {/* Welcome Text */}
      <motion.div
        className="welcome-text"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <h1 className="welcome-title">
          Hi there! I'm{' '}
          <span className="nova-name">Nova</span>
        </h1>

        <motion.p
          className="welcome-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          Your personal AI companion
        </motion.p>

        <motion.p
          className="welcome-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          I'm here to help you build the life you want.
          <br />
          Together, we'll track your progress and celebrate your wins.
        </motion.p>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        className="welcome-action"
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: showButton ? 1 : 0,
          y: showButton ? 0 : 20
        }}
        transition={{ duration: 0.4 }}
      >
        <button
          className="onboarding-btn primary"
          onClick={onContinue}
        >
          <span>Let's Get Started</span>
          <ArrowRight size={18} />
        </button>

        <p className="setup-time">
          Setup takes about 3 minutes
        </p>
      </motion.div>
    </div>
  );
}
