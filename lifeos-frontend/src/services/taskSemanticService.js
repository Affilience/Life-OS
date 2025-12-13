/**
 * Task Semantic Understanding Service
 *
 * This service provides semantic understanding of tasks, enabling:
 * 1. Auto-completion when users perform related actions in the app
 * 2. Action buttons that navigate users to the right place to complete tasks
 * 3. Intelligent categorization based on task content
 */

// ============================================================
// SEMANTIC PATTERNS - Keywords that identify task types
// ============================================================

export const TASK_SEMANTIC_PATTERNS = {
  // Journal & Reflection
  journal: {
    keywords: ['journal', 'reflection', 'reflect', 'diary', 'write about', 'gratitude', 'grateful', 'thought', 'feelings', 'mood', 'entry', 'morning pages', 'evening reflection', 'daily log'],
    gamificationAction: 'journalEntry',
    route: '/journal',
    section: 'write',
    actionLabel: 'Write Entry',
    icon: 'BookOpen',
    category: 'personal',
  },

  // Workouts & Exercise
  workout: {
    keywords: ['workout', 'exercise', 'gym', 'lift', 'lifting', 'training', 'train', 'fitness', 'strength', 'cardio', 'run', 'running', 'jog', 'walk', 'swimming', 'yoga', 'stretch', 'stretching', 'hiit', 'crossfit', 'weights', 'bodyweight', 'push-ups', 'pull-ups', 'squats', 'deadlift', 'bench press', 'leg day', 'arm day', 'chest day', 'back day'],
    gamificationAction: 'workoutCompleted',
    route: '/health',
    section: 'workouts',
    actionLabel: 'Log Workout',
    icon: 'Dumbbell',
    category: 'health',
  },

  // Nutrition & Meals
  nutrition: {
    keywords: ['meal', 'food', 'eat', 'eating', 'nutrition', 'calories', 'track food', 'log food', 'breakfast', 'lunch', 'dinner', 'snack', 'protein', 'macros', 'healthy eating', 'diet', 'fast', 'fasting', 'intermittent fasting'],
    gamificationAction: 'mealLogged',
    route: '/health',
    section: 'nutrition',
    actionLabel: 'Log Meal',
    icon: 'Utensils',
    category: 'health',
  },

  // Sleep
  sleep: {
    keywords: ['sleep', 'rest', 'bedtime', 'wake up', 'nap', 'sleep schedule', 'hours of sleep', 'sleep quality', 'go to bed', 'get up early'],
    gamificationAction: 'sleepLogged',
    route: '/health',
    section: 'sleep',
    actionLabel: 'Log Sleep',
    icon: 'Moon',
    category: 'health',
  },

  // Reading & Books
  reading: {
    keywords: ['read', 'reading', 'book', 'books', 'pages', 'chapter', 'finish reading', 'start reading', 'audiobook', 'kindle', 'ebook', 'literature', 'novel'],
    gamificationAction: 'bookCompleted',
    route: '/knowledge',
    section: 'library',
    actionLabel: 'Log Reading',
    icon: 'BookMarked',
    category: 'learning',
  },

  // Learning & Skills
  learning: {
    keywords: ['learn', 'learning', 'study', 'studying', 'practice', 'skill', 'course', 'tutorial', 'lesson', 'class', 'education', 'training', 'duolingo', 'anki', 'flashcards', 'language', 'coding', 'programming', 'music practice', 'instrument', 'guitar', 'piano'],
    gamificationAction: 'practiceSession',
    route: '/skills',
    section: null,
    actionLabel: 'Log Practice',
    icon: 'GraduationCap',
    category: 'learning',
  },

  // Deep Work & Focus
  deepWork: {
    keywords: ['deep work', 'focus', 'focused', 'concentrate', 'concentration', 'flow state', 'pomodoro', 'work session', 'productive', 'uninterrupted', 'no distractions', 'heads down'],
    gamificationAction: 'deepWorkMinutes',
    route: '/productivity',
    section: 'work-sessions',
    actionLabel: 'Start Session',
    icon: 'Brain',
    category: 'productivity',
  },

  // Meditation & Mindfulness
  meditation: {
    keywords: ['meditate', 'meditation', 'mindfulness', 'mindful', 'breathe', 'breathing', 'calm', 'relax', 'relaxation', 'zen', 'headspace', 'calm app', 'guided meditation'],
    gamificationAction: 'meditationCompleted',
    route: '/health',
    section: 'wellness',
    actionLabel: 'Meditate',
    icon: 'Sparkles',
    category: 'health',
  },

  // Financial
  finance: {
    keywords: ['expense', 'expenses', 'spending', 'budget', 'track spending', 'money', 'income', 'save', 'savings', 'invest', 'investment', 'bill', 'bills', 'payment', 'financial', 'finance'],
    gamificationAction: 'expenseLogged',
    route: '/financial',
    section: 'expenses',
    actionLabel: 'Log Transaction',
    icon: 'DollarSign',
    category: 'admin',
  },

  // Calendar & Planning
  planning: {
    keywords: ['plan', 'planning', 'schedule', 'calendar', 'appointment', 'meeting', 'time block', 'organize', 'agenda', 'todo', 'to-do', 'tomorrow', 'week ahead'],
    gamificationAction: null,
    route: '/calendar',
    section: null,
    actionLabel: 'Open Calendar',
    icon: 'Calendar',
    category: 'productivity',
  },

  // Goals & Resolutions
  goals: {
    keywords: ['goal', 'goals', 'resolution', 'target', 'objective', 'milestone', 'achieve', 'achievement', 'progress', 'check in', 'review goals'],
    gamificationAction: null,
    route: '/goals',
    section: null,
    actionLabel: 'Review Goals',
    icon: 'Target',
    category: 'personal',
  },

  // Social & Relationships
  social: {
    keywords: ['call', 'phone', 'text', 'message', 'friend', 'family', 'catch up', 'reach out', 'connect', 'relationship', 'social', 'hang out', 'meet up', 'coffee with', 'lunch with', 'dinner with'],
    gamificationAction: null,
    route: '/social',
    section: null,
    actionLabel: 'Social',
    icon: 'Users',
    category: 'personal',
  },

  // Self-care
  selfCare: {
    keywords: ['self care', 'self-care', 'skincare', 'grooming', 'hygiene', 'shower', 'bath', 'spa', 'massage', 'treat yourself', 'pamper'],
    gamificationAction: null,
    route: null,
    section: null,
    actionLabel: null,
    icon: 'Heart',
    category: 'personal',
  },

  // Water & Hydration
  hydration: {
    keywords: ['water', 'hydrate', 'hydration', 'drink water', 'glasses of water', 'stay hydrated'],
    gamificationAction: 'waterLogged',
    route: '/health',
    section: 'nutrition',
    actionLabel: 'Log Water',
    icon: 'Droplet',
    category: 'health',
  },

  // Supplements & Medication
  supplements: {
    keywords: ['vitamin', 'vitamins', 'supplement', 'supplements', 'medication', 'medicine', 'pill', 'pills', 'take meds', 'creatine', 'protein shake', 'multivitamin'],
    gamificationAction: 'supplementTaken',
    route: '/health',
    section: 'supplements',
    actionLabel: 'Log Supplement',
    icon: 'Pill',
    category: 'health',
  },

  // Creative Work
  creative: {
    keywords: ['create', 'creative', 'art', 'draw', 'drawing', 'paint', 'painting', 'design', 'write', 'writing', 'compose', 'music', 'photography', 'photo', 'video', 'edit', 'editing', 'content'],
    gamificationAction: 'creativeWork',
    route: '/productivity',
    section: null,
    actionLabel: 'Create',
    icon: 'Palette',
    category: 'creative',
  },

  // Chores & Home
  chores: {
    keywords: ['clean', 'cleaning', 'laundry', 'dishes', 'vacuum', 'organize', 'declutter', 'tidy', 'chore', 'chores', 'housework', 'grocery', 'groceries', 'shopping', 'errands'],
    gamificationAction: null,
    route: null,
    section: null,
    actionLabel: null,
    icon: 'Home',
    category: 'admin',
  },

  // Work Tasks
  work: {
    keywords: ['email', 'emails', 'inbox', 'meeting', 'meetings', 'report', 'presentation', 'project', 'deadline', 'client', 'boss', 'coworker', 'office', 'work on', 'complete task', 'finish task'],
    gamificationAction: 'taskCompleted',
    route: '/productivity',
    section: 'tasks',
    actionLabel: 'View Tasks',
    icon: 'Briefcase',
    category: 'productivity',
  },
};

