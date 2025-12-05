/**
 * Financial Store - Zustand state management for financial tracking
 * Manages transactions, budgets, savings goals, accounts, and envelope budgeting
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  SAMPLE_TRANSACTIONS,
  SAMPLE_BUDGETS,
  SAMPLE_SAVINGS_GOALS,
  SAMPLE_ACCOUNTS,
  CATEGORIES,
} from '../data/financialData';

// ============================================================
// ENVELOPE BUDGET CATEGORIES
// ============================================================
export const ENVELOPE_CATEGORIES = {
  // Fixed Expenses (Needs)
  housing: {
    id: 'housing',
    name: 'Housing',
    type: 'fixed',
    icon: '🏠',
    color: 'from-slate-500 to-slate-600',
    bgColor: 'bg-slate-500/10',
    description: 'Rent, mortgage, property taxes',
  },
  utilities: {
    id: 'utilities',
    name: 'Utilities',
    type: 'fixed',
    icon: '💡',
    color: 'from-yellow-500 to-amber-500',
    bgColor: 'bg-yellow-500/10',
    description: 'Electric, gas, water, internet',
  },
  insurance: {
    id: 'insurance',
    name: 'Insurance',
    type: 'fixed',
    icon: '🛡️',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10',
    description: 'Health, car, life insurance',
  },
  subscriptions: {
    id: 'subscriptions',
    name: 'Subscriptions',
    type: 'fixed',
    icon: '📱',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500/10',
    description: 'Streaming, software, memberships',
  },

  // Variable Expenses (Needs)
  food: {
    id: 'food',
    name: 'Food & Groceries',
    type: 'variable',
    icon: '🛒',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    description: 'Groceries and household essentials',
  },
  transportation: {
    id: 'transportation',
    name: 'Transport',
    type: 'variable',
    icon: '🚗',
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-500/10',
    description: 'Fuel, public transport, parking',
  },
  health: {
    id: 'health',
    name: 'Health & Fitness',
    type: 'variable',
    icon: '💪',
    color: 'from-red-500 to-rose-500',
    bgColor: 'bg-red-500/10',
    description: 'Gym, medical, pharmacy',
  },

  // Wants
  dining: {
    id: 'dining',
    name: 'Dining Out',
    type: 'wants',
    icon: '🍽️',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-500/10',
    description: 'Restaurants, takeaway, coffee',
  },
  entertainment: {
    id: 'entertainment',
    name: 'Entertainment',
    type: 'wants',
    icon: '🎮',
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-500/10',
    description: 'Games, movies, events',
  },
  shopping: {
    id: 'shopping',
    name: 'Shopping',
    type: 'wants',
    icon: '🛍️',
    color: 'from-violet-500 to-violet-600',
    bgColor: 'bg-violet-500/10',
    description: 'Clothes, electronics, personal items',
  },
  personal: {
    id: 'personal',
    name: 'Personal Care',
    type: 'wants',
    icon: '✨',
    color: 'from-fuchsia-500 to-fuchsia-600',
    bgColor: 'bg-fuchsia-500/10',
    description: 'Haircuts, skincare, grooming',
  },

  // Growth & Learning
  education: {
    id: 'education',
    name: 'Learning',
    type: 'growth',
    icon: '📚',
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-500/10',
    description: 'Courses, books, education',
  },

  // Wants
  travel: {
    id: 'travel',
    name: 'Travel',
    type: 'wants',
    icon: '✈️',
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-500/10',
    description: 'Trips, holidays, adventures',
  },

  // Savings & Investments
  savings: {
    id: 'savings',
    name: 'Savings',
    type: 'savings',
    icon: '💰',
    color: 'from-emerald-500 to-green-500',
    bgColor: 'bg-emerald-500/10',
    description: 'General savings, building wealth',
  },
  emergency_fund: {
    id: 'emergency_fund',
    name: 'Emergency Fund',
    type: 'savings',
    icon: '🛟',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    description: 'Rainy day fund, 3-6 months expenses',
  },
  investments: {
    id: 'investments',
    name: 'Investments',
    type: 'savings',
    icon: '📈',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    description: 'Stocks, ETFs, crypto, retirement',
  },
  travel_fund: {
    id: 'travel_fund',
    name: 'Travel Fund',
    type: 'savings',
    icon: '🏝️',
    color: 'from-cyan-500 to-teal-500',
    bgColor: 'bg-cyan-500/10',
    description: 'Saving for trips and holidays',
  },
  big_purchases: {
    id: 'big_purchases',
    name: 'Big Purchases',
    type: 'savings',
    icon: '🎯',
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-purple-500/10',
    description: 'Car, laptop, furniture, etc.',
  },

  // Other
  gifts: {
    id: 'gifts',
    name: 'Gifts',
    type: 'other',
    icon: '🎁',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10',
    description: 'Birthday, holiday, and other gifts',
  },
  other: {
    id: 'other',
    name: 'Other',
    type: 'other',
    icon: '📦',
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-gray-500/10',
    description: 'Miscellaneous expenses',
  },
};

// Helper to get month key
const getMonthKey = (date = new Date()) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

// Helper to get week key (for weekly contribution streaks)
const getWeekKey = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Start of week (Sunday)
  return d.toISOString().split('T')[0];
};

// Calculate contribution streak (consecutive weeks with at least one contribution)
const calculateContributionStreak = (contributions, newContribution) => {
  if (!contributions || contributions.length === 0) return 1;

  const allContributions = [...contributions, newContribution].filter(c => c.amount > 0);
  if (allContributions.length === 0) return 0;

  // Get unique weeks with contributions
  const weeksWithContributions = new Set(
    allContributions.map(c => getWeekKey(new Date(c.date)))
  );

  // Count consecutive weeks from current week backwards
  let streak = 0;
  const today = new Date();
  let checkDate = new Date(today);

  while (true) {
    const weekKey = getWeekKey(checkDate);
    if (weeksWithContributions.has(weekKey)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 7);
    } else {
      break;
    }
  }

  return streak;
};

export const useFinancialStore = create(
  persist(
    (set, get) => ({
      // State
      transactions: SAMPLE_TRANSACTIONS,
      budgets: SAMPLE_BUDGETS,
      savingsGoals: SAMPLE_SAVINGS_GOALS,
      accounts: SAMPLE_ACCOUNTS,
      selectedPeriod: 'month', // 'week' | 'month' | 'year' | 'all'
      selectedAccount: 'all',
      selectedCategory: 'all',

      // Envelope budgeting state
      envelopeBudgets: {}, // { '2025-01': { food: 300, transport: 100, ... } }
      monthlyIncomeTarget: 3000, // Expected monthly income for zero-based budgeting
      envelopeSettings: {}, // { categoryId: { rollover: true, ... } }
      sinkingFunds: [], // For irregular expenses

      // Transaction CRUD
      addTransaction: (transaction) => {
        const newTransaction = {
          id: `txn-${Date.now()}`,
          date: new Date().toISOString(),
          ...transaction,
        };
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((txn) =>
            txn.id === id ? { ...txn, ...updates } : txn
          ),
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((txn) => txn.id !== id),
        }));
      },

      // Budget CRUD
      addBudget: (budget) => {
        const newBudget = {
          id: `budget-${Date.now()}`,
          spent: 0,
          period: 'monthly',
          ...budget,
        };
        set((state) => ({
          budgets: [...state.budgets, newBudget],
        }));
      },

      updateBudget: (id, updates) => {
        set((state) => ({
          budgets: state.budgets.map((budget) =>
            budget.id === id ? { ...budget, ...updates } : budget
          ),
        }));
      },

      deleteBudget: (id) => {
        set((state) => ({
          budgets: state.budgets.filter((budget) => budget.id !== id),
        }));
      },

      // Savings Goal CRUD
      addSavingsGoal: (goal) => {
        const newGoal = {
          id: `goal-${Date.now()}`,
          current: 0,
          ...goal,
        };
        set((state) => ({
          savingsGoals: [...state.savingsGoals, newGoal],
        }));
      },

      updateSavingsGoal: (id, updates) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.map((goal) =>
            goal.id === id ? { ...goal, ...updates } : goal
          ),
        }));
      },

      deleteSavingsGoal: (id) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.filter((goal) => goal.id !== id),
        }));
      },

      contributeSavingsGoal: (id, amount, note = '') => {
        const contribution = {
          id: `contrib-${Date.now()}`,
          amount,
          date: new Date().toISOString(),
          note,
        };

        set((state) => {
          const goal = state.savingsGoals.find(g => g.id === id);
          if (!goal) return state;

          const newCurrent = goal.current + amount;
          const oldPercent = (goal.current / goal.target) * 100;
          const newPercent = (newCurrent / goal.target) * 100;

          // Check for milestone crossings (25%, 50%, 75%, 100%)
          const milestones = [25, 50, 75, 100];
          const crossedMilestones = milestones.filter(m => oldPercent < m && newPercent >= m);

          // Update milestones reached
          const existingMilestones = goal.milestonesReached || [];
          const newMilestonesReached = [
            ...existingMilestones,
            ...crossedMilestones.map(m => ({
              percent: m,
              reachedAt: new Date().toISOString(),
              celebrated: false,
            }))
          ];

          return {
            savingsGoals: state.savingsGoals.map((g) =>
              g.id === id
                ? {
                    ...g,
                    current: newCurrent,
                    contributions: [...(g.contributions || []), contribution],
                    milestonesReached: newMilestonesReached,
                    lastContributionDate: new Date().toISOString(),
                    contributionStreak: calculateContributionStreak(g.contributions || [], contribution),
                  }
                : g
            ),
          };
        });

        // Return milestone info for celebration
        const goal = get().savingsGoals.find(g => g.id === id);
        const oldPercent = ((goal?.current || 0) - amount) / (goal?.target || 1) * 100;
        const newPercent = (goal?.current || 0) / (goal?.target || 1) * 100;
        const milestones = [25, 50, 75, 100];
        const crossedMilestones = milestones.filter(m => oldPercent < m && newPercent >= m);

        return { crossedMilestones, newPercent, goal };
      },

      // Mark milestone as celebrated (so we don't show it again)
      celebrateMilestone: (goalId, milestonePercent) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.map((goal) =>
            goal.id === goalId
              ? {
                  ...goal,
                  milestonesReached: (goal.milestonesReached || []).map(m =>
                    m.percent === milestonePercent ? { ...m, celebrated: true } : m
                  )
                }
              : goal
          ),
        }));
      },

      // Withdraw from goal (e.g., if user needs money back)
      withdrawFromGoal: (id, amount, reason = '') => {
        const withdrawal = {
          id: `withdraw-${Date.now()}`,
          amount: -amount,
          date: new Date().toISOString(),
          note: reason,
          isWithdrawal: true,
        };

        set((state) => ({
          savingsGoals: state.savingsGoals.map((goal) =>
            goal.id === id
              ? {
                  ...goal,
                  current: Math.max(0, goal.current - amount),
                  contributions: [...(goal.contributions || []), withdrawal],
                }
              : goal
          ),
        }));
      },

      // Account CRUD
      addAccount: (account) => {
        const newAccount = {
          id: `acc-${Date.now()}`,
          lastUpdated: new Date().toISOString().split('T')[0],
          ...account,
        };
        set((state) => ({
          accounts: [...state.accounts, newAccount],
        }));
      },

      updateAccount: (id, updates) => {
        set((state) => ({
          accounts: state.accounts.map((acc) =>
            acc.id === id ? { ...acc, ...updates } : acc
          ),
        }));
      },

      deleteAccount: (id) => {
        set((state) => ({
          accounts: state.accounts.filter((acc) => acc.id !== id),
        }));
      },

      // Filters
      setSelectedPeriod: (period) => set({ selectedPeriod: period }),
      setSelectedAccount: (account) => set({ selectedAccount: account }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),

      // Calculations
      getFilteredTransactions: () => {
        const { transactions, selectedPeriod, selectedAccount, selectedCategory } = get();
        let filtered = [...transactions];

        // Filter by period
        if (selectedPeriod !== 'all') {
          const now = new Date();
          const periodStart = new Date();

          if (selectedPeriod === 'week') {
            periodStart.setDate(now.getDate() - 7);
          } else if (selectedPeriod === 'month') {
            periodStart.setMonth(now.getMonth() - 1);
          } else if (selectedPeriod === 'year') {
            periodStart.setFullYear(now.getFullYear() - 1);
          }

          filtered = filtered.filter(
            (txn) => new Date(txn.date) >= periodStart
          );
        }

        // Filter by account
        if (selectedAccount !== 'all') {
          filtered = filtered.filter((txn) => txn.account === selectedAccount);
        }

        // Filter by category
        if (selectedCategory !== 'all') {
          filtered = filtered.filter((txn) => txn.category === selectedCategory);
        }

        return filtered;
      },

      getTotalIncome: () => {
        const filtered = get().getFilteredTransactions();
        return filtered
          .filter((txn) => txn.type === 'income')
          .reduce((sum, txn) => sum + txn.amount, 0);
      },

      getTotalExpenses: () => {
        const filtered = get().getFilteredTransactions();
        return Math.abs(
          filtered
            .filter((txn) => txn.type === 'expense')
            .reduce((sum, txn) => sum + txn.amount, 0)
        );
      },

      getNetIncome: () => {
        return get().getTotalIncome() - get().getTotalExpenses();
      },

      getCategorySpending: () => {
        const filtered = get().getFilteredTransactions();
        const categoryTotals = {};

        filtered
          .filter((txn) => txn.type === 'expense')
          .forEach((txn) => {
            if (!categoryTotals[txn.category]) {
              categoryTotals[txn.category] = 0;
            }
            categoryTotals[txn.category] += Math.abs(txn.amount);
          });

        return Object.entries(categoryTotals).map(([categoryId, amount]) => ({
          category: categoryId,
          name: CATEGORIES[categoryId]?.name || categoryId,
          amount,
          color: CATEGORIES[categoryId]?.color || '#64748b',
          icon: CATEGORIES[categoryId]?.icon || '📦',
        }));
      },

      getBudgetProgress: () => {
        const { budgets } = get();
        const categorySpending = get().getCategorySpending();

        return budgets.map((budget) => {
          const spending = categorySpending.find(
            (cat) => cat.category === budget.category
          );
          const spent = spending?.amount || 0;
          const percentage = (spent / budget.limit) * 100;
          const remaining = budget.limit - spent;

          return {
            ...budget,
            spent,
            percentage: Math.min(percentage, 100),
            remaining,
            status:
              percentage >= 100
                ? 'over'
                : percentage >= 90
                ? 'warning'
                : 'good',
            name: CATEGORIES[budget.category]?.name || budget.category,
            color: CATEGORIES[budget.category]?.color || '#64748b',
            icon: CATEGORIES[budget.category]?.icon || '📦',
          };
        });
      },

      getSavingsProgress: () => {
        const { savingsGoals } = get();

        return savingsGoals.map((goal) => {
          const percentage = (goal.current / goal.target) * 100;
          const remaining = goal.target - goal.current;
          const daysUntilDeadline = Math.ceil(
            (new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)
          );

          return {
            ...goal,
            percentage: Math.min(percentage, 100),
            remaining,
            daysUntilDeadline,
            status: percentage >= 100 ? 'complete' : 'in_progress',
          };
        });
      },

      getNetWorth: () => {
        const { accounts } = get();
        return accounts.reduce((sum, acc) => {
          if (acc.type === 'credit') {
            return sum + acc.balance; // Credit card balance is negative
          }
          return sum + acc.balance;
        }, 0);
      },

      getSpendingTrend: () => {
        const filtered = get().getFilteredTransactions();
        const expenses = filtered.filter((txn) => txn.type === 'expense');

        // Group by date (day)
        const dailySpending = {};
        expenses.forEach((txn) => {
          const date = new Date(txn.date).toISOString().split('T')[0];
          if (!dailySpending[date]) {
            dailySpending[date] = 0;
          }
          dailySpending[date] += Math.abs(txn.amount);
        });

        // Convert to array and sort
        return Object.entries(dailySpending)
          .map(([date, amount]) => ({
            date,
            amount,
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));
      },

      getCashFlow: () => {
        const filtered = get().getFilteredTransactions();

        // Group by date
        const dailyFlow = {};
        filtered.forEach((txn) => {
          const date = new Date(txn.date).toISOString().split('T')[0];
          if (!dailyFlow[date]) {
            dailyFlow[date] = { income: 0, expenses: 0 };
          }

          if (txn.type === 'income') {
            dailyFlow[date].income += txn.amount;
          } else {
            dailyFlow[date].expenses += Math.abs(txn.amount);
          }
        });

        // Convert to array and sort
        return Object.entries(dailyFlow)
          .map(([date, flow]) => ({
            date,
            income: flow.income,
            expenses: flow.expenses,
            net: flow.income - flow.expenses,
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));
      },

      getRecurringTransactions: () => {
        const { transactions } = get();
        return transactions.filter((txn) => txn.recurring);
      },

      // ============================================================
      // ENVELOPE BUDGETING METHODS
      // ============================================================

      // Set budget for a category in a specific month
      setEnvelopeBudget: (categoryId, amount, monthKey = getMonthKey()) => {
        set((state) => ({
          envelopeBudgets: {
            ...state.envelopeBudgets,
            [monthKey]: {
              ...(state.envelopeBudgets[monthKey] || {}),
              [categoryId]: amount,
            },
          },
        }));
      },

      // Set all envelopes for a month at once
      setMonthlyEnvelopes: (budgets, monthKey = getMonthKey()) => {
        set((state) => ({
          envelopeBudgets: {
            ...state.envelopeBudgets,
            [monthKey]: budgets,
          },
        }));
      },

      // Copy envelopes from one month to another
      copyEnvelopesFromMonth: (sourceMonth, targetMonth = getMonthKey()) => {
        const { envelopeBudgets } = get();
        const sourceBudgets = envelopeBudgets[sourceMonth] || {};

        set((state) => ({
          envelopeBudgets: {
            ...state.envelopeBudgets,
            [targetMonth]: { ...sourceBudgets },
          },
        }));
      },

      // Set monthly income target
      setMonthlyIncomeTarget: (amount) => {
        set({ monthlyIncomeTarget: amount });
      },

      // Get envelope status for all categories in a month
      getEnvelopeStatus: (monthKey = getMonthKey()) => {
        const { envelopeBudgets, transactions } = get();
        const budgets = envelopeBudgets[monthKey] || {};

        // Get spending by category for the month
        const monthTransactions = transactions.filter((t) => {
          const transactionMonth = getMonthKey(new Date(t.date));
          return transactionMonth === monthKey && t.type === 'expense';
        });

        const spending = {};
        monthTransactions.forEach((t) => {
          const category = t.category;
          spending[category] = (spending[category] || 0) + Math.abs(t.amount);
        });

        // Build envelope status for each category
        const envelopes = {};
        Object.keys(ENVELOPE_CATEGORIES).forEach((categoryId) => {
          const allocated = budgets[categoryId] || 0;
          const spent = spending[categoryId] || 0;
          const remaining = allocated - spent;
          const percentUsed = allocated > 0 ? (spent / allocated) * 100 : 0;

          let status = 'healthy'; // green
          if (percentUsed >= 100) status = 'over'; // red
          else if (percentUsed >= 80) status = 'warning'; // yellow
          else if (percentUsed >= 50) status = 'caution'; // blue

          envelopes[categoryId] = {
            categoryId,
            ...ENVELOPE_CATEGORIES[categoryId],
            allocated,
            spent,
            remaining,
            percentUsed: Math.round(percentUsed),
            status,
          };
        });

        return envelopes;
      },

      // Get envelope summary for the month
      getEnvelopeSummary: (monthKey = getMonthKey()) => {
        const { envelopeBudgets, monthlyIncomeTarget, transactions } = get();
        const budgets = envelopeBudgets[monthKey] || {};

        // Calculate totals
        const totalAllocated = Object.values(budgets).reduce((sum, amt) => sum + amt, 0);
        const unallocated = monthlyIncomeTarget - totalAllocated;

        // Get actual income and expenses for the month
        const monthTransactions = transactions.filter((t) => {
          const transactionMonth = getMonthKey(new Date(t.date));
          return transactionMonth === monthKey;
        });

        const totalIncome = monthTransactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = monthTransactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const netIncome = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? Math.round((netIncome / totalIncome) * 100) : 0;

        // Categories by type
        const envelopes = get().getEnvelopeStatus(monthKey);
        const categorizedEnvelopes = {
          fixed: [],
          variable: [],
          wants: [],
          growth: [],
          savings: [],
          other: [],
        };

        Object.values(envelopes).forEach((env) => {
          if (env.allocated > 0 || env.spent > 0) {
            const type = ENVELOPE_CATEGORIES[env.categoryId]?.type || 'other';
            categorizedEnvelopes[type].push(env);
          }
        });

        return {
          monthlyIncomeTarget,
          totalAllocated,
          unallocated,
          totalIncome,
          totalExpenses,
          netIncome,
          savingsRate,
          categorizedEnvelopes,
          isZeroBased: Math.abs(unallocated) < 1, // Within £1 of zero
        };
      },

      // Check if month has envelopes set up
      hasEnvelopesForMonth: (monthKey = getMonthKey()) => {
        const { envelopeBudgets } = get();
        const budgets = envelopeBudgets[monthKey] || {};
        return Object.keys(budgets).length > 0;
      },

      // Get previous month with envelopes (for copying)
      getPreviousMonthWithEnvelopes: () => {
        const { envelopeBudgets } = get();
        const months = Object.keys(envelopeBudgets).sort().reverse();
        return months[0] || null;
      },

      // ============================================================
      // SINKING FUNDS METHODS
      // ============================================================

      addSinkingFund: (fund) => {
        const newFund = {
          id: `fund-${Date.now()}`,
          name: fund.name,
          targetAmount: fund.targetAmount,
          currentAmount: fund.currentAmount || 0,
          targetDate: fund.targetDate || null,
          monthlyContribution: fund.monthlyContribution || 0,
          icon: fund.icon || '💰',
          color: fund.color || 'from-amber-500 to-yellow-500',
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          sinkingFunds: [...state.sinkingFunds, newFund],
        }));

        return newFund.id;
      },

      updateSinkingFund: (id, updates) => {
        set((state) => ({
          sinkingFunds: state.sinkingFunds.map((f) =>
            f.id === id ? { ...f, ...updates } : f
          ),
        }));
      },

      deleteSinkingFund: (id) => {
        set((state) => ({
          sinkingFunds: state.sinkingFunds.filter((f) => f.id !== id),
        }));
      },

      contributeSinkingFund: (id, amount) => {
        set((state) => ({
          sinkingFunds: state.sinkingFunds.map((f) =>
            f.id === id ? { ...f, currentAmount: f.currentAmount + amount } : f
          ),
        }));
      },

      withdrawSinkingFund: (id, amount) => {
        set((state) => ({
          sinkingFunds: state.sinkingFunds.map((f) =>
            f.id === id ? { ...f, currentAmount: Math.max(0, f.currentAmount - amount) } : f
          ),
        }));
      },

      getTopMerchants: (limit = 5) => {
        const filtered = get().getFilteredTransactions();
        const merchantTotals = {};

        filtered
          .filter((txn) => txn.type === 'expense')
          .forEach((txn) => {
            if (!merchantTotals[txn.merchant]) {
              merchantTotals[txn.merchant] = {
                merchant: txn.merchant,
                total: 0,
                count: 0,
              };
            }
            merchantTotals[txn.merchant].total += Math.abs(txn.amount);
            merchantTotals[txn.merchant].count += 1;
          });

        return Object.values(merchantTotals)
          .sort((a, b) => b.total - a.total)
          .slice(0, limit);
      },

      // Financial Insights
      getFinancialInsights: () => {
        const insights = [];
        const totalIncome = get().getTotalIncome();
        const totalExpenses = get().getTotalExpenses();
        const netIncome = get().getNetIncome();
        const budgetProgress = get().getBudgetProgress();
        const savingsProgress = get().getSavingsProgress();

        // Savings rate insight
        const savingsRate = ((netIncome / totalIncome) * 100).toFixed(1);
        if (savingsRate < 20) {
          insights.push({
            type: 'warning',
            title: 'Low Savings Rate',
            message: `You're saving ${savingsRate}% of your income. Aim for at least 20% to build financial security.`,
            icon: '⚠️',
          });
        } else if (savingsRate >= 20 && savingsRate < 50) {
          insights.push({
            type: 'success',
            title: 'Good Savings Rate',
            message: `You're saving ${savingsRate}% of your income. Keep it up!`,
            icon: '✅',
          });
        } else {
          insights.push({
            type: 'success',
            title: 'Excellent Savings Rate',
            message: `You're saving ${savingsRate}% of your income. Outstanding financial discipline!`,
            icon: '🌟',
          });
        }

        // Budget warnings
        const overBudget = budgetProgress.filter((b) => b.status === 'over');
        if (overBudget.length > 0) {
          insights.push({
            type: 'warning',
            title: 'Budget Exceeded',
            message: `You're over budget in ${overBudget.length} categor${
              overBudget.length === 1 ? 'y' : 'ies'
            }: ${overBudget.map((b) => b.name).join(', ')}`,
            icon: '📊',
          });
        }

        // Savings goal progress
        const completedGoals = savingsProgress.filter(
          (g) => g.status === 'complete'
        );
        if (completedGoals.length > 0) {
          insights.push({
            type: 'success',
            title: 'Goals Achieved',
            message: `Congrats! You've completed ${completedGoals.length} savings goal${
              completedGoals.length === 1 ? '' : 's'
            }!`,
            icon: '🎉',
          });
        }

        // Net worth milestone
        const netWorth = get().getNetWorth();
        if (netWorth >= 100000) {
          insights.push({
            type: 'success',
            title: 'Net Worth Milestone',
            message: `Your net worth has reached $${(netWorth / 1000).toFixed(
              0
            )}K! Keep building wealth.`,
            icon: '💎',
          });
        }

        return insights;
      },
    }),
    {
      name: 'financial-storage',
      partialize: (state) => ({
        transactions: state.transactions,
        budgets: state.budgets,
        savingsGoals: state.savingsGoals,
        accounts: state.accounts,
        envelopeBudgets: state.envelopeBudgets,
        monthlyIncomeTarget: state.monthlyIncomeTarget,
        envelopeSettings: state.envelopeSettings,
        sinkingFunds: state.sinkingFunds,
      }),
    }
  )
);

// Export helper
export { getMonthKey };
