/**
 * Module Setup Configurations
 *
 * Defines the questions, options, and data flow for each module's
 * onboarding setup process.
 */

// Health Module Setup
export const healthSetupConfig = {
  id: 'health',
  title: 'Health & Fitness',
  icon: '💪',
  questions: [
    {
      id: 'goal',
      key: 'primaryGoal',
      type: 'single-select',
      title: "What's your primary health goal?",
      novaSays: "No judgment here - just pick what resonates!",
      options: [
        { id: 'lose', label: 'Lose weight', icon: '📉' },
        { id: 'gain', label: 'Build muscle', icon: '💪' },
        { id: 'maintain', label: 'Maintain weight', icon: '⚖️' },
        { id: 'healthy', label: 'Just eat healthier', icon: '🥗' }
      ]
    },
    {
      id: 'weight',
      key: 'currentWeight',
      type: 'number-unit',
      title: "What's your current weight?",
      novaSays: "This helps me calculate your ideal calorie target.",
      unit: 'lbs',
      altUnit: 'kg',
      placeholder: '150',
      optional: true,
      skipText: "I'd rather not say"
    },
    {
      id: 'targetWeight',
      key: 'targetWeight',
      type: 'number-unit',
      title: "What's your target weight?",
      novaSays: "We'll work together to get you there!",
      unit: 'lbs',
      altUnit: 'kg',
      placeholder: '140',
      conditional: (data) => data.primaryGoal === 'lose' || data.primaryGoal === 'gain',
      optional: true
    },
    {
      id: 'activity',
      key: 'activityLevel',
      type: 'single-select',
      title: "How active are you on a typical day?",
      novaSays: "Be honest - this affects your calorie needs!",
      options: [
        { id: 'sedentary', label: 'Sedentary', description: 'Desk job, little exercise', icon: '🪑' },
        { id: 'light', label: 'Lightly Active', description: 'Light exercise 1-3 days/week', icon: '🚶' },
        { id: 'moderate', label: 'Moderately Active', description: 'Exercise 3-5 days/week', icon: '🏃' },
        { id: 'very', label: 'Very Active', description: 'Hard exercise 6-7 days/week', icon: '🏋️' }
      ],
      default: 'light'
    },
    {
      id: 'calories',
      key: 'calorieGoal',
      type: 'calculated-confirm',
      title: "Here's your recommended daily target:",
      novaSays: "Based on your goals, this should help you reach your target!",
      calculation: calculateCalories,
      editable: true,
      unit: 'calories'
    }
  ],
  onComplete: (data) => ({
    healthGoal: data.primaryGoal,
    currentWeight: data.currentWeight,
    targetWeight: data.targetWeight,
    activityLevel: data.activityLevel,
    dailyCalorieGoal: data.calorieGoal,
    macros: calculateMacros(data.calorieGoal, data.primaryGoal)
  })
};

// Financial Module Setup
export const financialSetupConfig = {
  id: 'financial',
  title: 'Financial Tracking',
  icon: '💰',
  questions: [
    {
      id: 'goal',
      key: 'financialGoal',
      type: 'single-select',
      title: "What's your main financial goal?",
      novaSays: "First step to financial freedom!",
      options: [
        { id: 'save', label: 'Save more money', icon: '🏦' },
        { id: 'debt', label: 'Pay off debt', icon: '💳' },
        { id: 'track', label: 'Track spending', icon: '📊' },
        { id: 'emergency', label: 'Build emergency fund', icon: '🛡️' },
        { id: 'invest', label: 'Start investing', icon: '📈' }
      ]
    },
    {
      id: 'income',
      key: 'monthlyIncome',
      type: 'range-select',
      title: "What's your approximate monthly income?",
      novaSays: "This stays between us - it helps me suggest a realistic budget.",
      options: [
        { id: 'under2k', label: 'Under $2,000', value: 1500 },
        { id: '2k-4k', label: '$2,000 - $4,000', value: 3000 },
        { id: '4k-6k', label: '$4,000 - $6,000', value: 5000 },
        { id: '6k-10k', label: '$6,000 - $10,000', value: 8000 },
        { id: 'over10k', label: 'Over $10,000', value: 12000 },
        { id: 'skip', label: "Prefer not to say", value: null }
      ]
    },
    {
      id: 'savings',
      key: 'savingsGoal',
      type: 'calculated-confirm',
      title: "How much would you like to save monthly?",
      novaSays: "A good rule of thumb is 20% of income. Here's my suggestion:",
      calculation: (data) => data.monthlyIncome ? Math.round(data.monthlyIncome * 0.2) : 200,
      editable: true,
      unit: 'dollars',
      prefix: '$'
    },
    {
      id: 'budget',
      key: 'budgetStyle',
      type: 'single-select',
      title: "How detailed do you want your budget?",
      novaSays: "We can always adjust this later!",
      options: [
        { id: 'simple', label: 'Simple', description: '50/30/20 rule (Needs/Wants/Savings)', icon: '✨' },
        { id: 'detailed', label: 'Detailed', description: 'Track by category', icon: '📋' },
        { id: 'minimal', label: 'Minimal', description: 'Just track income & spending', icon: '📝' }
      ],
      default: 'simple'
    }
  ],
  onComplete: (data) => ({
    financialGoal: data.financialGoal,
    monthlyIncome: data.monthlyIncome,
    monthlySavingsGoal: data.savingsGoal,
    budgetStyle: data.budgetStyle,
    budget: createInitialBudget(data)
  })
};

