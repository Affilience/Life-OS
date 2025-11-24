/**
 * QuickAddTransaction - AI-powered transaction input
 * Natural language parsing with real-time feedback
 */

import { useState, useEffect } from 'react';
import { useFinancialStore } from '../../stores/financialStore';
import { parseTransaction, validateTransaction, TRANSACTION_EXAMPLES } from '../../services/transactionParser';
import { CATEGORIES } from '../../data/financialData';
import { haptics } from '../../utils/haptics';

export default function QuickAddTransaction() {
  const { addTransaction, accounts } = useFinancialStore();
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]?.name || '');
  const [showSuccess, setShowSuccess] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(0);

  // Parse input in real-time
  useEffect(() => {
    if (input.trim().length > 0) {
      const result = parseTransaction(input);
      setParsed(result);
    } else {
      setParsed(null);
    }
  }, [input]);

  // Rotate example placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setExampleIndex((prev) => (prev + 1) % TRANSACTION_EXAMPLES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateTransaction(parsed)) {
      addTransaction({
        ...parsed,
        account: selectedAccount,
      });

      // Haptic feedback for financial transaction
      // Heavy for large amounts (>$100), medium for smaller
      const amount = Math.abs(parsed?.amount || 0);
      if (amount > 100) {
        await haptics.heavy();
      } else {
        await haptics.medium();
      }

      // Show success animation
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      // Clear input
      setInput('');
      setParsed(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isValid = validateTransaction(parsed);
  const category = parsed?.category ? CATEGORIES[parsed.category] : null;

  return (
    <div style={{
      marginBottom: '32px',
    }}>
      <form onSubmit={handleSubmit}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: isValid
            ? '2px solid rgba(16, 185, 129, 0.3)'
            : '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '24px',
          transition: 'all 0.3s ease',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}>
            <div style={{ fontSize: '24px' }}>💳</div>
            <div>
              <div style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#fff',
              }}>
                Quick Add Transaction
              </div>
              <div style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.5)',
              }}>
                Type naturally - AI will understand
              </div>
            </div>
          </div>

          {/* Input */}
          <div style={{
            position: 'relative',
            marginBottom: '16px',
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={TRANSACTION_EXAMPLES[exampleIndex]}
              style={{
                width: '100%',
                padding: '16px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              autoFocus
            />

            {/* Success Animation */}
            {showSuccess && (
              <div style={{
                position: 'absolute',
                top: '50%',
                right: '16px',
                transform: 'translateY(-50%)',
                fontSize: '24px',
                animation: 'successPop 0.6s ease',
              }}>
                ✅
              </div>
            )}
          </div>

          {/* Parsed Preview */}
          {parsed && (
            <div style={{
              background: isValid
                ? 'rgba(16, 185, 129, 0.1)'
                : 'rgba(245, 158, 11, 0.1)',
              border: isValid
                ? '1px solid rgba(16, 185, 129, 0.2)'
                : '1px dashed rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              animation: 'slideDown 0.3s ease',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '16px',
              }}>
                {/* Amount */}
                <div>
                  <div style={{
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Amount
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: parsed.type === 'income' ? '#10b981' : '#ef4444',
                  }}>
                    {parsed.type === 'income' ? '+' : '-'}
                    ${Math.abs(parsed.amount).toFixed(2)}
                  </div>
                </div>

                {/* Type */}
                <div>
                  <div style={{
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Type
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    {parsed.type === 'income' ? '📈' : '📉'}
                    {parsed.type === 'income' ? 'Income' : 'Expense'}
                  </div>
                </div>

                {/* Category */}
                {category && (
                  <div>
                    <div style={{
                      fontSize: '11px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      Category
                    </div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: category.color,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      {category.icon}
                      {category.name}
                    </div>
                  </div>
                )}

                {/* Merchant */}
                <div>
                  <div style={{
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Merchant
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#fff',
                  }}>
                    {parsed.merchant}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Selector & Submit */}
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.name}>
                  {account.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={!isValid}
              style={{
                padding: '12px 32px',
                background: isValid
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '10px',
                color: isValid ? '#fff' : 'rgba(255, 255, 255, 0.3)',
                fontSize: '15px',
                fontWeight: '600',
                cursor: isValid ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                if (isValid) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              ✓ Add
            </button>
          </div>
        </div>
      </form>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes successPop {
          0% {
            transform: translateY(-50%) scale(0);
            opacity: 0;
          }
          50% {
            transform: translateY(-50%) scale(1.3);
            opacity: 1;
          }
          100% {
            transform: translateY(-50%) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
