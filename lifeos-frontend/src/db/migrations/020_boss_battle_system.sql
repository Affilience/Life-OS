-- =============================================
-- BOSS BATTLE SYSTEM TABLES
-- Migration: 020_boss_battle_system.sql
-- Description: Creates tables for boss battles, stats tracking, and adds proper RLS
-- =============================================

-- =============================================
-- 1. BOSS BATTLES TABLE
-- Tracks individual battle sessions
-- =============================================

CREATE TABLE IF NOT EXISTS boss_battles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  boss_id TEXT NOT NULL,
  boss_name TEXT NOT NULL,
  boss_level_min INTEGER,
  boss_level_max INTEGER,
  boss_max_health INTEGER NOT NULL,
  boss_current_health INTEGER NOT NULL,
  boss_damage INTEGER,
  player_max_health INTEGER NOT NULL,
  player_current_health INTEGER NOT NULL,
  player_damage INTEGER,
  total_damage_dealt INTEGER DEFAULT 0,
  total_damage_taken INTEGER DEFAULT 0,
  tap_count INTEGER DEFAULT 0,
  crit_count INTEGER DEFAULT 0,
  combo_max INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 0,
  credits_reward INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'victory', 'defeat', 'abandoned')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for boss_battles
CREATE INDEX IF NOT EXISTS idx_boss_battles_user_id ON boss_battles(user_id);
CREATE INDEX IF NOT EXISTS idx_boss_battles_user_status ON boss_battles(user_id, status);
CREATE INDEX IF NOT EXISTS idx_boss_battles_user_boss ON boss_battles(user_id, boss_id);
CREATE INDEX IF NOT EXISTS idx_boss_battles_created_at ON boss_battles(created_at DESC);

-- Enable RLS
ALTER TABLE boss_battles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for boss_battles
DROP POLICY IF EXISTS "Users can view own boss battles" ON boss_battles;
CREATE POLICY "Users can view own boss battles" ON boss_battles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own boss battles" ON boss_battles;
CREATE POLICY "Users can insert own boss battles" ON boss_battles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own boss battles" ON boss_battles;
CREATE POLICY "Users can update own boss battles" ON boss_battles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own boss battles" ON boss_battles;
CREATE POLICY "Users can delete own boss battles" ON boss_battles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- 2. BOSS BATTLE STATS TABLE
-- Aggregate statistics per user
-- =============================================

CREATE TABLE IF NOT EXISTS boss_battle_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_battles INTEGER DEFAULT 0,
  victories INTEGER DEFAULT 0,
  defeats INTEGER DEFAULT 0,
  abandoned INTEGER DEFAULT 0,
  total_damage_dealt BIGINT DEFAULT 0,
  total_damage_taken BIGINT DEFAULT 0,
  total_taps BIGINT DEFAULT 0,
  total_crits INTEGER DEFAULT 0,
  boss_victories JSONB DEFAULT '{}',
  fastest_victory_seconds INTEGER,
  highest_damage_single_battle INTEGER DEFAULT 0,
  highest_combo INTEGER DEFAULT 0,
  last_battle_at TIMESTAMPTZ,
  first_victory_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE boss_battle_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for boss_battle_stats
DROP POLICY IF EXISTS "Users can view own boss stats" ON boss_battle_stats;
CREATE POLICY "Users can view own boss stats" ON boss_battle_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own boss stats" ON boss_battle_stats;
CREATE POLICY "Users can insert own boss stats" ON boss_battle_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own boss stats" ON boss_battle_stats;
CREATE POLICY "Users can update own boss stats" ON boss_battle_stats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 3. USER BOSS PROGRESS TABLE
-- Tracks which bosses have been defeated (efficient querying)
-- =============================================

CREATE TABLE IF NOT EXISTS user_boss_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  boss_id TEXT NOT NULL,
  times_defeated INTEGER DEFAULT 0,
  times_attempted INTEGER DEFAULT 0,
  best_time_seconds INTEGER,
  best_damage INTEGER,
  first_defeated_at TIMESTAMPTZ,
  last_defeated_at TIMESTAMPTZ,
  last_attempted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, boss_id)
);

