import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { Heart, Activity, Battery, Thermometer } from 'lucide-react';
import './ModalForms.css';

const LogRecoveryModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    recoveryScore: '',
    heartRateVariability: '',
    restingHeartRate: '',
    stressLevel: '',
    energyLevel: '5',
    motivation: '5',
    soreness: '3',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const scaleOptions = {
    energy: [
      { value: '1', label: '1 - Completely Drained' },
      { value: '2', label: '2 - Very Low' },
      { value: '3', label: '3 - Low' },
      { value: '4', label: '4 - Below Average' },
      { value: '5', label: '5 - Average' },
      { value: '6', label: '6 - Above Average' },
      { value: '7', label: '7 - High' },
      { value: '8', label: '8 - Very High' },
      { value: '9', label: '9 - Energized' },
      { value: '10', label: '10 - Peak Energy' }
    ],
    motivation: [
      { value: '1', label: '1 - No Motivation' },
      { value: '2', label: '2 - Very Low' },
      { value: '3', label: '3 - Low' },
      { value: '4', label: '4 - Below Average' },
      { value: '5', label: '5 - Average' },
      { value: '6', label: '6 - Above Average' },
      { value: '7', label: '7 - High' },
      { value: '8', label: '8 - Very High' },
      { value: '9', label: '9 - Highly Motivated' },
      { value: '10', label: '10 - Peak Motivation' }
    ],
    soreness: [
      { value: '0', label: '0 - No Soreness' },
      { value: '1', label: '1 - Minimal' },
      { value: '2', label: '2 - Light' },
      { value: '3', label: '3 - Moderate' },
      { value: '4', label: '4 - Above Moderate' },
      { value: '5', label: '5 - High' },
      { value: '6', label: '6 - Very High' },
      { value: '7', label: '7 - Severe' },
      { value: '8', label: '8 - Very Severe' },
      { value: '9', label: '9 - Extreme' },
      { value: '10', label: '10 - Debilitating' }
    ]
  };

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

    if (formData.recoveryScore && (formData.recoveryScore < 0 || formData.recoveryScore > 100)) {
      newErrors.recoveryScore = 'Recovery score must be between 0-100';
    }

    if (formData.heartRateVariability && formData.heartRateVariability < 0) {
      newErrors.heartRateVariability = 'HRV cannot be negative';
    }

    if (formData.restingHeartRate && (formData.restingHeartRate < 30 || formData.restingHeartRate > 200)) {
      newErrors.restingHeartRate = 'Resting heart rate must be between 30-200 bpm';
    }

    if (formData.stressLevel && (formData.stressLevel < 0 || formData.stressLevel > 100)) {
      newErrors.stressLevel = 'Stress level must be between 0-100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const recoveryData = {
      recoveryScore: formData.recoveryScore ? parseInt(formData.recoveryScore) : null,
      heartRateVariability: formData.heartRateVariability ? parseInt(formData.heartRateVariability) : null,
      restingHeartRate: formData.restingHeartRate ? parseInt(formData.restingHeartRate) : null,
      stressLevel: formData.stressLevel ? parseInt(formData.stressLevel) : null,
      energyLevel: parseInt(formData.energyLevel),
      motivation: parseInt(formData.motivation),
      soreness: parseInt(formData.soreness),
      notes: formData.notes,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    };

    onSubmit(recoveryData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      recoveryScore: '',
      heartRateVariability: '',
      restingHeartRate: '',
      stressLevel: '',
      energyLevel: '5',
      motivation: '5',
      soreness: '3',
      notes: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Log Recovery Metrics"
      size="large"
    >
      <form onSubmit={handleSubmit} className="recovery-form">
        {/* Objective Metrics */}
        <div className="metrics-section">
          <h4>Objective Metrics</h4>
          <p className="section-hint">
            Enter data from your fitness tracker or device (optional)
          </p>
          
          <div className="form-grid">
            <div className="form-group">
              <Input
                label={
                  <span className="input-label-icon">
                    <Battery size={16} />
                    Recovery Score (0-100)
                  </span>
                }
                type="number"
                value={formData.recoveryScore}
                onChange={(e) => handleInputChange('recoveryScore', e.target.value)}
                placeholder="78"
                min="0"
                max="100"
                error={errors.recoveryScore}
              />
            </div>

            <div className="form-group">
              <Input
                label={
                  <span className="input-label-icon">
                    <Activity size={16} />
                    Heart Rate Variability (ms)
                  </span>
                }
                type="number"
                value={formData.heartRateVariability}
                onChange={(e) => handleInputChange('heartRateVariability', e.target.value)}
                placeholder="42"
                min="0"
                max="200"
                error={errors.heartRateVariability}
              />
            </div>

            <div className="form-group">
              <Input
                label={
                  <span className="input-label-icon">
                    <Heart size={16} />
                    Resting Heart Rate (bpm)
                  </span>
                }
                type="number"
                value={formData.restingHeartRate}
                onChange={(e) => handleInputChange('restingHeartRate', e.target.value)}
                placeholder="58"
                min="30"
                max="200"
                error={errors.restingHeartRate}
              />
            </div>

            <div className="form-group">
              <Input
                label={
                  <span className="input-label-icon">
                    <Thermometer size={16} />
                    Stress Level (0-100%)
                  </span>
                }
                type="number"
                value={formData.stressLevel}
                onChange={(e) => handleInputChange('stressLevel', e.target.value)}
                placeholder="35"
                min="0"
                max="100"
                error={errors.stressLevel}
              />
            </div>
          </div>
        </div>

        {/* Subjective Metrics */}
        <div className="subjective-section">
          <h4>How You Feel</h4>
          <p className="section-hint">
            Rate how you're feeling today on these scales
          </p>
          
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                <Battery size={16} />
                Energy Level
              </label>
              <select
                value={formData.energyLevel}
                onChange={(e) => handleInputChange('energyLevel', e.target.value)}
                className="form-select"
              >
                {scaleOptions.energy.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Motivation Level
              </label>
              <select
                value={formData.motivation}
                onChange={(e) => handleInputChange('motivation', e.target.value)}
                className="form-select"
              >
                {scaleOptions.motivation.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Muscle Soreness
              </label>
              <select
                value={formData.soreness}
                onChange={(e) => handleInputChange('soreness', e.target.value)}
                className="form-select"
              >
                {scaleOptions.soreness.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="form-group full-width">
          <Input
            label="Recovery Notes"
            type="textarea"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="How are you feeling today? Any specific areas of focus for recovery..."
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
            Log Recovery
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LogRecoveryModal;