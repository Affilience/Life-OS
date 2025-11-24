/**
 * SavingsGoals - Progress rings for savings goals
 * Visual tracking of financial goals
 */

import { useFinancialStore } from '../../stores/financialStore';

export default function SavingsGoals() {
  const { getSavingsProgress } = useFinancialStore();

  const goals = getSavingsProgress();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const ProgressRing = ({ percentage, color, size = 120 }) => {
    const radius = (size - 12) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
    );
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
        <div style={{ fontSize: '24px' }}>💰</div>
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '2px',
          }}>
            Savings Goals
          </h3>
          <div style={{
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.6)',
          }}>
            Track your financial milestones
          </div>
        </div>
      </div>

      {goals.length === 0 ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.5)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>💰</div>
          <div style={{ fontSize: '14px' }}>No savings goals yet</div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '20px',
        }}>
          {goals.map((goal) => (
            <div
              key={goal.id}
              style={{
                background: `${goal.color}08`,
                border: `1px solid ${goal.color}20`,
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              {/* Progress Ring */}
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <ProgressRing
                  percentage={goal.percentage}
                  color={goal.color}
                  size={120}
                />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '4px' }}>
                    {goal.icon}
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: goal.color,
                  }}>
                    {Math.round(goal.percentage)}%
                  </div>
                </div>
              </div>

              {/* Goal Info */}
              <div style={{
                textAlign: 'center',
                width: '100%',
              }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#fff',
                }}>
                  {goal.name}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '4px',
                  fontSize: '13px',
                }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Current
                  </span>
                  <span style={{
                    fontWeight: '600',
                    color: goal.color,
                  }}>
                    {formatCurrency(goal.current)}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '13px',
                }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Target
                  </span>
                  <span style={{
                    fontWeight: '600',
                    color: '#fff',
                  }}>
                    {formatCurrency(goal.target)}
                  </span>
                </div>

                <div style={{
                  fontSize: '12px',
                  color: goal.daysUntilDeadline < 30
                    ? '#f59e0b'
                    : 'rgba(255, 255, 255, 0.5)',
                  marginTop: '8px',
                  padding: '6px 12px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '6px',
                }}>
                  {goal.daysUntilDeadline > 0
                    ? `${goal.daysUntilDeadline} days left`
                    : goal.daysUntilDeadline === 0
                    ? 'Due today'
                    : 'Overdue'
                  }
                </div>

                {goal.status === 'complete' && (
                  <div style={{
                    marginTop: '8px',
                    padding: '6px 12px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    borderRadius: '6px',
                    color: '#10b981',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}>
                    ✓ Goal Achieved!
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
