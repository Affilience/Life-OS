import React, { useState, useMemo } from 'react';
import { X, DollarSign, Calendar, Tag, FileText, AlertCircle, Wallet, TrendingDown, CheckCircle2 } from 'lucide-react';
import Button from '../shared/Button';
import { useFinancialStore, ENVELOPE_CATEGORIES, getMonthKey } from '../../stores/financialStore';
import { triggerGamification } from '../../hooks/useGamification';
import './AddExpenseModal.css';

const AddExpenseModal = ({ onClose }) => {
  const { addTransaction, getEnvelopeStatus } = useFinancialStore();
  const envelopes = getEnvelopeStatus(getMonthKey());

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'food',
    amount: '',
    notes: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get envelope status for selected category
  const selectedEnvelope = useMemo(() => {
    return envelopes[formData.category] || null;
  }, [envelopes, formData.category]);

  // Calculate remaining after this expense
  const remainingAfterExpense = useMemo(() => {
    if (!selectedEnvelope) return null;
    const amount = parseFloat(formData.amount) || 0;
    return selectedEnvelope.remaining - amount;
  }, [selectedEnvelope, formData.amount]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.description || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }

    // Add transaction to store
    addTransaction({
      date: new Date(formData.date).toISOString(),
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      type: 'expense',
      notes: formData.notes,
      merchant: formData.description,
    });

    triggerGamification('expenseLogged', { xpOverride: 10, module: 'financial' });
    onClose();
  };

  // Categories from ENVELOPE_CATEGORIES
  const categories = Object.values(ENVELOPE_CATEGORIES).map(cat => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
  }));

  const suggestedAmounts = [5, 10, 20, 50, 100];

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
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>

              {/* Envelope Status */}
              {selectedEnvelope && selectedEnvelope.allocated > 0 && (
                <div className={`envelope-status ${selectedEnvelope.status}`}>
                  <div className="envelope-header">
                    <Wallet size={14} />
                    <span>Envelope: £{selectedEnvelope.remaining.toFixed(0)} remaining</span>
                  </div>
                  <div className="envelope-bar">
                    <div
                      className="envelope-fill"
                      style={{ width: `${Math.min(selectedEnvelope.percentUsed, 100)}%` }}
                    />
                  </div>
                  {formData.amount && remainingAfterExpense !== null && (
                    <div className={`envelope-after ${remainingAfterExpense < 0 ? 'over' : ''}`}>
                      {remainingAfterExpense >= 0 ? (
                        <>
                          <CheckCircle2 size={12} />
                          <span>£{remainingAfterExpense.toFixed(0)} left after</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={12} />
                          <span>£{Math.abs(remainingAfterExpense).toFixed(0)} over budget</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
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