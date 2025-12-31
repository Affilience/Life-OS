import React, { useState, useMemo } from 'react';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  PieChart,
  DollarSign,
  Edit2,
  Trash2,
  ChevronLeft,
  X,
  Settings,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { useFinancialStore, ENVELOPE_CATEGORIES, getMonthKey } from '../../stores/financialStore';
import AddExpenseModal from './AddExpenseModal';
import AddIncomeModal from './AddIncomeModal';

/**
 * UnifiedBudgetTab - All-in-one budget management
 *
 * Features:
 * - Summary stats (income, expenses, savings, net)
 * - Budget vs Actual bar chart
 * - Category spending breakdown (pie chart)
 * - Income/Expense trend over time
 * - Quick transaction list
 * - Add income/expense modals
 * - Create/edit budget modal
 */

const COLORS = [
  '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#6366f1', '#84cc16', '#f97316', '#14b8a6'
];

export default function UnifiedBudgetTab() {
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey());
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showCreateBudget, setShowCreateBudget] = useState(false);

  const {
    transactions,
    getEnvelopeStatus,
    getEnvelopeSummary,
    envelopeBudgets,
    setEnvelopeBudget,
    setMonthlyEnvelopes,
    monthlyIncomeTarget,
    setMonthlyIncomeTarget,
    deleteTransaction,
    copyEnvelopesFromMonth,
    getPreviousMonthWithEnvelopes,
  } = useFinancialStore();

  // Get data for selected month
  const monthBudgets = envelopeBudgets[selectedMonth] || {};
  const envelopeStatus = getEnvelopeStatus(selectedMonth);
  const summary = getEnvelopeSummary(selectedMonth);

  // Filter transactions for selected month
  const monthTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const txnMonth = getMonthKey(new Date(t.date));
        return txnMonth === selectedMonth;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, selectedMonth]);

  // Calculate totals
  const totalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Budget vs Actual data for bar chart
  const budgetVsActualData = useMemo(() => {
    const data = [];
    Object.entries(ENVELOPE_CATEGORIES).forEach(([id, category]) => {
      const budgeted = monthBudgets[id] || 0;
      const status = envelopeStatus[id];
      const spent = status?.spent || 0;

      if (budgeted > 0 || spent > 0) {
        data.push({
          name: category.name.length > 10 ? category.name.substring(0, 10) + '...' : category.name,
          fullName: category.name,
          budgeted,
          spent,
          remaining: Math.max(0, budgeted - spent),
          overspent: spent > budgeted ? spent - budgeted : 0,
          icon: category.icon,
        });
      }
    });
    return data.sort((a, b) => b.budgeted - a.budgeted).slice(0, 8);
  }, [monthBudgets, envelopeStatus]);

  // Category breakdown for pie chart
  const categoryBreakdown = useMemo(() => {
    const spending = {};
    monthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = ENVELOPE_CATEGORIES[t.category] || { name: 'Other', icon: '📦' };
        if (!spending[t.category]) {
          spending[t.category] = { name: cat.name, icon: cat.icon, value: 0 };
        }
        spending[t.category].value += Math.abs(t.amount);
      });

    return Object.entries(spending)
      .map(([id, data], index) => ({
        id,
        ...data,
        color: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [monthTransactions]);

  // Monthly trend data (last 6 months)
  const monthlyTrend = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = getMonthKey(date);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });

      const monthTxns = transactions.filter(t => getMonthKey(new Date(t.date)) === monthKey);
      const income = monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expenses = monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);

      months.push({
        month: monthName,
        income,
        expenses,
        net: income - expenses,
      });
    }
    return months;
  }, [transactions]);

  // Navigate months
  const navigateMonth = (direction) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + direction);
    setSelectedMonth(getMonthKey(date));
  };

  // Format month for display
  const formatMonth = (monthKey) => {
    const [year, month] = monthKey.split('-');
    return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Quick budget edit
  const [editingBudget, setEditingBudget] = useState(null);
  const [editBudgetValue, setEditBudgetValue] = useState('');

  const handleSetBudget = (categoryId) => {
    const value = parseFloat(editBudgetValue) || 0;
    setEnvelopeBudget(categoryId, value, selectedMonth);
    setEditingBudget(null);
    setEditBudgetValue('');
  };

  // Total budgeted
  const totalBudgeted = Object.values(monthBudgets).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-6">
      {/* Month Navigation & Summary Cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Month Selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-white">{formatMonth(selectedMonth)}</span>
          </div>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowCreateBudget(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 font-medium transition-colors"
            data-tour="create-budget-btn"
          >
            <Settings className="w-4 h-4" />
            Set Budgets
          </button>
          <button
            onClick={() => setShowAddIncome(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-emerald-400 font-medium transition-colors"
            data-tour="add-income-btn"
          >
            <ArrowUpRight className="w-4 h-4" />
            Add Income
          </button>
          <button
            onClick={() => setShowAddExpense(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 font-medium transition-colors"
            data-tour="add-expense-btn"
          >
            <ArrowDownRight className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-tour="financial-summary">
        {/* Income */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-sm text-slate-400">Income</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">£{totalIncome.toLocaleString()}</div>
        </div>

        {/* Expenses */}
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-sm text-slate-400">Expenses</span>
          </div>
          <div className="text-2xl font-bold text-red-400">£{totalExpenses.toLocaleString()}</div>
        </div>

        {/* Net Savings */}
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <PiggyBank className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-sm text-slate-400">Net Savings</span>
          </div>
          <div className={`text-2xl font-bold ${netSavings >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
            {netSavings >= 0 ? '+' : ''}£{netSavings.toLocaleString()}
          </div>
        </div>

        {/* Savings Rate */}
        <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Wallet className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-sm text-slate-400">Savings Rate</span>
          </div>
          <div className={`text-2xl font-bold ${savingsRate >= 20 ? 'text-cyan-400' : 'text-amber-400'}`}>
            {savingsRate}%
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-tour="financial-charts">
        {/* Budget vs Actual Bar Chart */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Budget vs Actual
            </h3>
          </div>
          {budgetVsActualData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={budgetVsActualData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={(v) => `£${v}`} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  width={80}
                  tick={{ fill: '#94a3b8' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value, name) => [`£${value.toLocaleString()}`, name === 'budgeted' ? 'Budget' : 'Spent']}
                />
                <Bar dataKey="budgeted" fill="#6366f1" name="Budget" radius={[0, 4, 4, 0]} />
                <Bar dataKey="spent" fill="#ec4899" name="Spent" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex flex-col items-center justify-center text-slate-500">
              <BarChart3 className="w-12 h-12 mb-3 opacity-50" />
              <p>No budget data yet</p>
              <button
                onClick={() => setShowCreateBudget(true)}
                className="mt-3 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 text-sm font-medium transition-colors"
              >
                Create Budget
              </button>
            </div>
          )}
        </div>

        {/* Spending Breakdown Pie Chart */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-pink-400" />
              Spending Breakdown
            </h3>
          </div>
          {categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <RechartsPie>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  paddingAngle={2}
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value) => `£${value.toLocaleString()}`}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-slate-300 text-xs">{value}</span>
                  )}
                />
              </RechartsPie>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex flex-col items-center justify-center text-slate-500">
              <PieChart className="w-12 h-12 mb-3 opacity-50" />
              <p>No expenses this month</p>
              <p className="text-sm">Add expenses to see breakdown</p>
            </div>
          )}
        </div>
      </div>

      {/* Income vs Expenses Trend */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          6-Month Trend
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={monthlyTrend} margin={{ left: 10, right: 10 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `£${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value) => `£${value.toLocaleString()}`}
            />
            <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incomeGradient)" strokeWidth={2} name="Income" />
            <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#expenseGradient)" strokeWidth={2} name="Expenses" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category Budgets Grid */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5" data-tour="budget-categories">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-purple-400" />
            Category Budgets
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">
              Total: £{totalBudgeted.toLocaleString()}
            </span>
            <button
              onClick={() => setShowCreateBudget(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 text-sm font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(ENVELOPE_CATEGORIES)
            .map(([id, category]) => {
              const status = envelopeStatus[id];
              const budgeted = monthBudgets[id] || 0;
              const spent = status?.spent || 0;
              const percentUsed = budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0;
              const remaining = budgeted - spent;

              let statusColor = 'emerald';
              if (percentUsed >= 100) statusColor = 'red';
              else if (percentUsed >= 80) statusColor = 'amber';
              else if (percentUsed >= 50) statusColor = 'cyan';

              return (
                <div
                  key={id}
                  className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 hover:border-slate-600/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-sm font-medium text-white truncate">{category.name}</span>
                  </div>

                  {editingBudget === id ? (
                    <div className="flex gap-1">
                      <input
                        type="number"
                        value={editBudgetValue}
                        onChange={(e) => setEditBudgetValue(e.target.value)}
                        className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-sm text-white"
                        placeholder="0"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSetBudget(id)}
                      />
                      <button
                        onClick={() => handleSetBudget(id)}
                        className="px-2 py-1 bg-purple-500 rounded text-xs text-white"
                      >
                        Set
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400">£{spent.toFixed(0)} / £{budgeted.toFixed(0)}</span>
                        <button
                          onClick={() => {
                            setEditingBudget(id);
                            setEditBudgetValue(budgeted.toString());
                          }}
                          className="text-slate-500 hover:text-purple-400"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${Math.min(percentUsed, 100)}%`,
                            backgroundColor: percentUsed >= 100 ? '#ef4444' : percentUsed >= 80 ? '#f59e0b' : percentUsed >= 50 ? '#06b6d4' : '#10b981'
                          }}
                        />
                      </div>
                      {budgeted > 0 && (
                        <div className={`text-xs mt-1 ${remaining >= 0 ? 'text-slate-400' : 'text-red-400'}`}>
                          {remaining >= 0 ? `£${remaining.toFixed(0)} left` : `£${Math.abs(remaining).toFixed(0)} over`}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Recent Transactions
          </h3>
          <span className="text-sm text-slate-400">
            {monthTransactions.length} transactions
          </span>
        </div>

        {monthTransactions.length > 0 ? (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {monthTransactions.slice(0, 20).map((txn) => {
              const category = ENVELOPE_CATEGORIES[txn.category] || { name: 'Other', icon: '📦' };
              const isIncome = txn.type === 'income';

              return (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/80 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                      isIncome ? 'bg-emerald-500/20' : 'bg-slate-700/50'
                    }`}>
                      {isIncome ? '💰' : category.icon}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{txn.description}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(txn.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        {' · '}
                        {isIncome ? 'Income' : category.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isIncome ? '+' : '-'}£{Math.abs(txn.amount).toFixed(2)}
                    </span>
                    <button
                      onClick={() => deleteTransaction(txn.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No transactions this month</p>
            <p className="text-sm">Add income or expenses to get started</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddExpense && <AddExpenseModal onClose={() => setShowAddExpense(false)} />}
      {showAddIncome && <AddIncomeModal onClose={() => setShowAddIncome(false)} />}

      {/* Create Budget Modal */}
      {showCreateBudget && (
        <CreateBudgetModal
          selectedMonth={selectedMonth}
          monthBudgets={monthBudgets}
          onClose={() => setShowCreateBudget(false)}
          onSave={(budgets) => {
            setMonthlyEnvelopes(budgets, selectedMonth);
            setShowCreateBudget(false);
          }}
          onCopyFromPrevious={() => {
            const prevMonth = getPreviousMonthWithEnvelopes();
            if (prevMonth) {
              copyEnvelopesFromMonth(prevMonth, selectedMonth);
            }
          }}
        />
      )}
    </div>
  );
}

// Create Budget Modal Component
function CreateBudgetModal({ selectedMonth, monthBudgets, onClose, onSave, onCopyFromPrevious }) {
  const [budgets, setBudgets] = useState({ ...monthBudgets });

  const handleBudgetChange = (categoryId, value) => {
    setBudgets(prev => ({
      ...prev,
      [categoryId]: parseFloat(value) || 0,
    }));
  };

  const totalBudgeted = Object.values(budgets).reduce((sum, v) => sum + (v || 0), 0);

  // Group categories by type - now includes savings/investments
  const categoryGroups = {
    fixed: { label: 'Fixed Expenses', categories: [] },
    variable: { label: 'Variable Expenses', categories: [] },
    wants: { label: 'Wants & Lifestyle', categories: [] },
    growth: { label: 'Growth & Learning', categories: [] },
    savings: { label: 'Savings & Investments', categories: [] },
    other: { label: 'Other', categories: [] },
  };

  Object.entries(ENVELOPE_CATEGORIES).forEach(([id, cat]) => {
    const type = cat.type || 'other';
    if (categoryGroups[type]) {
      categoryGroups[type].categories.push({ id, ...cat });
    }
  });

  // Format month for display
  const formatMonth = (monthKey) => {
    const [year, month] = monthKey.split('-');
    return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#12101a] border border-slate-700 rounded-t-2xl sm:rounded-2xl max-w-2xl w-full max-h-[85vh] sm:max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50 bg-gradient-to-r from-purple-500/10 to-pink-500/5">
          <div>
            <h3 className="text-xl font-bold text-white">Set Monthly Budget</h3>
            <p className="text-sm text-slate-400">{formatMonth(selectedMonth)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Bar */}
        <div className="px-5 py-3 bg-slate-900/50 border-b border-slate-700/50 flex items-center justify-between">
          <div>
            <span className="text-sm text-slate-400">Total Budgeted: </span>
            <span className="text-lg font-bold text-purple-400">£{totalBudgeted.toLocaleString()}</span>
          </div>
          <button
            onClick={() => {
              onCopyFromPrevious();
              onClose();
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
          >
            Copy from last month
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {Object.entries(categoryGroups).map(([type, group]) => {
            if (group.categories.length === 0) return null;

            const groupTotal = group.categories.reduce((sum, cat) => sum + (budgets[cat.id] || 0), 0);

            return (
              <div key={type}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">{group.label}</h4>
                  <span className="text-sm text-slate-500">£{groupTotal.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {group.categories.map((cat) => (
                    <div key={cat.id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{cat.icon}</span>
                        <span className="text-sm font-medium text-white truncate">{cat.name}</span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">£</span>
                        <input
                          type="number"
                          value={budgets[cat.id] || ''}
                          onChange={(e) => handleBudgetChange(cat.id, e.target.value)}
                          placeholder="0"
                          className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 pb-safe border-t border-slate-700/50 bg-slate-900/30">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(budgets)}
            className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-semibold transition-all"
          >
            Save Budget
          </button>
        </div>
      </div>
    </div>
  );
}
