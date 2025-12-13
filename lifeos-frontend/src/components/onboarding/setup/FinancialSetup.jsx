/**
 * Financial Module Setup
 * Collects income, budget categories, and savings goals
 */

import React, { useState } from 'react';
import FirstRunSetup, {
  SetupStep,
  SetupOptionCard,
  SetupNumberInput,
  SetupChipSelect
} from './FirstRunSetup';
import { useFinancialStore } from '../../../stores/financialStore';

const INCOME_PRESETS = [
  { value: 2000, label: '$2k' },
  { value: 3000, label: '$3k' },
  { value: 4000, label: '$4k' },
  { value: 5000, label: '$5k' },
  { value: 7500, label: '$7.5k' },
  { value: 10000, label: '$10k' }
];

const SAVINGS_PRESETS = [
  { value: 10, label: '10%' },
  { value: 15, label: '15%' },
  { value: 20, label: '20%' },
  { value: 25, label: '25%' },
  { value: 30, label: '30%' }
];

const BUDGET_PRIORITIES = [
  { id: 'savings', icon: '💰', label: 'Build Savings', description: 'Emergency fund & investments' },
  { id: 'debt', icon: '💳', label: 'Pay Off Debt', description: 'Focus on becoming debt-free' },
  { id: 'lifestyle', icon: '✨', label: 'Quality of Life', description: 'Balance saving & enjoying' },
  { id: 'growth', icon: '📈', label: 'Invest in Growth', description: 'Education & business' }
];

const EXPENSE_CATEGORIES = [
  { id: 'housing', icon: '🏠', label: 'Housing' },
  { id: 'food', icon: '🍔', label: 'Food & Dining' },
  { id: 'transport', icon: '🚗', label: 'Transportation' },
  { id: 'utilities', icon: '💡', label: 'Utilities' },
  { id: 'health', icon: '⚕️', label: 'Health' },
  { id: 'entertainment', icon: '🎬', label: 'Entertainment' },
  { id: 'shopping', icon: '🛍️', label: 'Shopping' },
  { id: 'subscriptions', icon: '📱', label: 'Subscriptions' },
  { id: 'education', icon: '📚', label: 'Education' },
  { id: 'personal', icon: '💆', label: 'Personal Care' }
];

export default function FinancialSetup({ onComplete, onSkip }) {
  const [localData, setLocalData] = useState({
    monthlyIncome: 3000,
    budgetPriority: 'lifestyle',
    savingsRate: 20,
    trackedCategories: ['housing', 'food', 'transport', 'entertainment', 'subscriptions']
  });

  const { setMonthlyIncomeTarget } = useFinancialStore();

  const handleComplete = (data) => {
    // Save to financial store
    setMonthlyIncomeTarget(localData.monthlyIncome);
    onComplete?.(localData);
  };

  return (
    <FirstRunSetup
      moduleId="financial"
      onComplete={handleComplete}
      onSkip={onSkip}
    >
      {/* Step 1: Monthly Income */}
      <SetupStep
        title="What's your monthly income?"
        description="This helps with zero-based budgeting"
      >
        {({ onNext }) => (
          <>
            <SetupNumberInput
              value={localData.monthlyIncome}
              onChange={(val) => setLocalData({ ...localData, monthlyIncome: val })}
              min={500}
              max={50000}
              step={100}
              unit="$/month"
              presets={INCOME_PRESETS}
            />
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="setup-nav-btn primary"
                onClick={() => onNext(localData)}
              >
                Continue →
              </button>
            </div>
          </>
        )}
      </SetupStep>

      {/* Step 2: Budget Priority */}
      <SetupStep
        title="What's your financial priority?"
        description="We'll tailor suggestions based on this"
      >
        {({ onNext }) => (
          <>
            {BUDGET_PRIORITIES.map((priority) => (
              <SetupOptionCard
                key={priority.id}
                icon={priority.icon}
                label={priority.label}
                description={priority.description}
                selected={localData.budgetPriority === priority.id}
                onClick={() => setLocalData({ ...localData, budgetPriority: priority.id })}
              />
            ))}
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="setup-nav-btn primary"
                onClick={() => onNext(localData)}
              >
                Continue →
              </button>
            </div>
          </>
        )}
      </SetupStep>

      {/* Step 3: Savings Rate */}
      <SetupStep
        title="Target savings rate"
        description="Percentage of income to save each month"
      >
        {({ onNext }) => (
          <>
            <SetupNumberInput
              value={localData.savingsRate}
              onChange={(val) => setLocalData({ ...localData, savingsRate: val })}
              min={5}
              max={80}
              step={5}
              unit="%"
              presets={SAVINGS_PRESETS}
            />
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
              That's ${Math.round(localData.monthlyIncome * localData.savingsRate / 100)}/month based on your income
            </p>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="setup-nav-btn primary"
                onClick={() => onNext(localData)}
              >
                Continue →
              </button>
            </div>
          </>
        )}
      </SetupStep>

      {/* Step 4: Categories to Track */}
      <SetupStep
        title="Which expenses do you want to track?"
        description="Select the categories relevant to you"
        nextLabel="Finish Setup"
      >
        {({ onNext }) => (
          <>
            <SetupChipSelect
              options={EXPENSE_CATEGORIES}
              selected={localData.trackedCategories}
              onChange={(selected) => setLocalData({ ...localData, trackedCategories: selected })}
            />
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="setup-nav-btn primary"
                onClick={() => onNext(localData)}
              >
                Finish Setup ✓
              </button>
            </div>
          </>
        )}
      </SetupStep>
    </FirstRunSetup>
  );
}
