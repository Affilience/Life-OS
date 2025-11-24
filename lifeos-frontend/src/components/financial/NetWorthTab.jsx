import React from 'react';
import { PiggyBank, TrendingUp, BarChart3, PieChart as PieChartIcon, DollarSign } from 'lucide-react';
import Card from '../shared/Card';
import StatCard from '../shared/StatCard';
import NetWorthChart from './charts/NetWorthChart';
import AssetAllocationChart from './charts/AssetAllocationChart';
import AssetsLiabilitiesChart from './charts/AssetsLiabilitiesChart';
import './NetWorthTab.css';

export default function NetWorthTab() {
  const assets = {
    cash: 3500,
    investments: 2000,
    business: 2500,
    equipment: 500
  };

  const liabilities = {
    total: 0
  };

  const netWorth = Object.values(assets).reduce((a, b) => a + b, 0) - liabilities.total;
  const lastMonthNetWorth = 11575;
  const monthGrowth = netWorth - lastMonthNetWorth;
  const growthPercent = ((monthGrowth / lastMonthNetWorth) * 100).toFixed(1);

  return (
    <div className="networth-tab">
      <div className="stats-grid">
        <StatCard
          icon={PiggyBank}
          label="Net Worth"
          value={`£${netWorth.toLocaleString()}`}
          change={`+£${monthGrowth} this month`}
          changeType="positive"
          color="financial"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Assets"
          value={`£${Object.values(assets).reduce((a, b) => a + b, 0).toLocaleString()}`}
          color="financial"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Liabilities"
          value={`£${liabilities.total}`}
          subtext="Debt free!"
          color="financial"
        />
        <StatCard
          icon={DollarSign}
          label="Monthly Growth"
          value={`+${growthPercent}%`}
          subtext={`£${monthGrowth} increase`}
          color="financial"
        />
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Net Worth Growth */}
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

        {/* Asset Allocation */}
        <Card className="chart-card">
          <Card.Header>
            <div className="chart-header">
              <PieChartIcon size={20} className="header-icon" />
              <div>
                <h3 className="card-title">Asset Allocation</h3>
                <p className="card-subtitle">How your wealth is distributed</p>
              </div>
            </div>
          </Card.Header>
          <AssetAllocationChart />
        </Card>

        {/* Assets vs Liabilities */}
        <Card className="chart-card large">
          <Card.Header>
            <div className="chart-header">
              <BarChart3 size={20} className="header-icon" />
              <div>
                <h3 className="card-title">Assets vs Liabilities</h3>
                <p className="card-subtitle">Monthly balance sheet progression</p>
              </div>
            </div>
          </Card.Header>
          <AssetsLiabilitiesChart />
        </Card>
      </div>

      <div className="networth-grid">
        <Card>
          <Card.Header>
            <h3 className="card-title">Assets</h3>
          </Card.Header>
          <div className="asset-list">
            <div className="asset-item">
              <span>Cash & Savings</span>
              <strong>£{assets.cash.toLocaleString()}</strong>
            </div>
            <div className="asset-item">
              <span>Investments</span>
              <strong>£{assets.investments.toLocaleString()}</strong>
            </div>
            <div className="asset-item">
              <span>Business Value</span>
              <strong>£{assets.business.toLocaleString()}</strong>
            </div>
            <div className="asset-item">
              <span>Equipment</span>
              <strong>£{assets.equipment.toLocaleString()}</strong>
            </div>
            <div className="asset-item total">
              <span>Total Assets</span>
              <strong>£{Object.values(assets).reduce((a, b) => a + b, 0).toLocaleString()}</strong>
            </div>
          </div>
        </Card>

        <Card>
          <Card.Header>
            <h3 className="card-title">Liabilities</h3>
          </Card.Header>
          <div className="liabilities-content">
            <div className="empty-state">
              <PiggyBank size={48} />
              <p className="empty-title">No liabilities - Great job!</p>
              <p className="empty-text">Keep building your net worth debt-free</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}