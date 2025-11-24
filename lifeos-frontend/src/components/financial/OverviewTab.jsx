import React, { useState, lazy, Suspense } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, PiggyBank, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import SpendingTrendChart from './charts/SpendingTrendChart';
import CategoryBreakdownChart from './charts/CategoryBreakdownChart';
import BudgetVsActualChart from './charts/BudgetVsActualChart';
import NetWorthChart from './charts/NetWorthChart';
import './OverviewTab.css';

// Lazy load modals
const AddIncomeModal = lazy(() => import('./AddIncomeModal'));
const AddExpenseModal = lazy(() => import('./AddExpenseModal'));

export default function OverviewTab() {
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Mock data
  const monthlyData = {
    income: 2850,
    expenses: 1420,
    net: 1430,
    savingsRate: 50
  };

  const netWorth = {
    current: 13005,
    changeThisMonth: 1430,
    changePercent: 12.3
  };

  return (
    <div className="overview-tab">
      {/* Main Summary Cards */}
      <div className="summary-cards">
        <Card className="summary-card income-card">
          <div className="summary-icon">
            <TrendingUp />
          </div>
          <div className="summary-content">
            <div className="summary-label">Income This Month</div>
            <div className="summary-value">£{monthlyData.income.toLocaleString()}</div>
            <div className="summary-change positive">
              <TrendingUp size={14} />
              <span>+12% from last month</span>
            </div>
          </div>
        </Card>

        <Card className="summary-card expense-card">
          <div className="summary-icon">
            <TrendingDown />
          </div>
          <div className="summary-content">
            <div className="summary-label">Expenses This Month</div>
            <div className="summary-value">£{monthlyData.expenses.toLocaleString()}</div>
            <div className="summary-change negative">
              <TrendingDown size={14} />
              <span>+5% from last month</span>
            </div>
          </div>
        </Card>

        <Card className="summary-card net-card">
          <div className="summary-icon">
            <DollarSign />
          </div>
          <div className="summary-content">
            <div className="summary-label">Net This Month</div>
            <div className="summary-value">£{monthlyData.net.toLocaleString()}</div>
            <div className="summary-meta">
              Savings Rate: <strong>{monthlyData.savingsRate}%</strong>
            </div>
          </div>
        </Card>

        <Card className="summary-card networth-card">
          <div className="summary-icon">
            <PiggyBank />
          </div>
          <div className="summary-content">
            <div className="summary-label">Net Worth</div>
            <div className="summary-value">£{netWorth.current.toLocaleString()}</div>
            <div className="summary-change positive">
              <TrendingUp size={14} />
              <span>+£{netWorth.changeThisMonth} ({netWorth.changePercent}%)</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <Card.Header>
          <h3 className="card-title">Quick Actions</h3>
        </Card.Header>

        <div className="quick-actions-grid">
          <Button
            variant="primary"
            leftIcon={<Plus size={18} />}
            className="action-button"
            onClick={() => setShowIncomeModal(true)}
          >
            Add Income
          </Button>
          <Button
            variant="secondary"
            leftIcon={<Plus size={18} />}
            className="action-button"
            onClick={() => setShowExpenseModal(true)}
          >
            Add Expense
          </Button>
          <Button variant="secondary" leftIcon={<PiggyBank size={18} />} className="action-button">
            Update Net Worth
          </Button>
        </div>
      </Card>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Income vs Expenses Trend */}
        <Card className="chart-card large">
          <Card.Header>
            <div className="chart-header">
              <BarChart3 size={20} className="header-icon" />
              <div>
                <h3 className="card-title">Income vs Expenses</h3>
                <p className="card-subtitle">Last 12 months trend analysis</p>
              </div>
            </div>
          </Card.Header>
          <SpendingTrendChart />
        </Card>

        {/* Net Worth Progression */}
        <Card className="chart-card">
          <Card.Header>
            <div className="chart-header">
              <TrendingUp size={20} className="header-icon positive" />
              <div>
                <h3 className="card-title">Net Worth Growth</h3>
                <p className="card-subtitle">Track your wealth over time</p>
              </div>
            </div>
          </Card.Header>
          <NetWorthChart />
        </Card>

        {/* Category Breakdown */}
        <Card className="chart-card">
          <Card.Header>
            <div className="chart-header">
              <PieChartIcon size={20} className="header-icon" />
              <div>
                <h3 className="card-title">Spending by Category</h3>
                <p className="card-subtitle">This month's breakdown</p>
              </div>
            </div>
          </Card.Header>
          <CategoryBreakdownChart />
        </Card>

        {/* Budget vs Actual */}
        <Card className="chart-card">
          <Card.Header>
            <div className="chart-header">
              <BarChart3 size={20} className="header-icon" />
              <div>
                <h3 className="card-title">Budget vs Actual</h3>
                <p className="card-subtitle">Stay on track with your budget</p>
              </div>
            </div>
          </Card.Header>
          <BudgetVsActualChart />
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <Card.Header>
          <h3 className="card-title">Recent Transactions</h3>
        </Card.Header>

        <div className="transactions-list">
          <div className="transaction-item income">
            <div className="transaction-icon">
              <TrendingUp />
            </div>
            <div className="transaction-info">
              <div className="transaction-title">Client Payment</div>
              <div className="transaction-meta">Oct 25 • Freelance</div>
            </div>
            <div className="transaction-amount positive">+£1,500</div>
          </div>

          <div className="transaction-item expense">
            <div className="transaction-icon">
              <TrendingDown />
            </div>
            <div className="transaction-info">
              <div className="transaction-title">Gym Membership</div>
              <div className="transaction-meta">Oct 24 • Health</div>
            </div>
            <div className="transaction-amount negative">-£35</div>
          </div>

          <div className="transaction-item income">
            <div className="transaction-icon">
              <TrendingUp />
            </div>
            <div className="transaction-info">
              <div className="transaction-title">Product Sale</div>
              <div className="transaction-meta">Oct 22 • Business</div>
            </div>
            <div className="transaction-amount positive">+£250</div>
          </div>
        </div>
      </Card>

      {/* Modals */}
      <Suspense fallback={null}>
        {showIncomeModal && (
          <AddIncomeModal onClose={() => setShowIncomeModal(false)} />
        )}
        {showExpenseModal && (
          <AddExpenseModal onClose={() => setShowExpenseModal(false)} />
        )}
      </Suspense>
    </div>
  );
}
