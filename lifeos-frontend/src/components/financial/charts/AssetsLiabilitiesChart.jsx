import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useFinancialStore } from '../../../stores/financialStore';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="custom-tooltip">
      <p className="tooltip-month">{data.month}</p>
      <p style={{ color: '#00c853', fontWeight: 'bold' }}>
        Assets: £{data.assets.toLocaleString()}
      </p>
      <p style={{ color: '#ff1744', fontSize: '12px' }}>
        Liabilities: £{data.liabilities.toLocaleString()}
      </p>
      <p style={{ color: '#288cfa', fontSize: '12px', fontWeight: 'bold' }}>
        Net Worth: £{data.netWorth.toLocaleString()}
      </p>
    </div>
  );
};

export default function AssetsLiabilitiesChart() {
  const { transactions, accounts } = useFinancialStore();

  // Calculate assets and liabilities over time
  const data = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();

    // Get current totals from accounts
    let currentAssets = 0;
    let currentLiabilities = 0;
    (accounts || []).forEach(acc => {
      if (acc.balance >= 0) {
        currentAssets += acc.balance;
      } else {
        currentLiabilities += Math.abs(acc.balance);
      }
    });

    // Build monthly data
    const monthlyData = [];
    for (let i = 9; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyData.push({
        month: monthNames[d.getMonth()],
        monthKey,
        netChange: 0
      });
    }

    // Calculate net change per month from transactions
    (transactions || []).forEach(txn => {
      if (!txn.date) return;
      const txnMonthKey = txn.date.substring(0, 7);
      const monthEntry = monthlyData.find(m => m.monthKey === txnMonthKey);
      if (monthEntry) {
        if (txn.type === 'income') {
          monthEntry.netChange += txn.amount || 0;
        } else if (txn.type === 'expense') {
          monthEntry.netChange -= Math.abs(txn.amount || 0);
        }
      }
    });

    // Work backwards from current values
    let runningAssets = currentAssets;
    const result = [];
    for (let i = monthlyData.length - 1; i >= 0; i--) {
      const month = monthlyData[i];
      result.unshift({
        month: month.month,
        assets: Math.round(runningAssets),
        liabilities: Math.round(currentLiabilities), // Simplified: keep liabilities constant
        netWorth: Math.round(runningAssets - currentLiabilities)
      });
      runningAssets -= month.netChange;
    }

    return result;
  }, [transactions, accounts]);

  if (data.length === 0 || data.every(d => d.assets === 0 && d.liabilities === 0)) {
    return (
      <div className="chart-container flex items-center justify-center h-[300px]">
        <p className="text-white/50 text-sm">No data to display</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="assetsBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00c853" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#00c853" stopOpacity={0.6}/>
            </linearGradient>
            <linearGradient id="liabilitiesBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff1744" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#ff1744" stopOpacity={0.6}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="month"
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `£${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="assets"
            fill="url(#assetsBar)"
            radius={[8, 8, 0, 0]}
            name="Assets"
          />
          <Bar
            dataKey="liabilities"
            fill="url(#liabilitiesBar)"
            radius={[8, 8, 0, 0]}
            name="Liabilities"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
