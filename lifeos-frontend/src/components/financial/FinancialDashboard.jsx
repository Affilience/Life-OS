import React, { useState } from 'react';
import {
  Wallet,
  Target,
  DollarSign,
  Settings,
} from 'lucide-react';
import UnifiedBudgetTab from './UnifiedBudgetTab';
import FinancialGoalsTab from './FinancialGoalsTab';
import PageHeader from '../shared/PageHeader';
import { useFinancialStore } from '../../stores/financialStore';

// Common currencies with symbols
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Đồng' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso' },
  { code: 'COP', symbol: '$', name: 'Colombian Peso' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
];

/**
 * FinancialDashboard - Streamlined 2-tab financial management
 *
 * Tabs:
 * 1. Budget - All income, expenses, budgets, and visualizations in one place
 * 2. Goals - Savings goals with daily/weekly/monthly payment allocations
 */

const FinancialDashboard = () => {
  const [activeTab, setActiveTab] = useState('budget');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const { currency, setCurrency } = useFinancialStore();

  const currentCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  const tabs = [
    { id: 'budget', name: 'Budget', icon: Wallet },
    { id: 'goals', name: 'Goals', icon: Target },
  ];

  return (
    <div className="financial-page min-h-screen bg-[#0c0a10]">
      {/* Page Header */}
      <div className="px-4 pt-6 overflow-visible">
        <PageHeader
          title="Finances"
          subtitle="Track spending, manage budgets, and reach your savings goals"
          icon={DollarSign}
          module="financial"
          variant="elevated"
          actions={
            <div className="relative">
              <button
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="flex items-center gap-2 px-3 py-2 bg-[#1a1724] border border-white/10 rounded-lg text-white/80 hover:bg-[#1a1724]/80 hover:border-emerald-500/30 transition-all"
              >
                <span className="text-lg">{currentCurrency.symbol}</span>
                <span className="text-sm font-medium">{currentCurrency.code}</span>
                <Settings className="w-4 h-4 text-white/40" />
              </button>

              {showCurrencyDropdown && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowCurrencyDropdown(false)}
                  />
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-64 bg-[#12101a] border border-white/10 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
                    <div className="p-2 border-b border-white/10">
                      <p className="text-xs text-white/50 px-2">Select Currency</p>
                    </div>
                    <div className="p-1">
                      {CURRENCIES.map((curr) => (
                        <button
                          key={curr.code}
                          onClick={() => {
                            setCurrency(curr.code);
                            setShowCurrencyDropdown(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                            currency === curr.code
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'text-white/80 hover:bg-white/5'
                          }`}
                        >
                          <span className="text-lg w-6 text-center">{curr.symbol}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{curr.code}</p>
                            <p className="text-xs text-white/40">{curr.name}</p>
                          </div>
                          {currency === curr.code && (
                            <span className="text-emerald-400">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          }
        />
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-40 bg-[#0c0a10] border-b border-slate-800" data-tour="financial-tabs">
        <div className="flex overflow-x-auto hide-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-tour={`financial-tab-${tab.id}`}
                className={`flex-1 min-w-[120px] px-4 py-4 flex flex-col items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/20 text-emerald-400 border-b-2 border-emerald-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1724]/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-semibold">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Content */}
      <div className="tab-content">
        {activeTab === 'budget' && <UnifiedBudgetTab />}
        {activeTab === 'goals' && <FinancialGoalsTab />}
      </div>

      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .tab-content {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default FinancialDashboard;