-- Indexes for user_boss_progress
CREATE INDEX IF NOT EXISTS idx_user_boss_progress_user_id ON user_boss_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_boss_progress_boss_id ON user_boss_progress(boss_id);

-- Enable RLS
ALTER TABLE user_boss_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_boss_progress
DROP POLICY IF EXISTS "Users can view own boss progress" ON user_boss_progress;
CREATE POLICY "Users can view own boss progress" ON user_boss_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own boss progress" ON user_boss_progress;
CREATE POLICY "Users can insert own boss progress" ON user_boss_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own boss progress" ON user_boss_progress;
CREATE POLICY "Users can update own boss progress" ON user_boss_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 4. TRIGGER FOR UPDATED_AT
-- =============================================

-- Add updated_at trigger for boss_battle_stats
DROP TRIGGER IF EXISTS update_boss_battle_stats_updated_at ON boss_battle_stats;
CREATE TRIGGER update_boss_battle_stats_updated_at
  BEFORE UPDATE ON boss_battle_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at trigger for user_boss_progress
DROP TRIGGER IF EXISTS update_user_boss_progress_updated_at ON user_boss_progress;
CREATE TRIGGER update_user_boss_progress_updated_at
  BEFORE UPDATE ON user_boss_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 5. FUNCTION TO UPDATE BOSS PROGRESS ON VICTORY
-- =============================================

CREATE OR REPLACE FUNCTION update_boss_progress_on_victory()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only trigger on status change to 'victory'
  IF NEW.status = 'victory' AND (OLD.status IS NULL OR OLD.status != 'victory') THEN
    INSERT INTO public.user_boss_progress (
      user_id,
      boss_id,
      times_defeated,
      times_attempted,
      best_time_seconds,
      best_damage,
      first_defeated_at,
      last_defeated_at,
      last_attempted_at
    ) VALUES (
      NEW.user_id,
      NEW.boss_id,
      1,
      1,
      EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INTEGER,
      NEW.total_damage_dealt,
      NEW.ended_at,
      NEW.ended_at,
      NEW.ended_at
    )
    ON CONFLICT (user_id, boss_id)
    DO UPDATE SET
      times_defeated = public.user_boss_progress.times_defeated + 1,
      times_attempted = public.user_boss_progress.times_attempted + 1,
      best_time_seconds = LEAST(
        public.user_boss_progress.best_time_seconds,
        EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INTEGER
      ),
      best_damage = GREATEST(public.user_boss_progress.best_damage, NEW.total_damage_dealt),
      last_defeated_at = NEW.ended_at,
      last_attempted_at = NEW.ended_at,
      updated_at = NOW();

  -- Track attempt even on defeat
  ELSIF NEW.status = 'defeat' AND (OLD.status IS NULL OR OLD.status != 'defeat') THEN
    INSERT INTO public.user_boss_progress (
      user_id,
      boss_id,
      times_defeated,
      times_attempted,
      last_attempted_at
    ) VALUES (
      NEW.user_id,
      NEW.boss_id,
      0,
      1,
      NEW.ended_at
    )
    ON CONFLICT (user_id, boss_id)
    DO UPDATE SET
      times_attempted = public.user_boss_progress.times_attempted + 1,
      last_attempted_at = NEW.ended_at,
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for boss progress updates
DROP TRIGGER IF EXISTS trigger_update_boss_progress ON boss_battles;
CREATE TRIGGER trigger_update_boss_progress
  AFTER UPDATE ON boss_battles
  FOR EACH ROW
  EXECUTE FUNCTION update_boss_progress_on_victory();

-- =============================================
-- 6. FUNCTION TO UPDATE AGGREGATE STATS
-- =============================================

CREATE OR REPLACE FUNCTION update_boss_aggregate_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  is_victory BOOLEAN;
  is_defeat BOOLEAN;
  battle_duration INTEGER;
