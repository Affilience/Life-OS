import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Mock net worth data over past 12 months
const data = [
  { month: 'Jan', netWorth: 5000 },
  { month: 'Feb', netWorth: 5600 },
  { month: 'Mar', netWorth: 6000 },
  { month: 'Apr', netWorth: 6950 },
  { month: 'May', netWorth: 7700 },
  { month: 'Jun', netWorth: 8700 },
  { month: 'Jul', netWorth: 9700 },
  { month: 'Aug', netWorth: 10500 },
  { month: 'Sep', netWorth: 11575 },
  { month: 'Oct', netWorth: 13005 },
  { month: 'Nov', netWorth: 13005 },
  { month: 'Dec', netWorth: 13005 }
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const currentValue = payload[0].value;
  const index = payload[0].payload.index;
  const previousValue = index > 0 ? data[index - 1].netWorth : currentValue;
  const change = currentValue - previousValue;
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
