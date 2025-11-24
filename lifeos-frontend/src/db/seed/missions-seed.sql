-- ============================================
-- SEED DATA: Initial Missions
-- Creates starter missions for all frequencies
-- ============================================

-- Daily Missions
INSERT INTO missions (
  title,
  cosmic_narrative,
  description,
  module_id,
  frequency,
  difficulty,
  objectives,
  xp_reward,
  credits_reward,
  icon,
  tags,
  active
) VALUES
-- Journal Mission
(
  'Morning Star Log',
  'Document your journey through the cosmos...',
  'Write 1 journal entry to reflect on your day',
  'journal',
  'daily',
  'routine',
  '[{"id":"entry_1","type":"count","description":"Write a journal entry","target":1,"current":0,"metric":"journal_entries"}]'::jsonb,
  50,
  10,
  '📝',
  ARRAY['reflection', 'mindfulness'],
  true
),

-- Health Mission
(
  'Stellar Vitality',
  'Energize your cosmic vessel with movement...',
  'Complete 30 minutes of physical activity',
  'health',
  'daily',
  'routine',
  '[{"id":"exercise_1","type":"duration","description":"Exercise for 30 minutes","target":30,"current":0,"metric":"workout_minutes"}]'::jsonb,
  60,
  12,
  '💪',
  ARRAY['fitness', 'energy'],
  true
),

-- Knowledge Mission
(
  'Cosmic Knowledge Seeker',
  'Expand your understanding of the universe...',
  'Read for 20 minutes or complete 1 learning session',
  'knowledge',
  'daily',
  'routine',
  '[{"id":"read_1","type":"duration","description":"Read for 20 minutes","target":20,"current":0,"metric":"reading_minutes"}]'::jsonb,
  40,
  8,
  '📚',
  ARRAY['learning', 'growth'],
  true
),

-- Weekly Missions
(
  'Nebula of Productivity',
  'Harness the cosmic energy of focused work...',
  'Complete 10 hours of deep work this week',
  'productivity',
  'weekly',
  'moderate',
  '[{"id":"deep_work","type":"duration","description":"Deep work hours","target":600,"current":0,"metric":"deep_work_minutes"}]'::jsonb,
  300,
  75,
  '🚀',
  ARRAY['productivity', 'focus'],
  true
),

(
  'Galaxy of Gratitude',
  'Illuminate your path with daily reflections...',
  'Write journal entries for 5 days this week',
  'journal',
  'weekly',
  'moderate',
  '[{"id":"journal_week","type":"count","description":"Journal entries","target":5,"current":0,"metric":"journal_entries"}]'::jsonb,
  250,
  60,
  '✨',
  ARRAY['reflection', 'consistency'],
  true
),

(
  'Constellation of Fitness',
  'Build strength across the cosmic week...',
  'Complete 4 workout sessions this week',
  'health',
  'weekly',
  'moderate',
  '[{"id":"workouts","type":"count","description":"Workout sessions","target":4,"current":0,"metric":"workout_sessions"}]'::jsonb,
  280,
  70,
  '🔥',
  ARRAY['fitness', 'discipline'],
  true
),

-- Monthly Missions
(
  'Supernova Achievement',
  'Reach new heights in your cosmic journey...',
  'Earn 5000 total XP this month',
  'any',
  'monthly',
  'challenging',
  '[{"id":"monthly_xp","type":"count","description":"Total XP earned","target":5000,"current":0,"metric":"total_xp"}]'::jsonb,
  1000,
  250,
  '⭐',
  ARRAY['achievement', 'mastery'],
  true
),

(
  'Master of Knowledge',
  'Become a scholar of the cosmos...',
  'Complete 10 books or learning resources',
  'knowledge',
  'monthly',
  'challenging',
  '[{"id":"books_read","type":"count","description":"Books/resources completed","target":10,"current":0,"metric":"books_finished"}]'::jsonb,
  800,
  200,
  '🎓',
  ARRAY['learning', 'mastery'],
  true
),

-- Cosmic Challenge
(
  'The 30-Day Streak Ascension',
  'Prove your dedication to the cosmic path...',
  'Maintain a 30-day streak on any momentum chain',
  'any',
  'challenge',
  'cosmic',
  '[{"id":"mega_streak","type":"count","description":"Days in streak","target":30,"current":0,"metric":"streak_days"}]'::jsonb,
  2000,
  500,
  '🌟',
  ARRAY['discipline', 'legendary'],
  true
),

(
  'Cosmic Completionist',
  'Achieve perfection across all dimensions...',
  'Complete all daily missions for 7 consecutive days',
  'any',
  'challenge',
  'cosmic',
  '[{"id":"perfect_week","type":"count","description":"Perfect days","target":7,"current":0,"metric":"perfect_days"}]'::jsonb,
  1500,
  400,
  '💫',
  ARRAY['consistency', 'legendary'],
  true
);

-- Add more mission templates as needed
