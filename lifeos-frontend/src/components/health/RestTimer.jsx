import React, { useState, useEffect } from 'react';
import { Play, Pause, ChevronRight, Plus, Minus } from 'lucide-react';
import './RestTimer.css';

export default function RestTimer({ onComplete, onSkip, defaultDuration = 90 }) {
  const [timeLeft, setTimeLeft] = useState(defaultDuration);
  const [isPaused, setIsPaused] = useState(false);
  const [totalDuration, setTotalDuration] = useState(defaultDuration);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, timeLeft, onComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addTime = (seconds) => {
    setTimeLeft(prev => prev + seconds);
    setTotalDuration(prev => prev + seconds);
  };

  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;
  const circumference = 2 * Math.PI * 36;

  return (
    <div className="rest-timer-container">
      <div className="rest-timer-card">
        {/* Circular Progress Timer */}
        <div className="timer-progress-container">
          <svg width="80" height="80" className="timer-progress-svg">
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#3b82f6" />
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
              className="timer-progress-fill"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress / 100)}
            />
          </svg>
          <div className="timer-time-display">{formatTime(timeLeft)}</div>
        </div>

        {/* Timer Info */}
        <div className="timer-info">
          <h4 className="timer-title">Rest Time</h4>
          <p className="timer-subtitle">
            {isPaused ? 'Timer paused' : 'Recover before your next set'}
          </p>
        </div>

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
