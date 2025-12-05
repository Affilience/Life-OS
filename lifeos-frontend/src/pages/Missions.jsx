import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Flame,
  ListTodo,
  Swords
} from 'lucide-react';
import Card from '../components/ui/Card';
import PageHeader from '../components/shared/PageHeader';
import Achievements from '../components/missions/Achievements';
import StreaksView from '../components/missions/StreaksView';
import PlanTomorrowTab from '../components/productivity/PlanTomorrowTab';
import useQuestsStore from '../stores/questsStore';
import useDailyTasksStore from '../stores/dailyTasksStore';

const Missions = () => {
  const [activeTab, setActiveTab] = useState('plan');

  // Get stats from stores
  const { getQuestSummary, questStats } = useQuestsStore();
  const { getTodayStats, getStreak } = useDailyTasksStore();

  const questSummary = getQuestSummary();
  const todayStats = getTodayStats();
  const streak = getStreak();

  // Calculate quick stats
  const quickStats = useMemo(() => ({
    streak: streak,
    completed: questStats.totalQuestsCompleted || 0,
  }), [questStats, streak]);

  const tabs = [
    { id: 'plan', label: 'Today', icon: ListTodo },
    { id: 'streaks', label: 'Streaks', icon: Flame },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'plan':
        return <PlanTomorrowTab />;
      case 'achievements':
        return <Achievements />;
      case 'streaks':
        return <StreaksView />;
      default:
        return <PlanTomorrowTab />;
    }
  };

  // Get notification counts for tabs
  const getTabNotification = (tabId) => {
    switch (tabId) {
      case 'plan':
        return todayStats.total - todayStats.completed;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Quests"
        stats={`${quickStats.streak} day streak · ${quickStats.completed} completed`}
        icon={Swords}
        module="missions"
        variant="icon"
      />

      {/* Tab Navigation */}
      <Card padding="none">
        <div className="flex border-b border-border overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const notification = getTabNotification(tab.id);

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium
                  border-b-2 -mb-px transition-all duration-fast whitespace-nowrap
                  ${isActive
                    ? 'border-purple-500 text-text-high bg-muted'
                    : 'border-transparent text-text-med hover:text-text-high hover:bg-muted/50'
                  }
                `}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                {notification > 0 && (
                  <span className={`
                    ml-1.5 px-2 py-0.5 text-xs rounded-full
                    ${isActive
                      ? 'bg-purple-500/30 text-purple-300'
                      : 'bg-white/10 text-white/60'
                    }
                  `}>
                    {notification}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </Card>
    </div>
  );
};

export default Missions;
