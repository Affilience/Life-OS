/**
 * CategoryBreakdown - Donut chart showing spending by category
 * Visual breakdown of where money is going
 */

import { useFinancialStore } from '../../stores/financialStore';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function CategoryBreakdown() {
  const { getCategorySpending, getTotalExpenses } = useFinancialStore();

  const categoryData = getCategorySpending();
  const totalExpenses = getTotalExpenses();

  // Sort by amount (highest first)
  const sortedData = [...categoryData].sort((a, b) => b.amount - a.amount);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div style={{
          background: 'rgba(10, 10, 10, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '12px',
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#fff',
            marginBottom: '4px',
          }}>
            {data.payload.icon} {data.payload.name}
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: data.payload.color,
          }}>
            {formatCurrency(data.value)}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.6)',
          }}>
            {((data.value / totalExpenses) * 100).toFixed(1)}% of spending
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
            Spending by Category
          </h3>
          <div style={{
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.6)',
          }}>
            Where your money goes
          </div>
        </div>
      </div>

      {sortedData.length === 0 ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.5)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
          <div style={{ fontSize: '14px' }}>No spending data yet</div>
        </div>
      ) : (
        <div>
          {/* Pie Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sortedData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="amount"
              >
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Category List */}
          <div style={{
            marginTop: '24px',
            display: 'grid',
            gap: '12px',
          }}>
            {sortedData.slice(0, 5).map((category) => {
              const percentage = ((category.amount / totalExpenses) * 100).toFixed(1);

              return (
                <div
                  key={category.category}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: category.color,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ fontSize: '20px', flexShrink: 0 }}>
                    {category.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#fff',
                      marginBottom: '2px',
                    }}>
                      {category.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.5)',
                    }}>
                      {percentage}% of spending
                    </div>
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: category.color,
                    flexShrink: 0,
                  }}>
                    {formatCurrency(category.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
