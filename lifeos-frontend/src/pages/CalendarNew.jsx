import React, { useState } from 'react';
import { List, Grid, Calendar, CalendarDays } from 'lucide-react';
import CosmicWeekView from '../components/calendar/CosmicWeekView';
import CosmicDayView from '../components/calendar/CosmicDayView';
import CosmicMonthView from '../components/calendar/CosmicMonthView';
import { CalendarSetup } from '../components/onboarding/setup';
import useIntegratedOnboardingStore from '../stores/integratedOnboardingStore';
import PageHeader from '../components/shared/PageHeader';

/**
 * Astral Map - Calendar & Time
 *
 * Plan your time, track actual usage, and optimize your schedule
 */

const CalendarNew = () => {
  const [activeView, setActiveView] = useState('week');
  const { isModuleComplete, hasSeenWelcome, isOnboardingComplete } = useIntegratedOnboardingStore();

  // Show setup wizard if calendar module not configured during onboarding
  const showSetup = hasSeenWelcome && !isOnboardingComplete && !isModuleComplete('calendar');

  const tabs = [
    { id: 'month', name: 'Month', icon: CalendarDays },
    { id: 'week', name: 'Week', icon: Grid },
    { id: 'day', name: 'Day', icon: List },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'month':
        return <CosmicMonthView />;
      case 'week':
        return <CosmicWeekView />;
      case 'day':
        return <CosmicDayView />;
      default:
        return <CosmicWeekView />;
    }
  };

  return (
    <div className="calendar-page min-h-screen bg-bg-0">
      {/* Page Header */}
      <div className="px-4 pt-6">
        <PageHeader
          title="Calendar"
          subtitle="Plan your time, track actual usage, and optimize your schedule"
          icon={Calendar}
          module="calendar"
          variant="elevated"
        />
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-40 bg-bg-0 border-b border-border" data-tour="calendar-views">
        <div className="flex overflow-x-auto hide-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex-1 min-w-[120px] px-4 py-4 flex flex-col items-center gap-2 transition-all ${
                  activeView === tab.id
                    ? 'bg-primary-500/20 text-primary-400 border-b-2 border-primary-500'
                    : 'text-text-muted hover:text-text-primary hover:bg-bg-1/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-semibold">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Setup Wizard (if needed) */}
      {showSetup && (
        <div className="p-4">
          <CalendarSetup
            onComplete={() => {
              useIntegratedOnboardingStore.getState().markModuleComplete('calendar');
            }}
            onSkip={() => {
              useIntegratedOnboardingStore.getState().markModuleComplete('calendar');
            }}
          />
        </div>
      )}

      {/* Active Tab Content */}
      <div className="tab-content">
        {!showSetup && renderView()}
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

export default CalendarNew;
