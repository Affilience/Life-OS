import React, { useState } from 'react';
import Modal from '../shared/Modal';

const AddProjectModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    estimatedHours: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Project created:', formData);
    onClose();
  };

  return (
    <Modal title="New Project" onClose={onClose}>
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label>Project Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="form-input"
            placeholder="e.g., Website Redesign"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="form-textarea"
            placeholder="Brief description of the project"
            rows="3"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="form-select"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Estimated Hours</label>
          <input
            type="number"
            step="0.5"
            value={formData.estimatedHours}
            onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
            className="form-input"
            placeholder="20"
          />
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Create Project
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddProjectModal;
