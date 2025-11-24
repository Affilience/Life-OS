import React from 'react';
import { Smile } from 'lucide-react';
import './MoodSelector.css';

const MoodSelector = ({ selectedMood, onMoodChange, size = 'normal' }) => {
  const moods = [
    { value: 1, emoji: '😫', label: 'Terrible', color: '#dc2626' },
    { value: 2, emoji: '😞', label: 'Bad', color: '#ea580c' },
    { value: 3, emoji: '😕', label: 'Poor', color: '#d97706' },
    { value: 4, emoji: '😐', label: 'Okay', color: '#ca8a04' },
    { value: 5, emoji: '🙂', label: 'Fine', color: '#eab308' },
    { value: 6, emoji: '😊', label: 'Good', color: '#84cc16' },
    { value: 7, emoji: '😄', label: 'Great', color: '#22c55e' },
    { value: 8, emoji: '😁', label: 'Amazing', color: '#10b981' },
    { value: 9, emoji: '🤩', label: 'Fantastic', color: '#06b6d4' },
    { value: 10, emoji: '🥳', label: 'Euphoric', color: '#8b5cf6' }
  ];

  const sizeClasses = {
    small: 'mood-selector-small',
    normal: 'mood-selector-normal',
    large: 'mood-selector-large'
  };

  return (
    <div className={`mood-selector ${sizeClasses[size]}`}>
      <div className="mood-selector-header">
        <Smile size={16} />
        <span className="mood-label">How are you feeling?</span>
        {selectedMood && (
          <span className="mood-value">
            {selectedMood}/10 - {moods.find(m => m.value === selectedMood)?.label}
          </span>
        )}
      </div>
      
      <div className="mood-options">
        {moods.map((mood) => (
          <button
            key={mood.value}
            className={`mood-option ${selectedMood === mood.value ? 'selected' : ''}`}
            onClick={() => onMoodChange(mood.value)}
            style={{
              '--mood-color': mood.color
            }}
            title={`${mood.value}/10 - ${mood.label}`}
          >
            <span className="mood-emoji">{mood.emoji}</span>
            <span className="mood-number">{mood.value}</span>
          </button>
        ))}
      </div>
      
      {selectedMood && (
        <div className="mood-description">
          <div className="selected-mood">
            <span className="selected-emoji">
              {moods.find(m => m.value === selectedMood)?.emoji}
            </span>
            <div className="selected-details">
              <span className="selected-label">
                {moods.find(m => m.value === selectedMood)?.label}
              </span>
              <span className="selected-score">{selectedMood}/10</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodSelector;