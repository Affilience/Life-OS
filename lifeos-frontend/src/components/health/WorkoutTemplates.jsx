import React, { useState, useMemo } from 'react';
import { useWorkoutStore } from '../../stores/workoutStore';
import { EXERCISE_DATABASE, CATEGORIES } from '../../data/exerciseDatabase';

// Helper to get exercise data from built-in or custom exercises
const getExerciseData = (exerciseId, customExercises) => {
  return EXERCISE_DATABASE[exerciseId] || customExercises?.[exerciseId] || null;
};

import {
  Play,
  Plus,
  Clock,
  Dumbbell,
  ChevronRight,
  Edit3,
  Trash2,
  Copy,
  Star,
  X,
  Search,
  Check,
  GripVertical,
  Minus,
  TrendingUp,
  Zap,
} from 'lucide-react';
import './WorkoutTemplates.css';

// Template icons
const TEMPLATE_ICONS = ['🏋️', '💪', '🦵', '🤸', '🧘', '🏃', '🔥', '⚡', '💥', '🎯', '🏆', '⭐'];
const TEMPLATE_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899'
];

export default function WorkoutTemplates() {
  const {
    templates,
    customTemplates,
    customExercises,
    exerciseHistory,
    startWorkout,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    incrementTemplateUsage,
  } = useWorkoutStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Combine built-in and custom templates
  const allTemplates = useMemo(() => {
    const builtIn = templates.map(t => ({ ...t, isCustom: false }));
    return [...customTemplates, ...builtIn];
  }, [templates, customTemplates]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter(t => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return t.name.toLowerCase().includes(query) ||
               t.description?.toLowerCase().includes(query);
      }
      return true;
    });
  }, [allTemplates, searchQuery]);

  // Group by custom vs built-in
  const customTemplatesFiltered = filteredTemplates.filter(t => t.isCustom);
  const builtInTemplatesFiltered = filteredTemplates.filter(t => !t.isCustom);

  const handleStartWorkout = (template) => {
    startWorkout(template.id);
    if (template.isCustom) {
      incrementTemplateUsage(template.id);
    }
  };

  const handleEdit = (template) => {
    if (template.isCustom) {
      setEditingTemplate(template);
      setShowCreateModal(true);
    } else {
      // Duplicate built-in template for editing
      const newTemplate = duplicateTemplate(template.id);
      if (newTemplate) {
        setEditingTemplate(newTemplate);
        setShowCreateModal(true);
      }
    }
  };

  const handleDuplicate = (template) => {
    duplicateTemplate(template.id);
  };

  const handleDelete = (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(templateId);
    }
  };

  const getExerciseWeightInfo = (exerciseId) => {
    const history = exerciseHistory[exerciseId];
    if (!history) return null;
    return {
      lastWeight: history.lastWeight,
      bestWeight: history.bestWeight,
    };
  };

  return (
    <div className="workout-templates">
      {/* Header */}
      <div className="templates-header">
        <div className="header-content">
          <h2 className="templates-title">Workout Templates</h2>
          <p className="templates-subtitle">
            Quick-start workouts with your last used weights
          </p>
        </div>

        <div className="header-actions">
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button
            onClick={() => {
              setEditingTemplate(null);
              setShowCreateModal(true);
            }}
            className="create-btn"
          >
            <Plus size={20} />
            Create Template
          </button>
        </div>
      </div>

      {/* Custom Templates Section */}
      {customTemplatesFiltered.length > 0 && (
        <div className="templates-section">
          <div className="section-header">
            <Star className="section-icon custom" size={20} />
            <h3 className="section-title">My Templates</h3>
            <span className="section-count">{customTemplatesFiltered.length}</span>
          </div>
          <div className="templates-grid">
            {customTemplatesFiltered.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onStart={() => handleStartWorkout(template)}
                onEdit={() => handleEdit(template)}
                onDuplicate={() => handleDuplicate(template)}
                onDelete={() => handleDelete(template.id)}
                getExerciseWeightInfo={getExerciseWeightInfo}
                customExercises={customExercises}
              />
            ))}
          </div>
        </div>
      )}

      {/* Built-in Quick Start templates removed - users create their own */}

      {/* Create/Edit Template Modal */}
      {showCreateModal && (
        <CreateTemplateModal
          template={editingTemplate}
          customExercises={customExercises}
          onClose={() => {
            setShowCreateModal(false);
            setEditingTemplate(null);
          }}
          onSave={(data) => {
            if (editingTemplate) {
              updateTemplate(editingTemplate.id, data);
            } else {
              createTemplate(data);
            }
            setShowCreateModal(false);
            setEditingTemplate(null);
          }}
        />
      )}
    </div>
  );
}

