import React from 'react';
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

// Mock monthly income data
const data = [
  { month: 'Jan', amount: 2400, target: 2500 },
  { month: 'Feb', amount: 2600, target: 2500 },
  { month: 'Mar', amount: 2500, target: 2500 },
  { month: 'Apr', amount: 2800, target: 2500 },
  { month: 'May', amount: 2700, target: 2500 },
  { month: 'Jun', amount: 3000, target: 2500 },
  { month: 'Jul', amount: 2900, target: 2500 },
  { month: 'Aug', amount: 2850, target: 2500 },
  { month: 'Sep', amount: 2950, target: 2500 },
  { month: 'Oct', amount: 2850, target: 2500 }
];

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
