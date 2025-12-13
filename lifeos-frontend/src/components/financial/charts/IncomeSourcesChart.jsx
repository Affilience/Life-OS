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

// Colors for income sources
const SOURCE_COLORS = {
  salary: '#288cfa',
  freelance: '#00c853',
  business: '#fbbf24',
  consulting: '#7c3aed',
  investment: '#ec4899',
  rental: '#14b8a6',
  dividend: '#f97316',
  bonus: '#06b6d4',
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
        Amount: £{data.value.toLocaleString()}
      </p>
      <p style={{ color: data.payload.color }}>
        {((data.value / data.payload.total) * 100).toFixed(1)}% of total
      </p>
    </div>
  );
};

export default function IncomeSourcesChart() {
  const { transactions, selectedPeriod } = useFinancialStore();

  // Calculate income by source from real data
  const data = useMemo(() => {
    const now = new Date();
    let periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

    if (selectedPeriod === 'week') {
      periodStart = new Date(now);
      periodStart.setDate(now.getDate() - 7);
    } else if (selectedPeriod === 'year') {
      periodStart = new Date(now.getFullYear(), 0, 1);
    }

    // Aggregate income by source/category
    const sourceAmounts = {};
    (transactions || []).forEach(txn => {
      if (txn.type === 'income' && txn.date) {
        const txnDate = new Date(txn.date);
        if (txnDate >= periodStart) {
          const source = txn.source || txn.category || 'other';
          sourceAmounts[source] = (sourceAmounts[source] || 0) + (txn.amount || 0);
        }
      }
    });

    // Convert to chart data format
    const chartData = Object.entries(sourceAmounts)
      .map(([source, value]) => ({
        name: source.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        value: Math.round(value),
        color: SOURCE_COLORS[source.toLowerCase()] || SOURCE_COLORS.other
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return chartData;
  }, [transactions, selectedPeriod]);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithTotal = data.map(item => ({ ...item, total }));

  if (data.length === 0) {
    return (
      <div className="chart-container flex items-center justify-center h-[300px]">
        <p className="text-white/50 text-sm">No income data to display</p>
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
