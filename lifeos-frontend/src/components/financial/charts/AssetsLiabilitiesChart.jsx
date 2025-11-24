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

// Mock assets vs liabilities over time
const data = [
  { month: 'Jan', assets: 7200, liabilities: 0, netWorth: 7200 },
  { month: 'Feb', assets: 7800, liabilities: 0, netWorth: 7800 },
  { month: 'Mar', assets: 8100, liabilities: 0, netWorth: 8100 },
  { month: 'Apr', assets: 8900, liabilities: 0, netWorth: 8900 },
  { month: 'May', assets: 9600, liabilities: 0, netWorth: 9600 },
  { month: 'Jun', assets: 10500, liabilities: 0, netWorth: 10500 },
  { month: 'Jul', assets: 11400, liabilities: 0, netWorth: 11400 },
  { month: 'Aug', assets: 12250, liabilities: 0, netWorth: 12250 },
  { month: 'Sep', assets: 12600, liabilities: 0, netWorth: 12600 },
  { month: 'Oct', assets: 13005, liabilities: 0, netWorth: 13005 }
];

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
