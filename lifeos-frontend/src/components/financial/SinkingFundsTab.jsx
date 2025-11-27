import React, { useState, useMemo } from 'react';
import {
  PiggyBank,
  Plus,
  Target,
  Calendar,
  TrendingUp,
  Edit2,
  Trash2,
  X,
  Check,
  ArrowDownCircle,
  ArrowUpCircle,
  Sparkles,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useFinancialStore } from '../../stores/financialStore';
import Button from '../shared/Button';

// Predefined fund icons and colors
const FUND_PRESETS = [
  { icon: '🚗', name: 'Car Maintenance', color: 'from-blue-500 to-cyan-500' },
  { icon: '🏠', name: 'Home Repairs', color: 'from-amber-500 to-orange-500' },
  { icon: '🎄', name: 'Christmas', color: 'from-red-500 to-rose-500' },
  { icon: '✈️', name: 'Vacation', color: 'from-cyan-500 to-teal-500' },
  { icon: '💻', name: 'Electronics', color: 'from-purple-500 to-violet-500' },
  { icon: '🎁', name: 'Gifts', color: 'from-pink-500 to-rose-500' },
  { icon: '📚', name: 'Education', color: 'from-indigo-500 to-blue-500' },
  { icon: '🏥', name: 'Medical', color: 'from-green-500 to-emerald-500' },
  { icon: '👔', name: 'Clothing', color: 'from-slate-500 to-gray-500' },
  { icon: '🐕', name: 'Pet Care', color: 'from-yellow-500 to-amber-500' },
  { icon: '📱', name: 'Phone Upgrade', color: 'from-gray-500 to-slate-600' },
  { icon: '💰', name: 'Emergency', color: 'from-emerald-500 to-green-600' },
];

