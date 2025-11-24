import React, { useState } from 'react';
import {
  Plus,
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  Folder,
  Edit2,
  Trash2,
  Tag,
  Target,
  BarChart3,
} from 'lucide-react';
import useProductivityStore from '../../stores/productivityStore';
import './IncomeTab.css';

export default function IncomeTab() {
  const {
    incomeTransactions,
    projects,
    addIncomeTransaction,
    updateIncomeTransaction,
    deleteIncomeTransaction,
    getIncomeByProject,
  } = useProductivityStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filterProject, setFilterProject] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    projectId: null,
    amount: '',
    currency: 'GBP',
    source: '',
    date: new Date().toISOString().split('T')[0],
    hoursWorked: '',
    notes: '',
    tags: [],
  });

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setFormData({
      projectId: null,
      amount: '',
      currency: 'GBP',
      source: '',
      date: new Date().toISOString().split('T')[0],
      hoursWorked: '',
      notes: '',
      tags: [],
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      projectId: transaction.projectId,
      amount: transaction.amount,
      currency: transaction.currency,
      source: transaction.source,
      date: transaction.date,
      hoursWorked: transaction.hoursWorked || '',
      notes: transaction.notes || '',
      tags: transaction.tags || [],
    });
    setShowAddModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      hoursWorked: formData.hoursWorked ? parseFloat(formData.hoursWorked) : 0,
    };

    if (editingTransaction) {
      updateIncomeTransaction(editingTransaction.id, transactionData);
    } else {
      addIncomeTransaction(transactionData);
    }
    setShowAddModal(false);
  };

  const handleDeleteTransaction = (transactionId) => {
    if (confirm('Are you sure you want to delete this income transaction?')) {
      deleteIncomeTransaction(transactionId);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calculate stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const thisMonthIncome = incomeTransactions
    .filter((t) => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const lastMonthIncome = incomeTransactions
    .filter((t) => {
      const date = new Date(t.date);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const growth = lastMonthIncome > 0 ? (((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100).toFixed(1) : 0;

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalHours = incomeTransactions.reduce((sum, t) => sum + (t.hoursWorked || 0), 0);
  const averageRate = totalHours > 0 ? (totalIncome / totalHours).toFixed(2) : 0;

  // Monthly data for chart (last 6 months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - i, 1);
    const monthIncome = incomeTransactions
      .filter((t) => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
      })
      .reduce((sum, t) => sum + t.amount, 0);

    monthlyData.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      amount: monthIncome,
    });
  }

  // Filter transactions
  let filteredTransactions = incomeTransactions;
  if (filterProject !== 'all') {
    filteredTransactions = incomeTransactions.filter((t) => t.projectId === filterProject);
  }

  // Sort by date (most recent first)
  filteredTransactions = [...filteredTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="income-tab">
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="stat-content">
            <div className="stat-value">£{thisMonthIncome.toFixed(0)}</div>
            <div className="stat-label">This Month</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="stat-content">
            <div className="stat-value" style={{ color: growth >= 0 ? '#10b981' : '#ef4444' }}>
              {growth >= 0 ? '+' : ''}
              {growth}%
            </div>
            <div className="stat-label">Growth</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Clock className="w-5 h-5" />
          </div>
          <div className="stat-content">
            <div className="stat-value">£{averageRate}</div>
            <div className="stat-label">Avg Hourly Rate</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Target className="w-5 h-5" />
          </div>
          <div className="stat-content">
            <div className="stat-value">£{totalIncome.toFixed(0)}</div>
            <div className="stat-label">Total Earned</div>
          </div>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="monthly-chart-section">
        <div className="chart-header">
          <div className="chart-header-left">
            <BarChart3 className="w-5 h-5" />
            <h3 className="chart-title">Monthly Income Trend</h3>
          </div>
          <p className="chart-description">Last 6 months</p>
        </div>
        <div className="monthly-chart">
          {monthlyData.map((month, index) => {
            const maxAmount = Math.max(...monthlyData.map((m) => m.amount), 1);
            const height = (month.amount / maxAmount) * 100;

            return (
              <div key={index} className="chart-bar-container">
                <div className="chart-bar-wrapper">
                  <div className="chart-bar" style={{ height: `${height}%` }}>
                    <span className="bar-value">£{month.amount.toFixed(0)}</span>
                  </div>
                </div>
                <span className="chart-label">{month.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transactions Section */}
      <div className="transactions-section">
        <div className="transactions-header">
          <div className="header-left">
            <h3 className="section-title">Income Transactions</h3>
            <p className="section-description">Track your project-based earnings</p>
          </div>
          <div className="header-right">
            {/* Project Filter */}
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <button onClick={handleOpenAddModal} className="add-income-btn">
              <Plus className="w-5 h-5" />
              Add Income
            </button>
          </div>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <DollarSign className="w-12 h-12 opacity-20" />
            <p>No income transactions yet</p>
            <p className="empty-hint">Add your first transaction to start tracking earnings!</p>
          </div>
        ) : (
          <div className="transactions-list">
            {filteredTransactions.map((transaction) => {
              const project = projects.find((p) => p.id === transaction.projectId);

              return (
                <div key={transaction.id} className="transaction-item">
                  {/* Icon */}
                  <div className="transaction-icon">
                    <DollarSign className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="transaction-content">
                    <div className="transaction-header">
                      <h4 className="transaction-source">{transaction.source}</h4>
                      <div className="transaction-amount">£{transaction.amount}</div>
                    </div>

                    <div className="transaction-meta">
                      {project && (
                        <>
                          <div className="transaction-meta-item">
                            <Folder className="w-4 h-4" />
                            <span>{project.name}</span>
                          </div>
                          <span className="transaction-meta-separator">•</span>
                        </>
                      )}
                      <div className="transaction-meta-item">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(transaction.date)}</span>
                      </div>
                      {transaction.hoursWorked > 0 && (
                        <>
                          <span className="transaction-meta-separator">•</span>
                          <div className="transaction-meta-item">
                            <Clock className="w-4 h-4" />
                            <span>
                              {transaction.hoursWorked}h @ £{transaction.effectiveRate}/h
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {transaction.notes && (
                      <p className="transaction-notes">{transaction.notes}</p>
                    )}

                    {transaction.tags && transaction.tags.length > 0 && (
                      <div className="transaction-tags">
                        <Tag className="w-3 h-3" />
                        {transaction.tags.map((tag, index) => (
                          <span key={index} className="transaction-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="transaction-actions">
                    <button
                      onClick={() => handleOpenEditModal(transaction)}
                      className="transaction-action-btn edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="transaction-action-btn delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              {editingTransaction ? 'Edit Income Transaction' : 'Add Income Transaction'}
            </h3>

            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label>Amount (£)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Source / Description</label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="e.g., Client Payment - Milestone 1"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-row form-row-2">
                <div className="form-group">
                  <label>Project (optional)</label>
                  <select
                    value={formData.projectId || ''}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value || null })}
                    className="form-select"
                  >
                    <option value="">No Project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Hours Worked (optional)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.hoursWorked}
                    onChange={(e) => setFormData({ ...formData, hoursWorked: e.target.value })}
                    placeholder="0.0"
                    className="form-input"
                  />
                  {formData.amount && formData.hoursWorked && (
                    <div className="rate-indicator">
                      Effective rate: £{(parseFloat(formData.amount) / parseFloat(formData.hoursWorked)).toFixed(2)}/h
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Notes (optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any additional details..."
                    className="form-textarea"
                    rows="3"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingTransaction ? 'Save Changes' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
