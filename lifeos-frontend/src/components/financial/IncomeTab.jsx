import React, { useState, lazy, Suspense } from 'react';
import { Plus, TrendingUp, DollarSign, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import StatCard from '../shared/StatCard';
import Badge from '../shared/Badge';
import IncomeSourcesChart from './charts/IncomeSourcesChart';
import IncomeTrendChart from './charts/IncomeTrendChart';
import './IncomeTab.css';

// Lazy load modal
const AddIncomeModal = lazy(() => import('./AddIncomeModal'));

export default function IncomeTab() {
  const [showIncomeModal, setShowIncomeModal] = useState(false);

  const stats = {
    thisMonth: 2850,
    lastMonth: 2540,
    avgMonthly: 2695,
    ytd: 27450
  };

  const incomeEntries = [
    {
      id: 1,
      date: '2025-10-25',
      source: 'Client Project',
      category: 'Freelance',
      amount: 1500,
      project: 'Website Build',
      hoursWorked: 20,
      effectiveRate: 75
    },
    {
      id: 2,
      date: '2025-10-22',
      source: 'Product Sale',
      category: 'Business',
      amount: 250,
      notes: 'Digital product'
    },
    {
      id: 3,
      date: '2025-10-18',
      source: 'Consulting',
      category: 'Freelance',
      amount: 800,
      hoursWorked: 8,
      effectiveRate: 100
    },
    {
      id: 4,
      date: '2025-10-15',
      source: 'Monthly Retainer',
      category: 'Business',
      amount: 300,
      project: 'Ongoing Support'
    }
  ];

  return (
    <div className="income-tab">
      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          icon={DollarSign}
          label="Income This Month"
          value={`£${stats.thisMonth.toLocaleString()}`}
          change={`+£${stats.thisMonth - stats.lastMonth} from last month`}
          changeType="positive"
          color="financial"
        />
        <StatCard
          icon={TrendingUp}
          label="Last Month"
          value={`£${stats.lastMonth.toLocaleString()}`}
          color="financial"
        />
        <StatCard
          icon={DollarSign}
          label="Avg Monthly"
          value={`£${stats.avgMonthly.toLocaleString()}`}
          subtext="Last 3 months"
          color="financial"
        />
        <StatCard
          icon={TrendingUp}
          label="Year to Date"
          value={`£${stats.ytd.toLocaleString()}`}
          subtext="2025 total"
          color="financial"
        />
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Income Trend */}
        <Card className="chart-card">
          <Card.Header>
            <div className="chart-header">
              <BarChart3 size={20} className="header-icon positive" />
              <div>
                <h3 className="card-title">Monthly Income Trend</h3>
                <p className="card-subtitle">Track your income over time</p>
              </div>
            </div>
          </Card.Header>
          <IncomeTrendChart />
        </Card>

        {/* Income by Source */}
        <Card className="chart-card">
          <Card.Header>
            <div className="chart-header">
              <PieChartIcon size={20} className="header-icon" />
              <div>
                <h3 className="card-title">Income by Source</h3>
                <p className="card-subtitle">Revenue stream breakdown</p>
              </div>
            </div>
          </Card.Header>
          <IncomeSourcesChart />
        </Card>
      </div>

      {/* Income List */}
      <Card>
        <Card.Header>
          <h3 className="card-title">Income History</h3>
          <Button
            variant="primary"
            leftIcon={<Plus size={18} />}
            onClick={() => setShowIncomeModal(true)}
          >
            Add Income
          </Button>
        </Card.Header>

        <div className="income-table-container">
          <table className="income-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Source</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Effective Rate</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {incomeEntries.map(entry => (
                <tr key={entry.id}>
                  <td className="income-date">
                    {new Date(entry.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </td>
                  <td className="income-source">{entry.source}</td>
                  <td>
                    <Badge variant="muted" size="small">
                      {entry.category}
                    </Badge>
                  </td>
                  <td className="income-amount">£{entry.amount.toLocaleString()}</td>
                  <td className="income-rate">
                    {entry.effectiveRate ? `£${entry.effectiveRate}/hr` : '-'}
                  </td>
                  <td className="income-notes">
                    {entry.project || entry.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <Suspense fallback={null}>
        {showIncomeModal && (
          <AddIncomeModal onClose={() => setShowIncomeModal(false)} />
        )}
      </Suspense>
    </div>
  );
}