// ============================================================
// SEMANTIC ANALYSIS FUNCTIONS
// ============================================================

/**
 * Analyze a task title to determine its semantic type
 * @param {string} taskTitle - The task title to analyze
 * @returns {Object|null} - The matching semantic pattern or null
 */
export function analyzeTaskSemantics(taskTitle) {
  if (!taskTitle) return null;

  const titleLower = taskTitle.toLowerCase();

  // Check each pattern for keyword matches
  for (const [type, pattern] of Object.entries(TASK_SEMANTIC_PATTERNS)) {
    const matchedKeyword = pattern.keywords.find(keyword => {
      // Check for exact word boundaries to avoid partial matches
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(titleLower);
    });

    if (matchedKeyword) {
      return {
        type,
        ...pattern,
        matchedKeyword,
        confidence: calculateConfidence(titleLower, pattern.keywords),
      };
    }
  }

  return null;
}

/**
 * Calculate confidence score based on keyword matches
 */
function calculateConfidence(title, keywords) {
  const matches = keywords.filter(kw => title.includes(kw.toLowerCase()));
  if (matches.length === 0) return 0;
  if (matches.length >= 3) return 1;
  if (matches.length === 2) return 0.9;
  return 0.7;
}

/**
 * Get all tasks that should auto-complete for a given gamification action
 * @param {string} action - The gamification action (e.g., 'journalEntry')
 * @param {Array} tasks - Array of task objects with 'title' and 'completed' properties
 * @returns {Array} - Tasks that should be auto-completed
 */
