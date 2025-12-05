import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// XP earned per minute of practice
const XP_PER_MINUTE = 2;

// Proficiency levels with XP thresholds
export const PROFICIENCY_LEVELS = [
  { id: 'beginner', name: 'Beginner', xpRange: [0, 1000], color: 'slate' },
  { id: 'novice', name: 'Novice', xpRange: [1000, 2500], color: 'green' },
  { id: 'intermediate', name: 'Intermediate', xpRange: [2500, 5000], color: 'blue' },
  { id: 'advanced', name: 'Advanced', xpRange: [5000, 10000], color: 'purple' },
  { id: 'expert', name: 'Expert', xpRange: [10000, Infinity], color: 'orange' },
];

// Skill categories
export const SKILL_CATEGORIES = [
  { id: 'programming', name: 'Programming', icon: '💻', color: 'blue' },
  { id: 'language', name: 'Languages', icon: '🌍', color: 'green' },
  { id: 'creative', name: 'Creative', icon: '🎨', color: 'purple' },
  { id: 'fitness', name: 'Fitness', icon: '💪', color: 'red' },
  { id: 'business', name: 'Business', icon: '💼', color: 'yellow' },
  { id: 'other', name: 'Other', icon: '✨', color: 'slate' },
];

// Helper functions
export const getProficiencyLevel = (xp) => {
  return PROFICIENCY_LEVELS.find(level =>
    xp >= level.xpRange[0] && xp < level.xpRange[1]
  ) || PROFICIENCY_LEVELS[0];
};

export const getXpProgress = (xp) => {
  const currentLevel = getProficiencyLevel(xp);
  const levelIndex = PROFICIENCY_LEVELS.findIndex(l => l.id === currentLevel.id);

  if (levelIndex === PROFICIENCY_LEVELS.length - 1) {
    return { percent: 100, current: xp, next: xp, toNextLevel: 0 };
  }

  const nextLevel = PROFICIENCY_LEVELS[levelIndex + 1];
  const rangeStart = currentLevel.xpRange[0];
  const rangeEnd = nextLevel.xpRange[0];
  const progress = ((xp - rangeStart) / (rangeEnd - rangeStart)) * 100;

  return {
    percent: Math.min(100, progress),
    current: xp - rangeStart,
    next: rangeEnd - rangeStart,
    toNextLevel: rangeEnd - xp,
  };
};

export const calculateXpFromMinutes = (minutes) => {
  return Math.round(minutes * XP_PER_MINUTE);
};

