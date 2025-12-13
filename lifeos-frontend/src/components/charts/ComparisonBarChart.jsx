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
import './TrendLineChart.css';

export default function ComparisonBarChart({
  data,
  dataKey,
  name,
  color = '#10b981',
  timeRange
}) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <div className="tooltip-label">{label}</div>
          <div className="tooltip-value">
            {name}: <span className="tooltip-number">{payload[0].value}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="comparison-chart-container">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={1}/>
            <stop offset="100%" stopColor={color} stopOpacity={0.6}/>
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255, 255, 255, 0.05)"
          vertical={false}
        />

        <XAxis
          dataKey="date"
          stroke="rgba(255, 255, 255, 0.3)"
          style={{
            fontSize: '12px',
            fontFamily: 'var(--font-family-mono)'
          }}
        />

        <YAxis
          stroke="rgba(255, 255, 255, 0.3)"
          style={{
            fontSize: '12px',
            fontFamily: 'var(--font-family-mono)'
          }}
        />

        <Tooltip content={<CustomTooltip />} />

        <Bar
          dataKey={dataKey}
          fill="url(#barGradient)"
          radius={[8, 8, 0, 0]}
          animationDuration={800}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              style={{
                filter: 'drop-shadow(0 4px 12px rgba(16, 185, 129, 0.3))'
              }}
            />
          ))}
        </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
