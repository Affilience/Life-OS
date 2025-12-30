/**
 * Tour Definitions
 *
 * Configuration for all Nova-guided feature tours.
 * Each tour consists of steps that highlight specific elements
 * and provide contextual explanations from Nova.
 */

import {
  LayoutDashboard,
  CheckSquare,
  Dumbbell,
  User,
  Target,
  Wallet,
  BookOpen,
  Calendar,
  PenTool,
  Sparkles,
  Users,
  Zap,
  TrendingUp,
  Award,
  ShoppingBag,
  Heart,
  Brain,
  Clock,
  Star,
  Compass,
} from 'lucide-react';

/**
 * Nova emotional states for different tour moments
 */
export const NOVA_STATES = {
  EXCITED: 'excited',     // Starting tour, showing cool features
  HAPPY: 'happy',         // General explanations
  PROUD: 'proud',         // User accomplishments, tour completion
  ENCOURAGING: 'encouraging', // Motivating user to try things
  THOUGHTFUL: 'thoughtful',   // Explaining complex features
};

/**
 * Tooltip positions relative to highlighted element
 */
export const POSITIONS = {
  TOP: 'top',
  BOTTOM: 'bottom',
  LEFT: 'left',
  RIGHT: 'right',
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_RIGHT: 'bottom-right',
};

/**
 * Tour definitions by page/feature
 */
