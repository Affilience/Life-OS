import React, { useMemo } from 'react';
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
import { useFinancialStore } from '../../../stores/financialStore';

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
  const { transactions } = useFinancialStore();

  // Calculate monthly income/expenses from transactions
  const data = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();

    // Build last 12 months
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyData.push({
        month: monthNames[d.getMonth()],
        monthKey,
        income: 0,
        expenses: 0
      });
    }

    // Sum transactions by month
    (transactions || []).forEach(txn => {
      if (!txn.date) return;
      const txnMonthKey = txn.date.substring(0, 7);
      const monthEntry = monthlyData.find(m => m.monthKey === txnMonthKey);
      if (monthEntry) {
        if (txn.type === 'income') {
          monthEntry.income += txn.amount || 0;
        } else if (txn.type === 'expense') {
          monthEntry.expenses += Math.abs(txn.amount || 0);
        }
      }
    });

    // Calculate net and return
    return monthlyData.map(m => ({
      month: m.month,
      income: Math.round(m.income),
      expenses: Math.round(m.expenses),
      net: Math.round(m.income - m.expenses)
    }));
  }, [transactions]);

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
