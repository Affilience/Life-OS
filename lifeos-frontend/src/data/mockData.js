// Mock data for Quanta

export const workSessions = [
  {
    id: 1,
    date: '2025-10-26',
    duration: '2h 30m',
    type: 'Deep Work',
    focusQuality: 8,
    output: 'Completed API design documentation',
    project: 'Quanta'
  },
  {
    id: 2,
    date: '2025-10-25',
    duration: '1h 45m',
    type: 'Learning',
    focusQuality: 7,
    output: 'React Router tutorial completion',
    project: 'Skill Development'
  }
];

export const workouts = [
  {
    id: 1,
    date: '2025-10-26',
    type: 'Push',
    duration: '1h 15m',
    exercises: ['Bench Press', 'Overhead Press', 'Dips'],
    volume: '2,850 kg',
    notes: 'New PR on bench press - 80kg x 5'
  },
  {
    id: 2,
    date: '2025-10-24',
    type: 'Pull',
    duration: '1h 20m',
    exercises: ['Deadlifts', 'Pull-ups', 'Rows'],
    volume: '3,200 kg',
    notes: 'Felt strong today'
  }
];

export const journalEntries = [
  {
    id: 1,
    date: '2025-10-26',
    title: 'Great Progress Today',
    content: 'Made significant progress on the Quanta frontend. The component structure is coming together nicely...',
    mood: 8,
    tags: ['productivity', 'coding'],
    wordCount: 245
  }
];

export const calendarEvents = [
  {
    id: 1,
    title: 'Deep Work - Quanta Development',
    start: '09:00',
    end: '11:30',
    date: '2025-10-26',
    type: 'work',
    completed: true
  },
  {
    id: 2,
    title: 'Workout - Push Day',
    start: '14:00',
    end: '15:15',
    date: '2025-10-26',
    type: 'fitness',
    completed: true
  }
];

export const skills = [
  {
    id: 1,
    name: 'React Development',
    category: 'Digital',
    level: 'Intermediate',
    progress: 65,
    timeInvested: '45h',
    lastPracticed: '2025-10-26',
    nextMilestone: 'Build complex state management'
  }
];

export const incomeTransactions = [
  {
    id: 1,
    date: '2025-10-25',
    amount: 250,
    source: 'Freelance Web Development',
    project: 'Client Portfolio Website',
    effectiveRate: '£25/hour'
  }
];

export const expenses = [
  {
    id: 1,
    date: '2025-10-26',
    amount: 45,
    category: 'Food',
    description: 'Weekly groceries'
  }
];

export const todayStats = {
  deepWorkHours: { current: 2.5, target: 4 },
  workoutsCompleted: { current: 1, target: 1 },
  moodRating: { current: null, target: null },
  caloriesLogged: { current: 0, target: 2500 },
  tasksCompleted: { current: 3, target: 8 },
  moneyEarned: { current: 0, target: null }
};

export const weeklyProgress = {
  deepWork: { current: 12, target: 20 },
  workouts: { current: 3, target: 5 },
  learning: { current: 5, target: 10 },
  journalEntries: { current: 5, target: 7 }
};

export const currentGoals = [
  {
    id: 1,
    title: 'Launch Quanta MVP',
    progress: 25,
    deadline: '2025-12-01',
    category: 'Professional'
  },
  {
    id: 2,
    title: 'Reach 80kg Bench Press',
    progress: 75,
    deadline: '2025-11-15',
    category: 'Fitness'
  }
];

export const upcomingItems = [
  {
    id: 1,
    title: 'Learning - System Design',
    time: 'Today 19:00',
    type: 'scheduled'
  }
];

export const learningContent = [
  {
    id: 1,
    type: 'Book',
    title: 'Clean Architecture',
    author: 'Robert C. Martin',
    status: 'In Progress',
    progress: 45,
    rating: null,
    keyInsights: 'Architecture should be independent of frameworks'
  }
];

export const ideas = [
  {
    id: 1,
    title: 'AI-Powered Habit Tracker',
    category: 'Product',
    status: 'Sprouting',
    dateCreated: '2025-10-20',
    description: 'Habit tracker that uses AI to suggest optimal habit stacking'
  }
];