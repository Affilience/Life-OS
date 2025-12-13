import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { useFinancialStore, ENVELOPE_CATEGORIES } from '../../../stores/financialStore';

// Category colors mapping
const CATEGORY_COLORS = {
  food: '#ff6b6b',
  transportation: '#4ecdc4',
  utilities: '#45b7d1',
  health: '#96ceb4',
  education: '#ffeaa7',
  dining: '#fd79a8',
  entertainment: '#a29bfe',
  shopping: '#74b9ff',
  housing: '#81ecec',
  insurance: '#dfe6e9',
  subscriptions: '#b2bec3',
  personal: '#fab1a0',
  travel: '#00b894',
  gifts: '#e84393',
  other: '#636e72'
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

export default function CategoryBreakdownChart() {
  // Connect to store
  const { transactions, selectedPeriod } = useFinancialStore();

  // Calculate category breakdown from transactions
  const data = useMemo(() => {
    // Get date filter based on selected period
    const now = new Date();
    let periodStart = new Date(0); // All time default

    if (selectedPeriod === 'week') {
      periodStart = new Date(now);
      periodStart.setDate(now.getDate() - 7);
    } else if (selectedPeriod === 'month') {
      periodStart = new Date(now);
      periodStart.setMonth(now.getMonth() - 1);
    } else if (selectedPeriod === 'year') {
      periodStart = new Date(now);
      periodStart.setFullYear(now.getFullYear() - 1);
    }

    // Aggregate expenses by category
    const categoryTotals = {};
    (transactions || []).forEach(txn => {
      if (txn.type === 'expense' && txn.date) {
        const txnDate = new Date(txn.date);
        if (txnDate >= periodStart) {
          const category = txn.category || 'other';
          if (!categoryTotals[category]) {
            categoryTotals[category] = 0;
          }
          categoryTotals[category] += Math.abs(txn.amount || 0);
        }
      }
    });

    // Build chart data
    return Object.entries(categoryTotals)
      .filter(([_, value]) => value > 0)
      .map(([categoryId, value]) => {
        const categoryConfig = ENVELOPE_CATEGORIES[categoryId] || {};
        const name = categoryConfig.name || categoryId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        return {
          name,
          value: Math.round(value),
          color: CATEGORY_COLORS[categoryId] || '#636e72'
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 categories
  }, [transactions, selectedPeriod]);

  // If no data, show placeholder
  if (data.length === 0) {
    return (
      <div className="chart-container flex items-center justify-center h-[300px]">
        <p className="text-white/50 text-sm">No expense data to display</p>
      </div>
    );
  }

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
