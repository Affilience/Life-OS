import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
} from 'lucide-react';
import { useFinancialStore } from '../../../stores/financialStore';

export default function FinancialSnapshotWidget() {
  const navigate = useNavigate();
  const {
    budgetEnvelopes = [],
    transactions = [],
    sinkingFunds = [],
  } = useFinancialStore();

  // Calculate total budget and spent
  const totalBudget = budgetEnvelopes.reduce((sum, env) => sum + (env.allocated || 0), 0);
  const totalSpent = budgetEnvelopes.reduce((sum, env) => sum + (env.spent || 0), 0);
  const remaining = totalBudget - totalSpent;
  const spentPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  // Get recent transactions
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  // Calculate sinking funds total
  const totalSaved = sinkingFunds.reduce((sum, fund) => sum + (fund.current || 0), 0);

  const isOverBudget = totalSpent > totalBudget;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-sm font-semibold text-white/60 flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          Financial Snapshot
        </h3>
        <button
          onClick={() => navigate('/financial')}
          className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
        >
          Details
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
        {/* Budget Overview */}
        <div className="bg-[#1a1724] border border-white/10 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/60">Monthly Budget</span>
            <span className={`text-xs font-medium ${isOverBudget ? 'text-red-400' : 'text-green-400'}`}>
              {isOverBudget ? 'Over Budget' : `$${remaining.toFixed(0)} left`}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-500 ${
                isOverBudget ? 'bg-red-500' : spentPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(spentPercentage, 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-white/40">
            <span>${totalSpent.toFixed(0)} spent</span>
            <span>${totalBudget.toFixed(0)} budgeted</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#1a1724] border border-white/10 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[10px] text-white/60">This Week</span>
            </div>
            <p className="text-sm font-bold text-white">
              ${recentTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0)
                .toFixed(0)}
            </p>
          </div>
          <div className="bg-[#1a1724] border border-white/10 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <PiggyBank className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] text-white/60">Saved</span>
            </div>
            <p className="text-sm font-bold text-white">${totalSaved.toFixed(0)}</p>
          </div>
        </div>

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <div className="bg-[#1a1724] border border-white/10 rounded-xl p-3">
            <p className="text-[10px] text-white/60 mb-2">Recent Transactions</p>
            <div className="space-y-2">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className="w-3 h-3 text-green-400" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-red-400" />
                    )}
                    <span className="text-xs text-white truncate max-w-[100px]">
                      {transaction.description || transaction.category}
                    </span>
                  </div>
                  <span className={`text-xs font-medium ${
                    transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${(transaction.amount || 0).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {totalBudget === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <Wallet className="w-8 h-8 text-white/20 mb-2" />
            <p className="text-xs text-white/60">No budget set up yet</p>
            <button
              onClick={() => navigate('/financial')}
              className="mt-2 text-xs text-purple-400 hover:text-purple-300"
            >
              Set up budget
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
