import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { Dumbbell, Clock, Zap, TrendingUp } from 'lucide-react';
import './ModalForms.css';

const LogWorkoutModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: '',
    duration: '',
    exercises: '',
    intensity: '5',
    calories: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const workoutTypes = [
    'Push Day',
    'Pull Day',
    'Legs',
    'Upper Body',
    'Full Body',
    'Cardio',
    'HIIT',
    'Yoga',
    'Swimming',
    'Running',
    'Other'
  ];

  const intensityLevels = [
    { value: '1', label: '1 - Very Light' },
    { value: '2', label: '2 - Light' },
    { value: '3', label: '3 - Moderate' },
    { value: '4', label: '4 - Somewhat Hard' },
    { value: '5', label: '5 - Hard' },
    { value: '6', label: '6 - Harder' },
    { value: '7', label: '7 - Very Hard' },
    { value: '8', label: '8 - Very Hard+' },
    { value: '9', label: '9 - Extremely Hard' },
    { value: '10', label: '10 - Maximum Effort' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.type.trim()) {
      newErrors.type = 'Workout type is required';
    }

    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }

    if (!formData.exercises || formData.exercises <= 0) {
      newErrors.exercises = 'Number of exercises must be greater than 0';
    }

    if (formData.calories && formData.calories <= 0) {
      newErrors.calories = 'Calories must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const workoutData = {
      ...formData,
      duration: parseInt(formData.duration),
      exercises: parseInt(formData.exercises),
      intensity: parseInt(formData.intensity),
      calories: formData.calories ? parseInt(formData.calories) : null,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    };

    onSubmit(workoutData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      type: '',
      duration: '',
      exercises: '',
      intensity: '5',
      calories: '',
      notes: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Log Workout"
      size="large"
    >
      <form onSubmit={handleSubmit} className="workout-form">
        <div className="form-grid">
          {/* Workout Type */}
          <div className="form-group">
            <label className="form-label">
              <Dumbbell size={16} />
              Workout Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className={`form-select ${errors.type ? 'error' : ''}`}
            >
              <option value="">Select workout type</option>
              {workoutTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.type && <span className="form-error">{errors.type}</span>}
          </div>

          {/* Duration */}
          <div className="form-group">
            <Input
              label={
                <span className="input-label-icon">
                  <Clock size={16} />
                  Duration (minutes) *
                </span>
              }
              type="number"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              placeholder="45"
              min="1"
              max="300"
              error={errors.duration}
              required
            />
          </div>

          {/* Number of Exercises */}
          <div className="form-group">
            <Input
              label="Number of Exercises *"
              type="number"
              value={formData.exercises}
              onChange={(e) => handleInputChange('exercises', e.target.value)}
              placeholder="6"
              min="1"
              max="50"
              error={errors.exercises}
              required
            />
          </div>

          {/* Intensity */}
          <div className="form-group">
            <label className="form-label">
              <TrendingUp size={16} />
              Intensity Level (1-10)
            </label>
            <select
              value={formData.intensity}
              onChange={(e) => handleInputChange('intensity', e.target.value)}
              className="form-select"
            >
              {intensityLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Calories (Optional) */}
          <div className="form-group">
            <Input
              label={
                <span className="input-label-icon">
                  <Zap size={16} />
                  Calories Burned
                </span>
              }
              type="number"
              value={formData.calories}
              onChange={(e) => handleInputChange('calories', e.target.value)}
              placeholder="320"
              min="1"
              max="2000"
              error={errors.calories}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="form-group full-width">
          <Input
            label="Notes"
            type="textarea"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="How did the workout feel? Any achievements or observations..."
            rows={3}
          />
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary"
          >
            Log Workout
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LogWorkoutModal;