// Calculate streak from practice sessions
const calculateStreak = (sessions) => {
  if (!sessions || sessions.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Sort sessions by date descending
  const sortedSessions = [...sessions].sort((a, b) =>
    new Date(b.date) - new Date(a.date)
  );

  // Get unique practice days
  const uniqueDays = [...new Set(sortedSessions.map(s => s.date))];

  let streak = 0;
  let checkDate = new Date(today);

  for (const day of uniqueDays) {
    const sessionDate = new Date(day);
    sessionDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((checkDate - sessionDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0 || diffDays === 1) {
      streak++;
      checkDate = sessionDate;
    } else {
      break;
    }
  }

  return streak;
};

// Get practice history for last N days
export const getPracticeHeatmap = (sessions, days = 30) => {
  const heatmap = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const daySessions = sessions.filter(s => s.date === dateStr);
    const totalMinutes = daySessions.reduce((sum, s) => sum + s.minutes, 0);

    heatmap.push({
      date: dateStr,
      practiced: daySessions.length > 0,
      minutes: totalMinutes,
      sessions: daySessions.length,
    });
  }

  return heatmap;
};

// Initial mock data
const initialSkills = [
  {
    id: 1,
    name: 'Python Programming',
    category: 'programming',
    xp: 2800,
    totalMinutes: 1400,
    description: 'Backend development, data science, automation',
    icon: '🐍',
    createdAt: '2024-01-01',
    sessions: [
      { id: 1, date: '2025-01-20', minutes: 45, notes: 'Worked on Django REST API', xpEarned: 90 },
      { id: 2, date: '2025-01-19', minutes: 60, notes: 'Data analysis with pandas', xpEarned: 120 },
      { id: 3, date: '2025-01-18', minutes: 30, notes: 'Python async patterns', xpEarned: 60 },
    ],
    goals: [
      { id: 1, text: 'Build a complete REST API', completed: false },
      { id: 2, text: 'Learn machine learning basics', completed: false },
    ],
    milestones: ['Completed Python basics', 'Built first web scraper'],
  },
  {
    id: 2,
    name: 'Spanish',
    category: 'language',
    xp: 1200,
    totalMinutes: 600,
    description: 'Conversational Spanish for travel and business',
    icon: '🇪🇸',
    createdAt: '2024-02-15',
    sessions: [
      { id: 1, date: '2025-01-21', minutes: 20, notes: 'Vocabulary practice', xpEarned: 40 },
      { id: 2, date: '2025-01-20', minutes: 30, notes: 'Conversation practice', xpEarned: 60 },
    ],
    goals: [
      { id: 1, text: 'Hold 5-minute conversation', completed: false },
    ],
    milestones: ['Learned 500 words'],
  },
  {
    id: 3,
    name: 'Guitar',
    category: 'creative',
    xp: 4200,
    totalMinutes: 2100,
    description: 'Acoustic guitar, fingerstyle and strumming',
    icon: '🎸',
    createdAt: '2023-06-01',
    sessions: [
      { id: 1, date: '2025-01-21', minutes: 45, notes: 'Practiced fingerpicking patterns', xpEarned: 90 },
      { id: 2, date: '2025-01-20', minutes: 60, notes: 'New song - Blackbird', xpEarned: 120 },
      { id: 3, date: '2025-01-19', minutes: 30, notes: 'Chord transitions', xpEarned: 60 },
    ],
    goals: [
      { id: 1, text: 'Learn 10 complete songs', completed: true },
      { id: 2, text: 'Master barre chords', completed: false },
    ],
    milestones: ['First song learned', 'Performed for friends', '100 hours practiced'],
  },
  {
    id: 4,
    name: 'Digital Marketing',
    category: 'business',
    xp: 1800,
    totalMinutes: 900,
    description: 'SEO, social media, content marketing',
    icon: '📱',
    createdAt: '2024-03-01',
    sessions: [
      { id: 1, date: '2025-01-19', minutes: 40, notes: 'SEO keyword research', xpEarned: 80 },
    ],
    goals: [
      { id: 1, text: 'Launch first ad campaign', completed: false },
    ],
    milestones: ['Google Analytics certified'],
  },
];

const useSkillsStore = create(
  persist(
    (set, get) => ({
      skills: initialSkills,

      // Get all skills
      getSkills: () => get().skills,

      // Get skill by ID
      getSkillById: (id) => get().skills.find(s => s.id === id),

      // Add new skill
      addSkill: (skillData) => {
        const newSkill = {
          id: Date.now(),
          ...skillData,
          xp: 0,
          totalMinutes: 0,
          sessions: [],
          goals: [],
          milestones: [],
          createdAt: new Date().toISOString().split('T')[0],
        };

        set(state => ({
          skills: [...state.skills, newSkill],
        }));

        return newSkill;
      },

      // Update skill
      updateSkill: (id, updates) => {
        set(state => ({
          skills: state.skills.map(skill =>
            skill.id === id ? { ...skill, ...updates } : skill
          ),
        }));
      },

      // Delete skill
      deleteSkill: (id) => {
        set(state => ({
          skills: state.skills.filter(skill => skill.id !== id),
        }));
      },

      // Log practice session
      logPractice: (skillId, minutes, notes = '') => {
        const xpEarned = calculateXpFromMinutes(minutes);
        const today = new Date().toISOString().split('T')[0];

        const session = {
          id: Date.now(),
          date: today,
          minutes: parseInt(minutes),
          notes,
          xpEarned,
        };

        set(state => ({
          skills: state.skills.map(skill => {
            if (skill.id === skillId) {
              const newSessions = [session, ...skill.sessions];
              return {
                ...skill,
                xp: skill.xp + xpEarned,
                totalMinutes: skill.totalMinutes + parseInt(minutes),
                sessions: newSessions,
              };
            }
            return skill;
          }),
        }));

        return { session, xpEarned };
      },

      // Get skill statistics
      getSkillStats: (skillId) => {
        const skill = get().skills.find(s => s.id === skillId);
        if (!skill) return null;

        const proficiency = getProficiencyLevel(skill.xp);
        const progress = getXpProgress(skill.xp);
        const streak = calculateStreak(skill.sessions);
        const heatmap = getPracticeHeatmap(skill.sessions, 30);

        // Weekly practice breakdown
        const last7Days = heatmap.slice(-7);
        const weeklyMinutes = last7Days.reduce((sum, d) => sum + d.minutes, 0);
        const avgDailyMinutes = Math.round(weeklyMinutes / 7);

        // Total sessions
        const totalSessions = skill.sessions.length;

        // Last practiced
        const lastSession = skill.sessions[0];
        const lastPracticed = lastSession ? lastSession.date : null;

        return {
          skill,
          proficiency,
          progress,
          streak,
          heatmap,
          weeklyMinutes,
          avgDailyMinutes,
          totalSessions,
          lastPracticed,
          totalHours: Math.round(skill.totalMinutes / 60 * 10) / 10,
        };
      },

      // Get overall stats across all skills
      getOverallStats: () => {
        const skills = get().skills;
        const totalSkills = skills.length;
        const totalMinutes = skills.reduce((sum, s) => sum + s.totalMinutes, 0);
        const totalXp = skills.reduce((sum, s) => sum + s.xp, 0);
        const bestStreak = Math.max(...skills.map(s => calculateStreak(s.sessions)));

        return {
          totalSkills,
          totalMinutes,
          totalHours: Math.round(totalMinutes / 60),
          totalXp,
          bestStreak,
        };
      },

      // Add goal to skill
      addGoal: (skillId, goalText) => {
        const goal = {
          id: Date.now(),
          text: goalText,
          completed: false,
          createdAt: new Date().toISOString(),
        };

        set(state => ({
          skills: state.skills.map(skill =>
            skill.id === skillId
              ? { ...skill, goals: [...skill.goals, goal] }
              : skill
          ),
        }));
      },

      // Toggle goal completion
      toggleGoal: (skillId, goalId) => {
        set(state => ({
          skills: state.skills.map(skill =>
            skill.id === skillId
              ? {
                  ...skill,
                  goals: skill.goals.map(g =>
                    g.id === goalId ? { ...g, completed: !g.completed } : g
                  ),
                }
              : skill
          ),
        }));
      },

      // Add milestone
      addMilestone: (skillId, milestoneText) => {
        set(state => ({
          skills: state.skills.map(skill =>
            skill.id === skillId
              ? { ...skill, milestones: [...skill.milestones, milestoneText] }
              : skill
          ),
        }));
      },
    }),
    {
      name: 'lifeos-skills-storage',
    }
  )
);

export default useSkillsStore;