// Productivity Module Setup
export const productivitySetupConfig = {
  id: 'productivity',
  title: 'Productivity',
  icon: '🎯',
  questions: [
    {
      id: 'challenge',
      key: 'mainChallenge',
      type: 'single-select',
      title: "What's your biggest productivity challenge?",
      novaSays: "Knowing your enemy is half the battle!",
      options: [
        { id: 'overwhelm', label: 'Too many tasks', description: "Don't know where to start", icon: '😵' },
        { id: 'focus', label: 'Getting distracted', description: 'Hard to stay focused', icon: '🦋' },
        { id: 'time', label: 'Not enough time', description: 'Day flies by too fast', icon: '⏰' },
        { id: 'motivation', label: 'Staying motivated', description: 'Hard to get started', icon: '🔋' },
        { id: 'planning', label: 'Planning & deadlines', description: 'Managing projects', icon: '📅' }
      ]
    },
    {
      id: 'workStyle',
      key: 'workStyle',
      type: 'single-select',
      title: "How do you prefer to work?",
      novaSays: "I'll tailor suggestions to your style!",
      options: [
        { id: 'lists', label: 'Task lists', description: 'Check things off one by one', icon: '✅' },
        { id: 'timeblock', label: 'Time blocking', description: 'Schedule specific time for tasks', icon: '📅' },
        { id: 'pomodoro', label: 'Pomodoro', description: 'Work in focused sprints', icon: '🍅' },
        { id: 'flexible', label: 'Flexible', description: 'Go with the flow', icon: '🌊' }
      ],
      default: 'lists'
    },
    {
      id: 'priorities',
      key: 'weeklyPriorities',
      type: 'multi-input',
      title: "What are your top 3 priorities this week?",
      novaSays: "Let's turn these into actionable goals!",
      inputs: 3,
      placeholder: ['Priority 1...', 'Priority 2...', 'Priority 3...'],
      optional: true
    }
  ],
  onComplete: (data) => ({
    mainChallenge: data.mainChallenge,
    workStyle: data.workStyle,
    weeklyPriorities: data.weeklyPriorities?.filter(Boolean) || []
  })
};

// Journal Module Setup
export const journalSetupConfig = {
  id: 'journal',
  title: 'Journal',
  icon: '📝',
  questions: [
    {
      id: 'frequency',
      key: 'journalFrequency',
      type: 'single-select',
      title: "How often would you like to journal?",
      novaSays: "Consistency matters more than length!",
      options: [
        { id: 'daily', label: 'Daily', description: 'Most impactful', icon: '📅' },
        { id: 'few', label: 'Few times a week', description: 'Balanced approach', icon: '📆' },
        { id: 'weekly', label: 'Weekly reflection', description: 'Sunday reviews', icon: '📋' },
        { id: 'whenever', label: 'When I feel like it', description: 'No pressure', icon: '🌊' }
      ],
      default: 'daily'
    },
    {
      id: 'topics',
      key: 'journalTopics',
      type: 'multi-select',
      title: "What would you like to reflect on?",
      novaSays: "Pick all that resonate with you!",
      options: [
        { id: 'gratitude', label: 'Daily gratitude', icon: '🙏' },
        { id: 'mood', label: 'Mood tracking', icon: '😊' },
        { id: 'goals', label: 'Goal progress', icon: '🎯' },
        { id: 'freewrite', label: 'Free writing', icon: '✍️' },
        { id: 'evening', label: 'Evening reflection', icon: '🌙' },
        { id: 'lessons', label: 'Lessons learned', icon: '💡' }
      ],
      default: ['gratitude', 'mood']
    },
    {
      id: 'reminder',
      key: 'journalReminder',
      type: 'time-select',
      title: "When should I remind you to journal?",
      novaSays: "I'll send a gentle nudge!",
      options: [
        { id: 'morning', label: 'Morning', time: '08:00', icon: '🌅' },
        { id: 'evening', label: 'Evening', time: '21:00', icon: '🌙' },
        { id: 'both', label: 'Both', times: ['08:00', '21:00'], icon: '🔔' },
        { id: 'none', label: "Don't remind me", icon: '🔕' }
      ],
      default: 'evening'
    }
  ],
  onComplete: (data) => ({
    frequency: data.journalFrequency,
    topics: data.journalTopics,
    reminderTime: data.journalReminder
  })
};

