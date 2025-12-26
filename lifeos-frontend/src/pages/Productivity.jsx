import React, { useState } from 'react';
import { Clock, BarChart3, FolderKanban, Zap } from 'lucide-react';
import ProductivityDashboard from '../components/productivity/ProductivityDashboard';
import WorkSessionsTab from '../components/productivity/WorkSessionsTab';
import ProjectsTab from '../components/productivity/ProjectsTab';
import { ProductivitySetup } from '../components/onboarding/setup';
import useIntegratedOnboardingStore from '../stores/integratedOnboardingStore';
import PageHeader from '../components/shared/PageHeader';

export default function Productivity() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { isModuleComplete, hasSeenWelcome, isOnboardingComplete } = useIntegratedOnboardingStore();

  // Show setup wizard if productivity module not configured during onboarding
  const showSetup = hasSeenWelcome && !isOnboardingComplete && !isModuleComplete('productivity');

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'sessions', name: 'Work Sessions', icon: Clock },
    { id: 'projects', name: 'Projects', icon: FolderKanban },
  ];

  return (
    <div className="productivity-page min-h-screen bg-bg-0">
      {/* Page Header */}
      <div className="px-4 pt-6">
        <PageHeader
          title="Productivity"
          subtitle="Track deep work, manage projects, and maximise your output"
          icon={Zap}
          module="productivity"
          variant="elevated"
        />
      </div>

      {/* Tab Navigation - Productivity uses indigo accent */}
      <div className="sticky top-0 z-40 bg-bg-0 border-b border-indigo-500/20" data-tour="productivity-tabs">
        <div className="flex overflow-x-auto hide-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[120px] px-4 py-4 flex flex-col items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-500/20 text-indigo-400 border-b-2 border-indigo-500'
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
          <ProductivitySetup
            onComplete={() => {
              useIntegratedOnboardingStore.getState().markModuleComplete('productivity');
            }}
            onSkip={() => {
              useIntegratedOnboardingStore.getState().markModuleComplete('productivity');
            }}
          />
        </div>
      )}

      {/* Active Tab Content */}
      <div className="tab-content">
        {!showSetup && activeTab === 'dashboard' && (
          <ProductivityDashboard onSwitchToProjects={() => setActiveTab('projects')} />
        )}
        {!showSetup && activeTab === 'sessions' && <WorkSessionsTab />}
        {!showSetup && activeTab === 'projects' && <ProjectsTab />}
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