BEGIN
  -- Only process when battle ends (status changes from 'active')
  IF OLD.status = 'active' AND NEW.status IN ('victory', 'defeat', 'abandoned') THEN
    is_victory := NEW.status = 'victory';
    is_defeat := NEW.status = 'defeat';
    battle_duration := EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INTEGER;

    INSERT INTO public.boss_battle_stats (
      user_id,
      total_battles,
      victories,
      defeats,
      abandoned,
      total_damage_dealt,
      total_damage_taken,
      total_taps,
      total_crits,
      boss_victories,
      fastest_victory_seconds,
      highest_damage_single_battle,
      last_battle_at,
      first_victory_at
    ) VALUES (
      NEW.user_id,
      1,
      CASE WHEN is_victory THEN 1 ELSE 0 END,
      CASE WHEN is_defeat THEN 1 ELSE 0 END,
      CASE WHEN NEW.status = 'abandoned' THEN 1 ELSE 0 END,
      NEW.total_damage_dealt,
      NEW.total_damage_taken,
      NEW.tap_count,
      COALESCE(NEW.crit_count, 0),
      CASE WHEN is_victory THEN jsonb_build_object(NEW.boss_id, 1) ELSE '{}'::jsonb END,
      CASE WHEN is_victory THEN battle_duration ELSE NULL END,
      NEW.total_damage_dealt,
      NEW.ended_at,
      CASE WHEN is_victory THEN NEW.ended_at ELSE NULL END
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      total_battles = public.boss_battle_stats.total_battles + 1,
      victories = public.boss_battle_stats.victories + CASE WHEN is_victory THEN 1 ELSE 0 END,
      defeats = public.boss_battle_stats.defeats + CASE WHEN is_defeat THEN 1 ELSE 0 END,
      abandoned = public.boss_battle_stats.abandoned + CASE WHEN NEW.status = 'abandoned' THEN 1 ELSE 0 END,
      total_damage_dealt = public.boss_battle_stats.total_damage_dealt + NEW.total_damage_dealt,
      total_damage_taken = public.boss_battle_stats.total_damage_taken + NEW.total_damage_taken,
      total_taps = public.boss_battle_stats.total_taps + NEW.tap_count,
      total_crits = public.boss_battle_stats.total_crits + COALESCE(NEW.crit_count, 0),
      boss_victories = CASE
        WHEN is_victory THEN
          public.boss_battle_stats.boss_victories ||
          jsonb_build_object(
            NEW.boss_id,
            COALESCE((public.boss_battle_stats.boss_victories->>NEW.boss_id)::INTEGER, 0) + 1
          )
        ELSE public.boss_battle_stats.boss_victories
      END,
      fastest_victory_seconds = CASE
        WHEN is_victory THEN
          LEAST(
            COALESCE(public.boss_battle_stats.fastest_victory_seconds, battle_duration),
            battle_duration
          )
        ELSE public.boss_battle_stats.fastest_victory_seconds
      END,
      highest_damage_single_battle = GREATEST(
        public.boss_battle_stats.highest_damage_single_battle,
        NEW.total_damage_dealt
      ),
      last_battle_at = NEW.ended_at,
      first_victory_at = CASE
        WHEN is_victory AND public.boss_battle_stats.first_victory_at IS NULL
        THEN NEW.ended_at
        ELSE public.boss_battle_stats.first_victory_at
      END,
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for aggregate stats updates
DROP TRIGGER IF EXISTS trigger_update_boss_aggregate_stats ON boss_battles;
CREATE TRIGGER trigger_update_boss_aggregate_stats
  AFTER UPDATE ON boss_battles
  FOR EACH ROW
  EXECUTE FUNCTION update_boss_aggregate_stats();

-- =============================================
-- 7. GRANT PERMISSIONS
-- =============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON boss_battles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON boss_battle_stats TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_boss_progress TO authenticated;

-- =============================================
-- 8. COMMENTS
-- =============================================

COMMENT ON TABLE boss_battles IS 'Individual boss battle sessions';
COMMENT ON TABLE boss_battle_stats IS 'Aggregate boss battle statistics per user';
COMMENT ON TABLE user_boss_progress IS 'Per-boss progress tracking for efficient queries';
COMMENT ON FUNCTION update_boss_progress_on_victory IS 'Updates user_boss_progress when a battle ends';
COMMENT ON FUNCTION update_boss_aggregate_stats IS 'Updates boss_battle_stats aggregate when a battle ends';
