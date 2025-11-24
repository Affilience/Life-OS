import React, { useState } from 'react';
import { Dumbbell, BarChart3, Apple, Moon, Heart } from 'lucide-react';
import HealthDashboard from '../components/health/HealthDashboard';
import WorkoutsTab from '../components/health/WorkoutsTab';
import NutritionTab from '../components/health/NutritionTab';
import SleepTabSimple from '../components/health/SleepTabSimple';
import RecoveryTabSimple from '../components/health/RecoveryTabSimple';

export default function Health() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'workouts', name: 'Workouts', icon: Dumbbell },
    { id: 'nutrition', name: 'Nutrition', icon: Apple },
    { id: 'sleep', name: 'Sleep', icon: Moon },
    { id: 'recovery', name: 'Recovery', icon: Heart },
  ];

  return (
    <div className="health-page min-h-screen bg-[#0c0a10]">
      {/* Tab Navigation */}
      <div className="sticky top-0 z-10 bg-[#12101a]/95 backdrop-blur-sm border-b border-slate-800">
        <div className="flex overflow-x-auto hide-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[120px] px-4 py-4 flex flex-col items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'bg-green-500/20 text-green-400 border-b-2 border-green-500'
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
        {activeTab === 'dashboard' && <HealthDashboard />}
        {activeTab === 'workouts' && <WorkoutsTab />}
        {activeTab === 'nutrition' && <NutritionTab />}
        {activeTab === 'sleep' && <SleepTabSimple />}
        {activeTab === 'recovery' && <RecoveryTabSimple />}
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
}
