-- Nova AI Aggregation Views
-- Creates materialized views for fast context generation
-- These views pre-compute daily/weekly summaries for Nova AI

-- ============================================
-- USER DAILY SUMMARY VIEW
-- Pre-computed daily statistics for each user
-- ============================================

CREATE TABLE IF NOT EXISTS user_daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL,

  -- Task statistics
  tasks_total INT DEFAULT 0,
  tasks_completed INT DEFAULT 0,
  tasks_completion_rate DECIMAL(5,2) DEFAULT 0,

  -- Nutrition statistics
  calories_consumed INT DEFAULT 0,
  calories_goal INT DEFAULT 0,
  protein_consumed INT DEFAULT 0,
  protein_goal INT DEFAULT 0,
  meals_logged INT DEFAULT 0,

  -- Workout statistics
  workouts_completed INT DEFAULT 0,
  workout_minutes INT DEFAULT 0,
  total_volume INT DEFAULT 0,

  -- Focus/Productivity
  focus_sessions INT DEFAULT 0,
  focus_minutes INT DEFAULT 0,

  -- Financial
  money_spent DECIMAL(10,2) DEFAULT 0,
  money_earned DECIMAL(10,2) DEFAULT 0,

  -- XP earned
  xp_earned INT DEFAULT 0,

  -- Streak status at end of day
  global_streak INT DEFAULT 0,
  streaks_active INT DEFAULT 0,
  streaks_at_risk INT DEFAULT 0,

  -- Journal
  journal_entry_written BOOLEAN DEFAULT FALSE,
  mood_logged INT DEFAULT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint per user per day
  CONSTRAINT unique_user_daily_summary UNIQUE (user_id, summary_date)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_date
  ON user_daily_summaries(user_id, summary_date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_summaries_date
  ON user_daily_summaries(summary_date DESC);

-- ============================================
-- USER WEEKLY SUMMARY VIEW
-- Aggregated weekly statistics
-- ============================================

CREATE TABLE IF NOT EXISTS user_weekly_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL, -- Monday of the week

  -- Task statistics
  tasks_total INT DEFAULT 0,
  tasks_completed INT DEFAULT 0,
  avg_daily_completion_rate DECIMAL(5,2) DEFAULT 0,
  most_productive_day TEXT DEFAULT NULL,

  -- Nutrition statistics
  avg_daily_calories INT DEFAULT 0,
  avg_daily_protein INT DEFAULT 0,
  total_meals_logged INT DEFAULT 0,

  -- Workout statistics
  workouts_completed INT DEFAULT 0,
  total_workout_minutes INT DEFAULT 0,
  total_volume INT DEFAULT 0,
  workout_types JSONB DEFAULT '{}',

  -- Focus/Productivity
  total_focus_sessions INT DEFAULT 0,
  total_focus_minutes INT DEFAULT 0,
  avg_daily_focus_minutes INT DEFAULT 0,

  -- Financial
  total_spent DECIMAL(10,2) DEFAULT 0,
  total_earned DECIMAL(10,2) DEFAULT 0,
  top_spending_category TEXT DEFAULT NULL,

  -- XP and progress
  total_xp_earned INT DEFAULT 0,
  levels_gained INT DEFAULT 0,

  -- Streaks
  longest_streak_this_week INT DEFAULT 0,
  streaks_broken INT DEFAULT 0,

  -- Patterns detected
  patterns JSONB DEFAULT '{}',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_user_weekly_summary UNIQUE (user_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_weekly_summaries_user_week
  ON user_weekly_summaries(user_id, week_start DESC);

-- ============================================
-- USER PATTERNS CACHE
-- Stores detected behavioral patterns for Nova
-- ============================================

CREATE TABLE IF NOT EXISTS user_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL, -- 'productivity_peak', 'workout_preference', 'spending_spike', etc.
  pattern_data JSONB NOT NULL,
  confidence DECIMAL(3,2) DEFAULT 0.5, -- 0.00 to 1.00
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',

  CONSTRAINT unique_user_pattern UNIQUE (user_id, pattern_type)
);

CREATE INDEX IF NOT EXISTS idx_user_patterns_user
  ON user_patterns(user_id);

CREATE INDEX IF NOT EXISTS idx_user_patterns_type
  ON user_patterns(pattern_type);

-- ============================================
-- NOVA CONVERSATION CACHE
-- Stores recent Nova interactions for context
-- ============================================

CREATE TABLE IF NOT EXISTS nova_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  intent JSONB DEFAULT '{}', -- Classified intent
  context_tier TEXT DEFAULT 'warm', -- 'hot', 'warm', 'cold'
  response_time_ms INT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nova_conversations_user_time
  ON nova_conversations(user_id, created_at DESC);

-- Keep only last 100 messages per user (cleanup trigger)
CREATE OR REPLACE FUNCTION cleanup_nova_conversations()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM nova_conversations
  WHERE user_id = NEW.user_id
  AND id NOT IN (
    SELECT id FROM nova_conversations
    WHERE user_id = NEW.user_id
    ORDER BY created_at DESC
    LIMIT 100
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cleanup_nova_conversations ON nova_conversations;
CREATE TRIGGER trigger_cleanup_nova_conversations
  AFTER INSERT ON nova_conversations
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_nova_conversations();

-- ============================================
-- FUNCTION: Update daily summary
-- Called periodically or on significant data changes
-- ============================================

CREATE OR REPLACE FUNCTION update_user_daily_summary(p_user_id UUID, p_date DATE)
RETURNS VOID AS $$
DECLARE
  v_tasks_total INT;
  v_tasks_completed INT;
BEGIN
  -- Get task counts from daily_tasks table
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE completed = true)
  INTO v_tasks_total, v_tasks_completed
  FROM daily_tasks
  WHERE user_id = p_user_id
  AND task_date = p_date;

  -- Upsert the summary
  INSERT INTO user_daily_summaries (
    user_id,
    summary_date,
    tasks_total,
    tasks_completed,
    tasks_completion_rate,
    updated_at
  )
  VALUES (
    p_user_id,
    p_date,
    COALESCE(v_tasks_total, 0),
    COALESCE(v_tasks_completed, 0),
    CASE WHEN v_tasks_total > 0
      THEN ROUND((v_tasks_completed::DECIMAL / v_tasks_total) * 100, 2)
      ELSE 0
    END,
    NOW()
  )
  ON CONFLICT (user_id, summary_date)
  DO UPDATE SET
    tasks_total = EXCLUDED.tasks_total,
    tasks_completed = EXCLUDED.tasks_completed,
    tasks_completion_rate = EXCLUDED.tasks_completion_rate,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE user_daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_weekly_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE nova_conversations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own daily summaries"
  ON user_daily_summaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily summaries"
  ON user_daily_summaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily summaries"
  ON user_daily_summaries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own weekly summaries"
  ON user_weekly_summaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly summaries"
  ON user_weekly_summaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly summaries"
  ON user_weekly_summaries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own patterns"
  ON user_patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own patterns"
  ON user_patterns FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own nova conversations"
  ON nova_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nova conversations"
  ON nova_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE user_daily_summaries IS 'Pre-computed daily statistics for fast Nova AI context generation';
COMMENT ON TABLE user_weekly_summaries IS 'Aggregated weekly statistics for Nova AI trend analysis';
COMMENT ON TABLE user_patterns IS 'Detected behavioral patterns for personalized Nova responses';
COMMENT ON TABLE nova_conversations IS 'Recent Nova conversation history for context continuity';