export const TOURS = {
  // ============================================
  // DASHBOARD TOUR
  // ============================================
  dashboard: {
    id: 'dashboard',
    name: 'Dashboard Overview',
    description: 'Learn how to navigate your personal command center',
    route: '/',
    icon: LayoutDashboard,
    estimatedTime: '3 min',
    steps: [
      {
        id: 'welcome',
        target: null, // No element - centered message
        title: 'Welcome to Your Dashboard!',
        content: "This is your command center - where everything comes together. Let me show you around!",
        novaState: NOVA_STATES.EXCITED,
        position: 'center',
      },
      {
        id: 'hero-section',
        target: '[data-tour="hero-section"]',
        title: 'Your Progress at a Glance',
        content: "Here you can see your level, XP progress, and current streak. Every action you take in Ascynt earns you experience points!",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.BOTTOM,
      },
      {
        id: 'quick-stats',
        target: '[data-tour="quick-stats"]',
        title: 'Module Health',
        content: "These cards show your engagement across all modules - productivity, health, fitness, knowledge, and more. Each score reflects your weekly activity!",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.BOTTOM,
      },
      {
        id: 'todays-plan',
        target: '[data-tour="todays-plan"]',
        title: "Today's Plan",
        content: "Your scheduled tasks and time blocks appear here. Check items off as you complete them to earn XP!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.LEFT,
      },
      {
        id: 'widgets',
        target: '[data-tour="widget-area"]',
        title: 'Your Widgets',
        content: "These widgets give you insights across all your modules. You can see streaks, recent activity, and weekly progress all in one place.",
        novaState: NOVA_STATES.THOUGHTFUL,
        position: POSITIONS.TOP,
      },
      {
        id: 'settings',
        target: '[data-tour="settings-btn"]',
        title: 'Settings & Preferences',
        content: "Head to Settings to customise your experience - change themes, adjust notifications, manage your profile, and more!",
        novaState: NOVA_STATES.THOUGHTFUL,
        position: POSITIONS.BOTTOM,
      },
      {
        id: 'edit-dashboard',
        target: '[data-tour="edit-dashboard-btn"]',
        title: 'Customize Your Dashboard',
        content: "Click here to enter Edit Mode! You can drag widgets to rearrange them, resize them by dragging corners, and remove widgets you don't need.",
        novaState: NOVA_STATES.EXCITED,
        position: POSITIONS.BOTTOM,
      },
      {
        id: 'add-widgets',
        target: '[data-tour="add-widget-btn"]',
        title: 'Add More Widgets',
        content: "Want more on your dashboard? Tap this button to browse all available widgets and add the ones you want! When done, click the X to exit edit mode.",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.LEFT,
      },
      {
        id: 'complete',
        target: null,
        title: 'You\'re All Set!',
        content: "That's the dashboard! Explore the other modules using the navigation. I'll be here if you need help - just click on me anytime!",
        novaState: NOVA_STATES.PROUD,
        position: 'center',
      },
    ],
  },

  // ============================================
  // PRODUCTIVITY TOUR
  // ============================================
  productivity: {
    id: 'productivity',
    name: 'Productivity Module',
    description: 'Master your tasks, projects, and focus sessions',
    route: '/productivity',
    icon: CheckSquare,
    estimatedTime: '4 min',
    steps: [
      {
        id: 'welcome',
        target: null,
        title: 'Welcome to Productivity!',
        content: "This is where you'll manage your tasks, projects, and deep work sessions. Let's explore how to set up your productivity system!",
        novaState: NOVA_STATES.EXCITED,
        position: 'center',
      },
      {
        id: 'tabs',
        target: '[data-tour="productivity-tabs"]',
        title: 'Module Sections',
        content: "Use these tabs to switch between Tasks, Projects, and Work Sessions. Each serves a different purpose in your productivity workflow.",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.BOTTOM,
      },
      {
        id: 'add-task',
        target: null, // No specific target, use centered message
        title: 'Quick Task Entry',
        content: "You can add tasks directly from the dashboard! Set a priority, category, and estimated time. Great for capturing things you need to do right away.",
        novaState: NOVA_STATES.ENCOURAGING,
        position: 'center',
      },
      {
        id: 'projects-intro',
        target: '[data-tour="productivity-tabs"]',
        title: 'Now Let\'s Look at Projects',
        content: "Projects help you organize bigger goals. Switch to the Projects tab to see how to set one up!",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.BOTTOM,
      },
      {
        id: 'create-project',
        target: '[data-tour="create-project-btn"]',
        title: 'Creating a Project',
        content: "Click here to create a new project. You'll set a name, priority, timeline, and even add initial tasks. Projects help you track progress on bigger goals!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'projects-list',
        target: '[data-tour="projects-list"]',
        title: 'Your Projects',
        content: "All your projects appear here. You can see progress, time spent, and expand each to view tasks. Click a project to add tasks or track work sessions against it!",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.TOP,
      },
      {
        id: 'work-sessions-intro',
        target: '[data-tour="productivity-tabs"]',
        title: 'Time for Work Sessions!',
        content: "Work Sessions track your focused work time. Switch to the Sessions tab to learn about the Pomodoro-style timer!",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.BOTTOM,
      },
      {
        id: 'pomodoro',
        target: '[data-tour="pomodoro-timer"]',
        title: 'Focus Timer Setup',
        content: "Select a session type (Deep Work, Learning, etc.) and optionally link it to a project. This helps categorize your time for better analytics.",
        novaState: NOVA_STATES.THOUGHTFUL,
        position: POSITIONS.LEFT,
      },
      {
        id: 'start-session',
        target: '[data-tour="start-session-btn"]',
        title: 'Starting a Work Session',
        content: "Click Start Session to begin tracking your focused time. The timer runs until you end it. You'll rate your focus quality afterward to track productivity trends!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'stats',
        target: '[data-tour="productivity-stats"]',
        title: 'Your Productivity Stats',
        content: "Track your productivity trends here. See today's focus time, average focus quality, and weekly totals. Data helps you understand your most productive times!",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.TOP,
      },
      {
        id: 'complete',
        target: null,
        title: 'Ready to be Productive!',
        content: "You've learned how to add tasks, create projects, and start work sessions. Remember: consistency beats intensity. Small daily progress adds up to big results!",
        novaState: NOVA_STATES.PROUD,
        position: 'center',
      },
    ],
  },

  // ============================================
  // HEALTH TOUR
  // ============================================
  health: {
    id: 'health',
    name: 'Health & Fitness',
    description: 'Track nutrition, workouts, cardio, and more',
    route: '/health',
    icon: Dumbbell,
    estimatedTime: '5 min',
    steps: [
      {
        id: 'welcome',
        target: null,
        title: 'Welcome to Health!',
        content: "Your body is your most important asset. Here you can track nutrition, workouts, cardio, and overall wellness. Let me show you everything!",
        novaState: NOVA_STATES.EXCITED,
        position: 'center',
      },
      {
        id: 'tabs',
        target: '[data-tour="health-tabs"]',
        title: 'Health Sections',
        content: "You have four main areas: Dashboard for overview, Workouts for strength training, Nutrition for food tracking, and Cardio for running/cycling.",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.BOTTOM,
      },
      {
        id: 'dashboard-tab',
        target: '[data-tour="health-tab-dashboard"]',
        title: 'Dashboard Tab',
        content: "The Dashboard shows your health summary at a glance. Let's start here to see the overview!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'dashboard-section',
        target: null, // Full section, use centered message
        title: 'Health Dashboard',
        content: "This dashboard shows your nutrition progress, recent workouts, personal records, and health trends all in one place!",
        novaState: NOVA_STATES.HAPPY,
        position: 'center',
      },
      {
        id: 'workouts-tab',
        target: '[data-tour="health-tab-workouts"]',
        title: 'Workouts Tab',
        content: "Click the Workouts tab to track your strength training! Log exercises, sets, reps, and weights.",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'workouts-section',
        target: null, // Full section, use centered message
        title: 'Strength Training',
        content: "Track your strength workouts here. You can use workout templates or create custom routines. The app tracks your personal records automatically!",
        novaState: NOVA_STATES.HAPPY,
        position: 'center',
      },
      {
        id: 'workout-templates',
        target: null, // Full section, use centered message
        title: 'Workout Templates',
        content: "Use templates for quick logging! Choose from built-in templates like Push/Pull/Legs or create your own custom routines.",
        novaState: NOVA_STATES.THOUGHTFUL,
        position: 'center',
      },
      {
        id: 'start-workout',
        target: '[data-tour="start-workout-btn"]',
        title: 'Starting a Workout',
        content: "Click here to start a workout session. Select a template, then log your sets and reps. The timer tracks your session duration!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'nutrition-tab',
        target: '[data-tour="health-tab-nutrition"]',
        title: 'Nutrition Tab',
        content: "Click the Nutrition tab to track your meals and macros! See your daily calories, protein, carbs, and fats.",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'nutrition-section',
        target: null, // Full section, use centered message
        title: 'Meal Tracking',
        content: "Track everything you eat here. Log meals with detailed nutritional info, or use the quick-add feature for simple entries.",
        novaState: NOVA_STATES.HAPPY,
        position: 'center',
      },
      {
        id: 'log-meal',
        target: '[data-tour="log-meal-btn"]',
        title: 'Logging Meals',
        content: "Click here to log a meal! You can search foods, enter custom meals, or use the AI-powered smart meal logger for instant nutrition estimates.",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'cardio-tab',
        target: '[data-tour="health-tab-cardio"]',
        title: 'Cardio Tab',
        content: "Click the Cardio tab to track running, cycling, swimming, and other cardio activities!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'cardio-section',
        target: null, // Full section, use centered message
        title: 'Cardio Tracking',
        content: "Log your cardio sessions here - distance, duration, heart rate, and more. Track your progress over time and set new personal bests!",
        novaState: NOVA_STATES.HAPPY,
        position: 'center',
      },
      {
        id: 'complete',
        target: null,
        title: 'Stay Healthy!',
        content: "You now know how to track workouts, log meals, and record cardio sessions. Consistency is key - even small daily logs compound into big results!",
        novaState: NOVA_STATES.PROUD,
        position: 'center',
      },
    ],
  },

  // ============================================
  // CHARACTER TOUR
  // ============================================
  character: {
    id: 'character',
    name: 'Character & Avatar',
    description: 'Explore your RPG stats, equipment, and evolution',
    route: '/character',
    icon: User,
    estimatedTime: '4 min',
    steps: [
      {
        id: 'welcome',
        target: null,
        title: 'Meet Your Character!',
        content: "This is YOU in Ascynt - your character grows as you grow. Let me show you how to customise your avatar, equip gear, unlock perks, and adopt companions!",
        novaState: NOVA_STATES.EXCITED,
        position: 'center',
      },
      {
        id: 'avatar',
        target: '[data-tour="character-avatar"]',
        title: 'Your Avatar',
        content: "This is your visual representation. As you level up, your avatar evolves through 40 unique stages - from Dreamer to Avatar of Mastery!",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.RIGHT,
      },
      {
        id: 'stats',
        target: '[data-tour="character-stats"]',
        title: 'RPG Stats',
        content: "These stats reflect your real-life activities. Strength from workouts, Intelligence from learning, Wisdom from journaling. They provide real bonuses to XP gains!",
        novaState: NOVA_STATES.THOUGHTFUL,
        position: POSITIONS.LEFT,
      },
      {
        id: 'equipment-tab',
        target: '[data-tour="character-tab-equipment"]',
        title: 'Equipment Tab',
        content: "The Equipment tab shows all the gear you can unlock! Each piece provides stat bonuses and changes your avatar's appearance.",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
      },
      {
        id: 'skills-tab',
        target: '[data-tour="character-tab-skills"]',
        title: 'Skill Tree Tab',
        content: "The Skill Tree tab has the perk system! Spend perk points on powerful abilities that give bonuses like extra XP, streak protection, and bonus rewards.",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
      },
      {
        id: 'pets-tab',
        target: '[data-tour="character-tab-pets"]',
        title: 'Companions Tab',
        content: "The Companions tab shows your mythological pets! Collect creatures from different cultures - each gives XP bonuses. Equip up to 3 at once!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
      },
      {
        id: 'bazaar-tab',
        target: '[data-tour="character-tab-bazaar"]',
        title: 'Bazaar Tab',
        content: "The Bazaar is your shop! Spend Cosmic Credits on avatar cosmetics, XP boosters, loot boxes, and special items. Earn credits by completing quests and achievements!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
      },
      {
        id: 'complete',
        target: null,
        title: 'Your Journey Awaits!',
        content: "You've seen your character's full potential! Keep tracking activities to level up, unlock gear, expand your perk tree, and collect companions. Your avatar reflects your real growth!",
        novaState: NOVA_STATES.PROUD,
        position: 'center',
      },
    ],
  },

  // ============================================
  // QUESTS TOUR
  // ============================================
  quests: {
    id: 'quests',
    name: 'Quests & Missions',
    description: 'Plan your day, track habits, and earn achievements',
    route: '/quests',
    icon: Target,
    estimatedTime: '4 min',
    steps: [
      {
        id: 'welcome',
        target: null,
        title: 'Welcome to Quests!',
        content: "This is your mission control! Plan your day, break bad habits, track streaks, and unlock achievements. Let me show you around!",
        novaState: NOVA_STATES.EXCITED,
        position: 'center',
      },
      {
        id: 'tabs-overview',
        target: '[data-tour="daily-quests"]',
        title: 'Quest Tabs',
        content: "You have four main sections here: Today for daily planning, Quit for breaking bad habits, Streaks for tracking consistency, and Achievements for unlocking rewards.",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.BOTTOM,
      },
      {
        id: 'today-tab',
        target: '[data-tour="quests-tab-plan"]',
        title: 'Today Tab',
        content: "The Today tab is where you plan your day. Click it to see how you can organize tasks for today and tomorrow!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'plan-section',
        target: null, // Full section, use centered message
        title: 'Daily Planning',
        content: "Plan today's tasks and tomorrow's schedule here. You can add tasks, set priorities, and drag to reorder. Completing tasks earns XP and maintains your streak!",
        novaState: NOVA_STATES.HAPPY,
        position: 'center',
      },
      {
        id: 'quit-tab',
        target: '[data-tour="quests-tab-quit"]',
        title: 'Quit Tab',
        content: "Click the Quit tab to track habits you want to break. It's like a reverse habit tracker - celebrate your progress staying clean!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'quit-section',
        target: null, // Full section, use centered message
        title: 'Breaking Bad Habits',
        content: "Track habits you want to quit - like reducing screen time or stopping nail biting. Log when you resist the urge and watch your streak grow!",
        novaState: NOVA_STATES.THOUGHTFUL,
        position: 'center',
      },
      {
        id: 'streaks-tab',
        target: '[data-tour="quests-tab-streaks"]',
        title: 'Streaks Tab',
        content: "Click the Streaks tab to see all your consistency chains. Streaks are powerful motivators - don't break the chain!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'streaks-section',
        target: null, // Full section, use centered message
        title: 'Your Streaks',
        content: "View all your active streaks across the app - workouts, journal entries, tasks, and more. Longer streaks unlock special bonuses and achievements!",
        novaState: NOVA_STATES.EXCITED,
        position: 'center',
      },
      {
        id: 'achievements-tab',
        target: '[data-tour="quests-tab-achievements"]',
        title: 'Achievements Tab',
        content: "Click the Achievements tab to see all the badges and milestones you can unlock. Gotta catch 'em all!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'achievements-section',
        target: null, // Full section, use centered message
        title: 'Achievements',
        content: "Unlock achievements by hitting milestones - like 100 workouts, 50 journal entries, or reaching level 50. Each achievement gives XP and Cosmic Credits!",
        novaState: NOVA_STATES.HAPPY,
        position: 'center',
      },
      {
        id: 'bosses-tab',
        target: '[data-tour="quests-tab-bosses"]',
        title: 'Boss Battles Tab',
        content: "Click the Bosses tab to face epic challenges! Defeat powerful bosses by completing tasks and earn legendary rewards.",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'bosses-section',
        target: null, // Full section, use centered message
        title: 'Epic Boss Battles',
        content: "Face off against mighty bosses! Each boss has a health bar you deplete by completing tasks. Defeat them before the timer runs out to earn XP, credits, and exclusive equipment!",
        novaState: NOVA_STATES.EXCITED,
        position: 'center',
      },
      {
        id: 'complete',
        target: null,
        title: 'Quest Accepted!',
        content: "You're all set! Plan your days, break bad habits, maintain streaks, collect achievements, and battle bosses. Every small win compounds into massive progress!",
        novaState: NOVA_STATES.PROUD,
        position: 'center',
      },
    ],
  },

  // ============================================
  // FINANCIAL TOUR
  // ============================================
  financial: {
    id: 'financial',
    name: 'Financial Tracking',
    description: 'Budget, expenses, savings, and net worth',
    route: '/financial',
    icon: Wallet,
    estimatedTime: '4 min',
    steps: [
      {
        id: 'welcome',
        target: null,
        title: 'Welcome to Finance!',
        content: "Take control of your money! Track spending, manage budgets, and watch your savings grow. Financial health is life health!",
        novaState: NOVA_STATES.EXCITED,
        position: 'center',
      },
      {
        id: 'tabs',
        target: '[data-tour="financial-tabs"]',
        title: 'Financial Sections',
        content: "You have two main areas: Budget for tracking income, expenses, and category budgets, and Goals for your savings targets.",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.BOTTOM,
      },
      {
        id: 'budget-tab',
        target: '[data-tour="financial-tab-budget"]',
        title: 'Budget Tab',
        content: "The Budget tab is your financial command center. Let's explore what you can do here!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'financial-summary',
        target: '[data-tour="financial-summary"]',
        title: 'Financial Overview',
        content: "See your monthly snapshot at a glance - total income, expenses, net savings, and your savings rate. These update automatically as you log transactions.",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.BOTTOM,
      },
      {
        id: 'financial-charts',
        target: '[data-tour="financial-charts"]',
        title: 'Visual Insights',
        content: "These charts show your Budget vs Actual spending by category, and a spending breakdown pie chart. Below you'll find a 6-month trend showing income vs expenses over time.",
        novaState: NOVA_STATES.THOUGHTFUL,
        position: POSITIONS.TOP,
      },
      {
        id: 'create-budget',
        target: '[data-tour="create-budget-btn"]',
        title: 'Creating Budgets',
        content: "Click here to set up your budget categories. Allocate amounts to each category like Food, Transport, Entertainment - the envelope method helps you stay on track!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'budget-categories',
        target: '[data-tour="budget-categories"]',
        title: 'Category Budgets',
        content: "Once set up, your category budgets appear here with progress bars. See at a glance which categories are on track and which need attention.",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.BOTTOM,
      },
      {
        id: 'add-income',
        target: '[data-tour="add-income-btn"]',
        title: 'Logging Income',
        content: "Click here to add your income - salary, freelance work, side hustles, or any money coming in. Track all your income sources!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'add-expense',
        target: '[data-tour="add-expense-btn"]',
        title: 'Logging Expenses',
        content: "Click here to log your purchases. Categorize each expense to see where your money really goes. Awareness is the first step to control!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'goals-tab',
        target: '[data-tour="financial-tab-goals"]',
        title: 'Savings Goals',
        content: "Now let's look at the Goals tab! This is where you set and track savings targets.",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'savings-goals',
        target: '[data-tour="savings-goals"]',
        title: 'Your Savings Goals',
        content: "Create goals with target amounts and deadlines. The app calculates how much to save daily, weekly, or monthly to reach your target on time. Hit milestones to earn XP!",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.TOP,
      },
      {
        id: 'complete',
        target: null,
        title: 'Financial Freedom Awaits!',
        content: "You've seen the full financial module! Set budgets, track expenses, log income, and save towards goals. Consistent tracking leads to better decisions and financial health!",
        novaState: NOVA_STATES.PROUD,
        position: 'center',
      },
    ],
  },

  // ============================================
  // KNOWLEDGE TOUR
  // ============================================
  knowledge: {
    id: 'knowledge',
    name: 'Knowledge Management',
    description: 'Books, notes, ideas, and learning',
    route: '/knowledge',
    icon: BookOpen,
    estimatedTime: '4 min',
    steps: [
      {
        id: 'welcome',
        target: null,
        title: 'Welcome to Knowledge!',
        content: "Your second brain lives here. Track books, capture notes, manage your learning, and build a personal knowledge base. Let me show you everything!",
        novaState: NOVA_STATES.EXCITED,
        position: 'center',
      },
      {
        id: 'tabs',
        target: '[data-tour="knowledge-tabs"]',
        title: 'Knowledge Sections',
        content: "You have three main areas: Dashboard for an overview of your learning, Library for books/podcasts/courses, and Notes for capturing thoughts.",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.BOTTOM,
      },
      {
        id: 'dashboard-tab',
        target: '[data-tour="knowledge-tab-dashboard"]',
        title: 'Dashboard Tab',
        content: "The Dashboard shows your reading progress, learning stats, and knowledge metrics. Let's start here!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'reading-progress',
        target: '[data-tour="books-section"]',
        title: 'Reading Progress',
        content: "See your current books in progress here. Track how far you've gotten and how many you've completed this month.",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.TOP,
      },
      {
        id: 'knowledge-stats',
        target: '[data-tour="knowledge-stats"]',
        title: 'Your Knowledge Stats',
        content: "Quick stats showing books read, notes captured, and ideas saved. These grow as you learn and document!",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.TOP,
      },
      {
        id: 'notes-capture',
        target: '[data-tour="notes-section"]',
        title: 'Knowledge Capture',
        content: "See how many notes you're capturing each week. Regular note-taking builds a valuable knowledge base over time.",
        novaState: NOVA_STATES.THOUGHTFUL,
        position: POSITIONS.TOP,
      },
      {
        id: 'library-tab',
        target: '[data-tour="knowledge-tab-library"]',
        title: 'Library Tab',
        content: "Click the Library tab to manage all your books, podcasts, videos, and courses!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'library-section',
        target: null, // Full section, use centered message
        title: 'Your Library',
        content: "This is your content library! Add books, podcasts, videos, and courses. Track your progress and mark items as completed.",
        novaState: NOVA_STATES.HAPPY,
        position: 'center',
      },
      {
        id: 'library-sidebar',
        target: '[data-tour="library-sidebar"]',
        title: 'Library Navigation',
        content: "Use this sidebar to filter by content type - All Items, Books, Podcasts, Videos, or Courses. You can also view your Collections here.",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.RIGHT,
      },
      {
        id: 'quick-capture',
        target: '[data-tour="quick-capture-btn"]',
        title: 'Quick Capture',
        content: "Click here to quickly add a note, book, or idea. Great for capturing thoughts before you forget them!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'notes-tab',
        target: '[data-tour="knowledge-tab-notes"]',
        title: 'Notes Tab',
        content: "Click the Notes tab to write and organise your notes. This is where you capture learnings and ideas!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'notes-writer',
        target: null, // Full section, use centered message
        title: 'Quick Notes',
        content: "Write quick notes here! Add a title, choose a category (Personal, Work, Ideas, Research, Meetings), and jot down your thoughts.",
        novaState: NOVA_STATES.HAPPY,
        position: 'center',
      },
      {
        id: 'complete',
        target: null,
        title: 'Keep Learning!',
        content: "You've seen the Knowledge module! Track your reading, capture notes, and build your second brain. The more you document, the more connections you'll find!",
        novaState: NOVA_STATES.PROUD,
        position: 'center',
      },
    ],
  },

  // ============================================
  // CALENDAR TOUR
  // ============================================
  calendar: {
    id: 'calendar',
    name: 'Calendar & Scheduling',
    description: 'Time blocking, events, and planning',
    route: '/calendar',
    icon: Calendar,
    estimatedTime: '3 min',
    steps: [
      {
        id: 'welcome',
        target: null,
        title: 'Welcome to Calendar!',
        content: "Master your time with intentional scheduling. Block time for important work, track events, and plan your days effectively!",
        novaState: NOVA_STATES.EXCITED,
        position: 'center',
      },
      {
        id: 'view-switcher',
        target: '[data-tour="calendar-views"]',
        title: 'Calendar Views',
        content: "Switch between Month, Week, and Day views. Month gives you the big picture, Week shows your full schedule, and Day lets you focus on today's blocks.",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.BOTTOM,
      },
      {
        id: 'month-view',
        target: null, // Use centered message
        title: 'Month Overview',
        content: "The Month view shows your entire month at a glance. Click any day to see its time blocks, and track your monthly deep work hours and completion rate!",
        novaState: NOVA_STATES.THOUGHTFUL,
        position: 'center',
      },
      {
        id: 'month-stats',
        target: null, // Use centered message
        title: 'Monthly Statistics',
        content: "Track your monthly progress - total blocks, deep work hours, completed tasks, and your overall completion rate. Great for spotting patterns!",
        novaState: NOVA_STATES.HAPPY,
        position: 'center',
      },
      {
        id: 'time-blocks',
        target: null, // Use centered message
        title: 'Time Blocking',
        content: "Create time blocks for focused work. When you complete a block, mark it done to earn XP and track your actual vs. planned time.",
        novaState: NOVA_STATES.THOUGHTFUL,
        position: 'center',
      },
      {
        id: 'add-block',
        target: null, // Use centered message
        title: 'Adding Time Blocks',
        content: "Click to create a new time block, or click directly on any empty time slot in Day view. Set the activity, duration, and category!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: 'center',
      },
      {
        id: 'complete',
        target: null,
        title: 'Own Your Time!',
        content: "What gets scheduled gets done. Use Month view for planning, Week view for the big picture, and Day view for focused execution!",
        novaState: NOVA_STATES.PROUD,
        position: 'center',
      },
    ],
  },

  // ============================================
  // JOURNAL TOUR
  // ============================================
  journal: {
    id: 'journal',
    name: 'Journal & Reflection',
    description: 'Daily entries, mood tracking, and self-reflection',
    route: '/journal',
    icon: PenTool,
    estimatedTime: '3 min',
    steps: [
      {
        id: 'welcome',
        target: null,
        title: 'Welcome to Journal!',
        content: "Reflection is a superpower. Capture your thoughts, track your mood, and document your journey. Your future self will love reading this!",
        novaState: NOVA_STATES.EXCITED,
        position: 'center',
      },
      {
        id: 'journal-book',
        target: null, // Full journal book, use centered message
        title: 'Your Personal Journal',
        content: "This is your journal book! Flip through entries like a real book - oldest entries at the front, newest at the back. Use the arrows to navigate pages.",
        novaState: NOVA_STATES.HAPPY,
        position: 'center',
      },
      {
        id: 'customize-cover',
        target: '[data-tour="customize-cover-btn"]',
        title: 'Customize Your Cover',
        content: "Make it yours! Click here to customise your journal cover - choose colours, textures, icons, and set your journal's title.",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'write-entry',
        target: '[data-tour="write-entry-btn"]',
        title: 'Write an Entry',
        content: "Click here to start writing! You'll be able to add a title, write your thoughts, track your mood, and add tags to organise entries.",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'writer-date',
        target: '[data-tour="writer-date"]',
        title: 'Entry Date',
        content: "Set the date for your entry. You can backdate entries if you're catching up on journaling.",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.BOTTOM,
      },
      {
        id: 'writer-content',
        target: '[data-tour="writer-content"]',
        title: 'Write Your Thoughts',
        content: "This is your writing space. Just start typing! The more you write, the more XP you earn. Word count is tracked at the bottom.",
        novaState: NOVA_STATES.THOUGHTFUL,
        position: POSITIONS.TOP,
      },
      {
        id: 'mood-tracker',
        target: '[data-tour="mood-tracker"]',
        title: 'Mood Tracking',
        content: "Rate your mood from 1-10. Over time, you'll see patterns - what influences good days vs bad days. Self-awareness is powerful!",
        novaState: NOVA_STATES.THOUGHTFUL,
        position: POSITIONS.TOP,
      },
      {
        id: 'save-entry',
        target: '[data-tour="save-entry-btn"]',
        title: 'Save Your Entry',
        content: "When you're done, click Save to add this entry to your journal. Don't worry - you can always come back and edit entries later!",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.BOTTOM,
      },
      {
        id: 'complete',
        target: null,
        title: 'Write On!',
        content: "Even a few sentences count. The habit of reflection compounds into deep self-understanding. Journal regularly to earn XP and maintain your streak!",
        novaState: NOVA_STATES.PROUD,
        position: 'center',
      },
    ],
  },

  // ============================================
  // SKILLS TOUR
  // ============================================
  skills: {
    id: 'skills',
    name: 'Skills Tracker',
    description: 'Track skill development and practice time',
    route: '/skills',
    icon: Star,
    estimatedTime: '2 min',
    steps: [
      {
        id: 'welcome',
        target: null,
        title: 'Welcome to Skills!',
        content: "Every expert was once a beginner. Track your skills, log practice time, and level up your abilities through deliberate practice!",
        novaState: NOVA_STATES.EXCITED,
        position: 'center',
      },
      {
        id: 'skills-grid',
        target: '[data-tour="skill-constellation"]',
        title: 'Your Skills',
        content: "Here are all the skills you're developing. Each card shows your progress level, practice streak, total hours invested, and XP earned.",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.BOTTOM,
      },
      {
        id: 'skill-detail',
        target: '[data-tour="skill-detail"]',
        title: 'Skill Details',
        content: "Click any skill card to see detailed progress, practice history, and log new practice sessions. Track your journey from Beginner to Expert!",
        novaState: NOVA_STATES.THOUGHTFUL,
        position: POSITIONS.LEFT,
      },
      {
        id: 'add-skill',
        target: '[data-tour="add-skill-btn"]',
        title: 'Adding Skills',
        content: "Click here to add a new skill you're developing. Track anything - coding, music, languages, sports, art, anything you want to master!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'complete',
        target: null,
        title: 'Build Your Skills!',
        content: "Consistent practice is the key to mastery. Log your practice sessions, maintain your streaks, and watch your skills level up over time!",
        novaState: NOVA_STATES.PROUD,
        position: 'center',
      },
    ],
  },

  // ============================================
  // PURPOSE & VALUES TOUR
  // ============================================
  purpose: {
    id: 'purpose',
    name: 'Purpose & Values',
    description: 'Define your mission, vision, and core values',
    route: '/purpose',
    icon: Compass,
    estimatedTime: '3 min',
    steps: [
      {
        id: 'welcome',
        target: null,
        title: 'Welcome to Purpose!',
        content: "This is your North Star - where you define your mission, vision, and core values. Living with intention starts here. Let me guide you through!",
        novaState: NOVA_STATES.EXCITED,
        position: 'center',
      },
      {
        id: 'tabs',
        target: '[data-tour="purpose-tabs"]',
        title: 'Purpose Sections',
        content: "You have five main areas: Dashboard for a summary, Resolutions for your goals and commitments, Mission for your life purpose, Values for what matters most, and Vision for future goals.",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.BOTTOM,
      },
      {
        id: 'dashboard-tab',
        target: '[data-tour="purpose-tab-dashboard"]',
        title: 'Dashboard Tab',
        content: "The Dashboard shows your purpose at a glance - your mission statement, top values, and vision snapshots. Let's start here!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'dashboard-stats',
        target: '[data-tour="purpose-overview-stats"]',
        title: 'Purpose Stats',
        content: "See your key metrics - how many values you've defined, whether your mission is set, and how many visions you've created. These help you track intentional living!",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.BOTTOM,
      },
      {
        id: 'mission-preview',
        target: '[data-tour="purpose-mission-preview"]',
        title: 'Your Mission',
        content: "Your personal mission statement appears here. It's the answer to 'Why am I here?' - a guiding star for all your decisions.",
        novaState: NOVA_STATES.THOUGHTFUL,
        position: POSITIONS.TOP,
      },
      {
        id: 'mission-tab',
        target: '[data-tour="purpose-tab-mission"]',
        title: 'Mission Tab',
        content: "Click the Mission tab to define or edit your personal mission statement. This is the foundation of intentional living!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'mission-section',
        target: '[data-tour="purpose-mission-section"]',
        title: 'Define Your Mission',
        content: "Your mission statement captures your purpose - what impact you want to make and why you do what you do. Examples are provided for inspiration!",
        novaState: NOVA_STATES.THOUGHTFUL,
        position: POSITIONS.TOP,
      },
      {
        id: 'values-tab',
        target: '[data-tour="purpose-tab-values"]',
        title: 'Values Tab',
        content: "Click the Values tab to define your core values. Values are the principles that guide your decisions and behavior.",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'values-section',
        target: '[data-tour="purpose-values-section"]',
        title: 'Your Core Values',
        content: "Define and rank your core values here. Rate their importance from 1-10. When facing tough decisions, check if your choice aligns with these values!",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.TOP,
      },
      {
        id: 'add-value',
        target: '[data-tour="add-value-btn"]',
        title: 'Adding Values',
        content: "Click here to add a new core value. You can also take the Values Assessment to discover your values through guided questions!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'vision-tab',
        target: '[data-tour="purpose-tab-vision"]',
        title: 'Vision Tab',
        content: "Click the Vision tab to paint a picture of your future across different time horizons - 1 year, 5 years, 10 years, and beyond!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'vision-section',
        target: '[data-tour="purpose-vision-section"]',
        title: 'Life Vision',
        content: "Define your vision at each time horizon. Where do you want to be? What will you have achieved? Clear vision makes daily choices easier!",
        novaState: NOVA_STATES.THOUGHTFUL,
        position: POSITIONS.TOP,
      },
      {
        id: 'complete',
        target: null,
        title: 'Live with Purpose!',
        content: "You've seen how to define your mission, values, and vision. When you know your Why, the How becomes clear. Start defining your North Star!",
        novaState: NOVA_STATES.PROUD,
        position: 'center',
      },
    ],
  },

  // ============================================
  // SOCIAL TOUR
  // ============================================
  social: {
    id: 'social',
    name: 'Social & Community',
    description: 'Friends, guilds, challenges, and leaderboards',
    route: '/social',
    icon: Users,
    estimatedTime: '4 min',
    steps: [
      {
        id: 'welcome',
        target: null,
        title: 'Welcome to Social!',
        content: "Self-improvement is better with friends! Connect with others, join guilds, compete in challenges, and climb the leaderboards. Let me show you around!",
        novaState: NOVA_STATES.EXCITED,
        position: 'center',
      },
      {
        id: 'tabs-overview',
        target: '[data-tour="social-tabs"]',
        title: 'Social Sections',
        content: "You have five areas: Feed for activity updates, Leaderboards for rankings, Guilds for team collaboration, Friends for connections, and Challenges for competitions.",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.BOTTOM,
      },
      {
        id: 'feed-tab',
        target: '[data-tour="social-tab-feed"]',
        title: 'Activity Feed',
        content: "The Feed shows recent activity from you and your friends - level ups, achievements, and milestones. Stay motivated by seeing others' progress!",
        novaState: NOVA_STATES.HAPPY,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'leaderboards-tab',
        target: '[data-tour="social-tab-leaderboards"]',
        title: 'Leaderboards Tab',
        content: "Click Leaderboards to see how you rank against other users. Compete on All-Time XP, Weekly XP, or Streak rankings!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'leaderboards-section',
        target: null, // Full section, use centered message
        title: 'Compete & Climb',
        content: "Opt-in to appear on leaderboards, then compete with the community. Filter by All-Time XP, Weekly XP, or Streaks. A little competition keeps things fun!",
        novaState: NOVA_STATES.EXCITED,
        position: 'center',
      },
      {
        id: 'guilds-tab',
        target: '[data-tour="social-tab-guilds"]',
        title: 'Guilds Tab',
        content: "Click Guilds to find or create a team. Guilds let you collaborate with others and earn bonus rewards together!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'guilds-section',
        target: null, // Full section, use centered message
        title: 'Team Up',
        content: "Join an existing guild or create your own. Guild members can see each other's progress, share achievements, and compete as a team on leaderboards!",
        novaState: NOVA_STATES.HAPPY,
        position: 'center',
      },
      {
        id: 'friends-tab',
        target: '[data-tour="social-tab-friends"]',
        title: 'Friends Tab',
        content: "Click Friends to manage your connections. Add friends to see their activity and challenge them!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'friends-section',
        target: null, // Full section, use centered message
        title: 'Your Friends',
        content: "See all your friends, their levels, and online status. Accept or decline friend requests here too!",
        novaState: NOVA_STATES.HAPPY,
        position: 'center',
      },
      {
        id: 'add-friend',
        target: '[data-tour="add-friend-btn"]',
        title: 'Adding Friends',
        content: "Click here to send a friend request. Search by username to find people you know. Accountability partners make all the difference!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'challenges-tab',
        target: '[data-tour="social-tab-challenges"]',
        title: 'Challenges Tab',
        content: "Click Challenges to compete with friends or the community. Set goals, track progress, and earn bonus XP!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'challenges-section',
        target: null, // Full section, use centered message
        title: 'Challenge System',
        content: "Join community challenges or create head-to-head battles with friends. Challenges have specific goals like 'Complete 10 workouts this week' with XP rewards!",
        novaState: NOVA_STATES.EXCITED,
        position: 'center',
      },
      {
        id: 'create-challenge',
        target: '[data-tour="create-challenge-btn"]',
        title: 'Creating Challenges',
        content: "Click here to create a new challenge! Set the goal type (workouts, XP, streaks), target amount, duration, and invite friends. Winner gets bonus XP!",
        novaState: NOVA_STATES.ENCOURAGING,
        position: POSITIONS.BOTTOM,
        action: 'click',
      },
      {
        id: 'complete',
        target: null,
        title: 'Better Together!',
        content: "You've seen all the social features! Add friends, join a guild, climb leaderboards, and challenge others. Shared journeys are more memorable!",
        novaState: NOVA_STATES.PROUD,
        position: 'center',
      },
    ],
  },

};

/**
 * Get tour by ID
 */
export function getTour(tourId) {
  return TOURS[tourId] || null;
}

/**
 * Get all available tours
 */
export function getAllTours() {
  return Object.values(TOURS);
}

/**
 * Get tour step by index
 */
export function getTourStep(tourId, stepIndex) {
  const tour = TOURS[tourId];
  if (!tour) return null;
  return tour.steps[stepIndex] || null;
}

/**
 * Get total steps for a tour
 */
export function getTourStepCount(tourId) {
  const tour = TOURS[tourId];
  return tour ? tour.steps.length : 0;
}

export default TOURS;
