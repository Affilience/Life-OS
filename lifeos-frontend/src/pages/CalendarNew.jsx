import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  List,
  Grid,
  Target
} from 'lucide-react';
import Card from '../components/ui/Card';
import WeekView from '../components/calendar/WeekView';
import CosmicWeekView from '../components/calendar/CosmicWeekView';
import CosmicDayView from '../components/calendar/CosmicDayView';
import DayView from '../components/calendar/DayView';
import MonthView from '../components/calendar/MonthView';
import AnalyticsView from '../components/calendar/AnalyticsView';
import DailyPlanningView from '../components/calendar/DailyPlanningView';

/**
 * Astral Map - Calendar & Time
 *
 * Plan your time, track actual usage, and optimize your schedule
 */

const CalendarNew = () => {
  const [activeView, setActiveView] = useState('week');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const stats = {
    hoursThisWeek: 42,
    completionRate: 78,
    eventsToday: 12,
    timeTracked: 85
  };

  const views = [
    { id: 'week', label: 'Week', icon: Grid },
    { id: 'day', label: 'Day', icon: List },
    { id: 'planning', label: 'Daily Planning', icon: Target },
    // TODO: Implement Month and Analytics views
    // { id: 'month', label: 'Month', icon: CalendarIcon },
    // { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const renderView = () => {
    switch (activeView) {
      case 'week':
        return <CosmicWeekView />;
      case 'day':
        return <CosmicDayView />;
      case 'planning':
        return <DailyPlanningView />;
      case 'month':
        return <MonthView selectedDate={selectedDate} setSelectedDate={setSelectedDate} />;
      case 'analytics':
        return <AnalyticsView />;
      default:
        return <CosmicWeekView />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-error/10 border border-error/20 flex items-center justify-center">
            <CalendarIcon size={24} className="text-error" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-high tracking-tighter">
              Astral Map
            </h1>
            <p className="text-text-med mt-1">
              Plan your time, track actual usage, and optimize your schedule
            </p>
          </div>
        </div>
      </div>

      {/* View Navigation */}
      <Card padding="none">
        <div className="flex border-b border-border">
          {views.map((view) => {
            const Icon = view.icon;
            const isActive = activeView === view.id;
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium
                  border-b-2 -mb-px transition-all duration-fast
                  ${isActive
                    ? 'border-error text-text-high bg-muted'
                    : 'border-transparent text-text-med hover:text-text-high hover:bg-muted/50'
                  }
                `}
              >
                <Icon size={18} />
                <span>{view.label}</span>
              </button>
            );
          })}
        </div>

        {/* View Content */}
        <div className="p-6">
          {renderView()}
        </div>
      </Card>
    </div>
  );
};

export default CalendarNew;
