import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useFinancialStore, ENVELOPE_CATEGORIES } from '../../../stores/financialStore';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const percentVariance = ((data.actual - data.budget) / data.budget * 100).toFixed(1);
  const isUnder = data.variance < 0;

  return (
    <div className="custom-tooltip">
      <p className="tooltip-title">{data.category}</p>
      <p style={{ color: '#288cfa' }}>
        Budget: £{data.budget.toLocaleString()}
      </p>
      <p style={{ color: isUnder ? '#00c853' : '#ff1744' }}>
        Actual: £{data.actual.toLocaleString()}
      </p>
      <p style={{ color: isUnder ? '#00c853' : '#ff1744', fontWeight: 'bold' }}>
        {isUnder ? 'Under' : 'Over'} by £{Math.abs(data.variance)} ({Math.abs(percentVariance)}%)
      </p>
    </div>
  );
};

export default function BudgetVsActualChart() {
  const { transactions, selectedPeriod } = useFinancialStore();
  const getEnvelopeStatus = useFinancialStore(state => state.getEnvelopeStatus);

  // Calculate budget vs actual from real data
  const data = useMemo(() => {
    // Get current month's envelope status (includes allocated and spent)
    const envelopeStatus = getEnvelopeStatus ? getEnvelopeStatus() : {};

    // Build chart data from envelope status
    const chartData = [];
    Object.values(envelopeStatus).forEach(env => {
      const categoryConfig = ENVELOPE_CATEGORIES[env.categoryId] || {};
      const name = categoryConfig.name || env.categoryId?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown';
      const budget = env.allocated || 0;
      const actual = Math.round(env.spent || 0);
      const variance = actual - budget;

      if (budget > 0 || actual > 0) {
        chartData.push({
          category: name,
          budget: Math.round(budget),
          actual,
          variance
        });
      }
    });

    // Sort by budget descending and limit to 6
    return chartData.sort((a, b) => b.budget - a.budget).slice(0, 6);
  }, [transactions, getEnvelopeStatus]);

  if (data.length === 0) {
    return (
      <div className="chart-container flex items-center justify-center h-[300px]">
        <p className="text-white/50 text-sm">No budget data to display</p>
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
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="category"
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
            iconType="rect"
          />
          <Bar
            dataKey="budget"
            fill="#288cfa"
            name="Budget"
            radius={[4, 4, 0, 0]}
            opacity={0.6}
          />
          <Bar
            dataKey="actual"
            name="Actual"
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.variance < 0 ? '#00c853' : '#ff1744'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
