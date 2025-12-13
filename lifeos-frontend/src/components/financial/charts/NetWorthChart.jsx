import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useFinancialStore } from '../../../stores/financialStore';

const CustomTooltip = ({ active, payload, data }) => {
  if (!active || !payload || !payload.length) return null;

  const currentValue = payload[0].value;
  const index = payload[0].payload.index;
  const previousValue = index > 0 && data ? data[index - 1]?.netWorth : currentValue;
  const change = currentValue - (previousValue || currentValue);
  const changePercent = previousValue > 0 ? ((change / previousValue) * 100).toFixed(1) : 0;

  return (
    <div className="custom-tooltip">
      <p className="tooltip-month">{payload[0].payload.month}</p>
      <p style={{ color: '#00c853', fontWeight: 'bold' }}>
        £{currentValue.toLocaleString()}
      </p>
      {index > 0 && (
        <p style={{ color: change >= 0 ? '#00c853' : '#ff1744', fontSize: '12px' }}>
          {change >= 0 ? '+' : ''}£{change.toLocaleString()} ({changePercent}%)
        </p>
      )}
    </div>
  );
};

export default function NetWorthChart() {
  const { transactions, accounts } = useFinancialStore();

  // Calculate net worth over time from transactions
  const data = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();

    // Get current net worth from accounts
    const currentNetWorth = (accounts || []).reduce((sum, acc) => sum + (acc.balance || 0), 0);

    // Build monthly net worth by working backwards from transactions
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyData.push({
        month: monthNames[d.getMonth()],
        monthKey,
        income: 0,
        expenses: 0
      });
    }

    // Sum income and expenses by month
    (transactions || []).forEach(txn => {
      if (!txn.date) return;
      const txnMonthKey = txn.date.substring(0, 7);
      const monthEntry = monthlyData.find(m => m.monthKey === txnMonthKey);
      if (monthEntry) {
        if (txn.type === 'income') {
          monthEntry.income += txn.amount || 0;
        } else if (txn.type === 'expense') {
          monthEntry.expenses += Math.abs(txn.amount || 0);
        }
      }
    });

    // Calculate cumulative net worth (estimate by working backwards)
    let runningNetWorth = currentNetWorth;
    const result = [];

    // Work backwards from current month
    for (let i = monthlyData.length - 1; i >= 0; i--) {
      const month = monthlyData[i];
      result.unshift({
        month: month.month,
        netWorth: Math.round(runningNetWorth)
      });
      // Subtract net change to get previous month's value
      runningNetWorth -= (month.income - month.expenses);
    }

    return result;
  }, [transactions, accounts]);

  const dataWithIndex = data.map((item, index) => ({ ...item, index }));

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart
          data={dataWithIndex}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00c853" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#00c853" stopOpacity={0.1}/>
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
            tickFormatter={(value) => `£${(value/1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="netWorth"
            stroke="#00c853"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorNetWorth)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
