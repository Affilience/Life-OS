/**
 * Cross-Module Data Service
 *
 * Provides COMPLETE access to ALL user data across the entire LifeOS system.
 * This service aggregates data from all Zustand stores for use by Nova AI.
 *
 * Nova should have visibility into EVERY data point the user has entered.
 *
 * SECURITY: Stores are cleared on auth changes (signIn/signOut/signUp) via useAuth.js
 * This ensures data isolation between users in the same browser session.
 */

import { getCurrentUserId } from '../../lib/supabase';
import useGamificationStore from '../../stores/gamificationStore';
import useProductivityStore from '../../stores/productivityStore';
import { useHealthStore } from '../../stores/healthStore';
import { useFinancialStore } from '../../stores/financialStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useCalendarStore } from '../../stores/calendarStore';
import { useKnowledgeStore } from '../../stores/knowledgeStore';
import { useContentStore } from '../../stores/contentStore';
import useQuestsStore from '../../stores/questsStore';
import useAchievementsStore from '../../stores/achievementsStore';
import useDailyTasksStore from '../../stores/dailyTasksStore';
import useSkillsStore from '../../stores/skillsStore';
import { usePurposeStore } from '../../stores/purposeStore';
import { useResolutionStore } from '../../stores/resolutionStore';
import { useSocialStore } from '../../stores/socialStore';
import { usePetStore, PET_DATABASE } from '../../stores/petStore';
import { useAvatarStore, getXPForLevel } from '../../stores/avatarStore';

/**
 * Get time of day category
 */
function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 6) return 'night';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

/**
 * Format a date as YYYY-MM-DD
 * Returns null if the date is invalid
 */
function formatDate(date) {
  // Handle null/undefined
  if (!date) return null;

  // Handle case where date might not be a Date object
  if (!(date instanceof Date)) {
    try {
      date = new Date(date);
    } catch {
      return null;
    }
  }

  // Check if date is valid
  try {
    const time = date.getTime();
    if (isNaN(time)) return null;
    return date.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

/**
 * Get COMPLETE cross-module context from ALL stores
 * This provides Nova AI with access to EVERY data point in the system
 */
export function getCrossModuleContext() {
  // Get state from ALL stores
  const gamification = useGamificationStore.getState();
  const productivity = useProductivityStore.getState();
  const health = useHealthStore.getState();
  const financial = useFinancialStore.getState();
  const workout = useWorkoutStore.getState();
  const calendar = useCalendarStore.getState();
  const knowledge = useKnowledgeStore.getState();
  const content = useContentStore.getState();
  const quests = useQuestsStore.getState();
  const achievements = useAchievementsStore.getState();
  const dailyTasks = useDailyTasksStore.getState();
  const skills = useSkillsStore.getState();
  const purpose = usePurposeStore.getState();
  const resolutions = useResolutionStore.getState();
  const social = useSocialStore.getState();
  const pets = usePetStore.getState();
  const avatar = useAvatarStore.getState();

  const today = formatDate(new Date());
  const todaysTasks = dailyTasks.tasksByDate?.[today] || [];
  const todaysCompletedTasks = todaysTasks.filter(t => t.completed);
  const todaysMeals = (health.meals || []).filter(m => m.date === today);

  // Calculate today's nutrition totals
  const todaysNutrition = todaysMeals.reduce((acc, meal) => ({
    calories: acc.calories + (meal.calories || 0),
    protein: acc.protein + (meal.protein || 0),
    carbs: acc.carbs + (meal.carbs || 0),
    fat: acc.fat + (meal.fat || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Recent dates for filtering
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  // Filter workouts
  const recentWorkouts = (workout.workouts || []).filter(w => new Date(w.date) > weekAgo);
  const recentCardio = (workout.cardioWorkouts || []).filter(w => new Date(w.date) > weekAgo);

  // Today's time blocks
  const todaysBlocks = (calendar.timeBlocks || []).filter(b => {
    if (!b.start) return false;
    const blockDate = new Date(b.start);
    const formattedDate = formatDate(blockDate);
    return formattedDate && formattedDate === today;
  });

  // Streak information
  const streaks = gamification.streaks || {};
  const activeStreaks = Object.entries(streaks)
    .filter(([_, streak]) => streak && streak.current > 0)
    .map(([name, streak]) => ({
      name,
      current: streak.current,
      best: streak.best,
      lastActivity: streak.lastActivity,
    }));

  // Streaks at risk (not logged in last 20 hours)
  const streaksAtRisk = activeStreaks.filter(s => {
    if (!s.lastActivity) return false;
    const hoursSinceActivity = (Date.now() - new Date(s.lastActivity).getTime()) / (1000 * 60 * 60);
    return hoursSinceActivity > 20 && s.current >= 3;
  });

  return {
    // === Time Context ===
    time: {
      current: new Date().toLocaleString(),
      timeOfDay: getTimeOfDay(),
      dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      isWeekend: [0, 6].includes(new Date().getDay()),
      today,
    },

    // === GAMIFICATION & PROGRESS (COMPLETE) ===
    gamification: {
      level: gamification.level || 1,
      stage: gamification.currentStage || 'spark',
      totalXP: gamification.totalXP || 0,
      currentXP: gamification.currentXP || 0,
      xpToNextLevel: gamification.xpToNextLevel || 0,
      cosmicCredits: gamification.cosmicCredits || 0,
      cosmicGems: gamification.cosmicGems || 0,
      globalStreak: gamification.globalStreak || 0,
      moduleXP: gamification.moduleXP || {},
      unlockedAchievements: gamification.unlockedAchievements || [],
      unlockedFeatures: gamification.unlockedFeatures || [],
      activeTitle: gamification.activeTitle || null,
      // Raw streaks data
      streaks: {
        active: activeStreaks,
        atRisk: streaksAtRisk,
        global: gamification.globalStreak || 0,
        raw: streaks,
      },
    },

    // === DAILY TASKS (COMPLETE) ===
    dailyTasks: {
      today: {
        total: todaysTasks.length,
        completed: todaysCompletedTasks.length,
        remaining: todaysTasks.length - todaysCompletedTasks.length,
        completionRate: todaysTasks.length > 0
          ? Math.round((todaysCompletedTasks.length / todaysTasks.length) * 100)
          : 0,
        // Full task details
        tasks: todaysTasks.map(t => ({
          id: t.id,
          name: t.name,
          completed: t.completed,
          priority: t.priority,
          category: t.category,
          estimatedMinutes: t.estimatedMinutes,
          actualMinutes: t.actualMinutes,
          notes: t.notes,
          subtasks: t.subtasks || [],
        })),
      },
      // All tasks by date (recent 30 days)
      allTasksByDate: dailyTasks.tasksByDate || {},
      recurringTasks: dailyTasks.recurringTasks || [],
      taskCategories: dailyTasks.taskCategories || [],
    },

    // === PRODUCTIVITY (COMPLETE) ===
    productivity: {
      // Projects - full details
      projects: (productivity.projects || []).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        priority: p.priority,
        category: p.category,
        dueDate: p.dueDate,
        progress: p.progress,
        tasks: p.tasks || [],
        notes: p.notes,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      // Work/Focus sessions
      sessions: (productivity.sessions || []).map(s => ({
        id: s.id,
        type: s.type,
        startTime: s.startTime,
        endTime: s.endTime,
        duration: s.duration,
        projectId: s.projectId,
        notes: s.notes,
        completed: s.completed,
        focusScore: s.focusScore,
      })),
      activeSession: productivity.activeSession,
      // Pomodoro stats
      pomodoroSettings: productivity.pomodoroSettings,
      totalFocusTime: productivity.totalFocusTime || 0,
      todayFocusTime: productivity.todayFocusTime || 0,
    },

    // === HEALTH & NUTRITION (COMPLETE) ===
    health: {
      // Daily goals
      dailyGoals: health.dailyGoals || {},
      // Today's nutrition
      todayNutrition: {
        ...todaysNutrition,
        mealsLogged: todaysMeals.length,
        calorieProgress: health.dailyGoals?.calories
          ? Math.round((todaysNutrition.calories / health.dailyGoals.calories) * 100)
          : 0,
        proteinProgress: health.dailyGoals?.protein
          ? Math.round((todaysNutrition.protein / health.dailyGoals.protein) * 100)
          : 0,
      },
      // All meals (recent)
      meals: (health.meals || []).slice(0, 100).map(m => ({
        id: m.id,
        name: m.name,
        date: m.date,
        mealType: m.mealType,
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fat: m.fat,
        foods: m.foods || [],
        notes: m.notes,
      })),
      // Sleep data
      sleepLogs: (health.sleepLogs || []).slice(0, 30).map(s => ({
        id: s.id,
        date: s.date,
        bedTime: s.bedTime,
        wakeTime: s.wakeTime,
        duration: s.duration,
        quality: s.quality,
        notes: s.notes,
      })),
      // Water intake
      waterIntake: health.waterIntake || [],
      // Weight tracking
      weightLogs: health.weightLogs || [],
      currentWeight: health.currentWeight,
      goalWeight: health.goalWeight,
      // Supplements
      supplements: health.supplements || [],
      // Mood tracking
      moodLogs: health.moodLogs || [],
    },

    // === WORKOUTS & FITNESS (COMPLETE) ===
    fitness: {
      // Workout stats
      totalWorkouts: (workout.workouts || []).length,
      workoutsThisWeek: recentWorkouts.length,
      cardioThisWeek: recentCardio.length,
      hasActiveWorkout: !!workout.activeWorkout,
      activeWorkout: workout.activeWorkout,

      // Personal Records (PRs) - strength training
      personalRecords: workout.personalRecords || {},
      cardioRecords: workout.cardioRecords || {},

      // All workouts (recent 50)
      workouts: (workout.workouts || []).slice(0, 50).map(w => ({
        id: w.id,
        date: w.date,
        name: w.name || w.templateId,
        templateId: w.templateId,
        duration: w.duration,
        notes: w.notes,
        rating: w.rating,
        // Exercise details with sets
        exercises: (w.exercises || []).map(ex => ({
          exerciseId: ex.exerciseId,
          name: ex.name,
          sets: (ex.sets || []).map(set => ({
            setNumber: set.setNumber,
            weight: set.weight,
            reps: set.reps,
            rpe: set.rpe,
            isWarmup: set.isWarmup,
            isPR: set.isPR,
          })),
        })),
        totalVolume: (w.exercises || []).reduce((vol, ex) => {
          return vol + (ex.sets || []).reduce((setVol, set) => {
            return setVol + ((set.weight || 0) * (set.reps || 0));
          }, 0);
        }, 0),
      })),

      // Cardio workouts
      cardioWorkouts: (workout.cardioWorkouts || []).slice(0, 50).map(c => ({
        id: c.id,
        date: c.date,
        type: c.type,
        duration: c.duration,
        distance: c.distance,
        calories: c.calories,
        avgHeartRate: c.avgHeartRate,
        notes: c.notes,
      })),

      // Workout templates
      workoutTemplates: workout.workoutTemplates || [],

      // Body measurements
      bodyMeasurements: workout.bodyMeasurements || [],
    },

    // === FINANCIAL (COMPLETE) ===
    financial: {
      // Budget overview
      budgetEnvelopes: (financial.budgetEnvelopes || []).map(e => ({
        id: e.id,
        name: e.name,
        category: e.category,
        allocated: e.allocated,
        spent: e.spent,
        remaining: (e.allocated || 0) - (e.spent || 0),
        percentUsed: e.allocated > 0 ? Math.round((e.spent / e.allocated) * 100) : 0,
      })),
      totalBudget: (financial.budgetEnvelopes || []).reduce((sum, e) => sum + (e.allocated || 0), 0),
      totalSpent: (financial.budgetEnvelopes || []).reduce((sum, e) => sum + (e.spent || 0), 0),

      // Transactions (recent 100)
      transactions: (financial.transactions || []).slice(0, 100).map(t => ({
        id: t.id,
        date: t.date,
        description: t.description,
        amount: t.amount,
        type: t.type, // income/expense
        category: t.category,
        account: t.account,
        notes: t.notes,
        tags: t.tags || [],
      })),

      // Income sources
      incomes: financial.incomes || [],
      monthlyIncome: financial.monthlyIncome || 0,

      // Sinking funds / savings goals
      sinkingFunds: (financial.sinkingFunds || []).map(f => ({
        id: f.id,
        name: f.name,
        target: f.target,
        current: f.current,
        deadline: f.deadline,
        progress: f.target > 0 ? Math.round((f.current / f.target) * 100) : 0,
      })),
      totalSavings: (financial.sinkingFunds || []).reduce((sum, f) => sum + (f.current || 0), 0),

      // Net worth tracking
      assets: financial.assets || [],
      liabilities: financial.liabilities || [],
      netWorth: financial.netWorth || 0,

      // Financial goals
      financialGoals: financial.financialGoals || [],
    },

    // === KNOWLEDGE & LEARNING (COMPLETE) ===
    knowledge: {
      // Books
      books: (knowledge.books || []).map(b => ({
        id: b.id,
        title: b.title,
        author: b.author,
        status: b.status, // to-read, reading, completed
        rating: b.rating,
        startDate: b.startDate,
        finishDate: b.finishDate,
        currentPage: b.currentPage,
        totalPages: b.totalPages,
        notes: b.notes,
        highlights: b.highlights || [],
        genre: b.genre,
        tags: b.tags || [],
      })),
      booksInProgress: (knowledge.books || []).filter(b => b.status === 'reading'),
      booksCompleted: (knowledge.books || []).filter(b => b.status === 'completed'),

      // Notes
      notes: (knowledge.notes || []).slice(0, 100).map(n => ({
        id: n.id,
        title: n.title,
        content: n.content,
        category: n.category,
        tags: n.tags || [],
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
        linkedNotes: n.linkedNotes || [],
      })),

      // Ideas
      ideas: knowledge.ideas || [],

      // Learning logs
      learningLogs: knowledge.learningLogs || [],

      // Quotes
      quotes: knowledge.quotes || [],
    },

    // === CONTENT (Podcasts, Videos, Articles) ===
    content: {
      items: (content.contentItems || []).map(c => ({
        id: c.id,
        title: c.title,
        type: c.type, // podcast, video, article
        source: c.source,
        url: c.url,
        status: c.status, // to-consume, in_progress, completed
        rating: c.rating,
        notes: c.notes,
        keyTakeaways: c.keyTakeaways || [],
        createdAt: c.createdAt,
      })),
      inProgress: (content.contentItems || []).filter(c => c.status === 'in_progress'),
      completed: (content.contentItems || []).filter(c => c.status === 'completed'),
    },

    // === SKILLS (COMPLETE) ===
    skills: {
      allSkills: (skills.skills || []).map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        description: s.description,
        xp: s.xp,
        totalMinutes: s.totalMinutes,
        totalHours: Math.round((s.totalMinutes || 0) / 60 * 10) / 10,
        icon: s.icon,
        // Practice sessions
        sessions: (s.sessions || []).slice(0, 20).map(sess => ({
          id: sess.id,
          date: sess.date,
          minutes: sess.minutes,
          notes: sess.notes,
          xpEarned: sess.xpEarned,
        })),
        // Goals and milestones
        goals: s.goals || [],
        milestones: s.milestones || [],
        createdAt: s.createdAt,
      })),
      totalSkills: (skills.skills || []).length,
      totalPracticeMinutes: (skills.skills || []).reduce((sum, s) => sum + (s.totalMinutes || 0), 0),
      totalPracticeHours: Math.round((skills.skills || []).reduce((sum, s) => sum + (s.totalMinutes || 0), 0) / 60),
    },

    // === CALENDAR & TIME BLOCKS (COMPLETE) ===
    calendar: {
      // Today's schedule
      todayBlocks: todaysBlocks.map(b => ({
        id: b.id,
        title: b.title,
        start: b.start,
        end: b.end,
        category: b.category,
        color: b.color,
        completed: b.completed,
        notes: b.notes,
      })),

      // All time blocks (recent)
      timeBlocks: (calendar.timeBlocks || []).slice(0, 100).map(b => ({
        id: b.id,
        title: b.title,
        start: b.start,
        end: b.end,
        category: b.category,
        color: b.color,
        completed: b.completed,
        notes: b.notes,
      })),

      // Events
      events: (calendar.events || []).slice(0, 50).map(e => ({
        id: e.id,
        title: e.title,
        start: e.start,
        end: e.end,
        description: e.description,
        location: e.location,
        recurring: e.recurring,
        reminders: e.reminders,
      })),
      upcomingEvents: (calendar.events || []).filter(e => new Date(e.start) > new Date()).slice(0, 10),
    },

    // === PURPOSE & VALUES (COMPLETE) ===
    purpose: {
      missionStatement: purpose.missionStatement || '',
      personalVision: purpose.personalVision || {},

      // Core values
      coreValues: (purpose.coreValues || []).map(v => ({
        id: v.id,
        name: v.name,
        description: v.description,
        importance: v.importance,
        examples: v.examples || [],
        color: v.color,
      })),

      // Decision journal
      decisions: (purpose.decisions || []).slice(0, 50).map(d => ({
        id: d.id,
        title: d.title,
        context: d.context,
        situation: d.situation,
        options: d.options || [],
        chosenOption: d.chosenOption,
        reasoning: d.reasoning,
        expectedOutcome: d.expectedOutcome,
        actualOutcome: d.actualOutcome,
        date: d.date,
        category: d.category,
        importance: d.importance,
        outcome: d.outcome,
        lessonsLearned: d.lessonsLearned,
        wouldDoAgain: d.wouldDoAgain,
      })),

      // Identity check-ins
      identityCheckIns: (purpose.identityCheckIns || []).slice(0, 20).map(c => ({
        id: c.id,
        date: c.date,
        identityStatement: c.identityStatement,
        reflections: c.reflections,
        proudOf: c.proudOf || [],
        workingOn: c.workingOn || [],
        valuesLived: c.valuesLived || [],
      })),
    },

    // === RESOLUTIONS (COMPLETE) ===
    resolutions: {
      active: (resolutions.resolutions || []).filter(r => r.status === 'active').map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        year: r.year,
        status: r.status,
        currentStreak: r.currentStreak,
        longestStreak: r.longestStreak,
        totalCheckIns: r.totalCheckIns,
        lastCheckIn: r.lastCheckIn,
        milestones: r.milestones || [],
        createdAt: r.createdAt,
      })),
      completed: (resolutions.resolutions || []).filter(r => r.status === 'completed'),
      checkIns: resolutions.checkIns || {},
      achievements: resolutions.achievements || [],
      resolutionXP: resolutions.resolutionXP || 0,
    },

    // === QUESTS & MISSIONS (COMPLETE) ===
    quests: {
      // Daily quests
      dailyQuests: quests.dailyQuests || [],

      // Weekly quests
      weeklyQuests: quests.weeklyQuests || [],

      // Monthly epic quests
      monthlyQuests: quests.monthlyQuests || [],

      // Boss battles
      activeBossBattles: quests.activeBossBattles || [],
      completedBossBattles: quests.completedBossBattles || [],

      // Quest chains
      questChains: quests.questChains || [],

      // Stats
      questStats: quests.questStats || {},
    },

    // === ACHIEVEMENTS (COMPLETE) ===
    achievements: {
      unlocked: gamification.unlockedAchievements || [],
      totalUnlocked: (gamification.unlockedAchievements || []).length,
      stats: achievements.stats || {},
      recentAchievements: (gamification.unlockedAchievements || []).slice(-10),
    },

    // === SOCIAL (COMPLETE) ===
    social: {
      profile: social.socialProfile || {},
      friends: (social.friends || []).map(f => ({
        id: f.id,
        displayName: f.display_name,
        level: f.current_level,
        acceptedAt: f.acceptedAt,
      })),
      friendCount: (social.friends || []).length,

      // Guild
      currentGuild: social.currentGuild,
      guildMembers: social.guildMembers || [],

      // Challenges
      activeChallenges: social.activeChallenges || [],
      myChallenges: social.myChallenges || [],

      // Leaderboard ranks
      myRanks: social.myRanks || {},

      // Activity feed (recent)
      recentActivity: (social.feed || []).slice(0, 20),
    },

    // === PETS / COMPANIONS (COMPLETE) ===
    pets: {
      // Owned pets with full details
      ownedPets: (pets.ownedPets || []).map(petId => {
        const petData = PET_DATABASE[petId];
        return petData ? {
          id: petId,
          name: petData.name,
          tier: petData.tier,
          culture: petData.culture,
          description: petData.description,
          bonusType: petData.bonusType,
          bonusAmount: petData.bonusAmount,
          bonusDescription: petData.bonusDescription,
        } : { id: petId, name: petId };
      }),
      // Active/equipped pets with full details
      activePets: (pets.activePets || []).map(petId => {
        const petData = PET_DATABASE[petId];
        return petData ? {
          id: petId,
          name: petData.name,
          tier: petData.tier,
          culture: petData.culture,
          description: petData.description,
          bonusType: petData.bonusType,
          bonusAmount: petData.bonusAmount,
          bonusDescription: petData.bonusDescription,
        } : { id: petId, name: petId };
      }),
      maxSlots: pets.maxSlots || 1,
      // Active bonuses from equipped pets
      activeBonuses: pets.getActiveBonuses ? pets.getActiveBonuses() : {},
      collectionStats: pets.getCollectionStats ? pets.getCollectionStats() : {},
    },

    // === CHARACTER / AVATAR (RPG Stats & Equipment) ===
    character: {
      // Character level (separate from gamification level - represents character progression)
      level: avatar.level || 1,
      xp: avatar.xp || 0,
      xpToNextLevel: getXPForLevel(avatar.level || 1),
      tier: avatar.currentTier || 1,
      totalXPEarned: avatar.totalXPEarned || 0,
      totalLevelsEarned: avatar.totalLevelsEarned || 0,

      // Prestige/Rebirth system
      prestige: avatar.prestige || 0,
      prestigeRealm: avatar.prestige === 0 ? 'Mortal Realm' : avatar.prestige === 1 ? 'Cosmic Ascension' : 'Transcendent',
      xpMultiplier: avatar.prestige === 0 ? 1 : avatar.prestige === 1 ? 1.5 : 2.0,

      // RPG STATS (from Character page)
      stats: {
        defense: avatar.stats?.defense || 0,
        strength: avatar.stats?.strength || 0,
        vitality: avatar.stats?.vitality || 0,
        intelligence: avatar.stats?.intelligence || 0,
        wisdom: avatar.stats?.wisdom || 0,
      },

      // Character appearance
      gender: avatar.characterGender || 'male',

      // Equipped items (functional gear)
      equipped: avatar.equipped || {},
      unlockedEquipment: avatar.unlockedEquipment || [],
      equippedCount: Object.values(avatar.equipped || {}).filter(Boolean).length,

      // Cosmetic overrides (transmog)
      cosmetics: avatar.cosmetic || {},
      dyes: avatar.dyes || {},
      activeTitle: avatar.activeCosmetics?.title || null,
      activeFrame: avatar.activeCosmetics?.frame || null,
      ownedCosmetics: avatar.ownedCosmetics || [],

      // Module progress that contributes to character
      moduleProgress: avatar.moduleProgress || {},
    },

    // === XP SOURCES & BREAKDOWN ===
    xpSources: {
      // Module XP breakdown (where XP comes from)
      moduleXP: gamification.moduleXP || {},

      // Calculate XP by source for display
      breakdown: (() => {
        const moduleXP = gamification.moduleXP || {};
        const total = Object.values(moduleXP).reduce((sum, xp) => sum + (xp || 0), 0);
        const sources = [];

        if (moduleXP.productivity) sources.push({ module: 'Productivity', xp: moduleXP.productivity, percent: total > 0 ? Math.round((moduleXP.productivity / total) * 100) : 0 });
        if (moduleXP.fitness) sources.push({ module: 'Fitness', xp: moduleXP.fitness, percent: total > 0 ? Math.round((moduleXP.fitness / total) * 100) : 0 });
        if (moduleXP.health) sources.push({ module: 'Health', xp: moduleXP.health, percent: total > 0 ? Math.round((moduleXP.health / total) * 100) : 0 });
        if (moduleXP.knowledge) sources.push({ module: 'Knowledge', xp: moduleXP.knowledge, percent: total > 0 ? Math.round((moduleXP.knowledge / total) * 100) : 0 });
        if (moduleXP.journal) sources.push({ module: 'Journal', xp: moduleXP.journal, percent: total > 0 ? Math.round((moduleXP.journal / total) * 100) : 0 });
        if (moduleXP.financial) sources.push({ module: 'Financial', xp: moduleXP.financial, percent: total > 0 ? Math.round((moduleXP.financial / total) * 100) : 0 });
        if (moduleXP.skills) sources.push({ module: 'Skills', xp: moduleXP.skills, percent: total > 0 ? Math.round((moduleXP.skills / total) * 100) : 0 });
        if (moduleXP.calendar) sources.push({ module: 'Calendar', xp: moduleXP.calendar, percent: total > 0 ? Math.round((moduleXP.calendar / total) * 100) : 0 });
        if (moduleXP.social) sources.push({ module: 'Social', xp: moduleXP.social, percent: total > 0 ? Math.round((moduleXP.social / total) * 100) : 0 });
        if (moduleXP.quests) sources.push({ module: 'Quests', xp: moduleXP.quests, percent: total > 0 ? Math.round((moduleXP.quests / total) * 100) : 0 });
        if (moduleXP.achievements) sources.push({ module: 'Achievements', xp: moduleXP.achievements, percent: total > 0 ? Math.round((moduleXP.achievements / total) * 100) : 0 });

        return sources.sort((a, b) => b.xp - a.xp);
      })(),

      // How XP is earned (actions that give XP)
      xpActions: {
        task_completion: '10-50 XP per task (based on priority)',
        workout_completion: '50-100 XP per workout',
        meal_logging: '10 XP per meal logged',
        journal_entry: '25 XP per entry',
        book_completion: '100 XP per book',
        skill_practice: '5 XP per 10 minutes',
        expense_logging: '5 XP per transaction',
        quest_completion: '50-500 XP based on quest type',
        achievement_unlock: '100-1000 XP based on rarity',
        streak_bonus: 'XP multiplier increases with streak length',
      },

      // Current multipliers affecting XP gain
      activeMultipliers: {
        prestige: avatar.prestige === 0 ? 1 : avatar.prestige === 1 ? 1.5 : 2.0,
        streak: gamification.xpMultiplier || 1.0,
        equipment: gamification.stats?.wisdom ? 1 + (gamification.stats.wisdom * 0.01) : 1.0, // Wisdom boosts XP
      },
    },
  };
}

