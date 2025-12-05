import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  List,
  Grid
} from 'lucide-react';
import CosmicWeekView from '../components/calendar/CosmicWeekView';
import CosmicDayView from '../components/calendar/CosmicDayView';
import MonthView from '../components/calendar/MonthView';
import AnalyticsView from '../components/calendar/AnalyticsView';

/**
 * Astral Map - Calendar & Time
 *
 * Plan your time, track actual usage, and optimize your schedule
 */

const CalendarNew = () => {
  const [activeView, setActiveView] = useState('week');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const tabs = [
    { id: 'week', name: 'Week', icon: Grid },
    { id: 'day', name: 'Day', icon: List },
    // TODO: Implement Month and Analytics views
    // { id: 'month', name: 'Month', icon: CalendarIcon },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'week':
        return <CosmicWeekView />;
      case 'day':
        return <CosmicDayView />;
      case 'month':
        return <MonthView selectedDate={selectedDate} setSelectedDate={setSelectedDate} />;
      case 'analytics':
        return <AnalyticsView />;
      default:
        return <CosmicWeekView />;
    }
  };

  return (
    <div className="calendar-page min-h-screen bg-[#0c0a10]">
      {/* Tab Navigation */}
      <div className="sticky top-0 z-40 bg-[#0c0a10] border-b border-slate-800">
        <div className="flex overflow-x-auto hide-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex-1 min-w-[120px] px-4 py-4 flex flex-col items-center gap-2 transition-all ${
                  activeView === tab.id
                    ? 'bg-rose-500/20 text-rose-400 border-b-2 border-rose-500'
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
        {renderView()}
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
