import WidgetWrapper from './WidgetWrapper';
import StreakStatsWidget from './StreakStatsWidget';
import HeroSectionWidget from './HeroSectionWidget';
import TodaysPlanWidget from './TodaysPlanWidget';
import WeeklyInsightsWidget from './WeeklyInsightsWidget';
import ModuleHealthWidget from './ModuleHealthWidget';
import QuickActionsWidget from './QuickActionsWidget';
import RecentActivityWidget from './RecentActivityWidget';
import FinancialSnapshotWidget from './FinancialSnapshotWidget';
import GoalsProgressWidget from './GoalsProgressWidget';
import DailyQuoteWidget from './DailyQuoteWidget';

// Re-export all widgets
export {
  WidgetWrapper,
  StreakStatsWidget,
  HeroSectionWidget,
  TodaysPlanWidget,
  WeeklyInsightsWidget,
  ModuleHealthWidget,
  QuickActionsWidget,
  RecentActivityWidget,
  FinancialSnapshotWidget,
  GoalsProgressWidget,
  DailyQuoteWidget,
};

// Widget component mapping for dynamic rendering
export const WIDGET_COMPONENTS = {
  streakStats: StreakStatsWidget,
  heroSection: HeroSectionWidget,
  todaysPlan: TodaysPlanWidget,
  weeklyInsights: WeeklyInsightsWidget,
  moduleHealth: ModuleHealthWidget,
  quickActions: QuickActionsWidget,
  recentActivity: RecentActivityWidget,
  financialSnapshot: FinancialSnapshotWidget,
  goalsProgress: GoalsProgressWidget,
  dailyQuote: DailyQuoteWidget,
};
