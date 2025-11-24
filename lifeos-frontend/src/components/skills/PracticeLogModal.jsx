import React, { useState } from 'react';
import { X, Clock, Target, Calendar, FileText, Plus } from 'lucide-react';
import Button from '../shared/Button';
import './PracticeLogModal.css';
import { haptics } from '../../utils/haptics';

const PracticeLogModal = ({ skills, onClose, selectedSkill = null }) => {
  const [formData, setFormData] = useState({
    skillId: selectedSkill?.id || '',
    date: new Date().toISOString().split('T')[0],
    duration: '',
    notes: '',
    milestones: []
  });

  const [newMilestone, setNewMilestone] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addMilestone = () => {
    if (newMilestone.trim()) {
      setFormData(prev => ({
        ...prev,
        milestones: [...prev.milestones, newMilestone.trim()]
      }));
      setNewMilestone('');
    }
  };

  const removeMilestone = (index) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.skillId || !formData.duration) {
      await haptics.error();
      alert('Please fill in all required fields');
      return;
    }

    const practiceData = {
      ...formData,
      duration: parseFloat(formData.duration),
      timestamp: new Date().toISOString()
    };

    console.log('Practice logged:', practiceData);

    // Success haptic + medium impact for logging practice
    await haptics.success();
    await haptics.medium();

    alert('Practice session logged successfully!');
    onClose();
  };

  const selectedSkillData = skills.find(skill => skill.id.toString() === formData.skillId);

  const formatDuration = (hours) => {
    if (hours >= 1) {
      return `${hours}h`;
    } else {
      return `${Math.round(hours * 60)}min`;
    }
  };

  const suggestedDurations = [0.25, 0.5, 1, 1.5, 2, 3];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="practice-log-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <h2 className="modal-title">Log Practice Session</h2>
            <p className="modal-subtitle">Record your skill practice and track progress</p>
          </div>
          <Button variant="ghost" size="small" icon={X} onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="practice-form">
          <div className="form-content">
            {/* Skill Selection */}
            <div className="form-group">
              <label className="form-label">
                <Target size={16} />
                Skill *
              </label>
              <select
                value={formData.skillId}
                onChange={(e) => handleInputChange('skillId', e.target.value)}
                className="form-select"
                required
              >
                <option value="">Select a skill...</option>
                {skills.map(skill => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name} ({skill.level})
                  </option>
                ))}
              </select>
              {selectedSkillData && (
                <div className="skill-preview">
                  <div className="skill-info">
                    <span className="skill-name">{selectedSkillData.name}</span>
                    <span className="skill-progress">{selectedSkillData.progress}% complete</span>
                  </div>
                  <div className="skill-goal">
                    Next goal: {selectedSkillData.nextGoal}
                  </div>
                </div>
              )}
            </div>

            {/* Date Selection */}
            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} />
                Practice Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="form-input"
                required
              />
            </div>

            {/* Duration */}
            <div className="form-group">
              <label className="form-label">
                <Clock size={16} />
                Duration (hours) *
              </label>
              <div className="duration-input-group">
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="12"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="form-input duration-input"
                  placeholder="1.5"
                  required
                />
                <div className="duration-suggestions">
                  {suggestedDurations.map(duration => (
                    <button
                      key={duration}
                      type="button"
                      className={`duration-chip ${formData.duration === duration.toString() ? 'active' : ''}`}
                      onClick={() => handleInputChange('duration', duration.toString())}
                    >
                      {formatDuration(duration)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">
                <FileText size={16} />
                Practice Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="form-textarea"
                placeholder="What did you work on? What challenges did you face? What did you learn?"
                rows="4"
              />
            </div>

            {/* Milestones */}
            <div className="form-group">
              <label className="form-label">
                <Target size={16} />
                Milestones Achieved
              </label>
              <div className="milestone-input-group">
                <input
                  type="text"
                  value={newMilestone}
                  onChange={(e) => setNewMilestone(e.target.value)}
                  className="form-input"
                  placeholder="Describe any milestone you achieved..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMilestone())}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  icon={Plus}
                  onClick={addMilestone}
                  disabled={!newMilestone.trim()}
                >
                  Add
                </Button>
              </div>
              
              {formData.milestones.length > 0 && (
                <div className="milestones-list">
                  {formData.milestones.map((milestone, index) => (
                    <div key={index} className="milestone-item">
                      <span className="milestone-text">{milestone}</span>
                      <button
                        type="button"
                        className="remove-milestone"
                        onClick={() => removeMilestone(index)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!formData.skillId || !formData.duration}
            >
              Log Practice Session
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PracticeLogModal;