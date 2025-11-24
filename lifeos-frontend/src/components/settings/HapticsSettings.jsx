/**
 * Haptics Settings Component
 * Toggle haptic feedback on/off for the entire app
 */

import React, { useState, useEffect } from 'react';
import { Vibrate } from 'lucide-react';
import { haptics } from '../../utils/haptics';

const HapticsSettings = () => {
  const [enabled, setEnabled] = useState(haptics.isEnabled());

  const handleToggle = async () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    haptics.setEnabled(newEnabled);

    // Give feedback when enabling (but not when disabling)
    if (newEnabled) {
      await haptics.medium();
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-[#12101a]/50 rounded-lg border border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
          <Vibrate size={20} className="text-purple-400" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-white">Haptic Feedback</h3>
          <p className="text-xs text-white/50">Physical vibration on interactions</p>
        </div>
      </div>

      {/* Toggle Switch */}
      <button
        onClick={handleToggle}
        className={`
          relative w-12 h-6 rounded-full transition-colors duration-200
          ${enabled ? 'bg-purple-500' : 'bg-[#221e2e]'}
        `}
      >
        <div
          className={`
            absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg
            transition-transform duration-200
            ${enabled ? 'translate-x-6' : 'translate-x-0.5'}
          `}
        />
      </button>
    </div>
  );
};

export default HapticsSettings;
