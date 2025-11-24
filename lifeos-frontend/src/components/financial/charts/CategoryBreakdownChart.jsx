import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

// Mock expense data by category
const data = [
  { name: 'Food & Dining', value: 450, color: '#ff6b6b' },
  { name: 'Transport', value: 200, color: '#4ecdc4' },
  { name: 'Bills & Utilities', value: 380, color: '#45b7d1' },
  { name: 'Health & Fitness', value: 120, color: '#96ceb4' },
  { name: 'Learning', value: 150, color: '#ffeaa7' },
  { name: 'Discretionary', value: 120, color: '#fd79a8' }
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      style={{ fontSize: '14px', fontWeight: 'bold' }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  return (
    <div className="custom-tooltip">
      <p className="tooltip-title">{data.name}</p>
      <p style={{ color: data.payload.color }}>
        Amount: £{data.value.toLocaleString()}
      </p>
      <p style={{ color: data.payload.color }}>
        {((data.value / data.payload.total) * 100).toFixed(1)}% of total
      </p>
    </div>
  );
};

export default function CategoryBreakdownChart() {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithTotal = data.map(item => ({ ...item, total }));

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={dataWithTotal}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value, entry) => (
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                {value}: £{entry.payload.value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
