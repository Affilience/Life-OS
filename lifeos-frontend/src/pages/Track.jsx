import React, { useState } from 'react';
import { Activity, Briefcase, CheckSquare, FileText } from 'lucide-react';
import ProductivityNew from './ProductivityNew';
import HealthNew from './HealthNew';
import HabitsNew from './HabitsNew';
import JournalNew from './JournalNew';

export default function Track() {
  const [activeTab, setActiveTab] = useState('productivity');

  const tabs = [
    { id: 'productivity', name: 'Supernova', icon: Briefcase, component: ProductivityNew },
    { id: 'health', name: 'Gravity', icon: Activity, component: HealthNew },
    { id: 'habits', name: 'Orbit', icon: CheckSquare, component: HabitsNew },
    { id: 'journal', name: 'Starlog', icon: FileText, component: JournalNew },
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component;

  return (
    <div className="track-page">
      {/* Tab Navigation */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="flex overflow-x-auto hide-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[120px] px-4 py-4 flex flex-col items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
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
        {ActiveComponent && <ActiveComponent />}
      </div>

      <style>{`
        .track-page {
          min-height: 100vh;
        }
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
}
