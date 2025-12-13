import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { DEV_USER_ID } from '../lib/dev-auth';
import { triggerGamification } from '../hooks/useGamification';

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

// Supabase sync helpers
const syncSkillToSupabase = async (skill, action = 'upsert') => {
  try {
    if (action === 'delete') {
      await supabase.from('skills').delete().eq('id', skill.id);
      return;
    }

    const dbSkill = {
      id: skill.id,
      user_id: DEV_USER_ID,
      name: skill.name,
      description: skill.description || '',
      category: skill.category || 'other',
      xp: skill.xp || 0,
      total_practice_hours: (skill.totalMinutes || 0) / 60,
      icon: skill.icon || '✨',
      color: skill.color || null,
      status: 'active',
      started_at: skill.createdAt,
    };

    await supabase.from('skills').upsert(dbSkill, { onConflict: 'id' });
  } catch (error) {
    console.error('Error syncing skill to Supabase:', error);
  }
};

const syncPracticeLogToSupabase = async (skillId, session, action = 'upsert') => {
  try {
    if (action === 'delete') {
      await supabase.from('skill_practice_logs').delete().eq('id', session.id);
      return;
    }

    const dbLog = {
      id: session.id,
      skill_id: skillId,
      user_id: DEV_USER_ID,
      practice_date: session.date,
      duration_minutes: session.minutes,
      notes: session.notes || '',
    };

    await supabase.from('skill_practice_logs').upsert(dbLog, { onConflict: 'id' });
  } catch (error) {
    console.error('Error syncing practice log to Supabase:', error);
  }
};

const useSkillsStore = create(
  persist(
    (set, get) => ({
      skills: [],
      isInitialized: false,

      // Initialize from Supabase
      initializeFromSupabase: async () => {
        try {
          // Store current skills to preserve local data like goals and milestones
          const currentSkills = get().skills;

          // Load skills
          const { data: skillsData, error: skillsError } = await supabase
            .from('skills')
            .select('*')
            .eq('user_id', DEV_USER_ID);

          if (skillsError) throw skillsError;

          // Load practice logs for all skills
          const { data: logsData, error: logsError } = await supabase
            .from('skill_practice_logs')
            .select('*')
            .eq('user_id', DEV_USER_ID)
            .order('practice_date', { ascending: false });

          if (logsError) throw logsError;

          // Transform skills from DB format to store format
          const skills = (skillsData || []).map(skill => {
            // Get sessions for this skill
            const sessions = (logsData || [])
              .filter(log => log.skill_id === skill.id)
              .map(log => ({
                id: log.id,
                date: log.practice_date,
                minutes: log.duration_minutes,
                notes: log.notes || '',
                xpEarned: calculateXpFromMinutes(log.duration_minutes),
              }));

            // Preserve local goals and milestones from current state
            const existingSkill = currentSkills.find(s => s.id === skill.id);

            return {
              id: skill.id,
              name: skill.name,
              category: skill.category || 'other',
              xp: skill.xp || 0,
              totalMinutes: Math.round((skill.total_practice_hours || 0) * 60),
              description: skill.description || '',
              icon: skill.icon || '✨',
              createdAt: skill.started_at || skill.created_at,
              sessions,
              goals: existingSkill?.goals || [], // Preserve local goals
              milestones: existingSkill?.milestones || [], // Preserve local milestones
            };
          });

          set({ skills, isInitialized: true });
        } catch (error) {
          console.error('Error initializing skills from Supabase:', error);
          set({ isInitialized: true }); // Mark as initialized even on error to prevent infinite retries
        }
      },

      // Get all skills
      getSkills: () => get().skills,

      // Get skill by ID
      getSkillById: (id) => get().skills.find(s => s.id === id),

      // Add new skill
      addSkill: (skillData) => {
        const newSkill = {
          id: crypto.randomUUID(),
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

        // Sync to Supabase
        syncSkillToSupabase(newSkill);

        return newSkill;
      },

      // Update skill
      updateSkill: (id, updates) => {
        set(state => ({
          skills: state.skills.map(skill =>
            skill.id === id ? { ...skill, ...updates } : skill
          ),
        }));

        // Sync to Supabase
        const updatedSkill = get().skills.find(s => s.id === id);
        if (updatedSkill) {
          syncSkillToSupabase(updatedSkill);
        }
      },

      // Delete skill
      deleteSkill: (id) => {
        const skillToDelete = get().skills.find(s => s.id === id);

        set(state => ({
          skills: state.skills.filter(skill => skill.id !== id),
        }));

        // Sync to Supabase
        if (skillToDelete) {
          syncSkillToSupabase(skillToDelete, 'delete');
        }
      },

      // Log practice session
      logPractice: (skillId, minutes, notes = '') => {
        const xpEarned = calculateXpFromMinutes(minutes);
        const today = new Date().toISOString().split('T')[0];

        const session = {
          id: crypto.randomUUID(),
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

        // Sync practice log and updated skill to Supabase
        syncPracticeLogToSupabase(skillId, session);
        const updatedSkill = get().skills.find(s => s.id === skillId);
        if (updatedSkill) {
          syncSkillToSupabase(updatedSkill);
        }

        // Trigger unified gamification for practice session
        // Include duration for perk bonuses (flow state, etc.)
        triggerGamification('practiceSession', {
          xpOverride: Math.max(10, xpEarned),
          module: 'skills',
          durationMinutes: parseInt(minutes),
        });

        // Check if skill level increased (mastery check)
        const oldLevel = getProficiencyLevel(updatedSkill.xp - xpEarned);
        const newLevel = getProficiencyLevel(updatedSkill.xp);
        if (oldLevel.id !== newLevel.id) {
          triggerGamification('skillLevelUp', { xpOverride: 25 });
          if (newLevel.id === 'expert') {
            triggerGamification('skillMastered', { xpOverride: 100 });
          }
        }

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
      partialize: (state) => ({
        skills: state.skills,
      }),
    }
  )
);

// Initialize skills store from Supabase
export const initializeSkillsStore = async () => {
  const store = useSkillsStore.getState();
  await store.initializeFromSupabase();
};

export default useSkillsStore;