// Template Card Component
function TemplateCard({ template, onStart, onEdit, onDuplicate, onDelete, getExerciseWeightInfo, customExercises }) {
  const [showMenu, setShowMenu] = useState(false);

  const exerciseCount = template.exercises?.length || 0;
  const totalSets = template.exercises?.reduce((sum, e) => sum + (e.sets || 0), 0) || 0;

  return (
    <div className="template-card" style={{ '--template-color': template.color || '#a855f7' }}>
      <div className="card-header">
        <div className="template-icon">{template.icon || '🏋️'}</div>
        <div className="template-info">
          <h3 className="template-name">{template.name}</h3>
          <p className="template-description">{template.description}</p>
        </div>
        <div className="card-menu">
          <button className="menu-btn" onClick={() => setShowMenu(!showMenu)}>
            <span className="menu-dots">⋮</span>
          </button>
          {showMenu && (
            <>
              <div className="menu-backdrop" onClick={() => setShowMenu(false)} />
              <div className="menu-dropdown">
                <button onClick={() => { onEdit(); setShowMenu(false); }}>
                  <Edit3 size={16} />
                  {template.isCustom ? 'Edit' : 'Edit as Copy'}
                </button>
                <button onClick={() => { onDuplicate(); setShowMenu(false); }}>
                  <Copy size={16} />
                  Duplicate
                </button>
                {template.isCustom && onDelete && (
                  <button className="delete-option" onClick={() => { onDelete(); setShowMenu(false); }}>
                    <Trash2 size={16} />
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card-stats">
        <div className="stat">
          <Dumbbell size={14} />
          <span>{exerciseCount} exercises</span>
        </div>
        <div className="stat">
          <TrendingUp size={14} />
          <span>{totalSets} sets</span>
        </div>
        <div className="stat">
          <Clock size={14} />
          <span>~{Math.round(totalSets * 2.5)} min</span>
        </div>
      </div>


      {template.isCustom && template.timesUsed > 0 && (
        <div className="usage-badge">
          Used {template.timesUsed}x
        </div>
      )}

      <button className="start-btn" onClick={onStart}>
        <Play size={18} fill="currentColor" />
        Start Workout
      </button>
    </div>
  );
}

// Create/Edit Template Modal
function CreateTemplateModal({ template, customExercises, onClose, onSave }) {
  const { exerciseHistory } = useWorkoutStore();
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [icon, setIcon] = useState(template?.icon || '🏋️');
  const [color, setColor] = useState(template?.color || '#a855f7');
  const [exercises, setExercises] = useState(
    template?.exercises || []
  );
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get last workout's reps for an exercise
  const getLastReps = (exerciseId) => {
    const history = exerciseHistory[exerciseId];
    return history?.lastReps || null;
  };

  // Filter exercises for picker
  const filteredExercises = useMemo(() => {
    let result = Object.values(EXERCISE_DATABASE);

    if (selectedCategory !== 'all') {
      result = result.filter(e => e.category === selectedCategory);
    }

    if (exerciseSearch) {
      const query = exerciseSearch.toLowerCase();
      result = result.filter(e =>
        e.name.toLowerCase().includes(query) ||
        e.muscleGroups?.some(m => m.toLowerCase().includes(query))
      );
    }

    return result;
  }, [selectedCategory, exerciseSearch]);

  const addExercise = (exerciseId) => {
    if (!exercises.find(e => e.exerciseId === exerciseId)) {
      setExercises([...exercises, { exerciseId, sets: 3 }]);
    }
  };

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index, field, value) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: parseInt(value) || 0 };
    setExercises(updated);
  };

  const moveExercise = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= exercises.length) return;

    const updated = [...exercises];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setExercises(updated);
  };

  const handleSave = () => {
    if (!name.trim() || exercises.length === 0) return;

    onSave({
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      exercises,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="template-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{template ? 'Edit Template' : 'Create Template'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          {/* Basic Info */}
          <div className="form-section">
            <div className="form-row">
              <div className="icon-picker">
                <label>Icon</label>
                <div className="icon-grid">
                  {TEMPLATE_ICONS.map(ic => (
                    <button
                      key={ic}
                      className={`icon-option ${icon === ic ? 'selected' : ''}`}
                      onClick={() => setIcon(ic)}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div className="color-picker">
                <label>Colour</label>
                <div className="color-grid">
                  {TEMPLATE_COLORS.map(c => (
                    <button
                      key={c}
                      className={`color-option ${color === c ? 'selected' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Template Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Upper Body Day"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Chest, shoulders, and arms"
                className="form-input"
              />
            </div>
          </div>

          {/* Exercises List */}
          <div className="exercises-section">
            <div className="exercises-header">
              <h3>Exercises ({exercises.length})</h3>
              <button
                className="add-exercise-btn"
                onClick={() => setShowExercisePicker(true)}
              >
                <Plus size={18} />
                Add Exercise
              </button>
            </div>

            {exercises.length === 0 ? (
              <div className="empty-exercises">
                <Dumbbell size={32} />
                <p>No exercises added yet</p>
                <button onClick={() => setShowExercisePicker(true)}>
                  Add your first exercise
                </button>
              </div>
            ) : (
              <div className="exercises-list">
                {exercises.map((ex, index) => {
                  const exercise = getExerciseData(ex.exerciseId, customExercises);
                  const lastReps = getLastReps(ex.exerciseId);
                  return (
                    <div key={index} className="exercise-item">
                      <div className="exercise-drag">
                        <button
                          className="move-btn"
                          onClick={() => moveExercise(index, -1)}
                          disabled={index === 0}
                        >
                          ↑
                        </button>
                        <button
                          className="move-btn"
                          onClick={() => moveExercise(index, 1)}
                          disabled={index === exercises.length - 1}
                        >
                          ↓
                        </button>
                      </div>
                      <div className="exercise-icon">{exercise?.icon || '💪'}</div>
                      <div className="exercise-details">
                        <span className="exercise-name">{exercise?.name || ex.exerciseId}</span>
                        <span className="exercise-muscle">{exercise?.muscleGroups?.join(', ')}</span>
                      </div>
                      <div className="exercise-config">
                        <div className="config-field">
                          <label>Sets</label>
                          <div className="number-input">
                            <button onClick={() => updateExercise(index, 'sets', Math.max(1, ex.sets - 1))}>
                              <Minus size={14} />
                            </button>
                            <span>{ex.sets}</span>
                            <button onClick={() => updateExercise(index, 'sets', ex.sets + 1)}>
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="config-field last-reps">
                          <label>Last reps</label>
                          <div className="last-reps-display">
                            {lastReps ? (
                              <span className="last-reps-value">{lastReps}</span>
                            ) : (
                              <span className="no-history">—</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => removeExercise(index)}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={!name.trim() || exercises.length === 0}
          >
            <Check size={18} />
            {template ? 'Save Changes' : 'Create Template'}
          </button>
        </div>

        {/* Exercise Picker Modal */}
        {showExercisePicker && (
          <div className="exercise-picker-overlay" onClick={() => setShowExercisePicker(false)}>
            <div className="exercise-picker" onClick={e => e.stopPropagation()}>
              <div className="picker-header">
                <h3>Add Exercise</h3>
                <button onClick={() => setShowExercisePicker(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="picker-search">
                <Search size={18} />
                <input
                  type="text"
                  value={exerciseSearch}
                  onChange={(e) => setExerciseSearch(e.target.value)}
                  placeholder="Search exercises..."
                  autoFocus
                />
              </div>

              <div className="category-filters">
                <button
                  className={selectedCategory === 'all' ? 'active' : ''}
                  onClick={() => setSelectedCategory('all')}
                >
                  All
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    className={selectedCategory === cat.id ? 'active' : ''}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{ '--cat-color': cat.color }}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>

              <div className="exercise-list">
                {filteredExercises.map(exercise => {
                  const isAdded = exercises.some(e => e.exerciseId === exercise.id);
                  return (
                    <button
                      key={exercise.id}
                      className={`exercise-option ${isAdded ? 'added' : ''}`}
                      onClick={() => {
                        addExercise(exercise.id);
                        setShowExercisePicker(false);
                        setExerciseSearch('');
                      }}
                      disabled={isAdded}
                    >
                      <span className="exercise-icon">{exercise.icon}</span>
                      <div className="exercise-info">
                        <span className="name">{exercise.name}</span>
                        <span className="muscles">{exercise.muscleGroups?.join(', ')}</span>
                      </div>
                      {isAdded ? (
                        <Check size={18} className="added-icon" />
                      ) : (
                        <Plus size={18} className="add-icon" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
