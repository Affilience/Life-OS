import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

// Mock budget vs actual data
const data = [
  { category: 'Food', budget: 500, actual: 450, variance: -50 },
  { category: 'Transport', budget: 180, actual: 200, variance: 20 },
  { category: 'Bills', budget: 400, actual: 380, variance: -20 },
  { category: 'Health', budget: 150, actual: 120, variance: -30 },
  { category: 'Learning', budget: 200, actual: 150, variance: -50 },
  { category: 'Fun', budget: 150, actual: 120, variance: -30 }
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const percentVariance = ((data.actual - data.budget) / data.budget * 100).toFixed(1);
  const isUnder = data.variance < 0;

  return (
    <div className="custom-tooltip">
      <p className="tooltip-title">{data.category}</p>
      <p style={{ color: '#288cfa' }}>
        Budget: £{data.budget.toLocaleString()}
      </p>
      <p style={{ color: isUnder ? '#00c853' : '#ff1744' }}>
        Actual: £{data.actual.toLocaleString()}
      </p>
      <p style={{ color: isUnder ? '#00c853' : '#ff1744', fontWeight: 'bold' }}>
        {isUnder ? 'Under' : 'Over'} by £{Math.abs(data.variance)} ({Math.abs(percentVariance)}%)
      </p>
    </div>
  );
};

export default function BudgetVsActualChart() {
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="category"
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `£${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="rect"
          />
          <Bar
            dataKey="budget"
            fill="#288cfa"
            name="Budget"
            radius={[4, 4, 0, 0]}
            opacity={0.6}
          />
          <Bar
            dataKey="actual"
            name="Actual"
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.variance < 0 ? '#00c853' : '#ff1744'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