export function getTasksForAction(action, tasks) {
  if (!action || !tasks || !Array.isArray(tasks)) return [];

  // Find all patterns that match this action
  const matchingPatterns = Object.entries(TASK_SEMANTIC_PATTERNS)
    .filter(([_, pattern]) => pattern.gamificationAction === action)
    .flatMap(([_, pattern]) => pattern.keywords);

  if (matchingPatterns.length === 0) return [];

  // Find tasks that match these keywords and are not completed
  return tasks.filter(task => {
    if (task.completed) return false;

    const titleLower = task.title.toLowerCase();
    return matchingPatterns.some(keyword => {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(titleLower);
    });
  });
}

/**
 * Get the action route info for a task
 * @param {Object} task - Task object with 'title' property
 * @returns {Object|null} - Route info or null if no action available
 */
export function getTaskActionRoute(task) {
  if (!task?.title) return null;

  const semantics = analyzeTaskSemantics(task.title);

  if (!semantics || !semantics.route) return null;

  return {
    route: semantics.route,
    section: semantics.section,
    label: semantics.actionLabel,
    icon: semantics.icon,
    type: semantics.type,
    fullPath: semantics.section
      ? `${semantics.route}?tab=${semantics.section}`
      : semantics.route,
  };
}

/**
 * Suggest a category for a task based on its title
 * @param {string} taskTitle - The task title
 * @returns {string} - Suggested category
 */
export function suggestTaskCategory(taskTitle) {
  const semantics = analyzeTaskSemantics(taskTitle);
  return semantics?.category || 'productivity';
}

/**
 * Get all patterns that can be auto-completed
 * Used for displaying what actions users can take
 */
export function getAutoCompletablePatterns() {
  return Object.entries(TASK_SEMANTIC_PATTERNS)
    .filter(([_, pattern]) => pattern.gamificationAction && pattern.route)
    .map(([type, pattern]) => ({
      type,
      action: pattern.gamificationAction,
      label: pattern.actionLabel,
      route: pattern.route,
      icon: pattern.icon,
      keywords: pattern.keywords.slice(0, 5), // Show first 5 keywords as examples
    }));
}

// ============================================================
// ENHANCED ACTION KEYWORDS FOR GAMIFICATION
// ============================================================

/**
 * Get comprehensive keyword list for a gamification action
 * This is used by useGamification.js for auto-completion
 */
export function getKeywordsForAction(action) {
  const patterns = Object.entries(TASK_SEMANTIC_PATTERNS)
    .filter(([_, pattern]) => pattern.gamificationAction === action);

  if (patterns.length === 0) return [];

  // Combine all keywords from matching patterns
  return [...new Set(patterns.flatMap(([_, pattern]) => pattern.keywords))];
}

// ============================================================
// ROUTE HELPERS
// ============================================================

/**
 * Build the full navigation path with any query params
 */
export function buildTaskActionPath(task) {
  const actionInfo = getTaskActionRoute(task);
  if (!actionInfo) return null;

  let path = actionInfo.route;

  // Add section as hash or query param based on route
  if (actionInfo.section) {
    // Most routes use tab query params
    path += `?tab=${actionInfo.section}`;
  }

  return path;
}

/**
 * Get icon component name for a task
 */
export function getTaskIcon(task) {
  const semantics = analyzeTaskSemantics(task?.title);
  return semantics?.icon || 'CheckSquare';
}

export default {
  analyzeTaskSemantics,
  getTasksForAction,
  getTaskActionRoute,
  suggestTaskCategory,
  getAutoCompletablePatterns,
  getKeywordsForAction,
  buildTaskActionPath,
  getTaskIcon,
  TASK_SEMANTIC_PATTERNS,
};
