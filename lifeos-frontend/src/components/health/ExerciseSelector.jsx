import React, { useState } from 'react';
import { EXERCISE_DATABASE, CATEGORIES } from '../../data/exerciseDatabase';
import { X, Search } from 'lucide-react';
import './ExerciseSelector.css';

export default function ExerciseSelector({ onSelect, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const exercises = Object.values(EXERCISE_DATABASE);

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="exercise-selector-overlay" onClick={onClose}>
      <div className="exercise-selector-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="exercise-selector-header">
          <div className="header-top">
            <h2 className="modal-title">Add Exercise</h2>
            <button onClick={onClose} className="modal-close-btn">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="search-input-container">
            <Search className="search-icon w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises by name..."
              className="search-input"
              autoFocus
            />
          </div>

          {/* Category Filters */}
          <div className="category-filters">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`category-filter-btn ${!selectedCategory ? 'active' : ''}`}
            >
              All
            </button>
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`category-filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise List */}
        <div className="exercise-list-container">
          {filteredExercises.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p className="empty-state-text">
                {searchQuery
                  ? `No exercises found matching "${searchQuery}"`
                  : 'No exercises in this category'}
              </p>
            </div>
          ) : (
            <>
              <div className="results-count">
                Found <span className="results-count-number">{filteredExercises.length}</span>{' '}
                {filteredExercises.length === 1 ? 'exercise' : 'exercises'}
              </div>
              <div className="exercise-list">
                {filteredExercises.map(exercise => (
                  <button
                    key={exercise.id}
                    onClick={() => onSelect(exercise.id)}
                    className="exercise-card"
                  >
                    <div className="exercise-icon">{exercise.icon}</div>
                    <div className="exercise-details">
                      <h3 className="exercise-name">{exercise.name}</h3>
                      <div className="exercise-meta">
                        <span>{exercise.muscleGroups.join(', ')}</span>
                        <span className="exercise-meta-separator">•</span>
                        <span>{exercise.equipment}</span>
                      </div>
                    </div>
                    <div className="exercise-type-badge">{exercise.type}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
