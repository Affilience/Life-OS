/**
 * Financial Store - Zustand state management for financial tracking
 * Manages transactions, budgets, savings goals, and accounts
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

      contributeSavingsGoal: (id, amount) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.map((goal) =>
            goal.id === id
              ? { ...goal, current: goal.current + amount }
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
    }
  )
);
