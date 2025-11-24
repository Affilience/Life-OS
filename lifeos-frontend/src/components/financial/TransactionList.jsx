/**
 * TransactionList - Beautiful transaction cards
 * Recent transactions with category colors and icons
 */

import { useFinancialStore } from '../../stores/financialStore';
import { CATEGORIES } from '../../data/financialData';

export default function TransactionList() {
  const { getFilteredTransactions } = useFinancialStore();

  const transactions = getFilteredTransactions().slice(0, 10);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
        <div style={{ fontSize: '24px' }}>📝</div>
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '2px',
          }}>
            Recent Transactions
          </h3>
          <div style={{
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.6)',
          }}>
            Your latest financial activity
          </div>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.5)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
          <div style={{ fontSize: '14px' }}>No transactions yet</div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '12px',
        }}>
          {transactions.map((transaction) => {
            const category = CATEGORIES[transaction.category];

            return (
              <div
                key={transaction.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${category?.color || '#64748b'}20`,
                  borderLeft: `4px solid ${category?.color || '#64748b'}`,
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {/* Icon */}
                <div style={{
                  fontSize: '32px',
                  flexShrink: 0,
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${category?.color || '#64748b'}15`,
                  borderRadius: '12px',
                }}>
                  {category?.icon || '📦'}
                </div>

                {/* Details */}
                <div style={{
                  flex: 1,
                  minWidth: 0,
                }}>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#fff',
                    marginBottom: '4px',
                  }}>
                    {transaction.description}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <span>{category?.name || 'Other'}</span>
                    <span>•</span>
                    <span>{transaction.account}</span>
                    {transaction.recurring && (
                      <>
                        <span>•</span>
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          background: 'rgba(59, 130, 246, 0.2)',
                          borderRadius: '4px',
                          color: '#3b82f6',
                        }}>
                          Recurring
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Amount & Date */}
                <div style={{
                  textAlign: 'right',
                  flexShrink: 0,
                }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: transaction.type === 'income' ? '#10b981' : '#fff',
                    marginBottom: '4px',
                  }}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}>
                    {formatDate(transaction.date)}
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
