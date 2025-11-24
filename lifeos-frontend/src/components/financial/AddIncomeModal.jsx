import React, { useState } from 'react';
import { X, DollarSign, Calendar, Briefcase, FileText, Clock } from 'lucide-react';
import Button from '../shared/Button';
import './AddIncomeModal.css';

const AddIncomeModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    source: '',
    category: 'Freelance',
    amount: '',
    project: '',
    hoursWorked: '',
    notes: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateEffectiveRate = () => {
    if (formData.amount && formData.hoursWorked) {
      return (parseFloat(formData.amount) / parseFloat(formData.hoursWorked)).toFixed(2);
    }
    return '-';
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.source || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }

    const incomeData = {
      ...formData,
      amount: parseFloat(formData.amount),
      hoursWorked: formData.hoursWorked ? parseFloat(formData.hoursWorked) : null,
      effectiveRate: formData.hoursWorked ? parseFloat(calculateEffectiveRate()) : null,
      timestamp: new Date().toISOString()
    };

    console.log('Income logged:', incomeData);
    alert('Income entry added successfully!');
    onClose();
  };

  const categories = [
    'Freelance',
    'Business',
    'Consulting',
    'Product Sales',
    'Investment',
    'Other'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-income-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <h2 className="modal-title">Add Income</h2>
            <p className="modal-subtitle">Record new income entry</p>
          </div>
          <Button variant="ghost" size="sm" leftIcon={<X size={18} />} onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="income-form">
          <div className="form-content">
            {/* Date */}
            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} />
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="form-input"
                required
              />
            </div>

            {/* Source */}
            <div className="form-group">
              <label className="form-label">
                <Briefcase size={16} />
                Income Source *
              </label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
                className="form-input"
                placeholder="Client name, company, etc."
                required
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">
                <FileText size={16} />
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="form-select"
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div className="form-group">
              <label className="form-label">
                <DollarSign size={16} />
                Amount (£) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="form-input"
                placeholder="0.00"
                required
              />
            </div>

            {/* Project/Description */}
            <div className="form-group">
              <label className="form-label">
                <FileText size={16} />
                Project/Description
              </label>
              <input
                type="text"
                value={formData.project}
                onChange={(e) => handleInputChange('project', e.target.value)}
                className="form-input"
                placeholder="Project name or description"
              />
            </div>

            {/* Hours Worked */}
            <div className="form-group">
              <label className="form-label">
                <Clock size={16} />
                Hours Worked
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.hoursWorked}
                onChange={(e) => handleInputChange('hoursWorked', e.target.value)}
                className="form-input"
                placeholder="Optional - for calculating hourly rate"
              />
              {formData.hoursWorked && formData.amount && (
                <div className="effective-rate-display">
                  Effective Rate: <strong>£{calculateEffectiveRate()}/hr</strong>
                </div>
              )}
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
                placeholder="Any additional details..."
                rows="3"
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
              disabled={!formData.source || !formData.amount}
            >
              Add Income Entry
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIncomeModal;