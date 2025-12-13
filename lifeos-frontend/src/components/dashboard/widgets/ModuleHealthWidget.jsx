import React, { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Heart,
  Brain,
  BookOpen,
  Pen,
  DollarSign,
  Calendar,
  Target,
  Dumbbell
} from 'lucide-react';

// Import stores for real data
import { useHealthStore } from '../../../stores/healthStore';
import useProductivityStore from '../../../stores/productivityStore';
import { useKnowledgeStore } from '../../../stores/knowledgeStore';
import { useCalendarStore } from '../../../stores/calendarStore';
import { useFinancialStore } from '../../../stores/financialStore';
import { useWorkoutStore } from '../../../stores/workoutStore';
import useSkillsStore from '../../../stores/skillsStore';
import { useAvatarStore } from '../../../stores/avatarStore';

// Helper to check if date is within last N days
const isWithinDays = (dateStr, days) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
};

// Helper to get start of week
const getStartOfWeek = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const start = new Date(now);
  start.setDate(start.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);
  return start;
};

const ModuleHealthWidget = memo(function ModuleHealthWidget() {
  const navigate = useNavigate();

  // Connect to stores
  const { meals, dailyGoals } = useHealthStore();
  const { sessions: productivitySessions, tasks, projects } = useProductivityStore();
  const { notes, ideas, contentItems } = useKnowledgeStore();
  const { timeBlocks } = useCalendarStore();
  const { transactions, budgets } = useFinancialStore();
  const { workouts } = useWorkoutStore();
  const { skills } = useSkillsStore();
  const { stats: avatarStats } = useAvatarStore();

  // Calculate real module health scores
  const allModules = useMemo(() => {
    const startOfWeek = getStartOfWeek();

    // Health Score: Based on meals logged this week vs target (3 meals/day = 21/week)
    const mealsThisWeek = (meals || []).filter(m => isWithinDays(m.timestamp, 7)).length;
    const healthScore = Math.min(100, Math.round((mealsThisWeek / 21) * 100));

    // Productivity Score: Based on completed tasks and work sessions this week
    const completedTasksThisWeek = (tasks || []).filter(t =>
      t.status === 'done' && isWithinDays(t.completedAt, 7)
    ).length;
    const sessionsThisWeek = (productivitySessions || []).filter(s =>
      isWithinDays(s.startTime || s.endTime, 7)
    ).length;
    const productivityScore = Math.min(100, Math.round(
      (completedTasksThisWeek * 10 + sessionsThisWeek * 15) / 1.5
    )) || 0;

    // Knowledge Score: Based on notes, ideas, and content engagement this week
    const notesThisWeek = (notes || []).filter(n => isWithinDays(n.createdAt || n.dateCreated, 7)).length;
    const ideasThisWeek = (ideas || []).filter(i => isWithinDays(i.createdAt, 7)).length;
    const activeContent = (contentItems || []).filter(c => c.status === 'in_progress').length;
    const knowledgeScore = Math.min(100, Math.round(
      (notesThisWeek * 15 + ideasThisWeek * 10 + activeContent * 5)
    )) || 0;

    // Journal Score: Based on avatar stats for journal entries
    // Since journal uses IndexedDB directly, we estimate from avatarStats
    const journalEntriesCount = avatarStats?.journal?.entriesWritten || 0;
    const journalStreak = avatarStats?.journal?.journalStreak || 0;
    // Score: 50% base for any entries + 50% based on streak (7 day target)
    const journalScore = journalEntriesCount > 0
      ? Math.min(100, 50 + Math.round((journalStreak / 7) * 50))
      : 0;

    // Finance Score: Based on transactions logged and budget tracking
    const transactionsThisMonth = (transactions || []).filter(t => isWithinDays(t.date, 30)).length;
    const hasBudget = (budgets || []).length > 0;
    const financeScore = Math.min(100, Math.round(
      (transactionsThisMonth * 5) + (hasBudget ? 30 : 0)
    )) || 0;

    // Calendar Score: Based on time blocks this week
    const blocksThisWeek = (timeBlocks || []).filter(b => {
      const blockDate = new Date(b.date);
      return blockDate >= startOfWeek;
    }).length;
    const completedBlocks = (timeBlocks || []).filter(b =>
      b.status === 'completed' && new Date(b.date) >= startOfWeek
    ).length;
    const calendarScore = blocksThisWeek > 0
      ? Math.min(100, Math.round((completedBlocks / blocksThisWeek) * 100 + blocksThisWeek * 5))
      : 0;

    // Skills Score: Based on practice sessions this week
    const skillsWithRecentPractice = (skills || []).filter(skill => {
      const recentSessions = (skill.sessions || []).filter(s => isWithinDays(s.date, 7));
      return recentSessions.length > 0;
    }).length;
    const totalSkills = (skills || []).length || 1;
    const skillsScore = Math.min(100, Math.round((skillsWithRecentPractice / totalSkills) * 100));

    // Fitness Score: Based on workouts this week (target: 4 workouts/week)
    const workoutsThisWeek = (workouts || []).filter(w => isWithinDays(w.date, 7)).length;
    const fitnessScore = Math.min(100, Math.round((workoutsThisWeek / 4) * 100));

    return [
      { name: 'Health', score: healthScore || 0, icon: Heart, color: 'from-green-500 to-emerald-500', route: '/health' },
      { name: 'Productivity', score: productivityScore || 0, icon: Brain, color: 'from-blue-500 to-cyan-500', route: '/productivity' },
      { name: 'Knowledge', score: knowledgeScore || 0, icon: BookOpen, color: 'from-purple-500 to-pink-500', route: '/knowledge' },
      { name: 'Journal', score: journalScore || 0, icon: Pen, color: 'from-orange-500 to-red-500', route: '/journal' },
      { name: 'Finance', score: financeScore || 0, icon: DollarSign, color: 'from-yellow-500 to-orange-500', route: '/financial' },
      { name: 'Calendar', score: calendarScore || 0, icon: Calendar, color: 'from-indigo-500 to-purple-500', route: '/calendar' },
      { name: 'Skills', score: skillsScore || 0, icon: Target, color: 'from-pink-500 to-rose-500', route: '/skills' },
      { name: 'Fitness', score: fitnessScore || 0, icon: Dumbbell, color: 'from-cyan-500 to-blue-500', route: '/health' },
    ];
  }, [meals, tasks, productivitySessions, notes, ideas, contentItems, avatarStats, transactions, budgets, timeBlocks, skills, workouts]);

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2 flex-shrink-0">
        <Zap className="w-4 h-4" />
        Module Health
      </h3>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto">
        {allModules.map((module) => {
          const Icon = module.icon;
          return (
            <div
              key={module.name}
              className="bg-[#1a1724] border border-white/10 rounded-xl p-3 hover:border-purple-500/30 cursor-pointer transition-all"
              onClick={() => navigate(module.route)}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-white/60">{module.name}</div>
                  <div className="text-lg font-bold text-white">{module.score}</div>
                </div>
              </div>
              <div className="h-1 bg-[#0c0a10] rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${module.color} transition-all duration-500`}
                  style={{ width: `${module.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default ModuleHealthWidget;
