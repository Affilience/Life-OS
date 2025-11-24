import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { Moon, Clock, Eye, TrendingUp } from 'lucide-react';
import './ModalForms.css';

const LogSleepModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    bedtime: '',
    wakeTime: '',
    sleepQuality: '7',
    deepSleep: '',
    remSleep: '',
    lightSleep: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [calculatedDuration, setCalculatedDuration] = useState(0);

  const qualityLevels = [
    { value: '1', label: '1 - Very Poor' },
    { value: '2', label: '2 - Poor' },
    { value: '3', label: '3 - Below Average' },
    { value: '4', label: '4 - Fair' },
    { value: '5', label: '5 - Average' },
    { value: '6', label: '6 - Good' },
    { value: '7', label: '7 - Very Good' },
    { value: '8', label: '8 - Excellent' },
    { value: '9', label: '9 - Outstanding' },
    { value: '10', label: '10 - Perfect' }
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

    // Calculate duration when bedtime or wake time changes
    if (field === 'bedtime' || field === 'wakeTime') {
      const bedtime = field === 'bedtime' ? value : formData.bedtime;
      const wakeTime = field === 'wakeTime' ? value : formData.wakeTime;
      
      if (bedtime && wakeTime) {
        const duration = calculateSleepDuration(bedtime, wakeTime);
        setCalculatedDuration(duration);
      }
    }
  };

  const calculateSleepDuration = (bedtime, wakeTime) => {
    if (!bedtime || !wakeTime) return 0;
    
    const bedDate = new Date(`2000-01-01T${bedtime}:00`);
    let wakeDate = new Date(`2000-01-01T${wakeTime}:00`);
    
    // If wake time is earlier than bedtime, assume it's the next day
    if (wakeDate <= bedDate) {
      wakeDate = new Date(`2000-01-02T${wakeTime}:00`);
    }
    
    const diffMs = wakeDate - bedDate;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return Math.round(diffHours * 10) / 10; // Round to 1 decimal place
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.bedtime) {
      newErrors.bedtime = 'Bedtime is required';
    }

    if (!formData.wakeTime) {
      newErrors.wakeTime = 'Wake time is required';
    }

    if (formData.bedtime && formData.wakeTime) {
      const duration = calculateSleepDuration(formData.bedtime, formData.wakeTime);
      if (duration <= 0 || duration > 24) {
        newErrors.duration = 'Invalid sleep duration';
      }
    }

    const totalStages = parseFloat(formData.deepSleep || 0) + 
                       parseFloat(formData.remSleep || 0) + 
                       parseFloat(formData.lightSleep || 0);
    
    if (totalStages > 0 && Math.abs(totalStages - calculatedDuration) > 0.5) {
      newErrors.stages = 'Sleep stages should add up to total sleep duration';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const sleepData = {
      ...formData,
      duration: calculatedDuration,
      quality: parseInt(formData.sleepQuality),
      deepSleep: formData.deepSleep ? parseFloat(formData.deepSleep) : null,
      remSleep: formData.remSleep ? parseFloat(formData.remSleep) : null,
      lightSleep: formData.lightSleep ? parseFloat(formData.lightSleep) : null,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    };

    onSubmit(sleepData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      bedtime: '',
      wakeTime: '',
      sleepQuality: '7',
      deepSleep: '',
      remSleep: '',
      lightSleep: '',
      notes: ''
    });
    setErrors({});
    setCalculatedDuration(0);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Log Sleep"
      size="large"
    >
      <form onSubmit={handleSubmit} className="sleep-form">
        <div className="form-grid">
          {/* Bedtime */}
          <div className="form-group">
            <Input
              label={
                <span className="input-label-icon">
                  <Moon size={16} />
                  Bedtime *
                </span>
              }
              type="time"
              value={formData.bedtime}
              onChange={(e) => handleInputChange('bedtime', e.target.value)}
              error={errors.bedtime}
              required
            />
          </div>

          {/* Wake Time */}
          <div className="form-group">
            <Input
              label={
                <span className="input-label-icon">
                  <Eye size={16} />
                  Wake Time *
                </span>
              }
              type="time"
              value={formData.wakeTime}
              onChange={(e) => handleInputChange('wakeTime', e.target.value)}
              error={errors.wakeTime}
              required
            />
          </div>

          {/* Sleep Quality */}
          <div className="form-group">
            <label className="form-label">
              <TrendingUp size={16} />
              Sleep Quality (1-10)
            </label>
            <select
              value={formData.sleepQuality}
              onChange={(e) => handleInputChange('sleepQuality', e.target.value)}
              className="form-select"
            >
              {qualityLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Calculated Duration */}
          {calculatedDuration > 0 && (
            <div className="form-group">
              <div className="duration-display">
                <Clock size={16} />
                <span className="duration-label">Total Sleep:</span>
                <span className="duration-value">{calculatedDuration} hours</span>
              </div>
            </div>
          )}
        </div>

        {/* Sleep Stages */}
        <div className="sleep-stages-section">
          <h4>Sleep Stages (Optional)</h4>
          <p className="stages-hint">
            If you have sleep tracking data, you can enter the breakdown of sleep stages.
          </p>
          
          <div className="stages-grid">
            <div className="form-group">
              <Input
                label="Deep Sleep (hours)"
                type="number"
                step="0.1"
                value={formData.deepSleep}
                onChange={(e) => handleInputChange('deepSleep', e.target.value)}
                placeholder="1.8"
                min="0"
                max="12"
              />
            </div>

            <div className="form-group">
              <Input
                label="REM Sleep (hours)"
                type="number"
                step="0.1"
                value={formData.remSleep}
                onChange={(e) => handleInputChange('remSleep', e.target.value)}
                placeholder="1.2"
                min="0"
                max="12"
              />
            </div>

            <div className="form-group">
              <Input
                label="Light Sleep (hours)"
                type="number"
                step="0.1"
                value={formData.lightSleep}
                onChange={(e) => handleInputChange('lightSleep', e.target.value)}
                placeholder="4.5"
                min="0"
                max="12"
              />
            </div>
          </div>

          {errors.stages && <span className="form-error">{errors.stages}</span>}
          {errors.duration && <span className="form-error">{errors.duration}</span>}
        </div>

        {/* Notes */}
        <div className="form-group full-width">
          <Input
            label="Sleep Notes"
            type="textarea"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="How did you sleep? Any dreams, disturbances, or observations..."
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
            Log Sleep
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LogSleepModal;