import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts';
import './TrendLineChart.css';

export default function TrendLineChart({
  data,
  dataKey,
  name,
  color = '#10b981',
  goal,
  showArea = true,
  timeRange
}) {
  // Custom tooltip
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
    <div className="trend-chart-container">
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
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

          {goal && (
            <ReferenceLine
              y={goal}
              stroke={color}
              strokeDasharray="5 5"
              strokeOpacity={0.5}
              label={{
                value: 'Goal',
                position: 'right',
                fill: color,
                fontSize: 12
              }}
            />
          )}

          {showArea && (
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="none"
              fill="url(#colorGradient)"
              animationDuration={1000}
            />
          )}

          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={3}
            dot={{
              fill: color,
              strokeWidth: 2,
              r: 4,
              stroke: 'rgba(0, 0, 0, 0.3)'
            }}
            activeDot={{
              r: 6,
              stroke: color,
              strokeWidth: 2,
              fill: 'rgba(0, 0, 0, 0.8)'
            }}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
