import React, { useState } from 'react';
import { Clock, BarChart3, CheckSquare, FolderKanban, DollarSign, Calendar } from 'lucide-react';
import ProductivityDashboard from '../components/productivity/ProductivityDashboard';
import WorkSessionsTab from '../components/productivity/WorkSessionsTab';
import TasksTab from '../components/productivity/TasksTab';
import ProjectsTab from '../components/productivity/ProjectsTab';
import IncomeTab from '../components/productivity/IncomeTab';
import PlanTomorrowTab from '../components/productivity/PlanTomorrowTab';

export default function Productivity() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'daily', name: 'Daily Plan', icon: Calendar },
    { id: 'sessions', name: 'Work Sessions', icon: Clock },
    { id: 'tasks', name: 'Tasks', icon: CheckSquare },
    { id: 'projects', name: 'Projects', icon: FolderKanban },
    { id: 'income', name: 'Income', icon: DollarSign },
  ];

  return (
    <div className="productivity-page min-h-screen bg-[#0c0a10]">
      {/* Tab Navigation */}
      <div className="sticky top-0 z-40 bg-[#0c0a10] border-b border-slate-800">
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
        {activeTab === 'dashboard' && <ProductivityDashboard />}
        {activeTab === 'daily' && <PlanTomorrowTab />}
        {activeTab === 'sessions' && <WorkSessionsTab />}
        {activeTab === 'tasks' && <TasksTab />}
        {activeTab === 'projects' && <ProjectsTab />}
        {activeTab === 'income' && <IncomeTab />}
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
