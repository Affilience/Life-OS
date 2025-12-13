import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, ChevronRight, Plus, Minus, Timer, Volume2, VolumeX } from 'lucide-react';
import './RestTimer.css';

// Preset rest times (in seconds)
const REST_PRESETS = [
  { label: '30s', seconds: 30, description: 'Quick' },
  { label: '60s', seconds: 60, description: 'Light' },
  { label: '90s', seconds: 90, description: 'Standard' },
  { label: '2m', seconds: 120, description: 'Heavy' },
  { label: '3m', seconds: 180, description: 'Strength' },
];

// Get saved preferences from localStorage
const getSavedPreferences = () => {
  try {
    const saved = localStorage.getItem('lifeos-rest-timer-prefs');
    return saved ? JSON.parse(saved) : { defaultDuration: 90, soundEnabled: true };
  } catch {
    return { defaultDuration: 90, soundEnabled: true };
  }
};

// Save preferences to localStorage
const savePreferences = (prefs) => {
  localStorage.setItem('lifeos-rest-timer-prefs', JSON.stringify(prefs));
};

export default function RestTimer({ onComplete, onSkip, defaultDuration: propDefaultDuration }) {
  const savedPrefs = getSavedPreferences();
  const initialDuration = propDefaultDuration || savedPrefs.defaultDuration;

  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isPaused, setIsPaused] = useState(false);
  const [totalDuration, setTotalDuration] = useState(initialDuration);
  const [soundEnabled, setSoundEnabled] = useState(savedPrefs.soundEnabled);
  const [showPresets, setShowPresets] = useState(false);

  // Play completion sound
  const playCompletionSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      // Create a simple beep using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      // Audio not supported, fail silently
    }
  }, [soundEnabled]);

  // Use a ref to track if timer should be running to avoid dependency issues
  const onCompleteRef = React.useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          playCompletionSound();
          // Use ref to avoid stale closure
          setTimeout(() => onCompleteRef.current?.(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, playCompletionSound]); // Removed timeLeft from deps - we use prev in setTimeLeft

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addTime = (seconds) => {
    setTimeLeft(prev => Math.max(0, prev + seconds));
    setTotalDuration(prev => Math.max(seconds, prev + seconds));
  };

  const setPresetDuration = (seconds) => {
    setTimeLeft(seconds);
    setTotalDuration(seconds);
    setShowPresets(false);
    // Save as new default
    savePreferences({ defaultDuration: seconds, soundEnabled });
  };

  const toggleSound = () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    savePreferences({ defaultDuration: totalDuration, soundEnabled: newSoundEnabled });
  };

  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;
  const circumference = 2 * Math.PI * 36;

  // Warning state when time is low
  const isLowTime = timeLeft <= 10 && timeLeft > 0;

  return (
    <div className="rest-timer-container">
      <div className={`rest-timer-card ${isLowTime ? 'low-time' : ''}`}>
        {/* Circular Progress Timer */}
        <div className="timer-progress-container" onClick={() => setShowPresets(!showPresets)}>
          <svg viewBox="0 0 80 80" className="timer-progress-svg">
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={isLowTime ? '#ef4444' : '#8b5cf6'} />
                <stop offset="100%" stopColor={isLowTime ? '#f97316' : '#3b82f6'} />
              </linearGradient>
            </defs>
            <circle
              cx="40"
              cy="40"
              r="36"
              className="timer-progress-bg"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              className={`timer-progress-fill ${isLowTime ? 'pulse' : ''}`}
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress / 100)}
            />
          </svg>
          <div className={`timer-time-display ${isLowTime ? 'warning' : ''}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Preset Selector Popup */}
        {showPresets && (
          <div className="timer-presets-popup">
            <div className="presets-header">
              <Timer className="w-4 h-4" />
              <span>Rest Duration</span>
            </div>
            <div className="presets-grid">
              {REST_PRESETS.map((preset) => (
                <button
                  key={preset.seconds}
                  onClick={() => setPresetDuration(preset.seconds)}
                  className={`preset-btn ${totalDuration === preset.seconds ? 'active' : ''}`}
                >
                  <span className="preset-time">{preset.label}</span>
                  <span className="preset-desc">{preset.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Timer Info */}
        <div className="timer-info">
          <h4 className="timer-title">
            {isLowTime ? 'Almost Ready!' : 'Rest Time'}
          </h4>
          <p className="timer-subtitle">
            {isPaused ? 'Timer paused' : isLowTime ? 'Get ready for your next set' : 'Recover before your next set'}
          </p>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          className={`timer-sound-btn ${soundEnabled ? 'enabled' : ''}`}
          title={soundEnabled ? 'Sound on' : 'Sound off'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Adjust Time Controls */}
        <div className="timer-adjust-controls">
          <button
            onClick={() => addTime(-15)}
            className="timer-adjust-btn"
            disabled={timeLeft <= 15}
            title="Remove 15 seconds"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => addTime(15)}
            className="timer-adjust-btn"
            title="Add 15 seconds"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Controls */}
        <div className="timer-controls">
          <button onClick={() => setIsPaused(!isPaused)} className="timer-pause-btn">
            {isPaused ? (
              <>
                <Play className="w-4 h-4" fill="currentColor" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            )}
          </button>

          <button onClick={onSkip} className="timer-skip-btn">
            Skip
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
