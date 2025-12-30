import React, { useState } from 'react';
import Modal from '../shared/Modal';

const AddTaskModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    project: 'Ascynt',
    priority: 'medium',
    dueDate: '',
    tags: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    console.log('Task created:', { ...formData, tags: tagsArray });
    onClose();
  };

  return (
    <Modal title="New Task" onClose={onClose}>
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label>Task Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="form-input"
            placeholder="e.g., Complete API integration"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Project</label>
            <select
              value={formData.project}
              onChange={(e) => handleInputChange('project', e.target.value)}
              className="form-select"
            >
              <option>Ascynt</option>
              <option>Client Portfolio</option>
              <option>Learning</option>
              <option>Personal</option>
            </select>
          </div>

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

        <div className="form-group">
          <label>Tags (comma-separated)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            className="form-input"
            placeholder="development, backend, urgent"
          />
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Create Task
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddTaskModal;
