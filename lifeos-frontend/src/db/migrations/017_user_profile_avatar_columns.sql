-- ============================================
-- USER PROFILE AVATAR COLUMNS MIGRATION
-- Adds avatar-related columns to user_profiles for the avatar system
-- ============================================

-- Add avatar-related columns to user_profiles table
DO $$
BEGIN
  -- Level and XP tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'current_level'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN current_level INTEGER DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'current_xp'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN current_xp INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'current_tier'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN current_tier INTEGER DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'prestige'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN prestige INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'total_levels_earned'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN total_levels_earned INTEGER DEFAULT 0;
  END IF;

  -- Character appearance
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'character_gender'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN character_gender TEXT DEFAULT 'male';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'skin_tone'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN skin_tone TEXT DEFAULT 'default';
  END IF;

  -- Equipment JSONB columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'equipped_items'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN equipped_items JSONB DEFAULT '{
      "helmet": null,
      "chest": null,
      "legs": null,
      "mainHand": null,
      "offHand": null,
      "cape": null,
      "ring1": null,
      "ring2": null,
      "amulet": null
    }';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'cosmetic_overrides'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN cosmetic_overrides JSONB DEFAULT '{
      "helmet": null,
      "chest": null,
      "legs": null,
      "mainHand": null,
      "offHand": null,
      "cape": null,
      "ring1": null,
      "ring2": null,
      "amulet": null
    }';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'dye_colors'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN dye_colors JSONB DEFAULT '{
      "helmet": null,
      "chest": null,
      "legs": null,
      "mainHand": null,
      "offHand": null,
      "cape": null,
      "ring1": null,
      "ring2": null,
      "amulet": null
    }';
  END IF;

  -- Unlocked equipment array
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'unlocked_equipment'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN unlocked_equipment TEXT[] DEFAULT '{}';
  END IF;

  -- Module progress JSONB
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'module_progress'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN module_progress JSONB DEFAULT '{
      "productivity": {"tasksCompleted": 0, "deepWorkHours": 0, "streak": 0},
      "fitness": {"workoutsCompleted": 0, "macroGoalsHit": 0, "workoutStreak": 0},
      "knowledge": {"booksCompleted": 0, "skillsMastered": 0, "learningHours": 0},
      "financial": {"daysTracked": 0, "positiveGrowth": false},
      "journal": {"entriesWritten": 0, "journalStreak": 0},
      "calendar": {"perfectWeeks": 0, "timeBlockingDays": 0},
      "skills": {"skillsPracticed": 0, "weeklyActivities": 0},
      "cross": {"allModulesActive": 0, "totalHours": 0}
    }';
  END IF;

  -- Cosmetics (titles, frames)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'owned_cosmetics'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN owned_cosmetics TEXT[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'active_cosmetics'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN active_cosmetics JSONB DEFAULT '{"title": null, "frame": null}';
  END IF;
END $$;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_current_level ON user_profiles(current_level DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_current_tier ON user_profiles(current_tier);
CREATE INDEX IF NOT EXISTS idx_user_profiles_equipped_items ON user_profiles USING GIN (equipped_items);
CREATE INDEX IF NOT EXISTS idx_user_profiles_unlocked_equipment ON user_profiles USING GIN (unlocked_equipment);

-- Comment for documentation
COMMENT ON COLUMN user_profiles.current_level IS 'User avatar level (1-100+)';
COMMENT ON COLUMN user_profiles.current_xp IS 'Current XP towards next level';
COMMENT ON COLUMN user_profiles.current_tier IS 'Evolution tier (1-4)';
COMMENT ON COLUMN user_profiles.prestige IS 'Number of prestige resets (0-2)';
COMMENT ON COLUMN user_profiles.equipped_items IS 'Currently equipped item IDs per slot';
COMMENT ON COLUMN user_profiles.cosmetic_overrides IS 'Transmog overrides per slot';
COMMENT ON COLUMN user_profiles.unlocked_equipment IS 'Array of unlocked equipment item IDs';
COMMENT ON COLUMN user_profiles.module_progress IS 'Progress tracking for each module';
