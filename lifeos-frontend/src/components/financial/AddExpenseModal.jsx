import React, { useState } from 'react';
import { X, DollarSign, Calendar, Tag, FileText, AlertCircle } from 'lucide-react';
import Button from '../shared/Button';
import './AddExpenseModal.css';

const AddExpenseModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'Food',
    amount: '',
    type: 'Essential',
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

    if (!formData.description || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }

    const expenseData = {
      ...formData,
      amount: parseFloat(formData.amount),
      timestamp: new Date().toISOString()
    };

    console.log('Expense logged:', expenseData);
    alert('Expense entry added successfully!');
    onClose();
  };

  const categories = [
    'Food',
    'Health',
    'Learning',
    'Transport',
    'Discretionary',
    'Bills & Utilities',
    'Business',
    'Other'
  ];

  const types = [
    'Essential',
    'Investment',
    'Discretionary'
  ];

  const suggestedAmounts = [10, 20, 50, 100];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-expense-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <h2 className="modal-title">Add Expense</h2>
            <p className="modal-subtitle">Record new expense entry</p>
          </div>
          <Button variant="ghost" size="sm" leftIcon={<X size={18} />} onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="expense-form">
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

            {/* Description */}
            <div className="form-group">
              <label className="form-label">
                <FileText size={16} />
                Description *
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="form-input"
                placeholder="What did you spend on?"
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
              <div className="amount-suggestions">
                {suggestedAmounts.map(amount => (
                  <button
                    key={amount}
                    type="button"
                    className={`amount-chip ${formData.amount === amount.toString() ? 'active' : ''}`}
                    onClick={() => handleInputChange('amount', amount.toString())}
                  >
                    £{amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Type */}
            <div className="form-group">
              <label className="form-label">
                <AlertCircle size={16} />
                Expense Type *
              </label>
              <div className="type-options">
                {types.map(type => (
                  <label key={type} className="type-radio">
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={formData.type === type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                    />
                    <span className="type-label">{type}</span>
                  </label>
                ))}
              </div>
              <div className="type-description">
                {formData.type === 'Essential' && (
                  <p>Necessary expenses like food, transport, and bills</p>
                )}
                {formData.type === 'Investment' && (
                  <p>Spending that generates future value (learning, equipment)</p>
                )}
                {formData.type === 'Discretionary' && (
                  <p>Optional spending for enjoyment or convenience</p>
                )}
              </div>
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
              disabled={!formData.description || !formData.amount}
            >
              Add Expense Entry
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;