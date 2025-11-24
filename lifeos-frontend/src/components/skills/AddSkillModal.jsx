import React, { useState } from 'react';
import { X, Target, Tag, TrendingUp, FileText } from 'lucide-react';
import Button from '../shared/Button';
import './AddSkillModal.css';

const AddSkillModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'digital',
    level: 'beginner',
    initialGoal: '',
    notes: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.initialGoal) {
      alert('Please fill in all required fields');
      return;
    }

    const skillData = {
      ...formData,
      progress: 0,
      timeInvested: 0,
      lastPracticed: new Date().toISOString().split('T')[0],
      milestones: [],
      timestamp: new Date().toISOString()
    };

    console.log('Skill added:', skillData);
    alert('New skill added successfully!');
    onClose();
  };

  const categories = [
    { value: 'practical', label: 'Practical Life' },
    { value: 'communication', label: 'Communication' },
    { value: 'physical', label: 'Physical' },
    { value: 'cognitive', label: 'Cognitive' },
    { value: 'creative', label: 'Creative' },
    { value: 'professional', label: 'Professional' },
    { value: 'digital', label: 'Digital' }
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner', description: 'Just starting out' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
    { value: 'advanced', label: 'Advanced', description: 'Highly skilled' },
    { value: 'expert', label: 'Expert', description: 'Mastery level' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-skill-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <h2 className="modal-title">Add New Skill</h2>
            <p className="modal-subtitle">Start tracking a new skill to develop</p>
          </div>
          <Button variant="ghost" size="small" icon={X} onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="skill-form">
          <div className="form-content">
            {/* Skill Name */}
            <div className="form-group">
              <label className="form-label">
                <Target size={16} />
                Skill Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="form-input"
                placeholder="e.g., Touch Typing, Public Speaking, Python Programming"
                required
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">
                <Tag size={16} />
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="form-select"
                required
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Current Level */}
            <div className="form-group">
              <label className="form-label">
                <TrendingUp size={16} />
                Current Level *
              </label>
              <div className="level-options">
                {levels.map(level => (
                  <label key={level.value} className="level-radio">
                    <input
                      type="radio"
                      name="level"
                      value={level.value}
                      checked={formData.level === level.value}
                      onChange={(e) => handleInputChange('level', e.target.value)}
                    />
                    <div className="level-content">
                      <span className="level-label">{level.label}</span>
                      <span className="level-description">{level.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Initial Goal */}
            <div className="form-group">
              <label className="form-label">
                <Target size={16} />
                Initial Goal *
              </label>
              <input
                type="text"
                value={formData.initialGoal}
                onChange={(e) => handleInputChange('initialGoal', e.target.value)}
                className="form-input"
                placeholder="What do you want to achieve first?"
                required
              />
              <p className="form-hint">
                Set a clear, measurable goal for this skill (e.g., "Type 60 WPM", "Give a 10-minute presentation")
              </p>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">
                <FileText size={16} />
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="form-textarea"
                placeholder="Why are you learning this skill? How will you practice?"
                rows="4"
              />
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
              disabled={!formData.name || !formData.initialGoal}
            >
              Add Skill
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSkillModal;