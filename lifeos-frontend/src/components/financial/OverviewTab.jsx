import React, { useState, lazy, Suspense, useMemo } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, PiggyBank, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import SpendingTrendChart from './charts/SpendingTrendChart';
import CategoryBreakdownChart from './charts/CategoryBreakdownChart';
import BudgetVsActualChart from './charts/BudgetVsActualChart';
import NetWorthChart from './charts/NetWorthChart';
import { useFinancialStore } from '../../stores/financialStore';
import './OverviewTab.css';

// Lazy load modals
const AddIncomeModal = lazy(() => import('./AddIncomeModal'));
const AddExpenseModal = lazy(() => import('./AddExpenseModal'));

export default function OverviewTab() {
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Connect to financial store
  const {
    getTotalIncome,
    getTotalExpenses,
    getNetIncome,
    getNetWorth,
    transactions
  } = useFinancialStore();

  // Calculate monthly data from store
  const monthlyData = useMemo(() => {
    const income = getTotalIncome();
    const expenses = getTotalExpenses();
    const net = income - expenses;
    const savingsRate = income > 0 ? Math.round((net / income) * 100) : 0;

    return { income, expenses, net, savingsRate };
  }, [getTotalIncome, getTotalExpenses]);

  // Calculate net worth from store
  const netWorthData = useMemo(() => {
    const current = getNetWorth();
    // For change calculation, we'd need historical data - using monthly net as proxy
    const changeThisMonth = monthlyData.net;
    const changePercent = current > 0 ? Math.round((changeThisMonth / (current - changeThisMonth)) * 100 * 10) / 10 : 0;

    return { current, changeThisMonth, changePercent: isFinite(changePercent) ? changePercent : 0 };
  }, [getNetWorth, monthlyData.net]);

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
            <div className="summary-meta">
              {transactions.filter(t => t.type === 'income').length} transactions
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
            <div className="summary-meta">
              {transactions.filter(t => t.type === 'expense').length} transactions
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
            <div className="summary-value">£{netWorthData.current.toLocaleString()}</div>
            {netWorthData.changeThisMonth !== 0 && (
              <div className={`summary-change ${netWorthData.changeThisMonth >= 0 ? 'positive' : 'negative'}`}>
                {netWorthData.changeThisMonth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{netWorthData.changeThisMonth >= 0 ? '+' : ''}£{netWorthData.changeThisMonth.toLocaleString()} ({netWorthData.changePercent}%)</span>
              </div>
            )}
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
          {transactions.length === 0 ? (
            <div className="empty-state text-center py-6 text-white/50">
              No transactions yet. Add your first income or expense above.
            </div>
          ) : (
            transactions.slice(0, 5).map((txn) => (
              <div key={txn.id} className={`transaction-item ${txn.type}`}>
                <div className="transaction-icon">
                  {txn.type === 'income' ? <TrendingUp /> : <TrendingDown />}
                </div>
                <div className="transaction-info">
                  <div className="transaction-title">{txn.description || txn.category}</div>
                  <div className="transaction-meta">
                    {new Date(txn.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })} • {txn.category}
                  </div>
                </div>
                <div className={`transaction-amount ${txn.type === 'income' ? 'positive' : 'negative'}`}>
                  {txn.type === 'income' ? '+' : '-'}£{Math.abs(txn.amount).toLocaleString()}
                </div>
              </div>
            ))
          )}
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
