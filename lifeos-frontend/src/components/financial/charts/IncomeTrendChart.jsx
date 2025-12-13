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
  const percentOfTarget = ((data.amount / data.target) * 100).toFixed(0);
  const isAboveTarget = data.amount >= data.target;

  return (
    <div className="custom-tooltip">
      <p className="tooltip-month">{data.month}</p>
      <p style={{ color: '#00c853', fontWeight: 'bold' }}>
        Income: £{data.amount.toLocaleString()}
      </p>
      <p style={{ color: '#288cfa', fontSize: '12px' }}>
        Target: £{data.target.toLocaleString()}
      </p>
      <p style={{ color: isAboveTarget ? '#00c853' : '#fbbf24', fontSize: '12px', fontWeight: 'bold' }}>
        {percentOfTarget}% of target
      </p>
    </div>
  );
};

export default function IncomeTrendChart() {
  // Connect to store
  const { transactions, monthlyIncomeTarget } = useFinancialStore();

  // Calculate monthly income from transactions
  const data = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyIncome = {};

    // Get last 10 months
    const today = new Date();
    const months = [];
    for (let i = 9; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({ key, month: monthNames[d.getMonth()] });
      monthlyIncome[key] = 0;
    }

    // Sum income transactions by month
    (transactions || []).forEach(txn => {
      if (txn.type === 'income' && txn.date) {
        const monthKey = txn.date.substring(0, 7); // 'YYYY-MM'
        if (monthlyIncome.hasOwnProperty(monthKey)) {
          monthlyIncome[monthKey] += txn.amount || 0;
        }
      }
    });

    // Build chart data
    return months.map(({ key, month }) => ({
      month,
      amount: Math.round(monthlyIncome[key]),
      target: monthlyIncomeTarget || 2500
    }));
  }, [transactions, monthlyIncomeTarget]);

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="incomeBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00c853" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#00c853" stopOpacity={0.6}/>
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
            dataKey="amount"
            radius={[8, 8, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.amount >= entry.target ? 'url(#incomeBar)' : '#fbbf24'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
