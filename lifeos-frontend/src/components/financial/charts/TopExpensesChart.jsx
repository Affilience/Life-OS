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

// Mock data for top expense categories this month
const data = [
  { category: 'Food', amount: 385, color: '#ff6b6b' },
  { category: 'Health', amount: 285, color: '#4ecdc4' },
  { category: 'Learning', amount: 250, color: '#45b7d1' },
  { category: 'Discretionary', amount: 180, color: '#f9ca24' },
  { category: 'Transport', amount: 120, color: '#95afc0' }
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  const total = 1220; // Sum of all expenses
  const percentage = ((data.value / total) * 100).toFixed(1);

  return (
    <div className="custom-tooltip">
      <p className="tooltip-title">{data.payload.category}</p>
      <p style={{ color: data.payload.color, fontWeight: 'bold' }}>
        Amount: £{data.value.toLocaleString()}
      </p>
      <p style={{ color: data.payload.color, fontSize: '12px' }}>
        {percentage}% of total expenses
      </p>
    </div>
  );
};

export default function TopExpensesChart() {
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            type="number"
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `£${value}`}
          />
          <YAxis
            type="category"
            dataKey="category"
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="amount"
            radius={[0, 8, 8, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
