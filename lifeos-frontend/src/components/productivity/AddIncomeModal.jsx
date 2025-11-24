import React, { useState } from 'react';
import Modal from '../shared/Modal';

const AddIncomeModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    source: '',
    project: 'Quanta',
    amount: '',
    hoursWorked: '',
    notes: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateEffectiveRate = () => {
    if (formData.amount && formData.hoursWorked) {
      return (parseFloat(formData.amount) / parseFloat(formData.hoursWorked)).toFixed(2);
    }
    return '-';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const effectiveRate = calculateEffectiveRate();
    console.log('Income added:', { ...formData, effectiveRate: `£${effectiveRate}/hour` });
    onClose();
  };

  return (
    <Modal title="Add Income" onClose={onClose}>
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
            <label>Amount (£)</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="form-input"
              placeholder="250.00"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Source</label>
          <input
            type="text"
            value={formData.source}
            onChange={(e) => handleInputChange('source', e.target.value)}
            className="form-input"
            placeholder="e.g., Freelance Web Development"
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
              <option>Quanta</option>
              <option>Client Portfolio</option>
              <option>Consulting</option>
              <option>Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Hours Worked (optional)</label>
            <input
              type="number"
              step="0.25"
              value={formData.hoursWorked}
              onChange={(e) => handleInputChange('hoursWorked', e.target.value)}
              className="form-input"
              placeholder="10"
            />
          </div>
        </div>

        {formData.amount && formData.hoursWorked && (
          <div className="effective-rate-display">
            <label>Effective Rate</label>
            <div className="rate-value">£{calculateEffectiveRate()}/hour</div>
          </div>
        )}

        <div className="form-group">
          <label>Notes (optional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="form-textarea"
            placeholder="Additional details..."
            rows="3"
          />
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Add Income
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddIncomeModal;
