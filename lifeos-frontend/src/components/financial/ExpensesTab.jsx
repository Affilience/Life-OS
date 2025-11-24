import React, { useState, lazy, Suspense } from 'react';
import { Plus, TrendingDown, Percent, DollarSign, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import StatCard from '../shared/StatCard';
import Badge from '../shared/Badge';
import ExpenseTrendChart from './charts/ExpenseTrendChart';
import CategoryBreakdownChart from './charts/CategoryBreakdownChart';
import TopExpensesChart from './charts/TopExpensesChart';
import './ExpensesTab.css';

// Lazy load modal
const AddExpenseModal = lazy(() => import('./AddExpenseModal'));

export default function ExpensesTab() {
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const stats = {
    thisMonth: 1420,
    lastMonth: 1350,
    avgMonthly: 1385,
    ytd: 14205
  };

  const expenseEntries = [
    {
      id: 1,
      date: '2025-10-26',
      description: 'Groceries',
      category: 'Food',
      amount: 85,
      type: 'Essential'
    },
    {
      id: 2,
      date: '2025-10-24',
      description: 'Gym Membership',
      category: 'Health',
      amount: 35,
      type: 'Essential'
    },
    {
      id: 3,
      date: '2025-10-22',
      description: 'Course - React Advanced',
      category: 'Learning',
      amount: 80,
      type: 'Investment'
    },
    {
      id: 4,
      date: '2025-10-20',
      description: 'Dinner with friends',
      category: 'Discretionary',
      amount: 45,
      type: 'Discretionary'
    },
    {
      id: 5,
      date: '2025-10-18',
      description: 'Bus pass',
      category: 'Transport',
      amount: 60,
      type: 'Essential'
    }
  ];

  const categoryTotals = [
    { category: 'Food', amount: 385, percentage: 27 },
    { category: 'Health', amount: 285, percentage: 20 },
    { category: 'Learning', amount: 250, percentage: 18 },
    { category: 'Discretionary', amount: 180, percentage: 13 },
    { category: 'Transport', amount: 120, percentage: 8 },
    { category: 'Other', amount: 200, percentage: 14 }
  ];

  return (
    <div className="expenses-tab">
      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          icon={TrendingDown}
          label="Expenses This Month"
          value={`£${stats.thisMonth.toLocaleString()}`}
          change={`+£${stats.thisMonth - stats.lastMonth} from last month`}
          changeType="negative"
          color="financial"
        />
        <StatCard
          icon={TrendingDown}
          label="Last Month"
          value={`£${stats.lastMonth.toLocaleString()}`}
          color="financial"
        />
        <StatCard
          icon={Percent}
          label="Avg Monthly"
          value={`£${stats.avgMonthly.toLocaleString()}`}
          subtext="Last 3 months"
          color="financial"
        />
        <StatCard
          icon={DollarSign}
          label="Year to Date"
          value={`£${stats.ytd.toLocaleString()}`}
          subtext="2025 total"
          color="financial"
        />
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Expense Trend */}
        <Card className="chart-card">
          <Card.Header>
            <div className="chart-header">
              <BarChart3 size={20} className="header-icon negative" />
              <div>
                <h3 className="card-title">Monthly Expense Trend</h3>
                <p className="card-subtitle">Track spending against budget</p>
              </div>
            </div>
          </Card.Header>
          <ExpenseTrendChart />
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

        {/* Top Expenses */}
        <Card className="chart-card large">
          <Card.Header>
            <div className="chart-header">
              <BarChart3 size={20} className="header-icon" />
              <div>
                <h3 className="card-title">Top Spending Categories</h3>
                <p className="card-subtitle">Where your money goes</p>
              </div>
            </div>
          </Card.Header>
          <TopExpensesChart />
        </Card>
      </div>

      <div className="expenses-grid">
        {/* Category Breakdown */}
        <Card>
          <Card.Header>
            <h3 className="card-title">Spending by Category</h3>
          </Card.Header>

          <div className="category-list">
            {categoryTotals.map(cat => (
              <div key={cat.category} className="category-item">
                <div className="category-info">
                  <span className="category-name">{cat.category}</span>
                  <span className="category-amount">£{cat.amount}</span>
                </div>
                <div className="category-bar">
                  <div
                    className="category-fill"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
                <span className="category-percentage">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Expense List */}
        <Card className="expense-list-card">
          <Card.Header>
            <h3 className="card-title">Recent Expenses</h3>
            <Button
              variant="primary"
              leftIcon={<Plus size={18} />}
              onClick={() => setShowExpenseModal(true)}
            >
              Add Expense
            </Button>
          </Card.Header>

          <div className="expense-list">
            {expenseEntries.map(entry => (
              <div key={entry.id} className="expense-item">
                <div className="expense-main">
                  <div className="expense-date">
                    {new Date(entry.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </div>
                  <div className="expense-details">
                    <div className="expense-description">{entry.description}</div>
                    <div className="expense-meta">
                      <Badge variant="muted" size="small">
                        {entry.category}
                      </Badge>
                      <span className="expense-type">{entry.type}</span>
                    </div>
                  </div>
                  <div className="expense-amount">-£{entry.amount}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Modal */}
      <Suspense fallback={null}>
        {showExpenseModal && (
          <AddExpenseModal onClose={() => setShowExpenseModal(false)} />
        )}
      </Suspense>
    </div>
  );
}