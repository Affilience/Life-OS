import React, { useState } from 'react';
import Modal from '../shared/Modal';

const AddSessionModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Deep Work',
    duration: '',
    focusQuality: 7,
    output: '',
    project: 'Ascynt'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Session logged:', formData);
    onClose();
  };

  return (
    <Modal title="Log Work Session" onClose={onClose}>
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Session Type</label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="form-select"
              required
            >
              <option>Deep Work</option>
              <option>Learning</option>
              <option>Admin</option>
              <option>Communication</option>
              <option>Planning</option>
              <option>Meeting</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Duration (hours)</label>
            <input
              type="number"
              step="0.25"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              className="form-input"
              placeholder="2.5"
              required
            />
          </div>

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
        </div>

        <div className="form-group">
          <label>Focus Quality: {formData.focusQuality}/10</label>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.focusQuality}
            onChange={(e) => handleInputChange('focusQuality', Number(e.target.value))}
            className="range-slider"
          />
        </div>

        <div className="form-group">
          <label>Output / Notes</label>
          <textarea
            value={formData.output}
            onChange={(e) => handleInputChange('output', e.target.value)}
            className="form-textarea"
            placeholder="What did you accomplish?"
            rows="4"
            required
          />
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Log Session
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddSessionModal;
