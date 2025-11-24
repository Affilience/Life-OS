import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// Mock data for last 12 months
const data = [
  { month: 'Jan', income: 2400, expenses: 1800, net: 600 },
  { month: 'Feb', income: 2600, expenses: 1900, net: 700 },
  { month: 'Mar', income: 2500, expenses: 2100, net: 400 },
  { month: 'Apr', income: 2800, expenses: 1850, net: 950 },
  { month: 'May', income: 2700, expenses: 1950, net: 750 },
  { month: 'Jun', income: 3000, expenses: 2000, net: 1000 },
  { month: 'Jul', income: 2900, expenses: 1900, net: 1000 },
  { month: 'Aug', income: 2850, expenses: 2050, net: 800 },
  { month: 'Sep', income: 2950, expenses: 1875, net: 1075 },
  { month: 'Oct', income: 2850, expenses: 1420, net: 1430 },
  { month: 'Nov', income: 0, expenses: 0, net: 0 },
  { month: 'Dec', income: 0, expenses: 0, net: 0 }
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload) return null;

  return (
    <div className="custom-tooltip">
      <p className="tooltip-month">{payload[0]?.payload.month}</p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color }}>
          {entry.name}: £{entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function SpendingTrendChart() {
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00c853" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#00c853" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff1744" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ff1744" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#288cfa" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#288cfa" stopOpacity={0.1}/>
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
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#00c853"
            strokeWidth={2}
            dot={{ fill: '#00c853', r: 4 }}
            activeDot={{ r: 6 }}
            name="Income"
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#ff1744"
            strokeWidth={2}
            dot={{ fill: '#ff1744', r: 4 }}
            activeDot={{ r: 6 }}
            name="Expenses"
          />
          <Line
            type="monotone"
            dataKey="net"
            stroke="#288cfa"
            strokeWidth={3}
            dot={{ fill: '#288cfa', r: 5 }}
            activeDot={{ r: 7 }}
            name="Net Savings"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
