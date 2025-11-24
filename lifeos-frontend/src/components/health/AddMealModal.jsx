import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { Apple, Utensils, Zap, Target } from 'lucide-react';
import './ModalForms.css';

const AddMealModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    mealType: '',
    foodName: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const mealTypes = [
    'Breakfast',
    'Morning Snack',
    'Lunch',
    'Afternoon Snack',
    'Dinner',
    'Evening Snack',
    'Other'
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

    if (!formData.mealType.trim()) {
      newErrors.mealType = 'Meal type is required';
    }

    if (!formData.foodName.trim()) {
      newErrors.foodName = 'Food name is required';
    }

    if (!formData.calories || formData.calories <= 0) {
      newErrors.calories = 'Calories must be greater than 0';
    }

    if (formData.protein && formData.protein < 0) {
      newErrors.protein = 'Protein cannot be negative';
    }

    if (formData.carbs && formData.carbs < 0) {
      newErrors.carbs = 'Carbs cannot be negative';
    }

    if (formData.fat && formData.fat < 0) {
      newErrors.fat = 'Fat cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const mealData = {
      ...formData,
      calories: parseInt(formData.calories),
      protein: formData.protein ? parseFloat(formData.protein) : 0,
      carbs: formData.carbs ? parseFloat(formData.carbs) : 0,
      fat: formData.fat ? parseFloat(formData.fat) : 0,
      time: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    };

    onSubmit(mealData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      mealType: '',
      foodName: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      notes: ''
    });
    setErrors({});
    onClose();
  };

  const getMealIcon = (mealType) => {
    switch (mealType.toLowerCase()) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '☀️';
      case 'dinner':
        return '🌙';
      default:
        return '🍎';
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Add Meal"
      size="large"
    >
      <form onSubmit={handleSubmit} className="meal-form">
        <div className="form-grid">
          {/* Meal Type */}
          <div className="form-group">
            <label className="form-label">
              <Utensils size={16} />
              Meal Type *
            </label>
            <select
              value={formData.mealType}
              onChange={(e) => handleInputChange('mealType', e.target.value)}
              className={`form-select ${errors.mealType ? 'error' : ''}`}
            >
              <option value="">Select meal type</option>
              {mealTypes.map(type => (
                <option key={type} value={type}>
                  {getMealIcon(type)} {type}
                </option>
              ))}
            </select>
            {errors.mealType && <span className="form-error">{errors.mealType}</span>}
          </div>

          {/* Food Name */}
          <div className="form-group">
            <Input
              label={
                <span className="input-label-icon">
                  <Apple size={16} />
                  Food/Dish Name *
                </span>
              }
              type="text"
              value={formData.foodName}
              onChange={(e) => handleInputChange('foodName', e.target.value)}
              placeholder="Grilled chicken salad with quinoa"
              error={errors.foodName}
              required
            />
          </div>

          {/* Calories */}
          <div className="form-group">
            <Input
              label={
                <span className="input-label-icon">
                  <Zap size={16} />
                  Calories *
                </span>
              }
              type="number"
              value={formData.calories}
              onChange={(e) => handleInputChange('calories', e.target.value)}
              placeholder="420"
              min="1"
              max="2000"
              error={errors.calories}
              required
            />
          </div>

          {/* Protein */}
          <div className="form-group">
            <Input
              label={
                <span className="input-label-icon">
                  <Target size={16} />
                  Protein (g)
                </span>
              }
              type="number"
              step="0.1"
              value={formData.protein}
              onChange={(e) => handleInputChange('protein', e.target.value)}
              placeholder="25"
              min="0"
              max="200"
              error={errors.protein}
            />
          </div>

          {/* Carbs */}
          <div className="form-group">
            <Input
              label="Carbs (g)"
              type="number"
              step="0.1"
              value={formData.carbs}
              onChange={(e) => handleInputChange('carbs', e.target.value)}
              placeholder="55"
              min="0"
              max="500"
              error={errors.carbs}
            />
          </div>

          {/* Fat */}
          <div className="form-group">
            <Input
              label="Fat (g)"
              type="number"
              step="0.1"
              value={formData.fat}
              onChange={(e) => handleInputChange('fat', e.target.value)}
              placeholder="8"
              min="0"
              max="200"
              error={errors.fat}
            />
          </div>
        </div>

        {/* Macro Summary */}
        {(formData.protein || formData.carbs || formData.fat) && (
          <div className="macro-summary">
            <h4>Macro Breakdown</h4>
            <div className="macro-preview">
              {formData.protein && (
                <div className="macro-item">
                  <span className="macro-label">Protein:</span>
                  <span className="macro-value">{formData.protein}g ({Math.round(formData.protein * 4)} cal)</span>
                </div>
              )}
              {formData.carbs && (
                <div className="macro-item">
                  <span className="macro-label">Carbs:</span>
                  <span className="macro-value">{formData.carbs}g ({Math.round(formData.carbs * 4)} cal)</span>
                </div>
              )}
              {formData.fat && (
                <div className="macro-item">
                  <span className="macro-label">Fat:</span>
                  <span className="macro-value">{formData.fat}g ({Math.round(formData.fat * 9)} cal)</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="form-group full-width">
          <Input
            label="Notes"
            type="textarea"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Any additional details about the meal..."
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
            Add Meal
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddMealModal;