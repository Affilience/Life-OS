import React, { useState } from 'react';
import {
  Wallet,
  Target,
} from 'lucide-react';
import UnifiedBudgetTab from './UnifiedBudgetTab';
import FinancialGoalsTab from './FinancialGoalsTab';

/**
 * FinancialDashboard - Streamlined 2-tab financial management
 *
 * Tabs:
 * 1. Budget - All income, expenses, budgets, and visualizations in one place
 * 2. Goals - Savings goals with daily/weekly/monthly payment allocations
 */

const FinancialDashboard = () => {
  const [activeTab, setActiveTab] = useState('budget');

  const tabs = [
    { id: 'budget', name: 'Budget', icon: Wallet },
    { id: 'goals', name: 'Goals', icon: Target },
  ];

  return (
    <div className="financial-page min-h-screen bg-[#0c0a10]">
      {/* Tab Navigation */}
      <div className="sticky top-0 z-40 bg-[#0c0a10] border-b border-slate-800" data-tour="financial-tabs">
        <div className="flex overflow-x-auto hide-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-tour={`financial-tab-${tab.id}`}
                className={`flex-1 min-w-[120px] px-4 py-4 flex flex-col items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/20 text-emerald-400 border-b-2 border-emerald-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1724]/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-semibold">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Content */}
      <div className="tab-content">
        {activeTab === 'budget' && <UnifiedBudgetTab />}
        {activeTab === 'goals' && <FinancialGoalsTab />}
      </div>

      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .tab-content {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default FinancialDashboard;
