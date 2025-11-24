import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Target,
  Wallet,
} from 'lucide-react';
import Card from '../ui/Card';
import OverviewTab from './OverviewTab';
import IncomeTab from './IncomeTab';
import ExpensesTab from './ExpensesTab';
import NetWorthTab from './NetWorthTab';
import GoalsTab from './GoalsTab';

const FinancialDashboard = () => {
  const [activeView, setActiveView] = useState('overview');

  const views = [
    { id: 'overview', label: 'Overview', icon: DollarSign },
    { id: 'income', label: 'Income', icon: TrendingUp },
    { id: 'expenses', label: 'Expenses', icon: TrendingDown },
    { id: 'networth', label: 'Net Worth', icon: Wallet },
    { id: 'goals', label: 'Goals', icon: Target },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewTab />;
      case 'income':
        return <IncomeTab />;
      case 'expenses':
        return <ExpensesTab />;
      case 'networth':
        return <NetWorthTab />;
      case 'goals':
        return <GoalsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center">
            <DollarSign size={24} className="text-success" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-high tracking-tighter">
              Nebula
            </h1>
            <p className="text-text-med mt-1">
              Track income, expenses, net worth, and financial goals
            </p>
          </div>
        </div>
      </div>

      {/* View Navigation */}
      <Card padding="none">
        <div className="flex border-b border-border">
          {views.map((view) => {
            const Icon = view.icon;
            const isActive = activeView === view.id;
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium
                  border-b-2 -mb-px transition-all duration-fast
                  ${isActive
                    ? 'border-success text-text-high bg-muted'
                    : 'border-transparent text-text-med hover:text-text-high hover:bg-muted/50'
                  }
                `}
              >
                <Icon size={18} />
                <span>{view.label}</span>
              </button>
            );
          })}
        </div>

        {/* View Content */}
        <div className="p-6">
          {renderView()}
        </div>
      </Card>
    </div>
  );
};

export default FinancialDashboard;
