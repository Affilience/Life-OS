import React, { useState } from 'react';
import {
  Activity,
  Dumbbell,
  Apple,
  Moon,
  Heart,
  Zap,
  TrendingUp
} from 'lucide-react';
import Card from '../components/ui/Card';
import Stat from '../components/ui/Stat';
import Badge from '../components/ui/Badge';
import XPBar from '../components/app/XPBar';
import WorkoutsTab from '../components/health/WorkoutsTab';
import NutritionTab from '../components/health/NutritionTab';
import SleepTabSimple from '../components/health/SleepTabSimple';
import RecoveryTabSimple from '../components/health/RecoveryTabSimple';

/**
 * Gravity - Health & Fitness
 *
 * Track workouts, nutrition, sleep, and recovery
 */

const HealthNew = () => {
  const [activeTab, setActiveTab] = useState('workouts');

  // Mock stats
  const stats = {
    workoutsThisWeek: 4,
    avgSleep: 7.5,
    calories: 2400,
    recovery: 85
  };

  const tabs = [
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrition', icon: Apple },
    { id: 'sleep', label: 'Sleep', icon: Moon },
    { id: 'recovery', label: 'Recovery', icon: Heart }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Simplified Header - removed icon box, removed XP bar, removed stat grid */}
      <div>
        <h1 className="text-2xl font-bold text-text-high mb-1">
          Gravity
        </h1>
        <p className="text-sm text-text-dim">
          {stats.workoutsThisWeek} workouts this week · {stats.avgSleep}h avg sleep · {stats.recovery}% recovery
        </p>
      </div>

      {/* Tab Navigation */}
      <Card padding="none">
        <div className="flex border-b border-border">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium
                  border-b-2 -mb-px transition-all duration-fast
                  ${isActive
                    ? 'border-success text-text-high bg-muted'
                    : 'border-transparent text-text-med hover:text-text-high hover:bg-muted/50'
                  }
                `}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'workouts' && <WorkoutsTab />}
          {activeTab === 'nutrition' && <NutritionTab />}
          {activeTab === 'sleep' && <SleepTabSimple />}
          {activeTab === 'recovery' && <RecoveryTabSimple />}
        </div>
      </Card>
    </div>
  );
};

export default HealthNew;
