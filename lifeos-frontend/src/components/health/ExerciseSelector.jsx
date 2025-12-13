import React, { useState, useMemo } from 'react';
import { EXERCISE_DATABASE, CATEGORIES, EQUIPMENT_TYPES } from '../../data/exerciseDatabase';
import { useWorkoutStore } from '../../stores/workoutStore';
import { X, Search, Plus, ChevronDown, Check } from 'lucide-react';
import './ExerciseSelector.css';

// Common muscle groups for selection
const MUSCLE_GROUPS = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
  'quads', 'hamstrings', 'glutes', 'calves', 'core', 'abs',
  'obliques', 'hip flexors', 'traps', 'lats', 'lower back',
  'full body', 'cardiovascular'
];

// Exercise types
const EXERCISE_TYPES = [
  { id: 'compound', name: 'Compound' },
  { id: 'isolation', name: 'Isolation' },
  { id: 'isometric', name: 'Isometric' },
  { id: 'cardio', name: 'Cardio' },
  { id: 'plyometric', name: 'Plyometric' },
];

export default function ExerciseSelector({ onSelect, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Custom exercise form state
  const [newExercise, setNewExercise] = useState({
    name: '',
    category: 'other',
    muscleGroups: [],
    equipment: 'other',
    type: 'compound',
    icon: '',
  });
  const [muscleDropdownOpen, setMuscleDropdownOpen] = useState(false);

  const customExercises = useWorkoutStore((state) => state.customExercises);
  const createCustomExercise = useWorkoutStore((state) => state.createCustomExercise);

  // Combine built-in and custom exercises
  const allExercises = useMemo(() => {
    const builtIn = Object.values(EXERCISE_DATABASE);
    const custom = Object.values(customExercises || {});
    return [...builtIn, ...custom];
  }, [customExercises]);

  const filteredExercises = allExercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.muscleGroups?.some(mg => mg.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort: custom exercises first, then alphabetically
  const sortedExercises = filteredExercises.sort((a, b) => {
    if (a.isCustom && !b.isCustom) return -1;
    if (!a.isCustom && b.isCustom) return 1;
    return a.name.localeCompare(b.name);
  });

  const handleCreateExercise = () => {
    if (!newExercise.name.trim()) return;

    const exercise = createCustomExercise({
      ...newExercise,
      icon: newExercise.icon || getCategoryIcon(newExercise.category),
    });

    // Select the newly created exercise
    onSelect(exercise.id);
  };

  const getCategoryIcon = (category) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat?.icon || '';
  };

  const toggleMuscleGroup = (muscle) => {
    setNewExercise(prev => ({
      ...prev,
      muscleGroups: prev.muscleGroups.includes(muscle)
        ? prev.muscleGroups.filter(m => m !== muscle)
        : [...prev.muscleGroups, muscle]
    }));
  };

  return (
    <div className="exercise-selector-overlay" onClick={onClose}>
      <div className="exercise-selector-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="exercise-selector-header">
          <div className="header-top">
            <h2 className="modal-title">
              {showCreateForm ? 'Create Custom Exercise' : 'Add Exercise'}
            </h2>
            <button onClick={onClose} className="modal-close-btn">
              <X className="w-5 h-5" />
            </button>
          </div>

          {!showCreateForm && (
            <>
              {/* Search */}
              <div className="search-input-container">
                <Search className="search-icon w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search exercises by name or muscle..."
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
            </>
          )}
        </div>

        {/* Content */}
        <div className="exercise-list-container">
          {showCreateForm ? (
            /* Create Custom Exercise Form */
            <div className="create-exercise-form">
              {/* Exercise Name */}
              <div className="form-group">
                <label className="form-label">Exercise Name *</label>
                <input
                  type="text"
                  value={newExercise.name}
                  onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                  placeholder="e.g., Cable Lateral Raise"
                  className="form-input"
                  autoFocus
                />
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={newExercise.category}
                  onChange={(e) => setNewExercise({ ...newExercise, category: e.target.value })}
                  className="form-select"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Muscle Groups */}
              <div className="form-group">
                <label className="form-label">Target Muscles</label>
                <div className="muscle-dropdown" onClick={() => setMuscleDropdownOpen(!muscleDropdownOpen)}>
                  <div className="muscle-dropdown-display">
                    {newExercise.muscleGroups.length > 0
                      ? newExercise.muscleGroups.join(', ')
                      : 'Select muscle groups...'}
                    <ChevronDown className={`w-4 h-4 transition-transform ${muscleDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {muscleDropdownOpen && (
                    <div className="muscle-dropdown-options" onClick={(e) => e.stopPropagation()}>
                      {MUSCLE_GROUPS.map(muscle => (
                        <button
                          key={muscle}
                          type="button"
                          onClick={() => toggleMuscleGroup(muscle)}
                          className={`muscle-option ${newExercise.muscleGroups.includes(muscle) ? 'selected' : ''}`}
                        >
                          <span>{muscle}</span>
                          {newExercise.muscleGroups.includes(muscle) && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Equipment */}
              <div className="form-group">
                <label className="form-label">Equipment</label>
                <select
                  value={newExercise.equipment}
                  onChange={(e) => setNewExercise({ ...newExercise, equipment: e.target.value })}
                  className="form-select"
                >
                  {EQUIPMENT_TYPES.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.icon} {eq.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exercise Type */}
              <div className="form-group">
                <label className="form-label">Exercise Type</label>
                <select
                  value={newExercise.type}
                  onChange={(e) => setNewExercise({ ...newExercise, type: e.target.value })}
                  className="form-select"
                >
                  {EXERCISE_TYPES.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="form-btn form-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateExercise}
                  disabled={!newExercise.name.trim()}
                  className="form-btn form-btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  Create & Add
                </button>
              </div>
            </div>
          ) : (
            /* Exercise List */
            <>
              {/* Create Custom Button */}
              <button
                onClick={() => setShowCreateForm(true)}
                className="create-exercise-btn"
              >
                <Plus className="w-5 h-5" />
                <span>Can't find your exercise? Create a custom one</span>
              </button>

              {sortedExercises.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">No exercises found</div>
                  <p className="empty-state-text">
                    {searchQuery
                      ? `No exercises found matching "${searchQuery}"`
                      : 'No exercises in this category'}
                  </p>
                  <button
                    onClick={() => {
                      setNewExercise({ ...newExercise, name: searchQuery });
                      setShowCreateForm(true);
                    }}
                    className="form-btn form-btn-primary mt-4"
                  >
                    <Plus className="w-4 h-4" />
                    Create "{searchQuery}"
                  </button>
                </div>
              ) : (
                <>
                  <div className="results-count">
                    Found <span className="results-count-number">{sortedExercises.length}</span>{' '}
                    {sortedExercises.length === 1 ? 'exercise' : 'exercises'}
                    {Object.keys(customExercises || {}).length > 0 && (
                      <span className="custom-count">
                        {' '}({Object.keys(customExercises).length} custom)
                      </span>
                    )}
                  </div>
                  <div className="exercise-list">
                    {sortedExercises.map(exercise => (
                      <button
                        key={exercise.id}
                        onClick={() => onSelect(exercise.id)}
                        className={`exercise-card ${exercise.isCustom ? 'custom' : ''}`}
                      >
                        <div className="exercise-icon">{exercise.icon}</div>
                        <div className="exercise-details">
                          <h3 className="exercise-name">
                            {exercise.name}
                            {exercise.isCustom && (
                              <span className="custom-badge">Custom</span>
                            )}
                          </h3>
                          <div className="exercise-meta">
                            <span>{exercise.muscleGroups?.join(', ') || 'No muscles specified'}</span>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
