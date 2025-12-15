/**
 * Financial Store - Zustand state management for financial tracking
 * Manages transactions, budgets, savings goals, accounts, and envelope budgeting
 * Hybrid pattern: optimistic local updates + async Supabase sync
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, getCurrentUserId } from '../lib/supabase';
import { DEV_USER_ID, isDevMode } from '../lib/dev-auth';
import {
  CATEGORIES,
} from '../data/financialData';
import { triggerGamification } from '../hooks/useGamification';
import useAchievementsStore from './achievementsStore';

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

// ============================================================
// SUPABASE SYNC HELPERS
// ============================================================

// Initialize store from Supabase
const initializeFromSupabase = async (set, get) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    // Load transactions (limit to last 500 for performance, user can load more on demand)
    const { data: transactions, error: txnError } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false })
      .limit(500);

    if (txnError) throw txnError;

    // Load budgets
    const { data: budgets, error: budgetError } = await supabase
      .from('financial_budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (budgetError) throw budgetError;

    // Load savings goals
    const { data: goals, error: goalsError } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', userId);

    if (goalsError) throw goalsError;

    // Load goal contributions (limit to last 200)
    const { data: contributions, error: contribError } = await supabase
      .from('financial_goal_contributions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(200);

    if (contribError) throw contribError;

    // Load accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('financial_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true);

    if (accountsError) throw accountsError;

    // Load envelope budgets
    const { data: envelopes, error: envelopesError } = await supabase
      .from('financial_envelope_budgets')
      .select('*')
      .eq('user_id', userId);

    if (envelopesError) throw envelopesError;

    // Load sinking funds
    const { data: sinkingFunds, error: fundsError } = await supabase
      .from('financial_sinking_funds')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (fundsError) throw fundsError;

    // Load financial settings from user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('financial_settings')
      .eq('id', userId)
      .maybeSingle();

    // Transform data to match store format
    const transformedTransactions = transactions?.map(t => ({
      id: t.id,
      date: t.transaction_date,
      amount: parseFloat(t.amount),
      type: t.transaction_type,
      category: t.category,
      subcategory: t.subcategory,
      merchant: t.merchant,
      description: t.description,
      account: t.account_id,
      tags: t.tags || [],
      recurring: t.is_recurring,
    })) || [];

    const transformedBudgets = budgets?.map(b => ({
      id: b.id,
      category: b.category,
      limit: parseFloat(b.budget_limit),
      period: b.period || 'monthly',
      spent: 0,
    })) || [];

    // Group contributions by goal
    const contribByGoal = {};
    contributions?.forEach(c => {
      if (!contribByGoal[c.goal_id]) contribByGoal[c.goal_id] = [];
      contribByGoal[c.goal_id].push({
        id: c.id,
        amount: c.is_withdrawal ? -parseFloat(c.amount) : parseFloat(c.amount),
        date: c.created_at,
        note: c.note || '',
        isWithdrawal: c.is_withdrawal,
      });
    });

    const transformedGoals = goals?.map(g => ({
      id: g.id,
      name: g.goal_name,
      target: parseFloat(g.target_amount),
      current: parseFloat(g.current_amount || 0),
      deadline: g.deadline,
      icon: g.icon || '💰',
      color: g.color || 'from-green-500 to-emerald-500',
      priority: g.priority || 0,
      contributions: contribByGoal[g.id] || [],
      milestonesReached: g.milestones_reached || [],
      lastContributionDate: g.last_contribution_date,
      contributionStreak: g.contribution_streak || 0,
    })) || [];

    const transformedAccounts = accounts?.map(a => ({
      id: a.id,
      name: a.account_name,
      type: a.account_type,
      balance: parseFloat(a.current_balance || 0),
      institution: a.institution,
      icon: a.icon || '🏦',
      color: a.color || '#64748b',
      lastUpdated: a.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    })) || [];

    // Transform envelope budgets to nested structure { monthKey: { categoryId: amount } }
    const transformedEnvelopes = {};
    envelopes?.forEach(e => {
      if (!transformedEnvelopes[e.month_key]) {
        transformedEnvelopes[e.month_key] = {};
      }
      transformedEnvelopes[e.month_key][e.category_id] = parseFloat(e.allocated_amount);
    });

    const transformedSinkingFunds = sinkingFunds?.map(f => ({
      id: f.id,
      name: f.name,
      targetAmount: parseFloat(f.target_amount),
      currentAmount: parseFloat(f.current_amount || 0),
      targetDate: f.target_date,
      monthlyContribution: parseFloat(f.monthly_contribution || 0),
      icon: f.icon || '💰',
      color: f.color || 'from-amber-500 to-yellow-500',
      createdAt: f.created_at,
    })) || [];

    const settings = profile?.financial_settings || {};

    // Update store with data from Supabase
    // Always sync savingsGoals and accounts to ensure Supabase is the source of truth
    // This clears out any stale localStorage data that may have been persisted before Supabase sync
    const updates = {
      savingsGoals: transformedGoals,  // Always sync from Supabase (empty array if no goals)
      accounts: transformedAccounts,    // Always sync from Supabase
    };

    // Only update other fields if we have data (preserves local state for gradual sync)
    if (transformedTransactions.length > 0) updates.transactions = transformedTransactions;
    if (transformedBudgets.length > 0) updates.budgets = transformedBudgets;
    if (Object.keys(transformedEnvelopes).length > 0) updates.envelopeBudgets = transformedEnvelopes;
    if (transformedSinkingFunds.length > 0) updates.sinkingFunds = transformedSinkingFunds;
    if (settings.monthlyIncomeTarget) updates.monthlyIncomeTarget = settings.monthlyIncomeTarget;
    if (settings.envelopeSettings) updates.envelopeSettings = settings.envelopeSettings;
    if (settings.currency) updates.currency = settings.currency;

    set(updates);

    console.log('Financial store initialized from Supabase');
  } catch (error) {
    console.error('Error initializing financial store from Supabase:', error);
  }
};

// Sync transaction to Supabase
const syncTransactionToSupabase = async (transaction, action = 'upsert') => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    if (action === 'delete') {
      await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', transaction.id)
        .eq('user_id', userId);
    } else {
      await supabase
        .from('financial_transactions')
        .upsert({
          id: transaction.id,
          user_id: userId,
          transaction_date: transaction.date?.split('T')[0] || new Date().toISOString().split('T')[0],
          amount: transaction.amount,
          transaction_type: transaction.type,
          category: transaction.category,
          subcategory: transaction.subcategory,
          merchant: transaction.merchant,
          description: transaction.description,
          account_id: transaction.account,
          tags: transaction.tags || [],
          is_recurring: transaction.recurring || false,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
    }
  } catch (error) {
    console.error('Error syncing transaction to Supabase:', error);
  }
};

// Sync budget to Supabase
const syncBudgetToSupabase = async (budget, action = 'upsert') => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    if (action === 'delete') {
      await supabase
        .from('financial_budgets')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', budget.id)
        .eq('user_id', userId);
    } else {
      await supabase
        .from('financial_budgets')
        .upsert({
          id: budget.id,
          user_id: userId,
          category: budget.category,
          budget_limit: budget.limit,
          period: budget.period || 'monthly',
          is_active: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
    }
  } catch (error) {
    console.error('Error syncing budget to Supabase:', error);
  }
};

// Sync savings goal to Supabase
const syncGoalToSupabase = async (goal, action = 'upsert') => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    if (action === 'delete') {
      await supabase
        .from('financial_goals')
        .update({ status: 'deleted', updated_at: new Date().toISOString() })
        .eq('id', goal.id)
        .eq('user_id', userId);
    } else {
      await supabase
        .from('financial_goals')
        .upsert({
          id: goal.id,
          user_id: userId,
          goal_name: goal.name,
          target_amount: goal.target,
          current_amount: goal.current,
          deadline: goal.deadline,
          icon: goal.icon || '💰',
          color: goal.color || 'from-green-500 to-emerald-500',
          priority: goal.priority || 0,
          milestones_reached: goal.milestonesReached || [],
          last_contribution_date: goal.lastContributionDate,
          contribution_streak: goal.contributionStreak || 0,
          status: goal.current >= goal.target ? 'completed' : 'active',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
    }
  } catch (error) {
    console.error('Error syncing goal to Supabase:', error);
  }
};

// Sync contribution to Supabase
const syncContributionToSupabase = async (goalId, contribution) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    await supabase
      .from('financial_goal_contributions')
      .upsert({
        id: contribution.id,
        user_id: userId,
        goal_id: goalId,
        amount: Math.abs(contribution.amount),
        note: contribution.note || '',
        is_withdrawal: contribution.isWithdrawal || contribution.amount < 0,
        created_at: contribution.date || new Date().toISOString(),
      }, { onConflict: 'id' });
  } catch (error) {
    console.error('Error syncing contribution to Supabase:', error);
  }
};

// Sync account to Supabase
const syncAccountToSupabase = async (account, action = 'upsert') => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    if (action === 'delete') {
      await supabase
        .from('financial_accounts')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('id', account.id)
        .eq('user_id', userId);
    } else {
      await supabase
        .from('financial_accounts')
        .upsert({
          id: account.id,
          user_id: userId,
          account_name: account.name,
          account_type: account.type,
          current_balance: account.balance,
          institution: account.institution,
          icon: account.icon || '🏦',
          color: account.color || '#64748b',
          active: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
    }
  } catch (error) {
    console.error('Error syncing account to Supabase:', error);
  }
};

// Sync envelope budget to Supabase
const syncEnvelopeToSupabase = async (monthKey, categoryId, amount) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    // Generate a deterministic ID based on user, month, and category
    const envelopeId = `${userId}-${monthKey}-${categoryId}`.replace(/[^a-zA-Z0-9-]/g, '-');

    await supabase
      .from('financial_envelope_budgets')
      .upsert({
        id: envelopeId,
        user_id: userId,
        month_key: monthKey,
        category_id: categoryId,
        allocated_amount: amount,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
  } catch (error) {
    console.error('Error syncing envelope to Supabase:', error);
  }
};

// Sync sinking fund to Supabase
const syncSinkingFundToSupabase = async (fund, action = 'upsert') => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    if (action === 'delete') {
      await supabase
        .from('financial_sinking_funds')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', fund.id)
        .eq('user_id', userId);
    } else {
      await supabase
        .from('financial_sinking_funds')
        .upsert({
          id: fund.id,
          user_id: userId,
          name: fund.name,
          target_amount: fund.targetAmount,
          current_amount: fund.currentAmount || 0,
          target_date: fund.targetDate,
          monthly_contribution: fund.monthlyContribution || 0,
          icon: fund.icon || '💰',
          color: fund.color || 'from-amber-500 to-yellow-500',
          is_active: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
    }
  } catch (error) {
    console.error('Error syncing sinking fund to Supabase:', error);
  }
};

// Sync financial settings to user_profiles
const syncSettingsToSupabase = async (settings) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    await supabase
      .from('user_profiles')
      .update({
        financial_settings: settings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  } catch (error) {
    console.error('Error syncing financial settings to Supabase:', error);
  }
};

export const useFinancialStore = create(
  persist(
    (set, get) => ({
      // State
      transactions: [],
      budgets: [],
      savingsGoals: [],
      accounts: [],
      selectedPeriod: 'month', // 'week' | 'month' | 'year' | 'all'
      selectedAccount: 'all',
      selectedCategory: 'all',

      // Currency setting
      currency: 'USD', // User's preferred currency

      // Envelope budgeting state
      envelopeBudgets: {}, // { '2025-01': { food: 300, transport: 100, ... } }
      monthlyIncomeTarget: 3000, // Expected monthly income for zero-based budgeting
      envelopeSettings: {}, // { categoryId: { rollover: true, ... } }
      sinkingFunds: [], // For irregular expenses

      // Initialize from Supabase
      initializeFromSupabase: () => initializeFromSupabase(set, get),

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
        // Sync to Supabase
        syncTransactionToSupabase(newTransaction);

        // Award XP for logging transactions
        const isIncome = transaction.type === 'income';
        triggerGamification(isIncome ? 'incomeLogged' : 'expenseLogged', {
          xpOverride: isIncome ? 10 : 5,
          module: 'financial',
        });
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((txn) =>
            txn.id === id ? { ...txn, ...updates } : txn
          ),
        }));
        // Sync to Supabase
        const transaction = get().transactions.find(t => t.id === id);
        if (transaction) syncTransactionToSupabase(transaction);
      },

      deleteTransaction: (id) => {
        const transaction = get().transactions.find(t => t.id === id);
        set((state) => ({
          transactions: state.transactions.filter((txn) => txn.id !== id),
        }));
        // Sync to Supabase
        if (transaction) syncTransactionToSupabase(transaction, 'delete');
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
        // Sync to Supabase
        syncBudgetToSupabase(newBudget);
        // Award XP for creating a budget
        triggerGamification('budgetCreated', { xpOverride: 20, module: 'financial' });
      },

      updateBudget: (id, updates) => {
        set((state) => ({
          budgets: state.budgets.map((budget) =>
            budget.id === id ? { ...budget, ...updates } : budget
          ),
        }));
        // Sync to Supabase
        const budget = get().budgets.find(b => b.id === id);
        if (budget) syncBudgetToSupabase(budget);
      },

      deleteBudget: (id) => {
        const budget = get().budgets.find(b => b.id === id);
        set((state) => ({
          budgets: state.budgets.filter((budget) => budget.id !== id),
        }));
        // Sync to Supabase
        if (budget) syncBudgetToSupabase(budget, 'delete');
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
        // Sync to Supabase
        syncGoalToSupabase(newGoal);

        // Award XP for creating a savings goal
        triggerGamification('savingsGoalCreated', {
          xpOverride: 15,
          module: 'financial',
        });
      },

      updateSavingsGoal: (id, updates) => {
        const oldGoal = get().savingsGoals.find(g => g.id === id);
        const wasCompleted = oldGoal && oldGoal.current >= oldGoal.target;

        set((state) => ({
          savingsGoals: state.savingsGoals.map((goal) =>
            goal.id === id ? { ...goal, ...updates } : goal
          ),
        }));

        // Check if goal just got completed
        const updatedGoal = get().savingsGoals.find(g => g.id === id);
        if (updatedGoal && !wasCompleted && updatedGoal.current >= updatedGoal.target) {
          // Award XP for completing a savings goal
          triggerGamification('savingsGoalCompleted', {
            xpOverride: 75,
            module: 'financial',
          });
        }

        // Sync to Supabase
        if (updatedGoal) syncGoalToSupabase(updatedGoal);
      },

      deleteSavingsGoal: (id) => {
        const goal = get().savingsGoals.find(g => g.id === id);
        set((state) => ({
          savingsGoals: state.savingsGoals.filter((goal) => goal.id !== id),
        }));
        // Sync to Supabase
        if (goal) syncGoalToSupabase(goal, 'delete');
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

        // Sync contribution and goal to Supabase
        const goal = get().savingsGoals.find(g => g.id === id);
        if (goal) {
          syncContributionToSupabase(id, contribution);
          syncGoalToSupabase(goal);
        }

        // Return milestone info for celebration
        const oldPercent = ((goal?.current || 0) - amount) / (goal?.target || 1) * 100;
        const newPercent = (goal?.current || 0) / (goal?.target || 1) * 100;
        const milestones = [25, 50, 75, 100];
        const crossedMilestones = milestones.filter(m => oldPercent < m && newPercent >= m);

        // Track achievement stats for savings
        const achievementsStore = useAchievementsStore.getState();

        // Track contribution made
        achievementsStore.incrementStat('savingsContributions', 1);

        // Track total amount saved
        if (amount > 0) {
          achievementsStore.incrementStat('totalSaved', amount);
        }

        // Track milestone achievements
        if (crossedMilestones.includes(25)) {
          achievementsStore.incrementStat('savingsMilestone25', 1);
        }
        if (crossedMilestones.includes(50)) {
          achievementsStore.incrementStat('savingsMilestone50', 1);
        }
        if (crossedMilestones.includes(75)) {
          achievementsStore.incrementStat('savingsMilestone75', 1);
        }

        // Track contribution streak (weeks)
        if (goal?.contributionStreak) {
          achievementsStore.updateStat('savingsStreakWeeks', goal.contributionStreak);
        }

        // Trigger gamification for XP
        triggerGamification('savingsContribution', {
          xpOverride: 15,
          module: 'financial',
        });

        // Check achievements
        achievementsStore.checkAchievements();

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
        // Sync to Supabase
        const goal = get().savingsGoals.find(g => g.id === goalId);
        if (goal) syncGoalToSupabase(goal);
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
        // Sync to Supabase
        const goal = get().savingsGoals.find(g => g.id === id);
        if (goal) {
          syncContributionToSupabase(id, withdrawal);
          syncGoalToSupabase(goal);
        }
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
        // Sync to Supabase
        syncAccountToSupabase(newAccount);
      },

      updateAccount: (id, updates) => {
        set((state) => ({
          accounts: state.accounts.map((acc) =>
            acc.id === id ? { ...acc, ...updates } : acc
          ),
        }));
        // Sync to Supabase
        const account = get().accounts.find(a => a.id === id);
        if (account) syncAccountToSupabase(account);
      },

      deleteAccount: (id) => {
        const account = get().accounts.find(a => a.id === id);
        set((state) => ({
          accounts: state.accounts.filter((acc) => acc.id !== id),
        }));
        // Sync to Supabase
        if (account) syncAccountToSupabase(account, 'delete');
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
        // Sync to Supabase
        syncEnvelopeToSupabase(monthKey, categoryId, amount);
      },

      // Set all envelopes for a month at once
      setMonthlyEnvelopes: (budgets, monthKey = getMonthKey()) => {
        set((state) => ({
          envelopeBudgets: {
            ...state.envelopeBudgets,
            [monthKey]: budgets,
          },
        }));
        // Sync all envelopes to Supabase
        Object.entries(budgets).forEach(([categoryId, amount]) => {
          syncEnvelopeToSupabase(monthKey, categoryId, amount);
        });
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
        // Sync all copied envelopes to Supabase
        Object.entries(sourceBudgets).forEach(([categoryId, amount]) => {
          syncEnvelopeToSupabase(targetMonth, categoryId, amount);
        });
      },

      // Set monthly income target
      setMonthlyIncomeTarget: (amount) => {
        set({ monthlyIncomeTarget: amount });
        // Sync settings to Supabase
        const { envelopeSettings, currency } = get();
        syncSettingsToSupabase({ monthlyIncomeTarget: amount, envelopeSettings, currency });
      },

      // Set currency
      setCurrency: (currencyCode) => {
        set({ currency: currencyCode });
        // Sync settings to Supabase
        const { monthlyIncomeTarget, envelopeSettings } = get();
        syncSettingsToSupabase({ monthlyIncomeTarget, envelopeSettings, currency: currencyCode });
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
        // Sync to Supabase
        syncSinkingFundToSupabase(newFund);
        // Award XP for creating a sinking fund
        triggerGamification('sinkingFundCreated', { xpOverride: 15, module: 'financial' });

        return newFund.id;
      },

      updateSinkingFund: (id, updates) => {
        set((state) => ({
          sinkingFunds: state.sinkingFunds.map((f) =>
            f.id === id ? { ...f, ...updates } : f
          ),
        }));
        // Sync to Supabase
        const fund = get().sinkingFunds.find(f => f.id === id);
        if (fund) syncSinkingFundToSupabase(fund);
      },

      deleteSinkingFund: (id) => {
        const fund = get().sinkingFunds.find(f => f.id === id);
        set((state) => ({
          sinkingFunds: state.sinkingFunds.filter((f) => f.id !== id),
        }));
        // Sync to Supabase
        if (fund) syncSinkingFundToSupabase(fund, 'delete');
      },

      contributeSinkingFund: (id, amount) => {
        const fundBefore = get().sinkingFunds.find(f => f.id === id);
        set((state) => ({
          sinkingFunds: state.sinkingFunds.map((f) =>
            f.id === id ? { ...f, currentAmount: f.currentAmount + amount } : f
          ),
        }));
        // Sync to Supabase
        const fund = get().sinkingFunds.find(f => f.id === id);
        if (fund) {
          syncSinkingFundToSupabase(fund);
          // Award XP for contributing to sinking fund
          triggerGamification('sinkingFundContribution', { xpOverride: 10, module: 'financial' });
          // Check if fund was just completed
          if (fundBefore && fundBefore.currentAmount < fundBefore.targetAmount &&
              fund.currentAmount >= fund.targetAmount) {
            triggerGamification('sinkingFundCompleted', { xpOverride: 50, module: 'financial' });
          }
        }
      },

      withdrawSinkingFund: (id, amount) => {
        set((state) => ({
          sinkingFunds: state.sinkingFunds.map((f) =>
            f.id === id ? { ...f, currentAmount: Math.max(0, f.currentAmount - amount) } : f
          ),
        }));
        // Sync to Supabase
        const fund = get().sinkingFunds.find(f => f.id === id);
        if (fund) syncSinkingFundToSupabase(fund);
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
        currency: state.currency,
      }),
    }
  )
);

// Export helper
export { getMonthKey };

// Initialize financial store from Supabase
export const initializeFinancialStore = async () => {
  const store = useFinancialStore.getState();
  await store.initializeFromSupabase();
};
