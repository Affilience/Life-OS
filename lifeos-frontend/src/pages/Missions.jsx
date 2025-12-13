import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Flame,
  ListTodo,
  Swords,
  Target,
  TrendingUp,
  CheckSquare,
  BarChart2,
  ShieldOff,
  Ban,
} from 'lucide-react';
import Card from '../components/ui/Card';
import PageHeader from '../components/shared/PageHeader';
import Achievements from '../components/missions/Achievements';
import StreaksView from '../components/missions/StreaksView';
import PlanTomorrowTab from '../components/productivity/PlanTomorrowTab';
import BadHabitsTracker from '../components/missions/BadHabitsTracker';
import useQuestsStore from '../stores/questsStore';
import useDailyTasksStore from '../stores/dailyTasksStore';
import useBadHabitsStore from '../stores/badHabitsStore';
import { useGamificationModeStore, TERMINOLOGY } from '../stores/gamificationModeStore';
import { HabitsSetup } from '../components/onboarding/setup';
import useIntegratedOnboardingStore from '../stores/integratedOnboardingStore';

// Mode-specific styling
const MODE_STYLES = {
  cosmic: {
    activeBorder: 'border-purple-500',
    activeText: 'text-text-high',
    activeBg: 'bg-muted',
    notificationBg: 'bg-purple-500/30',
    notificationText: 'text-purple-300',
  },
  professional: {
    activeBorder: 'border-blue-500',
    activeText: 'text-text-high',
    activeBg: 'bg-blue-500/5',
    notificationBg: 'bg-blue-500/20',
    notificationText: 'text-blue-300',
  },
  minimal: {
    activeBorder: 'border-emerald-500',
    activeText: 'text-text-high',
    activeBg: 'bg-emerald-500/5',
    notificationBg: 'bg-emerald-500/20',
    notificationText: 'text-emerald-300',
  },
};

const Missions = () => {
  const [activeTab, setActiveTab] = useState('plan');

  // Onboarding state
  const { isModuleComplete, hasSeenWelcome, isOnboardingComplete } = useIntegratedOnboardingStore();
  const showSetup = hasSeenWelcome && !isOnboardingComplete && !isModuleComplete('habits');

  // Get gamification mode
  const mode = useGamificationModeStore((state) => state.mode);
  const terms = TERMINOLOGY[mode] || TERMINOLOGY.cosmic;

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

  // Get mode-specific styling
  const modeStyle = MODE_STYLES[mode] || MODE_STYLES.cosmic;

  // Mode-aware tab labels and icons
  const getStreakIcon = () => {
    if (mode === 'cosmic') return Flame;
    if (mode === 'professional') return TrendingUp;
    return BarChart2;
  };

  const getAchievementIcon = () => {
    if (mode === 'cosmic') return Trophy;
    if (mode === 'professional') return CheckSquare;
    return CheckSquare;
  };

  const getQuitIcon = () => {
    if (mode === 'cosmic') return ShieldOff;
    if (mode === 'professional') return Ban;
    return Ban;
  };

  // Get bad habits count for notification
  const badHabitsCount = useBadHabitsStore(state => state.habits.length);

  const tabs = [
    { id: 'plan', label: 'Today', icon: ListTodo },
    { id: 'quit', label: 'Quit', icon: getQuitIcon() },
    { id: 'streaks', label: terms.streak + 's', icon: getStreakIcon() },
    { id: 'achievements', label: terms.achievement + 's', icon: getAchievementIcon() },
  ];

  // Mode-aware page title
  const pageTitle = mode === 'cosmic' ? 'Quests' : mode === 'professional' ? 'Goals' : 'Tasks';
  const PageIcon = mode === 'cosmic' ? Swords : Target;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'plan':
        return <div data-tour="plan-section"><PlanTomorrowTab /></div>;
      case 'quit':
        return <div data-tour="quit-section"><BadHabitsTracker /></div>;
      case 'achievements':
        return <div data-tour="achievements-section"><Achievements /></div>;
      case 'streaks':
        return <div data-tour="streaks-section"><StreaksView /></div>;
      default:
        return <div data-tour="plan-section"><PlanTomorrowTab /></div>;
    }
  };

  // Get notification counts for tabs
  const getTabNotification = (tabId) => {
    switch (tabId) {
      case 'plan':
        return todayStats.total - todayStats.completed;
      case 'quit':
        return badHabitsCount;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title={pageTitle}
        subtitle="Track your daily progress and build lasting habits"
        stats={`${quickStats.streak} day ${terms.streak.toLowerCase()} · ${quickStats.completed} completed`}
        icon={PageIcon}
        module="missions"
        variant="elevated"
      />

      {/* First-Run Setup (during onboarding) */}
      {showSetup && (
        <div className="px-4">
          <HabitsSetup />
        </div>
      )}

      {/* Tab Navigation */}
      <Card padding="none" data-tour="daily-quests">
        <div className="flex border-b border-border overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const notification = getTabNotification(tab.id);

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-tour={`quests-tab-${tab.id}`}
                className={`
                  flex-1 min-w-0 flex items-center justify-center gap-1.5 sm:gap-2
                  px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium
                  border-b-2 -mb-px transition-all duration-fast whitespace-nowrap
                  ${isActive
                    ? `${modeStyle.activeBorder} ${modeStyle.activeText} ${modeStyle.activeBg}`
                    : 'border-transparent text-text-med hover:text-text-high hover:bg-muted/50'
                  }
                `}
              >
                <Icon size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
                {notification > 0 && (
                  <span className={`
                    ml-1 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full flex-shrink-0
                    ${isActive
                      ? `${modeStyle.notificationBg} ${modeStyle.notificationText}`
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
