import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { useFinancialStore } from '../../../stores/financialStore';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const variance = data.budget - data.amount;
  const isUnderBudget = variance >= 0;

  return (
    <div className="custom-tooltip">
      <p className="tooltip-month">{data.month}</p>
      <p style={{ color: '#ff1744', fontWeight: 'bold' }}>
        Spent: £{data.amount.toLocaleString()}
      </p>
      <p style={{ color: '#288cfa', fontSize: '12px' }}>
        Budget: £{data.budget.toLocaleString()}
      </p>
      <p style={{ color: isUnderBudget ? '#00c853' : '#ff1744', fontSize: '12px', fontWeight: 'bold' }}>
        {isUnderBudget ? 'Under' : 'Over'} by £{Math.abs(variance)}
      </p>
    </div>
  );
};

export default function ExpenseTrendChart() {
  const { transactions, envelopeBudgets } = useFinancialStore();

  // Calculate expense trend over time
  const data = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();

    // Build last 10 months
    const monthlyData = [];
    for (let i = 9; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      // Get total budget for this month from envelopeBudgets
      const monthBudgets = envelopeBudgets?.[monthKey] || {};
      const totalBudget = Object.values(monthBudgets).reduce((sum, val) => sum + (val || 0), 0) || 1500;

      monthlyData.push({
        month: monthNames[d.getMonth()],
        monthKey,
        amount: 0,
        budget: totalBudget
      });
    }

    // Sum expenses by month
    (transactions || []).forEach(txn => {
      if (txn.type === 'expense' && txn.date) {
        const txnMonthKey = txn.date.substring(0, 7);
        const monthEntry = monthlyData.find(m => m.monthKey === txnMonthKey);
        if (monthEntry) {
          monthEntry.amount += Math.abs(txn.amount || 0);
        }
      }
    });

    return monthlyData.map(m => ({
      month: m.month,
      amount: Math.round(m.amount),
      budget: m.budget
    }));
  }, [transactions, envelopeBudgets]);

  const avgBudget = data.reduce((sum, item) => sum + item.budget, 0) / data.length;

  if (data.length === 0 || data.every(d => d.amount === 0)) {
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
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="expenseBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff1744" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#ff1744" stopOpacity={0.6}/>
            </linearGradient>
            <linearGradient id="underBudgetBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00c853" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#00c853" stopOpacity={0.6}/>
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
          <ReferenceLine
            y={avgBudget}
            stroke="#288cfa"
            strokeDasharray="3 3"
            label={{ value: 'Avg Budget', fill: '#288cfa', fontSize: 12 }}
          />
          <Bar
            dataKey="amount"
            radius={[8, 8, 0, 0]}
            fill="url(#expenseBar)"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
