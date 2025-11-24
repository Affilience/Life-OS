/**
 * Nebula Header - Key financial metrics at a glance
 * Displays net worth, income, expenses, and period selector
 */

import { useFinancialStore } from '../../stores/financialStore';

export default function FinancialHeader() {
  const {
    getTotalIncome,
    getTotalExpenses,
    getNetIncome,
    getNetWorth,
    selectedPeriod,
    setSelectedPeriod,
  } = useFinancialStore();

  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const netIncome = getNetIncome();
  const netWorth = getNetWorth();

  const periods = [
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'year', label: 'Year' },
    { id: 'all', label: 'All Time' },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyShort = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return formatCurrency(amount);
  };

  return (
    <div style={{
      marginBottom: '32px',
    }}>
      {/* Period Selector */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '4px',
            background: 'linear-gradient(135deg, #10b981, #34d399)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Nebula
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.6)',
          }}>
            Track your money, build your wealth
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '6px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          {periods.map((period) => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id)}
              style={{
                padding: '8px 20px',
                background: selectedPeriod === period.id
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: selectedPeriod === period.id ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
      }}>
        {/* Net Worth */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            fontSize: '80px',
            opacity: 0.1,
          }}>
            💎
          </div>
          <div style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '8px',
            fontWeight: '500',
          }}>
            Net Worth
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#10b981',
            marginBottom: '4px',
          }}>
            {formatCurrencyShort(netWorth)}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.5)',
          }}>
            Total assets - liabilities
          </div>
        </div>

        {/* Total Income */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            fontSize: '80px',
            opacity: 0.1,
          }}>
            💰
          </div>
          <div style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '8px',
            fontWeight: '500',
          }}>
            Total Income
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#3b82f6',
            marginBottom: '4px',
          }}>
            {formatCurrencyShort(totalIncome)}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.5)',
          }}>
            This {selectedPeriod === 'all' ? 'period' : selectedPeriod}
          </div>
        </div>

        {/* Total Expenses */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            fontSize: '80px',
            opacity: 0.1,
          }}>
            💸
          </div>
          <div style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '8px',
            fontWeight: '500',
          }}>
            Total Expenses
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#ef4444',
            marginBottom: '4px',
          }}>
            {formatCurrencyShort(totalExpenses)}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.5)',
          }}>
            This {selectedPeriod === 'all' ? 'period' : selectedPeriod}
          </div>
        </div>

        {/* Net Income */}
        <div style={{
          background: netIncome >= 0
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))'
            : 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05))',
          border: netIncome >= 0
            ? '1px solid rgba(16, 185, 129, 0.2)'
            : '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            fontSize: '80px',
            opacity: 0.1,
          }}>
            {netIncome >= 0 ? '📈' : '📉'}
          </div>
          <div style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '8px',
            fontWeight: '500',
          }}>
            Net Income
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: netIncome >= 0 ? '#10b981' : '#f59e0b',
            marginBottom: '4px',
          }}>
            {formatCurrencyShort(netIncome)}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.5)',
          }}>
            {netIncome >= 0 ? 'Surplus' : 'Deficit'} this {selectedPeriod === 'all' ? 'period' : selectedPeriod}
          </div>
        </div>
      </div>
    </div>
  );
}
