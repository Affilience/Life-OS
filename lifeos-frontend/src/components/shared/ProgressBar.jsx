import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ 
  percentage, 
  module = 'productivity', // productivity, health, knowledge, journal, financial, calendar, skills
  label = 'Progress',
  showLabel = true,
  className = '' 
}) => {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className={`progress-bar-container ${className}`}>
      <div className="progress-bar-track">
        <div
          className={`progress-bar-fill ${module}`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="progress-bar-label">
          <span className="progress-bar-label-current">{label}</span>
          <span className="progress-bar-label-percentage">{Math.round(clampedPercentage)}%</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;