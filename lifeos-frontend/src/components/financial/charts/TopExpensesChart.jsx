import React, { useMemo } from 'react';
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
import { useFinancialStore, ENVELOPE_CATEGORIES } from '../../../stores/financialStore';

// Category colors
const CATEGORY_COLORS = {
  food: '#ff6b6b',
  dining: '#ff8787',
  transportation: '#4ecdc4',
  health: '#96ceb4',
  education: '#45b7d1',
  entertainment: '#f9ca24',
  shopping: '#74b9ff',
  utilities: '#81ecec',
  housing: '#a29bfe',
  subscriptions: '#fd79a8',
  personal: '#fab1a0',
  travel: '#00b894',
  other: '#95afc0'
};

export default function TopExpensesChart() {
  const { transactions, selectedPeriod } = useFinancialStore();

  // Calculate top expenses by category
  const { data, total } = useMemo(() => {
    const now = new Date();
    let periodStart = new Date(now.getFullYear(), now.getMonth(), 1); // Default: this month

    if (selectedPeriod === 'week') {
      periodStart = new Date(now);
      periodStart.setDate(now.getDate() - 7);
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
          categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(txn.amount || 0);
        }
      }
    });

    // Build sorted data
    const chartData = Object.entries(categoryTotals)
      .map(([categoryId, amount]) => {
        const categoryConfig = ENVELOPE_CATEGORIES[categoryId] || {};
        const name = categoryConfig.name || categoryId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        return {
          category: name,
          amount: Math.round(amount),
          color: CATEGORY_COLORS[categoryId] || '#95afc0'
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const totalExpenses = chartData.reduce((sum, item) => sum + item.amount, 0);
    return { data: chartData, total: totalExpenses };
  }, [transactions, selectedPeriod]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const item = payload[0];
    const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;

    return (
      <div className="custom-tooltip">
        <p className="tooltip-title">{item.payload.category}</p>
        <p style={{ color: item.payload.color, fontWeight: 'bold' }}>
          Amount: £{item.value.toLocaleString()}
        </p>
        <p style={{ color: item.payload.color, fontSize: '12px' }}>
          {percentage}% of total expenses
        </p>
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className="chart-container flex items-center justify-center h-[300px]">
        <p className="text-white/50 text-sm">No expense data to display</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            type="number"
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `£${value}`}
          />
          <YAxis
            type="category"
            dataKey="category"
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="amount"
            radius={[0, 8, 8, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