/**
 * Generate a comprehensive text summary for AI prompts
 * This creates a detailed overview that Nova can use to understand the user's current state
 */
export function generateContextSummary(context) {
  const lines = [];

  // === TIME CONTEXT ===
  lines.push('=== CURRENT CONTEXT ===');
  lines.push(`Time: ${context.time.current} (${context.time.timeOfDay})`);
  lines.push(`Day: ${context.time.dayOfWeek}${context.time.isWeekend ? ' (Weekend)' : ''}`);
  lines.push('');

  // === CHARACTER STATS (RPG) ===
  if (context.character) {
    lines.push('=== CHARACTER STATS ===');
    lines.push(`Character Level: ${context.character.level} (${context.character.prestigeRealm})`);
    lines.push(`Character XP: ${context.character.xp}/${context.character.xpToNextLevel} (Tier ${context.character.tier})`);
    lines.push(`Total XP Earned: ${context.character.totalXPEarned?.toLocaleString() || 0}`);
    if (context.character.prestige > 0) {
      lines.push(`Prestige Level: ${context.character.prestige} (${context.character.xpMultiplier}x XP multiplier)`);
    }
    lines.push('');
    lines.push('RPG Stats:');
    const stats = context.character.stats;
    lines.push(`  - Strength: ${stats.strength} (physical power, workout effectiveness)`);
    lines.push(`  - Vitality: ${stats.vitality} (health, endurance, recovery)`);
    lines.push(`  - Intelligence: ${stats.intelligence} (learning speed, knowledge retention)`);
    lines.push(`  - Wisdom: ${stats.wisdom} (XP gain bonus, decision quality)`);
    lines.push(`  - Defense: ${stats.defense} (streak protection, resilience)`);
    lines.push('');
    lines.push(`Equipped Gear: ${context.character.equippedCount} items`);
    if (context.character.activeTitle) {
      lines.push(`Active Title: ${context.character.activeTitle}`);
    }
    lines.push('');
  }

  // === XP SOURCES ===
  if (context.xpSources && context.xpSources.breakdown.length > 0) {
    lines.push('=== XP SOURCES (Where XP comes from) ===');
    context.xpSources.breakdown.forEach(source => {
      lines.push(`  - ${source.module}: ${source.xp?.toLocaleString() || 0} XP (${source.percent}%)`);
    });
    lines.push('');
    lines.push('XP Multipliers Active:');
    const mult = context.xpSources.activeMultipliers;
    if (mult.prestige > 1) lines.push(`  - Prestige bonus: ${mult.prestige}x`);
    if (mult.streak > 1) lines.push(`  - Streak bonus: ${mult.streak}x`);
    if (mult.equipment > 1) lines.push(`  - Wisdom bonus: ${mult.equipment.toFixed(2)}x`);
    lines.push('');
  }

  // === GAMIFICATION ===
  lines.push('=== PROGRESS & LEVEL ===');
  lines.push(`Level: ${context.gamification.level} (${context.gamification.stage} stage)`);
  lines.push(`Total XP: ${context.gamification.totalXP?.toLocaleString() || 0}`);
  lines.push(`Cosmic Credits: ${context.gamification.cosmicCredits || 0}`);
  lines.push(`Global Streak: ${context.gamification.streaks.global || 0} days`);
  lines.push('');

  // === STREAKS ===
  if (context.gamification.streaks.atRisk.length > 0) {
    lines.push('!!! STREAKS AT RISK !!!');
    context.gamification.streaks.atRisk.forEach(s => {
      lines.push(`  - ${s.name}: ${s.current} day streak about to break!`);
    });
    lines.push('');
  }

  if (context.gamification.streaks.active.length > 0) {
    lines.push('Active Streaks:');
    context.gamification.streaks.active.forEach(s => {
      lines.push(`  - ${s.name}: ${s.current} days (best: ${s.best})`);
    });
    lines.push('');
  }

  // === TODAY'S TASKS ===
  lines.push('=== TODAY\'S TASKS ===');
  if (context.dailyTasks.today.total > 0) {
    lines.push(`Progress: ${context.dailyTasks.today.completed}/${context.dailyTasks.today.total} completed (${context.dailyTasks.today.completionRate}%)`);
    if (context.dailyTasks.today.tasks.length > 0) {
      lines.push('Tasks:');
      context.dailyTasks.today.tasks.forEach(t => {
        const status = t.completed ? '✓' : '○';
        const priority = t.priority ? ` [${t.priority}]` : '';
        lines.push(`  ${status} ${t.name}${priority}`);
      });
    }
  } else {
    lines.push('No tasks planned for today');
  }
  lines.push('');

  // === NUTRITION ===
  lines.push('=== NUTRITION ===');
  if (context.health.dailyGoals?.calories) {
    lines.push(`Calories: ${context.health.todayNutrition.calories}/${context.health.dailyGoals.calories} (${context.health.todayNutrition.calorieProgress}%)`);
    lines.push(`Protein: ${context.health.todayNutrition.protein}g/${context.health.dailyGoals.protein || 0}g (${context.health.todayNutrition.proteinProgress}%)`);
    lines.push(`Carbs: ${context.health.todayNutrition.carbs}g | Fat: ${context.health.todayNutrition.fat}g`);
  }
  lines.push(`Meals logged today: ${context.health.todayNutrition.mealsLogged}`);
  lines.push('');

  // === FITNESS ===
  lines.push('=== FITNESS ===');
  lines.push(`Workouts this week: ${context.fitness.workoutsThisWeek} strength, ${context.fitness.cardioThisWeek} cardio`);
  lines.push(`Total workouts completed: ${context.fitness.totalWorkouts}`);

  if (context.fitness.hasActiveWorkout) {
    lines.push('*** Currently in a workout session! ***');
  }

  // Personal Records
  const prs = context.fitness.personalRecords || {};
  const prEntries = Object.entries(prs);
  if (prEntries.length > 0) {
    lines.push('Personal Records:');
    prEntries.slice(0, 15).forEach(([exerciseId, pr]) => {
      const exerciseName = exerciseId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      lines.push(`  - ${exerciseName}: ${pr.weight}lbs x ${pr.reps} reps${pr.date ? ` (${pr.date})` : ''}`);
    });
  }

  // Recent workouts
  if (context.fitness.workouts.length > 0) {
    lines.push('Recent Workouts:');
    context.fitness.workouts.slice(0, 5).forEach(w => {
      lines.push(`  - ${w.date}: ${w.name || 'Workout'} (${w.exercises.length} exercises, ${w.totalVolume?.toLocaleString() || 0}lbs volume)`);
    });
  }
  lines.push('');

  // === PRODUCTIVITY ===
  lines.push('=== PRODUCTIVITY ===');
  const activeProjects = context.productivity.projects.filter(p => p.status === 'active');
  lines.push(`Active Projects: ${activeProjects.length}`);
  if (activeProjects.length > 0) {
    activeProjects.slice(0, 5).forEach(p => {
      lines.push(`  - ${p.name}${p.progress ? ` (${p.progress}%)` : ''}`);
    });
  }
  lines.push(`Total focus sessions: ${context.productivity.sessions.length}`);
  if (context.productivity.hasActiveSession) {
    lines.push('*** Currently in a focus session! ***');
  }
  lines.push('');

  // === FINANCIAL ===
  lines.push('=== FINANCIAL ===');
  if (context.financial.totalBudget > 0) {
    const percentUsed = Math.round((context.financial.totalSpent / context.financial.totalBudget) * 100);
    const remaining = context.financial.totalBudget - context.financial.totalSpent;
    lines.push(`Budget: ${percentUsed}% used ($${remaining.toFixed(0)} remaining of $${context.financial.totalBudget.toFixed(0)})`);
    if (context.financial.totalSpent > context.financial.totalBudget) {
      lines.push('!!! OVER BUDGET !!!');
    }
  }
  lines.push(`Total savings: $${context.financial.totalSavings.toFixed(0)}`);
  if (context.financial.netWorth) {
    lines.push(`Net worth: $${context.financial.netWorth.toFixed(0)}`);
  }
  lines.push('');

  // === LEARNING ===
  lines.push('=== LEARNING ===');
  if (context.knowledge.booksInProgress.length > 0) {
    lines.push(`Books in progress: ${context.knowledge.booksInProgress.length}`);
    context.knowledge.booksInProgress.slice(0, 3).forEach(b => {
      const progress = b.currentPage && b.totalPages
        ? ` (${Math.round((b.currentPage / b.totalPages) * 100)}%)`
        : '';
      lines.push(`  - "${b.title}" by ${b.author}${progress}`);
    });
  }
  lines.push(`Total books completed: ${context.knowledge.booksCompleted.length}`);
  lines.push(`Notes created: ${context.knowledge.notes.length}`);
  lines.push('');

  // === SKILLS ===
  if (context.skills.allSkills.length > 0) {
    lines.push('=== SKILLS ===');
    lines.push(`Total practice time: ${context.skills.totalPracticeHours} hours across ${context.skills.totalSkills} skills`);
    context.skills.allSkills.slice(0, 5).forEach(s => {
      lines.push(`  - ${s.name}: ${s.xp} XP (${s.totalHours} hours)`);
    });
    lines.push('');
  }

  // === PURPOSE & VALUES ===
  if (context.purpose.missionStatement) {
    lines.push('=== PURPOSE ===');
    lines.push(`Mission: ${context.purpose.missionStatement}`);
  }
  if (context.purpose.coreValues.length > 0) {
    lines.push('Core Values:');
    context.purpose.coreValues.slice(0, 5).forEach(v => {
      lines.push(`  - ${v.name}: ${v.description || ''}`);
    });
    lines.push('');
  }

  // === RESOLUTIONS ===
  if (context.resolutions.active.length > 0) {
    lines.push('=== ACTIVE RESOLUTIONS ===');
    context.resolutions.active.forEach(r => {
      lines.push(`  - ${r.title}: ${r.currentStreak} day streak (${r.totalCheckIns} total check-ins)`);
    });
    lines.push('');
  }

  // === CALENDAR ===
  if (context.calendar.todayBlocks.length > 0) {
    lines.push('=== TODAY\'S SCHEDULE ===');
    context.calendar.todayBlocks.forEach(b => {
      const status = b.completed ? '✓' : '○';
      const time = new Date(b.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      lines.push(`  ${status} ${time} - ${b.title}`);
    });
    lines.push('');
  }

  if (context.calendar.upcomingEvents.length > 0) {
    lines.push('Upcoming Events:');
    context.calendar.upcomingEvents.slice(0, 5).forEach(e => {
      const date = new Date(e.start).toLocaleDateString();
      lines.push(`  - ${date}: ${e.title}`);
    });
    lines.push('');
  }

  // === ACHIEVEMENTS ===
  lines.push('=== ACHIEVEMENTS ===');
  lines.push(`Total unlocked: ${context.achievements.totalUnlocked}`);
  if (context.achievements.recentAchievements.length > 0) {
    const recent = context.achievements.recentAchievements.slice(-3);
    lines.push('Recent:');
    recent.forEach(a => {
      lines.push(`  - ${a.name || a.id || a}`);
    });
  }
  lines.push('');

  // === PETS ===
  if (context.pets.activePets.length > 0) {
    lines.push('=== ACTIVE COMPANIONS (Equipped Pets) ===');
    context.pets.activePets.forEach(pet => {
      const name = pet.name || pet.id || pet;
      const tier = pet.tier ? ` [${pet.tier.toUpperCase()}]` : '';
      const bonus = pet.bonusDescription || '';
      lines.push(`  - ${name}${tier}${bonus ? ` - ${bonus}` : ''}`);
      if (pet.description) {
        lines.push(`    "${pet.description}"`);
      }
    });
    const bonuses = context.pets.activeBonuses || {};
    if (Object.keys(bonuses).length > 0) {
      lines.push('Combined Active Bonuses:');
      Object.entries(bonuses).forEach(([type, amount]) => {
        lines.push(`  - ${type}: +${amount}%`);
      });
    }
    lines.push('');
  }

  // Show owned pets count
  if (context.pets.ownedPets.length > 0) {
    const collectionStats = context.pets.collectionStats || {};
    lines.push(`Pet Collection: ${collectionStats.owned || context.pets.ownedPets.length}/${collectionStats.total || '?'} pets (${collectionStats.percentage || 0}% complete)`);
    lines.push(`Pet Slots: ${context.pets.activePets.length}/${context.pets.maxSlots} equipped`);
    lines.push('');
  }

  // === SOCIAL ===
  if (context.social.friendCount > 0) {
    lines.push('=== SOCIAL ===');
    lines.push(`Friends: ${context.social.friendCount}`);
    if (context.social.currentGuild) {
      lines.push(`Guild: ${context.social.currentGuild.name}`);
    }
    if (context.social.myChallenges.length > 0) {
      lines.push(`Active challenges: ${context.social.myChallenges.length}`);
    }
  }

  return lines.join('\n');
}

/**
 * Get raw data for a specific module (for detailed queries)
 */
export function getModuleData(moduleName) {
  const context = getCrossModuleContext();

  const moduleMap = {
    gamification: context.gamification,
    tasks: context.dailyTasks,
    productivity: context.productivity,
    health: context.health,
    fitness: context.fitness,
    financial: context.financial,
    knowledge: context.knowledge,
    content: context.content,
    skills: context.skills,
    calendar: context.calendar,
    purpose: context.purpose,
    resolutions: context.resolutions,
    quests: context.quests,
    achievements: context.achievements,
    social: context.social,
    pets: context.pets,
    character: context.character,
    xpSources: context.xpSources,
  };

  return moduleMap[moduleName] || null;
}

/**
 * Secure version of getCrossModuleContext that validates user auth
 * Use this for any context that will be sent to external services
 *
 * @returns {Promise<Object|null>} Context object or null if not authenticated
 */
export async function getCrossModuleContextSecure() {
  const userId = await getCurrentUserId();

  if (!userId) {
    console.warn('[CrossModuleData] getCrossModuleContextSecure called without authenticated user');
    return null;
  }

  // Get the context - stores are already user-isolated via localStorage clearing on auth change
  const context = getCrossModuleContext();

  // Add user verification metadata
  return {
    ...context,
    _meta: {
      userId,
      fetchedAt: new Date().toISOString(),
      verified: true,
    },
  };
}

/**
 * Check if context data appears to be stale or from wrong user
 * Call this as a safety check before using context data
 */
export function validateContextFreshness(context, expectedUserId) {
  if (!context?._meta) {
    // Legacy context without metadata - allow but warn
    console.warn('[CrossModuleData] Context without metadata - cannot verify user');
    return true;
  }

  if (context._meta.userId !== expectedUserId) {
    console.error('[CrossModuleData] Context userId mismatch! Potential data leak.');
    return false;
  }

  // Check if context is older than 5 minutes
  const fetchedAt = new Date(context._meta.fetchedAt);
  const ageMs = Date.now() - fetchedAt.getTime();
  if (ageMs > 5 * 60 * 1000) {
    console.warn('[CrossModuleData] Context is stale (> 5 minutes old)');
  }

  return true;
}

export default {
  getCrossModuleContext,
  getCrossModuleContextSecure,
  validateContextFreshness,
  generateContextSummary,
  getModuleData
};
