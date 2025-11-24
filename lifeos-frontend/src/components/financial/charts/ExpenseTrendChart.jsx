import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

// Mock monthly expense data with budget
const data = [
  { month: 'Jan', amount: 1350, budget: 1400 },
  { month: 'Feb', amount: 1280, budget: 1400 },
  { month: 'Mar', amount: 1420, budget: 1400 },
  { month: 'Apr', amount: 1310, budget: 1400 },
  { month: 'May', amount: 1480, budget: 1400 },
  { month: 'Jun', amount: 1390, budget: 1400 },
  { month: 'Jul', amount: 1450, budget: 1400 },
  { month: 'Aug', amount: 1380, budget: 1400 },
  { month: 'Sep', amount: 1340, budget: 1400 },
  { month: 'Oct', amount: 1420, budget: 1400 }
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const variance = data.budget - data.amount;
  const isUnderBudget = variance >= 0;

  return (
    <div className="custom-tooltip">
      <p className="tooltip-month">{data.month}</p>
      <p style={{ color: '#ff1744', fontWeight: 'bold' }}>
        Spent: £{data.amount.toLocaleString()}
      </p>
      <p style={{ color: '#288cfa', fontSize: '12px' }}>
        Budget: £{data.budget.toLocaleString()}
      </p>
      <p style={{ color: isUnderBudget ? '#00c853' : '#ff1744', fontSize: '12px', fontWeight: 'bold' }}>
        {isUnderBudget ? 'Under' : 'Over'} by £{Math.abs(variance)}
      </p>
    </div>
  );
};

export default function ExpenseTrendChart() {
  const avgBudget = data.reduce((sum, item) => sum + item.budget, 0) / data.length;

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="expenseBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff1744" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#ff1744" stopOpacity={0.6}/>
            </linearGradient>
            <linearGradient id="underBudgetBar" x1="0" y1="0" x2="0" y2="1">
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
          <ReferenceLine
            y={avgBudget}
            stroke="#288cfa"
            strokeDasharray="3 3"
            label={{ value: 'Avg Budget', fill: '#288cfa', fontSize: 12 }}
          />
          <Bar
            dataKey="amount"
            radius={[8, 8, 0, 0]}
            fill="url(#expenseBar)"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
