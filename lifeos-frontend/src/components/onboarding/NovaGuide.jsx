/**
 * Nova Guide - Floating contextual helper
 *
 * Appears on pages to guide users during onboarding.
 * Shows contextual messages and points to next actions.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useIntegratedOnboardingStore, { NOVA_MESSAGES, MODULE_SETUP } from '../../stores/integratedOnboardingStore';
import './NovaGuide.css';

export default function NovaGuide({
  module, // Current module context
  customMessage, // Override message
  position = 'bottom-left', // Position: bottom-left, bottom-right, top-left, top-right
  showProgress = true,
  onAction // Custom action handler
}) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const {
    showNovaGuide,
    setShowNovaGuide,
    novaState,
    novaMessage,
    getProgress,
    getNextModule,
    isModuleComplete,
    hasSeenWelcome,
    isOnboardingComplete
  } = useIntegratedOnboardingStore();

  const progress = getProgress();
  const nextModule = getNextModule();

  // Don't show if onboarding complete or guide disabled
  if (!hasSeenWelcome || isOnboardingComplete || !showNovaGuide) {
    return null;
  }

  // Get contextual message
  const getMessage = () => {
    if (customMessage) return customMessage;

    if (module && NOVA_MESSAGES[module]) {
      const moduleComplete = isModuleComplete(module);
      if (moduleComplete) {
        return NOVA_MESSAGES[module].complete;
      }
      return NOVA_MESSAGES[module].intro;
    }

    // Default dashboard message
    if (progress.completed === 0) {
      return NOVA_MESSAGES.dashboard.setupPrompt;
    }

    return NOVA_MESSAGES.dashboard.progress(progress.completed, progress.total);
  };

  const handleGoToNext = () => {
    if (onAction) {
      onAction();
    } else if (nextModule) {
      // Include tab in state if the module has a specific tab
      // Use replace: true to ensure navigation triggers even on same route
      const navOptions = {
        replace: true,
        ...(nextModule.tab && { state: { activeTab: nextModule.tab } })
      };
      navigate(nextModule.route, navOptions);
    }
  };

  const handleDismiss = () => {
    setIsMinimized(true);
  };

  const handleHideGuide = () => {
    setShowNovaGuide(false);
  };

  // Nova avatar based on state
  const getNovaAvatar = () => {
    switch (novaState) {
      case 'excited':
      case 'happy':
        return '/assets/nova/nova_stellar.png';
      case 'proud':
        return '/assets/nova/nova_cosmos.png';
      default:
        return '/assets/nova/nova_spark.png';
    }
  };

  if (isMinimized) {
    return (
      <motion.button
        className={`nova-guide-minimized ${position}`}
        onClick={() => setIsMinimized(false)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
      >
        <img src={getNovaAvatar()} alt="Nova" />
        {progress.completed < progress.total && (
          <span className="nova-badge">{progress.total - progress.completed}</span>
        )}
      </motion.button>
    );
  }

  return (
    <motion.div
      className={`nova-guide ${position}`}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
    >
      {/* Header */}
      <div className="nova-guide-header">
        <div className="nova-guide-avatar">
          <img src={getNovaAvatar()} alt="Nova" />
        </div>
        <div className="nova-guide-title">
          <span className="nova-name">Nova</span>
          {showProgress && (
            <span className="nova-progress">
              Setup: {progress.completed}/{progress.total}
            </span>
          )}
        </div>
        <button className="nova-minimize" onClick={handleDismiss}>
          <X size={16} />
        </button>
      </div>

      {/* Message */}
      <div className="nova-guide-content">
        <p>{getMessage()}</p>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="nova-guide-progress">
          <div
            className="nova-guide-progress-fill"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      )}

      {/* Actions */}
      <div className="nova-guide-actions">
        {nextModule && !isModuleComplete(module) && (
          <button className="nova-action-btn primary" onClick={handleGoToNext}>
            {module === nextModule.id ? (
              <>
                <Sparkles size={16} />
                <span>Set Up {nextModule.name}</span>
              </>
            ) : (
              <>
                <span>Next: {nextModule.name}</span>
                <ChevronRight size={16} />
              </>
            )}
          </button>
        )}

        {progress.completed > 0 && (
          <button className="nova-action-btn text" onClick={handleHideGuide}>
            I'll finish later
          </button>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Nova Tooltip - Small contextual hint
 * Use for specific UI elements
 */
export function NovaTooltip({ message, position = 'top' }) {
  return (
    <motion.div
      className={`nova-tooltip ${position}`}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <img src="/assets/nova/nova_spark.png" alt="" className="nova-tooltip-icon" />
      <span>{message}</span>
    </motion.div>
  );
}

/**
 * Nova Celebration - Shows when completing a module
 */
export function NovaCelebration({ moduleName, onClose }) {
  return (
    <motion.div
      className="nova-celebration-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="nova-celebration"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="celebration-nova">
          <img src="/assets/nova/nova_cosmos.png" alt="Nova celebrating" />
        </div>
        <h3>Awesome!</h3>
        <p>{moduleName} is all set up!</p>
        <button className="celebration-btn" onClick={onClose}>
          Continue
          <ChevronRight size={16} />
        </button>
      </motion.div>
    </motion.div>
  );
}
