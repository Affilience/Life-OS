/**
 * CashFlowChart - Income vs Expenses visualization
 * Bar chart comparing income and expenses over time
 */

import { useFinancialStore } from '../../stores/financialStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CashFlowChart() {
  const { getCashFlow } = useFinancialStore();

  const data = getCashFlow();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: 'rgba(10, 10, 10, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '12px',
        }}>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '8px',
          }}>
            {formatDate(data.date)}
          </div>
          <div style={{
            display: 'grid',
            gap: '4px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '16px',
            }}>
              <span style={{ color: '#10b981' }}>Income:</span>
              <span style={{ fontWeight: 'bold', color: '#10b981' }}>
                {formatCurrency(data.income)}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '16px',
            }}>
              <span style={{ color: '#ef4444' }}>Expenses:</span>
              <span style={{ fontWeight: 'bold', color: '#ef4444' }}>
                {formatCurrency(data.expenses)}
              </span>
            </div>
            <div style={{
              marginTop: '4px',
              paddingTop: '4px',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '16px',
            }}>
              <span style={{ color: '#fff' }}>Net:</span>
              <span style={{
                fontWeight: 'bold',
                color: data.net >= 0 ? '#10b981' : '#ef4444',
              }}>
                {formatCurrency(data.net)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '24px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
      }}>
        <div style={{ fontSize: '24px' }}>📊</div>
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '2px',
          }}>
            Cash Flow
          </h3>
          <div style={{
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.6)',
          }}>
            Income vs Expenses comparison
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.5)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
          <div style={{ fontSize: '14px' }}>No cash flow data yet</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="rgba(255, 255, 255, 0.5)"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              tickFormatter={(value) => `$${value}`}
              stroke="rgba(255, 255, 255, 0.5)"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ color: '#fff', fontSize: '14px' }}
              iconType="square"
            />
            <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