// Skills Module Setup
export const skillsSetupConfig = {
  id: 'skills',
  title: 'Skills',
  icon: '🎓',
  questions: [
    {
      id: 'category',
      key: 'skillCategory',
      type: 'multi-select',
      title: "What types of skills interest you?",
      novaSays: "Pick up to 3 that excite you!",
      maxSelect: 3,
      options: [
        { id: 'technical', label: 'Technical/Coding', icon: '💻' },
        { id: 'creative', label: 'Creative/Design', icon: '🎨' },
        { id: 'business', label: 'Business/Finance', icon: '📊' },
        { id: 'communication', label: 'Communication', icon: '🗣️' },
        { id: 'physical', label: 'Physical/Sports', icon: '🏃' },
        { id: 'music', label: 'Music/Arts', icon: '🎵' },
        { id: 'language', label: 'Languages', icon: '🌍' }
      ]
    },
    {
      id: 'time',
      key: 'weeklyPracticeTime',
      type: 'slider',
      title: "How much time can you dedicate weekly?",
      novaSays: "Even 30 minutes a week adds up!",
      min: 1,
      max: 20,
      step: 1,
      unit: 'hours',
      default: 5
    },
    {
      id: 'firstSkill',
      key: 'firstSkill',
      type: 'text-input',
      title: "What's one specific skill you want to develop?",
      novaSays: "We'll track your progress on this!",
      placeholder: 'e.g., Python, Guitar, Spanish...',
      optional: true
    }
  ],
  onComplete: (data) => ({
    skillCategories: data.skillCategory,
    weeklyPracticeGoal: data.weeklyPracticeTime,
    initialSkill: data.firstSkill
  })
};

// Calendar Module Setup
export const calendarSetupConfig = {
  id: 'calendar',
  title: 'Calendar',
  icon: '📅',
  questions: [
    {
      id: 'connect',
      key: 'calendarConnect',
      type: 'single-select',
      title: "Want to connect your existing calendar?",
      novaSays: "This lets me see your schedule and suggest optimal times!",
      options: [
        { id: 'google', label: 'Google Calendar', icon: '📅' },
        { id: 'apple', label: 'Apple Calendar', icon: '🍎' },
        { id: 'outlook', label: 'Outlook', icon: '📧' },
        { id: 'none', label: 'Start fresh', icon: '✨' }
      ]
    },
    {
      id: 'productivity',
      key: 'peakProductivity',
      type: 'single-select',
      title: "When are you most productive?",
      novaSays: "I'll suggest deep work during your peak hours!",
      options: [
        { id: 'morning', label: 'Morning person', description: '5am - 12pm peak', icon: '🌅' },
        { id: 'afternoon', label: 'Afternoon warrior', description: '12pm - 6pm peak', icon: '☀️' },
        { id: 'evening', label: 'Night owl', description: '6pm - 12am peak', icon: '🌙' },
        { id: 'varies', label: 'It varies', description: 'Depends on the day', icon: '🔄' }
      ],
      default: 'morning'
    }
  ],
  onComplete: (data) => ({
    connectedCalendar: data.calendarConnect,
    peakProductivityTime: data.peakProductivity
  })
};

// All configs exported
export const MODULE_SETUP_CONFIGS = {
  health: healthSetupConfig,
  financial: financialSetupConfig,
  productivity: productivitySetupConfig,
  journal: journalSetupConfig,
  skills: skillsSetupConfig,
  calendar: calendarSetupConfig
};

// Helper functions
function calculateCalories(data) {
  // Basic BMR calculation (Mifflin-St Jeor simplified)
  const weight = data.currentWeight || 150;
  const weightKg = weight * 0.453592;

  // Estimate BMR (simplified - assumes average height and age)
  const bmr = 10 * weightKg + 6.25 * 170 - 5 * 25 + 5; // Rough estimate

  // Activity multipliers
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very: 1.725
  };

  const tdee = bmr * (multipliers[data.activityLevel] || 1.375);

  // Adjust for goal
  let calories = tdee;
  if (data.primaryGoal === 'lose') {
    calories = tdee - 500; // 500 cal deficit for ~1lb/week loss
  } else if (data.primaryGoal === 'gain') {
    calories = tdee + 300; // 300 cal surplus for lean gains
  }

  return Math.round(calories / 50) * 50; // Round to nearest 50
}

function calculateMacros(calories, goal) {
  // Macro splits based on goal
  const splits = {
    lose: { protein: 0.35, carbs: 0.35, fat: 0.30 },
    gain: { protein: 0.30, carbs: 0.45, fat: 0.25 },
    maintain: { protein: 0.25, carbs: 0.45, fat: 0.30 },
    healthy: { protein: 0.25, carbs: 0.45, fat: 0.30 }
  };

  const split = splits[goal] || splits.maintain;

  return {
    protein: Math.round((calories * split.protein) / 4), // 4 cal/g
    carbs: Math.round((calories * split.carbs) / 4),
    fat: Math.round((calories * split.fat) / 9) // 9 cal/g
  };
}

function createInitialBudget(data) {
  const income = data.monthlyIncome || 3000;
  const savingsGoal = data.savingsGoal || Math.round(income * 0.2);

  if (data.budgetStyle === 'simple') {
    // 50/30/20 rule
    return {
      needs: Math.round(income * 0.5),
      wants: Math.round(income * 0.3),
      savings: savingsGoal
    };
  }

  return {
    total: income,
    savings: savingsGoal,
    spending: income - savingsGoal
  };
}

export default MODULE_SETUP_CONFIGS;
