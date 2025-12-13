import React from 'react';

/**
 * TabNavigation - Unified tab navigation component for consistent styling across modules
 *
 * This component provides the standard tab bar used in Health, Productivity, Calendar, etc.
 * Ensures consistent look and feel across all module pages.
 *
 * @param {Array} tabs - Array of tab objects { id, label, icon: LucideIcon }
 * @param {string} activeTab - ID of the currently active tab
 * @param {function} onTabChange - Callback when tab is clicked
 * @param {string} module - Module name for color theming (productivity, health, calendar, etc.)
 * @param {string} className - Additional CSS classes
 */

// Module accent colors for the active tab border
const moduleAccentColors = {
  productivity: 'border-indigo-500',
  health: 'border-emerald-500',
  knowledge: 'border-violet-500',
  journal: 'border-violet-500',
  calendar: 'border-rose-500',
  financial: 'border-emerald-500',
  missions: 'border-purple-500',
  progress: 'border-purple-500',
  habits: 'border-amber-500',
  skills: 'border-cyan-500',
  social: 'border-pink-500',
  purpose: 'border-indigo-500',
  default: 'border-purple-500',
};

const TabNavigation = ({
  tabs,
  activeTab,
  onTabChange,
  module = 'default',
  className = '',
}) => {
  const accentColor = moduleAccentColors[module] || moduleAccentColors.default;

  return (
    <div className={`flex border-b border-border overflow-x-auto scrollbar-hide ${className}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium
              border-b-2 -mb-px transition-all duration-fast whitespace-nowrap
              ${isActive
                ? `${accentColor} text-text-high bg-muted`
                : 'border-transparent text-text-med hover:text-text-high hover:bg-muted/50'
              }
            `}
          >
            {Icon && <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className={`
                ml-1 sm:ml-1.5 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full
                ${isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/60'
                }
              `}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default TabNavigation;
