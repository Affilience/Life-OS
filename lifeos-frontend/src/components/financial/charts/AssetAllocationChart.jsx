import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { useFinancialStore } from '../../../stores/financialStore';

// Colors for asset types
const ASSET_COLORS = {
  savings: '#00c853',
  checking: '#288cfa',
  investment: '#7c3aed',
  crypto: '#ec4899',
  retirement: '#14b8a6',
  property: '#f97316',
  business: '#fbbf24',
  cash: '#06b6d4',
  other: '#95afc0'
};

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
        Value: £{data.value.toLocaleString()}
      </p>
      <p style={{ color: data.payload.color }}>
        {((data.value / data.payload.total) * 100).toFixed(1)}% of total
      </p>
    </div>
  );
};

export default function AssetAllocationChart() {
  const { accounts } = useFinancialStore();

  // Calculate asset allocation from accounts
  const data = useMemo(() => {
    // Group accounts by type
    const assetsByType = {};
    (accounts || []).forEach(acc => {
      if (acc.balance > 0) {
        const type = acc.type || 'other';
        assetsByType[type] = (assetsByType[type] || 0) + acc.balance;
      }
    });

    // Convert to chart data format
    const chartData = Object.entries(assetsByType)
      .map(([type, value]) => ({
        name: type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        value: Math.round(value),
        color: ASSET_COLORS[type.toLowerCase()] || ASSET_COLORS.other
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

    return chartData;
  }, [accounts]);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithTotal = data.map(item => ({ ...item, total }));

  if (data.length === 0) {
    return (
      <div className="chart-container flex items-center justify-center h-[300px]">
        <p className="text-white/50 text-sm">No asset data to display</p>
      </div>
    );
  }

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
