import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Dumbbell, BarChart3, Apple, Activity, HeartPulse } from 'lucide-react';
import HealthDashboard from '../components/health/HealthDashboard';
import WorkoutsTab from '../components/health/WorkoutsTab';
import NutritionTab from '../components/health/NutritionTab';
import CardioTab from '../components/health/CardioTab';
import { HealthSetup } from '../components/onboarding/setup';
import useIntegratedOnboardingStore from '../stores/integratedOnboardingStore';
import PageHeader from '../components/shared/PageHeader';

export default function Health() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const { isModuleComplete, hasSeenWelcome, isOnboardingComplete } = useIntegratedOnboardingStore();

  // Handle navigation state for tab switching (e.g., from NovaGuide)
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  // Show setup wizard if health module not configured during onboarding
  const showSetup = hasSeenWelcome && !isOnboardingComplete && !isModuleComplete('health');

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'workouts', name: 'Workouts', icon: Dumbbell },
    { id: 'nutrition', name: 'Nutrition', icon: Apple },
    { id: 'cardio', name: 'Cardio', icon: Activity },
  ];

  return (
    <div className="health-page min-h-screen bg-bg-0">
      {/* Page Header */}
      <div className="px-4 pt-6">
        <PageHeader
          title="Health"
          subtitle="Track workouts, nutrition, and cardio to optimise your fitness"
          icon={HeartPulse}
          module="health"
          variant="elevated"
        />
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-40 bg-bg-0 border-b border-border" data-tour="health-tabs">
        <div className="flex overflow-x-auto hide-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-tour={`health-tab-${tab.id}`}
                className={`flex-1 min-w-[120px] px-4 py-4 flex flex-col items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'bg-green-500/20 text-green-400 border-b-2 border-green-500'
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

      {/* First-Run Setup (during onboarding) */}
      {showSetup && (
        <div className="px-4 pt-4">
          <HealthSetup />
        </div>
      )}

      {/* Active Tab Content */}
      <div className="tab-content">
        {activeTab === 'dashboard' && <div data-tour="health-dashboard-section"><HealthDashboard /></div>}
        {activeTab === 'workouts' && <div data-tour="health-workouts-section"><WorkoutsTab /></div>}
        {activeTab === 'nutrition' && <div data-tour="health-nutrition-section"><NutritionTab /></div>}
        {activeTab === 'cardio' && <div data-tour="health-cardio-section"><CardioTab /></div>}
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