const SinkingFundsTab = () => {
  const {
    sinkingFunds,
    addSinkingFund,
    updateSinkingFund,
    deleteSinkingFund,
    contributeSinkingFund,
    withdrawSinkingFund,
  } = useFinancialStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFund, setEditingFund] = useState(null);
  const [transactionModal, setTransactionModal] = useState(null); // { fundId, type: 'contribute' | 'withdraw' }
  const [transactionAmount, setTransactionAmount] = useState('');

  // Calculate summary stats
  const summary = useMemo(() => {
    const totalTarget = sinkingFunds.reduce((sum, f) => sum + f.targetAmount, 0);
    const totalSaved = sinkingFunds.reduce((sum, f) => sum + f.currentAmount, 0);
    const totalMonthly = sinkingFunds.reduce((sum, f) => sum + (f.monthlyContribution || 0), 0);
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    return { totalTarget, totalSaved, totalMonthly, overallProgress };
  }, [sinkingFunds]);

  const handleTransaction = () => {
    if (!transactionModal || !transactionAmount) return;

    const amount = parseFloat(transactionAmount);
    if (isNaN(amount) || amount <= 0) return;

    if (transactionModal.type === 'contribute') {
      contributeSinkingFund(transactionModal.fundId, amount);
    } else {
      withdrawSinkingFund(transactionModal.fundId, amount);
    }

    setTransactionModal(null);
    setTransactionAmount('');
  };

  const handleDeleteFund = (fundId) => {
    if (window.confirm('Are you sure you want to delete this sinking fund?')) {
      deleteSinkingFund(fundId);
    }
  };

  const getFundProgress = (fund) => {
    const progress = fund.targetAmount > 0
      ? (fund.currentAmount / fund.targetAmount) * 100
      : 0;

    // Calculate months until target date
    let monthsRemaining = null;
    let suggestedMonthly = null;
    if (fund.targetDate) {
      const now = new Date();
      const target = new Date(fund.targetDate);
      const diffMonths = (target.getFullYear() - now.getFullYear()) * 12 +
        (target.getMonth() - now.getMonth());
      monthsRemaining = Math.max(0, diffMonths);

      const remaining = fund.targetAmount - fund.currentAmount;
      if (monthsRemaining > 0 && remaining > 0) {
        suggestedMonthly = Math.ceil(remaining / monthsRemaining);
      }
    }

    return { progress, monthsRemaining, suggestedMonthly };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-high flex items-center gap-2">
            <PiggyBank className="text-financial-500" />
            Sinking Funds
          </h2>
          <p className="text-text-med mt-1">
            Save gradually for planned irregular expenses
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={18} />}
          onClick={() => setShowAddModal(true)}
        >
          Add Fund
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-bg-secondary rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 text-text-med text-sm mb-2">
            <Target size={16} />
            Total Target
          </div>
          <div className="text-2xl font-bold text-text-high">
            £{summary.totalTarget.toLocaleString()}
          </div>
        </div>

        <div className="bg-bg-secondary rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 text-text-med text-sm mb-2">
            <PiggyBank size={16} />
            Total Saved
          </div>
          <div className="text-2xl font-bold text-financial-500">
            £{summary.totalSaved.toLocaleString()}
          </div>
        </div>

        <div className="bg-bg-secondary rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 text-text-med text-sm mb-2">
            <TrendingUp size={16} />
            Monthly Total
          </div>
          <div className="text-2xl font-bold text-text-high">
            £{summary.totalMonthly.toLocaleString()}
          </div>
        </div>

        <div className="bg-bg-secondary rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 text-text-med text-sm mb-2">
            <Sparkles size={16} />
            Overall Progress
          </div>
          <div className="text-2xl font-bold text-text-high">
            {Math.round(summary.overallProgress)}%
          </div>
          <div className="mt-2 h-2 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-financial-500 to-financial-400 transition-all duration-300"
              style={{ width: `${Math.min(summary.overallProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Funds Grid */}
      {sinkingFunds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sinkingFunds.map((fund) => {
            const { progress, monthsRemaining, suggestedMonthly } = getFundProgress(fund);
            const isComplete = progress >= 100;
            const isOnTrack = fund.monthlyContribution >= (suggestedMonthly || 0);

            return (
              <div
                key={fund.id}
                className={`
                  bg-bg-secondary rounded-xl border overflow-hidden
                  transition-all duration-200 hover:shadow-lg
                  ${isComplete ? 'border-financial-500/50' : 'border-border'}
                `}
              >
                {/* Header */}
                <div className={`p-4 bg-gradient-to-r ${fund.color} bg-opacity-10`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{fund.icon}</span>
                      <div>
                        <h3 className="font-semibold text-text-high">{fund.name}</h3>
                        <p className="text-sm text-text-med">
                          £{fund.monthlyContribution || 0}/month
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingFund(fund)}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Edit2 size={14} className="text-text-med" />
                      </button>
                      <button
                        onClick={() => handleDeleteFund(fund.id)}
                        className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-med">Progress</span>
                    <span className={`text-sm font-medium ${isComplete ? 'text-financial-500' : 'text-text-high'}`}>
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="h-3 bg-bg-tertiary rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full bg-gradient-to-r ${fund.color} transition-all duration-500`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-text-high font-semibold">
                      £{fund.currentAmount.toLocaleString()}
                    </span>
                    <span className="text-text-med">
                      of £{fund.targetAmount.toLocaleString()}
                    </span>
                  </div>

                  {/* Target Date Info */}
                  {fund.targetDate && (
                    <div className={`
                      flex items-center gap-2 p-2 rounded-lg text-xs mb-4
                      ${isComplete ? 'bg-financial-500/10 text-financial-500' :
                        isOnTrack ? 'bg-blue-500/10 text-blue-400' :
                        'bg-amber-500/10 text-amber-400'}
                    `}>
                      {isComplete ? (
                        <>
                          <Sparkles size={14} />
                          <span>Goal reached!</span>
                        </>
                      ) : monthsRemaining !== null ? (
                        <>
                          <Clock size={14} />
                          <span>
                            {monthsRemaining} months left
                            {suggestedMonthly && !isOnTrack && (
                              <> • Need £{suggestedMonthly}/mo</>
                            )}
                          </span>
                        </>
                      ) : (
                        <>
                          <Calendar size={14} />
                          <span>Target: {new Date(fund.targetDate).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTransactionModal({ fundId: fund.id, type: 'contribute' })}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-financial-500 hover:bg-financial-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <ArrowDownCircle size={16} />
                      Add
                    </button>
                    <button
                      onClick={() => setTransactionModal({ fundId: fund.id, type: 'withdraw' })}
                      disabled={fund.currentAmount <= 0}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-bg-tertiary hover:bg-border text-text-high text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowUpCircle size={16} />
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-bg-secondary border border-border rounded-xl p-12 text-center">
          <PiggyBank size={48} className="mx-auto mb-4 text-text-low" />
          <h3 className="text-xl font-semibold text-text-high mb-2">
            No Sinking Funds Yet
          </h3>
          <p className="text-text-med mb-6 max-w-md mx-auto">
            Sinking funds help you save gradually for irregular expenses like car maintenance,
            holidays, or annual subscriptions.
          </p>
          <Button
            variant="primary"
            leftIcon={<Plus size={18} />}
            onClick={() => setShowAddModal(true)}
          >
            Create Your First Fund
          </Button>
        </div>
      )}

      {/* Quick Start Suggestions */}
      {sinkingFunds.length === 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-high">Suggested Funds</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {FUND_PRESETS.slice(0, 6).map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  addSinkingFund({
                    name: preset.name,
                    icon: preset.icon,
                    color: preset.color,
                    targetAmount: 500,
                    monthlyContribution: 50,
                  });
                }}
                className="flex flex-col items-center gap-2 p-4 bg-bg-secondary border border-border rounded-xl hover:border-financial-500/50 transition-all"
              >
                <span className="text-2xl">{preset.icon}</span>
                <span className="text-sm text-text-med">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-financial-500/10 border border-financial-500/20 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-financial-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-text-high mb-1">Sinking Fund Tips</h4>
            <ul className="text-sm text-text-med space-y-1">
              <li>• Set target dates to calculate required monthly contributions</li>
              <li>• Automate transfers to your sinking funds on payday</li>
              <li>• Common funds: car repairs, holidays, annual subscriptions, gifts</li>
              <li>• Keep sinking funds separate from your emergency fund</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add/Edit Fund Modal */}
      {(showAddModal || editingFund) && (
        <AddFundModal
          fund={editingFund}
          onClose={() => {
            setShowAddModal(false);
            setEditingFund(null);
          }}
          onSave={(data) => {
            if (editingFund) {
              updateSinkingFund(editingFund.id, data);
            } else {
              addSinkingFund(data);
            }
            setShowAddModal(false);
            setEditingFund(null);
          }}
        />
      )}

      {/* Transaction Modal */}
      {transactionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1724] rounded-xl border border-white/10 w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-high">
                {transactionModal.type === 'contribute' ? 'Add to Fund' : 'Withdraw from Fund'}
              </h3>
              <button
                onClick={() => setTransactionModal(null)}
                className="p-1 hover:bg-bg-secondary rounded-lg"
              >
                <X size={20} className="text-text-med" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-text-med mb-2">Amount (£)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
                className="w-full px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-high focus:outline-none focus:border-financial-500"
                placeholder="0.00"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setTransactionModal(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleTransaction}
                disabled={!transactionAmount || parseFloat(transactionAmount) <= 0}
              >
                {transactionModal.type === 'contribute' ? 'Add' : 'Withdraw'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add/Edit Fund Modal Component
const AddFundModal = ({ fund, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: fund?.name || '',
    icon: fund?.icon || '💰',
    color: fund?.color || 'from-amber-500 to-yellow-500',
    targetAmount: fund?.targetAmount || '',
    currentAmount: fund?.currentAmount || 0,
    monthlyContribution: fund?.monthlyContribution || '',
    targetDate: fund?.targetDate || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount) return;

    onSave({
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      monthlyContribution: parseFloat(formData.monthlyContribution) || 0,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1724] rounded-xl border border-white/10 w-full max-w-lg overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            {fund ? 'Edit Fund' : 'Create Sinking Fund'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg">
            <X size={20} className="text-white/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Icon Selection */}
          <div>
            <label className="block text-sm text-text-med mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {FUND_PRESETS.map((preset) => (
                <button
                  key={preset.icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: preset.icon, color: preset.color })}
                  className={`
                    p-2 rounded-lg text-xl transition-all
                    ${formData.icon === preset.icon
                      ? 'bg-financial-500/20 border-financial-500'
                      : 'bg-bg-secondary border-border hover:border-financial-500/50'}
                    border
                  `}
                >
                  {preset.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm text-text-med mb-2">Fund Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-high focus:outline-none focus:border-financial-500"
              placeholder="e.g., Car Maintenance"
              required
            />
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-sm text-text-med mb-2">Target Amount (£) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
              className="w-full px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-high focus:outline-none focus:border-financial-500"
              placeholder="0.00"
              required
            />
          </div>

          {/* Current Amount (for editing) */}
          {fund && (
            <div>
              <label className="block text-sm text-text-med mb-2">Current Amount (£)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.currentAmount}
                onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                className="w-full px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-high focus:outline-none focus:border-financial-500"
                placeholder="0.00"
              />
            </div>
          )}

          {/* Monthly Contribution */}
          <div>
            <label className="block text-sm text-text-med mb-2">Monthly Contribution (£)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.monthlyContribution}
              onChange={(e) => setFormData({ ...formData, monthlyContribution: e.target.value })}
              className="w-full px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-high focus:outline-none focus:border-financial-500"
              placeholder="0.00"
            />
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm text-text-med mb-2">Target Date (Optional)</label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              className="w-full px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-high focus:outline-none focus:border-financial-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              {fund ? 'Save Changes' : 'Create Fund'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SinkingFundsTab;
