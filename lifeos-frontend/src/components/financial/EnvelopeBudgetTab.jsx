/**
 * EnvelopeBudgetTab - Visual envelope budgeting system
 * Shows budget allocations as virtual "envelopes" with spending progress
 */

import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Plus,
  Settings,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Sparkles,
  PiggyBank,
  Receipt,
  X,
} from 'lucide-react';
import { useFinancialStore, ENVELOPE_CATEGORIES, getMonthKey } from '../../stores/financialStore';
import Card from '../shared/Card';
import Button from '../shared/Button';

// Quick Expense Modal for logging expenses to a specific envelope
const QuickExpenseModal = ({ envelope, onClose, currency = '£' }) => {
  const { addTransaction } = useFinancialStore();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    addTransaction({
      description: description || envelope.name,
      amount: -Math.abs(parseFloat(amount)), // Negative for expense
      category: envelope.categoryId,
      type: 'expense',
      date: new Date(date).toISOString(),
      merchant: description || envelope.name,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a1724] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${envelope.bgColor} flex items-center justify-center text-xl`}>
              {envelope.icon}
            </div>
            <div>
              <h3 className="font-semibold text-white">Log Expense</h3>
              <p className="text-xs text-white/60">{envelope.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">{currency}</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#0c0a10] border border-white/10 rounded-lg pl-8 pr-4 py-3 text-white text-lg focus:border-purple-500 focus:outline-none"
                placeholder="0.00"
                step="0.01"
                min="0"
                autoFocus
              />
            </div>
            <p className="text-xs text-white/40 mt-1">
              Remaining: {currency}{envelope.remaining.toFixed(2)}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0c0a10] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              placeholder={`e.g., ${envelope.description}`}
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#0c0a10] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="flex-1"
              disabled={!amount || parseFloat(amount) <= 0}
            >
              Log Expense
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Envelope Card Component
const EnvelopeCard = ({ envelope, onEdit, onAddExpense, currency = '£' }) => {
  const { icon, name, allocated, spent, remaining, percentUsed, status, color, bgColor } = envelope;

  const statusColors = {
    healthy: 'border-green-500/30 bg-green-500/5',
    caution: 'border-blue-500/30 bg-blue-500/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    over: 'border-red-500/30 bg-red-500/5',
  };

  const progressColors = {
    healthy: 'from-green-500 to-emerald-500',
    caution: 'from-blue-500 to-cyan-500',
    warning: 'from-yellow-500 to-amber-500',
    over: 'from-red-500 to-rose-500',
  };

  const statusIcons = {
    healthy: <CheckCircle2 className="w-4 h-4 text-green-400" />,
    caution: <TrendingUp className="w-4 h-4 text-blue-400" />,
    warning: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
    over: <TrendingDown className="w-4 h-4 text-red-400" />,
  };

  return (
    <div
      className={`relative rounded-xl border p-4 transition-all hover:scale-[1.02] ${statusColors[status]}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center text-xl`}>
            {icon}
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm">{name}</h4>
            <p className="text-xs text-white/50">
              {currency}{spent.toFixed(0)} of {currency}{allocated.toFixed(0)}
            </p>
          </div>
        </div>
        {statusIcons[status]}
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-2">
        <div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${progressColors[status]} transition-all duration-500 rounded-full`}
          style={{ width: `${Math.min(percentUsed, 100)}%` }}
        />
        {percentUsed > 100 && (
          <div
            className="absolute inset-y-0 right-0 bg-red-500/50 animate-pulse rounded-full"
            style={{ width: `${Math.min(percentUsed - 100, 100)}%` }}
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs mb-3">
        <span className={`font-medium ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {remaining >= 0 ? `${currency}${remaining.toFixed(0)} left` : `${currency}${Math.abs(remaining).toFixed(0)} over`}
        </span>
        <span className="text-white/40">{percentUsed}%</span>
      </div>

      {/* Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddExpense?.(envelope);
        }}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-medium transition-all"
      >
        <Receipt className="w-3.5 h-3.5" />
        Log Expense
      </button>
    </div>
  );
};

// Setup Modal for allocating budgets
const SetupEnvelopesModal = ({ onClose, monthKey }) => {
  const {
    monthlyIncomeTarget,
    setMonthlyIncomeTarget,
    envelopeBudgets,
    setEnvelopeBudget,
    getPreviousMonthWithEnvelopes,
    copyEnvelopesFromMonth,
  } = useFinancialStore();

  const [incomeTarget, setIncomeTarget] = useState(monthlyIncomeTarget);
  const [allocations, setAllocations] = useState(envelopeBudgets[monthKey] || {});

  const totalAllocated = Object.values(allocations).reduce((sum, amt) => sum + (parseFloat(amt) || 0), 0);
  const remaining = incomeTarget - totalAllocated;

  const handleSave = () => {
    setMonthlyIncomeTarget(parseFloat(incomeTarget) || 0);
    Object.entries(allocations).forEach(([categoryId, amount]) => {
      setEnvelopeBudget(categoryId, parseFloat(amount) || 0, monthKey);
    });
    onClose();
  };

  const handleCopyFromPrevious = () => {
    const prevMonth = getPreviousMonthWithEnvelopes();
    if (prevMonth) {
      copyEnvelopesFromMonth(prevMonth, monthKey);
      setAllocations(envelopeBudgets[prevMonth] || {});
    }
  };

  const categoryTypes = [
    { key: 'fixed', label: 'Fixed Expenses', color: 'text-slate-400' },
    { key: 'variable', label: 'Variable Needs', color: 'text-cyan-400' },
    { key: 'wants', label: 'Wants', color: 'text-pink-400' },
    { key: 'growth', label: 'Growth', color: 'text-indigo-400' },
    { key: 'savings', label: 'Savings & Investments', color: 'text-emerald-400' },
    { key: 'other', label: 'Other', color: 'text-gray-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a1724] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Set Up Budget Envelopes</h2>
          <p className="text-sm text-white/60 mt-1">
            Allocate your income to different spending categories
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {/* Income Target */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Monthly Income Target
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">£</span>
              <input
                type="number"
                value={incomeTarget}
                onChange={(e) => setIncomeTarget(e.target.value)}
                className="w-full bg-[#0c0a10] border border-white/10 rounded-lg px-8 py-3 text-white focus:border-purple-500 focus:outline-none"
                placeholder="3000"
              />
            </div>
          </div>

          {/* Copy from Previous */}
          {getPreviousMonthWithEnvelopes() && (
            <button
              onClick={handleCopyFromPrevious}
              className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300"
            >
              <Copy className="w-4 h-4" />
              Copy from previous month
            </button>
          )}

          {/* Category Allocations */}
          {categoryTypes.map(({ key, label, color }) => {
            const categories = Object.values(ENVELOPE_CATEGORIES).filter(c => c.type === key);
            if (categories.length === 0) return null;

            return (
              <div key={key}>
                <h3 className={`text-sm font-semibold ${color} mb-3`}>{label}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center gap-3">
                      <span className="text-xl">{category.icon}</span>
                      <div className="flex-1">
                        <label className="block text-xs text-white/60 mb-1">{category.name}</label>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white/40 text-sm">£</span>
                          <input
                            type="number"
                            value={allocations[category.id] || ''}
                            onChange={(e) => setAllocations(prev => ({
                              ...prev,
                              [category.id]: e.target.value
                            }))}
                            className="w-full bg-[#0c0a10] border border-white/10 rounded-lg pl-6 pr-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-[#0c0a10]/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-white/60">Total Allocated</p>
              <p className="text-xl font-bold text-white">£{totalAllocated.toFixed(0)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/60">Remaining</p>
              <p className={`text-xl font-bold ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                £{remaining.toFixed(0)}
              </p>
            </div>
          </div>

          {Math.abs(remaining) < 1 && (
            <div className="flex items-center gap-2 text-green-400 text-sm mb-4">
              <CheckCircle2 className="w-4 h-4" />
              Zero-based budget achieved!
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} className="flex-1">
              Save Budget
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function EnvelopeBudgetTab() {
  const [showSetup, setShowSetup] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey());
  const [expenseEnvelope, setExpenseEnvelope] = useState(null); // For quick expense modal

  const {
    getEnvelopeStatus,
    getEnvelopeSummary,
    hasEnvelopesForMonth,
    monthlyIncomeTarget,
  } = useFinancialStore();

  const envelopes = getEnvelopeStatus(selectedMonth);
  const summary = getEnvelopeSummary(selectedMonth);
  const hasEnvelopes = hasEnvelopesForMonth(selectedMonth);

  // Group envelopes by type
  const groupedEnvelopes = useMemo(() => {
    const groups = {
      fixed: { label: 'Fixed Expenses', icon: '🏠', envelopes: [] },
      variable: { label: 'Variable Needs', icon: '🛒', envelopes: [] },
      wants: { label: 'Wants', icon: '🎮', envelopes: [] },
      growth: { label: 'Growth', icon: '📚', envelopes: [] },
      savings: { label: 'Savings & Investments', icon: '💰', envelopes: [] },
      other: { label: 'Other', icon: '📦', envelopes: [] },
    };

    Object.values(envelopes).forEach((env) => {
      if (env.allocated > 0 || env.spent > 0) {
        const type = env.type || 'other';
        if (groups[type]) {
          groups[type].envelopes.push(env);
        }
      }
    });

    return groups;
  }, [envelopes]);

  // Get month display name
  const monthDisplay = new Date(selectedMonth + '-01').toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  if (!hasEnvelopes) {
    return (
      <div className="space-y-6">
        {/* Empty State */}
        <Card className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Set Up Your Budget</h3>
          <p className="text-white/60 max-w-md mx-auto mb-6">
            Create envelope budgets to track spending by category.
            Allocate every pound of income to give each dollar a job.
          </p>
          <Button
            variant="primary"
            leftIcon={<Plus size={18} />}
            onClick={() => setShowSetup(true)}
          >
            Create Budget for {monthDisplay}
          </Button>
        </Card>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <h4 className="font-semibold text-white mb-1">Zero-Based Budgeting</h4>
            <p className="text-sm text-white/60">
              Every pound has a purpose. Income minus expenses equals zero.
            </p>
          </Card>

          <Card className="p-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
              <Wallet className="w-5 h-5 text-purple-400" />
            </div>
            <h4 className="font-semibold text-white mb-1">Visual Envelopes</h4>
            <p className="text-sm text-white/60">
              See at a glance how much is left in each spending category.
            </p>
          </Card>

          <Card className="p-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-3">
              <PiggyBank className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="font-semibold text-white mb-1">Stay on Track</h4>
            <p className="text-sm text-white/60">
              Color-coded status shows which envelopes need attention.
            </p>
          </Card>
        </div>

        {showSetup && (
          <SetupEnvelopesModal
            onClose={() => setShowSetup(false)}
            monthKey={selectedMonth}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-white/60 mb-1">Income Target</p>
          <p className="text-2xl font-bold text-white">£{summary.monthlyIncomeTarget.toLocaleString()}</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-white/60 mb-1">Allocated</p>
          <p className="text-2xl font-bold text-purple-400">£{summary.totalAllocated.toLocaleString()}</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-white/60 mb-1">Spent</p>
          <p className="text-2xl font-bold text-orange-400">£{summary.totalExpenses.toLocaleString()}</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-white/60 mb-1">
            {summary.unallocated >= 0 ? 'Unallocated' : 'Over-allocated'}
          </p>
          <p className={`text-2xl font-bold ${summary.unallocated >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            £{Math.abs(summary.unallocated).toLocaleString()}
          </p>
          {summary.isZeroBased && (
            <div className="flex items-center gap-1 mt-1">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-yellow-400">Zero-based!</span>
            </div>
          )}
        </Card>
      </div>

      {/* Edit Budget Button */}
      <div className="flex justify-end">
        <Button
          variant="secondary"
          leftIcon={<Settings size={16} />}
          onClick={() => setShowSetup(true)}
        >
          Edit Budget
        </Button>
      </div>

      {/* Envelope Groups */}
      {Object.entries(groupedEnvelopes).map(([type, group]) => {
        if (group.envelopes.length === 0) return null;

        return (
          <div key={type}>
            <h3 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
              <span>{group.icon}</span>
              {group.label}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.envelopes.map((envelope) => (
                <EnvelopeCard
                  key={envelope.categoryId}
                  envelope={envelope}
                  onEdit={() => setShowSetup(true)}
                  onAddExpense={(env) => setExpenseEnvelope(env)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Savings Rate - only show when we have both income AND expenses */}
      {summary.totalIncome > 0 && summary.totalExpenses > 0 && (
        <Card className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">Savings Rate</p>
                <p className="text-2xl font-bold text-green-400">{summary.savingsRate}%</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/60">Net This Month</p>
              <p className={`text-xl font-bold ${summary.netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {summary.netIncome >= 0 ? '+' : ''}£{summary.netIncome.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      )}

      {showSetup && (
        <SetupEnvelopesModal
          onClose={() => setShowSetup(false)}
          monthKey={selectedMonth}
        />
      )}

      {expenseEnvelope && (
        <QuickExpenseModal
          envelope={expenseEnvelope}
          onClose={() => setExpenseEnvelope(null)}
        />
      )}
    </div>
  );
}
