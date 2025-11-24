/**
 * BudgetTracker - Budget progress visualization
 * Shows spending limits and current progress
 */

import { useFinancialStore } from '../../stores/financialStore';

export default function BudgetTracker() {
  const { getBudgetProgress } = useFinancialStore();

  const budgets = getBudgetProgress();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'over':
        return '#ef4444';
      default:
        return '#64748b';
    }
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
        <div style={{ fontSize: '24px' }}>🎯</div>
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '2px',
          }}>
            Budget Tracker
          </h3>
          <div style={{
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.6)',
          }}>
            Stay within your spending limits
          </div>
        </div>
      </div>

      {budgets.length === 0 ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.5)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎯</div>
          <div style={{ fontSize: '14px' }}>No budgets set yet</div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '16px',
        }}>
          {budgets.map((budget) => {
            const statusColor = getStatusColor(budget.status);

            return (
              <div
                key={budget.id}
                style={{
                  background: `${statusColor}08`,
                  border: `1px solid ${statusColor}20`,
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}>
                    <div style={{ fontSize: '24px' }}>
                      {budget.icon}
                    </div>
                    <div>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#fff',
                      }}>
                        {budget.name}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.5)',
                      }}>
                        {budget.period}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    textAlign: 'right',
                  }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: statusColor,
                    }}>
                      {formatCurrency(budget.spent)}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.5)',
                    }}>
                      of {formatCurrency(budget.limit)}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{
                  position: 'relative',
                  height: '8px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '8px',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${Math.min(budget.percentage, 100)}%`,
                    background: `linear-gradient(90deg, ${statusColor}, ${statusColor}dd)`,
                    borderRadius: '4px',
                    transition: 'width 0.5s ease',
                  }} />
                </div>

                {/* Status */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                }}>
                  <div style={{
                    color: statusColor,
                    fontWeight: '600',
                  }}>
                    {budget.percentage.toFixed(0)}% used
                  </div>
                  <div style={{
                    color: budget.remaining >= 0
                      ? 'rgba(255, 255, 255, 0.6)'
                      : '#ef4444',
                  }}>
                    {budget.remaining >= 0
                      ? `${formatCurrency(budget.remaining)} remaining`
                      : `${formatCurrency(Math.abs(budget.remaining))} over`
                    }
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
